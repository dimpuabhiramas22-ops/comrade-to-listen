import {
  collection, doc, addDoc, getDoc, onSnapshot, query, orderBy,
  serverTimestamp, updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";
import { translateMessage } from "./translationService";

export async function sendMessage(roomId, message) {
  if (!roomId) throw new Error("Chat room ID is required.");

  const roomRef = doc(db, "chatRooms", roomId);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) throw new Error("Chat room not found.");

  const roomData = roomSnap.data();
  if (roomData.status === "ended") {
    throw new Error("Cannot send message: conversation has ended.");
  }

  const isVoice = message.type === "voice";
  const senderId = message.senderId;
  const receiverId = roomData.users?.find((userId) => userId !== senderId);
  const senderLanguage = roomData.userLanguages?.[senderId] || "";
  const receiverLanguage = roomData.userLanguages?.[receiverId] || "";

  let translatedText = "";
  if (!isVoice && message.text && senderLanguage && receiverLanguage && senderLanguage !== receiverLanguage) {
    const translationResult = await translateMessage(message.text, senderLanguage, receiverLanguage);
    translatedText = translationResult.translatedText;
  }

  await addDoc(collection(db, "chatRooms", roomId, "messages"), {
    senderId,
    text: message.text || "",
    translatedText,
    language: message.language || "",
    type: isVoice ? "voice" : "text",
    audioUrl: isVoice ? message.audioUrl : "",
    audioDuration: isVoice ? message.audioDuration || 0 : 0,
    read: false,
    createdAt: serverTimestamp(),
  });

  await updateDoc(roomRef, {
    lastMessage: isVoice ? "🎤 Voice message" : message.text,
    lastMessageAt: serverTimestamp(),
  });
}

export function subscribeToMessages(roomId, callback) {
  if (!roomId) return () => {};
  const q = query(collection(db, "chatRooms", roomId, "messages"), orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => {
      const data = d.data();
      const createdAt = data.createdAt && typeof data.createdAt.toDate === "function"
        ? data.createdAt.toDate().getTime()
        : typeof data.createdAt === "number" ? data.createdAt : Date.now();
      return { id: d.id, ...data, createdAt };
    }));
  });
}

export async function markMessagesRead(roomId, messages, currentUserId) {
  const unread = messages.filter((msg) => msg.senderId !== currentUserId && msg.read === false);
  await Promise.all(unread.map((msg) => updateDoc(doc(db, "chatRooms", roomId, "messages", msg.id), { read: true })));
}

export async function updateTypingStatus(roomId, userId, typing) {
  await updateDoc(doc(db, "chatRooms", roomId), { [`typing.${userId}`]: typing });
}