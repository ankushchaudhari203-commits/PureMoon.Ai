"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ChatWindow from "./components/ChatWindow";
import HelpModal from "./components/HelpModal";
import OnboardingTour, { type TourStep } from "./components/OnboardingTour";
import { trackUserEmail } from "@/lib/userService";

const TOUR_STORAGE_KEY = "puremoon-dashboard-tour-seen";

export default function Dashboard() {
  const { data: session, status } = useSession();

  const [showHelp, setShowHelp] = useState(false);

  const [destination, setDestination] = useState<string | null>(null);
  const [days, setDays] = useState<number | null>(null);
  const [budget, setBudget] = useState<number | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // ⭐ Tour State
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState<TourStep>(null);

  // ⭐ NEW
  const [chatResetKey, setChatResetKey] = useState(0);

  // ⭐ Tour Control Functions
  const tourStepOrder: TourStep[] = ["new-chat", "clear-chats", "settings", "input"];

  const startTour = () => {
    setIsTourActive(true);
    setCurrentTourStep(tourStepOrder[0]);
  };

  const nextTourStep = () => {
    const currentIndex = tourStepOrder.indexOf(currentTourStep || "new-chat");
    if (currentIndex < tourStepOrder.length - 1) {
      setCurrentTourStep(tourStepOrder[currentIndex + 1]);
    } else {
      endTour();
    }
  };

  const endTour = () => {
    setIsTourActive(false);
    setCurrentTourStep(null);
  };

  const isHighlighted = (step: TourStep): boolean => {
    return isTourActive && currentTourStep === step;
  };

  // 🔐 Protect dashboard
  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("google");
    }
  }, [status]);

  // 📧 Track user email on login
  useEffect(() => {
    if (session?.user?.email) {
      trackUserEmail({
        email: session.user.email,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
      });
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (!session?.user?.email) return;

    const storageKey = `${TOUR_STORAGE_KEY}:${session.user.email}`;
    const hasSeenTour = window.localStorage.getItem(storageKey);

    if (!hasSeenTour) {
      setIsTourActive(true);
      setCurrentTourStep(tourStepOrder[0]);
      window.localStorage.setItem(storageKey, "true");
    }
  }, [session?.user?.email]);

  // ⏳ Loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0B0F1A] text-white">
        Loading PureMoon...
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#10214A] via-[#17336C] to-[#1A3F85] text-white">

      <Sidebar
  onHelp={() => setShowHelp(true)}
  onNewChat={() => {
    setSelectedConversation(null);
    setChatResetKey((prev) => prev + 1);
  }}
  onSelectConversation={(id: string) => {
    setSelectedConversation(id);
  }}
  activeTourStep={currentTourStep}
  isHighlighted={isHighlighted}
  onStartTour={startTour}
/>

      <div className="flex flex-col flex-1">
        <Topbar />

        <ChatWindow
  key={chatResetKey}
  setDestination={setDestination}
  setDays={setDays}
  setBudget={setBudget}
  selectedConversation={selectedConversation}
  activeTourStep={currentTourStep}
  isHighlighted={isHighlighted}
/>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* 🎓 Onboarding Tour */}
      <OnboardingTour
        currentStep={currentTourStep}
        onNextStep={nextTourStep}
        onSkip={endTour}
        isActive={isTourActive}
      />

    </div>
  );
}
