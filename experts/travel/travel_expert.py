from models.travel_schema import TravelResponse, DailyPlan
from app.services.gemini_itinerary_service import GeminiItineraryService
from app.services.places_enrichment_service import PlacesEnrichmentService
from core.conversation.conversation_manager import ConversationManager


class TravelExpert:

    DESTINATION_BASE_COST = {
        "austin": 180,
        "new york": 250,
        "san francisco": 270,
        "miami": 220
    }

    PREFERENCE_COST_MULTIPLIER = {
        "food": 1.1,
        "nature": 0.9,
        "nightlife": 1.2,
        "history": 1.0
    }

    DAY_THEMES = [
        "Iconic landmarks & highlights",
        "Neighborhoods & culture",
        "Museums & history",
        "Nature & scenic spots",
        "Food crawl & nightlife"
    ]

    def __init__(self):

        self.gemini = GeminiItineraryService()
        self.places = PlacesEnrichmentService()
        self.conversation_manager = ConversationManager()

    def generate_itinerary(self, request):

        """
        ==============================
        MULTI TURN SESSION UPDATE
        ==============================
        """

        session = self.conversation_manager.update_session(
            request.session_id,
            request
        )

        destination = request.destination or session["destination"]
        days = request.days or session["days"]
        budget = request.budget or session["budget"]
        travelers = request.travelers or session["travelers"]

        if not destination or not days:
            raise ValueError("Destination and days are required")

        destination_key = destination.lower().strip()

        base_cost = self.DESTINATION_BASE_COST.get(destination_key, 200)

        multiplier = 1
        for pref in request.preferences:
            multiplier *= self.PREFERENCE_COST_MULTIPLIER.get(pref.lower(), 1)

        cost_per_day = base_cost * multiplier
        total_cost = round(cost_per_day * days, 2)

        """
        ==============================
        BUDGET EVALUATION
        ==============================
        """

        if budget is None:
            budget_status = "Budget not provided"
        else:
            budget_status = "Within budget" if total_cost <= budget else "Over budget"

        itinerary = []

        gemini_days = None

        """
        ==============================
        GEMINI ITINERARY GENERATION
        ==============================
        """

        try:

            gemini_days = self.gemini.generate(
                destination=destination,
                days=days,
                preferences=request.preferences
            )

        except Exception as e:

            print("Gemini failed, using fallback:", e)

        """
        ==============================
        BUILD ITINERARY
        ==============================
        """

        if gemini_days:

            for i, activities in enumerate(gemini_days, start=1):

                itinerary.append(
                    DailyPlan(
                        day=i,
                        activities=activities
                    )
                )

        else:

            for day in range(1, days + 1):

                activities = self._generate_activities(
                    preferences=request.preferences,
                    destination=destination_key,
                    day_index=day
                )

                itinerary.append(
                    DailyPlan(
                        day=day,
                        activities=activities
                    )
                )

        """
        ==============================
        PLACES ENRICHMENT
        ==============================
        """

        places = self.places.enrich_destination(destination)

        return TravelResponse(
            destination=destination,
            total_estimated_cost=total_cost,
            itinerary=itinerary,
            budget_status=budget_status,
            places=places
        )

    def _generate_activities(self, preferences, destination, day_index):

        if not preferences:

            theme = self.DAY_THEMES[(day_index - 1) % len(self.DAY_THEMES)]

            return [
                f"{theme} in {destination.title()}",
                f"Explore a popular attraction in {destination.title()}",
                f"Evening walk in a lively district of {destination.title()}"
            ]

        sample_activities = {
            "food": [
                "Local food tour",
                "Famous restaurant visit",
                "Street food exploration"
            ],
            "nature": [
                "Scenic park visit",
                "Nature trail walk",
                "Lake or waterfront exploration"
            ],
            "nightlife": [
                "Rooftop bar experience",
                "Live music venue",
                "Night market stroll"
            ],
            "history": [
                "Museum visit",
                "Historic district tour",
                "Landmark exploration"
            ]
        }

        activities = []

        theme = self.DAY_THEMES[(day_index - 1) % len(self.DAY_THEMES)]

        activities.append(f"{theme} in {destination.title()}")

        for pref in preferences:

            options = sample_activities.get(pref.lower(), ["Explore a popular attraction"])

            activity = options[(day_index - 1) % len(options)]

            activities.append(activity)

        activities.append("Evening: Relax at a local cafe or viewpoint")

        return activities[:5]