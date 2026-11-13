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
- Landing page → **FroshX Academy** section with courses, fees, and the registration form.
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
