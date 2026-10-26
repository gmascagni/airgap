@echo off
title AirVault (AirGap) - Publish Staged Appliance to USB4 NVMe Drive
color 0B

echo ====================================================================================
echo   AIRVAULT (AIR GAP) // PUBLISH TO USB4 / THUNDERBOLT NVMe DRIVE
echo ====================================================================================
echo.
echo Step 1: Updating local staging folder (C:\Users\gmasc\Documents\Antigravity\AirGap\USB4_Appliance_Stage)...
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\build_usb4_appliance_stage.ps1"
echo.
set /p USB_DRIVE="Enter your USB4 Drive Letter when plugged in (e.g. D:\ or E:\) or press Enter to skip: "
if "%USB_DRIVE%"=="" (
    echo.
    echo [OK] Local staging folder is updated and ready at:
    echo      %~dp0USB4_Appliance_Stage
    pause
    exit /b 0
)

set /p COPY_MODELS="Copy offline Ollama LLM & Embedding weights (8 GB) onto the USB4 drive too? (Y/N): "
if /I "%COPY_MODELS%"=="Y" (
    powershell -ExecutionPolicy Bypass -File "%~dp0scripts\build_usb4_appliance_stage.ps1" -TargetDrive "%USB_DRIVE%" -IncludeOllamaModels
) else (
    powershell -ExecutionPolicy Bypass -File "%~dp0scripts\build_usb4_appliance_stage.ps1" -TargetDrive "%USB_DRIVE%"
)
pause
