# TrailVault™ Enterprise v5.1.0 (IronTrail) — Enterprise Operations & Key Custody SOP
**Standard Operating Procedure (SOP) for Secure Enclave Deployment & Key Management**

---

## 1. System Architecture & Product Definition (Auditor Question 1)

### Authoritative Commercial Product: Windows Turnkey NVMe Appliance
TrailVault™ Enterprise is engineered and supported primarily as a **self-contained hardware-accelerated Windows NVMe appliance**:
- **Host Platform:** Windows 11 Enterprise (23H2+) or Windows Server 2022.
- **Hardware Acceleration:** NVIDIA RTX 4090 Mobile / Ada Lovelace GPU with local Ollama runtime on `127.0.0.1:11434`.
- **Primary Orchestrator:** `services/live_appliance_server.py` running locally on `127.0.0.1:8000`.
- **Operator GUI:** `TrailVault.exe` (native Windows taskbar tray daemon providing system status, browser launch, and administrative session purge controls).
- **Storage Architecture:** Dedicated encrypted NTFS volume (Drive `D:\`) secured with BitLocker 256-bit XTS-AES.

### Containerized Linux Reference Stack
For customers evaluating containerized Linux deployments in isolated Kubernetes or Docker enclaves, `docker-compose.yml` provides a CIS-hardened reference implementation:
- Containers run as dedicated non-root service accounts (`10001:10001`).
- `security_opt: [no-new-privileges:true]` enforced on all services.
- Explicit CPU and RAM resource caps prevent Denial of Service (DoS) from resource exhaustion.
- Redis and OpenSearch require explicit administrative authentication.
- All published host ports bind strictly to `127.0.0.1`.

---

## 2. Authentication Models & User Administration (Auditor Question 2)

TrailVault™ Enterprise supports three authentication tiers in production:

1. **Local Enclave Accounts (Turnkey Default):**
   - Salted PBKDF2-HMAC-SHA256 with 600,000 iterations (NIST SP 800-63B).
   - Unique 16-byte CSPRNG random salt per user account stored in `storage/auth_users.json`.
   - Adaptive account lockout: 5 consecutive failed attempts locks account for 30 minutes.
   - Initial bootstrap and credential administration via `scripts/bootstrap_admin.py`.
   - Zero hardcoded passwords in client application code.
2. **Enterprise PKI / CAC / PIV Smart Card Authentication:**
   - For Department of Defense and federal civilian agencies, TrailVault supports Windows WebAuthn loopback proxy integration.
   - Smart card certificates (X.509) are verified against local DoD/Federal PKI trust stores to issue ephemeral session tokens.
3. **Isolated Active Directory / LDAP Enclave:**
   - In private air-gapped enclaves with local domain controllers, TrailVault integrates with Windows Kerberos/NTLM authentication via native Windows authentication protocols.

---

## 3. Host Multi-User Boundaries (Auditor Question 3)

- **Appliance Kiosk Model:** TrailVault is provisioned as a dedicated single-operator intelligence appliance or analyst workstation. Multiple users do not access the host operating system concurrently.
- **Role Isolation:** Within a session, user roles (`LEAD_ANALYST`, `AUDITOR`, `INGEST_OPERATOR`, `CONTRACTOR_CUI`) operate under ephemeral session bearer tokens (`tv_sess_...`) stored exclusively in process RAM with an 8-hour expiration.
- **Multi-Tenant Enclave Deployments:** For environments requiring multi-user concurrent access, customer organizations provision independent TrailVault VM or NVMe instances per project team or classification compartment.

---

## 4. Classification Ceilings & Target Environments (Auditor Question 4)

- **Maximum Classification Ceiling:** **TOP SECRET // SCI / SAP / NOFORN**.
- **Target Operational Perimeters:**
  - Physically air-gapped Sensitive Compartmented Information Facilities (SCIFs).
  - Forward-deployed tactical mobile operations centers (MOCs) and naval vessels.
  - Commercial semiconductor cleanroom fabs (protecting proprietary EDA designs).
  - Pharmaceutical R&D facilities subject to FDA 21 CFR Part 11 and cGMP validation.
  - Critical infrastructure SCADA / industrial control systems (ICS).

---

## 5. Cryptographic Key Custody & Management SOP (Auditor Question 5)

| Key Name | Location | Algorithm | Custody & Lifecycle Management |
| :--- | :--- | :--- | :--- |
| **Appliance Audit Key** | `storage/.audit_key.dpapi` | HMAC-SHA256 (32 bytes CSPRNG) | Generated automatically on initialization and encrypted via Windows DPAPI (`CryptProtectData`) bound to machine and user context. Used to authenticate every chained block in `storage/audit.db`. |
| **Cache Integrity Key** | `storage/.cache_key.dpapi` | HMAC-SHA256 (32 bytes CSPRNG) | Generated during initial database build and encrypted via Windows DPAPI. Signs `storage/chunk_cache.json` into `storage/chunk_cache.sig`. |
| **Offline License Key** | `storage/trailvault.lic` | Asymmetric Ed25519 (FIPS 186-5) | Digital Trail Labs signs node licenses offline using Ed25519. The client appliance embeds exclusively the 32-byte public key (`DTL_VENDOR_ED25519_PUBKEY_HEX`). The private signing key is retained exclusively in offline HSM custody. |
| **BitLocker Volume Master Key (VMK)** | TPM 2.0 / Hardware NVMe | 256-bit XTS-AES | Maintained inside the motherboard TPM 2.0 cryptoprocessor. Volume auto-unlocks only on authorized hardware. Destroyed during BitLocker Cryptographic Erase. |

---

## 6. Media Sanitization SOP (NIST SP 800-88 Rev 1)

### Level 1: Application Session Purge
- **Operator Role:** `LEAD_ANALYST` (Administrator).
- **Execution:** Via UI button ("Purge Customer Session"), Tray Menu, or `POST /api/v1/ingest/wipe-customer-vault`.
- **Action:** Overwrites 100% of customer file bytes with CSPRNG random bytes, issues `os.fsync`, unlinks files, purges customer chunks from memory and Qdrant vector database, and records an immutable chained audit event.

### Level 2: BitLocker Cryptographic Erase (CE) & SSD FTL TRIM
- **Operator Role:** Security Officer / Enclave Administrator.
- **Execution:** Run `03_NIST_800_88_CRYPTOGRAPHIC_ERASE.bat` or `scripts/nvme_cryptographic_erase.ps1`.
- **Action:** Destroys all BitLocker Key Protectors (invalidating VMK access), formats partition, issues SSD controller TRIM/deallocate commands across the block range, and generates an attestation record: `storage/Cryptographic_Erase_Record_D.json` with a SHA-256 integrity checksum.
- **FTL Wear-Leveling Mitigation:** Because all ciphertext on raw physical NAND flash blocks was encrypted with the destroyed VMK, all data is rendered mathematically unrecoverable regardless of SSD wear-leveling algorithms.
