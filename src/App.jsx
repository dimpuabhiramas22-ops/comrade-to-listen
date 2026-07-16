function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-600">
          ❤️ Comrade to Listen
        </h1>

        <button className="border px-4 py-2 rounded-lg hover:bg-gray-100">
          🌍 English
        </button>
      </nav>

      {/* Hero Section */}
      <section className="text-center mt-20 px-6">
        <h2 className="text-5xl font-bold">
          Nobody should feel unheard.
        </h2>

        <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
          Connect anonymously with someone who truly wants to listen.
          Safe. Free. Private.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-10">
          <button className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg hover:bg-blue-700">
            🫂 I Need Support
          </button>

          <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl text-lg hover:bg-blue-50">
            🎧 I Want To Listen
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto mt-24 grid md:grid-cols-3 gap-8 px-6">
        <div className="bg-white shadow rounded-2xl p-8">
          <h3 className="text-xl font-semibold">🌍 AI Translation</h3>
          <p className="mt-3 text-gray-600">
            Chat with people speaking different languages.
          </p>
        </div>

        <div className="bg-white shadow rounded-2xl p-8">
          <h3 className="text-xl font-semibold">🎭 Role Matching</h3>
          <p className="mt-3 text-gray-600">
            Connect as a son, mother, father, friend, mentor and more.
          </p>
        </div>

        <div className="bg-white shadow rounded-2xl p-8">
          <h3 className="text-xl font-semibold">🔒 Anonymous & Safe</h3>
          <p className="mt-3 text-gray-600">
            No phone numbers. No personal details. Just meaningful conversations.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-24 py-8 text-center text-gray-500 border-t">
        © 2026 Comrade to Listen • Nobody should feel unheard.
      </footer>
    </div>
  );
}

export default App;