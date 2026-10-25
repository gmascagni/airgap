"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Play,
  Pause,
  RotateCcw,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileCheck2,
  Cpu,
  Database,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Eye,
  Search,
  Layers,
  Zap,
  Award,
  Terminal,
  AlertTriangle,
  ExternalLink,
  UploadCloud,
} from "lucide-react";

interface DemoReel {
  id: string;
  title: string;
  subtitle: string;
  targetBuyer: string;
  durationSec: number;
  scenes: Array<{
    index: number;
    title: string;
    timeRange: string;
    voiceover: string;
    telemetryTag: string;
  }>;
}

const DEMO_REELS: DemoReel[] = [
  {
    id: "reel-needle",
    title: "Demo Reel 01: The Needle in the 1,420-Page Haystack",
    subtitle:
      "Multi-Format Drag & Drop ➔ Docling GPU OCR ➔ Pinpoint Page 1,184 Footnote & CAD Bounding-Box Lock",
    targetBuyer: "VP of Engineering • Chief Maintenance Officer • R&D Directors",
    durationSec: 28,
    scenes: [
      {
        index: 0,
        title: "1. Multi-Format Drag & Drop",
        timeRange: "00:00 – 00:07",
        voiceover:
          "“An engineer drags 4 heterogeneous files—including a 1,420-page scanned 1989 turbine overhaul manual, a TIFF CAD blueprint, an Excel MIL-STD tolerance sheet, and a Word Engineering Change Order—directly into the local AirVault dropzone.”",
        telemetryTag: "INGEST PAYLOAD: 2.33 GB (4 MULTI-MODAL FILES) • WAN EGRESS: 0.00 B/s",
      },
      {
        index: 1,
        title: "2. Docling + Surya GPU OCR Load",
        timeRange: "00:07 – 00:14",
        voiceover:
          "“On local NVIDIA Blackwell GPUs, IBM Docling and Surya OCR segment multi-column layouts, reconstruct skewed 9-column tables into lossless Markdown, link CAD callout bubbles, and index 4,544 hierarchical chunks into Qdrant and OpenSearch BM25.”",
        telemetryTag: "DOCLING TABLEFORMER: ACCURATE MODE • 4,544 CHUNKS INDEXED (QDRANT + BM25)",
      },
      {
        index: 2,
        title: "3. Deep Page-1,184 Needle Query",
        timeRange: "00:14 – 00:21",
        voiceover:
          "“The engineer asks a hyper-specific question buried deep inside the archive: What is the maximum axial play tolerance for the Stage-3 labyrinth seal under -196°C cryogenic shock, and what superseding part number is mandated by Footnote 17?”",
        telemetryTag: "HYBRID RRF (TOP-30 DENSE + TOP-30 BM25) ➔ BGE-RERANKER-LARGE: 34ms",
      },
      {
        index: 3,
        title: "4. Page 1,184 Jump & BBox Lock",
        timeRange: "00:21 – 00:28",
        voiceover:
          "“In 1.4 seconds, AirVault cites Page 1,184 of 1,420, jumps the embedded viewer past 1,183 pages straight to Table 19-14, and highlights Footnote 17—revealing the exact 0.018 mm tolerance and superseding part number NAS1149-F0832P with zero hallucination.”",
        telemetryTag: "VERIFIED CITATION: [Turbine_Manual_1420p.pdf, Page 1184] • SCORE: 0.994",
      },
    ],
  },
  {
    id: "reel-abac",
    title: "Demo Reel 02: The Zero-Trust Clearance Wall (CISO Pitch)",
    subtitle:
      "One Appliance, Two Smartcards, Same Prompt ➔ Live Active Directory / CAC ABAC Pre-Retrieval Redaction",
    targetBuyer: "CISO • Facility Security Officer (FSO) • Defense Compliance VP",
    durationSec: 28,
    scenes: [
      {
        index: 0,
        title: "1. Multi-Compartment Vault Load",
        timeRange: "00:00 – 00:07",
        voiceover:
          "“Both unclassified contractor manuals (CUI) and restricted propulsion schematics (SECRET // ITAR // NOFORN) are ingested into AirVault. Every chunk is cryptographically stamped with its security classification banner during Docling parsing.”",
        telemetryTag: "CHUNK METADATA STAMPING: [CUI] vs [SECRET//ITAR//NOFORN]",
      },
      {
        index: 1,
        title: "2. Dual CAC Smartcard Login",
        timeRange: "00:07 – 00:14",
        voiceover:
          "“Two users log in side-by-side: Operator A holds a SECRET//ITAR smartcard; Operator B is a Tier-2 subcontractor with CUI-Only clearance. Both submit the exact same propulsion seal tolerance query.”",
        telemetryTag: "LDAPS / X.509 CAC SMARTCARD AUTHENTICATION • OPA POLICY ENGINE",
      },
      {
        index: 2,
        title: "3. Pre-Retrieval Vector Filtering",
        timeRange: "00:14 – 00:21",
        voiceover:
          "“Before the LLM ever sees a single token, AirVault enforces mandatory ABAC metadata filters at the Qdrant and OpenSearch index layer—physically blocking restricted chunks from entering Operator B’s context window.”",
        telemetryTag: "PRE-LLM VECTOR FILTER: 0 SECRET CHUNKS LEAKED TO SUBCONTRACTOR",
      },
      {
        index: 3,
        title: "4. Side-by-Side Grounded Output",
        timeRange: "00:21 – 00:28",
        voiceover:
          "“Operator A receives the full Page 1,184 cryogenic seal schematic and part number. Operator B receives only CUI-authorized general maintenance steps and an explicit ABAC clearance notice—proving zero cross-program data leakage.”",
        telemetryTag: "CMMC LEVEL 3 & NIST 800-171 ACCESS CONTROL VERIFIED",
      },
    ],
  },
  {
    id: "reel-contradiction",
    title: "Demo Reel 03: The 35-Year Engineering Contradiction Catcher",
    subtitle:
      "Cross-Referencing a 1989 Scanned Blueprint (Page 1,184) Against a 2026 Engineering Change Order (Page 3)",
    targetBuyer: "Chief Engineer • Quality Assurance VP • Nuclear / Fab Plant Director",
    durationSec: 28,
    scenes: [
      {
        index: 0,
        title: "1. Legacy + Modern Archive Drop",
        timeRange: "00:00 – 00:07",
        voiceover:
          "“A facility drops 35 years of legacy PDFs alongside this morning’s Engineering Change Orders (ECOs). Traditional keyword search shows hundreds of outdated matches without warning the engineer that a spec was superseded.”",
        telemetryTag: "CROSS-EPOCH ARCHIVE: 1989 LEGACY PDF + 2026 ECO BULLETIN",
      },
      {
        index: 1,
        title: "2. Cross-Document Entity Linking",
        timeRange: "00:07 – 00:14",
        voiceover:
          "“AirVault’s TechnicalMetadataExtractor extracts every MIL-SPEC, NSN, and drawing number across both documents, linking Part No. MS90725-114 on Page 1,184 of the 1989 manual to Superseding Notice ECO-2026-089.”",
        telemetryTag: "LEXICAL BM25 EXACT PART LINKING: MS90725-114 ➔ NAS1149-F0832P",
      },
      {
        index: 2,
        title: "3. Revision Conflict Detection",
        timeRange: "00:14 – 00:21",
        voiceover:
          "“When the technician asks for the fastener spec, the Cross-Encoder Reranker surfaces both the original Page 1,184 table AND the 2026 ECO revision in the Top-5 context window.”",
        telemetryTag: "MULTI-SOURCE SYNTHESIS: 2 VERIFIED DOCUMENTS IN TOP-5 CONTEXT",
      },
      {
        index: 3,
        title: "4. Dual-Citation Revision Alert",
        timeRange: "00:21 – 00:28",
        voiceover:
          "“AirVault flags the revision: citing the baseline 1989 spec on Page 1,184 while highlighting the mandatory 2026 ECO torque update—preventing a costly assembly error on the shop floor.”",
        telemetryTag: "PREVENTED ASSEMBLY DEFECT • DUAL BOUNDING-BOX PROOF",
      },
    ],
  },
];

