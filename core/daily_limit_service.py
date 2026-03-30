import os
from datetime import datetime, timezone

from api.db import get_supabase


class DailyLimitService:
    def __init__(self):
        self.limit = int(os.getenv("SESSION_LIMIT", 7))
        self.env = os.getenv("ENVIRONMENT", "prod")

    def _today(self) -> str:
        return datetime.now(timezone.utc).date().isoformat()

    def _user_key(self, user_email: str | None, session_id: str) -> str:
        return (user_email or session_id).strip().lower()

    def get_usage(self, user_email: str | None, session_id: str) -> dict:
        if self.env == "dev":
            return {
                "count": 0,
                "remaining": self.limit,
                "limit": self.limit,
                "date": self._today(),
            }

        supabase = get_supabase()
        user_key = self._user_key(user_email, session_id)
        today = self._today()

        response = (
            supabase.table("daily_usage")
            .select("*")
            .eq("user_key", user_key)
            .eq("usage_date", today)
            .limit(1)
            .execute()
        )

        rows = response.data or []
        count = rows[0]["count"] if rows else 0

        return {
            "count": count,
            "remaining": max(self.limit - count, 0),
            "limit": self.limit,
            "date": today,
        }

    def is_limit_exceeded(self, user_email: str | None, session_id: str) -> bool:
        usage = self.get_usage(user_email, session_id)
        return usage["count"] >= self.limit

    def record_generation(self, user_email: str | None, session_id: str) -> dict:
        if self.env == "dev":
            return {
                "count": 1,
                "remaining": self.limit,
                "limit": self.limit,
                "date": self._today(),
            }

        supabase = get_supabase()
        user_key = self._user_key(user_email, session_id)
        today = self._today()

        response = (
            supabase.table("daily_usage")
            .select("*")
            .eq("user_key", user_key)
            .eq("usage_date", today)
            .limit(1)
            .execute()
        )

        rows = response.data or []

        if rows:
            current = rows[0]
            new_count = int(current.get("count", 0)) + 1
            updated = (
                supabase.table("daily_usage")
                .update({"count": new_count})
                .eq("id", current["id"])
                .execute()
            )
            data = updated.data or [dict(current, count=new_count)]
            count = data[0]["count"]
        else:
            created = (
                supabase.table("daily_usage")
                .insert(
                    {
                        "user_key": user_key,
                        "user_email": user_email,
                        "session_id": session_id,
                        "usage_date": today,
                        "count": 1,
                    }
                )
                .execute()
            )
            data = created.data or [{"count": 1}]
            count = data[0]["count"]

        return {
            "count": count,
            "remaining": max(self.limit - count, 0),
            "limit": self.limit,
            "date": today,
        }
