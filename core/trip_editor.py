class TripEditor:

    def add_day(self, itinerary, destination):

        next_day = len(itinerary) + 1

        new_day = {
            "day": next_day,
            "activities": [
                f"Explore hidden gems in {destination}",
                f"Try local food experiences",
                f"Evening city walk"
            ],
            "recommended_restaurants": []
        }

        itinerary.append(new_day)

        return itinerary


    def add_nightlife(self, itinerary, destination):

        if not itinerary:
            return itinerary

        last_day = itinerary[-1]

        nightlife_activity = f"Experience nightlife in {destination}"

        if nightlife_activity not in last_day["activities"]:
            last_day["activities"].append(nightlife_activity)

        return itinerary


    def add_food(self, itinerary, destination):

        if not itinerary:
            return itinerary

        last_day = itinerary[-1]

        food_activity = f"Local food tour in {destination}"

        if food_activity not in last_day["activities"]:
            last_day["activities"].append(food_activity)

        return itinerary