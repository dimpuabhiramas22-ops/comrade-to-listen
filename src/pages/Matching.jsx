import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  joinWaitingQueue,
  findMatch,
  leaveQueue,
} from "../services/matching";

export default function Matching() {
  const navigate = useNavigate();
  const location = useLocation();

  const language = location.state?.language || "English";
  const role = location.state?.role || "Friend";
  const mood = location.state?.mood || "Lonely";

  useEffect(() => {
    let queueId = null;
    let stopped = false;

    async function startMatching() {
      queueId = await joinWaitingQueue(language, role, mood);

      while (!stopped) {
        const match = await findMatch(language, role, mood);

        if (match) {
          if (queueId) {
            await leaveQueue(queueId);
          }

          navigate("/chat", {
            state: {
              roomId: match.roomId,
              partner: match.partner,
              language,
              role,
              mood,
            },
          });

          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    startMatching();

    return () => {
      stopped = true;

      if (queueId) {
        leaveQueue(queueId);
      }
    };
  }, [language, role, mood, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-3xl p-10 w-[420px] text-center">

        <div className="text-6xl animate-pulse">
          💙
        </div>

        <h1 className="text-3xl font-bold mt-6">
          Finding Your Listener...
        </h1>

        <p className="text-gray-500 mt-4">
          We're matching you with someone who is ready to listen.
        </p>

        <div className="mt-8 flex justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <p className="mt-8 text-sm text-gray-400">
          Searching securely...
        </p>

      </div>
    </div>
  );
}