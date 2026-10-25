"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Lock,
  Cpu,
  Database,
  FileSearch,
  Server,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Terminal,
  Layers,
  KeyRound,
  HardDrive,
  Network,
  Eye,
  AlertTriangle,
  FileText,
  Sparkles,
  ExternalLink,
  Menu,
  X,
  Check,
  Sliders,
  Activity,
} from "lucide-react";

interface CitationHotspot {
  id: string;
  badgeText: string;
  docTitle: string;
  page: number;
  elementType: "TABLE" | "CAD SCHEMATIC" | "PROCEDURE";
  securityMarking: string;
  rerankScore: string;
  rrfScore: string;
  bbox: {
    top: string;
    left: string;
    width: string;
    height: string;
    coordsLabel: string;
  };
  hierarchy: string;
  extractedPreview: string;
}

interface DemoScenario {
  id: string;
  label: string;
  sector: string;
  userPrompt: string;
  responseSegments: Array<{
    type: "text" | "citation";
    value: string;
    citationId?: string;
  }>;
  citations: CitationHotspot[];
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "hydraulic-cad",
    label: "Maintenance Manual & CAD Callouts",
    sector: "DEFENSE & AEROSPACE",
    userPrompt:
      "What is the primary manifold flange fastener torque and MIL-SPEC part number, and which O-ring seal is specified on the Stage-2 relief valve schematic?",
    responseSegments: [
      {
        type: "text",
        value:
          "Per Section 4.2 Torque & Fastener Specifications, the primary hydraulic manifold M12 flange bolts require MIL-SPEC fastener ",
      },
      {
        type: "citation",
        value: "[Maintenance Manual Rev 4, p. 82]",
        citationId: "cit-mm-82",
      },
      {
        type: "text",
        value:
          " (Part No. MS90725-114) torqued to 45.0 Nm ± 1.5 Nm (33 lb-ft) using an 8-point cross-star sequence.\n\nOn the Stage-2 High-Pressure Relief Valve CAD assembly drawing, Callout #04 specifies fluorocarbon packing O-Ring ",
      },
      {
        type: "citation",
        value: "[DWG-88412-CAD Rev C, p. 14]",
        citationId: "cit-cad-14",
      },
      {
        type: "text",
        value:
          " (AN6227-23 / NSN 5331-00-291-4402) rated for 3,000 PSI continuous operating pressure.",
      },
    ],
    citations: [
      {
        id: "cit-mm-82",
        badgeText: "[Maintenance Manual Rev 4, p. 82]",
        docTitle: "Maintenance Manual Rev 4.pdf",
        page: 82,
        elementType: "TABLE",
        securityMarking: "CUI // NOFORN // ITAR",
        rerankScore: "0.984",
        rrfScore: "0.0328",
        bbox: {
          top: "14%",
          left: "6%",
          width: "88%",
          height: "36%",
          coordsLabel: "x0: 48.2, y0: 112.0, x1: 564.0, y1: 398.5",
        },
        hierarchy:
          "CH 4: HYDRAULIC ACTUATION ➔ 4.2 TORQUE TABLES ➔ TABLE 4-3 FLANGE FASTENERS",
        extractedPreview:
          "| Assembly Location | MIL-SPEC P/N | Nominal Torque | Sequence |\n| :--- | :--- | :--- | :--- |\n| Primary Manifold M12 | MS90725-114 | 45.0 Nm (33 lb-ft) | 8-Bolt Star |\n| Bypass Housing M8 | AN4-12A | 19.5 Nm (14 lb-ft) | 4-Bolt Cross |",
      },
      {
        id: "cit-cad-14",
        badgeText: "[DWG-88412-CAD Rev C, p. 14]",
        docTitle: "DWG-88412-CAD Rev C.pdf",
        page: 14,
        elementType: "CAD SCHEMATIC",
        securityMarking: "CUI // EXPORT CONTROLLED",
        rerankScore: "0.961",
        rrfScore: "0.0315",
        bbox: {
          top: "54%",
          left: "8%",
          width: "84%",
          height: "39%",
          coordsLabel: "x0: 62.0, y0: 428.0, x1: 548.0, y1: 736.0",
        },
        hierarchy:
          "SHEET 14 OF 22 ➔ FIGURE 4-9: STAGE-2 HIGH-PRESSURE RELIEF VALVE CAD SECTION",
        extractedPreview:
          "[CAD Callout Link] CALLOUT #04: Packing Seal O-Ring AN6227-23 (NSN 5331-00-291-4402) • CALLOUT #07: Titanium Check Poppet P/N 19207-88412-07 • Title Block Tol: ±0.025mm",
      },
    ],
  },
  {
    id: "avionics-bus",
    label: "Avionics MIL-STD-1553B Bus Spec",
    sector: "AVIONICS & EW SYSTEMS",
    userPrompt:
      "What are the transformer coupling stub cable impedance and maximum length limits for MIL-STD-1553B data bus terminals?",
    responseSegments: [
      {
        type: "text",
        value:
          "For transformer-coupled MIL-STD-1553B remote terminal interfaces, the twinaxial bus cable characteristic impedance must be maintained between 70.0 Ω and 85.0 Ω at 1.0 MHz ",
      },
      {
        type: "citation",
        value: "[Avionics Bus ICD-1553B, p. 209]",
        citationId: "cit-av-209",
      },
      {
        type: "text",
        value:
          ", with maximum transformer-coupled stub length strictly capped at 20.0 ft (6.10 m) unless specifically waived by System Safety Directive 7B.",
      },
    ],
    citations: [
      {
        id: "cit-av-209",
        badgeText: "[Avionics Bus ICD-1553B, p. 209]",
        docTitle: "Avionics Bus ICD-1553B.pdf",
        page: 209,
        elementType: "PROCEDURE",
        securityMarking: "SECRET // SAR // NOFORN",
        rerankScore: "0.991",
        rrfScore: "0.0331",
        bbox: {
          top: "14%",
          left: "6%",
          width: "88%",
          height: "36%",
          coordsLabel: "x0: 52.0, y0: 118.4, x1: 559.0, y1: 390.0",
        },
        hierarchy:
          "SECTION 9: MULTIPLEX DATA BUS ➔ 9.4 COUPLING TRANSFORMER & STUB CONSTRAINTS",
        extractedPreview:
          "STEP 9.4.2: Verify twinax cable M17/176-00002 characteristic impedance Z0 = 70–85 Ohms @ 1 MHz. Transformer-coupled stub length shall not exceed 20.0 ft (6.10 m). Direct-coupled stubs shall not exceed 1.0 ft.",
      },
    ],
  },
];

interface PipelineStep {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  techStack: string;
  latencyOrThroughput: string;
  description: string;
  codeSnippet: string;
}

const INGESTION_PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "ing-1",
    stepNumber: "01",
    title: "Local SMB / NFS Shares",
    subtitle: "Read-Only Air-Gapped Mounts",
    techStack: "NFSv4.2 • SMB3 Encrypted • mTLS",
    latencyOrThroughput: "10–25 Gbps Line Rate",
    description:
      "Continuously crawls on-premise network shares, PLM vaults, and legacy optical archives over physically isolated switch fabrics with SHA-256 deduplication.",
    codeSnippet: `mount -t nfs4 -o ro,sec=krb5p 10.240.12.10:/plm_vault /mnt/airvault_ingest
sha256sum /mnt/airvault_ingest/**/*.pdf > /var/lib/airvault/manifest.sha256`,
  },
  {
    id: "ing-2",
    stepNumber: "02",
    title: "MinIO Object Storage",
    subtitle: "Immutable Encrypted Blob Store",
    techStack: "MinIO Erasure Coding • AES-256-GCM",
    latencyOrThroughput: "RAID-10 NVMe Backed",
    description:
      "Persists raw source PDFs, TIFF blueprints, and extracted schematic crops with object-lock immutability and per-bucket ABAC security attributes.",
    codeSnippet: `mc mb --with-lock local/airvault-classified-manuals
mc encrypt set sse-s3 local/airvault-classified-manuals`,
  },
  {
    id: "ing-3",
    stepNumber: "03",
    title: "Docling Layout OCR",
    subtitle: "Multi-Modal Table & Schematic Vision",
    techStack: "IBM Docling • TableFormer • Surya OCR",
    latencyOrThroughput: "GPU Batch Layout Parsing",
    description:
      "Reconstructs multi-column tables into lossless Markdown, extracts CAD drawing title blocks, and captures normalized [x0, y0, x1, y1] bounding boxes.",
    codeSnippet: `pipeline_options = PdfPipelineOptions(do_ocr=True, do_table_structure=True)
pipeline_options.table_structure_options.mode = TableFormerMode.ACCURATE
pipeline_options.artifacts_path = Path("/models/docling") # 100% Offline`,
  },
  {
    id: "ing-4",
    stepNumber: "04",
    title: "Hierarchical Structural Chunker",
    subtitle: "Lineage-Preserving Context Windowing",
    techStack: "Header 1 ➔ Header 2 ➔ Procedure Steps",
    latencyOrThroughput: "Deterministic SHA-256 IDs",
    description:
      "Preserves full structural hierarchy paths, links figure callout captions, and stamps every chunk with security classification and MIL-SPEC regex tags.",
    codeSnippet: `chunk = DocumentChunk(
  source_file="TM-9-2320-360.pdf", page_number=82,
  hierarchy_path=["CH 4: HYDRAULICS", "4.2 TORQUE SPECS", "STEP 4"],
  security_classification="CUI//NOFORN", bounding_box=bbox.to_dict()
)`,
  },
  {
    id: "ing-5",
    stepNumber: "05",
    title: "Dual Vector Indexing (Qdrant + BM25)",
    subtitle: "Hybrid Dense + Sparse Persistence",
    techStack: "Qdrant 1024d (BGE-Large) + OpenSearch BM25",
    latencyOrThroughput: "Sub-15ms Index Commit",
    description:
      "Simultaneously indexes dense semantic embeddings in Qdrant and exact part-number/MIL-SPEC lexical tokens in OpenSearch BM25.",
    codeSnippet: `qdrant.upsert(collection_name="technical_manuals", points=dense_points)
opensearch.bulk(index="technical_manuals_bm25", body=lexical_actions)`,
  },
];

