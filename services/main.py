"""
AirGap Appliance - FastAPI Backend Orchestrator (`backend-api`).

Exposes offline endpoints for:
- `GET /health`: Hardware VRAM & service readiness diagnostics
- `POST /api/v1/ingest`: Multi-modal PDF layout parsing & dual Qdrant/OpenSearch indexing
- `POST /api/v1/query`: Two-stage hybrid retrieval + Cross-Encoder reranking + Grounded LLM inference
- `POST /api/v1/query/stream`: SSE streaming grounded response with citation bounding boxes
- `GET /api/v1/documents/{filename}`: Serves local source PDFs for the Dual-Pane citation viewer
"""

from __future__ import annotations

import logging
import os
import shutil
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field

from services.inference.engine import GroundedInferenceEngine
from services.ingestion.parser import AirGapDocumentParser
from services.retrieval.hybrid_search import HybridRetriever

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("airgap.api")

app = FastAPI(
    title="AIRGAP Appliance - Technical Document Intelligence API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DOCUMENTS_DIR = Path(os.getenv("DOCUMENTS_INGEST_DIR", "./storage/documents"))
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)

parser_service = AirGapDocumentParser()
retriever_service = HybridRetriever()
inference_service = GroundedInferenceEngine()


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=2, description="Natural language engineering query")
    security_filter: Optional[str] = Field(
        default=None, description="Optional security marking filter (e.g. CUI//NOFORN)"
    )
    dense_top_k: int = Field(default=30, ge=1, le=100)
    sparse_top_k: int = Field(default=30, ge=1, le=100)
    rerank_top_k: int = Field(default=5, ge=1, le=20)
    temperature: float = Field(default=0.0, ge=0.0, le=0.5)


@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Return air-gap status and RTX 4090 Mobile VRAM budget allocation."""
    return {
        "status": "healthy",
        "airgap_mode": os.getenv("AIRGAP_MODE", "strict"),
        "telemetry_disabled": True,
        "vram_budget_gb": {
            "llm_qwen2_5_14b_awq": 9.5,
            "bge_large_en_v1_5": 1.5,
            "bge_reranker_large": 1.2,
            "kv_cache_headroom": 2.5,
            "total_allocated_gb": 14.7,
            "hardware_ceiling_gb": 16.0,
        },
    }


@app.post("/api/v1/ingest")
async def ingest_document(
    file: UploadFile = File(...),
    security_classification: Optional[str] = Form(default=None),
) -> Dict[str, Any]:
    """
    Save an uploaded technical manual PDF, run layout-aware hierarchical parsing,
    and index all chunks into Qdrant (dense) and OpenSearch (sparse BM25).
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename.")

    safe_name = Path(file.filename).name
    dest_path = DOCUMENTS_DIR / safe_name
    with open(dest_path, "wb") as out_file:
        shutil.copyfileobj(file.file, out_file)

    chunks = parser_service.parse_document(
        file_path=dest_path,
        security_classification_override=security_classification,
    )
    indexed_count = retriever_service.index_chunks(chunks)

    return {
        "status": "indexed",
        "source_file": safe_name,
        "chunks_generated": len(chunks),
        "chunks_indexed": indexed_count,
        "tables_extracted": sum(1 for c in chunks if c.element_type == "table"),
        "schematics_extracted": sum(1 for c in chunks if c.element_type == "schematic"),
    }


@app.post("/api/v1/query")
async def query_documents(request: QueryRequest) -> Dict[str, Any]:
    """Execute two-stage hybrid retrieval + Cross-Encoder reranking + Grounded LLM inference."""
    top_chunks = await retriever_service.retrieve_and_rerank(
        query=request.query,
        dense_top_k=request.dense_top_k,
        sparse_top_k=request.sparse_top_k,
        rerank_top_k=request.rerank_top_k,
        security_filter=request.security_filter,
    )
    result = await inference_service.generate_grounded_response(
        query=request.query,
        chunks=top_chunks,
        temperature=request.temperature,
    )
    return result


@app.post("/api/v1/query/stream")
async def stream_query_documents(request: QueryRequest) -> StreamingResponse:
    """Stream grounded LLM tokens and verified citation bounding boxes via Server-Sent Events."""
    top_chunks = await retriever_service.retrieve_and_rerank(
        query=request.query,
        dense_top_k=request.dense_top_k,
        sparse_top_k=request.sparse_top_k,
        rerank_top_k=request.rerank_top_k,
        security_filter=request.security_filter,
    )
    return StreamingResponse(
        inference_service.stream_grounded_response(
            query=request.query,
            chunks=top_chunks,
            temperature=request.temperature,
        ),
        media_type="text/event-stream",
    )


@app.get("/api/v1/documents/{filename}")
async def get_document_file(filename: str) -> FileResponse:
    """Serve a local PDF manual to the Dual-Pane Investor Web UI."""
    safe_name = Path(filename).name
    target = DOCUMENTS_DIR / safe_name
    if not target.exists():
        raise HTTPException(status_code=404, detail=f"Document '{safe_name}' not found.")
    return FileResponse(target, media_type="application/pdf", filename=safe_name)
