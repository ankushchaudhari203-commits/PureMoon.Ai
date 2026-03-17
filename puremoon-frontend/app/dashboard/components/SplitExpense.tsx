"use client";

import { useState } from "react";

export default function SplitExpense({
  onClose,
  onResult,
}: {
  onClose: () => void;
  onResult: (data: string[]) => void;
}) {

  const [people, setPeople] = useState<string[]>([""]);
  const [amount, setAmount] = useState("");

  const addPerson = () => {
    setPeople([...people, ""]);
  };

  const updatePerson = (value: string, index: number) => {
    const updated = [...people];
    updated[index] = value;
    setPeople(updated);
  };

  const calculateSplit = () => {
    const total = parseFloat(amount);

    if (!total || people.length === 0) return;

    const perPerson = total / people.length;

    const output: string[] = people.map(
      (p) => `${p || "Person"} owes $${perPerson.toFixed(2)}`
    );

    onResult(output);
  };

  return (
    <div className="text-white">

      <h2 className="text-xl font-semibold mb-4">💸 Split Expenses</h2>

      {/* Amount */}
      <input
        type="number"
        placeholder="Total Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full mb-4 p-2 rounded bg-white/10 outline-none"
      />

      {/* People */}
      {people.map((p, i) => (
        <input
          key={i}
          type="text"
          placeholder={`Person ${i + 1}`}
          value={p}
          onChange={(e) => updatePerson(e.target.value, i)}
          className="w-full mb-2 p-2 rounded bg-white/10 outline-none"
        />
      ))}

      <button
        onClick={addPerson}
        className="mb-4 px-3 py-1 bg-white/10 rounded hover:bg-white/20"
      >
        + Add Person
      </button>

      {/* Buttons */}
      <div className="flex gap-2">

        <button
          onClick={calculateSplit}
          className="flex-1 bg-purple-600 py-2 rounded-lg hover:bg-purple-700"
        >
          Calculate
        </button>

        <button
          onClick={onClose}
          className="flex-1 bg-white/10 py-2 rounded-lg hover:bg-white/20"
        >
          Cancel
        </button>

      </div>

    </div>
  );
}