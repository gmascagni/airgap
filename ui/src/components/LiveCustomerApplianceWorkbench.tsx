"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  FileText,
  UploadCloud,
  CheckCircle2,
  Search,
  Sparkles,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  HardDrive,
  Trash2,
  FolderSync,
  Activity,
  Filter,
} from "lucide-react";

interface LiveCitation {
  chunk_id: string;
  badge_text: string;
  source_file: string;
  file_format?: string;
  is_customer_file?: boolean;
  page_number: number;
  total_pages: number;
  element_type: string;
  security_classification: string;
  hierarchy_path: string;
  text_preview: string;
  part_numbers: string[];
  rerank_score: string;
  rrf_score: string;
  bbox_norm: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  bbox_pts: number[];
  page_image_url: string;
  pdf_file_url: string;
}

interface IndexedDocumentSummary {
  filename: string;
  file_format?: string;
  is_customer_file?: boolean;
  total_pages: number;
  chunks_count: number;
  security_classification: string;
  part_numbers: string[];
}

interface IngestProgressState {
  active: boolean;
  filename: string;
  file_size_mb: number;
  stage: string;
  stage_detail: string;
  percent: number;
  current_page: number;
  total_pages: number;
  chunks_created: number;
  pages_per_sec: number;
  elapsed_sec: number;
  error: string | null;
}

interface PresetLivePrompt {
  id: string;
  label: string;
  sector: string;
  recommendedClearance: "SECRET_ITAR" | "SUBCONTRACTOR_CUI";
  targetFile?: string;
  query: string;
}

const PRESET_LIVE_PROMPTS: PresetLivePrompt[] = [
  {
    id: "cryo-footnote-17",
    label: "1. Cryogenic Seal & Footnote 17 + 2026 ECO",
    sector: "AEROSPACE & NUCLEAR",
    recommendedClearance: "SECRET_ITAR",
    query:
      "What is the maximum allowable axial play tolerance for the Stage-3 labyrinth seal under -196 C cryogenic shock, what superseding part number is mandated by Footnote 17, and how does ECO-2026-089 modify torque?",
  },
  {
    id: "radar-secret-allowed",
    label: "2. Classified X-Band Radar (SECRET Clearance)",
    sector: "DEFENSE SCIF (GRANTED)",
    recommendedClearance: "SECRET_ITAR",
    query:
      "What are the classified X-Band radar waveguide RF choke groove flatness tolerance, HermeSeal gasket part number, and peak pulse power handling on Page 612?",
  },
  {
    id: "radar-subcontractor-blocked",
    label: "3. Same Radar Query (Subcontractor CUI Blocked)",
    sector: "ABAC REDACTION PROOF",
    recommendedClearance: "SUBCONTRACTOR_CUI",
    query:
      "What are the classified X-Band radar waveguide RF choke groove flatness tolerance, HermeSeal gasket part number, and peak pulse power handling on Page 612?",
  },
  {
    id: "multi-format-bom-sop",
    label: "4. Cross-Format BOM (.xlsx) + SOP (.docx) + SCADA (.log)",
    sector: "USB4 DROPZONE MULTI-FORMAT",
    recommendedClearance: "SECRET_ITAR",
    query:
      "Across the Excel Supply Chain BOM, Field Maintenance Word SOP, CAD Blueprint PNG, and SCADA Telemetry Log, what is the unit cost, lead time, QA hold point, and alarm status for shim P/N NAS1149-F0832P?",
  },
  {
    id: "intel-sdm-5057p",
    label: "5. Query Your 25MB Intel SDM PDF (5,057 Pages)",
    sector: "YOUR 25MB TEST FILE",
    recommendedClearance: "SECRET_ITAR",
    targetFile: "325462-sdm-vol-1-2abcd-3abcd-4.pdf",
    query:
      "How does the processor handle CPUID instruction leaf execution, CR0/CR4 control registers, and AVX-512 vector extensions?",
  },
  {
    id: "tm-m16-m4-12mb",
    label: "6. Query Your 12MB M16A2/M4 Manual (144 Pages)",
    sector: "YOUR 12MB TEST FILE",
    recommendedClearance: "SECRET_ITAR",
    targetFile: "tm-9-1005-319-10-2010-operator-s-manual-for-rifle-5.56-mm-m16a2-m16a3-m4-web.pdf",
    query:
      "What are the malfunction immediate action procedures, clearing steps, and authorized CLP lubrication specifications (MIL-PRF-63460) for the 5.56mm M16A2 and M4 rifle?",
  },
];

const API_BASE = "http://127.0.0.1:8000";

