"""
Embedding Service using Google Gemini
"""
import google.generativeai as genai
import logging
import os
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Configure API Key (Redundant if already configured in main, but safe)
genai.configure(api_key=settings.genai_api_key or os.getenv("GENAI_API_KEY"))

EMBEDDING_MODEL = "models/text-embedding-004"

def generate_embedding(text: str) -> list[float]:
    """
    Generate vector embedding for a given text using Gemini.
    Returns: List of floats (768 dimensions for text-embedding-004)
    """
    try:
        # Gemini embedding API
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text,
            task_type="retrieval_document",
            title="Note Content" # Optional, helpful for some models
        )
        return result['embedding']
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        return []

def generate_query_embedding(text: str) -> list[float]:
    """
    Generate embedding for a search query.
    """
    try:
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text,
            task_type="retrieval_query"
        )
        return result['embedding']
    except Exception as e:
        logger.error(f"Error generating query embedding: {e}")
        return []
