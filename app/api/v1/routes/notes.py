"""
Notes API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from supabase import Client

from app.db import get_db
from app.db.repositories import ContentRepository, NotesRepository
from app.services.youtube import get_video_id, get_transcript
from app.services.llm import generate_notes

router = APIRouter()


class NoteGenerateRequest(BaseModel):
    """Request to generate notes from content."""
    content_id: Optional[UUID] = None
    youtube_url: Optional[str] = None
    note_type: str = "stanford"  # 'stanford', 'dsa', 'podcast', 'cheatsheet'
    tags: Optional[list[str]] = None


class NoteResponse(BaseModel):
    """Note response."""
    id: UUID
    source_id: UUID
    content: str
    note_type: str
    word_count: Optional[int]
    is_favorite: bool
    tags: list[str]
    source: Optional[dict] = None


class NoteUpdateRequest(BaseModel):
    """Request to update a note."""
    content: Optional[str] = None
    tags: Optional[list[str]] = None


# Temporary user ID for development
DEV_USER_ID = "00000000-0000-0000-0000-000000000001"


@router.post("/generate", response_model=NoteResponse)
async def generate_note(
    request: NoteGenerateRequest,
    db: Client = Depends(get_db)
):
    """
    Generate notes for a content source.
    Can provide existing content_id or a new YouTube URL.
    """
    content_repo = ContentRepository(db)
    notes_repo = NotesRepository(db)
    
    # Get or create content source
    if request.content_id:
        content = await content_repo.get_by_id(request.content_id)
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
    elif request.youtube_url:
        # Create content source first
        from app.services.youtube import get_video_metadata
        
        try:
            video_id = get_video_id(request.youtube_url)
            metadata = get_video_metadata(request.youtube_url)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid YouTube URL: {str(e)}")
        
        # Check if already exists
        content = await content_repo.get_by_source_id(video_id, UUID(DEV_USER_ID))
        
        if not content:
            content = await content_repo.create(
                user_id=UUID(DEV_USER_ID),
                source_type="youtube",
                title=metadata.get("title", "Unknown"),
                source_url=request.youtube_url,
                source_id=video_id,
                author=metadata.get("author"),
                duration_seconds=metadata.get("duration"),
                metadata=metadata
            )
    else:
        raise HTTPException(status_code=400, detail="Provide content_id or youtube_url")
    
    # Fetch transcript
    try:
        transcript = get_transcript(content.get("source_id"))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch transcript: {str(e)}")
    
    # Generate notes using AI
    try:
        notes_content = generate_notes(
            transcript_text=transcript,
            video_type=request.note_type,
            metadata={
                "title": content.get("title"),
                "duration": content.get("duration_seconds", 0)
            },
            video_id=content.get("source_id", "unknown")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate notes: {str(e)}")
    
    # Save notes to database
    note = await notes_repo.create(
        source_id=UUID(content["id"]),
        user_id=UUID(DEV_USER_ID),
        content=notes_content,
        note_type=request.note_type,
        tags=request.tags
    )
    
    if not note:
        raise HTTPException(status_code=500, detail="Failed to save notes")
    
    return NoteResponse(
        **note,
        source={
            "title": content.get("title"),
            "source_type": content.get("source_type"),
            "thumbnail_url": content.get("thumbnail_url")
        }
    )


@router.get("/", response_model=list[NoteResponse])
async def list_notes(
    note_type: Optional[str] = None,
    favorites_only: bool = False,
    limit: int = 50,
    offset: int = 0,
    db: Client = Depends(get_db)
):
    """List notes for the current user."""
    repo = NotesRepository(db)
    notes = await repo.list_by_user(
        user_id=UUID(DEV_USER_ID),
        note_type=note_type,
        favorites_only=favorites_only,
        limit=limit,
        offset=offset
    )
    
    return [
        NoteResponse(
            id=n["id"],
            source_id=n["source_id"],
            content=n["content"],
            note_type=n["note_type"],
            word_count=n.get("word_count"),
            is_favorite=n.get("is_favorite", False),
            tags=n.get("tags", []),
            source=n.get("content_sources")
        )
        for n in notes
    ]


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: UUID,
    db: Client = Depends(get_db)
):
    """Get a specific note."""
    repo = NotesRepository(db)
    note = await repo.get_by_id(note_id)
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return NoteResponse(
        id=note["id"],
        source_id=note["source_id"],
        content=note["content"],
        note_type=note["note_type"],
        word_count=note.get("word_count"),
        is_favorite=note.get("is_favorite", False),
        tags=note.get("tags", []),
        source=note.get("content_sources")
    )


@router.patch("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: UUID,
    request: NoteUpdateRequest,
    db: Client = Depends(get_db)
):
    """Update a note."""
    repo = NotesRepository(db)
    
    updates = {}
    if request.content is not None:
        updates["content"] = request.content
    if request.tags is not None:
        updates["tags"] = request.tags
    
    note = await repo.update(note_id, **updates)
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return NoteResponse(**note)


@router.post("/{note_id}/favorite", response_model=NoteResponse)
async def toggle_favorite(
    note_id: UUID,
    db: Client = Depends(get_db)
):
    """Toggle favorite status of a note."""
    repo = NotesRepository(db)
    note = await repo.toggle_favorite(note_id)
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return NoteResponse(**note)


@router.delete("/{note_id}")
async def delete_note(
    note_id: UUID,
    db: Client = Depends(get_db)
):
    """Delete a note."""
    repo = NotesRepository(db)
    success = await repo.delete(note_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return {"message": "Note deleted successfully"}
