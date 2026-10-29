@echo off
title TrailVault Enterprise Launcher
cd /d "%~dp0"

if exist "%~dp0TrailVault.exe" (
    start "" "%~dp0TrailVault.exe"
    exit /b 0
)

echo [TrailVault] Starting Sovereign Appliance Engine...
start "" python services\live_appliance_server.py
timeout /t 5 /nobreak >nul
start "" "http://127.0.0.1:8000/app/index.html"
exit /b 0
