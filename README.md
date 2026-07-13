# Super-Learning: Agentic AI YouTube Learning System

Transform YouTube's educational content into a structured knowledge base. Super-Learning uses a multi-agent system to generate, analyze, and guide you through learning material.

---

## Vision

A learning platform built on agent orchestration. Super-Learning generates notes, quizzes, and mentorship based on first principles and scientific learning methods.

## Key Features

### 1. Multi-Agent Orchestration

A system that routes your requests to specialized AI personas:
*   **Learning Agent**: Crafts deep-comprehension notes using pedagogical frameworks (Stanford AI, DSA, Podcasts).
*   **Study Assistant**: Your personal tutor. Ask questions about your notes, request simplifications, or get quizzed.
*   **Learning Coach**: Analyzes your habits and content library to suggest optimization strategies and next topics.

### 2. Specialized Note Modes

*   **Stanford AI Mode**: Analysis focusing on mental models, first principles, and research insights.
*   **DSA & Interview Prep**: Implementation-first approach with pattern recognition, complexity analysis, and coding templates.
*   **Podcast & Strategy**: Extracts frameworks and takeaways from long-form conversations.
*   **Quick-Recall Cheat Sheets**: Concise summaries for rapid review.

### 3. Infrastructure

*   **Frontend**: Next.js application with responsive UI and mobile support.
*   **Backend**: FastAPI with streaming responses for processing long-form video content (60+ minutes).
*   **Database**: Supabase integration for persistent storage of notes, analytics, and agent memory.
*   **Testing**: Locust load testing for reliability verification.

---

## Tech Stack

*   **Core**: Next.js, React, TypeScript, Tailwind CSS
*   **API**: FastAPI, Python 3.9+, Uvicorn
*   **AI**: Google Generative AI (Gemini)
*   **Storage**: Supabase (PostgreSQL + Auth)
*   **Testing**: Playwright (E2E), Locust (Load Testing)

## Getting Started

### Prerequisites
*   Node.js 18+
*   Python 3.9+
*   Google Gemini API Key
*   Supabase Project (URL & Anon Key)

### Installation

1.  **Clone & Environment**:
    ```bash
    git clone https://github.com/jrajath94/super-learning.git
    cd super-learning
    cp .env.example .env
    ```

2.  **Backend Setup**:
    ```bash
    pip install -r requirements.txt
    uvicorn app.main:app --reload
    ```

3.  **Frontend Setup**:
    ```bash
    cd web
    npm install
    npm run dev
    ```

### Semantic Search Setup (Optional)

To enable vector search with embeddings, run this SQL in your Supabase Editor:

```sql
-- Enable Vector Extension
create extension if not exists vector;

-- Add embedding column to notes
alter table notes add column embedding vector(768);

-- Create Similarity Search Function
create or replace function match_notes(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_user_id text
)
returns table (
  id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    notes.id,
    notes.content,
    1 - (notes.embedding <=> query_embedding) as similarity
  from notes
  where 1 - (notes.embedding <=> query_embedding) > match_threshold
  and notes.user_id::text = p_user_id
  order by notes.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

---

## Quality Assurance

Run E2E and load tests for reliability verification:

```bash
# Run E2E Tests
cd web
npx playwright test

# Run Load Tests
python3 -m locust -f locustfile.py --headless
```

---

## Author

**J Rajath** (jrajath94)

## License

MIT License
