import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
const AppContext = createContext(null);

const DEFAULT_SUPPORT_PROFILE = {
  language: "",
  problem: "",
  emotion: "",
  preferredRole: "",
};

const DEFAULT_LISTENER_PROFILE = {
  language: "",
  listenerRoles: [],
  topics: [],
};

export function AppProvider({ children }) {
  // Flow
  const [userType, setUserType] = useState(null);

  // Profiles
  const [supportProfile, setSupportProfile] = useState(
    DEFAULT_SUPPORT_PROFILE
  );

  const [listenerProfile, setListenerProfile] = useState(
    DEFAULT_LISTENER_PROFILE
  );

  // Match
  const [match, setMatch] = useState(null);

  // Active chat
  const [chatRoom, setChatRoom] = useState(null);

  // Firebase user
  const [currentUser, setCurrentUser] = useState(null);

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function resetSupportProfile() {
    setSupportProfile({
      ...DEFAULT_SUPPORT_PROFILE,
    });
  }

  function resetListenerProfile() {
    setListenerProfile({
      ...DEFAULT_LISTENER_PROFILE,
    });
  }

  /**
   * Global reset.
   * Keeps one function responsible for resetting
   * the application state.
   */
  function resetApp() {
    setUserType(null);

    resetSupportProfile();
    resetListenerProfile();

    setMatch(null);
    setChatRoom(null);

    setCurrentUser(null);

    setLoading(false);
    setError(null);
  }

  const value = useMemo(
    () => ({
      // Flow
      userType,
      setUserType,

      // Support
      supportProfile,
      setSupportProfile,
      resetSupportProfile,

      // Listener
      listenerProfile,
      setListenerProfile,
      resetListenerProfile,

      // Match
      match,
      setMatch,

      // Chat
      chatRoom,
      setChatRoom,

      // Firebase
      currentUser,
      setCurrentUser,

      // UI
      loading,
      setLoading,
      error,
      setError,

      // Helpers
      resetApp,
    }),
    [
      userType,
      supportProfile,
      listenerProfile,
      match,
      chatRoom,
      currentUser,
      loading,
      error,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useAppContext must be used inside AppProvider"
    );
  }

  return context;
}