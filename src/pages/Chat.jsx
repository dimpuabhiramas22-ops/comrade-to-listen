import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppContext } from "../context/AppContext";

import ChatHeader from "../components/chat/ChatHeader";
import ChatMessages from "../components/chat/ChatMessages";
import ChatInput from "../components/chat/ChatInput";
import TypingIndicator from "../components/chat/TypingIndicator";

import {
  sendMessage,
  subscribeToMessages,
} from "../services/messageService";

import {
  endChat,
  subscribeToRoom,
} from "../services/endChatService";

import { translateMessage } from "../services/translationService";

export default function Chat() {
  const navigate = useNavigate();

  const {
    chatRoom,
    currentUser,
    resetApp,
  } = useAppContext();

  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [isTyping] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Redirect if no room
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!chatRoom) {
      navigate("/", { replace: true });
    }
  }, [chatRoom, navigate]);

  /*
  |--------------------------------------------------------------------------
  | Listen for Messages
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!chatRoom) return;

    let cancelled = false;

    const unsubscribe = subscribeToMessages(
      chatRoom,
      (messageList) => {
        if (cancelled) return;

        setMessages(messageList);
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [chatRoom]);

  /*
  |--------------------------------------------------------------------------
  | Listen for Room Status
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!chatRoom) return;

    const unsubscribe = subscribeToRoom(
      chatRoom,
      (room) => {
        if (!room) return;

        if (room.status === "ended") {
          setChatEnded(true);

          setTimeout(() => {
            resetApp();
            navigate("/", {
              replace: true,
            });
          }, 3000);
        }
      }
    );

    return () => unsubscribe?.();
  }, [chatRoom, navigate, resetApp]);
    /*
  |--------------------------------------------------------------------------
  | Send Message
  |--------------------------------------------------------------------------
  */

  async function handleSend(text) {
    if (!text.trim() || sending || chatEnded) return;

    try {
      setSending(true);

      const translated = await translateMessage(
        text,
        "en",
        "hi"
      );

      await sendMessage(chatRoom, {
        senderId: currentUser.uid,
        text,
        translatedText: translated.translatedText,
        createdAt: Date.now(),
        read: false,
      });
    } finally {
      setSending(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | End Chat
  |--------------------------------------------------------------------------
  */

  async function handleEndChat() {
    if (ending || chatEnded) return;

    const confirmed = window.confirm(
      "Are you sure you want to end this conversation?"
    );

    if (!confirmed) return;

    try {
      setEnding(true);

      await endChat(chatRoom);

      setChatEnded(true);
    } catch (error) {
      console.error("Failed to end chat:", error);
      alert("Unable to end the chat. Please try again.");
    } finally {
      setEnding(false);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <ChatHeader
        onEndChat={handleEndChat}
        ending={ending}
      />

      {chatEnded && (
        <div className="bg-red-500 text-white text-center py-2 font-medium">
          Conversation ended. Returning to Home...
        </div>
      )}

      <ChatMessages
        messages={messages}
        loading={loading}
      />

      <TypingIndicator
        isTyping={isTyping}
        name="Anonymous Companion"
      />

      {!chatEnded && (
        <ChatInput
          onSend={handleSend}
          sending={sending}
        />
      )}
    </div>
  );
}