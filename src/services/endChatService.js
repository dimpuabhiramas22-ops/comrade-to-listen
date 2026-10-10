import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";

import { auth, db } from "../firebase";

import {
  removeWaitingUser,
  updateWaitingUser,
} from "./firestoreService";

/**
 * End an active chat.
 */
export async function endChat(roomId) {
  if (!roomId) {
    throw new Error("Room ID is required.");
  }

  const roomRef = doc(db, "chatRooms", roomId);

  const currentUser = auth.currentUser;

  const room = await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);

    if (!roomSnap.exists()) {
      throw new Error("Chat room not found.");
    }

    const roomData = roomSnap.data();

    if (roomData.status === "ended") {
      return roomData;
    }

    transaction.update(roomRef, {
      status: "ended",
      endedBy: currentUser?.uid || null,
      endedAt: serverTimestamp(),
      lastMessage: "Conversation ended.",
      lastMessageAt: serverTimestamp(),
    });

    return roomData;
  });

  if (room.status === "ended") {
    // Still clean up state for an already-ended room.
  }

  // Cleanup waiting queue
  if (Array.isArray(room.users)) {
    await Promise.all(
      room.users.map(async (uid) => {
        try {
          await updateWaitingUser(uid, {
            assignedRoom: null,
            status: "waiting",
            cancelled: false,
            reservedBy: null,
            reservedAt: null,
          });
          await removeWaitingUser(uid);
        } catch (err) {
          console.warn(
            `Failed to clean up waiting user ${uid}`,
            err
          );
        }
      })
    );
  }

  try {
    await deleteDoc(roomRef);
  } catch (err) {
    console.warn("Failed to delete ended room", roomId, err);
  }

  // Add a system message to the messages subcollection so the other participant sees the end notice.
  try {
    const messagesRef = collection(
      db,
      "chatRooms",
      roomId,
      "messages"
    );

    await addDoc(messagesRef, {
      senderId: null,
      text: "Conversation ended.",
      translatedText: "",
      language: "",
      read: true,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Failed to add end-message to room", roomId, err);
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
