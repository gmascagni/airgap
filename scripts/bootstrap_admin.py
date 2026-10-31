#!/usr/bin/env python3
"""
TrailVault(TM) Enterprise - Sovereign Identity Administration CLI
NIST SP 800-63B User Management, Password Rotation, Account Provisioning, and Lockout Recovery.
No default passwords ship in source or binaries.
"""

import argparse
import getpass
import json
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from services.auth_store import (
    create_user_account,
    enroll_initial_admin,
    is_setup_needed,
    load_auth_store,
    save_auth_store,
    update_user_password,
)
from services.security_crypto import hash_password, unlock_user


def list_users():
    if is_setup_needed():
        print("[NOTICE] Appliance identity store is uninitialized. Run with --enroll-admin to create the initial administrator.")
        return

    try:
        users = load_auth_store()
    except RuntimeError as exc:
        print(f"[SECURITY ALERT] {exc}")
        sys.exit(1)

    print(f"Total provisioned sovereign identities: {len(users)}\n")
    print(f"{'Username':<20} {'Role':<18} {'Clearance':<12} {'MustChange':<12} {'Revoked':<8}")
    print("-" * 74)
    for u in users.values():
        must_chg = str(u.get("must_change_password", False))
        is_rev = str(u.get("is_revoked", False))
        print(f"{u['username']:<20} {u['role']:<18} {u['clearance']:<12} {must_chg:<12} {is_rev:<8}")


def enroll_admin_interactive(username: str, password: str, display_name: str):
    if not is_setup_needed():
        print("[ERROR] Sovereign administrator has already been enrolled. Use --change-password or --create-user.")
        sys.exit(1)

    if not username:
        username = input("Enter new administrator username: ").strip()
    if not password:
        password = getpass.getpass("Enter administrator password (min 14 chars): ").strip()
        confirm = getpass.getpass("Confirm password: ").strip()
        if password != confirm:
            print("[ERROR] Passwords do not match.")
            sys.exit(1)

    success, err = enroll_initial_admin(username, password, display_name)
    if not success:
        print(f"[ERROR] {err}")
        sys.exit(1)
    print(f"[SUCCESS] Initial administrator '{username}' provisioned and cryptographically signed.")


def set_user_password(username: str, new_password: str):
    try:
        users = load_auth_store()
    except RuntimeError as exc:
        print(f"[SECURITY ALERT] {exc}")
        sys.exit(1)

    if username not in users:
        print(f"Error: User '{username}' does not exist.")
        sys.exit(1)

    if not new_password:
        new_password = getpass.getpass(f"Enter new password for '{username}' (min 14 chars): ").strip()

    if len(new_password) < 14:
        print("Error: Password must be at least 14 characters (NIST SP 800-63B standard).")
        sys.exit(1)

    salt_hex, hash_hex = hash_password(new_password)
    users[username]["password_salt"] = salt_hex
    users[username]["password_hash"] = hash_hex
    users[username]["must_change_password"] = False
    save_auth_store(users)
    print(f"[SUCCESS] Password for '{username}' updated with PBKDF2-HMAC-SHA256 (600,000 rounds) and re-signed.")


def unlock_account(username: str):
    cleared = unlock_user(username)
    if cleared:
        print(f"[SUCCESS] Account lockout cleared for user '{username}'.")
    else:
        print(f"[INFO] User '{username}' was not currently locked.")


def main():
    parser = argparse.ArgumentParser(description="TrailVault Identity Provisioning & Security Administration CLI")
    parser.add_argument("--enroll-admin", action="store_true", help="Enroll initial administrator (first-run setup)")
    parser.add_argument("--list", action="store_true", help="List provisioned users")
    parser.add_argument("--user", type=str, help="Username to configure")
    parser.add_argument("--password", type=str, help="Password for user (use interactive prompt if omitted)")
    parser.add_argument("--display-name", type=str, default="Lead Security Administrator", help="Display name for account")
    parser.add_argument("--unlock", type=str, help="Username to unlock from failed login lockout")
    args = parser.parse_args()

    if args.enroll_admin:
        enroll_admin_interactive(args.user or "lead_analyst", args.password, args.display_name)
    elif args.unlock:
        unlock_account(args.unlock)
    elif args.list:
        list_users()
    elif args.user and args.password:
        set_user_password(args.user, args.password)
    elif args.user:
        set_user_password(args.user, "")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
