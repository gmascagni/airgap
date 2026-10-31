"""
TrailVault(TM) Enterprise - Cryptographic Security Primitives
NIST SP 800-63B Password Protection & Windows DPAPI Key Storage

Implements:
1. PBKDF2-HMAC-SHA256 with 600,000 iterations and 128-bit cryptographically secure random salts.
2. Windows DPAPI (Data Protection API) hardware/user-bound key protection.
3. Adaptive account lockout to prevent brute-force attacks (5 failed attempts = 30 min lock).
"""

import binascii
import ctypes
import hashlib
import hmac
import json
import os
import secrets
import sys
import time
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

# DPAPI Structures for Windows
if os.name == "nt":
    from ctypes import wintypes

    class DATA_BLOB(ctypes.Structure):
        _fields_ = [
            ("cbData", wintypes.DWORD),
            ("pbData", ctypes.POINTER(ctypes.c_byte)),
        ]

    crypt32 = ctypes.windll.crypt32
    kernel32 = ctypes.windll.kernel32
else:
    crypt32 = None
    kernel32 = None


# -----------------------------------------------------------------------------
# 1. WINDOWS DPAPI (Data Protection API) HARDWARE/USER KEY STORAGE
# -----------------------------------------------------------------------------
def dpapi_protect(data: bytes, description: str = "TrailVault Key") -> bytes:
    """
    Encrypts a secret buffer using Windows DPAPI (CryptProtectData).
    The encrypted blob is bound to the local machine and user context.
    Fails closed on Windows if DPAPI operation fails.
    """
    if os.name == "nt" and crypt32:
        try:
            b_in = (ctypes.c_byte * len(data))(*data)
            blob_in = DATA_BLOB(len(data), b_in)
            blob_out = DATA_BLOB()
            if not crypt32.CryptProtectData(
                ctypes.byref(blob_in),
                description,
                None,
                None,
                None,
                0,
                ctypes.byref(blob_out),
            ):
                raise ctypes.WinError()
            buf = (ctypes.c_byte * blob_out.cbData).from_address(
                ctypes.addressof(blob_out.pbData.contents)
            )
            result = bytes(buf)
            kernel32.LocalFree(blob_out.pbData)
            return result
        except Exception as exc:
            # R-03: Hard fail-closed on DPAPI encryption failure; never write plaintext
            raise RuntimeError(f"Windows DPAPI encryption failed (CryptProtectData): {exc}")
    # Non-Windows fallback (Linux enclaves without DPAPI)
    return data


def dpapi_unprotect(cipher_data: bytes) -> bytes:
    """
    Decrypts a Windows DPAPI encrypted blob (CryptUnprotectData).
    Fails closed on Windows if DPAPI operation fails.
    """
    if os.name == "nt" and crypt32:
        try:
            b_in = (ctypes.c_byte * len(cipher_data))(*cipher_data)
            blob_in = DATA_BLOB(len(cipher_data), b_in)
            blob_out = DATA_BLOB()
            if not crypt32.CryptUnprotectData(
                ctypes.byref(blob_in),
                None,
                None,
                None,
                None,
                0,
                ctypes.byref(blob_out),
            ):
                raise ctypes.WinError()
            buf = (ctypes.c_byte * blob_out.cbData).from_address(
                ctypes.addressof(blob_out.pbData.contents)
            )
            result = bytes(buf)
            kernel32.LocalFree(blob_out.pbData)
            return result
        except Exception as exc:
            # R-03: Hard fail-closed on DPAPI decryption failure; never accept corrupted ciphertext
            raise RuntimeError(f"Windows DPAPI decryption failed (CryptUnprotectData): {exc}")
    return cipher_data


def get_or_create_dpapi_key(key_path: Path, description: str = "TrailVault Key") -> bytes:
    """
    Retrieves or generates a 256-bit appliance cryptographic key protected by Windows DPAPI.
    Fails closed if encrypted key file is corrupted or cannot be decrypted.
    """
    if key_path.exists():
        cipher = key_path.read_bytes()
        plain = dpapi_unprotect(cipher)
        if len(plain) >= 32:
            return plain
        raise RuntimeError(f"DPAPI key at {key_path} is invalid length ({len(plain)} bytes).")

    key = secrets.token_bytes(32)
    key_path.parent.mkdir(parents=True, exist_ok=True)
    enc_key = dpapi_protect(key, description=description)
    key_path.write_bytes(enc_key)
    return key


def sign_file_hmac(file_path: Path, key: bytes) -> Path:
    """Computes HMAC-SHA256 signature for file and writes adjacent .sig file."""
    sig_path = file_path.with_suffix(file_path.suffix + ".sig")
    data = file_path.read_bytes()
    sig = hmac.new(key, data, hashlib.sha256).hexdigest()
    sig_path.write_text(sig, encoding="utf-8")
    return sig_path


def verify_file_hmac(file_path: Path, key: bytes) -> bool:
    """Verifies HMAC-SHA256 signature of a file against its .sig file."""
    sig_path = file_path.with_suffix(file_path.suffix + ".sig")
    if not file_path.exists() or not sig_path.exists():
        return False
    try:
        data = file_path.read_bytes()
        expected = hmac.new(key, data, hashlib.sha256).hexdigest()
        actual = sig_path.read_text(encoding="utf-8").strip()
        return hmac.compare_digest(expected, actual)
    except Exception:
        return False


