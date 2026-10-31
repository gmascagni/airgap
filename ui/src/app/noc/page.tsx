"use client";
import DigitalTrailLabsLogo from "../../components/DigitalTrailLabsLogo";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  FileCode2,
  FileText,
  GitBranch,
  GitCommit,
  Globe,
  HardDrive,
  Layers,
  Lock,
  Megaphone,
  Radio,
  Rocket,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

interface DocHubFile {
  filename: string;
  title: string;
  summary: string;
  size_kb: number;
  sha256: string;
  markdown_content?: string;
  content?: string;
  last_modified?: string;
  category?: string;
}

interface VersionRelease {
  version: string;
  codename: string;
  date: string;
  type: string;
  summary: string;
  highlights: string[];
}

interface VersionManifest {
  company_name: string;
  product_name: string;
  field_edition_name: string;
  version: string;
  codename: string;
  release_date: string;
  status: string;
  changelog: VersionRelease[];
  classification_support?: string[];
  offline_guarantee?: string;
  tamper_evident_signing?: string;
  zero_egress_status?: string;
  hardware_profiles?: Record<string, string>;
  dependencies?: Record<string, string>;
}

const FALLBACK_DOCS: DocHubFile[] = [
  {
    filename: "01_Cryptographic_Audit_Ledger_Verification_Specification.md",
    title: "Cryptographic Audit Ledger Verification Specification",
    summary:
      "Defines HMAC-SHA256 hash chaining, SQLite schema integrity, tamper-detection mathematics, and NIST SP 800-88 Rev 1 purge verification.",
    size_kb: 14.8,
    sha256: "4b8f...e10a",
  },
  {
    filename: "02_Zero_Egress_and_Strict_Loopback_Hardware_Attestation.md",
    title: "Zero-Egress & Strict Loopback Hardware Attestation",
    summary:
      "Attestation procedure confirming zero network sockets, HF_HUB_OFFLINE=1, and hardware loopback lock.",
    size_kb: 11.2,
    sha256: "9c12...33da",
  },
  {
    filename: "03_Enterprise_Enclave_Operations_and_Key_Custody_SOP.md",
    title: "Enterprise Enclave Operations & Key Custody SOP",
    summary:
      "Standard operating procedure for DPAPI key management, BitLocker integration, and multi-tenant clearance segregation.",
    size_kb: 18.4,
    sha256: "2a77...b901",
  },
  {
    filename: "04_External_Security_Re-Audit_v2.1_Verification_Report.md",
    title: "External Security Re-Audit v2.1 Verification Report",
    summary:
      "Verification report auditing 13 findings across authentication, ABAC, cryptographic licensing, and zero egress.",
    size_kb: 22.1,
    sha256: "7f44...ce09",
  },
  {
    filename: "05_ABAC_Fine_Grained_Clearance_and_Compartment_PDP_Spec.md",
    title: "ABAC Fine-Grained Clearance & Compartment PDP Specification",
    summary:
      "Mathematical specification for pre-retrieval ABAC filtering at the vector and BM25 database layers.",
    size_kb: 16.5,
    sha256: "1e88...a003",
  },
  {
    filename: "06_FastEmbed_Deterministic_Offline_Embedding_Manifest.md",
    title: "FastEmbed Deterministic Offline Embedding Manifest",
    summary:
      "Specification for bundled offline ONNX BGE weights, model hashing, and deterministic embedding generation.",
    size_kb: 9.7,
    sha256: "3d55...88ab",
  },
];

