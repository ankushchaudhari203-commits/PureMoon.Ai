"use client";

import { useState, useEffect } from "react";
import ChatInput from "./ChatInput";
import dynamic from "next/dynamic";
import { createConversation, saveMessage } from "@/lib/chatService";
import { getMessages } from "@/lib/historyService";
import jsPDF from "jspdf";
import SplitExpense from "./SplitExpense";

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
};

type NightlifePlace = {
  name: string
  description: string
  rating?: number
  maps_link?: string
}

export default function ChatWindow({
  setDestination,
  setDays,
  setBudget,
  selectedConversation
}: ChatWindowProps) {

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
  if (msg.trip_data) {
    return { ...acc, ...msg.trip_data };
  }
  return acc;
}, {});

if (Object.keys(mergedTrip).length > 0) {

  const trip = mergedTrip;

    setItinerary(trip.itinerary || []);
setRestaurants(trip.restaurants || []);
setHotels(trip.hotels || []);
setNightlife(trip.nightlife || []);   // ✅ ADD THIS
setFoodPlaces(trip.food || []);       // (optional future feature)

setTripAdvice(trip.trip_advice || null);
    setRecommendedHotel(
  trip.recommended_hotel || (trip.hotels && trip.hotels[0]) || null
);

    setTripData({
      destination: trip.trip_data?.destination || "",
      duration: trip.trip_data?.days
        ? `${trip.trip_data.days} Days`
        : "",
      budget: trip.trip_data?.budget
        ? `$${trip.trip_data.budget}`
        : "",
      travelers: trip.trip_data?.travelers
        ? String(trip.trip_data.travelers)
        : "",
    });

    setConfidence(trip.confidence || "Low");
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

    setMessages((prev) => [...prev, userMessage]);
    setThinking(true);
    setShowWelcome(false);

    let convId = conversationId;

    if (!convId) {
      convId = await createConversation(text);
      if (convId) setConversationId(convId);
    }

    if (convId) {
      saveMessage(convId, "user", text);
    }

    try {

      const response = await fetch("http://localhost:8000/travel/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: convId || "temp-session",
          message: text,
        }),
      });

      const data = await response.json();
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
        saveMessage(convId, "ai", aiMessage.content, data);
        console.log("Saving to DB:", data);
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
        onClose={() => setShowSplit(false)}
        onResult={(res: string[]) => {
          setSplitResult(res);
          setShowSplit(false);
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
  <ChatInput onSend={sendMessage} />
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

        <div className="mt-8 border-t border-white/10 pt-4">

  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
    Controls
  </p>

  <button
    onClick={resetTrip}
    className="text-sm text-purple-400 hover:text-purple-300 transition"
  >
    Reset Trip
  </button>

</div>

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
    className="inline-block px-3 py-1.5 mr-2 mt-2 text-sm rounded-lg bg-white/5 border border-white/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 transition"
  >
    Google Flights
  </a>

  <a
    href={`https://www.kayak.com/flights/${flightDestination}`}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block px-3 py-1.5 mr-2 mt-2 text-sm rounded-lg bg-white/5 border border-white/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 transition"
  >
    Kayak
  </a>

  <a
    href={`https://www.expedia.com/Flights-Search?trip=oneway&leg1=to:${flightDestination}`}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block px-3 py-1.5 mr-2 mt-2 text-sm rounded-lg bg-white/5 border border-white/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 transition"
  >
    Expedia
  </a>
  <button
  onClick={() => setShowSplit(true)}
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

