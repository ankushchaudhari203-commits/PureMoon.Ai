from experts.travel.travel_expert import TravelExpert

class ExpertRouter:

    def __init__(self):
        self.travel_expert = TravelExpert()

    def route(self, intent: str):
        if intent == "travel":
            return self.travel_expert

        # Future:
        # if intent == "dating": return DatingExpert()

        return None
