import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { storage } from "../firebase";

export async function uploadVoiceMessage(roomId, userId, audioBlob) {
  if (!roomId || !userId || !audioBlob) {
    throw new Error("Voice message details are missing.");
  }

  const extension = audioBlob.type.includes("ogg") ? "ogg" : "webm";
  const audioRef = ref(storage, `voiceMessages/${roomId}/${userId}/${Date.now()}.${extension}`);
  await uploadBytes(audioRef, audioBlob, { contentType: audioBlob.type || "audio/webm" });
  return getDownloadURL(audioRef);
}
