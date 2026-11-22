# FroshX Assistant (website chatbot)

## What it is
A chat bubble on every public page ("Ask FroshX"). Visitors can ask about courses, fees, registration, start dates, certificates, payment and your services.
- **Free mode (always on):** answers instantly from your own information in `lib/chatKnowledge.ts` (course list, prices from `lib/academy.ts`, contact details from `lib/site.ts`). Costs nothing and cannot invent prices.
- **Optional AI mode:** only used when a question isn't covered. It is told to answer ONLY from your facts and to send people to WhatsApp when unsure. It has per-visitor and daily limits.
- If nothing can answer, it hands the visitor to WhatsApp.

## Is it free?
- The free mode is 100% free (no API, no key).
- AI mode needs an API key from a provider:
  - Google Gemini has a free tier with usage limits (limits and rules change; check Google AI Studio). Free-tier prompts may be used by Google to improve its products.
  - Anthropic (Claude) is paid per use.
  Limits protect you: by default 15 AI answers per visitor per day and 300 per day in total (`CHAT_SESSION_LIMIT`, `CHAT_DAILY_LIMIT`).
- Chat history is stored in your MongoDB (deleted automatically after 90 days).

## Turn on AI mode (optional)
In Vercel > Settings > Environment Variables add, then redeploy:
- `AI_PROVIDER` = `gemini` (or `anthropic`)
- `AI_API_KEY` = your key (Gemini: Google AI Studio > Get API key)
- `AI_MODEL` = optional. Defaults: `gemini-2.5-flash` / `claude-haiku-5-5`. If Google renames the model, set the current name here.
- `CHAT_SESSION_LIMIT`, `CHAT_DAILY_LIMIT` = optional limits.
Without these, only free mode runs.

## See what people ask
Sign in at `/admin`, then open `/admin/chat`. Questions marked "Not answered" show what to add next.

## Change or add answers
Edit `lib/chatKnowledge.ts` (the `answer()` function and the facts at the bottom).
Prices and courses update automatically when you change `lib/academy.ts`.

## Files
New: `lib/chatKnowledge.ts`, `models/ChatLog.ts`, `app/api/chat/route.ts`, `app/api/admin/chat/route.ts`, `app/admin/chat/page.tsx`, `components/chat/*`.
Replaced: `components/academy/PageLoader.tsx` (it now also mounts the chat bubble).
