"use client";

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

interface TargetAudienceVertical {
  rank: number;
  id: string;
  tierBadge: string;
  title: string;
  acvRange: string;
  salesCycle: string;
  winProbability: string;
  recommendedEdition: string;
  complianceDrivers: string[];
  buyerPersonas: string[];
  corePainPoint: string;
  trailVaultWedge: string;
  sampleUseCases: string[];
  emailSubject: string;
  outreachPitch: string;
  objectionHandler: {
    objection: string;
    response: string;
  };
}

const TARGET_AUDIENCES: TargetAudienceVertical[] = [
  {
    rank: 1,
    id: "dib-cmmc",
    tierBadge: "TIER 1 • PRIMARY WEDGE (FASTEST CLOSE)",
    title: "Defense Industrial Base (DIB) Tier-1 / Tier-2 Subcontractors",
    acvRange: "$45,000 – $185,000 ACV",
    salesCycle: "30 – 60 Days",
    winProbability: "HIGH (CMMC 2.0 Deadline Driven)",
    recommendedEdition: "TrailVault™ Enterprise Workstation + USB4 Tactical Shuttle",
    complianceDrivers: [
      "CMMC 2.0 Level 2 & Level 3",
      "NIST SP 800-171 Rev 3 (110 Controls)",
      "DFARS 252.204-7012",
      "ITAR / EAR Export Control",
    ],
    buyerPersonas: [
      "VP of Engineering / Director of Manufacturing",
      "Chief Information Security Officer (CISO) / Facility Security Officer (FSO)",
      "Director of Quality & Compliance (CMMC Lead)",
    ],
    corePainPoint:
      "300,000+ defense manufacturers hold CUI/ITAR technical drawings, RFPs, and MIL-STD manuals. Uploading a single ITAR blueprint to commercial ChatGPT, Copilot, or public cloud AI is an export violation—and provisioning Azure Gov Cloud costs $150k+ in FedRAMP consulting before indexing a single page.",
    trailVaultWedge:
      "Deploy on Day 1 inside existing CMMC enclave with zero cloud boundary changes. Enforces pre-retrieval ABAC clearance filtering (SECRET_ITAR vs. SUBCONTRACTOR_CUI) at the Qdrant + BM25 layer and verifies every answer with a pixel-accurate red bounding box on the source PDF/CAD drawing.",
    sampleUseCases: [
      "Cross-referencing 5,000+ page MIL-STD manuals, Engineering Change Orders (ECOs), and Excel BOMs during proposal and manufacturing reviews",
      "Automated CUI vs. SECRET//ITAR access segregation when subcontractors share a technical terminal",
      "Instant part number (NAS/MS/AN/MIL) tolerance lookup with visual schematic highlight",
    ],
    emailSubject:
      "Zero-Cloud AI for CUI/ITAR Engineering Manuals — Live on Your Files in 60 Seconds",
    outreachPitch:
      "We built TrailVault™ Enterprise at Digital Trail Labs specifically for CMMC Level 2/3 defense contractors who want private AI over their PDFs, CAD drawings, and BOMs without touching a cloud API. Give us 3 of your own unclassified/CUI manuals during a 15-minute live briefing—we'll plug in our self-contained appliance, index your files in under 30 seconds, and prove every answer with a visual bounding box on the exact page.",
    objectionHandler: {
      objection:
        "\"Our CISO won't approve any AI software that connects to external model APIs or retains customer files.\"",
      response:
        "\"TrailVault™ binds strictly to 127.0.0.1 loopback with OS-level offline locks (HF_HUB_OFFLINE=1, zero external sockets). At the end of our demo, we click one button to execute a NIST SP 800-88 Rev 1 media purge (CSPRNG overwrite + fsync + memory eviction) of your test files right in front of your FSO, with guidance for full-volume NVMe Cryptographic Erase.\"",
    },
  },
  {
    rank: 2,
    id: "dod-depot-fieldlite",
    tierBadge: "TIER 2 • LESSER-HARDWARE VOLUME EXPANSION",
    title: "DoD Depot Maintenance, Flight-Line MRO & Naval Shipyards",
    acvRange: "$120,000 – $450,000 ACV",
    salesCycle: "60 – 120 Days (SBIR / OTA / Prime Subcontract)",
    winProbability: "HIGH (Unique CPU-Only FieldLite Advantage)",
    recommendedEdition: "TrailVault™ FieldLite (CPU-Only Rugged GFE Laptop Edition)",
    complianceDrivers: [
      "MIL-STD-810H / Rugged Disconnected Ops",
      "IL5 / IL6 Air-Gapped Enclave",
      "NAVAIR / USAF Technical Order (TO) Integrity",
    ],
    buyerPersonas: [
      "Program Manager (PMA / SPO Sustainment)",
      "Depot Maintenance Engineering Lead",
      "Fleet Readiness / Tactical Edge IT Director",
    ],
    corePainPoint:
      "Flight-line technicians, submarine maintenance crews, and forward-operating maintainers use standard Government Furnished Equipment (GFE) rugged laptops (Panasonic Toughbook / Dell Latitude Rugged) with Intel Core i5/i7 CPUs, 8GB–16GB RAM, and ZERO discrete NVIDIA GPUs. Traditional LLM RAG tools crash or take 3+ minutes per query on CPU-only laptops.",
    trailVaultWedge:
      "TrailVault™ FieldLite uses local BGE dense neural vectors (<3ms) + BM25 + Part-Number Regex + deterministic extractive synthesis to return exact cited answers and visual bounding boxes in <20 milliseconds with ZERO GPU required—or runs physical-core-pinned Qwen2.5-1.5B GGUF completely in standard RAM.",
    sampleUseCases: [
      "Offline troubleshooting across 5,000-page Technical Manuals (TMs) and Interactive Electronic Technical Manuals (IETMs) inside aircraft hangars or submarine hulls",
      "Instant lookup of torque values, lubrication specs (MIL-PRF-63460), and wiring pinouts on GPU-less Toughbooks",
    ],
    emailSubject:
      "Sub-20ms Offline Technical Manual Search on Standard CPU-Only GFE Toughbooks",
    outreachPitch:
      "Most local AI tools require an expensive $4,000 NVIDIA GPU workstation. Digital Trail Labs engineered TrailVault™ FieldLite to run 100% offline on standard CPU-only GFE laptops (8GB RAM, zero GPU) with <20ms response times across 5,000-page technical manuals—complete with exact page citations and visual bounding-box inspection.",
    objectionHandler: {
      objection:
        "\"Our field technicians only have standard CPU laptops with 8GB–16GB RAM and no discrete GPU.\"",
      response:
        "\"Switch TrailVault™ into Tier-3 FieldLite CPU-Only mode right now in the top bar: watch it search 5,000+ pages and return a verified, cited answer with a red bounding box on the schematic in under 20 milliseconds using 0 MB of GPU VRAM.\"",
    },
  },
  {
    rank: 3,
    id: "critical-infra-nerc",
    tierBadge: "TIER 3 • COMMERCIAL ENTERPRISE INFRASTRUCTURE",
    title: "Critical Infrastructure, Nuclear Power & Electric Grid OT",
    acvRange: "$75,000 – $250,000 ACV",
    salesCycle: "45 – 90 Days",
    winProbability: "MEDIUM-HIGH (NERC CIP Mandate)",
    recommendedEdition: "TrailVault™ Enterprise Rack / Workstation + FieldLite Edge",
    complianceDrivers: [
      "NERC CIP-005 / CIP-007 / CIP-011",
      "NRC 10 CFR 73.54 (Nuclear Cyber Security)",
      "IEC 62443 OT Air-Gap Isolation",
    ],
    buyerPersonas: [
      "VP of Operational Technology (OT) / SCADA Security",
      "Chief Nuclear Engineer / Plant Outage Director",
      "NERC CIP Compliance Officer",
    ],
    corePainPoint:
      "Control rooms and substation networks sit behind hardware data diodes with zero internet access. During a plant outage or relay fault, engineers lose hours searching thousands of legacy relay PDFs, P&ID schematics, and OEM turbine manuals.",
    trailVaultWedge:
      "Zero-copy directory crawler (`POST /api/v1/ingest/directory`) indexes tens of thousands of legacy PDF/DOCX/XLSX plant manuals directly from an isolated NAS share with SHA-256 chain-of-custody hashing.",
    sampleUseCases: [
      "Control-room fault recovery across Siemens/GE/ABB turbine and protective relay manuals",
      "Nuclear licensing basis and corrective action program (CAP) document cross-checking",
    ],
    emailSubject:
      "NERC CIP Compliant Offline AI for Air-Gapped Control Rooms & P&ID Schematics",
    outreachPitch:
      "Behind a hardware data diode, cloud AI doesn't exist. TrailVault™ Enterprise deploys inside your OT enclave in 15 minutes, crawls your existing P&ID and OEM manual folders in-place, and gives outage engineers instant, bounding-box-verified answers with a SHA-256 tamper-evident audit log.",
    objectionHandler: {
      objection:
        "\"We have 25,000 legacy PDFs and Excel spreadsheets on a local server—nobody has time to upload them one by one.\"",
      response:
        "\"TrailVault™ includes a Zero-Copy Recursive Directory Crawler: point it at your local folder or NAS path and it bulk-indexes thousands of PDF, Word, Excel, PowerPoint, and CAD image files in-place with a live real-time progress bar.\"",
    },
  },
  {
    rank: 4,
    id: "semi-biopharma-ip",
    tierBadge: "TIER 4 • HIGH-IP COMMERCIAL R&D",
    title: "Semiconductor Fab Cleanrooms & Biopharma GMP Manufacturing",
    acvRange: "$60,000 – $220,000 ACV",
    salesCycle: "45 – 75 Days",
    winProbability: "MEDIUM-HIGH (Zero IP Leakage + 21 CFR Part 11)",
    recommendedEdition: "TrailVault™ Enterprise Studio",
    complianceDrivers: [
      "FDA 21 CFR Part 11 (Electronic Records & Audit Trails)",
      "SEMI E187 Fab Equipment Cybersecurity",
      "Trade Secret / Process Recipe Sovereignty",
    ],
    buyerPersonas: [
      "VP of Fab Yield / Process Engineering",
      "Head of GMP Quality Assurance & Regulatory Affairs",
      "Chief Intellectual Property Counsel",
    ],
    corePainPoint:
      "Sub-2nm lithography process recipes, cleanroom tool logs, and FDA Chemistry, Manufacturing, and Controls (CMC) batch records are crown-jewel trade secrets that legal counsel strictly bans from external cloud LLMs.",
    trailVaultWedge:
      "100% on-premise execution with SHA-256 document ledger and hash-chained audit logs that satisfy FDA 21 CFR Part 11 electronic record integrity.",
    sampleUseCases: [
      "Querying Intel/ASML/Applied Materials processor & tool manuals alongside internal deviation logs",
      "Instant QA verification across SOPs (.docx), batch tables (.xlsx), and stability specs (.pdf)",
    ],
    emailSubject:
      "Zero-Telemetry On-Premise AI for Cleanroom Process Specs & 21 CFR Part 11 SOPs",
    outreachPitch:
      "Keep crown-jewel process recipes and GMP batch records 100% inside your facility walls. TrailVault™ Enterprise combines local GPU synthesis with SHA-256 cryptographic document ledgers and visual page verification.",
    objectionHandler: {
      objection:
        "\"How do our QA auditors know the AI didn't hallucinate a specification or tolerance?\"",
      response:
        "\"Every TrailVault™ response is strictly grounded in retrieved snippets and paired with our Visual Ground-Truth Inspector, which renders the actual source page at 140 DPI and draws a red bounding box around the exact table or paragraph.\"",
    },
  },
];

