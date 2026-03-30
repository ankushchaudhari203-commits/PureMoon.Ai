import { apiFetch } from "./api";

export async function createConversation(title: string, userEmail?: string) {
  try {
    const data = await apiFetch("/conversations", {
      method: "POST",
      json: {
        title,
        user_email: userEmail || null,
      },
    });

    return data?.id || null;
  } catch (error) {
    console.error("Conversation error:", error);
    return null;
  }
}

export async function saveMessage(
  conversationId: string,
  role: string,
  content: string,
  tripData?: any,
  userEmail?: string
) {
  try {
    const data = await apiFetch("/messages", {
      method: "POST",
      json: {
        conversation_id: conversationId,
        role,
        content,
        trip_data: tripData || null,
        user_email: userEmail || null,
      },
    });

    return { data: data?.data || [], error: null };
  } catch (error) {
    console.error("Save message error:", error);
    return { data: null, error };
  }
}
