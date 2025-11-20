import google.generativeai as genai
import os
import logging
import time
from app.core.logger import archive_interaction
from .prompts import STANFORD_PROMPT, DSA_PROMPT, PODCAST_PROMPT, CHEATSHEET_PROMPT
from google.api_core import exceptions as google_exceptions

logger = logging.getLogger(__name__)

# Configure API Key
GENAI_API_KEY = "AIzaSyBHjwwkKTwseGPiLL5pj4YRbIa6ITK19MU"
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
            archive_interaction(video_id, prompt, full_response)
            logger.info(f"Retry successful on attempt {attempt + 1}")
            return full_response
            
        except Exception as e:
            logger.warning(f"Retry {attempt + 1} failed: {e}")
            if attempt == max_retries - 1:
                return f"Error: Failed after {max_retries} retries. Last error: {str(e)}"
    
    return "Error: Max retries exceeded"

def generate_notes(transcript_text: str, video_type: str, metadata: dict = None, video_id: str = "unknown") -> str:
    """
    Generates notes based on the video type and transcript using STREAMING.
    """
    logger.info(f"Initializing Gemini model: {MODEL_NAME}")
    model = genai.GenerativeModel(
        model_name=MODEL_NAME,
        generation_config=GENERATION_CONFIG,
    )

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
