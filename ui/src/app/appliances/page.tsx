"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Cpu,
  Database,
  Server,
  HardDrive,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Layers,
  Zap,
  Sliders,
  FileText,
  Users,
  Clock,
  Lock,
  ExternalLink,
  X,
  Activity,
} from "lucide-react";

interface NvidiaApplianceTier {
  id: string;
  tierCode: string;
  name: string;
  nvidiaPlatform: string;
  formFactor: string;
  gpuComputeSpec: string;
  vramOrUnifiedMemory: string;
  memoryGbNumeric: number;
  aiPerformance: string;
  storageConfig: string;
  networking: string;
  recommendedPagesMin: number;
  recommendedPagesMax: number;
  corpusRangeLabel: string;
  vaultSizeLabel: string;
  pagesPerHourBase: number;
  maxConcurrentUsers: number;
  servedModels: string[];
  targetEnvironment: string;
  powerAndCooling: string;
  accentColor: "cyan" | "emerald" | "amber";
}

const NVIDIA_APPLIANCE_TIERS: NvidiaApplianceTier[] = [
  {
    id: "tier-igx-orin",
    tierCode: "TIER 01 // TACTICAL EDGE",
    name: "AirVault Edge Scout",
    nvidiaPlatform: "NVIDIA IGX Orin / Jetson AGX Orin Industrial",
    formFactor: "Ruggedized Fanless MIL-STD-810H Portable Chassis",
    gpuComputeSpec:
      "NVIDIA Ampere GPU (2048 CUDA / 64 Tensor Cores) + 12-Core Arm Cortex-A78AE",
    vramOrUnifiedMemory: "64 GB Industrial LPDDR5 (ECC)",
    memoryGbNumeric: 64,
    aiPerformance: "275 TOPS (INT8) + ConnectX-7 SmartNIC",
    storageConfig: "2x 4TB Industrial NVMe M.2 (FIPS 140-3 SED)",
    networking: "Dual 10GbE / 25GbE SFP28 (Zero-WAN Tactical Loop)",
    recommendedPagesMin: 0,
    recommendedPagesMax: 50_000,
    corpusRangeLabel: "Up to 50,000 Pages",
    vaultSizeLabel: "Up to 100 GB",
    pagesPerHourBase: 2_200,
    maxConcurrentUsers: 5,
    servedModels: [
      "Qwen 2.5 14B-Instruct (AWQ 4-bit)",
      "BAAI/bge-large-en-v1.5 (FP16)",
      "BAAI/bge-reranker-large (FP16)",
    ],
    targetEnvironment:
      "Forward Operating Bases, Submarines, Mobile Flight-Line Maintenance Kits",
    powerAndCooling: "75W – 150W DC/AC • Conduction / Sealed Fanless",
    accentColor: "cyan",
  },
  {
    id: "tier-dgx-spark",
    tierCode: "TIER 02 // DESKSIDE COMPACT",
    name: "AirVault Deskside Spark",
    nvidiaPlatform: "NVIDIA DGX Spark (GB10 Grace Blackwell Superchip)",
    formFactor: "Compact Deskside AI Supercomputer (Zero-Rack Footprint)",
    gpuComputeSpec:
      "NVIDIA GB10 Grace Blackwell Superchip (20-Core Arm CPU + 5th-Gen Tensor Core Blackwell GPU)",
    vramOrUnifiedMemory: "128 GB Coherent Unified LPDDR5X (273 GB/s)",
    memoryGbNumeric: 128,
    aiPerformance: "1,000 AI TOPS (1 PFLOP Sparse FP4)",
    storageConfig: "4TB Enterprise NVMe M.2 + 8TB Portable NVMe Vault",
    networking: "NVIDIA ConnectX-7 200GbE RDMA + 10GbE Local Enclave",
    recommendedPagesMin: 50_001,
    recommendedPagesMax: 500_000,
    corpusRangeLabel: "50,000 – 500,000 Pages",
    vaultSizeLabel: "100 GB – 1 TB",
    pagesPerHourBase: 9_500,
    maxConcurrentUsers: 25,
    servedModels: [
      "Llama 3.3 70B-Instruct (FP4 / AWQ)",
      "Qwen 2.5 32B-Instruct (FP8)",
      "Docling + Surya OCR GPU Pipeline",
    ],
    targetEnvironment:
      "SCIF Workgroups, R&D Labs, Patent/IP Legal Enclaves, Departmental Vaults",
    powerAndCooling: "240W Standard 120V Wall Outlet • Whisper Quiet Deskside",
    accentColor: "cyan",
  },
  {
    id: "tier-dgx-station-gb300",
    tierCode: "TIER 03 // DESKSIDE ULTRA TOWER",
    name: "AirVault Deskside Ultra",
    nvidiaPlatform: "NVIDIA DGX Station GB300 (Grace Blackwell Ultra)",
    formFactor: "Closed-Loop Liquid-Cooled Deskside Enterprise Tower",
    gpuComputeSpec:
      "NVIDIA GB300 Grace Blackwell Ultra Desktop Superchip (72-Core Grace CPU + Blackwell Ultra GPU)",
    vramOrUnifiedMemory:
      "748 GB Coherent Memory Pool (496 GB LPDDR5X + 252 GB HBM3e)",
    memoryGbNumeric: 748,
    aiPerformance: "20 PFLOPS FP4 • 8 TB/s HBM3e Memory Bandwidth",
    storageConfig: "4x 7.68TB Enterprise U.3 NVMe RAID-10 (30.7 TB)",
    networking: "NVIDIA ConnectX-8 SuperNIC (up to 800Gb/s) + Dual 10GbE",
    recommendedPagesMin: 500_001,
    recommendedPagesMax: 2_500_000,
    corpusRangeLabel: "500,000 – 2.5 Million Pages",
    vaultSizeLabel: "1 TB – 5 TB",
    pagesPerHourBase: 32_000,
    maxConcurrentUsers: 75,
    servedModels: [
      "Qwen 2.5 72B-Instruct (FP16 / FP8 Uncompressed)",
      "Qwen 2.5-VL-72B (Multi-Modal CAD Schematic Vision)",
      "DeepSeek-R1 Distill 70B + Full BGE Ensemble",
    ],
    targetEnvironment:
      "Classified Engineering Divisions, Semiconductor Fab Floors, No-Data-Center Facilities",
    powerAndCooling: "1,500W Standard 15A/20A Office Circuit • Internal Liquid Cooling",
    accentColor: "emerald",
  },
  {
    id: "tier-rtx-pro-6000",
    tierCode: "TIER 04 // 4U ENTERPRISE RACKMOUNT",
    name: "AirVault 4U Rackmount Pro",
    nvidiaPlatform:
      "NVIDIA OVX / 4x–8x RTX PRO 6000 Blackwell Server Edition",
    formFactor: "4U Enterprise Data Center Server (DISA STIG Hardened)",
    gpuComputeSpec:
      "4x or 8x NVIDIA RTX PRO 6000 Blackwell Server GPUs (24,064 CUDA Cores each) + Dual AMD EPYC 9354",
    vramOrUnifiedMemory:
      "384 GB to 768 GB GDDR7 ECC VRAM (96 GB per GPU @ 1.79 TB/s) + 512 GB DDR5",
    memoryGbNumeric: 768,
    aiPerformance: "Up to 24 PFLOPS FP4 • Multi-Instance vLLM + Triton",
    storageConfig: "8x 7.68TB Enterprise NVMe RAID-10 (61.4 TB Usable)",
    networking: "Dual 25GbE / 100GbE SFP28/QSFP28 + Out-of-Band Redfish IPMI",
    recommendedPagesMin: 2_500_001,
    recommendedPagesMax: 15_000_000,
    corpusRangeLabel: "2.5 Million – 15 Million Pages",
    vaultSizeLabel: "5 TB – 30 TB",
    pagesPerHourBase: 92_000,
    maxConcurrentUsers: 250,
    servedModels: [
      "Multi-Replica Qwen 2.5 72B + Llama 3.3 70B (Tensor Parallel)",
      "8-Worker Parallel Docling + TableFormer GPU Farm",
      "Distributed Qdrant + OpenSearch BM25 Cluster",
    ],
    targetEnvironment:
      "Prime Defense Contractor Data Centers, Aerospace Manufacturing Plants, Nuclear Utilities",
    powerAndCooling: "Redundant 3,200W Titanium PSUs • Standard Hot/Cold Aisle Rack",
    accentColor: "emerald",
  },
  {
    id: "tier-dgx-b200-pod",
    tierCode: "TIER 05 // ENCLAVE SUPERPOD NODE",
    name: "AirVault Enclave SuperCluster",
    nvidiaPlatform: "NVIDIA DGX B200 / HGX B200 BasePOD Architecture",
    formFactor: "8U Rack-Scale Turn-Key AI Supercomputer + Storage Fabric",
    gpuComputeSpec:
      "8x NVIDIA Blackwell B200 Tensor Core GPUs (NVLink 5 @ 1.8 TB/s per GPU) + Dual Intel Xeon Platinum",
    vramOrUnifiedMemory:
      "1,440 GB (1.44 TB) HBM3e Coherent GPU Memory (64 TB/s Aggregate Bandwidth) + 2 TB System RAM",
    memoryGbNumeric: 1440,
    aiPerformance: "72 PFLOPS FP8 Training / 144 PFLOPS FP4 Inference",
    storageConfig:
      "122 TB Internal NVMe + Petabyte-Scale Air-Gapped MinIO / GPFS Fabric",
    networking:
      "8x 400Gb/s Quantum-2 InfiniBand / Spectrum-X + 2x BlueField-3 DPUs",
    recommendedPagesMin: 15_000_001,
    recommendedPagesMax: 100_000_000,
    corpusRangeLabel: "15 Million – 100+ Million Pages",
    vaultSizeLabel: "30 TB – 200+ TB",
    pagesPerHourBase: 360_000,
    maxConcurrentUsers: 2000,
    servedModels: [
      "Frontier 405B+ Open-Weight Models & MoE Ensembles",
      "Continual Domain Pre-Training & LoRA Adapter Factory",
      "Multi-Compartment ABAC Enclave Tenant Isolation via BlueField-3 DPU",
    ],
    targetEnvironment:
      "National Laboratories, Fleet-Wide Naval/Air Force Repositories, Enterprise-Wide SCIF Enclaves",
    powerAndCooling: "10.2 kW – 14.3 kW Rack Power • Air or Direct-to-Chip Liquid",
    accentColor: "amber",
  },
];

