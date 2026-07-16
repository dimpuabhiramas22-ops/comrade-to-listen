import { useNavigate } from "react-router-dom";

export default function Language() {
  const navigate = useNavigate();

  const languages = [
    "English",
    "తెలుగు",
    "ಕನ್ನಡ",
    "हिन्दी",
    "தமிழ்",
    "മലയാളം",
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">

      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-3xl w-full">

        <h1 className="text-4xl font-bold text-center">
          🌍 Choose Your Language
        </h1>

        <p className="text-center text-gray-500 mt-4">
          Messages will be translated automatically if needed.
        </p>

        <div className="grid grid-cols-2 gap-4 mt-10">

          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => navigate("/role")}
              className="border rounded-xl p-5 hover:bg-blue-600 hover:text-white transition text-lg"
            >
              {lang}
            </button>
          ))}

        </div>

      </div>

    </div>
  );
}