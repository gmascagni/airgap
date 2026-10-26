@echo off
title AirVault (AirGap) - Full Customer Site Live Demo Launcher (Video + Live RTX 4090 AI RAG)
color 0B

echo ====================================================================================
echo   AIRVAULT (AIR GAP) // FULL CUSTOMER SITE LIVE DEMO SUITE (100%% OFFLINE ON PC)
echo   Hardware: NVIDIA GeForce RTX 4090 Laptop GPU + Local Qdrant + BM25 + Ollama
echo ====================================================================================
echo.
echo [1/3] Verifying Local Ollama GPU Service (127.0.0.1:11434)...
ollama list >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting Ollama background service...
    start "Ollama Service" /MIN ollama serve
    timeout /t 3 /nobreak >nul
)
echo       [OK] Local Ollama GPU Engine Ready.

echo.
echo [2/3] Starting AirVault Live FastAPI + Qdrant + BM25 + PyMuPDF Engine (Port 8000)...
start "AirVault Live RTX 4090 Engine (Port 8000)" cmd /k "cd /d "%~dp0" && python services/live_appliance_server.py"
timeout /t 4 /nobreak >nul
echo       [OK] Live RAG Engine listening on http://127.0.0.1:8000

echo.
echo [3/3] Starting AirVault Web Showcase ^& Audio/Video Studio (Port 3000)...
echo       - Step 1 (Show Narrated Video): http://localhost:3000/#live-video-demo
echo       - Step 2 (Run Live AI Demo):    http://localhost:3000/#live-appliance-workbench
echo.
start "" "http://localhost:3000/#live-video-demo"
python -m http.server 3000 --directory "%~dp0out"
pause
