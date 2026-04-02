import requests
<<<<<<< HEAD
=======
import urllib3

# Suppress SSL warnings (safe for trusted APIs)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
>>>>>>> master


class WeatherService:

    GEO_URL = "https://geocoding-api.open-meteo.com/v1/search"
    WEATHER_URL = "https://api.open-meteo.com/v1/forecast"

    # --------------------------------------------------
    # Get coordinates from city name
    # --------------------------------------------------

    def get_coordinates(self, city):

        params = {
            "name": city,
            "count": 1
        }

<<<<<<< HEAD
        response = requests.get(self.GEO_URL, params=params)
=======
        response = requests.get(self.GEO_URL, params=params, verify=False, timeout=10)
>>>>>>> master

        data = response.json()

        results = data.get("results")

        if not results:
            return None, None

        latitude = results[0]["latitude"]
        longitude = results[0]["longitude"]

        return latitude, longitude


    # --------------------------------------------------
    # Get weather for a city
    # --------------------------------------------------

    def get_weather(self, city):

        latitude, longitude = self.get_coordinates(city)

        if not latitude:
            return None

        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current_weather": True
        }

<<<<<<< HEAD
        response = requests.get(self.WEATHER_URL, params=params)
=======
        response = requests.get(self.WEATHER_URL, params=params, verify=False, timeout=10)
>>>>>>> master

        data = response.json()

        weather = data.get("current_weather", {})

        return {
            "temperature": weather.get("temperature"),
            "windspeed": weather.get("windspeed"),
            "winddirection": weather.get("winddirection"),
            "weathercode": weather.get("weathercode"),
            "time": weather.get("time")
        }