<<<<<<< HEAD
=======
import { apiFetch } from "./api";

>>>>>>> master
export const trackEvent = async (
  eventName: string,
  metadata: any = {}
) => {
  try {
<<<<<<< HEAD
    await fetch("http://localhost:8000/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: "test_user_1", // later dynamic
            
        event_name: eventName,
        metadata: metadata,
      }),
=======
    await apiFetch("/analytics/track", {
      method: "POST",
      json: {
        session_id: "test_user_1", // later dynamic
        event_name: eventName,
        metadata: metadata,
      },
>>>>>>> master
    });
  } catch (error) {
    console.error("Analytics error:", error);
  }
<<<<<<< HEAD
};
=======
};
>>>>>>> master
