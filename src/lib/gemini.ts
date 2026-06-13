const storageKey = (userId: string) => `gemini_api_key_${userId}`;

export function getGeminiKey(userId: string): string | null {
  return localStorage.getItem(storageKey(userId));
}

export function saveGeminiKey(userId: string, key: string): void {
  localStorage.setItem(storageKey(userId), key.trim());
}

export function removeGeminiKey(userId: string): void {
  localStorage.removeItem(storageKey(userId));
}

export async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message ?? `Gemini API error ${res.status}`);
  }
  const data = await res.json();
  return (data as any).candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}
