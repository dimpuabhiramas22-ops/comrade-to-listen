import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppContext } from "../context/AppContext";

import ChatHeader from "../components/chat/ChatHeader";
import ChatMessages from "../components/chat/ChatMessages";
import ChatInput from "../components/chat/ChatInput";
import TypingIndicator from "../components/chat/TypingIndicator";

import {
  sendMessage,
  subscribeToMessages,
  updateTypingStatus,
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
    match,
    resetApp,
  } = useAppContext();

  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);

  const typingStartTimerRef = useRef(null);
  const typingStopTimerRef = useRef(null);
  const typingActiveRef = useRef(false);

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
            stopTyping();
            resetApp();
            navigate("/", {
              replace: true,
            });
          }, 3000);

          return;
        }

        const otherUserId = room.users?.find(
          (uid) => uid !== currentUser?.uid
        );

        setOtherTyping(
          Boolean(room.typing?.[otherUserId])
        );
      }
    );

    return () => unsubscribe?.();
  }, [chatRoom, currentUser, navigate, resetApp]);
    /*
  |--------------------------------------------------------------------------
  | Send Message
  |--------------------------------------------------------------------------
  */

  async function handleSend(text) {
    if (!text.trim() || sending || ending || chatEnded) return;

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
      const errorMessage =
        error?.message?.toLowerCase() || "";

      if (errorMessage.includes("conversation has ended") || errorMessage.includes("ended")) {
        setChatEnded(true);
        return;
      }

      console.error("Failed to send message:", error);
      alert("Unable to send your message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const stopTyping = useCallback(async () => {
    if (!chatRoom || !currentUser) return;

    if (typingStartTimerRef.current) {
      clearTimeout(typingStartTimerRef.current);
      typingStartTimerRef.current = null;
    }

    if (typingStopTimerRef.current) {
      clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }

    if (!typingActiveRef.current) return;

    typingActiveRef.current = false;

    try {
      await updateTypingStatus(chatRoom, currentUser.uid, false);
    } catch (error) {
      console.warn("Failed to clear typing status", error);
    }
  }, [chatRoom, currentUser]);

  const sendTypingStart = useCallback(async () => {
    if (!chatRoom || !currentUser) return;
    if (typingActiveRef.current) return;

    typingActiveRef.current = true;

    try {
      await updateTypingStatus(chatRoom, currentUser.uid, true);
    } catch (error) {
      console.warn("Failed to set typing status", error);
    }
  }, [chatRoom, currentUser]);

  const handleTyping = useCallback(() => {
    if (!chatRoom || !currentUser || chatEnded || ending) return;

    if (typingStopTimerRef.current) {
      clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }

    if (typingActiveRef.current) {
      typingStopTimerRef.current = window.setTimeout(
        stopTyping,
        2000
      );
      return;
    }

    if (!typingStartTimerRef.current) {
      typingStartTimerRef.current = window.setTimeout(
        async () => {
          typingStartTimerRef.current = null;
          await sendTypingStart();
          typingStopTimerRef.current = window.setTimeout(
            stopTyping,
            2000
          );
        },
        300
      );
    }
  }, [chatRoom, currentUser, chatEnded, ending, sendTypingStart, stopTyping]);

  useEffect(() => {
    return () => {
      stopTyping();
    };
  }, [stopTyping]);

  /*
  |--------------------------------------------------------------------------
  | End Chat
  |--------------------------------------------------------------------------
  */

  async function handleEndChat() {
    if (ending || chatEnded) return;

    try {
      setEnding(true);
      await stopTyping();

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
        isTyping={otherTyping}
        name={
          match?.listener?.preferredRole ||
          match?.listener?.role ||
          match?.support?.preferredRole ||
          match?.support?.role ||
          "Anonymous Companion"
        }
      />

      {!chatEnded && !ending && (
        <ChatInput
          onSend={handleSend}
          sending={sending}
          onTyping={handleTyping}
          onTypingStop={stopTyping}
        />
      )}
    </div>
  );
}