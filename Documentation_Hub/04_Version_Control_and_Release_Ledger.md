# Digital Trail Labs — Version Control & Release Governance Ledger

**Document ID:** `DTL-VER-2026-004`  
**Current Production Release:** `v5.1.0 (Codename: IronTrail)`  
**Manifest Source of Truth:** `VERSION.json` & `GET /api/v1/version`

---

## 1. Version Control Architecture
**TrailVault™ Enterprise** maintains a dual-layer version control and cryptographic release ledger designed for enterprise Change Control Boards (CCB) and government Information System Security Managers (ISSMs):

1. **Git Repository & Branch Lineage (`main` + `VERSION.json`)**:
   - Every build embeds the active semantic version (`5.1.0`), release codename (`IronTrail`), Git commit SHA (`git rev-parse --short HEAD`), and API schema version (`2026.10.v5`).
2. **Live Cryptographic Runtime Attestation (`GET /api/v1/version`)**:
   - At runtime, the appliance computes a live **SHA-256 digest** of both `VERSION.json` and the core engine binary (`services/live_appliance_server.py`) so administrators can verify that the deployed field appliance or USB4 shuttle matches the approved golden build.

---

## 2. Production Release History

### `v5.1.0` — Codename: `IronTrail` (`2026-10-27`)
- **Brand & Corporate Unification**: Official release under **Digital Trail Labs** (*TrailVault™ Enterprise* & *TrailVault™ FieldLite*).
- **Adaptive 3-Tier Compute Engine (Lesser-Hardware Support)**: Added automatic and manual switching between **Tier 1 (High-VRAM GPU 16GB+)**, **Tier 2 (4–8GB Edge GPU)**, and **Tier 3 (TrailVault™ FieldLite CPU-Only Mode for 8GB–16GB RAM GFE laptops with `<25ms` deterministic extractive synthesis)**.
- **Security Hardening**: Upgraded vector engine to local FastEmbed BGE dense neural vectors (384-D), added persistent SQLite tamper-evident hash chaining (`prev_hash` ➔ `event_hash`, NIST AU-9), implemented NIST SP 800-88 Rev 1 flash media sanitization, and enforced ABAC clearance checks on visual PDF and raw file endpoints.
- **Marketing NOC & Documentation Hub**: Added `/noc/` Marketing Command Center and `Documentation_Hub/` repository.

### `v5.0.0` — Codename: `ObsidianCore` (`2026-10-27`)
- **3-Pane Commercial Studio UI Uplift (`/app/`)**: Institutional dark-slate workspace with live `nvidia-smi` RTX 4090 telemetry, SHA-256 document integrity table, and standalone Windows installation (`C:\AirVault_Enterprise\`).

### `v4.0.0` — Codename: `HyperIngest` (`2026-10-26`)
- **High-Throughput Multi-Thousand-Page PDF Indexer**: Indexed 5,057-page PDFs at 860+ pages/sec with 250ms real-time 4-stage progress bars, multi-file batch uploads, browser folder uploads, and zero-copy directory crawling.
