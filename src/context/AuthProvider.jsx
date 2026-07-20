import { createContext, useContext, useEffect } from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
} from "firebase/auth";

import { auth } from "../firebase";
import { useAppContext } from "./AppContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { setCurrentUser, setLoading } = useAppContext();

  useEffect(() => {
    let unsubscribe;

    async function initialize() {
      setLoading(true);

      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }

        unsubscribe = onAuthStateChanged(auth, (user) => {
          setCurrentUser(user);
          setLoading(false);
        });
      } catch (error) {
        console.error("Authentication Error:", error);
        setLoading(false);
      }
    }

    initialize();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}