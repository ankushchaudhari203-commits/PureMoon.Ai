"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

export default function IntroAnimation({ onFinish }: { onFinish: () => void }) {
  
  useEffect(() => {
  // PUREMOON COSMIC TONE
  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();

  const osc1 = audioContext.createOscillator();
  const osc2 = audioContext.createOscillator();
  const gain = audioContext.createGain();

  // Two-layer tone (more magical)
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(261.63, audioContext.currentTime); // C

  osc2.type = "sine";
  osc2.frequency.setValueAtTime(329.63, audioContext.currentTime); // E

  gain.gain.setValueAtTime(0.001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.15, audioContext.currentTime + 0.6);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 3);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(audioContext.destination);

  osc1.start();
  osc2.start();
  osc1.stop(audioContext.currentTime + 3);
  osc2.stop(audioContext.currentTime + 3);

  const timer = setTimeout(() => {
    onFinish();
  }, 7500);

  return () => clearTimeout(timer);
}, [onFinish]);

  return (
    <div className="fixed inset-0 bg-[#0B0F1A] flex items-center justify-center overflow-hidden z-50">

      {/* Moon Glow */}
      <motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{
    scale: [1, 1.15, 1],
    opacity: [0.4, 0.6, 0.4],
  }}
  transition={{
    duration: 4,
    ease: "easeInOut",
    repeat: Infinity,
  }}
  className="absolute w-96 h-96 rounded-full 
             bg-gradient-to-br from-purple-500 to-blue-500 
             blur-3xl"
/>

      {/* Logo Text */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1.5 }}
        className="text-6xl font-semibold tracking-tight 
                   bg-gradient-to-r from-purple-400 to-blue-400 
                   bg-clip-text text-transparent"
      >
        PureMoon.Ai 
      </motion.h1>

    </div>
  );
}