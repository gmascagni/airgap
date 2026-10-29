"""
Software Bill of Materials (SBOM) Generator (CycloneDX v1.5 JSON Standard)
NIST SP 800-161 Supply Chain Risk Management & N-12 Compliance
"""

import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

ROOT_DIR = Path(__file__).resolve().parent.parent


def generate_sbom() -> Dict[str, Any]:
    timestamp_utc = datetime.now(timezone.utc).isoformat()
    
    components: List[Dict[str, Any]] = [
        # Core Appliance Binaries
        {
            "type": "application",
            "name": "TrailVault.exe",
            "version": "5.1.0",
            "purl": "pkg:generic/digitaltraillabs/trailvault@5.1.0",
            "description": "Native Windows Tray Daemon & Air-Gap Enclave Launcher (.NET 4.8 / C#)",
            "licenses": [{"license": {"id": "Proprietary"}}],
        },
        # Python Runtime Dependencies
        {
            "type": "library",
            "name": "fastapi",
            "version": "0.162.0",
            "purl": "pkg:pypi/fastapi@0.162.0",
            "licenses": [{"license": {"id": "MIT"}}],
        },
        {
            "type": "library",
            "name": "uvicorn",
            "version": "0.54.0",
            "purl": "pkg:pypi/uvicorn@0.54.0",
            "licenses": [{"license": {"id": "BSD-3-Clause"}}],
        },
        {
            "type": "library",
            "name": "qdrant-client",
            "version": "1.20.0",
            "purl": "pkg:pypi/qdrant-client@1.20.0",
            "licenses": [{"license": {"id": "Apache-2.0"}}],
        },
        {
            "type": "library",
            "name": "fastembed",
            "version": "0.9.1",
            "purl": "pkg:pypi/fastembed@0.9.1",
            "licenses": [{"license": {"id": "Apache-2.0"}}],
        },
        {
            "type": "library",
            "name": "PyMuPDF",
            "version": "2.0",
            "purl": "pkg:pypi/pymupdf@2.0",
            "licenses": [{"license": {"id": "AGPL-3.0"}}],
        },
        {
            "type": "library",
            "name": "rank-bm25",
            "version": "0.2.2",
            "purl": "pkg:pypi/rank-bm25@0.2.2",
            "licenses": [{"license": {"id": "Apache-2.0"}}],
        },
        {
            "type": "library",
            "name": "sentence-transformers",
            "version": "6.2.0",
            "purl": "pkg:pypi/sentence-transformers@6.2.0",
            "licenses": [{"license": {"id": "Apache-2.0"}}],
        },
        {
            "type": "library",
            "name": "pydantic",
            "version": "2.14.1",
            "purl": "pkg:pypi/pydantic@2.14.1",
            "licenses": [{"license": {"id": "MIT"}}],
        },
        {
            "type": "library",
            "name": "psutil",
            "version": "7.2.2",
            "purl": "pkg:pypi/psutil@7.2.2",
            "licenses": [{"license": {"id": "BSD-3-Clause"}}],
        },
        {
            "type": "library",
            "name": "numpy",
            "version": "2.5.3",
            "purl": "pkg:pypi/numpy@2.5.3",
            "licenses": [{"license": {"id": "BSD-3-Clause"}}],
        },
        {
            "type": "library",
            "name": "Pillow",
            "version": "12.3.0",
            "purl": "pkg:pypi/pillow@12.3.0",
            "licenses": [{"license": {"id": "HPND"}}],
        },
        {
            "type": "library",
            "name": "python-docx",
            "version": "1.2.0",
            "purl": "pkg:pypi/python-docx@1.2.0",
            "licenses": [{"license": {"id": "MIT"}}],
        },
        {
            "type": "library",
            "name": "openpyxl",
            "version": "3.1.5",
            "purl": "pkg:pypi/openpyxl@3.1.5",
            "licenses": [{"license": {"id": "MIT"}}],
        },
        {
            "type": "library",
            "name": "python-pptx",
            "version": "1.0.2",
            "purl": "pkg:pypi/python-pptx@1.0.2",
            "licenses": [{"license": {"id": "MIT"}}],
        },
        {
            "type": "library",
            "name": "httpx",
            "version": "0.28.1",
            "purl": "pkg:pypi/httpx@0.28.1",
            "licenses": [{"license": {"id": "BSD-3-Clause"}}],
        },
        # Neural Model Weights
        {
            "type": "file",
            "name": "bge-small-en-v1.5 (ONNX Quantized)",
            "version": "1.5",
            "description": "Local 384-d Dense Neural Embedding Model Weights",
            "hashes": [
                {
                    "alg": "SHA-256",
                    "content": "bfa86749320e815610815eead13f283d5a49856f6426f0aa679c3a37ea159f8a",
                }
            ],
        },
    ]

    # Hash local TrailVault.exe if present
    exe_path = ROOT_DIR / "TrailVault.exe"
    if exe_path.exists():
        exe_hash = hashlib.sha256(exe_path.read_bytes()).hexdigest()
        components[0]["hashes"] = [{"alg": "SHA-256", "content": exe_hash}]

    sbom = {
        "bomFormat": "CycloneDX",
        "specVersion": "1.5",
        "serialNumber": "urn:uuid:7b494d12-1f4a-4632-9cb1-893ecb2a2026",
        "version": 1,
        "metadata": {
            "timestamp": timestamp_utc,
            "tools": [{"vendor": "Digital Trail Labs", "name": "TrailVault SBOM Generator", "version": "5.1.0"}],
            "component": {
                "type": "application",
                "name": "TrailVault Enterprise",
                "version": "5.1.0",
                "description": "Air-Gapped Sovereign Technical Document Intelligence Appliance",
                "scope": "required",
            },
        },
        "components": components,
    }

    out_file = ROOT_DIR / "SBOM.json"
    out_file.write_text(json.dumps(sbom, indent=2), encoding="utf-8")
    print(f"Generated CycloneDX SBOM at: {out_file} ({len(components)} components)")
    return sbom


if __name__ == "__main__":
    generate_sbom()
