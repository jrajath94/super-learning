"""
Content source repository for database operations.
"""
from typing import Optional
from uuid import UUID
from supabase import Client


class ContentRepository:
    """Repository for content_sources table operations."""
    
    def __init__(self, db: Client):
        self.db = db
        self.table = "content_sources"
    
    async def create(
        self,
        user_id: UUID,
        source_type: str,
        title: str,
        source_url: Optional[str] = None,
        source_id: Optional[str] = None,
        author: Optional[str] = None,
        duration_seconds: Optional[int] = None,
        thumbnail_url: Optional[str] = None,
        metadata: Optional[dict] = None
    ) -> dict:
        """Create a new content source."""
        data = {
            "user_id": str(user_id),
            "source_type": source_type,
            "title": title,
            "source_url": source_url,
            "source_id": source_id,
            "author": author,
            "duration_seconds": duration_seconds,
            "thumbnail_url": thumbnail_url,
            "metadata": metadata or {}
        }
        
        result = self.db.table(self.table).insert(data).execute()
        return result.data[0] if result.data else None
    
    async def get_by_id(self, content_id: UUID) -> Optional[dict]:
        """Get content source by ID."""
        result = self.db.table(self.table).select("*").eq("id", str(content_id)).execute()
        return result.data[0] if result.data else None
    
    async def get_by_source_id(self, source_id: str, user_id: UUID) -> Optional[dict]:
        """Get content source by external source ID (e.g., YouTube video ID)."""
        result = (
            self.db.table(self.table)
            .select("*")
            .eq("source_id", source_id)
            .eq("user_id", str(user_id))
            .execute()
        )
        return result.data[0] if result.data else None
    
    async def list_by_user(
        self,
        user_id: UUID,
        source_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> list[dict]:
        """List content sources for a user."""
        query = (
            self.db.table(self.table)
            .select("*")
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
        )
        
        if source_type:
            query = query.eq("source_type", source_type)
        
        result = query.execute()
        return result.data or []
    
    async def delete(self, content_id: UUID) -> bool:
        """Delete a content source."""
        result = self.db.table(self.table).delete().eq("id", str(content_id)).execute()
        return len(result.data) > 0 if result.data else False
