"""
AirGap Appliance - Grounded Inference Runtime & Zero-Hallucination Guardrails.

Connects to the local air-gapped vLLM OpenAI-compatible server running
`Qwen 2.5 14B-Instruct (AWQ)` (~9.5 GB VRAM) and enforces:
1. Strict context-grounding to Top-5 reranked snippets only.
2. Mandatory bracketed citations in the exact format `[DocName, Page X]`.
3. Explicit admission of missing information when context is insufficient.
4. Post-generation citation verification linking `[DocName, Page X]` badges to exact PDF bounding boxes.
"""

from __future__ import annotations

import json
import logging
import os
import re
from typing import Any, AsyncGenerator, Dict, List, Optional

import httpx

from services.retrieval.hybrid_search import RetrievedChunk

logger = logging.getLogger("airgap.inference.engine")


STRICT_GROUNDED_SYSTEM_PROMPT = """You are the AIRGAP Technical Document Intelligence Engine, an offline, zero-telemetry engineering assistant operating inside an air-gapped defense/industrial enclave.

### MANDATORY OPERATIONAL GUARDRAILS (ZERO-HALLUCINATION POLICY):
1. **STRICT CONTEXT CONFINEMENT**: You must answer the user's question using *ONLY* the facts, specifications, tables, part numbers, and procedures explicitly present in the `<RETRIEVED_EVIDENCE>` blocks below. Do NOT use prior training knowledge, external assumptions, or extrapolation.
2. **MANDATORY BRACKETED CITATIONS**: Every factual claim, numerical tolerance, torque value, MIL-SPEC, part number, or procedure step MUST be immediately followed by a bracketed citation in the exact format:
   `[DocName, Page X]`
   Example: `Tighten the primary manifold retaining bolts to 45 Nm (33 lb-ft) in a star pattern [TM-9-2320-360.pdf, Page 142].`
3. **EXPLICIT ADMISSION OF MISSING DATA**: If the provided `<RETRIEVED_EVIDENCE>` blocks do not contain sufficient information to answer the query (or a specific sub-part of the query), you MUST state verbatim:
   `INSUFFICIENT GROUNDED EVIDENCE: The indexed technical documentation does not contain verified data for this request.`
   Never guess, fabricate, or approximate missing engineering parameters.
4. **TABLE & SCHEMATIC FIDELITY**: Preserve exact Markdown table structures, units of measure, warning callouts, and security classification markings from the source snippets.
"""


