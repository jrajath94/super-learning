# 🧠 Super-Learning Platform: Project Context & AI Handoff
> **Last Updated**: Dec 2025
> **Status**: Production Ready (Features 1, 2, 3 Complete)

This document contains the **Master Context** for the Super-Learning Platform. Use this to orient yourself immediately in any future session.

---

## 1. User Profile & Core Philosophy (CRITICAL)

**The User:**
*   **Background**: Master's in Information Management (UIUC), ML experience.
*   **Neurodivergence**: **ADHD, Anxiety, High IQ**.
*   **Triggers**: Walls of text, ambiguity, "impossible" tasks.
*   **Needs**: High "Dopamine Density" (novelty), Visual Anchors, "Safety Nets" for hard problems.
*   **Goal**: Not just learning, but **Neural Encoding**—deep grokking for high-stakes interviews (FAANG, OpenAI).

**The "Neural Architect" Philosophy:**
We do not build generic AI features. We build **Cognitive Prosthetics**.
1.  **Neuro-Symbolic Reasoning**: Use Chain-of-Thought / Tree-of-Thought prompting to decompose complex ideas before presenting them.
2.  **Dopamine Engineering**: Inject novelty (🍌), humor, and challenge (⚔️) to maintain arousal.
3.  **Feynman-Sutskever Synthesis**: Every concept must be explained like a 5-year-old (Feynman) AND rigorously critiqued (Ilya Sutskever).
4.  **Visual Hallucination**: Since we can't always generate images, we use `[SCENE: ...]` descriptions to force the user's brain to visualize.

---

## 2. Technical Architecture

*   **Frontend**: Next.js 14 (App Router), Tailwind CSS (Premium Glassmorphism Design).
*   **Backend**: FastAPI (Python), Pydantic.
*   **Database**: Supabase (PostgreSQL + pgvector).
*   **AI Engine**: Google Gemini Pro 1.5/2.0 (via `google.generativeai`).
*   **Services**:
    *   `llm.py`: Managing prompts, retries, and generic note generation.
    *   `pdf.py`: Parsing Research Papers (`pypdf`, `pymupdf`).
    *   `scraper.py`: Fetching Course Curriculums (`beautifulsoup4`).

---

## 3. Implemented Features (The "Triad")

### 🧠 Feature 1: The Master Prompt (Artifact)
A portable prompt located at `docs/MASTER_LEARNING_PROMPT.md`.
*   **Purpose**: Allows the user to paste a "Neural Architect" into any LLM (Claude, ChatGPT).
*   **Key Components**: `NOVELTY_ANCHOR`, `DEEP_THOUGHT_ANCHOR`, `WARNING_ANCHOR`.

### 🔬 Feature 2: Research Station (Ilya Mode)
*   **Route**: `/dashboard/research`
*   **Function**: Users paste an arXiv URL or upload a PDF.
*   **Logic**:
    1.  Downloads/Parses PDF.
    2.  Uses `RESEARCH_PAPER_PROMPT` to analyze "Novelty Anatomy", "Math Decoding", and "Architecture Visualization".
    3.  Stores in `content_sources` (type: `pdf`) and `notes`.

### 🏗️ Feature 3: Curriculum Deconstructor
*   **Route**: `/dashboard/curriculum`
*   **Function**: Users paste a generic course URL (Maven, Coursera).
*   **Logic**:
    1.  Scrapes the page text (`scraper.py`).
    2.  Uses `CURRICULUM_PROMPT` to extract a JSON list of modules.
    3.  Frontend displays modules. User clicks "Generate" -> Triggers `RESEARCH_PAPER_PROMPT` (re-used for depth) on that specific module topic.

---

## 4. The "Brain" (System Prompts)

This is the actual logic driving the AI.

### The Core System (Neuro-Symbolic)
```python
NEURAL_ARCHITECT_SYSTEM = """
You are a **Neural Architect** designed for a neurodivergent genius.
OPTIMIZATION FUNCTIONS:
1. Cognitive Load Balance: Chunking.
2. Dopamine Engineering: Novelty/Humor.
3. Feynman Integration: ELI5 + Math.
4. Anxiety Mitigation: Safety Nets.
"""
```

### Research Paper Prompt (Ilya Style)
```python
RESEARCH_PAPER_PROMPT = """
GOAL: Replicate Ilya Sutskever's deep understanding.
OUTPUT FORMAT:
# 📜 [Title]
## 🍌 The Novelty Anatomy
* Status Quo -> Bottleneck -> The Unlock.
## 🔬 Algorithmic Deep Dive
* [SCENE: Vivid Architecture Description]
* The Math (Decoded): Break down the scariest equation variable-by-variable.
## 🧪 Experiments & "The Trick"
* The "Ilya" Critique: Strengths/Weaknesses.
"""
```

### Curriculum Extraction Prompt
```python
CURRICULUM_PROMPT = """
TASK: Extract curriculum from course landing page.
OUTPUT: JSON list of modules (number, title, description, key_concepts).
RULES: Ignore marketing fluff. Focus on syllabus.
"""
```

---

## 5. Next Steps for AI Agent
If you are picking up this project:
1.  **Refine Vision**: The user wants "Nano Banana Pro" image generation. Currently, we only have placeholder text hooks (`[SCENE: ...]`). Implementing a real image diffusion pipeline is the next logic step.
2.  **Testing**: E2E tests exist for the legacy app, but new features (Research/Curriculum) likely need Playwright coverage.
3.  **Optimization**: The chunking window in `llm.py` is 1000 chars overlap. Monitor if this is sufficient for very dense papers.
