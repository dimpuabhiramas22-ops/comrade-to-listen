import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";

import { db } from "../firebase";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableTransactionError(error) {
  const code = error?.code || "";
  const message = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();

  return (
    code === "aborted" ||
    code === "failed-precondition" ||
    code === "resource-exhausted" ||
    message.includes("stored version") ||
    message.includes("version mismatch") ||
    message.includes("retry") ||
    message.includes("commit")
  );
}

async function runWithTransactionRetry(operation, uid = null, releaseOnFailure = false) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await runTransaction(db, operation);
    } catch (error) {
      if (attempt < 2 && isRetryableTransactionError(error)) {
        await delay(100 * (attempt + 1));
        continue;
      }

      if (releaseOnFailure && uid) {
        try {
          await releaseWaitingUser(uid);
        } catch {
          // Best-effort cleanup; retain the original transaction error.
        }
      }

      throw error;
    }
  }
}

function normalizeWaitingUser(user) {
  if (!user || !user.uid) {
    throw new Error("A valid user id is required.");
  }

  const normalized = {
    uid: user.uid,
    userType: user.userType || null,
    language: user.language || "",
    problem: user.problem || "",
    emotion: user.emotion || "",
    preferredRole: user.preferredRole || "",
    listenerRoles: Array.isArray(user.listenerRoles) ? user.listenerRoles : [],
    topics: Array.isArray(user.topics) ? user.topics : [],
  };

  return normalized;
}

export async function addWaitingUser(user) {
  const normalizedUser = normalizeWaitingUser(user);
  const ref = doc(db, "waitingUsers", normalizedUser.uid);
  const existingSnapshot = await getDoc(ref);
  const existingData = existingSnapshot.exists() ? existingSnapshot.data() : {};

  await setDoc(
    ref,
    {
      ...existingData,
      ...normalizedUser,
      status: "waiting",
      assignedRoom: null,
      cancelled: false,
      joinedAt: existingData.joinedAt || serverTimestamp(),
      createdAt: existingData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
      queuePosition: existingData.queuePosition || 1,
      estimatedWait: existingData.estimatedWait || 30,
      retryCount: existingData.retryCount || 0,
      userType: normalizedUser.userType,
    },
    {
      merge: true,
    }
  );

  const writtenSnapshot = await getDoc(ref);
  console.log("[firestoreService] addWaitingUser wrote waitingUsers document", {
    id: writtenSnapshot.id,
    data: writtenSnapshot.exists() ? writtenSnapshot.data() : null,
  });
}

export async function removeWaitingUser(uid) {
  if (!uid) return;
  await deleteDoc(doc(db, "waitingUsers", uid));
}

