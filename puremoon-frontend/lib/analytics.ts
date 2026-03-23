export const trackEvent = async (
  eventName: string,
  metadata: any = {}
) => {
  try {
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
    });
  } catch (error) {
    console.error("Analytics error:", error);
  }
};