const DEFAULT_VERSION_MANIFEST: VersionManifest = {
  company_name: "Digital Trail Labs",
  product_name: "TrailVault™ Enterprise",
  field_edition_name: "TrailVault™ FieldLite",
  version: "5.1.0",
  codename: "IronTrail",
  release_date: "2026-10-27",
  status: "PRODUCTION_HARDENED",
  changelog: [
    {
      version: "5.1.0",
      codename: "IronTrail",
      date: "2026-10-27",
      type: "MAJOR_FEATURE_AND_BRAND_RELEASE",
      summary:
        "Digital Trail Labs corporate rebrand (TrailVault™ Enterprise & FieldLite), Marketing NOC & Target Audience Command Center, Adaptive 3-Tier Compute Engine for lesser hardware (CPU-only offline laptops), Centralized Documentation Hub, and Cryptographic Version Control.",
      highlights: [
        "Brand Identity: Digital Trail Labs flagship brand logo and TrailVault™ Enterprise / FieldLite product naming across all surfaces.",
        "Adaptive 3-Tier Compute Engine: Added Tier-3 FieldLite CPU-Only mode (<20ms deterministic extractive synthesis + physical CPU core pinning) so the platform runs on GPU-less 8GB RAM field laptops.",
        "Marketing NOC (/noc/): Target audience prioritization matrix (CMMC Level 2/3 Defense Contractors, DoD Depot MRO, NERC CIP Utilities, Pharma/Semi Cleanrooms) with campaign playbooks.",
        "Centralized Documentation Hub (Documentation_Hub/): Master repository for architecture whitepapers, hardware sizing guides, marketing playbooks, and release notes.",
        "Cryptographic Version Control (VERSION.json & /api/v1/version): Full semantic versioning, component lockfile, and hash-chained audit trail.",
      ],
    },
    {
      version: "5.0.0",
      codename: "SovereignCore",
      date: "2026-10-27",
      type: "COMMERCIAL_ENTERPRISE_RELEASE",
      summary:
        "3-Pane Commercial Studio UI uplift, standalone PC deployment at C:\\TrailVault_Enterprise\\, live NVIDIA RTX 4090 GPU telemetry, SHA-256 document ledger, and NIST SP 800-88 Rev 1 media sanitization.",
      highlights: [
        "Standalone production build deployed to C:\\TrailVault_Enterprise\\ with one-click desktop launcher.",
        "Live hardware telemetry polling nvidia-smi for real-time VRAM, utilization, and thermal monitoring.",
        "Full-stream SHA-256 cryptographic file hashing on ingestion and NIST SP 800-88 Rev 1 application purge sanitization.",
      ],
    },
    {
      version: "4.2.0",
      codename: "VaultStream",
      date: "2026-10-26",
      type: "BULK_INGESTION_RELEASE",
      summary:
        "Multi-file batch upload, recursive folder tree upload (webkitdirectory), and zero-copy local/network directory crawler.",
      highlights: [
        "Added POST /api/v1/ingest/upload-batch for 1 to 1,000+ simultaneous files.",
        "Added POST /api/v1/ingest/directory for zero-copy server-side crawling of local drives, USB4 shuttles, and UNC shares.",
      ],
    },
    {
      version: "4.0.0",
      codename: "CrossVault",
      date: "2026-10-26",
      type: "INTELLIGENCE_ROUTING_RELEASE",
      summary:
        "Smart Cross-Vault Auto-Routing across multi-thousand-page manuals and real-time 4-stage ingestion progress bars.",
      highlights: [
        "Indexed 5,057-page Intel® 64 & IA-32 SDM and 144-page M16A2/M4 Operator Manual with sub-second hybrid retrieval.",
        "Added automatic lexical scope expansion so cross-document queries never lock onto a stale file filter.",
      ],
    },
  ],
};

