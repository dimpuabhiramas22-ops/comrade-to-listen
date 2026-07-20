import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase";

/**
 * Creates a brand-new chat room.
 * This function ONLY creates the room.
 * It does not assign users or navigate.
 */
export async function createChatRoom(
  supportUser,
  listener,
  matchScore
) {
  const roomRef = doc(collection(db, "chatRooms"));

  const roomData = {
    roomId: roomRef.id,

    users: [
      supportUser.uid,
      listener.uid,
    ],

    supportUser: {
      uid: supportUser.uid,
      language: supportUser.language,
      problem: supportUser.problem,
      emotion: supportUser.emotion,
      preferredRole: supportUser.preferredRole,
    },

    listener: {
      uid: listener.uid,
      language: listener.language,
      listenerRoles: listener.listenerRoles,
      topics: listener.topics,
    },

    matchScore,

    status: "active",

    createdAt: serverTimestamp(),

    lastMessage: "",
    lastMessageAt: null,

    typing: {},

    unreadCount: {
      [supportUser.uid]: 0,
      [listener.uid]: 0,
    },
  };

  await setDoc(roomRef, roomData);

  return {
    roomId: roomRef.id,
    roomData,
  };
}