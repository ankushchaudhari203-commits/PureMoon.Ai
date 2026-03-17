class TripModificationEngine:

    def detect(self, message: str):

        text = message.lower()

        # days
        if "day" in text:
            return "update_days"

        # nightlife
        if any(word in text for word in ["nightlife", "clubs", "bars", "party"]):
            return "add_nightlife"

        # food
        if any(word in text for word in ["food", "restaurant", "eat", "dining"]):
            return "add_food"

        # nature
        if "nature" in text:
            return "add_nature"

        # history
        if "history" in text:
            return "add_history"

        # budget
        if "budget" in text:
            return "increase_budget"

        return None