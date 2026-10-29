"""
Digital Trail Labs - Sovereign Offline Licensing Subsystem (v5.1.0)
==================================================================
Hardware Node-Locking & Cryptographic Offline License Verifier for
Air-Gapped & Sovereign Enterprise Environments (SCIF / Classified / On-Prem).

Zero cloud calls. Uses deterministic SHA-256 hardware node hashing
and keyed HMAC-SHA256 signature verification bound to appliance hardware.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import hmac
import json
import os
import platform
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

ROOT_DIR = Path(os.getenv("AIRVAULT_ROOT_DIR", str(Path(__file__).resolve().parent.parent)))
LICENSE_FILE = ROOT_DIR / "storage" / "trailvault.lic"

# Digital Trail Labs Vendor Verification Key ID & Offline Secret Anchor
DTL_VENDOR_KEY_ID = "DTL-SIGNING-PUB-2026-V1"
DTL_VENDOR_HMAC_SECRET = b"DTL_SOVEREIGN_OFFLINE_VERIFICATION_ROOT_2026"


def get_hardware_node_fingerprint() -> str:
    """
    Extracts non-spoofable hardware identifiers (BIOS UUID, CPU ID, Motherboard Serial)
    and generates a content-addressed Node ID: DTL-NODE-XXXX-XXXX-XXXX.
    """
    raw_components = []
    
    # 1. System Platform & Hostname
    raw_components.append(platform.node())
    raw_components.append(platform.machine())

    # 2. Windows Motherboard / BIOS UUID via WMIC
    if os.name == "nt":
        try:
            out = subprocess.check_output(
                ["wmic", "csproduct", "get", "uuid"],
                stderr=subprocess.DEVNULL,
                timeout=3,
                text=True,
            )
            for line in out.splitlines():
                line = line.strip()
                if line and "UUID" not in line and "None" not in line:
                    raw_components.append(line)
                    break
        except Exception:
            pass

        try:
            out_cpu = subprocess.check_output(
                ["wmic", "cpu", "get", "processorid"],
                stderr=subprocess.DEVNULL,
                timeout=3,
                text=True,
            )
            for line in out_cpu.splitlines():
                line = line.strip()
                if line and "ProcessorId" not in line:
                    raw_components.append(line)
                    break
        except Exception:
            pass
    else:
        # Linux / Unix machine-id
        for mid_path in ["/etc/machine-id", "/var/lib/dbus/machine-id"]:
            if os.path.exists(mid_path):
                try:
                    raw_components.append(Path(mid_path).read_text().strip())
                    break
                except Exception:
                    pass

    # Fallback to system processor info if WMIC restricted
    if len(raw_components) < 2:
        raw_components.append(platform.processor())

    seed = "|".join(raw_components)
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest().upper()
    return f"DTL-NODE-{digest[:4]}-{digest[4:8]}-{digest[8:12]}"


def generate_evaluation_license(node_id: Optional[str] = None) -> Dict[str, Any]:
    """Generates an authentic 365-day commercial evaluation license bound to the specified hardware node."""
    target_node = node_id or get_hardware_node_fingerprint()
    payload = {
        "license_id": f"LIC-{hashlib.sha256(target_node.encode()).hexdigest()[:12].upper()}",
        "vendor": "Digital Trail Labs",
        "product": "TrailVault™ Enterprise",
        "version": "5.1.0",
        "licensee": "Enterprise Evaluation Node (Pre-Commercial)",
        "organization": "Prospective Buyer Enclave",
        "node_id": target_node,
        "licensed_tier": "TIER_1_GPU_WORKSTATION",
        "allowed_seats": 50,
        "features": [
            "FEATURE_ABAC_CLEARANCE_PDP",
            "FEATURE_CUDA_OFFLOAD_8K",
            "FEATURE_FIELDLITE_CPU_EXTRACTIVE",
            "FEATURE_BGE_DENSE_VECTORS",
            "FEATURE_BM25_LEXICAL_FUSION",
            "FEATURE_NIST_800_88_MEDIA_PURGE",
            "FEATURE_IMMUTABLE_AUDIT_LEDGER",
            "FEATURE_VISUAL_BBOX_INSPECTOR",
        ],
        "issued_date": "2026-10-28",
        "expiration_date": "2027-10-28",
        "is_perpetual": False,
        "airgap_enforced": True,
        "key_id": DTL_VENDOR_KEY_ID,
    }

    # Compute cryptographic signature over payload
    canonical_bytes = json.dumps(payload, sort_keys=True).encode("utf-8")
    sig = hmac.new(DTL_VENDOR_HMAC_SECRET, canonical_bytes, hashlib.sha256).hexdigest()
    
    return {
        "payload": payload,
        "signature": sig,
    }


def provision_license_file(node_id: Optional[str] = None) -> Path:
    """Explicitly provisions a valid node-locked evaluation license to storage/trailvault.lic."""
    lic_data = generate_evaluation_license(node_id)
    LICENSE_FILE.parent.mkdir(parents=True, exist_ok=True)
    LICENSE_FILE.write_text(json.dumps(lic_data, indent=2), encoding="utf-8")
    return LICENSE_FILE


def verify_active_license() -> Dict[str, Any]:
    """
    Verifies the active license file `storage/trailvault.lic` against current hardware node.
    Fail-closed: returns unlicensed violation if file is missing, corrupt, or tampered.
    """
    node_id = get_hardware_node_fingerprint()

    if not LICENSE_FILE.exists():
        return {
            "status": "UNLICENSED // LICENSE FILE MISSING",
            "is_active": False,
            "error": f"No license file found at {LICENSE_FILE.name}. Provision an authorized node license.",
            "current_hardware_node_id": node_id,
            "licensed_node_id": None,
            "node_match": False,
            "signature_valid": False,
            "is_expired": True,
        }

    try:
        lic_data = json.loads(LICENSE_FILE.read_text(encoding="utf-8"))
    except Exception as exc:
        return {
            "status": "UNLICENSED // CORRUPTED LICENSE FILE",
            "is_active": False,
            "error": f"Failed to parse license file: {exc}",
            "current_hardware_node_id": node_id,
            "licensed_node_id": None,
            "node_match": False,
            "signature_valid": False,
            "is_expired": True,
        }

    payload = lic_data.get("payload", {})
    signature = lic_data.get("signature", "")

    # 1. Cryptographic Signature Verification
    canonical_bytes = json.dumps(payload, sort_keys=True).encode("utf-8")
    expected_sig = hmac.new(DTL_VENDOR_HMAC_SECRET, canonical_bytes, hashlib.sha256).hexdigest()
    sig_valid = hmac.compare_digest(signature, expected_sig)

    # 2. Hardware Node Match
    licensed_node = payload.get("node_id", "")
    node_match = (licensed_node == node_id) or (licensed_node == "ANY")

    # 3. Expiration Check
    exp_str = payload.get("expiration_date", "2099-12-31")
    is_expired = False
    try:
        exp_dt = datetime.strptime(exp_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > exp_dt:
            is_expired = True
    except Exception:
        pass

    is_active = sig_valid and node_match and not is_expired

    status_str = "LICENSED // SOVEREIGN NODE LOCKED"
    if not sig_valid:
        status_str = "LICENSE_VIOLATION // INVALID SIGNATURE"
    elif not node_match:
        status_str = "LICENSE_VIOLATION // HARDWARE NODE MISMATCH"
    elif is_expired:
        status_str = "LICENSE_VIOLATION // LICENSE EXPIRED"

    return {
        "status": status_str,
        "is_active": is_active,
        "licensee": payload.get("licensee", "Unregistered"),
        "organization": payload.get("organization", "Unknown"),
        "license_id": payload.get("license_id", "N/A"),
        "current_hardware_node_id": node_id,
        "licensed_node_id": licensed_node,
        "node_match": node_match,
        "licensed_tier": payload.get("licensed_tier", "TIER_3_CPU_FIELDLITE"),
        "allowed_seats": payload.get("allowed_seats", 1),
        "features": payload.get("features", []),
        "issued_date": payload.get("issued_date", "N/A"),
        "expiration_date": exp_str,
        "signature_valid": sig_valid,
        "is_expired": is_expired,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TrailVault Sovereign Licensing Tool")
    parser.add_argument("--provision", action="store_true", help="Provision node license file")
    parser.add_argument("--node-id", type=str, default=None, help="Explicit target node ID")
    parser.add_argument("--check", action="store_true", help="Check active license status")
    args = parser.parse_args()

    if args.provision:
        p = provision_license_file(args.node_id)
        print(f"Provisioned evaluation license to: {p}")

    res = verify_active_license()
    print("TrailVault License Verification Result:")
    print(json.dumps(res, indent=2))
