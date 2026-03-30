"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function AnalyticsPage() {

  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/analytics/events")
      .then(res => res.json())
      .then(data => setEvents(data.events || []))
      .catch(console.error);
  }, []);

  // ----------------------------
  // Helpers
  // ----------------------------
  const count = (name: string) =>
    events.filter((e) => e.event_name === name).length;

  const groupByProvider = (eventName: string) => {
    const map: Record<string, number> = {};

    events
      .filter((e) => e.event_name === eventName)
      .forEach((e) => {
        const provider = e.metadata?.provider || "Unknown";
        map[provider] = (map[provider] || 0) + 1;
      });

    return map;
  };

  // ----------------------------
  // Data
  // ----------------------------
  const flightProviders = groupByProvider("flight_clicked");
  const rentalProviders = groupByProvider("car_rental_clicked");

  const messages = count("message_sent");
  const itineraries = count("itinerary_generated");
  const limits = count("limit_exceeded");

  const conversion =
    messages > 0 ? ((itineraries / messages) * 100).toFixed(1) : "0";

  const uniqueUsers = new Set(events.map(e => e.session_id)).size;

  const flightChartData = Object.entries(flightProviders).map(
    ([name, value]) => ({
      name,
      value
    })
  );

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <div className="p-10 text-white">

      <h1 className="text-2xl font-semibold mb-6">
        📊 PureMoon Analytics
      </h1>

      {/* ---------------- METRICS ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">

        <Card title="Total Events" value={events.length} />
        <Card title="Messages" value={messages} />
        <Card title="Itineraries" value={itineraries} />
        <Card title="Limit Hits" value={limits} />
        <Card title="Split Opened" value={count("split_opened")} />
        <Card title="Conversion %" value={`${conversion}%`} />
        <Card title="Active Users" value={uniqueUsers} />

      </div>

      {/* ---------------- FUNNEL ---------------- */}
      <div className="mb-10 bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">🔄 Conversion Funnel</h2>

        <p className="text-sm text-gray-300 mb-1">
          Messages: {messages}
        </p>

        <p className="text-sm text-gray-300 mb-1">
          Itineraries: {itineraries}
        </p>

        <p className="text-sm text-gray-300 mb-1">
          Limit Hits: {limits}
        </p>

        <p className="text-purple-400 mt-3 text-sm">
          Conversion Rate: {conversion}%
        </p>
      </div>

      {/* ---------------- PROVIDERS ---------------- */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Flights */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">✈ Flight Providers</h2>

          {Object.keys(flightProviders).length === 0 ? (
            <p className="text-gray-400 text-sm">No clicks yet</p>
          ) : (
            Object.entries(flightProviders).map(([name, value]) => (
              <p key={name} className="text-sm text-gray-300 mb-1">
                {name}: {value}
              </p>
            ))
          )}
        </div>

        {/* Rentals */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">🚗 Car Rentals</h2>

          {Object.keys(rentalProviders).length === 0 ? (
            <p className="text-gray-400 text-sm">No clicks yet</p>
          ) : (
            Object.entries(rentalProviders).map(([name, value]) => (
              <p key={name} className="text-sm text-gray-300 mb-1">
                {name}: {value}
              </p>
            ))
          )}
        </div>

      </div>

      {/* ---------------- CHART ---------------- */}
      <div className="mt-10 bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">📊 Flight Provider Usage</h2>

        {flightChartData.length === 0 ? (
          <p className="text-gray-400 text-sm">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
  <BarChart data={flightChartData}>
    
    <defs>
      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
      </linearGradient>
    </defs>

    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="value" fill="url(#colorBar)" />
  </BarChart>
</ResponsiveContainer>
        )}
      </div>

    </div>
  );
}

// ---------------- CARD ----------------
function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  );
}