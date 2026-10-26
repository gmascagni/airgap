<#
.SYNOPSIS
    AirVault (AirGap) - USB4 / NVMe Appliance Staging & Drive Packager
.DESCRIPTION
    1. Builds the complete, self-contained portable appliance image inside:
       `C:\Users\gmasc\Documents\Antigravity\AirGap\USB4_Appliance_Stage\`
    2. When your USB4 NVMe drive arrives, pass `-TargetDrive "E:\"` (or run
       `Publish-To-USB4-Drive.bat`) to clone the staged appliance + optional
       local Ollama LLM/embedding weights onto the removable USB4 drive.
#>

param(
    [string]$TargetDrive = "",
    [switch]$IncludeOllamaModels = $false
)

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $PSScriptRoot
$StageDir = Join-Path $RootDir "USB4_Appliance_Stage"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  AIRVAULT (AIR GAP) // USB4 NVMe APPLIANCE STAGER & PACKAGER" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

# 1. Create clean staging directory hierarchy on C:\
$Folders = @(
    $StageDir,
    (Join-Path $StageDir "02_DROP_CUSTOMER_FILES_HERE"),
    (Join-Path $StageDir "sample_docs"),
    (Join-Path $StageDir "services"),
    (Join-Path $StageDir "out"),
    (Join-Path $StageDir "storage\qdrant_live_db"),
    (Join-Path $StageDir "storage\uploaded_docs"),
    (Join-Path $StageDir "models\ollama")
)

foreach ($f in $Folders) {
    if (-not (Test-Path $f)) {
        New-Item -ItemType Directory -Path $f -Force | Out-Null
    }
}

Write-Host "[1/5] Syncing compiled Web UI, 25 Studio Audio MP3s, and Live Workbench..." -ForegroundColor Green
Copy-Item -Path (Join-Path $RootDir "out\*") -Destination (Join-Path $StageDir "out") -Recurse -Force

Write-Host "[2/5] Syncing Multi-Format FastAPI + Qdrant + BM25 Appliance Engine..." -ForegroundColor Green
Copy-Item -Path (Join-Path $RootDir "services\*") -Destination (Join-Path $StageDir "services") -Recurse -Force
Copy-Item -Path (Join-Path $RootDir "requirements.txt") -Destination (Join-Path $StageDir "requirements.txt") -Force

Write-Host "[3/5] Syncing Baseline Technical PDFs & Multi-Format Dropzone Samples..." -ForegroundColor Green
Copy-Item -Path (Join-Path $RootDir "sample_docs\*") -Destination (Join-Path $StageDir "sample_docs") -Recurse -Force
Copy-Item -Path (Join-Path $RootDir "02_DROP_CUSTOMER_FILES_HERE\*") -Destination (Join-Path $StageDir "02_DROP_CUSTOMER_FILES_HERE") -Recurse -Force

Write-Host "[4/5] Creating Drive-Relative USB4 Appliance Launchers..." -ForegroundColor Green

# 01_Start_AirVault_Appliance.bat (Runs relative to whatever drive letter USB4 mounts as)
$StartBatContent = @'
@echo off
title AirVault (AirGap) - Portable USB4 AI Appliance Runtime
color 0B

set "APPLIANCE_ROOT=%~dp0"
if "%APPLIANCE_ROOT:~-1%"=="\" set "APPLIANCE_ROOT=%APPLIANCE_ROOT:~0,-1%"

set "AIRVAULT_ROOT_DIR=%APPLIANCE_ROOT%"
set "AIRVAULT_DROPZONE_DIR=%APPLIANCE_ROOT%\02_DROP_CUSTOMER_FILES_HERE"

if exist "%APPLIANCE_ROOT%\models\ollama\manifests" (
    set "OLLAMA_MODELS=%APPLIANCE_ROOT%\models\ollama"
)

echo ====================================================================================
echo   AIRVAULT (AIR GAP) // PORTABLE USB4 AI APPLIANCE
echo   Running from Drive Path: %APPLIANCE_ROOT%
echo   Customer Dropzone Path:  %AIRVAULT_DROPZONE_DIR%
echo ====================================================================================
echo.
echo [1/3] Checking Local Ollama GPU/CPU Inference Service...
ollama list >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    start "Ollama Service" /MIN ollama serve
    timeout /t 3 /nobreak >nul
)
echo       [OK] Inference Service Active.

echo.
echo [2/3] Launching AirVault Multi-Format Hybrid RAG Server (Port 8000)...
start "AirVault USB4 RAG Engine (Port 8000)" cmd /k "cd /d "%APPLIANCE_ROOT%" && python services/live_appliance_server.py"
timeout /t 4 /nobreak >nul

echo.
echo [3/3] Launching AirVault Web Showcase ^& Live Workbench (Port 3000)...
start "" "http://localhost:3000/#live-video-demo"
python -m http.server 3000 --directory "%APPLIANCE_ROOT%\out"
pause
'@
Set-Content -Path (Join-Path $StageDir "01_Start_AirVault_Appliance.bat") -Value $StartBatContent -Encoding ASCII

# 03_Install_To_Customer_POC_Server.bat (1-click bare-metal POC installer from USB4 drive to a customer server)
$InstallPocBatContent = @'
@echo off
title AirVault (AirGap) - Bare-Metal Customer POC Server Installer
color 0A

echo ====================================================================================
echo   AIRVAULT (AIR GAP) // 1-CLICK CUSTOMER POC SERVER INSTALLER
echo ====================================================================================
echo.
set "TARGET_POC_DIR=C:\AirVault_POC_Appliance"
echo Copying self-contained AirVault POC stack from USB4 drive to %TARGET_POC_DIR% ...
robocopy "%~dp0" "%TARGET_POC_DIR%" /E /XD ".git" "node_modules" /NFL /NDL /NJH /NJS
echo.
echo [OK] AirVault POC Appliance installed to %TARGET_POC_DIR%
echo Launching %TARGET_POC_DIR%\01_Start_AirVault_Appliance.bat ...
start "" "%TARGET_POC_DIR%\01_Start_AirVault_Appliance.bat"
pause
'@
Set-Content -Path (Join-Path $StageDir "03_Install_To_Customer_POC_Server.bat") -Value $InstallPocBatContent -Encoding ASCII

Write-Host "[5/5] Staging Complete at: $StageDir" -ForegroundColor Cyan

# Optional: Copy to External USB4 Drive if -TargetDrive is specified
if ($TargetDrive -ne "") {
    $DestPath = Join-Path $TargetDrive "AirVault_Appliance"
    Write-Host ""
    Write-Host "Cloning staged appliance to USB4 Drive: $DestPath ..." -ForegroundColor Yellow
    robocopy $StageDir $DestPath /E /MT:8 /NJH /NJS

    if ($IncludeOllamaModels) {
        $UserOllamaModels = Join-Path $env:USERPROFILE ".ollama\models"
        if (Test-Path $UserOllamaModels) {
            Write-Host "Copying local Ollama LLM & BGE-Large weights to USB4 drive..." -ForegroundColor Yellow
            robocopy $UserOllamaModels (Join-Path $DestPath "models\ollama") /E /MT:8
        }
    }
    Write-Host "[SUCCESS] USB4 Drive is ready at: $DestPath" -ForegroundColor Green
}
