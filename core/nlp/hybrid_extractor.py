from core.nlp.regex_extractor import RegexTravelExtractor
from core.nlp.gemini_extractor import GeminiTravelExtractor
from models.travel_schema import TravelRequestFlexible


class HybridTravelExtractor:

    def __init__(self, api_key=None):

        self.regex_extractor = RegexTravelExtractor()

        # Gemini extractor (only if API key exists)
        self.gemini_extractor = (
            GeminiTravelExtractor() if api_key else None
        )

    def extract(self, user_input: str):
        """
        Returns:
            (TravelRequestFlexible, confidence: str)
        """

        # ---------------------------------------------------
        # 1️⃣ Fast regex extraction
        # ---------------------------------------------------
        regex_data = self.regex_extractor.extract(user_input)

        score = self._confidence_score(regex_data)

        # ---------------------------------------------------
        # 2️⃣ If regex already strong OR Gemini unavailable
        # ---------------------------------------------------
        if score >= 2 or not self.gemini_extractor:
            return regex_data, self._confidence_label(score)

        # ---------------------------------------------------
        # 3️⃣ Gemini enrichment
        # ---------------------------------------------------
        print("⚡ Enriching with Gemini...")

        gemini_data = self.gemini_extractor.extract(user_input)

        # Convert dict → TravelRequestFlexible
        if isinstance(gemini_data, dict):
            gemini_data = TravelRequestFlexible(**gemini_data)

        # ---------------------------------------------------
        # 4️⃣ Merge results
        # ---------------------------------------------------
        merged = self._merge(regex_data, gemini_data)

        merged_score = self._confidence_score(merged)

        return merged, self._confidence_label(merged_score)

    def _merge(
        self,
        regex_data: TravelRequestFlexible,
        gemini_data
    ) -> TravelRequestFlexible:

        """
        Regex wins if value already extracted.
        Gemini fills missing fields.
        """

        # Safety conversion
        if isinstance(gemini_data, dict):
            gemini_data = TravelRequestFlexible(**gemini_data)

        return TravelRequestFlexible(
            destination=regex_data.destination or getattr(gemini_data, "destination", None),
            days=regex_data.days or getattr(gemini_data, "days", None),
            budget=regex_data.budget or getattr(gemini_data, "budget", None),
            preferences=regex_data.preferences or getattr(gemini_data, "preferences", [])
        )

    def _confidence_score(self, request: TravelRequestFlexible):

        score = 0

        if request.destination:
            score += 1

        if request.days:
            score += 1

        if request.budget:
            score += 1

        if request.preferences:
            score += 0.5

        return score

    def _confidence_label(self, score: float):

        if score >= 2.5:
            return "High"

        elif score >= 1.5:
            return "Medium"

        else:
            return "Low"