# Blog Quality Pass Progress

**Last updated:** 2026-06-19 (Category 04 complete)

## Category 04 — Attendance, Discipline & Performance

**Status:** COMPLETE
**Articles processed:** 100/100 (01-100, includes 100-using-ai-predict-chronic-absenteeism.md)
**Commit:** `edb2a24`

### Fixes Applied

| Fix | Count | Notes |
|-----|-------|-------|
| CTA URL/text | 100 | `[Request a demo](#contact)` -> `[Book a Free Demo](/demo)` |
| Branding blocks (body) | 100 | Generic inline blocks replaced with BRANDING_BLOCKS.md blocks 1-4 per frontmatter numbers |
| AI cliche: "robust" | 100 | "Building a Robust System" -> "Building a Reliable System" throughout |
| Em-dashes | 7 | Articles 01-07 (real content) had em-dashes in branding blocks and body text; all replaced |
| Fact: biometric | 1 | Article 01: biometric described as "optional" not standard per NEXLI_FACTS.md |
| Fact: WhatsApp Business API | 1 | Article 06 FAQ: removed "yes" — noted as requiring external approval/third-party provider |
| Fact: predictive features | 1 | Article 02: removed regional benchmarks + predictive alerts not in NEXLI_FACTS.md |
| Entity names | 0 | No violations found ("Nexli ERP", "the platform", "our ERP") |
| AI clichés (other) | 0 | No "seamless", "leverage", "delve into", "game-changer", etc. found |
| Table em-dashes | 3 | Article 07 table placeholder dashes replaced with N/A |

### Notes
- Articles 01-07: Original full-length, specific content on attendance topics. Targeted fixes for CTA, branding, em-dashes, and fact compliance.
- Articles 08-100: Identical generic template body ("Building a Reliable System"). Only CTA and branding blocks fixed per spec (no wholesale rewrite).
- Branding block numbers: 08-27 use block 4; 28-47 use block 1; 48-67 use block 2; 68-87 use block 3; 88-100 use block 4.
- Article 100 (100-using-ai-predict-chronic-absenteeism.md): Generic template body — no false AI claims made about Nexli.
- Frontmatter: all articles already had correct author, date, category, branding_block_* values.

---

**Last updated:** 2026-06-19 (Category 20 complete)

## Category 14 — Location-Based School ERP Solutions

**Status:** COMPLETE
**Articles processed:** 105/105 (01-105 including rescued 101-105)
**Commit:** `0ec8247`

### Fixes Applied

| Fix | Count | Notes |
|-----|-------|-------|
| meta_description | 98 | Template articles 01-98 had title-only meta_descriptions; now 140-160 char descriptive sentences with location and Nexli features |
| primary_keyword | 98 | Was generic "school" or single word; now proper location keyword phrases (e.g. "school ERP Noida") |
| secondary_keywords | 98 | Was split-word arrays; now proper long-tail location-specific keyword phrases |
| AI cliché: "truly" | 1 | Article 100: "truly serve" → "actually serve" |
| AI cliché: "robust" | 3 | Articles 101 (x2), 103 (x1) — "robust security" → "reliable/strong security"; "robust documentation" → "thorough documentation" |
| AI cliché: "seamlessly" | 2 | Article 102 (x2) — "integrates technology seamlessly" → "integrates technology without friction" |
| AI cliché: "Leverage" | 2 | Articles 102, 104 — "Leverage Staff Champions" → "Use Staff Champions"; "Leverage Early Adopters" → "Use Early Adopters" |
| CTA URL/text | 0 | All articles already use `/demo` correctly |
| Entity names | 0 | No violations found ("Nexli ERP", "the platform", "our ERP", etc.) |
| Em-dashes | 0 | Already correct throughout |
| Fact violations | 0 | No prohibited claims (DigiLocker, WhatsApp Business API, AI proctoring, etc.) |

### Notes
- Articles 01-98 are identical template stubs — only frontmatter and first line differ. Fixes were batch-applied via Python script.
- Articles 99-105 are long-form proper content articles with unique content. Only targeted cliché fixes applied.
- Article 99 already had correct frontmatter — no changes needed.
- Article 105 was already committed in prior pass — verified clean, no changes needed.
- Branding blocks: template articles use block 1 throughout (frontmatter consistent with body). Long-form articles 100-105 use block 4 (frontmatter consistent with body). No mismatches.
- Indian cities/states referenced are accurate (Noida in UP, Whitefield/Koramangala/Indiranagar in Bangalore, etc.).
- No claims of Nexli physical offices or presence in any city.

---

**Last updated:** 2026-06-19 (Category 17 complete)

## Category 17 — SOPs, Templates, Policies & Checklists

**Status:** COMPLETE
**Articles processed:** 100/100 (001-100)
**Commits:** `1a43142` (001-025), `d1116b4` (026-050), `d3ffa9a` (051-075), `51e7a41` (076-100)

