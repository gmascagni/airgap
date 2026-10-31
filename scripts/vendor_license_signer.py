#!/usr/bin/env python3
"""
Digital Trail Labs - Sovereign License Signer (Vendor Offline Tool)
Generates cryptographically signed offline node licenses using Ed25519 asymmetric signatures.

NOTE: This tool and its private signing key are retained by Digital Trail Labs
and are NOT distributed with client runtime artifacts.
"""

import argparse
import binascii
import json
import os
import platform
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from cryptography.hazmat.primitives.asymmetric import ed25519

ROOT_DIR = Path(__file__).resolve().parent.parent

# Vendor Ed25519 Keypair (Master Offline Vendor Identity)
# Retained exclusively in offline HSM / secure token custody by Digital Trail Labs.
# The private signing key is NEVER committed or distributed in source code or repositories (R-02).
DTL_VENDOR_ED25519_PUBKEY_HEX = "f9011d3e4a3388613ef1e9188477ea03f279eb7511d2a6ada923280c6f659f28"
DTL_VENDOR_KEY_ID = "DTL-SIGNING-ED25519-V2"


def get_target_node_id() -> str:
    """Extracts hardware node fingerprint of current workstation."""
    raw_components = [platform.node(), platform.machine()]
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
    if len(raw_components) < 2:
        raw_components.append(platform.processor())
    seed = "|".join(raw_components)
    import hashlib
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest().upper()
    return f"DTL-NODE-{digest[:4]}-{digest[4:8]}-{digest[8:12]}"


def sign_license(
    node_id: str,
    licensee: str = "Enterprise Evaluation Node",
    organization: str = "Defense Enclave",
    tier: str = "TIER_1_GPU_WORKSTATION",
    days_valid: int = 365,
    is_perpetual: bool = False,
    seats: int = 50,
    private_key_hex: Optional[str] = None,
) -> Dict[str, Any]:
    """Generates and signs a license payload using offline Ed25519 private key."""
    import hashlib
    priv_hex = private_key_hex or os.getenv("DTL_VENDOR_OFFLINE_PRIVKEY_HEX")
    if not priv_hex:
        raise RuntimeError(
            "Vendor offline private signing key not provided. "
            "Set DTL_VENDOR_OFFLINE_PRIVKEY_HEX or pass --key-file. "
            "Private signing keys are retained in offline HSM custody and never stored in source (R-02)."
        )
    priv_bytes = binascii.unhexlify(priv_hex.strip())
    priv_key = ed25519.Ed25519PrivateKey.from_private_bytes(priv_bytes)

    now = datetime.now(timezone.utc)
    issue_date = now.strftime("%Y-%m-%d")
    import datetime as dt
    exp_date = (now + dt.timedelta(days=days_valid)).strftime("%Y-%m-%d")

    payload = {
        "license_id": f"LIC-{hashlib.sha256(node_id.encode()).hexdigest()[:12].upper()}",
        "vendor": "Digital Trail Labs",
        "product": "TrailVault™ Enterprise",
        "version": "5.1.0",
        "licensee": licensee,
        "organization": organization,
        "node_id": node_id,
        "licensed_tier": tier,
        "allowed_seats": seats,
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
        "issued_date": issue_date,
        "expiration_date": exp_date,
        "is_perpetual": is_perpetual,
        "airgap_enforced": True,
        "signature_algorithm": "Ed25519",
        "key_id": DTL_VENDOR_KEY_ID,
    }

    canonical_bytes = json.dumps(payload, sort_keys=True).encode("utf-8")
    sig_bytes = priv_key.sign(canonical_bytes)
    sig_hex = binascii.hexlify(sig_bytes).decode("utf-8")

    return {
        "payload": payload,
        "signature": sig_hex,
        "signature_algorithm": "Ed25519",
        "public_key": DTL_VENDOR_ED25519_PUBKEY_HEX,
    }


def main():
    parser = argparse.ArgumentParser(description="Vendor Ed25519 Offline License Signer")
    parser.add_argument("--node-id", type=str, default=None, help="Target Node ID (defaults to current hardware)")
    parser.add_argument("--key-file", type=str, default=None, help="Path to offline private key file")
    parser.add_argument("--out", type=str, default=None, help="Output path for .lic file")
    parser.add_argument("--org", type=str, default="Defense Customer Enclave", help="Organization name")
    parser.add_argument("--days", type=int, default=365, help="Validity in days")
    args = parser.parse_args()

    priv_hex = None
    if args.key_file and Path(args.key_file).exists():
        priv_hex = Path(args.key_file).read_text(encoding="utf-8").strip()

    target_node = args.node_id or get_target_node_id()
    print(f"Signing Ed25519 License for Node: {target_node}")

    lic = sign_license(target_node, organization=args.org, days_valid=args.days, private_key_hex=priv_hex)
    out_path = Path(args.out) if args.out else (ROOT_DIR / "storage" / "trailvault.lic")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(lic, indent=2), encoding="utf-8")

    print(f"Successfully generated signed license file: {out_path}")
    print(f"License ID: {lic['payload']['license_id']}")
    print(f"Ed25519 Signature: {lic['signature'][:32]}...")


if __name__ == "__main__":
    main()
