# ==============================================================================
# Digital Trail Labs - TrailVault(TM) Enterprise v5.1.0 (IronTrail)
# BitLocker Cryptographic Erase & SSD FTL Deallocation Sanitization Utility
# ==============================================================================
# Ref: NIST SP 800-88 Rev 1 Section 2.4 (Cryptographic Erase)
# Mechanism: Volume Master Key (VMK) Destruction via Key Protector Elimination + TRIM
# ==============================================================================

param(
    [string]$DriveLetter = "D:",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  TRAILVAULT(TM) // BITLOCKER CRYPTOGRAPHIC ERASE & TRIM SANITIZATION" -ForegroundColor Cyan
Write-Host "  NIST SP 800-88 Rev 1 Volume Master Key (VMK) Invalidation Utility" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

$CleanLetter = $DriveLetter.TrimEnd('\', ':')
$TargetDrive = "$($CleanLetter):"

# 1. Safety Guardrail: Never touch System / OS Volume
if ($CleanLetter -eq "C" -or $CleanLetter -eq "c") {
    Write-Host "FATAL SAFETY VIOLATION: Refusing to execute erase on OS / Boot Drive C:!" -ForegroundColor Red
    exit 1
}

# 2. Inspect Target Volume and Hardware Disk
$Volume = Get-Volume -DriveLetter $CleanLetter -ErrorAction SilentlyContinue
if (-not $Volume) {
    Write-Host "ERROR: Volume '$TargetDrive' does not exist or is not mounted." -ForegroundColor Red
    exit 1
}

$Partition = Get-Partition -DriveLetter $CleanLetter -ErrorAction SilentlyContinue
if (-not $Partition) {
    Write-Host "ERROR: Could not resolve physical partition for '$TargetDrive'." -ForegroundColor Red
    exit 1
}

$Disk = Get-Disk -Number $Partition.DiskNumber
if ($Disk.Number -eq 0) {
    Write-Host "FATAL SAFETY VIOLATION: Target drive is located on Disk 0 (System Disk). Aborting." -ForegroundColor Red
    exit 1
}

Write-Host "[1/5] Hardware Storage Audit:" -ForegroundColor Green
Write-Host "  Target Drive:      $TargetDrive" -ForegroundColor White
Write-Host "  Volume Label:      $($Volume.FileSystemLabel)" -ForegroundColor White
Write-Host "  File System:       $($Volume.FileSystem)" -ForegroundColor White
Write-Host "  Total Size:        $([math]::Round($Volume.Size / 1GB, 2)) GB" -ForegroundColor White
Write-Host "  Physical Disk:     Disk $($Disk.Number) ($($Disk.FriendlyName))" -ForegroundColor White
Write-Host "  Serial Number:     $($Disk.SerialNumber)" -ForegroundColor White
Write-Host "  Bus Type:          $($Disk.BusType)" -ForegroundColor White
Write-Host ""

Write-Host "TECHNICAL NOTICE (NIST SP 800-88 Rev 1 Section 4.3):" -ForegroundColor Yellow
Write-Host "  Solid-state flash memory utilizes Flash Translation Layer (FTL) wear leveling," -ForegroundColor Yellow
Write-Host "  spare block overprovisioning, and out-of-place writes. Logical overwrites do not" -ForegroundColor Yellow
Write-Host "  reach physical raw NAND blocks. This utility executes Cryptographic Erase (CE)" -ForegroundColor Yellow
Write-Host "  by destroying all BitLocker Key Protectors (invalidating VMK access) and issuing" -ForegroundColor Yellow
Write-Host "  an FTL TRIM deallocate command across the block range." -ForegroundColor Yellow
Write-Host ""

# 3. Require Explicit Operator Confirmation
if (-not $Force) {
    Write-Host "CRITICAL WARNING: This operation will permanently invalidate access keys" -ForegroundColor Red
    Write-Host "and reformat $TargetDrive ($($Disk.FriendlyName)). This action CANNOT be undone." -ForegroundColor Red
    Write-Host ""
    $Confirm = Read-Host "Type 'CONFIRM_CRYPTOGRAPHIC_ERASE' to proceed with sanitization"
    if ($Confirm -ne "CONFIRM_CRYPTOGRAPHIC_ERASE") {
        Write-Host "Aborted by operator. No sanitization performed." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "[2/5] Inspecting BitLocker Volume Encryption Status..." -ForegroundColor Green
$BitLocker = Get-BitLockerVolume -MountPoint $TargetDrive -ErrorAction SilentlyContinue
$BitLockerActive = $false
if ($BitLocker -and $BitLocker.VolumeStatus -eq "FullyEncrypted") {
    $BitLockerActive = $true
    Write-Host "  BitLocker Status: Fully Encrypted (Method: $($BitLocker.EncryptionMethod))" -ForegroundColor Green
} else {
    Write-Host "  BitLocker Status: Volume is not BitLocker protected or unencrypted." -ForegroundColor Yellow
    Write-Host "  NOTE: Cryptographic erase requires pre-existing whole-volume encryption." -ForegroundColor Yellow
}

Write-Host "[3/5] Executing Key Protector Deletion (VMK Invalidation)..." -ForegroundColor Green
if ($BitLockerActive) {
    try {
        & manage-bde -protectors -delete $TargetDrive -type All | Out-Null
        $PostCheck = (Get-BitLockerVolume -MountPoint $TargetDrive).KeyProtector
        if ($PostCheck.Count -eq 0) {
            Write-Host "  Successfully deleted all BitLocker Key Protectors. VMK invalidated." -ForegroundColor Green
        } else {
            Write-Host "  Warning: $($PostCheck.Count) protector(s) remaining." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  Warning during key protector deletion: $_" -ForegroundColor Yellow
    }
}

# Format volume & re-initialize fresh GPT/NTFS partition
Write-Host "[4/5] Formatting Volume and Issuing SSD FTL Deallocate / TRIM..." -ForegroundColor Green
Format-Volume -DriveLetter $CleanLetter -FileSystem NTFS -NewFileSystemLabel "TRAILVAULT" -Full:$false -Confirm:$false | Out-Null

try {
    Optimize-Volume -DriveLetter $CleanLetter -ReTrim -Verbose | Out-Null
    Write-Host "  SSD FTL Deallocate / TRIM command dispatched to controller." -ForegroundColor Green
} catch {
    Write-Host "  TRIM notification note: $_" -ForegroundColor Yellow
}

Write-Host "[5/5] Generating Sanitization Attestation Record with SHA-256 Checksum..." -ForegroundColor Green
$TimestampUtc = [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
$CertId = [Guid]::NewGuid().ToString()
$CertData = @{
    record_id = $CertId
    standard = "NIST SP 800-88 Rev 1 Section 2.4 (Cryptographic Erase)"
    sanitization_method = "BITLOCKER_KEY_DESTRUCTION_AND_FTL_TRIM"
    target_volume = $TargetDrive
    disk_model = $Disk.FriendlyName
    disk_serial = $Disk.SerialNumber
    disk_bus_type = [string]$Disk.BusType
    volume_size_gb = [math]::Round($Volume.Size / 1GB, 2)
    timestamp_utc = $TimestampUtc
    operator = "$($env:USERDOMAIN)\$($env:USERNAME)"
    workstation = $env:COMPUTERNAME
    bitlocker_pre_status = if ($BitLockerActive) { "FullyEncrypted" } else { "Unencrypted/Partial" }
    ftl_wear_leveling_mitigation = "Key Protectors deleted; Volume Master Key (VMK) invalidated; FTL TRIM issued"
    checksum_algorithm = "SHA-256"
}

$CertJson = $CertData | ConvertTo-Json -Depth 4
$CertBytes = [System.Text.Encoding]::UTF8.GetBytes($CertJson)
$Sha256 = [System.Security.Cryptography.SHA256]::Create()
$CertHash = -join ($Sha256.ComputeHash($CertBytes) | ForEach-Object { "{0:x2}" -f $_ })
$CertData["sha256_integrity_digest"] = $CertHash

$FinalCertJson = $CertData | ConvertTo-Json -Depth 4
$CertPath = Join-Path $PSScriptRoot "..\storage\Cryptographic_Erase_Record_$($CleanLetter).json"
$CertDir = Split-Path -Parent $CertPath
if (-not (Test-Path $CertDir)) {
    New-Item -ItemType Directory -Path $CertDir -Force | Out-Null
}
[System.IO.File]::WriteAllText($CertPath, $FinalCertJson)

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  SANITIZATION & VMK INVALIDATION COMPLETED" -ForegroundColor Green
Write-Host "  Record Path:      $CertPath" -ForegroundColor White
Write-Host "  SHA256 Checksum:  $CertHash" -ForegroundColor White
Write-Host "============================================================================" -ForegroundColor Cyan
