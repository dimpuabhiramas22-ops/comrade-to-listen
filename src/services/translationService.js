const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function translateMessage(
  text,
  sourceLanguage,
  targetLanguage
) {
  if (!text.trim()) {
    return {
      translatedText: "",
      warning: "",
    };
  }

  try {
    const response = await fetch(`${API_URL}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        sourceLanguage,
        targetLanguage,
      }),
    });

    if (!response.ok) {
      throw new Error("Translation request failed.");
    }

    const data = await response.json();

    return {
      translatedText: data.translatedText || text,
      warning: data.warning || "",
    };
  } catch (error) {
    console.error("Translation Error:", error);

    return {
      translatedText: text,
      warning: "Translation service unavailable.",
    };
  }
}