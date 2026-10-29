# TrailVault™ Enterprise (v5.1.0 "IronTrail") — Air-Gapped Document Intelligence Appliance

**Zero-Telemetry, Grounded Technical Intelligence for Air-Gapped Defense & Industrial Enclaves.**

TrailVault™ Enterprise is an air-gapped, turn-key technical document intelligence appliance purpose-built for physically disconnected defense, aerospace, semiconductor, nuclear, and critical infrastructure environments.

---

## 1. Authoritative Product Architecture

TrailVault™ Enterprise is deployed and operated in two distinct environments:

### Primary Production Architecture: Native Turnkey Windows NVMe Appliance
The authoritative commercial and government product deployment is the **Native Windows NVMe Appliance**:
- **Launcher & Tray Daemon:** `TrailVault.exe` (native Windows GUI launcher with taskbar tray status, automatic loopback enforcement, and administrative controls).
- **Appliance Server:** `services/live_appliance_server.py` running on `127.0.0.1:8000`.
- **Inference Engine:** Local Ollama runtime on `127.0.0.1:11434` with NVIDIA GPU acceleration (RTX 4090 Mobile / Ada Lovelace).
- **Neural Embeddings:** Local FastEmbed ONNX Runtime (`BAAI/bge-small-en-v1.5`, 384-d) bundled in `models/fastembed_cache` with strict fail-fast offline cache verification (N-12).
- **Deterministic Search:** Local Qdrant embedded vector database + `BM25Okapi` sparse lexical index + MIL-SPEC part-number regex analyzers.
- **Storage & Encryption at Rest:** BitLocker 256-bit XTS-AES volume encryption with NIST SP 800-88 Rev 1 Cryptographic Erase (`scripts/nvme_cryptographic_erase.ps1`).

### Secondary Reference Architecture: Hardened Docker Stack
For containerized Linux enclave evaluation, a CIS-hardened Docker Compose reference stack is provided:
- **Compose Definition:** `docker-compose.yml` on an isolated internal bridge (`internal: true`).
- **Security Hardening (N-09):** All containers run as dedicated non-root users (`10001:10001`), enforce `no-new-privileges: true`, explicit memory and CPU constraints, password-authenticated Redis, and all exposed ports strictly bound to `127.0.0.1`.
- **Backend Orchestrator:** `Dockerfile.backend` (`services/main.py`) with token authentication and mandatory fail-closed security classification filters.

---

## 2. Core Security & Compliance Controls

1. **Strict Loopback & Zero Egress (N-12):**
   - The appliance binds strictly to `127.0.0.1:8000`. `OLLAMA_BASE_URL` strictly validates hostname against loopback addresses.
   - Process locks (`HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1`, `DO_NOT_TRACK=1`) and pre-flight cache assertions halt execution immediately if local model weights are missing, preventing background download attempts.
2. **Ephemeral Session Authentication & RBAC (N-01 & N-02):**
   - Cryptographically random session bearer tokens generated via `secrets.token_urlsafe(32)` on `POST /api/v1/auth/login`.
   - Role-Based Access Control (`LEAD_ANALYST`, `COMPLIANCE_AUDITOR`, `INGEST_OPERATOR`, `DEFENSE_CONTRACTOR_ANALYST`, `SUBCONTRACTOR_CUI`). Ingestion, configuration, and audit routes strictly require appropriate roles.
3. **Cryptographic HMAC-SHA256 Audit Ledger (N-03):**
   - SQLite audit ledger keyed with appliance HMAC-SHA256 key (`storage/.audit_key`). Raw queries are redacted with truncated SHA-256 hashes.
4. **Pre-Retrieval ABAC Clearance Filtering (N-04 & N-05):**
   - Lexical and dense retrieval pre-filters enforce security compartment isolation before RAG ranking, preventing unauthorized metadata or chunk leakage.
5. **Tamper-Evident Chunk Cache (N-06):**
   - Zero-pickle serialization: structured JSON chunk cache verified via HMAC-SHA256 cryptographic signatures.
6. **Media Sanitization & NIST SP 800-88 Rev 1 Cryptographic Erase (N-10):**
   - **Application Purge:** Session documents are overwritten across 100% of their byte length with CSPRNG bytes, flushed via `os.fsync`, unlinked, and derived vectors/caches purged.
   - **Hardware Cryptographic Erase:** Volume Master Key destruction via `scripts/nvme_cryptographic_erase.ps1` to defeat solid-state Flash Translation Layer (FTL) wear leveling.

---

## 3. Quick Start (Windows Turnkey Appliance)

1. Launch `TrailVault.exe` or execute `Launch-Customer-Live-Demo.bat`.
2. Open `http://127.0.0.1:8000/app/index.html` in your browser.
3. Authenticate with an appliance persona (e.g. `lead_analyst`).
