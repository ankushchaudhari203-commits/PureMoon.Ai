"use client";

import { useState, useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import { motion } from "framer-motion";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = (text: string) => {
    const userMessage = { role: "user" as const, content: text };

    setMessages((prev) => [...prev, userMessage]);
    setThinking(true);

    // Fake AI delay
    setTimeout(() => {
  const fullResponse =
    "Here’s a structured plan for your request. Let me summarize it for you.";

  setThinking(false);

  let i = 0;
  const interval = setInterval(() => {
    setMessages((prev) => {
      const updated = [...prev];

      if (!updated.find((m) => m.role === "ai")) {
        updated.push({ role: "ai", content: "" });
      }

      updated[updated.length - 1].content = fullResponse.slice(0, i);

      return updated;
    });

    i++;

    if (i > fullResponse.length) {
      clearInterval(interval);
    }
  }, 25);
}, 1500);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  return (
    <div className="flex flex-1">

      {/* Chat Area */}
      <div className="flex flex-col flex-1 relative">

        <div className="flex-1 overflow-y-auto px-20 py-14 space-y-8">

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-2xl px-8 py-6 rounded-3xl text-[18px] leading-relaxed tracking-wide ${
                  msg.role === "user"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium shadow-lg shadow-purple-500/20"
                  : "bg-white/5 border border-white/10 text-gray-100 font-medium backdrop-blur-xl"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {thinking && (
  <div className="flex items-center gap-3 text-gray-300 text-[18px] font-medium">
    <span>PureMoon is thinking</span>

    <div className="flex gap-1">
      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
  </div>
)}

          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSend={sendMessage} />
      </div>

      {/* Summary Panel */}
      <div className="w-80 border-l border-white/10 p-8 bg-white/5 backdrop-blur-xl">
        <h3 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"></h3><h3 className="text-xl mb-4 text-purple-300">Summary</h3>

        <p className="text-gray-300 text-[16px] leading-relaxed">
          Once AI responds, a short structured summary of the conversation will appear here.
        </p>
      </div>
    </div>
  );
}
}