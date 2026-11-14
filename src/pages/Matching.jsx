import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppContext } from "../context/AppContext";

import {
  addWaitingUser,
  removeWaitingUser,
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
    chatRoom,
    setMatch,
    setChatRoom,
    setLoading,
    setError,
    resetJourney,
  } = useAppContext();

  const [status, setStatus] = useState("Preparing...");
  const [progress, setProgress] = useState(10);
  const [isCancelling, setIsCancelling] = useState(false);
  const abortRef = useRef(null);
  const cancelRequestedRef = useRef(false);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    if (!currentUser.uid) {
      return;
    }

    if (chatRoom) {
      navigate("/chat", { replace: true });
      return;
    }

    if (userType !== "listener" && userType !== "support") {
      console.warn("Matching aborted: invalid userType", userType);
      setLoading(false);
      return;
    }

    let cancelled = false;
    cancelRequestedRef.current = false;
    const abortController = new AbortController();
    abortRef.current = abortController;
    let navTimeoutId = null;

    const unsubscribe = watchWaitingUser(currentUser.uid, (waitingUser) => {
      if (cancelled || !waitingUser) return;

      if (!waitingUser.assignedRoom) return;

      setChatRoom(waitingUser.assignedRoom);

      setStatus("Match found!");
      setProgress(100);

      navTimeoutId = setTimeout(() => {
        if (!cancelled) {
          navigate("/chat");
        }
      }, 800);
    });

    async function beginMatching() {
      try {
        setLoading(true);

        const profile = userType === "support" ? supportProfile : listenerProfile;

        if (userType !== "listener" && userType !== "support") {
          console.warn("Matching aborted: invalid userType", userType);
          setLoading(false);
          return;
        }

        setStatus("Joining the waiting room...");
        setProgress(20);

        await addWaitingUser({
          uid: currentUser.uid,
          userType,
          ...profile,
        });

        if (cancelled || cancelRequestedRef.current) {
          await removeWaitingUser(currentUser.uid);
          return;
        }

        if (userType === "listener") {
          setStatus("Waiting for someone who needs support...");
          setProgress(35);
          setLoading(false);
          return;
        }

        setStatus("Finding the best listener...");
        setProgress(60);

        const result = await startMatching(currentUser, supportProfile, abortController.signal);

        if (cancelled) return;

        if (!result.success) {
          switch (result.reason) {
            case "TIMEOUT":
              setStatus("No listener found after 60 seconds.");
              setProgress(60);
              setLoading(false);
              return;

            default:
              console.error("Unexpected matching failure:", result);
              throw new Error(result.reason || "Matching failed");
          }
        }

        setMatch({ listener: result.listener, score: result.score });

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

    beginMatching();

    return () => {
      cancelled = true;
      abortController.abort();
      if (abortRef.current === abortController) abortRef.current = null;
      unsubscribe();
      if (navTimeoutId) clearTimeout(navTimeoutId);
    };
  }, [
    currentUser?.uid,
    userType,
    supportProfile,
    listenerProfile,
    chatRoom,
    navigate,
    setChatRoom,
    setMatch,
    setLoading,
    setError,
  ]);

  async function handleCancel() {
    if (!currentUser?.uid || isCancelling) return;
    setIsCancelling(true);
    cancelRequestedRef.current = true;
    abortRef.current?.abort();
    try {
      await removeWaitingUser(currentUser.uid);
    } catch (error) {
      console.warn("Could not remove waiting user", error);
    } finally {
      resetJourney();
      navigate("/", { replace: true });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,.96),transparent_34rem)] px-5">
      <SearchingCard
        progress={progress}
        status={status}
        onCancel={handleCancel}
        isCancelling={isCancelling}
      />
    </div>
  );
}
