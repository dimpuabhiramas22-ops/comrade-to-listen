import { useEffect, useRef, useState } from "react";
import { Mic, Send, Smile, Square } from "lucide-react";

const EMOJIS = ["🙂", "😊", "😌", "💙", "❤️", "🤝", "🌿", "🙏", "✨", "👋", "😔", "😢"];

export default function ChatInput({ onSend, onVoiceSend, sending = false, onTyping, onTypingStop }) {
  const [message, setMessage] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => () => {
    clearInterval(intervalRef.current);
    recorderRef.current?.stream?.getTracks().forEach((track) => track.stop());
  }, []);

  function handleSend() {
    const text = message.trim();
    if (!text || sending) return;
    onSend(text);
    onTypingStop?.();
    setMessage("");
  }

  function addEmoji(emoji) {
    setMessage((current) => current + emoji);
    setEmojiOpen(false);
  }

  async function startRecording() {
    if (sending || recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => event.data.size && chunksRef.current.push(event.data);
      recorder.onstop = async () => {
        clearInterval(intervalRef.current);
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        if (blob.size) {
          setUploadingVoice(true);
          try { await onVoiceSend?.(blob, recordingSeconds); } finally { setUploadingVoice(false); }
        }
        setRecordingSeconds(0);
      };
      recorder.start();
      setRecording(true);
      setRecordingSeconds(0);
      intervalRef.current = window.setInterval(() => setRecordingSeconds((seconds) => seconds + 1), 1000);
    } catch {
      alert("Please allow microphone access to record a voice message.");
    }
  }

  function stopRecording() {
    recorderRef.current?.state === "recording" && recorderRef.current.stop();
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="relative border-t bg-white px-4 py-3">
      {emojiOpen && (
        <div className="absolute bottom-20 left-4 z-20 grid grid-cols-6 gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          {EMOJIS.map((emoji) => <button key={emoji} type="button" onClick={() => addEmoji(emoji)} className="rounded-lg p-2 text-xl hover:bg-slate-100" aria-label={emoji}>{emoji}</button>)}
        </div>
      )}
      <div className="flex items-end gap-2">
        <button type="button" onClick={() => setEmojiOpen((open) => !open)} className="rounded-xl p-3 text-slate-500 hover:bg-slate-100 hover:text-indigo-600" aria-label="Add emoji"><Smile size={22} /></button>
        <textarea rows={1} value={message} onChange={(event) => {
          const next = event.target.value;
          setMessage(next);
          next.trim() ? onTyping?.() : onTypingStop?.();
        }} onBlur={() => onTypingStop?.()} onKeyDown={handleKeyDown} placeholder={recording ? "Recording voice message…" : "Type your message..."} disabled={recording || uploadingVoice} className="max-h-40 flex-1 resize-none rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100" />
        {recording ? (
          <button type="button" onClick={stopRecording} className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 font-semibold text-white hover:bg-rose-700"><Square size={18} fill="currentColor" /> {recordingSeconds}s</button>
        ) : (
          <button type="button" onClick={startRecording} disabled={sending || uploadingVoice} className="rounded-xl p-3 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-50" aria-label="Record voice message"><Mic size={22} /></button>
        )}
        <button type="button" onClick={handleSend} disabled={sending || uploadingVoice || !message.trim() || recording} className="rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300" aria-label="Send message">{sending ? "…" : <Send size={20} />}</button>
      </div>
      <p className="mt-2 text-xs text-slate-400">{uploadingVoice ? "Uploading your voice message…" : "Enter to send · Shift + Enter for a new line · Hold a private voice conversation with care."}</p>
    </div>
  );
}