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
