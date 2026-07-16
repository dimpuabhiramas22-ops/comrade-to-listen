import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Matching() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/chat");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">

      <div className="text-center">

        <div className="text-7xl animate-pulse">
          💙
        </div>

        <h1 className="text-5xl font-bold mt-8">
          Finding Someone...
        </h1>

        <p className="text-gray-500 mt-5 text-lg">
          Please wait while we connect you with the best listener.
        </p>

        <div className="mt-10">

          <div className="w-20 h-20 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>

        </div>

        <p className="mt-10 text-gray-400">
          Estimated wait time: 5 seconds
        </p>

      </div>

    </div>
  );
}