interface DroppedFileItem {
  name: string;
  typeLabel: string;
  pages: number;
  size: string;
  chunks: number;
  status: "queued" | "ocr-scanning" | "indexed";
}

const DROPPED_FILES = [
  {
    name: "Turbine_Master_Overhaul_Manual_1420p.pdf",
    typeLabel: "SCANNED PDF (1989 MICROFILM)",
    pages: 1420,
    size: "1.84 GB",
    chunks: 4120,
    color: "text-tacticalCyan",
  },
  {
    name: "DWG-99401_Cryo_Labyrinth_Seal_RevH.tiff",
    typeLabel: "CAD SCHEMATIC BLUEPRINT",
    pages: 14,
    size: "412 MB",
    chunks: 86,
    color: "text-warningAmber",
  },
  {
    name: "MIL-STD-810H_Thermal_Shock_Tables.xlsx.pdf",
    typeLabel: "DENSE MULTI-COLUMN TABLES",
    pages: 94,
    size: "68 MB",
    chunks: 310,
    color: "text-zeroTrustEmerald",
  },
  {
    name: "ECO-2026-089_Seal_Supersession_Notice.docx.pdf",
    typeLabel: "ENGINEERING CHANGE ORDER",
    pages: 8,
    size: "14 MB",
    chunks: 28,
    color: "text-purple-400",
  },
];

interface LogoConcept {
  id: string;
  name: string;
  tagline: string;
  recommended?: boolean;
  designRationale: string;
  bestUseCase: string;
}

const LOGO_CONCEPTS: LogoConcept[] = [
  {
    id: "faraday-monolith",
    name: "Concept 01: The Faraday Hex-Vault",
    tagline: "Outer Faraday Perimeter + Physical Air-Gap Channel + Optical Neural Core",
    recommended: true,
    designRationale:
      "Communicates physical isolation at a glance: the outer armor hexagon is deliberately split by an open 'air-gap trench' from the inner glowing cyan optical core, proving that intelligence happens inside an impenetrable perimeter.",
    bestUseCase:
      "Primary Brand Emblem, Website Header, Investor Deck Cover, OS Boot Splash",
  },
  {
    id: "bounding-box-reticle",
    name: "Concept 02: The Citation Reticle Shield",
    tagline: "Defense Aegis Shield Framed by 4 Tactical PDF Bounding-Box Corner Brackets",
    designRationale:
      "Directly visualizes AirVault’s signature product differentiator—bounding-box citation verification. The four corner brackets [ + ] lock onto a central document glyph inside a tactical defense shield.",
    bestUseCase:
      "Application UI Icon, Citation Verification Badge, Security Compliance Seal",
  },
  {
    id: "rack-blade-emblem",
    name: "Concept 03: The 4U Industrial Blade Mark",
    tagline: "Precision Anodized Server Louvers + Dual-Pane Split Symmetry",
    designRationale:
      "Designed by hardware industrial designers to look iconic when CNC-milled or laser-etched onto a black anodized 2U/4U rackmount server faceplate next to NVIDIA Blackwell badges.",
    bestUseCase:
      "Physical 2U/4U Server Chassis Bezel, Ruggedized Pelicase Stencil, Hardware Spec Sheets",
  },
  {
    id: "disconnected-bridge",
    name: "Concept 04: The Disconnected Air-Gap Bridge",
    tagline: "Two Isolated Network Terminals Separated by a Verified Zero-Egress Void",
    designRationale:
      "A literal visual metaphor for 'Air Gap': an external network node is physically severed from the internal vault node, while an internal closed-loop photon ring circulates data at high speed.",
    bestUseCase:
      "CISO & Network Architecture Diagrams, Zero-Telemetry Certification Stickers",
  },
];

