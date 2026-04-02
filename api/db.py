import os
from supabase import create_client


def get_supabase():
    url = os.getenv("SUPABASE_URL")
    # Prefer a true server-side key; fall back to the existing key for local/dev compatibility.
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

    if not url or not key:
        raise RuntimeError("Supabase environment variables are not configured")

    return create_client(url, key)
