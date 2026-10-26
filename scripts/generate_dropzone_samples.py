"""
AirVault (AirGap) - Multi-Format Customer Dropzone Sample Generator
===================================================================
Seeds `02_DROP_CUSTOMER_FILES_HERE/` with realistic multi-format enterprise
files (.xlsx, .docx, .pptx, .png schematic, .log telemetry) so the Sales
Engineer can test and demonstrate 1-click USB Dropzone ingestion across all
major B2B file formats before walking into a customer site.
"""

from __future__ import annotations

import shutil
from pathlib import Path
import docx
import openpyxl
from openpyxl.styles import Font, PatternFill
from pptx import Presentation
from pptx.util import Inches, Pt
from PIL import Image, ImageDraw

ROOT_DIR = Path(__file__).resolve().parent.parent
DROPZONE_DIR = ROOT_DIR / "02_DROP_CUSTOMER_FILES_HERE"
STAGE_DROPZONE_DIR = ROOT_DIR / "USB4_Appliance_Stage" / "02_DROP_CUSTOMER_FILES_HERE"


def create_excel_bom(path: Path) -> None:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Critical_Spares_BOM"

    headers = [
        "Item_ID",
        "Part_Number",
        "Subsystem",
        "Description",
        "Material_Spec",
        "Operating_Limit",
        "Unit_Cost_USD",
        "Lead_Time_Days",
    ]
    ws.append(headers)
    for col_idx in range(1, len(headers) + 1):
        cell = ws.cell(row=1, column=col_idx)
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill("solid", fgColor="0F172A")

    rows = [
        [
            "BOM-101",
            "NAS1149-F0832P",
            "Stage-3 Cryo Turbopump",
            "Cryo-Stabilized High-Nickel Backing Shim Washer",
            "Inconel 718 (AMS 5596)",
            "-196 C Cryo Shock / 0.018 mm Max Axial Play",
            "$148.50",
            "14 Days",
        ],
        [
            "BOM-102",
            "AN6227-23",
            "Stage-2 HP Relief Valve",
            "Fluorocarbon Packing Seal O-Ring (Callout #04)",
            "MIL-P-83461 Viton-GLT",
            "3,000 PSI Continuous / 4,500 PSI Proof",
            "$34.20",
            "5 Days",
        ],
        [
            "BOM-103",
            "VCR-88210-SS",
            "EUV Collector Mirror Purge",
            "Ultra-High-Purity H2 Emergency Shutoff Solenoid",
            "316L VAR Electropolished SS",
            "142.5 sccm +/- 0.15% Drift (15ms Trip)",
            "$2,890.00",
            "28 Days",
        ],
        [
            "BOM-104",
            "MIL-W-85/3C-991",
            "X-Band AESA Waveguide",
            "Classified HermeSeal RF Choke Flange Gasket",
            "Gold-Indium Alloy",
            "1.45 MW Peak Pulse @ 9.65 GHz",
            "$1,120.00",
            "45 Days",
        ],
    ]
    for r in rows:
        ws.append(r)

    wb.save(str(path))


def create_word_sop(path: Path) -> None:
    doc = docx.Document()
    doc.add_heading(
        "CUSTOMER FIELD SOP-409: EMERGENCY TURBOPUMP & MANIFOLD TORQUE VERIFICATION",
        level=1,
    )
    doc.add_paragraph(
        "SECURITY MARKING: CUI // NOFORN // CUSTOMER FIELD ENGINEERING SOP\n"
        "EFFECTIVE DATE: OCTOBER 2026 | AUTHOR: CHIEF PROPULSION QA ENGINEER"
    )
    doc.add_heading("1. Mandatory Fastener Supersession Check", level=2)
    doc.add_paragraph(
        "Prior to pressurizing the primary hydraulic loop above 1,500 PSI, field technicians must verify "
        "that legacy 1989 carbon-steel bolts (P/N MS90725-114 at 45.0 Nm) have been replaced by Inconel "
        "stud assembly P/N NAS1149-F0832P torqued to 52.0 Nm +/- 1.0 Nm per ECO-2026-089."
    )

    doc.add_heading("2. Field Inspection Sign-Off Table", level=2)
    table = doc.add_table(rows=1, cols=4)
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = "Inspection Step"
    hdr_cells[1].text = "Component / Part No."
    hdr_cells[2].text = "Acceptance Criterion"
    hdr_cells[3].text = "QA Hold Point"

    steps = [
        (
            "Step 2.1",
            "M12 Manifold Flange (NAS1149-F0832P)",
            "52.0 Nm +/- 1.0 Nm (8-Point Star)",
            "Mandatory Dual Witness",
        ),
        (
            "Step 2.2",
            "Stage-3 Labyrinth Seal Clearance",
            "<= 0.018 mm Axial Play @ -196 C",
            "Laser Micrometer Log",
        ),
        (
            "Step 2.3",
            "Relief Valve O-Ring (AN6227-23)",
            "Zero Helium Leak @ 3,000 PSI",
            "Mass Spec Sniffer Test",
        ),
    ]
    for s in steps:
        row_cells = table.add_row().cells
        for i, val in enumerate(s):
            row_cells[i].text = val

    doc.save(str(path))


