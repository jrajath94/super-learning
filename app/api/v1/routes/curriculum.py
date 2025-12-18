"""
Curriculum Analysis API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional
from supabase import Client
import json

from app.db import get_db
from app.db.repositories import ContentRepository, NotesRepository
from app.services.scraper import fetch_page_content
from app.services.llm import generate_notes
from app.services.prompts import CURRICULUM_PROMPT, RESEARCH_PAPER_PROMPT
import google.generativeai as genai
import os

router = APIRouter()

# Temporary user ID for development
DEV_USER_ID = "00000000-0000-0000-0000-000000000001"

class CurriculumRequest(BaseModel):
    url: str

class ModuleGenerationRequest(BaseModel):
    curriculum_id: UUID
    module_title: str
    module_description: str

async def generate_curriculum_json(text: str) -> List[dict]:
    """Use LLM to extract JSON curriculum from text."""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash") # Fast model for JSON extraction
        prompt = f"""
{CURRICULUM_PROMPT}

**COURSE CONTENT**:
{text[:30000]} # Truncate to avoid context limit if massive
"""
        response = model.generate_content(prompt)
        # Clean response to get just JSON
        text_resp = response.text.strip()
        if text_resp.startswith("```json"):
            text_resp = text_resp[7:-3]
        elif text_resp.startswith("```"):
            text_resp = text_resp[3:-3]
            
        return json.loads(text_resp)
    except Exception as e:
        print(f"Error extracting curriculum: {e}")
        return []

@router.post("/analyze")
async def analyze_curriculum(
    request: CurriculumRequest,
    db: Client = Depends(get_db)
):
    """Analyze a course URL and return a structured curriculum."""
    try:
        # 1. Scrape
        raw_text = fetch_page_content(request.url)
        
        # 2. Extract Curriculum
        modules = await generate_curriculum_json(raw_text)
        
        if not modules:
            raise HTTPException(status_code=400, detail="Could not extract curriculum from this page.")

        # 3. Save as Content Source (Type: 'curriculum')
        content_repo = ContentRepository(db)
        title = modules[0].get('title', 'Course Curriculum') if modules else "New Course"
        
        content = await content_repo.create(
            user_id=UUID(DEV_USER_ID),
            source_type="curriculum",
            title=f"Curriculum: {title}",
            source_url=request.url,
            source_id=request.url,
            metadata={"modules": modules}
        )
        
        return {"content_id": content["id"], "modules": modules}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

async def process_module_notes(
    curriculum_id: UUID,
    module_title: str,
    module_description: str,
    notes_repo: NotesRepository
):
    """Generate notes for a specific module."""
    try:
        # We treat the description as the 'transcript' to expand upon
        # We encourage the LLM to hallucinate valid educational content based on the topic 
        # (This is 'General Purpose' learning as requested)
        
        # We use a custom 'transcript' that is just the topic prompt
        pseudo_transcript = f"TOPIC: {module_title}\nDETAILS: {module_description}\n\n[Explain this topic in extreme depth using the Neural Architect style.]"
        
        notes_content = generate_notes(
            transcript_text=pseudo_transcript,
            video_type="research_paper", # Uses the deep dive prompt
            metadata={
                "title": module_title,
                "duration": 0
            },
            video_id=f"{curriculum_id}_{module_title}"
        )
        
        await notes_repo.create(
            source_id=curriculum_id, # Link to the parent curriculum
            user_id=UUID(DEV_USER_ID),
            content=notes_content,
            note_type="module", 
            tags=["curriculum", "module"]
        )

    except Exception as e:
        print(f"Module generation failed: {e}")

@router.post("/generate-module")
async def generate_module(
    request: ModuleGenerationRequest,
    background_tasks: BackgroundTasks,
    db: Client = Depends(get_db)
):
    """Generate deep notes for a specific module in the curriculum."""
    notes_repo = NotesRepository(db)
    
    background_tasks.add_task(
        process_module_notes,
        request.curriculum_id,
        request.module_title,
        request.module_description,
        notes_repo
    )
    
    return {"message": f"Generating notes for {request.module_title}..."}
