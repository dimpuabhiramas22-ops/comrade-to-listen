import { useState } from "react";

export default function ChatInput({
  onSend,
  sending = false,
}) {
  const [message, setMessage] = useState("");

  function handleSend() {
    const text = message.trim();

    if (!text || sending) return;

    onSend(text);

    setMessage("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="bg-white border-t px-4 py-3">
      <div className="flex items-end gap-3">

        {/* Attachment Button (Future Feature) */}
        <button
          type="button"
          disabled
          className="text-2xl text-gray-400 cursor-not-allowed"
          title="Coming Soon"
        >
          📎
        </button>

        {/* Message Input */}
        <textarea
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-40"
        />

        {/* Emoji Button (Future Feature) */}
        <button
          type="button"
          disabled
          className="text-2xl text-gray-400 cursor-not-allowed"
          title="Coming Soon"
        >
          😊
        </button>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-3 rounded-2xl font-semibold transition"
        >
          {sending ? "..." : "Send"}
        </button>

      </div>

      <p className="text-xs text-gray-400 mt-2">
        Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for a new line
      </p>
    </div>
  );
}