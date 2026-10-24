@echo off
title AirVault (Air GAP) - Local Demo Launcher
echo ============================================================================
echo   AIRVAULT (AIR GAP) - PORTABLE DEMO LAUNCHER
echo   Directory: %~dp0
echo ============================================================================
echo.
echo [1/2] Starting local static showcase & interactive dual-pane UI on port 3000...
start "" "http://localhost:3000"
npx.cmd --yes serve@latest "%~dp0out" -l 3000
pause
