import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Language() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const languages = [
    "English",
    "తెలుగు",
    "ಕನ್ನಡ",
    "हिन्दी",
    "தமிழ்",
    "മലയാളം",
    "বাংলা",
    "मराठी",
    "ગુજરાતી",
    "ਪੰਜਾਬੀ",
    "اردو",
    "অসমীয়া",
    "ଓଡ଼ିଆ",
    "संस्कृत",
    "Konkani",
    "Bodo",
    "Dogri",
    "Maithili",
    "Manipuri",
    "Nepali",
    "Santali",
    "Sindhi",
    "Kashmiri",
    "Tulu",
  ];

  const filteredLanguages = languages.filter((lang) =>
    lang.toLowerCase().includes(search.toLowerCase())
  );

  function handleLanguageSelect(language) {
    navigate("/role", {
      state: {
        language,
      },
    });
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">

      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-3xl w-full">

        <h1 className="text-4xl font-bold text-center">
          🌍 Choose Your Language
        </h1>

        <p className="text-center text-gray-500 mt-4">
          Messages will be translated automatically if needed.
        </p>

        <input
          type="text"
          placeholder="🔍 Search language..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mt-8 p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="grid grid-cols-2 gap-4 mt-6 max-h-96 overflow-y-auto pr-2">

          {filteredLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageSelect(lang)}
              className="border rounded-xl p-5 hover:bg-blue-600 hover:text-white transition text-lg"
            >
              {lang}
            </button>
          ))}

          {filteredLanguages.length === 0 && (
            <div className="col-span-2 text-center text-gray-500 py-8">
              No language found.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}