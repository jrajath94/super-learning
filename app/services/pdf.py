"""
PDF Processing Service for Research Papers.
"""
import io
import logging
import requests
import pymupdf  # fitz
from typing import Optional

logger = logging.getLogger(__name__)

def fetch_pdf_from_url(url: str) -> bytes:
    """Download PDF from a URL."""
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.content
    except Exception as e:
        logger.error(f"Failed to fetch PDF from {url}: {e}")
        raise ValueError(f"Could not download PDF: {e}")

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract text from PDF with smart layout preservation.
    """
    try:
        with pymupdf.open(stream=pdf_bytes, filetype="pdf") as doc:
            full_text = []
            
            for page in doc:
                # extracting text as blocks to check for headers/footers if needed
                text = page.get_text()
                full_text.append(text)
            
            return "\n\n".join(full_text)
            
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        raise ValueError(f"Could not extract text from PDF: {e}")

def clean_research_paper_text(text: str) -> str:
    """
    Clean common artifacts from research papers (references, page numbers).
    """
    # Simple cleaner - could be expanded
    # 1. Remove obvious page numbers (lines that are just digits)
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        stripped = line.strip()
        if stripped.isdigit():
            continue
        cleaned_lines.append(line)
        
    return "\n".join(cleaned_lines)
