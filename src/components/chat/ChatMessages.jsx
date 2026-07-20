import { useEffect, useRef } from "react";

import MessageBubble from "./MessageBubble";

export default function ChatMessages({
  messages = [],
  loading = false,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">
          Loading messages...
        </p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">

          <div className="text-6xl mb-4">
            💙
          </div>

          <h2 className="text-2xl font-semibold">
            Start the Conversation
          </h2>

          <p className="text-gray-500 mt-2">
            Say hello 👋 and begin your anonymous conversation.
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 px-4 py-6">

      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
        />
      ))}

      <div ref={bottomRef} />

    </div>
  );
}