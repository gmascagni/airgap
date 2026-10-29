# TrailVault™ Enterprise v5.1.0 (IronTrail) — Compliance Control Mapping
**Frameworks: CMMC 2.0 (Level 2/3), NIST SP 800-171 Rev 3, FDA 21 CFR Part 11, HIPAA Security Rule**

This document provides technical control evidence mapping the authentic engineering implementations of TrailVault™ Enterprise against federal, defense, and life-sciences regulatory standards.

---

## 1. CMMC 2.0 Level 2 / NIST SP 800-171 Rev 3 Technical Controls

| Control ID | Control Name | TrailVault Technical Implementation | Verification Evidence |
| :--- | :--- | :--- | :--- |
| **AC.L2-3.1.1** | Authorized Access Control | Requests require ephemeral session bearer tokens generated via `secrets.token_urlsafe(32)` at `POST /api/v1/auth/login`. Unauthenticated requests to all API routes are rejected with HTTP 401 at the middleware layer. | `scratch/test_adversarial_penetration_suite.py::test_01_anonymous_endpoint_fuzzing` |
| **AC.L2-3.1.2** | Transaction & Function Control | Role-Based Access Control (`LEAD_ANALYST`, `AUDITOR`, `INGEST_OPERATOR`, `CONTRACTOR_CUI`). Administrative and destructive routes (`/wipe-customer-vault`, `/audit/ledger`, `/policy`) enforce strict role dominance. | `scratch/test_adversarial_penetration_suite.py::test_02_privilege_escalation_credential_enforcement` |
| **AC.L2-3.1.3** | Control CUI Flow | Pre-retrieval ABAC gatekeeper filters BM25 lexical and Qdrant dense vector candidates before fusion or LLM synthesis. Document inspection routes (`/pdf-page`, `/pdf-file`) enforce the same clearance policy. | `scratch/test_adversarial_penetration_suite.py::test_06_pre_retrieval_ranking_invariance` |
| **AC.L2-3.1.20** | External Connections | Appliance strictly binds to `127.0.0.1`. Environment variables (`HF_HUB_OFFLINE=1`, `DO_NOT_TRACK=1`) and FastEmbed fail-fast cache checks prevent outbound network initialization. | `scripts/verify_zero_egress.py` |
| **AU.L2-3.3.1** | System Audit Events | All security-relevant events (authentication, ingest, clearance check, query, policy update, vault wipe) are persisted to `storage/audit.db`. | `services/live_appliance_server.py::SqliteAuditLedger` |
| **AU.L2-3.3.8** | Audit Trail Protection | Chained cryptographic ledger (`entry_hash = HMAC-SHA256(key, prev_hash + data)`). Verifier recalculates chain from genesis; raw queries are redacted with `QueryHash` to prevent CUI data leakage. | `scratch/test_adversarial_penetration_suite.py::test_07_audit_ledger_tamper_detection` |
| **IA.L2-3.5.1** | Identification & Authentication | User identities authenticated against SHA-256 salted credentials with 8-hour token expiration. Explicit logout invalidates active tokens. | `scratch/test_security_remediation_v2.py::test_01_authentication_and_session_lifecycle` |
| **MP.L2-3.8.3** | Media Sanitization | Two-tier sanitization: (1) Application file shredding overwriting 100% of bytes with CSPRNG bytes + `fsync`; (2) Hardware NIST SP 800-88 Rev 1 Cryptographic Erase (`scripts/nvme_cryptographic_erase.ps1`) destroying BitLocker volume keys to defeat SSD FTL wear leveling. | `scripts/nvme_cryptographic_erase.ps1` |
| **SC.L2-3.13.1** | Boundary Protection | Cross-origin request forgery protection, strict `Host` header validation (`127.0.0.1`), and refusal of UNC network paths (`\\host\share`). | `scratch/test_adversarial_penetration_suite.py::test_10_mismatched_host_and_cross_origin_refusal` |
| **SI.L2-3.14.1** | Flaw Remediation | Elimination of Python pickle serialization in favor of HMAC-SHA256 signed JSON cache (`storage/chunk_cache.json`). Tampered caches are rejected on boot. | `scratch/test_adversarial_penetration_suite.py::test_08_tampered_chunk_cache_rejection` |

---

## 2. FDA 21 CFR Part 11 (Electronic Records & Electronic Signatures)

| Regulation Section | Requirement | TrailVault Compliance Architecture |
| :--- | :--- | :--- |
| **§ 11.10(a)** | Validation of Systems | Deterministic, offline-first execution with automated regression and penetration test suites (70 unit tests + 10 adversarial tests) ensuring reproducible accuracy and retrieval grounding. |
| **§ 11.10(b)** | Record Protection & Retention | Ingested source files are retained in append-only storage with cryptographic SHA-256 hashes recorded on intake. Derived cache files are digitally signed via HMAC-SHA256. |
| **§ 11.10(c)** | Protection of Audit Trails | Tamper-evident SQLite audit ledger (`storage/audit.db`) protected by appliance HMAC key (`storage/.audit_key`). Row insertion, modification, or deletion is immediately detected by `verify_integrity()`. |
| **§ 11.10(d)** | System Access Limiting | Enforces role-based session authentication with strict privilege boundaries between Operators, Analysts, and Auditors. |
| **§ 11.10(e)** | Time-Stamped Audit Trails | Audit entries record UTC ISO 8601 timestamps, authenticated operator username, user role, action, target resource, and chained entry hash. |
| **§ 11.50** | Signature Manifestations | Cryptographic erase certificates (`Cryptographic_Erase_Certificate.json`) record operator identity, hardware volume serial, timestamp, and SHA-256 digest. |

---

## 3. HIPAA Security Rule (45 CFR Part 164 Subpart C)

| Security Standard | Implementation Specification | TrailVault Implementation |
| :--- | :--- | :--- |
| **164.312(a)(1)** | Access Control | Unique user identification, automatic session timeout (8 hours), and pre-retrieval compartment filtering preventing unauthorized PHI/ePHI inspection. |
| **164.312(b)** | Audit Controls | Persistent cryptographic audit ledger recording access, search queries (with hash redaction), and administrative modifications. |
| **164.312(c)(1)** | Integrity | BitLocker 256-bit XTS-AES volume encryption at rest, HMAC-SHA256 signed JSON cache validation, and chained hash verification. |
| **164.312(d)** | Person or Entity Authentication | Ephemeral session tokens issued only upon verifying SHA-256 hashed credentials. |
| **164.312(e)(1)** | Transmission Security | 100% loopback isolation (`127.0.0.1`); zero external sockets; cross-origin state mutations rejected. |
