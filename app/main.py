"""
Super-Learning API - Main Application Entry Point
Version 2.0 with Agentic AI Architecture
"""
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
import time

from app.core.config import get_settings
from app.core.logger import configure_logging
from app.api.v1 import api_router

# Initialize settings and logging
settings = get_settings()
configure_logging()
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-Powered Learning Platform with Agentic Architecture"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"🔄 {request.method} {request.url.path} completed in {duration:.2f}s | Status: {response.status_code}")
    return response

# Mount API v1 routes
app.include_router(api_router, prefix=settings.api_v1_prefix)

# Static files directory
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")

if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

if os.path.exists(TEMPLATES_DIR):
    templates = Jinja2Templates(directory=TEMPLATES_DIR)

# Legacy routes for backward compatibility
from app.services.youtube import get_video_id, get_transcript, get_video_metadata
from app.services.llm import generate_notes
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from fastapi import HTTPException


class LegacyVideoRequest(BaseModel):
    url: str
    video_type: str


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    """Serve the main HTML page."""
    if os.path.exists(TEMPLATES_DIR):
        return templates.TemplateResponse("index.html", {"request": request})
    return HTMLResponse("<h1>Super-Learning API</h1><p>Frontend not configured. Use /api/v1/docs for API documentation.</p>")


@app.post("/generate")
async def legacy_generate(request: LegacyVideoRequest):
    """
    Legacy endpoint for backward compatibility.
    Use /api/v1/notes/generate for new integrations.
    """
    logger.info(f"🚀 [Legacy] Received generation request for URL: {request.url} | Type: {request.video_type}")
    
    try:
        video_id = get_video_id(request.url)
        transcript = get_transcript(video_id)
        metadata = get_video_metadata(request.url)
        notes = generate_notes(transcript, request.video_type, metadata, video_id)
        
        return JSONResponse(content={"notes": notes, "metadata": metadata})
    except Exception as e:
        logger.error(f"❌ Error generating notes: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": settings.app_version}


@app.get("/api/v1/docs", include_in_schema=False)
async def api_docs_redirect():
    """Redirect to API documentation."""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/docs")


# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info(f"🚀 {settings.app_name} v{settings.app_version} starting...")
    logger.info(f"📡 API available at {settings.api_v1_prefix}")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info(f"👋 {settings.app_name} shutting down...")
