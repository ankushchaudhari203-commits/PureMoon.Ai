from fastapi import APIRouter, HTTPException, Query

from api.db import get_supabase


router = APIRouter(prefix="/chat")


@router.delete("/delete/{conversation_id}")
def delete_conversation(conversation_id: str, user_email: str = Query(...)):
    supabase = get_supabase()
    conversation = (
        supabase.table("conversations")
        .select("id")
        .eq("id", conversation_id)
        .eq("user_id", user_email)
        .limit(1)
        .execute()
    )

    if not (conversation.data or []):
        raise HTTPException(status_code=404, detail="Conversation not found")

    supabase.table("messages").delete().eq(
        "conversation_id",
        conversation_id
    ).execute()

    supabase.table("conversations").delete().eq(
        "id",
        conversation_id
    ).execute()

    return {
        "status": "deleted",
        "conversation_id": conversation_id
    }


@router.delete("/clear-all")
def clear_all_conversations(user_email: str = Query(...)):
    supabase = get_supabase()

    try:
        conversations = (
            supabase.table("conversations")
            .select("id")
            .eq("user_id", user_email)
            .execute()
        )

        conversation_ids = [row["id"] for row in (conversations.data or [])]

        for conversation_id in conversation_ids:
            supabase.table("messages").delete().eq(
                "conversation_id",
                conversation_id
            ).execute()

        supabase.table("conversations").delete().eq(
            "user_id",
            user_email
        ).execute()

        return {"status": "all_deleted"}

    except Exception as e:
        print("CLEAR ALL ERROR:", str(e))
        return {"error": str(e)}
