import {
  collection,
  doc,
  addDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";
import { translateMessage } from "./translationService";

/*
|--------------------------------------------------------------------------
| Send Message
|--------------------------------------------------------------------------
*/

export async function sendMessage(roomId, message) {
  if (!roomId) {
    throw new Error("Chat room ID is required.");
  }

  // Prevent sending to a room that's already ended.
  const roomRef = doc(db, "chatRooms", roomId);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) {
    throw new Error("Chat room not found.");
  }

  const roomData = roomSnap.data();
  if (roomData.status === "ended") {
    throw new Error("Cannot send message: conversation has ended.");
  }

  const senderId = message.senderId;
  const receiverId = roomData.users?.find((userId) => userId !== senderId);

  const senderLanguage =
    roomData.userLanguages?.[senderId] || "";
  const receiverLanguage =
    roomData.userLanguages?.[receiverId] || "";

  let translatedText = "";
  if (
    senderLanguage &&
    receiverLanguage &&
    senderLanguage !== receiverLanguage
  ) {
    const translationResult = await translateMessage(
      message.text,
      senderLanguage,
      receiverLanguage
    );
    translatedText = translationResult.translatedText;
  }

  const messagesRef = collection(
    db,
    "chatRooms",
    roomId,
    "messages"
  );

  await addDoc(messagesRef, {
    senderId: message.senderId,
    text: message.text,
    translatedText,
    language: message.language || "",
    read: false,
    createdAt: serverTimestamp(),
  });

  // Update chat room metadata
  await updateDoc(roomRef, {
    lastMessage: message.text,
    lastMessageAt: serverTimestamp(),
  });
}

/*
|--------------------------------------------------------------------------
| Subscribe to Messages (Realtime)
|--------------------------------------------------------------------------
*/

export function subscribeToMessages(roomId, callback) {
  if (!roomId) return () => {};

  const messagesRef = collection(
    db,
    "chatRooms",
    roomId,
    "messages"
  );

  const q = query(
    messagesRef,
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    // realtime snapshot received; map documents to messages

    const messages = snapshot.docs.map((d) => {
      const data = d.data();

      const createdAt = data.createdAt && typeof data.createdAt.toDate === "function"
        ? data.createdAt.toDate().getTime()
        : typeof data.createdAt === "number"
          ? data.createdAt
          : Date.now();

      return {
        id: d.id,
        ...data,
        createdAt,
      };
    });

    callback(messages);
  });
}

/*
|--------------------------------------------------------------------------
| Mark Messages as Read
|--------------------------------------------------------------------------
*/

export async function markMessagesRead(
  roomId,
  messages,
  currentUserId
) {
  const unread = messages.filter(
    (msg) =>
      msg.senderId !== currentUserId &&
      msg.read === false
  );

  await Promise.all(
    unread.map((msg) =>
      updateDoc(
        doc(
          db,
          "chatRooms",
          roomId,
          "messages",
          msg.id
        ),
        {
          read: true,
        }
      )
    )
  );
}

/*
|--------------------------------------------------------------------------
| Typing Indicator (Future)
|--------------------------------------------------------------------------
*/

export async function updateTypingStatus(
  roomId,
  userId,
  typing
) {
  const roomRef = doc(db, "chatRooms", roomId);

  await updateDoc(roomRef, {
    [`typing.${userId}`]: typing,
  });
}
