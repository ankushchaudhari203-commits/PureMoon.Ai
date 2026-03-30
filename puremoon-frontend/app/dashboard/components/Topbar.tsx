"use client";

export default function Topbar() {
  return (
    <div className="h-20 px-10 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-xl">
      <span className="text-lg text-gray-300 font-medium">
        Dashboard
      </span>

      <button className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
        Upgrade
      </button>
    </div>
  );
}