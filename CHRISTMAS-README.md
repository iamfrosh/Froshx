# FroshX Christmas edition

What this adds (all decoration, nothing about your pages, forms, logins or APIs changes):
- Gentle snowfall with a few gold sparkles (canvas, paused when the tab is hidden, not shown on /admin)
- Santa hat on the top-left corner of the logo, with an occasional tilt
- String of lights along the bottom of the menu bar, plus 3 swinging ornaments near the top of the page
- Snow caps on the dark sections and the Academy block
- Christmas loader (a tree that lights up, under snow) and snowflake spinners
- Festive footer strip with the message "Building beautiful digital experiences this Christmas."
- Gold glow on buttons, sparkles when pressing the main buttons, a light sparkle trail behind the mouse (desktop only)
- Floating gift button (bottom right) that opens an animated gift with the FroshX Christmas greeting
- Full-screen "Welcome Back to FroshX!" animation after a successful student or admin login, with a Skip button. It plays once per login and then fades into the dashboard.

## How to add it
Copy the files in this folder into your project (same folder paths) and commit. Only two existing files are replaced:
`components/academy/PageLoader.tsx` and `app/loading.tsx`. No new packages are needed.

## Turn it off
- Early: add `NEXT_PUBLIC_CHRISTMAS=off` in Vercel > Settings > Environment Variables, then redeploy.
- It switches itself off after 7 January 2027. Change the date in `components/christmas/christmasConfig.ts` to extend it.
- Visitors who prefer reduced motion get a still, calm version (no movement).
