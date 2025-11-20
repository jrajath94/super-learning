# Super-Learning: AI-Powered YouTube Note Generator

Transform YouTube educational content into comprehensive, high-quality study notes using advanced AI prompting techniques. Built for students, professionals, and lifelong learners who want to maximize knowledge retention from video lectures.

## Overview

Super-Learning is a FastAPI-based web application that generates detailed, pedagogically-optimized notes from YouTube videos. It uses Google's Gemini 2.5 Pro model with specialized prompts designed to encourage deep comprehension, critical thinking, and practical application.

## Key Features

### Intelligent Note Generation
- **Stanford AI Course Mode**: Scientist-level analysis with first principles derivations, mental models, and research insights
- **DSA & Interview Prep**: Engineer-focused breakdowns with pattern recognition, system design considerations, and implementation templates  
- **Podcast & Tech Talk Mode**: Strategic analysis extracting frameworks, wisdom, and actionable insights
- **Cheat Sheet Mode**: High-density visual summaries optimized for quick recall

### Technical Capabilities
- **Streaming API**: Handles long-form content without timeouts using chunk-based processing
- **Comprehensive Logging**: Full request lifecycle tracking with archived prompts and responses for debugging
- **Resilient Error Handling**: Automatic retry with exponential backoff for transient API failures
- **Mobile-Optimized UI**: Responsive design with dark mode support

## Quick Start

\`\`\`bash
# Clone the repository  
git clone https://github.com/jrajath94/super-learning.git
cd super-learning

# Install dependencies
pip install -r requirements.txt

# Set API key
export GENAI_API_KEY='your_gemini_api_key'

# Run locally
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

Access at \`http://localhost:8000\`

## Technology Stack

- **Backend**: FastAPI, Python 3.9+
- **AI Model**: Google Gemini 2.5 Pro
- **Data Sources**: youtube-transcript-api, yt-dlp
- **Frontend**: Vanilla JavaScript with Marked.js

## Deployment

Supports free deployment on:
- Render (recommended for beginners)  
- Google Cloud Run
- Fly.io

See deployment instructions in the documentation.

## License

MIT License
