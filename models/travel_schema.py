from pydantic import BaseModel
from typing import List, Optional


class TravelRequestFlexible(BaseModel):

    session_id: Optional[str] = None
    destination: Optional[str] = None
    days: Optional[int] = None
    budget: Optional[float] = None
    travelers: Optional[int] = None
    preferences: Optional[List[str]] = []


class DailyPlan(BaseModel):
    day: int
    activities: List[str]


class TravelResponse(BaseModel):
    destination: str
    total_estimated_cost: float
    itinerary: List[DailyPlan]
    budget_status: str
    places: dict