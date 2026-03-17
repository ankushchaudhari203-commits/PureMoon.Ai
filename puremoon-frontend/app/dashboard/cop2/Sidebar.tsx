"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-96 bg-white/5 backdrop-blur-xl border-r border-white/10 p-10 flex flex-col relative">

      {/* Logo */}
      <h1 className="text-4xl font-semibold tracking-tight mb-14 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        PureMoon
      </h1>

      {/* New Chat */}
      <button className="mb-12 px-8 py-5 text-lg rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition font-medium shadow-lg shadow-purple-500/20">
        + New Chat
      </button>

      {/* History */}
      <div className="text-xl font-semibold text-gray-300 mb-4 tracking-wide">
      History
      </div>

      <div className="flex-1 space-y-3 text-lg text-gray-300">
        <div className="cursor-pointer px-4 py-3 rounded-xl hover:bg-white/10 transition">
          Italy Itinerary Plan
        </div>
      </div>

      {/* Settings */}
      <div className="relative mt-8" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="text-lg font-semibold text-gray-300 
           hover:text-white transition w-full text-left"
        >
          Settings
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-12 left-0 w-full bg-[#111827] border border-white/10 rounded-xl p-3 shadow-xl"
            >
              {/* Exit */}
              <div
                onClick={() => router.push("/")}
                className="px-4 py-3 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                Exit
              </div>

              {/* Help */}
              <div
                onClick={() => {
                  setShowHelp(true);
                  setOpen(false);
                }}
                className="px-4 py-3 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                Help
              </div>

              {/* Feedback */}
              <div
                onClick={() =>
                  window.open(
                    "https://docs.google.com/forms/d/e/1FAIpQLSdTiDgt92Ss8TenhzhKXt0BLfYZFuRQgK-mq77nVBxqrIzyJA/viewform?usp=header"
                  )
                }
                className="px-4 py-3 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                Feedback
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#1f2937] p-8 rounded-2xl border border-white/10 text-center max-w-md"
            >
              <h2 className="text-2xl mb-4 font-semibold">
                Need Help?
              </h2>

              <p className="text-gray-300 mb-6">
                Please reach out to:
              </p>

              <p className="text-purple-400 text-lg mb-6">
                ankushchaudhari203@gmail.com
              </p>

              <button
                onClick={() => setShowHelp(false)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}