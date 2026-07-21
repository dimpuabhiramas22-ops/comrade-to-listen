import { getWaitingUser } from "./firestoreService";

/**
 * Restore the user's previous waiting session.
 * Returns the complete waitingUsers document or null.
 */
export async function restoreSession(uid) {
  const waitingUser = await getWaitingUser(uid);

  if (!waitingUser) {
    return null;
  }

  return waitingUser;
}