export default function LiveCustomerApplianceWorkbench() {
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);
  const [gpuName, setGpuName] = useState<string>(
    "NVIDIA GeForce RTX 4090 Laptop GPU (16GB VRAM)"
  );
  const [availableModels, setAvailableModels] = useState<string[]>([
    "qwen3.5:4b",
    "hf.co/bartowski/Meta-Llama-3.1-8B-Instruct-abliterated-GGUF:Q4_K_M",
  ]);
  const [selectedModel, setSelectedModel] = useState<string>("qwen3.5:4b");
  const [indexedDocs, setIndexedDocs] = useState<IndexedDocumentSummary[]>([]);
  const [totalChunks, setTotalChunks] = useState<number>(8);
  const [customerFilesCount, setCustomerFilesCount] = useState<number>(0);
  const [dropzoneReadyFiles, setDropzoneReadyFiles] = useState<string[]>([
    "Customer_SupplyChain_BOM_2026.xlsx",
    "Customer_Field_Maintenance_SOP.docx",
    "Customer_Architecture_Review_Deck.pptx",
    "DWG-99401_Cryo_Seal_Schematic.png",
    "SCADA_Turbine_Telemetry_Alarm.log",
  ]);

  // Document filter state ("ALL" or specific filename)
  const [selectedDocFilter, setSelectedDocFilter] = useState<string>("ALL");

  // Query & ABAC state
  const [clearanceLevel, setClearanceLevel] = useState<
    "SECRET_ITAR" | "SUBCONTRACTOR_CUI"
  >("SECRET_ITAR");
  const [queryText, setQueryText] = useState<string>(
    PRESET_LIVE_PROMPTS[0].query
  );
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [queryProgressPct, setQueryProgressPct] = useState<number>(0);
  const [queryStageText, setQueryStageText] = useState<string>("");
  const [queryElapsedSec, setQueryElapsedSec] = useState<number>(0);

  const [answerText, setAnswerText] = useState<string>("");
  const [citations, setCitations] = useState<LiveCitation[]>([]);
  const [selectedCitationIdx, setSelectedCitationIdx] = useState<number>(0);
  const [telemetry, setTelemetry] = useState<{
    dense_qdrant_ms: number;
    sparse_bm25_ms: number;
    rerank_ms: number;
    llm_generation_ms: number;
    total_pipeline_ms: number;
    candidates_evaluated: number;
  } | null>(null);
  const [abacBlockedCount, setAbacBlockedCount] = useState<number>(0);
  const [abacRedacted, setAbacRedacted] = useState<boolean>(false);

  // Live Upload & Real-Time Progress Bar state
  const [uploadClassification, setUploadClassification] = useState<string>(
    "CUI // NOFORN // ITAR"
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isScanningDropzone, setIsScanningDropzone] = useState<boolean>(false);
  const [isWipingVault, setIsWipingVault] = useState<boolean>(false);
  const [customDirectoryPath, setCustomDirectoryPath] = useState<string>(
    "C:\\Users\\gmasc\\Documents\\Antigravity\\AirGap\\02_DROP_CUSTOMER_FILES_HERE"
  );
  const [ingestProgress, setIngestProgress] =
    useState<IngestProgressState | null>(null);
  const [uploadBanner, setUploadBanner] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const fetchBackendStatus = async () => {
    setCheckingStatus(true);
    try {
      const resp = await fetch(`${API_BASE}/api/v1/status`, {
        method: "GET",
      });
      if (resp.ok) {
        const data = await resp.json();
        setBackendOnline(true);
        setGpuName(data.gpu || gpuName);
        if (
          Array.isArray(data.available_llm_models) &&
          data.available_llm_models.length > 0
        ) {
          setAvailableModels(data.available_llm_models);
          setSelectedModel(data.available_llm_models[0]);
        }
        setIndexedDocs(data.documents || []);
        setTotalChunks(data.total_indexed_chunks || 0);
        setCustomerFilesCount(data.customer_files_indexed || 0);
        if (Array.isArray(data.dropzone_files_ready)) {
          setDropzoneReadyFiles(data.dropzone_files_ready);
        }
      } else {
        setBackendOnline(false);
      }
    } catch {
      setBackendOnline(false);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    fetchBackendStatus();
  }, []);

  // Poll `/api/v1/ingest/progress` every 250ms whenever an upload or dropzone scan is active
  useEffect(() => {
    if (!isUploading && !isScanningDropzone) return;

    const timer = setInterval(async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/v1/ingest/progress`);
        if (resp.ok) {
          const prog: IngestProgressState = await resp.json();
          setIngestProgress(prog);
        }
      } catch {
        // ignore transient poll error
      }
    }, 250);

    return () => clearInterval(timer);
  }, [isUploading, isScanningDropzone]);

  // Animated 4-stage query progress bar & stopwatch while `isQuerying` is true
  useEffect(() => {
    if (!isQuerying) {
      setQueryProgressPct(0);
      setQueryElapsedSec(0);
      return;
    }
    const t0 = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - t0) / 1000;
      setQueryElapsedSec(Number(elapsed.toFixed(1)));
      if (elapsed < 0.4) {
        setQueryProgressPct(22);
        setQueryStageText(
          "Stage 1/4: Enforcing Pre-Retrieval ABAC Clearance Filter..."
        );
      } else if (elapsed < 1.0) {
        setQueryProgressPct(52);
        setQueryStageText(
          `Stage 2/4: Parallel Qdrant 1024-d Vector + BM25 Search across ${totalChunks.toLocaleString()} chunks...`
        );
      } else if (elapsed < 1.8) {
        setQueryProgressPct(76);
        setQueryStageText(
          "Stage 3/4: Reciprocal Rank Fusion (RRF) & Cross-Encoder Reranking (Top 30 ➔ Top 5)..."
        );
      } else {
        const slowRamp = Math.min(96, 76 + Math.floor((elapsed - 1.8) * 3));
        setQueryProgressPct(slowRamp);
        setQueryStageText(
          `Stage 4/4: Generating Grounded Answer with Citations via Local RTX 4090 (${selectedModel})...`
        );
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isQuerying, totalChunks, selectedModel]);

  const runLiveQuery = async (
    overrideQuery?: string,
    overrideClearance?: "SECRET_ITAR" | "SUBCONTRACTOR_CUI",
    overrideDocFilter?: string
  ) => {
    const activeQ = overrideQuery ?? queryText;
    const activeClearance = overrideClearance ?? clearanceLevel;
    const activeDocFilter = overrideDocFilter ?? selectedDocFilter;
    if (!activeQ.trim()) return;

    setIsQuerying(true);
    try {
      const resp = await fetch(`${API_BASE}/api/v1/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: activeQ,
          clearance_level: activeClearance,
          llm_model: selectedModel,
          source_file_filter: activeDocFilter,
          top_k: 5,
        }),
      });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      const data = await resp.json();
      if (data.auto_expanded_scope && data.effective_file_filter === "ALL") {
        setSelectedDocFilter("ALL");
      }
      setAnswerText(data.answer || "");
      setCitations(data.citations || []);
      setSelectedCitationIdx(0);
      setTelemetry(data.telemetry || null);
      setAbacBlockedCount(data.abac_blocked_secret_chunks || 0);
      setAbacRedacted(Boolean(data.abac_redaction_triggered));
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
      setAnswerText(
        "⚠️ Local Appliance Engine (127.0.0.1:8000) is not reachable yet. Double-click Launch-Customer-Live-Demo.bat in your AirGap folder to start the local RTX 4090 FastAPI + Qdrant + Ollama server."
      );
    } finally {
      setIsQuerying(false);
    }
  };

  useEffect(() => {
    if (backendOnline && !answerText && !isQuerying) {
      runLiveQuery(PRESET_LIVE_PROMPTS[0].query, "SECRET_ITAR", "ALL");
    }
  }, [backendOnline]);

  const handleBatchFileUpload = async (fileList: FileList | File[] | null) => {
    if (!fileList || fileList.length === 0) return;
    const filesArray = Array.from(fileList);
    const totalBytes = filesArray.reduce((acc, f) => acc + f.size, 0);
    const sizeMb = totalBytes / (1024 * 1024);
    const label =
      filesArray.length === 1
        ? filesArray[0].name
        : `${filesArray.length} Files Selected`;

    setIsUploading(true);
    setUploadBanner(null);
    setIngestProgress({
      active: true,
      filename: label,
      file_size_mb: Number(sizeMb.toFixed(2)),
      stage: "STAGE 1/4: STREAMING MULTI-FILE BATCH TO LOCAL NVMe VAULT",
      stage_detail: `Uploading ${filesArray.length} file(s) (${sizeMb.toFixed(2)} MB total)...`,
      percent: 6,
      current_page: 0,
      total_pages: filesArray.length,
      chunks_created: 0,
      pages_per_sec: 0,
      elapsed_sec: 0,
      error: null,
    });

    try {
      const formData = new FormData();
      for (const f of filesArray) {
        formData.append("files", f);
      }
      formData.append("security_classification", uploadClassification);

      const resp = await fetch(`${API_BASE}/api/v1/ingest/upload-batch`, {
        method: "POST",
        body: formData,
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.detail || `Batch upload failed: ${resp.status}`);
      }
      const res = await resp.json();
      setIngestProgress({
        active: false,
        filename: res.filename,
        file_size_mb: res.file_size_mb || Number(sizeMb.toFixed(2)),
        stage: "COMPLETE",
        stage_detail: `✓ Bulk-indexed ${res.files_indexed_count || filesArray.length} file(s) (${res.pages_parsed.toLocaleString()} pages / ${res.chunks_created.toLocaleString()} chunks) in ${(res.elapsed_ms / 1000).toFixed(1)}s!`,
        percent: 100,
        current_page: res.pages_parsed,
        total_pages: res.pages_parsed,
        chunks_created: res.chunks_created,
        pages_per_sec: Math.round(
          res.pages_parsed / Math.max(0.1, res.elapsed_ms / 1000)
        ),
        elapsed_sec: Number((res.elapsed_ms / 1000).toFixed(1)),
        error: null,
      });
      setUploadBanner(
        `✓ Bulk-Indexed ${res.files_indexed_count || filesArray.length} File(s) [${res.file_size_mb} MB] — ${res.pages_parsed.toLocaleString()} pages / ${res.chunks_created.toLocaleString()} chunks in ${(res.elapsed_ms / 1000).toFixed(1)}s! Global search scope ("ALL") is active.`
      );
      await fetchBackendStatus();
      setSelectedDocFilter("ALL");
    } catch (err: any) {
      setUploadBanner(
        `⚠️ Upload error: ${err?.message || "Ensure Launch-Customer-Live-Demo.bat is running."}`
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (folderInputRef.current) {
        folderInputRef.current.value = "";
      }
    }
  };

  const handleIndexDirectoryPath = async () => {
    if (!customDirectoryPath.trim()) return;
    setIsScanningDropzone(true);
    setUploadBanner(null);
    setIngestProgress({
      active: true,
      filename: customDirectoryPath.trim(),
      file_size_mb: 0,
      stage: "STAGE 1/4: RECURSIVE DIRECTORY DISCOVERY",
      stage_detail: `Scanning ${customDirectoryPath.trim()} and all subfolders...`,
      percent: 8,
      current_page: 0,
      total_pages: 0,
      chunks_created: 0,
      pages_per_sec: 0,
      elapsed_sec: 0,
      error: null,
    });
    try {
      const resp = await fetch(`${API_BASE}/api/v1/ingest/directory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directory_path: customDirectoryPath.trim(),
          recursive: true,
          security_classification: uploadClassification,
        }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.detail || `Directory scan failed: ${resp.status}`);
      }
      const res = await resp.json();
      setSelectedDocFilter("ALL");
      setUploadBanner(
        `✓ Bulk-Indexed ${res.files_indexed_count.toLocaleString()} file(s) (${res.pages_parsed.toLocaleString()} pages / ${res.chunks_created.toLocaleString()} chunks) from "${res.directory_path}" in ${(res.elapsed_ms / 1000).toFixed(1)}s!`
      );
      await fetchBackendStatus();
    } catch (err: any) {
      setUploadBanner(
        `⚠️ Directory scan error: ${err?.message || "Verify the folder path exists on this PC."}`
      );
    } finally {
      setIsScanningDropzone(false);
    }
  };

  const handleScanDropzone = async () => {
    setIsScanningDropzone(true);
    setUploadBanner(null);
    setIngestProgress({
      active: true,
      filename: "USB4 Dropzone (02_DROP_CUSTOMER_FILES_HERE)",
      file_size_mb: 0.1,
      stage: "STAGE 1/4: SCANNING USB4 DROPZONE",
      stage_detail: "Scanning multi-format files...",
      percent: 12,
      current_page: 0,
      total_pages: dropzoneReadyFiles.length,
      chunks_created: 0,
      pages_per_sec: 0,
      elapsed_sec: 0,
      error: null,
    });
    try {
      const resp = await fetch(`${API_BASE}/api/v1/ingest/scan-dropzone`, {
        method: "POST",
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const res = await resp.json();
      setSelectedDocFilter("ALL");
      setUploadBanner(
        `🚀 USB4 DROPZONE SYNC COMPLETE: Indexed ${res.files_indexed?.length || 0} multi-format customer files (${res.chunks_added} chunks) in ${(res.elapsed_ms / 1000).toFixed(1)}s!`
      );
      await fetchBackendStatus();
      const multiFormatQ = PRESET_LIVE_PROMPTS[3].query;
      setQueryText(multiFormatQ);
      await runLiveQuery(multiFormatQ, "SECRET_ITAR", "ALL");
    } catch {
      setUploadBanner(
        "⚠️ Could not scan dropzone: ensure Launch-Customer-Live-Demo.bat is running."
      );
    } finally {
      setIsScanningDropzone(false);
    }
  };

  const handleWipeCustomerVault = async () => {
    setIsWipingVault(true);
    setUploadBanner(null);
    try {
      const resp = await fetch(
        `${API_BASE}/api/v1/ingest/wipe-customer-vault`,
        {
          method: "POST",
        }
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const res = await resp.json();
      setSelectedDocFilter("ALL");
      setIngestProgress(null);
      setUploadBanner(
        `🛡️ DoD 5220.22-M 3-PASS SHRED COMPLETE: Purged ${res.removed_customer_chunks.toLocaleString()} customer session chunk(s) from Qdrant & BM25 in ${res.elapsed_ms}ms.`
      );
      await fetchBackendStatus();
      setQueryText(PRESET_LIVE_PROMPTS[0].query);
      await runLiveQuery(PRESET_LIVE_PROMPTS[0].query, clearanceLevel, "ALL");
    } catch {
      setUploadBanner("⚠️ Could not wipe customer session.");
    } finally {
      setIsWipingVault(false);
    }
  };

  const activeCitation: LiveCitation | undefined =
    citations[selectedCitationIdx];

  return (
    <div className="space-y-6">
      {/* Top Appliance Hardware & Live Connection Bar */}
      <div className="p-5 rounded-2xl bg-slateDeep border-2 border-cardBorder flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-3.5 h-3.5 rounded-full ${
              backendOnline
                ? "bg-zeroTrustEmerald animate-pulse shadow-[0_0_12px_#10B981]"
                : "bg-warningAmber"
            }`}
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs sm:text-sm font-bold text-white">
                {backendOnline
                  ? "LIVE LOCAL AI APPLIANCE ENGINE: ONLINE (127.0.0.1:8000)"
                  : "LOCAL APPLIANCE ENGINE STANDBY (START LAUNCHER FOR LIVE GPU INFERENCE)"}
              </span>
              <span className="px-2 py-0.5 rounded bg-zeroTrustEmerald/20 text-zeroTrustEmerald border border-zeroTrustEmerald/40 font-mono text-[10px] font-bold">
                ZERO EXTERNAL TELEMETRY
              </span>
            </div>
            <div className="font-mono text-xs text-gray-400 mt-0.5">
              GPU: <span className="text-tacticalCyan">{gpuName}</span> •
              Indexed Vault:{" "}
              <span className="text-white font-semibold">
                {indexedDocs.length || 5} Files ({totalChunks.toLocaleString()}{" "}
                Total Chunks/Pages)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-obsidian px-3 py-1.5 rounded-xl border border-cardBorder">
            <Cpu className="w-4 h-4 text-tacticalCyan" />
            <label
              htmlFor="live-llm-select"
              className="font-mono text-[11px] text-gray-400"
            >
              Local LLM:
            </label>
            <select
              id="live-llm-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent font-mono text-xs text-white font-bold focus:outline-none"
            >
              {availableModels.map((m) => (
                <option key={m} value={m} className="bg-obsidian text-white">
                  {m}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={fetchBackendStatus}
            className="px-3 py-1.5 rounded-xl bg-cardSurface border border-cardBorder hover:border-tacticalCyan font-mono text-xs text-gray-200 flex items-center gap-1.5"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${checkingStatus ? "animate-spin" : ""}`}
            />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* LIVE REAL-TIME INGESTION PROGRESS BAR (VISIBLE DURING & AFTER UPLOAD) */}
      {(isUploading || isScanningDropzone || ingestProgress) && (
        <div className="p-5 rounded-2xl bg-obsidian border-2 border-tacticalCyan shadow-[0_0_35px_rgba(6,182,212,0.25)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-tacticalCyan font-bold">
              <Activity
                className={`w-4 h-4 ${
                  isUploading || isScanningDropzone ? "animate-spin" : ""
                }`}
              />
              <span>
                {ingestProgress?.stage || "PROCESSING DOCUMENT STREAM..."}
              </span>
              {ingestProgress?.filename && (
                <span className="text-white">
                  — {ingestProgress.filename} ({ingestProgress.file_size_mb} MB)
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {ingestProgress && ingestProgress.total_pages > 0 && (
                <span className="text-zeroTrustEmerald font-bold">
                  Page {ingestProgress.current_page.toLocaleString()} /{" "}
                  {ingestProgress.total_pages.toLocaleString()} (
                  {ingestProgress.pages_per_sec} pgs/sec)
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded bg-tacticalCyan text-obsidian font-bold">
                {ingestProgress?.percent ?? 10}%
              </span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-3.5 rounded-full bg-slateDeep border border-cardBorder overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-tacticalCyan via-cyan-300 to-zeroTrustEmerald transition-all duration-200"
              style={{ width: `${ingestProgress?.percent ?? 10}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-gray-300">
            <span>{ingestProgress?.stage_detail}</span>
            <span>Elapsed: {ingestProgress?.elapsed_sec ?? 0}s</span>
          </div>
        </div>
      )}

      {/* Row 1: USB4 Customer Dropzone Shuttle + Multi-Format Drag & Drop + Vault Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): USB4 Dropzone Shuttle + Browser Multi-Format Drag & Drop */}
        <div className="lg:col-span-5 space-y-4">
          {/* Browser Multi-Format & Bulk Folder Drag & Drop Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleBatchFileUpload(e.dataTransfer.files);
            }}
            className="p-5 rounded-2xl bg-slateDeep border-2 border-dashed border-tacticalCyan hover:border-cyan-300 transition-all space-y-3 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-tacticalCyan/20 border border-tacticalCyan flex items-center justify-center flex-shrink-0">
                <UploadCloud className="w-5 h-5 text-tacticalCyan" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  1. Bulk Upload Multiple Files or Entire Folders (1 to 1,000+ Files)
                </h3>
                <p className="text-[11px] text-gray-300 font-mono">
                  Shift/Ctrl-Select dozens of files OR pick a whole folder (.pdf,
                  .docx, .xlsx, .csv, .pptx, .png, .log, .json)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-cardBorder/60">
              <select
                aria-label="Security Classification Banner for Uploaded File"
                value={uploadClassification}
                onChange={(e) => setUploadClassification(e.target.value)}
                className="px-2.5 py-1.5 rounded bg-obsidian border border-cardBorder font-mono text-[11px] text-zeroTrustEmerald"
              >
                <option value="CUI // NOFORN // ITAR">
                  CUI // NOFORN // ITAR
                </option>
                <option value="SECRET // ITAR // NOFORN">
                  SECRET // ITAR // NOFORN
                </option>
                <option value="CUI // PROPRIETARY">CUI // PROPRIETARY</option>
                <option value="CUI // FDA-GMP">CUI // FDA-GMP</option>
              </select>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.xlsx,.csv,.pptx,.png,.jpg,.jpeg,.tiff,.tif,.txt,.md,.log,.json,.xml,.yaml,.yml"
                className="hidden"
                onChange={(e) => handleBatchFileUpload(e.target.files)}
              />
              <input
                ref={folderInputRef}
                type="file"
                multiple
                // @ts-expect-error webkitdirectory is standard across Chromium/Edge/Firefox for directory upload
                webkitdirectory=""
                directory=""
                className="hidden"
                onChange={(e) => handleBatchFileUpload(e.target.files)}
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-tacticalCyan hover:bg-cyan-400 disabled:opacity-50 text-obsidian font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                >
                  {isUploading
                    ? "Indexing Batch..."
                    : "+ Select Multiple Files"}
                </button>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => folderInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-cardSurface hover:bg-obsidian border border-tacticalCyan text-tacticalCyan font-mono font-bold text-xs uppercase tracking-wider transition-all"
                >
                  + Select Entire Folder
                </button>
              </div>
            </div>
          </div>

          {/* USB4 Customer Dropzone + Zero-Copy Local/Network Directory Crawler Card */}
          <div className="p-5 rounded-2xl bg-slateDeep border border-zeroTrustEmerald/60 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zeroTrustEmerald/20 border border-zeroTrustEmerald flex items-center justify-center flex-shrink-0">
                  <HardDrive className="w-4 h-4 text-zeroTrustEmerald" />
                </div>
                <div>
                  <div className="font-mono text-[10px] text-zeroTrustEmerald font-bold uppercase">
                    // 2. ZERO-COPY BULK DIRECTORY CRAWLER &amp; USB4 DROPZONE
                  </div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">
                    Index 1,000s of Files Directly from Any Folder or Network Share
                  </h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-obsidian border border-cardBorder font-mono text-[10px] text-tacticalCyan">
                {dropzoneReadyFiles.length} Dropzone Files
              </span>
            </div>

            {/* Direct Local / Network Share Path Input for Thousands of Files */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                value={customDirectoryPath}
                onChange={(e) => setCustomDirectoryPath(e.target.value)}
                placeholder="Paste any local, USB4, or network path (e.g. C:\Customer_Docs or \\NAS\Share)"
                className="flex-1 px-3 py-2 rounded-xl bg-obsidian border border-cardBorder focus:border-zeroTrustEmerald font-mono text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                disabled={isScanningDropzone}
                onClick={handleIndexDirectoryPath}
                className="px-3.5 py-2 rounded-xl bg-tacticalCyan/20 hover:bg-tacticalCyan/30 border border-tacticalCyan text-tacticalCyan font-mono font-bold text-xs uppercase whitespace-nowrap transition-all"
              >
                Crawl Folder Path
              </button>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isScanningDropzone}
                onClick={handleScanDropzone}
                className="flex-1 py-2 px-3 rounded-xl bg-zeroTrustEmerald hover:bg-emerald-400 text-obsidian font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
              >
                <FolderSync
                  className={`w-4 h-4 ${
                    isScanningDropzone ? "animate-spin" : ""
                  }`}
                />
                <span>
                  {isScanningDropzone
                    ? "Bulk Indexing..."
                    : "Sync 02_DROP_CUSTOMER_FILES_HERE\\"}
                </span>
              </button>

              <button
                type="button"
                disabled={isWipingVault || customerFilesCount === 0}
                onClick={handleWipeCustomerVault}
                title="DoD 5220.22-M 3-Pass Cryptographic Shred of customer session files"
                className="py-2 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 disabled:opacity-40 border border-rose-500/60 text-rose-200 font-mono font-bold text-xs uppercase flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>3-Pass Wipe ({customerFilesCount})</span>
              </button>
            </div>
          </div>

          {uploadBanner && (
            <div className="p-3 rounded-xl bg-zeroTrustEmerald/15 border border-zeroTrustEmerald/50 font-mono text-xs text-zeroTrustEmerald">
              {uploadBanner}
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Active Indexed Vault Inventory + Click-to-Target File Filter */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slateDeep/90 border border-cardBorder flex flex-col justify-between gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-mono text-xs text-tacticalCyan font-bold uppercase flex items-center gap-2">
                <span>
                  // ACTIVE LOCAL QDRANT + BM25 VAULT ({indexedDocs.length}{" "}
                  FILES • {totalChunks.toLocaleString()} PAGES/CHUNKS)
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                <strong>Tip:</strong> Click any file card below to{" "}
                <span className="text-tacticalCyan font-semibold">
                  lock your search exclusively to that file
                </span>
                , or search across all files at once:
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {selectedDocFilter !== "ALL" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDocFilter("ALL");
                    runLiveQuery(queryText, clearanceLevel, "ALL");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-tacticalCyan text-obsidian font-mono text-[11px] font-bold"
                >
                  ✕ Clear Filter ({selectedDocFilter.slice(0, 18)}...)
                </button>
              )}

              {/* Live CAC Smartcard ABAC Toggle */}
              <div className="flex items-center gap-1 bg-obsidian p-1 rounded-xl border border-cardBorder">
                <button
                  type="button"
                  onClick={() => {
                    setClearanceLevel("SECRET_ITAR");
                    runLiveQuery(queryText, "SECRET_ITAR", selectedDocFilter);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition-all ${
                    clearanceLevel === "SECRET_ITAR"
                      ? "bg-zeroTrustEmerald text-obsidian"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  🔓 SECRET//ITAR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClearanceLevel("SUBCONTRACTOR_CUI");
                    runLiveQuery(
                      queryText,
                      "SUBCONTRACTOR_CUI",
                      selectedDocFilter
                    );
                  }}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition-all ${
                    clearanceLevel === "SUBCONTRACTOR_CUI"
                      ? "bg-warningAmber text-obsidian"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  🔒 CUI ONLY
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            {indexedDocs.map((doc) => {
              const isSecret = doc.security_classification.includes("SECRET");
              const isBlocked =
                isSecret && clearanceLevel === "SUBCONTRACTOR_CUI";
              const isTargeted = selectedDocFilter === doc.filename;
              return (
                <button
                  key={doc.filename}
                  type="button"
                  onClick={() => {
                    const nextFilter = isTargeted ? "ALL" : doc.filename;
                    setSelectedDocFilter(nextFilter);
                    if (nextFilter !== "ALL") {
                      const q = `What are the key technical specifications, architecture details, or procedures in ${doc.filename}?`;
                      setQueryText(q);
                      runLiveQuery(q, clearanceLevel, nextFilter);
                    }
                  }}
                  className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2 font-mono text-xs ${
                    isTargeted
                      ? "bg-cardSurface border-tacticalCyan ring-2 ring-tacticalCyan shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                      : isBlocked
                      ? "bg-rose-950/30 border-rose-500/50 opacity-75"
                      : doc.is_customer_file
                      ? "bg-zeroTrustEmerald/10 border-zeroTrustEmerald/60 hover:border-tacticalCyan"
                      : "bg-obsidian/90 border-cardBorder hover:border-gray-500"
                  }`}
                >
                  <div className="truncate">
                    <div className="text-white font-bold truncate flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-tacticalCyan flex-shrink-0" />
                      <span className="truncate">{doc.filename}</span>
                    </div>
                    <div className="text-[10px] text-gray-300 mt-0.5">
                      {doc.file_format || "PDF"} •{" "}
                      <strong>
                        {doc.total_pages.toLocaleString()} Pages (
                        {doc.chunks_count.toLocaleString()} Chunks)
                      </strong>{" "}
                      {doc.is_customer_file ? "• [YOUR FILE]" : ""}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${
                      isTargeted
                        ? "bg-tacticalCyan text-obsidian"
                        : isBlocked
                        ? "bg-rose-500/20 text-rose-300"
                        : doc.is_customer_file
                        ? "bg-zeroTrustEmerald text-obsidian"
                        : "bg-zeroTrustEmerald/15 text-zeroTrustEmerald"
                    }`}
                  >
                    {isTargeted
                      ? "🎯 TARGETED"
                      : isBlocked
                      ? "BLOCKED"
                      : doc.is_customer_file
                      ? "CLICK TO QUERY"
                      : "READY"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: One-Click Customer Test Scenarios + Live Query Bar */}
      <div className="p-5 rounded-2xl bg-slateDeep border border-cardBorder space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs text-tacticalCyan font-bold uppercase">
            // ONE-CLICK LIVE TEST PROMPTS (INCLUDING YOUR 5,057-PAGE UPLOADED
            PDF):
          </span>
          <span className="font-mono text-xs text-zeroTrustEmerald flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Search Scope:{" "}
            <strong>
              {selectedDocFilter === "ALL"
                ? `All ${indexedDocs.length} Files (${totalChunks.toLocaleString()} Pages)`
                : selectedDocFilter}
            </strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESET_LIVE_PROMPTS.map((preset) => {
            const isUserFilePreset = Boolean(preset.targetFile);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  const targetScope = preset.targetFile || "ALL";
                  setQueryText(preset.query);
                  setClearanceLevel(preset.recommendedClearance);
                  setSelectedDocFilter(targetScope);
                  runLiveQuery(
                    preset.query,
                    preset.recommendedClearance,
                    targetScope
                  );
                }}
                className={`text-left p-3 rounded-xl transition-all flex flex-col justify-between border ${
                  isUserFilePreset
                    ? "bg-zeroTrustEmerald/10 hover:bg-zeroTrustEmerald/20 border-zeroTrustEmerald/60 hover:border-tacticalCyan"
                    : "bg-obsidian hover:bg-cardSurface border-cardBorder hover:border-tacticalCyan"
                }`}
              >
                <div
                  className={`font-mono text-[10px] font-bold mb-1 ${
                    isUserFilePreset
                      ? "text-zeroTrustEmerald"
                      : "text-tacticalCyan"
                  }`}
                >
                  {preset.sector}
                </div>
                <div className="text-xs font-bold text-white leading-snug">
                  {preset.label}
                </div>
              </button>
            );
          })}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runLiveQuery();
          }}
          className="flex flex-col sm:flex-row gap-3 pt-1"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-tacticalCyan absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Ask any technical question across your uploaded PDFs, Excel BOMs, Word SOPs, or schematics..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-obsidian border border-cardBorder focus:border-tacticalCyan text-sm text-white font-mono focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isQuerying}
            className="px-6 py-3.5 rounded-xl bg-tacticalCyan hover:bg-cyan-400 disabled:opacity-60 text-obsidian font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isQuerying
                ? `Searching (${queryElapsedSec}s)...`
                : "Run Live Local AI Query"}
            </span>
          </button>
        </form>
      </div>

      {/* Row 3: Live Dual-Pane Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl bg-slateDeep border-2 border-cardBorder overflow-hidden shadow-2xl">
        {/* Left Pane: Live Grounded Response + Citation Badges */}
        <div className="lg:col-span-6 p-6 border-b lg:border-b-0 lg:border-r border-cardBorder flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cardBorder pb-3">
              <div className="flex items-center gap-2 font-mono text-xs text-zeroTrustEmerald font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>LIVE GROUNDED SYNTHESIS ({selectedModel})</span>
              </div>
              {telemetry && (
                <span className="font-mono text-[11px] text-tacticalCyan">
                  Qdrant: {telemetry.dense_qdrant_ms}ms • BM25:{" "}
                  {telemetry.sparse_bm25_ms}ms • Rerank: {telemetry.rerank_ms}ms
                </span>
              )}
            </div>

            {abacRedacted && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500 text-rose-200 font-mono text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>
                    PRE-RETRIEVAL ABAC REDACTION ENFORCED (CMMC LEVEL 3):
                  </strong>{" "}
                  {abacBlockedCount} SECRET//ITAR chunk(s) were mathematically
                  blocked inside Qdrant before LLM inference.
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-obsidian border border-cardBorder min-h-[140px] flex items-center">
              {isQuerying ? (
                <div className="space-y-3 w-full">
                  <div className="flex items-center justify-between font-mono text-xs text-tacticalCyan">
                    <span className="animate-pulse">● {queryStageText}</span>
                    <span className="font-bold">
                      {queryProgressPct}% ({queryElapsedSec}s)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slateDeep border border-cardBorder overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-tacticalCyan to-zeroTrustEmerald transition-all duration-150"
                      style={{ width: `${queryProgressPct}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm sm:text-base text-gray-100 leading-relaxed whitespace-pre-line">
                  {answerText ||
                    "Click 'Run Live Local AI Query' above to execute a grounded query on your laptop."}
                </p>
              )}
            </div>

            {/* Interactive Retrieved Citation Cards */}
            <div className="space-y-2">
              <div className="font-mono text-xs text-gray-400 uppercase flex items-center justify-between">
                <span>
                  CLICK ANY RETRIEVED CHUNK TO INSPECT LIVE PAGE & BOUNDING BOX:
                </span>
                <span className="text-tacticalCyan">
                  TOP {citations.length} VERIFIED HITS
                </span>
              </div>

              <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                {citations.map((cit, idx) => {
                  const selected = idx === selectedCitationIdx;
                  return (
                    <button
                      key={cit.chunk_id}
                      type="button"
                      onClick={() => setSelectedCitationIdx(idx)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selected
                          ? "bg-cardSurface border-tacticalCyan ring-1 ring-tacticalCyan"
                          : "bg-obsidian/80 border-cardBorder hover:border-gray-500"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                        <span className="font-bold text-tacticalCyan">
                          {cit.badge_text}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slateDeep text-[10px] text-cyan-300">
                            Page {cit.page_number.toLocaleString()} of{" "}
                            {cit.total_pages.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-zeroTrustEmerald">
                            Rerank: {cit.rerank_score}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 mt-1.5 line-clamp-2 font-mono">
                        {cit.text_preview}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-cardBorder flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-gray-400">
            <span>
              ABAC CLEARANCE:{" "}
              <strong className="text-white">{clearanceLevel}</strong>
            </span>
            {activeCitation && (
              <a
                href={activeCitation.pdf_file_url}
                target="_blank"
                rel="noreferrer"
                className="text-tacticalCyan hover:underline flex items-center gap-1"
              >
                <span>
                  Open Raw File at Page{" "}
                  {activeCitation.page_number.toLocaleString()} (
                  {activeCitation.source_file})
                </span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Right Pane: Real Rendered Document / PDF / Blueprint + Animated Bounding-Box Overlay */}
        <div className="lg:col-span-6 p-6 bg-[#080C14] flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-cardBorder">
              <div>
                <div className="font-mono text-xs text-white font-bold">
                  UNIVERSAL BOUNDING-BOX INSPECTOR:{" "}
                  <span className="text-tacticalCyan">
                    {activeCitation?.source_file ||
                      "Turbine_Master_Overhaul_Manual_Rev4.pdf"}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-gray-400">
                  {activeCitation?.hierarchy_path ||
                    "Select a retrieved citation on the left to inspect its exact page & bounding box"}
                </div>
              </div>
              {activeCitation && (
                <span className="px-2.5 py-1 rounded bg-warningAmber text-obsidian font-mono text-xs font-bold">
                  PAGE {activeCitation.page_number.toLocaleString()} OF{" "}
                  {activeCitation.total_pages.toLocaleString()}
                </span>
              )}
            </div>

            {activeCitation ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-cardBorder bg-white shadow-2xl mx-auto max-w-[520px]">
                <img
                  src={activeCitation.page_image_url}
                  alt={`${activeCitation.source_file} Page ${activeCitation.page_number}`}
                  className="w-full h-auto block"
                />
                <motion.div
                  layout
                  initial={false}
                  animate={{
                    left: `${activeCitation.bbox_norm.left}%`,
                    top: `${activeCitation.bbox_norm.top}%`,
                    width: `${activeCitation.bbox_norm.width}%`,
                    height: `${activeCitation.bbox_norm.height}%`,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
                  className="absolute border-2 border-warningAmber bg-warningAmber/20 rounded shadow-[0_0_25px_rgba(245,158,11,0.65)] pointer-events-none"
                >
                  <div className="absolute -top-5 left-0 bg-warningAmber text-obsidian font-mono font-bold text-[9px] px-2 py-0.5 rounded-t whitespace-nowrap">
                    VERIFIED BBOX [{activeCitation.bbox_pts.join(", ")}] • SCORE{" "}
                    {activeCitation.rerank_score}
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="h-[420px] rounded-xl border border-cardBorder bg-obsidian flex items-center justify-center font-mono text-xs text-gray-400">
                Run a live query to render the cited document & bounding box.
              </div>
            )}
          </div>

          {activeCitation && (
            <div className="mt-4 pt-3 border-t border-cardBorder flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-gray-400">
              <span>
                EXTRACTED TAGS:{" "}
                <strong className="text-tacticalCyan">
                  {activeCitation.part_numbers.join(", ") || "STANDARD SPEC"}
                </strong>
              </span>
              <span className="text-zeroTrustEmerald">
                ● PYMUPDF LIVE PAGE RENDER
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
