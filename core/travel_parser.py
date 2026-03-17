import re
from models.travel_schema import TravelRequestFlexible


class TravelParser:

    def parse(self, user_input: str) -> TravelRequestFlexible:

        text = user_input.lower()

        # Destination extraction (e.g., "in Austin")
        destination_match = re.search(r"in ([a-zA-Z ]+)", text)

        # Days extraction (e.g., "3 days")
        days_match = re.search(r"(\d+)\s?day", text)

        # Budget extraction:
        # Supports:
        # "$800"
        # "budget is 800"
        # "under 800"
        budget_match = re.search(
            r"(?:\$\s?(\d+))|(?:budget.*?(\d+))|(?:under\s?(\d+))",
            text
        )

        # Extract preferences
        preferences = []
        possible_prefs = ["food", "nature", "nightlife", "history"]

        for pref in possible_prefs:
            if pref in text:
                preferences.append(pref)

        # Assign extracted values
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
