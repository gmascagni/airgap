# Digital Trail Labs — TrailVault™ Enterprise v5.1 Security & Architecture Whitepaper

**Document ID:** `DTL-ARCH-2026-001`  
**Version:** `5.1.0 (IronTrail)`  
**Classification:** `PUBLIC COMMERCIAL & GOVERNMENT BRIEFING`  
**Author:** Digital Trail Labs Architecture Group

---

## 1. Executive Summary
**TrailVault™ Enterprise** (developed by **Digital Trail Labs**) is a sovereign, zero-telemetry Hybrid Retrieval-Augmented Generation (RAG) platform engineered for B2B enterprises and government/defense organizations that cannot expose sensitive Intellectual Property (IP), Controlled Unclassified Information (`CUI`), `ITAR` technical data, or regulated records (`FDA 21 CFR Part 11` / `HIPAA`) to public cloud AI services.

Unlike cloud wrappers or standard local chatbot tools, TrailVault™ enforces **Pre-Retrieval Attribute-Based Access Control (ABAC)** at the vector and lexical index layer, computes **full-stream SHA-256 cryptographic digests** for every ingested document, and provides **visual 140-DPI page bounding-box provenance** (`[Filename, Page X, BBox]`) for every claim.

---

## 2. Six-Layer Hardened Defense-in-Depth Architecture

1. **Layer 1 — Strict Loopback & Zero-Egress Network Lock**:
   - The application server binds strictly to `127.0.0.1:8000` (local loopback interface).
   - Process-level environment locks (`HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1`, `ANONYMIZED_TELEMETRY=False`, `DO_NOT_TRACK=1`) prevent any background model or database library from attempting outbound DNS or HTTPS connections.
   - HTTP security headers (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `X-AirVault-Telemetry-Lock: ZERO-OUTBOUND-VERIFIED`) are enforced on every response.

2. **Layer 2 — Cryptographic SHA-256 Ingestion & Hash-Chained Audit Ledger**:
   - Every ingested file (`.pdf`, `.docx`, `.xlsx`, `.csv`, `.pptx`, `.png`, `.log`, `.json`) is hashed in 1 MB blocks via `hashlib.sha256()`.
   - Every system boot, document ingestion, security clearance switch, query execution, and vault wipe is recorded in a **tamper-evident hash-chained audit log** (`prev_hash` ➔ `event_hash`), satisfying **NIST SP 800-171 Rev 3 (AU.L2-3.3.8)** and **FDA 21 CFR Part 11**.

3. **Layer 3 — Deterministic Hybrid Retrieval (Qdrant Dense BGE Vectors + BM25Okapi + MIL-SPEC Regex)**:
   - Dense 384-dimensional semantic vectors generated locally via FastEmbed ONNX Runtime (`BAAI/bge-small-en-v1.5`) at <3ms per chunk without cloud dependencies.
   - Sparse lexical retrieval (`BM25Okapi`) + domain part-number regex (`MIL-`, `NAS`, `MS`, `AN`, `ECO-`, `CAPA-`, `MSR`, `CPUID`, `AVX-512`) guarantees exact pinpointing of part numbers and tolerances across 5,000+ page manuals.

4. **Layer 4 — Pre-Retrieval ABAC Clearance Gatekeeper**:
   - Before any chunk is evaluated by Reciprocal Rank Fusion (`RRF`) or passed to the LLM context window, Qdrant `FieldCondition(MatchAny)` and BM25 pre-filters strip out any document chunk whose classification (`SECRET // ITAR // NOFORN`) exceeds the active user session clearance (`SUBCONTRACTOR_CUI`).
   - Direct visual inspection endpoints (`/api/v1/pdf-page` and `/api/v1/pdf-file`) independently enforce the same ABAC policy so restricted users cannot bypass the RAG layer to view classified pages.

5. **Layer 5 — Visual Bounding-Box Verification**:
   - Every citation badge (`[Document.pdf, Page X]`) maps to exact normalized bounding-box coordinates (`[x0, y0, x1, y1] pts`) rendered live on a 140-DPI document canvas.

6. **Layer 6 — NIST SP 800-88 Rev 1 Flash Media Sanitization & Cryptographic Erase Guidance**:
   - Customer session files are overwritten with CSPRNG `os.urandom` bytes and flushed via `os.fsync` before deletion, satisfying application-level purge requirements.
   - For complete solid-state (NVMe/SSD) media sanitization, TrailVault provides administrative workflows aligned with NIST SP 800-88 Rev 1 Cryptographic Erase (full-volume BitLocker key destruction / NVMe Sanitize) to defeat Flash Translation Layer (FTL) wear leveling.

> **Compliance Defensibility Notice**: TrailVault provides technical access enforcement, cryptographic audit ledgers (NIST AU-9), and zero-egress network controls aligned with CMMC 2.0 Level 2/3, NIST SP 800-171, and FDA 21 CFR Part 11. Regulatory compliance accreditation requires complementary physical, procedural, and administrative policies executed by the customer organization.
