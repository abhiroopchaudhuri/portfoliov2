# WCAG Case Study — v2 Upgrade Tracker

**Goal:** take the current page from 6.5/10 → 10/10. Every change below is either a bug-fix, a data-accuracy fix, a new section, or a visual overhaul. Nothing ships until the item's checkbox is ticked AND the data referenced has been cross-verified against the source of truth named in the row.

**Sources of truth (ground-data files we'll produce before touching the page):**
1. `guidelines/audit-data-analysis.md` — rigorous count of every DEQUE JSON + expanded CSV tracker, with per-component instance counts (not collapsed) and cross-product impact attribution.
2. `guidelines/mds-branch-verification.md` — diff of `0c68064` (v4.19.1, main) vs `upstream/feat-ally` / `origin/feat-ally-r4` for the MDS repo at `/Users/abhiroop.chaudhuri/Desktop/DEVELOPMENT/MDS/design-system`. Verifies every utility, pattern, file-path, and component-count claim.
3. `guidelines/benchmark-verification.md` — sourced cell-by-cell verification of the Adobe Spectrum / Atlassian / Carbon / Material / Polaris comparison table, with public-repo URLs backing every yes/no/partial.

**Non-negotiable principles:**
- Any stat on the page must trace to a file in `/json-audit/` OR a commit in the MDS repo OR a URL in the benchmark report. No untraced numbers. No round-number guesses.
- Any pattern claim must cite the MDS file path + line where the pattern is implemented.
- Any DS-comparison cell must have a public-repo URL or docs-page URL we could hand to a litigator.

---

## Legend
- **[CRITICAL]** — visible correctness / legal risk — must land before publish.
- **[HIGH]** — damages credibility, but won't cause a lawsuit.
- **[MEDIUM]** — polish / density / story-quality.
- **[LOW]** — nice-to-have.

---

## Part A — Visual & Layout Fixes (current page feels wrong)

### A1. [CRITICAL] Border/divider contrast fails visibility
- **Current state:** Dividers & card borders use `border-white/[0.04]`, `border-white/[0.06]`, `border-white/[0.08]`, `border-white/[0.09]`. Against `#030303` these compute to roughly 1.1:1 – 1.3:1 — well under the user-requested 2.5:1 floor, and below WCAG 1.4.11 non-text 3:1 where the border carries meaning.
- **Fix:** replace every `border-white/[0.04..0.09]` on a *visible structural divider* with a single token `border-white/[0.14]` (≈ 2.6:1 against #030303). Card inner-highlights and decorative strokes can keep the lighter value; only bump the ones that define the *edge* of a card or the *line* between rows.
- **Locations to edit in `src/app/pages/WcagProjectPage.tsx`:**
  - `CardShell` base border (L297)
  - Meta-strip `border-y` (L575)
  - Severity bar outer border (L436)
  - Benchmark table `border-b` rows (L789, L811)
  - Benchmark table head row (L789)
  - Severity item card borders (L448)
  - Release cards (L984)
  - Footer `border-t` (L1046)
  - Pattern card outer + inner dividers (L477, L504)
  - Hero KPI tile borders (inherited via `CardShell`)
- **Verification:** eyeball at 100% zoom on `#030303`; measure with a contrast picker to confirm ≥ 2.5:1.
- **Status:** ☐

### A2. [CRITICAL] Page feels like a compressed blog post — widen and add right-rail imagery
- **Current state:** `max-w-5xl` wrapper with `px-6 sm:px-10 md:px-16`. On wide screens this reads as a narrow centred column with enormous empty margins. The brief is a dense technical case study — it should feel like a *dashboard*, not an article.
- **Fix:**
  1. Widen canvas to `max-w-[1320px]` (or `max-w-7xl` = 1280px). Keep horizontal padding `px-6 sm:px-10 lg:px-14`.
  2. Switch long text sections (Context, Method intro, Verification) to a 12-col grid with text in 7 cols and visual/figure in 5 cols on `lg:` breakpoint. On `md:` collapse to stacked.
  3. Add relevant images / inline visuals to the right rail for sections that currently read as text-only:
     - **Hero** — ASCII/SVG "before–after screen-reader announcement" waveform visual (`"button" → "Clear email, button"`).
     - **Context** — a stylised schematic of "one component → N products" (small replicated-square grid coloured by status) so the section isn't just a baseline box.
     - **Method** — terminal-style box diagram of the pipeline (already described in plan, never built).
     - **Architecture / Patterns** — tiny per-pattern SVG glyph on the left of each accordion (focus ring, overlay stack, calendar arrow cycle, icon+padding frame, etc.).
     - **Verification** — replace the plain code snippet with a split: code + a small "CI blocks merge" mock-terminal output.
     - **Results** — a small product-wall showing product logos inheriting the fix (visual payoff for "20+ products").
  4. The overall feel should match the portfolio's other pages (AboutSection, WcagProjectPage peers) in density.
- **Status:** ☐

### A3. [HIGH] Radar ring is too faint + fixed to hero only
- **Current:** `opacity-[0.12]` radar-rings at top-right, height `900px`. They peter out by the time the reader reaches the second section.
- **Fix:** lift to `opacity-[0.18]` and extend in a second decorative cluster behind the Results section so the visual language is reused. Use `pointer-events-none` + `-z-10`.
- **Status:** ☐

### A4. [MEDIUM] Section label dividers (`h-px w-8 bg-[#F05D23]/50`) too short
- **Fix:** extend to `w-12` + raise opacity to `/70` so the label hierarchy reads from 3 sections away.
- **Status:** ☐

### A5. [MEDIUM] Chart axis + tooltip contrast
- **Current:** axis labels use `rgba(255,255,255,0.35)` (1.8:1) — below the 2.5:1 request.
- **Fix:** bump axis label + tick colour to `rgba(255,255,255,0.58)` (≥ 3.5:1). Grid lines can stay faint since they're decorative (1.4.11 non-text exemption for decorative strokes), but add `strokeWidth={0.8}` to pull them out.
- **Touches:** `AuditDepthChart`, `ComponentsChart`, `TimelineChart`, `SeverityBar`.
- **Status:** ☐

### A6. [MEDIUM] Replace "slate" body text `text-white/55`, `/60`, `/65` audit
- **Current:** lots of `text-white/55` which is ≈ 4.1:1. Fine for body, borderline for small-mono labels at 10px. Confirm every `<10px` label is at least `/70`.
- **Fix:** systematically re-check each mono-10px label's opacity; lift to `/70`+ where needed.
- **Status:** ☐

---

## Part B — Data Accuracy: Recount DEQUE vs Ours

### B1. [CRITICAL] ✅ DEQUE MDS count corrected — 193, not 9
- **Source of truth:** `guidelines/audit-data-analysis.md`.
- **Actual numbers (row-by-row verified, no sampling):**
  - DEQUE MDS audit v1 (main): **184 issue instances**
  - DEQUE MDS audit v2 (supplemental WCAG-2.2-only — target-size + dragging + focus-obscured): **9 instances**
  - **Combined: 193 DEQUE issues on MDS itself**
- **Fix:**
  1. Replace the "9" big-number in the Audit Depth section with **193** (or, if we want the old 9 to tell the story, frame as "DEQUE's main engine surfaced 184; a second supplemental pass caught 9 more 2.2 rules — total 193").
  2. Replace the hero narrative "external audit flagged 9 issues" in the Context section with "external DEQUE audit flagged 193 issues on the DS alone — and a further 3,823 across three products built on it."
  3. Update `AUDIT_DEPTH` constant per-SC with the real DEQUE v1+v2 combined breakdown from the report (tables "per-SC" + "per-rule").
- **Story recalibration:** the old framing was "DEQUE = 9, ours = 327, 36× deeper." The new honest framing is more nuanced: DEQUE caught 193 real issues on MDS (substantial, and all valid). Our internal audit added depth in areas DEQUE's engine can't see — keyboard/ARIA relationships discoverable only from source code. Don't ridicule DEQUE; position as "complementary depth." This reads more senior AND is truer.
- **Status:** ✅ data confirmed, ☐ page edit pending.

### B2. [CRITICAL] ✅ P0/P1/P2 sourcing clarified — from our AI-skill audit, not the CSV
- **Confirmed with user:** 34 P0 / 144 P1 / 149 P2 = 327 comes from the **internal AI-skill audit pipeline** (custom Claude skills that inspect the browser + read the codebase for ARIA / a11y issues), NOT from the CSV tracker.
- **Implication:** the case-study now has TWO distinct data streams, each owned by a different mechanism:
  - **DEQUE audit** (external, Deque Systems axe Auditor — mixed automated + manual, browser-rendered) = 193 on MDS, 3,823 on products.
  - **Our AI-skill audit** (internal, code-aware + browser-aware, custom skills) = 327 issues, classified P0/P1/P2.
  - **Internal tracker CSV** = fulfilment status (Design Ready → Dev Ready → Released) for issues once they're in the backlog. Not a discovery source on its own.
- **Fix:** reframe the narrative so the reader understands the three streams clearly. The "36× deeper" framing goes away — we instead show a *different kind of depth*, not a count arms-race.
- **Status:** ✅ no change to the 34/144/149 numbers needed. Page framing needs an update (see B6).

### B2b. [CRITICAL] ⚠ WHCM framing must shift — DEQUE never tested it
- **Discovery:** zero `forced-colors` / WHCM / `High Contrast` hits in any of the 5 DEQUE JSONs. DEQUE's export doesn't include a WHCM pass.
- **Implication:** the "WHCM fails for box-shadow focus rings across 15 components → count as 15" framing only lives in the internal tracker, not in DEQUE data. That's fine — but frame it as "we found this, DEQUE didn't look for it" rather than implying DEQUE missed something their tool ever tested.
- **Fix:** when we write up the architecture section's WHCM pattern (if we add one), explicitly say "Not in any DEQUE rule — surfaced by our own source-code review."
- **Status:** ☐

### B3. [CRITICAL] Re-derive top-components chart with expanded counts
- **Fix:** `TOP_COMPONENTS` currently lists 10 components with small p0/p1/p2 numbers. After expansion, these numbers will grow (because WHCM / color / focus-ring-via-shadow affects many components). Replace the constant with the audit report's real numbers.
- **Status:** ☐

### B4. [HIGH] Show overlap of DEQUE findings with our tracker
- **Fix:** add a small visualization after the existing comparison showing *intersection* of DEQUE-found vs Ours-found issues:
  - DEQUE-only (things we missed) — should ideally be zero after we audited; if nonzero, own it honestly.
  - Both-found (where DEQUE corroborated us)
  - Ours-only (depth-beyond-DEQUE)
- **Purpose:** makes the "we went 36x deeper" claim defensible rather than hand-wavy, because readers can see both circles overlap.
- **Viz option:** two stacked bars side-by-side labelled DEQUE (small total) vs Ours (tall total), coloured by overlap category. Or a small Venn-style diagram (if recharts can't, build with CSS / SVG).
- **Status:** ☐ depends on audit-data-analysis.md completion.

### B5. [MEDIUM] Cite the DEQUE audit dates on the page
- **Fix:** the JSON filenames carry dates (`04_20_26_at_3_31_pm`). Surface the date on the page so it's clear this is a fresh April 20 2026 audit. Footnote: "DEQUE axe Auditor export · 20 Apr 2026 · file on record."
- **Status:** ☐

### B6. [CRITICAL] Rewrite the "automated vs us" framing — DEQUE was mixed manual+automated too
- **User correction:** "DEQUE did not do all automatic tests — lot of issues were manual. Don't include the term that they just did automated."
- **Fix:** scrub every "rule-engine" / "automated-only" / "browser-only" claim from the page. Replace with the honest axis of comparison: **code-aware vs page-rendered**, not "manual vs automated."
- **Exact text edits needed in [WcagProjectPage.tsx](src/app/pages/WcagProjectPage.tsx):**
  - **Section 3 heading (L651):** "Why automated audits miss 97% of real issues" → **"Why page-rendered audits miss what lives in the source."** (or similar — axis is DOM-level vs source-level access, not automation level).
  - **Section 3 body (L655-L661):** "Industry rule-engines run over a rendered page. They can't tell a decorative icon from a functional one…" → reword: **"DEQUE audited us thoroughly — automated rules _and_ trained manual passes through every page. We ran a parallel audit with a different vantage point: our own AI skills that read the component source, walked prop plumbing, and traced ref flows. DEQUE saw what a browser paints; we saw what the browser renders _and_ the props behind it. The combined depth was the point."**
  - **Audit Depth big-number card caption (L669):** "Spread across 3 success criteria — target size, dragging, focus obscured" → update with real DEQUE SC coverage from audit-data-analysis.md.
  - **Method section (S.4, L697+):** replace "Custom Claude skills / Automated contrast script / AI-reviewed exceptions" three-lane framing with a four-lane story that includes **browser testing** as its own lane (per user: "compare how we audited using skills, browser etc. etc."). Suggested lanes:
    1. **Custom Claude skills** — component-specific prompts reading `core/src/components/**`, understanding composition + prop plumbing.
    2. **Browser + AT runs** — manual walk-throughs with NVDA, VoiceOver, keyboard-only navigation across every component's demo page.
    3. **Automated contrast script** — walks SCSS/TSX token pairs, computes WCAG AA across default/hover/active/focus/disabled.
    4. **AI-reviewed exceptions** — contrast failures classified as decorative / disabled / icon-as-text.
  - **Section 10 Reflection 1 ("Audit your own code"):** edit to remove "outperformed every rule engine we tried." Keep the spirit ("source access found what the DOM couldn't show") but drop the implied inferiority of DEQUE.
- **New framing to land throughout:** "DEQUE is a great tool — we used it. Then we built skills to go somewhere DEQUE can't: the source tree and the prop graph."
- **Status:** ☐

---

## Part C — NEW Section: Cross-Product Impact (Case/Care, Outreach, DAP)

### C1. [CRITICAL] ✅ data ready, ☐ page-build pending — "Product compliance impact"
- **Position:** between current Section 9 (Impact) and Section 10 (Reflections). New section label: `CROSS-PRODUCT // 10` (renumber Reflections → 11, Footer stays).
- **Source of truth:** `guidelines/audit-data-analysis.md`, cross-product attribution tables.
- **Verified headline numbers (from audit-data-analysis.md):**
  - Total product-level DEQUE findings: **3,823 instances** (1,628 Case/Care + 1,037 Outreach + 1,158 DAP).
  - MDS-fixable (DesignSystem- data-test signature classifier): **1,951 / 3,823 = 51.0%**.
  - Per-product: Case/Care **61.5%** MDS-fixable, Outreach **51.3%**, DAP **36.1%**.
  - Single biggest MDS root cause: focus-ring token `#F8F8F8` on white (1.06:1) → **262 product occurrences closed by a one-token change**.
  - 2nd biggest: Listbox/Combobox `aria-required-children` / `aria-required-parent` → **142 product occurrences** (98% of Outreach's Access Center page).
- **Content structure:**
  1. Intro paragraph — "DS fixes don't stop at the DS. Three flagship products — Case & Care Management, Outreach, DAP + Analytics — were DEQUE-audited in parallel. Of 3,823 findings across them, 1,951 (51%) trace to a root cause inside MDS."
  2. **Per-product card row (3 cards)** — each shows total DEQUE issues, MDS-fixable count + %, product-team-owned count + %, residual after MDS v4.23.
  3. **Product-attribution stacked bar chart** — 3 bars, each split into: (a) closed by MDS v4.23, (b) product-team action needed. "Mixed/shared" only if the report disambiguates them.
  4. **"Top-5 single-fix-many-wins" callout** — lift the audit-data-analysis.md "Top 10 single-fix-many-wins" table (focus token, Listbox ARIA, etc.). Each row: one MDS change → N product issues closed.
  5. **Honest caveat block** — "Not every product issue is a DS issue. Missing alt text on product hero images, non-responsive custom pages, a dev forgetting to pass an `aria-label` on a prop MDS exposes — these are product work. We only claim the fixes whose root cause sits in MDS."
  6. **Methodology footnote** — "MDS attribution derived from DEQUE export fingerprints: any violation whose offending node carries a `DesignSystem-*` data-test attribute is counted as MDS-owned. Conservative by construction (product-specific wrappers around a DS component get counted as product work, even when a DS change fixes them)."
- **Status:** ☐ ready to build once Part A visual pass is done.

### C2. [HIGH] Validate product-impact numbers against DEQUE JSONs before publishing
- **Fix:** every per-product number in Part C must trace to a specific SC count in the product's DEQUE JSON. Reject "about N" language — use exact integers. If we can only say "of these N rule hits, M appear in a component MDS owns and provides a fix for in feat-ally", write exactly that.
- **Status:** ☐

---

## Part D — DS Benchmark Table: MUST BE REBUILT

### D1. [CRITICAL] ✅ verified — current table has at least 5 confirmed errors · recommended rebuild
- **Source of truth:** `guidelines/benchmark-verification.md`.
- **Key findings from verification (the lawsuit-bait ones):**
  - Claim 5 "role=switch on native checkbox" — **3 of 4 verifiable cells are wrong.** Carbon uses `<button>` not checkbox. MUI Switch uses the pattern (portfolio says no — WRONG). Polaris has no Switch at all (portfolio says yes — WRONG).
  - Claim 1 "Overlay stack" — Material has `ModalManager.ts` with full push/pop/top-of-stack logic. Portfolio's "Material: no" is WRONG.
  - Claim 4 "View-aware calendar nav labels" — cannot defend a single non-MDS cell.
  - Claim 6 "Roving tabindex" — Spectrum likely has it via react-aria's `useFocusManager`; portfolio's "Spectrum: no" is likely WRONG.
  - Claim 8 "Touch-target padding" — "no" for all 5 DSs is unverifiable and too easy to be wrong.
  - **Atlassian column is unverifiable entirely** — their DS source is private (the old `atlassian-frontend-mirror` and `atlaskit` repos are 404).
- **Recommended fix — Option A (which I'll execute):**
  - **Drop the Atlassian column** (unverifiable = cannot keep).
  - **Drop rows 3, 4, 6, 7, 8** (all UNVERIFIED or WRONG per verification report).
  - **Keep 3 rows with verified cells:**
    1. Auto-labelled clear buttons (MDS derives from label; peers use manual prop or nothing).
    2. Overlay stack scope (MDS handles the full overlay family; Material's ModalManager is modal-only; others are per-component).
    3. `role="switch"` on native checkbox (Spectrum yes, Carbon no-uses-button, Material yes, Polaris N/A, MDS yes).
  - **Add footnote:** "Cells verified against public source commits cloned on 2026-04-20. File paths on record in guidelines/benchmark-verification.md."
  - **Rename caption** from "Reviewed against public source repositories · March 2026" to "Verified against public source · 20 Apr 2026".
- **Status:** ✅ data ready, ☐ page edit pending (rebuild BENCHMARK_ROWS constant + BENCHMARK_COLUMNS).

### D2. [HIGH] Add source-URL tooltip per cell
- **Fix:** each verified cell gets a `title` attribute (native tooltip) with the file path, e.g. `title="Switch.js:282 · mui/material-ui"`. Adds auditable rigour without cluttering the visual table. Keep it to `title` (no custom tooltip component — the native browser one is fine and AT-accessible).
- **Status:** ☐

### D3. [HIGH] ❌ DROPPED — can't defend additional rows
- Verification report surfaced no new *cross-DS comparative* patterns that can be sourced for all 5 peers. WHCM/forced-colors support exists in each DS to varying degrees (requires deep grep per DS to claim "we have it, they don't"). Not worth the risk.
- Alternative: use WHCM as a single-DS pattern card (Pattern 9), not a comparison row.
- **Status:** ✅ decision made — no new comparison rows.

### D4. [MEDIUM] Reconsider the whole section's framing
- **Option B (fallback if user prefers):** drop the table entirely. Replace with a paragraph: "We studied Adobe Spectrum, Atlassian, IBM Carbon, Google Material, and Shopify Polaris before writing a line of MDS code. None of the five shipped all three patterns together that we wanted MDS to ship with day-one: [X], [Y], [Z]." Zero named-claim risk; still shows benchmarking rigour.
- **Status:** ☐ fallback if user vetoes Option A.

---

## Part E — Content additions (strengthens the story)

### E1. [CRITICAL] Add a Section 508 compliance explainer section
- **Position:** after Results (current Section 9), before Cross-Product (new C1). Label: `COMPLIANCE // 10`.
- **Content:**
  1. Short intro — what Section 508 is (1994 statute + 2017 ICT refresh that aligns §508 with WCAG 2.0 AA, plus additional functional-performance criteria around cognitive, motor, and visual access).
  2. Table mapping **§508 clause → MDS coverage**:
     - E205.4 Accessibility-Supported (web content): "Covered via WCAG 2.2 AA — see §4 of this case study"
     - 504.2 Authoring tools (not applicable here — MDS is a component library consumed by authoring tools, not an authoring tool itself)
     - 502.2.1/502.2.2 Interoperability with AT (the useAccessibilityProps + role/aria work): "Covered"
     - 503.2 Display screen — presentation of text across forced-colors: "Covered via WHCM support work"
     - 302.x Functional Performance Criteria — list exactly which ones the DS addresses (low vision, no hearing, limited manipulation etc.) with evidence.
  3. Caveat: Section 508 formally covers federal procurement. MDS → downstream products means the DS must be §508-compliant in isolation for federal customers of Innovaccer products to be buying §508-compliant software. Make that chain explicit.
- **Source of truth:** `guidelines/mds-branch-verification.md` section 6.
- **Status:** ☐ depends on mds-branch-verification.md completion.

### E2. [HIGH] Rename the headline from "WCAG 2.2 + Section 508 · Compliance for MDS" to keep the §508 framing, and add a one-line note under the hero explaining the statute → WCAG mapping
- **Status:** ☐

### E3. [HIGH] Honest-limitations / "What we don't claim" callout
- **Position:** either as a subsection in Reflections, or a standalone callout after Cross-Product.
- **Content:**
  - We don't claim WCAG 2.2 AAA. We claim 2.2 AA.
  - We don't claim every downstream product is §508-compliant; we claim the DS foundation is, and we've quantified how much of each product's issues that foundation resolves.
  - We don't claim zero future regressions — we claim CI-enforced axe baselines + a 119-file test suite that currently passes.
  - We don't claim our AI-assisted audit replaces professional audits — it complemented DEQUE.
- **Why:** self-awareness reads as senior. Unqualified absolute claims read as junior (and invite legal review).
- **Status:** ☐

### E4. [MEDIUM] Add "Who did what" attribution sidebar in the hero
- **Fix:** the current meta strip has `Role / Product Designer + A11y Lead`. Expand to a small roster — give credit to engineering, other designers, and external auditors. Reads as senior and fair.
- **Status:** ☐

---

## Part F — Verify every pattern claim against the feat-ally branch

### F1. [CRITICAL] ✅ DONE — 8 pattern snippets + paths verified; corrections needed
- **Source of truth:** `guidelines/mds-branch-verification.md`.
- **All 8 patterns verified as real, with these fixes needed in `PATTERNS[]` in [WcagProjectPage.tsx](src/app/pages/WcagProjectPage.tsx#L162-L280):**
  1. **Pattern 1 Clear button** — snippet matches exactly. Path: `core/components/atoms/input/Input.tsx` (portfolio has `core/src/components/...` — **remove `src/`**). Line reference: L221-225.
  2. **Pattern 2 useAccessibilityProps** — snippet uses `mapSpaceEnterToClick(role)` but **that helper doesn't exist**; the real code inlines a key-allowlist per role (`button` → Enter/Space; `link` → Enter only; `checkbox`/`radio` → nothing because onChange handles it). **Rewrite the snippet.** Path: `core/accessibility/utils/useAccessibilityProps.ts` (portfolio has `core/src/accessibility/...` — **remove `src/`**).
  3. **Pattern 3 OverlayManager** — singleton confirmed (`const instance = new OverlayManager(); Object.freeze(instance);` — module-singleton, frozen). But `closeOnEscapeKeypress` lives in `core/utils/overlayHelper.ts` not OverlayManager.tsx, AND its real signature is `(event, isTopOverlay: boolean, onClose)` — the caller passes the bool already resolved. **Fix snippet to show real signature, label as pseudocode, or split into two snippets** (one OverlayManager, one overlayHelper).
  4. **Pattern 4 Focus trap** — verified in `core/utils/overlayHelper.ts` · `getFocusableElements` filters via `el.closest('[inert]') !== null`, plus visibility/aria-hidden/aria-disabled/tabindex="-1". Snippet is fine as illustrative pseudocode; actual implementation is longer.
  5. **Pattern 5 Calendar nav labels** — snippet matches exactly at `core/components/organisms/calendar/Calendar.tsx:677-679`. Drop the `src/`.
  6. **Pattern 6 Hydration-safe IDs** — real variable name is `inlineLabelIdRef`, not `idRef`. **Rename in snippet.** Real line: Input.tsx:197.
  7. **Pattern 7 Adaptive touch-target padding** — verified at Input.tsx:262-263: `['p-3-5']: size === 'tiny'` / `['p-3']: size === 'regular' || size === 'large'`. Snippet is accurate.
  8. **Pattern 8 role="switch"** — verified at Switch.tsx:115-126. Snippet matches.
- **Action checklist on `WcagProjectPage.tsx`:**
  - [ ] Find-replace all `core/src/components` → `core/components` (affects 7 of 8 pattern `paths:` arrays).
  - [ ] Find-replace `core/src/accessibility` → `core/accessibility`.
  - [ ] Rewrite Pattern 2 code snippet — no `mapSpaceEnterToClick`.
  - [ ] Rewrite or annotate Pattern 3 snippet — `closeOnEscapeKeypress` signature.
  - [ ] Rename variable in Pattern 6 snippet: `idRef` → `inlineLabelIdRef`.
- **Status:** ✅ data ready, ☐ page edits pending.

### F2. [HIGH] ✅ new Pattern 9 discovered — Windows High Contrast Mode (WHCM)
- **Commit:** `ecf0cff4d` · 2026-04-14 · "feat: add windows high contrast mode support in component" (Anuradha Aggarwal).
- **Scope:** +421 lines across 19 component CSS module files (avatarGroup, avatarSelection, button, calendar, card, chip, dropdown, dropzone, horizontalNav, listbox, metricInput, modal, select, selectionCard, sidesheet, slider, switch, tabs, toast). Uses `@media (forced-colors: active)` blocks.
- **Representative comment from the commit:** `/* box-shadow is stripped in forced-colors; add a real border so the card boundary is visible */` — maps exactly to user's WHCM concern.
- **Paths:** `css/src/components/*.module.css` (this is why the earlier `*.scss *.tsx` grep missed it; the CSS is in Pigment / CSS-modules under `css/src/components/`).
- **Fix:** add a 9th pattern card "Windows High Contrast Mode: box-shadow → real border fallback." Cite the 19-component scope. This is the pattern that directly demonstrates we counted 19 "box-shadow focus-ring" instances as 19 fixes, not 1.
- **Status:** ☐ add Pattern 9 card.

### F3. [HIGH] ✅ release dates verified — portfolio labels are OFF-BY-ONE
- **Correct release cadence (from CHANGELOG.md on feat-ally):**
  | Version | Date | Content |
  |---|---|---|
  | v4.20.0 | 2026-02-24 | First a11y groundwork release (1 headline feat(a11y) commit) |
  | v4.21.0 | 2026-03-19 | **Bulk WCAG 2.2 AA wave** — chip/input/nav/focus-ring work |
  | v4.22.0 | 2026-03-30 | Second wave — Table, FileList, Breadcrumbs, Pagination, ProgressRing, Modal, Calendar, Tooltip, Slider, Avatar + primitive color tokens |
  | v4.23.0 | 2026-04-10 | **jest-axe introduced** + WCAG 2.2 AA extended on Dropdown, ChipInput, Input, Nav, Editable, Listbox, Radio, Calendar, Select, Combobox, Menu |
  | (v4.23.x / v4.24) | 2026-04-14+ | WHCM support commit (post v4.23 tag) |
- **Portfolio currently labels these as v4.20 / v4.22 / v4.23 / v4.23.x — off by one.** The "second wave" in the portfolio is actually v4.21, the "third wave" is v4.22, etc.
- **Fix:** update `RELEASES` constant in [WcagProjectPage.tsx:87-92](src/app/pages/WcagProjectPage.tsx#L87-L92) to the correct versions + dates + content. Consider 5 entries instead of 4 (include WHCM as a separate post-v4.23 release).
- **Status:** ☐ update RELEASES constant.

### F4. [CRITICAL] ✅ component count is 99, not 109
- **Verified:** `git diff --name-only 0c68064..upstream/feat-ally -- 'core/components/**/*.tsx'` with tests + stories stripped → **99 unique component directories touched**.
- **Fix:** Hero KPI `109 components rebuilt` → **`99` (or "~100")**. "110+ components" in the meta strip stays accurate if it describes *scope surveyed*, but say so explicitly.
- **jest-axe file count:** portfolio claim of **119** is EXACT. No change.
- **Status:** ☐ update Hero KPI + meta strip.

### F5. [HIGH] ✅ per-release fix counts (64, 142, 87) have no source — replace or drop
- **Discovery:** the numbers `64 / 142 / 87` in `RELEASES` don't appear in any commit, changelog, or audit file.
- **Fix:** either (a) replace with verifiable commit counts (run `git log v4.19.1..v4.20.0 --oneline | wc -l`, etc.) — gives `N commits / fixes in this release`, or (b) delete the numbers and keep the qualitative summary.
- **Status:** ☐ user decision on which approach.

### F6. [HIGH] ✅ "enforced in CI" wording on jest-axe is slightly overstated
- **Discovery:** jest-axe tests run as part of `npm test`, so they block PR merges. But nothing in the repo prevents a *new* component from being added without an axe test — that's a code-review gate, not a CI-automated one.
- **Fix:** change Testing section wording from "A component without an axe test cannot ship — enforced in CI." to "A component without an axe test cannot ship — enforced via review; every existing component carries a baseline. A future CI rule to auto-block new components without tests is the next milestone."
- **Status:** ☐

### F7. [HIGH] ✅ three NEW sources to include in the Method section
- **Discovered in the branch — all real, all verifiable, all strengthen the story:**
  1. **`.claude/skills/a11y/SKILL.md`** — the custom Claude skill itself, checked into the repo. This is the literal artifact of "we built our own tooling." Reference it by file path.
  2. **`core/utils/docPage/AccessibilityPropTable.tsx`** — a reusable docs-site component that auto-renders each component's a11y props. Proof we're shipping accessibility docs, not just promising them.
  3. **11 component-level `accessibility.mdx` docs pages** — badges, breadcrumbs, checkbox, chips, icons, inlineEditableFields, inputs, linkButton, links, radio, select. Each component gets its own a11y page. This is concrete evidence of "accessibility as documentation" and contradicts the common DS-maturity gap where a11y is buried in a single top-level page.
  4. **Three rings of defense** — lint (`eslint-plugin-jsx-a11y`), inspect (`@storybook/addon-a11y`), test (`jest-axe`) — worth a small "defense-in-depth" card in the Method section. All three are in `package.json` on feat-ally; none on baseline.
- **Fix:** work these into Section 4 (Method) or expand Section 8 (Verification) to a "three rings" layout. Exactly what goes where is a content-design choice — flag for Pass 2.
- **Status:** ☐

---

## Part G — Final QA before shipping

### G1. [CRITICAL] No untraced number left on the page
- **Check:** grep the final file for every digit. For each digit that isn't obvious CSS (paddings, heights), confirm a source-of-truth file owns it.
- **Status:** ☐

### G2. [CRITICAL] No unverified DS-comparison cell left
- **Check:** every cell in `BENCHMARK_ROWS` has a corresponding entry in `guidelines/benchmark-verification.md` with a public URL.
- **Status:** ☐

### G3. [HIGH] Accessibility pass of the page itself (meta)
- **Check:** the page *about* accessibility must itself pass its own bar.
  - Contrast: borders ≥ 2.5:1, body text ≥ 4.5:1, small mono labels ≥ 3:1 on their own background
  - Keyboard: accordion pattern cards reachable by Tab + openable with Enter/Space
  - Screen reader: `aria-expanded` on each `PatternCard` button, labelled section headings (h2 per section — they're already using h2, confirm hierarchy)
  - Respect `prefers-reduced-motion` (Framer `motion` will but our CSS radar-rings won't — gate them in media query)
- **Status:** ☐

### G4. [HIGH] Mobile layout
- **Check:** new wider canvas shouldn't break mobile. Every `md:grid-cols-*` should degrade gracefully. Test at 375px + 768px + 1440px.
- **Status:** ☐

### G5. [MEDIUM] Page performance
- **Check:** recharts ResponsiveContainer render is fine; no console warnings; bundle size delta acceptable.
- **Status:** ☐

---

## Execution Order (after this tracker is approved)

1. Wait for three verification reports (audit-data-analysis.md, mds-branch-verification.md, benchmark-verification.md).
2. Review the reports. Update *this* tracker's "Status" columns with any scope additions discovered during verification.
3. Execute the fixes in this order (to minimise merge conflicts and rework):
   - **Pass 1 — data accuracy** (Part B, Part F4, Part D1, Part F3) — update constants + table cells.
   - **Pass 2 — new content** (Part C, Part E1, Part F2, Part E3) — add cross-product section, §508 section, new patterns, limitations callout.
   - **Pass 3 — visual overhaul** (Part A) — widen canvas, bump contrast, add right-rail visuals, adjust charts.
   - **Pass 4 — polish + QA** (Part E4, D2, D3, all Part G items) — footnotes, hover citations, attribution, final accessibility + responsive pass.
4. Browser-test the whole thing at 3 viewport sizes on `#030303` background.
5. Publish only when Part G's checklist is all ticked.

---

## Open questions to confirm with the user before Pass 2

- **On cross-product numbers:** okay to *cap* the DS-fix attribution conservatively? e.g. if 340 of Case/Care's issues trace to a dropdown bug we fixed, but some of those instances also depend on the product team passing an `aria-label` prop, do we count those as "resolved by DS" or "shared"? Default = shared unless the DS fix alone makes the violation go away, which is the honest threshold.
- **On §508 scope:** do we want to mention §508 or VPAT/ACR (Accessibility Conformance Report)? If Innovaccer has a published VPAT this case study is built for, reference it.
- **On DEQUE re-count:** if the combined DEQUE count is still small (e.g. 25), is the "Nx deeper" framing still the lead, or pivot to "DEQUE is a great tool — we went further *because we had source access*"? Second framing is more respectful to DEQUE and still makes our point.
