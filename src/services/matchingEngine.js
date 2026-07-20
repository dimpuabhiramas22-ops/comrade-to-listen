import { findBestListener } from "./matching";
import { createChatRoom } from "./chatService";

import {
  assignRoom,
  removeWaitingUser,
  reserveWaitingUser,
  releaseWaitingUser,
} from "./firestoreService";

/**
 * Matching Engine V2
 *
 * Responsibilities:
 * - Find the best listener
 * - Reserve the listener safely
 * - Create a chat room
 * - Assign the room to both users
 * - Remove both users from the waiting queue
 */

export async function startMatching(
  supportUser,
  supportProfile
) {
  let reservedListener = null;

  try {
    // Find the best available listener
    const { listener, score } =
      await findBestListener(supportProfile);

    if (!listener) {
      return {
        success: false,
        reason: "NO_LISTENER",
      };
    }

    reservedListener = listener;

    // Try reserving the listener
    try {
      await reserveWaitingUser(listener.uid);
    } catch (error) {
      return {
        success: false,
        reason: "LISTENER_ALREADY_RESERVED",
      };
    }

    // Create a new chat room
    const { roomId } =
      await createChatRoom(
        {
          uid: supportUser.uid,
          ...supportProfile,
        },
        listener,
        score
      );

    // Assign room to both users
    await Promise.all([
      assignRoom(supportUser.uid, roomId),
      assignRoom(listener.uid, roomId),
    ]);

    // Remove both users from waiting queue
    await Promise.all([
      removeWaitingUser(supportUser.uid),
      removeWaitingUser(listener.uid),
    ]);

    return {
      success: true,
      roomId,
      listener,
      score,
    };
  } catch (error) {
    console.error(
      "Matching Engine Error:",
      error
    );

    // Release reservation if something failed
    if (reservedListener) {
      try {
        await releaseWaitingUser(
          reservedListener.uid
        );
      } catch (releaseError) {
        console.error(
          "Failed to release listener:",
          releaseError
        );
      }
    }

    return {
      success: false,
      reason: "MATCH_FAILED",
      error,
    };
  }
}