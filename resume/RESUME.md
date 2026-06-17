# NEXLI — Resume (where we are, what's next)

_Plain-English handover to pick up exactly where things stand. For background on what Nexli is, read `context/CONTEXT.md`._

---

## Current state (in short)
The app is **built and running** on Firebase (free Spark tier). It's a working, multi-tenant school ERP (an installable PWA) with a Super Admin platform console, all the school / parent / student modules, a **data-driven roles & permissions system**, **student & staff profile pages**, a **size-band pricing model**, a **fully-seeded demo school** (~930 realistic test accounts), and **deployed Firestore security rules**. It compiles cleanly (`npm run build`, exit 0). It is an **excellent demo**, but it has **not yet been hardened for a real school** (deeper security + real payments are still pending).

## What's done and working
- App shell, navigation, login, and session/tenancy resolution (sign in → school → role → permissions).
- **Super Admin platform console** — Schools, Subscriptions, Plans & Pricing, Users & Roles, **Roles & Permissions**, Analytics, Onboarding, Health, Support, Audit, Settings.
- **School modules** — students, attendance, academics, gradebook, homework, exams, holistic progress cards, fees, expense & procurement, HR, payroll, transport, hostel, library, medical, compliance (UDISE+/RTE/SMC), events, communication, messaging, and more.
- **Parent and student portals.**
- **Data-driven roles & permissions** — ~118 roles in 14 groups with levels; module × action matrix; editable by a Super Admin (no code change); enforced in menus + pages; sensitive data locked in the security rules.
- **Student & staff profile pages** — searchable lists → full profiles; payroll and health tabs are permission-gated.
- **Pricing model = size bands**, all features included, AI-only add-on, per-school custom/founding price override built.
- **Demo school fully seeded** — 45 classes, 300 students, 300 linked parents, 300 staff (every role), 30 alumni, 1 test Super Admin, student leadership titles; one shared password (see `NEXLI_TEST_PLAN.md`).
- **Firestore security rules deployed** — tenant isolation; sensitive-collection role allowlists aligned to the new roles; rules for role definitions; the "school admin" role list expanded so the right roles can manage users/settings.
- **Recent polish fixes done** — cleaned out gibberish demo data; fixed mismatched counters, the attendance %, run-together text, the Expenses layout + overlapping buttons, the account/sign-out drawer position; hid empty "In build" menu items; made the school name consistent; numeric roll-number sort; tidied the payment-QR box.
- The owner Super Admin **`yashveersr4@gmail.com`** has been preserved throughout.

## What's still pending / unfinished (priority order)
1. **Phase A security hardening — highest priority before any real school.** Tighten the deployed Firestore rules to be **fully role-aware** (today they enforce tenancy + sensitive-collection allowlists, but not every per-module action), split any "all-peers-in-one-document" data into **per-student documents**, and add **App Check**. Plan: `PHASE_A_PLAN.md`.
2. **3 role-permission decisions waiting on you (quick).**
   - (a) Should **POSH / POCSO Committee** members get access to child-protection (POCSO) records, or only to compliance/grievances?
   - (b) Same question for **ICC (Internal Complaints Committee)** members?
   - (c) Should **Sports/PET & Arts teachers** be able to **record** co-scholastic marks (Holistic Progress Card), not just view?
   - Until you decide, those sensitive accesses are kept **off** (tight) by default.
3. **"In build" pages.** A few menu destinations are still placeholders and are currently **hidden from the menus**: staff **Settings** and **Security**; parent **Academics, Calendar, School Notices, Certificates, Wellness, Parent-Teacher Meeting**. Decide which to actually build.
4. **Size-band pricing ENGINE + real payment/charging system (for later).** Today plans are assigned manually and only the custom-price override exists — there's no automatic band calculation, proration, invoicing, or payment gateway yet.
5. **Role-by-role mobile testing (in progress).** Use `NEXLI_TEST_PLAN.md` to sign in as each role and confirm the menus, screens, and saving all work on a phone-size screen (Galaxy S20). Spread it across days because of free-tier limits.
6. **(Lower) Custom roles + sensitive data.** A brand-new role created in the Roles UI won't automatically get the most sensitive collections (medical / POCSO / counselling / grievances) at the rules layer — that's **fail-closed by design**. Wiring a custom role into those needs a one-line rules edit + redeploy.

## Known problems / open questions
- The **3 role-permission decisions** above are open (waiting on you).
- The **free Firebase (Spark) plan has daily limits** — logging into and clicking through ~930 accounts in one day can hit them; it looks like errors but it's the quota, not a bug.
- **Phase A items** (looser-than-ideal rules, per-student data split, App Check) are the main gap between "great demo" and "safe for a real school with real children's data."
- Any **new custom role** needs a rules edit to touch sensitive collections (by design, above).

## How to run and test
- **Start the app:** open a terminal in **`Web/`** and run **`npm run dev`**, then open the printed URL — usually **http://localhost:5173/**.
- **Check it builds:** **`npm run build`** (runs the type-check + production build).
- **Sign in:** use any account from **`NEXLI_TEST_PLAN.md`** with the **shared password** written in that file. (Your own Super Admin `yashveersr4@gmail.com` is separate and unchanged.)
- **Test on a phone-size screen:** open the app in **Chrome** → press **F12** → click the **device-toolbar** icon (or press **Ctrl+Shift+M**) → choose **"Galaxy S20"** → reload.
- **Test accounts file:** **`NEXLI_TEST_PLAN.md`** (project root) has every account (role, name, email, phone) grouped, plus a step-by-step testing order.
- **Free-tier warning:** Firebase Spark has **daily** read/write/auth limits. If things start failing during heavy testing, it's almost certainly the daily quota — **test in batches across days**; quotas reset daily.

## The single most important next step
**Start Phase A security hardening** (`PHASE_A_PLAN.md`) — make the deployed Firestore rules fully role-aware and split the sensitive per-student data. That is the one thing standing between this (an excellent demo) and **safely onboarding a real school with real children's data**. _Tip:_ first clear the 3 quick role-permission decisions above — that takes minutes and lets the role catalogue be finalised before the rules are tightened around it.
