import re

class NLPParser:

    def parse(self, message: str):

        message = message.lower()

        # -------- Destination --------
        destination_match = re.search(r"(to|in)\s+([a-zA-Z\s]+)", message)
        destination = destination_match.group(2).strip() if destination_match else None

        # -------- Days --------
        days_match = re.search(r"(\d+)\s*(day|days)", message)
        days = int(days_match.group(1)) if days_match else 1

        # -------- Budget --------
        budget_match = re.search(r"\$?(\d+)", message)
        budget = int(budget_match.group(1)) if budget_match else None

        # -------- Preferences --------
        preferences = []

        if "veg" in message:
            preferences.append("vegetarian")

        if "nightlife" in message:
            preferences.append("nightlife")

        if "cheap" in message or "budget" in message:
            preferences.append("budget")

        return {
            "destination": destination,
            "days": days,
            "budget": budget,
            "preferences": preferences
        }