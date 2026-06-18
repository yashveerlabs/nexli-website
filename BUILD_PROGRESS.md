# NEXLI — Build Progress (report-driven, two tracks)

_Live status file. Updated continuously so work can be resumed cleanly if interrupted._
_Source of truth for the to-do list: `TEST_RESULTS.md` (project root)._

**Started:** 2026-06-17
**Safety checkpoint:** git initialised at Nexli root — baseline commit `d68c887` (pre-build). Roll back with `git reset --hard d68c887`.
**Guardrails:** Super Admin `yashveersr4@gmail.com` and demo data are NOT touched. No faked live connections to paid/government services.

**Approach note on subagents:** Track 1 fixes are surgical edits to shared files (nav, role catalogue, layout) where parallel writers would collide, so they are done directly and verified by the build + emulator rules tests. Subagents are used in Track 2 for parallelisable research and independent module builds, where they add real leverage.

---

## TRACK 1 — Fix every problem in the report (worst first) — ✅ COMPLETE (commit `7869958`)

| # | Item | Status | How |
|---|------|--------|-----|
| 1 | `/counselling` real page | ✅ done | New `features/counseling` (hub + data + route), nav item, registered for staff |
| 2 | Security stub removed | ✅ done | Removed `security` nav item → no stub route builds |
| 3 | Admissions nav gate | ✅ done | Gate changed `students.write` → `admissions.read` (fixes receptionist AND class-teacher in one) |
| 4 | Narrow governance roles | ✅ done | Dropped `hr` + `payroll` from `OVERSIGHT` matrix |
| 5 | Alumni menu leak | ✅ done | New `alumni` audience + `ALUMNI_NAV` + `AlumniDashboard` (no Staff Attendance / staff data) |
| 6 | Role titles/tiers | ✅ done | `AppLayout` folds `level` into role label; reads student leadership tag for prefect/captain |
| 7 | Modal Save pinned | ✅ done | `.nx-modal__panel` flex column; body scrolls; foot pinned (`kit.css`) |
| 8 | Bottom blank-space | ✅ done | `.nx-page { flex: 1 0 auto }` (`screens.css`) |
| 9 | Empty states + attendance | ✅ done | Family grid + student dashboard zero-data messages; AlumniDashboard removes confusing widget |
| 10 | Reports + RTE | ✅ done | Reports headline KPI = active students; RTE "Quota enrolment" tab derived from student data |
| 11 | Build + tests | ✅ done | `npm run build` exit 0; typecheck clean; emulator rules tests **96/0**. (No ESLint configured in repo.) |

_Note on subagents in Track 1: these were surgical edits to shared files (nav/catalog/layout/registry) where parallel writers would collide — done directly and proven by the build + rules tests rather than farmed to parallel build agents._

---

## TRACK 2 — Research → plan → build new modules

_Starts only after Track 1 is fully green. Plans live in `docs/feature-plans/<module>/`._

**Buildable now (offline / mock data):** counselling (done in T1), question paper generator, certificate generator, report card / NEP HPC, marks-ranking engine, attendance-ranking engine, role badges, empty-state/onboarding polish, gamified dashboard, skills passport, career-counselling (assessment logic), document management (offline).

**Blocked (need paid plan / API key / gateway / govt approval) — plan + offline shell only, never faked:** APAAR/ABC/DigiLocker, UPI AutoPay/eNACH + reconciliation, secure online exam (proctoring), IoT campus safety (hardware), WhatsApp Business API, SSO/Open API (partial), e-sign (paid), cashless wallet (gateway), AI at-risk (needs AI key — logic buildable, model blocked).

### Track 2 status (live)