interface DocHubFile {
  filename: string;
  title: string;
  size_kb: number;
  last_modified: string;
  content: string;
}

const FALLBACK_DOCS: DocHubFile[] = [
  {
    filename: "01_Architecture_and_Security_Whitepaper.md",
    title: "TrailVault™ Enterprise v5.1 — Sovereign Architecture & Defense Security Whitepaper",
    size_kb: 6.4,
    last_modified: "2026-10-27 UTC",
    content: `# TrailVault™ Enterprise v5.1 — Sovereign Architecture & Defense Security Whitepaper
**Published by:** Digital Trail Labs  
**Document ID:** DTL-TV-WP-2026-001 • **Version:** 5.1.0 (Codename: IronTrail)

## 1. Executive Summary
TrailVault™ Enterprise is a commercial-grade, zero-telemetry, air-gapped Retrieval-Augmented Generation (RAG) and Visual Evidence Inspection platform engineered for Defense Industrial Base (DIB) contractors, Federal/DoD agencies, Critical Infrastructure operators, and high-security B2B enterprises.

## 2. Hardened Security Controls
- **Loopback Socket Isolation:** Binds strictly to 127.0.0.1:8000 with HF_HUB_OFFLINE=1, TRANSFORMERS_OFFLINE=1, and ANONYMIZED_TELEMETRY=False.
- **Pre-Retrieval ABAC Enforcement:** Security classification tags (SECRET // ITAR // NOFORN vs. CUI // NOFORN // ITAR) are enforced inside Qdrant and BM25 before any chunk reaches the LLM context window.
- **SHA-256 Document Ledger & Hash-Chained Audit Log:** Full-stream SHA-256 digest on every ingested file + NIST AU-9 tamper-evident hash chain.
- **NIST SP 800-88 Rev 1 Flash Media Sanitization:** Overwrites customer test files with CSPRNG random bytes + fsync before unlinking, paired with volume-level Cryptographic Erase guidance for flash NVMe storage.`,
  },
  {
    filename: "02_Lesser_Hardware_and_FieldLite_Deployment_Guide.md",
    title: "TrailVault™ FieldLite — Lesser-Hardware & CPU-Only Offline Deployment Guide",
    size_kb: 5.8,
    last_modified: "2026-10-27 UTC",
    content: `# TrailVault™ FieldLite — Lesser-Hardware & CPU-Only Offline Deployment Guide
**Published by:** Digital Trail Labs  
**Document ID:** DTL-TV-HW-2026-002 • **Version:** 5.1.0 (Codename: IronTrail)

## 1. Adaptive 3-Tier Compute Architecture
1. **Tier 1 (TrailVault™ Enterprise Workstation/Server):** NVIDIA RTX 4090 / RTX 5000 Ada (16GB–48GB VRAM) • Full CUDA offload (num_gpu=999, 8K context).
2. **Tier 2 (TrailVault™ Edge GPU Laptop):** 4GB–8GB VRAM laptops • Quantized 3B/4B models with 4K context.
3. **Tier 3 (TrailVault™ FieldLite CPU-Only):** Standard Intel Core i5/i7 or AMD Ryzen 5/7 laptops with 8GB–16GB RAM and ZERO discrete GPU.
   - **Mode 3A (Extractive Deterministic Synthesis):** <20ms total latency with 0 MB GPU VRAM using local BGE-small-en-v1.5 dense neural vectors + BM25 + Part-Number Regex + sentence-level technical synthesis.
   - **Mode 3B (CPU-Pinned Compact GGUF):** Runs qwen2.5:1.5b-instruct-q4_K_M on physical CPU cores at 18–28 tokens/sec.`,
  },
  {
    filename: "03_Marketing_NOC_Target_Audience_and_Campaign_Playbook.md",
    title: "Digital Trail Labs — Marketing NOC & Target Audience Campaign Playbook",
    size_kb: 6.1,
    last_modified: "2026-10-27 UTC",
    content: `# Digital Trail Labs — Marketing NOC & Target Audience Campaign Playbook
**Published by:** Digital Trail Labs Marketing NOC  
**Document ID:** DTL-TV-MKT-2026-003 • **Version:** 5.1.0 (Codename: IronTrail)

## Ranked Target Verticals
1. **Tier 1:** Defense Industrial Base (DIB) Tier-1/2 Subcontractors ($45K–$185K ACV • CMMC 2.0 Level 2/3 & ITAR).
2. **Tier 2:** DoD Depot Maintenance, Flight-Line MRO & Naval Shipyards ($120K–$450K ACV • TrailVault™ FieldLite on CPU-only GFE Toughbooks).
3. **Tier 3:** Critical Infrastructure, Nuclear Power & Electric Grid OT ($75K–$250K ACV • NERC CIP data-diode enclaves).
4. **Tier 4:** Semiconductor Fab Cleanrooms & Biopharma GMP Labs ($60K–$220K ACV • FDA 21 CFR Part 11 & IP protection).`,
  },
  {
    filename: "04_Version_Control_and_Release_Ledger.md",
    title: "Digital Trail Labs — Version Control Standard & Release Ledger",
    size_kb: 4.9,
    last_modified: "2026-10-27 UTC",
    content: `# Digital Trail Labs — Version Control Standard & Release Ledger
**Published by:** Digital Trail Labs Release Engineering  
**Document ID:** DTL-TV-VCS-2026-004 • **Active Release:** v5.1.0 (Codename: IronTrail)

## Release History
- **v5.1.0 (IronTrail) — 2026-10-27:** Digital Trail Labs / TrailVault™ rebrand, Marketing NOC (/noc/), Adaptive 3-Tier Compute Engine (Tier 1 RTX GPU / Tier 2 Edge GPU / Tier 3 FieldLite CPU-Only <20ms), centralized Documentation_Hub/, and VERSION.json release ledger.
- **v5.0.0 (SovereignCore) — 2026-10-27:** 3-pane Enterprise Intelligence Studio, standalone C:\\AirVault_Enterprise\\ production deployment, live nvidia-smi GPU telemetry, SHA-256 document ledger, and NIST SP 800-88 Rev 1 media sanitization.
- **v4.2.0 (VaultStream) — 2026-10-26:** Multi-file batch upload, whole-folder tree upload, and zero-copy local/network directory crawler.
- **v4.0.0 (CrossVault) — 2026-10-26:** Smart Cross-Vault Auto-Routing across 5,057-page Intel SDM and 144-page M16/M4 manuals + real-time 4-stage progress telemetry.`,
  },
];

