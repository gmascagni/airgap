@echo off
title TrailVault - NIST SP 800-88 Rev 1 NVMe Cryptographic Erase
color 0C

echo ==============================================================================
echo   TRAILVAULT(TM) // NIST SP 800-88 Rev 1 NVMe CRYPTOGRAPHIC ERASE
echo   Hardware Flash Sanitization via Volume Key Destruction (CE)
echo ==============================================================================
echo.
echo WARNING: This will permanently sanitize all data on the TrailVault NVMe drive.
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\nvme_cryptographic_erase.ps1"
echo.
pause
