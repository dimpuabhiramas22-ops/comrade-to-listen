const features = [
  {
    icon: "🌍",
    title: "AI Translation",
    description:
      "Talk to anyone regardless of language. Messages can be translated instantly.",
  },
  {
    icon: "🎭",
    title: "Role Matching",
    description:
      "Choose who you want to talk to—friend, mother, mentor, sibling, and more.",
  },
  {
    icon: "🔒",
    title: "100% Anonymous",
    description:
      "No phone number or real identity is shared during conversations.",
  },
  {
    icon: "💙",
    title: "Safe Community",
    description:
      "Built to encourage kind, respectful, and meaningful conversations.",
  },
];

export default function Features() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center">
          <h2 className="text-4xl font-bold">
            Why Comrade to Listen?
          </h2>

          <p className="mt-4 text-gray-600">
            Everything is designed to make conversations safe, simple and meaningful.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">

          {features.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border p-8 shadow-sm hover:shadow-xl transition"
            >
              <div className="text-5xl">{item.icon}</div>

              <h3 className="mt-6 text-2xl font-bold">
                {item.title}
              </h3>

              <p className="mt-4 text-gray-600">
                {item.description}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}