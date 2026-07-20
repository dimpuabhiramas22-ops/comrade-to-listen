import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Current flow
  const [userType, setUserType] = useState(null); // "support" | "listener"

  // Support User Profile
  const [supportProfile, setSupportProfile] = useState({
    language: "",
    problem: "",
    emotion: "",
    preferredRole: "",
  });

  // Listener Profile
  const [listenerProfile, setListenerProfile] = useState({
    language: "",
    listenerRoles: [],
    topics: [],
  });

  // Match Information
  const [match, setMatch] = useState(null);

  // Active Chat Room
  const [chatRoom, setChatRoom] = useState(null);

  // Firebase User
  const [currentUser, setCurrentUser] = useState(null);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function resetSupportProfile() {
    setSupportProfile({
      language: "",
      problem: "",
      emotion: "",
      preferredRole: "",
    });
  }

  function resetListenerProfile() {
    setListenerProfile({
      language: "",
      listenerRoles: [],
      topics: [],
    });
  }

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

  const value = {
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

    // Firebase User
    currentUser,
    setCurrentUser,

    // UI
    loading,
    setLoading,
    error,
    setError,

    // Helpers
    resetApp,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }

  return context;
}