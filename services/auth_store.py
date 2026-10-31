"""
TrailVault(TM) Enterprise - Sovereign Authentication & Identity Store
NIST SP 800-63B compliant password verification, salted PBKDF2-HMAC-SHA256,
dynamic credential management, persistent account lockout, and DPAPI-signed integrity.
Zero default passwords ship in source or binaries.
"""

import json
import logging
import os
import secrets
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

ROOT_DIR = Path(os.getenv("AIRVAULT_ROOT_DIR", str(Path(__file__).resolve().parent.parent)))
SERVICES_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(SERVICES_DIR) not in sys.path:
    sys.path.insert(0, str(SERVICES_DIR))

try:
    from services.security_crypto import (
        check_account_locked,
        get_or_create_dpapi_key,
        hash_password,
        record_login_attempt,
        sign_file_hmac,
        unlock_user,
        verify_file_hmac,
        verify_password,
    )
except ImportError:
    from security_crypto import (
        check_account_locked,
        get_or_create_dpapi_key,
        hash_password,
        record_login_attempt,
        sign_file_hmac,
        unlock_user,
        verify_file_hmac,
        verify_password,
    )

logger = logging.getLogger("trailvault.auth")
AUTH_STORE_FILE = ROOT_DIR / "storage" / "auth_users.json"
AUTH_KEY_FILE = ROOT_DIR / "storage" / ".auth_key.dpapi"


def _get_auth_key() -> bytes:
    """Retrieves or provisions the DPAPI-protected key used to sign the identity store."""
    return get_or_create_dpapi_key(AUTH_KEY_FILE, description="TrailVault Identity Store Key")


def is_setup_needed() -> bool:
    """Returns True if no accounts have been enrolled yet (first-run appliance setup required)."""
    if not AUTH_STORE_FILE.exists():
        return True
    try:
        users = load_auth_store()
        return len(users) == 0
    except Exception:
        return True


def load_auth_store() -> Dict[str, Dict[str, Any]]:
    """
    Loads user accounts from persistent storage.
    Enforces HMAC-SHA256 signature verification backed by Windows DPAPI (R-03).
    Fails closed if the identity store is missing a signature or has been tampered with.
    """
    if not AUTH_STORE_FILE.exists():
        return {}

    # Verify signature before parsing
    key = _get_auth_key()
    if not verify_file_hmac(AUTH_STORE_FILE, key):
        logger.critical(
            f"[SECURITY TAMPER ALERT] {AUTH_STORE_FILE} signature verification failed. "
            f"The identity store has been modified outside the authorized API."
        )
        raise RuntimeError(
            "CRITICAL SECURITY ALERT: storage/auth_users.json signature verification failed. "
            "Appliance halted in fail-closed state to prevent unauthorized privilege escalation."
        )

    try:
        data = json.loads(AUTH_STORE_FILE.read_text(encoding="utf-8"))
        return data.get("users", {})
    except Exception as exc:
        logger.error(f"Failed to read auth store: {exc}")
        raise RuntimeError(f"Corrupted auth store: {exc}")


def save_auth_store(users: Dict[str, Dict[str, Any]]) -> None:
    """
    Persists user accounts to storage and cryptographically signs the file using DPAPI key.
    """
    AUTH_STORE_FILE.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "version": "5.1.0",
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "users": users,
    }
    AUTH_STORE_FILE.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    key = _get_auth_key()
    sign_file_hmac(AUTH_STORE_FILE, key)


def enroll_initial_admin(
    username: str,
    password: str,
    display_name: str = "Lead Security Administrator",
) -> Tuple[bool, Optional[str]]:
    """
    First-run setup: Enrolls the initial enclave administrator.
    Can ONLY be called when no accounts exist in the identity store (R-01).
    Enforces NIST SP 800-63B password rules (minimum 14 characters).
    """
    if not is_setup_needed():
        return False, "Initial administrator setup already completed. Use authenticated admin console."

    username = username.strip().lower()
    if not username or len(username) < 3:
        return False, "Username must be at least 3 characters long."

    if len(password) < 14:
        return False, "Password must be at least 14 characters long (NIST SP 800-63B standard)."

    salt_hex, hash_hex = hash_password(password)
    admin_user = {
        "user_id": f"usr-{username}",
        "username": username,
        "display_name": display_name,
        "role": "LEAD_ANALYST",
        "clearance": "SECRET",
        "clearance_level": "SECRET",
        "clearance_display": "SECRET // ITAR // NOFORN",
        "citizenship": "US",
        "compartments": ["RADAR_NX", "PROPULSION", "CRYOGENICS", "CRYO", "RADAR", "M16", "DEFENSE"],
        "need_to_know": ["PROJECT_AIRGAP", "C4ISR", "MAINTENANCE", "CUSTOMER_SESSION", "DEFENSE", "AUDIT"],
        "password_salt": salt_hex,
        "password_hash": hash_hex,
        "hash_algorithm": "PBKDF2-HMAC-SHA256 (600,000 rounds)",
        "is_revoked": False,
        "must_change_password": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None,
    }

    save_auth_store({username: admin_user})
    logger.info(f"Successfully enrolled initial sovereign administrator '{username}' with DPAPI-signed integrity.")
    return True, None


