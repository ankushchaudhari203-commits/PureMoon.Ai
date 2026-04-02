"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

export default function IntroAnimation({ onFinish }: { onFinish: () => void }) {
  
  useEffect(() => {
<<<<<<< HEAD
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
=======
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;

    let audioContext: AudioContext | null = null;
    let started = false;

    const removeListeners = () => {
      window.removeEventListener("pointerdown", startTone);
      window.removeEventListener("touchstart", startTone);
      window.removeEventListener("keydown", startTone);
    };

    const startTone = async () => {
      if (started || !AudioContextClass) return;

      if (!audioContext) {
        audioContext = new AudioContextClass();
      }

      try {
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(261.63, audioContext.currentTime);

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(329.63, audioContext.currentTime);

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

        started = true;
        removeListeners();
      } catch (error) {
        console.warn("Intro audio is waiting for user interaction.", error);
      }
    };

    startTone();

    window.addEventListener("pointerdown", startTone, { once: true });
    window.addEventListener("touchstart", startTone, { once: true });
    window.addEventListener("keydown", startTone, { once: true });

    const timer = setTimeout(() => {
      onFinish();
    }, 7500);

    return () => {
      clearTimeout(timer);
      removeListeners();
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close().catch(() => {});
      }
    };
  }, [onFinish]);
>>>>>>> master

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
<<<<<<< HEAD
}
=======
}
>>>>>>> master
