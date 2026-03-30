class TravelValidator:

    REQUIRED_FIELDS = ["destination", "days", "budget"]

    def validate(self, request):
        missing = []

        if not request.destination:
            missing.append("destination")

        if not request.days:
            missing.append("days")

        if not request.budget:
            missing.append("budget")

        return missing
        
