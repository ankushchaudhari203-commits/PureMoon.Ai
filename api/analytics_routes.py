from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Simple in-memory store (for now)
events = []


class EventRequest(BaseModel):
    session_id: str
    event_name: str
    metadata: dict = {}
     


@router.post("/analytics/track")
def track_event(req: EventRequest):

    event = {
        "session_id": req.session_id,
        "event_name": req.event_name,
        "metadata": req.metadata,
        "timestamp": datetime.utcnow().isoformat()
    }

    print("📊 EVENT:", event)  # 👈 you will see logs here
    events.append(event)

    return {"status": "ok"}

@router.get("/analytics/events")
def get_events():
    
    return {
        "total_events": len(events),
        "events": events
    }