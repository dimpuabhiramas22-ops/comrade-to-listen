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
  // Clears selections and the active journey while preserving anonymous authentication.\n  function resetJourney() {\n    setUserType(null);\n    resetSupportProfile();\n    resetListenerProfile();\n    setMatch(null);\n    setChatRoom(null);\n    setLoading(false);\n    setError(null);\n  }\n\n  function resetApp() {
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
      resetJourney,
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useAppContext must be used inside AppProvider"
    );
  }

  return context;
}
