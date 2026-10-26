"""
AirVault (AirGap) - Real Technical PDF Corpus Generator for Live Customer Demos
===============================================================================
Generates 5 multi-page engineering, defense, nuclear, semiconductor, and
pharmaceutical PDF manuals with authentic tables, vector schematics, MIL-SPEC
part numbers, security banners, and footnotes so the live on-PC AI appliance
can ingest, OCR/chunk, index into Qdrant + BM25, and render real PDF pages with
bounding-box highlights during a live customer demonstration.
"""

from __future__ import annotations

import shutil
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

ROOT_DIR = Path(__file__).resolve().parent.parent
SAMPLE_DOCS_DIR = ROOT_DIR / "sample_docs"
PUBLIC_DOCS_DIR = ROOT_DIR / "ui" / "public" / "sample_docs"


def draw_page_frame(
    c: canvas.Canvas,
    doc_title: str,
    doc_id: str,
    security_banner: str,
    page_num: int,
    total_pages: int,
    archive_page_ref: str = "",
) -> None:
    width, height = letter
    # Outer technical border
    c.setStrokeColor(colors.HexColor("#1E293B"))
    c.setLineWidth(1.5)
    c.rect(28, 28, width - 56, height - 56)

    # Top Security Classification Banner
    banner_color = (
        colors.HexColor("#991B1B")
        if "SECRET" in security_banner
        else colors.HexColor("#0F766E")
    )
    c.setFillColor(banner_color)
    c.rect(28, height - 52, width - 56, 24, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(
        width / 2,
        height - 43,
        f"SECURITY CLASSIFICATION: {security_banner} // ZERO-TELEMETRY AIRVAULT CORPUS",
    )

    # Subheader metadata bar
    c.setFillColor(colors.HexColor("#F1F5F9"))
    c.rect(28, height - 76, width - 56, 24, fill=1, stroke=1)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Courier-Bold", 8.5)
    c.drawString(38, height - 67, f"DOC ID: {doc_id} | {doc_title}")
    ref_str = (
        f"PAGE {page_num} OF {total_pages} ({archive_page_ref})"
        if archive_page_ref
        else f"PAGE {page_num} OF {total_pages}"
    )
    c.drawRightString(width - 38, height - 67, ref_str)

    # Bottom footer
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Courier", 8)
    c.drawString(
        38,
        36,
        f"DISTRIBUTION STATEMENT D: AUTHORIZED DOD & CONTRACTOR PERSONNEL ONLY ({security_banner})",
    )
    c.drawRightString(width - 38, 36, f"SHA-256 VERIFIED // { ref_str }")


def build_turbine_overhaul_manual(out_path: Path) -> None:
    c = canvas.Canvas(str(out_path), pagesize=letter)
    width, height = letter

    # ---------------- PAGE 1: TITLE BLOCK & SCOPE ----------------
    draw_page_frame(
        c,
        "TURBINE & HYDRAULIC MASTER OVERHAUL MANUAL",
        "TM-9-2840-412-24",
        "CUI // NOFORN // ITAR",
        1,
        4,
        "MASTER INDEX P. 001",
    )
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 16)
    c.drawString(48, height - 115, "CHAPTER 1: TURBOPUMP & HYDRAULIC ACTUATION OVERVIEW")
    c.setFont("Helvetica", 10.5)
    c.drawString(
        48,
        height - 140,
        "This technical manual specifies mandatory overhaul tolerances, MIL-SPEC fastener torque schedules,",
    )
    c.drawString(
        48,
        height - 156,
        "Stage-2 high-pressure relief valve schematic callouts, and Stage-3 cryogenic labyrinth seal clearances.",
    )

    c.setStrokeColor(colors.HexColor("#0284C7"))
    c.setFillColor(colors.HexColor("#F0F9FF"))
    c.rect(48, height - 280, width - 96, 100, fill=1, stroke=1)
    c.setFillColor(colors.HexColor("#0369A1"))
    c.setFont("Courier-Bold", 10)
    c.drawString(60, height - 202, "SUMMARY OF CRITICAL SECTIONS IN THIS VOLUME:")
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Courier", 9.5)
    c.drawString(
        60,
        height - 222,
        "- Page 2 (Archive P. 082): Section 4.2 Primary Hydraulic Manifold Torque Table (MS90725-114)",
    )
    c.drawString(
        60,
        height - 240,
        "- Page 3 (Archive P. 014): Figure 4-9 Stage-2 Relief Valve CAD Schematic (O-Ring AN6227-23)",
    )
    c.drawString(
        60,
        height - 258,
        "- Page 4 (Archive P. 1184): Table 19-14 Cryogenic Labyrinth Seal Clearances & Footnote 17",
    )
    c.showPage()

    # ---------------- PAGE 2: HYDRAULIC MANIFOLD TORQUE TABLE ----------------
    draw_page_frame(
        c,
        "TURBINE & HYDRAULIC MASTER OVERHAUL MANUAL",
        "TM-9-2840-412-24",
        "CUI // NOFORN // ITAR",
        2,
        4,
        "ARCHIVE P. 82",
    )
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 14)
    c.drawString(48, height - 110, "SECTION 4.2: HYDRAULIC MANIFOLD TORQUE & FASTENER SPECS")
    c.setFont("Helvetica", 10)
    c.drawString(
        48,
        height - 130,
        "Per Section 4.2 Torque & Fastener Specifications, the primary hydraulic manifold M12 flange bolts",
    )
    c.drawString(
        48,
        height - 145,
        "require MIL-SPEC fastener Part No. MS90725-114 torqued to 45.0 Nm +/- 1.5 Nm (33 lb-ft) using",
    )
    c.drawString(
        48,
        height - 160,
        "an 8-point cross-star sequence. Verify calibration of digital torque wrench prior to assembly.",
    )

    # Draw Table 4-3
    c.setFillColor(colors.HexColor("#E0F2FE"))
    c.setStrokeColor(colors.HexColor("#0284C7"))
    c.rect(48, height - 340, width - 96, 150, fill=1, stroke=1)
    c.setFillColor(colors.HexColor("#0369A1"))
    c.setFont("Courier-Bold", 10)
    c.drawString(60, height - 210, "TABLE 4-3: PRIMARY HYDRAULIC MANIFOLD FLANGE FASTENERS (ARCHIVE PAGE 82)")
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Courier", 9)
    c.drawString(60, height - 235, "| Assembly Location      | MIL-SPEC P/N   | Nominal Torque       | Sequence     |")
    c.drawString(60, height - 252, "|------------------------|----------------|----------------------|--------------|")
    c.drawString(60, height - 270, "| Primary Manifold M12   | MS90725-114    | 45.0 Nm +/- 1.5 Nm   | 8-Bolt Star  |")
    c.drawString(60, height - 288, "| Bypass Housing M8      | AN4-12A        | 19.5 Nm +/- 0.8 Nm   | 4-Bolt Cross |")
    c.drawString(60, height - 306, "| Return Flange M10      | NAS6204-18     | 31.0 Nm +/- 1.0 Nm   | 6-Bolt Star  |")
    c.showPage()

    # ---------------- PAGE 3: STAGE-2 RELIEF VALVE CAD SCHEMATIC ----------------
    draw_page_frame(
        c,
        "TURBINE & HYDRAULIC MASTER OVERHAUL MANUAL",
        "TM-9-2840-412-24",
        "CUI // NOFORN // ITAR",
        3,
        4,
        "DWG-88412-CAD P. 14",
    )
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 14)
    c.drawString(48, height - 110, "FIGURE 4-9: STAGE-2 HIGH-PRESSURE RELIEF VALVE CAD SECTION")
    c.setFont("Helvetica", 10)
    c.drawString(
        48,
        height - 130,
        "On the Stage-2 High-Pressure Relief Valve CAD assembly drawing (DWG-88412-CAD Rev C, Page 14),",
    )
    c.drawString(
        48,
        height - 145,
        "Callout #04 specifies fluorocarbon packing O-Ring AN6227-23 (NSN 5331-00-291-4402) rated for",
    )
    c.drawString(
        48,
        height - 160,
        "3,000 PSI continuous operating pressure. Callout #07 specifies Titanium Check Poppet P/N 19207-88412-07.",
    )

    # CAD Schematic Box
    c.setFillColor(colors.HexColor("#0F172A"))
    c.rect(48, height - 420, width - 96, 230, fill=1, stroke=1)
    c.setStrokeColor(colors.HexColor("#06B6D4"))
    c.setLineWidth(2)
    c.rect(110, height - 360, 380, 110, fill=0, stroke=1)
    c.setStrokeColor(colors.HexColor("#F59E0B"))
    c.circle(230, height - 305, 22, fill=0, stroke=1)
    c.setFillColor(colors.HexColor("#FDE68A"))
    c.setFont("Courier-Bold", 9.5)
    c.drawString(70, height - 220, "[CAD CALLOUT #04]: PACKING SEAL O-RING P/N AN6227-23 (NSN 5331-00-291-4402)")
    c.drawString(70, height - 238, "[CAD CALLOUT #07]: TITANIUM CHECK POPPET P/N 19207-88412-07 (TOL +/- 0.025mm)")
    c.drawString(70, height - 395, "PRESSURE RATING: 3,000 PSI CONTINUOUS // PROOF PRESSURE: 4,500 PSI")
    c.showPage()

    # ---------------- PAGE 4: ARCHIVE PAGE 1,184 CRYOGENIC SEAL & FOOTNOTE 17 ----------------
    draw_page_frame(
        c,
        "TURBINE & HYDRAULIC MASTER OVERHAUL MANUAL",
        "TM-9-2840-412-24",
        "CUI // NOFORN // ITAR",
        4,
        4,
        "ARCHIVE PAGE 1184",
    )
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 14)
    c.drawString(
        48,
        height - 110,
        "CHAPTER 19.8: CRYOGENIC TURBOPUMP LABYRINTH SEAL CLEARANCES (PAGE 1184)",
    )
    c.setFont("Helvetica", 10)
    c.drawString(
        48,
        height - 130,
        "Under -196 C cryogenic thermal shock testing per MIL-STD-810H Method 503.7, Stage-3 turbopump",
    )
    c.drawString(
        48,
        height - 145,
        "labyrinth seals must strictly maintain the axial play clearances specified in Table 19-14 below.",
    )

    # Table 19-14
    c.setFillColor(colors.HexColor("#FEF3C7"))
    c.setStrokeColor(colors.HexColor("#D97706"))
    c.setLineWidth(1.8)
    c.rect(48, height - 330, width - 96, 160, fill=1, stroke=1)
    c.setFillColor(colors.HexColor("#92400E"))
    c.setFont("Courier-Bold", 10)
    c.drawString(
        60,
        height - 195,
        "TABLE 19-14: CRYOGENIC TURBOPUMP SEAL CLEARANCES (ARCHIVE PAGE 1184)",
    )
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Courier", 9)
    c.drawString(
        60,
        height - 220,
        "| Seal Stage          | Thermal Regime        | Max Axial Play       | Backing Shim P/N   |",
    )
    c.drawString(
        60,
        height - 236,
        "|---------------------|-----------------------|----------------------|--------------------|",
    )
    c.drawString(
        60,
        height - 254,
        "| Stage-1 Ambient     | +20 C to +140 C       | 0.045 mm (+/-0.005)  | MS90725-109        |",
    )
    c.drawString(
        60,
        height - 272,
        "| Stage-2 Interstage  | -65 C Steady State    | 0.030 mm (+/-0.004)  | MS90725-112        |",
    )
    c.setFont("Courier-Bold", 9)
    c.drawString(
        60,
        height - 290,
        "| Stage-3 Labyrinth   | -196 C Cryo Shock     | 0.018 mm (+/-0.002)* | NAS1149-F0832P [17]|",
    )

    # Footnote 17 Box
    c.setFillColor(colors.HexColor("#FFFBEB"))
    c.setStrokeColor(colors.HexColor("#B45309"))
    c.rect(48, height - 455, width - 96, 105, fill=1, stroke=1)
    c.setFillColor(colors.HexColor("#92400E"))
    c.setFont("Courier-Bold", 9.5)
    c.drawString(
        60,
        height - 375,
        "FOOTNOTE 17 (MANDATORY CRYOGENIC SUPERSESSION - PAGE 1184):",
    )
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Courier", 9)
    c.drawString(
        60,
        height - 395,
        "Under -196 C cryogenic thermal shock, Stage-3 labyrinth seal maximum allowable axial play",
    )
    c.drawString(
        60,
        height - 412,
        "is strictly 0.018 mm (+/- 0.002 mm). Standard carbon-steel washer MS90725 is SUPERSEDED by",
    )
    c.drawString(
        60,
        height - 429,
        "cryo-stabilized high-nickel Inconel shim washer P/N NAS1149-F0832P per DWG-99401 Rev H.",
    )
    c.save()


