# Blog Quality Pass Progress

**Last updated:** 2026-06-19 (Category 14 complete)

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
