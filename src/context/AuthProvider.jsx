import {
  createContext,
  useContext,
  useEffect,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  onAuthStateChanged,
  signInAnonymously,
} from "firebase/auth";

import { auth } from "../firebase";

import { useAppContext } from "./AppContext";

import { restoreSession } from "../services/sessionService";

const AuthContext = createContext(null);
let authInitializationPromise = null;
let authUnsubscribe = null;

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const {
    userType,
    setCurrentUser,
    setChatRoom,
    setLoading,
    setError,
    setUserType,
    setSupportProfile,
    setListenerProfile,
  } = useAppContext();

  useEffect(() => {
    if (authInitializationPromise) {
      return;
    }

    authInitializationPromise = (async () => {
      console.log("==================================");
      console.log("🚀 Auth initialize started");
      console.log("==================================");

      setLoading(true);

      try {
        if (!auth.currentUser) {
          console.log("🔐 No Firebase user found");
          console.log("🔄 Signing in anonymously...");

          await signInAnonymously(auth);
          console.log("auth.currentUser =", auth.currentUser);
          console.log("✅ Anonymous sign-in successful");
        } else {
          console.log("✅ Existing Firebase user:", auth.currentUser.uid);
        }

        authUnsubscribe = onAuthStateChanged(
          auth,
          async (user) => {
            console.log("==================================");
            console.log("🔥 onAuthStateChanged fired");
            console.log("Firebase User:", user);
            console.log("onAuthStateChanged fired");

            setCurrentUser(user);
            console.log("🔥 setCurrentUser called");
            console.log("Firebase user:", user);
            console.log("UID:", user?.uid);

            if (!user) {
              console.log("❌ User is NULL");
              setLoading(false);
              return;
            }

            console.log("✅ User UID:", user.uid);

            try {
              console.log("🔄 Restoring session...");

              const waitingUser = await restoreSession(user.uid);

              console.log("Restore Result:", waitingUser);

              if (waitingUser) {
                console.log("✅ Waiting user found");

                const restoredUserType =
                  waitingUser.userType === "listener" || waitingUser.userType === "support"
                    ? waitingUser.userType
                    : userType;

                if (restoredUserType) {
                  setUserType(restoredUserType);
                }

                console.log("User Type:", restoredUserType);

                if (waitingUser.userType === "support") {
                  console.log("Restoring support profile");

                  setSupportProfile({
                    language: waitingUser.language || "",
                    problem: waitingUser.problem || "",
                    emotion: waitingUser.emotion || "",
                    preferredRole: waitingUser.preferredRole || "",
                  });
                } else if (waitingUser.userType === "listener") {
                  console.log("Restoring listener profile");

                  setListenerProfile({
                    language: waitingUser.language || "",
                    listenerRoles: waitingUser.listenerRoles || [],
                    topics: waitingUser.topics || [],
                  });
                }

                if (waitingUser.assignedRoom) {
                  console.log("Restoring room:", waitingUser.assignedRoom);
                  setChatRoom(waitingUser.assignedRoom);
                  navigate("/chat", { replace: true });
                } else {
                  console.log("No active room to restore");
                }
              } else {
                console.log("⚠️ No waiting user found in Firestore");
              }
            } catch (error) {
              console.error("❌ Restore Session Error:", error);
              setError(error.message || "Failed to restore session");
            }

            console.log("✅ Auth initialization complete");
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("❌ Authentication Error:", error);
        setError(error.message || "Authentication failed");
        setLoading(false);
      } finally {
        authInitializationPromise = null;
      }
    })();

    return () => {
      console.log("🧹 AuthProvider cleanup");
      authUnsubscribe?.();
      authUnsubscribe = null;
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
