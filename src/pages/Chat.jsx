import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      sender: "listener",
      text: "Hello 👋 I'm here to listen.",
    },
  ]);

  const [input, setInput] = useState("");

  function sendMessage() {
    if (input.trim() === "") return;

    setMessages([
      ...messages,
      {
        sender: "me",
        text: input,
      },
    ]);

    setInput("");
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}

      <div className="bg-blue-600 text-white p-5 flex justify-between items-center">

        <div>
          <h1 className="font-bold text-xl">
            🟢 Anonymous Listener
          </h1>

          <p className="text-sm opacity-80">
            Online
          </p>
        </div>

        <button className="bg-red-500 px-4 py-2 rounded-xl">
          End Chat
        </button>

      </div>

      {/* Messages */}

      <div className="max-w-4xl mx-auto p-6 h-[70vh] overflow-y-auto">

        {messages.map((msg, index) => (

          <div
            key={index}
            className={`mb-4 flex ${
              msg.sender === "me"
                ? "justify-end"
                : "justify-start"
            }`}
          >

            <div
              className={`rounded-2xl px-5 py-3 max-w-sm ${
                msg.sender === "me"
                  ? "bg-blue-600 text-white"
                  : "bg-white shadow"
              }`}
            >
              {msg.text}
            </div>

          </div>

        ))}

      </div>

      {/* Input */}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">

        <div className="max-w-4xl mx-auto flex gap-3">

          <input
            className="flex-1 border rounded-xl p-3"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-8 rounded-xl"
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
}