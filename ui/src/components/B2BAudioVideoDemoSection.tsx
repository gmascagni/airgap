"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  FileText,
  Search,
  Layers,
  UploadCloud,
  Volume2,
  VolumeX,
  Mic,
} from "lucide-react";

export interface DroppedFileSpec {
  name: string;
  typeLabel: string;
  pages: number;
  size: string;
  color: string;
}

export interface DemoScene {
  index: number;
  title: string;
  timeRange: string;
  speakerName: string;
  speakerRole: string;
  audioFileName: string;
  voiceover: string;
  telemetryTag: string;
}

export interface DemoUseCaseReel {
  id: string;
  sectorBadge: string;
  shortTabLabel: string;
  title: string;
  subtitle: string;
  targetBuyer: string;
  fullMasterAudioFileName: string;
  totalPagesCount: number;
  totalPayloadSize: string;
  droppedFiles: DroppedFileSpec[];
  ocrScannerHeader: string;
  ocrTablePreview: string;
  ocrFootnotePreview: string;
  indexedChunksCount: string;
  indexedPartTagsCount: string;
  needleQueryText: string;
  topHitPageLabel: string;
  topHitScore: string;
  groundedAnswerPrimary: string;
  groundedCitationPrimary: string;
  groundedAnswerSecondary: string;
  groundedCitationSecondary: string;
  viewerDocName: string;
  viewerJumpBadge: string;
  viewerTableTitle: string;
  viewerHighlightRow: string;
  viewerHighlightValue: string;
  viewerFootnoteBbox: string;
  viewerFootnoteDetail: string;
  scenes: DemoScene[];
}

