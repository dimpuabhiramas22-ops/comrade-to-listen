import { useNavigate } from "react-router-dom";

export default function MoodSelection() {
  const navigate = useNavigate();

  const moods = [
    "😢 Sad",
    "😔 Lonely",
    "😰 Anxious",
    "😡 Angry",
    "😞 Depressed",
    "😐 Confused",
    "😊 Happy",
    "😴 Tired",
  ];

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
              onClick={() => navigate("/matching")}
              className="border rounded-2xl p-5 hover:bg-blue-600 hover:text-white transition text-lg"
            >
              {mood}
            </button>
          ))}

        </div>

      </div>

    </div>
  );
}