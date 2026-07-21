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
    console.log("========== Matching ==========");
    console.log("currentUser:", currentUser);
    console.log("uid:", currentUser?.uid);
    console.log("userType:", userType);
    console.log("supportProfile:", supportProfile);
    console.log("listenerProfile:", listenerProfile);

    if (!currentUser) {
      console.log("❌ currentUser is null");
      return;
    }

    if (!currentUser.uid) {
      console.log("❌ currentUser.uid is missing");
      return;
    }

    console.log("✅ User authenticated. Starting matching...");

    let cancelled = false;

    const unsubscribe = watchWaitingUser(
      currentUser.uid,
      (waitingUser) => {
        console.log("watchWaitingUser:", waitingUser);

        if (cancelled || !waitingUser) return;

        if (!waitingUser.assignedRoom) return;

        console.log("✅ Assigned room:", waitingUser.assignedRoom);

        setChatRoom(waitingUser.assignedRoom);

        setStatus("Match found!");
        setProgress(100);

        setTimeout(() => {
          if (!cancelled) {
            navigate("/chat");
          }
        }, 800);
      }
    );

    async function beginMatching() {
      console.log("🚀 beginMatching started");

      try {
        setLoading(true);

        const profile =
          userType === "support"
            ? supportProfile
            : listenerProfile;

        console.log("Profile:", profile);

        setStatus("Joining the waiting room...");
        setProgress(20);

        console.log("Adding waiting user...");

        await addWaitingUser({
          uid: currentUser.uid,
          userType,
          ...profile,
        });

        console.log("✅ Waiting user added");

        if (userType === "listener") {
          console.log("Listener mode");

          setStatus("Waiting for someone who needs support...");
          setProgress(35);
          setLoading(false);
          return;
        }

        console.log("Finding listener...");

        setStatus("Finding the best listener...");
        setProgress(60);

        const result = await startMatching(
          currentUser,
          supportProfile
        );

        console.log("Matching Result:", result);

        if (cancelled) return;

        if (!result.success) {
          switch (result.reason) {
            case "NO_LISTENER":
            case "NO_AVAILABLE_LISTENER":
              console.log("No listener available");

              setStatus("No listener available. Waiting...");
              setProgress(60);
              setLoading(false);
              return;

            default:
              throw new Error(result.reason || "Matching failed");
          }
        }

        console.log("Listener Found:", result.listener);

        setMatch({
          listener: result.listener,
          score: result.score,
        });

        setStatus("Listener found. Connecting...");
        setProgress(90);

        setLoading(false);
      } catch (error) {
        console.error("❌ Matching Error:", error);

        if (cancelled) return;

        setError(error.message || "Matching failed");
        setStatus("Something went wrong.");
        setProgress(0);
        setLoading(false);
      }
    }

    console.log("Calling beginMatching()");

    beginMatching();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [
    currentUser?.uid,
    userType,
    supportProfile,
    listenerProfile,
    navigate,
    setChatRoom,
    setMatch,
    setLoading,
    setError,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-6">
      <SearchingCard
        progress={progress}
        status={status}
      />
    </div>
  );
}