from urllib.parse import quote_plus


class TravelServices:
    """
    Generates external service links for travel related services
    like car rentals and food delivery platforms.
    """

    # -----------------------------
    # Car Rental Providers
    # -----------------------------
    CAR_RENTAL_PROVIDERS = [
        {
            "name": "Avis",
            "url": "https://www.avis.com/en/locations/us?search={destination}"
        },
        {
            "name": "Budget",
            "url": "https://www.budget.com/en/locations/us?search={destination}"
        },
        {
            "name": "Hertz",
            "url": "https://www.hertz.com/rentacar/reservation/?pickupLocation={destination}"
        },
        {
            "name": "Sixt",
            "url": "https://www.sixt.com/#/reservation?search={destination}"
        },
        {
            "name": "Dollar",
            "url": "https://www.dollar.com/Reservations.aspx?location={destination}"
        },
        {
            "name": "Enterprise",
            "url": "https://www.enterprise.com/en/car-rental/locations/us.html?search={destination}"
        }
    ]

    # -----------------------------
    # Food Delivery Providers
    # -----------------------------
    FOOD_PROVIDERS = [
        {
            "name": "DoorDash",
            "url": "https://www.doordash.com/search/store/{destination}/"
        },
        {
            "name": "Uber Eats",
            "url": "https://www.ubereats.com/search?q={destination}"
        },
        {
            "name": "Grubhub",
            "url": "https://www.grubhub.com/search?query={destination}"
        }
    ]

    # -----------------------------
    # Generate Car Rental Links
    # -----------------------------
    def get_car_rentals(self, destination: str):

        if not destination:
            return []

        encoded_destination = quote_plus(destination)

        rentals = []

        for provider in self.CAR_RENTAL_PROVIDERS:
            rentals.append({
                "name": provider["name"],
                "type": "car_rental",
                "url": provider["url"].format(destination=encoded_destination)
            })

        return rentals

    # -----------------------------
    # Generate Food Delivery Links
    # -----------------------------
    def get_food_delivery(self, destination: str):

        if not destination:
            return []

        encoded_destination = quote_plus(destination)

        food_links = []

        for provider in self.FOOD_PROVIDERS:
            food_links.append({
                "name": provider["name"],
                "type": "food_delivery",
                "url": provider["url"].format(destination=encoded_destination)
            })

        return food_links

    # -----------------------------
    # Get All Travel Services
    # -----------------------------
    def get_all_services(self, destination: str):

        return {
            "car_rentals": self.get_car_rentals(destination),
            "food_delivery": self.get_food_delivery(destination)
        }