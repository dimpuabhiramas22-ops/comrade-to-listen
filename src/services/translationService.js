const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";
const TRANSLATION_TIMEOUT_MS = 3000;
const pendingTranslations = new Map();

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

  if (sourceLanguage === targetLanguage) {
    return {
      translatedText: text,
      warning: "",
    };
  }

  const key = `${text}::${sourceLanguage}::${targetLanguage}`;
  if (pendingTranslations.has(key)) {
    return pendingTranslations.get(key);
  }

  const translationPromise = (async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, TRANSLATION_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_URL}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          from: sourceLanguage,
          to: targetLanguage,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        return {
          translatedText: text,
          warning: "Translation service unavailable.",
        };
      }

      const data = await response.json();

      return {
        translatedText: data.translatedText || text,
        warning: data.warning || "",
      };
    } catch {
      return {
        translatedText: text,
        warning: "Translation service unavailable.",
      };
    } finally {
      window.clearTimeout(timeoutId);
    }
  })();

  pendingTranslations.set(key, translationPromise);

  try {
    return await translationPromise;
  } finally {
    pendingTranslations.delete(key);
  }
}
