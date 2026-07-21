import { findRankedListeners } from "./matching";
import { createChatRoom } from "./chatService";

import {
  assignRoom,
  reserveWaitingUser,
  releaseWaitingUser,
} from "./firestoreService";

/**
 * Matching Engine V3
 *
 * Improvements
 * - Tries ranked listeners sequentially
 * - Removes race condition caused by restarting matching
 * - Automatically retries reservation
 * - Releases reservation if room creation fails
 * - Keeps Firestore schema unchanged
 * - No debug logging
 */

export async function startMatching(
  supportUser,
  supportProfile
) {
  let reservedListener = null;

  try {
    const rankedListeners = await findRankedListeners({
      uid: supportUser.uid,
      ...supportProfile,
    });

    if (!rankedListeners.length) {
      return {
        success: false,
        reason: "NO_LISTENER",
      };
    }

    for (const candidate of rankedListeners) {
      const { listener, score } = candidate;

      reservedListener = null;

      try {
        // Transactional reservation.
        // If another support user already reserved this listener,
        // reserveWaitingUser() throws and we simply try the next one.
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

        await Promise.all([
          assignRoom(supportUser.uid, roomId),
          assignRoom(listener.uid, roomId),
        ]);

        return {
          success: true,
          roomId,
          listener,
          score,
        };
      } catch (error) {
        // Reservation failed because another request won the race.
        // Try the next ranked listener.
        if (!reservedListener) {
          continue;
        }

        // Reservation succeeded but something later failed.
        // Release reservation before trying another listener.
        try {
          await releaseWaitingUser(reservedListener.uid);
        } catch (_) {
          // Ignore cleanup errors.
        }

        reservedListener = null;
      }
    }

    // Every candidate became unavailable while matching.
    return {
      success: false,
      reason: "NO_AVAILABLE_LISTENER",
    };
  } catch (error) {
    if (reservedListener) {
      try {
        await releaseWaitingUser(reservedListener.uid);
      } catch (_) {
        // Ignore cleanup errors.
      }
    }

    return {
      success: false,
      reason: "MATCH_FAILED",
      error,
    };
  }
}