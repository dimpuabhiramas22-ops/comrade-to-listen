export default function Hero({ onSupport, onListener }) {
  return (
    <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-6 py-24">

        <div className="text-center">

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
            ❤️ Comrade to Listen
          </h1>

          <p className="mt-8 text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            A safe space where people can talk, listen, and support each
            other anonymously without judgment.
          </p>

          <div className="mt-14 flex flex-col md:flex-row justify-center gap-6">

            <button
              onClick={onSupport}
              className="bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition"
            >
              🫂 I Need Support
            </button>

            <button
              onClick={onListener}
              className="bg-green-500 hover:bg-green-600 font-bold px-8 py-4 rounded-2xl shadow-lg transition"
            >
              🎧 I Want to Listen
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}