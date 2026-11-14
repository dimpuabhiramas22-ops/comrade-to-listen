import { useAppContext } from "../../context/AppContext";

export default function MessageBubble({ message }) {
  const { currentUser } = useAppContext();
  const isMine = message.senderId === currentUser?.uid;
  const time = message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className={`mb-4 flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${isMine ? "rounded-br-md bg-blue-600 text-white" : "rounded-bl-md bg-white text-gray-800"}`}>
        {message.type === "voice" ? (
          <div className="min-w-56"><p className={`mb-2 text-sm font-semibold ${isMine ? "text-blue-100" : "text-slate-600"}`}>🎤 Voice message</p><audio controls preload="metadata" src={message.audioUrl} className="w-full" /></div>
        ) : <p className="whitespace-pre-wrap break-words">{message.text}</p>}
        {message.translatedText && message.translatedText !== message.text && <div className={`mt-3 border-t pt-2 text-sm italic ${isMine ? "border-blue-400 text-blue-100" : "border-gray-200 text-gray-500"}`}>🌍 {message.translatedText}</div>}
        <div className={`mt-3 flex items-center justify-end gap-2 text-xs ${isMine ? "text-blue-100" : "text-gray-400"}`}><span>{time}</span>{isMine && <span>{message.read ? "✓✓" : "✓"}</span>}</div>
      </div>
    </div>
  );
}