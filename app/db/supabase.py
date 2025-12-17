"""
Supabase client configuration and utilities.
"""
import os
from supabase import create_client, Client
from functools import lru_cache


@lru_cache()
def get_supabase_client() -> Client:
    """
    Create and cache Supabase client.
    Uses environment variables for configuration.
    """
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key or supabase_url == "https://placeholder-url.supabase.co":
        print("⚠️ WARNING: Missing or placeholder Supabase configuration. Database features disabled.")
        return None
    
    return create_client(supabase_url, supabase_key)


def get_supabase_admin_client() -> Client:
    """
    Create Supabase client with service role key for admin operations.
    Use sparingly - only for operations that need to bypass RLS.
    """
    supabase_url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not supabase_url or not service_key:
        raise ValueError(
            "Missing Supabase admin configuration. "
            "Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables."
        )
    
    return create_client(supabase_url, service_key)


# Dependency for FastAPI
async def get_db() -> Client:
    """FastAPI dependency for database access."""
    return get_supabase_client()
