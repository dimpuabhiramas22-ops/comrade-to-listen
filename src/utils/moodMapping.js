import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";

import { auth, db } from "../firebase";

export async function joinWaitingQueue(language, role, mood) {
  const ref = await addDoc(collection(db, "waitingUsers"), {
    uid: auth.currentUser.uid,
    language,
    role,
    mood,
    status: "waiting",
    createdAt: serverTimestamp(),
  });

  return ref.id;
}

export async function findMatch(language, role, mood) {
  const waitingQuery = query(
    collection(db, "waitingUsers"),
    where("status", "==", "waiting"),
    where("role", "==", role),
    where("mood", "==", mood)
  );

  const snapshot = await getDocs(waitingQuery);

  for (const candidate of snapshot.docs) {
    const candidateData = candidate.data();

    if (candidateData.uid === auth.currentUser.uid) continue;

    try {
      const result = await runTransaction(db, async (transaction) => {
        const candidateRef = doc(db, "waitingUsers", candidate.id);
        const candidateSnap = await transaction.get(candidateRef);

        if (!candidateSnap.exists()) return null;

        const latest = candidateSnap.data();

        if (latest.status !== "waiting") return null;

        transaction.update(candidateRef, {
          status: "matched",
        });

        const roomRef = doc(collection(db, "chatRooms"));

        transaction.set(roomRef, {
          users: [auth.currentUser.uid, latest.uid],
          userLanguages: {
            [auth.currentUser.uid]: language,
            [latest.uid]: latest.language,
          },
          role,
          mood,
          createdAt: serverTimestamp(),
        });

        return {
          roomId: roomRef.id,
          partner: "Anonymous Listener",
        };
      });

      if (result) {
        return result;
      }
    } catch (err) {
      console.error(err);
    }
  }

  return null;
}

export async function leaveQueue(queueId) {
  if (!queueId) return;

  try {
    await deleteDoc(doc(db, "waitingUsers", queueId));
  } catch (err) {
    console.log(err);
  }
}