interface VersionManifest {
  company_name: string;
  product_name: string;
  field_edition_name: string;
  version: string;
  codename: string;
  release_date: string;
  status: string;
  changelog: Array<{
    version: string;
    codename: string;
    date: string;
    type: string;
    summary: string;
    highlights: string[];
  }>;
}

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
        "3-Pane Commercial Studio UI uplift, standalone PC deployment at C:\\AirVault_Enterprise\\, live NVIDIA RTX 4090 GPU telemetry, SHA-256 document ledger, and NIST SP 800-88 Rev 1 media sanitization.",
      highlights: [
        "Standalone production build deployed to C:\\AirVault_Enterprise\\ with one-click desktop launcher.",
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

export default function MarketingNocAndDocumentationHubPage() {
  const [activeSection, setActiveSection] = useState<
    "marketing-noc" | "lesser-hardware" | "docs-hub" | "version-control"
  >("marketing-noc");
  const [selectedVerticalId, setSelectedVerticalId] =
    useState<string>("dib-cmmc");
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

  const selectedVertical =
    TARGET_AUDIENCES.find((v) => v.id === selectedVerticalId) ||
    TARGET_AUDIENCES[0];
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
              <img
                src="/brand/digital-trail-labs-logo.svg"
                alt="Digital Trail Labs Logo"
                className="w-11 h-11 rounded-xl border border-cyan-500/40 bg-[#050811] p-1 shadow-[0_0_24px_rgba(34,211,238,0.2)]"
              />
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
              onClick={() => setActiveSection("marketing-noc")}
              className={`px-3.5 py-1.5 rounded-lg font-sans text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeSection === "marketing-noc"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Marketing NOC &amp; Target Audiences</span>
            </button>
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

      <main className="max-w-[1680px] w-full mx-auto px-6 py-8 flex-1 space-y-8">
        {/* ===================================================================
            BRAND IDENTITY & CORPORATE ARCHITECTURE BANNER
            =================================================================== */}
        <section className="rounded-2xl bg-gradient-to-r from-[#0A1120] via-[#0C1629] to-[#091520] border border-slate-800 p-6 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-3 flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-slate-800/90 pb-4 lg:pb-0 lg:pr-6">
              <img
                src="/brand/digital-trail-labs-logo.png"
                alt="Digital Trail Labs Master Emblem"
                className="w-24 h-24 rounded-2xl border border-cyan-500/40 object-cover shadow-[0_0_30px_rgba(34,211,238,0.2)] shrink-0"
              />
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
            SECTION 1: MARKETING NOC & TARGET AUDIENCE COMMAND CENTER
            =================================================================== */}
        {activeSection === "marketing-noc" && (
          <div className="space-y-8">
            {/* Top KPI & Market Sizing Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-[#0A0F1A] border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>PRIMARY TARGET TAM (US DIB)</span>
                  <Building2 className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="font-mono text-2xl font-bold text-white mt-2 tabular-nums">
                  300,000+ Contractors
                </div>
                <div className="text-xs text-emerald-400 font-mono mt-1">
                  Mandatory CMMC 2.0 Level 2/3 Enforcement
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#0A0F1A] border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>TARGET DEAL SIZE (ACV)</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="font-mono text-2xl font-bold text-white mt-2 tabular-nums">
                  $45K – $185K / yr
                </div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  75% Faster Close vs. FedRAMP Cloud AI
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#0A0F1A] border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>FIELD / DEPOT LAPTOP EXPANSION</span>
                  <Cpu className="w-4 h-4 text-amber-400" />
                </div>
                <div className="font-mono text-2xl font-bold text-white mt-2 tabular-nums">
                  Zero-GPU FieldLite
                </div>
                <div className="text-xs text-amber-300 font-mono mt-1">
                  Runs on 8GB RAM CPU-Only GFE Laptops (&lt;20ms)
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#0A0F1A] border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>ON-SITE DEMO CONVERSION WEDGE</span>
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="font-mono text-2xl font-bold text-white mt-2 tabular-nums">
                  60-Second Proof
                </div>
                <div className="text-xs text-cyan-300 font-mono mt-1">
                  Live on Customer&apos;s Own Files + 3-Pass Wipe
                </div>
              </div>
            </div>

            {/* Interactive Target Audience Matrix & Campaign Playbook */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Ranked Target Audience Selector */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span>Prioritized Target Audience Matrix</span>
                  </h2>
                  <span className="font-mono text-[11px] text-slate-400">
                    Select Vertical for Playbook
                  </span>
                </div>

                {TARGET_AUDIENCES.map((vert) => {
                  const isSelected = vert.id === selectedVertical.id;
                  return (
                    <button
                      key={vert.id}
                      type="button"
                      onClick={() => setSelectedVerticalId(vert.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-[#0D1628] border-cyan-500/60 shadow-[0_0_25px_rgba(34,211,238,0.12)]"
                          : "bg-[#0A0F1A] border-slate-800/90 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            vert.rank === 1
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              : vert.rank === 2
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          #{vert.rank} • {vert.tierBadge}
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-400 tabular-nums">
                          {vert.acvRange}
                        </span>
                      </div>
                      <div className="font-sans text-sm font-bold text-white">
                        {vert.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {vert.complianceDrivers.slice(0, 3).map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Detailed Campaign Playbook for Selected Audience */}
              <div className="lg:col-span-7 rounded-2xl bg-[#0A0F1A] border border-slate-800 p-6 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      {selectedVertical.tierBadge}
                    </div>
                    <h3 className="font-sans text-xl font-bold text-white mt-1">
                      {selectedVertical.title}
                    </h3>
                    <div className="font-mono text-xs text-slate-400 mt-1">
                      Recommended Deployment:{" "}
                      <strong className="text-emerald-300">
                        {selectedVertical.recommendedEdition}
                      </strong>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-lg font-bold text-emerald-400">
                      {selectedVertical.acvRange}
                    </div>
                    <div className="text-xs text-slate-400">
                      Sales Cycle: {selectedVertical.salesCycle}
                    </div>
                  </div>
                </div>

                {/* Buyer Personas & Compliance Drivers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#070A10] border border-slate-800/90">
                    <div className="font-mono text-[11px] font-bold uppercase text-cyan-400 mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Primary Decision-Maker Personas</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-200">
                      {selectedVertical.buyerPersonas.map((p) => (
                        <li key={p} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#070A10] border border-slate-800/90">
                    <div className="font-mono text-[11px] font-bold uppercase text-emerald-400 mb-2 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Regulatory &amp; Security Mandates</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedVertical.complianceDrivers.map((c) => (
                        <span
                          key={c}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-300"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pain Point & TrailVault Wedge */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-amber-950/15 border border-amber-500/30">
                    <div className="font-mono text-[11px] font-bold uppercase text-amber-300 mb-1.5">
                      Why Cloud AI Fails This Audience
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedVertical.corePainPoint}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-cyan-950/15 border border-cyan-500/30">
                    <div className="font-mono text-[11px] font-bold uppercase text-cyan-300 mb-1.5">
                      The TrailVault™ Winning Wedge
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedVertical.trailVaultWedge}
                    </p>
                  </div>
                </div>

                {/* Ready-to-Send Executive Outreach Pitch */}
                <div className="p-4 rounded-xl bg-[#070A10] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-xs font-bold uppercase text-white flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-cyan-400" />
                      <span>Ready-to-Use Executive Outreach Campaign Copy</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          `Subject: ${selectedVertical.emailSubject}\n\n${selectedVertical.outreachPitch}`,
                          selectedVertical.id
                        )
                      }
                      className="px-2.5 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 font-mono text-[11px] text-cyan-300 flex items-center gap-1.5"
                    >
                      <Copy className="w-3 h-3" />
                      <span>
                        {copiedLabel === selectedVertical.id
                          ? "Copied to Clipboard!"
                          : "Copy Pitch"}
                      </span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-cyan-300 bg-slate-900/90 px-3 py-2 rounded border border-slate-800">
                    Subject: {selectedVertical.emailSubject}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedVertical.outreachPitch}
                  </p>
                </div>

                {/* Live Objection Handler */}
                <div className="p-4 rounded-xl bg-[#070A10] border border-slate-800 space-y-2">
                  <div className="font-mono text-[11px] font-bold uppercase text-amber-400">
                    CISO / FSO Objection Battlecard
                  </div>
                  <div className="text-xs text-slate-400 italic">
                    Prospect asks: {selectedVertical.objectionHandler.objection}
                  </div>
                  <div className="text-xs text-emerald-300 font-medium leading-relaxed">
                    Your Answer: {selectedVertical.objectionHandler.response}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  Also mirrored to: C:\AirVault_Enterprise\Documentation_Hub\
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
                    handleCopyText(activeDoc.content, activeDoc.filename)
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
