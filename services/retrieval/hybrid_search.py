"""
AirGap Appliance - Two-Stage Hybrid Retrieval & Cross-Encoder Reranking.

Stage 1 (Parallel Retrieval):
  - Dense semantic vector query against Qdrant using `BAAI/bge-large-en-v1.5` (Top 30).
  - Sparse lexical BM25 query against OpenSearch for exact part numbers, MIL-SPECs, and serial tags (Top 30).
  - Candidate fusion via Reciprocal Rank Fusion (RRF, k=60).

Stage 2 (Cross-Encoder Re-scoring):
  - Score fused candidates against the user query using `BAAI/bge-reranker-large` (~1.2 GB VRAM).
  - Return the Top 5 highest-confidence grounded chunks to the LLM context window.
"""

from __future__ import annotations

import asyncio
import logging
import os
import uuid
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from services.ingestion.parser import DocumentChunk

logger = logging.getLogger("airgap.retrieval.hybrid_search")

os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")


@dataclass
class RetrievedChunk:
    """Ranked chunk returned by the two-stage retrieval & cross-encoder pipeline."""

    chunk_id: str
    text: str
    source_file: str
    page_number: int
    bounding_box: Dict[str, Any]
    security_classification: str
    element_type: str
    hierarchy_path: List[str]
    callout_captions: List[str]
    part_numbers: List[str]
    dense_rank: Optional[int] = None
    sparse_rank: Optional[int] = None
    rrf_score: float = 0.0
    rerank_score: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "text": self.text,
            "source_file": self.source_file,
            "page_number": self.page_number,
            "bounding_box": self.bounding_box,
            "security_classification": self.security_classification,
            "element_type": self.element_type,
            "hierarchy_path": self.hierarchy_path,
            "callout_captions": self.callout_captions,
            "part_numbers": self.part_numbers,
            "dense_rank": self.dense_rank,
            "sparse_rank": self.sparse_rank,
            "rrf_score": round(self.rrf_score, 6),
            "rerank_score": round(self.rerank_score, 4),
        }


