import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppContext } from "../context/AppContext";

import {
  addWaitingUser,
  watchWaitingUser,
} from "../services/firestoreService";

import { startMatching } from "../services/matchingEngine";

import SearchingCard from "../components/matching/SearchingCard";

export default function Matching() {
  const navigate = useNavigate();

  const {
    userType,
    supportProfile,
    listenerProfile,
    currentUser,
    setMatch,
    setChatRoom,
    setLoading,
    setError,
  } = useAppContext();

  const [status, setStatus] = useState("Preparing...");
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    if (!currentUser?.uid) return;

    let unsubscribe = null;
    let cancelled = false;

    async function beginMatching() {
      try {
        setLoading(true);

        const profile =
          userType === "support"
            ? supportProfile
            : listenerProfile;

        setStatus("Joining the waiting room...");
        setProgress(20);

        await addWaitingUser({
          uid: currentUser.uid,
          userType,
          ...profile,
        });

        // ==========================
        // LISTENER FLOW
        // ==========================
        if (userType === "listener") {
          setStatus("Waiting for someone who needs support...");
          setProgress(35);

          unsubscribe = watchWaitingUser(
            currentUser.uid,
            (waitingUser) => {
              if (!waitingUser) return;

              if (!waitingUser.assignedRoom) return;

              setChatRoom(waitingUser.assignedRoom);

              setStatus("Match found!");
              setProgress(100);

              unsubscribe?.();

              setTimeout(() => {
                navigate("/chat");
              }, 800);
            }
          );

          setLoading(false);
          return;
        }

        // ==========================
        // SUPPORT FLOW
        // ==========================
        setStatus("Finding the best listener...");
        setProgress(60);

        const result = await startMatching(
          currentUser,
          supportProfile
        );

        if (cancelled) return;

        if (!result.success) {
          switch (result.reason) {
            case "NO_LISTENER":
              setStatus(
                "No listener available. Waiting..."
              );
              setProgress(60);
              setLoading(false);
              return;

            case "LISTENER_ALREADY_RESERVED":
              setStatus(
                "Listener matched elsewhere. Retrying..."
              );
              setProgress(60);

              setTimeout(() => {
                if (!cancelled) {
                  beginMatching();
                }
              }, 800);

              return;

            default:
              throw new Error("Matching failed");
          }
        }

        setMatch({
          listener: result.listener,
          score: result.score,
        });

        setChatRoom(result.roomId);

        setStatus("Match found!");
        setProgress(100);

        setTimeout(() => {
          navigate("/chat");
        }, 800);
      } catch (error) {
        console.error(error);

        setError(error.message);

        setStatus("Something went wrong.");

        setProgress(0);

        setLoading(false);
      }
    }

    beginMatching();

    return () => {
      cancelled = true;

      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-6">
      <SearchingCard
        progress={progress}
        status={status}
      />
    </div>
  );
}