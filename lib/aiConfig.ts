// Finds the AI settings from environment variables. Accepts several common names so a small naming slip doesn't break it.
export type AiConfig = { ready: boolean; provider: "gemini" | "anthropic" | ""; key: string; model: string };

export function aiConfig(): AiConfig {
  const env = process.env;
  const clean = (v?: string) => (v || "").trim().replace(/^["']|["']$/g, "");
  let provider = clean(env.AI_PROVIDER).toLowerCase();
  let key = clean(env.AI_API_KEY);
  if (!key) {
    key = clean(env.GEMINI_API_KEY) || clean(env.GOOGLE_API_KEY) || clean(env.GOOGLE_GENERATIVE_AI_API_KEY);
    if (key && !provider) provider = "gemini";
  }
  if (!key && clean(env.ANTHROPIC_API_KEY)) {
    key = clean(env.ANTHROPIC_API_KEY);
    if (!provider) provider = "anthropic";
  }
  if (key && !provider) provider = key.startsWith("sk-ant") ? "anthropic" : "gemini";
  if (provider === "google") provider = "gemini";
  if (provider === "claude") provider = "anthropic";
  const p = provider === "gemini" || provider === "anthropic" ? provider : "";
  return { ready: Boolean(key && p), provider: p, key, model: clean(env.AI_MODEL) };
}