def build_eco_2026_override(out_path: Path) -> None:
    c = canvas.Canvas(str(out_path), pagesize=letter)
    width, height = letter
    draw_page_frame(
        c,
        "2026 ENGINEERING CHANGE ORDER: FLANGE & SEAL SUPERSESSION",
        "ECO-2026-089",
        "CUI // NOFORN",
        1,
        1,
        "ECO PAGE 3 REF",
    )
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 15)
    c.drawString(
        48,
        height - 110,
        "ENGINEERING CHANGE ORDER ECO-2026-089 (EFFECTIVE MARCH 2026)",
    )
    c.setFont("Helvetica", 10)
    c.drawString(
        48,
        height - 132,
        "SUBJECT: Mandatory Supersession of 1989 Baseline Primary Coolant & Manifold Fastener MS90725-114.",
    )

    c.setFillColor(colors.HexColor("#FEF2F2"))
    c.setStrokeColor(colors.HexColor("#DC2626"))
    c.rect(48, height - 320, width - 96, 165, fill=1, stroke=1)
    c.setFillColor(colors.HexColor("#991B1B"))
    c.setFont("Courier-Bold", 10)
    c.drawString(
        60,
        height - 180,
        "REVISION CONFLICT ALERT // CROSS-EPOCH PART REPLACEMENT TABLE:",
    )
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Courier", 9)
    c.drawString(
        60,
        height - 205,
        "1. OBSOLETE 1989 BASELINE SPECIFICATION (1989 Manual Page 1184 / Page 82):",
    )
    c.drawString(
        60,
        height - 222,
        "   Fastener P/N MS90725-114 torqued to 45.0 Nm is hereby RETIRED due to boric-acid",
    )
    c.drawString(
        60,
        height - 239,
        "   and thermal cycling intergranular stress cracking observed in NRC Bulletin 2026-04.",
    )
    c.setFont("Courier-Bold", 9)
    c.drawString(
        60,
        height - 265,
        "2. NEW MANDATORY 2026 SPECIFICATION (ECO-2026-089 Page 3):",
    )
    c.drawString(
        60,
        height - 282,
        "   Replace all instances of MS90725-114 with Inconel 718 stud & shim assembly",
    )
    c.drawString(
        60,
        height - 299,
        "   P/N NAS1149-F0832P torqued to 52.0 Nm (+/- 1.0 Nm).",
    )
    c.save()


