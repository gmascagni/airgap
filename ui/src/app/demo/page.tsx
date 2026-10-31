"use client";

import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import B2BAudioVideoDemoSection from "../../components/B2BAudioVideoDemoSection";
import LiveCustomerApplianceWorkbench from "../../components/LiveCustomerApplianceWorkbench";

export default function CustomerInteractiveDemoPage() {
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

      {/* Customer-Facing Header */}
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

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slateDeep border border-tacticalCyan/50 flex items-center justify-center p-1">
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
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base tracking-wider text-white">
                    TRAILVAULT™
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zeroTrustEmerald/15 text-zeroTrustEmerald border border-zeroTrustEmerald/40 font-mono text-[10px]">
                    INTERACTIVE DEMO & LIVE WORKBENCH
                  </span>
                </div>
                <div className="text-[11px] font-mono text-gray-400">
                  AIR GAP APPLIANCE // ZERO-TRUST ENTERPRISE AI
                </div>
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
            <a
              href="#b2b-video-player"
              className="hover:text-tacticalCyan transition-colors"
            >
              1. Narrated Industry Use Cases
            </a>
            <a
              href="#live-customer-workbench"
              className="hover:text-tacticalCyan transition-colors"
            >
              2. Live Appliance RAG Workbench
            </a>
            <a
              href="../appliances/"
              className="px-3 py-1 rounded-md bg-slateDeep border border-cardBorder hover:border-tacticalCyan font-mono text-xs text-tacticalCyan flex items-center gap-1.5"
            >
              <span>NVIDIA Volume Sizing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="outline-none">
      {/* SECTION 1: 5 NARRATED INDUSTRY USE CASES */}
      <section
        id="b2b-video-player"
        className="relative z-10 pt-10 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center max-w-4xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slateDeep border border-cardBorder mb-4">
            <span className="px-2 py-0.5 rounded bg-zeroTrustEmerald/20 text-zeroTrustEmerald font-mono text-xs font-semibold">
              [PART 1: NARRATED INDUSTRY WORKFLOWS]
            </span>
            <span className="font-mono text-xs text-gray-300">
              5 Enterprise Sectors • Studio Audio & Bounding-Box Verification
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            From Multi-Format Drag &amp; Drop to{" "}
            <span className="bg-gradient-to-r from-tacticalCyan via-cyan-300 to-zeroTrustEmerald bg-clip-text text-transparent">
              High-Page-Count Bounding-Box Lock
            </span>
          </h1>
          <p className="mt-4 text-gray-300 text-base sm:text-lg">
            Select any of the{" "}
            <span className="text-tacticalCyan font-semibold">
              5 enterprise B2B use cases
            </span>{" "}
            below and press{" "}
            <span className="text-white font-semibold">
              Start Demo With Studio Voiceover
            </span>{" "}
            to watch how TrailVault™ ingests multi-gigabyte archives, runs layout
            OCR, and pinpoints exact footnotes buried thousands of pages deep.
          </p>
        </div>

        <B2BAudioVideoDemoSection audioBasePath="../audio" />

        {/* SECTION 2: LIVE CUSTOMER HANDS-ON WORKBENCH */}
        <div
          id="live-customer-workbench"
          className="mt-20 pt-16 border-t border-cardBorder"
        >
          <div className="max-w-3xl mb-8">
            <div className="font-mono text-xs uppercase tracking-widest text-zeroTrustEmerald mb-2">
              // PART 2: LIVE HANDS-ON APPLIANCE WORKBENCH
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Live Multi-Format Document Ingestion &amp; Hybrid RAG Console
            </h2>
            <p className="mt-2 text-gray-300 text-sm sm:text-base">
              Ingest live customer documents (PDF, Word, Excel BOM, PowerPoint,
              CAD Blueprints, SCADA Logs), toggle CAC Smartcard ABAC clearances,
              and inspect real-time bounding-box citations.
            </p>
          </div>
          <LiveCustomerApplianceWorkbench />
        </div>
      </section>
      </main>
    </div>
  );
}
