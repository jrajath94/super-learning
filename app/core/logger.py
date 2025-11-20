import logging
import os
import json
from datetime import datetime

# Ensure logs directory exists
LOG_DIR = "/Users/rj/youtube_notes/logs"
PROMPT_DIR = os.path.join(LOG_DIR, "prompts")
RESPONSE_DIR = os.path.join(LOG_DIR, "responses")
SERVER_LOG_FILE = os.path.join(LOG_DIR, "server.log")

os.makedirs(PROMPT_DIR, exist_ok=True)
os.makedirs(RESPONSE_DIR, exist_ok=True)

def configure_logging():
    """
    Configures the root logger to write to console and file.
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(SERVER_LOG_FILE)
        ]
    )
    # Set external libraries to WARNING to reduce noise
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("google").setLevel(logging.WARNING)

def archive_interaction(video_id: str, prompt: str, response: str):
    """
    Archives the raw prompt and response to disk for debugging.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Save Prompt
    prompt_file = os.path.join(PROMPT_DIR, f"{timestamp}_{video_id}_prompt.txt")
    with open(prompt_file, "w", encoding="utf-8") as f:
        f.write(prompt)
        
    # Save Response
    response_file = os.path.join(RESPONSE_DIR, f"{timestamp}_{video_id}_response.txt")
    with open(response_file, "w", encoding="utf-8") as f:
        f.write(response)
        
    logging.getLogger(__name__).info(f"💾 Archived interaction for {video_id} to {timestamp}_*")
