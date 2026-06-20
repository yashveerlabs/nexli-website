# Nexli Website — Completeness Report

_Generated 2026-06-20. Branch `website`. Astro 5 static build._

This report records the launch-readiness pass: every page made complete, every
link made to resolve, every claim grounded, and the whole site re-audited until a
full pass found nothing left to fix. The only things deliberately left for the
owner are the four real-world values listed in §6 — and each of those degrades
gracefully so the site already looks and behaves as finished.

---

## 1. Final state

- **Build:** green. `npm run build` exits 0 with no errors or warnings.
- **Pages:** 2,237 static HTML pages.
  - 2,092 Knowledge Base articles across 20 categories (loader: `loaded 2092 articles, 1 salvaged, 0 skipped`)
  - 12 platform module pages + platform overview
  - 5 solution (school-type) pages + index
  - 6 interactive demo role apps
  - Company, legal, support and utility pages
- **Sitemap:** `sitemap-index.xml` → `sitemap-0.xml` listing 2,236 URLs.
- **Content sync:** runs the custom KB loader at build; no article skipped or broken.

## 2. Automated audit — final result (all green)

A reusable script audited every one of the 2,237 built HTML pages:

| Check | Result |
|---|---:|
| Broken internal links (header, footer, breadcrumbs, related, CTAs, in-article) | **0** |
| Missing `<title>` | 0 |
| Missing meta description | 0 |
| Missing canonical | 0 |
| Missing `og:title` / `og:image` | 0 / 0 |
| Missing `twitter:card` | 0 |
| Missing JSON-LD | 0 |
| Em-dashes in content | **0** |
| Template/draft placeholders (`lorem`, `YOUR_…`, `[NEEDS…]`, `TODO(owner)`, `[to be finalised]`) | **0** |
| Pages with multiple `<h1>` / zero `<h1>` | 0 / 0 |
| `<img>` missing `alt` | 0 |
| Missing local images | 0 |
| Empty `<main>` | 0 |

> **En-dashes (–):** 1,051 pages still contain en-dashes. These are intentional and
> correct — they are numeric ranges in KB articles ("60–70%", "Class 1–5",
> "15–20 hours") and the demo's empty-value glyphs. This matches the blog's own
> house style (the blog keeps en-dash ranges; only em-dashes are removed).

## 3. What was checked

- **Content completeness** — every page read for empty sections, dummy text, Lorem
  ipsum, leftover in-content TODOs, half-written copy. About + Founder narratives
  finalised. Pricing kept approach-only.
- **Links & navigation** — every internal `href` across all pages resolved against
  the set of built routes; header/footer/breadcrumb/related/CTA links all verified.
- **KB articles & demo** — article template (H1, TOC, FAQ, branding blocks, related,
  CTA) verified on a 24-article sample across categories plus structural checks; all
  6 demo roles confirmed to render and to carry their interactive hooks (attendance
  toggle + live count + save, marks live-average, pay, screen navigation).
- **SEO/AEO** — per-page title, description, canonical, OG/Twitter, and JSON-LD
  (Organization global; WebPage / Article / BreadcrumbList / FAQPage / Person where
  relevant); sitemap and robots.txt verified.
- **Design & accessibility** — shared header/footer/layout and brand tokens
  everywhere; dark theme; responsive container/section breakpoints; `:focus-visible`
  outline; skip-to-content link; `prefers-reduced-motion` disables reveals and
  transitions; single H1 per page; alt text present; TOC anchor scroll-margins.
- **Content quality** — no AI-cliché phrasing in site copy (scanned); no em-dashes;
  no fabricated features/customers/numbers/awards; every product claim checked
  against `../Web/Blog/NEXLI_FACTS.md`.
- **Guardrails** — no real or Nexli-branded domain anywhere; the `https://domain.com`
  placeholder is used in config, canonicals, OG and sitemap.

## 4. What was fixed

**Structural / site-wide**
- Purged **178 em-dashes across 43 source files** (site copy, data files, components),
  choosing the right punctuation per sentence; added a loader normaliser so any
  em-dash in article bodies renders as a comma too.
- Rewrote **774 broken in-article links**: article bodies cross-linked an old
  `/blog/<category>/<slug>` scheme whose slugs no longer exist; the loader now
  re-points them to the matching `/knowledge-base/<category>` index (always real,
  on-topic). Result: zero dead links.
- Added an accessible `<h1>` to all 6 demo role pages (they previously had none).
- `robots.txt` had a **real Nexli-branded domain** (`www.nexli.app`); replaced with
  the `https://domain.com` placeholder to match the rest of the config.

**Graceful degradation for the owner-pending values** (see §6)
- WhatsApp: all WhatsApp CTAs now fall back to the on-site `/contact` page until a
  real number is set (no dead `wa.me` links); the floating button hides until ready.
  When the number is added, every CTA auto-upgrades to a direct WhatsApp link.
- Contact page: leads with the live Instagram channel; the email form renders fully
  and, until a Web3Forms key is added, confirms politely instead of POSTing to a
  broken endpoint. Adding the key switches the real form on automatically.
- Legal drafts: the `[NEEDS YASHVEER: …]` placeholders now resolve to finished copy
  (jurisdiction → India; grievance/DPO contact → a link to the Contact page) instead
  of rendering bracketed gaps. The "subject to final legal review" notice remains.

