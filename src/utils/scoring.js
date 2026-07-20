export function calculateMatchScore(supportUser, listener) {
  let score = 0;

  // -----------------------------
  // 1. Problem / Topic (40)
  // -----------------------------
  if (
    listener.topics?.includes(supportUser.problem)
  ) {
    score += 40;
  }

  // -----------------------------
  // 2. Preferred Role (25)
  // -----------------------------
  if (
    listener.listenerRoles?.includes(
      supportUser.preferredRole
    )
  ) {
    score += 25;
  }

  // -----------------------------
  // 3. Emotion (15)
  // -----------------------------
  score += emotionScore(
    supportUser.emotion,
    listener.topics
  );

  // -----------------------------
  // 4. Language (10)
  // -----------------------------
  if (
    supportUser.language ===
    listener.language
  ) {
    score += 10;
  }

  // -----------------------------
  // 5. Waiting Time (10)
  // -----------------------------
  if (listener.createdAt) {
    const waitingMinutes =
      (Date.now() -
        listener.createdAt.toMillis()) /
      60000;

    score += Math.min(
      10,
      Math.floor(waitingMinutes)
    );
  }

  return score;
}

function emotionScore(emotion, topics = []) {
  switch (emotion) {
    case "Anxious":
      return topics.includes("Anxiety") ? 15 : 8;

    case "Sad":
      return topics.includes("Depression") ? 15 : 8;

    case "Lonely":
      return topics.includes("Loneliness") ? 15 : 8;

    case "Angry":
      return topics.includes("Relationship") ? 12 : 6;

    case "Hopeless":
      return topics.includes("Depression") ? 15 : 8;

    case "Exhausted":
      return topics.includes("Stress") ? 15 : 8;

    case "Confused":
      return topics.includes("Career") ||
        topics.includes("Academic")
        ? 15
        : 8;

    case "Overwhelmed":
      return topics.includes("Stress") ? 15 : 8;

    case "Happy":
      return 5;

    case "Calm":
      return 5;

    default:
      return 0;
  }
}