export default function B2BVideoDemoAndLogoStudioPage() {
  const [selectedReelIdx, setSelectedReelIdx] = useState<number>(0);
  const currentReel = DEMO_REELS[selectedReelIdx];

  const [activeScene, setActiveScene] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [sceneProgressPct, setSceneProgressPct] = useState<number>(0);
  const [activeLogoId, setActiveLogoId] = useState<string>("faraday-monolith");

  // Auto-advance the video demo player across the 4 scenes (7 seconds per scene = 28s total reel)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSceneProgressPct((prev) => {
        if (prev >= 100) {
          setActiveScene((s) => (s + 1) % 4);
          return 0;
        }
        return prev + 2; // 50 ticks * 140ms = 7.0 seconds per scene
      });
    }, 140);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSelectScene = (sceneIdx: number) => {
    setActiveScene(sceneIdx);
    setSceneProgressPct(0);
  };

  const handleSelectReel = (reelIdx: number) => {
    setSelectedReelIdx(reelIdx);
    setActiveScene(0);
    setSceneProgressPct(0);
    setIsPlaying(true);
  };

  const renderLogoSvg = (logoId: string, sizeClass = "w-14 h-14") => {
    switch (logoId) {
      case "faraday-monolith":
        return (
          <svg viewBox="0 0 64 64" fill="none" className={sizeClass}>
            {/* Outer Faraday Hexagon */}
            <polygon
              points="32,4 56,18 56,46 32,60 8,46 8,18"
              stroke="#06B6D4"
              strokeWidth="2.5"
              strokeDasharray="18 4"
              fill="rgba(6,182,212,0.06)"
            />
            {/* Air-Gap Inner Vault Hexagon */}
            <polygon
              points="32,13 48,22 48,42 32,51 16,42 16,22"
              stroke="#10B981"
              strokeWidth="2"
              fill="#0B0F17"
            />
            {/* Central Optical Neural Core */}
            <circle
              cx="32"
              cy="32"
              r="7"
              fill="rgba(6,182,212,0.25)"
              stroke="#06B6D4"
              strokeWidth="2"
            />
            <circle cx="32" cy="32" r="2.8" fill="#10B981" />
          </svg>
        );
      case "bounding-box-reticle":
        return (
          <svg viewBox="0 0 64 64" fill="none" className={sizeClass}>
            {/* Shield Silhouette */}
            <path
              d="M32 6 L54 15 V31 C54 45 44 54 32 59 C20 54 10 45 10 31 V15 L32 6 Z"
              stroke="#06B6D4"
              strokeWidth="2.2"
              fill="rgba(17,24,39,0.9)"
            />
            {/* 4 Bounding-Box Corner Brackets */}
            <path
              d="M21 26 V21 H26 M43 26 V21 H38 M21 38 V43 H26 M43 38 V43 H38"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Target Crosshair */}
            <line x1="28" y1="32" x2="36" y2="32" stroke="#10B981" strokeWidth="2" />
            <line x1="32" y1="28" x2="32" y2="36" stroke="#10B981" strokeWidth="2" />
          </svg>
        );
      case "rack-blade-emblem":
        return (
          <svg viewBox="0 0 64 64" fill="none" className={sizeClass}>
            {/* 3 Stacked 2U/4U Server Blades */}
            <rect
              x="8"
              y="12"
              width="48"
              height="11"
              rx="2.5"
              stroke="#06B6D4"
              strokeWidth="2"
              fill="#0B0F17"
            />
            <rect
              x="8"
              y="26.5"
              width="48"
              height="11"
              rx="2.5"
              stroke="#10B981"
              strokeWidth="2.2"
              fill="rgba(16,185,129,0.12)"
            />
            <rect
              x="8"
              y="41"
              width="48"
              height="11"
              rx="2.5"
              stroke="#06B6D4"
              strokeWidth="2"
              fill="#0B0F17"
            />
            {/* Status LEDs */}
            <circle cx="15" cy="17.5" r="2" fill="#06B6D4" />
            <circle cx="15" cy="32" r="2" fill="#10B981" />
            <circle cx="15" cy="46.5" r="2" fill="#F59E0B" />
            {/* Dual-Pane Divider */}
            <line x1="34" y1="10" x2="34" y2="54" stroke="#374151" strokeWidth="2" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 64 64" fill="none" className={sizeClass}>
            {/* Left External Terminal (Disconnected) */}
            <path
              d="M8 22 H22 V42 H8"
              stroke="#64748B"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Explicit Air-Gap Vertical Barrier */}
            <line
              x1="30"
              y1="10"
              x2="30"
              y2="54"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {/* Right Closed-Loop Enclave Ring */}
            <circle
              cx="46"
              cy="32"
              r="11"
              stroke="#10B981"
              strokeWidth="2.5"
              fill="rgba(16,185,129,0.15)"
            />
            <circle cx="46" cy="32" r="4" fill="#06B6D4" />
          </svg>
        );
    }
  };

  const totalElapsedSec = Math.min(
    28,
    Math.floor(activeScene * 7 + (sceneProgressPct / 100) * 7)
  );

  return (
    <div className="min-h-screen bg-obsidian text-gray-100 relative selection:bg-tacticalCyan/30">
      {/* Ambient Grid & Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-tactical-grid bg-[size:48px_48px] opacity-35 z-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[960px] h-[420px] bg-tacticalCyan/10 blur-[140px] rounded-full z-0"
      />

      {/* =====================================================================
          HEADER & LIVE LOGO PREVIEW BAR
         ===================================================================== */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-obsidian/85 border-b border-cardBorder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="../"
              className="px-3 py-1.5 rounded-lg bg-slateDeep border border-cardBorder hover:border-tacticalCyan text-xs font-mono text-gray-200 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-tacticalCyan" />
              <span>Main Site</span>
            </a>

            {/* Dynamic Header Brand Emblem (Updates when user clicks any Logo Concept below!) */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slateDeep border border-tacticalCyan/50 flex items-center justify-center p-1">
                {renderLogoSvg(activeLogoId, "w-9 h-9")}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base tracking-wider text-white">
                    AIRVAULT
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zeroTrustEmerald/15 text-zeroTrustEmerald border border-zeroTrustEmerald/40 font-mono text-[10px]">
                    B2B DEMO & BRAND STUDIO
                  </span>
                </div>
                <div className="text-[11px] font-mono text-gray-400">
                  Active Header Emblem:{" "}
                  <span className="text-tacticalCyan">
                    {LOGO_CONCEPTS.find((l) => l.id === activeLogoId)?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
            <a
              href="#b2b-video-player"
              className="hover:text-tacticalCyan transition-colors"
            >
              B2B Video Demo Reels
            </a>
            <a
              href="#logo-concepts"
              className="hover:text-tacticalCyan transition-colors"
            >
              Appliance Logo Concepts
            </a>
            <a
              href="#pitch-playbook"
              className="hover:text-tacticalCyan transition-colors"
            >
              Chief Designer Pitch Ideas
            </a>
            <a
              href="../appliances/"
              className="px-3 py-1 rounded-md bg-slateDeep border border-cardBorder hover:border-tacticalCyan font-mono text-xs text-tacticalCyan"
            >
              NVIDIA Scaling Calculator ➔
            </a>
          </nav>
        </div>
      </header>

      {/* =====================================================================
          SECTION 1: INTERACTIVE B2B VIDEO DEMO PLAYER (3 COMPLETE REELS)
         ===================================================================== */}
      <section
        id="b2b-video-player"
        className="relative z-10 pt-10 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center max-w-4xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slateDeep border border-cardBorder mb-4">
            <span className="px-2 py-0.5 rounded bg-tacticalCyan/20 text-tacticalCyan font-mono text-xs font-semibold">
              [CINEMATIC B2B PRODUCT DEMO STUDIO]
            </span>
            <span className="font-mono text-xs text-gray-300">
              3 Interactive Storyboard Reels • Auto-Playing with Voiceover Track
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            From 1,420-Page Drag & Drop to{" "}
            <span className="bg-gradient-to-r from-tacticalCyan via-cyan-300 to-zeroTrustEmerald bg-clip-text text-transparent">
              Page 1,184 Bounding-Box Lock
            </span>
          </h1>
          <p className="mt-4 text-gray-300 text-base sm:text-lg">
            Watch the automated B2B product reel below, switch between three
            executive pitch scenarios, or click any scene on the scrubber bar to
            inspect the exact engineering workflow.
          </p>
        </div>

        {/* Reel Selector Pills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {DEMO_REELS.map((reel, idx) => {
            const selected = selectedReelIdx === idx;
            return (
              <button
                key={reel.id}
                type="button"
                onClick={() => handleSelectReel(idx)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  selected
                    ? "bg-cardSurface border-tacticalCyan shadow-[0_0_30px_rgba(6,182,212,0.25)] ring-1 ring-tacticalCyan"
                    : "bg-slateDeep/80 border-cardBorder hover:border-gray-500"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[11px] mb-1.5">
                  <span className="text-tacticalCyan font-bold">
                    {selected ? "▶ ACTIVE REEL" : `REEL 0${idx + 1}`}
                  </span>
                  <span className="text-gray-400">00:28 TRT</span>
                </div>
                <div className="font-bold text-white text-sm sm:text-base">
                  {reel.title}
                </div>
                <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {reel.subtitle}
                </div>
                <div className="mt-3 pt-2 border-t border-cardBorder/60 font-mono text-[10px] text-zeroTrustEmerald">
                  Target Buyer: {reel.targetBuyer}
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Cinema Viewport Frame */}
        <div className="rounded-3xl bg-slateDeep border-2 border-cardBorder shadow-[0_30px_90px_rgba(0,0,0,0.85)] overflow-hidden">
          {/* Top Video Player Chrome & Transport Controls */}
          <div className="px-5 py-3.5 bg-obsidian border-b border-cardBorder flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3.5 py-1.5 rounded-lg bg-tacticalCyan hover:bg-cyan-400 text-obsidian font-mono font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> PAUSE
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> PLAY REEL
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveScene(0);
                  setSceneProgressPct(0);
                  setIsPlaying(true);
                }}
                className="p-1.5 rounded-lg bg-cardSurface border border-cardBorder text-gray-300 hover:text-white"
                title="Restart Reel"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs text-gray-300">
                00:{String(totalElapsedSec).padStart(2, "0")} / 00:28
              </span>
            </div>

            <div className="font-mono text-xs text-zeroTrustEmerald flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zeroTrustEmerald animate-ping" />
              <span>{currentReel.scenes[activeScene].telemetryTag}</span>
            </div>
          </div>

          {/* 4-Scene Scrubber Timeline Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 bg-obsidian/90 border-b border-cardBorder">
            {currentReel.scenes.map((scene) => {
              const isCurrent = activeScene === scene.index;
              const isPast = activeScene > scene.index;
              return (
                <button
                  key={scene.index}
                  type="button"
                  onClick={() => handleSelectScene(scene.index)}
                  className={`text-left p-3 border-r border-cardBorder transition-all relative overflow-hidden ${
                    isCurrent ? "bg-cardSurface/90" : "hover:bg-cardSurface/40"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-gray-400 mb-1">
                    <span
                      className={
                        isCurrent
                          ? "text-tacticalCyan font-bold"
                          : isPast
                          ? "text-zeroTrustEmerald"
                          : ""
                      }
                    >
                      {scene.title}
                    </span>
                    <span>{scene.timeRange}</span>
                  </div>
                  {/* Progress Bar Track */}
                  <div className="w-full h-1.5 rounded-full bg-slateDeep overflow-hidden">
                    <div
                      className="h-full bg-tacticalCyan transition-all duration-150"
                      style={{
                        width: isCurrent
                          ? `${sceneProgressPct}%`
                          : isPast
                          ? "100%"
                          : "0%",
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Animated Stage Canvas (Height 480px) */}
          <div className="p-6 sm:p-8 min-h-[470px] bg-gradient-to-b from-obsidian/90 to-slateDeep flex flex-col justify-between relative">
            <AnimatePresence mode="wait">
              {/* SCENE 0: MULTI-FORMAT DRAG & DROP */}
              {activeScene === 0 && (
                <motion.div
                  key="scene-0"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto"
                >
                  {/* Drag Source Panel */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="font-mono text-xs uppercase text-tacticalCyan mb-2 flex items-center gap-2">
                      <UploadCloud className="w-4 h-4" /> STEP 1: DRAG & DROP
                      HETEROGENEOUS ARCHIVE BUNDLE
                    </div>
                    {DROPPED_FILES.map((file, idx) => (
                      <motion.div
                        key={file.name}
                        initial={{ x: -25, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.15 }}
                        className="p-3.5 rounded-xl bg-obsidian border border-cardBorder flex items-center justify-between gap-3 shadow-md"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText
                            className={`w-5 h-5 flex-shrink-0 ${file.color}`}
                          />
                          <div className="truncate">
                            <div className="font-mono text-xs font-bold text-white truncate">
                              {file.name}
                            </div>
                            <div className="font-mono text-[10px] text-gray-400">
                              {file.typeLabel} • {file.pages.toLocaleString()}{" "}
                              Pages
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-cardSurface font-mono text-[11px] text-gray-200 flex-shrink-0">
                          {file.size}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Animated Dropzone Vault */}
                  <div className="lg:col-span-7">
                    <div className="p-8 rounded-2xl border-2 border-dashed border-tacticalCyan bg-tacticalCyan/5 text-center space-y-4 relative overflow-hidden">
                      <motion.div
                        animate={{ scale: [1, 1.06, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-16 h-16 rounded-2xl bg-tacticalCyan/20 border border-tacticalCyan flex items-center justify-center mx-auto"
                      >
                        <UploadCloud className="w-8 h-8 text-tacticalCyan" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-white">
                        AirVault Local NVMe Ingest Dropzone
                      </h3>
                      <p className="text-xs font-mono text-gray-300 max-w-md mx-auto">
                        Ingesting 4 multi-format engineering documents (1,536
                        total pages • 2.33 GB) over isolated loopback interface{" "}
                        <code className="text-tacticalCyan">127.0.0.1:8080</code>
                      </p>

                      <div className="max-w-md mx-auto pt-2">
                        <div className="flex justify-between font-mono text-xs text-tacticalCyan mb-1">
                          <span>SHA-256 DEDUPLICATION & STAGING</span>
                          <span>{Math.min(100, sceneProgressPct + 15)}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-obsidian overflow-hidden border border-cardBorder">
                          <div
                            className="h-full bg-gradient-to-r from-tacticalCyan to-zeroTrustEmerald transition-all duration-150"
                            style={{
                              width: `${Math.min(100, sceneProgressPct + 15)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SCENE 1: DOCLING + SURYA GPU OCR & DUAL INDEXING */}
              {activeScene === 1 && (
                <motion.div
                  key="scene-1"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto"
                >
                  {/* Left: Docling Layout Segmentation Preview */}
                  <div className="lg:col-span-6 p-5 rounded-2xl bg-obsidian border border-cardBorder space-y-4">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-warningAmber font-bold flex items-center gap-1.5">
                        <Layers className="w-4 h-4" /> DOCLING + SURYA OCR GPU
                        SCANNER
                      </span>
                      <span className="text-tacticalCyan">
                        SCANNING PAGE 1,184 / 1,420
                      </span>
                    </div>

                    {/* Visual Page Layout Segmentation Wireframe */}
                    <div className="p-4 rounded-xl bg-slateDeep border border-cardBorder space-y-3 relative overflow-hidden">
                      <div className="p-2 rounded border border-tacticalCyan/60 bg-tacticalCyan/10 font-mono text-[10px] text-cyan-200">
                        [HEADER H1] CHAPTER 19: HIGH-PRESSURE TURBOPUMP OVERHAUL
                        ➔ [H2] 19.8 CRYOGENIC LABYRINTH SEALS
                      </div>
                      <div className="p-2.5 rounded border border-zeroTrustEmerald/70 bg-zeroTrustEmerald/10 font-mono text-[10px] text-emerald-200">
                        <div className="font-bold mb-1">
                          [TABLEFORMER.ACCURATE] TABLE 19-14 RECONSTRUCTED AS
                          MARKDOWN:
                        </div>
                        <div>
                          | Stage-3 Labyrinth | -196°C Cryo Shock | Max Axial
                          Play: 0.018 mm (See Footnote 17) |
                        </div>
                      </div>
                      <div className="p-2.5 rounded border border-warningAmber/80 bg-warningAmber/15 font-mono text-[10px] text-amber-200">
                        [FOOTNOTE 17 + CAD CALLOUT LINK] Mandate superseding
                        shim washer P/N NAS1149-F0832P per DWG-99401 Rev H.
                      </div>
                    </div>
                  </div>

                  {/* Right: Dual Qdrant + OpenSearch BM25 Indexing Telemetry */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="p-5 rounded-2xl bg-obsidian border border-cardBorder space-y-3">
                      <div className="font-mono text-xs text-zeroTrustEmerald uppercase font-bold">
                        // DUAL HYBRID INDEXING COMMIT (STAGE 1 READY)
                      </div>
                      <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                        <div className="p-3 rounded-xl bg-slateDeep border border-cardBorder">
                          <div className="text-gray-400 text-[10px]">
                            QDRANT DENSE VECTORS
                          </div>
                          <div className="text-lg font-bold text-tacticalCyan mt-0.5">
                            4,544 Chunks
                          </div>
                          <div className="text-[10px] text-gray-400">
                            BAAI/bge-large-en-v1.5 (1024d)
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-slateDeep border border-cardBorder">
                          <div className="text-gray-400 text-[10px]">
                            OPENSEARCH SPARSE BM25
                          </div>
                          <div className="text-lg font-bold text-zeroTrustEmerald mt-0.5">
                            18,920 Part Tags
                          </div>
                          <div className="text-[10px] text-gray-400">
                            Exact MIL-SPEC / NSN Analyzer
                          </div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slateDeep/70 border border-cardBorder font-mono text-[11px] text-gray-300">
                        Every chunk tagged with:{" "}
                        <code className="text-tacticalCyan">source_file</code>,{" "}
                        <code className="text-tacticalCyan">
                          page_number: 1184
                        </code>
                        ,{" "}
                        <code className="text-warningAmber">
                          bounding_box: [42, 510, 568, 712]
                        </code>
                        ,{" "}
                        <code className="text-zeroTrustEmerald">
                          CUI//NOFORN
                        </code>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SCENE 2: DEEP PAGE-1,184 NEEDLE QUERY & CROSS-ENCODER RERANKING */}
              {activeScene === 2 && (
                <motion.div
                  key="scene-2"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-4xl mx-auto w-full space-y-5 my-auto"
                >
                  <div className="p-5 rounded-2xl bg-obsidian border-2 border-tacticalCyan shadow-[0_0_35px_rgba(6,182,212,0.2)]">
                    <div className="font-mono text-xs text-tacticalCyan uppercase mb-2 flex items-center gap-2">
                      <Search className="w-4 h-4" /> ENGINEER NEEDLE-IN-A-HAYSTACK
                      QUERY (ACROSS 1,536 PAGES)
                    </div>
                    <p className="font-mono text-sm sm:text-base text-white">
                      &ldquo;What is the maximum allowable axial play tolerance
                      for the Stage-3 labyrinth seal under -196°C cryogenic
                      thermal shock, and what superseding MIL-SPEC part number
                      is mandated by Footnote 17?&rdquo;
                    </p>
                  </div>

                  {/* Two-Stage Funnel Visualizer */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    <div className="p-4 rounded-xl bg-obsidian border border-cardBorder">
                      <div className="text-tacticalCyan font-bold mb-1">
                        1. PARALLEL RETRIEVAL
                      </div>
                      <div className="text-gray-300">
                        Qdrant Top-30 Dense + OpenSearch Top-30 BM25 Lexical
                      </div>
                      <div className="mt-2 text-[11px] text-gray-400">
                        Latency: 11ms • 60 Candidates
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-obsidian border border-cardBorder">
                      <div className="text-warningAmber font-bold mb-1">
                        2. RRF + BGE-RERANKER-LARGE
                      </div>
                      <div className="text-gray-300">
                        Cross-Encoder scores all 60 chunks ➔ Prunes to Top 5
                      </div>
                      <div className="mt-2 text-[11px] text-zeroTrustEmerald">
                        #1 Hit: Page 1,184 (Score: 0.994)
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-obsidian border border-zeroTrustEmerald">
                      <div className="text-zeroTrustEmerald font-bold mb-1">
                        3. LOCAL QWEN 2.5 AWQ
                      </div>
                      <div className="text-gray-300">
                        Strict Context Lock + Deterministic BBox Verification
                      </div>
                      <div className="mt-2 text-[11px] text-cyan-300">
                        Hallucination Risk: 0.0%
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SCENE 3: PINPOINT PAGE 1,184 CITATION & BOUNDING-BOX ZOOM */}
              {activeScene === 3 && (
                <motion.div
                  key="scene-3"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto"
                >
                  {/* Left Pane: Grounded Answer with Page 1,184 Citation Badge */}
                  <div className="lg:col-span-6 p-5 rounded-2xl bg-obsidian border border-zeroTrustEmerald/60 space-y-3">
                    <div className="font-mono text-xs text-zeroTrustEmerald uppercase font-bold flex items-center justify-between">
                      <span>✓ VERIFIED GROUNDED SYNTHESIS</span>
                      <span>TIME TO PINPOINT: 1.42s</span>
                    </div>
                    <p className="text-sm text-gray-100 leading-relaxed">
                      Under -196°C cryogenic thermal shock, the Stage-3
                      labyrinth seal maximum allowable axial play is{" "}
                      <span className="text-white font-bold">
                        0.018 mm (±0.002 mm)
                      </span>{" "}
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-tacticalCyan text-obsidian font-mono text-xs font-bold mx-1">
                        [Turbine_Manual_1420p.pdf, Page 1184]
                      </span>
                      .
                    </p>
                    <p className="text-sm text-gray-100 leading-relaxed">
                      Per <span className="text-warningAmber font-bold">Footnote 17</span>{" "}
                      and linked CAD revision{" "}
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-warningAmber/20 text-warningAmber border border-warningAmber font-mono text-xs font-bold mx-1">
                        [DWG-99401_Cryo_Seal.tiff, Page 1]
                      </span>
                      , standard washer MS90725 is superseded by high-nickel
                      shim{" "}
                      <span className="font-mono font-bold text-tacticalCyan">
                        P/N NAS1149-F0832P
                      </span>
                      .
                    </p>
                  </div>

                  {/* Right Pane: Auto-Jumped Page 1,184 of 1,420 with Highlighted Footnote 17 */}
                  <div className="lg:col-span-6 p-5 rounded-2xl bg-[#080C14] border-2 border-warningAmber relative shadow-[0_0_40px_rgba(245,158,11,0.25)]">
                    <div className="flex items-center justify-between font-mono text-[11px] text-gray-400 border-b border-cardBorder pb-2 mb-3">
                      <span className="text-white font-bold">
                        PDF VIEWER: Turbine_Master_Overhaul_Manual_1420p.pdf
                      </span>
                      <span className="px-2 py-0.5 rounded bg-warningAmber text-obsidian font-bold">
                        JUMPED TO PAGE 1,184 OF 1,420
                      </span>
                    </div>

                    <div className="font-mono text-[11px] text-gray-400 mb-2">
                      TABLE 19-14: CRYOGENIC TURBOPUMP SEAL CLEARANCES (REV 1989)
                    </div>

                    {/* Highlighted Bounding Box Overlay on Row 14 + Footnote 17 */}
                    <div className="p-3.5 rounded-xl border-2 border-warningAmber bg-warningAmber/15 space-y-2">
                      <div className="flex justify-between font-mono text-xs text-white font-bold">
                        <span>ROW 14: STAGE-3 LABYRINTH SEAL (-196°C)</span>
                        <span className="text-warningAmber">
                          MAX AXIAL PLAY: 0.018 mm¹⁷
                        </span>
                      </div>
                      <div className="pt-2 border-t border-warningAmber/40 font-mono text-xs text-amber-200">
                        <strong>FOOTNOTE 17 (BBOX [42.0, 510.4, 568.0, 712.0]):</strong>{" "}
                        For liquid nitrogen/oxygen service below -180°C, replace
                        baseline spacer with cryo-stabilized shim{" "}
                        <span className="underline font-bold">
                          P/N NAS1149-F0832P
                        </span>{" "}
                        (Ref: ECO-2026-089).
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Voiceover / Subtitle Track Bar */}
            <div className="mt-6 p-4 rounded-2xl bg-obsidian/95 border border-cardBorder flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-tacticalCyan/20 text-tacticalCyan font-mono text-[10px] font-bold uppercase flex-shrink-0">
                VOICEOVER TRACK
              </span>
              <p className="text-xs sm:text-sm text-gray-200 italic">
                {currentReel.scenes[activeScene].voiceover}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: APPLIANCE LOGO RECOMMENDATIONS & INTERACTIVE SWITCHER
         ===================================================================== */}
      <section
        id="logo-concepts"
        className="relative z-10 py-20 bg-slateDeep/80 border-y border-cardBorder"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs uppercase tracking-widest text-tacticalCyan mb-2">
              // INDUSTRIAL & BRAND IDENTITY SYSTEM
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              AirVault Appliance Logo Recommendations
            </h2>
            <p className="mt-3 text-gray-300">
              As Chief Designer, I created four distinct vector emblems tailored
              for defense-tech hardware bezels, CISO architecture decks, and the
              Dual-Pane UI.{" "}
              <span className="text-white font-semibold">
                Click any logo concept below to test it live in the top
                navigation bar.
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LOGO_CONCEPTS.map((logo) => {
              const isSelected = activeLogoId === logo.id;
              return (
                <button
                  key={logo.id}
                  type="button"
                  onClick={() => setActiveLogoId(logo.id)}
                  className={`text-left p-6 rounded-2xl border transition-all flex flex-col sm:flex-row items-start gap-5 ${
                    isSelected
                      ? "bg-cardSurface border-tacticalCyan shadow-[0_0_30px_rgba(6,182,212,0.2)] ring-1 ring-tacticalCyan"
                      : "bg-obsidian/90 border-cardBorder hover:border-gray-500"
                  }`}
                >
                  <div className="w-20 h-20 rounded-2xl bg-slateDeep border border-cardBorder flex items-center justify-center flex-shrink-0 p-3">
                    {renderLogoSvg(logo.id, "w-14 h-14")}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-lg text-white">
                        {logo.name}
                      </span>
                      {logo.recommended && (
                        <span className="px-2.5 py-0.5 rounded bg-zeroTrustEmerald/20 text-zeroTrustEmerald border border-zeroTrustEmerald/40 font-mono text-[10px] font-bold">
                          ★ CHIEF DESIGNER PICK
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-tacticalCyan">
                      {logo.tagline}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {logo.designRationale}
                    </p>
                    <div className="pt-2 font-mono text-[11px] text-gray-400">
                      <strong className="text-gray-200">Best For:</strong>{" "}
                      {logo.bestUseCase}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 3: CHIEF DESIGNER B2B PITCH PLAYBOOK (5 CREATIVE IDEAS)
         ===================================================================== */}
      <section
        id="pitch-playbook"
        className="relative z-10 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-3xl mb-12">
          <div className="font-mono text-xs uppercase tracking-widest text-zeroTrustEmerald mb-2">
            // B2B ENTERPRISE SALES & DEMO PLAYBOOK
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            5 Creative Ways to Pitch AirVault to B2B & Defense Buyers
          </h2>
          <p className="mt-3 text-gray-300">
            Enterprise buyers in aerospace, defense, nuclear, and semiconductor
            manufacturing are skeptical of slideware. Here are five high-impact
            live demonstration stunts designed to close technical and executive
            stakeholders on the spot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-cardSurface/80 border border-cardBorder space-y-3">
            <div className="font-mono text-xs text-tacticalCyan font-bold">
              PITCH IDEA 01 // THE PHYSICAL STUNT
            </div>
            <h3 className="text-lg font-bold text-white">
              The &ldquo;Scissors / Unplug the Ethernet&rdquo; Live Wire-Tap
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Start your B2B demo by opening Wireshark on the host laptop and
              physically pulling the Ethernet cable out of the wall (or switching
              to Airplane Mode). Run the 1,420-page query while the packet
              monitor reads <code className="text-zeroTrustEmerald">0.00 B/s WAN</code>.
              Nothing convinces a CISO faster than physical proof.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-cardSurface/80 border border-cardBorder space-y-3">
            <div className="font-mono text-xs text-warningAmber font-bold">
              PITCH IDEA 02 // THE PROSPECT CHALLENGE
            </div>
            <h3 className="text-lg font-bold text-white">
              &ldquo;Bring Your Worst 1980s Coffee-Stained Blueprint&rdquo;
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Invite the prospect’s Chief Engineer to bring a skewed, multi-column
              PDF or scanned TIFF schematic on a USB drive. Drop it into AirVault
              live and let Docling + Surya OCR reconstruct the Markdown table and
              bounding boxes in under 15 seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-cardSurface/80 border border-cardBorder space-y-3">
            <div className="font-mono text-xs text-zeroTrustEmerald font-bold">
              PITCH IDEA 03 // THE SECURITY DEMO
            </div>
            <h3 className="text-lg font-bold text-white">
              &ldquo;Two Smartcards, One Prompt&rdquo; ABAC Proof
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Carry two hardware YubiKeys/CAC smartcards in your pocket—one
              provisioned as <code className="text-warningAmber">SECRET//ITAR</code>{" "}
              and one as <code className="text-tacticalCyan">SUBCONTRACTOR CUI</code>.
              Tap each card and run the exact same prompt to demonstrate instant
              pre-LLM vector chunk redaction.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-cardSurface/80 border border-cardBorder space-y-3">
            <div className="font-mono text-xs text-tacticalCyan font-bold">
              PITCH IDEA 04 // THE CFO ROI HOOK
            </div>
            <h3 className="text-lg font-bold text-white">
              The &ldquo;Footnote 17 on Page 1,184&rdquo; Stopwatch Race
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Ask a senior engineer how long it takes to verify whether a MIL-SPEC
              fastener on Page 1,184 was superseded by a later Engineering Change
              Order across 40 PDF folders (typically 3–6 hours). Show AirVault
              linking both pages with bounding boxes in 1.4 seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-cardSurface/80 border border-cardBorder space-y-3">
            <div className="font-mono text-xs text-zeroTrustEmerald font-bold">
              PITCH IDEA 05 // FRICTIONLESS PROCUREMENT
            </div>
            <h3 className="text-lg font-bold text-white">
              The &ldquo;Keep the NVMe Drives&rdquo; 30-Day Pilot Guarantee
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Eliminate data-sanitization procurement delays by shipping the
              portable USB NVMe SSD (or 2U/4U appliance) with a contractual
              guarantee: even if they don’t buy after the 30-day pilot, their
              security team physically keeps the NVMe drives inside their vault.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-slateDeep to-obsidian border border-tacticalCyan flex flex-col justify-between">
            <div className="space-y-2">
              <div className="font-mono text-xs text-tacticalCyan font-bold">
                NEXT STEP // HARDWARE SIZING
              </div>
              <h3 className="text-lg font-bold text-white">
                Pair the Demo with the NVIDIA Scaling Calculator
              </h3>
              <p className="text-sm text-gray-300">
                Once the prospect sees Page 1,184 pinpointed live, transition
                immediately to the NVIDIA Appliance Scaling Model to size their
                exact document volume.
              </p>
            </div>
            <a
              href="../appliances/"
              className="mt-4 py-2.5 px-4 rounded-xl bg-tacticalCyan text-obsidian font-mono font-bold text-xs uppercase text-center flex items-center justify-center gap-2"
            >
              <span>Open NVIDIA Volume Calculator</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
