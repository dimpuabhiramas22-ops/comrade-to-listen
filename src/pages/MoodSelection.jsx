import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function MoodSelection() {
  const navigate = useNavigate();

  const { supportProfile, setSupportProfile } = useAppContext();

  const emotions = [
    { icon: "😢", name: "Sad" },
    { icon: "😔", name: "Lonely" },
    { icon: "😰", name: "Anxious" },
    { icon: "😡", name: "Angry" },
    { icon: "😞", name: "Hopeless" },
    { icon: "😴", name: "Exhausted" },
    { icon: "😕", name: "Confused" },
    { icon: "😨", name: "Overwhelmed" },
    { icon: "😊", name: "Happy" },
    { icon: "😌", name: "Calm" },
  ];

  function handleEmotionSelect(emotion) {
    setSupportProfile((prev) => ({
      ...prev,
      emotion,
    }));

    navigate("/role");
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-5xl w-full">

        <h1 className="text-4xl font-bold text-center">
          💙 How are you feeling right now?
        </h1>

        <p className="text-center text-gray-500 mt-4">
          Select the emotion that best describes how you feel.
        </p>

        {/* Progress */}
        <div className="flex justify-center mt-8">
          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            Step 3 of 5
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5 mt-10">
          {emotions.map((emotion) => (
            <button
              key={emotion.name}
              onClick={() => handleEmotionSelect(emotion.name)}
              className={`border rounded-2xl p-5 transition-all duration-200 hover:bg-blue-600 hover:text-white hover:shadow-lg ${
                supportProfile.emotion === emotion.name
                  ? "bg-blue-600 text-white"
                  : "bg-white"
              }`}
            >
              <div className="text-5xl mb-3">
                {emotion.icon}
              </div>

              <div className="font-semibold text-lg">
                {emotion.name}
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}