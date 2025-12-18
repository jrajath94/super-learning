import google.generativeai as genai
import os
import logging
import time
import math
from app.core.logger import archive_interaction
from .prompts import STANFORD_PROMPT, DSA_PROMPT, PODCAST_PROMPT, CHEATSHEET_PROMPT, DETAILED_CHUNK_PROMPT, DSA_CHUNK_PROMPT, PODCAST_CHUNK_PROMPT
from google.api_core import exceptions as google_exceptions

logger = logging.getLogger(__name__)

# Configure API Key
GENAI_API_KEY = os.getenv("GENAI_API_KEY", "AIzaSyBHjwwkKTwseGPiLL5pj4YRbIa6ITK19MU")
genai.configure(api_key=GENAI_API_KEY)

# Model Configuration - Optimized for long-form, detailed content
GENERATION_CONFIG = {
    "temperature": 0.4,  # Lower for more focused, technical content
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,  # Maximum allowed for comprehensive notes
    "response_mime_type": "text/plain",
}

MODEL_NAME = "gemini-2.5-pro"

def retry_with_backoff(model, prompt, video_id, max_retries=3):
    """Retry with exponential backoff for transient errors."""
    for attempt in range(max_retries):
        wait_time = 2 ** attempt  # 1s, 2s, 4s
        logger.info(f"Retry attempt {attempt + 1}/{max_retries} after {wait_time}s...")
        time.sleep(wait_time)
        
        try:
            response_chunks = []
            response = model.generate_content(prompt, stream=True)
            for chunk in response:
                if hasattr(chunk, 'text'):
                    response_chunks.append(chunk.text)
            
            full_response = "".join(response_chunks)
            # Only archive if it's a full request, not chunks (chunks archived in main loop)
            if "CHUNKED_PROCESSING" not in video_id:
                 archive_interaction(video_id, prompt, full_response)
            
            logger.info(f"Retry successful on attempt {attempt + 1}")
            return full_response
            
        except Exception as e:
            logger.warning(f"Retry {attempt + 1} failed: {e}")
            if attempt == max_retries - 1:
                return f"Error: Failed after {max_retries} retries. Last error: {str(e)}"
    
    return "Error: Max retries exceeded"

def chunk_transcript(transcript: str, chunk_size: int = 25000, overlap: int = 1000) -> list[str]:
    """
    Splits transcript into chunks with significant overlap to preserve context.
    """
    chunks = []
    start = 0
    while start < len(transcript):
        end = start + chunk_size
        chunks.append(transcript[start:end])
        # Move forward by chunk_size minus overlap
        start += (chunk_size - overlap)
    return chunks

