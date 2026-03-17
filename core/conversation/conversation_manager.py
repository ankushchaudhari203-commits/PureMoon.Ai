class ConversationManager:

    def __init__(self):
        self.sessions = {}

    def get_session(self, session_id):

        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "destination": None,
                "days": None,
                "budget": None,
                "travelers": None,
                "preferences": []
            }

        return self.sessions[session_id]

    def update_session(self, session_id, extracted):

        session = self.get_session(session_id)

        if extracted.destination:
            session["destination"] = extracted.destination

        if extracted.days:
            session["days"] = extracted.days

        if extracted.budget:
            session["budget"] = extracted.budget

        if extracted.travelers:
            session["travelers"] = extracted.travelers

        return session