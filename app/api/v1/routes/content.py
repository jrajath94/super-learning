"""
Content source API routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import Optional
from uuid import UUID
from supabase import Client

from app.db import get_db
from app.db.repositories import ContentRepository
from app.services.youtube import get_video_id, get_video_metadata

router = APIRouter()


class ContentCreateRequest(BaseModel):
    """Request to create a content source."""
    source_type: str  # 'youtube', 'article', 'book', 'podcast'
    source_url: Optional[str] = None
    title: Optional[str] = None


class ContentResponse(BaseModel):
    """Content source response."""
    id: UUID
    source_type: str
    source_url: Optional[str]
    source_id: Optional[str]
    title: str
    author: Optional[str]
    duration_seconds: Optional[int]
    thumbnail_url: Optional[str]
    metadata: dict


# Temporary user ID for development (replace with auth later)
DEV_USER_ID = "00000000-0000-0000-0000-000000000001"


@router.post("/", response_model=ContentResponse)
async def create_content(
    request: ContentCreateRequest,
    db: Client = Depends(get_db)
):
    """
    Create a new content source.
    For YouTube, automatically fetches metadata.
    """
    repo = ContentRepository(db)
    
    title = request.title
    author = None
    duration = None
    thumbnail = None
    source_id = None
    metadata = {}
    
    # Auto-fetch metadata for YouTube
    if request.source_type == "youtube" and request.source_url:
        try:
            source_id = get_video_id(request.source_url)
            yt_metadata = get_video_metadata(request.source_url)
            title = title or yt_metadata.get("title", "Unknown")
            author = yt_metadata.get("author")
            duration = yt_metadata.get("duration")
            metadata = yt_metadata
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch video info: {str(e)}")
    
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")
    
    content = await repo.create(
        user_id=UUID(DEV_USER_ID),
        source_type=request.source_type,
        title=title,
        source_url=request.source_url,
        source_id=source_id,
        author=author,
        duration_seconds=duration,
        thumbnail_url=thumbnail,
        metadata=metadata
    )
    
    if not content:
        raise HTTPException(status_code=500, detail="Failed to create content")
    
    return ContentResponse(**content)


@router.get("/", response_model=list[ContentResponse])
async def list_content(
    source_type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Client = Depends(get_db)
):
    """List content sources for the current user."""
    repo = ContentRepository(db)
    contents = await repo.list_by_user(
        user_id=UUID(DEV_USER_ID),
        source_type=source_type,
        limit=limit,
        offset=offset
    )
    return [ContentResponse(**c) for c in contents]


@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: UUID,
    db: Client = Depends(get_db)
):
    """Get a specific content source."""
    repo = ContentRepository(db)
    content = await repo.get_by_id(content_id)
    
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return ContentResponse(**content)


@router.delete("/{content_id}")
async def delete_content(
    content_id: UUID,
    db: Client = Depends(get_db)
):
    """Delete a content source."""
    repo = ContentRepository(db)
    success = await repo.delete(content_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return {"message": "Content deleted successfully"}