export default function TechnicalDocumentationHubPage() {
  const [activeSection, setActiveSection] = useState<
    "docs-hub" | "lesser-hardware" | "version-control"
  >("docs-hub");
  const [docsList, setDocsList] = useState<DocHubFile[]>(FALLBACK_DOCS);
  const [selectedDocIdx, setSelectedDocIdx] = useState<number>(0);
  const [versionManifest, setVersionManifest] = useState<VersionManifest>(
    DEFAULT_VERSION_MANIFEST
  );
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  useEffect(() => {
    // Load live Documentation_Hub files and VERSION.json from local backend if running
    fetch(`${API_BASE}/api/v1/docs`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.documents) && data.documents.length > 0) {
          setDocsList(data.documents);
        }
      })
      .catch(() => {});

    fetch(`${API_BASE}/api/v1/version`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.version) {
          setVersionManifest({ ...DEFAULT_VERSION_MANIFEST, ...data });
        }
      })
      .catch(() => {});
  }, []);

  const activeDoc = docsList[selectedDocIdx] || docsList[0];

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2200);
  };

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-100 flex flex-col">
      {/* =====================================================================
          TOP DIGITAL TRAIL LABS COMMAND BAR
          ===================================================================== */}
      <header className="sticky top-0 z-30 bg-[#0A0F1A]/95 backdrop-blur-md border-b border-slate-800/90 px-6 py-3.5">
        <div className="max-w-[1680px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <a href="/" className="flex items-center gap-3 group">
              <DigitalTrailLabsLogo className="w-11 h-11 rounded-xl border border-cyan-500/40 bg-[#050811] p-1 shadow-[0_0_24px_rgba(34,211,238,0.2)]" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-cyan-400">
                    DIGITAL TRAIL LABS
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/40 font-mono text-[10px] font-semibold text-cyan-300">
                    v{versionManifest.version} • {versionManifest.codename}
                  </span>
                </div>
                <h1 className="font-sans text-base font-bold text-white tracking-tight">
                  TrailVault™ Command NOC, Target Strategy &amp; Documentation Hub
                </h1>
              </div>
            </a>
          </div>

          {/* Primary NOC Sub-Navigation */}
          <nav
            aria-label="Command NOC Sections"
            className="flex items-center bg-[#070A10] p-1 rounded-xl border border-slate-800 flex-wrap"
          >

            <button
              type="button"
              onClick={() => setActiveSection("lesser-hardware")}
              className={`px-3.5 py-1.5 rounded-lg font-sans text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeSection === "lesser-hardware"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Lesser-Hardware &amp; FieldLite Engine</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("docs-hub")}
              className={`px-3.5 py-1.5 rounded-lg font-sans text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeSection === "docs-hub"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Documentation Hub ({docsList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("version-control")}
              className={`px-3.5 py-1.5 rounded-lg font-sans text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeSection === "version-control"
                  ? "bg-amber-400 text-slate-950 font-bold shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Version Control (v{versionManifest.version})</span>
            </button>
          </nav>

          {/* Right Quick Links */}
          <div className="flex items-center gap-2.5">
            <a
              href="/"
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-sans text-xs font-semibold transition-all"
            >
              Website Home
            </a>
            <a
              href="/appliances/"
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-sans text-xs font-semibold transition-all"
            >
              Hardware Tiers
            </a>
            <a
              href="/app/"
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans text-xs font-bold flex items-center gap-1.5 shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Launch Full Application</span>
            </a>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="max-w-[1680px] w-full mx-auto px-6 py-8 flex-1 space-y-8 outline-none">
        {/* ===================================================================
            BRAND IDENTITY & CORPORATE ARCHITECTURE BANNER
            =================================================================== */}
        <section className="rounded-2xl bg-gradient-to-r from-[#0A1120] via-[#0C1629] to-[#091520] border border-slate-800 p-6 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-3 flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-slate-800/90 pb-4 lg:pb-0 lg:pr-6">
              <DigitalTrailLabsLogo className="w-24 h-24 rounded-2xl border border-cyan-500/40 shadow-[0_0_30px_rgba(34,211,238,0.2)] shrink-0" />
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                  CORPORATE ENTITY
                </div>
                <div className="font-sans text-xl font-extrabold text-white tracking-tight mt-0.5">
                  Digital Trail Labs
                </div>
                <div className="font-mono text-xs text-emerald-400 mt-1">
                  &ldquo;Intelligence Without Exposure.&rdquo;
                </div>
                <div className="font-mono text-[11px] text-slate-400 mt-1">
                  Release: v{versionManifest.version} ({versionManifest.codename})
                </div>
              </div>
            </div>

            <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#070B12] border border-cyan-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    FLAGSHIP B2B / GOV SUITE
                  </span>
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="font-sans text-base font-bold text-white">
                  TrailVault™ Enterprise
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Full GPU-accelerated air-gapped studio for RTX 4090 / Ada workstations &amp; SCIF racks. Pre-retrieval ABAC, SHA-256 ledger, and visual bounding-box inspection.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#070B12] border border-emerald-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    LESSER-HARDWARE / CPU EDITION
                  </span>
                  <Cpu className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="font-sans text-base font-bold text-white">
                  TrailVault™ FieldLite
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Engineered for standard CPU-only GFE Toughbooks &amp; 8GB–16GB RAM laptops with <strong>zero discrete GPU</strong>. Sub-20ms deterministic extractive synthesis + compact CPU GGUF.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#070B12] border border-amber-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    PORTABLE NVMe APPLIANCE
                  </span>
                  <HardDrive className="w-4 h-4 text-amber-400" />
                </div>
                <div className="font-sans text-base font-bold text-white">
                  TrailVault™ Tactical Shuttle
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Self-contained USB4 40Gbps NVMe solid-state appliance for instant on-site customer briefings with NIST SP 800-88 Rev 1 cryptographic session purge.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 2: LESSER-HARDWARE & FIELDLITE CPU-ONLY ARCHITECTURE
            =================================================================== */}
        {activeSection === "lesser-hardware" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0A0F1A] border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                    ADAPTIVE 3-TIER LOCAL EXECUTION ENGINE
                  </span>
                  <h2 className="font-sans text-2xl font-bold text-white mt-1">
                    Engineered for Full GPU Workstations AND Lesser CPU-Only Hardware
                  </h2>
                  <p className="text-sm text-slate-400 mt-1 max-w-4xl">
                    Not every defense technician, quality inspector, or field engineer carries an NVIDIA RTX 4090 workstation. TrailVault™ automatically adapts its inference and indexing pipeline across three hardware tiers—delivering sub-20ms deterministic extractive retrieval on standard GPU-less laptops.
                  </p>
                </div>
                <a
                  href="/app/"
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Test T1 / T2 / T3 Switcher Live in App</span>
                </a>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-4">
                {/* Tier 1 */}
                <div className="p-5 rounded-xl bg-[#070A10] border border-cyan-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold">
                      TIER 1 • WORKSTATION / SERVER GPU
                    </span>
                    <Server className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="font-sans text-lg font-bold text-white">
                    TrailVault™ Enterprise Studio
                  </div>
                  <div className="font-mono text-xs text-slate-400">
                    Hardware: NVIDIA RTX 4090 / RTX 5000 Ada (16GB–48GB VRAM)
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <li>• <strong>Models:</strong> Qwen 3.5 (4B/8B/14B) &amp; Llama-3.1-8B-Instruct (`Q4_K_M`)</li>
                    <li>• <strong>Runtime:</strong> 100% CUDA GPU layer offload (`num_gpu=999`, `num_ctx=8192`)</li>
                    <li>• <strong>Throughput:</strong> 85–135 tokens/sec generative synthesis</li>
                    <li>• <strong>Ideal For:</strong> Primary engineering enclaves, SCIF server rooms, and executive live demonstrations</li>
                  </ul>
                </div>

                {/* Tier 2 */}
                <div className="p-5 rounded-xl bg-[#070A10] border border-blue-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 font-mono text-xs font-bold">
                      TIER 2 • MID-RANGE EDGE GPU
                    </span>
                    <Layers className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="font-sans text-lg font-bold text-white">
                    TrailVault™ Edge GPU Profile
                  </div>
                  <div className="font-mono text-xs text-slate-400">
                    Hardware: 4GB–8GB VRAM Laptops (RTX 3050 / 4060 / A2000)
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <li>• <strong>Models:</strong> `qwen2.5:3b-instruct-q4_K_M` or `llama3.2:3b` (1.9 GB footprint)</li>
                    <li>• <strong>Runtime:</strong> Compact 4K context window (`num_ctx=4096`, `num_batch=256`)</li>
                    <li>• <strong>Throughput:</strong> 45–70 tokens/sec generative synthesis</li>
                    <li>• <strong>Ideal For:</strong> Mobile field engineering laptops and quality assurance workstations</li>
                  </ul>
                </div>

                {/* Tier 3 */}
                <div className="p-5 rounded-xl bg-[#070A10] border-2 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.12)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                      TIER 3 • LESSER HARDWARE (CPU-ONLY)
                    </span>
                    <Cpu className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="font-sans text-lg font-bold text-white">
                    TrailVault™ FieldLite (Zero-GPU)
                  </div>
                  <div className="font-mono text-xs text-emerald-300">
                    Hardware: Standard Intel i5/i7 or Ryzen CPU • 8GB–16GB RAM • 0 GB VRAM
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <li>• <strong>Local Dense Embeddings:</strong> Quantized `BAAI/bge-small-en-v1.5` 384-d dense vectors compute in <strong>&lt;3ms</strong> on any CPU via ONNX Runtime</li>
                    <li>• <strong>Mode 3A (Extractive Deterministic):</strong> Synthesizes top-ranked sentences, tolerances, and part numbers with `[Filename, Page X]` citations in <strong>&lt;20 milliseconds</strong> without loading a heavy LLM</li>
                    <li>• <strong>Mode 3B (CPU-Pinned Compact GGUF):</strong> Optional `qwen2.5:1.5b-instruct-q4_K_M` (980 MB RAM) pinned to physical CPU cores at 18–28 tok/sec</li>
                    <li>• <strong>Ideal For:</strong> Rugged GFE Toughbooks, flight-line maintenance tablets, and air-gapped shop-floor terminals</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SECTION 3: CENTRALIZED DOCUMENTATION HUB (Documentation_Hub/)
            =================================================================== */}
        {activeSection === "docs-hub" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar: Document List */}
            <div className="lg:col-span-4 space-y-3">
              <div className="p-4 rounded-xl bg-[#0A0F1A] border border-slate-800">
                <div className="font-mono text-[11px] font-bold uppercase text-cyan-400">
                  MASTER DOCUMENTATION REPOSITORY
                </div>
                <div className="font-mono text-xs text-slate-300 mt-1 break-all">
                  Location: C:\Users\gmasc\Documents\Antigravity\AirGap\Documentation_Hub\
                </div>
                <div className="font-mono text-[11px] text-slate-400 mt-1">
                  Also mirrored to: C:\TrailVault_Enterprise\Documentation_Hub\
                </div>
              </div>

              {docsList.map((doc, idx) => (
                <button
                  key={doc.filename}
                  type="button"
                  onClick={() => setSelectedDocIdx(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedDocIdx === idx
                      ? "bg-[#0D1628] border-cyan-500/60 text-white"
                      : "bg-[#0A0F1A] border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[11px] text-cyan-400 mb-1">
                    <span>{doc.filename}</span>
                    <span>{doc.size_kb} KB</span>
                  </div>
                  <div className="font-sans text-sm font-bold text-white">
                    {doc.title}
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 mt-1">
                    Updated: {doc.last_modified}
                  </div>
                </button>
              ))}
            </div>

            {/* Right Pane: Full Markdown Document Viewer */}
            <div className="lg:col-span-8 rounded-2xl bg-[#0A0F1A] border border-slate-800 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="font-mono text-xs text-cyan-400">
                    Documentation_Hub/{activeDoc.filename}
                  </div>
                  <h2 className="font-sans text-lg font-bold text-white mt-0.5">
                    {activeDoc.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(activeDoc.content || activeDoc.markdown_content || "", activeDoc.filename)
                  }
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 font-mono text-xs text-cyan-300 flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>
                    {copiedLabel === activeDoc.filename
                      ? "Copied Markdown!"
                      : "Copy Full Document"}
                  </span>
                </button>
              </div>

              <pre className="p-5 rounded-xl bg-[#070A10] border border-slate-800/90 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[680px]">
                {activeDoc.content}
              </pre>
            </div>
          </div>
        )}

        {/* ===================================================================
            SECTION 4: VERSION CONTROL & RELEASE LEDGER (VERSION.json)
            =================================================================== */}
        {activeSection === "version-control" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0A0F1A] border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
                    CRYPTOGRAPHIC VERSION CONTROL &amp; RELEASE LEDGER
                  </span>
                  <h2 className="font-sans text-2xl font-bold text-white mt-1">
                    {versionManifest.company_name} — {versionManifest.product_name}{" "}
                    v{versionManifest.version} ({versionManifest.codename})
                  </h2>
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    Manifest Source: VERSION.json • API Endpoint: GET /api/v1/version • Audit Chain: SHA-256 Hash-Linked
                  </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-300">
                  STATUS: {versionManifest.status}
                </div>
              </div>

              <div className="space-y-4 mt-6">
                {versionManifest.changelog.map((rel, idx) => (
                  <div
                    key={rel.version}
                    className={`p-5 rounded-xl border ${
                      idx === 0
                        ? "bg-[#0D1628] border-cyan-500/50"
                        : "bg-[#070A10] border-slate-800"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <GitCommit className="w-4 h-4 text-cyan-400" />
                        <span className="font-mono text-sm font-bold text-white">
                          v{rel.version} — Codename: {rel.codename}
                        </span>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-mono text-[10px] font-bold">
                            ACTIVE PRODUCTION RELEASE
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-slate-400">
                        Released: {rel.date} • {rel.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                      {rel.summary}
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                      {rel.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
