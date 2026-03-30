class TravelFollowUpGenerator:

    def generate(self, request, missing_fields):

        responses = []

        if "destination" in missing_fields:
            responses.append("Which city or destination are you planning to visit?")

        if "days" in missing_fields:
            responses.append("How many days are you planning for this trip?")

        if "budget" in missing_fields:
            if request.destination and request.days:
                responses.append(
                    f"Great! A {request.days}-day trip to {request.destination.title()} sounds exciting. "
                    "What budget are you planning for this trip?"
                )
            else:
                responses.append("What budget are you planning for this trip?")

        return {
            "status": "incomplete",
            "missing_fields": missing_fields,
            "message": " ".join(responses)
        }
