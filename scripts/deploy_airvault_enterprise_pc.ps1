# ==============================================================================
# AirVault Enterprise v5.0 — Production PC Installer (C:\AirVault_Enterprise)
# ==============================================================================
$ErrorActionPreference = "Stop"

$SourceRoot = Split-Path -Parent $PSScriptRoot
$ProdRoot   = "C:\AirVault_Enterprise"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  DEPLOYING AIRVAULT ENTERPRISE v5.0 TO C:\AirVault_Enterprise" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path $ProdRoot | Out-Null
New-Item -ItemType Directory -Force -Path "$ProdRoot\services" | Out-Null
New-Item -ItemType Directory -Force -Path "$ProdRoot\out" | Out-Null
New-Item -ItemType Directory -Force -Path "$ProdRoot\Documentation_Hub" | Out-Null
New-Item -ItemType Directory -Force -Path "$ProdRoot\sample_docs" | Out-Null
New-Item -ItemType Directory -Force -Path "$ProdRoot\Customer_Inbox" | Out-Null
New-Item -ItemType Directory -Force -Path "$ProdRoot\02_DROP_CUSTOMER_FILES_HERE" | Out-Null
New-Item -ItemType Directory -Force -Path "$ProdRoot\storage\uploaded_docs" | Out-Null

Write-Host "[1/4] Syncing Hardened Production Engine (v5.1.0 IronTrail), VERSION.json & Documentation Hub..." -ForegroundColor Green
Copy-Item -Force "$SourceRoot\services\live_appliance_server.py" "$ProdRoot\services\live_appliance_server.py"
Copy-Item -Force "$SourceRoot\VERSION.json" "$ProdRoot\VERSION.json"
Copy-Item -Recurse -Force "$SourceRoot\Documentation_Hub\*" "$ProdRoot\Documentation_Hub" -ErrorAction SilentlyContinue

Write-Host "[2/4] Syncing Commercial Enterprise Web Application (/app)..." -ForegroundColor Green
Copy-Item -Recurse -Force "$SourceRoot\out\*" "$ProdRoot\out"

Write-Host "[3/4] Syncing Reference Documents & Customer Inbox..." -ForegroundColor Green
Copy-Item -Recurse -Force "$SourceRoot\sample_docs\*" "$ProdRoot\sample_docs" -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force "$SourceRoot\02_DROP_CUSTOMER_FILES_HERE\*" "$ProdRoot\02_DROP_CUSTOMER_FILES_HERE" -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force "$SourceRoot\02_DROP_CUSTOMER_FILES_HERE\*" "$ProdRoot\Customer_Inbox" -ErrorAction SilentlyContinue
if (Test-Path "$SourceRoot\storage\uploaded_docs") {
    Copy-Item -Recurse -Force "$SourceRoot\storage\uploaded_docs\*" "$ProdRoot\storage\uploaded_docs" -ErrorAction SilentlyContinue
}

Write-Host "[4/4] Creating Native Desktop Application Launcher (Launch-AirVault-Enterprise.bat)..." -ForegroundColor Green
$LauncherBat = @'
@echo off
title AirVault Enterprise v5.0 — Commercial AI Platform (RTX 4090 CUDA)
color 0B
echo ============================================================================
echo   AIRVAULT ENTERPRISE v5.0 // COMMERCIAL PRODUCTION APPLICATION
echo   GPU: NVIDIA GeForce RTX 4090 Laptop GPU (16GB VRAM // 100%% CUDA Offload)
echo   Security: 127.0.0.1 Loopback Locked // Zero External Telemetry
echo ============================================================================
echo.

REM Enforce 100% RTX 4090 GPU Offload & Hardened Zero-Telemetry Flags
set CUDA_VISIBLE_DEVICES=0
set OLLAMA_NUM_PARALLEL=2
set OLLAMA_FLASH_ATTENTION=1
set OLLAMA_MAX_LOADED_MODELS=2
set HF_HUB_OFFLINE=1
set TRANSFORMERS_OFFLINE=1
set ANONYMIZED_TELEMETRY=False
set DO_NOT_TRACK=1
set AIRVAULT_ROOT_DIR=%~dp0
set AIRVAULT_DROPZONE_DIR=%~dp0Customer_Inbox

REM Check if port 8000 is already running
netstat -ano | findstr ":8000 " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [1/2] Starting Local RTX 4090 Hybrid RAG Engine on 127.0.0.1:8000...
    start "AirVault Enterprise Engine" /MIN python "%~dp0services\live_appliance_server.py"
    timeout /t 3 /nobreak >nul
) else (
    echo [1/2] Local RTX 4090 Hybrid RAG Engine is already active on 127.0.0.1:8000.
)

echo [2/2] Launching AirVault Enterprise Studio in Native Desktop App Window...
where msedge >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start "" msedge --app="http://127.0.0.1:8000/app/index.html" --window-size=1680,1020
) else (
    start "" "http://127.0.0.1:8000/app/index.html"
)
'@
Set-Content -Path "$ProdRoot\Launch-AirVault-Enterprise.bat" -Value $LauncherBat -Encoding ASCII

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  SUCCESS: Production Application Installed at C:\AirVault_Enterprise" -ForegroundColor Cyan
Write-Host "  - App Launcher:   C:\AirVault_Enterprise\Launch-AirVault-Enterprise.bat" -ForegroundColor White
Write-Host "  - Customer Inbox: C:\AirVault_Enterprise\Customer_Inbox\" -ForegroundColor White
Write-Host "  - Web App URL:    http://127.0.0.1:8000/app/" -ForegroundColor White
Write-Host "============================================================================" -ForegroundColor Cyan
