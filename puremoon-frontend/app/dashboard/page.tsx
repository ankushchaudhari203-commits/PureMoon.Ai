"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ChatWindow from "./components/ChatWindow";
import HelpModal from "./components/HelpModal";

export default function Dashboard() {
  const { data: session, status } = useSession();

  const [showHelp, setShowHelp] = useState(false);

  const [destination, setDestination] = useState<string | null>(null);
  const [days, setDays] = useState<number | null>(null);
  const [budget, setBudget] = useState<number | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // ⭐ NEW
  const [chatResetKey, setChatResetKey] = useState(0);

  // 🔐 Protect dashboard
  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("google");
    }
  }, [status]);

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
    <div className="flex h-screen bg-gradient-to-br from-[#0B0F1A] via-[#111827] to-[#0F172A] text-white">

      <Sidebar
  onHelp={() => setShowHelp(true)}
  onNewChat={() => {
    setSelectedConversation(null);
    setChatResetKey((prev) => prev + 1);
  }}
  onSelectConversation={(id: string) => {
    setSelectedConversation(id);
  }}
/>

      <div className="flex flex-col flex-1">
        <Topbar />

        <ChatWindow
  key={chatResetKey}
  setDestination={setDestination}
  setDays={setDays}
  setBudget={setBudget}
  selectedConversation={selectedConversation}
/>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

    </div>
  );
}