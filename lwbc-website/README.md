# Living Water Baptist Church — Website

Static-first church website powered by Astro.

## Pages
- Home: `/`
- Announcements: `/announcements`
- Bible Reading Plan: `/reading-plan`
- Services (YouTube): `/services`

## Data (shared with future mobile app)
These JSON endpoints are generated at build time:
- `/api/church_info.json`
- `/api/announcements.json`
- `/api/reading_plan.json`
- `/api/sermons_youtube.json`

Edit the source JSON in `src/data/` and rebuild/deploy.

## Run locally
```bash
npm install
npm run dev
```

## Deploy
This builds to static files in `dist/` and can be hosted on Cloudflare Pages, GitHub Pages, Netlify, etc.


## Bulletin-style announcements (like the printed handout)
`src/data/announcements.json` supports two formats:

1) Simple announcement (Markdown)
```json
{
  "title": "Welcome!",
  "bodyMarkdown": "Thanks for joining us this week."
}
```

2) Bulletin announcement (structured sections / bullet lists)
```json
{
  "title": "THÔNG BÁO - ANNOUNCEMENT",
  "format": "bulletin",
  "bulletin": {
    "sections": [
      {
        "heading": "Thông báo",
        "headingEn": "Announcements",
        "items": [
          { "text": "Học Kinh Thánh...", "details": "7:30pm–8:30pm • Jan 17..." }
        ]
      }
    ]
  }
}
```

This keeps the website human-friendly **and** preserves a clean JSON structure for a future mobile app.
