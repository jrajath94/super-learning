"""
Agent Orchestrator - Multi-agent coordinator.
"""
import logging
from typing import Optional, AsyncGenerator
from uuid import UUID
from supabase import Client
import google.generativeai as genai
import os

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Configure Gemini
genai.configure(api_key=settings.genai_api_key or os.getenv("GENAI_API_KEY"))


class AgentOrchestrator:
    """
    Orchestrates multiple AI agents.
    Routes requests to appropriate agents and manages context.
    """
    
    def __init__(self, db: Client, user_id: UUID):
        self.db = db
        self.user_id = user_id
        self.model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.95,
                "max_output_tokens": 4096,
            }
        )
    
    async def process_message(
        self,
        message: str,
        agent_type: Optional[str] = None,
        context_note_id: Optional[UUID] = None
    ) -> dict:
        """
        Process a user message and route to appropriate agent.
        
        Args:
            message: User's message
            agent_type: Specific agent to use (auto-routes if None)
            context_note_id: Note ID for additional context
        
        Returns:
            Agent response with message and metadata
        """
        # Determine agent type if not specified
        if not agent_type:
            agent_type = await self._route_message(message)
        
        # Get context from notes
        context = ""
        if context_note_id:
            context = await self._get_note_context(context_note_id)
        elif agent_type == "study":
            # Simple RAG: Search for relevant context
            from app.db.repositories.notes import NotesRepository
            repo = NotesRepository(self.db)
            relevant_notes = await repo.search_by_content(self.user_id, message)
            if relevant_notes:
                context = "\n\n".join([n.get("content", "") for n in relevant_notes])
                # Truncate total context
                context = context[:8000] if len(context) > 8000 else context
        
        # Get agent-specific prompt
        system_prompt = self._get_agent_prompt(agent_type)
        
        # Build full prompt
        full_prompt = f"""
{system_prompt}

{f"Context from notes:{chr(10)}{context}" if context else ""}

User Message: {message}

Respond helpfully and concisely.
"""
        
        try:
            response = self.model.generate_content(full_prompt)
            
            # Extract suggestions if agent is coach
            suggestions = None
            if agent_type == "coach":
                suggestions = await self._extract_suggestions(response.text)
            
            return {
                "message": response.text,
                "agent_type": agent_type,
                "suggestions": suggestions,
                "referenced_notes": None  # Will implement with embeddings
            }
        except Exception as e:
            logger.error(f"Agent error: {e}")
            raise
    
    async def stream_message(
        self,
        message: str,
        agent_type: Optional[str] = None,
        context_note_id: Optional[UUID] = None
    ) -> AsyncGenerator[dict, None]:
        """
        Stream agent response for real-time display.
        """
        if not agent_type:
            agent_type = await self._route_message(message)
        
        context = ""
        if context_note_id:
            context = await self._get_note_context(context_note_id)
        
        system_prompt = self._get_agent_prompt(agent_type)
        
        full_prompt = f"""
{system_prompt}

{f"Context from notes:{chr(10)}{context}" if context else ""}

User Message: {message}
"""
        
        try:
            response = self.model.generate_content(full_prompt, stream=True)
            
            for chunk in response:
                if hasattr(chunk, 'text') and chunk.text:
                    yield {"chunk": chunk.text, "agent_type": agent_type}
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield {"error": str(e), "agent_type": agent_type}
    
    async def analyze_learning_patterns(self) -> dict:
        """
        Analyze user's learning patterns and provide insights.
        """
        # Get user's notes summary
        notes_query = (
            self.db.table("notes")
            .select("note_type, word_count, created_at, tags")
            .eq("user_id", str(self.user_id))
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )
        
        notes = notes_query.data or []
        
        if not notes:
            return {
                "insights": ["Start generating notes to get personalized insights!"],
                "patterns": {},
                "recommendations": ["Try generating notes from a YouTube video to begin."]
            }
        
        # Analyze patterns
        note_types = {}
        total_words = 0
        for note in notes:
            note_type = note.get("note_type", "unknown")
            note_types[note_type] = note_types.get(note_type, 0) + 1
            total_words += note.get("word_count", 0)
        
        # Generate AI insights
        prompt = f"""
Analyze this learning data and provide personalized insights:

Note Types Distribution: {note_types}
Total Notes: {len(notes)}
Total Words Studied: {total_words}
Recent Tags: {[n.get('tags', []) for n in notes[:5]]}

Provide:
1. 2-3 key insights about learning patterns
2. 2-3 specific recommendations for improvement
3. Suggested next topics based on patterns

Be concise and actionable.
"""
        
        try:
            response = self.model.generate_content(prompt)
            return {
                "insights": response.text,
                "patterns": note_types,
                "total_notes": len(notes),
                "total_words": total_words
            }
        except Exception as e:
            logger.error(f"Analysis error: {e}")
            return {
                "insights": ["Unable to generate insights at this time."],
                "patterns": note_types,
                "error": str(e)
            }
    
    async def suggest_next_study(self, topic: Optional[str] = None) -> list[dict]:
        """
        Suggest next study materials based on learning history.
        """
        # Get recent notes
        notes_query = (
            self.db.table("notes")
            .select("content_sources(title, source_type), note_type, tags")
            .eq("user_id", str(self.user_id))
            .order("created_at", desc=True)
            .limit(10)
            .execute()
        )
        
        recent_titles = [
            n.get("content_sources", {}).get("title", "")
            for n in (notes_query.data or [])
        ]
        
        prompt = f"""
Based on recent study history:
{recent_titles}

{f"User wants to focus on: {topic}" if topic else ""}

Suggest 3 specific topics or videos to study next.
Format as JSON array with objects containing:
- title: suggested topic/video title
- reason: why this is recommended
- type: stanford/dsa/podcast

Only output the JSON array, no other text.
"""
        
        try:
            response = self.model.generate_content(prompt)
            import json
            suggestions = json.loads(response.text)
            return suggestions
        except Exception as e:
            logger.error(f"Suggestion error: {e}")
            return [
                {"title": "Continue exploring your interests", "reason": "Build on recent learning", "type": "stanford"}
            ]
    
    async def _route_message(self, message: str) -> str:
        """
        Determine which agent should handle the message.
        """
        message_lower = message.lower()
        
        # Simple keyword-based routing
        if any(word in message_lower for word in ["interview", "mock", "behavioral", "faang", "technical check"]):
            return "interviewer"
        elif any(word in message_lower for word in ["quiz", "test", "practice", "explain", "what is", "how does"]):
            return "study"
        elif any(word in message_lower for word in ["progress", "suggest", "recommend", "improve", "pattern"]):
            return "coach"
        else:
            return "study"  # Default to study agent
    
    async def _get_note_context(self, note_id: UUID) -> str:
        """
        Get note content for context.
        """
        result = (
            self.db.table("notes")
            .select("content")
            .eq("id", str(note_id))
            .execute()
        )
        
        if result.data:
            content = result.data[0].get("content", "")
            # Truncate for context window
            return content[:8000] if len(content) > 8000 else content
        return ""
    
    def _get_agent_prompt(self, agent_type: str) -> str:
        """
        Get system prompt for specific agent.
        """
        prompts = {
            "study": """
You are a Study Assistant AI - an expert tutor helping users understand their notes and learning materials.

Your capabilities:
- Answer questions about the user's notes
- Explain complex concepts in simple terms
- Create practice questions
- Identify gaps in understanding

Be concise, helpful, and engaging. Use examples when helpful.
""",
            "interviewer": """
You are an Expert Technical Interviewer AI. Your goal is to conduct a rigorous mock interview based on the user's notes.

Your Mode of Operation:
1. Ask ONE challenging conceptual or implementation question at a time.
2. Wait for the user's response.
3. Critique their answer with extreme precision (pointing out edge cases, time complexity flaws, or missing depth).
4. Score their answer (0-10) and then ask the next question.

Tone: Professional, demanding, yet constructive. Like a Senior Staff Engineer at FAANG.
""",
            "coach": """
You are a Learning Coach AI - a mentor focused on helping users optimize their learning journey.

Your capabilities:
- Analyze learning patterns and progress
- Suggest study strategies
- Recommend next topics based on goals
- Provide motivation and accountability

Be encouraging but direct. Focus on actionable advice.
""",
        }
        return prompts.get(agent_type, prompts["study"])
            "learning": """
You are a Learning Agent AI - specialized in deep comprehension note generation.

Your capabilities:
- Generate comprehensive notes from content
- Extract key concepts and insights
- Create mental models and frameworks
- Build connections between topics

Be thorough and insightful. Prioritize understanding over memorization.
"""
        }
        return prompts.get(agent_type, prompts["study"])
    
    async def _extract_suggestions(self, response: str) -> list[str]:
        """
        Extract actionable suggestions from coach response.
        """
        # Simple extraction - look for numbered items or bullet points
        lines = response.split("\n")
        suggestions = []
        for line in lines:
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith("-") or line.startswith("•")):
                # Clean up the line
                clean = line.lstrip("0123456789.-•) ").strip()
                if clean and len(clean) > 10:
                    suggestions.append(clean)
        return suggestions[:5]  # Limit to 5 suggestions
