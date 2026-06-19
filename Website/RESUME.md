# Nexli Marketing Website — RESUME

> Current state and how to pick the project up. Read **CONTEXT.md** (next to this
> file) first for the what/why; this file is the where-we-are and how-to.

_Last updated: 2026-06-20._

---

## 1. Current state — what's built

**Status: the complete website is built and the production build is green —
~2,233 static pages.** Everything below exists and renders.

- **Navigation** — header with Platform mega-menu + Solutions/Company dropdowns,
  Demo/Pricing/Knowledge Base links, WhatsApp Contact CTA; footer grouped into
  Product / Resources / Company / Legal + Instagram link.
- **Product** — Platform overview, 12 module pages (`/platform/*`), Solutions
  index + 5 school types (`/solutions/*`), Pricing (approach only — no figures),
  Security, Compliance. All claims grounded in `../Web/Blog/NEXLI_FACTS.md`.
- **Company** — About, Founder (Person JSON-LD), Careers (honest, no fake roles),
  Contact (WhatsApp-primary + Web3Forms form).
- **Interactive demo** — `/demo` role picker → `/demo/<role>` apps for 6 roles,
  100% in-browser hardcoded sample data, no signup/login/backend.
- **Knowledge Base** — index + 20 paginated category pages + ~2,092 article pages,
  wired from `../Web/Blog/articles` via the custom loader (see CONTEXT.md §6).
- **Legal** — Privacy, Terms, DPA, Parent Consent (from `../legal` drafts), an
  authored Refund policy, and a legal index.
- **Support/utility** — FAQ, Founding Partner Program, HTML sitemap, branded 404,
  Accessibility statement.
- **SEO/AEO** — per-page meta/canonical/OG/Twitter, plus Organization + WebPage +
  Article + BreadcrumbList + FAQPage JSON-LD where relevant; `sitemap-index.xml`.

### Commit history on `website`
```
383b0ce  interactive no-signup demo for 6 roles
88ef1e0  legal pages + FAQ, founding-partner, sitemap, 404, a11y
316215d  wire ~2,092 Knowledge Base articles from Web/Blog
1c69c52  full navigation + product & company pages
5963fc3  scaffold Astro 5 marketing site + premium homepage
```

---

## 2. What's still open — owner TODO placeholders

All are deliberate placeholders, flagged with `TODO(owner)` in code. None block
the build; each just needs a real value before going live.

| # | What | Where | Notes |
|---|------|-------|-------|
| 1 | **WhatsApp Business number** | `src/lib/site.ts` → `WHATSAPP_NUMBER` | Currently `91XXXXXXXXXX`. Country code first, digits only (e.g. `919812345678`). Until set, every WhatsApp button is a dead link. |
| 2 | **Production domain** | `src/lib/site.ts` → `SITE.url` **and** `astro.config.mjs` → `site` | Both currently the explicit placeholder `https://domain.com`. Drives canonical URLs, sitemap, OG tags. **Never** use a real or Nexli-branded domain until one is actually registered. |
| 3 | **Web3Forms access key** | `src/pages/contact.astro` → `YOUR_WEB3FORMS_ACCESS_KEY` | Free key from web3forms.com for the email-form backup (WhatsApp is the primary CTA). |
| 4 | **Founder photo** | `src/pages/founder.astro` | Currently an elegant "YSR" monogram tile. Drop a real photo at `public/founder.jpg` and swap the monogram block. |
| 5 | **About + Founder narrative review** | `src/pages/about.astro`, `src/pages/founder.astro` | The full brand narrative was reconstructed on-brand (from the "Nexli wasn't built inside a boardroom…" opening + the clarity/systems philosophy + the canonical branding blocks). Read it and confirm it's in the right voice / replace with exact wording if preferred. |

Also note: the legal pages intentionally still say **"current and subject to final
legal review"** — get the drafts reviewed by a qualified Indian lawyer before
relying on them.

---

## 3. How to refresh the Knowledge Base content

The articles are a **snapshot** taken when the `website` branch was cut. The blog
generator keeps adding/editing articles on `master` in the main `Nexli` repo. To
pull newer content into the site:

```bash
# from the website worktree
cd "C:/Users/yashv/Desktop/Yashveer Singh Rajpoot/My-Apps/Nexli-website"
git fetch                # if master was updated elsewhere
git merge master         # brings updated Web/Blog (+ legal) into the website branch
cd Website
npm run build            # the custom loader picks up new/changed files automatically
```

The loader is resilient (lenient frontmatter, sanitized bodies), so new files in
whatever shape the generator produces will load without breaking the build. No
code changes needed to absorb more articles — only a merge + rebuild.

> Keep the commit rule: when committing website work, `git add Website` only —
> never `git add -A`.

---

## 4. How to run it

```bash
cd "C:/Users/yashv/Desktop/Yashveer Singh Rajpoot/My-Apps/Nexli-website/Website"

npm install            # first time only

npm run dev            # dev server → http://localhost:4321
npm run build          # production build → Website/dist  (~2,233 pages)
npm run preview        # serve the built dist locally

node scripts/optimize-logos.mjs   # one-off: regenerate web-sized logos in public/
```

Notes:
- First `dev`/`build` does a content sync (~30s) that runs the KB loader; the
  console logs e.g. `kb: loaded 2092 articles (256 salvaged, 0 skipped)`.
- `dist/`, `.astro/`, `node_modules/` are gitignored — never commit build output.

---

## 5. How to deploy to Vercel (when ready)

Deploy target is **Vercel** (static output). Before deploying, set the real domain
in both places listed in TODO #2.

1. **First, set the domain** — `SITE.url` in `src/lib/site.ts` and `site` in
   `astro.config.mjs` (replace `https://domain.com`).
2. **Import the repo** into Vercel and deploy the **`website` branch**.
3. **Project settings:**
   - **Root Directory:** `Website` (the Astro app is in this subfolder).
   - **Framework Preset:** Astro. **Build Command:** `npm run build`.
     **Output Directory:** `dist`.
   - Vercel clones the whole branch, so the build can still read `../Web/Blog` and
     `../legal` from the repo root — that's why those folders must stay committed
     to `website` (they are). No env vars required (static, no backend).
4. **Add the custom domain** in Vercel once DNS is ready, and confirm
   `https://<domain>/sitemap-index.xml` resolves.

> Re-deploy = push to `website` (or merge `master` → `website` to refresh KB
> content first, then push). Each push triggers a fresh static build.

---

## 6. Guardrails (carry these forward)

- Stage **only `Website/`**; never `git add -A`.
- Never edit `../Web/Blog/`, `../articles/`, the Python generators, or app/seed
  data — they are read-only inputs to this site.
- Never invent product features, customers, logos, testimonials, numbers, or
  awards. Product claims must be defensible against `../Web/Blog/NEXLI_FACTS.md`.
- No real or Nexli-branded domain in config until one is registered — use the
  `https://domain.com` placeholder.
- Don't publish specific prices — the pricing page describes the approach only.
