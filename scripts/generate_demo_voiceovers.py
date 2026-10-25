"""
Generates studio-grade, hyper-realistic human neural voiceover MP3 files
for all 3 AirVault B2B Demo Reels (4 scenes each = 12 scene tracks + 3 full master tracks).

Uses Microsoft Azure Flagship Conversational Neural Voices via edge-tts:
- en-US-AndrewMultilingualNeural (Warm, Confident Executive Solutions Architect)
- en-US-AvaMultilingualNeural (Expressive, Natural Chief Engineer / CISO)
- en-US-BrianMultilingualNeural (Approachable, Sincere Field Systems Director)
"""

import asyncio
from pathlib import Path
import edge_tts

AUDIO_OUT_DIR = Path(__file__).resolve().parent.parent / "ui" / "public" / "audio"
AUDIO_OUT_DIR.mkdir(parents=True, exist_ok=True)

# Carefully written spoken scripts optimized for natural human prosody, breathing, and cadence
SCENE_SCRIPTS = [
    # ==========================================================================
    # REEL 1: THE NEEDLE IN THE 1,420-PAGE HAYSTACK
    # ==========================================================================
    {
        "filename": "reel-needle-scene-0.mp3",
        "voice": "en-US-AndrewMultilingualNeural",
        "rate": "+0%",
        "pitch": "+0Hz",
        "text": (
            "Here's what happens on day one inside your facility. "
            "An engineer simply drags and drops four completely different document types straight into AirVault... "
            "a fourteen-hundred-and-twenty-page scanned nineteen-eighty-nine turbine overhaul manual, "
            "a high-res CAD blueprint, a dense MIL-SPEC spreadsheet, and a brand-new engineering change order. "
            "Over two gigabytes of legacy data... staged locally with zero internet connection."
        ),
    },
    {
        "filename": "reel-needle-scene-1.mp3",
        "voice": "en-US-AndrewMultilingualNeural",
        "rate": "+0%",
        "pitch": "+0Hz",
        "text": (
            "Immediately, our local NVIDIA Blackwell GPUs spin up IBM Docling and Surya O-C-R. "
            "Instead of chopping pages into blind text blocks, it visually reconstructs skewed nine-column tables into clean Markdown, "
            "links schematic callout bubbles, preserves every chapter and procedure header, "
            "and indexes over forty-five hundred chunks into both Qdrant vector search and OpenSearch B-M-twenty-five."
        ),
    },
    {
        "filename": "reel-needle-scene-2.mp3",
        "voice": "en-US-AvaMultilingualNeural",
        "rate": "-2%",
        "pitch": "+0Hz",
        "text": (
            "Now, let's test it with a real needle-in-a-haystack question: "
            "What is the maximum allowable axial play tolerance for the Stage-Three labyrinth seal under minus one-hundred-ninety-six degree cryogenic shock... "
            "and what superseding part number is mandated by Footnote Seventeen?"
        ),
    },
    {
        "filename": "reel-needle-scene-3.mp3",
        "voice": "en-US-AndrewMultilingualNeural",
        "rate": "+0%",
        "pitch": "+0Hz",
        "text": (
            "In one point four seconds, AirVault cross-encodes sixty candidates, locks onto Page eleven-eighty-four out of fourteen-hundred-twenty, "
            "and jumps the PDF viewer straight to Table nineteen-fourteen. "
            "Right there in the amber bounding box is Footnote Seventeen: zero-point-zero-one-eight millimeters axial play, "
            "superseded by part number N-A-S-eleven-forty-nine, dash F-zero-eight-thirty-two-P. "
            "Zero guessing. Zero hallucination."
        ),
    },

    # ==========================================================================
    # REEL 2: THE ZERO-TRUST CLEARANCE WALL (CISO & ABAC PITCH)
    # ==========================================================================
    {
        "filename": "reel-abac-scene-0.mp3",
        "voice": "en-US-BrianMultilingualNeural",
        "rate": "+0%",
        "pitch": "+0Hz",
        "text": (
            "When we talk to Defense CISOs, their number one concern isn't just keeping data off the cloud... "
            "it's preventing a lower-cleared subcontractor from asking the local A-I a question that leaks classified specs. "
            "Watch how AirVault stamps every single document chunk with its exact security banner during ingestion."
        ),
    },
    {
        "filename": "reel-abac-scene-1.mp3",
        "voice": "en-US-AvaMultilingualNeural",
        "rate": "+0%",
        "pitch": "+0Hz",
        "text": (
            "Here, two engineers sit at the exact same appliance and insert their C-A-C smartcards. "
            "Operator A holds Secret, I-TAR clearance. "
            "Operator B is a Tier-Two subcontractor cleared only for C-U-I. "
            "Both type the exact same propulsion seal tolerance prompt."
        ),
    },
    {
        "filename": "reel-abac-scene-2.mp3",
        "voice": "en-US-BrianMultilingualNeural",
        "rate": "+0%",
        "pitch": "+0Hz",
        "text": (
            "Before the local language model ever sees a single token, AirVault enforces Attribute-Based Access Control directly inside Qdrant and OpenSearch. "
            "Restricted Secret chunks are mathematically blocked from even entering Operator B's retrieval pipeline."
        ),
    },
    {
        "filename": "reel-abac-scene-3.mp3",
        "voice": "en-US-AndrewMultilingualNeural",
        "rate": "+0%",
        "pitch": "+0Hz",
        "text": (
            "Look at the split screen result: the cleared Chief Engineer gets the full Page eleven-eighty-four cryogenic schematic and part number. "
            "Meanwhile, the subcontractor receives only C-U-I authorized procedures and an explicit clearance boundary notice. "
            "Complete compartment isolation, verified for C-M-M-C Level Three."
        ),
    },

    # ==========================================================================
    # REEL 3: THE 35-YEAR ENGINEERING CONTRADICTION CATCHER
    # ==========================================================================
    {
        "filename": "reel-contradiction-scene-0.mp3",
        "voice": "en-US-AndrewMultilingualNeural",
        "rate": "+0%",
        "pitch": "+0Hz",
        "text": (
            "In aerospace and nuclear plants, your biggest liability is a thirty-five-year-old manual that was quietly modified by an Engineering Change Order ten years later. "
            "When you drop both legacy archives and modern bulletins into AirVault, it connects them automatically."
        ),
    },
    {
        "filename": "reel-contradiction-scene-1.mp3",
        "voice": "en-US-AvaMultilingualNeural",
        "rate": "+0%",
        "pitch": "+0Hz",
        "text": (
            "During parsing, AirVault's metadata extractor pulls every MIL-SPEC, National Stock Number, and drawing tag... "
            "automatically linking part number M-S-ninety-seven-twenty-five on Page eleven-eighty-four of the nineteen-eighty-nine manual "
            "to this morning's Engineering Change Order, E-C-O twenty-twenty-six dash zero-eight-nine."
        ),
    },
    {
        "filename": "reel-contradiction-scene-2.mp3",
        "voice": "en-US-AndrewMultilingualNeural",
        "rate": "+0%",
        "pitch": "+0Hz",
        "text": (
            "When a technician on the shop floor asks for the seal assembly spec, "
            "our Cross-Encoder Reranker surfaces both the original nineteen-eighty-nine table and the twenty-twenty-six change notice together in the Top-Five context window."
        ),
    },
    {
        "filename": "reel-contradiction-scene-3.mp3",
        "voice": "en-US-BrianMultilingualNeural",
        "rate": "+0%",
        "pitch": "+0Hz",
        "text": (
            "Instead of blindly repeating an obsolete spec, AirVault flags the revision conflict immediately... "
            "showing the baseline manual on Page eleven-eighty-four alongside the mandatory twenty-twenty-six part replacement. "
            "Turning hours of manual cross-checking into a two-second safety check."
        ),
    },
]


