import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function ListenerRole() {
  const navigate = useNavigate();

  const { listenerProfile, setListenerProfile } = useAppContext();

  const roles = [
    {
      icon: "🧑‍🤝‍🧑",
      title: "Friend",
      description: "I enjoy listening like a trusted friend."
    },
    {
      icon: "👨‍🏫",
      title: "Mentor",
      description: "I like guiding and sharing experience."
    },
    {
      icon: "🎓",
      title: "Senior Student",
      description: "I can help with academics and college life."
    },
    {
      icon: "👨",
      title: "Older Brother",
      description: "Supportive and protective conversations."
    },
    {
      icon: "👩",
      title: "Older Sister",
      description: "Friendly, caring and understanding."
    },
    {
      icon: "👨‍👧",
      title: "Father Figure",
      description: "Calm advice from a mature perspective."
    },
    {
      icon: "👩‍👧",
      title: "Mother Figure",
      description: "Compassionate and caring support."
    },
    {
      icon: "❤️",
      title: "Just Here to Listen",
      description: "I don't give advice. I simply listen."
    }
  ];

  function handleRoleSelect(role) {
    setListenerProfile((prev) => ({
      ...prev,
      listenerRoles: [role],
    }));

    navigate("/language");
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-6xl w-full">

        <h1 className="text-4xl font-bold text-center">
          🎧 How would you like to support others?
        </h1>

        <p className="text-center text-gray-500 mt-4">
          Choose the role that best describes how you would like to help.
        </p>

        <div className="flex justify-center mt-8">
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
            Step 1 of 4
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {roles.map((role) => (
            <button
              key={role.title}
              onClick={() => handleRoleSelect(role.title)}
              className={`border rounded-2xl p-6 text-left transition-all duration-200 hover:bg-green-600 hover:text-white hover:shadow-lg ${
                listenerProfile.listenerRoles.includes(role.title)
                  ? "bg-green-600 text-white"
                  : "bg-white"
              }`}
            >
              <div className="text-5xl mb-4">
                {role.icon}
              </div>

              <h2 className="text-xl font-semibold">
                {role.title}
              </h2>

              <p className="mt-2 text-sm opacity-80">
                {role.description}
              </p>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}