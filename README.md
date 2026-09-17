# Dang Le portfolio

Static Astro portfolio deployed at https://dacodahub.github.io/.

## Local development

Use Node.js 22.19 or later. Run `npm install`, `npm run dev`, `npm run check`, and `npm run build`.

## Content

- `src/content/projects/*.md` contains the six existing projects. Frontmatter is validated in `src/content.config.ts` and powers both the homepage and `/projects/`.
- A project gets a `/projects/[slug]/` page only when its Markdown body contains a real case study and `caseStudy: true` is set in frontmatter. Keep that flag false while only metadata exists.
- Add technical articles as Markdown in `src/content/writing/` with `title`, `description`, and `publishedAt` frontmatter. Optional fields are `updatedAt`, `tags`, and `draft`. Set `draft: true` until ready. Published articles appear at `/writing/[slug]/` and `/writing/`.
- Static files such as the résumé and JobTracker screenshots live in `public/assets/` and use `/assets/...` URLs.

## GitHub Pages

This repository is the `dacodahub.github.io` user site, so Astro uses `https://dacodahub.github.io/` with no `base` path. `.github/workflows/deploy.yml` builds and deploys the static `dist/` output on pushes to `main`. In repository Settings → Pages, select **GitHub Actions** as the source before using the workflow.
