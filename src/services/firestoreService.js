import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";

import { db } from "../firebase";

export async function addWaitingUser(user) {
  const ref = doc(db, "waitingUsers", user.uid);

  await setDoc(
    ref,
    {
      ...user,
      status: "waiting",
      assignedRoom: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

export async function removeWaitingUser(uid) {
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

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(waitingRef);

    if (!snapshot.exists()) {
      throw new Error("Waiting user not found");
    }

    transaction.update(waitingRef, {
      assignedRoom: roomId,
      status: "matched",
      updatedAt: serverTimestamp(),
    });
  });
}

export async function clearAssignedRoom(uid) {
  const waitingRef = doc(db, "waitingUsers", uid);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(waitingRef);

    if (!snapshot.exists()) {
      return;
    }

    const data = snapshot.data();

    // Don't overwrite an already matched user.
    if (data.status === "matched") {
      return;
    }

    transaction.update(waitingRef, {
      assignedRoom: null,
      status: "waiting",
      updatedAt: serverTimestamp(),
    });
  });
}

export async function reserveWaitingUser(uid) {
  const waitingRef = doc(db, "waitingUsers", uid);

  return await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(waitingRef);

    if (!snapshot.exists()) {
      throw new Error("Waiting user not found");
    }

    const data = snapshot.data();

    if (data.status !== "waiting") {
      throw new Error("Listener already reserved");
    }

    transaction.update(waitingRef, {
      status: "reserved",
      updatedAt: serverTimestamp(),
    });

    return true;
  });
}

export async function releaseWaitingUser(uid) {
  const waitingRef = doc(db, "waitingUsers", uid);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(waitingRef);

    if (!snapshot.exists()) {
      return;
    }

    const data = snapshot.data();

    // Only release if it is still reserved.
    if (data.status !== "reserved") {
      return;
    }

    transaction.update(waitingRef, {
      status: "waiting",
      updatedAt: serverTimestamp(),
    });
  });
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