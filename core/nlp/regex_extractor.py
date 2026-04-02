import re
from models.travel_schema import TravelRequestFlexible
from core.nlp.base_extractor import BaseTravelExtractor


class RegexTravelExtractor(BaseTravelExtractor):

    def extract(self, user_input: str) -> TravelRequestFlexible:

        text = user_input.lower()

<<<<<<< HEAD
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
=======
        destination = self._extract_destination(text)
        days = self._extract_days(text)
        budget = self._extract_budget(text)

        # Preferences
        preferences = []
        possible_prefs = [
            "food",
            "nature",
            "nightlife",
            "history",
            "beach",
            "shopping",
            "adventure",
            "romantic",
            "family",
            "luxury",
        ]
>>>>>>> master

        for pref in possible_prefs:
            if pref in text:
                preferences.append(pref)

<<<<<<< HEAD
        destination = destination_match.group(1).strip() if destination_match else None
        days = int(days_match.group(1)) if days_match else None

        if budget_match:
            budget = next(
                float(group) for group in budget_match.groups() if group is not None
            )
        else:
            budget = None

=======
>>>>>>> master
        return TravelRequestFlexible(
            destination=destination,
            days=days,
            budget=budget,
            preferences=preferences
<<<<<<< HEAD
        )
=======
        )

    def _extract_destination(self, text: str):
        patterns = [
            r"(?:trip|travel|vacation|getaway|weekend)\s+(?:to|in)\s+([a-zA-Z\s]+?)(?:\s+(?:for|under|with|on|next|this|from|\d|$))",
            r"(?:to|in|visit)\s+([a-zA-Z\s]+?)(?:\s+(?:for|under|with|on|next|this|from|\d|$))",
            r"^([a-zA-Z\s]+?)(?:\s+(?:for|under|with|trip|vacation|getaway|\d|$))",
        ]

        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                destination = match.group(1).strip()
                if destination and destination not in {"a", "an", "the"}:
                    return destination.title()

        return None

    def _extract_days(self, text: str):
        numeric_days_match = re.search(
            r"(\d+)\s?(?:day|days|night|nights)",
            text
        )
        if numeric_days_match:
            return int(numeric_days_match.group(1))

        word_days_match = re.search(
            r"\b(one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:day|days|night|nights)\b",
            text
        )
        if word_days_match:
            word_to_number = {
                "one": 1,
                "two": 2,
                "three": 3,
                "four": 4,
                "five": 5,
                "six": 6,
                "seven": 7,
                "eight": 8,
                "nine": 9,
                "ten": 10,
            }
            return word_to_number[word_days_match.group(1)]

        if "weekend" in text:
            return 2

        return None

    def _extract_budget(self, text: str):
        budget_match = re.search(
            r"(?:\$\s?(\d+(?:\.\d+)?))"
            r"|(?:budget(?:\s+is|\s+of|\s+around|\s+under|\s+about)?\s*\$?\s?(\d+(?:\.\d+)?))"
            r"|(?:under\s*\$?\s?(\d+(?:\.\d+)?))"
            r"|(?:within\s*\$?\s?(\d+(?:\.\d+)?))"
            r"|(?:for\s*\$?\s?(\d+(?:\.\d+)?))",
            text
        )

        if not budget_match:
            return None

        for group in budget_match.groups():
            if group is not None:
                return float(group)

        return None
>>>>>>> master
