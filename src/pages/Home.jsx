import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import HowItWorks from "../components/home/HowItWorks";

export default function Home() {
  const navigate = useNavigate();

  const {
    setUserType,
    resetSupportProfile,
    resetListenerProfile,
  } = useAppContext();

  function handleSupport() {
    resetSupportProfile();
    resetListenerProfile();

    setUserType("support");

    navigate("/language");
  }

  function handleListener() {
    resetSupportProfile();
    resetListenerProfile();

    setUserType("listener");

    navigate("/listener-role");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <Hero
        onSupport={handleSupport}
        onListener={handleListener}
      />

      {/* Features */}
      <Features />

      {/* How It Works */}
      <HowItWorks />
    </div>
  );
}