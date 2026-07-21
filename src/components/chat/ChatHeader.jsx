import { useState } from "react";

import { useAppContext } from "../../context/AppContext";

export default function ChatHeader({
  onEndChat,
  ending = false,
}) {
  const { match } = useAppContext();

  const [showConfirm, setShowConfirm] =
    useState(false);

  const partner =
    match?.listener ||
    match?.support ||
    {};

  async function handleConfirm() {
    setShowConfirm(false);

    if (onEndChat) {
      await onEndChat();
    }
  }

  return (
    <>
      <header className="bg-white shadow-md border-b px-6 py-4 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
            💙
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              Anonymous Chat
            </h2>

            <p className="text-sm text-gray-500">
              {partner.preferredRole ||
                partner.role ||
                "Matched Companion"}
            </p>
          </div>

        </div>

        <div className="flex items-center gap-3">

          {match?.score && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              Match {Math.round(match.score)}%
            </div>
          )}

          <button
            onClick={() =>
              setShowConfirm(true)
            }
            disabled={ending}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            {ending
              ? "Ending..."
              : "End Chat"}
          </button>

        </div>

      </header>

      {showConfirm && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl shadow-xl w-96 p-6">

            <h3 className="text-xl font-bold mb-3">
              End Conversation?
            </h3>

            <p className="text-gray-600 mb-6">
              Are you sure you want to end
              this conversation?
            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={() =>
                  setShowConfirm(false)
                }
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                End Chat
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}