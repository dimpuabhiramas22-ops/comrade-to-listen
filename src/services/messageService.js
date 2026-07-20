import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";

/*
|--------------------------------------------------------------------------
| Send Message
|--------------------------------------------------------------------------
*/

export async function sendMessage(roomId, message) {
  if (!roomId) {
    throw new Error("Chat room ID is required.");
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
    translatedText: message.translatedText || "",
    language: message.language || "",
    read: false,
    createdAt: serverTimestamp(),
  });

  // Update chat room metadata
  const roomRef = doc(db, "chatRooms", roomId);

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
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),

      createdAt: doc.data().createdAt?.toDate?.()
        ? doc.data().createdAt.toDate().getTime()
        : Date.now(),
    }));

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