# AIR GAP APPLIANCE: AIRGAP KICKOFF SPECIFICATION

## Project Mission
Build an enterprise-grade, zero-telemetry, air-gapped technical document intelligence POC running locally on an RTX 4090 Mobile (16GB VRAM), 64GB RAM, and portable high-speed USB NVMe SSD.

The system ingests multi-gigabyte/terabyte technical documentation (scanned PDFs, engineering manuals, complex tables, schematics), performs layout-aware parsing and hybrid indexing (dense vector + sparse BM25), and serves grounded natural-language queries via a local open-weights LLM with dual-pane PDF citation viewing.

---

## Hardware Target & Allocation
- **GPU:** NVIDIA GeForce RTX 4090 Laptop GPU (16GB VRAM)
- **Host Memory:** 64GB DDR5 RAM
- **Storage:** 2TB Internal NVMe + External USB 3.2 Gen2 SSD (Portable Demo Target)
- **VRAM Budget:**
  - LLM: Qwen 2.5 14B-Instruct (AWQ / Q4_K_M) -> ~9.5 GB
  - Embedding Model: BAAI/bge-large-en-v1.5 -> ~1.5 GB
  - Cross-Encoder Re-ranker: BAAI/bge-reranker-large -> ~1.2 GB
  - KV Cache Headroom: ~2.5 GB
  - Total Target VRAM: ~14.7 GB / 16 GB

---

## Agentic Workstream Architecture & Deliverables

Please scaffold and implement the following modules in order:

### 1. `docker-compose.yml` (Containerized Air-Gapped Stack)
- Network: Isolated internal bridge network (`internal: true`) with no default gateway or internet egress.
- Services:
  - `qdrant`: Vector database with persistent storage path on `./storage/qdrant_data`.
  - `opensearch` or lightweight local BM25 service for sparse exact-token lookup.
  - `redis`: Task broker for asynchronous document ingestion jobs.
  - `vllm-engine` or `ollama`: GPU-accelerated local inference service with NVIDIA GPU reservations (`count: all`, `capabilities: [gpu]`).
  - `backend-api`: Python FastAPI service exposing ingestion, retrieval, and health endpoints.
  - `frontend-ui`: Static Next.js/React web server.

### 2. Multi-Modal Parsing & Hierarchical Chunking (`services/ingestion/`)
- Tooling: Integrate `docling` or `surya-ocr` for layout analysis.
- Requirements:
  - Detect and extract tables as clean Markdown representations.
  - Preserve document hierarchy (Header 1 -> Header 2 -> Procedure Steps).
  - Extract diagram/schematic bounding boxes and link callout captions.
  - Tag every generated chunk with metadata: `source_file`, `page_number`, `bounding_box`, `security_classification`.

### 3. Hybrid Search & Cross-Encoder Reranking (`services/retrieval/`)
- Implement two-stage retrieval:
  1. **Stage 1 (Parallel Retrieval):**
     - Dense semantic query against Qdrant collection using `bge-large-en-v1.5` embeddings (Top 30).
     - Sparse lexical query using BM25 for exact part numbers, MIL-SPECs, and serial tags (Top 30).
     - Merge candidates using Reciprocal Rank Fusion (RRF).
  2. **Stage 2 (Cross-Encoder Re-scoring):**
     - Score candidate chunks against the prompt using `bge-reranker-large`.
     - Return the Top 5 highest-confidence chunks to the context window.

### 4. Grounded Inference Runtime & Guardrails (`services/inference/`)
- Strict context-grounding system prompt template:
  - Constrain LLM to cite facts *strictly* from provided snippets.
  - Emit bracketed source citations: `[DocName, Page X]`.
  - Enforce explicit admission of missing data if not found in context (zero hallucination).

### 5. Dual-Pane Investor Web UI (`ui/`)
- Layout: Modern dark-mode interface.
  - Left Pane: Interactive streaming chat with citation badges.
  - Right Pane: Embedded PDF/image viewer that jumps to the cited page and overlays bounding-box highlights upon clicking a citation badge.
- Offline Capability: All CSS, fonts, and JS libraries bundled locally (zero CDN dependencies).

---

## Initial Execution Command
Begin by generating the root `docker-compose.yml`, the environment configuration file `.env.example`, and the `services/ingestion/parser.py` implementation.