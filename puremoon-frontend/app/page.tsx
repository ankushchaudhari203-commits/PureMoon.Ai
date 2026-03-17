"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import IntroAnimation from "./components/IntroAnimation";

export default function Home() {
  const router = useRouter();
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      {/* Intro Animation Overlay */}
      {!introDone && (
        <IntroAnimation onFinish={() => setIntroDone(true)} />
      )}

      {/* Landing Page */}
      <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6 text-center">

        <Image
          src="/logo.png"
          alt="PureMoon Logo"
          width={650}
          height={250}
          className="object-contain mb-4"
        />

        <p className="text-3xl text-gray-300 max-w-2xl mb-8">
          Your Intelligent Travel & Life Assistant. Plan smarter. Travel better. Decide confidently.
        </p>

        <button
          onClick={() => router.push("/consent")}
          className="px-14 py-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-2xl font-semibold hover:scale-105 transition"
        >
          Continue
        </button>

      </main>
    </>
  );
}