"""
API v1 routes package.
"""
from fastapi import APIRouter
from .routes import content, notes, agents

api_router = APIRouter()

api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
