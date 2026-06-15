export type AIProvider = "gemini" | "openai" | "openrouter";

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export interface ProviderMeta {
  label: string;
  defaultModel: string;
  placeholder: string;
  hint: string;
}

export const PROVIDER_META: Record<AIProvider, ProviderMeta> = {
  gemini: {
    label: "Gemini (Google)",
    defaultModel: "gemini-2.0-flash",
    placeholder: "AIzaSy...",
    hint: "aistudio.google.com — clé gratuite disponible",
  },
  openai: {
    label: "OpenAI (ChatGPT)",
    defaultModel: "gpt-4o-mini",
    placeholder: "sk-...",
    hint: "platform.openai.com/api-keys",
  },
  openrouter: {
    label: "OpenRouter",
    defaultModel: "google/gemini-2.0-flash-exp:free",
    placeholder: "sk-or-...",
    hint: "openrouter.ai/keys — accès à des dizaines de modèles gratuits",
  },
};

const configKey = (userId: string) => `ai_config_${userId}`;
const legacyKey = (userId: string) => `gemini_api_key_${userId}`;

export function getAIConfig(userId: string): AIConfig | null {
  const raw = localStorage.getItem(configKey(userId));
  if (raw) {
    try { return JSON.parse(raw) as AIConfig; } catch { /* fall through */ }
  }
  // Backward compat: migrate old Gemini-only key
  const old = localStorage.getItem(legacyKey(userId));
  if (old) return { provider: "gemini", apiKey: old, model: "gemini-2.0-flash" };
  return null;
}

export function saveAIConfig(userId: string, config: AIConfig): void {
  localStorage.setItem(configKey(userId), JSON.stringify({ ...config, apiKey: config.apiKey.trim() }));
  localStorage.removeItem(legacyKey(userId));
}

export function removeAIConfig(userId: string): void {
  localStorage.removeItem(configKey(userId));
  localStorage.removeItem(legacyKey(userId));
}

export class AIError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export interface AIMessage {
  system: string;
  user: string;
}

export async function callAI(config: AIConfig, message: AIMessage): Promise<string> {
  return config.provider === "gemini"
    ? callGemini(config, message)
    : callOpenAICompat(config, message);
}

async function callGemini(config: AIConfig, { system, user }: AIMessage): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ parts: [{ text: user }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2000 },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new AIError((err as any)?.error?.message ?? `Gemini error ${res.status}`, res.status);
  }
  const data = await res.json();
  return (data as any).candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function callOpenAICompat(config: AIConfig, { system, user }: AIMessage): Promise<string> {
  const base = config.provider === "openrouter"
    ? "https://openrouter.ai/api/v1"
    : "https://api.openai.com/v1";
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new AIError((err as any)?.error?.message ?? `API error ${res.status}`, res.status);
  }
  const data = await res.json();
  return (data as any).choices?.[0]?.message?.content ?? "";
}
