import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "TrailVault™ Enterprise by Digital Trail Labs | Sovereign Air-Gapped AI & Visual Evidence Platform",
  description:
    "Engineered by Digital Trail Labs: Deploy zero-telemetry, air-gapped Hybrid RAG and Visual Bounding-Box Verification across RTX GPU Workstations, SCIF Server Racks, and CPU-Only FieldLite Laptops.",
  keywords: [
    "Digital Trail Labs",
    "TrailVault Enterprise",
    "TrailVault FieldLite",
    "Air-Gapped AI",
    "Zero Telemetry RAG",
    "On-Premise LLM Appliance",
    "ITAR Compliant AI",
    "CMMC Level 3",
    "DISA STIG",
    "Qdrant",
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