def create_powerpoint_deck(path: Path) -> None:
    prs = Presentation()
    slide_layout = prs.slide_layouts[1]

    slides_data = [
        (
            "Slide 1: Customer Air-Gapped AI Deployment Charter",
            "• Objective: Deploy zero-telemetry RAG across 250,000 legacy engineering manuals & CAD drawings.\n"
            "• Security Requirement: 100% physical air-gap (CMMC Level 3 / ITAR / NIST SP 800-171).\n"
            "• Target Query Latency: Under 2.0 seconds for exact MIL-SPEC footnote & table pinpointing.",
        ),
        (
            "Slide 2: Critical Maintenance Bottlenecks Identified",
            "• Field technicians currently spend 3.8 hours per shift searching PDFs for superseded part numbers.\n"
            "• Key Audit Finding: 1989 baseline fastener MS90725-114 was superseded by NAS1149-F0832P (52.0 Nm).\n"
            "• AirVault Solution: Automated cross-document contradiction alerts linking 1989 manuals to 2026 ECOs.",
        ),
    ]

    for title_text, body_text in slides_data:
        slide = prs.slides.add_slide(slide_layout)
        slide.shapes.title.text = title_text
        tf = slide.placeholders[1].text_frame
        tf.text = body_text

    prs.save(str(path))


def create_cad_schematic_png(path: Path) -> None:
    img = Image.new("RGB", (900, 620), color=(11, 15, 23))
    draw = ImageDraw.Draw(img)

    # Outer CAD border & title block
    draw.rectangle([20, 20, 880, 600], outline=(6, 182, 212), width=3)
    draw.rectangle([20, 20, 880, 68], fill=(17, 24, 39), outline=(6, 182, 212), width=2)
    draw.text(
        (36, 36),
        "CAD BLUEPRINT: DWG-99401 REV H // STAGE-3 CRYOGENIC LABYRINTH SEAL ASSEMBLY",
        fill=(255, 255, 255),
    )

    # Schematic geometry
    draw.rectangle([90, 120, 810, 420], outline=(55, 65, 81), width=2)
    draw.rectangle([160, 175, 460, 365], outline=(6, 182, 212), width=3)
    draw.ellipse([490, 185, 650, 345], outline=(245, 158, 11), width=4)
    draw.line([570, 265, 720, 155], fill=(245, 158, 11), width=3)

    draw.text(
        (500, 130),
        "CALLOUT #17: SHIM NAS1149-F0832P (MAX PLAY 0.018mm @ -196C)",
        fill=(253, 230, 138),
    )
    draw.text(
        (175, 255),
        "STAGE-3 ROTOR LABYRINTH GLAND (INCONEL 718)",
        fill=(16, 185, 129),
    )

    # Title block footer
    draw.rectangle([20, 460, 880, 600], fill=(17, 24, 39), outline=(6, 182, 212), width=2)
    draw.text(
        (40, 480),
        "NOTES & TOLERANCES (DWG-99401 REV H - SHEET 1 OF 1):",
        fill=(6, 182, 212),
    )
    draw.text(
        (40, 510),
        "1. CRYOGENIC AXIAL CLEARANCE AT -196 C SHALL NOT EXCEED 0.018 mm (+/- 0.002 mm).",
        fill=(229, 231, 235),
    )
    draw.text(
        (40, 538),
        "2. INSTALL HIGH-NICKEL BACKING SHIM P/N NAS1149-F0832P PER FOOTNOTE 17 & ECO-2026-089.",
        fill=(253, 230, 138),
    )
    draw.text(
        (40, 566),
        "3. SECURITY CLASSIFICATION: CUI // NOFORN // ITAR EXPORT CONTROLLED.",
        fill=(16, 185, 129),
    )

    img.save(str(path), format="PNG")


def create_scada_telemetry_log(path: Path) -> None:
    content = """================================================================================
SCADA / PLC CRYOGENIC TEST STAND TELEMETRY LOG // CELL #04 (CUI // NOFORN)
LOG FILE: SCADA_Turbine_Telemetry_Alarm.log | DATE: 2026-10-25
================================================================================
[2026-10-25 14:02:11.104] INFO   PLC-CRY04: Liquid Nitrogen / LOX chilldown initiated. Target: -196.0 C.
[2026-10-25 14:08:44.512] WARN  VIB-SENS-03: Stage-3 Labyrinth Seal axial displacement reached 0.017 mm.
[2026-10-25 14:09:02.889] ALARM ALM-4402: Cryogenic thermal shock excursion at -196.4 C!
[2026-10-25 14:09:02.910] ACTION INTERLOCK-17: Verified backing shim P/N NAS1149-F0832P installed; axial play held within 0.018 mm max limit.
[2026-10-25 14:09:15.002] INFO  QA-SIGN-OFF: Manifold M12 bolt torque verified at 52.0 Nm per ECO-2026-089.
"""
    path.write_text(content, encoding="utf-8")


def main() -> None:
    DROPZONE_DIR.mkdir(parents=True, exist_ok=True)
    STAGE_DROPZONE_DIR.mkdir(parents=True, exist_ok=True)

    generators = [
        ("Customer_SupplyChain_BOM_2026.xlsx", create_excel_bom),
        ("Customer_Field_Maintenance_SOP.docx", create_word_sop),
        ("Customer_Architecture_Review_Deck.pptx", create_powerpoint_deck),
        ("DWG-99401_Cryo_Seal_Schematic.png", create_cad_schematic_png),
        ("SCADA_Turbine_Telemetry_Alarm.log", create_scada_telemetry_log),
    ]

    for filename, fn in generators:
        out_file = DROPZONE_DIR / filename
        fn(out_file)
        shutil.copy2(out_file, STAGE_DROPZONE_DIR / filename)
        print(f"[OK] Created Dropzone sample: {out_file.name} ({out_file.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
