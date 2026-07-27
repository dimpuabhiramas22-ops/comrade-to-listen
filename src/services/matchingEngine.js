import { findRankedListeners } from "./matching";
import { createChatRoom } from "./chatService";

import {
  assignRoom,
  reserveWaitingUser,
  releaseWaitingUser,
} from "./firestoreService";

const RETRY_DELAY = 1000;
const MAX_WAIT = 60000;

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
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_WAIT) {
    if (signal?.aborted) {
      return { success: false, reason: "ABORTED" };
    }

    let reservedListener = null;

    try {
      const rankedListeners = await findRankedListeners({
        uid: supportUser.uid,
        ...supportProfile,
      });

      if (!rankedListeners.length) {
        console.log("No listener yet. Retrying...");
        try {
          await sleep(RETRY_DELAY, signal);
        } catch (err) {
          if (err && err.message === "ABORTED") {
            return { success: false, reason: "ABORTED" };
          }
        }
        continue;
      }

      for (const candidate of rankedListeners) {
        if (signal?.aborted) {
          return { success: false, reason: "ABORTED" };
        }

        const { listener, score } = candidate;

        reservedListener = null;

        try {
          await reserveWaitingUser(listener.uid);

          reservedListener = listener;

          const { roomId } = await createChatRoom(
            {
              uid: supportUser.uid,
              ...supportProfile,
            },
            listener,
            score
          );

          if (signal?.aborted) {
            // release the reserved listener before exiting
            try {
              await releaseWaitingUser(reservedListener.uid);
            } catch (_) {}

            return { success: false, reason: "ABORTED" };
          }

          await Promise.all([
            assignRoom(supportUser.uid, roomId),
            assignRoom(listener.uid, roomId),
          ]);

          console.log("Match successful");

          return {
            success: true,
            roomId,
            listener,
            score,
          };
        } catch (err) {
          if (!reservedListener) {
            continue;
          }

          try {
            await releaseWaitingUser(reservedListener.uid);
          } catch (_) {}

          reservedListener = null;
        }
      }

      console.log("Listeners busy. Retrying...");
      try {
        await sleep(RETRY_DELAY, signal);
      } catch (err) {
        if (err && err.message === "ABORTED") {
          return { success: false, reason: "ABORTED" };
        }
      }
    } catch (error) {
      if (reservedListener) {
        try {
          await releaseWaitingUser(reservedListener.uid);
        } catch (_) {}
      }

      console.error(error);

      try {
        await sleep(RETRY_DELAY, signal);
      } catch (err) {
        if (err && err.message === "ABORTED") {
          return { success: false, reason: "ABORTED" };
        }
      }
    }
  }

  return {
    success: false,
    reason: "TIMEOUT",
  };
}