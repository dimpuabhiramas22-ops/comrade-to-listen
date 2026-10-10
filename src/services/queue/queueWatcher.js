import { onSnapshot, query, collection, where } from "firebase/firestore";

import { db } from "../../firebase";
import { buildQueueSnapshot, syncQueueState } from "./queueService";

export function watchQueueState(uid, userType, callback) {
  if (!uid) return () => {};

  const waitingUsersRef = collection(db, "waitingUsers");
  const q = query(waitingUsersRef, where("status", "!=", "matched"));

  return onSnapshot(
    q,
    async (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const queueState = buildQueueSnapshot({ uid, userType }, userType, users);

      try {
        await syncQueueState(uid, {
          queuePosition: queueState.queuePosition,
          estimatedWait: queueState.estimatedWait,
        });
      } catch (error) {
        console.warn("Queue watcher sync failed", error);
      }

      callback({
        queuePosition: queueState.queuePosition,
        estimatedWait: queueState.estimatedWait,
        activeTargets: queueState.activeTargets,
        users,
      });
    },
    (error) => {
      console.warn("Queue watcher error", error);
      callback({ queuePosition: 1, estimatedWait: 30, activeTargets: 0, users: [] });
    }
  );
}