def create_user_account(
    admin_user: Dict[str, Any],
    username: str,
    initial_password: str,
    display_name: str,
    role: str = "CONTRACTOR_CUI",
    clearance: str = "CUI",
    clearance_display: str = "CUI // RESTRICTED",
    citizenship: str = "US",
    compartments: Optional[List[str]] = None,
    need_to_know: Optional[List[str]] = None,
) -> Tuple[bool, Optional[str]]:
    """
    Creates a new user account (administrative privilege required).
    Sets must_change_password=True so the user is forced to rotate credentials upon first login.
    """
    if admin_user.get("role") != "LEAD_ANALYST":
        return False, "Administrative authorization (LEAD_ANALYST) required to create accounts."

    username = username.strip().lower()
    if len(username) < 3:
        return False, "Username must be at least 3 characters."
    if len(initial_password) < 14:
        return False, "Initial password must be at least 14 characters."

    users = load_auth_store()
    if username in users:
        return False, f"User '{username}' already exists."

    salt_hex, hash_hex = hash_password(initial_password)
    users[username] = {
        "user_id": f"usr-{username}",
        "username": username,
        "display_name": display_name,
        "role": role,
        "clearance": clearance,
        "clearance_level": clearance,
        "clearance_display": clearance_display,
        "citizenship": citizenship,
        "compartments": compartments or ["DEFENSE"],
        "need_to_know": need_to_know or ["CUSTOMER_SESSION"],
        "password_salt": salt_hex,
        "password_hash": hash_hex,
        "hash_algorithm": "PBKDF2-HMAC-SHA256 (600,000 rounds)",
        "is_revoked": False,
        "must_change_password": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None,
    }
    save_auth_store(users)
    return True, None


def authenticate_user(username: str, password: str) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
    """
    Authenticates a user against the persistent auth store.
    Enforces persistent account lockout and constant-time PBKDF2 verification.
    Returns: (is_authenticated, safe_user_dict, error_message)
    """
    username = username.strip().lower()

    # 1. Check persistent account lockout (survives restarts)
    locked, lock_msg = check_account_locked(username)
    if locked:
        return False, None, lock_msg

    try:
        users = load_auth_store()
    except Exception as exc:
        return False, None, str(exc)

    user_record = users.get(username)

    if not user_record:
        # Prevent timing attack by computing dummy PBKDF2 hash
        hash_password("dummy_password_timing_protection_123456")
        record_login_attempt(username, False)
        return False, None, "Invalid username or password."

    if user_record.get("is_revoked", False):
        return False, None, "Account has been revoked. Contact enclave security officer."

    salt_hex = user_record.get("password_salt", "")
    hash_hex = user_record.get("password_hash", "")

    # Constant-time PBKDF2 verification
    valid = verify_password(password, salt_hex, hash_hex)

    if not valid:
        is_now_locked, lock_reason = record_login_attempt(username, False)
        return False, None, lock_reason or "Invalid username or password."

    # Successful login: reset failed counters and update last_login
    record_login_attempt(username, True)
    user_record["last_login"] = datetime.now(timezone.utc).isoformat()
    save_auth_store(users)

    # Return safe user identity without salt/hash
    safe_user = {k: v for k, v in user_record.items() if k not in ["password_salt", "password_hash"]}
    return True, safe_user, None


def update_user_password(username: str, old_password: str, new_password: str) -> Tuple[bool, Optional[str]]:
    """Updates password for a user, enforcing salt regeneration and PBKDF2 hashing."""
    username = username.strip().lower()
    if len(new_password) < 14:
        return False, "New password must be at least 14 characters long (NIST SP 800-63B standard)."

    users = load_auth_store()
    user_record = users.get(username)
    if not user_record:
        return False, "User not found."

    salt_hex = user_record.get("password_salt", "")
    hash_hex = user_record.get("password_hash", "")

    if not verify_password(old_password, salt_hex, hash_hex):
        return False, "Current password incorrect."

    new_salt, new_hash = hash_password(new_password)
    user_record["password_salt"] = new_salt
    user_record["password_hash"] = new_hash
    user_record["must_change_password"] = False
    user_record["updated_at"] = datetime.now(timezone.utc).isoformat()

    save_auth_store(users)
    return True, None