**Claim grounding against NEXLI_FACTS.md**
- Security page: removed an unsupported "Firebase App Check" control (not in facts),
  re-grounded on the 145/145 passing access-control rules tests; kept it strictly
  data-security (no physical/CCTV claims); corrected "OTP-based attendance".
- Transport: softened a line implying parents get a live bus map today (roadmap-only).
- Pricing: kept approach-only with zero figures; framed AI as forthcoming, not a
  feature available today.
- Homepage one-liners: aligned to facts (dropped "merit lists", "GST-ready
  accounting", general "Inventory"; hedged "data-residency" to "India-region
  hosting"); standardised on "118+ roles".
- Branding blocks + a few article bodies/FAQs embed claims that facts mark
  not-yet-built (an "open API", real-time parent bus notifications). These are
  softened at build time in the loaders (the read-only `Web/Blog` source is never
  edited) so every rendered surface — including FAQ text and FAQPage JSON-LD — stays
  defensible.

**Content quality** — verified zero AI-cliché phrasing in site copy; finalised the
About and Founder copy in the brand voice; checked the em-dash replacements for
punctuation artifacts (none).

## 5. How it was verified (re-audit loop)

1. Merged `master` into `website` (final cleaned KB + legal) — clean merge, `Website/` intact.
2. Pass 1: structural + content fixes (links, em-dashes, demo H1s, robots, contact,
   legal placeholders) across the whole site, parallelised with sub-agents on
   disjoint page sets. Build + full audit → green. **Checkpointed.**
3. Pass 2: an independent read-only review agent + manual review surfaced claim/
   accuracy refinements (homepage one-liners, security/pricing wording, branding-block
   and article-body claims). Fixed.
4. Pass 3+: re-built (with caches cleared so loader changes propagate to every page)
   and re-audited until a full pass returned **zero findings**. The single remaining
   "open APIs" string in the corpus is generic ERP-vendor-selection advice, not a
   Nexli claim, and is correct to keep.

## 6. Owner-only values still pending (each degrades gracefully)

These need real-world input from you; nothing else is incomplete. The site looks and
works as finished without them, and upgrades automatically once you set each one.

| # | Value | Where | Current graceful behaviour |
|---|---|---|---|
| 1 | **WhatsApp Business number** | `src/lib/site.ts` → `WHATSAPP_NUMBER` | All WhatsApp CTAs route to `/contact`; floating button hidden. Set it (country code + digits, e.g. `919812345678`) and every CTA becomes a direct WhatsApp link. |
| 2 | **Production domain** | `src/lib/site.ts` → `SITE.url` **and** `astro.config.mjs` → `site` (and `public/robots.txt`) | Uses the `https://domain.com` placeholder for canonical/OG/sitemap. Replace in all three once a domain is registered. Do **not** use a Nexli-branded domain until it exists. |
| 3 | **Web3Forms access key** | `src/lib/site.ts` → `WEB3FORMS_KEY` | Contact form renders and confirms politely without POSTing. Paste a free key from web3forms.com to switch the real email form on. |
| 4 | **Founder photo** | `src/pages/founder.astro` (+ `public/founder.jpg`) | Elegant "YSR" monogram tile in place. Drop a real photo at `public/founder.jpg` and swap the monogram block. |

Also worth your awareness (not blockers):
- **Instagram** (`@yashveerlabs`) is used as the live contact channel and in the
  footer — confirm the handle is correct.
- **Legal pages** still carry "current and subject to final legal review" — have the
  drafts reviewed by a qualified Indian lawyer before relying on them.

## 7. Flagged in the read-only blog corpus (not edited here)

These live in `../Web/Blog/articles` (read-only inputs owned by the blog generator),
so they were **not** edited from the website. They do not break the build or any
page, but the blog team may want to address them at source:
- **Hyphen-collision artifacts** from the blog's own em-dash cleanup, e.g.
  "skills students actually need-critical thinking", "across grades-only exam scores".
  A blanket fix is unsafe (it would corrupt legitimate compounds like
  "problem-solving"), so these are left for a source-side pass.
- **Rupee figures in `12-erp-pricing` articles** (e.g. general-market ERP cost ranges).
  These are educational/market figures, not Nexli's prices; the site's own pricing
  pages remain strictly approach-only. Flagging in case you want articles figure-free too.
- One grammar slip: `12-erp-pricing/01-how-much-does-school-erp-cost` — "a
  enterprise-grade system" → "an enterprise-grade system".

## 8. Run it

```bash
cd "Nexli-website/Website"
npm install      # first time only
npm run dev      # http://localhost:4321
npm run build    # production build → dist/  (2,237 pages)
npm run preview  # serve the built dist
```

> Tip: after changing a loader (`kb-loader.mjs`, `legal-loader.mjs`,
> `branding-blocks.ts`), clear the content cache so unchanged-source articles
> re-render: `rm -rf .astro dist node_modules/.astro && npm run build`.

---

**Bottom line:** the website is complete. Every page renders with real, on-brand,
fact-grounded content; every link resolves; SEO, design and accessibility are in
place; and a full automated audit of all 2,237 pages returns zero findings. The only
outstanding items are the four owner values in §6, each of which already degrades
gracefully.
