class IntentClassifier:

    def classify(self, user_input: str) -> str:

        text = user_input.lower()

        travel_keywords = ["trip", "travel", "days", "visit", "budget","flight", "hotel", "weekend", "vacation",
                           "getaway", "stay", "destination", "beach",
                           "warm", "holiday"]
        dating_keywords = ["date", "relationship", "crush", "love"]

        if any(word in text for word in travel_keywords):
            return "travel"

        if any(word in text for word in dating_keywords):
            return "dating"

        return "general"