export async function getWaitingUser(uid) {
  const snapshot = await getDoc(doc(db, "waitingUsers", uid));

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function assignRoom(uid, roomId) {
  const waitingRef = doc(db, "waitingUsers", uid);

  await runWithTransactionRetry(async (transaction) => {
    const snapshot = await transaction.get(waitingRef);

    if (!snapshot.exists()) {
      throw new Error("Waiting user not found");
    }

    transaction.update(waitingRef, {
      assignedRoom: roomId,
      status: "matched",
      updatedAt: serverTimestamp(),
    });
  }, uid);
}

export async function clearAssignedRoom(uid) {
  const waitingRef = doc(db, "waitingUsers", uid);

  await runWithTransactionRetry(async (transaction) => {
    const snapshot = await transaction.get(waitingRef);

    if (!snapshot.exists()) {
      return;
    }

    const data = snapshot.data();

    if (data.status === "matched") {
      return;
    }

    transaction.update(waitingRef, {
      assignedRoom: null,
      status: "waiting",
      cancelled: data.cancelled ? data.cancelled : false,
      updatedAt: serverTimestamp(),
    });
  }, uid);
}

export async function reserveWaitingUser(uid, reservedBy = null) {
  const waitingRef = doc(db, "waitingUsers", uid);

  return await runWithTransactionRetry(async (transaction) => {
    const snapshot = await transaction.get(waitingRef);

    if (!snapshot.exists()) {
      throw new Error("Waiting user not found");
    }

    const data = snapshot.data();

    if (data.cancelled) {
      throw new Error("Queue cancelled");
    }

    if (data.status !== "waiting") {
      throw new Error("Listener already reserved");
    }

    transaction.update(waitingRef, {
      status: "reserved",
      reservedBy: reservedBy || null,
      reservedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return true;
  }, uid, true);
}

export async function releaseWaitingUser(uid) {
  const waitingRef = doc(db, "waitingUsers", uid);

  await runWithTransactionRetry(async (transaction) => {
    const snapshot = await transaction.get(waitingRef);

    if (!snapshot.exists()) {
      return;
    }

    const data = snapshot.data();

    if (data.status !== "reserved") {
      return;
    }

    transaction.update(waitingRef, {
      status: "waiting",
      reservedBy: null,
      reservedAt: null,
      updatedAt: serverTimestamp(),
    });
  }, uid);
}

export async function updateWaitingUser(uid, updates = {}) {
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

export async function getWaitingListeners() {
  const q = query(
    collection(db, "waitingUsers"),
    where("userType", "==", "listener"),
    where("status", "==", "waiting")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getWaitingSupportUsers() {
  const q = query(
    collection(db, "waitingUsers"),
    where("userType", "==", "support"),
    where("status", "==", "waiting")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export function watchWaitingUser(uid, callback) {
  return onSnapshot(doc(db, "waitingUsers", uid), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    callback({
      id: snapshot.id,
      ...snapshot.data(),
    });
  });
}

export function watchWaitingListeners(callback) {
  const q = query(
    collection(db, "waitingUsers"),
    where("userType", "==", "listener"),
    where("status", "==", "waiting")
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

export function watchWaitingSupport(callback) {
  const q = query(
    collection(db, "waitingUsers"),
    where("userType", "==", "support"),
    where("status", "==", "waiting")
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

function buildConversationId() {
  return `CMR-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

/**
 * Atomically claims a listener, creates a room, and assigns both queue entries.
 * A transaction makes competing support users deterministic: only one can turn
 * the same listener from `waiting` into `matched`.
 */
export async function claimListenerAndCreateRoom(supportUser, listener, matchScore) {
  if (!supportUser?.uid || !listener?.uid || supportUser.uid === listener.uid) {
    return null;
  }

  const supportRef = doc(db, "waitingUsers", supportUser.uid);
  const listenerRef = doc(db, "waitingUsers", listener.uid);
  const roomRef = doc(collection(db, "chatRooms"));

  return runWithTransactionRetry(async (transaction) => {
    const [supportSnapshot, listenerSnapshot] = await Promise.all([
      transaction.get(supportRef),
      transaction.get(listenerRef),
    ]);

    if (!supportSnapshot.exists() || !listenerSnapshot.exists()) return null;

    const support = supportSnapshot.data();
    const availableListener = listenerSnapshot.data();
    const canMatch =
      support.userType === "support" &&
      support.status === "waiting" &&
      !support.cancelled &&
      support.assignedRoom == null &&
      availableListener.userType === "listener" &&
      availableListener.status === "waiting" &&
      !availableListener.cancelled &&
      availableListener.assignedRoom == null;

    if (!canMatch) return null;

    const roomData = {
      roomId: roomRef.id,
      conversationId: buildConversationId(),
      matchKey: [supportUser.uid, listener.uid].sort().join("_"),
      users: [supportUser.uid, listener.uid],
      supportUser: {
        uid: supportUser.uid,
        language: support.language || "",
        problem: support.problem || "",
        emotion: support.emotion || "",
        preferredRole: support.preferredRole || "",
      },
      listener: {
        uid: listener.uid,
        language: availableListener.language || "",
        listenerRoles: availableListener.listenerRoles || [],
        topics: availableListener.topics || [],
      },
      matchScore,
      status: "active",
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastMessageAt: null,
      typing: {},
      unreadCount: { [supportUser.uid]: 0, [listener.uid]: 0 },
    };

    transaction.set(roomRef, roomData);
    transaction.update(supportRef, {
      assignedRoom: roomRef.id,
      status: "matched",
      reservedBy: null,
      reservedAt: null,
      updatedAt: serverTimestamp(),
    });
    transaction.update(listenerRef, {
      assignedRoom: roomRef.id,
      status: "matched",
      reservedBy: null,
      reservedAt: null,
      updatedAt: serverTimestamp(),
    });

    return { roomId: roomRef.id, roomData };
  });
}