Plans live in `docs/feature-plans/<module>/` (see that folder's `README.md` for index + legend).

**Planning:** 4 research+planning subagents launched in parallel, each writing phased plan files
(`research.md`, `Phase-1.md`…`Phase-N.md`) into its own module folders (markdown only — no code):
- A: question-paper-generator, certificate-generator, report-card-hpc
- B: gamified-dashboard, skills-passport, career-counselling
- C: apaar-abc-digilocker, upi-autopay-reconciliation, esign-document-management
- D: secure-online-exam, iot-campus-safety, whatsapp-automation, sso-open-api, ai-at-risk, cashless-wallet

**Planning: ✅ COMPLETE** — all 4 agents finished; **71 plan files across 17 modules** under `docs/feature-plans/`
(each module has `research.md` + `Phase-1…N.md`, every Phase-1 with a "BLOCKED vs buildable-now" header).

**Built modules (offline, real data):**
| Module | Status |
|---|---|
| Counselling workspace (`features/counseling`) | ✅ Built (Track 1) |
| Rankings — marks engine + attendance engine (`features/rankings`) | ✅ Built |
| Certificate Generator (`features/certificates`) | ✅ Built |
| Question Paper Generator (`features/qpaper`) | ✅ Built |
| Report Card — traditional marks card (`features/reportcard`) | ✅ Built |
| Gamified student dashboard (`features/gamification`) | ✅ Built |
| Skills Passport / e-portfolio (`features/portfolio`) | ✅ Built |
| Career-Counselling & aptitude (`features/career`) | ✅ Built |

- Rankings: separate marks (normalised exam %) + attendance engines, school/grade/section scopes, paginated lists, tie-breaks, medals, staff-only, honest empty states. Nav `Rankings` gated by `exams.read`.
- Certificates: issue Bonafide/Character/Conduct/Leaving/Transfer, auto-filled from student record, atomic serial numbers, issuance register + re-print, offline print-ready HTML. Nav `Certificates` gated by `students.write`.

**Pending build (buildable; full plans written):** question paper generator (needs a question-bank build),
report card / NEP HPC (HPC exists; add traditional marks card), gamified dashboard, skills passport,
career-counselling (assessment-scoring logic).

**Rules follow-up (note):** the new `certificates` + `certificate_counters` + `counseling`(already locked) +
ranking-read collections — `certificates` currently uses the default tenant rule (staff write / member read).
Add `certificates` to the Phase-A own-scoped/role-locked rules before real use (one-line rules edit + redeploy).

**Blocked (plan + offline shell only — no faked live services):** APAAR/ABC/DigiLocker, UPI AutoPay/eNACH,
secure online exam (proctoring), IoT campus safety (hardware), WhatsApp Business API, SSO/Open API,
cashless wallet (gateway), e-sign (legal), AI at-risk (AI key — scoring logic buildable).

---

## Changelog
- 2026-06-17 — Git checkpoint `d68c887`; task list + this progress file created. Beginning Track 1 investigation.
- 2026-06-17 — Track 1 COMPLETE → commit `7869958` (build green; emulator rules tests 96/0).
- 2026-06-17 — Track 2 started: plans folder + 4 planning subagents launched; built Rankings module (marks + attendance).
- 2026-06-17 — Certificates collection locked in rules (staff-only) + tests 100/0 + **deployed** (ruleset `d9250142`).
- 2026-06-17 — Built Question Paper Generator (`features/qpaper`, commit `417cf68`); rules tests 105/0; verification subagent run + fixes applied.
- 2026-06-17 — Launched 4 parallel build agents (in flight): Report Card (`features/reportcard`), Gamified Dashboard (`features/gamification`), Skills Passport (`features/portfolio`), Career-Counselling (`features/career`). Each builds only its own feature folder; parent integrates nav/registry/roles/rules + gates + verification + commit per module as they land.
- 2026-06-17 — All 4 build agents complete. Integrated all four (nav + registry for staff/parent/student as relevant), locked their collections in rules, fixed integration issues (career student query scoped to own; portfolio staff verify-gate → `students.write`). Full build green; strict typecheck clean; emulator rules tests **119/0**. Committed `cd0ee28`.
- 2026-06-17 — 4 verification subagents reviewed the modules; fixes applied + committed `b57bb93`: 2 BLOCKERs (skills-passport index-requiring query → client-side sort; report-card grade-band gap → highest-band-by-minPct), + skills print school name, gamification `leave` freezes streak, report-card permission-matrix row. Career verified clean. Build green; rules tests **119/0**.
- 2026-06-18 — Full-codebase review + rules hardening pass (effort: max):
  - **STEP 1** — 12 parallel Opus subagents reviewed all of `Web/` line-by-line. Fixes (commit `6e56865`):
    route guard now enforces `anyPermission` (POCSO sub-routes no longer reachable by direct URL); family
    portal pages (attendance/homework/exams/HPC + comms inbox) fetch own children via `useStudentsByIds`
    (whole-`students` reads were denied by rules → blank pages); dashboard + student-profile outstanding
    dues recomputed as `net − paid` (root cause of the ₹0-vs-₹1.46L discrepancy); report-card NaN guard;
    transport IST date round-trip; staff-attendance unbounded read scoped; student event-audience filter;
    alumni-office + DPO permission grants; analytics/RTE surface read errors.
  - **STEP 2** — 3 Opus verifiers re-traced the 6 newest modules end-to-end (commit `144aae2`): all work;
    fix = report-card print no longer prints "Result: Fail" on an unmarked card.
  - **STEP 3** — two-pass rules review (subagent + self) → access reconciled for the 9 new collections
    (commit `c5369a2`): certificate **issuer allowlist** (unlocks HOD/VP-Admin/registrar/office, excludes
    operational staff); question papers → exam-staff-only; career → counselling-staff-only; report-card
    client write unblocks Exam Controller/Coordinators; `consent_purposes` locked. Emulator tests 119 → **145/0**.
  - **STEP 4** — rules **DEPLOYED** via Admin SDK → live ruleset `fa68c528-7134-4bbc-9776-5e4ebf30e21d`. Build green.
- 2026-06-18 — Retest follow-up (passed all but one tiny display bug):
  - **F4 fix**: Senior Academic Coordinator label → `Academic Coordinator (Senior)`, so the dashboard
    greeting shows the tier in parentheses like Junior/Associate (account modal already did). Build green.
  - **Demo academic data SEEDED** into `nexli-demo` (additive only — Super Admin + every account/student/
    staff/member doc untouched; Admin SDK `BulkWriter`; idempotent + deterministic; no rule change needed —
    all seeded collections are readable by the intended roles under the live ruleset). ~2,565 docs:
    - `attendance_days`: **1,350** (30 school days × 45 sections; realistic present/absent/late/leave mix).
    - `exams`: 1 published **"Term 1 Examination"** + `exam_papers` **79** (per grade × its subjects, max 100)
      + `exam_results` **300** (marks per subject, `percentage`+`total` for the marks ranking).
    - `reportCards`: **300** published CBSE 9-point cards, ranked within section (families see their own).
    - Fees: 3 `fee_heads`, 5 tier `fee_structures`, **300** `fee_invoices` (135 paid / 90 partial / 75 unpaid)
      + **225** `fee_payments`. Billed ₹2.15Cr · collected ₹1.30Cr · **OUTSTANDING ₹85,04,500**.
    - Scripts (committed): `scripts/{inspect-demo,seed-academic-demo,verify-academic-demo}.mjs`
      (run with `GOOGLE_APPLICATION_CREDENTIALS=serviceAccount.json`).
  - **Verified** by read-back: marks ranking is fair across classes (UKG 99% ranks above Class 12 39%);
    attendance ranking spreads 58–100% over 30 days; a sample card has real grades (Nursery-A 80.3%, CGPA 8.3,
    pass, rank 6/7); dues agree (net−paid) across dashboard/finance/student-profile. Build + typecheck green;
    emulator rules tests **145/0**. Spark write budget: ~2.6k of 20k/day (representative full set — no subset needed).
- 2026-06-18 — With-data phone retest: 5/6 green; fixed the one layout bug:
  - **Report Card on a phone**: the 9-column scholastic grades table (~784px) clipped its last columns
    ("Subject total" + "Result") at ~360px with no usable scroll. Fixed by restacking the marks table into
    one card per subject below 560px (each cell becomes a `label : value` row via `data-label`); desktop +
    print keep the real table (media query scoped to `screen`). Co-scholastic (2 cols) fits — unchanged.
    Stacked layout is overflow-proof by construction (full-width blocks); confirmed the rule shipped in the bundle.
  - **Report-card LIST**: names no longer truncate to "Shau…" — `.rc-row__name` wraps instead of ellipsis.
  - **Fees overview "double-render"**: not a state bug — `OverviewTab` is memoized with no re-render loop; the
    one-time flash is the Firestore cached→server snapshot settle (+ React StrictMode in dev), which is why it
    clears on reload. Noted; no code change.
  - Checks: build + strict typecheck green; rules untouched → emulator tests still **145/0**.

### Buildable Track-2 wave — ✅ COMPLETE
All buildable modules the user listed are built, integrated, gated (build + strict typecheck + rules tests 119/0), verified, and committed: counselling (T1), rankings (marks + attendance), certificate generator, question paper generator, report card (traditional marks), gamified dashboard, skills passport, career-counselling. Remaining Track-2 items are the **blocked** integrations (plans + offline shells only — no faked connections): APAAR/ABC/DigiLocker, UPI AutoPay/eNACH, secure online exam (proctoring), IoT campus safety, WhatsApp Business API, SSO/Open API, cashless wallet, e-sign, AI at-risk (scoring logic buildable; model blocked).

### Phase-2 follow-ups (verification noted; not blockers)
- Report card auto-fill currently reads exam marks only (not gradebook `assessment_results`); document or wire later. Subject mapping needs `subjectId` on papers.
- Gamification: homework-streak ordering when `submittedAt` is absent; reading "best" label is cosmetic.
- Skills passport: staff "record-on-behalf (pre-verified)" create path not yet built.
- Career: save-and-resume + aptitude timer + career-library + PDF + class-eligibility gate are later-phase items.

### ✅ Rules: DEPLOYED (2026-06-18) — live ruleset `fa68c528-7134-4bbc-9776-5e4ebf30e21d`
All new-collection rules are now LIVE (deployed via Admin SDK, no CLI login), superseding `d9250142`.
Emulator tests **145/0** on this exact ruleset. Live coverage:
- `certificates` + `certificate_counters` → **issuer allowlist** (`isCertificateIssuer`: leadership +
  academic/admin leadership + registrar/admissions/office/dean/HOD/coordinators). NOT teachers/operational.
- `questionBank`/`questionPapers`/`paperBlueprints` → **exam staff only** (`isExamStaff`, tighter than academic).
- `reportCards` (academic staff; families read own PUBLISHED only), `reportCardSchemes` (academic staff).
- `portfolio` (student owns own; staff verify; no self-verify), `careerAssessments` (student owns own;
  **counselling staff** read/review only).
- `consent_purposes` (active member reads; consent staff writes) — closed a default-rule gap.
- _(gamification persists nothing — computes live from existing member-readable collections.)_

Re-deploy command (Admin SDK, no CLI login):
`cd Web && GOOGLE_APPLICATION_CREDENTIALS=serviceAccount.json node scripts/deploy-rules.mjs`

### Known follow-ups (documented, not blockers)
- Class-teacher SECTION scoping: in the live UI, `StructureTab` stores `classTeacherUid` as a `staff`-profile
  doc id, but `useScopedSectionIds` compares against the auth `uid`; they differ unless seeded equal (the demo
  seeds `member.sectionIds`, so the demo class teacher is correctly scoped). Needs a staff↔member identity
  decision before relying on the class-teacher → section inference. (Surfaced by STEP-1 review.)
- portfolio rule stays `isStaff` for verify/read (tightening risked a new mismatch lockout; the critical
  no-self-verify is enforced). `reportCardSchemes` write stays `isAcademicStaff` (minor lab-assistant over-grant).
- `useEscapeKey` closes all stacked overlays (rare; a correct fix needs an overlay-stack manager).
