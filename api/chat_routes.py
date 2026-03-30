from fastapi import APIRouter
from supabase import create_client
import os

# ✅ Single router with prefix
router = APIRouter(prefix="/chat")

# ✅ Supabase client
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)


# ----------------------------------------
# DELETE SINGLE CONVERSATION
# ----------------------------------------
@router.delete("/delete/{conversation_id}")
def delete_conversation(conversation_id: str):

    # delete messages first
    supabase.table("messages").delete().eq(
        "conversation_id",
        conversation_id
    ).execute()

    # delete conversation
    supabase.table("conversations").delete().eq(
        "id",
        conversation_id
    ).execute()

    return {
        "status": "deleted",
        "conversation_id": conversation_id
    }


# ----------------------------------------
# CLEAR ALL CONVERSATIONS
# ----------------------------------------
@router.delete("/clear-all")
def clear_all_conversations():

    try:
        # ✅ safe delete using condition
        supabase.table("messages").delete().not_.is_("id", None).execute()

        supabase.table("conversations").delete().not_.is_("id", None).execute()

        return {"status": "all_deleted"}

    except Exception as e:
        print("CLEAR ALL ERROR:", str(e))
        return {"error": str(e)}
    