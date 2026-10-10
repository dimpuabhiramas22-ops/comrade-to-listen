const features = [
  {
    icon: "🔒",
    title: "Anonymous",
    description:
      "Talk freely without revealing your identity.",
  },
  {
    icon: "🌍",
    title: "Auto Translation",
    description:
      "Messages are translated automatically into your preferred language.",
  },
  {
    icon: "⚡",
    title: "Smart Matching",
    description:
      "Get connected with the most suitable listener using intelligent matching.",
  },
  {
    icon: "💙",
    title: "Safe Conversations",
    description:
      "Built with privacy and emotional well-being in mind.",
  },
];

export default function Features() {
  return (
    <section className="border-y border-indigo-100/70 bg-white/75 py-20 backdrop-blur-sm">

      <div className="max-w-7xl mx-auto px-6">

        <h2 className="font-serif text-4xl font-semibold text-center text-ink">A softer way to reach out</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">

          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_10px_30px_rgba(30,47,110,.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(30,47,110,.10)]"
            >
              <div className="text-5xl">
                {feature.icon}
              </div>

              <h3 className="mt-5 text-xl font-semibold text-ink">
                {feature.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {feature.description}
              </p>
            </article>
          ))}

        </div>

      </div>

    </section>
  );
}
