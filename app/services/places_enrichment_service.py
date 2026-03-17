from app.services.places_service import PlacesService


class PlacesEnrichmentService:

    def __init__(self):
        self.places_service = PlacesService()

    def enrich_destination(self, destination: str):

        restaurants = self.places_service.search_places(
            "best restaurants",
            destination
        )

        hotels = self.places_service.search_places(
            "hotels",
            destination
        )

        attractions = self.places_service.search_places(
            "tourist attractions",
            destination
        )

        return {
            "restaurants": restaurants,
            "hotels": hotels,
            "attractions": attractions
        }