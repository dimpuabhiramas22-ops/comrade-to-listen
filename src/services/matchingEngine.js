import { findRankedListeners } from "./matching";

import {
  claimListenerAndCreateRoom,
  getWaitingUser,
} from "./firestoreService";

const RETRY_DELAY = 1000;
const MAX_WAIT = 60000;
const inFlightMatchingByUser = new Set();

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new Error("ABORTED"));

    const t = setTimeout(() => {
      if (signal) signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    function onAbort() {
      clearTimeout(t);
      reject(new Error("ABORTED"));
    }

    if (signal) signal.addEventListener("abort", onAbort);
  });
}

export async function startMatching(
  supportUser,
  supportProfile,
  signal
) {
  const supportUid = supportUser?.uid;

  if (!supportUid) {
    return { success: false, reason: "INVALID_SUPPORT_USER" };
  }

  if (inFlightMatchingByUser.has(supportUid)) {
    console.log(`[matchingEngine] Matching already in progress for ${supportUid}`);
    return { success: false, reason: "IN_PROGRESS" };
  }

  inFlightMatchingByUser.add(supportUid);
  console.log(`[matchingEngine] Matching started for ${supportUid}`);

  try {
    const existingSupportState = await getWaitingUser(supportUid);

    if (existingSupportState?.assignedRoom != null) {
      return { success: false, reason: "ALREADY_ASSIGNED" };
    }

    const startTime = Date.now();
    while (Date.now() - startTime < MAX_WAIT) {
      if (signal?.aborted) {
        console.log(`[matchingEngine] Matching aborted for ${supportUid}`);
        return { success: false, reason: "ABORTED" };
      }

      try {
        const rankedListeners = await findRankedListeners({
          uid: supportUid,
          ...supportProfile,
        });

        if (!rankedListeners.length) {
          console.log(`[matchingEngine] No listener yet for ${supportUid}. Retrying...`);
          try {
            await sleep(RETRY_DELAY, signal);
          } catch (err) {
            if (err && err.message === "ABORTED") {
              return { success: false, reason: "ABORTED" };
            }
          }
          continue;
        }

        for (const { listener, score } of rankedListeners) {
          if (signal?.aborted) {
            console.log(`[matchingEngine] Matching aborted for ${supportUid}`);
            return { success: false, reason: "ABORTED" };
          }

          if (!listener?.uid) {
            continue;
          }

          try {
            const match = await claimListenerAndCreateRoom(
              { uid: supportUid, ...supportProfile },
              listener,
              score
            );

            if (!match) continue;
            return { success: true, roomId: match.roomId, listener, score };
          } catch (err) {
            console.warn(`[matchingEngine] Match claim failed for ${listener.uid}`, err);
          }
        }

        console.log(`[matchingEngine] No remaining candidates for ${supportUid}; retrying...`);
        try {
          await sleep(RETRY_DELAY, signal);
        } catch (sleepErr) {
          if (sleepErr && sleepErr.message === "ABORTED") {
            return { success: false, reason: "ABORTED" };
          }
        }
      } catch (error) {
        console.error(`[matchingEngine] Matching loop failed for ${supportUid}`, error);

        try {
          await sleep(RETRY_DELAY, signal);
        } catch (sleepErr) {
          if (sleepErr && sleepErr.message === "ABORTED") {
            return { success: false, reason: "ABORTED" };
          }
        }
      }
    }
  } finally {
    inFlightMatchingByUser.delete(supportUid);
  }

  return {
    success: false,
    reason: "TIMEOUT",
  };
}
