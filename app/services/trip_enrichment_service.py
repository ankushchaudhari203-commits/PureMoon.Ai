from google import genai
import os
import json
from dotenv import load_dotenv

load_dotenv()


class TripEnrichmentService:

    def __init__(self):
        """
        Initialize Gemini client
        """
        self.client = genai.Client(
            api_key=os.getenv("GEMINI_API_KEY")
        )

    # ---------------------------------------------------
    # Helper: Clean Gemini JSON output
    # ---------------------------------------------------

    def _parse_json(self, text):

        try:

            cleaned = text.replace("```json", "").replace("```", "").strip()

            return json.loads(cleaned)

        except Exception as e:

            print("JSON parse error:", e)

            return []

    # ---------------------------------------------------
    # Generate nightlife recommendations
    # ---------------------------------------------------

    def generate_nightlife(self, destination):

        prompt = f"""
Suggest 5 popular nightlife spots in {destination}.

Return strictly in JSON format:

[
  {{
    "name": "place name",
    "description": "short description of the place"
  }}
]
"""

        try:

            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )

            return self._parse_json(response.text)

        except Exception as e:

            print("Gemini nightlife error:", e)

            return [
                {
                    "name": "Local Nightlife",
                    "description": f"Explore bars and nightlife around {destination}."
                }
            ]

    # ---------------------------------------------------
    # Generate food recommendations
    # ---------------------------------------------------

    def generate_food(self, destination):

        prompt = f"""
Suggest 5 must-try food spots or restaurants in {destination}.

Return strictly in JSON format:

[
  {{
    "name": "restaurant name",
    "description": "short description of the food experience"
  }}
]
"""

        try:

            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )

            return self._parse_json(response.text)

        except Exception as e:

            print("Gemini food error:", e)

            return [
                {
                    "name": "Local Food",
                    "description": f"Try popular local restaurants in {destination}."
                }
            ]