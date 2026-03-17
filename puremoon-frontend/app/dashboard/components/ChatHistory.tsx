"use client";

import { useEffect, useState } from "react";
import { getConversations } from "@/lib/historyService";

export default function ChatHistory({ onSelect }: any) {

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getConversations();
    setHistory(data);
  };

  return (
    <div className="p-4 space-y-2">

      {history.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="cursor-pointer p-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300"
        >
          {item.title || "Trip Conversation"}
        </div>
      ))}

    </div>
  );
}