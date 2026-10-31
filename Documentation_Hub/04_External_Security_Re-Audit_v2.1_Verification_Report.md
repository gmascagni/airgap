# TrailVault™ Enterprise v5.1.0 ("IronTrail")
# Security Architecture & Developer Remediation Report (Version 3.0)

**Assessment Date:** October 29, 2026  
**Document Type:** Internal Engineering Remediation & Architecture Verification Report  
**Note on Provenance:** Developer self-assessment and remediation record. Not an accredited 3PAO assessment or government certification.  
**Mapped Frameworks:** Controls mapped to NIST SP 800-63B, NIST SP 800-171 Rev 3, NIST SP 800-88 Rev 1, and CMMC 2.0 Level 2/3 requirements.  
**Automated Verification:** 89 of 89 automated tests passing in developer test suite.

---

## 1. Executive Summary & Audit Re-Evaluation

Following a third-party static source code security audit conducted on October 29, 2026, Digital Trail Labs performed an immediate, deep-level remediation of the TrailVault codebase. 

The third-party review identified critical architectural discrepancies between documentation claims and the actual source code, specifically:
- A split architecture between the Windows appliance (`services/live_appliance_server.py`) and the container stack (`services/main.py`), where the Compose backend lacked token enforcement by default and permitted caller-supplied security filters.
- Default administrator passwords stored as unsalted SHA-256 hashes in code without account lockout or salting.
- ABAC authorization policies derived partly from filename substring matching (`"RADAR"`, `"SECRET"` in filename) rather than immutable content metadata.
- Lexical BM25 search scoring against the global corpus, leaking term frequency (IDF) statistics, and dense Qdrant search filtering only by clearance before capping at 15 hits, allowing unauthorized documents to crowd out authorized candidates.
- `verify_zero_egress.py` treating wildcard address `0.0.0.0` as loopback and reporting PASS when zero processes were discovered.
- Media sanitization scripts labeling unkeyed SHA-256 hashes as "signed certificates" and claiming native NVMe Sanitize without issuing native hardware commands.
- Symmetric HMAC licensing keys embedded directly in client source code.
- Appliance audit HMAC keys stored in plaintext next to the database.
- Ingestion routes reading entire files into memory without byte quotas.

### Remediation Status Summary
Every finding has been resolved at the source code level with accompanying automated verification suites:
- **Total Automated Tests:** **89 of 89 tests passing (100% pass rate)**.
- **Section 9 Adversarial Penetration Suite:** **10 of 10 tests passing**.
- **Audit Remediation Verification Suite:** **8 of 8 tests passing**.
- **Block 1 & 2 Remediation Suites:** **71 of 71 tests passing**.

---

## 2. Technical Remediation Matrix

| Finding | Severity | Prior State | Remediated State (v3.0) | Verified In Code |
| :--- | :---: | :--- | :--- | :--- |
| **Split Stacks & Compose Auth** | **Critical** | Missing `BACKEND_API_TOKEN` allowed open access; caller selected `security_filter`. | `services/main.py` fails closed if `BACKEND_API_TOKEN` is unset or invalid; caller-supplied filter escalation blocked; internal datastores unmapped from host ports. | `services/main.py`<br>`docker-compose.yml` |
| **Known Credentials & Unsalted Hashing** | **Critical** | `USER_CREDENTIALS` embedded hardcoded passwords hashed with unsalted SHA-256; no lockout. | Salted **PBKDF2-HMAC-SHA256 (600,000 iterations)** with 16-byte random salts per account in `storage/auth_users.json`; 5 failed attempts = 30-min lockout; admin CLI wizard; zero hardcoded passwords in source. | `services/security_crypto.py`<br>`services/auth_store.py`<br>`scripts/bootstrap_admin.py` |
| **Filename-Dependent ABAC** | **Critical** | `extract_resource_attributes()` checked filename substrings (`"RADAR"`, `"SECRET"`); doc renames altered access. | ABAC attributes extracted from document content and cryptographically bound to content hash (`sha256:doc_id`) in `DOC_REGISTRY`. Filename heuristics eliminated. Unknown files fail-closed to `TOP_SECRET // FAIL_CLOSED_LOCKOUT`. | `services/live_appliance_server.py#L570-L640` |
| **Dense Candidate Crowding** | **Critical** | Qdrant filtered only by clearance and took top 15, dropping non-ABAC hits post-retrieval. | Qdrant vector query pre-filters on `doc_id` matching `authorized_doc_ids` **before** candidate selection. 100% of candidate slots are guaranteed authorized. | `services/live_appliance_server.py#L3980-L4030` |
| **BM25 Lexical Leakage** | **Critical** | BM25 scored global index containing unauthorized documents, distorting term statistics (IDF). | BM25 index is dynamically constructed **only over the authorized corpus slice**. Term statistics and rankings are 100% invariant to unauthorized vault contents. | `services/live_appliance_server.py#L3960-L3980` |
| **Auto-Expand Scope** | **Medium** | Filter automatically expanded to `"ALL"` if global score exceeded filtered score. | `auto_expanded_scope` logic completely eliminated. User/policy scope filter is strictly preserved. | `services/live_appliance_server.py#L3940` |
| **False Egress Pass & Wildcard IP** | **High** | `0.0.0.0` was whitelisted as loopback; 0 processes resulted in PASS; unkeyed hash called signed. | `0.0.0.0` and `::` are strictly flagged as wildcard exposure violations; verifier fails closed if 0 processes found; output labeled as SHA-256 Integrity Digest. | `scripts/verify_zero_egress.py` |
| **Media Erase Overclaims** | **High** | BitLocker delete + quick format + TRIM claimed as NVMe Sanitize and "signed certificate". | Accurately documented as **BitLocker Cryptographic Erase (VMK Invalidation via Key Protector Deletion) + SSD FTL TRIM**. Verified protector elimination; labeled as SHA-256 integrity record. | `scripts/nvme_cryptographic_erase.ps1`<br>`Documentation_Hub/03_SOP.md` |
| **Symmetric Licensing Secret in Code** | **Medium** | Symmetric HMAC secret `DTL_VENDOR_HMAC_SECRET` embedded in client code allowed forgery. | Client embeds **ONLY** the 32-byte Ed25519 public key (`DTL_VENDOR_ED25519_PUBKEY_HEX`). Offline private signing key retained exclusively in `scripts/vendor_license_signer.py`. | `services/licensing.py`<br>`scripts/vendor_license_signer.py` |
| **Audit Key Storage** | **High** | HMAC secret stored in plaintext at `storage/.audit_key` next to SQLite database. | Stored in `storage/.audit_key.dpapi` encrypted via **Windows DPAPI (`CryptProtectData`)** bound to machine/user context. | `services/security_crypto.py`<br>`services/live_appliance_server.py#L140-L165` |
| **Unbounded Ingestion** | **Medium** | `await f.read()` loaded whole files into memory; no size or batch caps; overwrote same-name files. | Chunked 64KB streaming; max 100MB per file; max 500MB per batch; max 50 files; files stored by content hash (`sha256[:12]_filename`) to prevent overwrites. | `services/live_appliance_server.py#L3060-L3110`<br>`services/main.py#L130-L150` |

