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

  const docRef = await addDoc(messagesRef, {
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
    // realtime snapshot received; map documents to messages

    const messages = snapshot.docs.map((d) => {
      const data = d.data();

      let createdAt = null;

      // Firestore Timestamp -> ms
      if (data.createdAt && typeof data.createdAt.toDate === "function") {
        createdAt = data.createdAt.toDate().getTime();
      } else if (typeof data.createdAt === "number") {
        // already a millis value
        createdAt = data.createdAt;
      } else {
        // fallback when missing
        createdAt = Date.now();
      }

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