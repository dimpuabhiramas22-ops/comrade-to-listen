export default function TypingIndicator({
  isTyping = false,
  name = "Your companion",
}) {
  if (!isTyping) return null;

  return (
    <div className="px-4 py-2">
      <div className="inline-flex items-center gap-3 bg-white rounded-2xl shadow px-4 py-3">

        <div className="flex gap-1">
          <span
            className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></span>

          <span
            className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></span>

          <span
            className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></span>
        </div>

        <span className="text-sm text-gray-500">
          {name} is typing...
        </span>

      </div>
    </div>
  );
}