-- Super-Learning Platform Database Schema
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- CORE USER MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTENT SOURCES (YouTube, Articles, Books)
-- ============================================

CREATE TABLE IF NOT EXISTS content_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (source_type IN ('youtube', 'article', 'book', 'podcast')),
    source_url TEXT,
    source_id TEXT, -- e.g., YouTube video ID
    title TEXT NOT NULL,
    author TEXT,
    duration_seconds INTEGER,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GENERATED NOTES
-- ============================================

CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES content_sources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    note_type TEXT NOT NULL CHECK (note_type IN ('stanford', 'dsa', 'podcast', 'cheatsheet')),
    word_count INTEGER,
    is_favorite BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI EMBEDDINGS FOR SEMANTIC SEARCH
-- ============================================

CREATE TABLE IF NOT EXISTS note_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(768), -- Gemini embedding dimension
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AGENT MEMORY (Long-term learning patterns)
-- ============================================

CREATE TABLE IF NOT EXISTS agent_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL CHECK (agent_type IN ('learning', 'study', 'coach', 'orchestrator')),
    memory_type TEXT NOT NULL CHECK (memory_type IN ('preference', 'pattern', 'insight', 'session')),
    content JSONB NOT NULL,
    relevance_score FLOAT DEFAULT 1.0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STUDY SESSIONS & PROGRESS TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('review', 'quiz', 'chat', 'practice')),
    duration_seconds INTEGER,
    questions_asked INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- ============================================
-- CHAT HISTORY (Agent Conversations)
-- ============================================

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES study_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    agent_type TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_content_sources_user ON content_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_content_sources_type ON content_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_source ON notes(source_id);
CREATE INDEX IF NOT EXISTS idx_notes_type ON notes(note_type);
CREATE INDEX IF NOT EXISTS idx_note_chunks_note ON note_chunks(note_id);
CREATE INDEX IF NOT EXISTS idx_note_chunks_embedding ON note_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_agent_memory_user ON agent_memory(user_id, agent_type);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own content" ON content_sources FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own notes" ON notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own chunks" ON note_chunks FOR ALL USING (
    EXISTS (SELECT 1 FROM notes WHERE notes.id = note_chunks.note_id AND notes.user_id = auth.uid())
);
CREATE POLICY "Users can view own memory" ON agent_memory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own sessions" ON study_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own messages" ON chat_messages FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS FOR SEMANTIC SEARCH
-- ============================================

CREATE OR REPLACE FUNCTION match_note_chunks(
    query_embedding vector(768),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10,
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    note_id UUID,
    chunk_text TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        nc.id,
        nc.note_id,
        nc.chunk_text,
        1 - (nc.embedding <=> query_embedding) AS similarity
    FROM note_chunks nc
    JOIN notes n ON nc.note_id = n.id
    WHERE (p_user_id IS NULL OR n.user_id = p_user_id)
        AND 1 - (nc.embedding <=> query_embedding) > match_threshold
    ORDER BY nc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
