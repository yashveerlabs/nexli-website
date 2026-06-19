# Nexli Marketing Website — CONTEXT

> What this project is, how it's set up, and how it fits next to the Nexli app.
> Read this first if you're a new session with no prior memory. For current
> status and how to resume work, see **RESUME.md** next to this file.

---

## 1. What it is

The public marketing website for **Nexli — the School Operating System for modern
education** (a cloud ERP for Indian K-12 schools, built by **Yashveer Labs**,
founder **Yashveer Singh Rajpoot**).

It is a **static site**: marketing/product pages, a large SEO Knowledge Base
wired from existing markdown, and a no-signup interactive product demo. It is a
separate codebase from the Nexli app — it talks to no backend and has no auth.

---

## 2. Stack

- **Astro 5** (v5.18.2) — static site generation, **Content Layer API**.
- **Tailwind v4** via the `@tailwindcss/vite` plugin (NOT `@astrojs/tailwind`).
  Design tokens live in a `@theme` block in `src/styles/global.css`.
- **@astrojs/sitemap** — generates `sitemap-index.xml`.
- **sharp** — one-off logo optimization (`scripts/optimize-logos.mjs`).
- Fonts: **Fraunces** (display serif) + **Inter** (body), via Google Fonts.
- No client framework, no islands beyond small inline `<script is:inline>` blocks
  (header menu, scroll reveal, demo screen-switching, demo interactivity).

---

## 3. Folder / worktree setup  ⚠️ important

The site lives in a **separate git worktree** so its commits never collide with a
concurrent blog-generator process that commits to `master` in the main repo.

```
C:\Users\yashv\Desktop\Yashveer Singh Rajpoot\My-Apps\
├─ Nexli\            ← main app repo (branch: master) — the blog process commits here
└─ Nexli-website\    ← THIS worktree (branch: website) — sibling dir
   ├─ Website\       ← the Astro site (all website work goes here)
   ├─ Web\Blog\      ← snapshot of article content the site reads (committed to `website`)
   ├─ legal\         ← legal-policy drafts the site reads
   ├─ logo\          ← brand logos (source for public/ images)
   └─ … (the rest of the app tree, inherited from the branch point)
```

- **Branch:** `website`. **Site root:** the `Website/` subfolder.
- **COMMIT RULE (do not break):** stage **only** `Website/` — `git add Website`.
  **Never `git add -A`.** Every commit in this project touches only `Website/`.
  This is what keeps the website work isolated from the app + blog process.
- The build reads sibling folders by relative path: `../Web/Blog/articles`,
  `../Web/Blog/BRANDING_BLOCKS.md`, `../legal`. These are committed to the
  `website` branch, so the build is self-contained and reproducible.

---

## 4. Page structure

```
/                              Home (hero + module/compliance/KB teasers)
/platform                      Platform overview (links to all modules)
/platform/<slug>               12 module pages: admissions, fees, attendance,
                                 academics, report-cards, hr-payroll,
                                 communication, transport, hostel, library,
                                 medical-safety, compliance
/solutions                     Solutions index
/solutions/<slug>              5 school types: cbse, icse, state-board,
                                 boarding, international
/pricing                       Pricing APPROACH only (no rupee figures)
/security                      Security reference
/compliance                    Compliance reference (DPDP/POCSO/RTE/CBSE/UDISE+)
/about  /founder  /careers  /contact     Company pages
/demo                          Interactive demo role picker (6 roles)
/demo/<role>                   In-browser demo apps (principal, vice-principal,
                                 teacher, coordinator, student, parent)
/knowledge-base                KB index (20 categories, live counts)
/knowledge-base/<category>     Category index (page 1)
/knowledge-base/<category>/page/<n>      Category pagination
/knowledge-base/<category>/<slug>        ~2,092 article pages
/faq                           General FAQ (FAQPage JSON-LD)
/founding-partner              Founding Partner Program (replaces fake case studies)
/legal  /legal/<doc>  /legal/refund      Privacy, Terms, DPA, Parent Consent, Refund
/sitemap  /accessibility  /404           HTML sitemap, a11y statement, 404
```

Total: **~2,233 static pages** (the vast majority are KB articles).

### Key source files
- `src/lib/site.ts` — central config: SITE (name, url, tagline), WhatsApp
  number/message + `whatsappHref()`, Instagram URL, NAV (header dropdowns),
  FOOTER_GROUPS, MODULES/COMPLIANCE/KB_CATEGORIES.
- `src/lib/modules.ts` / `src/lib/solutions.ts` — content for the data-driven
  module + solution pages.
