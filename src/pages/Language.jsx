import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function Language() {
  const navigate = useNavigate();

  const {
    userType,
    supportProfile,
    setSupportProfile,
    listenerProfile,
    setListenerProfile,
  } = useAppContext();

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

  const filteredLanguages = languages.filter((language) =>
    language.toLowerCase().includes(search.toLowerCase())
  );

  function handleLanguageSelect(language) {
    if (userType === "support") {
      setSupportProfile({
        ...supportProfile,
        language,
      });

      navigate("/problem");
      return;
    }

    if (userType === "listener") {
      setListenerProfile({
        ...listenerProfile,
        language,
      });

      navigate("/listener-topics");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-3xl w-full">

        <h1 className="text-4xl font-bold text-center">
          🌍 Choose Your Language
        </h1>

        <p className="text-center text-gray-500 mt-4">
          Select the language you're most comfortable using.
        </p>

        <input
          type="text"
          placeholder="🔍 Search language..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mt-8 p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="grid grid-cols-2 gap-4 mt-8 max-h-96 overflow-y-auto">
          {filteredLanguages.map((language) => (
            <button
              key={language}
              onClick={() => handleLanguageSelect(language)}
              className="border rounded-xl p-4 hover:bg-blue-600 hover:text-white transition-all duration-200"
            >
              {language}
            </button>
          ))}

          {filteredLanguages.length === 0 && (
            <div className="col-span-2 text-center py-8 text-gray-500">
              No language found.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}