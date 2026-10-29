# ==============================================================================
# TrailVault(TM) Enterprise v5.1.0 (IronTrail) - Production Release Packager
# NIST SP 800-161 Supply-Chain & Release Hygiene (N-13 Remediation)
# ==============================================================================

param(
    [string]$OutputDir = "release_dist",
    [string]$Version = "5.1.0"
)

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $PSScriptRoot

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  TRAILVAULT(TM) // ENTERPRISE RELEASE PACKAGER (v$Version)" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

$ReleaseDir = Join-Path $RootDir $OutputDir
if (Test-Path $ReleaseDir) {
    Remove-Item -Path $ReleaseDir -Recurse -Force
}
New-Item -ItemType Directory -Path $ReleaseDir -Force | Out-Null

$StagingDir = Join-Path $ReleaseDir "TrailVault-Enterprise-v$Version"
New-Item -ItemType Directory -Path $StagingDir -Force | Out-Null

Write-Host "[1/4] Copying audited runtime artifacts..." -ForegroundColor Green
$IncludePaths = @(
    "services",
    "out",
    "sample_docs",
    "02_DROP_CUSTOMER_FILES_HERE",
    "models",
    "scripts",
    "Documentation_Hub",
    "requirements.txt",
    "requirements.lock",
    "TrailVault.exe",
    "01_CLICK_TO_START_TRAILVAULT.bat",
    "02_DROP_CUSTOMER_FILES_HERE",
    "03_NIST_800_88_CRYPTOGRAPHIC_ERASE.bat",
    "README.md",
    "LICENSE"
)

foreach ($item in $IncludePaths) {
    $src = Join-Path $RootDir $item
    if (Test-Path $src) {
        $dest = Join-Path $StagingDir $item
        if ((Get-Item $src).PSIsContainer) {
            Copy-Item -Path $src -Destination $dest -Recurse -Force
        } else {
            Copy-Item -Path $src -Destination $dest -Force
        }
    }
}

Write-Host "[2/4] Sanitizing release directory (removing pycache, tests, git artifacts)..." -ForegroundColor Green
Get-ChildItem -Path $StagingDir -Recurse -Filter "__pycache__" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path $StagingDir -Recurse -Filter "*.pyc" | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path $StagingDir -Recurse -Filter "*.tmp" | Remove-Item -Force -ErrorAction SilentlyContinue

Write-Host "[3/4] Generating cryptographic SHA-256 manifest (SHA256SUMS.txt)..." -ForegroundColor Green
$Files = Get-ChildItem -Path $StagingDir -Recurse -File
$Sha256 = [System.Security.Cryptography.SHA256]::Create()
$ManifestLines = @()

foreach ($file in $Files) {
    $RelativePath = $file.FullName.Substring($StagingDir.Length).TrimStart('\', '/')
    $FileBytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $HashBytes = $Sha256.ComputeHash($FileBytes)
    $HashStr = -join ($HashBytes | ForEach-Object { "{0:x2}" -f $_ })
    $ManifestLines += "$HashStr  $RelativePath"
}

$ManifestPath = Join-Path $StagingDir "SHA256SUMS.txt"
[System.IO.File]::WriteAllLines($ManifestPath, $ManifestLines)
Write-Host "  Hashed $($Files.Count) release artifacts into SHA256SUMS.txt." -ForegroundColor White

Write-Host "[4/4] Creating distribution archive..." -ForegroundColor Green
$ZipPath = Join-Path $ReleaseDir "TrailVault-Enterprise-v$Version-AirGap.zip"
if (Test-Path $ZipPath) {
    Remove-Item -Path $ZipPath -Force
}
[System.IO.Compression.ZipFile]::CreateFromDirectory($StagingDir, $ZipPath)

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  RELEASE PACKAGE CREATED SUCCESSFULLY" -ForegroundColor Green
Write-Host "  Archive: $ZipPath" -ForegroundColor White
Write-Host "  Size:    $([math]::Round((Get-Item $ZipPath).Length / 1MB, 2)) MB" -ForegroundColor White
Write-Host "============================================================================" -ForegroundColor Cyan
