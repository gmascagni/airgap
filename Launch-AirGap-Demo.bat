@echo off
title AirVault (Air GAP) - Local Demo Launcher
echo ============================================================================
echo   AIRVAULT (AIR GAP) - PORTABLE DEMO LAUNCHER
echo   Directory: %~dp0
echo   Zero-Internet Offline Local Static Server (Python 3)
echo ============================================================================
echo.
echo [1/2] Starting local static showcase & interactive dual-pane UI on port 3000...
start "" "http://localhost:3000"
python -m http.server 3000 --directory "%~dp0out"
pause
