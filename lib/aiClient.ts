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

async function gemini(key: string, preferred: string, system: string, turns: Turn[], maxTokens: number): Promise<{ text: string; model: string }> {
  const order = [workingGemini, preferred, ...GEMINI_MODELS].filter((m, i, a) => m && a.indexOf(m) === i);
  let lastErr: Error | null = null;

  for (const model of order) {
    for (const thinkingOff of [true, false]) {
      // Gemini 2.5 models "think" first, which can use up the whole answer budget. Turn that off, retry without if the model refuses.
      const generationConfig: Record<string, unknown> = { maxOutputTokens: maxTokens, temperature: 0.6, topP: 0.95 };
      if (thinkingOff) generationConfig.thinkingConfig = { thinkingBudget: 0 };
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })),
          generationConfig,
        }),
        signal: AbortSignal.timeout(20000),
      }).catch((e) => { throw new Error(`Could not reach Google: ${e instanceof Error ? e.message : e}`); });

      if (res.ok) {
        const j = await res.json();
        const text = (j?.candidates?.[0]?.content?.parts || []).map((p: { text?: string }) => p?.text || "").join("").trim();
        if (text) { workingGemini = model; return { text, model }; }
        const why = j?.candidates?.[0]?.finishReason || j?.promptFeedback?.blockReason || "no text";
        lastErr = new Error(`Gemini (${model}) returned no text (${why})`);
        break; // try the next model
      }
      const err = await apiError(res, `Gemini (${model})`);
      lastErr = err;
      const status = (err as Error & { status?: number }).status;
      if (status === 401 || status === 403) throw err; // key problem: no point trying other models
      if (status === 400 && thinkingOff) continue; // maybe the model doesn't accept thinkingConfig
      break; // 404 (model name), 429 (quota) and others: try the next model
    }
  }
  throw lastErr || new Error("Gemini did not answer");
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