export const B2B_USE_CASE_REELS: DemoUseCaseReel[] = [
  {
    id: "reel-needle",
    sectorBadge: "USE CASE 01 // AEROSPACE & DEFENSE MRO",
    shortTabLabel: "1. Aerospace MRO (Page 1,184 Needle)",
    title: "The Needle in the 1,420-Page Haystack",
    subtitle:
      "Multi-Format Drag & Drop ➔ Docling GPU OCR ➔ Pinpoint Page 1,184 Footnote & CAD Bounding-Box Lock",
    targetBuyer: "VP of Engineering • Chief Maintenance Officer • R&D Directors",
    fullMasterAudioFileName: "reel-needle-full.mp3",
    totalPagesCount: 1536,
    totalPayloadSize: "2.33 GB",
    droppedFiles: [
      {
        name: "Turbine_Master_Overhaul_Manual_1420p.pdf",
        typeLabel: "SCANNED PDF (1989 MICROFILM)",
        pages: 1420,
        size: "1.84 GB",
        color: "text-tacticalCyan",
      },
      {
        name: "DWG-99401_Cryo_Labyrinth_Seal_RevH.tiff",
        typeLabel: "CAD SCHEMATIC BLUEPRINT",
        pages: 14,
        size: "412 MB",
        color: "text-warningAmber",
      },
      {
        name: "MIL-STD-810H_Thermal_Shock_Tables.xlsx.pdf",
        typeLabel: "DENSE MULTI-COLUMN TABLES",
        pages: 94,
        size: "68 MB",
        color: "text-zeroTrustEmerald",
      },
      {
        name: "ECO-2026-089_Seal_Supersession_Notice.docx.pdf",
        typeLabel: "ENGINEERING CHANGE ORDER",
        pages: 8,
        size: "14 MB",
        color: "text-purple-400",
      },
    ],
    ocrScannerHeader:
      "[HEADER H1] CHAPTER 19: HIGH-PRESSURE TURBOPUMP OVERHAUL ➔ [H2] 19.8 CRYOGENIC LABYRINTH SEALS",
    ocrTablePreview:
      "| Stage-3 Labyrinth | -196°C Cryo Shock | Max Axial Play: 0.018 mm (See Footnote 17) |",
    ocrFootnotePreview:
      "[FOOTNOTE 17 + CAD CALLOUT LINK] Mandate superseding shim washer P/N NAS1149-F0832P per DWG-99401 Rev H.",
    indexedChunksCount: "4,544 Chunks",
    indexedPartTagsCount: "18,920 Part Tags",
    needleQueryText:
      "What is the maximum allowable axial play tolerance for the Stage-3 labyrinth seal under -196°C cryogenic thermal shock, and what superseding MIL-SPEC part number is mandated by Footnote 17?",
    topHitPageLabel: "#1 Hit: Page 1,184 (Score: 0.994)",
    topHitScore: "0.994",
    groundedAnswerPrimary:
      "Under -196°C cryogenic thermal shock, the Stage-3 labyrinth seal maximum allowable axial play is 0.018 mm (±0.002 mm)",
    groundedCitationPrimary: "[Turbine_Manual_1420p.pdf, Page 1184]",
    groundedAnswerSecondary:
      "Per Footnote 17 and linked CAD revision, standard washer MS90725 is superseded by high-nickel shim P/N NAS1149-F0832P.",
    groundedCitationSecondary: "[DWG-99401_Cryo_Seal.tiff, Page 1]",
    viewerDocName: "Turbine_Master_Overhaul_Manual_1420p.pdf",
    viewerJumpBadge: "JUMPED TO PAGE 1,184 OF 1,420",
    viewerTableTitle:
      "TABLE 19-14: CRYOGENIC TURBOPUMP SEAL CLEARANCES (REV 1989)",
    viewerHighlightRow: "ROW 14: STAGE-3 LABYRINTH SEAL (-196°C)",
    viewerHighlightValue: "MAX AXIAL PLAY: 0.018 mm¹⁷",
    viewerFootnoteBbox: "FOOTNOTE 17 (BBOX [42.0, 510.4, 568.0, 712.0]):",
    viewerFootnoteDetail:
      "For liquid nitrogen/oxygen service below -180°C, replace baseline spacer with cryo-stabilized shim P/N NAS1149-F0832P (Ref: ECO-2026-089).",
    scenes: [
      {
        index: 0,
        title: "1. Multi-Format Drag & Drop",
        timeRange: "Scene 1 of 4",
        speakerName: "Andrew (Lead Solutions Architect)",
        speakerRole: "Neural Studio Voice • Warm Conversational",
        audioFileName: "reel-needle-scene-0.mp3",
        voiceover:
          "“Here's what happens on day one inside your facility. An engineer simply drags and drops four completely different document types straight into AirVault... a 1,420-page scanned 1989 turbine overhaul manual, a high-res CAD blueprint, a dense MIL-SPEC spreadsheet, and a brand-new engineering change order. Over two gigabytes of legacy data... staged locally with zero internet connection.”",
        telemetryTag:
          "INGEST PAYLOAD: 2.33 GB (4 MULTI-MODAL FILES) • WAN EGRESS: 0.00 B/s",
      },
      {
        index: 1,
        title: "2. Docling + Surya GPU OCR Load",
        timeRange: "Scene 2 of 4",
        speakerName: "Andrew (Lead Solutions Architect)",
        speakerRole: "Neural Studio Voice • Warm Conversational",
        audioFileName: "reel-needle-scene-1.mp3",
        voiceover:
          "“Immediately, our local NVIDIA Blackwell GPUs spin up IBM Docling and Surya OCR. Instead of chopping pages into blind text blocks, it visually reconstructs skewed 9-column tables into clean Markdown, links schematic callout bubbles, preserves every chapter and procedure header, and indexes over 4,500 chunks into both Qdrant vector search and OpenSearch BM25.”",
        telemetryTag:
          "DOCLING TABLEFORMER: ACCURATE MODE • 4,544 CHUNKS INDEXED (QDRANT + BM25)",
      },
      {
        index: 2,
        title: "3. Deep Page-1,184 Needle Query",
        timeRange: "Scene 3 of 4",
        speakerName: "Dr. Ava Vance (Chief Propulsion Engineer)",
        speakerRole: "Neural Studio Voice • Expressive Technical",
        audioFileName: "reel-needle-scene-2.mp3",
        voiceover:
          "“Now, let's test it with a real needle-in-a-haystack question: What is the maximum allowable axial play tolerance for the Stage-3 labyrinth seal under -196°C cryogenic shock... and what superseding part number is mandated by Footnote 17?”",
        telemetryTag:
          "HYBRID RRF (TOP-30 DENSE + TOP-30 BM25) ➔ BGE-RERANKER-LARGE: 34ms",
      },
      {
        index: 3,
        title: "4. Page 1,184 Jump & BBox Lock",
        timeRange: "Scene 4 of 4",
        speakerName: "Andrew (Lead Solutions Architect)",
        speakerRole: "Neural Studio Voice • Warm Conversational",
        audioFileName: "reel-needle-scene-3.mp3",
        voiceover:
          "“In 1.4 seconds, AirVault cross-encodes 60 candidates, locks onto Page 1,184 out of 1,420, and jumps the PDF viewer straight to Table 19-14. Right there in the amber bounding box is Footnote 17: 0.018 mm axial play, superseded by part number NAS1149-F0832P. Zero guessing. Zero hallucination.”",
        telemetryTag:
          "VERIFIED CITATION: [Turbine_Manual_1420p.pdf, Page 1184] • SCORE: 0.994",
      },
    ],
  },
  {
    id: "reel-abac",
    sectorBadge: "USE CASE 02 // DEFENSE CISO & SCIF ABAC",
    shortTabLabel: "2. Defense CISO (CAC Smartcard ABAC)",
    title: "The Zero-Trust Clearance Wall (CISO Pitch)",
    subtitle:
      "One Appliance, Two Smartcards, Same Prompt ➔ Live Active Directory / CAC ABAC Pre-Retrieval Redaction",
    targetBuyer: "CISO • Facility Security Officer (FSO) • Defense Compliance VP",
    fullMasterAudioFileName: "reel-abac-full.mp3",
    totalPagesCount: 1312,
    totalPayloadSize: "1.92 GB",
    droppedFiles: [
      {
        name: "Propulsion_Thermal_Signature_Spec_880p.pdf",
        typeLabel: "SECRET // ITAR // NOFORN",
        pages: 880,
        size: "1.40 GB",
        color: "text-warningAmber",
      },
      {
        name: "Subcontractor_Hull_Fastener_SOP_410p.pdf",
        typeLabel: "CUI // CONTRACTOR AUTHORIZED",
        pages: 410,
        size: "480 MB",
        color: "text-tacticalCyan",
      },
      {
        name: "AD_LDAP_Smartcard_Clearance_Matrix.json",
        typeLabel: "CAC / PIV X.509 ATTRIBUTE MAP",
        pages: 14,
        size: "24 MB",
        color: "text-zeroTrustEmerald",
      },
      {
        name: "NIST-800-171_Compartment_Rules.yaml",
        typeLabel: "OPA PRE-RETRIEVAL POLICY",
        pages: 8,
        size: "16 MB",
        color: "text-purple-400",
      },
    ],
    ocrScannerHeader:
      "[SECURITY BANNER DETECTED] SECRET // NOFORN // ITAR COMPARTMENT STAMPED ON 2,640 CHUNKS",
    ocrTablePreview:
      "| Chunk ID #9941 | Clearance: SECRET//ITAR | Access Group: PROPULSION-CORE |",
    ocrFootnotePreview:
      "[ABAC POLICY LOCK] Subcontractor CUI tokens mathematically blocked at Qdrant filter layer.",
    indexedChunksCount: "3,890 Chunks",
    indexedPartTagsCount: "100% ABAC Stamped",
    needleQueryText:
      "Both Operator A (Cleared SECRET//ITAR) and Operator B (Subcontractor CUI-Only) query: 'Provide the Stage-3 cryogenic seal thermal signature limits and part number.'",
    topHitPageLabel: "0 SECRET Chunks Leaked to Operator B",
    topHitScore: "1.000",
    groundedAnswerPrimary:
      "OPERATOR A (SECRET//ITAR): Full clearance verified. Stage-3 cryo seal limit is 0.018 mm",
    groundedCitationPrimary: "[Propulsion_Spec_880p.pdf, Page 612]",
    groundedAnswerSecondary:
      "OPERATOR B (SUBCONTRACTOR CUI): [REDACTED BY ABAC POLICY — 4 SECRET//ITAR chunks excluded prior to LLM context assembly].",
    groundedCitationSecondary: "[Contractor_SOP_410p.pdf, Page 44]",
    viewerDocName: "ABAC_Split_Screen_Audit_Log.pdf",
    viewerJumpBadge: "PRE-LLM VECTOR REDACTION VERIFIED",
    viewerTableTitle:
      "CMMC LEVEL 3 / NIST SP 800-171 ACCESS ENFORCEMENT TRACE",
    viewerHighlightRow: "OPERATOR A: GRANTED (PAGE 612) | OPERATOR B: BLOCKED",
    viewerHighlightValue: "0 BYTES LEAKED",
    viewerFootnoteBbox: "OPA / QDRANT PRE-FILTER (LATENCY: 2.1ms):",
    viewerFootnoteDetail:
      "Mandatory FieldCondition(key='security_classification', match=MatchAny(user.cac_clearances)) enforced prior to vector scoring.",
    scenes: [
      {
        index: 0,
        title: "1. Multi-Compartment Vault Load",
        timeRange: "Scene 1 of 4",
        speakerName: "Brian (Defense Security Director)",
        speakerRole: "Neural Studio Voice • Authoritative CISO",
        audioFileName: "reel-abac-scene-0.mp3",
        voiceover:
          "“When we talk to Defense CISOs, their number one concern isn't just keeping data off the cloud... it's preventing a lower-cleared subcontractor from asking the local AI a question that leaks classified specs. Watch how AirVault stamps every single document chunk with its exact security banner during ingestion.”",
        telemetryTag:
          "CHUNK METADATA STAMPING: [CUI] vs [SECRET//ITAR//NOFORN]",
      },
      {
        index: 1,
        title: "2. Dual CAC Smartcard Login",
        timeRange: "Scene 2 of 4",
        speakerName: "Dr. Ava Vance (Chief Propulsion Engineer)",
        speakerRole: "Neural Studio Voice • Expressive Technical",
        audioFileName: "reel-abac-scene-1.mp3",
        voiceover:
          "“Here, two engineers sit at the exact same appliance and insert their CAC smartcards. Operator A holds SECRET // ITAR clearance. Operator B is a Tier-2 subcontractor cleared only for CUI. Both type the exact same propulsion seal tolerance prompt.”",
        telemetryTag:
          "LDAPS / X.509 CAC SMARTCARD AUTHENTICATION • OPA POLICY ENGINE",
      },
      {
        index: 2,
        title: "3. Pre-Retrieval Vector Filtering",
        timeRange: "Scene 3 of 4",
        speakerName: "Brian (Defense Security Director)",
        speakerRole: "Neural Studio Voice • Authoritative CISO",
        audioFileName: "reel-abac-scene-2.mp3",
        voiceover:
          "“Before the local language model ever sees a single token, AirVault enforces Attribute-Based Access Control directly inside Qdrant and OpenSearch. Restricted SECRET chunks are mathematically blocked from even entering Operator B's retrieval pipeline.”",
        telemetryTag:
          "PRE-LLM VECTOR FILTER: 0 SECRET CHUNKS LEAKED TO SUBCONTRACTOR",
      },
      {
        index: 3,
        title: "4. Side-by-Side Grounded Output",
        timeRange: "Scene 4 of 4",
        speakerName: "Andrew (Lead Solutions Architect)",
        speakerRole: "Neural Studio Voice • Warm Conversational",
        audioFileName: "reel-abac-scene-3.mp3",
        voiceover:
          "“Look at the split screen result: the cleared Chief Engineer gets the full Page 1,184 cryogenic schematic and part number. Meanwhile, the subcontractor receives only CUI-authorized procedures and an explicit clearance boundary notice. Complete compartment isolation, verified for CMMC Level 3.”",
        telemetryTag: "CMMC LEVEL 3 & NIST 800-171 ACCESS CONTROL VERIFIED",
      },
    ],
  },
  {
    id: "reel-contradiction",
    sectorBadge: "USE CASE 03 // NUCLEAR & CRITICAL INFRASTRUCTURE",
    shortTabLabel: "3. Nuclear Plant (1989 vs 2026 ECO)",
    title: "The 35-Year Engineering Contradiction Catcher",
    subtitle:
      "Cross-Referencing a 1989 Scanned Blueprint (Page 1,184) Against a 2026 Engineering Change Order (Page 3)",
    targetBuyer:
      "Chief Engineer • Quality Assurance VP • Nuclear / Fab Plant Director",
    fullMasterAudioFileName: "reel-contradiction-full.mp3",
    totalPagesCount: 1244,
    totalPayloadSize: "1.65 GB",
    droppedFiles: [
      {
        name: "1989_Reactor_Coolant_Pump_Manual_1180p.pdf",
        typeLabel: "LEGACY 1989 BASELINE MANUAL",
        pages: 1180,
        size: "1.38 GB",
        color: "text-tacticalCyan",
      },
      {
        name: "Westinghouse_Primary_Loop_P&ID_Sheet42.tiff",
        typeLabel: "PLANT PIPING & INSTRUMENTATION",
        pages: 42,
        size: "210 MB",
        color: "text-warningAmber",
      },
      {
        name: "NRC_Bulletin_2026-04_Boric_Acid.pdf",
        typeLabel: "REGULATORY SAFETY DIRECTIVE",
        pages: 14,
        size: "42 MB",
        color: "text-zeroTrustEmerald",
      },
      {
        name: "ECO-2026-089_Flange_Supersession.pdf",
        typeLabel: "2026 ENGINEERING CHANGE ORDER",
        pages: 8,
        size: "18 MB",
        color: "text-purple-400",
      },
    ],
    ocrScannerHeader:
      "[CROSS-EPOCH PART LINKER] PART NO. MS90725-114 DETECTED IN 1989 MANUAL (P. 1184) & 2026 ECO (P. 3)",
    ocrTablePreview:
      "| 1989 Baseline: P/N MS90725-114 (45 Nm) ➔ 2026 ECO Override: P/N NAS1149-F0832P (52 Nm) |",
    ocrFootnotePreview:
      "[REVISION CONFLICT ALERT] Obsolete 1989 fastener superseded by 2026 Metallurgical Directive.",
    indexedChunksCount: "3,980 Chunks",
    indexedPartTagsCount: "14,210 Cross-Links",
    needleQueryText:
      "Verify the primary coolant pump flange fastener part number and confirm whether the 1989 baseline manual specification has been modified by any 2026 Engineering Change Orders.",
    topHitPageLabel: "Dual Hit: P. 1,184 (1989) + P. 3 (2026 ECO)",
    topHitScore: "0.991",
    groundedAnswerPrimary:
      "REVISION ALERT: While the 1989 baseline manual specifies fastener MS90725-114 on Page 1,184",
    groundedCitationPrimary: "[1989_Coolant_Manual.pdf, Page 1184]",
    groundedAnswerSecondary:
      "Mandatory Engineering Change Order ECO-2026-089 supersedes MS90725-114 with Inconel stud assembly NAS1149-F0832P torqued to 52.0 Nm.",
    groundedCitationSecondary: "[ECO-2026-089_Notice.pdf, Page 3]",
    viewerDocName: "ECO-2026-089_Flange_Supersession.pdf",
    viewerJumpBadge: "REVISION OVERRIDE LINKED (1989 ➔ 2026)",
    viewerTableTitle:
      "ECO-2026-089 SECTION 2: MANDATORY FASTENER & SEAL SUPERSESSION",
    viewerHighlightRow: "OBSOLETE: MS90725-114 ➔ NEW: NAS1149-F0832P",
    viewerHighlightValue: "MANDATORY RETROFIT",
    viewerFootnoteBbox: "DUAL-DOCUMENT PROVENANCE LOCK:",
    viewerFootnoteDetail:
      "AirVault automatically surfaces both the 1989 baseline table (Page 1,184) and the 2026 ECO override (Page 3) so technicians never install a superseded part.",
    scenes: [
      {
        index: 0,
        title: "1. Legacy + Modern Archive Drop",
        timeRange: "Scene 1 of 4",
        speakerName: "Andrew (Lead Solutions Architect)",
        speakerRole: "Neural Studio Voice • Warm Conversational",
        audioFileName: "reel-contradiction-scene-0.mp3",
        voiceover:
          "“In aerospace and nuclear plants, your biggest liability is a 35-year-old manual that was quietly modified by an Engineering Change Order ten years later. When you drop both legacy archives and modern bulletins into AirVault, it connects them automatically.”",
        telemetryTag: "CROSS-EPOCH ARCHIVE: 1989 LEGACY PDF + 2026 ECO BULLETIN",
      },
      {
        index: 1,
        title: "2. Cross-Document Entity Linking",
        timeRange: "Scene 2 of 4",
        speakerName: "Dr. Ava Vance (Chief Propulsion Engineer)",
        speakerRole: "Neural Studio Voice • Expressive Technical",
        audioFileName: "reel-contradiction-scene-1.mp3",
        voiceover:
          "“During parsing, AirVault's metadata extractor pulls every MIL-SPEC, National Stock Number, and drawing tag... automatically linking part number MS90725 on Page 1,184 of the 1989 manual to this morning's Engineering Change Order, ECO-2026-089.”",
        telemetryTag:
          "LEXICAL BM25 EXACT PART LINKING: MS90725-114 ➔ NAS1149-F0832P",
      },
      {
        index: 2,
        title: "3. Revision Conflict Detection",
        timeRange: "Scene 3 of 4",
        speakerName: "Andrew (Lead Solutions Architect)",
        speakerRole: "Neural Studio Voice • Warm Conversational",
        audioFileName: "reel-contradiction-scene-2.mp3",
        voiceover:
          "“When a technician on the shop floor asks for the seal assembly spec, our Cross-Encoder Reranker surfaces both the original 1989 table and the 2026 change notice together in the Top-5 context window.”",
        telemetryTag:
          "MULTI-SOURCE SYNTHESIS: 2 VERIFIED DOCUMENTS IN TOP-5 CONTEXT",
      },
      {
        index: 3,
        title: "4. Dual-Citation Revision Alert",
        timeRange: "Scene 4 of 4",
        speakerName: "Brian (Defense Security Director)",
        speakerRole: "Neural Studio Voice • Authoritative CISO",
        audioFileName: "reel-contradiction-scene-3.mp3",
        voiceover:
          "“Instead of blindly repeating an obsolete spec, AirVault flags the revision conflict immediately... showing the baseline manual on Page 1,184 alongside the mandatory 2026 part replacement. Turning hours of manual cross-checking into a two-second safety check.”",
        telemetryTag: "PREVENTED ASSEMBLY DEFECT • DUAL BOUNDING-BOX PROOF",
      },
    ],
  },
  {
    id: "reel-semiconductor",
    sectorBadge: "USE CASE 04 // SEMICONDUCTOR FAB & EUV LITHOGRAPHY",
    shortTabLabel: "4. Semiconductor Fab (Page 1,892 EUV)",
    title: "Sub-2nm Cleanroom Tool Recovery & IP Vault",
    subtitle:
      "2,150-Page EUV Scanner Manual + Vacuum CAD ➔ Page 1,892 Mass-Flow Tolerance Lock in 1.2s",
    targetBuyer: "Fab Operations VP • Lithography Yield Director • Semiconductor CISO",
    fullMasterAudioFileName: "reel-semiconductor-full.mp3",
    totalPagesCount: 2282,
    totalPayloadSize: "3.45 GB",
    droppedFiles: [
      {
        name: "EUV_Scanner_Laser_Optics_Service_Manual_2150p.pdf",
        typeLabel: "EUV LITHOGRAPHY SERVICE MANUAL",
        pages: 2150,
        size: "2.80 GB",
        color: "text-tacticalCyan",
      },
      {
        name: "Wafer_Stage_Vacuum_Manifold_Rev12.dwg.pdf",
        typeLabel: "CLEANROOM CAD SCHEMATIC",
        pages: 28,
        size: "510 MB",
        color: "text-warningAmber",
      },
      {
        name: "Sub-2nm_Photoresist_Purge_Telemetry.xlsx.pdf",
        typeLabel: "MASS-FLOW CALIBRATION TABLES",
        pages: 88,
        size: "115 MB",
        color: "text-zeroTrustEmerald",
      },
      {
        name: "TSB-2026-114_Collector_Mirror_Purge.pdf",
        typeLabel: "FIELD SERVICE BULLETIN",
        pages: 16,
        size: "25 MB",
        color: "text-purple-400",
      },
    ],
    ocrScannerHeader:
      "[HEADER H1] SECTION 42: EUV COLLECTOR OPTICS ➔ [H2] 42.6 HYDROGEN PURGE MASS-FLOW CONTROLLERS",
    ocrTablePreview:
      "| Zone-4 Plasma Ignition | H2 Purge Flow: 42.5 sccm (±0.3 sccm) | Sensor Callout #19B |",
    ocrFootnotePreview:
      "[CAD CALLOUT #19B] Differential pressure transducer PT-409B across Tin (Sn) droplet catcher.",
    indexedChunksCount: "6,880 Chunks",
    indexedPartTagsCount: "24,100 Sensor Tags",
    needleQueryText:
      "During a Zone-4 laser plasma ignition fault, what is the exact hydrogen purge mass-flow controller tolerance, and which sensor callout monitors pressure drop across the Tin droplet catcher?",
    topHitPageLabel: "#1 Hit: Page 1,892 (Score: 0.996)",
    topHitScore: "0.996",
    groundedAnswerPrimary:
      "During Zone-4 laser plasma ignition, the hydrogen purge mass-flow controller must maintain 42.5 sccm ± 0.3 sccm",
    groundedCitationPrimary: "[EUV_Scanner_Manual_2150p.pdf, Page 1892]",
    groundedAnswerSecondary:
      "Per Vacuum Schematic Callout #19B, differential pressure drop across the Tin (Sn) droplet catcher is monitored by transducer PT-409B (trip threshold: >1.8 Pa).",
    groundedCitationSecondary: "[Wafer_Vacuum_Rev12.dwg.pdf, Page 19]",
    viewerDocName: "EUV_Scanner_Laser_Optics_Service_Manual_2150p.pdf",
    viewerJumpBadge: "JUMPED TO PAGE 1,892 OF 2,150",
    viewerTableTitle:
      "TABLE 42-B: EUV COLLECTOR MIRROR H2 PURGE & DROPLET CATCHER LIMITS",
    viewerHighlightRow: "ZONE-4 IGNITION PURGE: 42.5 sccm (±0.3 sccm)",
    viewerHighlightValue: "CALLOUT #19B (PT-409B)",
    viewerFootnoteBbox: "CLEANROOM IP PROTECTION (BBOX [58.0, 312.0, 554.0, 498.0]):",
    viewerFootnoteDetail:
      "Resolved in 1.2s inside the sub-2nm fab perimeter—preventing $150,000/hr tool downtime with zero external cloud exposure.",
    scenes: [
      {
        index: 0,
        title: "1. Cleanroom Vault Drag & Drop",
        timeRange: "Scene 1 of 4",
        speakerName: "Andrew (Lead Solutions Architect)",
        speakerRole: "Neural Studio Voice • Warm Conversational",
        audioFileName: "reel-semiconductor-scene-0.mp3",
        voiceover:
          "“Inside a sub-2nm semiconductor fab, every hour of lithography tool downtime costs over $150,000... and cloud AI is strictly banned to protect process IP. Here, a cleanroom engineer drops a 2,150-page EUV scanner manual, vacuum schematics, and purge telemetry logs straight into AirVault.”",
        telemetryTag:
          "CLEANROOM ENCLAVE INGEST: 3.45 GB (2,282 PAGES) • ZERO WAN EGRESS",
      },
      {
        index: 1,
        title: "2. Optical Table & DWG Parsing",
        timeRange: "Scene 2 of 4",
        speakerName: "Dr. Ava Vance (Chief Propulsion Engineer)",
        speakerRole: "Neural Studio Voice • Expressive Technical",
        audioFileName: "reel-semiconductor-scene-1.mp3",
        voiceover:
          "“AirVault's local GPU pipeline parses complex optical alignment tables, extracts DWG vacuum manifold callouts, and indexes every calibration curve locally inside the cleanroom perimeter with zero external network traffic.”",
        telemetryTag:
          "DOCLING + SURYA OCR: 6,880 CHUNKS & 24,100 SENSOR CALLOUTS INDEXED",
      },
      {
        index: 2,
        title: "3. Urgent Tool-Down Query",
        timeRange: "Scene 3 of 4",
        speakerName: "Brian (Defense Security Director)",
        speakerRole: "Neural Studio Voice • Authoritative CISO",
        audioFileName: "reel-semiconductor-scene-2.mp3",
        voiceover:
          "“During an urgent collector mirror fault, the engineer asks: What is the exact hydrogen purge mass-flow controller tolerance for Zone 4 during laser plasma ignition... and which sensor callout monitors pressure drop across the Tin droplet catcher?”",
        telemetryTag:
          "STAGE-2 BGE-RERANKER-LARGE LOCK: PAGE 1,892 OF 2,150 (31ms)",
      },
      {
        index: 3,
        title: "4. Page 1,892 Jump & Callout Lock",
        timeRange: "Scene 4 of 4",
        speakerName: "Andrew (Lead Solutions Architect)",
        speakerRole: "Neural Studio Voice • Warm Conversational",
        audioFileName: "reel-semiconductor-scene-3.mp3",
        voiceover:
          "“In 1.2 seconds, AirVault jumps to Page 1,892 out of 2,150, highlighting Table 42-B and Schematic Callout 19-B: 42.5 sccm ± 0.3. Restoring fab tool uptime in seconds while keeping billion-dollar lithography IP completely air-gapped.”",
        telemetryTag:
          "VERIFIED CITATION: [EUV_Scanner_Manual_2150p.pdf, Page 1892]",
      },
    ],
  },
  {
    id: "reel-pharma",
    sectorBadge: "USE CASE 05 // PHARMACEUTICAL GMP & BIODEFENSE",
    shortTabLabel: "5. Pharma GMP Audit (Page 2,741 BLA)",
    title: "3,400-Page FDA BLA Submission & Cold-Chain Audit",
    subtitle:
      "Biologics License Dossier + Lyophilizer SOPs ➔ Instant Page 2,741 Stability Footnote Proof",
    targetBuyer: "VP of Quality & Regulatory Affairs • GMP Plant Director • Biodefense Lead",
    fullMasterAudioFileName: "reel-pharma-full.mp3",
    totalPagesCount: 4364,
    totalPayloadSize: "4.10 GB",
    droppedFiles: [
      {
        name: "BLA_Biologics_License_Submission_3400p.pdf",
        typeLabel: "FDA / EMA REGULATORY DOSSIER",
        pages: 3400,
        size: "3.15 GB",
        color: "text-tacticalCyan",
      },
      {
        name: "Lyophilizer_Chamber_Validation_SOP_920p.pdf",
        typeLabel: "GMP VALIDATION PROTOCOL",
        pages: 920,
        size: "790 MB",
        color: "text-zeroTrustEmerald",
      },
      {
        name: "Chromatography_Skid_P&ID_Diagram.tiff",
        typeLabel: "BIOREACTOR PIPING SCHEMATIC",
        pages: 22,
        size: "125 MB",
        color: "text-warningAmber",
      },
      {
        name: "CAPA-2026-019_Cold_Chain_Excursion.pdf",
        typeLabel: "21 CFR PART 11 DEVIATION LOG",
        pages: 22,
        size: "35 MB",
        color: "text-purple-400",
      },
    ],
    ocrScannerHeader:
      "[HEADER H1] MODULE 3.2.P.8: DRUG PRODUCT STABILITY ➔ [H2] TABLE 88-C THERMAL EXCURSION LIMITS",
    ocrTablePreview:
      "| Lot #BIO-9941 | -70°C Ultra-Low Transfer | Validated Hold Window: ≤ 18.0 mins (Footnote 9) |",
    ocrFootnotePreview:
      "[FOOTNOTE 9 + 21 CFR PART 11 SIGN-OFF] Endotoxin & potency assay verified unchanged up to 18.0 mins.",
    indexedChunksCount: "11,240 Chunks",
    indexedPartTagsCount: "31,500 Lot/Assay Tags",
    needleQueryText:
      "What is the maximum validated hold-time window for Lot #BIO-9941 during a -70°C ultra-low freezer transfer, and which stability table footnote authorizes batch release?",
    topHitPageLabel: "#1 Hit: Page 2,741 (Score: 0.995)",
    topHitScore: "0.995",
    groundedAnswerPrimary:
      "For Biologics Lot #BIO-9941, the maximum validated hold-time window during a -70°C (±2.5°C) freezer transfer is 18.0 minutes",
    groundedCitationPrimary: "[BLA_Submission_3400p.pdf, Page 2741]",
    groundedAnswerSecondary:
      "Per Table 88-C Footnote 9 and CAPA-2026-019, excursions under 18.0 minutes preserve 99.8% monomer purity and authorize immediate QA batch release.",
    groundedCitationSecondary: "[CAPA-2026-019_Log.pdf, Page 7]",
    viewerDocName: "BLA_Biologics_License_Submission_3400p.pdf",
    viewerJumpBadge: "JUMPED TO PAGE 2,741 OF 3,400",
    viewerTableTitle:
      "TABLE 88-C: VALIDATED CRYOGENIC HOLD-TIME & POTENCY ASSAY LIMITS",
    viewerHighlightRow: "LOT #BIO-9941 (-70°C ± 2.5°C): MAX HOLD ≤ 18.0 MINS⁹",
    viewerHighlightValue: "QA RELEASE AUTHORIZED",
    viewerFootnoteBbox: "FOOTNOTE 9 (BBOX [48.0, 540.0, 562.0, 728.0]):",
    viewerFootnoteDetail:
      "21 CFR Part 11 Verified: Stability Protocol SP-4410 confirms zero aggregation or potency loss within the 18.0-minute transfer window.",
    scenes: [
      {
        index: 0,
        title: "1. 3,400-Page BLA Dossier Drop",
        timeRange: "Scene 1 of 4",
        speakerName: "Dr. Ava Vance (Chief Propulsion Engineer)",
        speakerRole: "Neural Studio Voice • Expressive Technical",
        audioFileName: "reel-pharma-scene-0.mp3",
        voiceover:
          "“In biodefense and pharmaceutical manufacturing, regulatory auditors can demand proof from a 3,400-page Biologics License submission at a moment's notice. Watch our quality team drag and drop batch records, lyophilizer validation SOPs, and cold-chain deviation logs into AirVault.”",
        telemetryTag:
          "GMP AUDIT VAULT: 4,364 PAGES (4.10 GB) • 21 CFR PART 11 COMPLIANT",
      },
      {
        index: 1,
        title: "2. Assay Table & Lot OCR Load",
        timeRange: "Scene 2 of 4",
        speakerName: "Andrew (Lead Solutions Architect)",
        speakerRole: "Neural Studio Voice • Warm Conversational",
        audioFileName: "reel-pharma-scene-1.mp3",
        voiceover:
          "“Docling and Surya OCR extract multi-page stability assay tables, preserve 21 CFR Part 11 audit trails, and index every lot number, temperature excursion table, and quality sign-off block.”",
        telemetryTag:
          "11,240 CHUNKS & 31,500 LOT/ASSAY TAGS INDEXED IN QDRANT + BM25",
      },
      {
        index: 2,
        title: "3. Live Inspector Audit Query",
        timeRange: "Scene 3 of 4",
        speakerName: "Dr. Ava Vance (Chief Propulsion Engineer)",
        speakerRole: "Neural Studio Voice • Expressive Technical",
        audioFileName: "reel-pharma-scene-2.mp3",
        voiceover:
          "“The inspector asks for immediate verification: What is the maximum validated hold-time window for Lot BIO-9941 during a -70°C freezer transfer... and where is the stability footnote authorizing release?”",
        telemetryTag:
          "HYBRID RRF + CROSS-ENCODER RERANK: PAGE 2,741 OF 3,400 (36ms)",
      },
      {
        index: 3,
        title: "4. Page 2,741 Jump & Footnote 9 Lock",
        timeRange: "Scene 4 of 4",
        speakerName: "Brian (Defense Security Director)",
        speakerRole: "Neural Studio Voice • Authoritative CISO",
        audioFileName: "reel-pharma-scene-3.mp3",
        voiceover:
          "“AirVault pinpoints Page 2,741 out of 3,400 in under two seconds... highlighting Table 88-C, Footnote 9: confirming the 18-minute hold window at -70°C ± 2.5°C. Instant, citation-locked audit readiness.”",
        telemetryTag:
          "VERIFIED CITATION: [BLA_Submission_3400p.pdf, Page 2741] • SCORE: 0.995",
      },
    ],
  },
];

