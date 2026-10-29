"""
Zero-Egress & Loopback Socket Isolation Verification Utility
TrailVault(TM) Enterprise v5.1.0 (IronTrail)

AUDIT CRITERIA:
1. Enforces strict loopback binding (127.0.0.1, ::1).
2. REJECTS wildcard listeners (0.0.0.0, ::) as security violations because
   wildcard bindings expose ports on all active physical/virtual network adapters.
3. FAILS CLOSED: If no appliance processes are detected, reports AUDIT FAILED.
4. Generates a verifiable SHA-256 integrity digest for the attestation log.
"""

import hashlib
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

import psutil

ROOT_DIR = Path(__file__).resolve().parent.parent


def audit_process_sockets() -> Dict[str, Any]:
    print("=" * 76)
    print("  TRAILVAULT(TM) // ZERO-EGRESS & STRICT LOOPBACK SOCKET AUDIT")
    print("=" * 76)

    target_names = {"python.exe", "trailvault.exe", "ollama.exe", "node.exe"}
    
    # Strict loopback addresses ONLY. 0.0.0.0 and :: are explicitly rejected as wildcard binds.
    STRICT_LOOPBACK_IPS = {"127.0.0.1", "::1"}
    
    audited_processes: List[Dict[str, Any]] = []
    violations: List[Dict[str, Any]] = []
    loopback_connections: List[Dict[str, Any]] = []

    for proc in psutil.process_iter(["pid", "name", "cmdline"]):
        try:
            pname = (proc.info["name"] or "").lower()
            cmdline = " ".join(proc.info.get("cmdline") or []).lower()
            
            # Check if this process belongs to the TrailVault appliance stack
            is_trailvault = False
            if pname in target_names and any(k in cmdline for k in ["airgap", "trailvault", "live_appliance", "ollama"]):
                is_trailvault = True
            elif "trailvault" in pname:
                is_trailvault = True

            if not is_trailvault:
                continue

            conns = proc.net_connections(kind="inet")
            proc_record = {
                "pid": proc.info["pid"],
                "name": proc.info["name"],
                "connections_count": len(conns),
            }
            audited_processes.append(proc_record)

            for c in conns:
                laddr_ip = c.laddr.ip if c.laddr else ""
                laddr_port = c.laddr.port if c.laddr else 0
                raddr_ip = c.raddr.ip if c.raddr else ""
                raddr_port = c.raddr.port if c.raddr else 0
                status = c.status

                record = {
                    "pid": proc.info["pid"],
                    "process": proc.info["name"],
                    "fd": c.fd,
                    "type": str(c.type),
                    "local_address": f"{laddr_ip}:{laddr_port}" if laddr_ip else "",
                    "remote_address": f"{raddr_ip}:{raddr_port}" if raddr_ip else "",
                    "status": status,
                }

                # Evaluate Egress Policy:
                # 1. Local address MUST be strictly 127.0.0.1 or ::1. (0.0.0.0 or :: is a VIOLATION)
                # 2. Remote address (if connected) MUST be 127.0.0.1 or ::1.
                is_local_strict_loopback = laddr_ip in STRICT_LOOPBACK_IPS
                is_remote_strict_loopback = (not raddr_ip) or (raddr_ip in STRICT_LOOPBACK_IPS)

                if is_local_strict_loopback and is_remote_strict_loopback:
                    loopback_connections.append(record)
                else:
                    if laddr_ip in {"0.0.0.0", "::"}:
                        record["violation_type"] = "WILDCARD_INTERFACE_EXPOSURE (0.0.0.0 or :: binds to all interfaces)"
                    elif not is_remote_strict_loopback:
                        record["violation_type"] = f"EXTERNAL_REMOTE_CONNECTION ({raddr_ip})"
                    else:
                        record["violation_type"] = f"NON_LOOPBACK_LOCAL_BIND ({laddr_ip})"
                    violations.append(record)

        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    # Fail-Closed Audit Logic:
    # If no processes found, we cannot substantiate compliance.
    if len(audited_processes) == 0:
        is_compliant = False
        compliance_status = "AUDIT_FAILED_NO_PROCESSES_DISCOVERED"
        print("\n[AUDIT FAILED] Zero active appliance processes detected. Stack must be running to audit.")
    elif len(violations) > 0:
        is_compliant = False
        compliance_status = "NON_COMPLIANT_SOCKET_VIOLATIONS_DETECTED"
        print(f"\n[SECURITY ALERT] {len(violations)} socket policy violations detected:")
        for v in violations:
            print(f"  PID {v['pid']} ({v['process']}) -> Local: {v['local_address']} | Remote: {v['remote_address']} | Reason: {v.get('violation_type')}")
    else:
        is_compliant = True
        compliance_status = "COMPLIANT_STRICT_LOOPBACK_VERIFIED"
        print(f"\n[PASSED] 100% of sockets across {len(audited_processes)} appliance processes are strictly confined to 127.0.0.1 / ::1.")

    print(f"Audited Appliance Processes: {len(audited_processes)}")
    print(f"Verified Loopback Sockets:   {len(loopback_connections)}")
    print(f"External/Wildcard Violations:{len(violations)}")

    # Generate Audit Record with Integrity Checksum
    timestamp_utc = datetime.now(timezone.utc).isoformat()
    attestation = {
        "attestation_type": "ZERO_EGRESS_LOOPBACK_AUDIT_RECORD",
        "compliance_status": compliance_status,
        "is_compliant": is_compliant,
        "timestamp_utc": timestamp_utc,
        "strict_loopback_policy": "Strict 127.0.0.1 / ::1 only. Wildcard 0.0.0.0 and :: rejected.",
        "audited_processes_count": len(audited_processes),
        "verified_loopback_sockets_count": len(loopback_connections),
        "violations_count": len(violations),
        "processes": audited_processes,
        "verified_sockets": loopback_connections,
        "violations": violations,
        "integrity_checksum_algorithm": "SHA-256",
    }

    raw_json = json.dumps(attestation, indent=2, sort_keys=True)
    digest = hashlib.sha256(raw_json.encode("utf-8")).hexdigest()
    attestation["sha256_integrity_digest"] = digest

    out_file = ROOT_DIR / "storage" / "Zero_Egress_Socket_Attestation.json"
    out_file.parent.mkdir(parents=True, exist_ok=True)
    out_file.write_text(json.dumps(attestation, indent=2), encoding="utf-8")
    print(f"Attestation File Saved:      {out_file}")
    print(f"SHA-256 Integrity Digest:    {digest}")

    return attestation


if __name__ == "__main__":
    res = audit_process_sockets()
    sys.exit(0 if res["is_compliant"] else 1)
