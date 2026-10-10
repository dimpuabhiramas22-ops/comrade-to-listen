import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase";

function buildConversationId() {
  const prefix = "CMR";
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${randomPart}-${suffix}`;
}

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

  const matchKey = [supportUser.uid, listener.uid]
    .sort()
    .join("_");

  const conversationId = buildConversationId();

  const roomData = {
    roomId: roomRef.id,
    conversationId,
    matchKey,
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