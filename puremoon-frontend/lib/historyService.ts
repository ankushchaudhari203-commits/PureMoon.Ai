<<<<<<< HEAD
import { supabase } from "./supabase";

export async function getConversations() {

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch conversations error:", error);
    return [];
  }

  return data;
}

export async function getMessages(conversationId: string) {

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Fetch messages error:", error);
    return [];
  }

  return data;
}
=======
import { apiFetch } from "./api";

export async function getConversations(userEmail?: string) {
  if (!userEmail) return [];

  try {
    return await apiFetch(`/conversations?user_email=${encodeURIComponent(userEmail)}`);
  } catch (error) {
    console.error("Fetch conversations error:", error);
    return [];
  }
}

export async function getMessages(conversationId: string, userEmail?: string) {
  if (!userEmail) return [];

  try {
    return await apiFetch(`/conversations/${conversationId}/messages?user_email=${encodeURIComponent(userEmail)}`);
  } catch (error) {
    console.error("Fetch messages error:", error);
    return [];
  }
}
>>>>>>> master
