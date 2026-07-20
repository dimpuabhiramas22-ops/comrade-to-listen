import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function ProblemSelection() {
  const navigate = useNavigate();

  const { supportProfile, setSupportProfile } = useAppContext();

  const problems = [
    { icon: "👨‍👩‍👧", name: "Family" },
    { icon: "💕", name: "Relationship" },
    { icon: "📚", name: "Academic" },
    { icon: "💼", name: "Career" },
    { icon: "💰", name: "Financial" },
    { icon: "🏥", name: "Health" },
    { icon: "😔", name: "Loneliness" },
    { icon: "😰", name: "Anxiety" },
    { icon: "😞", name: "Depression" },
    { icon: "🌍", name: "Social" },
    { icon: "🌱", name: "Self Growth" },
    { icon: "💬", name: "Just Need Someone to Talk" },
  ];

  function handleProblemSelect(problem) {
    setSupportProfile((prev) => ({
      ...prev,
      problem,
    }));

    navigate("/mood");
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-5xl w-full">

        <h1 className="text-4xl font-bold text-center">
          🧩 What are you going through?
        </h1>

        <p className="text-center text-gray-500 mt-4">
          Choose the topic that best describes what you'd like to talk about.
        </p>

        {/* Progress */}
        <div className="flex justify-center mt-8">
          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            Step 2 of 5
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {problems.map((problem) => (
            <button
              key={problem.name}
              onClick={() => handleProblemSelect(problem.name)}
              className={`border rounded-2xl p-5 transition-all duration-200 hover:bg-blue-600 hover:text-white hover:shadow-lg ${
                supportProfile.problem === problem.name
                  ? "bg-blue-600 text-white"
                  : "bg-white"
              }`}
            >
              <div className="text-4xl mb-3">
                {problem.icon}
              </div>

              <div className="font-medium text-lg">
                {problem.name}
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}