def build_secret_radar_manual(out_path: Path) -> None:
    c = canvas.Canvas(str(out_path), pagesize=letter)
    width, height = letter
    draw_page_frame(
        c,
        "X-BAND AESA RADAR WAVEGUIDE & CRYOGENIC COOLING ICD",
        "ICD-RADAR-9910",
        "SECRET // ITAR // NOFORN",
        1,
        1,
        "CLASSIFIED P. 612",
    )
    c.setFillColor(colors.HexColor("#991B1B"))
    c.setFont("Helvetica-Bold", 15)
    c.drawString(
        48,
        height - 110,
        "[SECRET // ITAR // NOFORN] X-BAND WAVEGUIDE FLANGE & RF SEAL SPECS",
    )
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica", 10)
    c.drawString(
        48,
        height - 132,
        "ACCESS RESTRICTION: This document chunk requires active CAC Smartcard clearance SECRET//ITAR.",
    )
    c.drawString(
        48,
        height - 148,
        "Subcontractors cleared only for CUI are blocked by Qdrant pre-retrieval ABAC filter prior to LLM inference.",
    )

    c.setFillColor(colors.HexColor("#FFF1F2"))
    c.setStrokeColor(colors.HexColor("#E11D48"))
    c.rect(48, height - 310, width - 96, 140, fill=1, stroke=1)
    c.setFillColor(colors.HexColor("#881337"))
    c.setFont("Courier-Bold", 10)
    c.drawString(
        60,
        height - 195,
        "TABLE 12-A: CLASSIFIED X-BAND WAVEGUIDE VACUUM BRAZED FLANGE TOLERANCES (P. 612)",
    )
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Courier", 9)
    c.drawString(
        60,
        height - 220,
        "- Waveguide RF Choke Groove Flatness: +/- 0.005 mm across 140 mm aperture",
    )
    c.drawString(
        60,
        height - 238,
        "- Classified HermeSeal Gasket P/N: MIL-W-85/3C-991 (Gold-Indium Alloy)",
    )
    c.drawString(
        60,
        height - 256,
        "- Peak Pulse Power Handling: 1.45 MW @ 9.65 GHz under 10^-6 Torr vacuum",
    )
    c.drawString(
        60,
        height - 274,
        "- Waveguide Flange Fastener Torque: 28.5 Nm using BeCu bolts P/N MS16998-44L",
    )
    c.save()


