import re
from models.travel_schema import TravelRequestFlexible
from core.nlp.base_extractor import BaseTravelExtractor


class RegexTravelExtractor(BaseTravelExtractor):

    def extract(self, user_input: str) -> TravelRequestFlexible:

        text = user_input.lower()

        # Destination (stops before keywords like under, budget, with, numbers)
        destination_match = re.search(
            r"(?:to|in)\s+([a-zA-Z ]+?)(?:\s+(?:under|budget|for|with|\d|$))",
            text
        )

        # Days
        days_match = re.search(r"(\d+)\s?day", text)

        # Budget
        budget_match = re.search(
            r"(?:\$\s?(\d+))|(?:budget.*?(\d+))|(?:under\s?(\d+))",
            text
        )

        # Preferences
        preferences = []
        possible_prefs = ["food", "nature", "nightlife", "history"]

        for pref in possible_prefs:
            if pref in text:
                preferences.append(pref)

        destination = destination_match.group(1).strip() if destination_match else None
        days = int(days_match.group(1)) if days_match else None

        if budget_match:
            budget = next(
                float(group) for group in budget_match.groups() if group is not None
            )
        else:
            budget = None

        return TravelRequestFlexible(
            destination=destination,
            days=days,
            budget=budget,
            preferences=preferences
        )