def generate_notes(transcript_text: str, video_type: str, metadata: dict = None, video_id: str = "unknown") -> str:
    """
    Generates notes based on the video type and transcript using STREAMING.
    Handles long videos by chunking with intelligent context handover.
    """
    logger.info(f"Initializing Gemini model: {MODEL_NAME}")
    model = genai.GenerativeModel(
        model_name=MODEL_NAME,
        generation_config=GENERATION_CONFIG,
    )

    # Check if video is long (> 20 mins approx, or > 30k chars)
    if len(transcript_text) > 30000:
        logger.info(f"📜 Long video detected ({len(transcript_text)} chars). Switching to NEURAL CHUNKED processing.")
        chunks = chunk_transcript(transcript_text)
        full_notes = []
        
        logger.info(f"Processing {len(chunks)} overlapping chunks...")
        
        # Select the correct chunk prompt based on video type
        if video_type == 'dsa':
            base_chunk_prompt = DSA_CHUNK_PROMPT
        elif video_type == 'podcast':
            base_chunk_prompt = PODCAST_CHUNK_PROMPT
        else:
            base_chunk_prompt = DETAILED_CHUNK_PROMPT
        
        # Context buffer to maintain continuity
        previous_context_summary = ""
        
        for i, chunk in enumerate(chunks):
            logger.info(f"🔄 Processing chunk {i+1}/{len(chunks)}...")
            
            chunk_prompt = f"""
{base_chunk_prompt}

**Process Context:**
*   **Video Title**: {metadata.get('title', 'Unknown')}
*   **Segment**: {i+1} of {len(chunks)}
*   **Previous Context**: {previous_context_summary or "Start of video"}

**Current Transcript Segment**:
{chunk}

**Instructions for Continuity**:
1.  Connect intuitively with the "Previous Context".
2.  Do NOT repeat introductions if this is not the first chunk.
3.  End with a smooth transition to the next topic.
"""
            try:
                # Use retry logic for each chunk
                chunk_response = retry_with_backoff(model, chunk_prompt, f"{video_id}_part_{i+1}")
                full_notes.append(chunk_response)
                
                # Update context for next chunk (Extract last 500 chars of intuition)
                previous_context_summary = chunk_response[-500:] if len(chunk_response) > 500 else chunk_response
                
                logger.info(f"✅ Chunk {i+1} completed.")
            except Exception as e:
                logger.error(f"❌ Failed to process chunk {i+1}: {e}")
                full_notes.append(f"\n\n[Missing Section {i+1} due to error: {str(e)}]\n\n")
        
        # Combine all notes
        combined_notes = "\n\n---\n\n".join(full_notes)
        
        # Add a header
        final_output = f"# Detailed Lecture Notes: {metadata.get('title', 'Unknown')}\n\n" + combined_notes
        
        # Archive the full interaction
        archive_interaction(video_id, "CHUNKED_PROCESSING", final_output)
        
        return final_output

    logger.info(f"Selecting prompt for video type: {video_type}")
    if video_type == 'stanford':
        system_prompt = STANFORD_PROMPT
    elif video_type == 'dsa':
        system_prompt = DSA_PROMPT
    elif video_type == 'podcast':
        system_prompt = PODCAST_PROMPT
    elif video_type == 'cheatsheet':
        system_prompt = CHEATSHEET_PROMPT
    else:
        system_prompt = STANFORD_PROMPT

    # Construct the full prompt
    full_prompt = f"""
{system_prompt}

**Video Metadata:**
Title: {metadata.get('title', 'Unknown')}
Duration: {metadata.get('duration', 'Unknown')} seconds

**Complete Lecture Transcript:**
{transcript_text}

---

Now generate comprehensive, world-class notes following the specified format. Remember:
- Cover EVERY concept mentioned in the transcript
- Use rich markdown formatting
- Make it visually engaging with emojis, bold, italics, tables
- Assume the reader has Andrew Ng's ML course background
- Be thorough and granular - this is a {metadata.get('duration', 0) // 60} minute lecture
"""

    try:
        logger.info(f"Sending STREAMING request to Gemini API. Input: {len(full_prompt)} chars, Transcript: {len(transcript_text)} chars")
        start_time = time.time()
        
        # Use streaming to prevent socket timeouts
        response_chunks = []
        logger.info("Starting streaming response...")
        response = model.generate_content(full_prompt, stream=True)
        
        chunk_count = 0
        for chunk in response:
            if hasattr(chunk, 'text'):
                response_chunks.append(chunk.text)
                chunk_count += 1
                if chunk_count % 10 == 0:
                    logger.debug(f"Received {chunk_count} chunks, total: {sum(len(c) for c in response_chunks)} chars")
        
        full_response = "".join(response_chunks)
        duration = time.time() - start_time
        logger.info(f"✅ Streaming completed in {duration:.2f}s. Received {chunk_count} chunks, {len(full_response)} total chars")
        
        # Archive the interaction
        archive_interaction(video_id, full_prompt, full_response)
        
        return full_response
        
    except google_exceptions.DeadlineExceeded as e:
        elapsed = time.time() - start_time
        logger.error(f"❌ Gemini API timeout after {elapsed:.2f}s: {e}")
        return f"Error: Request timed out after {elapsed:.0f}s. Try a shorter video or use Cheat Sheet mode."
        
    except google_exceptions.ServiceUnavailable as e:
        logger.error(f"❌ Gemini API unavailable (503): {e}")
        logger.info("🔄 Retrying with exponential backoff...")
        return retry_with_backoff(model, full_prompt, video_id)
        
    except Exception as e:
        elapsed = time.time() - start_time
        logger.error(f"❌ Error after {elapsed:.2f}s: {type(e).__name__}: {e}")
        return f"Error generating notes: {str(e)}"
