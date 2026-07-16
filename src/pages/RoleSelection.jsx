import { useNavigate } from "react-router-dom";

export default function RoleSelection() {
  const navigate = useNavigate();

  const roles = [
    "👩 Mother",
    "👨 Father",
    "👦 Brother",
    "👧 Sister",
    "👥 Friend",
    "❤️ Partner",
    "🎓 Mentor",
    "👂 Listener",
    "🌟 Stranger",
    "🙏 Elder",
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">

      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-5xl w-full">

        <h1 className="text-4xl font-bold text-center">
          Choose a Role
        </h1>

        <p className="text-center text-gray-500 mt-4">
          Who would you like to talk with?
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">

          {roles.map((role) => (
            <button
              key={role}
              onClick={() => navigate("/mood")}
              className="border rounded-2xl p-5 hover:bg-blue-600 hover:text-white transition text-lg"
            >
              {role}
            </button>
          ))}

        </div>

      </div>

    </div>
  );
}