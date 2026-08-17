# FroshX Technologies — Website

Next.js 14 (App Router) + TypeScript + Tailwind CSS.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Before you launch — things to finish

1. **Phone number & WhatsApp.** Open `lib/site.ts` and replace the
   placeholder values for `phone` / `phoneDisplay` with your real business
   line, and `whatsapp` with `https://wa.me/234XXXXXXXXXX` (your number,
   country code, no spaces or leading zero).
2. **Pricing & timeline.** Still in `lib/site.ts`, `startingPrice` and
   `typicalTimeline` feed the small pricing strip on the homepage — set
   real figures or remove that block from `app/page.tsx` if you'd rather
   not publish a starting price.
3. **Testimonial.** `TESTIMONIALS` in `lib/site.ts` currently holds a
   placeholder quote, clearly marked as such — swap it for a real line
   from a client (e.g. the Faculty of Education Student Union) once you
   have one. Don't publish the placeholder text as-is.
4. **Contact form → real inbox.** The form on `/contact` currently opens the
   visitor's email app (mailto) pre-filled with their message — it works
   with zero setup, but for a fully in-page "submitted" flow, connect a
   provider like [Resend](https://resend.com) or
   [Formspree](https://formspree.io) and swap the `handleSubmit` logic in
   `components/ContactForm.tsx` for a POST to an API route.
5. **Analytics.** Add Google Analytics / Plausible / Vercel Analytics inside
   `app/layout.tsx`, and only load the script after a visitor accepts
   cookies (listen for the `froshx-consent` window event dispatched by
   `components/CookieConsent.tsx`).
6. **Domain & metadata.** `lib/site.ts` sets `url: "https://froshx.ng"`.
   Update this if the live domain is different — it feeds the sitemap,
   robots.txt, canonical URLs and Open Graph tags.
7. **Open Graph image.** Swap `/public/images/froshx-logo.png` for a proper
   1200×630 social-share image once you have one — the square logo works
   but a dedicated OG image will look sharper when the site is shared.

## Deploy

The fastest path is [Vercel](https://vercel.com):

1. Push this project to a GitHub repository.
2. Import it at vercel.com → New Project.
3. Vercel auto-detects Next.js — no config needed. Deploy.
4. Point your `froshx.ng` domain at the Vercel project (Project → Settings → Domains).

## After launch — get found on Google

1. Go to [Google Search Console](https://search.google.com/search-console),
   add `froshx.ng` as a property, and verify ownership.
2. Submit `https://froshx.ng/sitemap.xml` under Sitemaps.
3. Use "Request indexing" on the homepage and key pages to speed things up.
4. Add the site to [Bing Webmaster Tools](https://www.bing.com/webmasters) too — it's quick and covers a second search engine.

## Project structure

```
app/            routes (home, about, work, team, contact, privacy)
components/     Header, Footer, cookie banner, cards, form, icons
lib/site.ts     all site copy, contact details, work items, services
public/         logo + team photos
```
