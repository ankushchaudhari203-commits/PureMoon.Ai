"use client";

export default function HelpModal({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-[#111827] p-12 rounded-3xl border border-white/10 text-center max-w-lg w-full">
        <h2 className="text-3xl font-semibold mb-6 text-purple-400">
          Need Help?
        </h2>

        <p className="text-gray-300 mb-6">
          Please reach out to:
        </p>

        <p className="text-xl font-medium text-white mb-10">
          ankushchaudhari203@gmail.com
        </p>

        <button
          onClick={onClose}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}