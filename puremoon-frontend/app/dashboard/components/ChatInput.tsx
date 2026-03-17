"use client";

import { useState } from "react";

export default function ChatInput({
  onSend,
}: {
  onSend: (text: string) => void;
}) {

  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;

    onSend(text);
    setText("");
  };

  return (
    <div className="w-full">

      {/* ✅ DISCLAIMER */}
      <p className="text-xs text-white-400 text-center mb-2">
   ⚠️PureMoon may make mistakes. Please verify and validate the information.
</p>

      {/* INPUT CONTAINER */}
      <div className="flex items-center gap-3 bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3">

        {/* INPUT FIELD */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          placeholder="Start with: Plan a 3 day trip to Austin in budget $500"
          className="flex-1 bg-transparent outline-none text-gray-200 placeholder-gray-500"
        />

        {/* SEND BUTTON */}
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