# -----------------------------------------------------------------------------
# 2. NIST SP 800-63B PASSWORD HASHING (PBKDF2-HMAC-SHA256, 600,000 ROUNDS)
# -----------------------------------------------------------------------------
PBKDF2_ROUNDS = 600000


def hash_password(password: str, salt: Optional[bytes] = None) -> Tuple[str, str]:
    """
    Hashes a password with PBKDF2-HMAC-SHA256 using 600,000 iterations
    and a 16-byte cryptographically secure random salt.
    Returns: (salt_hex, hash_hex)
    """
    if salt is None:
        salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ROUNDS)
    salt_hex = binascii.hexlify(salt).decode("utf-8")
    hash_hex = binascii.hexlify(dk).decode("utf-8")
    return salt_hex, hash_hex


def verify_password(password: str, salt_hex: str, hash_hex: str) -> bool:
    """
    Verifies a password against the stored salt and hash in constant time.
    """
    try:
        salt = binascii.unhexlify(salt_hex)
        expected_hash = binascii.unhexlify(hash_hex)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ROUNDS)
        return hmac.compare_digest(dk, expected_hash)
    except Exception:
        return False


# -----------------------------------------------------------------------------
# 3. ADAPTIVE ACCOUNT LOCKOUT & RATE LIMITING (PERSISTENT / R-09)
# -----------------------------------------------------------------------------
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_SEC = 1800  # 30 minutes
ATTEMPT_WINDOW_SEC = 900    # 15 minutes window

ROOT_DIR = Path(os.getenv("AIRVAULT_ROOT_DIR", str(Path(__file__).resolve().parent.parent)))
LOCKOUT_FILE = ROOT_DIR / "storage" / "auth_lockout.json"

_FAILED_ATTEMPTS: Dict[str, list[float]] = defaultdict(list)
_LOCKED_UNTIL: Dict[str, float] = {}


def _load_persistent_lockout() -> None:
    """Loads lockout timestamps and failed attempts from disk (survives restarts)."""
    global _FAILED_ATTEMPTS, _LOCKED_UNTIL
    if not LOCKOUT_FILE.exists():
        return
    try:
        data = json.loads(LOCKOUT_FILE.read_text(encoding="utf-8"))
        _LOCKED_UNTIL.update(data.get("locked_until", {}))
        for k, v in data.get("failed_attempts", {}).items():
            _FAILED_ATTEMPTS[k] = v
    except Exception:
        pass


def _save_persistent_lockout() -> None:
    """Flushes lockout state to disk."""
    try:
        LOCKOUT_FILE.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "locked_until": _LOCKED_UNTIL,
            "failed_attempts": dict(_FAILED_ATTEMPTS),
            "updated_at": time.time(),
        }
        LOCKOUT_FILE.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    except Exception:
        pass


# Load persistent state on module import
_load_persistent_lockout()


def check_account_locked(username: str) -> Tuple[bool, Optional[str]]:
    """Checks if an account is currently locked out."""
    _load_persistent_lockout()
    now = time.time()
    lock_time = _LOCKED_UNTIL.get(username, 0)
    if now < lock_time:
        rem_min = int((lock_time - now) / 60) + 1
        return True, f"Account locked due to consecutive failed logins. Try again in {rem_min} minute(s)."
    return False, None


def record_login_attempt(username: str, success: bool) -> Tuple[bool, Optional[str]]:
    """
    Records a login attempt.
    If 5 failed attempts occur within 15 minutes, locks account for 30 minutes.
    Persists state to disk so process restarts cannot bypass lockout.
    """
    _load_persistent_lockout()
    now = time.time()
    if success:
        _FAILED_ATTEMPTS.pop(username, None)
        _LOCKED_UNTIL.pop(username, None)
        _save_persistent_lockout()
        return False, None

    # Filter past attempts to window
    attempts = [t for t in _FAILED_ATTEMPTS[username] if now - t < ATTEMPT_WINDOW_SEC]
    attempts.append(now)
    _FAILED_ATTEMPTS[username] = attempts

    if len(attempts) >= MAX_FAILED_ATTEMPTS:
        _LOCKED_UNTIL[username] = now + LOCKOUT_DURATION_SEC
        _save_persistent_lockout()
        return True, "Account locked for 30 minutes due to 5 consecutive failed login attempts."
    
    _save_persistent_lockout()
    remaining = MAX_FAILED_ATTEMPTS - len(attempts)
    return False, f"Invalid credentials. {remaining} attempt(s) remaining before account lockout."


def unlock_user(username: str) -> bool:
    """Administrator unlock function to clear lockout for a user."""
    _load_persistent_lockout()
    cleared = False
    if username in _LOCKED_UNTIL:
        _LOCKED_UNTIL.pop(username, None)
        cleared = True
    if username in _FAILED_ATTEMPTS:
        _FAILED_ATTEMPTS.pop(username, None)
        cleared = True
    _save_persistent_lockout()
    return cleared
