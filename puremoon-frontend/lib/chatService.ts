import { supabase } from "./supabase";

export async function createConversation(title: string, userEmail?: string) {

  const shortTitle =
    title.length > 30 ? title.substring(0, 30) + "..." : title;

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      title: shortTitle,
      user_id: userEmail || null
    })
    .select();

  if (error) {
    console.error("Conversation error:", error);
    return null;
  }

  return data?.[0]?.id || null;
}

export async function saveMessage(
  conversationId: string,
  role: string,
  content: string,
  tripData?: any,
  userEmail?: string
) {
  const { data, error } = await supabase.from("messages").insert([
    {
      conversation_id: conversationId,
      role,
      content,
      trip_data: tripData || null,
      user_id: userEmail || null
    }
  ]);

  if (error) {
    console.error("Save message error:", error);
  }

  return { data, error };
}