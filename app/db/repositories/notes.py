"""
Notes repository for database operations.
"""
from typing import Optional
from uuid import UUID
from supabase import Client


class NotesRepository:
    """Repository for notes table operations."""
    
    def __init__(self, db: Client):
        self.db = db
        self.table = "notes"
    
    async def create(
        self,
        source_id: UUID,
        user_id: UUID,
        content: str,
        note_type: str,
        tags: Optional[list[str]] = None
    ) -> dict:
        """Create a new note."""
        data = {
            "source_id": str(source_id),
            "user_id": str(user_id),
            "content": content,
            "note_type": note_type,
            "word_count": len(content.split()),
            "tags": tags or []
        }
        
        result = self.db.table(self.table).insert(data).execute()
        return result.data[0] if result.data else None
    
    async def get_by_id(self, note_id: UUID) -> Optional[dict]:
        """Get note by ID with source info."""
        result = (
            self.db.table(self.table)
            .select("*, content_sources(*)")
            .eq("id", str(note_id))
            .execute()
        )
        return result.data[0] if result.data else None
    
    async def get_by_source(self, source_id: UUID) -> Optional[dict]:
        """Get note by source ID."""
        result = (
            self.db.table(self.table)
            .select("*")
            .eq("source_id", str(source_id))
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        return result.data[0] if result.data else None
    
    async def list_by_user(
        self,
        user_id: UUID,
        note_type: Optional[str] = None,
        favorites_only: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> list[dict]:
        """List notes for a user."""
        query = (
            self.db.table(self.table)
            .select("*, content_sources(title, source_type, thumbnail_url)")
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
        )
        
        if note_type:
            query = query.eq("note_type", note_type)
        
        if favorites_only:
            query = query.eq("is_favorite", True)
        
        result = query.execute()
        return result.data or []
    
    async def update(self, note_id: UUID, **updates) -> Optional[dict]:
        """Update a note."""
        if "content" in updates:
            updates["word_count"] = len(updates["content"].split())
        
        result = (
            self.db.table(self.table)
            .update(updates)
            .eq("id", str(note_id))
            .execute()
        )
        return result.data[0] if result.data else None
    
    async def toggle_favorite(self, note_id: UUID) -> Optional[dict]:
        """Toggle favorite status."""
        note = await self.get_by_id(note_id)
        if not note:
            return None
        
        return await self.update(note_id, is_favorite=not note.get("is_favorite", False))
    
    async def delete(self, note_id: UUID) -> bool:
        """Delete a note."""
        result = self.db.table(self.table).delete().eq("id", str(note_id)).execute()
        return len(result.data) > 0 if result.data else False
    
    async def search_by_content(self, user_id: UUID, query: str, limit: int = 5) -> list[dict]:
        """Search notes by content using keyword matching."""
        result = (
            self.db.table(self.table)
            .select("*, content_sources(title, source_type)")
            .eq("user_id", str(user_id))
            .ilike("content", f"%{query}%")
            .limit(limit)
            .execute()
        )
        return result.data or []
