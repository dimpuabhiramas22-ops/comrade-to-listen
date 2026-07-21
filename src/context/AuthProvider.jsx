import {
  createContext,
  useContext,
  useEffect,
} from "react";

import {
  onAuthStateChanged,
  signInAnonymously,
} from "firebase/auth";

import { auth } from "../firebase";

import { useAppContext } from "./AppContext";

import { restoreSession } from "../services/sessionService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const {
    setCurrentUser,

    setChatRoom,

    setLoading,

    setError,

    setUserType,

    setSupportProfile,

    setListenerProfile,
  } = useAppContext();

  useEffect(() => {
    let unsubscribe;

    async function initialize() {
      setLoading(true);

      try {
        // Anonymous login
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }

        unsubscribe = onAuthStateChanged(
          auth,
          async (user) => {
            setCurrentUser(user);

            if (!user) {
              setLoading(false);
              return;
            }

            try {
              const waitingUser =
                await restoreSession(user.uid);

              if (waitingUser) {
                // Restore user flow
                setUserType(waitingUser.userType);

                if (
                  waitingUser.userType === "support"
                ) {
                  setSupportProfile({
                    language:
                      waitingUser.language || "",

                    problem:
                      waitingUser.problem || "",

                    emotion:
                      waitingUser.emotion || "",

                    preferredRole:
                      waitingUser.preferredRole || "",
                  });
                } else if (
                  waitingUser.userType === "listener"
                ) {
                  setListenerProfile({
                    language:
                      waitingUser.language || "",

                    listenerRoles:
                      waitingUser.listenerRoles || [],

                    topics:
                      waitingUser.topics || [],
                  });
                }

                // Restore active chat
                if (waitingUser.assignedRoom) {
                  setChatRoom(
                    waitingUser.assignedRoom
                  );
                }
              }
            } catch (error) {
              setError(
                error.message ||
                  "Failed to restore session"
              );
            }

            setLoading(false);
          }
        );
      } catch (error) {
        setError(
          error.message ||
            "Authentication failed"
        );

        setLoading(false);
      }
    }

    initialize();

    return () => {
      unsubscribe?.();
    };
  }, [
    setCurrentUser,
    setChatRoom,
    setLoading,
    setError,
    setUserType,
    setSupportProfile,
    setListenerProfile,
  ]);

  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}