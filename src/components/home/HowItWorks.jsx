const steps = [
  {
    number: "1",
    title: "Choose Your Role",
    description:
      "Need support or want to volunteer as a listener.",
  },
  {
    number: "2",
    title: "Smart Matching",
    description:
      "Our system finds the best compatible person for you.",
  },
  {
    number: "3",
    title: "Start Talking",
    description:
      "Chat instantly in a safe and supportive environment.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-slate-100 py-20">

      <div className="max-w-6xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-10 mt-14">

          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white rounded-2xl shadow-lg p-8 text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                {step.number}
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                {step.title}
              </h3>

              <p className="mt-4 text-gray-600">
                {step.description}
              </p>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}