class HybridRetriever:
    """
    Production two-stage retriever combining Qdrant (dense), OpenSearch (BM25 sparse),
    Reciprocal Rank Fusion (RRF), and BAAI/bge-reranker-large cross-encoder scoring.
    """

    BGE_QUERY_INSTRUCTION = "Represent this sentence for searching relevant passages: "
    EMBEDDING_DIMENSION = 1024

    def __init__(
        self,
        qdrant_host: Optional[str] = None,
        qdrant_port: Optional[int] = None,
        qdrant_collection: Optional[str] = None,
        opensearch_host: Optional[str] = None,
        opensearch_port: Optional[int] = None,
        opensearch_index: Optional[str] = None,
        embedding_model_path: Optional[str] = None,
        reranker_model_path: Optional[str] = None,
        device: Optional[str] = None,
    ) -> None:
        self.qdrant_host = qdrant_host or os.getenv("QDRANT_HOST", "localhost")
        self.qdrant_port = int(qdrant_port or os.getenv("QDRANT_PORT", "6333"))
        self.qdrant_collection = qdrant_collection or os.getenv(
            "QDRANT_COLLECTION", "technical_manuals"
        )

        self.opensearch_host = opensearch_host or os.getenv("OPENSEARCH_HOST", "localhost")
        self.opensearch_port = int(opensearch_port or os.getenv("OPENSEARCH_PORT", "9200"))
        self.opensearch_index = opensearch_index or os.getenv(
            "OPENSEARCH_INDEX", "technical_manuals_bm25"
        )

        self.embedding_model_path = embedding_model_path or os.getenv(
            "EMBEDDING_MODEL_PATH", "/models/embedding/bge-large-en-v1.5"
        )
        self.reranker_model_path = reranker_model_path or os.getenv(
            "RERANKER_MODEL_PATH", "/models/reranker/bge-reranker-large"
        )
        self.device = device or os.getenv("EMBEDDING_DEVICE", "cuda")

        self.dense_top_k = int(os.getenv("DENSE_TOP_K", "30"))
        self.sparse_top_k = int(os.getenv("SPARSE_TOP_K", "30"))
        self.rrf_k = int(os.getenv("RRF_K_CONSTANT", "60"))
        self.rerank_top_k = int(os.getenv("RERANK_TOP_K", "5"))

        self._qdrant: Any = None
        self._opensearch: Any = None
        self._embedder: Any = None
        self._reranker: Any = None
        self._executor = ThreadPoolExecutor(max_workers=4)

    def _get_qdrant(self) -> Any:
        if self._qdrant is None:
            from qdrant_client import QdrantClient

            self._qdrant = QdrantClient(
                host=self.qdrant_host,
                port=self.qdrant_port,
                timeout=30,
            )
        return self._qdrant

    def _get_opensearch(self) -> Any:
        if self._opensearch is None:
            from opensearchpy import OpenSearch

            self._opensearch = OpenSearch(
                hosts=[{"host": self.opensearch_host, "port": self.opensearch_port}],
                use_ssl=False,
                verify_certs=False,
                timeout=30,
            )
        return self._opensearch

    def _get_embedder(self) -> Any:
        """Load BAAI/bge-large-en-v1.5 in FP16 (~1.5 GB VRAM) from local air-gapped weights."""
        if self._embedder is None:
            import torch
            from sentence_transformers import SentenceTransformer

            target_device = (
                self.device if (self.device == "cuda" and torch.cuda.is_available()) else "cpu"
            )
            model_kwargs = {"torch_dtype": torch.float16} if target_device == "cuda" else {}
            self._embedder = SentenceTransformer(
                self.embedding_model_path,
                device=target_device,
                local_files_only=True,
                model_kwargs=model_kwargs,
            )
            logger.info(
                "Loaded dense embedding model '%s' on %s", self.embedding_model_path, target_device
            )
        return self._embedder

    def _get_reranker(self) -> Any:
        """Load BAAI/bge-reranker-large in FP16 (~1.2 GB VRAM) from local air-gapped weights."""
        if self._reranker is None:
            import torch
            from sentence_transformers import CrossEncoder

            target_device = (
                self.device if (self.device == "cuda" and torch.cuda.is_available()) else "cpu"
            )
            automodel_args = {"torch_dtype": torch.float16} if target_device == "cuda" else {}
            self._reranker = CrossEncoder(
                self.reranker_model_path,
                device=target_device,
                max_length=512,
                local_files_only=True,
                automodel_args=automodel_args,
            )
            logger.info(
                "Loaded cross-encoder reranker '%s' on %s", self.reranker_model_path, target_device
            )
        return self._reranker

    def ensure_indices(self) -> None:
        """Initialize Qdrant vector collection and OpenSearch BM25 index if not already present."""
        from qdrant_client.http import models as qmodels

        qdrant = self._get_qdrant()
        existing = [c.name for c in qdrant.get_collections().collections]
        if self.qdrant_collection not in existing:
            qdrant.create_collection(
                collection_name=self.qdrant_collection,
                vectors_config=qmodels.VectorParams(
                    size=self.EMBEDDING_DIMENSION,
                    distance=qmodels.Distance.COSINE,
                    on_disk=False,
                ),
            )
            logger.info("Created Qdrant collection '%s' (1024d Cosine).", self.qdrant_collection)

        os_client = self._get_opensearch()
        if not os_client.indices.exists(index=self.opensearch_index):
            index_body = {
                "settings": {
                    "index": {
                        "number_of_shards": 1,
                        "number_of_replicas": 0,
                        "similarity": {
                            "default": {
                                "type": "BM25",
                                "b": 0.75,
                                "k1": 1.5,
                            }
                        },
                    },
                    "analysis": {
                        "analyzer": {
                            "technical_spec_analyzer": {
                                "type": "custom",
                                "tokenizer": "whitespace",
                                "filter": ["lowercase", "asciifolding"],
                            }
                        }
                    },
                },
                "mappings": {
                    "properties": {
                        "chunk_id": {"type": "keyword"},
                        "text": {
                            "type": "text",
                            "analyzer": "standard",
                            "fields": {
                                "exact_spec": {
                                    "type": "text",
                                    "analyzer": "technical_spec_analyzer",
                                }
                            },
                        },
                        "source_file": {"type": "keyword"},
                        "page_number": {"type": "integer"},
                        "security_classification": {"type": "keyword"},
                        "element_type": {"type": "keyword"},
                        "part_numbers": {"type": "keyword"},
                        "callout_captions": {"type": "text"},
                        "hierarchy_path": {"type": "keyword"},
                        "bounding_box": {"type": "object", "enabled": False},
                    }
                },
            }
            os_client.indices.create(index=self.opensearch_index, body=index_body)
            logger.info("Created OpenSearch BM25 index '%s'.", self.opensearch_index)

    def index_chunks(self, chunks: List[DocumentChunk]) -> int:
        """Embed and index a batch of DocumentChunks into both Qdrant and OpenSearch."""
        if not chunks:
            return 0

        self.ensure_indices()
        embedder = self._get_embedder()
        texts = [c.text for c in chunks]
        embeddings = embedder.encode(
            texts,
            batch_size=int(os.getenv("EMBEDDING_BATCH_SIZE", "32")),
            normalize_embeddings=True,
            show_progress_bar=False,
        )

        from qdrant_client.http import models as qmodels

        qdrant_points = []
        os_bulk_actions: List[Dict[str, Any]] = []

        for chunk, vector in zip(chunks, embeddings):
            payload = chunk.to_payload()
            point_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, chunk.chunk_id))
            qdrant_points.append(
                qmodels.PointStruct(
                    id=point_uuid,
                    vector=vector.tolist(),
                    payload=payload,
                )
            )
            os_bulk_actions.append({"index": {"_index": self.opensearch_index, "_id": chunk.chunk_id}})
            os_bulk_actions.append(payload)

        self._get_qdrant().upsert(
            collection_name=self.qdrant_collection,
            points=qdrant_points,
            wait=True,
        )

        os_client = self._get_opensearch()
        os_client.bulk(body=os_bulk_actions, refresh=True)
        logger.info("Indexed %d chunks into Qdrant and OpenSearch.", len(chunks))
        return len(chunks)

    def _search_dense_qdrant(
        self,
        query: str,
        top_k: int,
        security_filter: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Stage 1A: Dense semantic query against Qdrant using BAAI/bge-large-en-v1.5."""
        embedder = self._get_embedder()
        instructed_query = f"{self.BGE_QUERY_INSTRUCTION}{query}"
        query_vector = embedder.encode(
            instructed_query,
            normalize_embeddings=True,
            show_progress_bar=False,
        ).tolist()

        from qdrant_client.http import models as qmodels

        # N-09 Hardening: Fail-closed security filter; never permit unfiltered RAG retrieval
        sec_val = security_filter or os.getenv("DEFAULT_SECURITY_CLASSIFICATION", "CUI//NOFORN")
        q_filter = qmodels.Filter(
            must=[
                qmodels.FieldCondition(
                    key="security_classification",
                    match=qmodels.MatchValue(value=sec_val),
                )
            ]
        )

        results = self._get_qdrant().search(
            collection_name=self.qdrant_collection,
            query_vector=query_vector,
            query_filter=q_filter,
            limit=top_k,
            with_payload=True,
        )
        return [dict(hit.payload) for hit in results if hit.payload]

    def _search_sparse_bm25(
        self,
        query: str,
        top_k: int,
        security_filter: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Stage 1B: Sparse lexical BM25 query against OpenSearch boosting exact part/MIL-SPEC hits."""
        must_clauses: List[Dict[str, Any]] = [
            {
                "multi_match": {
                    "query": query,
                    "fields": [
                        "part_numbers^4.0",
                        "text.exact_spec^3.0",
                        "callout_captions^2.0",
                        "text^1.0",
                    ],
                    "type": "best_fields",
                    "operator": "or",
                }
            }
        ]
        filter_clauses: List[Dict[str, Any]] = []
        # N-09 Hardening: Fail-closed BM25 security filter; never permit unfiltered RAG retrieval
        sec_val = security_filter or os.getenv("DEFAULT_SECURITY_CLASSIFICATION", "CUI//NOFORN")
        filter_clauses.append({"term": {"security_classification": sec_val}})

        search_body = {
            "size": top_k,
            "query": {
                "bool": {
                    "must": must_clauses,
                    "filter": filter_clauses,
                }
            },
        }
        response = self._get_opensearch().search(index=self.opensearch_index, body=search_body)
        hits = response.get("hits", {}).get("hits", [])
        return [hit["_source"] for hit in hits if "_source" in hit]

    @staticmethod
    def reciprocal_rank_fusion(
        dense_results: List[Dict[str, Any]],
        sparse_results: List[Dict[str, Any]],
        rrf_k: int = 60,
    ) -> List[RetrievedChunk]:
        """
        Merge dense and sparse Top-K candidate lists using Reciprocal Rank Fusion (RRF):
          RRF_score(d) = 1 / (k + rank_dense(d)) + 1 / (k + rank_sparse(d))
        """
        fused: Dict[str, RetrievedChunk] = {}

        for rank_idx, payload in enumerate(dense_results, start=1):
            cid = payload["chunk_id"]
            chunk = RetrievedChunk(
                chunk_id=cid,
                text=payload["text"],
                source_file=payload["source_file"],
                page_number=int(payload["page_number"]),
                bounding_box=payload.get("bounding_box", {}),
                security_classification=payload.get("security_classification", "CUI//NOFORN"),
                element_type=payload.get("element_type", "narrative"),
                hierarchy_path=payload.get("hierarchy_path", []),
                callout_captions=payload.get("callout_captions", []),
                part_numbers=payload.get("part_numbers", []),
                dense_rank=rank_idx,
                rrf_score=1.0 / (rrf_k + rank_idx),
            )
            fused[cid] = chunk

        for rank_idx, payload in enumerate(sparse_results, start=1):
            cid = payload["chunk_id"]
            incremental_score = 1.0 / (rrf_k + rank_idx)
            if cid in fused:
                fused[cid].sparse_rank = rank_idx
                fused[cid].rrf_score += incremental_score
            else:
                fused[cid] = RetrievedChunk(
                    chunk_id=cid,
                    text=payload["text"],
                    source_file=payload["source_file"],
                    page_number=int(payload["page_number"]),
                    bounding_box=payload.get("bounding_box", {}),
                    security_classification=payload.get("security_classification", "CUI//NOFORN"),
                    element_type=payload.get("element_type", "narrative"),
                    hierarchy_path=payload.get("hierarchy_path", []),
                    callout_captions=payload.get("callout_captions", []),
                    part_numbers=payload.get("part_numbers", []),
                    sparse_rank=rank_idx,
                    rrf_score=incremental_score,
                )

        return sorted(fused.values(), key=lambda c: c.rrf_score, reverse=True)

    async def retrieve_and_rerank(
        self,
        query: str,
        dense_top_k: Optional[int] = None,
        sparse_top_k: Optional[int] = None,
        rerank_top_k: Optional[int] = None,
        security_filter: Optional[str] = None,
    ) -> List[RetrievedChunk]:
        """
        Execute Stage 1 (parallel Qdrant Top-30 + BM25 Top-30 -> RRF)
        followed by Stage 2 (BAAI/bge-reranker-large cross-encoder -> Top-5).
        """
        d_k = dense_top_k or self.dense_top_k
        s_k = sparse_top_k or self.sparse_top_k
        final_k = rerank_top_k or self.rerank_top_k

        loop = asyncio.get_running_loop()
        dense_future = loop.run_in_executor(
            self._executor, self._search_dense_qdrant, query, d_k, security_filter
        )
        sparse_future = loop.run_in_executor(
            self._executor, self._search_sparse_bm25, query, s_k, security_filter
        )
        dense_hits, sparse_hits = await asyncio.gather(dense_future, sparse_future)

        fused_candidates = self.reciprocal_rank_fusion(
            dense_results=dense_hits,
            sparse_results=sparse_hits,
            rrf_k=self.rrf_k,
        )
        if not fused_candidates:
            return []

        # Stage 2: Cross-Encoder Re-scoring with BAAI/bge-reranker-large
        reranker = self._get_reranker()
        sentence_pairs = [(query, cand.text) for cand in fused_candidates]
        scores = await loop.run_in_executor(
            self._executor,
            lambda: reranker.predict(
                sentence_pairs,
                batch_size=int(os.getenv("RERANKER_BATCH_SIZE", "16")),
                show_progress_bar=False,
            ),
        )

        for candidate, score in zip(fused_candidates, scores):
            candidate.rerank_score = float(score)

        reranked = sorted(fused_candidates, key=lambda c: c.rerank_score, reverse=True)
        return reranked[:final_k]
