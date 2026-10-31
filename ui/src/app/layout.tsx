import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrailVault™ Enterprise — Air-Gapped Intelligence Appliance",
  description:
    "Deterministic offline Hybrid RAG and visual bounding-box citation verification for defense and regulated enclaves. Zero external telemetry.",
  keywords: [
    "Digital Trail Labs",
    "TrailVault Enterprise",
    "TrailVault FieldLite",
    "Air-Gapped AI",
    "Deterministic RAG",
    "Hardware Appliance",
    "Zero Egress",
    "Attribute-Based Access Control",
    "Cryptographic Audit Ledger",
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
        <a href="#main-content" className="skip-link visually-hidden">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
