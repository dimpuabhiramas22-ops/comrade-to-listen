import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../../firebase";

export async function updateQueueMetadata(uid, updates = {}) {
  if (!uid) return null;

  const waitingRef = doc(db, "waitingUsers", uid);
  const existingSnapshot = await getDoc(waitingRef);
  const existingData = existingSnapshot.exists() ? existingSnapshot.data() : {};

  await setDoc(
    waitingRef,
    {
      ...existingData,
      ...updates,
      updatedAt: serverTimestamp(),
      userType: existingData.userType || updates.userType || null,
      language: existingData.language || updates.language || "",
      problem: existingData.problem || updates.problem || "",
      listenerRoles: existingData.listenerRoles || updates.listenerRoles || [],
      topics: existingData.topics || updates.topics || [],
    },
    { merge: true }
  );

  return true;
}

export async function markQueueRetry(uid, retryCount = 0) {
  if (!uid) return null;

  const waitingRef = doc(db, "waitingUsers", uid);

  const snapshot = await getDoc(waitingRef);

  if (!snapshot.exists()) {
    return null;
  }

  const nextRetryCount = Math.max(retryCount, (snapshot.data().retryCount || 0) + 1);
  const existingData = snapshot.data();

  await setDoc(
    waitingRef,
    {
      ...existingData,
      retryCount: nextRetryCount,
      updatedAt: serverTimestamp(),
      userType: existingData.userType || null,
      language: existingData.language || "",
      problem: existingData.problem || "",
      listenerRoles: existingData.listenerRoles || [],
      topics: existingData.topics || [],
    },
    { merge: true }
  );

  return nextRetryCount;
}

export async function cancelQueueSearch(uid) {
  if (!uid) return null;

  const waitingRef = doc(db, "waitingUsers", uid);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(waitingRef);

    if (!snapshot.exists()) {
      return;
    }

    transaction.update(waitingRef, {
      cancelled: true,
      status: "cancelled",
      updatedAt: serverTimestamp(),
      queuePosition: 0,
      estimatedWait: 0,
    });
  });

  return true;
}

export async function clearQueueCancellation(uid) {
  if (!uid) return null;

  const waitingRef = doc(db, "waitingUsers", uid);
  const existingSnapshot = await getDoc(waitingRef);
  const existingData = existingSnapshot.exists() ? existingSnapshot.data() : {};

  await setDoc(
    waitingRef,
    {
      ...existingData,
      cancelled: false,
      updatedAt: serverTimestamp(),
      userType: existingData.userType || null,
      language: existingData.language || "",
      problem: existingData.problem || "",
      listenerRoles: existingData.listenerRoles || [],
      topics: existingData.topics || [],
    },
    { merge: true }
  ).catch(() => {});

  return true;
}

export async function syncQueueState(uid, state = {}) {
  if (!uid) return null;

  const waitingRef = doc(db, "waitingUsers", uid);
  const existingSnapshot = await getDoc(waitingRef);
  const existingData = existingSnapshot.exists() ? existingSnapshot.data() : {};

  await setDoc(
    waitingRef,
    {
      ...existingData,
      ...state,
      updatedAt: serverTimestamp(),
      userType: existingData.userType || null,
      language: existingData.language || "",
      problem: existingData.problem || "",
      listenerRoles: existingData.listenerRoles || [],
      topics: existingData.topics || [],
    },
    { merge: true }
  );

  return true;
}

export function buildQueueSnapshot(userDoc, userType, queueUsers = []) {
  const normalizedUserType = userDoc?.userType || userType;
  const entries = queueUsers.filter((entry) => {
    if (!entry?.uid) return false;
    if (entry.userType !== normalizedUserType) return false;
    if (entry.cancelled) return false;
    return ["waiting", "reserved"].includes(entry.status);
  });

  const sortedEntries = [...entries].sort((a, b) => {
    const aTime = a.createdAt?.seconds ?? 0;
    const bTime = b.createdAt?.seconds ?? 0;
    return aTime - bTime;
  });

  const currentIndex = sortedEntries.findIndex((entry) => entry.uid === userDoc?.uid);
  const queuePosition = currentIndex >= 0 ? currentIndex + 1 : Math.max(1, sortedEntries.length + 1);
  const activeTargets = normalizedUserType === "support"
    ? queueUsers.filter((entry) => entry.userType === "listener" && !entry.cancelled && ["waiting", "reserved"].includes(entry.status)).length
    : queueUsers.filter((entry) => entry.userType === "support" && !entry.cancelled && ["waiting", "reserved"].includes(entry.status)).length;

  const baseEstimate = Math.max(20, queuePosition * 20 + Math.max(5, 60 - activeTargets * 10));
  const estimatedWait = Math.min(240, baseEstimate);

  return {
    queuePosition,
    estimatedWait,
    activeTargets,
  };
}
