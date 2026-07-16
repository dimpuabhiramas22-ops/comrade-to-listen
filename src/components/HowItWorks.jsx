export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Choose a Role",
      desc: "Select who you want to talk to, such as a friend, mother, mentor or listener.",
    },
    {
      number: "2",
      title: "Find a Match",
      desc: "We'll anonymously connect you with someone who matches your selected role.",
    },
    {
      number: "3",
      title: "Start Talking",
      desc: "Chat safely in your preferred language without sharing personal details.",
    },
    {
      number: "4",
      title: "Reconnect Anytime",
      desc: "Receive a unique Bridge Code to continue the conversation later.",
    },
  ];

  return (
    <section className="bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center">
          How It Works
        </h2>

        <p className="text-center text-gray-600 mt-4">
          Start meaningful conversations in four simple steps.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">

          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-xl transition"
            >
              <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                {step.number}
              </div>

              <h3 className="mt-6 text-xl font-bold">
                {step.title}
              </h3>

              <p className="mt-3 text-gray-600 text-sm">
                {step.desc}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}