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