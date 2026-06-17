# NEXLI — Build Progress (report-driven, two tracks)

_Live status file. Updated continuously so work can be resumed cleanly if interrupted._
_Source of truth for the to-do list: `TEST_RESULTS.md` (project root)._

**Started:** 2026-06-17
**Safety checkpoint:** git initialised at Nexli root — baseline commit `d68c887` (pre-build). Roll back with `git reset --hard d68c887`.
**Guardrails:** Super Admin `yashveersr4@gmail.com` and demo data are NOT touched. No faked live connections to paid/government services.

**Approach note on subagents:** Track 1 fixes are surgical edits to shared files (nav, role catalogue, layout) where parallel writers would collide, so they are done directly and verified by the build + emulator rules tests. Subagents are used in Track 2 for parallelisable research and independent module builds, where they add real leverage.

---

## TRACK 1 — Fix every problem in the report (worst first)

| # | Item | Status |
|---|------|--------|
| 1 | `/counselling` real page (Counselor/Guidance/Wellness home) | ⏳ pending |
| 2 | Security stub removed from security-role menus | ⏳ pending |
| 3 | Admissions nav gate fix (receptionist sees it; class teacher doesn't) | ⏳ pending |
| 4 | Narrow Chairman/Trustee/Board Rep (drop HR+Payroll) | ⏳ pending |
| 5 | Remove Staff Attendance from Alumni menu | ⏳ pending |
| 6 | Real titles: prefect/captain + Academic Coordinator tier | ⏳ pending |
| 7 | Modal Save button pinned on phone (Add Book + all modals) | ⏳ pending |
| 8 | Bottom blank-space layout fix | ⏳ pending |
| 9 | Friendly empty states + attendance widget zero-data | ⏳ pending |
| 10 | Reports "0 of 300" fix + RTE Quota populated | ⏳ pending |
| 11 | Build + typecheck + rules tests green; commit checkpoint | ⏳ pending |

---

## TRACK 2 — Research → plan → build new modules

_Starts only after Track 1 is fully green. Plans live in `docs/feature-plans/<module>/`._

**Buildable now (offline / mock data):** counselling (done in T1), question paper generator, certificate generator, report card / NEP HPC, marks-ranking engine, attendance-ranking engine, role badges, empty-state/onboarding polish, gamified dashboard, skills passport, career-counselling (assessment logic), document management (offline).

**Blocked (need paid plan / API key / gateway / govt approval) — plan + offline shell only, never faked:** APAAR/ABC/DigiLocker, UPI AutoPay/eNACH + reconciliation, secure online exam (proctoring), IoT campus safety (hardware), WhatsApp Business API, SSO/Open API (partial), e-sign (paid), cashless wallet (gateway), AI at-risk (needs AI key — logic buildable, model blocked).

_Status table added when Track 2 begins._

---

## Changelog
- 2026-06-17 — Git checkpoint `d68c887`; task list + this progress file created. Beginning Track 1 investigation.
