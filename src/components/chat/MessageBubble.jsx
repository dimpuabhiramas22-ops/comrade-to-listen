import { useAppContext } from "../../context/AppContext";

export default function MessageBubble({ message }) {
  const { currentUser } = useAppContext();

  const isMine = message.senderId === currentUser?.uid;

  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      className={`flex mb-4 ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
          isMine
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-white text-gray-800 rounded-bl-md"
        }`}
      >
        {/* Original Message */}
        <p className="whitespace-pre-wrap break-words">
          {message.text}
        </p>

        {/* Translated Message */}
        {message.translatedText &&
          message.translatedText !== message.text && (
            <div
              className={`mt-3 border-t pt-2 text-sm italic ${
                isMine
                  ? "border-blue-400 text-blue-100"
                  : "border-gray-200 text-gray-500"
              }`}
            >
              🌍 {message.translatedText}
            </div>
          )}

        {/* Footer */}
        <div
          className={`mt-3 flex items-center justify-end gap-2 text-xs ${
            isMine
              ? "text-blue-100"
              : "text-gray-400"
          }`}
        >
          <span>{time}</span>

          {isMine && (
            <span>
              {message.read ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}