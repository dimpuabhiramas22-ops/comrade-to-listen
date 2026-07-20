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

/*
|--------------------------------------------------------------------------
| Add Waiting User
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Remove Waiting User
|--------------------------------------------------------------------------
*/

export async function removeWaitingUser(uid) {
  await deleteDoc(doc(db, "waitingUsers", uid));
}

/*
|--------------------------------------------------------------------------
| Get Waiting User
|--------------------------------------------------------------------------
*/

export async function getWaitingUser(uid) {
  const snapshot = await getDoc(
    doc(db, "waitingUsers", uid)
  );

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

/*
|--------------------------------------------------------------------------
| Assign Room
|--------------------------------------------------------------------------
*/

export async function assignRoom(uid, roomId) {
  await updateDoc(doc(db, "waitingUsers", uid), {
    assignedRoom: roomId,
    status: "matched",
    updatedAt: serverTimestamp(),
  });
}

/*
|--------------------------------------------------------------------------
| Clear Assigned Room
|--------------------------------------------------------------------------
*/

export async function clearAssignedRoom(uid) {
  await updateDoc(doc(db, "waitingUsers", uid), {
    assignedRoom: null,
    status: "waiting",
    updatedAt: serverTimestamp(),
  });
}

/*
|--------------------------------------------------------------------------
| Reserve Waiting User
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Release Reservation
|--------------------------------------------------------------------------
*/

export async function releaseWaitingUser(uid) {
  await updateDoc(doc(db, "waitingUsers", uid), {
    status: "waiting",
    updatedAt: serverTimestamp(),
  });
}

/*
|--------------------------------------------------------------------------
| Get Waiting Listeners
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Get Waiting Support Users
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Watch Waiting User
|--------------------------------------------------------------------------
*/

export function watchWaitingUser(uid, callback) {
  return onSnapshot(
    doc(db, "waitingUsers", uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      callback({
        id: snapshot.id,
        ...snapshot.data(),
      });
    }
  );
}

/*
|--------------------------------------------------------------------------
| Watch Waiting Listeners
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Watch Waiting Support Users
|--------------------------------------------------------------------------
*/

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