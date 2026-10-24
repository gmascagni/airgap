import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AirVault (Air GAP) | Zero-Trust Air-Gapped Enterprise AI Appliance",
  description:
    "Deploy containerized, open-weight LLMs and layout-aware multi-modal RAG directly onto your on-premise hardware with zero external telemetry, zero licensing phone-homes, and cryptographic data isolation.",
  keywords: [
    "AirVault",
    "Air-Gapped AI",
    "Zero Telemetry RAG",
    "On-Premise LLM Appliance",
    "ITAR Compliant AI",
    "CMMC Level 3",
    "DISA STIG",
    "Docling",
    "Qdrant",
    "vLLM",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-obsidian text-gray-100 font-sans selection:bg-tacticalCyan/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
