import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";
import { translateMessage } from "./translationService";

export function listenForMessages(roomId, callback) {
  const q = query(
    collection(db, "chatRooms", roomId, "messages"),
    orderBy("createdAt")
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  });
}

export async function sendMessage(roomId, text) {
  if (!text.trim()) return;

  const roomRef = doc(db, "chatRooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) return;

  const room = roomSnap.data();

  const sender = auth.currentUser.uid;

  const senderLanguage = room.userLanguages[sender];

  const receiver = room.users.find((u) => u !== sender);

  const receiverLanguage = room.userLanguages[receiver];

  const translationResult = await translateMessage(
    text,
    senderLanguage,
    receiverLanguage
  );

  await addDoc(collection(db, "chatRooms", roomId, "messages"), {
    sender,

    originalText: text,

    translatedText: translationResult.translatedText,

    senderLanguage,

    receiverLanguage,

    createdAt: serverTimestamp(),
  });
}