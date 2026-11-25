import { aiConfig } from "./aiConfig";

export type Turn = { role: "user" | "assistant"; content: string };

let workingGemini = ""; // remembers which Gemini model answered last

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash", "gemini-1.5-flash"];

async function apiError(res: Response, who: string) {
  let detail = "";
  try { const j = await res.json(); detail = j?.error?.message || JSON.stringify(j).slice(0, 200); } catch {}
  const err = new Error(`${who} error ${res.status}: ${detail}`.slice(0, 300)) as Error & { status?: number };
  err.status = res.status;
  return err;
}

// Ask Google which models this key can really use (names differ between accounts and change over time).
let discovered: string[] | null = null;
async function discoverGemini(key: string): Promise<string[]> {
  if (discovered) return discovered;
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", { headers: { "x-goog-api-key": key }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const j = await res.json();
    const names: string[] = (j?.models || [])
      .filter((m: { name?: string; supportedGenerationMethods?: string[] }) => m?.name?.startsWith("models/gemini") && (m.supportedGenerationMethods || []).includes("generateContent"))
      .map((m: { name: string }) => m.name.replace("models/", ""));
    const bad = /(embedding|image|tts|audio|live|vision|robotics|computer-use|learnlm|nano|banana|aqa|imagen|veo|thinking|exp)/;
    const score = (n: string) => {
      const ver = parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || "0");
      let sc = ver * 10;
      if (/flash/.test(n)) sc += 30; else if (/pro/.test(n)) sc += 5;
      if (/lite/.test(n)) sc -= 8;
      if (/preview/.test(n)) sc -= 12;
      if (/latest/.test(n)) sc += 2;
      return sc;
    };
    discovered = names.filter((n) => !bad.test(n)).sort((a, b) => score(b) - score(a)).slice(0, 6);
    return discovered;
  } catch {
    return [];
  }
}

async function gemini(key: string, preferred: string, system: string, turns: Turn[], maxTokens: number): Promise<{ text: string; model: string }> {
  const tried = new Set<string>();
  const errors: string[] = [];

  const attempt = async (model: string): Promise<{ text: string; model: string } | null> => {
    tried.add(model);
    for (const thinkingOff of [true, false]) {
      // Gemini 2.5+ models "think" first, which can use up the whole answer budget. Turn that off; retry without if refused.
      const generationConfig: Record<string, unknown> = { maxOutputTokens: maxTokens, temperature: 0.6, topP: 0.95 };
      if (thinkingOff) generationConfig.thinkingConfig = { thinkingBudget: 0 };
      let res: Response;
      try {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })),
            generationConfig,
          }),
          signal: AbortSignal.timeout(20000),
        });
      } catch (e) {
        throw new Error(`Could not reach Google: ${e instanceof Error ? e.message : e}`);
      }
      if (res.ok) {
        const j = await res.json();
        const text = (j?.candidates?.[0]?.content?.parts || []).map((p: { text?: string }) => p?.text || "").join("").trim();
        if (text) { workingGemini = model; return { text, model }; }
        errors.push(`${model}: no text (${j?.candidates?.[0]?.finishReason || j?.promptFeedback?.blockReason || "empty"})`);
        return null;
      }
      const err = (await apiError(res, model)) as Error & { status?: number };
      if (err.status === 401 || err.status === 403) throw err; // key problem: other models won't help
      if (err.status === 400 && thinkingOff && /think/i.test(err.message)) continue; // model refuses the thinking setting: retry without it
      errors.push(`${model}: ${err.status} ${err.message.replace(/^.*?error \d+: /, "").slice(0, 110)}`);
      return null;
    }
    return null;
  };

  const first = [workingGemini, preferred, ...GEMINI_MODELS].filter((m, i, a) => m && a.indexOf(m) === i);
  for (const m of first) { const r = await attempt(m); if (r) return r; }

  // none of the usual names worked: use whatever models this key actually has
  for (const m of (await discoverGemini(key)).filter((n) => !tried.has(n)).slice(0, 4)) { const r = await attempt(m); if (r) return r; }

  const available = (discovered || []).slice(0, 6).join(", ");
  throw new Error(`No Gemini model answered. ${errors.join(" | ")}${available ? ` | Models your key lists: ${available}` : " | Could not list your models (check the key and that the Generative Language API is allowed)."}`.slice(0, 900));
}

async function anthropic(key: string, model: string, system: string, turns: Turn[], maxTokens: number) {
  const m = model || "claude-haiku-5-5";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: m, max_tokens: maxTokens, temperature: 0.6, system, messages: turns }),
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw await apiError(res, `Anthropic (${m})`);
  const j = await res.json();
  const text = (j?.content || []).map((c: { text?: string }) => c?.text || "").join("").trim();
  if (!text) throw new Error("Anthropic returned no text");
  return { text, model: m };
}

export async function askAI(system: string, turns: Turn[], maxTokens = 900): Promise<{ text: string; model: string }> {
  const cfg = aiConfig();
  if (!cfg.ready) throw new Error("AI is not set up (add AI_API_KEY in Vercel and redeploy).");
  return cfg.provider === "anthropic" ? anthropic(cfg.key, cfg.model, system, turns, maxTokens) : gemini(cfg.key, cfg.model, system, turns, maxTokens);
}
