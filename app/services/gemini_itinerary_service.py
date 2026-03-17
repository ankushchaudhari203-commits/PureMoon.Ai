from google import genai
import os
import re


class GeminiItineraryService:

    def __init__(self):
        self.client = genai.Client(
            api_key=os.getenv("GEMINI_API_KEY")
        )

    def generate(self, destination, days, preferences):

        prompt = f"""
Create a detailed {days}-day travel itinerary for {destination}.

Interests: {preferences}

Include real attractions, neighborhoods, and restaurants.

Format EXACTLY like this:

Day 1:
- activity
- activity
- activity
- activity

Day 2:
- activity
- activity
- activity
- activity
"""

        try:

            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )

            text = response.text

        except Exception as e:
            print("Gemini itinerary generation failed:", e)
            return None

        # Parse itinerary
        days_list = []
        current_day = []

        lines = text.split("\n")

        for line in lines:

            line = line.strip()

            if re.match(r"day\s*\d+", line.lower()):

                if current_day:
                    days_list.append(current_day)

                current_day = []

            elif line.startswith("-"):

                activity = line.replace("-", "").strip()

                if activity:
                    current_day.append(activity)

        # Add last day
        if current_day:
            days_list.append(current_day)

        # Safety fallback
        if not days_list:
            return None

        return days_list