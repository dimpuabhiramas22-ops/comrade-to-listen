import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import VideoCall from "./VideoCall";

export default function ChatHeader({ onEndChat, ending = false, roomId, currentUserId, partnerId }) {
  const navigate = useNavigate();
  const { match } = useAppContext();
  const [showConfirm, setShowConfirm] = useState(false);
  const partner = match?.listener || match?.support || {};

  async function handleConfirm() {
    setShowConfirm(false);
    await onEndChat?.();
  }

  return <>
    <header className="border-b bg-white px-6 py-4 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">💙</div>
          <div><h2 className="text-xl font-semibold">Anonymous Chat</h2><p className="text-sm text-gray-500">{partner.preferredRole || partner.role || "Matched Companion"}</p>{match?.conversationId && <button onClick={() => navigator.clipboard?.writeText(match.conversationId)} className="mt-1 text-sm font-medium text-blue-600 underline">Copy conversation ID: {match.conversationId}</button>}</div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <VideoCall roomId={roomId} currentUserId={currentUserId} partnerId={partnerId} disabled={ending} />
          {match?.score && <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">Match {Math.round(match.score)}%</div>}
          <button onClick={() => navigate("/", { replace: true })} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Return Home</button>
          <button onClick={() => setShowConfirm(true)} disabled={ending} className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:bg-gray-400">{ending ? "Ending..." : "End Chat"}</button>
        </div>
      </div>
    </header>
    {showConfirm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div className="w-96 rounded-xl bg-white p-6 shadow-xl"><h3 className="mb-3 text-xl font-bold">End Conversation?</h3><p className="mb-6 text-gray-600">Are you sure you want to end this conversation?</p><div className="flex justify-end gap-3"><button onClick={() => setShowConfirm(false)} className="rounded-lg border px-4 py-2">Cancel</button><button onClick={handleConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700">End Chat</button></div></div></div>}
  </>;
}