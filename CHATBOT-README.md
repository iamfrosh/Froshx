# FroshX Assistant (website chatbot)

## How it works now
1. A chat bubble ("Ask FroshX") on every public page.
2. **With AI turned on (recommended):** the assistant answers almost any question: about FroshX (courses, fees, registration, services) and general tech, learning and business questions.
3. If it can't answer (a custom price, a complaint, something only a person can decide), it asks the visitor for their **email** (name and WhatsApp optional) and says the team will get back soon.
4. That question lands in your **Chat inbox** at `/admin/chat` (a "Chat inbox" button also appears on your admin pages with the number waiting, and you get an email alert if Gmail is set up). You write a reply and it is sent to the visitor by email in the FroshX design.
5. **Without AI:** only the built-in answers work (courses, fees, registration, payment, start dates, certificate, services, contact). Everything else goes to the email-capture step.

## Turn on AI (so it can answer most questions)
In Vercel > Settings > Environment Variables add these, then redeploy:
- `AI_PROVIDER` = `gemini`
- `AI_API_KEY` = your key (free: go to aistudio.google.com, sign in, "Get API key")
- `AI_MODEL` = optional (default `gemini-2.5-flash`; if Google renames it, use the current name from AI Studio)
- `CHAT_SESSION_LIMIT` (default 15 AI answers per visitor per day) and `CHAT_DAILY_LIMIT` (default 300 per day in total) = optional spend/abuse protection
Anthropic (Claude) also works: `AI_PROVIDER=anthropic`, `AI_API_KEY=...` (this one is paid per use).
Gemini's free tier has usage limits that Google can change, and free-tier prompts may be used by Google to improve its products. Check the current terms.

## Give it your real website prices (important)
Open `lib/chatKnowledge.ts` and fill `AGENCY_NOTES`:
- `price`: e.g. "Websites usually start from ₦150,000 depending on the pages and features."
- `timeline`: e.g. "A typical website takes 2 to 4 weeks."
If you leave them empty, the assistant says the price depends on the project and offers a quote by email. It never invents prices.

## Email replies
Replies use the same Gmail setup as the registration emails (`GMAIL_USER`, `GMAIL_APP_PASSWORD`).

## Files
New: `lib/chatKnowledge.ts`, `models/ChatLog.ts`, `models/ChatEnquiry.ts`, `app/api/chat/route.ts`, `app/api/chat/enquiry/route.ts`, `app/api/admin/chat/route.ts`, `app/api/admin/chat/reply/route.ts`, `app/admin/chat/page.tsx`, `components/chat/*`.
Replaced: `components/academy/PageLoader.tsx` (mounts the chat bubble).
