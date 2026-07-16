export default function Features() {
  const features = [
    {
      title: "🌍 AI Translation",
      text: "Talk to people across different languages."
    },
    {
      title: "🎭 Role Matching",
      text: "Choose roles like friend, mother, son, mentor and more."
    },
    {
      title: "🔒 Anonymous",
      text: "No phone numbers or personal information required."
    }
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="bg-white rounded-2xl shadow p-8"
        >
          <h2 className="text-2xl font-bold">{feature.title}</h2>

          <p className="mt-4 text-gray-600">
            {feature.text}
          </p>
        </div>
      ))}
    </section>
  );
}