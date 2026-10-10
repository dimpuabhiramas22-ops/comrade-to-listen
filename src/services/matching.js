import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import { calculateMatchScore } from "../utils/scoring";

function getTimestampSeconds(value) {
  if (!value || typeof value !== "object") {
    return 0;
  }

  if (typeof value.seconds === "number") {
    return value.seconds;
  }

  if (typeof value.toMillis === "function") {
    return Math.floor(value.toMillis() / 1000);
  }

  return 0;
}

function getSortableListenerId(listener) {
  return String(listener?.id ?? "");
}

function logEligibilityRejection(listener, reason) {
  console.warn("[matching] Rejected listener:", {
    uid: listener?.uid ?? null,
    userType: listener?.userType ?? null,
    status: listener?.status ?? null,
    assignedRoom: listener?.assignedRoom ?? null,
    cancelled: listener?.cancelled ?? null,
    reason,
  });
}

function isEligibleListener(listener, supportUser) {
  if (!listener || typeof listener !== "object") {
    logEligibilityRejection(listener, "listener is missing or not an object");
    return false;
  }

  if (!supportUser || typeof supportUser !== "object") {
    logEligibilityRejection(listener, "supportUser is missing or not an object");
    return false;
  }

  if (typeof listener.uid !== "string" || !listener.uid) {
    logEligibilityRejection(listener, "listener.uid is missing or not a non-empty string");
    return false;
  }

  if (typeof supportUser.uid !== "string" || !supportUser.uid) {
    logEligibilityRejection(listener, "supportUser.uid is missing or not a non-empty string");
    return false;
  }

  if (listener.uid === supportUser.uid) {
    logEligibilityRejection(listener, "listener.uid matches supportUser.uid");
    return false;
  }

  if (listener.userType !== "listener") {
    logEligibilityRejection(listener, 'listener.userType !== "listener"');
    return false;
  }

  if (listener.status !== "waiting") {
    logEligibilityRejection(listener, 'listener.status !== "waiting"');
    return false;
  }

  if (listener.cancelled === true) {
    logEligibilityRejection(listener, "listener.cancelled === true");
    return false;
  }

  if (listener.assignedRoom != null) {
    logEligibilityRejection(listener, "listener.assignedRoom != null");
    return false;
  }

  return true;
}

function sortRankedListeners(rankedListeners) {
  return [...rankedListeners].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    const aTime = getTimestampSeconds(a.listener?.joinedAt ?? a.listener?.createdAt);
    const bTime = getTimestampSeconds(b.listener?.joinedAt ?? b.listener?.createdAt);

    if (aTime !== bTime) {
      return aTime - bTime;
    }

    return getSortableListenerId(a.listener).localeCompare(getSortableListenerId(b.listener), undefined, {
      sensitivity: "base",
    });
  });
}

/**
 * Returns every available listener sorted by compatibility.
 * This function DOES NOT reserve listeners.
 * Reservation is handled separately using Firestore transactions.
 */
export async function findRankedListeners(supportUser) {
  if (!supportUser?.uid) {
    console.debug("[matching] findRankedListeners skipped: missing supportUser.uid");
    return [];
  }

  const q = query(
    collection(db, "waitingUsers"),
    where("userType", "==", "listener"),
    where("status", "==", "waiting")
  );

  try {
    const snapshot = await getDocs(q);

    console.log("[matching] findRankedListeners query size", snapshot.size);

    if (snapshot.empty) {
      console.log("[matching] No Firestore documents matched the query.");
      return [];
    }

    const ranked = [];
    const seenListenerIds = new Set();

    snapshot.forEach((doc) => {
      const listener = {
        id: doc.id,
        ...doc.data(),
      };

      console.log("[matching] Firestore query document", {
        id: doc.id,
        data: doc.data(),
      });

      if (!isEligibleListener(listener, supportUser)) {
        console.log("[matching] Rejected document", {
          id: doc.id,
          reason: "isEligibleListener returned false",
        });
        return;
      }

      const listenerId = getSortableListenerId(listener);

      if (seenListenerIds.has(listenerId)) {
        console.debug(`[matching] Dropping duplicate listener entry: ${listenerId}`);
        return;
      }

      seenListenerIds.add(listenerId);

      try {
        const score = calculateMatchScore(supportUser, listener);
        console.log("[matching] Accepted listener", { id: listenerId, score, listener });
        ranked.push({ listener, score });
      } catch (error) {
        console.debug(`[matching] Failed to calculate score for listener ${listenerId}`, error);
      }
    });

    return sortRankedListeners(ranked);
  } catch (error) {
    console.warn("[matching] findRankedListeners query failed, returning []", error);
    return [];
  }
}

/**
 * Backward-compatible helper.
 * Existing code using findBestListener() will continue working.
 */
export async function findBestListener(supportUser) {
  const ranked = await findRankedListeners(supportUser);

  if (!ranked.length) {
    return {
      listener: null,
      score: 0,
    };
  }

  const first = ranked[0];

  return {
    listener: first?.listener ?? null,
    score: typeof first?.score === "number" ? first.score : 0,
  };
}
