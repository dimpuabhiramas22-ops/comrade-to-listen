import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

import { auth, db } from "../firebase";

import {
  removeWaitingUser,
} from "./firestoreService";

/**
 * End an active chat.
 */
export async function endChat(roomId) {
  if (!roomId) {
    throw new Error("Room ID is required.");
  }

  const roomRef = doc(db, "chatRooms", roomId);

  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error("Chat room not found.");
  }

  const room = roomSnap.data();

  // Already ended
  if (room.status === "ended") {
    return;
  }

  const currentUser = auth.currentUser;

  await updateDoc(roomRef, {
    status: "ended",
    endedBy: currentUser?.uid || null,
    endedAt: serverTimestamp(),
    lastMessage: "Conversation ended.",
    lastMessageAt: serverTimestamp(),
  });

  // Cleanup waiting queue
  if (Array.isArray(room.users)) {
    await Promise.all(
      room.users.map(async (uid) => {
        try {
          await removeWaitingUser(uid);
        } catch (err) {
          // Ignore cleanup failures
          console.warn(
            `Failed to remove waiting user ${uid}`,
            err
          );
        }
      })
    );
  }
}

/**
 * Listen to room changes.
 * Used to detect when the conversation ends.
 */
export function subscribeToRoom(roomId, callback) {
  if (!roomId) return () => {};

  const roomRef = doc(db, "chatRooms", roomId);

  return onSnapshot(roomRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    callback({
      id: snapshot.id,
      ...snapshot.data(),
    });
  });
}

/**
 * Returns the current room document.
 */
export async function getRoom(roomId) {
  const roomRef = doc(db, "chatRooms", roomId);

  const snap = await getDoc(roomRef);

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data(),
  };
}