const QUERY_PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "qry-1",
    stepNumber: "01",
    title: "User Query",
    subtitle: "Natural Language or Part-Number Lookup",
    techStack: "TLS 1.3 Local Loopback / Intranet",
    latencyOrThroughput: "Zero Egress Packet Policy",
    description:
      "Engineers submit complex diagnostic, maintenance, or specification queries from hardened workstations inside the air-gapped enclave.",
    codeSnippet: `POST /api/v1/query/stream HTTP/1.1
Host: airvault.internal.local:8080
{"query": "Torque spec & MIL-SPEC P/N for M12 manifold flange bolts?"}`,
  },
  {
    id: "qry-2",
    stepNumber: "02",
    title: "Active Directory / CAC ABAC Filter",
    subtitle: "Pre-Retrieval Clearance Enforcement",
    techStack: "LDAPS • X.509 CAC/PIV • OPA Policy",
    latencyOrThroughput: "< 3ms Policy Evaluation",
    description:
      "Validates operator smartcard identity and injects mandatory security classification filters before any vector or lexical index is queried.",
    codeSnippet: `qdrant_filter = Filter(must=[
  FieldCondition(key="security_classification", match=MatchAny(any=user.clearances)),
  FieldCondition(key="program_compartment", match=MatchValue(value=user.compartment))
])`,
  },
  {
    id: "qry-3",
    stepNumber: "03",
    title: "Parallel Hybrid Search",
    subtitle: "Dense Semantic + Sparse BM25 + RRF",
    techStack: "BGE-Large-EN-v1.5 + BM25 (RRF k=60)",
    latencyOrThroughput: "Top 30 Dense + Top 30 Sparse",
    description:
      "Executes concurrent dense semantic lookup and exact lexical MIL-SPEC/NSN search, merging candidates via Reciprocal Rank Fusion.",
    codeSnippet: `dense_hits, sparse_hits = await asyncio.gather(
  qdrant_dense_search(query, top_k=30), opensearch_bm25_search(query, top_k=30)
)
candidates = reciprocal_rank_fusion(dense_hits, sparse_hits, rrf_k=60)`,
  },
  {
    id: "qry-4",
    stepNumber: "04",
    title: "Cross-Encoder Reranker (Top 30 ➔ Top 5)",
    subtitle: "Deep Pairwise Attention Scoring",
    techStack: "BAAI/bge-reranker-large (FP16 CUDA)",
    latencyOrThroughput: "~38ms Batch Rerank",
    description:
      "Scores all fused candidate chunks directly against the user prompt with a full cross-encoder transformer, pruning noise and passing only the Top 5 snippets.",
    codeSnippet: `scores = bge_reranker.predict([(query, c.text) for c in candidates])
top_5_chunks = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)[:5]`,
  },
  {
    id: "qry-5",
    stepNumber: "05",
    title: "Local vLLM Engine",
    subtitle: "Zero-Hallucination Grounded Generation",
    techStack: "Qwen 2.5 14B/72B AWQ • Llama 3.3 70B",
    latencyOrThroughput: "65+ Tokens/sec (PagedAttention)",
    description:
      "Generates responses strictly confined to `<RETRIEVED_EVIDENCE>`, enforcing bracketed `[DocName, Page X]` citations or explicit refusal when data is absent.",
    codeSnippet: `vllm serve /models/llm/Qwen2.5-72B-Instruct-AWQ \\
  --quantization awq --max-model-len 16384 \\
  --gpu-memory-utilization 0.85 --disable-log-requests`,
  },
  {
    id: "qry-6",
    stepNumber: "06",
    title: "Dual-Pane Verified Citation View",
    subtitle: "Synchronized PDF & CAD Bounding Boxes",
    techStack: "Cryptographic Citation Verifier",
    latencyOrThroughput: "Instant Page & BBox Jump",
    description:
      "Verifies every emitted citation against source chunk metadata and renders interactive badges that jump the embedded PDF viewer to the exact bounding box.",
    codeSnippet: `verified = engine.verify_and_resolve_citations(llm_output, top_5_chunks)
// Renders interactive badge -> jumps PDF surface to page 82, bbox [48, 112, 564, 398]`,
  },
];

interface ChecklistItem {
  id: string;
  question: string;
  detail: string;
  defaultChecked: boolean;
  impactHours: number;
}

const EVALUATION_CHECKLIST: ChecklistItem[] = [
  {
    id: "chk-legacy",
    question:
      "Need to query 30+ years of legacy CAD, SOPs, and technical drawings?",
    detail:
      "Docling + Surya OCR reconstruct multi-column manuals, scanned microfilm PDFs, and schematic callouts.",
    defaultChecked: true,
    impactHours: 4200,
  },
  {
    id: "chk-compliance",
    question:
      "Cloud LLM APIs blocked by CMMC, ITAR, or export control compliance?",
    detail:
      "100% physical air-gap operation with Ed25519 offline license keys and zero outbound network packets.",
    defaultChecked: true,
    impactHours: 3800,
  },
  {
    id: "chk-abac",
    question: "Require strict clearance-level data segregation (ABAC)?",
    detail:
      "Native Active Directory, LDAP, and CAC/PIV smartcard enforcement down to individual vector chunks.",
    defaultChecked: true,
    impactHours: 3100,
  },
  {
    id: "chk-hallucination",
    question:
      "Zero tolerance for hallucinated torque values, tolerances, or MIL-SPEC part numbers?",
    detail:
      "Deterministic citation verifier forces bracketed [Doc, Page] grounding or explicit refusal.",
    defaultChecked: true,
    impactHours: 2900,
  },
  {
    id: "chk-scif",
    question:
      "Deploying inside a SCIF, tactical edge shelter, or disconnected industrial plant?",
    detail:
      "Pre-loaded containerized stack deploys on 2U/4U rackmount or ruggedized edge hardware in <14 days.",
    defaultChecked: false,
    impactHours: 2400,
  },
];

