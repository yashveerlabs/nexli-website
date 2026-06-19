# Nexli — the School Operating System

**Nexli** is a built, working, multi-tenant **school ERP** for Indian schools — an installable PWA
covering 100+ roles across admissions, academics, attendance, finance, HR/payroll, communication,
compliance (DPDP / POCSO / RTE / CBSE), operations & safety, and analytics.

**Stack:** React 19 + TypeScript (strict) + Vite 6 + Tailwind v4 + Firebase (Auth + Firestore),
running on the free **Spark** tier. The app lives in [`Web/`](Web/).

**Status:** green on every gate — `tsc --noEmit` → 0 errors · `vite build` → OK ·
`npm test` (Vitest) → 234/234 · Firestore rules emulator → 249/0. The remaining launch blockers are
**owner-only external actions** (Blaze upgrade, payment gateway, key rotation, legal review),
tracked in [`docs/LAUNCH_RUNBOOK.md`](docs/LAUNCH_RUNBOOK.md). The current next phase is the
dedicated marketing website.

> **New here / resuming work?** Start with [`resume/RESUME.md`](resume/RESUME.md) (zero-context
> handoff) and [`context/CONTEXT.md`](context/CONTEXT.md) ("what Nexli is").

---

## Folder map

```
Nexli/
├── README.md                       ← you are here (folder map + doc index)
├── NEXLI_MASTER_SPECIFICATION.md   ← canonical product + architecture spec
├── BUILD_PROGRESS.md               ← dated change log of everything built
├── NEXLI_PRICING.md                ← finalized pricing
├── NEXLI_TEST_PLAN.md              ← demo/test plan (~930 seeded accounts, shared password)
│
├── context/CONTEXT.md              ← current canonical "what Nexli is"
├── resume/RESUME.md                ← zero-context session handoff — read this to resume
│
├── legal/                          ← DRAFT legal docs (Privacy, ToS, DPA, Parent Consent) — lawyer review pending
├── logo/                           ← brand logos (app icon + landing-page logo)
│
├── docs/
│   ├── LAUNCH_RUNBOOK.md           ← owner action list for go-live (external/paid steps)
│   ├── FIREBASE_SETUP.md           ← backend configuration reference
│   ├── feature-plans/              ← forward-looking feature plans (per feature: research + phased build)
│   └── archive/                    ← frozen historical docs (see docs/archive/README.md)
│
├── Web/                            ← THE APPLICATION (React + TS + Vite + Firebase PWA)
│   ├── src/                        ← app source (features, components, lib, app shell)
│   ├── test/                       ← Firestore security-rules tests
│   ├── scripts/                    ← admin / seed / demo Node scripts
│   ├── public/                     ← static assets + PWA icons
│   ├── docs/                       ← live dev guides: CONVENTIONS.md, TESTING_GUIDE.md
│   ├── Blog/                       ← ⚠️ knowledge-base content (see "Hands off" below)
│   ├── firestore.rules · firestore.indexes.json · firebase.json · .firebaserc
│   └── package.json · vite.config.ts · tsconfig.json · vitest.config.ts
│
├── articles/ · generate_articles.py · ARTICLE_GENERATION_STATUS.md   ← ⚠️ active content process (hands off)
│
└── .github/workflows/ci.yml        ← CI: typecheck → vitest → build (+ JDK-21 rules job)
```

---

## Key docs

| Doc | What it is |
|---|---|
| [`resume/RESUME.md`](resume/RESUME.md) | **Start here.** Where things stand, what's next, how to run/test. |
| [`context/CONTEXT.md`](context/CONTEXT.md) | What Nexli is — product + domain context. |
| [`NEXLI_MASTER_SPECIFICATION.md`](NEXLI_MASTER_SPECIFICATION.md) | The canonical product & architecture spec. |
| [`BUILD_PROGRESS.md`](BUILD_PROGRESS.md) | Full dated change log of everything built. |
| [`docs/LAUNCH_RUNBOOK.md`](docs/LAUNCH_RUNBOOK.md) | Owner runbook for every external go-live step (exact commands). |
| [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md) | Backend configuration reference (project, region, auth, free-tier mode). |
| [`docs/feature-plans/`](docs/feature-plans/) | Forward-looking feature plans (research + phased build per feature). |
| [`Web/docs/CONVENTIONS.md`](Web/docs/CONVENTIONS.md) | Engineering conventions — the contract every module follows. |
| [`Web/docs/TESTING_GUIDE.md`](Web/docs/TESTING_GUIDE.md) | How to test the app. |
| [`NEXLI_PRICING.md`](NEXLI_PRICING.md) | Finalized pricing (reference). |
| [`legal/`](legal/) | The four DRAFT legal documents (lawyer-review banner at the top of each). |
| [`docs/archive/`](docs/archive/) | Superseded reports, plans, audits, and continuity history (frozen). |

---

## Run · build · test

All commands run from [`Web/`](Web/):

```bash
npm install          # first time
npm run dev          # dev server → http://localhost:5173/   (health check: /healthz)
npm run build        # tsc --noEmit && vite build   (exit 0 = green)
npm test             # Vitest unit tests (234)
```

**Firestore rules tests** need **JDK 21+** (the system default Java 1.8 is too old for
firebase-tools 15). Use the Android Studio JBR:

```bash
cd Web && JAVA_HOME="/c/Program Files/Android/Android Studio/jbr" PATH="$JAVA_HOME/bin:$PATH" npm run test:rules
# Expect: PASS: 249  FAIL: 0
```

**Demo accounts:** see [`NEXLI_TEST_PLAN.md`](NEXLI_TEST_PLAN.md) (~930 seeded accounts, shared
password). On the free Spark tier, heavy click-through can hit the daily read cap — that looks like
errors but isn't a bug; test in batches.

---

## ⚠️ Hands off

- **`Web/Blog/`, `articles/`, `generate_articles.py`, `ARTICLE_GENERATION_STATUS.md`** — an active,
  separate content-generation process owns these. Do not move, rename, or edit them.
- **The owner Super Admin account (`yashveersr4@gmail.com`) and all demo/seed data** — never touch.
- **Secrets** (`Web/.env`, `Web/serviceAccount.json`) are gitignored — never commit them. Key
  rotation is tracked in the launch runbook.
