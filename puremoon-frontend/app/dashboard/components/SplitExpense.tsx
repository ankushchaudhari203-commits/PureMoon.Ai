"use client";

import { useState } from "react";

type Person = {
  name: string;
  paid: number;
};

export default function SplitExpense({
  onClose,
  onResult,
}: {
  onClose: () => void;
  onResult: (data: string[], people: Person[]) => void;
}) {

  const [people, setPeople] = useState<Person[]>(([
    { name: "", paid: 0 }
  ]));

  const [summary, setSummary] = useState<{
    total: number;
    perPerson: number;
  } | null>(null);
  const [finalResult, setFinalResult] = useState<string[]>([]);

  // ➕ Add person
  const addPerson = () => {
    setPeople([...people, { name: "", paid: 0 }]);
  };

  // ✏️ Update person
  const updatePerson = (
    index: number,
    field: "name" | "paid",
    value: string | number
  ) => {
    const updated = [...people];

    if (field === "name") {
      updated[index].name = value as string;
    } else {
      updated[index].paid = Number(value);
    }

    setPeople(updated);
  };

  // 🧠 MAIN LOGIC
  const calculateSplit = () => {

    // ✅ Total
    const total =
      Math.round(
        people.reduce((sum, p) => sum + p.paid, 0) * 100
      ) / 100;

    // ✅ Per person
    const perPerson =
      Math.round((total / people.length) * 100) / 100;

    // ✅ Save summary
    setSummary({
      total,
      perPerson,
    });

    // ✅ Balances
    const balances = people.map((p) => {
      const raw = p.paid - perPerson;

      return {
        name: p.name || "Person",
        balance: Math.round(raw * 100) / 100,
      };
    });

    // ✅ Clean near-zero
    balances.forEach((b) => {
      if (Math.abs(b.balance) < 0.01) {
        b.balance = 0;
      }
    });

    // ✅ Split groups
    const debtors = balances
      .filter((b) => b.balance < 0)
      .sort((a, b) => a.balance - b.balance);

    const creditors = balances
      .filter((b) => b.balance > 0)
      .sort((a, b) => b.balance - a.balance);

    const result: string[] = [];

    let i = 0;
    let j = 0;

    // 🔥 Settlement logic
    while (i < debtors.length && j < creditors.length) {

      const debtor = debtors[i];
      const creditor = creditors[j];

      const amount =
        Math.round(
          Math.min(
            Math.abs(debtor.balance),
            creditor.balance
          ) * 100
        ) / 100;

      if (amount > 0) {
        result.push(
          `${debtor.name} pays ${creditor.name} $${amount}`
        );

        debtor.balance += amount;
        creditor.balance -= amount;
      }

      if (Math.abs(debtor.balance) < 0.01) i++;
      if (creditor.balance < 0.01) j++;
    }

    setFinalResult(result);
  };

  return (
    <div className="text-white">

      <h2 className="text-xl font-semibold mb-4">
        💸 Split Expenses
      </h2>

      {/* 💰 SUMMARY */}
      {summary && (
        <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg text-sm">

          <p className="text-gray-300">
            💰 Total:{" "}
            <span className="text-white font-semibold">
              ${summary.total}
            </span>
          </p>

          <p className="text-gray-300 mt-1">
            👤 Per Person:{" "}
            <span className="text-white font-semibold">
              ${summary.perPerson}
            </span>
          </p>

          {summary && (
  <div className="mt-3 space-y-2">

    {people.map((p, i) => {
      const balance = Math.round((p.paid - summary.perPerson) * 100) / 100;

      if (balance > 0) {
        return (
          <p key={i} className="text-green-400 text-sm">
            🟢 {p.name || "Person"} gets ${balance}
          </p>
        );
      }

      if (balance < 0) {
        return (
          <p key={i} className="text-red-400 text-sm">
            🔴 {p.name || "Person"} owes ${Math.abs(balance)}
          </p>
        );
      }

      return (
        <p key={i} className="text-gray-400 text-sm">
          ⚖️ {p.name || "Person"} is settled
        </p>
      );
    })}

  </div>
)}

          {/* 👥 Who paid */}
          <div className="mt-2">
            {people.map((p, i) => (
              <p key={i} className="text-gray-400 text-xs">
                {p.name || "Person"} paid ${p.paid}
              </p>
            ))}
          </div>

        </div>
      )}

      {/* 👥 Inputs */}
      {people.map((p, i) => (
        <div key={i} className="flex gap-2 mb-2">

          <input
            type="text"
            placeholder={`Person ${i + 1}`}
            value={p.name}
            onChange={(e) =>
              updatePerson(i, "name", e.target.value)
            }
            className="flex-1 p-2 rounded bg-white/10"
          />

          <input
            type="number"
            placeholder="Paid"
            value={p.paid}
            onChange={(e) =>
              updatePerson(i, "paid", e.target.value)
            }
            className="w-24 p-2 rounded bg-white/10"
          />

        </div>
      ))}

      {/* ➕ Add */}
      <button
        onClick={addPerson}
        className="mb-4 px-3 py-1 bg-white/10 rounded hover:bg-white/20"
      >
        + Add Person
      </button>

      {/* ⚙️ Buttons */}
      <div className="flex gap-2">

        <button
          onClick={calculateSplit}
          className="flex-1 bg-purple-600 py-2 rounded-lg hover:bg-purple-700"
        >
          Calculate
        </button>

        <button
  onClick={() => {
  onResult(finalResult, people); 
  onClose();
}}
  className="flex-1 bg-green-600 py-2 rounded-lg hover:bg-green-700"
>
  Save & Close
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