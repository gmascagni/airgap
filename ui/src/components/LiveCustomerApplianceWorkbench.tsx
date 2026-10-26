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

interface PresetLivePrompt {
  id: string;
  label: string;
  sector: string;
  recommendedClearance: "SECRET_ITAR" | "SUBCONTRACTOR_CUI";
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
    id: "pharma-bla",
    label: "5. FDA Biologics Cold-Chain Hold (Footnote 9)",
    sector: "PHARMA GMP AUDIT",
    recommendedClearance: "SECRET_ITAR",
    query:
      "For Biologics Batch Lot #BIO-9941 stored at -70 C, what is the maximum validated ambient transfer hold window per Table 88-C Footnote 9?",
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

  // Query & ABAC state
  const [clearanceLevel, setClearanceLevel] = useState<
    "SECRET_ITAR" | "SUBCONTRACTOR_CUI"
  >("SECRET_ITAR");
  const [queryText, setQueryText] = useState<string>(
    PRESET_LIVE_PROMPTS[0].query
  );
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
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

  // Live Upload & USB4 Dropzone state
  const [uploadClassification, setUploadClassification] = useState<string>(
    "CUI // NOFORN // ITAR"
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isScanningDropzone, setIsScanningDropzone] = useState<boolean>(false);
  const [isWipingVault, setIsWipingVault] = useState<boolean>(false);
  const [uploadBanner, setUploadBanner] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const runLiveQuery = async (
    overrideQuery?: string,
    overrideClearance?: "SECRET_ITAR" | "SUBCONTRACTOR_CUI"
  ) => {
    const activeQ = overrideQuery ?? queryText;
    const activeClearance = overrideClearance ?? clearanceLevel;
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
          top_k: 5,
        }),
      });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      const data = await resp.json();
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
      runLiveQuery(PRESET_LIVE_PROMPTS[0].query, "SECRET_ITAR");
    }
  }, [backendOnline]);

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    setIsUploading(true);
    setUploadBanner(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("security_classification", uploadClassification);

      const resp = await fetch(`${API_BASE}/api/v1/ingest/upload`, {
        method: "POST",
        body: formData,
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.detail || `Upload failed: ${resp.status}`);
      }
      const res = await resp.json();
      setUploadBanner(
        `✓ Indexed "${res.filename}" [${res.file_format}] (${res.chunks_created} chunks, ${res.part_numbers_extracted?.length || 0} part tags) into local Qdrant + BM25 in ${res.elapsed_ms}ms!`
      );
      await fetchBackendStatus();
      const suggestedQ = `Summarize the key technical specifications, tolerances, or part numbers in ${res.filename}.`;
      setQueryText(suggestedQ);
      await runLiveQuery(suggestedQ, clearanceLevel);
    } catch (err: any) {
      setUploadBanner(
        `⚠️ Upload error: ${err?.message || "Ensure Launch-Customer-Live-Demo.bat is running."}`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleScanDropzone = async () => {
    setIsScanningDropzone(true);
    setUploadBanner(null);
    try {
      const resp = await fetch(`${API_BASE}/api/v1/ingest/scan-dropzone`, {
        method: "POST",
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const res = await resp.json();
      setUploadBanner(
        `🚀 USB4 DROPZONE SYNC COMPLETE: Indexed ${res.files_indexed?.length || 0} multi-format customer files (${res.chunks_added} chunks) from 02_DROP_CUSTOMER_FILES_HERE in ${res.elapsed_ms}ms!`
      );
      await fetchBackendStatus();
      const multiFormatQ = PRESET_LIVE_PROMPTS[3].query;
      setQueryText(multiFormatQ);
      await runLiveQuery(multiFormatQ, "SECRET_ITAR");
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
      setUploadBanner(
        `🛡️ CRYPTOGRAPHIC WIPE VERIFIED: Purged ${res.removed_customer_chunks} customer session chunk(s) from Qdrant & BM25 in ${res.elapsed_ms}ms. Baseline demo vault intact.`
      );
      await fetchBackendStatus();
      setQueryText(PRESET_LIVE_PROMPTS[0].query);
      await runLiveQuery(PRESET_LIVE_PROMPTS[0].query, clearanceLevel);
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
                {indexedDocs.length || 5} Files ({totalChunks} Chunks)
              </span>{" "}
              • Formats:{" "}
              <span className="text-zeroTrustEmerald">
                PDF • DOCX • XLSX • CSV • PPTX • PNG/TIFF • LOG/JSON
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

      {/* Row 1: USB4 Customer Dropzone Shuttle + Multi-Format Drag & Drop + Vault Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): USB4 Dropzone Shuttle + Browser Multi-Format Drag & Drop */}
        <div className="lg:col-span-5 space-y-4">
          {/* USB4 Customer Dropzone Card */}
          <div className="p-5 rounded-2xl bg-slateDeep border-2 border-zeroTrustEmerald/60 space-y-3 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-zeroTrustEmerald/20 border border-zeroTrustEmerald flex items-center justify-center flex-shrink-0">
                  <HardDrive className="w-5 h-5 text-zeroTrustEmerald" />
                </div>
                <div>
                  <div className="font-mono text-[10px] text-zeroTrustEmerald font-bold uppercase">
                    // USB4 APPLIANCE DATA SHUTTLE WORKFLOW
                  </div>
                  <h3 className="font-bold text-white text-sm">
                    Folder: <code>02_DROP_CUSTOMER_FILES_HERE\</code>
                  </h3>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-obsidian border border-cardBorder font-mono text-[10px] text-tacticalCyan">
                {dropzoneReadyFiles.length} Files Staged
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Plug your USB4 drive into the customer&apos;s PC so they can drop{" "}
              <code className="text-white">
                .pdf, .docx, .xlsx, .csv, .pptx, .png, .log
              </code>{" "}
              files into <code>02_DROP_CUSTOMER_FILES_HERE\</code>, then click{" "}
              <strong className="text-zeroTrustEmerald">
                Sync &amp; Index USB4 Dropzone
              </strong>{" "}
              below:
            </p>

            <div className="flex flex-wrap gap-1.5">
              {dropzoneReadyFiles.map((fname) => (
                <span
                  key={fname}
                  className="px-2 py-0.5 rounded bg-obsidian border border-cardBorder font-mono text-[10px] text-gray-200"
                >
                  {fname}
                </span>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isScanningDropzone}
                onClick={handleScanDropzone}
                className="flex-1 py-2.5 px-3 rounded-xl bg-zeroTrustEmerald hover:bg-emerald-400 text-obsidian font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all"
              >
                <FolderSync
                  className={`w-4 h-4 ${
                    isScanningDropzone ? "animate-spin" : ""
                  }`}
                />
                <span>
                  {isScanningDropzone
                    ? "Indexing Dropzone..."
                    : "Sync & Index USB4 Dropzone"}
                </span>
              </button>

              <button
                type="button"
                disabled={isWipingVault || customerFilesCount === 0}
                onClick={handleWipeCustomerVault}
                title="Cryptographically purge customer session files from Qdrant & BM25 while keeping baseline demo PDFs"
                className="py-2.5 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 disabled:opacity-40 border border-rose-500/60 text-rose-200 font-mono font-bold text-xs uppercase flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Wipe Customer Files ({customerFilesCount})</span>
              </button>
            </div>
          </div>

          {/* Browser Multi-Format Drag & Drop Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dropped = e.dataTransfer.files?.[0] || null;
              handleFileUpload(dropped);
            }}
            className="p-4 rounded-2xl bg-slateDeep/90 border-2 border-dashed border-tacticalCyan/70 hover:border-tacticalCyan transition-all space-y-3"
          >
            <div className="flex items-center gap-3">
              <UploadCloud className="w-5 h-5 text-tacticalCyan flex-shrink-0" />
              <div>
                <h4 className="font-bold text-white text-xs sm:text-sm">
                  Or Drag &amp; Drop Any Single File Directly Here
                </h4>
                <p className="text-[11px] text-gray-400 font-mono">
                  Supports: .pdf, .docx, .xlsx, .csv, .pptx, .png, .jpg, .tiff,
                  .log, .txt, .json
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-cardBorder/60">
              <select
                aria-label="Security Classification Banner for Uploaded File"
                value={uploadClassification}
                onChange={(e) => setUploadClassification(e.target.value)}
                className="px-2.5 py-1 rounded bg-obsidian border border-cardBorder font-mono text-[11px] text-zeroTrustEmerald"
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
                accept=".pdf,.docx,.xlsx,.csv,.pptx,.png,.jpg,.jpeg,.tiff,.tif,.txt,.md,.log,.json,.xml,.yaml,.yml"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-tacticalCyan hover:bg-cyan-400 text-obsidian font-mono font-bold text-xs uppercase tracking-wider transition-all"
              >
                {isUploading ? "Indexing..." : "+ Browse File"}
              </button>
            </div>
          </div>

          {uploadBanner && (
            <div className="p-3 rounded-xl bg-zeroTrustEmerald/15 border border-zeroTrustEmerald/50 font-mono text-xs text-zeroTrustEmerald">
              {uploadBanner}
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Active Indexed Vault Inventory + CAC Smartcard ABAC Toggle */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slateDeep/90 border border-cardBorder flex flex-col justify-between gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-mono text-xs text-tacticalCyan font-bold uppercase">
                // ACTIVE LOCAL QDRANT + BM25 MULTI-FORMAT VAULT (
                {indexedDocs.length || 5} FILES)
              </div>
              <p className="text-xs text-gray-300">
                Baseline demo PDFs + any customer files synced from{" "}
                <code className="text-zeroTrustEmerald">
                  02_DROP_CUSTOMER_FILES_HERE\
                </code>
                :
              </p>
            </div>

            {/* Live CAC Smartcard ABAC Toggle */}
            <div className="flex items-center gap-1.5 bg-obsidian p-1.5 rounded-xl border border-cardBorder">
              <button
                type="button"
                onClick={() => {
                  setClearanceLevel("SECRET_ITAR");
                  runLiveQuery(queryText, "SECRET_ITAR");
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all ${
                  clearanceLevel === "SECRET_ITAR"
                    ? "bg-zeroTrustEmerald text-obsidian"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                🔓 CAC: SECRET // ITAR
              </button>
              <button
                type="button"
                onClick={() => {
                  setClearanceLevel("SUBCONTRACTOR_CUI");
                  runLiveQuery(queryText, "SUBCONTRACTOR_CUI");
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all ${
                  clearanceLevel === "SUBCONTRACTOR_CUI"
                    ? "bg-warningAmber text-obsidian"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                🔒 CAC: SUBCONTRACTOR CUI
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[310px] overflow-y-auto pr-1">
            {(indexedDocs.length > 0
              ? indexedDocs
              : [
                  {
                    filename: "Turbine_Master_Overhaul_Manual_Rev4.pdf",
                    file_format: "PDF",
                    is_customer_file: false,
                    total_pages: 4,
                    chunks_count: 4,
                    security_classification: "CUI // NOFORN // ITAR",
                    part_numbers: ["MS90725-114", "NAS1149-F0832P", "AN6227-23"],
                  },
                  {
                    filename: "ECO-2026-089_Flange_Supersession.pdf",
                    file_format: "PDF",
                    is_customer_file: false,
                    total_pages: 1,
                    chunks_count: 1,
                    security_classification: "CUI // NOFORN",
                    part_numbers: ["ECO-2026-089", "NAS1149-F0832P"],
                  },
                  {
                    filename: "Radar_Waveguide_Assembly_SECRET_ITAR.pdf",
                    file_format: "PDF",
                    is_customer_file: false,
                    total_pages: 1,
                    chunks_count: 1,
                    security_classification: "SECRET // ITAR // NOFORN",
                    part_numbers: ["MIL-W-85", "MS16998-44L"],
                  },
                  {
                    filename: "EUV_Scanner_Vacuum_Service_Manual.pdf",
                    file_format: "PDF",
                    is_customer_file: false,
                    total_pages: 1,
                    chunks_count: 1,
                    security_classification: "CUI // PROPRIETARY",
                    part_numbers: ["VCR-88210-SS"],
                  },
                  {
                    filename: "BLA_Biologics_ColdChain_Validation.pdf",
                    file_format: "PDF",
                    is_customer_file: false,
                    total_pages: 1,
                    chunks_count: 1,
                    security_classification: "CUI // FDA-GMP",
                    part_numbers: ["BIO-9941", "CAPA-2026-019"],
                  },
                ]
            ).map((doc) => {
              const isSecret = doc.security_classification.includes("SECRET");
              const isBlocked =
                isSecret && clearanceLevel === "SUBCONTRACTOR_CUI";
              return (
                <div
                  key={doc.filename}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 font-mono text-xs ${
                    isBlocked
                      ? "bg-rose-950/30 border-rose-500/50 opacity-75"
                      : doc.is_customer_file
                      ? "bg-zeroTrustEmerald/10 border-zeroTrustEmerald/50"
                      : "bg-obsidian/90 border-cardBorder"
                  }`}
                >
                  <div className="truncate">
                    <div className="text-white font-bold truncate flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-tacticalCyan flex-shrink-0" />
                      <span className="truncate">{doc.filename}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {doc.file_format || "PDF"} • {doc.chunks_count} Chunk(s){" "}
                      {doc.is_customer_file ? "• [USB DROPZONE]" : ""}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${
                      isBlocked
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : isSecret
                        ? "bg-warningAmber/20 text-warningAmber border border-warningAmber/40"
                        : "bg-zeroTrustEmerald/15 text-zeroTrustEmerald"
                    }`}
                  >
                    {isBlocked
                      ? "ABAC BLOCKED"
                      : isSecret
                      ? "SECRET//ITAR"
                      : "CUI"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: One-Click Customer Test Scenarios + Live Query Bar */}
      <div className="p-5 rounded-2xl bg-slateDeep border border-cardBorder space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs text-tacticalCyan font-bold uppercase">
            // ONE-CLICK LIVE CUSTOMER TEST PROMPTS (OR TYPE ANY QUESTION BELOW):
          </span>
          <span className="font-mono text-[11px] text-gray-400">
            Executes Real Qdrant + BM25 + Ollama Inference on Your RTX 4090
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {PRESET_LIVE_PROMPTS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setQueryText(preset.query);
                setClearanceLevel(preset.recommendedClearance);
                runLiveQuery(preset.query, preset.recommendedClearance);
              }}
              className="text-left p-3 rounded-xl bg-obsidian hover:bg-cardSurface border border-cardBorder hover:border-tacticalCyan transition-all flex flex-col justify-between"
            >
              <div className="font-mono text-[10px] text-tacticalCyan font-bold mb-1">
                {preset.sector}
              </div>
              <div className="text-xs font-bold text-white leading-snug">
                {preset.label}
              </div>
            </button>
          ))}
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
              placeholder="Ask any technical question across your PDFs, Excel BOMs, Word SOPs, CAD drawings, or SCADA logs..."
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
                ? "Running RTX 4090 RAG..."
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
                  blocked inside Qdrant before LLM inference. Switch CAC
                  Smartcard toggle to <code>SECRET // ITAR</code> to unlock.
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-obsidian border border-cardBorder min-h-[140px] flex items-center">
              {isQuerying ? (
                <div className="space-y-2 w-full">
                  <div className="font-mono text-xs text-tacticalCyan animate-pulse">
                    ● Executing Stage-1 Qdrant + BM25 ➔ Stage-2 Reranker ➔ Local
                    Ollama RTX 4090 Generation...
                  </div>
                  <div className="w-full h-2 rounded-full bg-slateDeep overflow-hidden">
                    <div className="h-full w-2/3 bg-tacticalCyan animate-pulse" />
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
                            {cit.file_format || "PDF"}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slateDeep text-[10px] text-warningAmber">
                            {cit.element_type}
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
                <span>Open Source File ({activeCitation.source_file})</span>
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
                  {activeCitation.file_format || "PDF"} • P.{" "}
                  {activeCitation.page_number}/{activeCitation.total_pages}
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
                EXTRACTED PART TAGS:{" "}
                <strong className="text-tacticalCyan">
                  {activeCitation.part_numbers.join(", ") || "N/A"}
                </strong>
              </span>
              <span className="text-zeroTrustEmerald">
                ● MULTI-FORMAT BBOX LOCK
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
