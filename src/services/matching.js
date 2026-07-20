import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import { calculateMatchScore } from "../utils/scoring";

/**
 * Find the best listener for a support user.
 *
 * @param {Object} supportUser
 * @returns {Promise<{listener:Object|null,score:number}>}
 */
export async function findBestListener(supportUser) {
  try {

    // Get only waiting listeners
    const listenerQuery = query(
      collection(db, "waitingUsers"),
      where("userType", "==", "listener"),
      where("status", "==", "waiting")
    );

    const snapshot = await getDocs(listenerQuery);

    let bestListener = null;
    let highestScore = -1;

    snapshot.forEach((doc) => {

      const listener = {
        id: doc.id,
        ...doc.data(),
      };

      const score = calculateMatchScore(
        supportUser,
        listener
      );

      if (score > highestScore) {
        highestScore = score;
        bestListener = listener;
      }

    });

    return {
      listener: bestListener,
      score: highestScore,
    };

  } catch (error) {

    console.error("Matching Error:", error);

    return {
      listener: null,
      score: 0,
    };

  }
}