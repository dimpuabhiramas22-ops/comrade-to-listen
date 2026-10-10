import ProgressCircle from "./ProgressCircle";

export default function SearchingCard({
  progress,
  status,
  queuePosition = 1,
  estimatedWait = 30,
  listenersOnline = 0,
  onCancel,
  isCancelling = false,
  retryStatus = "",
  queueTimedOut = false,
}) {
  return (
    <div className="w-full max-w-xl rounded-[2rem] border border-white/80 bg-white/85 p-7 shadow-[0_24px_70px_rgba(55,70,137,.16)] backdrop-blur sm:p-10">
      <div className="text-center">
        <div className="mx-auto mb-7 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-indigo-50 text-4xl text-indigo-600">∞</div>
        <h1 className="font-serif text-4xl font-semibold text-ink">Finding someone who understands</h1>
        <p className="mt-4 text-slate-500">{status}</p>
      </div>

      <div className="mt-8">
        <ProgressCircle progress={progress} />
      </div>

      <div className="mt-8 grid gap-3 rounded-2xl bg-indigo-50/70 p-5 text-sm text-slate-700">
        <div className="flex justify-between">
          <span>Listeners online</span>
          <span className="font-semibold">{listenersOnline}</span>
        </div>
        <div className="flex justify-between">
          <span>Queue position</span>
          <span className="font-semibold">{queuePosition}</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated wait</span>
          <span className="font-semibold">{estimatedWait}s</span>
        </div>
        <div className="flex justify-between">
          <span>Retry status</span>
          <span className="font-semibold">{retryStatus || "Monitoring"}</span>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm text-slate-600">
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

      {queueTimedOut && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          No listeners were available in time. You can try again shortly.
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={onCancel}
          disabled={isCancelling}
          className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCancelling ? "Cancelling..." : "Cancel Search"}
        </button>
      </div>
    </div>
  );
}
