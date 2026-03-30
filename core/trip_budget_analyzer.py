class TripBudgetAnalyzer:

    def analyze(self, budget, days):

        if not budget or not days:
            return "Provide a budget to receive smart travel suggestions."

        per_day = budget / days

        if per_day < 120:
            level = "budget-friendly"
            hotel = "$50-$80 hotels"
            food = "$ street food / casual restaurants"

        elif per_day < 300:
            level = "comfortable mid-range"
            hotel = "$120-$180 hotels"
            food = "$$ restaurants"

        else:
            level = "premium"
            hotel = "$200+ hotels"
            food = "$$$ restaurants"

        return (
            f"Based on your budget of ${budget} for {days} days, "
            f"I recommend a {level} trip. "
            f"Consider staying in {hotel} and dining at {food} "
            f"to keep your trip smooth and within budget."
        )