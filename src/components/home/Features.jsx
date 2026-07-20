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
    <section className="py-20 bg-white">

      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center">
          Why Choose Comrade to Listen?
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">

          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-gray-50 rounded-2xl p-8 shadow hover:shadow-xl transition"
            >
              <div className="text-5xl">
                {feature.icon}
              </div>

              <h3 className="mt-5 text-xl font-bold">
                {feature.title}
              </h3>

              <p className="mt-3 text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}