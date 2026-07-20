import { useAppContext } from "../../context/AppContext";

export default function ChatHeader() {
  const { match } = useAppContext();

  const partner =
    match?.listener ||
    match?.support ||
    {};

  return (
    <header className="bg-white shadow-md border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">

        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
          💙
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            Anonymous Chat
          </h2>

          <p className="text-sm text-gray-500">
            {partner.preferredRole ||
              partner.role ||
              "Matched Companion"}
          </p>
        </div>

      </div>

      {match?.score && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
          Match {Math.round(match.score)}%
        </div>
      )}
    </header>
  );
}