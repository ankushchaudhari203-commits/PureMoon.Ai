from google import genai
import os
import json


class GeminiTravelExtractor:

    def __init__(self):

        self.client = genai.Client(
            api_key=os.getenv("GEMINI_API_KEY")
        )

    def extract(self, user_input: str):

        prompt = f"""
        Extract travel information from the text.

        Return JSON with fields:
        destination
        days
        budget
        preferences

        Example:

        Input:
        Plan a 3 day trip to Austin with food and nightlife under 1000

        Output:
        {{
            "destination": "Austin",
            "days": 3,
            "budget": 1000,
            "preferences": ["food","nightlife"]
        }}

        User Input:
        {user_input}
        """

        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        text = response.text

        try:
            data = json.loads(text)
            return data
        except:
            return {}