// Discrete volume steps on the logarithmic slider (Index 0..10)
const DOCUMENT_VOLUME_STEPS = [
  { pages: 15_000, label: "15,000 Pages (~30 GB)" },
  { pages: 50_000, label: "50,000 Pages (~100 GB)" },
  { pages: 150_000, label: "150,000 Pages (~300 GB)" },
  { pages: 500_000, label: "500,000 Pages (~1.0 TB)" },
  { pages: 1_200_000, label: "1.2M Pages (~2.4 TB)" },
  { pages: 2_500_000, label: "2.5M Pages (~5.0 TB)" },
  { pages: 6_000_000, label: "6.0M Pages (~12 TB)" },
  { pages: 15_000_000, label: "15M Pages (~30 TB)" },
  { pages: 35_000_000, label: "35M Pages (~70 TB)" },
  { pages: 75_000_000, label: "75M Pages (~150 TB)" },
];

export default function NvidiaAppliancesScalingPage() {
  // Interactive Scaling Model State
  const [volumeStepIdx, setVolumeStepIdx] = useState<number>(3); // Default: 500,000 pages (~1.0 TB)
  const [ocrCadRatioPct, setOcrCadRatioPct] = useState<number>(45); // Default: 45% scanned/CAD pages
  const [concurrentUsers, setConcurrentUsers] = useState<number>(35); // Default: 35 concurrent engineers

  // References for native range sliders (modern-web-guidance: slider)
  const volumeSliderRef = useRef<HTMLInputElement>(null);
  const ocrSliderRef = useRef<HTMLInputElement>(null);
  const usersSliderRef = useRef<HTMLInputElement>(null);

  // Light-dismiss dialog for Hardware Sizing Quote (modern-web-guidance: light-dismiss-a-dialog)
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogTitleId = useId();
  const [quoteTierName, setQuoteTierName] = useState<string>(
    "AirVault Deskside Ultra (DGX Station GB300)"
  );
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  // Sync slider CSS custom properties (--attr-min, --attr-max, --control-value) per modern-web-guidance `slider`
  const syncSliderCssVars = (el: HTMLInputElement | null, val: number) => {
    if (!el) return;
    el.style.setProperty("--attr-min", el.min || "0");
    el.style.setProperty("--attr-max", el.max || "100");
    el.style.setProperty("--control-value", String(val));
  };

  useEffect(() => {
    syncSliderCssVars(volumeSliderRef.current, volumeStepIdx);
  }, [volumeStepIdx]);

  useEffect(() => {
    syncSliderCssVars(ocrSliderRef.current, ocrCadRatioPct);
  }, [ocrCadRatioPct]);

  useEffect(() => {
    syncSliderCssVars(usersSliderRef.current, concurrentUsers);
  }, [concurrentUsers]);

  // Fallback for <dialog closedby="any">
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !("closedBy" in HTMLDialogElement.prototype)) {
      const handleBackdropClick = (event: MouseEvent) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        dialog.close();
      };
      dialog.addEventListener("click", handleBackdropClick);
      return () => dialog.removeEventListener("click", handleBackdropClick);
    }
  }, []);

  // Mathematical Scaling Model Calculations
  const currentVolume = DOCUMENT_VOLUME_STEPS[volumeStepIdx];
  const totalPages = currentVolume.pages;
  const rawStorageGb = Math.round(totalPages * 0.002 * 10) / 10; // ~2 MB average per high-res schematic/manual page
  const totalChunks = Math.round(totalPages * 3.2); // 3.2 hierarchical chunks per page

  // Qdrant 1024d FP16 vector + HNSW graph overhead + payload (~4.8 KB per chunk)
  const qdrantIndexGb = Math.max(
    0.5,
    Math.round(((totalChunks * 4.8) / (1024 * 1024)) * 10) / 10
  );
  // OpenSearch BM25 inverted index + exact MIL-SPEC fields (~1.9 KB per chunk)
  const bm25IndexGb = Math.max(
    0.2,
    Math.round(((totalChunks * 1.9) / (1024 * 1024)) * 10) / 10
  );
  const totalIndexFootprintGb =
    Math.round((qdrantIndexGb + bm25IndexGb) * 10) / 10;

  // OCR / Vision penalty factor: heavy CAD/OCR pages take ~2.1x GPU layout time compared to digital text PDFs
  const ocrPenaltyMultiplier = 1 + (ocrCadRatioPct / 100) * 1.1;

  // Determine Recommended NVIDIA Appliance Tier based on BOTH Page Volume and Concurrent Engineers
  const recommendedTier =
    NVIDIA_APPLIANCE_TIERS.find(
      (tier) =>
        totalPages <= tier.recommendedPagesMax &&
        concurrentUsers <= tier.maxConcurrentUsers
    ) || NVIDIA_APPLIANCE_TIERS[NVIDIA_APPLIANCE_TIERS.length - 1];

  // Calculate active VRAM / Unified Memory required (LLM Weights + KV Cache per concurrent user + Embedder + Reranker + Qdrant in-memory vectors)
  const baseModelVramGb =
    recommendedTier.id === "tier-igx-orin"
      ? 12.2
      : recommendedTier.id === "tier-dgx-spark"
      ? 42.0
      : recommendedTier.id === "tier-dgx-station-gb300"
      ? 148.0
      : recommendedTier.id === "tier-rtx-pro-6000"
      ? 210.0
      : 480.0;

  const kvCacheGb = Math.round(concurrentUsers * 1.35 * 10) / 10;
  const totalEstimatedVramGb =
    Math.round(
      (baseModelVramGb + kvCacheGb + Math.min(qdrantIndexGb * 0.35, 320)) * 10
    ) / 10;

  const formatHours = (hours: number) => {
    if (hours < 1) {
      return `${Math.max(5, Math.round(hours * 60))} mins`;
    }
    if (hours < 48) {
      return `${hours.toFixed(1)} hrs`;
    }
    return `${(hours / 24).toFixed(1)} days`;
  };

  const openQuoteModal = (tier: NvidiaApplianceTier) => {
    setQuoteTierName(`${tier.name} (${tier.nvidiaPlatform})`);
    setQuoteSubmitted(false);
    dialogRef.current?.showModal();
  };

  return (
    <div className="min-h-screen bg-obsidian text-gray-100 relative selection:bg-tacticalCyan/30">
      {/* Tactical Grid Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-tactical-grid bg-[size:48px_48px] opacity-35 z-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[960px] h-[420px] bg-zeroTrustEmerald/10 blur-[140px] rounded-full z-0"
      />

      {/* =====================================================================
          HEADER & NAVIGATION BAR
         ===================================================================== */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-obsidian/85 border-b border-cardBorder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="../"
              className="px-3 py-1.5 rounded-lg bg-slateDeep border border-cardBorder hover:border-tacticalCyan text-xs font-mono text-gray-200 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-tacticalCyan" />
              <span>Main Overview</span>
            </a>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-slateDeep border border-zeroTrustEmerald/50 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-zeroTrustEmerald" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-mono font-bold text-sm tracking-wider text-white">
                  AIRVAULT × NVIDIA AI APPLIANCES
                </span>
                <span className="text-[10px] font-mono text-zeroTrustEmerald">
                  DOCUMENT VOLUME SCALING & SIZING ARCHITECTURE
                </span>
              </div>
            </div>
          </div>

          <nav
            aria-label="Appliance Page Navigation"
            className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300"
          >
            <a
              href="#scaling-calculator"
              className="hover:text-tacticalCyan transition-colors"
            >
              Volume Scaling Model
            </a>
            <a
              href="#nvidia-lineup"
              className="hover:text-tacticalCyan transition-colors"
            >
              NVIDIA Appliance Lineup
            </a>
            <a
              href="#comparison-matrix"
              className="hover:text-tacticalCyan transition-colors"
            >
              5-Tier Spec Matrix
            </a>
          </nav>

          <button
            type="button"
            onClick={() => openQuoteModal(recommendedTier)}
            className="px-4 py-2 rounded-lg bg-tacticalCyan hover:bg-cyan-400 text-obsidian font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all flex items-center gap-1.5"
          >
            <span>Configure {recommendedTier.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* =====================================================================
          HERO SECTION
         ===================================================================== */}
      <section className="relative z-10 pt-12 pb-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slateDeep border border-cardBorder mb-5">
            <span className="px-2 py-0.5 rounded bg-zeroTrustEmerald/20 text-zeroTrustEmerald font-mono text-xs font-semibold">
              [NVIDIA BLACKWELL & IGX / HGX PORTFOLIO]
            </span>
            <span className="font-mono text-xs text-gray-300">
              10,000 to 100,000,000+ Technical Pages
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            NVIDIA AI Appliance Lineup &{" "}
            <span className="bg-gradient-to-r from-tacticalCyan via-cyan-300 to-zeroTrustEmerald bg-clip-text text-transparent">
              Document Volume Scaling Model
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-gray-300 leading-relaxed">
            Every engineering archive has a distinct document volume, OCR
            complexity, and concurrency footprint. Use the interactive sizing
            model below to match your corpus scale to the exact turn-key{" "}
            <span className="text-white font-semibold">
              NVIDIA IGX Orin, DGX Spark (GB10), DGX Station GB300, RTX PRO 6000
              Blackwell Server, or DGX B200 BasePOD
            </span>{" "}
            appliance.
          </p>
        </motion.div>
      </section>

      {/* =====================================================================
          INTERACTIVE DOCUMENT VOLUME SCALING MODEL (modern-web-guidance: slider)
         ===================================================================== */}
      <section
        id="scaling-calculator"
        className="relative z-10 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="rounded-3xl bg-slateDeep/95 border border-cardBorder shadow-[0_25px_80px_rgba(0,0,0,0.75)] p-6 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cardBorder pb-6 mb-8">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-tacticalCyan flex items-center gap-2">
                <Sliders className="w-4 h-4" /> INTERACTIVE CAPACITY & THROUGHPUT
                SIMULATOR
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Size Your AirVault Appliance by Document Volume
              </h2>
            </div>
            <div className="px-4 py-2 rounded-xl bg-obsidian border border-zeroTrustEmerald/50 font-mono text-xs text-zeroTrustEmerald">
              RECOMMENDED PLATFORM:{" "}
              <span className="font-bold text-white">
                {recommendedTier.nvidiaPlatform}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* LEFT COLUMN: 3 Native Accessible Sliders */}
            <div className="lg:col-span-6 space-y-7">
              {/* Slider 1: Document Corpus Volume */}
              <div className="p-5 rounded-2xl bg-obsidian border border-cardBorder">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="volume-range-slider"
                    className="font-mono text-xs uppercase tracking-wider text-gray-300 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-tacticalCyan" />
                    1. Total Document Volume (Pages & Storage)
                  </label>
                  <span className="font-mono text-sm font-bold text-tacticalCyan">
                    {currentVolume.label}
                  </span>
                </div>

                <input
                  ref={volumeSliderRef}
                  type="range"
                  id="volume-range-slider"
                  className="airvault-slider"
                  min={0}
                  max={DOCUMENT_VOLUME_STEPS.length - 1}
                  step={1}
                  value={volumeStepIdx}
                  aria-valuetext={currentVolume.label}
                  onChange={(e) => setVolumeStepIdx(Number(e.target.value))}
                />

                <div className="flex justify-between font-mono text-[10px] text-gray-500 mt-1">
                  <span>15K Pages (30 GB)</span>
                  <span>500K Pages (1 TB)</span>
                  <span>6M Pages (12 TB)</span>
                  <span>75M Pages (150 TB)</span>
                </div>
              </div>

              {/* Slider 2: Scanned Blueprint / CAD Schematic Ratio */}
              <div className="p-5 rounded-2xl bg-obsidian border border-cardBorder">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="ocr-range-slider"
                    className="font-mono text-xs uppercase tracking-wider text-gray-300 flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4 text-warningAmber" />
                    2. Scanned PDFs, Blueprints & Complex Tables (%)
                  </label>
                  <span className="font-mono text-sm font-bold text-warningAmber">
                    {ocrCadRatioPct}% Heavy OCR / CAD Vision
                  </span>
                </div>

                <input
                  ref={ocrSliderRef}
                  type="range"
                  id="ocr-range-slider"
                  className="airvault-slider"
                  min={10}
                  max={100}
                  step={5}
                  value={ocrCadRatioPct}
                  aria-valuetext={`${ocrCadRatioPct} percent heavy OCR and CAD schematics`}
                  onChange={(e) => setOcrCadRatioPct(Number(e.target.value))}
                />

                <div className="flex justify-between font-mono text-[10px] text-gray-500 mt-1">
                  <span>10% (Mostly Native PDF)</span>
                  <span>50% (Mixed Engineering Manuals)</span>
                  <span>100% (All Scanned Blueprints)</span>
                </div>
              </div>

              {/* Slider 3: Concurrent Active Engineers */}
              <div className="p-5 rounded-2xl bg-obsidian border border-cardBorder">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="users-range-slider"
                    className="font-mono text-xs uppercase tracking-wider text-gray-300 flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-zeroTrustEmerald" />
                    3. Peak Concurrent Cleared Engineers
                  </label>
                  <span className="font-mono text-sm font-bold text-zeroTrustEmerald">
                    {concurrentUsers} Concurrent Operators
                  </span>
                </div>

                <input
                  ref={usersSliderRef}
                  type="range"
                  id="users-range-slider"
                  className="airvault-slider"
                  min={1}
                  max={500}
                  step={1}
                  value={concurrentUsers}
                  aria-valuetext={`${concurrentUsers} concurrent operators`}
                  onChange={(e) => setConcurrentUsers(Number(e.target.value))}
                />

                <div className="flex justify-between font-mono text-[10px] text-gray-500 mt-1">
                  <span>1 Operator (Edge)</span>
                  <span>50 Analysts (Division)</span>
                  <span>250 Engineers (Plant)</span>
                  <span>500+ (Enterprise)</span>
                </div>
              </div>

              {/* Batch Ingestion Time Comparison Across All 5 NVIDIA Tiers */}
              <div className="p-5 rounded-2xl bg-obsidian border border-cardBorder space-y-3">
                <div className="flex items-center justify-between font-mono text-xs text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-tacticalCyan" /> INITIAL
                    CORPUS INGESTION TIME BY NVIDIA PLATFORM
                  </span>
                  <span className="text-gray-400">
                    ({totalPages.toLocaleString()} pages @ {ocrCadRatioPct}% OCR)
                  </span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {NVIDIA_APPLIANCE_TIERS.map((tier) => {
                    const effectivePagesPerHr =
                      tier.pagesPerHourBase / ocrPenaltyMultiplier;
                    const hoursRequired = totalPages / effectivePagesPerHr;
                    const isRecommended = tier.id === recommendedTier.id;
                    const barWidthPct = Math.min(
                      100,
                      Math.max(8, (tier.pagesPerHourBase / 360_000) * 100)
                    );

                    return (
                      <div key={tier.id} className="space-y-1">
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span
                            className={
                              isRecommended
                                ? "text-tacticalCyan font-bold"
                                : "text-gray-300"
                            }
                          >
                            {tier.name} ({tier.nvidiaPlatform.split("(")[0].trim()})
                            {isRecommended ? " ★ RECOMMENDED" : ""}
                          </span>
                          <span className="text-white font-semibold">
                            {formatHours(hoursRequired)} (
                            {Math.round(effectivePagesPerHr).toLocaleString()}{" "}
                            pg/hr)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slateDeep overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isRecommended
                                ? "bg-tacticalCyan"
                                : "bg-gray-600"
                            }`}
                            style={{ width: `${barWidthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Recommended NVIDIA Appliance Output & Memory Telemetry */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div className="p-6 sm:p-7 rounded-2xl bg-obsidian border-2 border-tacticalCyan shadow-[0_0_45px_rgba(6,182,212,0.18)] space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-md bg-tacticalCyan/15 text-tacticalCyan border border-tacticalCyan/40 font-mono text-xs font-bold">
                    {recommendedTier.tierCode}
                  </span>
                  <span className="font-mono text-xs text-zeroTrustEmerald">
                    ● OPTIMAL SIZING MATCH
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {recommendedTier.name}
                  </h3>
                  <p className="font-mono text-sm text-tacticalCyan mt-1">
                    Powered by {recommendedTier.nvidiaPlatform}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {recommendedTier.formFactor}
                  </p>
                </div>

                {/* Calculated Index & Memory Telemetry Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slateDeep border border-cardBorder">
                    <div className="font-mono text-[10px] text-gray-400 uppercase">
                      Generated Chunks
                    </div>
                    <div className="font-mono text-lg font-bold text-white mt-0.5">
                      {totalChunks.toLocaleString()}
                    </div>
                    <div className="font-mono text-[10px] text-tacticalCyan">
                      3.2 Chunks / Page Avg
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slateDeep border border-cardBorder">
                    <div className="font-mono text-[10px] text-gray-400 uppercase">
                      Qdrant + BM25 Index
                    </div>
                    <div className="font-mono text-lg font-bold text-zeroTrustEmerald mt-0.5">
                      {totalIndexFootprintGb >= 1024
                        ? `${(totalIndexFootprintGb / 1024).toFixed(2)} TB`
                        : `${totalIndexFootprintGb} GB`}
                    </div>
                    <div className="font-mono text-[10px] text-gray-400">
                      Qdrant: {qdrantIndexGb}G • BM25: {bm25IndexGb}G
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slateDeep border border-cardBorder col-span-2 sm:col-span-1">
                    <div className="font-mono text-[10px] text-gray-400 uppercase">
                      Active VRAM / Pool
                    </div>
                    <div className="font-mono text-lg font-bold text-warningAmber mt-0.5">
                      {totalEstimatedVramGb} / {recommendedTier.memoryGbNumeric}{" "}
                      GB
                    </div>
                    <div className="font-mono text-[10px] text-gray-400">
                      Includes {kvCacheGb} GB KV Cache
                    </div>
                  </div>
                </div>

                {/* Hardware Breakdown List */}
                <div className="space-y-2.5 pt-2 border-t border-cardBorder text-xs font-mono">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400">NVIDIA Compute:</span>
                    <span className="text-right text-gray-100">
                      {recommendedTier.gpuComputeSpec}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400">VRAM / Unified Memory:</span>
                    <span className="text-right text-tacticalCyan font-bold">
                      {recommendedTier.vramOrUnifiedMemory}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400">AI Throughput:</span>
                    <span className="text-right text-zeroTrustEmerald">
                      {recommendedTier.aiPerformance}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400">NVMe Vault Storage:</span>
                    <span className="text-right text-gray-100">
                      {recommendedTier.storageConfig}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400">Power & Cooling:</span>
                    <span className="text-right text-gray-300">
                      {recommendedTier.powerAndCooling}
                    </span>
                  </div>
                </div>

                {/* Pre-Loaded Local Models */}
                <div className="pt-2">
                  <div className="font-mono text-[10px] uppercase text-gray-400 mb-2">
                    PRE-LOADED AIR-GAPPED MODEL VAULT:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendedTier.servedModels.map((mdl) => (
                      <span
                        key={mdl}
                        className="px-2.5 py-1 rounded bg-cardSurface border border-cardBorder font-mono text-[11px] text-cyan-200"
                      >
                        {mdl}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openQuoteModal(recommendedTier)}
                  className="w-full py-3.5 rounded-xl bg-tacticalCyan hover:bg-cyan-400 text-obsidian font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center gap-2"
                >
                  <span>
                    Request Bill of Materials for {recommendedTier.name}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5-TIER NVIDIA AI APPLIANCE LINEUP CARDS
         ===================================================================== */}
      <section
        id="nvidia-lineup"
        className="relative z-10 py-20 bg-slateDeep/80 border-y border-cardBorder"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs uppercase tracking-widest text-zeroTrustEmerald mb-2">
              // TURN-KEY NVIDIA HARDWARE CATALOG
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              AirVault × NVIDIA Enterprise AI Systems Lineup
            </h2>
            <p className="mt-3 text-gray-300">
              Every AirVault appliance ships pre-flashed with our isolated
              container runtime, offline Ed25519 license enforcement, Docling OCR
              weights, Qdrant + OpenSearch hybrid indices, and quantized local
              LLMs tuned for the underlying NVIDIA silicon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {NVIDIA_APPLIANCE_TIERS.map((tier) => {
              const isSelected = tier.id === recommendedTier.id;
              return (
                <div
                  key={tier.id}
                  className={`rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-cardSurface border-tacticalCyan shadow-[0_0_30px_rgba(6,182,212,0.2)] ring-1 ring-tacticalCyan"
                      : "bg-obsidian/90 border-cardBorder hover:border-gray-500"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-tacticalCyan">
                        {tier.tierCode}
                      </span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded bg-tacticalCyan text-obsidian font-mono text-[10px] font-bold">
                          SELECTED BY CALCULATOR
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {tier.name}
                      </h3>
                      <div className="font-mono text-xs text-zeroTrustEmerald mt-1">
                        {tier.nvidiaPlatform}
                      </div>
                    </div>

                    {/* Document Volume Badge */}
                    <div className="p-3.5 rounded-xl bg-slateDeep border border-cardBorder">
                      <div className="font-mono text-[10px] text-gray-400 uppercase">
                        Recommended Document Volume
                      </div>
                      <div className="font-mono text-base font-bold text-white mt-0.5">
                        {tier.corpusRangeLabel}
                      </div>
                      <div className="font-mono text-xs text-tacticalCyan">
                        Archive Footprint: {tier.vaultSizeLabel} • Up to{" "}
                        {tier.maxConcurrentUsers} Concurrent Users
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-300 font-mono">
                      <div>
                        <span className="text-gray-500">MEMORY / VRAM: </span>
                        <span className="text-white font-semibold">
                          {tier.vramOrUnifiedMemory}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">AI COMPUTE: </span>
                        <span>{tier.aiPerformance}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">INGESTION RATE: </span>
                        <span className="text-zeroTrustEmerald">
                          ~{tier.pagesPerHourBase.toLocaleString()} pages/hr
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">STORAGE: </span>
                        <span>{tier.storageConfig}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">DEPLOYMENT: </span>
                        <span className="text-gray-300">
                          {tier.targetEnvironment}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-cardBorder">
                    <button
                      type="button"
                      onClick={() => openQuoteModal(tier)}
                      className="w-full py-2.5 rounded-lg bg-slateDeep hover:bg-tacticalCyan hover:text-obsidian border border-cardBorder hover:border-tacticalCyan font-mono text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Select {tier.name} Specs
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5-TIER COMPARISON MATRIX & SCALING METHODOLOGY
         ===================================================================== */}
      <section
        id="comparison-matrix"
        className="relative z-10 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      >
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-tacticalCyan mb-2">
            // ARCHITECTURAL BENCHMARKS & SIZING MATRIX
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Document Volume to NVIDIA Hardware Scaling Reference
          </h2>
          <p className="mt-3 text-gray-300 max-w-3xl">
            Full side-by-side comparison of document capacity, vector index RAM,
            batch OCR ingestion throughput, and LLM parameter capability across
            all five NVIDIA hardware platforms.
          </p>
        </div>

        <div
          tabIndex={0}
          role="region"
          aria-labelledby="nvidia-matrix-caption"
          className="overflow-x-auto rounded-2xl border border-cardBorder bg-slateDeep/90 shadow-2xl"
        >
          <table className="w-full text-left text-xs font-mono border-collapse">
            <caption id="nvidia-matrix-caption" className="sr-only">
              NVIDIA AI Appliance Scaling Matrix by Document Volume
            </caption>
            <thead>
              <tr className="bg-obsidian border-b border-cardBorder text-gray-300 uppercase">
                <th className="py-4 px-4">Appliance Tier</th>
                <th className="py-4 px-4 text-tacticalCyan">
                  NVIDIA System / GPU
                </th>
                <th className="py-4 px-4">VRAM / Coherent Memory</th>
                <th className="py-4 px-4 text-zeroTrustEmerald">
                  Document Volume (Pages)
                </th>
                <th className="py-4 px-4">Batch OCR Rate</th>
                <th className="py-4 px-4">Primary Local LLM</th>
                <th className="py-4 px-4">Concurrent Users</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cardBorder text-gray-200">
              {NVIDIA_APPLIANCE_TIERS.map((tier) => (
                <tr
                  key={tier.id}
                  className={
                    tier.id === recommendedTier.id
                      ? "bg-tacticalCyan/10"
                      : "hover:bg-obsidian/40"
                  }
                >
                  <th className="py-4 px-4 font-bold text-white">
                    {tier.name}
                  </th>
                  <td className="py-4 px-4 text-tacticalCyan">
                    {tier.nvidiaPlatform}
                  </td>
                  <td className="py-4 px-4">{tier.vramOrUnifiedMemory}</td>
                  <td className="py-4 px-4 text-zeroTrustEmerald font-bold">
                    {tier.corpusRangeLabel} ({tier.vaultSizeLabel})
                  </td>
                  <td className="py-4 px-4">
                    {tier.pagesPerHourBase.toLocaleString()} pg/hr
                  </td>
                  <td className="py-4 px-4">{tier.servedModels[0]}</td>
                  <td className="py-4 px-4">Up to {tier.maxConcurrentUsers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================================================
          FOOTER
         ===================================================================== */}
      <footer className="relative z-10 border-t border-cardBorder bg-obsidian py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-tacticalCyan" />
            <span className="text-white font-bold">
              AIRVAULT × NVIDIA AI APPLIANCE SCALING MODEL
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="../" className="text-tacticalCyan hover:underline">
              ← Return to Main AirVault Showcase
            </a>
            <a
              href="https://github.com/gmascagni/airgap"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          LIGHT-DISMISS HARDWARE SIZING DIALOG (modern-web-guidance: light-dismiss-a-dialog)
         ===================================================================== */}
      <dialog
        ref={dialogRef}
        {...({ closedby: "any" } as any)}
        aria-labelledby={dialogTitleId}
        className="w-full max-w-lg rounded-2xl bg-slateDeep border border-cardBorder text-gray-100 p-0 shadow-2xl m-auto"
      >
        <div className="p-6 sm:p-7">
          <div className="flex items-center justify-between border-b border-cardBorder pb-4 mb-5">
            <div>
              <span className="font-mono text-[11px] uppercase text-tacticalCyan">
                // NVIDIA APPLIANCE SIZING DOSSIER
              </span>
              <h2 id={dialogTitleId} className="text-lg font-bold text-white">
                {quoteTierName}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close modal"
              className="p-1.5 rounded-lg border border-cardBorder text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {quoteSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-zeroTrustEmerald mx-auto" />
              <h3 className="text-lg font-bold text-white">
                Appliance Sizing Dossier Queued
              </h3>
              <p className="text-sm text-gray-300">
                Your configuration ({currentVolume.label},{" "}
                {concurrentUsers} concurrent users on {quoteTierName}) has been
                logged for an offline Bill of Materials and deployment schedule.
              </p>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="px-6 py-2.5 rounded-lg bg-tacticalCyan text-obsidian font-mono font-bold text-xs uppercase"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setQuoteSubmitted(true);
              }}
              className="space-y-4"
            >
              <div className="p-3.5 rounded-xl bg-obsidian border border-cardBorder font-mono text-xs text-gray-300 space-y-1">
                <div>
                  <span className="text-gray-500">SELECTED PLATFORM: </span>
                  <span className="text-tacticalCyan font-bold">
                    {quoteTierName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">TARGET CORPUS: </span>
                  <span className="text-white">{currentVolume.label}</span> (
                  {ocrCadRatioPct}% OCR/CAD)
                </div>
                <div>
                  <span className="text-gray-500">CONCURRENT USERS: </span>
                  <span className="text-zeroTrustEmerald">
                    {concurrentUsers} Operators
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="sizing-name"
                  className="block text-xs font-mono uppercase text-gray-300 mb-1"
                >
                  Full Name & Engineering Title *
                </label>
                <span id="sizing-name-hint" className="hint">
                  Format: First Last, Systems Director
                </span>
                <input
                  type="text"
                  id="sizing-name"
                  name="name"
                  required
                  minLength={2}
                  autoComplete="name"
                  aria-describedby="sizing-name-hint"
                  aria-errormessage="sizing-name-err"
                  placeholder="Maj. Marcus Vance, Chief Infrastructure Architect"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-cardBorder text-sm text-white focus:outline-none focus:border-tacticalCyan"
                />
                <div id="sizing-name-err" className="error-msg">
                  <span aria-hidden="true">⚠ </span>Please enter your full name.
                </div>
              </div>

              <div>
                <label
                  htmlFor="sizing-email"
                  className="block text-xs font-mono uppercase text-gray-300 mb-1"
                >
                  Official Agency / Corporate Email *
                </label>
                <span id="sizing-email-hint" className="hint">
                  Format: you@organization.gov or you@company.com
                </span>
                <input
                  type="email"
                  id="sizing-email"
                  name="email"
                  required
                  autoComplete="email"
                  aria-describedby="sizing-email-hint"
                  aria-errormessage="sizing-email-err"
                  placeholder="m.vance@aerospace-enclave.org"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-cardBorder text-sm text-white focus:outline-none focus:border-tacticalCyan"
                />
                <div id="sizing-email-err" className="error-msg">
                  <span aria-hidden="true">⚠ </span>Please enter a valid work or
                  agency email address.
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => dialogRef.current?.close()}
                  className="px-4 py-2.5 rounded-lg border border-cardBorder font-mono text-xs text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-tacticalCyan hover:bg-cyan-400 text-obsidian font-mono font-bold text-xs uppercase"
                >
                  Request BOM & Sizing Dossier
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </div>
  );
}
