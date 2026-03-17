class SessionManager:

    def __init__(self):
        # store conversation request state
        self.sessions = {}

        # store generated itineraries
        self.itineraries = {}

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