class GroundedInferenceEngine:
    """
    Client and guardrail validator for local vLLM Qwen 2.5 14B-Instruct inference.
    """

    CITATION_REGEX = re.compile(
        r"\[(?P<doc>[^,\[\]]+?),\s*Page\s*(?P<page>\d+)\]",
        re.IGNORECASE,
    )

    REFUSAL_STATEMENT = (
        "INSUFFICIENT GROUNDED EVIDENCE: The indexed technical documentation "
        "does not contain verified data for this request."
    )

    def __init__(
        self,
        vllm_base_url: Optional[str] = None,
        vllm_api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        min_rerank_score: Optional[float] = None,
    ) -> None:
        self.vllm_base_url = (
            vllm_base_url or os.getenv("VLLM_BASE_URL", "http://localhost:8000/v1")
        ).rstrip("/")
        self.vllm_api_key = vllm_api_key or os.getenv("VLLM_API_KEY", "airgap-local-token")
        self.model_name = model_name or os.getenv("LLM_MODEL_NAME", "qwen2.5-14b-instruct")
        self.min_rerank_score = float(
            min_rerank_score
            if min_rerank_score is not None
            else os.getenv("RERANK_MIN_SCORE_THRESHOLD", "-2.5")
        )

    @staticmethod
    def format_context_window(chunks: List[RetrievedChunk]) -> str:
        """Format the Top-5 reranked chunks into a structured `<RETRIEVED_EVIDENCE>` block."""
        if not chunks:
            return "<RETRIEVED_EVIDENCE>\nNONE\n</RETRIEVED_EVIDENCE>"

        blocks: List[str] = ["<RETRIEVED_EVIDENCE>"]
        for idx, chunk in enumerate(chunks, start=1):
            section_str = " > ".join(chunk.hierarchy_path) if chunk.hierarchy_path else "Root"
            bbox_str = json.dumps(chunk.bounding_box)
            blocks.append(
                f"--- SNIPPET {idx} ---\n"
                f"Citation Tag: [{chunk.source_file}, Page {chunk.page_number}]\n"
                f"Security Classification: {chunk.security_classification}\n"
                f"Section Hierarchy: {section_str}\n"
                f"Element Type: {chunk.element_type}\n"
                f"Bounding Box: {bbox_str}\n"
                f"Content:\n{chunk.text}\n"
            )
        blocks.append("</RETRIEVED_EVIDENCE>")
        return "\n".join(blocks)

    def build_messages(self, query: str, chunks: List[RetrievedChunk]) -> List[Dict[str, str]]:
        """Assemble the system prompt and grounded user prompt for Qwen 2.5 14B-Instruct."""
        context_block = self.format_context_window(chunks)
        user_content = (
            f"{context_block}\n\n"
            f"### ENGINEER QUERY:\n{query}\n\n"
            "Provide a rigorous, citation-grounded response using ONLY `[DocName, Page X]` tags "
            "from `<RETRIEVED_EVIDENCE>`, or emit the mandatory refusal statement if evidence is missing."
        )
        return [
            {"role": "system", "content": STRICT_GROUNDED_SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ]

    def verify_and_resolve_citations(
        self,
        response_text: str,
        chunks: List[RetrievedChunk],
    ) -> List[Dict[str, Any]]:
        """
        Parse all `[DocName, Page X]` citations in the LLM output and bind each one
        to its verified RetrievedChunk and PDF bounding box for the Dual-Pane UI.
        """
        resolved: List[Dict[str, Any]] = []
        seen_keys = set()

        for match in self.CITATION_REGEX.finditer(response_text):
            doc_name = match.group("doc").strip()
            page_num = int(match.group("page"))
            key = (doc_name.lower(), page_num)
            if key in seen_keys:
                continue

            matched_chunk = next(
                (
                    c
                    for c in chunks
                    if c.source_file.lower() == doc_name.lower() and c.page_number == page_num
                ),
                None,
            )
            if matched_chunk is not None:
                seen_keys.add(key)
                resolved.append(
                    {
                        "citation_tag": f"[{matched_chunk.source_file}, Page {matched_chunk.page_number}]",
                        "source_file": matched_chunk.source_file,
                        "page_number": matched_chunk.page_number,
                        "bounding_box": matched_chunk.bounding_box,
                        "security_classification": matched_chunk.security_classification,
                        "element_type": matched_chunk.element_type,
                        "hierarchy_path": matched_chunk.hierarchy_path,
                        "chunk_id": matched_chunk.chunk_id,
                        "rerank_score": matched_chunk.rerank_score,
                        "snippet_preview": matched_chunk.text[:320],
                    }
                )
        return resolved

    async def generate_grounded_response(
        self,
        query: str,
        chunks: List[RetrievedChunk],
        temperature: float = 0.0,
        max_tokens: int = 1024,
    ) -> Dict[str, Any]:
        """Generate a non-streaming grounded response with guardrail validation."""
        usable_chunks = [c for c in chunks if c.rerank_score >= self.min_rerank_score]
        if not usable_chunks:
            return {
                "answer": self.REFUSAL_STATEMENT,
                "verified_citations": [],
                "retrieved_chunks": [c.to_dict() for c in chunks],
                "guardrail_triggered": True,
            }

        messages = self.build_messages(query, usable_chunks)
        headers = {
            "Authorization": f"Bearer {self.vllm_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "top_p": 1.0,
            "stream": False,
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{self.vllm_base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()

        answer = data["choices"][0]["message"]["content"].strip()
        verified_citations = self.verify_and_resolve_citations(answer, usable_chunks)

        # Enforce zero-hallucination guardrail if LLM emitted claims without valid citations
        if (
            not verified_citations
            and "INSUFFICIENT GROUNDED EVIDENCE" not in answer.upper()
        ):
            logger.warning("Guardrail triggered: LLM response lacked verifiable citations.")
            answer = self.REFUSAL_STATEMENT

        return {
            "answer": answer,
            "verified_citations": verified_citations,
            "retrieved_chunks": [c.to_dict() for c in usable_chunks],
            "guardrail_triggered": "INSUFFICIENT GROUNDED EVIDENCE" in answer.upper(),
        }

    async def stream_grounded_response(
        self,
        query: str,
        chunks: List[RetrievedChunk],
        temperature: float = 0.0,
        max_tokens: int = 1024,
    ) -> AsyncGenerator[str, None]:
        """
        Stream Server-Sent Events (SSE) containing retrieved citation metadata followed by
        token-by-token grounded LLM generation.
        """
        usable_chunks = [c for c in chunks if c.rerank_score >= self.min_rerank_score]

        # Emit initial metadata frame with Top-5 chunks and bounding boxes for the UI
        metadata_event = {
            "type": "context_chunks",
            "chunks": [c.to_dict() for c in usable_chunks],
        }
        yield f"data: {json.dumps(metadata_event)}\n\n"

        if not usable_chunks:
            token_event = {"type": "token", "content": self.REFUSAL_STATEMENT}
            yield f"data: {json.dumps(token_event)}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'verified_citations': []})}\n\n"
            return

        messages = self.build_messages(query, usable_chunks)
        headers = {
            "Authorization": f"Bearer {self.vllm_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }

        accumulated_text: List[str] = []
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{self.vllm_base_url}/chat/completions",
                headers=headers,
                json=payload,
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    raw_data = line[len("data: ") :].strip()
                    if raw_data == "[DONE]":
                        break
                    try:
                        chunk_json = json.loads(raw_data)
                        delta = chunk_json["choices"][0].get("delta", {}).get("content", "")
                        if delta:
                            accumulated_text.append(delta)
                            yield f"data: {json.dumps({'type': 'token', 'content': delta})}\n\n"
                    except Exception:
                        continue

        full_answer = "".join(accumulated_text)
        verified_citations = self.verify_and_resolve_citations(full_answer, usable_chunks)
        done_event = {
            "type": "done",
            "verified_citations": verified_citations,
        }
        yield f"data: {json.dumps(done_event)}\n\n"
