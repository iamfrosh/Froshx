# FroshX Assistant (website chatbot)

## How it works now
1. A chat bubble ("Ask FroshX") on every public page.
2. **With AI turned on (recommended):** the assistant answers almost any question: about FroshX (courses, fees, registration, services) and general tech, learning and business questions.
3. If it can't answer (a custom price, a complaint, something only a person can decide), it asks the visitor for their **email** (name and WhatsApp optional) and says the team will get back soon.
4. That question lands in your **Chat inbox** at `/admin/chat` (a "Chat inbox" button also appears on your admin pages with the number waiting, and you get an email alert if Gmail is set up). You write a reply and it is sent to the visitor by email in the FroshX design.
5. **Without AI:** only the built-in answers work (courses, fees, registration, payment, start dates, certificate, services, contact). Everything else goes to the email-capture step.

## Turn on AI (so it can answer most questions)
1. Get a key: aistudio.google.com, sign in, "Get API key" (free tier).
2. In Vercel > Settings > Environment Variables add `AI_API_KEY` = your key (and `AI_PROVIDER` = `gemini`). The names `GEMINI_API_KEY` or `GOOGLE_API_KEY` also work.
3. **Redeploy.** A new variable only works after a redeploy.
4. Open `/admin/chat` and press **Test AI connection**. It shows "Working" with the model name, or the exact error (wrong key, quota, model name, etc.).
Optional: `AI_MODEL` (the assistant tries several Gemini models automatically), `CHAT_SESSION_LIMIT` (default 40 AI answers per visitor per day), `CHAT_DAILY_LIMIT` (default 600 per day in total).
Anthropic (Claude) also works: `AI_PROVIDER=anthropic`, `AI_API_KEY=...` (paid per use).
Gemini's free tier has limits that Google can change, and free-tier prompts may be used by Google to improve its products.

## Give it your real website prices (important)
Open `lib/chatKnowledge.ts` and fill `AGENCY_NOTES`:
- `price`: e.g. "Websites usually start from ₦150,000 depending on the pages and features."
- `timeline`: e.g. "A typical website takes 2 to 4 weeks."
If you leave them empty, the assistant says the price depends on the project and offers a quote by email. It never invents prices.

## Email replies
Replies use the same Gmail setup as the registration emails (`GMAIL_USER`, `GMAIL_APP_PASSWORD`).

## Files
New: `lib/chatKnowledge.ts`, `models/ChatLog.ts`, `models/ChatEnquiry.ts`, `app/api/chat/route.ts`, `app/api/chat/enquiry/route.ts`, `app/api/admin/chat/route.ts`, `app/api/admin/chat/reply/route.ts`, `app/admin/chat/page.tsx`, `components/chat/*`.
New in this version: `lib/aiConfig.ts`, `lib/aiClient.ts`, `app/api/admin/chat/test/route.ts`.
Replaced: `components/academy/PageLoader.tsx` (mounts the chat bubble).
