export async function translateText(text, from, to) {
  if (!text.trim()) return "";

  // No need to translate if both users use the same language
  if (from === to) {
    return text;
  }

  try {
    const response = await fetch("http://localhost:5000/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        from,
        to,
      }),
    });

    const data = await response.json();

    return data.translatedText || text;
  } catch (error) {
    console.error("Translation Error:", error);

    // If translation fails, return original text
    return text;
  }
}