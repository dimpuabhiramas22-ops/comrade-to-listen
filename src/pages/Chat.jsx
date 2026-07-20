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

import { translateMessage } from "../services/translationService";

export default function Chat() {
  const navigate = useNavigate();

  const {
    chatRoom,
    currentUser,
  } = useAppContext();

  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTyping] = useState(false);

  useEffect(() => {
    if (!chatRoom) {
      navigate("/");
      return;
    }

    const unsubscribe = subscribeToMessages(
      chatRoom,
      (messageList) => {
        setMessages(messageList);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [chatRoom, navigate]);

  async function handleSend(text) {
    if (!text.trim()) return;

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
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100">

      <ChatHeader />

      <ChatMessages
        messages={messages}
        loading={loading}
      />

      <TypingIndicator
        isTyping={isTyping}
        name="Anonymous Companion"
      />

      <ChatInput
        onSend={handleSend}
        sending={sending}
      />

    </div>
  );
}