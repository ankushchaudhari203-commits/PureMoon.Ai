<<<<<<< HEAD
import { supabase } from "./supabase";

export async function createConversation(title: string) {

  const shortTitle =
    title.length > 30 ? title.substring(0, 30) + "..." : title;

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      title: shortTitle
    })
    .select();

  if (error) {
    console.error("Conversation error:", error);
    return null;
  }

  return data?.[0]?.id || null;
=======
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
>>>>>>> master
}

export async function saveMessage(
  conversationId: string,
  role: string,
  content: string,
<<<<<<< HEAD
  tripData?: any
) {
  await supabase.from("messages").insert([
    {
      conversation_id: conversationId,
      role,
      content,
      trip_data: tripData || null
    }
  ]);
}
=======
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
>>>>>>> master
