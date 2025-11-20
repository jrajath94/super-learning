from fastapi import FastAPI, Request, Form, HTTPException, Response
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from app.services.youtube import get_video_id, get_transcript, get_video_metadata
from app.services.llm import generate_notes
import os
import logging
import time
from app.core.logger import configure_logging
from app.core.log_streamer import log_streamer
import asyncio

# Configure Logging
configure_logging()
logger = logging.getLogger(__name__)

# Add log streamer to root logger
logging.getLogger().addHandler(log_streamer)

app = FastAPI()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"🔄 {request.method} {request.url.path} completed in {duration:.2f}s | Status: {response.status_code}")
    return response

# Mount static files
app.mount("/static", StaticFiles(directory="/Users/rj/youtube_notes/app/static"), name="static")

# Templates
templates = Jinja2Templates(directory="/Users/rj/youtube_notes/app/templates")

class VideoRequest(BaseModel):
    url: str
    video_type: str

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/logs/stream")
async def stream_logs():
    """Server-Sent Events endpoint for streaming logs"""
    
    async def event_generator():
        q = log_streamer.add_client()
        try:
            while True:
                # Wait for new log message
                try:
                    msg = q.get(timeout=1)
                    yield f"data: {msg}\n\n"
                except:
                    # Send heartbeat to keep connection alive
                    yield f": heartbeat\n\n"
                await asyncio.sleep(0.1)
        finally:
            log_streamer.remove_client(q)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@app.post("/generate")
async def generate(request: VideoRequest):
    logger.info(f"🚀 Received generation request for URL: {request.url} | Type: {request.video_type}")
    
    try:
        logger.info("1️⃣  Extracting Video ID...")
        video_id = get_video_id(request.url)
        logger.info(f"✅ Video ID extracted: {video_id}")

        logger.info("2️⃣  Fetching Transcript...")
        transcript = get_transcript(video_id)
        logger.info(f"✅ Transcript fetched. Length: {len(transcript)} characters")

        logger.info("3️⃣  Fetching Metadata...")
        metadata = get_video_metadata(request.url)
        logger.info(f"✅ Metadata fetched: {metadata.get('title', 'Unknown')}")
        
        logger.info("4️⃣  Sending to Gemini for Note Generation (This may take time)...")
        notes = generate_notes(transcript, request.video_type, metadata, video_id)
        logger.info("✅ Notes generated successfully!")
        
        return JSONResponse(content={"notes": notes, "metadata": metadata})
    except Exception as e:
        logger.error(f"❌ Error generating notes: {e}")
        raise HTTPException(status_code=500, detail=str(e))
