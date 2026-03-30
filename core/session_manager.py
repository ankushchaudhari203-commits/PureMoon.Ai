import os
from datetime import datetime


class SessionManager:

    def __init__(self):
        # existing
        self.sessions = {}
        self.itineraries = {}

        # ✅ usage tracking
        self.usage = {}

        # ✅ config
        self.limit = int(os.getenv("SESSION_LIMIT", 7))
        self.env = os.getenv("ENVIRONMENT", "prod")
        print("🔥 ENVIRONMENT LOADED:", self.env)

    # -----------------------------
    # usage management
    # -----------------------------

    def _get_today(self):
        return datetime.now().strftime("%Y-%m-%d")

    def increment_usage(self, session_id):

        today = self._get_today()

        if session_id not in self.usage:
            self.usage[session_id] = {
                "count": 0,
                "date": today
            }

        # reset daily
        if self.usage[session_id]["date"] != today:
            self.usage[session_id] = {
                "count": 0,
                "date": today
            }

        self.usage[session_id]["count"] += 1

        print("🔥 INCREMENT:", session_id, "→", self.usage[session_id])

        return self.usage[session_id]["count"]

    def is_limit_exceeded(self, session_id):
         
        current_usage = self.usage.get(session_id)

        print("🔍 CHECK LIMIT → session:", session_id)
        print("🔍 CURRENT USAGE:", current_usage)
        print("🔍 LIMIT:", self.limit)
        print("🔍 ENV:", self.env)


        # ✅ DEV MODE → NO LIMIT
        if self.env == "dev":
            return False
        return (current_usage or {}).get("count", 0) >= self.limit

        

    # -----------------------------
    # session request management
    # -----------------------------

    def get_session(self, session_id):
        return self.sessions.get(session_id)

    def update_session(self, session_id, data):

        if session_id not in self.sessions:
            self.sessions[session_id] = data
        else:
            existing = self.sessions[session_id]
            self.sessions[session_id] = self._merge(existing, data)

    def clear_session(self, session_id):

        if session_id in self.sessions:
            del self.sessions[session_id]

        if session_id in self.itineraries:
            del self.itineraries[session_id]

        # ✅ also clear usage
        if session_id in self.usage:
            del self.usage[session_id]

    def _merge(self, old, new):

        return type(old)(
            destination=new.destination or old.destination,
            days=new.days or old.days,
            budget=new.budget or old.budget,
            preferences=list(set((old.preferences or []) + (new.preferences or [])))
        )

    # -----------------------------
    # itinerary management
    # -----------------------------

    def store_itinerary(self, session_id, itinerary):
        self.itineraries[session_id] = itinerary

    def get_itinerary(self, session_id):
        return self.itineraries.get(session_id)