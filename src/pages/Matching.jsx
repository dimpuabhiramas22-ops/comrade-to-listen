import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Matching() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/chat");
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">

      <div className="bg-white shadow-xl rounded-3xl p-10 w-[420px] text-center">

        <div className="text-6xl animate-pulse">
          💙
        </div>

        <h1 className="text-3xl font-bold mt-6">
          Finding Your Listener...
        </h1>

        <p className="text-gray-500 mt-4">
          We're matching you with someone who is ready to listen.
        </p>

        <div className="mt-8 flex justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <p className="mt-8 text-sm text-gray-400">
          Average wait time: 5–20 seconds
        </p>

      </div>

    </div>
  );
}