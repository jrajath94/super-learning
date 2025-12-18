"""
Research Paper API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from supabase import Client

from app.db import get_db
from app.db.repositories import ContentRepository, NotesRepository
from app.services.pdf import fetch_pdf_from_url, extract_text_from_pdf, clean_research_paper_text
from app.services.llm import generate_notes

router = APIRouter()

# Temporary user ID for development
DEV_USER_ID = "00000000-0000-0000-0000-000000000001"

class ResearchURLRequest(BaseModel):
    url: str
    tags: Optional[list[str]] = None

async def process_research_paper(
    content_id: UUID, 
    pdf_bytes: bytes, 
    notes_repo: NotesRepository,
    tags: list[str] = None
):
    """Background task to process research paper and generate notes."""
    try:
        # 1. Extract Text
        raw_text = extract_text_from_pdf(pdf_bytes)
        clean_text = clean_research_paper_text(raw_text)
        
        # 2. Generate Notes using the RESEARCH_PAPER_PROMPT
        # We fetch content to get metadata for the prompt
        content = await notes_repo.db.table("content_sources").select("*").eq("id", str(content_id)).single().execute()
        metadata = content.data.get("metadata", {})
        
        notes_content = generate_notes(
            transcript_text=clean_text,
            video_type="research_paper", # Triggers RESEARCH_PAPER_PROMPT
            metadata={
                "title": metadata.get("title", "Research Paper"),
                "duration": 0 # Not relevant for papers
            },
            video_id=str(content_id)
        )
        
        # 3. Save Notes
        await notes_repo.create(
            source_id=content_id,
            user_id=UUID(DEV_USER_ID),
            content=notes_content,
            note_type="research_paper",
            tags=tags or ["research", "paper"]
        )
        
        # 4. Generate Embeddings (if available)
        try:
            from app.api.v1.routes.notes import generate_and_save_embedding
            # We need to find the note ID we just created
            # This is a bit race-condition prone if we don't return ID from create
            # Better to fix create to return ID, but for now we query latest
            note = await notes_repo.db.table("notes").select("id").eq("source_id", str(content_id)).order("created_at", desc=True).limit(1).single().execute()
            if note.data:
                await generate_and_save_embedding(notes_repo, UUID(note.data['id']), notes_content)
        except Exception as embed_err:
            print(f"Embedding failed: {embed_err}")

    except Exception as e:
        print(f"Research processing failed: {e}")
        # Ideally update content status to failed

@router.post("/process-url")
async def process_research_url(
    request: ResearchURLRequest,
    background_tasks: BackgroundTasks,
    db: Client = Depends(get_db)
):
    """Process a research paper from a URL (e.g. arXiv)."""
    try:
        # Fetch PDF first to validate
        pdf_bytes = fetch_pdf_from_url(request.url)
        
        # Use filename or generic title until we parse it
        title = request.url.split("/")[-1]
        if title.endswith(".pdf"):
            title = title[:-4]
            
        content_repo = ContentRepository(db)
        notes_repo = NotesRepository(db)
        
        # Create Content Source
        content = await content_repo.create(
            user_id=UUID(DEV_USER_ID),
            source_type="pdf",
            title=title,
            source_url=request.url,
            source_id=request.url, # Use URL as ID for PDFs
            metadata={"title": title, "url": request.url}
        )
        
        if not content:
             raise HTTPException(status_code=500, detail="Failed to create content source")

        # Trigger Background Processing
        background_tasks.add_task(
            process_research_paper, 
            UUID(content["id"]), 
            pdf_bytes, 
            notes_repo, 
            request.tags
        )
        
        return {"message": "Research paper processing started", "content_id": content["id"]}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/upload")
async def upload_research_paper(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Client = Depends(get_db)
):
    """Upload and process a research paper PDF."""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
    try:
        pdf_bytes = await file.read()
        title = file.filename[:-4]
        
        content_repo = ContentRepository(db)
        notes_repo = NotesRepository(db)
        
        # Create Content Source
        content = await content_repo.create(
            user_id=UUID(DEV_USER_ID),
            source_type="pdf",
            title=title,
            source_id=f"upload_{title}", # Pseudo ID
            metadata={"title": title, "filename": file.filename}
        )
        
        if not content:
             raise HTTPException(status_code=500, detail="Failed to create content source")
             
        # Trigger Background Processing
        background_tasks.add_task(
            process_research_paper, 
            UUID(content["id"]), 
            pdf_bytes, 
            notes_repo, 
            ["upload", "research"]
        )
        
        return {"message": "Paper uploaded and processing started", "content_id": content["id"]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
