# User Stories Evaluation & Improvement Roadmap

This document evaluates the current agentic interactions and identifies areas for improvement to reach a "world-class" status.

## User Story Analysis

### 🎯 Story 1: The Deep Learner
*   **Flow**: Paste YouTube URL -> Select Stanford Mode -> Generate -> Ask Deep Questions.
*   **Interaction Evaluation**: 
    *   *Strength*: The Stanford prompt is highly sophisticated and forces the LLM into a "Scientist" persona.
    *   *Weakness*: Note generation is slow for long videos (~60s), which might discourage users.
    *   *Improvement Needed*: Implement progressive note rendering (streaming) in the UI so users see the note growing in real-time.

### 🎯 Story 2: The Interview Prep
*   **Flow**: Paste DSA URL -> Generate Notes -> Get Quizzed by Study Assistant.
*   **Interaction Evaluation**: 
    *   *Strength*: Templates and pattern recognition help in quick implementation.
    *   *Weakness*: The "Quiz" functionality is currently a generic interaction with the Study Agent.
    *   *Improvement Needed*: Create a specialized `Interviewer Agent` mode that specifically implements "Mock Interviews" with feedback loops and implementation scoring.

### 🎯 Story 3: The Optimization Seek
*   **Flow**: View Dashboard -> Check Coach Insights -> Take Recommended Action.
*   **Interaction Evaluation**: 
    *   *Strength*: Beautiful UI for insights and stats.
    *   *Weakness*: Insights are currently based on simple counts (recent notes, types).
    *   *Improvement Needed*: Integrate "Forgetting Curve" logic. The Coach should track *when* topics were last studied and proactively suggest spaced repetition schedules.

---

## Technical Audit: AI & DB Retrieval

### 🔍 RAG Accuracy
*   **Current State**: Keyword-based search across note contents.
*   **Evaluation**: Good for small libraries, but will fail as the user accumulates hundreds of notes due to lack of semantic understanding.
*   **Recommendation**: Implement **Vector Embeddings** (using `text-embedding-004`) in Supabase (pgvector). This is the gold standard for "getting the right data for the right question".

### 🎙️ Voice Transcriptions
*   **Current State**: YouTube transcripts retrieved via API. High accuracy for clear audio.
*   **Evaluation**: AI sometimes hallucinates if the transcript is "auto-generated" by YouTube without punctuation.
*   **Recommendation**: Add a **Cleanup Agent** to the pipeline that pre-processes the transcript (restoring punctuation and speaker diarization) before sending it to the Learning Agent.

---

## Recommended "World-Class" Improvements

1.  **Vector Store (pgvector)**: Implement true semantic search for context retrieval.
2.  **Multimodal Vision**: Allow the agent to "see" video frames (Gemini Multimodal) to capture diagrams and visual code blocks.
3.  **Spaced Repetition Integration**: Connect the Coach to a flashcard system (Anki-style) generated from notes.
4.  **Local Audio Upload**: Support transcriptions from local MP3/WAV files for lectures not on YouTube.
