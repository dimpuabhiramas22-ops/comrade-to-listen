import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center">

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight">
            Nobody should
            <br />
            feel unheard.
          </h1>

          <p className="mt-8 text-xl text-slate-600 max-w-3xl mx-auto">
            Connect anonymously with caring people around the world.
            Share your thoughts safely without revealing your identity.
          </p>

          <div className="mt-12 flex flex-col md:flex-row justify-center gap-5">

            <button
              onClick={() => navigate("/language")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-lg transition"
            >
              🫂 I Need Support
            </button>

            <button
              onClick={() => navigate("/volunteer")}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-10 py-4 rounded-2xl text-lg font-semibold transition"
            >
              🎧 I Want To Listen
            </button>

          </div>

          <p className="mt-12 text-gray-500 text-lg">
            Anonymous • Safe • Human
          </p>

        </div>
      </div>
    </section>
  );
}