async def generate_all():
    for item in SCENE_SCRIPTS:
        out_path = AUDIO_OUT_DIR / item["filename"]
        if out_path.exists() and out_path.stat().st_size > 10_000:
            print(f"Already exists: {out_path.name} ({out_path.stat().st_size:,} bytes)")
            continue
        for attempt in range(4):
            try:
                communicate = edge_tts.Communicate(
                    text=item["text"],
                    voice=item["voice"],
                    rate=item["rate"],
                    pitch=item["pitch"],
                )
                await communicate.save(str(out_path))
                print(f"Generated: {out_path.name} ({out_path.stat().st_size:,} bytes)")
                await asyncio.sleep(0.8)
                break
            except Exception as e:
                print(f"Retry {attempt + 1} for {out_path.name}: {e}")
                await asyncio.sleep(1.5)

    # Also stitch the 4 scene MP3s of each reel into a full-reel master MP3 for the audio archive player
    for reel_prefix in ["reel-needle", "reel-abac", "reel-contradiction"]:
        master_path = AUDIO_OUT_DIR / f"{reel_prefix}-full.mp3"
        with open(master_path, "wb") as master_f:
            for idx in range(4):
                scene_path = AUDIO_OUT_DIR / f"{reel_prefix}-scene-{idx}.mp3"
                master_f.write(scene_path.read_bytes())
        print(f"Stitched Full Reel Master: {master_path.name} ({master_path.stat().st_size:,} bytes)")


if __name__ == "__main__":
    asyncio.run(generate_all())
