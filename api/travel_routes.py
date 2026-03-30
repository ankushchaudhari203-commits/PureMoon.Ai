import os
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.weather_service import WeatherService

from experts.travel.travel_expert import TravelExpert
from core.session_manager import SessionManager
from core.intent_classifier import IntentClassifier
from core.expert_router import ExpertRouter
from core.travel_validator import TravelValidator
from core.travel_followup import TravelFollowUpGenerator
from core.trip_budget_analyzer import TripBudgetAnalyzer
from core.trip_modification_engine import TripModificationEngine
from core.nlp.hybrid_extractor import HybridTravelExtractor
from core.nlp.food_intent_classifier import FoodIntentClassifier
from app.services.travel_services import TravelServices


from app.services.places_service import PlacesService
from app.services.trip_enrichment_service import TripEnrichmentService

router = APIRouter()

travel_expert = TravelExpert()
session_manager = SessionManager()
intent_classifier = IntentClassifier()
expert_router = ExpertRouter()
validator = TravelValidator()
followup_generator = TravelFollowUpGenerator()
budget_analyzer = TripBudgetAnalyzer()
modifier = TripModificationEngine()
food_classifier = FoodIntentClassifier()
travel_services = TravelServices()
weather_service = WeatherService()


extractor = HybridTravelExtractor(api_key=os.getenv("GEMINI_API_KEY"))
places_service = PlacesService()
enrichment_service = TripEnrichmentService()


class ChatInput(BaseModel):
    session_id: str
    message: str


@router.post("/travel/chat")
def travel_chat(chat_input: ChatInput):

    user_message = chat_input.message
    message_lower = user_message.lower()
    weather = None

    # ------------------------------
    # ✅ LIMIT CONTROL (FIXED)
    # ------------------------------
    count = session_manager.increment_usage(chat_input.session_id)
    print("🚨 COUNT:", count)
    print("🚨 LIMIT:", session_manager.limit)
    print("🚨 CONDITION:", count > session_manager.limit)

    if count > session_manager.limit: #I have changed this from >= to > remember this logic for session management.
        return {
            "reply": "⚠️ You have reached your free limit for today.",
            "state": "limit_exceeded"
    }

    travel_service_links = None

    # Detect food intent
    food_intent = food_classifier.classify(user_message)

    # ------------------------------
    # Load session
    # ------------------------------
    session = session_manager.get_session(chat_input.session_id)
    destination = None

    if session:
        destination = getattr(session, "destination", None)

    # ------------------------------
    # Enrichment requests
    # ------------------------------
    if destination:

        travel_service_links = travel_services.get_all_services(destination)

        if "nightlife" in message_lower:

            nightlife = enrichment_service.generate_nightlife(destination)
            itinerary = session_manager.get_itinerary(chat_input.session_id)

            restaurants = places_service.get_restaurants(destination)
            hotels = places_service.get_hotels(destination)
            weather = weather_service.get_weather(destination)

            return {
                "reply": f"Here are some nightlife spots in {destination}.",
                "nightlife": nightlife or [],
                "itinerary": [
                    {"day": d.day, "activities": d.activities}
                    for d in (itinerary or [])
                ],
                "restaurants": restaurants or [],
                "hotels": hotels or [],
                "weather": weather,
                "travel_services": travel_service_links or [],
                "trip_data": {"destination": destination}
            }

    # ------------------------------
    # Food logic (ADD THIS)
    # ------------------------------

    food = []

    if food_intent == "budget_food":
        food = places_service.search_places(f"cheap food in {destination}")

    elif food_intent == "italian_food":
        food = places_service.search_places(f"italian restaurants in {destination}")

    elif food_intent == "vegetarian_food":
        food = places_service.search_places(f"vegetarian restaurants in {destination}")

    elif food_intent == "late_night_food":
        food = places_service.search_places(f"late night food in {destination}")

    elif food_intent == "general_food":
        food = enrichment_service.generate_food(destination)

    # 🚨 THIS IS IMPORTANT
    if destination and food_intent and (
    "food" in message_lower or
    "eat" in message_lower or
    "restaurant" in message_lower or
    "dining" in message_lower
):

        itinerary = session_manager.get_itinerary(chat_input.session_id) or []

        restaurants = places_service.get_restaurants(destination)
        hotels = places_service.get_hotels(destination)
        weather = weather_service.get_weather(destination)

        return {
            "reply": f"Here are some food spots in {destination}.",
            "food": food or [],
            "itinerary": [
                {"day": d.day, "activities": d.activities}
                for d in (itinerary or [])
            ],
            "restaurants": restaurants or [],
            "hotels": hotels or [],
            "weather": weather,
            "travel_services": travel_service_links or [],
            "trip_data": {"destination": destination}
        }        

    # ------------------------------
    # Extract travel request
    # ------------------------------
    parsed_request, confidence = extractor.extract(user_message)

    

    print("🧠 MESSAGE:", user_message)
    print("🧠 EXTRACTED DEST:", parsed_request.destination)

    # ✅ CLEAN DESTINATION
    if parsed_request.destination:
        parsed_request.destination = parsed_request.destination.split()[0].title()
        print("🧹 CLEANED DEST:", parsed_request.destination)

    # ✅ FALLBACK DESTINATION
    if not parsed_request.destination:
        words = user_message.split()
        for i, word in enumerate(words):
            if word.lower() == "to" and i + 1 < len(words):
                parsed_request.destination = words[i + 1].title()
                print("✅ FALLBACK DEST:", parsed_request.destination)
                break

    # ✅ FORCE OVERRIDE SESSION (NO MERGE BUG)
    session_manager.sessions[chat_input.session_id] = parsed_request
    parsed_request.session_id = chat_input.session_id

    current_request = session_manager.get_session(chat_input.session_id)

    # ------------------------------
    # Validate
    # ------------------------------
    missing_fields = validator.validate(current_request)

    if missing_fields:
        followup = followup_generator.generate(current_request, missing_fields)

        return {
            "reply": followup.get("message"),
            "trip_data": {
                "destination": getattr(current_request, "destination", None),
                "days": getattr(current_request, "days", None),
                "budget": getattr(current_request, "budget", None)
            }
        }

    # ------------------------------
    # Generate itinerary
    # ------------------------------

    # ✅ Increment usage AFTER passing limit
    #session_manager.increment_usage(chat_input.session_id)

    response = travel_expert.generate_itinerary(current_request)

    session_manager.store_itinerary(
        chat_input.session_id,
        response.itinerary
    )

    restaurants = places_service.get_restaurants(current_request.destination)
    hotels = places_service.get_hotels(current_request.destination)
    weather = weather_service.get_weather(current_request.destination)

    travel_service_links = travel_services.get_all_services(current_request.destination)

    day_plans = [
        {"day": d.day, "activities": d.activities}
        for d in response.itinerary
    ]

    trip_advice = budget_analyzer.analyze(
        current_request.budget,
        current_request.days
    )

    return {
        "reply": f"Your {current_request.days}-day trip to {current_request.destination} is ready.",
        "itinerary": day_plans,
        "restaurants": restaurants or [],
        "hotels": hotels or [],
        "weather": weather,
        "travel_services": travel_service_links or [],
        "trip_advice": trip_advice,
        "trip_data": {
            "destination": current_request.destination,
            "days": current_request.days,
            "budget": current_request.budget
        },
        "confidence": confidence
    }