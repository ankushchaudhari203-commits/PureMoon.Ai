"use client";

import { useState } from "react";

type ChatInputProps = {
  onSend: (text: string) => void;
};

export default function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  return (
    <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl p-8">
      <div
        className="max-w-5xl mx-auto flex items-center gap-6 
                   bg-black/40 border border-white/10 
                   rounded-2xl px-8 py-6"
      >
        <input
          type="text"
          placeholder="Start with: Plan a 3 day trip to Austin in budget $500"
          className="flex-1 bg-transparent outline-none 
                     text-lg text-white 
                     placeholder:text-gray-400"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button
          disabled={!message.trim()}
          onClick={handleSend}
          className={`px-6 py-3 rounded-xl text-base font-medium transition ${
            message.trim()
              ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
}