def build_semiconductor_euv_manual(out_path: Path) -> None:
    c = canvas.Canvas(str(out_path), pagesize=letter)
    width, height = letter
    draw_page_frame(
        c,
        "2NM HIGH-NA EUV LITHOGRAPHY SCANNER VACUUM SERVICE MANUAL",
        "SEMI-EUV-2150",
        "CUI // PROPRIETARY",
        1,
        1,
        "MANUAL PAGE 1892",
    )
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 14)
    c.drawString(
        48,
        height - 110,
        "SECTION 44: COLLECTOR OPTICS HYDROGEN PURGE MASS-FLOW CONTROL (PAGE 1892)",
    )
    c.setFillColor(colors.HexColor("#ECFEFF"))
    c.setStrokeColor(colors.HexColor("#0891B2"))
    c.rect(48, height - 310, width - 96, 175, fill=1, stroke=1)
    c.setFillColor(colors.HexColor("#155E75"))
    c.setFont("Courier-Bold", 10)
    c.drawString(
        60,
        height - 160,
        "TABLE 44-B: ULTRA-HIGH-PURITY HYDROGEN MASS-FLOW CONTROLLER DRIFT LIMITS",
    )
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Courier", 9)
    c.drawString(
        60,
        height - 185,
        "- Collector Mirror Chamber H2 Purge Setpoint: 142.5 sccm (+/- 0.15% max drift)",
    )
    c.drawString(
        60,
        height - 203,
        "- Tin (Sn) Droplet Plasma Zone Pressure: 4.2 Pa continuous",
    )
    c.drawString(
        60,
        height - 225,
        "FOOTNOTE 12 (PAGE 1892 OF 2150):",
    )
    c.drawString(
        60,
        height - 242,
        "If hydrogen mass-flow controller drift exceeds +/- 0.15% during 2nm tin-droplet",
    )
    c.drawString(
        60,
        height - 259,
        "plasma ignition, interlock E-109 triggers emergency purge solenoid valve",
    )
    c.drawString(
        60,
        height - 276,
        "P/N VCR-88210-SS within 15 milliseconds to prevent collector mirror tin deposition.",
    )
    c.save()


