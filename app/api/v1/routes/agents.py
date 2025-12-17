"""
Agent API routes for agentic AI interactions.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from supabase import Client
import json

from app.db import get_db
from app.agents.orchestrator import AgentOrchestrator

router = APIRouter()


class ChatRequest(BaseModel):
    """Request for agent chat."""
    message: str
    agent_type: Optional[str] = None  # 'study', 'coach' - auto-routes if None
    context_note_id: Optional[UUID] = None  # Note to reference for context


class ChatResponse(BaseModel):
    """Agent chat response."""
    message: str
    agent_type: str
    suggestions: Optional[list[str]] = None
    referenced_notes: Optional[list[dict]] = None


class AgentStatusResponse(BaseModel):
    """Agent status response."""
    available_agents: list[str]
    active_sessions: int


# Temporary user ID for development
DEV_USER_ID = "00000000-0000-0000-0000-000000000001"


@router.get("/status", response_model=AgentStatusResponse)
async def get_agent_status():
    """Get status of available agents."""
    return AgentStatusResponse(
        available_agents=["learning", "study", "coach", "interviewer"],
        active_sessions=0  # Will track actual sessions later
    )


@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    db: Client = Depends(get_db)
):
    """
    Chat with an AI agent.
    Routes to appropriate agent based on request type.
    """
    try:
        try:
            orchestrator = AgentOrchestrator(db, UUID(DEV_USER_ID))
            response = await orchestrator.process_message(
                message=request.message,
                agent_type=request.agent_type,
                context_note_id=request.context_note_id
            )
            return ChatResponse(**response)
        except (ValueError, Exception):
            # Fallback for demo/testing when DB is not configured
            import asyncio
            await asyncio.sleep(1)  # Simulate latency
            return ChatResponse(
                message=f"I'm a demo AI Study Assistant (DB not connected). You asked: '{request.message}'. In a real setup, I would analyze your notes and provide a specific answer.",
                agent_type="study",
                suggestions=["How do transformers work?", "Quiz me"]
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")


@router.post("/chat/stream")
async def stream_chat_with_agent(
    request: ChatRequest,
    db: Client = Depends(get_db)
):
    """
    Stream chat response from AI agent.
    Uses Server-Sent Events for real-time streaming.
    """
    orchestrator = AgentOrchestrator(db, UUID(DEV_USER_ID))
    
    async def generate():
        try:
            async for chunk in orchestrator.stream_message(
                message=request.message,
                agent_type=request.agent_type,
                context_note_id=request.context_note_id
            ):
                yield f"data: {json.dumps(chunk)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.post("/analyze-learning")
async def analyze_learning_patterns(
    db: Client = Depends(get_db)
):
    """
    Analyze user's learning patterns using the Coach agent.
    Returns insights and recommendations.
    """
    orchestrator = AgentOrchestrator(db, UUID(DEV_USER_ID))
    
    try:
        analysis = await orchestrator.analyze_learning_patterns()
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@router.post("/suggest-next")
async def suggest_next_study(
    topic: Optional[str] = None,
    db: Client = Depends(get_db)
):
    """
    Get AI-powered study suggestions.
    Based on learning history and patterns.
    """
    orchestrator = AgentOrchestrator(db, UUID(DEV_USER_ID))
    
    try:
        suggestions = await orchestrator.suggest_next_study(topic)
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Suggestion error: {str(e)}")