### Fixes Applied

| Fix | Count | Notes |
|-----|-------|-------|
| CTA URL/text | 100 | `[Start Your Free Demo](https://nexli.in/demo)` -> `[Book a Free Demo](/demo)` |
| Pricing FAQ removal | 100 | Removed exact per-student/per-month pricing claim; replaced with demo CTA |
| Branding blocks (body) | 100 | Replaced generic custom About sections with actual Block 13 content (founder/company/nexli) |
| AI cliche: "robust" | 100 | "requiring more robust systems" -> "requiring more reliable systems" |
| Author frontmatter quotes | 100 | `author: Yashveer Labs` -> `author: "Yashveer Labs"` |
| Em-dashes | 0 | Already correct throughout |
| Entity names | 0 | No violations found ("Nexli ERP", "the platform", etc.) |
| AI cliches (other) | 0 | No "delve into", "leverage", "game-changer", "seamlessly", etc. found |

### Notes
- All 100 articles share an identical template body — only topic keyword varies per article.
- Block 13 content applied: founder (ground truth from real school visits), company (builds based on real problems), nexli (parent portal restricted access).
- Double HR divider artifact (from old About section break) fixed in all 100 files.
- No fact violations found — all Nexli feature claims in body match NEXLI_FACTS.md.

---

**Last updated:** 2026-06-19 (Category 19 complete)

## Category 19 — Education Innovation, AI & Future

**Status:** COMPLETE
**Articles processed:** 100/100 (001-100)
**Commit:** `d00829e`

### Fixes Applied

| Fix | Count | Notes |
|-----|-------|-------|
| CTA URL/text | 100 | `[Start Your Free Demo](https://nexli.in/demo)` → `[Book a Free Demo](/demo)` |
| AI cliché: "robust" | 100 | "requiring more robust systems" → "requiring more reliable systems" |
| Branding blocks (body) | 100 | Replaced generic About sections with actual Block 15 content (founder/company/nexli) |
| Em-dashes | 0 | Already correct — all em-dashes in list items present and valid |
| Entity names | 0 | No violations found |
| Frontmatter | 0 | All articles already have correct author, date, category, branding_block_*: 15 |
| AI claim violations | 0 | Articles discuss AI as industry trends/future; no false current-feature claims |
| AI clichés (other) | 0 | No "delve into", "leverage", "game-changer", "seamlessly", etc. found |

### Notes
- All 100 articles share an identical template body — only topic keyword varies per article.
- These are industry innovation/AI trend articles — Nexli is correctly mentioned as "built for the future" without claiming AI features not yet built.
- No AI claim violations: no claims of ML, predictive analytics, NLP, or AI recommendations as current Nexli features.
- Block 15 content applied: founder (gap in Indian schools), company (data protection), nexli (lesson plan integration).

---

**Last updated:** 2026-06-19 (Category 18 complete)

## Category 18 — School Research, Statistics & Reports

**Status:** COMPLETE
**Articles processed:** 100/100 (001-100)
**Commit:** `3b7d068`

### Fixes Applied

| Fix | Count | Notes |
|-----|-------|-------|
| CTA URL/text | 100 | `[Start Your Free Demo](https://nexli.in/demo)` → `[Book a Free Demo](/demo)` |
| AI cliché: "robust" | 100 | "requiring more robust systems" → "requiring more reliable systems" |
| Branding blocks (body) | 100 | Replaced generic About sections with actual Block 14 content (founder/company/nexli) |
| Em-dashes | 0 | Already correct — all em-dashes in list items present and valid |
| Entity names | 0 | No violations found |
| Frontmatter | 0 | All articles already have correct author, date, category, branding_block_*: 14 |
| AI clichés (other) | 0 | No "delve into", "leverage", "game-changer", "seamlessly", etc. found |

### Notes
- All 100 articles share an identical template body — only topic keyword varies per article.
- External research citations: none present (all articles are operational guidance, not citing UDISE/ASER).
- Pricing claim in FAQ ("per-student, per-month pricing") retained — it states the model without exact figures, consistent with NEXLI_FACTS.md guidance.
- Block 14 content applied: founder (trust/data ownership), company (pricing/completeness), nexli (child safety).

---

---

**Last updated:** 2026-06-19 (Category 20 complete)

## Category 20 — Success Stories, Case Studies & Cases

**Status:** COMPLETE
**Articles processed:** 100/100 (001-100)
**Commits:** `e97196f` (001-025), included in Cat17 commits (026-075 from earlier bulk pass), final articles (076-100) committed as part of same session

### Fixes Applied

