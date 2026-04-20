# WCAG Case Study — v3 Upgrade Tracker

User-driven punch list after v2 ship. Fix 10 issues, add design-focus, swap in real blast-radius data.

**Ground truth sources for this round:**
- MDS repo at `/Users/abhiroop.chaudhuri/Desktop/DEVELOPMENT/MDS/design-system` — branch **`feat-ally-r4`** (local, most recent)
- `json-audit/AI_DS_Audit (1).pdf` — internal audit v2, source-code-verified (Feb 13 2026)
- `json-audit/*.json` — DEQUE exports already processed in `guidelines/audit-data-analysis.md`

**Execution policy:** no more asking. Fast + accurate. Batch data-gathering; batch edits.

---

## Issue #1 — Minimum font size 12px

### Sub-tasks
- [ ] Audit every `text-[NN]` and `text-[clamp(...)]` value in [WcagProjectPage.tsx](src/app/pages/WcagProjectPage.tsx) for sizes below 12px.
- [ ] Bump anything `[9px]`, `[9.5px]`, `[10px]`, `[10.5px]`, `[11px]`, `[11.5px]` to at least `[12px]`.
- [ ] Rescale ratios: mono labels that were 10px → 12px; mono labels that were 11px → 12px; mono labels that were 12px → 12.5px. Keep information hierarchy.
- [ ] Adjust `tracking-*` after bump if letters feel too tight/loose at new size.
- [ ] Build + eyeball.

---

## Issue #2 — Blast-radius card empty squares → real per-product impact viz

### Sub-tasks
- [ ] Remove empty 21-square grid.
- [ ] Replace with a compact "MDS fix → product issues closed" viz using real numbers from `audit-data-analysis.md`:
  - Case/Care: 1,001 / 1,628 = 61.5%
  - Outreach: 532 / 1,037 = 51.3%
  - DAP: 418 / 1,158 = 36.1%
- [ ] Card shows 3 inline product impact mini-bars with product name, count, and percent, each tied to a representative MDS root-cause fix ("focus-ring token → 262 closed", etc.).
- [ ] Make it feel like a compact preview that previews Cross-Product section (Section 11).

---

## Issue #3 — Baseline should combine DEQUE + our expanded audit

### Sub-tasks
- [ ] Acknowledge: CSV tracker rows like "Windows High Contrast Mode" are single-line but affect N components. Real per-component expanded count is higher than 327.
- [ ] Derive expansion from feat-ally-r4 repo + AI_DS_Audit.pdf:
  - WHCM commit touched 19 components → +18 over 1 tracker row
  - PopperWrapper issues cascade to 6+ consumers → +5 per issue × 2 issues (Escape, role) = +10
  - `--secondary` border fails in 4–6 components → +5
  - Box-shadow focus fallback needed in 4 components (Link, Checkbox, Switch, Chip at minimum) → +3
  - Tabs 7 violations × 1 row = +6 (each is a distinct fix)
  - Multiplier estimate: collapsed 327 → expanded ~480 (conservative)
- [ ] Update Hero KPI `Issues catalogued` card to show both numbers: `193 (Deque) + 327 AI-skill` or `520+ combined`.
- [ ] Update Context section Baseline card: rows for Deque issues, AI-skill audit issues (collapsed), expanded per-component.
- [ ] Add brief explainer sentence on methodology.

---

## Issue #4 — Method pipeline: add AI design-research + Codex PR review loop

### Sub-tasks
- [ ] Replace current 3-stage pipeline ("Custom Claude skills · Contrast script · AI-reviewed exceptions") with a 5-stage pipeline:
  1. **Custom Claude skills** — source-tree-aware audit
  2. **Automated contrast script** — token pair scan
  3. **AI-reviewed exceptions** — decorative / disabled / icon-as-text allowlist
  4. **AI research pass for design fixes** — for issues that need design changes (not code), an AI pipeline researched other products, WCAG interpretations, and a11y forums to propose the best remediation pattern; outputs design recommendations with references
  5. **Design iteration → Codex review cycle** — design gets updated, Claude + Figma MCP pushes the code change, OpenAI Codex reviews the PR and flags gaps, cycle continues until green
- [ ] Add placeholder image on the right of the AI research stage showing an example AI recommendation output.
- [ ] Add placeholder image showing the Codex PR review + Figma MCP cycle.

---

## Issue #5 — Remove "Every issue was tagged" block

### Sub-tasks
- [ ] Delete the `CardShell` at the bottom of the Method section containing "Every issue was tagged with its success criterion..." text + the 4 tag pills.

---

## Issue #6 — Benchmark table too thin — add more rows

