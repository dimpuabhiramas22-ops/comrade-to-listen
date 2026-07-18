import { useNavigate, useLocation } from "react-router-dom";

export default function MoodSelection() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    language = "English",
    role = "Friend",
  } = location.state || {};

  const moods = [
    "Sad",
    "Lonely",
    "Anxious",
    "Angry",
    "Depressed",
    "Confused",
    "Happy",
    "Tired",
  ];

  const moodIcons = {
    Sad: "😢",
    Lonely: "😔",
    Anxious: "😰",
    Angry: "😡",
    Depressed: "😞",
    Confused: "😐",
    Happy: "😊",
    Tired: "😴",
  };

  function handleMoodSelect(mood) {
    navigate("/matching", {
      state: {
        language,
        role,
        mood,
      },
    });
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-5xl w-full">

        <h1 className="text-4xl font-bold text-center">
          How are you feeling today?
        </h1>

        <p className="text-center text-gray-500 mt-4">
          Select your current mood.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">

          {moods.map((mood) => (
            <button
              key={mood}
              onClick={() => handleMoodSelect(mood)}
              className="border rounded-2xl p-5 hover:bg-blue-600 hover:text-white transition text-lg"
            >
              <div className="text-3xl mb-2">
                {moodIcons[mood]}
              </div>

              <div>{mood}</div>
            </button>
          ))}

        </div>

      </div>
    </div>
  );
}