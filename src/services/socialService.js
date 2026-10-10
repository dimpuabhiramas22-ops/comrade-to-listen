import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../firebase";

function validateSocialAction(action) {
  if (!action?.type) {
    throw new Error("Action type is required.");
  }

  if (!action?.fromUserId || !action?.toUserId) {
    throw new Error("Both users are required for this action.");
  }

  if (!action?.roomId) {
    throw new Error("A room id is required for this action.");
  }
}

export async function createSocialAction(action) {
  validateSocialAction(action);

  const payload = {
    type: action.type,
    fromUserId: action.fromUserId,
    toUserId: action.toUserId,
    roomId: action.roomId,
    metadata: action.metadata || {},
    createdAt: serverTimestamp(),
    status: "queued",
  };

  const ref = await addDoc(collection(db, "socialActions"), payload);

  return { id: ref.id, ...payload };
}
