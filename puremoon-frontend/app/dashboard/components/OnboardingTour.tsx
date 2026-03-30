"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/analytics";

export type TourStep = "new-chat" | "clear-chats" | "settings" | "input" | null;
type ActiveTourStep = Exclude<TourStep, null>;

type OnboardingTourProps = {
  currentStep: TourStep;
  onNextStep: () => void;
  onSkip: () => void;
  isActive: boolean;
};

const TOUR_STEPS: Record<ActiveTourStep, { title: string; description: string; icon: string }> = {
  "new-chat": {
    title: "Create New Chat",
    description: "Start a fresh conversation by clicking the New Chat button. Each chat is a new trip planning session.",
    icon: "➕",
  },
  "clear-chats": {
    title: "Clear All Chats",
    description: "Remove all your conversation history at once. Useful for a clean start or privacy.",
    icon: "🧹",
  },
  settings: {
    title: "Settings & More",
    description: "Access settings, help, feedback, and exit options. Customize your experience here.",
    icon: "⚙️",
  },
  input: {
    title: "Ask PureMoon",
    description: "Type your travel questions, preferences, or requirements. Exmples :plan a 2 day trip to Maimi in budget 500$",
    icon: "💬",
  },
};

export default function OnboardingTour({
  currentStep,
  onNextStep,
  onSkip,
  isActive,
}: OnboardingTourProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isActive || !currentStep) return null;

  const step = TOUR_STEPS[currentStep];
  const orderedSteps = Object.keys(TOUR_STEPS) as ActiveTourStep[];
  const isLastStep = currentStep === "input";
  const stepNumber = orderedSteps.indexOf(currentStep) + 1;
  const totalSteps = orderedSteps.length;

  return (
    <>
      {/* 🌑 Overlay Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onSkip}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />

      {/* 📍 Tooltip */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        className={`fixed z-50 bg-gradient-to-br from-purple-900/95 to-blue-900/95 
                     backdrop-blur-xl border border-purple-500/50 rounded-2xl 
                     shadow-2xl p-6 max-w-sm ${getTooltipPosition(currentStep)}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{step.icon}</span>
          <h3 className="text-lg font-semibold text-white">{step.title}</h3>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-200 mb-5 leading-relaxed">{step.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400 font-medium">
            Step {stepNumber} of {totalSteps}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onSkip}
              className="px-3 py-2 text-xs font-medium rounded-lg
                         bg-gray-700/40 hover:bg-gray-600/40 text-gray-300 
                         transition-all duration-200"
            >
              Skip
            </button>

            <button
              onClick={onNextStep}
              className="px-4 py-2 text-xs font-medium rounded-lg
                         bg-gradient-to-r from-purple-600 to-blue-600
                         hover:opacity-90 text-white transition-all duration-200"
            >
              {isLastStep ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ✨ Highlight Box */}
      <HighlightBox currentStep={currentStep} />
    </>
  );
}

function HighlightBox({ currentStep }: { currentStep: TourStep }) {
  const positions: Record<ActiveTourStep, { top: string; left: string; width: string; height: string }> = {
    "new-chat": { top: "90px", left: "12px", width: "320px", height: "56px" },
    "clear-chats": { top: "296px", left: "12px", width: "320px", height: "44px" },
    settings: { top: "360px", left: "12px", width: "120px", height: "44px" },
    input: { top: "calc(100% - 120px)", left: "50%", width: "calc(100% - 32px)", height: "100px" },
  };

  if (!currentStep) return null;

  const pos = positions[currentStep];

  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed z-45 border-2 border-purple-400 rounded-xl pointer-events-none
                 shadow-lg shadow-purple-500/50"
      style={{
        top: pos.top,
        left: pos.left,
        width: pos.width,
        height: pos.height,
        transform: currentStep === "input" ? "translateX(-50%)" : "none",
      }}
    >
      {/* Animated pulse */}
      <motion.div
        animate={{ boxShadow: ["0 0 0 0 rgba(168, 85, 247, 0.7)", "0 0 0 8px rgba(168, 85, 247, 0)"] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute inset-0 rounded-xl"
      />
    </motion.div>
  );
}

function getTooltipPosition(currentStep: TourStep): string {
  switch (currentStep) {
    case "new-chat":
      return "top-32 left-96";
    case "clear-chats":
      return "top-72 left-96";
    case "settings":
      return "top-96 left-96";
    case "input":
      return "bottom-32 left-1/2 transform -translate-x-1/2";
    default:
      return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
  }
}
