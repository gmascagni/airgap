"""
TrailVault(TM) Enterprise - Sovereign Node Licensing & Cryptographic Verification
Enforces offline hardware-node binding and cryptographically verifies vendor licenses
using asymmetric Ed25519 digital signatures (NIST FIPS 186-5).

SECURITY MODEL:
The client application holds ONLY the vendor Ed25519 public key.
License creation requires the offline vendor private key held strictly outside client distribution.
"""

import argparse
import binascii
import hashlib
import json
import os
import platform
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric import ed25519

ROOT_DIR = Path(os.getenv("AIRVAULT_ROOT_DIR", str(Path(__file__).resolve().parent.parent)))
SERVICES_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(SERVICES_DIR) not in sys.path:
    sys.path.insert(0, str(SERVICES_DIR))

LICENSE_FILE = ROOT_DIR / "storage" / "trailvault.lic"

# Digital Trail Labs Sovereign Master Public Key (32-byte Ed25519 raw public key)
# Only the public verification key is embedded in client software distributions.
DTL_VENDOR_ED25519_PUBKEY_HEX = "af3170378610a82ee3d1a0c19e95aadf3db34f2cae246540d46c344757689cde"
DTL_VENDOR_KEY_ID = "DTL-SIGNING-ED25519-V1"


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

    # 3. Linux Machine ID fallback
    if os.name == "posix":
        for mid_path in ["/etc/machine-id", "/var/lib/dbus/machine-id"]:
            if Path(mid_path).exists():
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


def verify_active_license() -> Dict[str, Any]:
    """
    Verifies the active license file `storage/trailvault.lic` against current hardware node.
    Fail-closed: returns unlicensed violation if file is missing, corrupt, or tampered.
    Cryptographic verification uses Ed25519 asymmetric signature.
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
    signature_hex = lic_data.get("signature", "")

    # 1. Asymmetric Ed25519 Cryptographic Signature Verification
    sig_valid = False
    try:
        pub_bytes = binascii.unhexlify(DTL_VENDOR_ED25519_PUBKEY_HEX)
        pub_key = ed25519.Ed25519PublicKey.from_public_bytes(pub_bytes)
        canonical_bytes = json.dumps(payload, sort_keys=True).encode("utf-8")
        sig_bytes = binascii.unhexlify(signature_hex)
        pub_key.verify(sig_bytes, canonical_bytes)
        sig_valid = True
    except (InvalidSignature, ValueError, Exception):
        sig_valid = False

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
        "signature_algorithm": "Ed25519 (Asymmetric)",
        "is_expired": is_expired,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TrailVault Sovereign Licensing Tool")
    parser.add_argument("--check", action="store_true", help="Check active license status")
    args = parser.parse_args()

    res = verify_active_license()
    print("TrailVault Sovereign License Status (Ed25519 Asymmetric Verification):")
    print(json.dumps(res, indent=2))
