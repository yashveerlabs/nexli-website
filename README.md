# Nexli Website

Marketing website and knowledge base for **Nexli**, the School Operating System by Yashveer Labs.

Built with [Astro](https://astro.build) as a static site: fast, framework-free, and content-first.

## Structure

- `Website/`: the Astro project (pages, components, styles, and the build).
- `Web/Blog/articles/`: the knowledge-base article corpus rendered under `/knowledge-base`.
- `legal/`: source documents for the legal pages.

The knowledge-base and legal loaders read from those folders at build time, so they live alongside the site.

## Develop

```bash
cd Website
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # production build to Website/dist
npm run preview  # preview the production build
```

## Deploy

Hosted on Vercel. The project **Root Directory** is set to `Website`; the framework (Astro) and build command are auto-detected, and the static output is served from `Website/dist`.
