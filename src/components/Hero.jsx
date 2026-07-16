export default function Hero() {
  return (
    <section className="text-center py-20 px-6">
      <h1 className="text-5xl font-bold text-slate-900">
        Nobody should feel unheard.
      </h1>

      <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
        A safe, anonymous place where someone is always ready to listen.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row justify-center gap-5">
        <button className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition">
          🫂 I Need Support
        </button>

        <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition">
          🎧 I Want To Listen
        </button>
      </div>
    </section>
  );
}