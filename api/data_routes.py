from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone

from api.db import get_supabase


router = APIRouter()


class ConversationCreateRequest(BaseModel):
    title: str
    user_email: str | None = None


class MessageCreateRequest(BaseModel):
    conversation_id: str
    role: str
    content: str
    trip_data: dict | list | str | None = None
    user_email: str | None = None


class UserTrackRequest(BaseModel):
    email: str
    name: str | None = None
    image: str | None = None


@router.get("/conversations")
def get_conversations():
    supabase = get_supabase()
    response = (
        supabase.table("conversations")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


@router.post("/conversations")
def create_conversation(payload: ConversationCreateRequest):
    supabase = get_supabase()
    short_title = (
        payload.title[:30] + "..." if len(payload.title) > 30 else payload.title
    )

    response = (
        supabase.table("conversations")
        .insert(
            {
                "title": short_title,
                "user_id": payload.user_email,
            }
        )
        .execute()
    )

    data = response.data or []
    if not data:
        raise HTTPException(status_code=500, detail="Failed to create conversation")

    return data[0]


@router.get("/conversations/{conversation_id}/messages")
def get_messages(conversation_id: str):
    supabase = get_supabase()
    response = (
        supabase.table("messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at", desc=False)
        .execute()
    )
    return response.data or []


@router.post("/messages")
def create_message(payload: MessageCreateRequest):
    supabase = get_supabase()
    response = (
        supabase.table("messages")
        .insert(
            {
                "conversation_id": payload.conversation_id,
                "role": payload.role,
                "content": payload.content,
                "trip_data": payload.trip_data,
                "user_id": payload.user_email,
            }
        )
        .execute()
    )

    return {
        "data": response.data or [],
        "error": None,
    }


@router.post("/users/track")
def track_user(payload: UserTrackRequest):
    supabase = get_supabase()
    existing = (
        supabase.table("users")
        .select("*")
        .eq("email", payload.email)
        .limit(1)
        .execute()
    )

    existing_rows = existing.data or []

    if existing_rows:
        current = existing_rows[0]
        updated = (
            supabase.table("users")
            .update(
                {
                    "last_login": datetime.now(timezone.utc).isoformat(),
                    "name": payload.name or current.get("name"),
                    "image": payload.image or current.get("image"),
                }
            )
            .eq("email", payload.email)
            .execute()
        )
        rows = updated.data or []
        return rows[0] if rows else current

    created = (
        supabase.table("users")
        .insert(
            {
                "email": payload.email,
                "name": payload.name,
                "image": payload.image,
                "last_login": datetime.now(timezone.utc).isoformat(),
            }
        )
        .execute()
    )
    rows = created.data or []
    if not rows:
        raise HTTPException(status_code=500, detail="Failed to track user")
    return rows[0]


@router.get("/users/{email}")
def get_user(email: str):
    supabase = get_supabase()
    response = (
        supabase.table("users")
        .select("*")
        .eq("email", email)
        .limit(1)
        .execute()
    )
    rows = response.data or []
    return rows[0] if rows else None


@router.get("/users")
def get_users():
    supabase = get_supabase()
    response = (
        supabase.table("users")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []
