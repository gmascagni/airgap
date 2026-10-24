"""
AirGap Appliance - Multi-Modal Layout-Aware Document Parser & Hierarchical Chunker.

Integrates IBM Docling (with optional Surya-OCR layout fallback) in strict offline mode to:
1. Detect and extract complex engineering tables as clean Markdown representations.
2. Preserve multi-level document hierarchy (Header 1 -> Header 2 -> Procedure Steps).
3. Extract diagram/schematic bounding boxes and link callout captions.
4. Tag every generated chunk with mandatory air-gap metadata:
   `source_file`, `page_number`, `bounding_box`, `security_classification`.
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import re
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

logger = logging.getLogger("airgap.ingestion.parser")

# Enforce zero-telemetry & offline environment flags prior to importing ML libraries
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
os.environ.setdefault("DO_NOT_TRACK", "1")


@dataclass(frozen=True)
class BoundingBox:
    """Normalized & PDF-coordinate bounding box for dual-pane UI citation overlays."""

    x0: float
    y0: float
    x1: float
    y1: float
    page_width: float = 612.0
    page_height: float = 792.0
    coord_origin: str = "TOPLEFT"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "x0": round(self.x0, 2),
            "y0": round(self.y0, 2),
            "x1": round(self.x1, 2),
            "y1": round(self.y1, 2),
            "page_width": round(self.page_width, 2),
            "page_height": round(self.page_height, 2),
            "coord_origin": self.coord_origin,
            "normalized": [
                round(self.x0 / max(self.page_width, 1.0), 4),
                round(self.y0 / max(self.page_height, 1.0), 4),
                round(self.x1 / max(self.page_width, 1.0), 4),
                round(self.y1 / max(self.page_height, 1.0), 4),
            ],
        }

    @classmethod
    def merge(cls, boxes: List["BoundingBox"]) -> "BoundingBox":
        """Compute the union bounding box across multiple layout elements on a single page."""
        if not boxes:
            return cls(0.0, 0.0, 612.0, 792.0)
        first = boxes[0]
        return cls(
            x0=min(b.x0 for b in boxes),
            y0=min(b.y0 for b in boxes),
            x1=max(b.x1 for b in boxes),
            y1=max(b.y1 for b in boxes),
            page_width=first.page_width,
            page_height=first.page_height,
            coord_origin=first.coord_origin,
        )


@dataclass
class DocumentChunk:
    """
    Standardized chunk emitted by the AirGap ingestion pipeline.
    Guarantees presence of required metadata fields for Qdrant + OpenSearch indexing.
    """

    chunk_id: str
    text: str
    source_file: str
    page_number: int
    bounding_box: Dict[str, Any]
    security_classification: str
    element_type: str = "narrative"  # "narrative" | "table" | "schematic" | "procedure"
    hierarchy_path: List[str] = field(default_factory=list)
    callout_captions: List[str] = field(default_factory=list)
    schematic_image_path: Optional[str] = None
    part_numbers: List[str] = field(default_factory=list)

    def to_payload(self) -> Dict[str, Any]:
        """Serialize chunk for Qdrant vector payload and OpenSearch BM25 document."""
        return asdict(self)


class HierarchyTracker:
    """
    Tracks active document section headers (Header 1 -> Header 2 -> Header 3 -> Procedure Steps)
    so every chunk carries its full structural lineage.
    """

    PROCEDURE_STEP_PATTERN = re.compile(
        r"^(?:STEP\s+\d+|(?:\d+\.)+\d*\s+[A-Z]|PROCEDURE\s+\d+|WARNING|CAUTION|NOTE)\b",
        re.IGNORECASE,
    )

    def __init__(self) -> None:
        self._headers: Dict[int, str] = {}
        self._active_procedure_step: Optional[str] = None

    def update_header(self, level: int, title: str) -> None:
        clean_title = " ".join(title.strip().split())
        if not clean_title:
            return
        level = max(1, min(level, 6))
        self._headers[level] = clean_title
        # Clear deeper header levels when a higher-level section begins
        for deeper in [k for k in self._headers if k > level]:
            del self._headers[deeper]
        self._active_procedure_step = None

    def check_procedure_step(self, text: str) -> bool:
        """Detect if a paragraph/list item is a numbered procedure step and update state."""
        first_line = text.strip().splitlines()[0] if text.strip() else ""
        if self.PROCEDURE_STEP_PATTERN.match(first_line):
            self._active_procedure_step = first_line[:120].strip()
            return True
        return False

    def current_path(self) -> List[str]:
        path = [self._headers[lvl] for lvl in sorted(self._headers.keys())]
        if self._active_procedure_step:
            path.append(self._active_procedure_step)
        return path

    def format_prefix(self) -> str:
        path = self.current_path()
        return " > ".join(path) if path else "Document Root"


class TechnicalMetadataExtractor:
    """Regex extractors for MIL-SPECs, NSNs, part numbers, security markings, and callouts."""

    SECURITY_BANNER_REGEX = re.compile(
        r"\b(UNCLASSIFIED|CONFIDENTIAL|SECRET|TOP\s+SECRET|CUI(?://[A-Z0-9\-/]+)?|"
        r"ITAR\s+CONTROLLED|EAR99|NOFORN|FOUO)\b",
        re.IGNORECASE,
    )

    PART_SPEC_REGEX = re.compile(
        r"\b(?:MIL-[A-Z]+-\d+[A-Z0-9\-]*|MS\d{4,6}[A-Z0-9\-]*|AN\d{3,6}[A-Z0-9\-]*|"
        r"NSN\s*\d{4}-\d{2}-\d{3}-\d{4}|P/N\s*[A-Z0-9\-]{4,24}|"
        r"DWG\s*NO\.?\s*[A-Z0-9\-]{4,24})\b",
        re.IGNORECASE,
    )

    CALLOUT_REGEX = re.compile(
        r"(?:(?:Figure|Fig\.?|Schematic|Diagram|Drawing|Sheet)\s*\d+(?:[-\.]\d+)?[A-Za-z]?"
        r"(?:\s*[:\-–—]\s*[^\n\.]{3,140})?|"
        r"(?:Callout|Item|Ref\.?|Detail)\s*#?\d+[A-Za-z]?(?:\s*\([^\)]{2,80}\))?)",
        re.IGNORECASE,
    )

    @classmethod
    def detect_security_classification(cls, text: str, default: str) -> str:
        matches = cls.SECURITY_BANNER_REGEX.findall(text)
        if not matches:
            return default
        normalized = sorted({m.upper().replace("  ", " ") for m in matches})
        return " // ".join(normalized)

    @classmethod
    def extract_part_numbers(cls, text: str) -> List[str]:
        return sorted({m.strip().upper() for m in cls.PART_SPEC_REGEX.findall(text)})

    @classmethod
    def extract_callouts(cls, text: str) -> List[str]:
        return [m.strip() for m in cls.CALLOUT_REGEX.findall(text)]


class AirGapDocumentParser:
    """
    Layout-aware technical document parser powered by Docling (with Surya/PyMuPDF fallback).
    Designed for offline execution on RTX 4090 Mobile (16GB VRAM).
    """

    def __init__(
        self,
        artifacts_path: Optional[str] = None,
        output_artifacts_dir: Optional[str] = None,
        default_security_classification: str = "CUI//NOFORN",
        max_chunk_chars: int = 1800,
        chunk_overlap_chars: int = 220,
        enable_ocr: bool = True,
        extract_schematic_crops: bool = True,
    ) -> None:
        self.artifacts_path = artifacts_path or os.getenv("DOCLING_ARTIFACTS_PATH", "/models/docling")
        self.output_artifacts_dir = Path(
            output_artifacts_dir or os.getenv("PARSED_ARTIFACTS_DIR", "./storage/artifacts")
        )
        self.output_artifacts_dir.mkdir(parents=True, exist_ok=True)
        self.default_security_classification = default_security_classification
        self.max_chunk_chars = max_chunk_chars
        self.chunk_overlap_chars = chunk_overlap_chars
        self.enable_ocr = enable_ocr
        self.extract_schematic_crops = extract_schematic_crops
        self._converter: Any = None

    def _get_docling_converter(self) -> Any:
        """Lazily initialize the offline Docling DocumentConverter."""
        if self._converter is not None:
            return self._converter

        try:
            from docling.datamodel.base_models import InputFormat
            from docling.datamodel.pipeline_options import (
                PdfPipelineOptions,
                TableFormerMode,
                TableStructureOptions,
            )
            from docling.document_converter import DocumentConverter, PdfFormatOption

            pipeline_options = PdfPipelineOptions()
            pipeline_options.do_ocr = self.enable_ocr
            pipeline_options.do_table_structure = True
            pipeline_options.table_structure_options = TableStructureOptions(
                do_cell_matching=True,
                mode=TableFormerMode.ACCURATE,
            )
            pipeline_options.generate_page_images = True
            pipeline_options.generate_picture_images = self.extract_schematic_crops

            if self.artifacts_path and Path(self.artifacts_path).exists():
                pipeline_options.artifacts_path = Path(self.artifacts_path)

            self._converter = DocumentConverter(
                format_options={
                    InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)
                }
            )
            logger.info("Initialized offline Docling DocumentConverter (TableFormerMode.ACCURATE).")
            return self._converter
        except ImportError:
            logger.warning(
                "Docling not installed in current Python environment; falling back to layout parser."
            )
            return None

    def parse_document(
        self,
        file_path: str | Path,
        security_classification_override: Optional[str] = None,
    ) -> List[DocumentChunk]:
        """
        Parse a PDF/technical manual into hierarchically contextualized, bbox-grounded chunks.
        """
        pdf_path = Path(file_path).resolve()
        if not pdf_path.exists():
            raise FileNotFoundError(f"Source document not found: {pdf_path}")

        source_file = pdf_path.name
        base_security = (
            security_classification_override
            or os.getenv("DEFAULT_SECURITY_CLASSIFICATION", self.default_security_classification)
        )

        converter = self._get_docling_converter()
        if converter is not None:
            chunks = self._parse_with_docling(pdf_path, source_file, base_security)
        else:
            chunks = self._parse_with_pymupdf_fallback(pdf_path, source_file, base_security)

        # Persist parsed chunks manifest for offline auditability and UI bbox inspection
        manifest_path = self.output_artifacts_dir / f"{pdf_path.stem}.chunks.json"
        with open(manifest_path, "w", encoding="utf-8") as fh:
            json.dump([c.to_payload() for c in chunks], fh, indent=2)

        logger.info(
            "Completed parsing '%s': emitted %d hierarchical chunks (manifest: %s)",
            source_file,
            len(chunks),
            manifest_path,
        )
        return chunks

    def _parse_with_docling(
        self,
        pdf_path: Path,
        source_file: str,
        base_security: str,
    ) -> List[DocumentChunk]:
        """Execute Docling layout analysis, table Markdown reconstruction, and schematic linking."""
        conversion_result = self._converter.convert(str(pdf_path))
        doc = conversion_result.document

        # Map page numbers to (width, height) for normalized bounding boxes
        page_dimensions: Dict[int, Tuple[float, float]] = {}
        if hasattr(doc, "pages") and isinstance(doc.pages, dict):
            for page_no, page_obj in doc.pages.items():
                if hasattr(page_obj, "size") and page_obj.size:
                    page_dimensions[int(page_no)] = (
                        float(page_obj.size.width),
                        float(page_obj.size.height),
                    )

        hierarchy = HierarchyTracker()
        chunks: List[DocumentChunk] = []
        narrative_buffer: List[str] = []
        narrative_boxes: List[BoundingBox] = []
        narrative_page: int = 1
        page_security_cache: Dict[int, str] = {}

        def flush_narrative_buffer() -> None:
            nonlocal narrative_buffer, narrative_boxes, narrative_page
            if not narrative_buffer:
                return
            combined_text = "\n\n".join(narrative_buffer).strip()
            if not combined_text:
                narrative_buffer.clear()
                narrative_boxes.clear()
                return

            merged_bbox = BoundingBox.merge(narrative_boxes)
            sec_class = page_security_cache.get(
                narrative_page,
                TechnicalMetadataExtractor.detect_security_classification(
                    combined_text, base_security
                ),
            )
            is_proc = any(
                HierarchyTracker.PROCEDURE_STEP_PATTERN.match(line.strip())
                for line in combined_text.splitlines()
                if line.strip()
            )
            element_type = "procedure" if is_proc else "narrative"
            hierarchy_path = hierarchy.current_path()
            contextualized_text = (
                f"[Section: {hierarchy.format_prefix()}]\n{combined_text}"
            )

            chunks.append(
                self._build_chunk(
                    text=contextualized_text,
                    source_file=source_file,
                    page_number=narrative_page,
                    bbox=merged_bbox,
                    security_classification=sec_class,
                    element_type=element_type,
                    hierarchy_path=hierarchy_path,
                    callout_captions=TechnicalMetadataExtractor.extract_callouts(combined_text),
                )
            )
            narrative_buffer.clear()
            narrative_boxes.clear()

        for item, level in doc.iterate_items():
            label = getattr(item, "label", "").lower()
            page_no, bbox = self._extract_docling_provenance(item, page_dimensions)
            item_text = getattr(item, "text", "") or ""

            # Track page-level security markings from headers/footers/text
            if item_text:
                detected_sec = TechnicalMetadataExtractor.detect_security_classification(
                    item_text, base_security
                )
                if detected_sec != base_security:
                    page_security_cache[page_no] = detected_sec

            # 1. Section Headers -> Update Hierarchy State
            if "section_header" in label or "title" in label:
                flush_narrative_buffer()
                header_level = int(level) if isinstance(level, int) and level > 0 else 1
                hierarchy.update_header(header_level, item_text)
                continue

            # 2. Tables -> Clean Markdown Representation as Atomic Chunk
            if "table" in label or hasattr(item, "export_to_markdown"):
                flush_narrative_buffer()
                try:
                    table_md = item.export_to_markdown(doc=doc).strip()
                except TypeError:
                    table_md = item.export_to_markdown().strip()
                except Exception:
                    table_md = item_text.strip()

                if not table_md:
                    continue

                caption_text = self._extract_docling_caption(item, doc)
                header_prefix = f"[Section: {hierarchy.format_prefix()}]"
                full_table_text = (
                    f"{header_prefix}\n### Table: {caption_text}\n\n{table_md}"
                    if caption_text
                    else f"{header_prefix}\n\n{table_md}"
                )
                sec_class = page_security_cache.get(
                    page_no,
                    TechnicalMetadataExtractor.detect_security_classification(
                        full_table_text, base_security
                    ),
                )
                chunks.append(
                    self._build_chunk(
                        text=full_table_text,
                        source_file=source_file,
                        page_number=page_no,
                        bbox=bbox,
                        security_classification=sec_class,
                        element_type="table",
                        hierarchy_path=hierarchy.current_path(),
                        callout_captions=[caption_text] if caption_text else [],
                    )
                )
                continue

            # 3. Diagrams / Schematics / Pictures -> Extract BBox + Link Callout Captions
            if "picture" in label or "figure" in label:
                flush_narrative_buffer()
                caption_text = self._extract_docling_caption(item, doc)
                callouts = TechnicalMetadataExtractor.extract_callouts(
                    f"{caption_text} {item_text}"
                )
                if caption_text and caption_text not in callouts:
                    callouts.insert(0, caption_text)

                crop_path = self._save_schematic_crop(item, doc, pdf_path.stem, page_no, len(chunks))
                schematic_description = (
                    f"[Section: {hierarchy.format_prefix()}]\n"
                    f"[Schematic/Diagram on Page {page_no}]\n"
                    f"Caption: {caption_text or 'Unlabeled Technical Schematic'}\n"
                    f"Linked Callouts: {', '.join(callouts) if callouts else 'None'}\n"
                    f"Bounding Box: ({bbox.x0:.1f}, {bbox.y0:.1f}, {bbox.x1:.1f}, {bbox.y1:.1f})"
                )
                if item_text.strip():
                    schematic_description += f"\nEmbedded OCR Text: {item_text.strip()}"

                sec_class = page_security_cache.get(page_no, base_security)
                chunks.append(
                    self._build_chunk(
                        text=schematic_description,
                        source_file=source_file,
                        page_number=page_no,
                        bbox=bbox,
                        security_classification=sec_class,
                        element_type="schematic",
                        hierarchy_path=hierarchy.current_path(),
                        callout_captions=callouts,
                        schematic_image_path=crop_path,
                    )
                )
                continue

            # 4. Narrative Text & Procedure Steps
            clean_text = item_text.strip()
            if not clean_text:
                continue

            hierarchy.check_procedure_step(clean_text)

            # Flush buffer if page changed or size exceeds max_chunk_chars
            current_len = sum(len(t) for t in narrative_buffer)
            if narrative_buffer and (
                page_no != narrative_page or (current_len + len(clean_text) > self.max_chunk_chars)
            ):
                flush_narrative_buffer()

            narrative_page = page_no
            narrative_buffer.append(clean_text)
            narrative_boxes.append(bbox)

        flush_narrative_buffer()
        return chunks

    def _extract_docling_provenance(
        self,
        item: Any,
        page_dimensions: Dict[int, Tuple[float, float]],
    ) -> Tuple[int, BoundingBox]:
        """Extract page number and bounding box from a Docling DocItem provenance entry."""
        prov_list = getattr(item, "prov", None)
        if prov_list and len(prov_list) > 0:
            prov = prov_list[0]
            page_no = int(getattr(prov, "page_no", 1))
            page_w, page_h = page_dimensions.get(page_no, (612.0, 792.0))
            raw_bbox = getattr(prov, "bbox", None)
            if raw_bbox is not None:
                l_val = float(getattr(raw_bbox, "l", 0.0))
                t_val = float(getattr(raw_bbox, "t", 0.0))
                r_val = float(getattr(raw_bbox, "r", page_w))
                b_val = float(getattr(raw_bbox, "b", page_h))
                origin = str(getattr(raw_bbox, "coord_origin", "TOPLEFT"))
                # Normalize bottom-left PDF coordinates to top-left UI coordinates if needed
                if "BOTTOMLEFT" in origin.upper():
                    y0 = max(0.0, page_h - max(t_val, b_val))
                    y1 = min(page_h, page_h - min(t_val, b_val))
                else:
                    y0 = min(t_val, b_val)
                    y1 = max(t_val, b_val)
                return (
                    page_no,
                    BoundingBox(
                        x0=min(l_val, r_val),
                        y0=y0,
                        x1=max(l_val, r_val),
                        y1=y1,
                        page_width=page_w,
                        page_height=page_h,
                        coord_origin="TOPLEFT",
                    ),
                )
        return 1, BoundingBox(0.0, 0.0, 612.0, 792.0)

    @staticmethod
    def _extract_docling_caption(item: Any, doc: Any) -> str:
        """Resolve linked figure/table captions from a Docling item."""
        if hasattr(item, "caption_text"):
            try:
                cap = item.caption_text(doc)
                if cap:
                    return " ".join(str(cap).split())
            except Exception:
                pass
        captions = getattr(item, "captions", None)
        if captions:
            resolved = []
            for cap_ref in captions:
                text = getattr(cap_ref, "text", None)
                if text:
                    resolved.append(str(text).strip())
            if resolved:
                return " ".join(resolved)
        return ""

    def _save_schematic_crop(
        self,
        item: Any,
        doc: Any,
        doc_stem: str,
        page_no: int,
        index: int,
    ) -> Optional[str]:
        """Persist extracted diagram/schematic image crop to local artifacts directory."""
        if not self.extract_schematic_crops:
            return None
        try:
            image_obj = item.get_image(doc) if hasattr(item, "get_image") else None
            if image_obj is not None:
                crops_dir = self.output_artifacts_dir / "schematics" / doc_stem
                crops_dir.mkdir(parents=True, exist_ok=True)
                crop_file = crops_dir / f"page_{page_no:04d}_fig_{index:04d}.png"
                image_obj.save(crop_file, format="PNG")
                return str(crop_file)
        except Exception as exc:
            logger.debug("Could not save schematic crop on page %d: %s", page_no, exc)
        return None

    def _parse_with_pymupdf_fallback(
        self,
        pdf_path: Path,
        source_file: str,
        base_security: str,
    ) -> List[DocumentChunk]:
        """
        Deterministic fallback parser using PyMuPDF (fitz) when Docling weights are not yet mounted.
        Preserves bounding boxes, Markdown tables, hierarchy headers, and schematic blocks.
        """
        import fitz  # PyMuPDF

        doc = fitz.open(str(pdf_path))
        hierarchy = HierarchyTracker()
        chunks: List[DocumentChunk] = []

        for page_index in range(len(doc)):
            page = doc[page_index]
            page_no = page_index + 1
            page_w = float(page.rect.width)
            page_h = float(page.rect.height)
            full_page_text = page.get_text("text") or ""
            page_security = TechnicalMetadataExtractor.detect_security_classification(
                full_page_text, base_security
            )

            # 1. Extract tables as Markdown using PyMuPDF find_tables
            if hasattr(page, "find_tables"):
                try:
                    table_finder = page.find_tables()
                    for tbl in table_finder.tables:
                        md_table = tbl.to_markdown()
                        x0, y0, x1, y1 = tbl.bbox
                        bbox = BoundingBox(x0, y0, x1, y1, page_w, page_h)
                        text_payload = f"[Section: {hierarchy.format_prefix()}]\n\n{md_table}"
                        chunks.append(
                            self._build_chunk(
                                text=text_payload,
                                source_file=source_file,
                                page_number=page_no,
                                bbox=bbox,
                                security_classification=page_security,
                                element_type="table",
                                hierarchy_path=hierarchy.current_path(),
                            )
                        )
                except Exception as exc:
                    logger.debug("Table detection skipped on page %d: %s", page_no, exc)

            # 2. Extract layout blocks (text + images/schematics)
            page_dict = page.get_text("dict")
            for block in page_dict.get("blocks", []):
                bx0, by0, bx1, by1 = block.get("bbox", (0.0, 0.0, page_w, page_h))
                bbox = BoundingBox(bx0, by0, bx1, by1, page_w, page_h)

                # Image / Schematic block
                if block.get("type") == 1:
                    callouts = TechnicalMetadataExtractor.extract_callouts(full_page_text)
                    schematic_text = (
                        f"[Section: {hierarchy.format_prefix()}]\n"
                        f"[Schematic/Diagram on Page {page_no}]\n"
                        f"Linked Callouts: {', '.join(callouts) if callouts else 'Embedded Diagram'}"
                    )
                    chunks.append(
                        self._build_chunk(
                            text=schematic_text,
                            source_file=source_file,
                            page_number=page_no,
                            bbox=bbox,
                            security_classification=page_security,
                            element_type="schematic",
                            hierarchy_path=hierarchy.current_path(),
                            callout_captions=callouts,
                        )
                    )
                    continue

                # Text block: inspect font sizes for header detection
                lines_text: List[str] = []
                max_font_size = 0.0
                for line in block.get("lines", []):
                    spans = line.get("spans", [])
                    line_str = "".join(s.get("text", "") for s in spans).strip()
                    if line_str:
                        lines_text.append(line_str)
                    for s in spans:
                        max_font_size = max(max_font_size, float(s.get("size", 10.0)))

                block_text = "\n".join(lines_text).strip()
                if not block_text:
                    continue

                if max_font_size >= 15.0 and len(block_text) < 140:
                    hierarchy.update_header(1, block_text)
                    continue
                if max_font_size >= 12.5 and len(block_text) < 140:
                    hierarchy.update_header(2, block_text)
                    continue

                is_proc = hierarchy.check_procedure_step(block_text)
                contextual_text = f"[Section: {hierarchy.format_prefix()}]\n{block_text}"
                chunks.append(
                    self._build_chunk(
                        text=contextual_text,
                        source_file=source_file,
                        page_number=page_no,
                        bbox=bbox,
                        security_classification=page_security,
                        element_type="procedure" if is_proc else "narrative",
                        hierarchy_path=hierarchy.current_path(),
                        callout_captions=TechnicalMetadataExtractor.extract_callouts(block_text),
                    )
                )

        doc.close()
        return chunks

    @staticmethod
    def _build_chunk(
        text: str,
        source_file: str,
        page_number: int,
        bbox: BoundingBox,
        security_classification: str,
        element_type: str,
        hierarchy_path: List[str],
        callout_captions: Optional[List[str]] = None,
        schematic_image_path: Optional[str] = None,
    ) -> DocumentChunk:
        """Create a deterministic, content-addressed DocumentChunk."""
        bbox_dict = bbox.to_dict()
        digest_input = f"{source_file}:{page_number}:{bbox_dict['x0']}:{bbox_dict['y0']}:{text}"
        chunk_id = hashlib.sha256(digest_input.encode("utf-8")).hexdigest()[:32]

        return DocumentChunk(
            chunk_id=chunk_id,
            text=text,
            source_file=source_file,
            page_number=page_number,
            bounding_box=bbox_dict,
            security_classification=security_classification,
            element_type=element_type,
            hierarchy_path=list(hierarchy_path),
            callout_captions=callout_captions or [],
            schematic_image_path=schematic_image_path,
            part_numbers=TechnicalMetadataExtractor.extract_part_numbers(text),
        )
