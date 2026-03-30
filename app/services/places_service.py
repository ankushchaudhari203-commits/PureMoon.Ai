import requests
import os


class PlacesService:

    BASE_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"

    def __init__(self):
        self.api_key = os.getenv("GOOGLE_PLACES_API_KEY")

    def search_places(self, query, location=None):

        results = []

        params = {
            "query": query,
            "key": self.api_key
        }

        if location:
            params["location"] = location

        response = requests.get(
            self.BASE_URL,
            params=params
        )

        data = response.json()

        for place in data.get("results", []):

            photo = None

            if place.get("photos"):
                photo_ref = place["photos"][0]["photo_reference"]

                photo = (
                    f"https://maps.googleapis.com/maps/api/place/photo"
                    f"?maxwidth=400"
                    f"&photo_reference={photo_ref}"
                    f"&key={self.api_key}"
                )

            results.append({
                "name": place.get("name"),
                "rating": place.get("rating"),
                "address": place.get("formatted_address") or place.get("vicinity"),
                "lat": place["geometry"]["location"]["lat"],
                "lng": place["geometry"]["location"]["lng"],
                "photo": photo,
                "maps_link": f"https://www.google.com/maps/place/?q=place_id:{place['place_id']}"
            })

        return results

    def get_restaurants(self, destination):
        return self.search_places(f"best restaurants in {destination}")

    def get_hotels(self, destination):
        return self.search_places(f"best hotels in {destination}")