def build_pharma_bla_manual(out_path: Path) -> None:
    c = canvas.Canvas(str(out_path), pagesize=letter)
    width, height = letter
    draw_page_frame(
        c,
        "FDA 21 CFR PART 11 BIOLOGICS LICENSE SUBMISSION (BLA)",
        "BLA-3400-GMP",
        "CUI // FDA-GMP",
        1,
        1,
        "DOSSIER PAGE 2741",
    )
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 14)
    c.drawString(
        48,
        height - 110,
        "SECTION 88: CRYOGENIC BULK DRUG SUBSTANCE HOLD-TIME VALIDATION (PAGE 2741)",
    )
    c.setFillColor(colors.HexColor("#ECFDF5"))
    c.setStrokeColor(colors.HexColor("#059669"))
    c.rect(48, height - 310, width - 96, 175, fill=1, stroke=1)
    c.setFillColor(colors.HexColor("#065F46"))
    c.setFont("Courier-Bold", 10)
    c.drawString(
        60,
        height - 160,
        "TABLE 88-C: VALIDATED CRYOGENIC HOLD-TIME & POTENCY ASSAY LIMITS (PAGE 2741)",
    )
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Courier", 9)
    c.drawString(
        60,
        height - 185,
        "- Biologics Batch Lot #BIO-9941 Storage Regime: -70.0 C (+/- 2.5 C)",
    )
    c.drawString(
        60,
        height - 203,
        "- Maximum Validated Ambient Transfer Hold Window: 18.0 Minutes (See Footnote 9)",
    )
    c.drawString(
        60,
        height - 225,
        "FOOTNOTE 9 (PAGE 2741 OF 3400 // CAPA-2026-019):",
    )
    c.drawString(
        60,
        height - 242,
        "Per 21 CFR Part 11 Stability Protocol SP-4410 and CAPA-2026-019 Page 7, freezer",
    )
    c.drawString(
        60,
        height - 259,
        "transfer excursions under 18.0 minutes preserve >= 99.8% SEC-HPLC monomer purity",
    )
    c.drawString(
        60,
        height - 276,
        "and authorize immediate QA batch release without secondary re-assay.",
    )
    c.save()


def main() -> None:
    SAMPLE_DOCS_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DOCS_DIR.mkdir(parents=True, exist_ok=True)

    builders = [
        ("Turbine_Master_Overhaul_Manual_Rev4.pdf", build_turbine_overhaul_manual),
        ("ECO-2026-089_Flange_Supersession.pdf", build_eco_2026_override),
        ("Radar_Waveguide_Assembly_SECRET_ITAR.pdf", build_secret_radar_manual),
        ("EUV_Scanner_Vacuum_Service_Manual.pdf", build_semiconductor_euv_manual),
        ("BLA_Biologics_ColdChain_Validation.pdf", build_pharma_bla_manual),
    ]

    for filename, fn in builders:
        target = SAMPLE_DOCS_DIR / filename
        fn(target)
        shutil.copy2(target, PUBLIC_DOCS_DIR / filename)
        print(f"[OK] Generated sample PDF: {target.name} ({target.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
