"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { trackEvent } from "@/lib/analytics";
import { getConversations } from "@/lib/historyService";
import { apiFetch } from "@/lib/api";
import type { TourStep } from "./OnboardingTour";

type SidebarProps = {
  onHelp: () => void;
  onNewChat: () => void;
  onSelectConversation?: (id: string) => void;
  activeTourStep?: TourStep;
  isHighlighted?: (step: TourStep) => boolean;
  onStartTour?: () => void;
};

export default function Sidebar({
  onHelp,
  onNewChat,
  onSelectConversation,
  activeTourStep,
  isHighlighted,
  onStartTour
}: SidebarProps) {

  const router = useRouter();
  const { data: session } = useSession();

  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // ✅ Load History
  const loadHistory = async () => {
    try {
      const data = await getConversations(session?.user?.email ?? undefined);
      setHistory(data);
    } catch (error) {
      console.error("History load error:", error);
    }
  };

  // ✅ Delete Single Conversation
  const deleteConversation = async (id: string) => {
    const confirmDelete = confirm("Delete this chat?");
    if (!confirmDelete) return;

    try {
      const userEmail = session?.user?.email;
      if (!userEmail) return;

      await apiFetch(`/chat/delete/${id}?user_email=${encodeURIComponent(userEmail)}`, {
        method: "DELETE",
      });

      // ✅ instant UI update (better UX)
      setHistory(prev => prev.filter(item => item.id !== id));

    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ✅ Clear All Conversations
  const clearAllChats = async () => {
    const confirmDelete = confirm("Delete ALL chats?");
    if (!confirmDelete) return;

    try {
      const userEmail = session?.user?.email;
      if (!userEmail) return;

      await apiFetch(`/chat/clear-all?user_email=${encodeURIComponent(userEmail)}`, {
        method: "DELETE",
      });

      // ✅ instant UI update
      setHistory([]);

    } catch (err) {
      console.error("Clear all error:", err);
    }
  };

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [session?.user?.email]);

  return (
    <div className="w-80 bg-white/[0.03] backdrop-blur-xl border-r border-white/10 px-6 py-8 flex flex-col">

      {/* Logo */}
      <h1 className="text-2xl font-semibold tracking-tight mb-10
                     bg-gradient-to-r from-purple-400 to-blue-400
                     bg-clip-text text-transparent">
        PureMoon 🌙
      </h1>

      {/* New Chat */}
      <button
        onClick={() => {
        trackEvent("new_chat_clicked");
        onNewChat();
        }}
        className={`mb-8 px-5 py-3 rounded-xl
                   bg-gradient-to-r from-purple-600 to-blue-600
                   text-white text-[15px] font-medium
                   shadow-lg shadow-purple-500/20
                   hover:opacity-90 transition-all duration-200
                   ${isHighlighted?.("new-chat") ? "ring-2 ring-purple-400" : ""}`}
      >
        ➕ New Chat
      </button>

      {/* History Title */}
      <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">
        History
      </div>

      {/* History List */}
      <div className="flex-1 space-y-2">

        {history.length === 0 && (
          <div className="text-gray-500 text-sm px-4 py-2">
            No conversations yet
          </div>
        )}

        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between px-4 py-3 rounded-xl
                       text-[15px] font-medium text-gray-300
                       hover:bg-white/10 transition-all duration-200 group"
          >

            {/* LEFT → Load chat */}
            <button
              onClick={() => onSelectConversation?.(item.id)}
              className="text-left flex-1"
            >
              {item.title || "Untitled Trip"}
            </button>

            {/* RIGHT → Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteConversation(item.id);
              }}
              className="text-red-400 text-xs opacity-0 group-hover:opacity-100 transition duration-200"
            >
              ✕
            </button>

          </div>
        ))}

      </div>

      {/* 🔥 Clear All Button */}
      <button
        onClick={clearAllChats}
        className={`w-full text-left text-sm text-red-400 hover:text-red-300 
                   mt-4 px-4 py-2 rounded-lg hover:bg-red-500/10 transition
                   ${isHighlighted?.("clear-chats") ? "ring-2 ring-purple-400" : ""}`}
      >
        🧹 Clear All Chats
      </button>

      {/* Settings */}
      <div className={`relative mt-6 border-t border-white/5 pt-6 ${isHighlighted?.("settings") ? "ring-2 ring-purple-400 rounded-lg p-2 -m-2" : ""}`}>

        <button
          onClick={() => {
  const newState = !open;
  setOpen(newState);

  trackEvent(newState ? "settings_opened" : "settings_closed");
}}
          className="text-[15px] font-medium text-gray-400 hover:text-white transition"
        >
          ⚙️ Settings
        </button>

        {open && (
          <div className="absolute bottom-12 left-0 w-full
                          bg-[#111827]/95 backdrop-blur-xl
                          border border-white/10 rounded-xl
                          shadow-xl mt-3 overflow-hidden">

            <div
              onClick={() => {
                trackEvent("tour_started");
                onStartTour?.();
                setOpen(false);
              }}
              className="px-4 py-3 text-[15px] text-blue-300 hover:bg-blue-500/10 cursor-pointer"
            >
              📖 Start Tour
            </div>

            <div
              onClick={() => {
              trackEvent("exit_clicked");
              router.push("/");
              }}
              className="px-4 py-3 text-[15px] text-gray-300 hover:bg-white/10 cursor-pointer"
            >
              Exit
            </div>

            <div
              onClick={() => {
                trackEvent("help_clicked");
                onHelp();
                setOpen(false);
              }}
              className="px-4 py-3 text-[15px] text-gray-300 hover:bg-white/10 cursor-pointer"
            >
              Help
            </div>

            <div
              onClick={() => {
               trackEvent("feedback_clicked");
                window.open(
                  "https://docs.google.com/forms/d/e/1FAIpQLSdTiDgt92Ss8TenhzhKXt0BLfYZFuRQgK-mq77nVBxqrIzyJA/viewform?usp=header"
                )
              }}
              className="px-4 py-3 text-[15px] text-gray-300 hover:bg-white/10 cursor-pointer"
            >
              Feedback
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
