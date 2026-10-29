#!/usr/bin/env python3
"""
TrailVault(TM) Enterprise - Sovereign Identity Administration CLI
NIST SP 800-63B User Management, Password Rotation, and Account Provisioning.
"""

import argparse
import json
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from services.auth_store import (
    initialize_default_identities_if_empty,
    load_auth_store,
    save_auth_store,
)
from services.security_crypto import hash_password


def list_users():
    users = load_auth_store()
    print(f"Total provisioned sovereign identities: {len(users)}\n")
    print(f"{'Username':<20} {'Role':<18} {'Clearance':<12} {'Citizenship':<12} {'Revoked':<8}")
    print("-" * 74)
    for u in users.values():
        print(f"{u['username']:<20} {u['role']:<18} {u['clearance']:<12} {u['citizenship']:<12} {str(u.get('is_revoked', False)):<8}")


def set_password(username: str, password: str):
    users = load_auth_store()
    if username not in users:
        print(f"Error: User '{username}' does not exist.")
        sys.exit(1)
    if len(password) < 12:
        print("Error: Password must be at least 12 characters.")
        sys.exit(1)

    salt_hex, hash_hex = hash_password(password)
    users[username]["password_salt"] = salt_hex
    users[username]["password_hash"] = hash_hex
    users[username]["must_change_password"] = False
    save_auth_store(users)
    print(f"[SUCCESS] Password for '{username}' updated and salted with PBKDF2-HMAC-SHA256 (600,000 rounds).")


def main():
    parser = argparse.ArgumentParser(description="TrailVault Identity Provisioning CLI")
    parser.add_argument("--init", action="store_true", help="Initialize sovereign identities if store is empty")
    parser.add_argument("--list", action="store_true", help="List provisioned users")
    parser.add_argument("--user", type=str, help="Username to update")
    parser.add_argument("--password", type=str, help="New password for user")
    args = parser.parse_args()

    if args.init:
        initialize_default_identities_if_empty()
        print("Sovereign identity store initialized.")
    elif args.list:
        list_users()
    elif args.user and args.password:
        set_password(args.user, args.password)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