interface B2BAudioVideoDemoSectionProps {
  audioBasePath?: string;
}

export default function B2BAudioVideoDemoSection({
  audioBasePath = "./audio",
}: B2BAudioVideoDemoSectionProps) {
  const [selectedReelIdx, setSelectedReelIdx] = useState<number>(0);
  const currentReel = B2B_USE_CASE_REELS[selectedReelIdx];

  const [activeScene, setActiveScene] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [sceneProgressPct, setSceneProgressPct] = useState<number>(0);
  const [audioDurationSec, setAudioDurationSec] = useState<number>(14);
  const [audioCurrentSec, setAudioCurrentSec] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSceneObj = currentReel.scenes[activeScene];
  const resolvedSceneAudioUrl = `${audioBasePath}/${currentSceneObj.audioFileName}`;

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    audioEl.src = resolvedSceneAudioUrl;
    audioEl.muted = isMuted;

    if (isPlaying) {
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          setIsPlaying(false);
        });
      }
    } else {
      audioEl.pause();
    }
  }, [selectedReelIdx, activeScene, isPlaying, resolvedSceneAudioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // modern-web-guidance: lazy-load-video-and-audio IntersectionObserver fallback
  useEffect(() => {
    if (!Object.hasOwn(HTMLMediaElement.prototype, "loading")) {
      const lazyMedia = document.querySelectorAll<HTMLMediaElement>(
        'audio[loading="lazy"][controls]'
      );
      if (lazyMedia.length === 0) return;

      const observer = new IntersectionObserver(
        (entries, obs) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const media = entry.target as HTMLMediaElement;
            if (media.dataset.preload) {
              media.preload = media.dataset.preload as
                | ""
                | "none"
                | "metadata"
                | "auto";
            }
            obs.unobserve(media);
          }
        },
        { rootMargin: "200px 0px" }
      );

      for (const media of Array.from(lazyMedia)) {
        if (media.preload && media.preload !== "none") {
          media.dataset.preload = media.preload;
        }
        media.preload = "none";
        observer.observe(media);
      }

      return () => observer.disconnect();
    }
  }, [selectedReelIdx]);

  const handleSelectScene = (sceneIdx: number) => {
    setActiveScene(sceneIdx);
    setSceneProgressPct(0);
    setAudioCurrentSec(0);
    setIsPlaying(true);
  };

  const handleSelectReel = (reelIdx: number) => {
    setSelectedReelIdx(reelIdx);
    setActiveScene(0);
    setSceneProgressPct(0);
    setAudioCurrentSec(0);
    setIsPlaying(true);
  };

  const handleStartWithAudio = () => {
    setIsMuted(false);
    setIsPlaying(true);
  };

  return (
    <div className="w-full">
      {/* Synchronized Studio Voiceover Audio Element */}
      <audio
        ref={audioRef}
        preload="auto"
        onLoadedMetadata={(e) => {
          const dur = e.currentTarget.duration;
          if (dur && isFinite(dur)) setAudioDurationSec(Math.round(dur));
        }}
        onTimeUpdate={(e) => {
          const cur = e.currentTarget.currentTime;
          const dur = e.currentTarget.duration || 14;
          setAudioCurrentSec(Math.floor(cur));
          setSceneProgressPct(Math.min(100, Math.round((cur / dur) * 100)));
        }}
        onEnded={() => {
          setSceneProgressPct(0);
          setActiveScene((prev) => (prev + 1) % 4);
        }}
      />

      {/* 5 B2B Industry Use-Case Selector Tabs */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <span className="font-mono text-xs uppercase tracking-wider text-tacticalCyan font-bold flex items-center gap-2">
            <Volume2 className="w-4 h-4" /> SELECT AN INDUSTRY B2B USE CASE
            (AUTO-NARRATED WITH STUDIO AUDIO):
          </span>
          <span className="font-mono text-xs text-zeroTrustEmerald">
            ● 5 ENTERPRISE SECTORS • 3 HUMAN NEURAL VOICES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {B2B_USE_CASE_REELS.map((reel, idx) => {
            const selected = selectedReelIdx === idx;
            return (
              <button
                key={reel.id}
                type="button"
                onClick={() => handleSelectReel(idx)}
                className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  selected
                    ? "bg-cardSurface border-tacticalCyan shadow-[0_0_25px_rgba(6,182,212,0.28)] ring-1 ring-tacticalCyan"
                    : "bg-slateDeep/80 border-cardBorder hover:border-gray-500"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                    <span
                      className={
                        selected
                          ? "text-tacticalCyan font-bold"
                          : "text-gray-400"
                      }
                    >
                      {selected ? "🔊 PLAYING" : `USE CASE 0${idx + 1}`}
                    </span>
                    <span className="text-zeroTrustEmerald">
                      {reel.totalPagesCount.toLocaleString()} PG
                    </span>
                  </div>
                  <div className="font-bold text-white text-xs sm:text-sm leading-snug">
                    {reel.shortTabLabel}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-cardBorder/60 font-mono text-[10px] text-gray-400 truncate">
                  {reel.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Cinema Viewport Frame */}
      <div className="rounded-3xl bg-slateDeep border-2 border-cardBorder shadow-[0_30px_90px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Top Video Player Chrome & Audio Transport Controls */}
        <div className="px-5 py-3.5 bg-obsidian border-b border-cardBorder flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-lg bg-tacticalCyan hover:bg-cyan-400 text-obsidian font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" /> PAUSE VOICEOVER & DEMO
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> PLAY DEMO WITH VOICEOVER
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`px-3 py-2 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-all ${
                isMuted
                  ? "bg-rose-500/20 border-rose-500 text-rose-300"
                  : "bg-cardSurface border-cardBorder text-zeroTrustEmerald hover:border-zeroTrustEmerald"
              }`}
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4" /> MUTED
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" /> AUDIO ON
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScene(0);
                setSceneProgressPct(0);
                setAudioCurrentSec(0);
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                }
                setIsPlaying(true);
              }}
              className="p-2 rounded-lg bg-cardSurface border border-cardBorder text-gray-300 hover:text-white"
              title="Restart Reel"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <span className="font-mono text-xs text-gray-300">
              Scene Audio: 00:{String(audioCurrentSec).padStart(2, "0")} / 00:
              {String(audioDurationSec).padStart(2, "0")}
            </span>
          </div>

          <div className="font-mono text-xs text-zeroTrustEmerald flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zeroTrustEmerald animate-ping" />
            <span>{currentSceneObj.telemetryTag}</span>
          </div>
        </div>

        {/* Active Use Case Banner */}
        <div className="px-5 py-2.5 bg-cardSurface/60 border-b border-cardBorder flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div>
            <span className="text-tacticalCyan font-bold">
              {currentReel.sectorBadge}:
            </span>{" "}
            <span className="text-white font-semibold">
              {currentReel.title}
            </span>
          </div>
          <div className="text-gray-400">
            Target Buyer:{" "}
            <span className="text-zeroTrustEmerald">
              {currentReel.targetBuyer}
            </span>
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

        {/* Animated Stage Canvas */}
        <div className="p-6 sm:p-8 min-h-[480px] bg-gradient-to-b from-obsidian/90 to-slateDeep flex flex-col justify-between relative">
          {/* Prominent Click-to-Start Banner when Paused */}
          {!isPlaying && (
            <div className="mb-4 p-4 rounded-2xl bg-tacticalCyan/15 border border-tacticalCyan flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Volume2 className="w-6 h-6 text-tacticalCyan animate-pulse flex-shrink-0" />
                <div>
                  <div className="font-bold text-sm text-white">
                    Human Studio Voiceover Ready ({currentSceneObj.speakerName})
                  </div>
                  <div className="text-xs text-gray-300">
                    Click play to hear realistic multi-speaker narration walk
                    through <span className="text-white font-semibold">{currentReel.title}</span>.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleStartWithAudio}
                className="px-5 py-2.5 rounded-xl bg-tacticalCyan hover:bg-cyan-400 text-obsidian font-mono font-bold text-xs uppercase tracking-wider whitespace-nowrap shadow-[0_0_25px_rgba(6,182,212,0.5)]"
              >
                🔊 Start Demo with Voiceover
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* SCENE 0: MULTI-FORMAT DRAG & DROP */}
            {activeScene === 0 && (
              <motion.div
                key={`${currentReel.id}-scene-0`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto"
              >
                <div className="lg:col-span-5 space-y-3">
                  <div className="font-mono text-xs uppercase text-tacticalCyan mb-2 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4" /> STEP 1: DRAG & DROP
                    MULTI-FORMAT ARCHIVE BUNDLE
                  </div>
                  {currentReel.droppedFiles.map((file, idx) => (
                    <motion.div
                      key={file.name}
                      initial={{ x: -25, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.12 }}
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
                      Ingesting 4 multi-format documents (
                      {currentReel.totalPagesCount.toLocaleString()} total pages
                      • {currentReel.totalPayloadSize}) over isolated loopback{" "}
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
                key={`${currentReel.id}-scene-1`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto"
              >
                <div className="lg:col-span-6 p-5 rounded-2xl bg-obsidian border border-cardBorder space-y-4">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-warningAmber font-bold flex items-center gap-1.5">
                      <Layers className="w-4 h-4" /> DOCLING + SURYA OCR GPU
                      SCANNER
                    </span>
                    <span className="text-tacticalCyan">
                      {currentReel.totalPagesCount.toLocaleString()} PAGES PARSED
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slateDeep border border-cardBorder space-y-3 relative overflow-hidden">
                    <div className="p-2 rounded border border-tacticalCyan/60 bg-tacticalCyan/10 font-mono text-[10px] text-cyan-200">
                      {currentReel.ocrScannerHeader}
                    </div>
                    <div className="p-2.5 rounded border border-zeroTrustEmerald/70 bg-zeroTrustEmerald/10 font-mono text-[10px] text-emerald-200">
                      <div className="font-bold mb-1">
                        [TABLEFORMER.ACCURATE] MARKDOWN RECONSTRUCTION:
                      </div>
                      <div>{currentReel.ocrTablePreview}</div>
                    </div>
                    <div className="p-2.5 rounded border border-warningAmber/80 bg-warningAmber/15 font-mono text-[10px] text-amber-200">
                      {currentReel.ocrFootnotePreview}
                    </div>
                  </div>
                </div>

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
                          {currentReel.indexedChunksCount}
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
                          {currentReel.indexedPartTagsCount}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Exact MIL-SPEC / Lot / Tag Index
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slateDeep/70 border border-cardBorder font-mono text-[11px] text-gray-300">
                      Every chunk stamped with:{" "}
                      <code className="text-tacticalCyan">source_file</code>,{" "}
                      <code className="text-tacticalCyan">page_number</code>,{" "}
                      <code className="text-warningAmber">
                        bounding_box [x0,y0,x1,y1]
                      </code>
                      , and{" "}
                      <code className="text-zeroTrustEmerald">
                        security_classification
                      </code>
                      .
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SCENE 2: DEEP NEEDLE QUERY & CROSS-ENCODER RERANKING */}
            {activeScene === 2 && (
              <motion.div
                key={`${currentReel.id}-scene-2`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto w-full space-y-5 my-auto"
              >
                <div className="p-5 rounded-2xl bg-obsidian border-2 border-tacticalCyan shadow-[0_0_35px_rgba(6,182,212,0.2)]">
                  <div className="font-mono text-xs text-tacticalCyan uppercase mb-2 flex items-center gap-2">
                    <Search className="w-4 h-4" /> NEEDLE-IN-A-HAYSTACK QUERY
                    (ACROSS {currentReel.totalPagesCount.toLocaleString()} PAGES)
                  </div>
                  <p className="font-mono text-sm sm:text-base text-white">
                    &ldquo;{currentReel.needleQueryText}&rdquo;
                  </p>
                </div>

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
                      {currentReel.topHitPageLabel}
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

            {/* SCENE 3: PINPOINT CITATION & BOUNDING-BOX ZOOM */}
            {activeScene === 3 && (
              <motion.div
                key={`${currentReel.id}-scene-3`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto"
              >
                <div className="lg:col-span-6 p-5 rounded-2xl bg-obsidian border border-zeroTrustEmerald/60 space-y-3">
                  <div className="font-mono text-xs text-zeroTrustEmerald uppercase font-bold flex items-center justify-between">
                    <span>✓ VERIFIED GROUNDED SYNTHESIS</span>
                    <span>RERANK SCORE: {currentReel.topHitScore}</span>
                  </div>
                  <p className="text-sm text-gray-100 leading-relaxed">
                    {currentReel.groundedAnswerPrimary}{" "}
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-tacticalCyan text-obsidian font-mono text-xs font-bold mx-1">
                      {currentReel.groundedCitationPrimary}
                    </span>
                    .
                  </p>
                  <p className="text-sm text-gray-100 leading-relaxed">
                    {currentReel.groundedAnswerSecondary}{" "}
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-warningAmber/20 text-warningAmber border border-warningAmber font-mono text-xs font-bold mx-1">
                      {currentReel.groundedCitationSecondary}
                    </span>
                  </p>
                </div>

                <div className="lg:col-span-6 p-5 rounded-2xl bg-[#080C14] border-2 border-warningAmber relative shadow-[0_0_40px_rgba(245,158,11,0.25)]">
                  <div className="flex items-center justify-between font-mono text-[11px] text-gray-400 border-b border-cardBorder pb-2 mb-3">
                    <span className="text-white font-bold truncate">
                      {currentReel.viewerDocName}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-warningAmber text-obsidian font-bold flex-shrink-0">
                      {currentReel.viewerJumpBadge}
                    </span>
                  </div>

                  <div className="font-mono text-[11px] text-gray-400 mb-2">
                    {currentReel.viewerTableTitle}
                  </div>

                  <div className="p-3.5 rounded-xl border-2 border-warningAmber bg-warningAmber/15 space-y-2">
                    <div className="flex justify-between font-mono text-xs text-white font-bold gap-2">
                      <span>{currentReel.viewerHighlightRow}</span>
                      <span className="text-warningAmber">
                        {currentReel.viewerHighlightValue}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-warningAmber/40 font-mono text-xs text-amber-200">
                      <strong>{currentReel.viewerFootnoteBbox}</strong>{" "}
                      {currentReel.viewerFootnoteDetail}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Voiceover / Speaker Equalizer & Subtitle Track Bar */}
          <div className="mt-6 p-4 rounded-2xl bg-obsidian/95 border border-cardBorder space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-zeroTrustEmerald/20 text-zeroTrustEmerald border border-zeroTrustEmerald/40 font-mono text-[10px] font-bold uppercase flex items-center gap-1.5">
                  <Mic className="w-3 h-3" /> {currentSceneObj.speakerName}
                </span>
                <span className="font-mono text-[10px] text-gray-400">
                  {currentSceneObj.speakerRole}
                </span>
              </div>

              {/* Animated Audio Waveform Indicator */}
              <div className="flex items-center gap-1 h-4">
                {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8, 0.3, 0.7].map((bar, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all ${
                      isPlaying && !isMuted
                        ? "bg-tacticalCyan animate-pulse"
                        : "bg-gray-600"
                    }`}
                    style={{
                      height: isPlaying && !isMuted ? `${bar * 16}px` : "4px",
                    }}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-200 italic leading-relaxed">
              {currentSceneObj.voiceover}
            </p>
          </div>
        </div>
      </div>

      {/* Below-the-Fold Full Reel Master Audio Tracks (modern-web-guidance: lazy-load-video-and-audio) */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {B2B_USE_CASE_REELS.map((reel, idx) => (
          <figure
            key={reel.id}
            className="p-3.5 rounded-2xl bg-slateDeep/90 border border-cardBorder space-y-2"
          >
            <figcaption
              id={`audio-caption-${reel.id}`}
              className="font-mono text-[11px] font-bold text-white flex items-center justify-between"
            >
              <span>Use Case 0{idx + 1} Audio</span>
              <span className="text-[10px] text-tacticalCyan">MP3</span>
            </figcaption>
            <p className="text-[10px] text-gray-400 truncate">
              {reel.shortTabLabel}
            </p>
            <audio
              controls
              {...({ loading: "lazy" } as any)}
              preload="metadata"
              src={`${audioBasePath}/${reel.fullMasterAudioFileName}`}
              aria-labelledby={`audio-caption-${reel.id}`}
              className="w-full h-8"
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
