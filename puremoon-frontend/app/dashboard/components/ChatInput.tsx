"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { trackEvent } from "@/lib/analytics";
import type { TourStep } from "./OnboardingTour";

export default function ChatInput({
  onSend,
  showActions,
  activeTourStep,
  isHighlighted
}: {
  onSend: (text: string) => void;
  showActions?: boolean;
  activeTourStep?: TourStep;
  isHighlighted?: (step: TourStep) => boolean;
}) {

  const [text, setText] = useState("");
  const [showFoodOptions, setShowFoodOptions] = useState(false);

  const handleSend = () => {
    if (!text.trim()) return;

    onSend(text);
    setText("");
  };

  return (
    <div className="w-full flex flex-col">

      {/* ✅ DISCLAIMER */}
      <p className="text-xs text-white-400 text-center mb-2">
        ⚠️ PureMoon may make mistakes. Please verify and validate the information.
      </p>

      {showActions && (
  <>
    {/* 🔥 ANIMATED ACTION BUTTONS */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex gap-3 mb-3 justify-center"
    >

      {/* 🍜 FOOD BUTTON */}
      <motion.button
        onClick={() => {
  const newState = !showFoodOptions;

  trackEvent("food_menu_toggled", {
    state: newState ? "opened" : "closed"
  });

  setShowFoodOptions(newState);
}}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
      >
        🍜 Food
      </motion.button>

      {/* 🌙 NIGHTLIFE BUTTON */}
      <motion.button
        onClick={() => {
  trackEvent("nightlife_clicked");
  onSend("show nightlife");
}}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
      >
        🌙 Nightlife
      </motion.button>

    </motion.div>

    {/* 🔥 ANIMATED FOOD POPUP */}
    {showFoodOptions && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="mb-3 p-3 rounded-xl bg-[#0F172A] border border-white/10"
      >

        <p className="text-sm text-gray-400 mb-2 text-center">
          Choose food type:
        </p>

        <div className="flex flex-wrap gap-2 justify-center">

          {[
  { label: "Cheap Food", value: "cheap food", category: "cheap" },
  { label: "Italian Food", value: "italian food", category: "italian" },
  { label: "Vegetarian Food", value: "vegetarian food", category: "vegetarian" },
  { label: "Late Night Food", value: "late night food", category: "late_night" }
].map((option, i) => (
  <motion.button
    key={i}
    onClick={() => {

  // 🔥 non-blocking safe analytics
  queueMicrotask(() => {
    trackEvent("food_option_selected", {
      category: option.category
    });
  });

  onSend(option.value);
  setShowFoodOptions(false);
}}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-purple-500/20 hover:border-purple-400"
  >
    {option.label}
  </motion.button>
))}

        </div>

      </motion.div>
    )}
  </>
)}

      {/* ✅ INPUT (always visible) */}
      <div className={`flex items-center gap-3 bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3
                      ${isHighlighted?.("input") ? "ring-2 ring-purple-400" : ""}`}>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Start with: Plan a 3 day trip to Austin in budget $500"
          className="flex-1 bg-transparent outline-none text-gray-200 placeholder-gray-500"
        />

        <button
          onClick={handleSend}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm hover:opacity-90 transition"
        >
          Send
        </button>

      </div>

    </div>
  );
}