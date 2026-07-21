import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import { calculateMatchScore } from "../utils/scoring";

/**
 * Returns every available listener sorted by compatibility.
 * This function DOES NOT reserve listeners.
 * Reservation is handled separately using Firestore transactions.
 */
export async function findRankedListeners(supportUser) {
  const q = query(
    collection(db, "waitingUsers"),
    where("userType", "==", "listener"),
    where("status", "==", "waiting")
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return [];
  }

  const ranked = [];

  snapshot.forEach((doc) => {
    const listener = {
      id: doc.id,
      ...doc.data(),
    };

    // Ignore invalid records
    if (!listener.uid) return;

    // Never match yourself
    if (listener.uid === supportUser.uid) return;

    ranked.push({
      listener,
      score: calculateMatchScore(supportUser, listener),
    });
  });

  ranked.sort((a, b) => {
    // Highest compatibility first
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    // Tie-breaker: oldest waiting listener first
    const aTime = a.listener.createdAt?.seconds ?? 0;
    const bTime = b.listener.createdAt?.seconds ?? 0;

    return aTime - bTime;
  });

  return ranked;
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

  return ranked[0];
}