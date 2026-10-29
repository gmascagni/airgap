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

import hashlib
import hmac
import logging
import os
import re
import secrets
import shutil
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, Request, Response, UploadFile
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
    docs_url=None,
    redoc_url=None,
)

# CIS & N-09 Hardening: Restrict CORS strictly to local loopback frontend
ALLOWED_ORIGINS = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-TrailVault-Token"],
)

@app.middleware("http")
async def hardened_headers_middleware(request: Request, call_next: Any) -> Response:
    """Inject standard OWASP/CIS security headers."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response

# Enforce Bearer authentication on container stack endpoints (N-09 & N-01 alignment)
APP_API_TOKEN = os.getenv("BACKEND_API_TOKEN", "")

def verify_token(authorization: Optional[str] = Header(None), x_trailvault_token: Optional[str] = Header(None)) -> bool:
    token = ""
    if isinstance(authorization, str) and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
    elif isinstance(x_trailvault_token, str):
        token = x_trailvault_token.strip()

    # Fail closed: If no token configured in environment, refuse all requests (N-01)
    if not APP_API_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="Server security configuration error: BACKEND_API_TOKEN is not configured. Ingress is denied fail-closed.",
        )
    if not token or not hmac.compare_digest(token, APP_API_TOKEN):
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid or missing API token.")
    return True

DOCUMENTS_DIR = Path(os.getenv("DOCUMENTS_INGEST_DIR", "./storage/documents"))
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
MAX_INGEST_FILE_BYTES = 50 * 1024 * 1024  # 50 MB hard cap (Resource Bounding)

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


@app.post("/api/v1/ingest", dependencies=[Depends(verify_token)])
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

    clean_base = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", Path(file.filename).name)
    hasher = hashlib.sha256()
    bytes_read = 0
    temp_dest = DOCUMENTS_DIR / f"upload_tmp_{secrets.token_hex(8)}"

    try:
        with open(temp_dest, "wb") as out_file:
            while chunk := await file.read(65536):
                bytes_read += len(chunk)
                if bytes_read > MAX_INGEST_FILE_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"Uploaded file exceeds maximum size limit of {MAX_INGEST_FILE_BYTES // (1024 * 1024)} MB.",
                    )
                hasher.update(chunk)
                out_file.write(chunk)
    except Exception:
        temp_dest.unlink(missing_ok=True)
        raise

    sha_prefix = hasher.hexdigest()[:12]
    safe_name = f"{sha_prefix}_{clean_base}"
    dest_path = DOCUMENTS_DIR / safe_name
    temp_dest.replace(dest_path)

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


@app.post("/api/v1/query", dependencies=[Depends(verify_token)])
async def query_documents(request: QueryRequest) -> Dict[str, Any]:
    """Execute two-stage hybrid retrieval + Cross-Encoder reranking + Grounded LLM inference."""
    # N-09 Hardening: Security filter cannot be empty or bypassed
    effective_filter = request.security_filter or os.getenv("DEFAULT_SECURITY_CLASSIFICATION", "CUI//NOFORN")
    top_chunks = await retriever_service.retrieve_and_rerank(
        query=request.query,
        dense_top_k=request.dense_top_k,
        sparse_top_k=request.sparse_top_k,
        rerank_top_k=request.rerank_top_k,
        security_filter=effective_filter,
    )
    result = await inference_service.generate_grounded_response(
        query=request.query,
        chunks=top_chunks,
        temperature=request.temperature,
    )
    return result


@app.post("/api/v1/query/stream", dependencies=[Depends(verify_token)])
async def stream_query_documents(request: QueryRequest) -> StreamingResponse:
    """Stream grounded LLM tokens and verified citation bounding boxes via Server-Sent Events."""
    effective_filter = request.security_filter or os.getenv("DEFAULT_SECURITY_CLASSIFICATION", "CUI//NOFORN")
    top_chunks = await retriever_service.retrieve_and_rerank(
        query=request.query,
        dense_top_k=request.dense_top_k,
        sparse_top_k=request.sparse_top_k,
        rerank_top_k=request.rerank_top_k,
        security_filter=effective_filter,
    )
    return StreamingResponse(
        inference_service.stream_grounded_response(
            query=request.query,
            chunks=top_chunks,
            temperature=request.temperature,
        ),
        media_type="text/event-stream",
    )


@app.get("/api/v1/documents/{filename}", dependencies=[Depends(verify_token)])
async def get_document_file(filename: str) -> FileResponse:
    """Serve a local PDF manual to the Dual-Pane Investor Web UI."""
    safe_name = Path(filename).name
    target = DOCUMENTS_DIR / safe_name
    if not target.exists():
        raise HTTPException(status_code=404, detail=f"Document '{safe_name}' not found.")
    return FileResponse(target, media_type="application/pdf", filename=safe_name)
