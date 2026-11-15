# FroshX Academy (registration, admin, reminders)

## 1. Create the database (free)
1. Go to mongodb.com/atlas, create a free **M0** cluster.
2. **Database Access** → add a user with a password.
3. **Network Access** → add `0.0.0.0/0` (needed because Vercel has no fixed IP).
4. **Connect → Drivers** → copy the connection string and put your database name in it, e.g. `.../froshx?retryWrites=true&w=majority`.

## 2. Add environment variables in Vercel
Project → **Settings → Environment Variables**, then **redeploy**:

| Name | Value |
|---|---|
| `MONGODB_URI` | your Atlas connection string |
| `ADMIN_PASSWORD` | the password you will use at `/admin` |
| `ADMIN_SECRET` | any long random text |

(`.env.example` shows the format. For local testing copy it to `.env.local`.)

## 3. Use it
- Landing page → a "Registration open" banner, an Academy section (fees, courses, quote slideshow) and buttons to the registration page.
- `/register` → the registration page (3 steps, course summary, FAQ). Links like `/register?course=web-development` preselect a course.
- Edit the slideshow quotes in `lib/quotes.ts`.
- `/admin` → sign in with `ADMIN_PASSWORD` to see registrations, unfinished registrations, visitors, and export CSV.
- Collections created automatically in MongoDB: `registrations`, `drafts`, `visits`.

## Edit course content, fees, reminder time
All in `lib/academy.ts` (course skills/outcomes, `FEES`, `ACADEMY.weeks`, `ACADEMY.reminderMinutes`).

## About the 20-minute reminder (important)
- Works while the site is open in any browser tab (even in the background): an in-page banner, plus a browser notification if the person tapped "Remind me if I don't finish".
- A website cannot notify someone after they close the browser completely, and iPhone Safari only allows notifications for sites added to the Home Screen. 
- That is why unfinished registrations are saved to the **Unfinished** tab in `/admin`, with a one-tap WhatsApp "Follow up" button. That is the reliable way to bring them back.

## Not included yet (ideas)
Payment (Paystack/Flutterwave), automatic confirmation emails/SMS, seat limits per course, cohorts.

## Email setup (confirmation emails + admin emails)
Emails are sent from froshxtechnologies@gmail.com through Gmail.
1. Sign in to that Gmail account → Google Account → **Security** → turn on **2-Step Verification**.
2. Open https://myaccount.google.com/apppasswords → create an App Password (name it "FroshX website") → copy the 16 characters.
3. In Vercel add `GMAIL_USER` = `froshxtechnologies@gmail.com` and `GMAIL_APP_PASSWORD` = the 16 characters (spaces are fine). Redeploy.
4. Open `/admin` → **Send email** → write a message → **Send test to myself**.
Gmail allows about 500 emails per day. If a confirmation fails, open the registration in `/admin` and press **Resend confirmation**.
Prices: edit `FEE_STANDARD` and `FEE_TECH` in `lib/academy.ts`.

## Projects (screenshots + link previews) managed in /admin
`/admin` → **Projects**: paste a link, press **Fetch preview** (reads the site's own title/description/preview image),
or choose **Auto screenshot**, or **Upload my own** screenshot. A live card shows exactly how it will look.
First time: press **Import my current projects** to bring in the ones already on the site, then add screenshots.
The homepage shows the projects ticked "Show on homepage"; the Work page shows all visible projects. Changes appear instantly.

## Student dashboard
- Students log in at `/dashboard/login` with their registration email and the starting password **1234556789**.
- On first login they must choose their own password. Passwords are stored hashed.
- The dashboard shows their registration status, start date and your message. Set those in `/admin` → registration → open the row.
- Change the starting password with the Vercel variable `STUDENT_DEFAULT_PASSWORD` (optional).
- Already-registered people: `/admin` → **Send email** → **Create accounts for everyone registered**, then **Send dashboard invitation**.
- Forgot password: open the registration in `/admin` and press **Reset password to default**.
- Limit: login proves someone knows the password, not that they own the email address. Add email verification later for stronger security.

## Website music
`/admin` → **Music**: pause or turn on for all visitors, set the volume, choose the built-in beat, upload an MP3 (max 4 MB) or paste a direct link.
Browsers only allow sound after a first tap or click, so it starts on the first tap. Visitors get a mute button (bottom left).
Only use music you own or are licensed to use.

## Floating WhatsApp button
Appears bottom-right on every public page. Number comes from `SITE.whatsapp` in `lib/site.ts`.
