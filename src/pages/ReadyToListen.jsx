import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  listenForMessages,
  sendMessage,
} from "../services/chat";

import { auth } from "../firebase";

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();

  const roomId = location.state?.roomId;
  const partner = location.state?.partner || "Anonymous Listener";

  const language = location.state?.language || "English";
  const role = location.state?.role || "Friend";
  const mood = location.state?.mood || "Lonely";

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const bottomRef = useRef(null);

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    const unsubscribe = listenForMessages(roomId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [roomId, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;

    await sendMessage(roomId, input);

    setInput("");
  }

  function nextPerson() {
    navigate("/matching", {
      state: {
        language,
        role,
        mood,
      },
    });
  }

  function endChat() {
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      <div className="bg-blue-600 text-white p-5 flex justify-between items-center">

        <div>
          <h1 className="font-bold text-xl">
            🟢 {partner}
          </h1>

          <p className="text-sm opacity-80">
            Anonymous Chat
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={nextPerson}
            className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-xl"
          >
            Next Person
          </button>

          <button
            onClick={endChat}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl"
          >
            End Chat
          </button>

        </div>

      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">

        {messages.map((msg) => {

          const mine = msg.sender === auth.currentUser.uid;

          return (

            <div
              key={msg.id}
              className={`mb-4 flex ${
                mine
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`rounded-2xl px-5 py-3 max-w-sm ${
                  mine
                    ? "bg-blue-600 text-white"
                    : "bg-white shadow"
                }`}
              >

                {mine
                  ? msg.originalText
                  : msg.translatedText}

              </div>

            </div>

          );

        })}

        <div ref={bottomRef} />

      </div>

      <div className="bg-white border-t p-4">

        <div className="max-w-4xl mx-auto flex gap-3">

          <input
            className="flex-1 border rounded-xl p-3"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
          />

          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl"
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
}