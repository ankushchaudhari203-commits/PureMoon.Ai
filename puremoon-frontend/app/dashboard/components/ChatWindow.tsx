"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ChatInput from "./ChatInput";
import dynamic from "next/dynamic";
import { createConversation, saveMessage } from "@/lib/chatService";
import { getMessages } from "@/lib/historyService";
import { apiFetch } from "@/lib/api";
import jsPDF from "jspdf";
import SplitExpense from "./SplitExpense";
import { trackEvent } from "@/lib/analytics";
import type { TourStep } from "./OnboardingTour";

const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false
});

type Message = {
  role: "user" | "ai";
  content: string;
};

type TripData = {
  destination: string;
  duration: string;
  budget: string;
  travelers: string;
};

type ItineraryDay = {
  day: number;
  activities?: string[];
};

type ChatWindowProps = {
  setDestination: (value: string | null) => void;
  setDays: (value: number | null) => void;
  setBudget: (value: number | null) => void;
  selectedConversation?: string | null;
  activeTourStep?: TourStep;
  isHighlighted?: (step: TourStep) => boolean;
};

type NightlifePlace = {
  name: string
  description: string
  rating?: number
  maps_link?: string
}

const asArray = (value: any) => (Array.isArray(value) ? value : []);

const extractTripSnapshot = (rawTripData: any) => {
  if (!rawTripData) return null;

  let parsed = rawTripData;

  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      console.warn("Unable to parse trip_data; using raw value", rawTripData);
      return null;
    }
  }

  if (!parsed || typeof parsed !== "object") return null;

  const nestedTrip = parsed.trip_data && typeof parsed.trip_data === "object"
    ? parsed.trip_data
    : {};

  return {
    itinerary: asArray(parsed.itinerary ?? nestedTrip.itinerary),
    restaurants: asArray(parsed.restaurants ?? nestedTrip.restaurants),
    hotels: asArray(parsed.hotels ?? nestedTrip.hotels),
    nightlife: asArray(parsed.nightlife ?? nestedTrip.nightlife),
    food: asArray(parsed.food ?? nestedTrip.food),
    destination: parsed.destination ?? nestedTrip.destination ?? "",
    duration: parsed.duration ?? parsed.days ?? nestedTrip.duration ?? nestedTrip.days ?? "",
    budget: parsed.budget ?? nestedTrip.budget ?? "",
    travelers: parsed.travelers ?? nestedTrip.travelers ?? "",
    trip_advice: parsed.trip_advice ?? nestedTrip.trip_advice ?? null,
    recommended_hotel: parsed.recommended_hotel ?? nestedTrip.recommended_hotel ?? null,
    confidence: parsed.confidence ?? nestedTrip.confidence ?? null,
    travel_services: parsed.travel_services ?? nestedTrip.travel_services ?? null,
    weather: parsed.weather ?? nestedTrip.weather ?? null,
    location: parsed.location ?? nestedTrip.location ?? null,
    split_expense: parsed.split_expense ?? nestedTrip.split_expense ?? [],
    split_details: parsed.split_details ?? nestedTrip.split_details ?? null,
  };
};

