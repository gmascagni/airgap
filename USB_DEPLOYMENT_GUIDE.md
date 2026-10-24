# AirVault (Air GAP) — PC & Portable USB NVMe Operations Manual

Everything has been generated directly on your PC inside:
**`C:\Users\gmasc\Documents\Antigravity\AirGap`**

And also backed up to your GitHub repository:
**`https://github.com/gmascagni/airgap`**

---

## How Does This Work? (Two Ways to Run)

You have **two ways** to use what we built, depending on whether you are doing a quick investor presentation or running the full GPU-accelerated AI backend on your RTX 4090 laptop + USB NVMe SSD:

### Mode 1: Instant Interactive Showcase & Dual-Pane UI Demo (Zero Setup)
This is the interactive web application in the [`out/`](./out) folder. It includes the full **AirVault Marketing Showcase**, the **Interactive Dual-Pane PDF/CAD Citation Viewer**, the **2-Stage Architecture Explorer**, and the **ROI Calculator**.

- **Run on your PC right now:**
  Double-click **[`Launch-AirGap-Demo.bat`](./Launch-AirGap-Demo.bat)** in `C:\Users\gmasc\Documents\Antigravity\AirGap`.
  It will automatically open `http://localhost:3000` in your browser.
- **Run from a USB drive:**
  Copy the folder to any USB drive and double-click `Launch-AirGap-Demo.bat`.
- **Run from GitHub Pages (Web URL):**
  Go to `https://github.com/gmascagni/airgap/settings/pages`, set **Branch** to **`gh-pages`** (folder `/ (root)`), and click **Save**. Your live public URL will be:
  **`https://gmascagni.github.io/airgap/`**

---

### Mode 2: Full RTX 4090 Local AI Appliance on Portable USB NVMe SSD
When you want to ingest real multi-gigabyte PDFs and run live local LLM inference (`Qwen 2.5 14B AWQ` + `Qdrant` + `OpenSearch BM25` + `BGE-Reranker`) off your external USB 3.2 Gen2 NVMe SSD with **zero internet connection**:

#### Step 1: Plug in your USB NVMe SSD (e.g., Drive `E:`)
Open PowerShell in `C:\Users\gmasc\Documents\Antigravity\AirGap` and run our automated USB staging script:

```powershell
# Stages the folder structure, code, and .env configuration onto E:\AirGap
.\scripts\stage-usb-drive.ps1 -UsbDrive "E:"
```

If you also want the script to automatically download the ~12.2 GB of open-weight AI models (`Qwen2.5-14B-Instruct-AWQ`, `BAAI/bge-large-en-v1.5`, and `BAAI/bge-reranker-large`) onto the USB drive while you still have internet access, add `-DownloadModels`:

```powershell
.\scripts\stage-usb-drive.ps1 -UsbDrive "E:" -DownloadModels
```

#### Step 2: What Gets Created on Your USB Drive (`E:\AirGap`)
```text
E:\AirGap\
├── docker-compose.yml          # Isolated internal bridge network (internal: true)
├── .env                        # Pre-configured to point to E:/AirGap/storage & E:/AirGap/models
├── Launch-AirGap-Demo.bat      # One-click UI launcher
├── services\                   # Python FastAPI Backend, Docling Parser, Hybrid Search, vLLM Engine
├── out\                        # Pre-built Static Web UI
├── models\                     # Local Offline AI Model Weights (~12.2 GB total)
│   ├── llm\Qwen2.5-14B-Instruct-AWQ\
│   ├── embedding\bge-large-en-v1.5\
│   ├── reranker\bge-reranker-large\
│   └── docling\
└── storage\                    # Persistent Database & PDF Vault on USB NVMe
    ├── documents\              # Drop your PDF manuals & schematics here
    ├── artifacts\              # Extracted Markdown tables & bounding-box JSON manifests
    ├── qdrant_data\            # Dense vector index storage
    ├── opensearch_data\        # Sparse BM25 lexical index storage
    └── redis_data\             # Async ingestion job queue
```

#### Step 3: Start the Air-Gapped Container Stack
1. Ensure **Docker Desktop for Windows** (with WSL2 & NVIDIA GPU support) is running on your RTX 4090 laptop.
2. Disconnect Wi-Fi/Ethernet (optional, to prove 100% air-gap operation to investors—`docker-compose.yml` already enforces `internal: true` so containers have zero internet egress).
3. Run:
   ```powershell
   cd E:\AirGap
   docker compose up -d
   ```
4. Open **`http://127.0.0.1:3000`** for the Web UI or **`http://127.0.0.1:8080/docs`** for the FastAPI ingestion & retrieval Swagger console.
