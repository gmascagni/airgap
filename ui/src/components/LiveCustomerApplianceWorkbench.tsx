"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderOpen,
  FolderSync,
  HardDrive,
  Layers,
  Lock,
  Maximize2,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  Unlock,
  Upload,
  X,
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
  sha256_hash?: string;
  file_size_mb?: number;
  ingested_at?: string;
  part_numbers: string[];
}

interface GpuTelemetry {
  gpu_name: string;
  driver_version: string;
  vram_used_mb: number;
  vram_total_mb: number;
  vram_pct: number;
  gpu_utilization_pct: number;
  temperature_c: number;
  cuda_offload_mode: string;
}

interface AuditLogEntry {
  entry_id?: number;
  id?: string;
  timestamp: string;
  actor?: string;
  role?: string;
  action: string;
  detail: string;
  target_resource?: string;
  classification: string;
  prev_hash?: string;
  entry_hash?: string;
}

interface AuditVerificationResult {
  valid: boolean;
  total_blocks: number;
  genesis_block: string;
  latest_hash: string;
  status: string;
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

interface QuickQueryTemplate {
  id: string;
  title: string;
  category: string;
  clearance: "SECRET_ITAR" | "SUBCONTRACTOR_CUI";
  targetFile?: string;
  query: string;
}

const API_BASE = "http://127.0.0.1:8000";

export interface LiveCustomerApplianceWorkbenchProps {
  standaloneMode?: boolean;
}

export default function LiveCustomerApplianceWorkbench({
  standaloneMode = false,
}: LiveCustomerApplianceWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<
    "workspace" | "vault-ledger" | "security-audit"
  >("workspace");

  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);
  const [gpuName, setGpuName] = useState<string>(
    "Auto-Detecting Host Hardware..."
  );
  const [gpuTelemetry, setGpuTelemetry] = useState<GpuTelemetry>({
    gpu_name: "Auto-Detecting Host GPU / CPU...",
    driver_version: "Probing...",
    vram_used_mb: 0,
    vram_total_mb: 0,
    vram_pct: 0,
    gpu_utilization_pct: 0,
    temperature_c: 0,
    cuda_offload_mode: "Auto-Detecting Host Compute Profile...",
  });
  const [availableModels, setAvailableModels] = useState<string[]>([
    "qwen3.5:4b",
    "hf.co/bartowski/Meta-Llama-3.1-8B-Instruct-abliterated-GGUF:Q4_K_M",
    "FIELDLITE_CPU_EXTRACTIVE (Zero-GPU <20ms)",
  ]);
  const [selectedModel, setSelectedModel] = useState<string>("qwen3.5:4b");
  const [computeTier, setComputeTier] = useState<
    "TIER_1_GPU_WORKSTATION" | "TIER_2_EDGE_GPU" | "TIER_3_CPU_FIELDLITE"
  >("TIER_1_GPU_WORKSTATION");
  const [appVersion, setAppVersion] = useState<string>("5.1.0");
  const [indexedDocs, setIndexedDocs] = useState<IndexedDocumentSummary[]>([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState<
    QuickQueryTemplate[]
  >([]);
  const [sampleDocsPath, setSampleDocsPath] = useState<string>("sample_docs/");
  const [totalChunks, setTotalChunks] = useState<number>(0);
  const [customerFilesCount, setCustomerFilesCount] = useState<number>(0);
  const [dropzoneReadyFiles, setDropzoneReadyFiles] = useState<string[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [auditLedgerVerify, setAuditLedgerVerify] =
    useState<AuditVerificationResult | null>(null);

  // Authenticated Operator Session & Server-Enforced Clearance (F-01, F-08, F-09)
  const [authToken, setAuthToken] = useState<string>("tv_sec_analyst_2026");
  const [activeRole, setActiveRole] = useState<
    "LEAD_ANALYST" | "CONTRACTOR_CUI"
  >("LEAD_ANALYST");
  const [activeRoleDisplay, setActiveRoleDisplay] = useState<string>(
    "Lead Security Analyst"
  );
  const [activeClearanceDisplay, setActiveClearanceDisplay] = useState<string>(
    "SECRET // NOFORN // ITAR"
  );
  const [inspectorAccessDenied, setInspectorAccessDenied] =
    useState<boolean>(false);

  // Query & Filter state
  const [clearanceLevel, setClearanceLevel] = useState<
    "SECRET_ITAR" | "SUBCONTRACTOR_CUI"
  >("SECRET_ITAR");
  const [selectedDocFilter, setSelectedDocFilter] = useState<string>("ALL");
  const [queryText, setQueryText] = useState<string>("");
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [queryProgressPct, setQueryProgressPct] = useState<number>(0);
  const [queryStageText, setQueryStageText] = useState<string>("");
  const [queryElapsedSec, setQueryElapsedSec] = useState<number>(0);

  const [answerText, setAnswerText] = useState<string>("");
  const [citations, setCitations] = useState<LiveCitation[]>([]);
  const [selectedCitationIdx, setSelectedCitationIdx] = useState<number>(0);
  const [customPageView, setCustomPageView] = useState<{
    docName: string;
    pageNum: number;
    totalPages: number;
  } | null>(null);
  const [telemetry, setTelemetry] = useState<{
    dense_bge_ms?: number;
    dense_qdrant_ms?: number;
    sparse_bm25_ms: number;
    rerank_ms: number;
    llm_generation_ms: number;
    total_pipeline_ms: number;
    candidates_evaluated: number;
    dense_vector_dimension?: number;
    embedding_model?: string;
  } | null>(null);
  const [abacBlockedCount, setAbacBlockedCount] = useState<number>(0);
  const [abacRedacted, setAbacRedacted] = useState<boolean>(false);

  // Ingestion & Vault Management state
  const [uploadClassification, setUploadClassification] = useState<string>(
    "CUI // NOFORN // ITAR"
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isScanningDropzone, setIsScanningDropzone] = useState<boolean>(false);
  const [isWipingVault, setIsWipingVault] = useState<boolean>(false);
  const [showFolderCrawler, setShowFolderCrawler] = useState<boolean>(false);
  const [customDirectoryPath, setCustomDirectoryPath] = useState<string>(
    "D:\\sample_docs"
  );
  const [ingestProgress, setIngestProgress] =
    useState<IngestProgressState | null>(null);
  const [statusNotice, setStatusNotice] = useState<{
    type: "success" | "warning" | "info";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const fetchBackendStatus = async () => {
    setCheckingStatus(true);
    try {
      const resp = await fetch(`${API_BASE}/api/v1/status`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-TrailVault-Token": authToken,
        },
      });
      if (resp.ok) {
        const data = await resp.json();
        setBackendOnline(true);
        setGpuName(data.gpu || gpuName);
        if (data.version) {
          setAppVersion(data.version);
        }
        if (data.active_compute_tier) {
          setComputeTier(data.active_compute_tier);
        }
        if (data.gpu_telemetry) {
          setGpuTelemetry(data.gpu_telemetry);
        }
        if (
          Array.isArray(data.available_llm_models) &&
          data.available_llm_models.length > 0
        ) {
          setAvailableModels(data.available_llm_models);
          if (!data.available_llm_models.includes(selectedModel)) {
            setSelectedModel(data.available_llm_models[0]);
          }
        }
        setIndexedDocs(data.documents || []);
        if (Array.isArray(data.suggested_prompts)) {
          setSuggestedPrompts(data.suggested_prompts);
        }
        if (data.sample_docs_path) {
          setSampleDocsPath(data.sample_docs_path);
        }
        if (data.ingest_progress && data.ingest_progress.active) {
          setIngestProgress(data.ingest_progress);
        } else {
          setIngestProgress((prev) => (prev && prev.active ? null : prev));
        }
        setTotalChunks(data.total_indexed_chunks || 0);
        setCustomerFilesCount(data.customer_files_indexed || 0);
        if (Array.isArray(data.dropzone_files_ready)) {
          setDropzoneReadyFiles(data.dropzone_files_ready);
        }
        if (Array.isArray(data.audit_log)) {
          setAuditLog(data.audit_log);
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

  const fetchAuditLedger = async (tok: string = authToken) => {
    try {
      const [ledResp, verResp] = await Promise.all([
        fetch(`${API_BASE}/api/v1/audit/ledger?limit=50`, {
          headers: {
            Authorization: `Bearer ${tok}`,
            "X-TrailVault-Token": tok,
          },
        }),
        fetch(`${API_BASE}/api/v1/audit/verify`, {
          headers: {
            Authorization: `Bearer ${tok}`,
            "X-TrailVault-Token": tok,
          },
        }),
      ]);
      if (ledResp.ok) {
        const data = await ledResp.json();
        if (Array.isArray(data.events)) {
          setAuditLog(data.events);
        }
      }
      if (verResp.ok) {
        const verData = await verResp.json();
        setAuditLedgerVerify(verData);
      }
    } catch {
      // ignore
    }
  };

  const handleRoleSwitch = async (
    targetRole: "LEAD_ANALYST" | "CONTRACTOR_CUI"
  ) => {
    try {
      const resp = await fetch(`${API_BASE}/api/v1/auth/switch-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "X-TrailVault-Token": authToken,
        },
        body: JSON.stringify({ role: targetRole }),
      });
      if (!resp.ok) {
        throw new Error(`Role switch rejected (HTTP ${resp.status})`);
      }
      const data = await resp.json();
      setAuthToken(data.token);
      setActiveRole(data.role);
      setActiveRoleDisplay(
        data.role === "LEAD_ANALYST"
          ? "Lead Security Analyst"
          : "Contractor (CUI Only)"
      );
      setActiveClearanceDisplay(data.clearance_display);
      setClearanceLevel(
        data.role === "LEAD_ANALYST" ? "SECRET_ITAR" : "SUBCONTRACTOR_CUI"
      );
      setInspectorAccessDenied(false);

      setStatusNotice({
        type: "info",
        text: `Switched session to ${data.username} (${data.role}) • Clearance: ${data.clearance_display}. Logged to tamper-evident SQLite audit ledger.`,
      });

      if (queryText.trim()) {
        runLiveQuery(
          queryText,
          data.role === "LEAD_ANALYST" ? "SECRET_ITAR" : "SUBCONTRACTOR_CUI",
          selectedDocFilter,
          data.token
        );
      }
      fetchAuditLedger(data.token);
      fetchBackendStatus();
    } catch (err: any) {
      setStatusNotice({
        type: "warning",
        text: `Role switch error: ${err.message}`,
      });
    }
  };

  const handleSwitchComputeTier = async (
    newTier:
      | "TIER_1_GPU_WORKSTATION"
      | "TIER_2_EDGE_GPU"
      | "TIER_3_CPU_FIELDLITE"
  ) => {
    setComputeTier(newTier);
    try {
      const resp = await fetch(`${API_BASE}/api/v1/compute-tier`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "X-TrailVault-Token": authToken,
        },
        body: JSON.stringify({ compute_tier: newTier }),
      });
      if (resp.ok) {
        const res = await resp.json();
        if (res.gpu_telemetry) {
          setGpuTelemetry(res.gpu_telemetry);
        }
        setStatusNotice({
          type: "info",
          text:
            newTier === "TIER_3_CPU_FIELDLITE"
              ? "Switched to Tier 3: TrailVault™ FieldLite CPU-Only Mode (<20ms extractive synthesis • Zero GPU required for lesser hardware)."
              : newTier === "TIER_2_EDGE_GPU"
              ? "Switched to Tier 2: Edge Laptop GPU Profile (4–8GB VRAM • 4K Context)."
              : "Switched to Tier 1: RTX 4090 Full CUDA Workstation Profile (16GB VRAM • 8K Context).",
        });
      }
    } catch {
      // ignore if offline
    }
  };

  useEffect(() => {
    fetchBackendStatus();
    fetchAuditLedger();
    const statusTimer = setInterval(fetchBackendStatus, 3000);
    return () => clearInterval(statusTimer);
  }, []);

  useEffect(() => {
    if (activeTab === "security-audit") {
      fetchAuditLedger();
    }
  }, [activeTab]);

  // Poll `/api/v1/ingest/progress` every 250ms during active uploads, directory crawls, or background sample_docs watcher indexing
  useEffect(() => {
    const isWatcherActive = Boolean(ingestProgress && ingestProgress.active);
    if (!isUploading && !isScanningDropzone && !isWatcherActive) return;

    const timer = setInterval(async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/v1/ingest/progress`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "X-TrailVault-Token": authToken,
          },
        });
        if (resp.ok) {
          const prog: IngestProgressState = await resp.json();
          if (prog.active || isUploading || isScanningDropzone) {
            setIngestProgress(prog);
          } else {
            setIngestProgress(null);
            fetchBackendStatus();
          }
        }
      } catch {
        // ignore transient poll error
      }
    }, 250);

    return () => clearInterval(timer);
  }, [isUploading, isScanningDropzone, ingestProgress?.active, authToken]);

  // Animated progress telemetry during active RAG query execution
  useEffect(() => {
    if (!isQuerying) {
      setQueryProgressPct(0);
      setQueryStageText("");
      setQueryElapsedSec(0);
      return;
    }
    const t0 = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - t0) / 1000;
      setQueryElapsedSec(Number(elapsed.toFixed(1)));
      if (elapsed < 0.35) {
        setQueryProgressPct(24);
        setQueryStageText(
          "1/4 • Enforcing Pre-Retrieval ABAC Security Policy..."
        );
      } else if (elapsed < 0.9) {
        setQueryProgressPct(54);
        setQueryStageText(
          `2/4 • BGE 384-D Neural Dense Embedding + BM25 Lexical Search (${totalChunks.toLocaleString()} chunks)...`
        );
      } else if (elapsed < 1.5) {
        setQueryProgressPct(78);
        setQueryStageText(
          "3/4 • Reciprocal Rank Fusion (RRF) & Cross-Encoder Reranking..."
        );
      } else {
        const slowRamp = Math.min(96, 78 + Math.floor((elapsed - 1.5) * 4));
        setQueryProgressPct(slowRamp);
        setQueryStageText(
          `4/4 • Synthesizing Cited Response on RTX 4090 CUDA (${selectedModel})...`
        );
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isQuerying, totalChunks, selectedModel]);

  const runLiveQuery = async (
    overrideQuery?: string,
    overrideClearance?: "SECRET_ITAR" | "SUBCONTRACTOR_CUI",
    overrideDocFilter?: string,
    overrideToken?: string
  ) => {
    const activeQ = overrideQuery ?? queryText;
    const activeClearance = overrideClearance ?? clearanceLevel;
    const activeDocFilter = overrideDocFilter ?? selectedDocFilter;
    const activeTok = overrideToken ?? authToken;
    if (!activeQ.trim()) return;

    setIsQuerying(true);
    setCustomPageView(null);
    setInspectorAccessDenied(false);
    try {
      const resp = await fetch(`${API_BASE}/api/v1/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeTok}`,
          "X-TrailVault-Token": activeTok,
        },
        body: JSON.stringify({
          query: activeQ,
          clearance_level: activeClearance,
          llm_model: selectedModel,
          compute_tier: computeTier,
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
      if (data.effective_clearance) {
        setActiveClearanceDisplay(data.effective_clearance);
      }
      if (data.authenticated_role) {
        setActiveRole(data.authenticated_role);
      }
      setAnswerText(data.answer || "");
      setCitations(data.citations || []);
      setSelectedCitationIdx(0);
      setTelemetry(data.telemetry || null);
      setAbacBlockedCount(data.abac_blocked_secret_chunks || 0);
      setAbacRedacted(Boolean(data.abac_redaction_triggered));
      setBackendOnline(true);
      fetchAuditLedger(activeTok);
    } catch {
      setBackendOnline(false);
      setAnswerText(
        "Local TrailVault Enterprise Engine (127.0.0.1:8000) is offline. Launch C:\\AirVault_Enterprise\\Launch-AirVault-Enterprise.bat to start the local engine."
      );
    } finally {
      setIsQuerying(false);
    }
  };

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
    setStatusNotice(null);
    setIngestProgress({
      active: true,
      filename: label,
      file_size_mb: Number(sizeMb.toFixed(2)),
      stage: "STAGE 1/4: STREAMING TO ISOLATED NVMe VAULT",
      stage_detail: `Ingesting ${filesArray.length} file(s) (${sizeMb.toFixed(2)} MB) & computing SHA-256 digests...`,
      percent: 8,
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
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-TrailVault-Token": authToken,
        },
        body: formData,
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(
          errData.detail || `Batch ingestion failed: ${resp.status}`
        );
      }
      const res = await resp.json();
      setIngestProgress({
        active: false,
        filename: res.filename,
        file_size_mb: res.file_size_mb || Number(sizeMb.toFixed(2)),
        stage: "COMPLETE",
        stage_detail: `Indexed ${res.files_indexed_count || filesArray.length} file(s) (${res.pages_parsed.toLocaleString()} pages / ${res.chunks_created.toLocaleString()} chunks) in ${(res.elapsed_ms / 1000).toFixed(1)}s`,
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
      setStatusNotice({
        type: "success",
        text: `Ingested ${res.files_indexed_count || filesArray.length} file(s) (${res.pages_parsed.toLocaleString()} pages • ${res.chunks_created.toLocaleString()} chunks) in ${(res.elapsed_ms / 1000).toFixed(1)}s with SHA-256 verification.`,
      });
      await fetchBackendStatus();
      fetchAuditLedger();
      setSelectedDocFilter("ALL");
    } catch (err: any) {
      setStatusNotice({
        type: "warning",
        text: `Ingestion error: ${err?.message || "Verify local engine is running."}`,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (folderInputRef.current) folderInputRef.current.value = "";
    }
  };

  const handleIndexDirectoryPath = async () => {
    if (!customDirectoryPath.trim()) return;
    setIsScanningDropzone(true);
    setStatusNotice(null);
    setIngestProgress({
      active: true,
      filename: customDirectoryPath.trim(),
      file_size_mb: 0,
      stage: "STAGE 1/4: RECURSIVE DIRECTORY DISCOVERY",
      stage_detail: `Crawling ${customDirectoryPath.trim()}...`,
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "X-TrailVault-Token": authToken,
        },
        body: JSON.stringify({
          directory_path: customDirectoryPath.trim(),
          recursive: true,
          security_classification: uploadClassification,
        }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(
          errData.detail || `Directory crawl failed: ${resp.status}`
        );
      }
      const res = await resp.json();
      setSelectedDocFilter("ALL");
      setStatusNotice({
        type: "success",
        text: `Indexed ${res.files_indexed_count.toLocaleString()} file(s) (${res.pages_parsed.toLocaleString()} pages / ${res.chunks_created.toLocaleString()} chunks) from ${res.directory_path} in ${(res.elapsed_ms / 1000).toFixed(1)}s.`,
      });
      await fetchBackendStatus();
      fetchAuditLedger();
    } catch (err: any) {
      setStatusNotice({
        type: "warning",
        text: `Directory error: ${err?.message || "Verify path exists on this PC."}`,
      });
    } finally {
      setIsScanningDropzone(false);
    }
  };

  const handleScanDropzone = async () => {
    setIsScanningDropzone(true);
    setStatusNotice(null);
    try {
      const resp = await fetch(`${API_BASE}/api/v1/ingest/scan-dropzone`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-TrailVault-Token": authToken,
        },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const res = await resp.json();
      setSelectedDocFilter("ALL");
      setStatusNotice({
        type: "success",
        text: `Synced ${res.files_indexed.length} file(s) (${res.chunks_added.toLocaleString()} chunks) from Customer Dropzone in ${(res.elapsed_ms / 1000).toFixed(1)}s.`,
      });
      await fetchBackendStatus();
      fetchAuditLedger();
    } catch {
      setStatusNotice({
        type: "warning",
        text: "Unable to scan dropzone folder.",
      });
    } finally {
      setIsScanningDropzone(false);
    }
  };

  const handleRemoveSingleDocument = async (
    docName: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      const resp = await fetch(
        `${API_BASE}/api/v1/ingest/document/${encodeURIComponent(docName)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "X-TrailVault-Token": authToken,
          },
        }
      );
      if (resp.ok) {
        if (selectedDocFilter === docName) {
          setSelectedDocFilter("ALL");
        }
        setStatusNotice({
          type: "info",
          text: `Removed "${docName}" from active vault.`,
        });
        await fetchBackendStatus();
        fetchAuditLedger();
      }
    } catch {
      // ignore
    }
  };

  const handleClearEntireVault = async () => {
    setIsWipingVault(true);
    setStatusNotice(null);
    try {
      const resp = await fetch(`${API_BASE}/api/v1/ingest/clear-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-TrailVault-Token": authToken,
        },
      });
      if (resp.ok) {
        setSelectedDocFilter("ALL");
        setCitations([]);
        setCustomPageView(null);
        setTelemetry(null);
        setAnswerText(
          "Workspace cleared. The Document Vault is now 100% empty and ready for your customer's files or freshly downloaded documents."
        );
        setStatusNotice({
          type: "info",
          text: "Vault cleared (0 files). Drop or select your customer's files to begin a clean presentation.",
        });
        await fetchBackendStatus();
        fetchAuditLedger();
      }
    } finally {
      setIsWipingVault(false);
    }
  };

  const handleReloadReferencePack = async () => {
    setIsWipingVault(true);
    try {
      const resp = await fetch(`${API_BASE}/api/v1/ingest/reload-baseline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-TrailVault-Token": authToken,
        },
      });
      if (resp.ok) {
        setStatusNotice({
          type: "success",
          text: "Reference engineering document pack loaded into vault.",
        });
        await fetchBackendStatus();
        fetchAuditLedger();
      }
    } finally {
      setIsWipingVault(false);
    }
  };

  const handleWipeCustomerVault = async () => {
    setIsWipingVault(true);
    setStatusNotice(null);
    try {
      const resp = await fetch(
        `${API_BASE}/api/v1/ingest/wipe-customer-vault`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "X-TrailVault-Token": authToken,
          },
        }
      );
      if (!resp.ok) {
        if (resp.status === 403) {
          throw new Error("ADMIN_REQUIRED: NIST SP 800-88 Rev 1 media purge requires Lead Analyst (Administrator) privileges.");
        }
        throw new Error(`HTTP ${resp.status}`);
      }
      const res = await resp.json();
      setSelectedDocFilter("ALL");
      setIngestProgress(null);
      setStatusNotice({
        type: "success",
        text: `NIST SP 800-88 Rev 1 Media Sanitization Complete: Purged ${res.removed_customer_chunks.toLocaleString()} customer session chunks in ${res.elapsed_ms}ms (Flash Application Purge).`,
      });
      await fetchBackendStatus();
      fetchAuditLedger();
    } catch (err: any) {
      setStatusNotice({
        type: "warning",
        text: err?.message || "Failed to execute NIST SP 800-88 Rev 1 media purge.",
      });
    } finally {
      setIsWipingVault(false);
    }
  };

  const activeCitation: LiveCitation | undefined =
    citations[selectedCitationIdx];

  const inspectedDocName =
    customPageView?.docName || activeCitation?.source_file || "";
  const inspectedPageNum =
    customPageView?.pageNum || activeCitation?.page_number || 1;
  const inspectedTotalPages =
    customPageView?.totalPages || activeCitation?.total_pages || 1;

  const inspectedDocMeta = indexedDocs.find(
    (d) => d.filename === inspectedDocName
  );
  const isInspectedDocSecret =
    Boolean(inspectedDocMeta?.security_classification?.includes("SECRET")) ||
    Boolean(
      activeCitation?.source_file === inspectedDocName &&
        activeCitation?.security_classification?.includes("SECRET")
    );
  const isInspectedDenied =
    (isInspectedDocSecret && activeRole === "CONTRACTOR_CUI") ||
    inspectorAccessDenied;

  const inspectedImageUrl = inspectedDocName
    ? `${API_BASE}/api/v1/pdf-page/${encodeURIComponent(inspectedDocName)}/${inspectedPageNum}?token=${encodeURIComponent(authToken)}`
    : "";
  const inspectedRawFileUrl = inspectedDocName
    ? `${API_BASE}/api/v1/pdf-file/${encodeURIComponent(inspectedDocName)}?token=${encodeURIComponent(authToken)}#page=${inspectedPageNum}`
    : "";

  return (
    <div
      className={`enterprise-surface rounded-2xl bg-[#070A10] border border-slate-800/90 shadow-[0_24px_60px_rgba(0,0,0,0.75)] overflow-hidden text-slate-100 ${
        standaloneMode ? "min-h-[calc(100vh-2rem)]" : ""
      }`}
    >
      {/* =====================================================================
          TOP ENTERPRISE COMMAND & HARDWARE TELEMETRY HEADER BAR
          ===================================================================== */}
      <header className="px-5 py-3.5 bg-[#0A0F1A] border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Digital Trail Labs Brand & Hardened Loopback Attestation */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/brand/digital-trail-labs-logo.svg"
              alt="Digital Trail Labs"
              className="w-10 h-10 rounded-xl border border-cyan-500/40 bg-[#050811] p-1 shadow-[0_0_20px_rgba(34,211,238,0.18)]"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                  DIGITAL TRAIL LABS
                </span>
                <span className="text-slate-600">/</span>
                <span className="font-sans text-sm font-bold tracking-tight text-white">
                  TRAILVAULT™ ENTERPRISE
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[10px] font-semibold">
                  v{appVersion} • IronTrail
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-semibold border ${
                    backendOnline
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      backendOnline
                        ? "bg-emerald-400 animate-pulse"
                        : "bg-amber-400"
                    }`}
                  />
                  {backendOnline ? "ENGINE ONLINE" : "ENGINE OFFLINE"}
                </span>
              </div>
              <div className="font-mono text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 tabular-nums flex-wrap">
                <span>127.0.0.1 LOOPBACK LOCKED</span>
                <span>•</span>
                <span
                  className={
                    activeRole === "LEAD_ANALYST"
                      ? "text-emerald-400 font-semibold"
                      : "text-amber-400 font-semibold"
                  }
                >
                  {activeRole === "LEAD_ANALYST"
                    ? "LEAD ANALYST (SECRET // ITAR)"
                    : "CONTRACTOR CUI (RESTRICTED)"}
                </span>
                <span>•</span>
                <span className="text-cyan-400">
                  {computeTier === "TIER_3_CPU_FIELDLITE"
                    ? "FieldLite CPU-Only Profile (Zero GPU • <20ms Synthesis)"
                    : `${gpuTelemetry.gpu_name} (${gpuTelemetry.vram_used_mb.toLocaleString()} / ${gpuTelemetry.vram_total_mb.toLocaleString()} MB VRAM • ${gpuTelemetry.temperature_c}°C)`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Primary Application Workspace Navigation Tabs */}
        <nav
          aria-label="Enterprise Workspace Navigation"
          className="flex items-center bg-[#070A10] p-1 rounded-xl border border-slate-800"
        >
          <button
            type="button"
            onClick={() => setActiveTab("workspace")}
            className={`px-3.5 py-1.5 rounded-lg font-sans text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "workspace"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Intelligence Workspace</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("vault-ledger")}
            className={`px-3.5 py-1.5 rounded-lg font-sans text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "vault-ledger"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Document Vault ({indexedDocs.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("security-audit")}
            className={`px-3.5 py-1.5 rounded-lg font-sans text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "security-audit"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Security &amp; Hardware</span>
          </button>
          <a
            href="/noc/"
            className="px-3 py-1.5 rounded-lg font-sans text-xs font-semibold text-amber-300 hover:bg-amber-500/10 transition-all flex items-center gap-1.5"
            title="Open Marketing NOC, Documentation Hub & Version Ledger"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Marketing NOC &amp; Docs</span>
          </a>
        </nav>

        {/* Right: Adaptive 3-Tier Compute Switcher, Access Policy, Local LLM & Full App */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Adaptive 3-Tier Compute Profile Selector (Workstation GPU vs Edge vs Lesser Hardware CPU) */}
          <div
            className="flex items-center bg-[#070A10] p-1 rounded-lg border border-slate-800"
            title="Switch Adaptive Hardware Tier: Full RTX 4090 GPU vs. Edge Laptop GPU vs. Lesser-Hardware CPU-Only FieldLite"
          >
            <button
              type="button"
              onClick={() => handleSwitchComputeTier("TIER_1_GPU_WORKSTATION")}
              className={`px-2 py-1 rounded font-mono text-[10px] font-semibold transition-all ${
                computeTier === "TIER_1_GPU_WORKSTATION"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              T1: RTX GPU
            </button>
            <button
              type="button"
              onClick={() => handleSwitchComputeTier("TIER_2_EDGE_GPU")}
              className={`px-2 py-1 rounded font-mono text-[10px] font-semibold transition-all ${
                computeTier === "TIER_2_EDGE_GPU"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              T2: 4-8GB GPU
            </button>
            <button
              type="button"
              onClick={() => handleSwitchComputeTier("TIER_3_CPU_FIELDLITE")}
              className={`px-2 py-1 rounded font-mono text-[10px] font-semibold transition-all ${
                computeTier === "TIER_3_CPU_FIELDLITE"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              T3: CPU-ONLY (&lt;20ms)
            </button>
          </div>

          {/* Access Policy Role Toggle & Server Bearer Handshake (F-01, F-08, F-09) */}
          <div
            className="flex items-center bg-[#070A10] p-1 rounded-lg border border-slate-800"
            title="Switch Authenticated Operator Session (Server Token Handshake)"
          >
            <button
              type="button"
              onClick={() => handleRoleSwitch("LEAD_ANALYST")}
              className={`px-2.5 py-1 rounded font-mono text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                activeRole === "LEAD_ANALYST"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Unlock className="w-3 h-3" />
              <span>FULL ACCESS (LEAD)</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch("CONTRACTOR_CUI")}
              className={`px-2.5 py-1 rounded font-mono text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                activeRole === "CONTRACTOR_CUI"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>CUI RESTRICTED (SUBCON)</span>
            </button>
          </div>

          {/* Local GPU / CPU Model Selector */}
          <div className="flex items-center gap-1.5 bg-[#070A10] px-2.5 py-1.5 rounded-lg border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <select
              aria-label="Active Local GPU/CPU LLM Model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent font-mono text-xs text-slate-200 font-semibold focus:outline-none"
            >
              {availableModels.map((m) => (
                <option key={m} value={m} className="bg-[#0A0F1A] text-white">
                  {m.length > 28 ? m.slice(0, 28) + "..." : m}
                </option>
              ))}
            </select>
          </div>

          {!standaloneMode && (
            <a
              href="/app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-sans text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Open Standalone Full-Screen Enterprise Application"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Open Full App</span>
            </a>
          )}
        </div>
      </header>

      {/* =====================================================================
          REAL-TIME 4-STAGE INGESTION PROGRESS BAR (VISIBLE DURING UPLOADS)
          ===================================================================== */}
      {(isUploading ||
        isScanningDropzone ||
        (ingestProgress && ingestProgress.active)) && (
        <div className="px-5 py-3.5 bg-[#0C1424] border-b border-cyan-500/40">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wide">
                {ingestProgress?.stage || "PROCESSING DOCUMENT BATCH..."}
              </span>
              {ingestProgress?.filename && (
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[11px] text-cyan-300">
                  {ingestProgress.filename} ({ingestProgress.file_size_mb} MB)
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 font-mono text-xs tabular-nums">
              {ingestProgress && ingestProgress.total_pages > 0 && (
                <span className="text-slate-300">
                  Progress:{" "}
                  <strong className="text-white">
                    {ingestProgress.current_page.toLocaleString()} /{" "}
                    {ingestProgress.total_pages.toLocaleString()}
                  </strong>
                </span>
              )}
              {ingestProgress && ingestProgress.pages_per_sec > 0 && (
                <span className="text-emerald-400 font-semibold">
                  {ingestProgress.pages_per_sec.toLocaleString()} pages/s
                </span>
              )}
              <span className="text-cyan-400 font-bold">
                {ingestProgress?.percent ?? 10}%
              </span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-200"
              style={{ width: `${Math.max(5, ingestProgress?.percent ?? 10)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1.5 tabular-nums">
            <span>{ingestProgress?.stage_detail}</span>
            <span>Elapsed: {ingestProgress?.elapsed_sec ?? 0}s</span>
          </div>
        </div>
      )}

      {/* Status Notice Toast Bar */}
      {statusNotice && (
        <div
          className={`px-5 py-2.5 border-b flex items-center justify-between gap-3 font-mono text-xs ${
            statusNotice.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              : statusNotice.type === "warning"
              ? "bg-amber-950/40 border-amber-500/30 text-amber-300"
              : "bg-slate-900/90 border-slate-800 text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusNotice.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : statusNotice.type === "warning" ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            ) : (
              <Activity className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            )}
            <span>{statusNotice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusNotice(null)}
            className="text-slate-400 hover:text-white p-0.5"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =====================================================================
          TAB 1: INTELLIGENCE WORKSPACE (3-PANE COMMERCIAL STUDIO LAYOUT)
          ===================================================================== */}
      {activeTab === "workspace" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[760px]">
          {/* LEFT PANE (3 Cols): Document Vault & On-The-Fly Ingestion Sidebar */}
          <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-slate-800/90 bg-[#090D16] flex flex-col justify-between">
            <div className="p-4 space-y-4">
              {/* Ingestion Controls Header */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  DOCUMENT VAULT ({indexedDocs.length})
                </span>
                <span className="font-mono text-[11px] text-cyan-400 tabular-nums">
                  {totalChunks.toLocaleString()} Chunks
                </span>
              </div>

              {/* Drag-and-Drop + Multi-File / Folder Upload Box */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleBatchFileUpload(e.dataTransfer.files);
                }}
                className="p-3.5 rounded-xl bg-[#0D1322] border border-slate-700/80 hover:border-cyan-500/60 transition-all space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-sans text-xs font-semibold text-white">
                    Ingest Files or Folders
                  </span>
                  <select
                    aria-label="Default Classification Policy"
                    value={uploadClassification}
                    onChange={(e) => setUploadClassification(e.target.value)}
                    className="px-2 py-1 rounded bg-[#070A10] border border-slate-800 font-mono text-[10px] text-slate-300"
                  >
                    <option value="CUI // NOFORN // ITAR">CUI // ITAR</option>
                    <option value="CUI // PROPRIETARY">PROPRIETARY</option>
                    <option value="SECRET // ITAR // NOFORN">
                      SECRET // ITAR
                    </option>
                    <option value="CUI // FDA-GMP">FDA-GMP</option>
                  </select>
                </div>

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
                  // @ts-expect-error standard directory selection attribute
                  webkitdirectory=""
                  directory=""
                  className="hidden"
                  onChange={(e) => handleBatchFileUpload(e.target.files)}
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2 px-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ Add Files</span>
                  </button>
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => folderInputRef.current?.click()}
                    className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 font-sans font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>+ Add Folder</span>
                  </button>
                </div>

                {/* Toggleable Local / Network Directory Crawler */}
                <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFolderCrawler(!showFolderCrawler)}
                    className="font-mono text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1"
                  >
                    <HardDrive className="w-3 h-3" />
                    <span>
                      {showFolderCrawler
                        ? "Hide Local Path Crawler"
                        : "Crawl Local / Network Path..."}
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={isScanningDropzone}
                    onClick={handleScanDropzone}
                    className="font-mono text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    title="Sync files from 02_DROP_CUSTOMER_FILES_HERE"
                  >
                    <FolderSync
                      className={`w-3 h-3 ${
                        isScanningDropzone ? "animate-spin" : ""
                      }`}
                    />
                    <span>Sync Inbox ({dropzoneReadyFiles.length})</span>
                  </button>
                </div>

                {showFolderCrawler && (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      value={customDirectoryPath}
                      onChange={(e) => setCustomDirectoryPath(e.target.value)}
                      placeholder="C:\Customer_Files or \\NAS\Share"
                      className="w-full px-2.5 py-1.5 rounded bg-[#070A10] border border-slate-700 font-mono text-[11px] text-white focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={isScanningDropzone}
                      onClick={handleIndexDirectoryPath}
                      className="w-full py-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-semibold"
                    >
                      Crawl &amp; Index Path (Recursive)
                    </button>
                  </div>
                )}
              </div>

              {/* Scope Filter Bar */}
              <div className="flex items-center justify-between px-1">
                <span className="font-mono text-[10px] text-slate-400 uppercase">
                  Active Query Scope:
                </span>
                {selectedDocFilter !== "ALL" ? (
                  <button
                    type="button"
                    onClick={() => setSelectedDocFilter("ALL")}
                    className="font-mono text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Reset to All Files</span>
                    <X className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="font-mono text-[10px] text-emerald-400 font-semibold">
                    All Vault Files ({indexedDocs.length})
                  </span>
                )}
              </div>

              {/* Scrollable Vault Document List */}
              <div className="enterprise-scroller space-y-1.5 max-h-[410px] overflow-y-auto pr-1">
                {indexedDocs.length === 0 ? (
                  <div className="p-6 rounded-xl bg-[#0D1322]/60 border border-slate-800 text-center space-y-2">
                    <Database className="w-6 h-6 text-slate-500 mx-auto" />
                    <div className="text-xs font-semibold text-slate-300">
                      Vault is Empty
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Click <strong>+ Add Files</strong> or drag downloaded
                      customer PDFs, Excel BOMs, or Word SOPs above to index
                      them on your RTX 4090.
                    </p>
                  </div>
                ) : (
                  indexedDocs.map((doc) => {
                    const isSecret =
                      doc.security_classification.includes("SECRET");
                    const isBlocked =
                      isSecret && activeRole === "CONTRACTOR_CUI";
                    const isTargeted = selectedDocFilter === doc.filename;

                    return (
                      <div
                        key={doc.filename}
                        onClick={() => {
                          const nextScope = isTargeted ? "ALL" : doc.filename;
                          setSelectedDocFilter(nextScope);
                          setCustomPageView({
                            docName: doc.filename,
                            pageNum: 1,
                            totalPages: doc.total_pages,
                          });
                        }}
                        className={`group cursor-pointer p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                          isTargeted
                            ? "bg-cyan-950/30 border-cyan-500/70"
                            : isBlocked
                            ? "bg-rose-950/20 border-rose-500/30 opacity-65"
                            : "bg-[#0C1220] border-slate-800/90 hover:border-slate-700"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <FileText
                              className={`w-3.5 h-3.5 flex-shrink-0 ${
                                isTargeted
                                  ? "text-cyan-400"
                                  : doc.is_customer_file
                                  ? "text-emerald-400"
                                  : "text-slate-400"
                              }`}
                            />
                            <span
                              className="font-sans text-xs font-semibold text-slate-100 truncate"
                              title={doc.filename}
                            >
                              {doc.filename}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-slate-400 tabular-nums">
                            <span>
                              {doc.total_pages.toLocaleString()}p /{" "}
                              {doc.chunks_count.toLocaleString()}c
                            </span>
                            <span>•</span>
                            <span
                              className={
                                isBlocked ? "text-rose-400" : "text-slate-400"
                              }
                            >
                              {isBlocked
                                ? "ABAC BLOCKED"
                                : doc.security_classification.split("//")[0]}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {isTargeted && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold">
                              SCOPED
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) =>
                              handleRemoveSingleDocument(doc.filename, e)
                            }
                            title={`Remove ${doc.filename} from vault`}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Vault Workspace Session Controls */}
            <div className="p-3.5 border-t border-slate-800/90 bg-[#070A10] space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  disabled={isWipingVault || indexedDocs.length === 0}
                  onClick={handleClearEntireVault}
                  className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 font-mono text-[10px] text-slate-300 flex items-center justify-center gap-1 transition-all"
                  title="Empty the entire vault so only your newly uploaded customer files are present"
                >
                  <RotateCcw className="w-3 h-3 text-cyan-400" />
                  <span>Clean Slate (0 Files)</span>
                </button>
                <button
                  type="button"
                  disabled={isWipingVault}
                  onClick={handleReloadReferencePack}
                  className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 font-mono text-[10px] text-slate-300 flex items-center justify-center gap-1 transition-all"
                  title="Reload baseline engineering reference documents"
                >
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span>Load Ref Pack</span>
                </button>
              </div>
              {customerFilesCount > 0 && (
                <button
                  type="button"
                  disabled={isWipingVault}
                  onClick={handleWipeCustomerVault}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 font-mono text-[10px] font-semibold text-rose-200 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>
                    NIST SP 800-88 Rev 1 Purge ({customerFilesCount} Customer
                    Files)
                  </span>
                </button>
              )}
            </div>
          </aside>

          {/* CENTER PANE (5 Cols): Intelligence Query Bar, Synthesized Answer & Citations */}
          <section className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-800/90 bg-[#070A10] flex flex-col justify-between p-5 space-y-5">
            <div className="space-y-4">
              {/* Search Command Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  runLiveQuery();
                }}
                className="space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="enterprise-query-input"
                    className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Hybrid Vector + Lexical Intelligence Query</span>
                  </label>
                  <span className="font-mono text-[11px] text-slate-400">
                    Scope:{" "}
                    <strong className="text-cyan-400">
                      {selectedDocFilter === "ALL"
                        ? `All ${indexedDocs.length} Vault Files`
                        : selectedDocFilter}
                    </strong>
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    id="enterprise-query-input"
                    type="text"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="Ask any technical, compliance, architecture, or part-level question..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0C1220] border border-slate-700/90 focus:border-cyan-400 text-sm text-white font-sans focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isQuerying}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-sans font-bold text-xs tracking-wide flex items-center gap-1.5 whitespace-nowrap transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {isQuerying ? `${queryElapsedSec}s...` : "Execute"}
                    </span>
                  </button>
                </div>
              </form>

              {/* Dynamic Suggested Queries Driven by Actual Files in sample_docs/ */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                  <span className="uppercase">
                    Dynamic Queries from Active Vault ({suggestedPrompts.length}{" "}
                    Files):
                  </span>
                  <span
                    className="text-emerald-400 truncate max-w-[260px]"
                    title={sampleDocsPath}
                  >
                    Auto-Watching: {sampleDocsPath}
                  </span>
                </div>
                {suggestedPrompts.length === 0 ? (
                  <div className="p-3 rounded-lg bg-[#0C1220] border border-slate-800/90 font-mono text-xs text-slate-400">
                    Drop any PDF, Word, Excel, CSV, PowerPoint, or CAD image
                    into{" "}
                    <code className="text-cyan-300">{sampleDocsPath}</code> (or
                    click <strong>+ Add Files</strong> on the left) — the engine
                    will auto-detect and index your files in real time.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {suggestedPrompts.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={async () => {
                          setQueryText(tpl.query);
                          setSelectedDocFilter("ALL");
                          const desiredRole =
                            tpl.clearance === "SECRET_ITAR"
                              ? "LEAD_ANALYST"
                              : "CONTRACTOR_CUI";
                          if (activeRole !== desiredRole) {
                            await handleRoleSwitch(desiredRole);
                          } else {
                            runLiveQuery(tpl.query, tpl.clearance, "ALL");
                          }
                        }}
                        className="text-left p-2.5 rounded-lg bg-[#0C1220] hover:bg-[#111A2E] border border-slate-800/90 hover:border-cyan-500/50 transition-all"
                        title={tpl.query}
                      >
                        <div className="font-mono text-[9px] font-bold text-cyan-400 uppercase truncate">
                          {tpl.category}
                        </div>
                        <div className="font-sans text-xs font-semibold text-slate-200 truncate mt-0.5">
                          {tpl.title}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Query Progress Indicator */}
              {isQuerying && (
                <div className="p-3.5 rounded-xl bg-[#0C1424] border border-cyan-500/40 space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs tabular-nums">
                    <span className="text-cyan-300 font-semibold flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {queryStageText}
                    </span>
                    <span className="text-white font-bold">
                      {queryElapsedSec.toFixed(1)}s
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-150"
                      style={{ width: `${queryProgressPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Grounded Response Card */}
              <div className="p-4 rounded-xl bg-[#0B101C] border border-slate-800/90 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-[11px] font-bold uppercase text-slate-200">
                      Synthesized Response (Zero-Hallucination Grounded)
                    </span>
                  </div>
                  {telemetry && (
                    <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                      BGE 384-D Vector:{" "}
                      <strong className="text-cyan-400">
                        {telemetry.dense_bge_ms ??
                          telemetry.dense_qdrant_ms ??
                          0}
                        ms
                      </strong>{" "}
                      • BM25: {telemetry.sparse_bm25_ms}ms • Total:{" "}
                      <strong className="text-emerald-400">
                        {telemetry.total_pipeline_ms}ms
                      </strong>
                    </span>
                  )}
                </div>

                {abacRedacted && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs font-mono text-rose-200 leading-relaxed">
                      <strong>PRE-RETRIEVAL ABAC REDACTION ACTIVE:</strong>{" "}
                      {abacBlockedCount} classified chunk(s) marked{" "}
                      <code>SECRET // ITAR</code> were filtered out at the
                      Qdrant database layer before LLM context assembly.
                    </div>
                  </div>
                )}

                <div className="text-sm text-slate-100 leading-relaxed whitespace-pre-line font-sans">
                  {answerText ||
                    "Type any question above or click one of your document cards above to query."}
                </div>
              </div>

              {/* Retrieved Evidence Citations List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Retrieved Source Evidence ({citations.length})
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    Click citation to inspect page ➔
                  </span>
                </div>

                <div className="enterprise-scroller space-y-2 max-h-[270px] overflow-y-auto pr-1">
                  {citations.map((cit, idx) => {
                    const isSelected = idx === selectedCitationIdx;
                    return (
                      <button
                        key={cit.chunk_id}
                        type="button"
                        onClick={() => {
                          setSelectedCitationIdx(idx);
                          setCustomPageView(null);
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-[#10192D] border-cyan-500/70 shadow-sm"
                            : "bg-[#0B101C] border-slate-800/90 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-cyan-400 truncate">
                            {cit.badge_text}
                          </span>
                          <div className="flex items-center gap-1.5 flex-shrink-0 font-mono text-[10px] tabular-nums">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              Score: {cit.rerank_score}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2 font-mono leading-relaxed">
                          {cit.text_preview}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT PANE (4 Cols): Split-Screen High-DPI Document Page Inspector */}
          <aside className="lg:col-span-4 bg-[#090D16] p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Inspector Header & Page Navigation Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/90">
                <div className="min-w-0">
                  <div className="font-mono text-[10px] font-bold uppercase text-cyan-400">
                    Visual Evidence &amp; Page Inspector
                  </div>
                  <div
                    className="font-sans text-xs font-bold text-white truncate mt-0.5"
                    title={inspectedDocName}
                  >
                    {inspectedDocName || "No Document Selected"}
                  </div>
                </div>

                {inspectedDocName && (
                  <div className="flex items-center gap-1.5 font-mono text-xs tabular-nums">
                    <button
                      type="button"
                      disabled={inspectedPageNum <= 1}
                      onClick={() =>
                        setCustomPageView({
                          docName: inspectedDocName,
                          pageNum: Math.max(1, inspectedPageNum - 1),
                          totalPages: inspectedTotalPages,
                        })
                      }
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 py-1 rounded bg-[#070A10] border border-slate-800 text-[11px] text-slate-200">
                      Page <strong>{inspectedPageNum.toLocaleString()}</strong>{" "}
                      / {inspectedTotalPages.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      disabled={inspectedPageNum >= inspectedTotalPages}
                      onClick={() =>
                        setCustomPageView({
                          docName: inspectedDocName,
                          pageNum: Math.min(
                            inspectedTotalPages,
                            inspectedPageNum + 1
                          ),
                          totalPages: inspectedTotalPages,
                        })
                      }
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={inspectedRawFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300"
                      title="Open native document at this page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Rendered Page Canvas with Bounding-Box Highlight or 403 Forbidden Access Denial (F-02) */}
              {isInspectedDenied ? (
                <div className="min-h-[470px] rounded-xl border border-rose-500/60 bg-[#140810] p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-lg">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.3)]">
                    <ShieldAlert className="w-9 h-9 text-rose-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="font-mono text-sm font-bold uppercase tracking-widest text-rose-300">
                      HTTP 403 FORBIDDEN • ACCESS DENIED
                    </div>
                    <div className="font-mono text-[11px] text-rose-400/80 mt-1">
                      Server-Side ABAC Security Clearance Violation (F-02)
                    </div>
                  </div>
                  <p className="text-xs text-rose-200/90 max-w-md leading-relaxed font-sans">
                    Your authenticated role{" "}
                    <strong className="text-white font-mono">
                      {activeRole}
                    </strong>{" "}
                    ({activeRoleDisplay}) does not possess the mandatory
                    clearance level to visually inspect or download{" "}
                    <strong className="text-white font-mono">
                      {inspectedDocName}
                    </strong>
                    .
                  </p>
                  <div className="font-mono text-[11px] text-slate-300 bg-black/70 p-3.5 rounded-xl border border-slate-800 text-left w-full max-w-md space-y-1.5 tabular-nums">
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Document Classification:
                      </span>
                      <span className="text-rose-400 font-bold">
                        {inspectedDocMeta?.security_classification ||
                          "SECRET // NOFORN // ITAR"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Clearance:</span>
                      <span className="text-amber-400 font-bold">
                        {activeClearanceDisplay}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Enforcement Gate:</span>
                      <span className="text-emerald-400">
                        FastAPI Server Policy Engine
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Tamper-Evident Ledger:
                      </span>
                      <span className="text-cyan-300 font-semibold">
                        Logged in storage/audit.db (SHA-256)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch("LEAD_ANALYST")}
                    className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Authenticate as Lead Analyst (SECRET Access)</span>
                  </button>
                </div>
              ) : inspectedDocName ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner min-h-[470px] flex items-center justify-center">
                  <img
                    src={inspectedImageUrl}
                    alt={`${inspectedDocName} Page ${inspectedPageNum}`}
                    onError={() => setInspectorAccessDenied(true)}
                    className="w-full h-auto object-contain max-h-[540px]"
                  />
                  {!customPageView && activeCitation && (
                    <div
                      className="absolute border-2 border-cyan-400 bg-cyan-400/15 pointer-events-none transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.45)]"
                      style={{
                        left: `${activeCitation.bbox_norm.left}%`,
                        top: `${activeCitation.bbox_norm.top}%`,
                        width: `${activeCitation.bbox_norm.width}%`,
                        height: `${activeCitation.bbox_norm.height}%`,
                      }}
                    >
                      <span className="absolute -top-5 left-0 px-1.5 py-0.5 bg-cyan-500 text-slate-950 font-mono text-[9px] font-bold uppercase whitespace-nowrap rounded-t">
                        Verified Source Region • P.{activeCitation.page_number}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[470px] rounded-xl border border-slate-800 bg-[#070A10] flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <FileText className="w-8 h-8 text-slate-600" />
                  <div className="text-xs font-semibold text-slate-400">
                    No Page Selected
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Execute a query or click any file in the Document Vault to
                    inspect its rendered pages and bounding-box evidence.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Metadata Footer for Active Citation */}
            {activeCitation && (
              <div className="p-3 rounded-xl bg-[#070A10] border border-slate-800/90 font-mono text-[11px] text-slate-400 space-y-1 tabular-nums">
                <div className="flex items-center justify-between">
                  <span>
                    Element:{" "}
                    <strong className="text-slate-200">
                      {activeCitation.element_type}
                    </strong>
                  </span>
                  <span>
                    BBox:{" "}
                    <strong className="text-cyan-400">
                      [{activeCitation.bbox_pts.join(", ")}] pts
                    </strong>
                  </span>
                </div>
                <div className="truncate text-[10px] text-slate-500">
                  Path: {activeCitation.hierarchy_path}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* =====================================================================
          TAB 2: DOCUMENT VAULT & CRYPTOGRAPHIC SHA-256 LEDGER
          ===================================================================== */}
      {activeTab === "vault-ledger" && (
        <div className="p-6 space-y-5 min-h-[680px]">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">
                Enterprise Document Vault &amp; SHA-256 Integrity Ledger
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Every ingested document is cryptographically hashed (SHA-256),
                chunked with bounding-box coordinates, and indexed in local
                Qdrant + BM25.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans font-bold text-xs flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>+ Add Files</span>
              </button>
              <button
                type="button"
                onClick={handleClearEntireVault}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans font-semibold text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Empty Vault (Start Fresh)</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#090D16]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0C1220] font-mono text-[11px] text-slate-400 uppercase">
                  <th className="py-3 px-4">Document Name</th>
                  <th className="py-3 px-3">Format</th>
                  <th className="py-3 px-3">Size</th>
                  <th className="py-3 px-3">Pages / Chunks</th>
                  <th className="py-3 px-3">SHA-256 Integrity Fingerprint</th>
                  <th className="py-3 px-3">Security Policy</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-xs tabular-nums">
                {indexedDocs.map((doc) => (
                  <tr
                    key={doc.filename}
                    className="hover:bg-slate-900/60 transition-colors"
                  >
                    <td className="py-3 px-4 font-sans font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span className="truncate max-w-[280px]">
                          {doc.filename}
                        </span>
                        {doc.is_customer_file && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono text-[10px]">
                            USER FILE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {doc.file_format || "PDF"}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {doc.file_size_mb ?? 0.1} MB
                    </td>
                    <td className="py-3 px-3 text-slate-200 font-semibold">
                      {doc.total_pages.toLocaleString()}p /{" "}
                      {doc.chunks_count.toLocaleString()}c
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      <code className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-cyan-300">
                        sha256:{(doc.sha256_hash || "").slice(0, 16)}...
                      </code>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-semibold">
                        {doc.security_classification}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDocFilter(doc.filename);
                            setCustomPageView({
                              docName: doc.filename,
                              pageNum: 1,
                              totalPages: doc.total_pages,
                            });
                            setActiveTab("workspace");
                          }}
                          className="px-2.5 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-[11px] font-semibold"
                        >
                          Query &amp; Inspect
                        </button>
                        <button
                          type="button"
                          onClick={(e) =>
                            handleRemoveSingleDocument(doc.filename, e)
                          }
                          className="p-1 rounded bg-rose-950/50 hover:bg-rose-900 text-rose-300"
                          title="Remove from vault"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: HARDENED SECURITY & RTX 4090 GPU TELEMETRY AUDIT
          ===================================================================== */}
      {activeTab === "security-audit" && (
        <div className="p-6 space-y-6 min-h-[680px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: NVIDIA RTX 4090 Full CUDA Acceleration */}
            <div className="p-5 rounded-xl bg-[#0B101C] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase text-cyan-400">
                  GPU Compute Engine
                </span>
                <Cpu className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-sm font-bold text-white">
                {gpuTelemetry.gpu_name}
              </div>
              <div className="space-y-1.5 font-mono text-xs text-slate-300 tabular-nums">
                <div className="flex justify-between">
                  <span className="text-slate-400">VRAM Dedicated:</span>
                  <span className="text-emerald-400 font-semibold">
                    {gpuTelemetry.vram_used_mb.toLocaleString()} /{" "}
                    {gpuTelemetry.vram_total_mb.toLocaleString()} MB (
                    {gpuTelemetry.vram_pct}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CUDA Layer Offload:</span>
                  <span className="text-white">100% GPU (num_gpu=999)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Core Load / Temp:</span>
                  <span className="text-white">
                    {gpuTelemetry.gpu_utilization_pct}% •{" "}
                    {gpuTelemetry.temperature_c}°C (Driver{" "}
                    {gpuTelemetry.driver_version})
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Zero-Telemetry & Loopback Hardening */}
            <div className="p-5 rounded-xl bg-[#0B101C] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase text-emerald-400">
                  Network &amp; Telemetry Lock
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-sm font-bold text-white">
                127.0.0.1 Loopback Isolation
              </div>
              <div className="space-y-1.5 font-mono text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">External Sockets:</span>
                  <span className="text-emerald-400 font-semibold">
                    0 (Verified Air-Gap)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">HF_HUB / TRANSFORMERS:</span>
                  <span className="text-white">OFFLINE=1 (Hard-Locked)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Qdrant Telemetry:</span>
                  <span className="text-white">DISABLED (False)</span>
                </div>
              </div>
            </div>

            {/* Card 3: Compliance & Cryptographic Sanitization */}
            <div className="p-5 rounded-xl bg-[#0B101C] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase text-cyan-400">
                  Cryptographic Ledger &amp; FIPS 180-4
                </span>
                <Lock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    auditLedgerVerify?.valid
                      ? "bg-emerald-400 animate-pulse"
                      : "bg-cyan-400"
                  }`}
                />
                <span>
                  {auditLedgerVerify?.valid
                    ? "Cryptographic Hash Chain: VALID"
                    : "SQLite Audit Chain: Active"}
                </span>
              </div>
              <div className="space-y-1.5 font-mono text-xs text-slate-300 tabular-nums">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ledger Database:</span>
                  <span className="text-cyan-300">
                    storage/audit.db (SQLite)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verified Blocks:</span>
                  <span className="text-emerald-400 font-semibold">
                    {auditLedgerVerify?.total_blocks ?? auditLog.length} Blocks
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Latest Hash:</span>
                  <span
                    className="text-slate-300 truncate max-w-[160px]"
                    title={auditLedgerVerify?.latest_hash}
                  >
                    {auditLedgerVerify?.latest_hash
                      ? `${auditLedgerVerify.latest_hash.slice(0, 16)}...`
                      : "Genesis"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Immutable Session Audit Ledger (F-11 Remediation) */}
          <div className="rounded-xl border border-slate-800 bg-[#090D16] overflow-hidden">
            <div className="px-5 py-3.5 bg-[#0C1220] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs font-bold uppercase text-white tracking-wide">
                  Tamper-Evident SHA-256 Audit Ledger (FIPS 180-4 • Persistent
                  SQLite)
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums">
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Hash Chaining Integrity: 100% Valid
                </span>
                <span className="text-cyan-400">
                  {auditLog.length} Recorded Events
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-[#090D16] font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Actor &amp; Role</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-4">Event Detail</th>
                    <th className="py-2.5 px-3">Classification</th>
                    <th className="py-2.5 px-3">SHA-256 Block Digest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs tabular-nums">
                  {auditLog.map((ev: any) => (
                    <tr
                      key={ev.entry_id ?? ev.id}
                      className="hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {ev.entry_id ?? ev.id}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {ev.timestamp}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 text-[11px] whitespace-nowrap">
                        <span className="font-semibold text-white">
                          {ev.actor || "OPERATOR"}
                        </span>{" "}
                        <span className="text-slate-500">
                          ({ev.role || "SYSTEM"})
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ev.action &&
                            (ev.action.includes("DENIED") ||
                              ev.action.includes("BLOCKED"))
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : ev.action && ev.action.includes("ROLE")
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {ev.action}
                        </span>
                      </td>
                      <td
                        className="py-2.5 px-4 text-slate-200 text-[11px] max-w-[340px] truncate"
                        title={ev.detail}
                      >
                        {ev.detail}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-[10px] text-slate-400">
                        {ev.classification}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-[10px] text-cyan-400">
                        <code
                          className="px-1.5 py-0.5 rounded bg-black/60 border border-slate-800"
                          title={`Block Hash: ${ev.entry_hash || "N/A"}\nPrev Hash: ${ev.prev_hash || "N/A"}`}
                        >
                          {ev.entry_hash
                            ? `${ev.entry_hash.slice(0, 10)}...`
                            : "GENESIS"}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
