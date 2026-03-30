import { apiFetch } from "./api";

export const trackEvent = async (
  eventName: string,
  metadata: any = {}
) => {
  try {
    await apiFetch("/analytics/track", {
      method: "POST",
      json: {
        session_id: "test_user_1", // later dynamic
        event_name: eventName,
        metadata: metadata,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
  }
};