export default function AirVaultShowcasePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hero Interactive Dual-Pane State
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const currentScenario = DEMO_SCENARIOS[activeScenarioIdx];
  const [selectedCitation, setSelectedCitation] = useState<CitationHotspot>(
    DEMO_SCENARIOS[0].citations[0]
  );

  // Interactive Architecture Workflow Tabs
  const [archTab, setArchTab] = useState<"ingestion" | "query">("ingestion");
  const [selectedIngestStep, setSelectedIngestStep] = useState<PipelineStep>(
    INGESTION_PIPELINE_STEPS[2]
  );
  const [selectedQueryStep, setSelectedQueryStep] = useState<PipelineStep>(
    QUERY_PIPELINE_STEPS[3]
  );

  // Hardware Spec View Mode
  const [selectedChassisProfile, setSelectedChassisProfile] = useState<
    "all" | "2u" | "4u"
  >("all");

  // Interactive ROI & Evaluation Checklist State
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      EVALUATION_CHECKLIST.map((item) => [item.id, item.defaultChecked])
    )
  );

  // Modal Dialog & Form State (modern-web-guidance: light-dismiss-a-dialog + validate-input-after-interaction)
  const dialogRef = useRef<HTMLDialogElement>(null);
  const modalFormRef = useRef<HTMLFormElement>(null);
  const inlineFormRef = useRef<HTMLFormElement>(null);
  const dialogTitleId = useId();
  const [modalIntent, setModalIntent] = useState<
    "Schedule On-Prem Demo" | "Request Technical Brief"
  >("Schedule On-Prem Demo");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [modalSubmitted, setModalSubmitted] = useState(false);

  // Keep selectedCitation synced when switching demo scenarios
  const handleSelectScenario = (idx: number) => {
    setActiveScenarioIdx(idx);
    setSelectedCitation(DEMO_SCENARIOS[idx].citations[0]);
  };

  // Fallback for <dialog closedby="any"> & :user-invalid ARIA sync per modern-web-guidance
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

  useEffect(() => {
    // Sync aria-invalid with CSS :user-invalid state + WeakMap fallback for older engines
    const dirtyState = new WeakMap<
      Element,
      { hasInteracted: boolean; hasBlurred: boolean }
    >();
    const supportsUserInvalid =
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      CSS.supports("selector(:user-invalid)");

    const syncAriaAndFallback = (
      el: EventTarget | null,
      eventType: string
    ) => {
      if (
        !(
          el instanceof HTMLInputElement ||
          el instanceof HTMLSelectElement ||
          el instanceof HTMLTextAreaElement
        )
      ) {
        return;
      }

      if (supportsUserInvalid) {
        try {
          el.setAttribute(
            "aria-invalid",
            el.matches(":user-invalid") ? "true" : "false"
          );
        } catch {
          // ignore selector error
        }
        return;
      }

      const state = dirtyState.get(el) || {
        hasInteracted: false,
        hasBlurred: false,
      };
      if (eventType === "input" || eventType === "change") {
        state.hasInteracted = true;
      } else if (eventType === "blur") {
        state.hasBlurred = true;
      }
      dirtyState.set(el, state);

      if (state.hasInteracted && state.hasBlurred) {
        const isValid = el.checkValidity();
        el.classList.toggle("user-invalid-fallback", !isValid);
        el.classList.toggle("user-valid-fallback", isValid);
        if (!isValid) {
          el.setAttribute("aria-invalid", "true");
        } else {
          el.removeAttribute("aria-invalid");
        }
      }
    };

    const onBlur = (e: Event) => syncAriaAndFallback(e.target, "blur");
    const onInput = (e: Event) => syncAriaAndFallback(e.target, "input");

    document.addEventListener("blur", onBlur, true);
    document.addEventListener("input", onInput, true);
    return () => {
      document.removeEventListener("blur", onBlur, true);
      document.removeEventListener("input", onInput, true);
    };
  }, []);

  const openModal = (
    intent: "Schedule On-Prem Demo" | "Request Technical Brief"
  ) => {
    setModalIntent(intent);
    setModalSubmitted(false);
    dialogRef.current?.showModal();
  };

  const toggleChecklist = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeCheckCount = Object.values(checkedItems).filter(Boolean).length;
  const totalRecoveredHours = EVALUATION_CHECKLIST.reduce(
    (acc, item) => (checkedItems[item.id] ? acc + item.impactHours : acc),
    0
  );

  return (
    <div className="min-h-screen bg-obsidian text-gray-100 relative selection:bg-tacticalCyan/30">
      {/* Subtle Tactical Grid & Ambient Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-tactical-grid bg-[size:48px_48px] opacity-35 z-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[960px] h-[420px] bg-tacticalCyan/10 blur-[140px] rounded-full z-0"
      />

      {/* =====================================================================
          1. HEADER & NAVIGATION BAR
         ===================================================================== */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-obsidian/85 border-b border-cardBorder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Air-Gapped Status Badge */}
          <a
            href="#overview"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-11 h-11 rounded-xl bg-slateDeep border border-tacticalCyan/50 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)] group-hover:border-tacticalCyan transition-colors p-1">
              <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8">
                <polygon
                  points="32,4 56,18 56,46 32,60 8,46 8,18"
                  stroke="#06B6D4"
                  strokeWidth="2.5"
                  strokeDasharray="18 4"
                  fill="rgba(6,182,212,0.06)"
                />
                <polygon
                  points="32,13 48,22 48,42 32,51 16,42 16,22"
                  stroke="#10B981"
                  strokeWidth="2"
                  fill="#0B0F17"
                />
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
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg tracking-wider text-white">
                  AIRVAULT
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-zeroTrustEmerald/15 text-zeroTrustEmerald border border-zeroTrustEmerald/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zeroTrustEmerald animate-pulse" />
                  AIR-GAPPED
                </span>
              </div>
              <span className="text-[11px] font-mono text-gray-400">
                AIR GAP APPLIANCE // ZERO-TRUST AI
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-gray-300"
          >
            <a
              href="#overview"
              className="hover:text-tacticalCyan transition-colors"
            >
              Overview
            </a>
            <a
              href="#features"
              className="hover:text-tacticalCyan transition-colors"
            >
              Key Features
            </a>
            <a
              href="#architecture"
              className="hover:text-tacticalCyan transition-colors"
            >
              Architecture
            </a>
            <a
              href="#hardware"
              className="hover:text-tacticalCyan transition-colors"
            >
              Hardware Specs
            </a>
            <a
              href="#compliance"
              className="hover:text-tacticalCyan transition-colors"
            >
              Compliance
            </a>
            <a
              href="./demo/"
              className="px-3 py-1 rounded-md bg-tacticalCyan/15 border border-tacticalCyan/40 text-tacticalCyan font-mono text-xs font-semibold hover:bg-tacticalCyan hover:text-obsidian transition-all"
            >
              ▶ B2B Video Demo & Logos
            </a>
            <a
              href="./appliances/"
              className="px-3 py-1 rounded-md bg-zeroTrustEmerald/15 border border-zeroTrustEmerald/40 text-zeroTrustEmerald font-mono text-xs font-semibold hover:bg-zeroTrustEmerald hover:text-obsidian transition-all"
            >
              NVIDIA Scaling ➔
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={() => openModal("Request Technical Brief")}
              className="px-4 py-2 rounded-lg border border-cardBorder bg-slateDeep/80 hover:border-tacticalCyan/60 text-xs font-mono uppercase tracking-wider text-gray-200 transition-all"
            >
              Request Technical Brief
            </button>
            <button
              type="button"
              onClick={() => openModal("Schedule On-Prem Demo")}
              className="px-4 py-2 rounded-lg bg-tacticalCyan hover:bg-cyan-400 text-obsidian font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_24px_rgba(6,182,212,0.35)] transition-all flex items-center gap-1.5"
            >
              <span>Schedule On-Prem Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden p-2 rounded-lg border border-cardBorder text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-cardBorder bg-slateDeep px-6 py-4 space-y-3">
            <div className="flex flex-col space-y-2 text-sm">
              <a
                href="#overview"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-gray-200 hover:text-tacticalCyan"
              >
                Overview
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-gray-200 hover:text-tacticalCyan"
              >
                Key Features
              </a>
              <a
                href="#architecture"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-gray-200 hover:text-tacticalCyan"
              >
                Architecture
              </a>
              <a
                href="#hardware"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-gray-200 hover:text-tacticalCyan"
              >
                Hardware Specs
              </a>
              <a
                href="#compliance"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-gray-200 hover:text-tacticalCyan"
              >
                Compliance
              </a>
              <a
                href="./demo/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 font-mono text-tacticalCyan font-semibold"
              >
                ▶ B2B Video Demo & Logo Studio ➔
              </a>
              <a
                href="./appliances/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 font-mono text-zeroTrustEmerald font-semibold"
              >
                NVIDIA Appliances & Volume Scaling ➔
              </a>
            </div>
            <div className="pt-2 flex flex-col sm:hidden gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openModal("Request Technical Brief");
                }}
                className="w-full py-2.5 rounded-lg border border-cardBorder text-xs font-mono uppercase text-gray-200"
              >
                Request Technical Brief
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openModal("Schedule On-Prem Demo");
                }}
                className="w-full py-2.5 rounded-lg bg-tacticalCyan text-obsidian font-mono font-bold text-xs uppercase"
              >
                Schedule On-Prem Demo
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================================
          2. HERO SECTION & INTERACTIVE DUAL-PANE INTERFACE MOCKUP
         ===================================================================== */}
      <section
        id="overview"
        className="relative z-10 pt-12 pb-20 lg:pt-20 lg:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Security Approved Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slateDeep border border-cardBorder mb-6 shadow-inner">
            <span className="px-2 py-0.5 rounded bg-zeroTrustEmerald/20 text-zeroTrustEmerald font-mono text-xs font-semibold">
              [SECURITY APPROVED]
            </span>
            <span className="font-mono text-xs text-gray-300">
              Zero-Telemetry • On-Premise Enterprise AI
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-zeroTrustEmerald border-l border-cardBorder pl-2.5">
              ● Zero Telemetry Verified
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Generative AI Intelligence for{" "}
            <span className="bg-gradient-to-r from-tacticalCyan via-cyan-300 to-zeroTrustEmerald bg-clip-text text-transparent">
              Zero-Trust Air-Gapped Perimeters.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Deploy containerized, open-weight LLMs and layout-aware multi-modal
            RAG directly onto your on-premise hardware with zero external
            telemetry, zero licensing phone-homes, and cryptographic data
            isolation.
          </p>

          {/* Hero CTAs */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => openModal("Schedule On-Prem Demo")}
              className="px-7 py-3.5 rounded-xl bg-tacticalCyan hover:bg-cyan-400 text-obsidian font-mono font-bold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2"
            >
              <span>Schedule On-Prem Pilot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="./demo/"
              className="px-7 py-3.5 rounded-xl bg-zeroTrustEmerald/15 hover:bg-zeroTrustEmerald/25 border border-zeroTrustEmerald/50 text-zeroTrustEmerald font-mono font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <span>▶ Watch B2B Video Demo (Page 1,184 Needle)</span>
            </a>
            <a
              href="#architecture"
              className="px-7 py-3.5 rounded-xl bg-cardSurface/90 hover:bg-cardSurface border border-cardBorder hover:border-tacticalCyan/60 text-gray-100 font-mono text-sm uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <span>Explore Technical Architecture ↓</span>
            </a>
          </div>
        </motion.div>

        {/* Interactive Mockup of the AirVault Dual-Pane Interface */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-14 rounded-2xl bg-slateDeep/95 border border-cardBorder shadow-[0_25px_80px_rgba(0,0,0,0.75)] overflow-hidden"
        >
          {/* Appliance Window Chrome & Scenario Selector */}
          <div className="px-4 sm:px-6 py-3.5 bg-obsidian border-b border-cardBorder flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-warningAmber/80" />
                <span className="w-3 h-3 rounded-full bg-zeroTrustEmerald/80" />
              </div>
              <span className="font-mono text-xs text-gray-300 border-l border-cardBorder pl-3">
                AIRVAULT OS v4.2 // DUAL-PANE VERIFIED CITATION TERMINAL
              </span>
            </div>

            {/* Interactive Scenario Switcher */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-gray-400 uppercase">
                Live Demo Scenario:
              </span>
              {DEMO_SCENARIOS.map((scen, idx) => (
                <button
                  key={scen.id}
                  type="button"
                  onClick={() => handleSelectScenario(idx)}
                  className={`px-3 py-1 rounded-md font-mono text-xs transition-all ${
                    activeScenarioIdx === idx
                      ? "bg-tacticalCyan text-obsidian font-bold"
                      : "bg-cardSurface text-gray-300 hover:text-white border border-cardBorder"
                  }`}
                >
                  {scen.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-status bar */}
          <div className="px-4 sm:px-6 py-2 bg-cardSurface/60 border-b border-cardBorder flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-gray-300">
            <div className="flex items-center gap-4">
              <span className="text-zeroTrustEmerald flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> ENCLAVE BRIDGE: INTERNAL ONLY
              </span>
              <span className="hidden md:inline text-gray-400">
                MODEL: Qwen-2.5-72B-Instruct-AWQ (vLLM PagedAttention)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-warningAmber/15 text-warningAmber border border-warningAmber/40">
                ABAC CLEARANCE: {selectedCitation.securityMarking}
              </span>
            </div>
          </div>

          {/* Dual-Pane Split Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            {/* LEFT PANE: Streaming Grounded Response with Citation Badges */}
            <div className="lg:col-span-6 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-cardBorder flex flex-col justify-between bg-obsidian/60">
              <div className="space-y-5">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                  <span className="uppercase tracking-wider text-tacticalCyan flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" /> Left Pane: Grounded RAG
                    Synthesis
                  </span>
                  <span>GUARDRAIL: ZERO-HALLUCINATION STRICT</span>
                </div>

                {/* User Prompt Card */}
                <div className="p-4 rounded-xl bg-slateDeep border border-cardBorder">
                  <div className="text-[11px] font-mono text-tacticalCyan uppercase mb-1">
                    Authenticated Engineer Query ({currentScenario.sector})
                  </div>
                  <p className="text-sm text-gray-100 leading-relaxed">
                    {currentScenario.userPrompt}
                  </p>
                </div>

                {/* Assistant Grounded Answer with Interactive Citation Badges */}
                <div className="p-4 sm:p-5 rounded-xl bg-cardSurface/75 border border-zeroTrustEmerald/40 shadow-inner">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zeroTrustEmerald uppercase mb-2.5">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Grounded
                      Output
                    </span>
                    <span>Click any citation badge to inspect BBox ➔</span>
                  </div>

                  <div className="text-sm sm:text-[15px] text-gray-100 leading-relaxed whitespace-pre-line">
                    {currentScenario.responseSegments.map((seg, i) => {
                      if (seg.type === "text") {
                        return <span key={i}>{seg.value}</span>;
                      }
                      const targetCit =
                        currentScenario.citations.find(
                          (c) => c.id === seg.citationId
                        ) || currentScenario.citations[0];
                      const isActive = selectedCitation.id === targetCit.id;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedCitation(targetCit)}
                          className={`inline-flex items-center gap-1.5 mx-1 px-2.5 py-0.5 rounded-md font-mono text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                              ? "bg-tacticalCyan text-obsidian shadow-[0_0_16px_rgba(6,182,212,0.6)] ring-2 ring-cyan-300"
                              : "bg-tacticalCyan/15 text-tacticalCyan border border-tacticalCyan/50 hover:bg-tacticalCyan/30"
                          }`}
                        >
                          <FileSearch className="w-3 h-3" />
                          <span>{seg.value}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Retrieved Chunk Rerank Strip */}
                  <div className="mt-5 pt-3.5 border-t border-cardBorder/80">
                    <div className="text-[11px] font-mono text-gray-400 mb-2">
                      STAGE-2 CROSS-ENCODER RERANKED EVIDENCE (BGE-RERANKER-LARGE):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentScenario.citations.map((cit) => {
                        const isSelected = selectedCitation.id === cit.id;
                        return (
                          <button
                            key={cit.id}
                            type="button"
                            onClick={() => setSelectedCitation(cit)}
                            className={`text-left px-3 py-2 rounded-lg font-mono text-xs border transition-all ${
                              isSelected
                                ? "bg-tacticalCyan/20 border-tacticalCyan text-white"
                                : "bg-obsidian/80 border-cardBorder text-gray-300 hover:border-gray-500"
                            }`}
                          >
                            <div className="font-bold text-tacticalCyan">
                              {cit.badgeText}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              Type: {cit.elementType} • Score: {cit.rerankScore}{" "}
                              (RRF: {cit.rrfScore})
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Extracted Markdown / OCR Inspector Box */}
              <div className="mt-4 p-3.5 rounded-lg bg-obsidian border border-cardBorder font-mono text-xs">
                <div className="text-[10px] text-gray-400 uppercase mb-1">
                  Docling Hierarchy Path: {selectedCitation.hierarchy}
                </div>
                <div className="text-cyan-200 whitespace-pre-wrap leading-relaxed">
                  {selectedCitation.extractedPreview}
                </div>
              </div>
            </div>

            {/* RIGHT PANE: High-Resolution Schematic / PDF Bounding-Box Viewer */}
            <div className="lg:col-span-6 p-5 sm:p-6 bg-obsidian flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-gray-400 mb-3">
                <span className="uppercase tracking-wider text-warningAmber flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Right Pane: Synchronized PDF &
                  CAD Schematic Viewer
                </span>
                <span className="text-gray-300">
                  {selectedCitation.docTitle} • Page {selectedCitation.page}
                </span>
              </div>

              {/* Simulated High-Contrast Technical Manual Page Surface */}
              <div className="relative flex-1 min-h-[390px] rounded-xl bg-[#0D131F] border border-cardBorder overflow-hidden p-5 select-none shadow-inner">
                {/* Technical Blueprint Page Header */}
                <div className="border-b border-cardBorder pb-2 mb-3 flex items-center justify-between font-mono text-[10px] text-gray-400">
                  <span>DOC ID: {selectedCitation.docTitle.toUpperCase()}</span>
                  <span className="text-warningAmber font-bold">
                    {selectedCitation.securityMarking}
                  </span>
                  <span>PAGE {selectedCitation.page} OF 312</span>
                </div>

                {/* Top Region: Engineering Specification Table */}
                <div className="mb-5 p-3 rounded border border-slate-800 bg-slateDeep/60 font-mono text-[11px]">
                  <div className="text-gray-300 font-bold mb-2">
                    TABLE 4-3: PRIMARY HYDRAULIC & AVIONICS INTERFACE TOLERANCES
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px] text-gray-400 border-b border-slate-800 pb-1">
                    <span>ASSEMBLY REF</span>
                    <span>MIL-SPEC P/N</span>
                    <span>TORQUE / IMPEDANCE</span>
                    <span>VERIFICATION</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px] text-gray-200 py-1.5 border-b border-slate-800/60">
                    <span>Primary Flange M12</span>
                    <span className="text-tacticalCyan">MS90725-114</span>
                    <span>45.0 Nm (33 lb-ft)</span>
                    <span>8-Bolt Star Seq</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px] text-gray-300 py-1.5">
                    <span>1553B Stub Twinax</span>
                    <span className="text-tacticalCyan">M17/176-00002</span>
                    <span>70.0–85.0 Ω @ 1MHz</span>
                    <span>Max 20.0 ft Stub</span>
                  </div>
                </div>

                {/* Bottom Region: Vector CAD Schematic Diagram */}
                <div className="p-3 rounded border border-slate-800 bg-[#080C14] relative">
                  <div className="font-mono text-[10px] text-gray-400 mb-2 flex justify-between">
                    <span>
                      CAD SCHEMATIC: STAGE-2 HIGH-PRESSURE RELIEF VALVE ASSEMBLY
                    </span>
                    <span>SCALE: 2:1 • TOL: ±0.025MM</span>
                  </div>
                  <svg
                    viewBox="0 0 500 155"
                    className="w-full h-36 stroke-cyan-500/70"
                    fill="none"
                  >
                    {/* Blueprint Grid Lines */}
                    <line
                      x1="0"
                      y1="77"
                      x2="500"
                      y2="77"
                      stroke="#1E293B"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="250"
                      y1="0"
                      x2="250"
                      y2="155"
                      stroke="#1E293B"
                      strokeDasharray="4 4"
                    />
                    {/* Valve Outer Manifold Body */}
                    <rect
                      x="70"
                      y="25"
                      width="360"
                      height="105"
                      rx="6"
                      stroke="#38BDF8"
                      strokeWidth="1.8"
                    />
                    {/* Inner Chamber & Poppet */}
                    <rect
                      x="130"
                      y="45"
                      width="240"
                      height="65"
                      stroke="#06B6D4"
                      strokeWidth="1.4"
                    />
                    {/* O-Ring Groove Callout #04 */}
                    <circle
                      cx="165"
                      cy="45"
                      r="9"
                      stroke="#F59E0B"
                      strokeWidth="2.2"
                      fill="rgba(245,158,11,0.25)"
                    />
                    <circle
                      cx="165"
                      cy="110"
                      r="9"
                      stroke="#F59E0B"
                      strokeWidth="2.2"
                      fill="rgba(245,158,11,0.25)"
                    />
                    {/* Callout Leader Line */}
                    <line
                      x1="172"
                      y1="38"
                      x2="215"
                      y2="14"
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                    />
                    <text
                      x="220"
                      y="17"
                      fill="#F59E0B"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      CALLOUT #04: O-RING AN6227-23
                    </text>
                    {/* Spring Coils */}
                    <path
                      d="M 220 55 L 240 98 L 260 55 L 280 98 L 300 55 L 320 98"
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                {/* Animated Bounding Box Overlay Driven by Selected Citation */}
                <motion.div
                  layout
                  initial={false}
                  animate={{
                    top: selectedCitation.bbox.top,
                    left: selectedCitation.bbox.left,
                    width: selectedCitation.bbox.width,
                    height: selectedCitation.bbox.height,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  className="absolute border-2 border-warningAmber bg-warningAmber/15 rounded-lg shadow-[0_0_30px_rgba(245,158,11,0.45)] pointer-events-none"
                >
                  <div className="absolute -top-6 left-0 bg-warningAmber text-obsidian font-mono font-bold text-[10px] px-2 py-0.5 rounded-t flex items-center gap-2 whitespace-nowrap">
                    <span>VERIFIED BBOX • {selectedCitation.elementType}</span>
                    <span>SCORE: {selectedCitation.rerankScore}</span>
                  </div>
                </motion.div>
              </div>

              {/* Bounding-Box Telemetry Footer */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-gray-400">
                <span>BBOX COORDS: {selectedCitation.bbox.coordsLabel}</span>
                <span className="text-zeroTrustEmerald">
                  ● SHA-256 PROVENANCE VERIFIED
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* =====================================================================
          3. COMPLIANCE & TARGET SECTOR BAR
         ===================================================================== */}
      <section
        id="compliance"
        className="relative z-10 border-y border-cardBorder bg-slateDeep/90 py-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Target Sectors */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-mono text-xs uppercase tracking-widest text-gray-400">
              MISSION-CRITICAL SECTORS:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm font-semibold text-gray-200">
              {[
                "Defense Contractors",
                "Aerospace",
                "Semiconductor Labs",
                "Nuclear Utilities",
                "Critical Infrastructure",
              ].map((sector) => (
                <span
                  key={sector}
                  className="flex items-center gap-2 px-3 py-1 rounded-md bg-obsidian/70 border border-cardBorder"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-tacticalCyan" />
                  {sector}
                </span>
              ))}
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="pt-4 border-t border-cardBorder/70 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-mono text-xs uppercase tracking-widest text-zeroTrustEmerald">
              ACCREDITATION & SECURITY POSTURE:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {[
                "ITAR Compliant",
                "CMMC Level 3 Ready",
                "DISA STIG Hardened",
                "NIST SP 800-171",
                "ABAC Security Framework",
              ].map((badge) => (
                <span
                  key={badge}
                  className="px-3.5 py-1.5 rounded-lg bg-zeroTrustEmerald/10 border border-zeroTrustEmerald/40 text-zeroTrustEmerald font-mono text-xs font-semibold flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. KEY VALUE PILLARS (GRID LAYOUT)
         ===================================================================== */}
      <section
        id="features"
        className="relative z-10 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-3xl">
          <div className="font-mono text-xs uppercase tracking-widest text-tacticalCyan mb-2">
            // CORE ARCHITECTURAL PILLARS
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Engineered for High-Consequence, Zero-Egress Environments
          </h2>
          <p className="mt-4 text-gray-300 text-base sm:text-lg">
            Every layer of AirVault is purpose-built to eliminate cloud
            dependencies while delivering sub-second hybrid retrieval across
            terabytes of classified engineering manuals, schematics, and CAD
            packages.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-cardSurface/80 border border-cardBorder hover:border-tacticalCyan/60 transition-all flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-zeroTrustEmerald/15 border border-zeroTrustEmerald/40 flex items-center justify-center mb-5">
                <Lock className="w-5 h-5 text-zeroTrustEmerald" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5">
                1. Zero External Telemetry
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Runs entirely on local hardware with Ed25519 asymmetric license
                keys and zero outbound network traffic. Container bridge networks
                enforce <code className="font-mono text-cyan-300">internal: true</code>{" "}
                with no default gateway.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-cardBorder/80 font-mono text-xs text-zeroTrustEmerald flex items-center justify-between">
              <span>LICENSE VERIFICATION</span>
              <span>Ed25519 OFFLINE KEY</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-cardSurface/80 border border-cardBorder hover:border-tacticalCyan/60 transition-all flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-tacticalCyan/15 border border-tacticalCyan/40 flex items-center justify-center mb-5">
                <FileText className="w-5 h-5 text-tacticalCyan" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5">
                2. Layout-Aware Ingestion
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Parses complex engineering PDFs, multi-column technical specs,
                and CAD drawing title blocks while retaining table structure via{" "}
                <span className="text-white font-medium">Docling & Surya OCR</span>.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-cardBorder/80 font-mono text-xs text-tacticalCyan flex items-center justify-between">
              <span>PARSER ENGINE</span>
              <span>DOCLING + SURYA OCR</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-cardSurface/80 border border-cardBorder hover:border-tacticalCyan/60 transition-all flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-tacticalCyan/15 border border-tacticalCyan/40 flex items-center justify-center mb-5">
                <Database className="w-5 h-5 text-tacticalCyan" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5">
                3. Dual-Stage Hybrid Search
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Combines Qdrant dense vector semantic search (BGE-Large) with
                OpenSearch BM25 sparse lexical search using Reciprocal Rank
                Fusion (RRF) for exact MIL-SPEC and part-number matching.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-cardBorder/80 font-mono text-xs text-tacticalCyan flex items-center justify-between">
              <span>RETRIEVAL FUSION</span>
              <span>QDRANT + BM25 (RRF k=60)</span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-2xl bg-cardSurface/80 border border-cardBorder hover:border-tacticalCyan/60 transition-all flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-warningAmber/15 border border-warningAmber/40 flex items-center justify-center mb-5">
                <KeyRound className="w-5 h-5 text-warningAmber" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5">
                4. Attribute-Based Access Control (ABAC)
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Integrated with Active Directory, LDAP, and CAC/PIV smartcards
                to enforce security clearance filtering down to individual
                document chunks prior to LLM context assembly.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-cardBorder/80 font-mono text-xs text-warningAmber flex items-center justify-between">
              <span>IDENTITY ENFORCEMENT</span>
              <span>AD / LDAP / CAC PIV</span>
            </div>
          </div>

          {/* Pillar 5 */}
          <div className="p-6 rounded-2xl bg-cardSurface/80 border border-cardBorder hover:border-tacticalCyan/60 transition-all flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-tacticalCyan/15 border border-tacticalCyan/40 flex items-center justify-center mb-5">
                <Cpu className="w-5 h-5 text-tacticalCyan" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5">
                5. High-Throughput Local Runtime
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Powered by vLLM & NVIDIA Triton with PagedAttention, serving
                quantized models (Qwen 2.5 14B/72B, Llama 3.3 70B AWQ) on local
                GPUs (NVIDIA L40S, A100, H100).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-cardBorder/80 font-mono text-xs text-tacticalCyan flex items-center justify-between">
              <span>INFERENCE ENGINE</span>
              <span>vLLM + TRITON AWQ</span>
            </div>
          </div>

          {/* Pillar 6: Cross-Encoder & Citation Guardrails */}
          <div className="p-6 rounded-2xl bg-cardSurface/80 border border-cardBorder hover:border-tacticalCyan/60 transition-all flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-zeroTrustEmerald/15 border border-zeroTrustEmerald/40 flex items-center justify-center mb-5">
                <CheckCircle2 className="w-5 h-5 text-zeroTrustEmerald" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5">
                6. Cross-Encoder & BBox Grounding
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Re-scores Top-30 candidates down to the Top-5 highest-confidence
                snippets using <code className="font-mono text-cyan-300">bge-reranker-large</code>{" "}
                and binds every claim to verifiable PDF bounding boxes.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-cardBorder/80 font-mono text-xs text-zeroTrustEmerald flex items-center justify-between">
              <span>HALLUCINATION POLICY</span>
              <span>STRICT CITATION LOCK</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. INTERACTIVE SYSTEM ARCHITECTURE WORKFLOW
         ===================================================================== */}
      <section
        id="architecture"
        className="relative z-10 py-24 bg-slateDeep/80 border-y border-cardBorder"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-tacticalCyan mb-2">
                // TWO-STAGE OPERATIONAL LIFECYCLE
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Interactive System Architecture Workflow
              </h2>
              <p className="mt-3 text-gray-300 max-w-2xl">
                Inspect how AirVault transforms raw network shares into dual-indexed
                vector + lexical stores during offline batch ingestion, and enforces
                ABAC security during real-time query execution.
              </p>
            </div>

            {/* Architecture Lifecycle Tabs */}
            <div
              role="tablist"
              aria-label="System Architecture Phases"
              className="inline-flex p-1.5 rounded-xl bg-obsidian border border-cardBorder self-start"
            >
              <button
                type="button"
                role="tab"
                aria-selected={archTab === "ingestion"}
                onClick={() => setArchTab("ingestion")}
                className={`px-4 py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                  archTab === "ingestion"
                    ? "bg-tacticalCyan text-obsidian shadow"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Tab 1: Offline Ingestion Pipeline (Batch)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={archTab === "query"}
                onClick={() => setArchTab("query")}
                className={`px-4 py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                  archTab === "query"
                    ? "bg-zeroTrustEmerald text-obsidian shadow"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Tab 2: Real-Time Query Pipeline (Runtime)
              </button>
            </div>
          </div>

          {/* Pipeline Flow Banner */}
          <div className="mt-8 p-4 rounded-xl bg-obsidian border border-cardBorder font-mono text-xs text-cyan-300 overflow-x-auto whitespace-nowrap">
            {archTab === "ingestion" ? (
              <span>
                Local SMB/NFS Shares ➔ MinIO Object Storage ➔ Docling Layout OCR
                ➔ Hierarchical Structural Chunker ➔ Dual Vector Indexing (Qdrant
                + BM25)
              </span>
            ) : (
              <span className="text-emerald-300">
                User Query ➔ Active Directory / CAC ABAC Security Filter ➔
                Parallel Hybrid Search ➔ Cross-Encoder Reranker (Top 30 ➔ Top 5)
                ➔ Local vLLM Engine ➔ Dual-Pane Verified Citation View
              </span>
            )}
          </div>

          {/* Interactive Step Nodes + Detail Inspector */}
          <AnimatePresence mode="wait">
            {archTab === "ingestion" ? (
              <motion.div
                key="ingestion-tab"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="mt-8 space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {INGESTION_PIPELINE_STEPS.map((step) => {
                    const active = selectedIngestStep.id === step.id;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setSelectedIngestStep(step)}
                        className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
                          active
                            ? "bg-cardSurface border-tacticalCyan shadow-[0_0_25px_rgba(6,182,212,0.2)]"
                            : "bg-obsidian/80 border-cardBorder hover:border-gray-500"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between font-mono text-xs mb-2">
                            <span className="text-tacticalCyan font-bold">
                              STAGE {step.stepNumber}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                          </div>
                          <div className="font-bold text-sm text-white">
                            {step.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {step.subtitle}
                          </div>
                        </div>
                        <div className="mt-4 pt-2 border-t border-cardBorder/60 font-mono text-[10px] text-cyan-300">
                          {step.techStack}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Ingestion Step Deep-Dive Card */}
                <div className="p-6 rounded-2xl bg-obsidian border border-cardBorder grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-6 space-y-3">
                    <div className="inline-flex items-center gap-2 font-mono text-xs text-tacticalCyan">
                      <span>STAGE {selectedIngestStep.stepNumber} INSPECTOR</span>
                      <span>•</span>
                      <span>{selectedIngestStep.latencyOrThroughput}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {selectedIngestStep.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {selectedIngestStep.description}
                    </p>
                  </div>
                  <div className="lg:col-span-6">
                    <div className="rounded-xl bg-slateDeep border border-cardBorder p-4 font-mono text-xs text-cyan-200 overflow-x-auto">
                      <div className="text-[10px] text-gray-400 uppercase mb-2">
                        // AirVault Container Runtime Implementation
                      </div>
                      <pre className="leading-relaxed">
                        <code>{selectedIngestStep.codeSnippet}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="query-tab"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="mt-8 space-y-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                  {QUERY_PIPELINE_STEPS.map((step) => {
                    const active = selectedQueryStep.id === step.id;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setSelectedQueryStep(step)}
                        className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
                          active
                            ? "bg-cardSurface border-zeroTrustEmerald shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                            : "bg-obsidian/80 border-cardBorder hover:border-gray-500"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between font-mono text-xs mb-2">
                            <span className="text-zeroTrustEmerald font-bold">
                              STAGE {step.stepNumber}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                          </div>
                          <div className="font-bold text-sm text-white">
                            {step.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {step.subtitle}
                          </div>
                        </div>
                        <div className="mt-4 pt-2 border-t border-cardBorder/60 font-mono text-[10px] text-emerald-300">
                          {step.techStack}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Query Step Deep-Dive Card */}
                <div className="p-6 rounded-2xl bg-obsidian border border-cardBorder grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-6 space-y-3">
                    <div className="inline-flex items-center gap-2 font-mono text-xs text-zeroTrustEmerald">
                      <span>STAGE {selectedQueryStep.stepNumber} INSPECTOR</span>
                      <span>•</span>
                      <span>{selectedQueryStep.latencyOrThroughput}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {selectedQueryStep.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {selectedQueryStep.description}
                    </p>
                  </div>
                  <div className="lg:col-span-6">
                    <div className="rounded-xl bg-slateDeep border border-cardBorder p-4 font-mono text-xs text-emerald-200 overflow-x-auto">
                      <div className="text-[10px] text-gray-400 uppercase mb-2">
                        // AirVault Runtime Execution Trace
                      </div>
                      <pre className="leading-relaxed">
                        <code>{selectedQueryStep.codeSnippet}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* =====================================================================
          6. HARDWARE & DEPLOYMENT SPECIFICATIONS (INTERACTIVE TABLE/CARD)
          Implements modern-web-guidance `responsive-table` pattern
         ===================================================================== */}
      <section
        id="hardware"
        className="relative z-10 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-tacticalCyan mb-2">
              // TURN-KEY RACKMOUNT APPLIANCE SPECS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Hardware & Deployment Specifications
            </h2>
            <p className="mt-3 text-gray-300 max-w-2xl">
              Pre-integrated, burn-in tested 2U and 4U rackmount nodes delivered
              with DISA STIG hardened Linux, quantized open-weight LLM vaults, and
              redundant enterprise NVMe storage.
            </p>
          </div>

          {/* Interactive Node Filter */}
          <div className="inline-flex p-1 rounded-xl bg-slateDeep border border-cardBorder self-start font-mono text-xs">
            {[
              { id: "all", label: "Compare All Configurations" },
              { id: "2u", label: "2U Tactical Node" },
              { id: "4u", label: "4U Enterprise Node" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setSelectedChassisProfile(tab.id as "all" | "2u" | "4u")
                }
                className={`px-3.5 py-2 rounded-lg transition-all ${
                  selectedChassisProfile === tab.id
                    ? "bg-tacticalCyan text-obsidian font-bold"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accessible, Container-Query Responsive Specification Table */}
        <div
          tabIndex={0}
          role="region"
          aria-labelledby="hardware-specs-caption"
          className="table-wrapper rounded-2xl border border-cardBorder bg-slateDeep/90 shadow-2xl"
        >
          <table className="specs-table text-left text-sm">
            <caption
              id="hardware-specs-caption"
              className="sr-only"
            >
              AirVault 2U and 4U Rackmount Hardware and Security Specifications
            </caption>
            <thead>
              <tr className="bg-obsidian border-b border-cardBorder font-mono text-xs uppercase text-gray-300">
                <th className="py-4 px-5 border-b border-cardBorder">
                  Subsystem
                </th>
                <th
                  className={`py-4 px-5 border-b border-cardBorder text-tacticalCyan ${
                    selectedChassisProfile === "4u" ? "opacity-40" : ""
                  }`}
                >
                  AirVault 2U Tactical Edge
                </th>
                <th
                  className={`py-4 px-5 border-b border-cardBorder text-zeroTrustEmerald ${
                    selectedChassisProfile === "2u" ? "opacity-40" : ""
                  }`}
                >
                  AirVault 4U Enterprise Node
                </th>
                <th className="py-4 px-5 border-b border-cardBorder text-warningAmber">
                  Compliance & Security Verification
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cardBorder">
              <tr>
                <th className="py-4 px-5 font-mono font-semibold text-white">
                  Compute
                </th>
                <td
                  className={`py-4 px-5 font-mono text-gray-200 ${
                    selectedChassisProfile === "4u" ? "opacity-40" : ""
                  }`}
                >
                  Dual Intel Xeon Gold 6530 (64 Cores Total)
                </td>
                <td
                  className={`py-4 px-5 font-mono text-gray-200 ${
                    selectedChassisProfile === "2u" ? "opacity-40" : ""
                  }`}
                >
                  Dual AMD EPYC 9354 (64 Cores / 128 Threads, PCIe 5.0)
                </td>
                <td className="py-4 px-5 font-mono text-xs text-gray-300">
                  AMD SEV-SNP / Intel TXT Hardware Root of Trust
                </td>
              </tr>

              <tr>
                <th className="py-4 px-5 font-mono font-semibold text-white">
                  Memory
                </th>
                <td
                  className={`py-4 px-5 font-mono text-gray-200 ${
                    selectedChassisProfile === "4u" ? "opacity-40" : ""
                  }`}
                >
                  384 GB DDR5 ECC Registered RAM (4800 MT/s)
                </td>
                <td
                  className={`py-4 px-5 font-mono text-gray-200 ${
                    selectedChassisProfile === "2u" ? "opacity-40" : ""
                  }`}
                >
                  512 GB DDR5 ECC Registered RAM (12-Channel High Bandwidth)
                </td>
                <td className="py-4 px-5 font-mono text-xs text-gray-300">
                  Full Memory Encryption & Multi-Bit ECC Scrubbing
                </td>
              </tr>

              <tr>
                <th className="py-4 px-5 font-mono font-semibold text-white">
                  GPU Acceleration
                </th>
                <td
                  className={`py-4 px-5 font-mono text-gray-200 ${
                    selectedChassisProfile === "4u" ? "opacity-40" : ""
                  }`}
                >
                  2x NVIDIA L40S (96 GB Combined GDDR6 VRAM)
                </td>
                <td
                  className={`py-4 px-5 font-mono text-gray-200 ${
                    selectedChassisProfile === "2u" ? "opacity-40" : ""
                  }`}
                >
                  4x NVIDIA L40S (192 GB VRAM) or 2x NVIDIA A100/H100 (160 GB HBM3)
                </td>
                <td className="py-4 px-5 font-mono text-xs text-gray-300">
                  Runs Qwen 2.5 72B / Llama 3.3 70B + BGE-Large + Reranker
                </td>
              </tr>

              <tr>
                <th className="py-4 px-5 font-mono font-semibold text-white">
                  Storage
                </th>
                <td
                  className={`py-4 px-5 font-mono text-gray-200 ${
                    selectedChassisProfile === "4u" ? "opacity-40" : ""
                  }`}
                >
                  4x 7.68TB Enterprise U.3 NVMe SSDs in RAID 10
                </td>
                <td
                  className={`py-4 px-5 font-mono text-gray-200 ${
                    selectedChassisProfile === "2u" ? "opacity-40" : ""
                  }`}
                >
                  4x 7.68TB Enterprise NVMe SSDs in RAID 10 (Expandable to 61TB)
                </td>
                <td className="py-4 px-5 font-mono text-xs text-gray-300">
                  FIPS 140-3 Self-Encrypting Drives (SED) + Hot-Swap Bays
                </td>
              </tr>

              <tr>
                <th className="py-4 px-5 font-mono font-semibold text-white">
                  Network
                </th>
                <td
                  className={`py-4 px-5 font-mono text-gray-200 ${
                    selectedChassisProfile === "4u" ? "opacity-40" : ""
                  }`}
                >
                  Dual 10GbE / 25GbE SFP28 (Isolated Physical Switch Fabric)
                </td>
                <td
                  className={`py-4 px-5 font-mono text-gray-200 ${
                    selectedChassisProfile === "2u" ? "opacity-40" : ""
                  }`}
                >
                  Dual 25GbE SFP28 + Dedicated Out-of-Band Redfish IPMI VLAN
                </td>
                <td className="py-4 px-5 font-mono text-xs text-gray-300">
                  Physical Air-Gap Verified (No Default Gateway / Zero WAN)
                </td>
              </tr>

              <tr>
                <th className="py-4 px-5 font-mono font-semibold text-white">
                  Hardened OS
                </th>
                <td
                  className={`py-4 px-5 font-mono text-gray-200 ${
                    selectedChassisProfile === "4u" ? "opacity-40" : ""
                  }`}
                >
                  Rocky Linux 9 / RHEL 9 with DISA STIG Profiles Applied
                </td>
                <td
                  className={`py-4 px-5 font-mono text-gray-200 ${
                    selectedChassisProfile === "2u" ? "opacity-40" : ""
                  }`}
                >
                  Rocky Linux 9 / RHEL 9 (SELinux Enforcing, FIPS Mode Active)
                </td>
                <td className="py-4 px-5 font-mono text-xs text-gray-300">
                  Signed Offline Container Registry & Immutable Root FS
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Callout Banner to Dedicated NVIDIA AI Appliance & Volume Scaling Page */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slateDeep via-cardSurface to-obsidian border border-tacticalCyan/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5">
            <div className="font-mono text-xs uppercase text-zeroTrustEmerald font-semibold">
              // NEW: FULL NVIDIA BLACKWELL & IGX / HGX SIZING CALCULATOR
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Need to scale from 15,000 pages to 75+ Million pages?
            </h3>
            <p className="text-sm text-gray-300 max-w-2xl">
              Explore our dedicated{" "}
              <span className="text-white font-semibold">
                NVIDIA AI Appliance Portfolio & Document Volume Scaling Model
              </span>{" "}
              comparing IGX Orin, DGX Spark (GB10), DGX Station GB300 (748GB),
              RTX PRO 6000 Blackwell 4U Server, and DGX B200 SuperPOD clusters.
            </p>
          </div>
          <a
            href="./appliances/"
            className="px-6 py-3.5 rounded-xl bg-tacticalCyan hover:bg-cyan-400 text-obsidian font-mono font-bold text-xs uppercase tracking-wider whitespace-nowrap shadow-[0_0_24px_rgba(6,182,212,0.35)] transition-all flex items-center gap-2"
          >
            <span>Open NVIDIA Scaling Model</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* =====================================================================
          7. INTERACTIVE ROI & EVALUATION CHECKLIST
         ===================================================================== */}
      <section
        id="roi-checklist"
        className="relative z-10 py-24 bg-slateDeep/80 border-y border-cardBorder"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Interactive Questionnaire / Toggle List */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-tacticalCyan mb-2">
                // FACILITY READINESS ASSESSMENT
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Is AirVault Right for Your Facility?
              </h2>
              <p className="mt-2 text-gray-300 text-sm sm:text-base">
                Select the operational and compliance requirements that apply to
                your engineering enclave:
              </p>
            </div>

            <div className="space-y-3.5">
              {EVALUATION_CHECKLIST.map((item) => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleChecklist(item.id)}
                    aria-pressed={isChecked}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                      isChecked
                        ? "bg-cardSurface border-tacticalCyan/70 shadow-md"
                        : "bg-obsidian/60 border-cardBorder opacity-75 hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 border font-mono text-xs ${
                        isChecked
                          ? "bg-tacticalCyan border-tacticalCyan text-obsidian font-bold"
                          : "border-gray-500 text-transparent"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm sm:text-base">
                        {item.question}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {item.detail}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assessment Output Result Card */}
          <div className="lg:col-span-5">
            <div className="p-7 rounded-2xl bg-obsidian border-2 border-zeroTrustEmerald/60 shadow-[0_0_50px_rgba(16,185,129,0.15)] space-y-6">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-zeroTrustEmerald/15 text-zeroTrustEmerald font-mono text-xs font-bold border border-zeroTrustEmerald/40">
                  ● ASSESSMENT RESULT ({activeCheckCount}/
                  {EVALUATION_CHECKLIST.length} CRITERIA MET)
                </span>
                <Shield className="w-6 h-6 text-zeroTrustEmerald" />
              </div>

              <div className="p-4 rounded-xl bg-zeroTrustEmerald/10 border border-zeroTrustEmerald/30">
                <div className="font-mono text-xs uppercase text-zeroTrustEmerald mb-1">
                  DEPLOYMENT VERDICT:
                </div>
                <p className="text-lg sm:text-xl font-bold text-white leading-snug">
                  &ldquo;AirVault Ready: Deployable in under 14 days with zero
                  cloud dependencies.&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slateDeep border border-cardBorder">
                  <div className="font-mono text-[11px] text-gray-400 uppercase">
                    Est. Engineering Time Saved
                  </div>
                  <div className="text-2xl font-mono font-bold text-tacticalCyan mt-1">
                    {totalRecoveredHours.toLocaleString()} hrs/yr
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slateDeep border border-cardBorder">
                  <div className="font-mono text-[11px] text-gray-400 uppercase">
                    Recommended Chassis
                  </div>
                  <div className="text-2xl font-mono font-bold text-white mt-1">
                    {activeCheckCount >= 4 ? "AirVault 4U" : "AirVault 2U"}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Outbound Network Traffic:</span>
                  <span className="text-zeroTrustEmerald font-bold">
                    0.00 Bytes (Air-Gapped)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>On-Site Turn-Key Commissioning:</span>
                  <span className="text-white font-bold">&lt; 14 Days</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openModal("Schedule On-Prem Demo")}
                className="w-full py-3.5 rounded-xl bg-zeroTrustEmerald hover:bg-emerald-400 text-obsidian font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>Request Custom Sizing & Pilot Proposal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. CALL TO ACTION BANNER, BRIEFING FORM & FOOTER
          Implements modern-web-guidance `validate-input-after-interaction`
         ===================================================================== */}
      <section
        id="contact"
        className="relative z-10 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="rounded-3xl bg-gradient-to-br from-slateDeep via-cardSurface to-obsidian border border-cardBorder p-8 sm:p-12 lg:p-16 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-tacticalCyan/15 text-tacticalCyan font-mono text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> ON-PREMISE DEPLOYMENT BRIEFING
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Turn high-liability data vaults into instant operational
              intelligence.
            </h2>
            <p className="text-gray-300 text-base leading-relaxed">
              Schedule a classified or unclassified technical architecture
              review with our defense systems engineering team, or request the
              complete AirVault 2U/4U Hardware & STIG Security Brief.
            </p>
            <div className="pt-2 space-y-2 font-mono text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-zeroTrustEmerald" />
                <span>Cleared U.S. Field Deployment Engineers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-zeroTrustEmerald" />
                <span>30-Day On-Premise Evaluation Appliance Available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-zeroTrustEmerald" />
                <span>Customer Retains All NVMe Drives Upon Evaluation</span>
              </div>
            </div>
          </div>

          {/* Inline Contact & Clearance Form */}
          <div className="lg:col-span-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-obsidian/90 border border-cardBorder">
              {formSubmitted ? (
                <div className="py-10 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-zeroTrustEmerald mx-auto" />
                  <h3 className="text-xl font-bold text-white">
                    Technical Briefing Request Logged
                  </h3>
                  <p className="text-sm text-gray-300 max-w-md mx-auto">
                    Our Solutions Architecture team has queued your facility
                    specification package and will coordinate directly via your
                    designated enclave point of contact.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormSubmitted(false)}
                    className="px-5 py-2 rounded-lg border border-cardBorder font-mono text-xs text-tacticalCyan hover:border-tacticalCyan"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form
                  ref={inlineFormRef}
                  onSubmit={(e) => {
                    e.preventDefault();
                    setFormSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div className="font-mono text-xs uppercase text-tacticalCyan mb-2">
                    // REQUEST TECHNICAL BRIEF & ON-PREM PILOT
                  </div>

                  <div>
                    <label
                      htmlFor="inline-name"
                      className="block text-xs font-mono uppercase text-gray-300 mb-1"
                    >
                      Full Name & Title *
                    </label>
                    <span id="inline-name-hint" className="hint">
                      Format: Jane Doe, Principal Systems Architect
                    </span>
                    <input
                      type="text"
                      id="inline-name"
                      name="name"
                      required
                      minLength={2}
                      autoComplete="name"
                      aria-describedby="inline-name-hint"
                      aria-errormessage="inline-name-err"
                      placeholder="Col. Alex Rivera / Chief Engineer"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slateDeep border border-cardBorder text-sm text-white focus:outline-none focus:border-tacticalCyan"
                    />
                    <div id="inline-name-err" className="error-msg">
                      <span aria-hidden="true">⚠ </span>Please enter your name
                      and role.
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="inline-email"
                      className="block text-xs font-mono uppercase text-gray-300 mb-1"
                    >
                      Official Agency / Corporate Email *
                    </label>
                    <span id="inline-email-hint" className="hint">
                      Format: engineer@agency.mil or name@contractor.com
                    </span>
                    <input
                      type="email"
                      id="inline-email"
                      name="email"
                      required
                      autoComplete="email"
                      aria-describedby="inline-email-hint"
                      aria-errormessage="inline-email-err"
                      placeholder="alex.rivera@aerospace-defense.com"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slateDeep border border-cardBorder text-sm text-white focus:outline-none focus:border-tacticalCyan"
                    />
                    <div id="inline-email-err" className="error-msg">
                      <span aria-hidden="true">⚠ </span>Please enter a valid
                      agency or corporate email address.
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="inline-company"
                      className="block text-xs font-mono uppercase text-gray-300 mb-1"
                    >
                      Agency / Prime Contractor / Organization *
                    </label>
                    <span id="inline-company-hint" className="hint">
                      Include CAGE code or facility division if applicable
                    </span>
                    <input
                      type="text"
                      id="inline-company"
                      name="organization"
                      required
                      minLength={2}
                      autoComplete="organization"
                      aria-describedby="inline-company-hint"
                      aria-errormessage="inline-company-err"
                      placeholder="Aegis Propulsion Labs (CAGE: 4X921)"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slateDeep border border-cardBorder text-sm text-white focus:outline-none focus:border-tacticalCyan"
                    />
                    <div id="inline-company-err" className="error-msg">
                      <span aria-hidden="true">⚠ </span>Please specify your
                      agency or company.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="inline-sector"
                        className="block text-xs font-mono uppercase text-gray-300 mb-1"
                      >
                        Defense / Industrial Sector *
                      </label>
                      <select
                        id="inline-sector"
                        name="sector"
                        required
                        defaultValue="Defense & Aerospace"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slateDeep border border-cardBorder text-sm text-white focus:outline-none focus:border-tacticalCyan"
                      >
                        <option value="Defense & Aerospace">
                          Defense & Aerospace
                        </option>
                        <option value="Semiconductor & Lithography Labs">
                          Semiconductor Labs
                        </option>
                        <option value="Nuclear & Energy Utilities">
                          Nuclear Utilities
                        </option>
                        <option value="Naval & Maritime Systems">
                          Naval & Maritime Systems
                        </option>
                        <option value="Critical Infrastructure">
                          Critical Infrastructure
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="inline-clearance"
                        className="block text-xs font-mono uppercase text-gray-300 mb-1"
                      >
                        Enclave Accreditation Level *
                      </label>
                      <select
                        id="inline-clearance"
                        name="clearance"
                        required
                        defaultValue="CUI / ITAR / CMMC L3"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slateDeep border border-cardBorder text-sm text-white focus:outline-none focus:border-tacticalCyan"
                      >
                        <option value="Unclassified Air-Gap">
                          Unclassified Air-Gap
                        </option>
                        <option value="CUI / ITAR / CMMC L3">
                          CUI / ITAR / CMMC Level 3
                        </option>
                        <option value="SIPR / Collateral Secret">
                          SIPR / Collateral Secret
                        </option>
                        <option value="JWICS / TS-SCI SCIF">
                          JWICS / TS-SCI SCIF
                        </option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-tacticalCyan hover:bg-cyan-400 text-obsidian font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_24px_rgba(6,182,212,0.3)] transition-all"
                  >
                    Transmit Briefing & Hardware Sizing Request
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          FOOTER
         ===================================================================== */}
      <footer className="relative z-10 border-t border-cardBorder bg-obsidian py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <Shield className="w-5 h-5 text-tacticalCyan" />
              <span className="font-mono font-bold text-sm tracking-wider text-white">
                AIRVAULT (AIR GAP APPLIANCE)
              </span>
              <span className="px-2 py-0.5 rounded bg-zeroTrustEmerald/15 text-zeroTrustEmerald border border-zeroTrustEmerald/40 font-mono text-[10px]">
                System Status: 100% Offline Capable
              </span>
            </div>
            <p className="text-xs text-gray-400 max-w-xl">
              SECURITY DISCLAIMER: AirVault appliances operate with zero external
              network interfaces enabled by default. All cryptographic keys,
              quantized LLM weights, and vector indices remain exclusively on
              customer-controlled media.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 font-mono text-xs text-gray-300">
            <a
              href="https://github.com/gmascagni/airgap"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-slateDeep border border-cardBorder hover:border-tacticalCyan flex items-center gap-2 transition-colors"
            >
              <span>GitHub Repository (gmascagni/airgap)</span>
              <ExternalLink className="w-3.5 h-3.5 text-tacticalCyan" />
            </a>
            <span className="text-gray-500">
              © {new Date().getFullYear()} AirVault Defense Systems. All Rights
              Reserved.
            </span>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          LIGHT-DISMISS MODAL DIALOG (modern-web-guidance: light-dismiss-a-dialog)
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
                // ZERO-TRUST DEPLOYMENT DESK
              </span>
              <h2 id={dialogTitleId} className="text-xl font-bold text-white">
                {modalIntent}
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

          {modalSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-zeroTrustEmerald mx-auto" />
              <h3 className="text-lg font-bold text-white">
                {modalIntent} Confirmed
              </h3>
              <p className="text-sm text-gray-300">
                Your request has been recorded. A cleared AirVault systems
                engineer will provide the offline technical dossier and hardware
                burn-in schedule.
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
              ref={modalFormRef}
              onSubmit={(e) => {
                e.preventDefault();
                setModalSubmitted(true);
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="modal-name"
                  className="block text-xs font-mono uppercase text-gray-300 mb-1"
                >
                  Full Name & Rank / Title *
                </label>
                <span id="modal-name-hint" className="hint">
                  Format: First Last, Engineering Role
                </span>
                <input
                  type="text"
                  id="modal-name"
                  name="name"
                  required
                  minLength={2}
                  autoComplete="name"
                  aria-describedby="modal-name-hint"
                  aria-errormessage="modal-name-err"
                  placeholder="Dr. Elena Vance, Lead Avionics Architect"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-cardBorder text-sm text-white focus:outline-none focus:border-tacticalCyan"
                />
                <div id="modal-name-err" className="error-msg">
                  <span aria-hidden="true">⚠ </span>Please enter your full name.
                </div>
              </div>

              <div>
                <label
                  htmlFor="modal-email"
                  className="block text-xs font-mono uppercase text-gray-300 mb-1"
                >
                  Work / Agency Email *
                </label>
                <span id="modal-email-hint" className="hint">
                  Format: you@organization.gov or you@company.com
                </span>
                <input
                  type="email"
                  id="modal-email"
                  name="email"
                  required
                  autoComplete="email"
                  aria-describedby="modal-email-hint"
                  aria-errormessage="modal-email-err"
                  placeholder="elena.vance@defense-systems.org"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-cardBorder text-sm text-white focus:outline-none focus:border-tacticalCyan"
                />
                <div id="modal-email-err" className="error-msg">
                  <span aria-hidden="true">⚠ </span>Please enter a valid work or
                  agency email address.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="modal-sector"
                    className="block text-xs font-mono uppercase text-gray-300 mb-1"
                  >
                    Target Sector *
                  </label>
                  <select
                    id="modal-sector"
                    name="sector"
                    required
                    defaultValue="Defense Contractors"
                    className="w-full px-3 py-2.5 rounded-lg bg-obsidian border border-cardBorder text-sm text-white focus:outline-none focus:border-tacticalCyan"
                  >
                    <option value="Defense Contractors">
                      Defense Contractors
                    </option>
                    <option value="Aerospace">Aerospace</option>
                    <option value="Semiconductor Labs">
                      Semiconductor Labs
                    </option>
                    <option value="Nuclear Utilities">Nuclear Utilities</option>
                    <option value="Critical Infrastructure">
                      Critical Infrastructure
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="modal-clearance"
                    className="block text-xs font-mono uppercase text-gray-300 mb-1"
                  >
                    Clearance Level *
                  </label>
                  <select
                    id="modal-clearance"
                    name="clearance"
                    required
                    defaultValue="ITAR / CMMC Level 3"
                    className="w-full px-3 py-2.5 rounded-lg bg-obsidian border border-cardBorder text-sm text-white focus:outline-none focus:border-tacticalCyan"
                  >
                    <option value="Unclassified Enclave">
                      Unclassified Enclave
                    </option>
                    <option value="ITAR / CMMC Level 3">
                      ITAR / CMMC Level 3
                    </option>
                    <option value="SECRET / SIPR">SECRET / SIPR</option>
                    <option value="TS/SCI SCIF">TS/SCI SCIF</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] font-mono text-gray-400">
                Tip: Click outside this modal or press <kbd>Esc</kbd> to
                light-dismiss at any time.
              </p>

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
                  Confirm {modalIntent}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </div>
  );
}
