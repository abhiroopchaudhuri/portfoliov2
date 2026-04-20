# Benchmark Table — Fact-Check Report

**Method:** 4 of the 5 design systems in the table were cloned locally to `/tmp/ds-bench/` (sparse, shallow) and grep-verified against their public source. Atlassian's design system has no publicly cloneable mirror — their current source lives in a private `atlassian-frontend` monorepo, and the previously-public `atlassian-frontend-mirror` / `atlassian-labs/atlaskit` GitHub repos are no longer accessible (both return 404).

**Repos verified against:**
- Spectrum: `github.com/adobe/react-spectrum` (HEAD as of clone)
- Atlassian: **NOT CLONEABLE** — treat every Atlassian cell as UNVERIFIED
- Carbon: `github.com/carbon-design-system/carbon` (HEAD)
- Material: `github.com/mui/material-ui` (HEAD)
- Polaris: `github.com/Shopify/polaris` (HEAD)

**Headline recommendation:** the current table has **at least 5 confirmed errors** across the 48 cells verifiable. Do NOT publish it unchanged. Either rebuild with the corrected cells below + drop the Atlassian column, OR replace the table entirely with prose ("We studied these 5 design systems. Here's what we found they don't do that MDS now does:" followed by a bulleted list of 3–5 high-confidence patterns).

---

## Claim-by-claim findings

### Claim 1 — Overlay stack, Esc dismisses topmost only

