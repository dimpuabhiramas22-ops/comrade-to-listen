export default function Hero({ onSupport, onListener }) {
  return (
    <section className="relative isolate overflow-hidden px-5 pb-14 pt-8 sm:px-8 sm:pb-20 lg:pb-28">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(ellipse_at_center_bottom,rgba(169,184,248,.48),transparent_67%)]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="flex items-center justify-between py-4">
          <span className="font-serif text-xl font-semibold tracking-tight text-ink sm:text-2xl">Comrade to Listen</span>
          <span className="text-sm font-medium text-slate-500">Anonymous. Human. Here.</span>
        </div>
        <div className="mx-auto max-w-3xl pb-10 pt-20 text-center sm:pb-16 sm:pt-28">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white text-3xl shadow-[0_16px_45px_rgba(78,96,177,.16)]">♡</div>
          <h1 className="font-serif text-5xl font-semibold leading-[1.03] tracking-tight text-ink sm:text-7xl">You deserve a space to be heard.</h1>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">A quiet, anonymous place to say what&apos;s on your mind—with someone ready to listen.</p>
          <div className="mx-auto mt-12 grid max-w-2xl gap-4 text-left sm:grid-cols-2">
            <button onClick={onSupport} className="group rounded-[2rem] border border-indigo-100 bg-white p-7 shadow-[0_14px_42px_rgba(75,92,163,.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(75,92,163,.18)]">
              <span className="mb-6 block text-3xl">◌</span><span className="block text-xl font-semibold text-ink">I need someone to listen</span><span className="mt-2 block text-sm leading-6 text-slate-500">Find a kind, anonymous companion.</span><span className="mt-7 block font-semibold text-periwinkle">Begin →</span>
            </button>
            <button onClick={onListener} className="group rounded-[2rem] border border-orange-100 bg-peach p-7 shadow-[0_14px_42px_rgba(196,130,104,.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(196,130,104,.16)]">
              <span className="mb-6 block text-3xl">♡</span><span className="block text-xl font-semibold text-ink">I&apos;m here to listen</span><span className="mt-2 block text-sm leading-6 text-slate-500">Offer a little room for someone else.</span><span className="mt-7 block font-semibold text-[#c36852]">Become available →</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
