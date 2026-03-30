import { apiFetch } from "./api";

export async function getConversations() {
  try {
    return await apiFetch("/conversations");
  } catch (error) {
    console.error("Fetch conversations error:", error);
    return [];
  }
}

export async function getMessages(conversationId: string) {
  try {
    return await apiFetch(`/conversations/${conversationId}/messages`);
  } catch (error) {
    console.error("Fetch messages error:", error);
    return [];
  }
}