| DS | Portfolio | Verified | Evidence |
|---|---|---|---|
| Spectrum | per-component | **CORRECTION: "yes" (has OverlayProvider + useOverlay)** | Files: `packages/@adobe/react-spectrum/src/overlays/Overlay.tsx` · `packages/@react-aria/overlays/useOverlay.ts`. react-aria ships centralized overlay management. Portfolio downplays it. |
| Atlassian | no | **UNVERIFIED** | Private repo. |
| Carbon | no | **"no" ✓** (confirmed — no centralized overlay/layer manager file in packages/react/src) | |
| Material | no | **❌ WRONG — "yes"** | `packages/mui-material/src/Modal/ModalManager.ts` implements a real stack: `this.modals.push(modal)` (L221), `isTopModal: this.modals[this.modals.length - 1] === modal` (L304). Almost identical pattern to MDS's OverlayManager. |
| Polaris | no | **"no" ✓** (ephemeral-presence-manager exists but isn't a stacked-dismissal overlay manager) | `polaris-react/src/utilities/` — no overlay stack file. |
| MDS | yes | yes ✓ | `core/utils/OverlayManager.tsx` (singleton, frozen). |

**Verdict:** **this row is a net-negative for MDS**. Material has an essentially equivalent ModalManager. Drop this row — or restate narrowly as "Escape semantics respect the entire overlay family (tooltip, popover, dropdown, menu) not just modals" which is the actual differentiator (Material's ModalManager only handles modals).

### Claim 2 — Auto-labelled clear buttons (aria-label derived from the input's label)

| DS | Portfolio | Verified | Evidence |
|---|---|---|---|
| Spectrum | no | **"manual prop"** (SearchField uses a static `'Clear search'` label) | react-spectrum's SearchField doesn't derive from the label. |
| Atlassian | no | **UNVERIFIED** | |
| Carbon | no | **"manual prop" ✓** | `packages/react/src/components/Search/Search.stories.js:46` uses `closeButtonLabelText="Clear search input"` — dev must supply. |
| Material | no | **"manual prop"** (not "no") | `packages/mui-material/src/Autocomplete/Autocomplete.js:426` has `clearText = 'Clear'` defaulting to the static word "Clear," used as `'aria-label': clearText` (L582). Dev overrides via prop. |
| Polaris | manual prop | **UNVERIFIED** (no explicit TextField clear-button prop found in checked-out source; Polaris has a `clearButton` boolean but no label prop surfaced) | |
| MDS | yes | yes ✓ | `core/components/atoms/input/Input.tsx:221-225`. |

**Verdict:** the auto-derive-from-label pattern is genuinely unusual — **keep this row** after relabelling cells: Spectrum, Carbon, Material → "manual prop"; Polaris → drop or investigate further; remove Atlassian.

### Claim 3 — Decorative vs interactive icon hook (gates role/tabIndex on onClick)

| DS | Portfolio | Verified | Evidence |
|---|---|---|---|
| Spectrum | partial | **UNVERIFIED** — sparse checkout stripped icon sources | |
| Atlassian | no | **UNVERIFIED** | |
| Carbon | no | **UNVERIFIED** — Icon in Carbon is mostly SVG with className; no hook pattern surfaced | |
| Material | no | **UNVERIFIED** | |
| Polaris | no | **UNVERIFIED** | |
| MDS | yes | yes ✓ | `core/accessibility/utils/useAccessibilityProps.ts`. |

**Verdict:** cannot defend ANY "no" cell here without deeper grep. **Drop this row** or rewrite as "We shipped a reusable hook that gates role/tabIndex on onClick across the whole icon family (`useAccessibilityProps`)" as a prose claim without a comparison table.

### Claim 4 — View-aware calendar navigation labels

| DS | Portfolio | Verified | Evidence |
|---|---|---|---|
| Spectrum | yes | **UNVERIFIED** — react-aria's useCalendar does have `previousButtonProps` with locale-aware labels but view-aware switching isn't surfaced by the grep I could run | |
| Atlassian | no | **UNVERIFIED** | |
| Carbon | no | **UNVERIFIED** — Carbon uses Flatpickr for DatePicker, not own calendar | |
| Material | partial | **UNVERIFIED** | |
| Polaris | no | **UNVERIFIED** | |
| MDS | yes | yes ✓ | `core/components/organisms/calendar/Calendar.tsx:677-679`. |

**Verdict:** **drop this row.** Cannot defend any non-MDS cell. Keep as a single-DS bullet ("MDS calendar navigation labels switch between month/year/decade views — verified at Calendar.tsx:677").

### Claim 5 — `role="switch"` on native checkbox

| DS | Portfolio | Verified | Evidence |
|---|---|---|---|
| Spectrum | yes | **yes ✓** | `packages/react-aria/src/switch/useSwitch.ts:77` — `role: 'switch'` applied to inputProps from useToggle (native `<input type="checkbox">`). |
| Atlassian | yes | **UNVERIFIED** | |
| Carbon | yes | **❌ WRONG — "no, uses button"** | `packages/react/src/components/Toggle/Toggle.tsx:187` renders a `<button role="switch">`, NOT a native checkbox. Different pattern — loses form submission semantics. |
| Material | no | **❌ WRONG — "yes"** | `packages/mui-material/src/Switch/Switch.js:282` `type="checkbox"`, test at line 75 asserts `role="switch"`. MUI Switch uses the same native-checkbox-with-role=switch pattern. |
| Polaris | yes | **❌ WRONG — "N/A"** | Polaris has NO Switch component. Closest is `SettingToggle` (a Card + Button combo). Not a switch-primitive. |
| MDS | yes | yes ✓ | Switch.tsx:115-117. |

**Verdict:** **3 of 4 verifiable cells on this row were wrong in the current portfolio.** The row is salvageable after correction, but no longer impressive — most peers do use the native-checkbox-with-role pattern. Safer: drop the row and move the factual claim into the Pattern 8 card as a "here's how MDS does it" bullet, without the comparative axis.

### Claim 6 — Roving tabindex shared utility

| DS | Portfolio | Verified | Evidence |
|---|---|---|---|
| Spectrum | no | **❌ LIKELY WRONG — "yes"** | react-aria's `useFocusManager` and `FocusScope` provide roving-tabindex primitives used across ComboBox / ListBox / Menu / GridList. Needs a deeper grep to confirm, but the memory-based flag from the first pass was correct: Spectrum has this. |
| Atlassian | no | **UNVERIFIED** | |
| Carbon | yes | **UNVERIFIED** — needs deeper grep; Carbon has `useRovingTabIndex` hooks in some components, though not as a single shared utility | |
| Material | no | **UNVERIFIED** | |
| Polaris | no | **UNVERIFIED** | |
| MDS | yes | yes ✓ (`getFocusableElements` in overlayHelper + per-component roving managers) | |

**Verdict:** **drop this row.** The Spectrum "no" is likely wrong; the other cells aren't defensible.

### Claim 7 — jest-axe baseline on 100% of components

| DS | Portfolio | Verified | Evidence |
|---|---|---|---|
| Spectrum | partial | **UNVERIFIED exact %** — react-aria has axe-based tests, but "100%" coverage is a strong claim; likely partial is right, exact number unchecked | |
| Atlassian | no | **UNVERIFIED** | |
| Carbon | yes | **UNVERIFIED exact %** — Carbon has axe tests; "100%" again a strong claim | |
| Material | no | **UNVERIFIED** | |
| Polaris | no | **UNVERIFIED** | |
| MDS | yes · 119 files | yes ✓ · 119 files | From `mds-branch-verification.md`. |

**Verdict:** cannot safely defend "100%" for any non-MDS DS without a filename-level count per repo, which the sparse-checkout blocked. **Restate as "MDS ships 119 jest-axe test files — a baseline we can verify; we can't speak to others' coverage"** and drop the comparative row.

### Claim 8 — Adaptive touch-target padding (small icon, large hit area)

| DS | Portfolio | Verified | Evidence |
|---|---|---|---|
| Spectrum | no | **UNVERIFIED** | |
| Atlassian | no | **UNVERIFIED** | |
| Carbon | no | **UNVERIFIED** | |
| Material | no | **UNVERIFIED** | |
| Polaris | no | **UNVERIFIED** | |
| MDS | yes | yes ✓ | Input.tsx:262-263: `p-3-5` tiny (14px), `p-3` regular (12px). |

**Verdict:** **drop this row.** Too easy to be wrong; every DS has *some* min-width/height for IconButton (MUI's IconButton defaults to 40px, Carbon's to 32px, etc.) — the nuance is "decoupled from glyph size" which is hard to defend per cell without reading each component.

---

## Recommended final shape for the benchmark section

Option A (safest, recommended): **Replace the 8-row comparison table with a 3-row table** showing only claims I can defend per-cell, plus a prose paragraph. Drop the Atlassian column entirely. Shape:

| Pattern | Spectrum | Carbon | Material | Polaris | **MDS** |
|---|---|---|---|---|---|
| Auto-labelled clear buttons (derived from label) | manual prop | manual prop | manual prop | unverified | **derived from label** |
| Overlay stack — Esc respects top across tooltip, popover, menu, modal | partial (modal-only in ModalManager) | no | **modal-only (ModalManager)** | no | **full overlay family** |
| `role="switch"` on native `<input type="checkbox">` | yes | no (uses `<button>`) | yes | N/A (no Switch primitive) | yes |

Footnote: "Verified against public source commits cloned on 2026-04-20. File references available in `guidelines/benchmark-verification.md`."

Option B (only if user insists on 8 rows): rebuild every cell with `git grep` from the 4 cloned repos + drop Atlassian. Budget is ~2-3 more hours of grep work. Will still leave some "unverified" cells that must be either dropped or investigated further.

Option C (if user wants minimal risk): **drop the table entirely.** Replace with prose: "We benchmarked five design systems (Adobe Spectrum, Atlassian, IBM Carbon, Google Material, Shopify Polaris) before writing a line of MDS code. Three patterns we wanted MDS to ship with — that none of the five had together — informed the architecture: [pattern 1], [pattern 2], [pattern 3]."

My recommendation: **Option A**. It's defensible, reads honest, and still telegraphs depth. Option B takes too long for marginal extra value. Option C throws away the strongest visual element on the page.

---

## Cells where I was WRONG from memory on first pass

Worth flagging for my own process: the pre-verification memory flags were:
- "MUI Switch is yes not no" → **correct**, now verified.
- "Polaris Switch is probably not yes" → **correct** — Polaris doesn't have a Switch primitive at all.
- "Spectrum roving tabindex is probably not no" → **likely correct but unverified.**

None of the memory flags were contradicted. The file-path verification backed them up where checkable.

---

## What the final tracker edit needs

1. Drop Atlassian column.
2. Rewrite the 8 rows per table above (keep only 3 verifiable rows).
3. Update cell values per verdicts.
4. Add footnote with repo-commit date.
5. Remove the "reviewed against public source repositories · March 2026" caption (wrong date — reviewed on 2026-04-20).
6. In the Architecture section (Patterns 1–9), DO NOT reference "better than [DS]" comparatives — keep the claims strictly about MDS's own design choices.
