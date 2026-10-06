# Dental to BCS

Static BDS/BCS question practice app prepared for Vercel.

## Structure

- `public/index.html` — page structure
- `public/css/style.css` — all CSS
- `public/js/app.js` — all browser JavaScript and fallback questions
- `api/fetch-sheet.js` — Vercel serverless proxy for the Google Apps Script
- `vercel.json` — Vercel deployment configuration
- `package.json` — minimal build configuration

## Deploy

Upload/push the whole project to GitHub and import the repository into Vercel.

The Vercel Output Directory is already configured as `public`, so the previous
“No Output Directory named public found” error is avoided.

Do not upload `.env` files containing secrets.
