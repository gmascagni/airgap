@echo off
title TrailVault Enterprise Launcher
if exist "%~dp0TrailVault.exe" (
    start "" "%~dp0TrailVault.exe"
    exit /b 0
)
start "" "http://127.0.0.1:8000/app/index.html"
exit /b 0
