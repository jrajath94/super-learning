import re
import json
import logging
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
import yt_dlp

logger = logging.getLogger(__name__)

def get_video_id(url: str) -> str:
    """
    Extracts the video ID from a YouTube URL.
    """
    parsed_url = urlparse(url)
    if parsed_url.hostname == 'youtu.be':
        return parsed_url.path[1:]
    if parsed_url.hostname in ('www.youtube.com', 'youtube.com'):
        if parsed_url.path == '/watch':
            p = parse_qs(parsed_url.query)
            return p['v'][0]
        if parsed_url.path[:7] == '/embed/':
            return parsed_url.path.split('/')[2]
        if parsed_url.path[:3] == '/v/':
            return parsed_url.path.split('/')[2]
    raise ValueError("Invalid YouTube URL")

def get_transcript(video_id: str) -> str:
    """
    Retrieves the transcript for a given video ID using youtube_transcript_api with fallbacks.
    """
    try:
        # Method 1: Official API (Instance Method)
        logger.info(f"Attempting to fetch transcript for {video_id} using official API")
        api = YouTubeTranscriptApi()
        transcript_list = api.fetch(video_id)
        full_transcript = " ".join([t.text for t in transcript_list])
        return full_transcript
    except Exception as e:
        logger.warning(f"Official API failed: {e}. Trying fallback methods...")
        pass

    try:
        # Method 2: Try fetching with specific languages if default fails
        logger.info("Attempting to fetch transcript with explicit language codes")
        api = YouTubeTranscriptApi()
        # Try English variants
        transcript_list = api.fetch(video_id, languages=['en', 'en-US', 'en-GB'])
        full_transcript = " ".join([t.text for t in transcript_list])
        return full_transcript
    except Exception as e:
        logger.error(f"All transcript fetch methods failed: {e}")
        raise Exception(f"Could not retrieve transcript: {str(e)}")

def get_video_metadata(url: str) -> dict:
    """
    Retrieves video metadata (title, duration, etc.) using yt-dlp.
    """
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'skip_download': True,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            logger.info(f"Fetching metadata for {url}")
            info = ydl.extract_info(url, download=False)
            return {
                'title': info.get('title', 'Unknown Title'),
                'duration': info.get('duration', 0),
                'author': info.get('uploader', 'Unknown Author'),
                'views': info.get('view_count', 0)
            }
    except Exception as e:
        logger.error(f"Error fetching metadata: {e}")
        return {'title': 'Unknown Title', 'duration': 0}
