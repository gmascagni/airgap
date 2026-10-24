<#
.SYNOPSIS
  Stages the AirVault (Air GAP) Appliance and Portable Demo onto an External USB NVMe SSD.

.EXAMPLE
  .\scripts\stage-usb-drive.ps1 -UsbDrive "E:"
  .\scripts\stage-usb-drive.ps1 -UsbDrive "E:" -DownloadModels
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$UsbDrive,

    [switch]$DownloadModels
)

$ErrorActionPreference = "Stop"

# Normalize drive path (e.g. "E:" -> "E:\AirGap")
$CleanDrive = $UsbDrive.TrimEnd('\', '/')
$TargetRoot = Join-Path $CleanDrive "AirGap"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " AIRVAULT (AIR GAP) - PORTABLE USB NVMe STAGING UTILITY" -ForegroundColor Cyan
Write-Host " Target USB Path: $TargetRoot" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Create Portable Directory Hierarchy on USB SSD
$Dirs = @(
    $TargetRoot,
    (Join-Path $TargetRoot "storage\qdrant_data"),
    (Join-Path $TargetRoot "storage\opensearch_data"),
    (Join-Path $TargetRoot "storage\redis_data"),
    (Join-Path $TargetRoot "storage\documents"),
    (Join-Path $TargetRoot "storage\artifacts"),
    (Join-Path $TargetRoot "models\llm"),
    (Join-Path $TargetRoot "models\embedding"),
    (Join-Path $TargetRoot "models\reranker"),
    (Join-Path $TargetRoot "models\docling")
)

foreach ($d in $Dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Force -Path $d | Out-Null
    }
}
Write-Host "[1/4] Created storage and model weight directories on $TargetRoot" -ForegroundColor Green

# 2. Copy Project Files & Static Demo Bundle (/out) to USB Drive
$SourceRoot = Split-Path -Parent $PSScriptRoot
$ItemsToCopy = @(
    "docker-compose.yml",
    "Dockerfile.backend",
    "requirements.txt",
    ".env.example",
    "README.md",
    "USB_DEPLOYMENT_GUIDE.md",
    "Launch-AirGap-Demo.bat",
    "services",
    "out",
    "ui"
)

foreach ($item in $ItemsToCopy) {
    $src = Join-Path $SourceRoot $item
    $dst = Join-Path $TargetRoot $item
    if (Test-Path $src) {
        if ($item -eq "ui") {
            # Copy UI source excluding node_modules/.next to keep USB transfer fast
            New-Item -ItemType Directory -Force -Path $dst | Out-Null
            Get-ChildItem -Path $src -Exclude "node_modules", ".next" | Copy-Item -Destination $dst -Recurse -Force
        } else {
            Copy-Item -Path $src -Destination $dst -Recurse -Force
        }
    }
}
Write-Host "[2/4] Copied AirVault stack, services, and static UI bundle to USB drive." -ForegroundColor Green

# 3. Generate Portable .env File Pointing to USB Drive Paths
$PortableForwardSlash = $TargetRoot.Replace('\', '/')
$EnvTemplate = Get-Content (Join-Path $SourceRoot ".env.example") -Raw
$EnvConfigured = $EnvTemplate `
    -replace "STORAGE_ROOT=\./storage", "STORAGE_ROOT=$PortableForwardSlash/storage" `
    -replace "MODELS_ROOT=\./models", "MODELS_ROOT=$PortableForwardSlash/models"

Set-Content -Path (Join-Path $TargetRoot ".env") -Value $EnvConfigured -Encoding UTF8
Set-Content -Path (Join-Path $SourceRoot ".env") -Value $EnvConfigured -Encoding UTF8
Write-Host "[3/4] Generated .env configured for portable USB paths ($PortableForwardSlash)." -ForegroundColor Green

# 4. Optional: Pre-download Open-Weight HuggingFace Models to USB Drive (Requires Internet before Air-Gapping)
if ($DownloadModels) {
    Write-Host "[4/4] Downloading open-weight models to USB SSD (Qwen 2.5 14B AWQ, BGE-Large, BGE-Reranker)..." -ForegroundColor Yellow
    python -m pip install --upgrade huggingface_hub
    huggingface-cli download Qwen/Qwen2.5-14B-Instruct-AWQ --local-dir "$TargetRoot\models\llm\Qwen2.5-14B-Instruct-AWQ"
    huggingface-cli download BAAI/bge-large-en-v1.5 --local-dir "$TargetRoot\models\embedding\bge-large-en-v1.5"
    huggingface-cli download BAAI/bge-reranker-large --local-dir "$TargetRoot\models\reranker\bge-reranker-large"
    Write-Host "All model weights staged on USB SSD!" -ForegroundColor Green
} else {
    Write-Host "[4/4] Skipped model weight download (pass -DownloadModels to pull ~12GB of HuggingFace weights to USB)." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "USB Staging Complete! You can now run '$TargetRoot\Launch-AirGap-Demo.bat' or 'docker compose up -d' from $TargetRoot." -ForegroundColor Green
