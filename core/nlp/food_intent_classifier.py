class FoodIntentClassifier:

    def classify(self, text: str):

        text = text.lower()

        if "cheap" in text or "budget" in text:
            return "budget_food"

        if "vegetarian" in text or "vegan" in text:
            return "vegetarian_food"

        if "italian" in text:
            return "italian_food"

        if "late night" in text:
            return "late_night_food"

        if "local food" in text or "street food" in text:
            return "local_food"

        if "food" in text or "restaurant" in text:
            return "general_food"

        return None