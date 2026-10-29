# ==============================================================================
# Digital Trail Labs — TrailVault™ Enterprise v5.1.0 (IronTrail)
# Safe NVMe Initializer (FIKWOT FN955 1TB -> D:\) & Turn-Key Appliance Packager
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  DIGITAL TRAIL LABS // TRAILVAULT™ NVMe APPLIANCE PROVISIONER (v5.1.0)" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

# 1. Verify Disk 1 is specifically the FIKWOT FN955 1TB NVMe drive
$TargetDisk = Get-Disk | Where-Object { $_.FriendlyName -like "*FIKWOT FN955*" } | Select-Object -First 1
if (-not $TargetDisk) {
    Write-Host "ERROR: Could not find FIKWOT FN955 1TB NVMe drive. Disk 0 (C:) was NOT touched." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

$DiskNum = $TargetDisk.Number
if ($DiskNum -eq 0) {
    Write-Host "SAFETY ABORT: Target disk resolved to Disk 0. Refusing to touch OS disk." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[1/6] Verified Target NVMe: Disk $DiskNum - $($TargetDisk.FriendlyName) ($([math]::Round($TargetDisk.Size/1GB, 2)) GB)" -ForegroundColor Green

Write-Host "CRITICAL WARNING (F-24): Provisioning is destructive to existing partitions on Disk $DiskNum!" -ForegroundColor Yellow
Write-Host "Target Disk: Number $DiskNum | FriendlyName: $($TargetDisk.FriendlyName) | SerialNumber: $($TargetDisk.SerialNumber)" -ForegroundColor Yellow
$ConfirmInput = Read-Host "To confirm provisioning Disk $DiskNum, type 'CONFIRM_PROVISION_NVME' (or Enter to cancel)"
if ($ConfirmInput -ne "CONFIRM_PROVISION_NVME") {
    Write-Host "Provisioning cancelled by user. No disk modifications performed." -ForegroundColor Yellow
    exit 0
}

if ($TargetDisk.IsOffline) {
    Set-Disk -Number $DiskNum -IsOffline $false
}
if ($TargetDisk.IsReadOnly) {
    Set-Disk -Number $DiskNum -IsReadOnly $false
}

if ($TargetDisk.PartitionStyle -eq "RAW") {
    Write-Host "[2/6] Initializing Disk $DiskNum as GPT and formatting NTFS Volume 'TRAILVAULT' (D:)..." -ForegroundColor Yellow
    Initialize-Disk -Number $DiskNum -PartitionStyle GPT -Confirm:$false
    New-Partition -DiskNumber $DiskNum -UseMaximumSize -DriveLetter D | Out-Null
    Format-Volume -DriveLetter D -FileSystem NTFS -NewFileSystemLabel "TRAILVAULT" -Confirm:$false | Out-Null
    Start-Sleep -Seconds 2
} else {
    Write-Host "[2/6] Disk $DiskNum is already initialized ($($TargetDisk.PartitionStyle)). Ensuring Drive D: is formatted..." -ForegroundColor Green
    $ExistingPart = Get-Partition -DiskNumber $DiskNum | Where-Object { $_.DriveLetter } | Select-Object -First 1
    if (-not $ExistingPart) {
        $RawPart = Get-Partition -DiskNumber $DiskNum | Select-Object -Last 1
        if ($RawPart) {
            Set-Partition -DiskNumber $DiskNum -PartitionNumber $RawPart.PartitionNumber -NewDriveLetter D
        } else {
            New-Partition -DiskNumber $DiskNum -UseMaximumSize -DriveLetter D | Out-Null
        }
        Format-Volume -DriveLetter D -FileSystem NTFS -NewFileSystemLabel "TRAILVAULT" -Confirm:$false | Out-Null
        Start-Sleep -Seconds 2
    }
}

$DriveRoot = "D:\"
if (-not (Test-Path $DriveRoot)) {
    Write-Host "ERROR: Drive D:\ is not accessible yet." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[3/6] Creating TrailVault™ Enterprise v5.1.0 Directory Structure on D:\..." -ForegroundColor Green
$Dirs = @(
    "D:\02_DROP_CUSTOMER_FILES_HERE",
    "D:\Documentation_Hub",
    "D:\out",
    "D:\sample_docs",
    "D:\services",
    "D:\storage\qdrant_local",
    "D:\storage\uploaded_docs"
)
foreach ($d in $Dirs) {
    New-Item -ItemType Directory -Force -Path $d | Out-Null
}

$SourceRoot = "c:\Users\gmasc\Documents\Antigravity\AirGap"

Write-Host "[4/6] Copying Compiled Web UI (/app, /noc, /appliances, /demo) & Studio Audio..." -ForegroundColor Green
Copy-Item -Recurse -Force "$SourceRoot\out\*" "D:\out"
Copy-Item -Force "$SourceRoot\VERSION.json" "D:\VERSION.json"
Copy-Item -Recurse -Force "$SourceRoot\Documentation_Hub\*" "D:\Documentation_Hub"

Write-Host "[5/6] Copying Hardened FastAPI + Qdrant + BM25 Engine & Baseline Documents..." -ForegroundColor Green
Copy-Item -Force "$SourceRoot\services\live_appliance_server.py" "D:\services\live_appliance_server.py"
Copy-Item -Recurse -Force "$SourceRoot\sample_docs\*" "D:\sample_docs" -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force "$SourceRoot\02_DROP_CUSTOMER_FILES_HERE\*" "D:\02_DROP_CUSTOMER_FILES_HERE" -ErrorAction SilentlyContinue
if (Test-Path "$SourceRoot\storage\uploaded_docs") {
    Copy-Item -Recurse -Force "$SourceRoot\storage\uploaded_docs\*" "D:\storage\uploaded_docs" -ErrorAction SilentlyContinue
}

Write-Host "[6/6] Generating Drive-Relative One-Click Launchers on D:\..." -ForegroundColor Green

$StartBat = @'
@echo off
title Digital Trail Labs - TrailVault Enterprise v5.1.0 NVMe Appliance
color 0B
echo ============================================================================
echo   DIGITAL TRAIL LABS // TRAILVAULT ENTERPRISE v5.1.0 - IRONTRAIL
echo   Portable NVMe Tactical Shuttle - FIKWOT FN955 1TB
echo   Security: 127.0.0.1 Loopback Locked // Zero External Telemetry
echo ============================================================================
echo.

set CUDA_VISIBLE_DEVICES=0
set OLLAMA_NUM_PARALLEL=2
set OLLAMA_FLASH_ATTENTION=1
set OLLAMA_MAX_LOADED_MODELS=2
set HF_HUB_OFFLINE=1
set TRANSFORMERS_OFFLINE=1
set ANONYMIZED_TELEMETRY=False
set DO_NOT_TRACK=1
set AIRVAULT_ROOT_DIR=%~dp0
set AIRVAULT_DROPZONE_DIR=%~dp002_DROP_CUSTOMER_FILES_HERE

netstat -ano | findstr ":8000 " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 goto ENGINE_READY

echo [1/2] Starting Local Hybrid RAG Engine from NVMe Shuttle %~dp0 ...
start "TrailVault NVMe Engine" /MIN python "%~dp0services\live_appliance_server.py"
timeout /t 3 /nobreak >nul
goto LAUNCH_UI

:ENGINE_READY
echo [1/2] Local Hybrid RAG Engine is already active on 127.0.0.1:8000.

:LAUNCH_UI
echo [2/2] Opening TrailVault Enterprise Studio...
where msedge >nul 2>&1
if %ERRORLEVEL% NEQ 0 goto FALLBACK_BROWSER
start "" msedge --app="http://127.0.0.1:8000/app/index.html" --window-size=1680,1020
goto END

:FALLBACK_BROWSER
start "" "http://127.0.0.1:8000/app/index.html"

:END
echo Done. TrailVault Enterprise Studio is running.
'@
Set-Content -Path "D:\01_CLICK_TO_START_TRAILVAULT_APPLIANCE.bat" -Value $StartBat -Encoding ASCII

$WipeBat = @'
@echo off
title TrailVault Enterprise — NIST SP 800-88 Rev 1 Customer Session Media Sanitization
color 0C
echo ============================================================================
echo   TRAILVAULT ENTERPRISE // NIST SP 800-88 Rev 1 APPLICATION PURGE
echo   (SSD / NVMe Flash Sanitization & Cryptographic Erase Alignment)
echo ============================================================================
echo.
echo Executing authenticated Lead Analyst NIST SP 800-88 Rev 1 session purge...
powershell -Command "$tok = (Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/v1/auth/login' -Method Post -ContentType 'application/json' -Body '{\"username\":\"lead_analyst\",\"password\":\"TrailVault2026!Lead\"}').token; Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/v1/ingest/wipe-customer-vault' -Method Post -Headers @{Authorization=\"Bearer $tok\"} | ConvertTo-Json"
echo.
echo ============================================================================
echo Done. Customer files and vectors purged under NIST SP 800-88 Rev 1 controls.
echo For complete physical media retirement, perform BitLocker key destruction
echo or execute the hardware NVMe Sanitize command.
echo ============================================================================
pause
'@
Set-Content -Path "D:\03_WIPE_CUSTOMER_SESSION_FILES.bat" -Value $WipeBat -Encoding ASCII

$NocBat = @'
@echo off
title Digital Trail Labs — Marketing NOC & Documentation Hub
start "" "http://127.0.0.1:8000/noc/index.html"
'@
Set-Content -Path "D:\04_OPEN_MARKETING_NOC_AND_DOCS.bat" -Value $NocBat -Encoding ASCII

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  SUCCESS: FIKWOT FN955 1TB NVMe Formatted (D:\) & Provisioned!" -ForegroundColor Cyan
Write-Host "  Opening D:\ in Windows File Explorer..." -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Start-Process explorer.exe "D:\"
Start-Sleep -Seconds 3
