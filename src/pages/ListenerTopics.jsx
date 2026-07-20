import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function ListenerTopics() {
  const navigate = useNavigate();

  const { listenerProfile, setListenerProfile } = useAppContext();

  const topics = [
    "Family",
    "Relationship",
    "Academic",
    "Career",
    "Financial",
    "Health",
    "Loneliness",
    "Depression",
    "Anxiety",
    "Stress",
    "Grief",
    "Breakup",
    "Marriage",
    "Parenting",
    "General Conversation",
  ];

  function toggleTopic(topic) {
    const alreadySelected = listenerProfile.topics.includes(topic);

    if (alreadySelected) {
      setListenerProfile((prev) => ({
        ...prev,
        topics: prev.topics.filter((t) => t !== topic),
      }));
    } else {
      setListenerProfile((prev) => ({
        ...prev,
        topics: [...prev.topics, topic],
      }));
    }
  }

  function handleContinue() {
    if (listenerProfile.topics.length === 0) {
      alert("Please select at least one topic.");
      return;
    }

    navigate("/matching");
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-6xl w-full">

        <h1 className="text-4xl font-bold text-center">
          📚 What topics are you comfortable talking about?
        </h1>

        <p className="text-center text-gray-500 mt-4">
          Select one or more topics you're happy to support others with.
        </p>

        <div className="flex justify-center mt-8">
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
            Step 3 of 4
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {topics.map((topic) => {
            const selected = listenerProfile.topics.includes(topic);

            return (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`border rounded-2xl p-5 transition-all duration-200 ${
                  selected
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white hover:bg-green-50"
                }`}
              >
                <div className="text-lg font-medium">
                  {topic}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex justify-between items-center">

          <div className="text-gray-600">
            Selected: <strong>{listenerProfile.topics.length}</strong>
          </div>

          <button
            onClick={handleContinue}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            Continue →
          </button>

        </div>

      </div>
    </div>
  );
}