"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConsentPage() {
  const [checked, setChecked] = useState(false);
  const [text, setText] = useState("");
  const router = useRouter();

  const examples = [
    "Plan a 4-day trip to Miami with a $1500 budget.",
    "Create a weekend Austin itinerary with food and music spots.",
    "Plan a 5-day New York trip including Broadway and museums."
  ];

  useEffect(() => {
    let exampleIndex = 0;
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      setText(examples[exampleIndex].slice(0, charIndex));
      charIndex++;

      if (charIndex > examples[exampleIndex].length) {
        clearInterval(typeInterval);

        // Pause before next example
        setTimeout(() => {
          exampleIndex++;
          charIndex = 0;

          if (exampleIndex < examples.length) {
            startTyping(exampleIndex);
          }
        }, 1200);
      }
    }, 40);

    function startTyping(index: number) {
      let i = 0;

      const newInterval = setInterval(() => {
        setText(examples[index].slice(0, i));
        i++;

        if (i > examples[index].length) {
          clearInterval(newInterval);
        }
      }, 40);
    }

    return () => clearInterval(typeInterval);
  }, []);


  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center text-center px-6">

      <h1 className="text-6xl font-bold mb-8 text-purple-400">
        Before You Continue 🌙
      </h1>

      <p className="text-2xl text-gray-300 max-w-3xl mb-10 leading-relaxed">
        Please do not share personal information such as your address,
        card details, or sensitive data.
        <br /><br />
        This is a <span className="text-purple-400 font-semibold">beta version</span>,
        so keep inputs short and clear.
      </p>

      <div className="bg-slate-800/70 rounded-2xl p-8 mb-10 max-w-2xl w-full border border-purple-500/20">
        <p className="text-gray-400 mb-4 text-lg">Example Input:</p>
        <p className="text-white font-mono text-xl text-left">
          {text}
          <span className="animate-pulse">|</span>
        </p>
      </div>

      <div className="flex items-center gap-4 mb-10 text-xl">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => setChecked(!checked)}
          className="w-6 h-6 accent-purple-500"
        />
        <span>I understand and agree.</span>
      </div>

      <button
        disabled={!checked}
        onClick={() => router.push("/dashboard")}
        className={`px-16 py-6 rounded-2xl text-2xl font-bold transition ${
          checked
            ? "bg-gradient-to-r from-purple-600 to-purple-400 hover:scale-105"
            : "bg-gray-700 cursor-not-allowed"
        }`}
      >
        Enter PureMoon
      </button>

    </main>
  );
}