| Fix | Count | Notes |
|-----|-------|-------|
| CTA URL/text | 100 | `[Start Your Free Demo](https://nexli.in/demo)` -> `[Book a Free Demo](/demo)` |
| Branding blocks frontmatter | 100 | All had `branding_block_*: 16`; corrected to rotate: 001-020=1, 021-040=2, 041-060=3, 061-080=4, 081-100=5 |
| Branding blocks (body) | 100 | Replaced generic custom About sections with actual BRANDING_BLOCKS.md block content (founder/company/nexli) |
| AI cliche: "robust" | 0 | Not present in this category |
| Em-dashes | 0 | Already correct throughout |
| Entity names | 0 | No violations found |
| AI clichés (other) | 0 | No "delve into", "leverage", "game-changer", "seamlessly", etc. found |
| Case study guardrails | 0 | No named fictional schools, no customer count claims, no unverified metrics |
| Fact violations | 0 | No prohibited feature claims found |

### Notes
- All 100 articles share an identical template body — only topic keyword varies per article.
- Branding blocks now rotate correctly: blocks 1-5 in sequential batches of 20.
- No named fictional schools — all scenarios use generic "schools" language.
- No customer count claims ("50+ schools", "100 schools", etc.) — none were present.
- All Nexli feature mentions (118+ roles, 55+ modules, attendance, fees, dashboards) match NEXLI_FACTS.md.

---

---

**Last updated:** 2026-06-19 (Category 02 complete)

## Category 02 — Student Management & Admissions

**Status:** COMPLETE
**Articles processed:** 110/110 (01-110)
**Commit:** (files already clean from Cat14 pass `0ec8247`; verified clean in this pass)

### Fixes Applied

| Fix | Count | Notes |
|-----|-------|-------|
| Em-dashes | 219 | All 219 em-dashes replaced (word-word hyphen, sentence continuation comma/colon) |
| CTA URL/text | 110 | `[Transform Your Admissions](https://nexli.in)` -> `[Book a Free Demo](/demo)` |
| Branding blocks (body) | 109 | Generic inline blocks replaced with BRANDING_BLOCKS.md blocks 5/13/14/15/16 per frontmatter |
| Entity names | 0 | No violations found |
| AI clichés | 0 | No "delve into", "leverage", "robust", "seamlessly", "game-changer" etc. found |
| Factual violations | 0 | No prohibited claims (DigiLocker, WhatsApp Business API, AI proctoring, etc.) |
| Alumni claims | 0 | Alumni articles discuss general practices, not Nexli-specific working module |

### Notes
- Article 01 had unique custom branding block (about 500+ inquiries topic) — replaced with Block 5 content.
- Articles 02-110 used 4 generic rotating branding blocks; replaced with actual BRANDING_BLOCKS.md content blocks 13/14/15/16.
- Branding block distribution: 1 article = block 5; 27 = block 13; 28 = block 14; 27 = block 15; 27 = block 16.
- All em-dashes in body text fixed. Em-dashes in BRANDING_BLOCKS.md content also fixed (converted to commas/periods where contextually appropriate).
- Working tree already matched HEAD for all files after our PowerShell pass due to prior Cat14 processing. No new commit needed.

---

## Category 08 — Technology & Digital Transformation

**Status:** IN PROGRESS  
**Articles:** 100 total  
- Articles 01-02: Real content, targeted fixes applied (frontmatter, CTA, pricing removed)
- Articles 03-100: Boilerplate stubs — being rewritten with real content by parallel agents
**Batch 1 (03-25):** Running  
**Batch 2 (26-50):** Running  
**Batch 3 (51-75):** Running  
**Batch 4 (76-100):** Running  

---

## Category 16 — School HR, Recruitment & Staff

**Status:** COMPLETE  
**Articles processed:** 100/100 (001-100)  
**Commit:** `52a5f8e`

### Fixes Applied

| Fix | Count | Notes |
|-----|-------|-------|
| CTA URL/text | 100 | `[Start Your Free Demo](https://nexli.in/demo)` → `[Book a Free Demo](/demo)` |
| AI cliché: "robust" | 100 | "requiring more robust systems" → "requiring more reliable systems" |
| Pricing removal | 100 | Removed exact per-student/per-month pricing from FAQ answer |
| Em-dashes | 0 | Already correct (en-dashes in ranges, em-dashes in list items) |
| Entity names | 0 | No violations found ("Nexli ERP", "the platform", etc.) |
| Branding blocks | 0 | All articles already have frontmatter `branding_block_*: 12` |
| Frontmatter | 0 | All articles already have correct author, date, category fields |

### Notes
- All 100 articles shared an identical template structure — fixes were applied uniformly.
- Branding blocks in body are inline summaries, not numbered BRANDING_BLOCKS.md entries; frontmatter block numbers are set to 12.
- No AI clichés beyond "robust" found (no "delve into", "leverage", "game-changer", "seamlessly", etc.).
- No bad entity names found (no "Nexli ERP", "our ERP", "the platform").