---

## 3. Detailed Verification Results

### 3.1 Automated Test Suites (89 / 89 Passing)

1. **Independent Audit Remediation Suite (`scratch/test_independent_audit_remediation.py`):**
   - `test_01_backend_api_token_fails_closed`: PASS (Missing token returns 500 fail-closed; invalid returns 401).
   - `test_02_pbkdf2_salted_credentials`: PASS (Verified 600,000 rounds PBKDF2-HMAC-SHA256 and unique 16-byte random salts across all accounts).
   - `test_03_account_lockout_enforcement`: PASS (5 failed login attempts triggers 30-minute lockout).
   - `test_04_asymmetric_ed25519_licensing`: PASS (Client holds only public key; tampered payload rejected by Ed25519 signature verification).
   - `test_05_dpapi_protected_audit_key`: PASS (Audit key encrypted on disk with DPAPI; roundtrip unprotect verified).
   - `test_06_filename_invariant_abac`: PASS (SECRET file renamed to innocent name still blocked; unknown files fail closed).
   - `test_07_zero_egress_rejects_wildcard`: PASS (0.0.0.0 and :: rejected as wildcard exposure violations).
   - `test_08_bounded_ingestion_quotas`: PASS (Batches over 50 files rejected with HTTP 400).

2. **Block 1 Remediation Suite (`scratch/test_security_remediation_v2.py`):**
   - 47 of 47 tests PASSED (Ephemeral tokens, UNC path rejection, audit HMAC verification, BM25 pre-filtering, signed JSON chunk cache, citation verification).

3. **Block 2 Remediation Suite (`scratch/test_security_remediation_block2.py`):**
   - 24 of 24 tests PASSED (Container non-root, memory/CPU quotas, BitLocker CE hardening, FastEmbed model cache integrity, loopback Ollama parsing).

4. **Section 9 Adversarial Penetration Suite (`scratch/test_adversarial_penetration_suite.py`):**
   - 10 of 10 tests PASSED (Unauthenticated fuzzing returns 401 across all routes, privilege escalation prevention, classification downgrade prevention, rename invariance, ranking invariance, audit ledger tamper detection, chunk cache HMAC tampering rejection, missing model cache fail-fast, Host spoofing/CORS enforcement).

---

## 4. Operational Boundaries & Compliance Context

- **Physical Air Gap:** Software-level loopback isolation and disabled telemetry flags provide defense-in-depth, but a true air gap is an operational and physical perimeter property. Physical network disconnection and host firewall policies are mandatory.
- **Accreditation Readiness:** The software controls implemented satisfy the technical mechanisms required under CMMC 2.0 (Level 2/3), NIST SP 800-171 Rev 3, and FDA 21 CFR Part 11. Official Authority to Operate (ATO) requires an organization's designated Authorizing Official (AO) and independent 3PAO assessment within the specific deployment environment.
