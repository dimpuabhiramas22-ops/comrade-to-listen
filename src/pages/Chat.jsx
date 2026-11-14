import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import ChatHeader from "../components/chat/ChatHeader";
import ChatMessages from "../components/chat/ChatMessages";
import ChatInput from "../components/chat/ChatInput";
import TypingIndicator from "../components/chat/TypingIndicator";
import { sendMessage, subscribeToMessages, updateTypingStatus } from "../services/messageService";
import { uploadVoiceMessage } from "../services/voiceMessageService";
import { endChat, subscribeToRoom } from "../services/endChatService";

export default function Chat() {
  const navigate = useNavigate();
  const { chatRoom, currentUser, match, resetApp } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const typingStartTimerRef = useRef(null);
  const typingStopTimerRef = useRef(null);
  const typingActiveRef = useRef(false);

  useEffect(() => { if (!chatRoom) navigate("/", { replace: true }); }, [chatRoom, navigate]);
  useEffect(() => {
    if (!chatRoom) return undefined;
    return subscribeToMessages(chatRoom, (list) => { setMessages(list); setLoading(false); });
  }, [chatRoom]);

  async function stopTyping() {
    if (!chatRoom || !currentUser) return;
    clearTimeout(typingStartTimerRef.current); clearTimeout(typingStopTimerRef.current);
    if (!typingActiveRef.current) return;
    typingActiveRef.current = false;
    try { await updateTypingStatus(chatRoom, currentUser.uid, false); } catch (error) { console.warn("Failed to clear typing", error); }
  }

  useEffect(() => {
    if (!chatRoom) return undefined;
    return subscribeToRoom(chatRoom, (room) => {
      if (!room) return;
      if (room.status === "ended") {
        setChatEnded(true);
        window.setTimeout(() => { stopTyping(); resetApp(); navigate("/", { replace: true }); }, 3000);
        return;
      }
      const otherUserId = room.users?.find((uid) => uid !== currentUser?.uid);
      setOtherTyping(Boolean(room.typing?.[otherUserId]));
    });
  }, [chatRoom, currentUser, navigate, resetApp]);

  async function handleSend(text) {
    if (!text.trim() || sending || ending || chatEnded) return;
    try { setSending(true); await sendMessage(chatRoom, { senderId: currentUser.uid, text }); }
    catch (error) { console.error("Failed to send message:", error); alert("Unable to send your message. Please try again."); }
    finally { setSending(false); }
  }

  async function handleVoiceSend(blob, audioDuration) {
    if (sending || ending || chatEnded) return;
    try {
      setSending(true);
      const audioUrl = await uploadVoiceMessage(chatRoom, currentUser.uid, blob);
      await sendMessage(chatRoom, { senderId: currentUser.uid, type: "voice", audioUrl, audioDuration });
    } catch (error) {
      console.error("Failed to send voice message:", error);
      alert("Unable to send the voice message. Check Firebase Storage permissions and try again.");
    } finally { setSending(false); }
  }

  const sendTypingStart = useCallback(async () => {
    if (!chatRoom || !currentUser || typingActiveRef.current) return;
    typingActiveRef.current = true;
    try { await updateTypingStatus(chatRoom, currentUser.uid, true); } catch (error) { console.warn("Failed to set typing", error); }
  }, [chatRoom, currentUser]);

  const handleTyping = useCallback(() => {
    if (!chatRoom || !currentUser || chatEnded || ending) return;
    clearTimeout(typingStopTimerRef.current);
    if (typingActiveRef.current) { typingStopTimerRef.current = window.setTimeout(stopTyping, 2000); return; }
    if (!typingStartTimerRef.current) typingStartTimerRef.current = window.setTimeout(async () => {
      typingStartTimerRef.current = null; await sendTypingStart(); typingStopTimerRef.current = window.setTimeout(stopTyping, 2000);
    }, 300);
  }, [chatRoom, currentUser, chatEnded, ending, sendTypingStart]);

  useEffect(() => () => { stopTyping(); }, []);

  async function handleEndChat() {
    if (ending || chatEnded) return;
    try { setEnding(true); await stopTyping(); await endChat(chatRoom); setChatEnded(true); }
    catch (error) { console.error("Failed to end chat:", error); alert("Unable to end the chat. Please try again."); }
    finally { setEnding(false); }
  }

  return <div className="flex h-screen flex-col bg-slate-100">
    <ChatHeader onEndChat={handleEndChat} ending={ending} />
    {chatEnded && <div className="bg-red-500 py-2 text-center font-medium text-white">Conversation ended. Returning to Home...</div>}
    <ChatMessages messages={messages} loading={loading} />
    <TypingIndicator isTyping={otherTyping} name={match?.listener?.preferredRole || match?.listener?.role || match?.support?.preferredRole || match?.support?.role || "Anonymous Companion"} />
    {!chatEnded && !ending && <ChatInput onSend={handleSend} onVoiceSend={handleVoiceSend} sending={sending} onTyping={handleTyping} onTypingStop={stopTyping} />}
  </div>;
}