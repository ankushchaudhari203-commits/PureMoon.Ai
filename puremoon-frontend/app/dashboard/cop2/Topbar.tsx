"use client";

export default function Topbar() {
  return (
    <div className="h-20 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-10">

      <div className="text-lg text-gray-400">
        Dashboard
      </div>

      <div className="flex items-center gap-8">
        <span className="text-base text-gray-400">
          Free Plan
        </span>

        <button className="px-6 py-2 text-base rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition font-medium">
          Upgrade
        </button>
      </div>

    </div>
  );
}