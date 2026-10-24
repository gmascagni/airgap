# AirVault (Air GAP) — Zero-Trust Air-Gapped Enterprise AI Appliance

**Generative AI Intelligence for Zero-Trust Air-Gapped Perimeters.**

AirVault is a turn-key, containerized AI appliance and technical document intelligence stack purpose-built for physically disconnected defense, aerospace, semiconductor, nuclear, and critical infrastructure environments.

---

## Live Static Showcase & GitHub Pages Bundle
- **Repository:** [https://github.com/gmascagni/airgap](https://github.com/gmascagni/airgap)
- **Static Export Bundle:** Pre-built in [`/out`](./out) and [`/docs`](./docs) (with `.nojekyll` and GitHub Actions workflow [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml)).

---

## Core Architecture

1. **Zero External Telemetry (`docker-compose.yml`):**
   - Runs on an isolated internal bridge network (`internal: true`) with zero default gateway, zero licensing phone-homes, and Ed25519 offline license verification.
2. **Layout-Aware Multi-Modal Ingestion (`services/ingestion/parser.py`):**
   - Powered by IBM Docling (`TableFormerMode.ACCURATE`) and Surya OCR fallback to extract complex engineering tables as clean Markdown, preserve `Header 1 -> Header 2 -> Procedure Steps` hierarchy, and link CAD/schematic bounding boxes.
3. **Dual-Stage Hybrid Search & Reranking (`services/retrieval/hybrid_search.py`):**
   - **Stage 1:** Parallel dense vector retrieval in Qdrant (`BAAI/bge-large-en-v1.5`, Top 30) + sparse lexical BM25 lookup in OpenSearch (`technical_spec_analyzer`, Top 30) merged via Reciprocal Rank Fusion (`RRF k=60`).
   - **Stage 2:** Cross-encoder pairwise scoring via `BAAI/bge-reranker-large` returning the Top 5 grounded chunks.
4. **Grounded Inference Runtime & Guardrails (`services/inference/engine.py`):**
   - Local vLLM OpenAI-compatible runtime serving quantized `Qwen 2.5 14B/72B-Instruct (AWQ)` with mandatory `[DocName, Page X]` citation verification and explicit refusal when evidence is absent.
5. **Marketing & Dual-Pane Technical Showcase (`ui/`):**
   - Next.js 14 App Router (`output: 'export'`), Tailwind CSS, Lucide React icons, and Framer Motion animations exported to `/out`.