### Sub-tasks
- [ ] Find 4–6 more state-of-the-art MDS patterns to compare. Candidate sources:
  - feat-ally-r4 commits: custom Claude skill files, AccessibilityPropTable, per-component accessibility.mdx pages, WHCM CSS modules, focus ring outline-based approach, corner-marker selection pattern
  - Compare each against real code or docs of Spectrum/Carbon/Material/Polaris
- [ ] Current 3 verified rows stay.
- [ ] Add candidate rows (verify each against cloned repos in `/tmp/ds-bench`):
  - `forced-colors` media query coverage across stateful components
  - Per-component accessibility documentation page shipped with library
  - Shipped eslint-plugin-jsx-a11y preset consumers can adopt
  - Outline-based focus ring (vs box-shadow) with explicit offset
  - Corner/tick selection marker on options (Select / Dropdown / Listbox) beyond color-only
  - Context-aware contrast allowlist (decorative / disabled / icon-as-text auto-classify)

---

## Issue #7 — Fix spacing & layout weirdness (Inventory + anywhere else)

### Sub-tasks
- [ ] Inventory section: Severity Split card has trailing empty space under the 3 severity tiles. Shrink the card or merge the "54 success criteria · 55 components · 100% tracked" footer more compactly.
- [ ] Consider moving the chart on the right to be same height as left card (use `h-full` on both `CardShell`s inside the grid).
- [ ] Sweep every `grid` + `CardShell` combo for uneven column heights; normalize.
- [ ] Audit section for orphan/widowed empty space (Method section, Testing section).

---

## Issue #8 — Timeline chart dates wrong + remove version blocks

### Sub-tasks
- [ ] Timeline starts Jan 2026, not Oct 2025. Audit date is Feb 13 2026 per the PDF + Apr 20 2026 for DEQUE.
- [ ] New timeline points: Jan 2026 (baseline, 27.6%) · Feb 2026 (after internal audit, ~50%) · Mar 2026 (bulk fixes shipped, ~80%) · Apr 2026 (final, 100%).
- [ ] Remove the `RELEASES` constant + the grid rendering release cards from the Impact section.
- [ ] Drop the "`Compliance %` (green) vs `Open issues`" caption's date range reference to Oct 2025.

---

## Issue #9 — Soften §508 caveat language

### Sub-tasks
- [ ] Rewrite the trailing "§508 covers federal procurement..." paragraph from lawyer-speak to casual "here's how we think about it" framing.
- [ ] Keep accuracy (DS-level claim, product-level depends on consumption) but use words like "at the component level we're solid — how products wire it up is on them."

---

## Issue #10 — Add design changes (not just code)

### Sub-tasks
- [ ] Identify design-level changes in feat-ally-r4 vs main. Candidates from grep:
  - Darker focus ring with explicit offset (moved from box-shadow to outline-based)
  - Selection cues: corner marker + check mark on selected options (Select, Dropdown, Listbox)
  - Hover/active state color token refresh (primary-lightest etc.)
  - Chip selected state visual updates
  - Input focus ring outline refresh
  - Button selected state with outline (Toast close button, Listbox selection)
  - Link default / subtle / disabled state visual redesign
- [ ] Add a new section between Architecture (Patterns) and Verification — call it `DESIGN CHANGES // 08` or similar.
- [ ] 4–6 design-change cards, each with:
  - Name of change
  - Components affected
  - Before/after placeholder image
  - One-sentence rationale (WCAG SC it addresses)
- [ ] Use placeholder `<div className="aspect-video bg-white/5 border border-white/20 rounded">` boxes with a label like "[before-after: focus ring]" so user can swap for real image later.

---

## Execution plan (batched)

**Batch A — trivial text/delete (fastest):**
- Issue #5 (remove block)
- Issue #9 (soften §508 caveat)
- Issue #8b (delete RELEASES + release-card render)

**Batch B — font size sweep:**
- Issue #1 (12px minimum across file)

**Batch C — data-requiring edits (needs MDS repo grep):**
- Issue #2 (blast radius real data)
- Issue #3 (expanded issue count)
- Issue #6 (benchmark table new rows)
- Issue #10 (design changes section)

**Batch D — chart + layout:**
- Issue #4 (Method pipeline rework + placeholder images)
- Issue #7 (spacing fixes)
- Issue #8a (timeline chart data correction)

**After each batch:** build + verify clean.

---

## Data-gathering jobs to run in parallel with Batches A–B

1. `git checkout feat-ally-r4` on MDS repo + diff summary vs main
2. Grep for design-change markers in the branch:
   - box-shadow → outline in focus styles
   - corner markers on selected Select/Dropdown/Listbox options
   - new focus-ring tokens
   - chip selected state styles
3. Grep for component count with box-shadow focus (for WHCM multiplier)
4. Grep for `eslint-plugin-jsx-a11y` preset export from the package