export default function ChatWindow({
  setDestination,
  setDays,
  setBudget,
  selectedConversation,
  activeTourStep,
  isHighlighted
}: ChatWindowProps) {

  const { data: session } = useSession();

  const [messages, setMessages] = useState<Message[]>([]);
  /*const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);*/
  const [nightlife, setNightlife] = useState<NightlifePlace[]>([]);
  const [thinking, setThinking] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [travelServices, setTravelServices] = useState<{
  car_rentals: any[]
  food_delivery: any[]
} | null>(null);

  const [itinerary, setItinerary] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [tripAdvice, setTripAdvice] = useState<string | null>(null);
 

  const [tripData, setTripData] = useState<TripData>({
    destination: "",
    duration: "",
    budget: "",
    travelers: "",
  });

  const [confidence, setConfidence] = useState("Low");

  const [showWelcome, setShowWelcome] = useState(true);
  const [displayText, setDisplayText] = useState("");
  const [mounted, setMounted] = useState(false);
  const [recommendedHotel, setRecommendedHotel] = useState<any | null>(null);
  const flightDestination = tripData.destination?.replace(/\s+/g, "+");
  const [weather, setWeather] = useState<any>(null);
  const [showSplit, setShowSplit] = useState(false);
  const [splitResult, setSplitResult] = useState<string[]>([]);
  const [splitDetails, setSplitDetails] = useState<any>(null);
  

  const [foodPlaces, setFoodPlaces] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fullText =
    "Welcome to PureMoon.\nYour intelligent travel & life assistant.";

  const formatPrice = (level: number) => {
    if (!level && level !== 0) return "—";
    return "$".repeat(level);
  };

  const handleDownload = () => {
  if (!itinerary) {
    alert("No itinerary available to download");
    return;
  }

  let content = `🌍 PureMoon Travel Itinerary\n\n`;

  content += `Trip Plan:\n`;

  // 🗓️ Daily Plan
  if (Array.isArray(itinerary)) {
  content += `🗓️ Daily Plan:\n`;

  itinerary.forEach((day: any) => {
    content += `\nDay ${day.day}:\n`;

    if (Array.isArray(day.activities)) {
      day.activities.forEach((act: string) => {
        content += `- ${act}\n`;
      });
    }
  });
}

  // 🍽️ Restaurants
  if (itinerary.restaurants) {
    content += `\n🍽️ Restaurants:\n`;
    itinerary.restaurants.forEach((r: any) => {
      content += `- ${r.name || r}\n`;
    });
  }

  // 🏨 Hotels
  if (itinerary.hotels) {
    content += `\n🏨 Hotels:\n`;
    itinerary.hotels.forEach((h: any) => {
      content += `- ${h.name || h}\n`;
    });
  }

  const blob = new Blob([content], { type: "text/plain" });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "puremoon-itinerary.txt";
  a.click();
console.log("ITINERARY DATA:", itinerary);
  URL.revokeObjectURL(url);
};

const handleDownloadPDF = async () => {
  if (!itinerary) return;

  const doc = new jsPDF();

  // ✅ Load logo
  const img = new Image();
  img.src = "/moon.png";

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // ✅ Maintain aspect ratio
  const imgWidth = 25;
  const imgHeight = (img.height * imgWidth) / img.width;

  // ✅ Logo (left)
  doc.addImage(img, "PNG", 10, 10, imgWidth, imgHeight);

  // ✅ Title (aligned with logo)
  doc.setFontSize(18);
  doc.text(
    "PureMoon Travel Itinerary",
    10 + imgWidth + 5,
    10 + imgHeight / 2 + 2
  );

  // ✅ Move cursor below header
  let y = 10 + imgHeight + 10;

  // ✅ Divider line
  doc.setDrawColor(200);
  doc.line(10, y - 5, pageWidth - 10, y - 5);

  // =========================
  // ✅ ADD DISCLAIMER HERE
  // =========================

  doc.setFontSize(9);
  doc.setTextColor(120);

  const disclaimer =
    "PureMoon may make mistakes. Please verify and validate the information.";

  const disclaimerLines = doc.splitTextToSize(disclaimer, 180);

  disclaimerLines.forEach((line: string) => {
    doc.text(line, 10, y);
    y += 5;
  });

  y += 5;

  // reset color
  doc.setTextColor(0, 0, 0);

  // =========================
  // ✅ ITINERARY
  // =========================

  if (Array.isArray(itinerary)) {
    itinerary.forEach((day: any) => {
      // Day title
      doc.setFontSize(14);
      doc.setTextColor(100, 0, 200); // subtle purple
      doc.text(`Day ${day.day}`, 10, y);
      doc.setTextColor(0, 0, 0);

      y += 8;

      doc.setFontSize(11);

      day.activities?.forEach((act: string) => {
        const lines = doc.splitTextToSize(act, 180);

        lines.forEach((line: string) => {
          doc.text(`- ${line}`, 12, y);
          y += 6;

          // Page break
          if (y > 280) {
            doc.addPage();
            y = 10;
          }
        });
      });

      y += 6;
    });
  }

  doc.save("puremoon-itinerary.pdf");
};

  /*
  ==============================
  LOAD HISTORY CONVERSATION
  ==============================
  */

  const loadConversation = async (conversationId: string) => {

  const data = await getMessages(conversationId);

  console.log("loadConversation:", conversationId);
  console.log("messages:", data);
  console.log("trip_data values:", data.map((msg: any) => msg.trip_data));
  console.log("itinerary from data:", data
    .map((msg: any) => {
      if (!msg.trip_data) return null;
      try {
        const tripPayload = typeof msg.trip_data === 'string' ? JSON.parse(msg.trip_data) : msg.trip_data;
        return tripPayload.itinerary || tripPayload?.itinerary;
      } catch (err) {
        console.warn('trip_data parse fail', err, msg.trip_data);
        return null;
      }
    })
    .filter((item: any) => item));

  const formatted = data.map((msg: any) => ({
    role: msg.role,
    content: msg.content
  }));

  setMessages(formatted);
  setConversationId(conversationId);

  /*
  ==============================
  RESTORE TRIP STATE
  ==============================
  */

  const mergedTrip = data.reduce((acc: any, msg: any) => {
    if (!msg.trip_data) return acc;
    const source = extractTripSnapshot(msg.trip_data);
    if (!source) return acc;
    const merged = { ...acc };

    // Preserve existing itinerary/records unless new data provides them
    if (source.itinerary.length > 0) merged.itinerary = source.itinerary;
    if (source.restaurants.length > 0) merged.restaurants = source.restaurants;
    if (source.hotels.length > 0) merged.hotels = source.hotels;
    if (source.nightlife.length > 0) merged.nightlife = source.nightlife;
    if (source.food.length > 0) merged.food = source.food;

    merged.destination = merged.destination || source.destination;
    merged.duration = merged.duration || source.duration;
    merged.budget = merged.budget || source.budget;
    merged.travelers = merged.travelers || source.travelers;

    merged.trip_advice = merged.trip_advice || source.trip_advice;
    merged.recommended_hotel = merged.recommended_hotel || source.recommended_hotel;
    merged.confidence = merged.confidence || source.confidence;
    merged.travel_services = merged.travel_services || source.travel_services;
    merged.weather = merged.weather || source.weather;
    merged.location = merged.location || source.location;
    merged.split_expense = source.split_expense || merged.split_expense;
    merged.split_details = source.split_details || merged.split_details;

    return merged;
  }, {});

  if (Object.keys(mergedTrip).length > 0) {
    setSplitResult(mergedTrip.split_expense || []);
    setTravelServices(mergedTrip.travel_services || null);
    setWeather(mergedTrip.weather || null);
    setSplitDetails(mergedTrip.split_details || null);

    const trip = mergedTrip;

    setItinerary(Array.isArray(trip.itinerary) ? trip.itinerary : []);
    setRestaurants(Array.isArray(trip.restaurants) ? trip.restaurants : []);
    setHotels(Array.isArray(trip.hotels) ? trip.hotels : []);
    setNightlife(Array.isArray(trip.nightlife) ? trip.nightlife : []);
    setFoodPlaces(Array.isArray(trip.food) ? trip.food : []);

    setTripAdvice(trip.trip_advice || null);
    setRecommendedHotel(
      trip.recommended_hotel || (Array.isArray(trip.hotels) ? trip.hotels[0] : null) || null
    );

    setTripData({
      destination: trip.destination || "",
      duration: trip.duration || "",
      budget: trip.budget ? `$${trip.budget}` : "",
      travelers: trip.travelers ? String(trip.travelers) : "",
    });

    setConfidence(trip.confidence || "Low");
  } else {
    // Reset itinerary state when selected conversation has no trip_data
    setItinerary([]);
    setRestaurants([]);
    setHotels([]);
    setNightlife([]);
    setFoodPlaces([]);
    setTripAdvice(null);
    setRecommendedHotel(null);
    setTripData({ destination: "", duration: "", budget: "", travelers: "" });
    setConfidence("Low");
  }
};



  

  
  
  
  
  
  
  
  
  
  /*
  ==============================
  LOAD CONVERSATION WHEN CLICKED
  ==============================
  */

  useEffect(() => {

    if (!selectedConversation) return;

    loadConversation(selectedConversation);

  }, [selectedConversation]);

  /*
  ==============================
  WELCOME ANIMATION
  ==============================
  */

  useEffect(() => {

    if (messages.length > 0) {
      setShowWelcome(false);
      return;
    }

    let i = 0;

    const typing = setInterval(() => {
      setDisplayText(fullText.slice(0, i));
      i++;

      if (i > fullText.length) clearInterval(typing);
    }, 35);

    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 4000);

    return () => {
      clearInterval(typing);
      clearTimeout(timer);
    };

  }, [messages]);

  const resetTrip = () => {
    setTripData({
      destination: "",
      duration: "",
      budget: "",
      travelers: "",
    });

    setItinerary([]);
    setRestaurants([]);
    setHotels([]);
    setConfidence("Low");
  };

  /*
  ==============================
  SEND MESSAGE
  ==============================
  */

  const sendMessage = async (text: string) => {

    const userMessage: Message = {
      role: "user",
      content: text,
    };

    trackEvent("message_sent", {
    text_length: text.length,
    });

    setMessages((prev) => [...prev, userMessage]);
    setThinking(true);
    setShowWelcome(false);

    let convId = conversationId;

    if (!convId) {
      convId = await createConversation(text, session?.user?.email);
      if (convId) setConversationId(convId);
    }

    if (convId) {
      const saved = await saveMessage(convId, "user", text, null, session?.user?.email);
      if (saved.error) {
        console.error("User message save failed", saved.error);
      }
    }

    try {
      
      const sessionId = localStorage.getItem("session_id") //added logic for session management
      || crypto.randomUUID();//added logic for session management

      localStorage.setItem("session_id", sessionId); //added logic for session management
      
      const data = await apiFetch("/travel/chat", {
        method: "POST",
        json: {
          session_id: sessionId,
          message: text,
          user_email: session?.user?.email || null,
        },
      });
      if (data.itinerary) {
        trackEvent("itinerary_generated", {
          destination: data.trip_data?.destination || "unknown",
          days: data.trip_data?.duration || "unknown",
  });
}

      if (data.state === "limit_exceeded") {
        trackEvent("limit_exceeded");
  setThinking(false);

  // Option 1: simple alert
  alert("⚠️ You have reached your free limit. Try again after 24 hours.");

  // Option 2 (better UX): show in chat
  setMessages((prev) => [
    ...prev,
    {
      role: "ai",
      content: "🚫 Free limit reached.\n\nUpgrade coming soon 🚀"
    }
  ]);

  return; // 🚨 VERY IMPORTANT (stops execution)
}

      console.log("FULL BACKEND RESPONSE:", data);

      if (data.itinerary) {
        setItinerary(data.itinerary);
      }

      if (data.restaurants) {
        setRestaurants(data.restaurants);
      }

      if (data.hotels) {
        setHotels(data.hotels);
      }

      if (data.nightlife) {
        setNightlife(data.nightlife);
      }

      if (data.food) {
        setFoodPlaces(data.food);
      }

      setItinerary(data.itinerary || []);
      setRestaurants(data.restaurants || []);
      setHotels(data.hotels || []);
      setTravelServices(data.travel_services);
      setWeather(data.weather);

      setItinerary(data.itinerary || []);
      setRestaurants(data.restaurants || []);
      setHotels(data.hotels || []);
      setTripAdvice(data.trip_advice);
      setRecommendedHotel(
  data.recommended_hotel || (data.hotels && data.hotels[0]) || null
);

      setTripData({
        destination: data.trip_data?.destination || "",
        duration: data.trip_data?.days ? `${data.trip_data.days} Days` : "",
        budget: data.trip_data?.budget ? `$${data.trip_data.budget}` : "",
        travelers: data.trip_data?.travelers
          ? String(data.trip_data.travelers)
          : "",
      });

      setConfidence(data.confidence || "Low");

      const aiMessage: Message = {
        role: "ai",
        content: data.reply || "Something went wrong.",
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (convId) {
        const tripDataToSave = {
          ...data.trip_data,
          itinerary: data.itinerary || [],
          restaurants: data.restaurants || [],
          hotels: data.hotels || [],
          nightlife: data.nightlife || [],
          food: data.food || [],
          travel_services: data.travel_services || null,
          weather: data.weather || null,
          trip_advice: data.trip_advice || null,
          recommended_hotel:
            data.recommended_hotel || (data.hotels && data.hotels[0]) || null,
          confidence: data.confidence || null,
        };

        const saved = await saveMessage(
          convId,
          "ai",
          aiMessage.content,
          tripDataToSave,
          session?.user?.email
        );

        if (saved.error) {
          console.error("AI message save failed", saved.error);
        }

        console.log("Saving to DB:", tripDataToSave);
      }

    } catch (error) {

      console.error("Backend error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Unable to connect to PureMoon backend.",
        },
      ]);
    }

    setThinking(false);
  };

  const nightlifeSpots = nightlife || [];

  return (
    <div className="flex flex-1">

      {/* 💸 Split Modal */}
{showSplit && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

    <div className="bg-[#0F172A] p-6 rounded-xl w-[420px] border border-white/10 shadow-xl">

      <SplitExpense
        onClose={() => {
  trackEvent("split_closed");
  setShowSplit(false);
}}
        onResult={async (res: string[], peopleData: any) => {

          

  setSplitResult(res);
  setSplitDetails(peopleData);   // ✅ NEW
  

  if (conversationId) {
    await saveMessage(conversationId, "ai", "Split expense calculated", {
      split_expense: res,
      split_details: peopleData   // ✅ SAVE THIS TOO
    });
  }
}}
      />

    </div>

  </div>
)}

      {/* Chat Section */}
      <div className="flex flex-col flex-1 h-screen">

        {showWelcome && messages.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-center px-10">
            <p className="text-[30px] font-semibold tracking-tight bg-gradient-to-r from-purple-300 via-white to-purple-200 bg-clip-text text-transparent whitespace-pre-line">
              {displayText}
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-16 py-10 space-y-8 pb-32">

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] px-8 py-6 rounded-2xl text-[17px] leading-7 ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "bg-white/5 border border-white/10 text-gray-200 backdrop-blur-xl"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {thinking && (
  <div className="flex justify-start">
    <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">

      <span className="text-gray-300 text-[16px]">
        🌙 PureMoon
      </span>

      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>

    </div>
  </div>
)}
          {/* AI Trip Insight */}
{tripAdvice && (
  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-6 animate-fade-in">
    <p className="text-purple-300 font-semibold">
      💡 PureMoon AI Insight
    </p>

    <p className="text-gray-300 mt-2">
      {tripAdvice}
    </p>
  </div>
)}
          {/* Itinerary */}
          {itinerary && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-purple-300">
                Your Itinerary
              </h2>

              {itinerary.map((day: any, i: number) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <p className="font-semibold text-gray-200">
                    Day {day.day}
                  </p>

                  <div className="mt-3 space-y-3">

  {(day.activities || []).map((activity: string, j: number) => {

    const icons = ["☀", "🍜", "🌇", "🌙", "⭐"];

    return (
      <div
        key={j}
        className="flex items-start gap-3 text-gray-300"
      >
        <span className="text-lg">
          {icons[j] || "•"}
        </span>

        <span className="leading-6">
          {activity}
        </span>
      </div>
    );
  })}

</div>
<button
  onClick={handleDownloadPDF}
  className="text-xs px-3 py-1 rounded-md bg-white/10 text-gray-200 border border-white/10 hover:bg-white/20 transition"
>
  ⬇️Download 
</button>

                  {day.recommended_restaurants?.length > 0 && (
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <p className="text-sm font-semibold text-purple-300">
                        🍽 Restaurants near Day {day.day}
                      </p>

                      <div className="mt-3 space-y-2">
                        {day.recommended_restaurants
                          .slice(0, 3)
                          .map((r: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-sm text-gray-300"
                            >
                              <span className="font-medium">{r.name}</span>
                              <span className="text-gray-400">
                                ⭐ {r.rating || "N/A"}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          

          {/* Restaurants */}
          {restaurants.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-purple-300">
                🍽 Restaurants
              </h2>

              <div className="grid grid-cols-1 gap-4 mt-4">
                {restaurants.map((r: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  >
                    <img
                      src={r.photo || "/restaurant-placeholder.jpg"}
                      alt={r.name}
                      className="rounded-lg mb-3 w-full h-40 object-cover"
                    />

                    <p className="font-semibold text-gray-200 text-lg">
                      {r.name}
                    </p>

                    <div className="flex justify-between mt-2 text-sm text-gray-400">
                      <span>⭐ {r.rating || "N/A"}</span>
                      <span>{formatPrice(r.price_level)}</span>
                    </div>

                    <p className="text-sm text-gray-400 mt-2">
                      {r.address}
                    </p>

                    {r.maps_link && (
                      <a
                        href={r.maps_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-purple-400 hover:text-purple-300 text-sm"
                      >
                        View on Google Maps →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* AI Recommended Hotel */}
{recommendedHotel && (
  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6">
    <p className="text-blue-300 font-semibold">
      🏨 PureMoon Recommended Stay
    </p>

    <div className="mt-3">
      <p className="text-lg text-gray-200 font-semibold">
        {recommendedHotel.name}
      </p>

      <p className="text-gray-400">
        ⭐ {recommendedHotel.rating || "N/A"}
      </p>

      <p className="text-gray-400 mt-1">
        {recommendedHotel.address}
      </p>

      {recommendedHotel.maps_link && (
        <a
          href={recommendedHotel.maps_link}
          target="_blank"
          className="inline-block mt-2 text-purple-400 hover:text-purple-300"
        >
          View on Google Maps →
        </a>
      )}
    </div>
  </div>
)}
          

          {/* Hotels */}
          {hotels.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-purple-300">
                🏨 Hotels
              </h2>

              <div className="grid grid-cols-1 gap-4 mt-4">
                {hotels.map((h: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  >
                    <img
                      src={h.photo || "/hotel-placeholder.jpg"}
                      alt={h.name}
                      className="rounded-lg mb-3 w-full h-40 object-cover"
                    />

                    <p className="font-semibold text-gray-200 text-lg">
                      {h.name}
                    </p>

                    <div className="flex justify-between mt-2 text-sm text-gray-400">
                      <span>⭐ {h.rating || "N/A"}</span>
                      <span>{formatPrice(h.price_level)}</span>
                    </div>

                    <p className="text-sm text-gray-400 mt-2">
                      {h.address}
                    </p>

                    {h.maps_link && (
                      <a
                        href={h.maps_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-purple-400 hover:text-purple-300 text-sm"
                      >
                        View on Google Maps →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

         {mounted && restaurants.length > 0 && hotels.length > 0 && (
  <div className="mt-8">

    {typeof window !== "undefined" && (
      <TripMap
        restaurants={restaurants}
        hotels={hotels}
      />
    )}

  </div>
)}
          {/* Nightlife Suggestions */}

{nightlifeSpots.length > 0 && (
  <div className="mt-8">

    <h2 className="text-xl font-semibold text-purple-300">
      🌙 Nightlife Suggestions
    </h2>

    <div className="mt-4 space-y-3">
      {nightlifeSpots.map((place: any, i: number) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <p className="text-gray-200 font-semibold">
            🌙 {place.name}
          </p>

          <p className="text-gray-400 text-sm mt-1">
            {place.description}
          </p>
        </div>
      ))}
    </div>

  </div>
)}

{/* Food Suggestions */}

{foodPlaces.length > 0 && (
  <div className="mt-8">

    <h2 className="text-xl font-semibold text-purple-300">
      🍜 Food Suggestions
    </h2>

    <div className="mt-4 space-y-3">

      {foodPlaces.map((place: any, i: number) => (

        <div
          key={i}
          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
        >

          <p className="text-gray-200 font-semibold text-lg">
            🍜 {place.name}
          </p>

          {place.description && (
            <p className="text-gray-400 text-sm mt-1">
              {place.description}
            </p>
          )}

          <div className="flex justify-between items-center mt-3 text-sm">

            <span className="text-gray-400">
              ⭐ {place.rating || "N/A"}
            </span>

            {place.maps_link && (
              <a
                href={place.maps_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300"
              >
                View on Maps →
              </a>
            )}

          </div>

        </div>

      ))}

    </div>

  </div>
)}


        </div>

        
        <div className="sticky bottom-0 bg-[#0B0F1A] px-16 py-6 border-t border-white/10">
  <ChatInput 
  onSend={sendMessage} 
  showActions={(itinerary?.length || 0) > 0 && !thinking}
  activeTourStep={activeTourStep}
  isHighlighted={isHighlighted}
/>
</div>

      </div>

      
      {/* Trip Intelligence Panel */}
      <div className="w-80 border-l border-white/10 px-6 py-8 bg-white/5 backdrop-blur-xl">

        <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Trip Intelligence
        </h3>

        <div className="text-xs uppercase tracking-wider text-gray-400 mb-4">
          Confidence: {confidence}
        </div>

        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
  Trip Overview
</p>

<div className="space-y-6 text-sm">

          {[
            { label: "Destination", value: tripData.destination },
            { label: "Duration", value: tripData.duration },
            { label: "Budget", value: tripData.budget },
            /*{ label: "Travelers", value: tripData.travelers },*/
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-xl border border-white/10 bg-white/5"
            >
              <div className="text-gray-400 text-xs uppercase tracking-wider">
                {item.label}
              </div>
              <div className="mt-2 text-gray-300">
                {item.value || "—"}
              </div>
            </div>
          ))}

        </div>
        {/* Weather Card */}
{weather && (
  <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5">

    <div className="text-gray-400 text-xs uppercase tracking-wider">
      Weather
    </div>

    <div className="mt-2 text-gray-300 space-y-1">

      <div>
        Temperature: {weather.temperature}°C
      </div>

      <div>
        Wind Speed: {weather.windspeed} km/h
      </div>

    </div>

  </div>
)}

{/* 💸 Expense Split Result */}
{splitResult.length > 0 && (
  <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5">

    <p className="text-sm font-semibold text-gray-200 mb-2">
      💸 Expense Split
    </p>

    {splitResult.map((item, i) => (
      <p key={i} className="text-sm text-purple-300">
        {item}
      </p>
    ))}

  </div>
)}


        {travelServices && (
  <div className="mt-6 border-t border-gray-700 pt-4">

    <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
      TRAVEL TOOLS
    </p>

    <div className="mb-3">
      <p className="text-base font-semibold text-gray-200 mb-1">🚗 Car Rentals</p>

      {travelServices.car_rentals?.map((item:any, i:number) => (
  <a
    key={i}
    href={item.url}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => {
      setTimeout(() => {
        trackEvent("car_rental_clicked", {
          provider: item.name
        });
      }, 0);
    }}
    className="inline-block px-3 py-1.5 mr-2 mt-2 text-sm rounded-lg bg-white/5 border border-white/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 transition"
  >
    {item.name}
  </a>
))}
    </div>

    <div>
      <p className="text-base font-semibold text-gray-200 mb-1">🍔 Food Delivery</p>

      {travelServices.food_delivery?.map((item:any, i:number) => (
  <a
    key={i}
    href={item.url}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => {
      setTimeout(() => {
        trackEvent("food_delivery_clicked", {
          provider: item.name
        });
      }, 0);
    }}
    className="inline-block px-3 py-1.5 mr-2 mt-2 text-sm rounded-lg bg-white/5 border border-white/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 transition"
  >
    {item.name}
  </a>
))}
    </div>
{/* Flights */}
<div className="mt-4">
  <p className="text-base font-semibold text-gray-200 mb-1">
    ✈ Flights
  </p>

  <a
  href={`https://www.google.com/travel/flights?q=flights+to+${flightDestination}`}
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => {
    setTimeout(() => {
      trackEvent("flight_clicked", {
        provider: "Google Flights",
        destination: flightDestination
      });
    }, 0);
  }}
  className="inline-block px-3 py-1.5 mr-2 mt-2 text-sm rounded-lg bg-white/5 border border-white/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 transition"
>
  Google Flights
</a>

  <a
  href={`https://www.kayak.com/flights/${flightDestination}`}
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => {
    setTimeout(() => {
      trackEvent("flight_clicked", {
        provider: "Kayak",
        destination: flightDestination
      });
    }, 0);
  }}
  className="inline-block px-3 py-1.5 mr-2 mt-2 text-sm rounded-lg bg-white/5 border border-white/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 transition"
>
  Kayak
</a>

  <a
  href={`https://www.expedia.com/Flights-Search?trip=oneway&leg1=to:${flightDestination}`}
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => {
    setTimeout(() => {
      trackEvent("flight_clicked", {
        provider: "Expedia",
        destination: flightDestination
      });
    }, 0);
  }}
  className="inline-block px-3 py-1.5 mr-2 mt-2 text-sm rounded-lg bg-white/5 border border-white/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 transition"
>
  Expedia
</a>
  <button
  onClick={() => {
  trackEvent("split_opened");
  setShowSplit(true);
}}
  className="mt-4 w-full px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition"
>
  💸 Split Expenses
</button>
</div>
  </div>
  
)}

      </div>

    </div>
  );
}
