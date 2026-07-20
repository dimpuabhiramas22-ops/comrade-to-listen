import ProgressCircle from "./ProgressCircle";

export default function SearchingCard({
  progress,
  status,
}) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full">

      <div className="text-center">

        <div className="text-7xl mb-6 animate-pulse">
          💙
        </div>

        <h1 className="text-4xl font-bold">
          Finding Your Match
        </h1>

        <p className="mt-4 text-gray-500">
          {status}
        </p>

      </div>

      <div className="mt-10">
        <ProgressCircle progress={progress} />
      </div>

      <div className="mt-10 space-y-4">

        <div className="flex justify-between">
          <span>Joining Queue</span>
          <span>{progress >= 20 ? "✅" : "⏳"}</span>
        </div>

        <div className="flex justify-between">
          <span>Searching Listener</span>
          <span>{progress >= 50 ? "✅" : "⏳"}</span>
        </div>

        <div className="flex justify-between">
          <span>Calculating Match</span>
          <span>{progress >= 80 ? "✅" : "⏳"}</span>
        </div>

        <div className="flex justify-between">
          <span>Creating Chat Room</span>
          <span>{progress >= 100 ? "✅" : "⏳"}</span>
        </div>

      </div>

    </div>
  );
}