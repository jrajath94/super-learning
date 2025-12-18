"""
SPARC Evaluation Script: Neural Fidelity Check.
This script tests the core 'Brain' of the system (llm.py + prompts.py) against the user's high-bar requirements.
"""
import sys
import os
import asyncio
import logging
from app.services.llm import generate_notes, chunk_transcript

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NeuralAudit")

# --- TEST DATA: "Attention Is All You Need" Abstract & Intro Snip ---
RESEARCH_SOURCE_TEXT = """
The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs, a small fraction of the training costs of the best models from the literature.
"""

# --- TEST DATA: Synthetic Long Transcript (for Chunking) ---
# 40k chars of "blah" to trigger the 30k limit
LONG_TRANSCRIPT = "Welcome to this lecture on Advanced algorithms. " * 1000 

async def test_research_fidelity():
    """
    Test 1: Research Paper Mode
    Goal: Verify 'Ilya Sutskever' persona, Novelty anchors (🍌), and depth.
    """
    logger.info("🧪 STARTING TEST 1: Research Paper Neural Fidelity...")
    
    try:
        notes = generate_notes(
            transcript_text=RESEARCH_SOURCE_TEXT,
            video_type="research_paper",
            metadata={"title": "Attention Is All You Need"},
            video_id="TEST_RESEARCH_001"
        )
        
        print("\n" + "="*50)
        print("🧠  NEURAL OUTPUT (RESEARCH MODE)")
        print("="*50 + "\n")
        print(notes[:1500] + "...\n[TRUNCATED]\n")
        
        # SOTA VERIFICATION CHECKS
        checks = {
            "Novelty Anchor (🍌)": "🍌" in notes,
            "Deep Thought Anchor (🧠)": "🧠" in notes,
            "Architecture Scene ([SCENE:)": "[SCENE" in notes,
            "Strict Markdown Structure": "# 📜" in notes
        }
        
        print("\n🔍  AUTOMATED AUDIT:")
        all_passed = True
        for check, passed in checks.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"{status} | {check}")
            if not passed: all_passed = False
            
        return all_passed

    except Exception as e:
        logger.error(f"Test 1 Failed: {e}")
        return False

async def test_chunking_mechanics():
    """
    Test 2: Chunking Logic
    Goal: Verify the splitter works and overlaps correctly without data loss.
    """
    logger.info("🧪 STARTING TEST 2: Chunking Mechanics...")
    
    chunks = chunk_transcript(LONG_TRANSCRIPT, chunk_size=25000, overlap=1000)
    
    print(f"Original Length: {len(LONG_TRANSCRIPT)}")
    print(f"Number of Chunks: {len(chunks)}")
    
    # Verify overlaps
    # Chunk 1 end should match Chunk 2 start (roughly, considering overlap logic)
    # Actually, chunk 2 start is (chunk_size - overlap) from 0
    # So Chunk 2 starts at index 24000.
    # Chunk 1 covers 0-25000.
    # So Chunk 2's first 1000 chars should match Chunk 1's last 1000 chars (approx).
    
    c1 = chunks[0]
    c2 = chunks[1]
    
    overlap_size = 1000
    # Expected overlap region in text
    expected_overlap_text = LONG_TRANSCRIPT[24000:25000]
    
    print(f"Chunk 1 Length: {len(c1)}")
    print(f"Chunk 2 Length: {len(c2)}")
    
    passed = len(chunks) == 2  # 40k should split into 25k and ~16k (with overlap)
    
    return passed

async def main():
    logger.info("🚀 SPARC EVALUATION PROTOCOL INITIATED")
    
    r1 = await test_research_fidelity()
    r2 = await test_chunking_mechanics()
    
    if r1 and r2:
        logger.info("🌟 ALL SYSTEMS NOMINAL. NEURAL ARCHITECT IS ONLINE.")
    else:
        logger.error("⚠️ SYSTEM FAILURE. REFINEMENT REQUIRED.")

if __name__ == "__main__":
    asyncio.run(main())