- `src/lib/seo.ts` — `webPage()` / `articleSchema()` JSON-LD helpers, `abs()`.
- `src/layouts/BaseLayout.astro` — HTML shell: head/SEO/OG, Organization JSON-LD,
  optional per-page `jsonLd` prop, Header + Footer + FloatingWhatsApp.
- `src/components/` — shared UI (PageHero, Breadcrumbs, Faq, CtaBand/CtaButtons,
  FeatureGrid, ArticleCard, KbCategoryView, JsonLd, Icon, Logo, Header, Footer);
  `home/` homepage sections; `demo/` the demo shell + 6 role components.

---

## 5. Design system & brand

- Tokens in `src/styles/global.css` `@theme`:
  - **obsidian `#080808`** (background), **gold `#C6A55C`** (accent),
    **ivory `#F7F2E8`** (text), plus shades + `--color-line` hairlines.
  - `--font-display: Fraunces`, `--font-sans: Inter`.
- Reusable plain-CSS classes (not utilities): `.container-nx`, `.section`,
  `.eyebrow`, `.btn`/`.btn-gold`/`.btn-ghost`/`.btn-whatsapp`, `.card`, `.chip`,
  `.callout`, `.kicker-chip`, `.text-gradient-gold`, `.glow-radial`,
  `.grid-texture`, `.prose-nx` (long-form article/legal styling), `.reveal`
  (scroll-in animation, respects reduced-motion), `.nx-input`, and `.demo-*`
  (demo app chrome + widgets + `.badge`).
- Dark theme throughout, mobile-first, aiming at WCAG AA (skip link, focus rings,
  semantic landmarks, reduced-motion handling).
- Primary CTA everywhere = **WhatsApp click-to-chat**; secondary = the live demo.

---

## 6. How the Knowledge Base content is wired

The ~2,092 articles come from `../Web/Blog/articles/<NN-category>/<NN-slug>.md`.
That corpus is **not uniform** — 5+ different frontmatter schemas, some files with
no frontmatter, BOM prefixes, and (the build-breaker) unquoted colons in titles
that crash stock YAML parsing. Astro's built-in `glob()` loader fails the whole
build on a single bad file, which is unacceptable here.

So the KB uses a **custom Content Layer loader**: `src/lib/kb-loader.mjs`
(wired in `src/content.config.ts` as the `kb` collection). It:
1. Walks `../Web/Blog/articles/*/*.md` with Node `fs` (skips loose root files).
2. **Parses frontmatter leniently** — strict YAML first, then a fallback that
   auto-quotes scalar values (recovering colon-in-title files), then empty
   frontmatter as a last resort. Nothing is ever thrown; nothing is lost.
   (Last build: 2,092 loaded, 256 salvaged, 0 skipped.)
3. **Sanitizes each body as a string** before rendering: trims trailing
   boilerplate (`## Branding Block` / `## Call to Action` / `## FAQ`), drops a
   duplicate leading `# H1` and `**Published:**` meta line, and rewrites any
   `nexli.*` marketing links to the internal `/demo`.
4. Renders via the loader context's `renderMarkdown` (so GFM tables + heading IDs
   work and headings feed the article TOC).

`src/lib/kb.ts` then **normalizes** every entry into one `Article` shape (category
from the folder, derived title/description, keywords, reading time, slug dedup,
related-article rotation) and extracts FAQs from the raw body. The per-article
rotating brand paragraphs are parsed at build from `../Web/Blog/BRANDING_BLOCKS.md`
by `src/lib/branding-blocks.ts`. Article pages emit **Article + BreadcrumbList +
FAQPage** JSON-LD.

Legal pages work the same way: `src/lib/legal-loader.mjs` reads the `../legal`
drafts, strips internal "DRAFT / not legal advice" notes and `[NEEDS YASHVEER]`
markers, and renders them (source files untouched).

> Because all of this reads sibling folders by relative path, the `Web/Blog` and
> `legal` snapshots must be present in whatever branch is built (they are committed
> to `website`).

---

## 7. Isolation from the app and the blog process

- **From the app:** different repo dir, different branch, no shared build, no
  backend calls. The site only *reads* `Web/Blog` + `legal` markdown at build.
- **From the blog generator:** it commits article markdown to `master` in the
  main `Nexli` repo. The website lives on `website` in a separate worktree and
  **only ever stages `Website/`**, so the two never collide. To pull in newer
  articles, merge `master` into `website` and rebuild (see RESUME.md).
- **Never touched** by this project: `Web/Blog/`, `articles/`, the Python
  generators, the Super Admin account, or any app/seed data. The site treats the
  content folders as read-only inputs.
