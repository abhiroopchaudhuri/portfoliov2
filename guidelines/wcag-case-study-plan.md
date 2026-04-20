# WCAG Case Study — Page Plan

**Route**: `/projects/wcag` → `src/app/pages/WcagProjectPage.tsx`
**Goal**: Million-dollar portfolio case study. Dense but scannable. Charts + tables + well-crafted code snippets. Tells the story of 27.6% → 100% WCAG 2.2 / Section 508 compliance across MDS, rippling to 20+ Innovaccer products.

**Non-negotiable themes to land**:
1. Our audits were **deeper and broader** than Deque (industry leader) — 327 issues vs Deque's 9.
2. We built **custom AI skills + scripts** that read the codebase, not just the rendered DOM (contrast checker + AI-reviewed decorative/disabled exceptions).
3. We benchmarked against **Adobe Spectrum, Atlassian, Carbon, Material, Shopify Polaris** before fixing — identified their gaps where we go further.
4. Fixes were **architecturally clever**, not just ARIA spray — reusable utilities (OverlayManager, useAccessibilityProps, overlayHelper, testAxe wrapper) + zero-new-API patterns (auto-labeled clear buttons).
5. **Compliance impact is cross-product** — 20+ products inherit the fix.

**Tone**: Confident, specific, technical. Avoid flowery copy. Keep the reader moving.

---

## Theme + Design Tokens (re-used from portfolio)

- Background: `#030303`. Text: `white/90`. Accent orange: `#F05D23`.
- Complementary accents for charts/data viz (approved to extend beyond orange):
  - **Green / "fixed"**: `#4ADE80` (emerald-400) — for compliant / resolved.
  - **Red / "critical"**: `#F87171` (red-400) — for P0.
  - **Amber / "high"**: `#FBBF24` (amber-400) — for P1.
  - **Blue / "medium"**: `#60A5FA` (blue-400) — for P2.
  - **Slate text**: `#9a9a9a`, `#717182`.
- Cards: `border border-white/[0.06] bg-[rgba(8,8,8,0.55)] rounded-xl` + inset highlight shadow.
- Section container: `border-white/[0.09] bg-[rgb(14_14_14/0.5)] backdrop-blur-2xl rounded-2xl`.
- Section label: `font-mono text-[10px] uppercase tracking-[0.2em] text-[#F05D23]/80`.
- Display H1: `font-mono text-[clamp(1.25rem,4vw,2rem)] uppercase tracking-[0.18em]`.
- Scroll-reveal motif: `motion.div initial={{opacity:0,y:36,filter:'blur(6px)'}} whileInView` with `ease:[0.16,1,0.3,1]`.
- Reuse `NoiseOverlay` from App.tsx (import if exported, or re-declare).
- Max width: `max-w-5xl` (slightly wider than default `max-w-4xl` to fit charts without feeling cramped).

---

## Page Structure (sections, in scroll order)

### 0. Page Shell
- Sticky-ish back link `← INDEX` (top-left, matches existing pattern).
- Fixed subtle noise overlay.
- One decorative radar-ring in hero region (opacity-10). No data-stream hex — would be visual noise here.

### 1. Hero
- **Section label**: `CASE STUDY // 001  —  ACCESSIBILITY`
- **Title**: `WCAG 2.2 + Section 508` on line one, `Compliance for MDS` on line two (mono, uppercase).
- **Sub-deck** (one line, `text-white/60`): "How a small team took Innovaccer's Masala Design System from 27.6% to 100% compliance — and pulled 20+ products along with it."
- **Meta strip** (horizontal inline, separated by `│`):
  - `ROLE / Product Designer + A11y Lead`
  - `SURFACE / 110+ components`
  - `DURATION / Oct 2025 – Apr 2026`
  - `STACK / React · TS · jest-axe`
- **Hero KPI band** (four tiles in a row, big numbers, subtle border):
  - `27.6% → 100%` compliance
  - `327` issues catalogued
  - `109` components rebuilt
  - `20+` products inheriting fixes
- Scroll hint chevron.

### 2. The Problem (Context)
- **Section label**: `CONTEXT // 01`
- **Heading**: "Why 27.6% is worse than it sounds"
- **Body** (2 short paragraphs, ~80 words):
  - Healthcare products have statutory accessibility obligations (Section 508, ADA, WCAG 2.2 AA). Every Innovaccer product is built on MDS. A single missing `aria-expanded` on a dropdown ships to every customer on every product.
  - Initial external audit (Deque) flagged **9 issues**. Our internal sampling suggested that number was 1–2% of the real surface area. We decided to audit ourselves — rigorously.
- **Side callout** (right column or below): "Baseline compliance: 27.6% · Baseline audit depth: 9 issues (Deque) · Products at risk: 20+"

### 3. The Gap — Ours vs Deque
- **Section label**: `AUDIT DEPTH // 02`
- **Heading**: "Why automated audits miss 97% of real issues"
- **Chart** (recharts horizontal bar OR a dual-stat comparison):
  - Deque axe Auditor: **9 issues** (all in `Target Size 2.5.8`, `Dragging 2.5.7`, `Focus Not Obscured 2.4.11` buckets)
  - Our audit: **327 issues** spanning 54 success criteria
  - Ratio: **36.3× more depth**
- **Explanation paragraph**: Industry auditors run rule-engines over a rendered page. They can't tell a decorative icon from a functional one. They can't navigate nested props. They can't grep the codebase. They can only see what a browser paints.
- **Small table — "what Deque saw vs what we found"**:
  | Category | Deque | Our audit |
  |---|---:|---:|
  | Target size (2.5.8) | 8 | 12 |
  | Dragging alternatives (2.5.7) | 1 | 4 |
  | Focus obscured (2.4.11) | 1 | 6 |
  | ARIA relationships (1.3.1) | 0 | 87 |
  | Name, Role, Value (4.1.2) | 0 | 64 |
  | Keyboard (2.1.1) | 0 | 38 |
  | Focus visible (2.4.7) | 0 | 22 |
  | Info & Relationships | 0 | 49 |
  | Other SC | 0 | 45 |
  | **Total** | **9** | **327** |

### 4. How We Built a Deeper Audit
- **Section label**: `METHOD // 03`
- **Heading**: "A code-aware audit pipeline"
- **3-column diagram card** (stacked on mobile):
  1. **Custom Claude skills** — component-specific prompts that read the source tree (`core/src/components/**`), not the DOM. Understand composition, prop plumbing, ref flows.
  2. **Automated contrast script** — walks every `.scss`/`.tsx` token pair, computes WCAG AA ratios across default/hover/active/focus/disabled states. Outputs a JSON diff.
  3. **AI-reviewed exceptions** — contrast failures routed through a second-pass classifier: is this element decorative? Disabled? Icon-as-text? Context-aware allowlist replaces the blunt "everything must be 4.5:1" heuristic.
- **Follow-up paragraph**: "The result was a single prioritised register: **P0 critical · P1 high · P2 medium-to-low**. Each issue was tagged with the WCAG success criterion, the offending code path, and the proposed fix. No issue was closed without a jest-axe test."
- **Placeholder image**: schematic diagram of the pipeline (text-only OK for now — a terminal-style ASCII box with three lanes).

### 5. Benchmarking — How Top DSs Compare
- **Section label**: `BENCHMARK // 04`
- **Heading**: "We studied the best before we fixed ours"
- **Intro paragraph** (1 sentence): "Before writing a single line of code, we disassembled five industry-defining design systems looking for gaps to exceed — not patterns to copy."
- **Comparison table** (most info-dense element of the page — show this is the differentiator):
  | Pattern | Adobe Spectrum | Atlassian | IBM Carbon | Material | Shopify Polaris | **MDS (now)** |
  |---|---|---|---|---|---|---|
  | Overlay stack (Esc dismisses topmost only) | Per-component | ✗ | ✗ | ✗ | ✗ | **Global OverlayManager** |
  | Auto-labelled clear buttons | ✗ | ✗ | ✗ | ✗ | Manual prop | **Derived from label** |
  | Decorative vs interactive icon hook | Partial | ✗ | ✗ | ✗ | ✗ | **`useAccessibilityProps`** |
  | View-aware calendar nav labels | ✓ | ✗ | ✗ | Partial | ✗ | **✓** |
  | `role="switch"` on native checkbox | ✓ | ✓ | ✓ | ✗ | ✓ | **✓** |
  | Roving tabindex shared utility | ✗ | ✗ | ✓ | ✗ | ✗ | **✓ (`getAllFocusableElements`)** |
  | jest-axe baseline on 100% of components | Partial | ✗ | ✓ | ✗ | ✗ | **✓ (119 files)** |
  | Touch target auto-padding for small icons | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
- **Caption below table**: "Checked against public source repositories as of March 2026. Where a pattern is partially present, we reviewed the implementation and judged scope."

### 6. The Register — Issues at a Glance
- **Section label**: `INVENTORY // 05`
- **Heading**: "327 issues, classified and prioritised"
- **Stacked bar or donut (recharts)**:
  - **P0 Critical** — 34 issues (red)
  - **P1 High** — 144 issues (amber)
  - **P2 Medium/Low** — 149 issues (blue)
- **Companion stat strip**: `54 success criteria · 55 components touched · 100% tracked to closure`
- **Top-10 offending components bar chart** (horizontal recharts bar):
  - DatePicker (P0:1 P1:3 P2:5 = 9)
  - Dropdown (P1:5 P2:5 = 10)
  - Menu (P1:5 P2:5 = 10)
  - Combobox, Listbox, Select, Calendar, Table, FullscreenModal, Chip/ChipInput
- **Note**: "One pattern, many components. Fixing the shared `ListBody` primitive closed P0 issues in Select, Combobox, Menu, and Listbox simultaneously."

### 7. Patterns That Earned Their Keep
*This is the centrepiece. The architecture story.*
- **Section label**: `ARCHITECTURE // 06`
- **Heading**: "Eight choices that repaid themselves across the whole system"
- **Layout**: accordion or vertical cards, each with: pattern name, components it covers, short "why this choice beats the alternative" paragraph (2 sentences max), a 6–10 line code snippet.

#### Pattern 1 — Auto-labelled clear buttons (Input / Chip / Combobox)
- **Cover**: 12 components, 3 files
- **Why clever**: "We could have shipped a new `clearButtonAriaLabel` prop. Instead we derived the name from the label the developer already wrote. Zero API-surface growth, 100% of existing form labels now correctly name two controls instead of one."
- **Code** (compact, from `Input.tsx` L219):
```tsx
const resolvedClearButtonAriaLabel = props['aria-label']
  ? `Clear ${props['aria-label']}`
  : placeholder
  ? `Clear ${placeholder}`
  : 'Clear input';
```
- **Result**: Screen readers now say *"Clear Email, button"* instead of *"button"*.

#### Pattern 2 — `useAccessibilityProps` — the interactivity gate
- **Cover**: Icon, Chip, Button, StatusHint, Card, and 40+ consumer sites
- **Why clever**: "Inverts the usual footgun. Instead of every `<Icon>` defensively setting `role="button"` and ending up as a nested interactive control inside a real `<button>` (the single most-flagged AXE violation), the hook gates all interactive attrs behind the presence of `onClick`."
- **Code** (from `core/accessibility/utils/useAccessibilityProps.ts`, 6 lines):
```ts
if (!onClick) {
  return { ...ariaProps };           // decorative: no role, no tabIndex
}
return {
  onClick, role, tabIndex: tabIndex ?? 0,
  onKeyDown: mapSpaceEnterToClick(role),
  ...ariaProps,
};
```

#### Pattern 3 — `OverlayManager` — stacked-dismissal solved once
- **Cover**: Modal, Sidesheet, FullscreenModal, Popover, Tooltip, Dropdown, Menu
- **Why clever**: "A singleton stack means every overlay asks *'am I on top?'* before handling Escape. Fixes the class of bugs where the tooltip's Escape closed the modal behind it. Zero context providers, zero coordination code in each component."
- **Code** (pseudocode, 5 lines):
```ts
class OverlayManager { overlays: HTMLDivElement[] = []; ... }
export const closeOnEscapeKeypress = (e, overlay, onClose) => {
  if (e.key === 'Escape' && OverlayManager.isTopOverlay(overlay)) onClose(e);
};
```

#### Pattern 4 — `overlayHelper` — portable focus trap
- **Cover**: Modal, Sidesheet, FullscreenModal, Popper
- **Why clever**: "Three things every blog-post focus-trap snippet gets wrong, one utility fixes: (1) excludes `[inert]` ancestors so stacked overlays work, (2) supports non-tabbable `staticFocusTarget` for initial focus on a heading without breaking Shift+Tab, (3) refuses to restore focus when a newer dialog is now on top."
- **Code** (compact, 5 lines):
```ts
export const handleFocusTrapKeyDown = (e, container, staticFocusTarget) => {
  if (e.key !== 'Tab') return false;
  const focusables = getFocusableElements(container);
  /* wrap + honour staticFocusTarget + skip [inert] */
};
```

#### Pattern 5 — View-aware Calendar navigation labels
- **Cover**: Calendar, DatePicker, DateRangePicker
- **Why clever**: "The same `<`/`>` chevrons mean 'month back' on the date view but 'decade back' on the year view. Sighted users read the heading to disambiguate; screen reader users can't. Labels now change with the current view."
- **Code** (4 lines):
```tsx
if (view === 'date')  label = type === 'prev' ? 'Previous month' : 'Next month';
if (view === 'month') label = type === 'prev' ? 'Previous year'  : 'Next year';
if (view === 'year')  label = type === 'prev' ? 'Previous year block' : 'Next year block';
```

#### Pattern 6 — Hydration-safe unique IDs
- **Cover**: Input, InputMask, VerificationCodeInput, Checkbox, Radio, Switch
- **Why clever**: "Early attempts hit three separate failures — name-based IDs collided across fields, `Math.random()` churned Jest snapshots, module counters broke SSR hydration. A lazy-initialised ref gives one stable ID per instance without needing React 18's `useId` (the codebase supports older React)."
- **Code** (4 lines):
```tsx
const idRef = React.useRef<string | null>(null);
if (idRef.current === null) idRef.current = `Input-inlineLabel-${uidGenerator()}`;
```
- **Note**: We picked `aria-describedby` (not `-labelledby`) so the inline label supplements the visible one.

#### Pattern 7 — Adaptive touch-target padding on inline icons
- **Cover**: Input, Tabs, Select, DatePicker close buttons, Chip
- **Why clever**: "Decouples the *visual* icon size from the *hit target*. A 12px glyph still gets 14px padding to reach WCAG 2.5.8 AAA's 24×24 minimum. The icon looks delicate, the tap area isn't."
- **Paired with image placeholder**: small visual showing icon + padding hit-area overlay (optional — text caption explains).

#### Pattern 8 — `role="switch"` on a native checkbox
- **Cover**: SwitchInput
- **Why clever**: "Keeps native form semantics (form submission, `htmlFor` labels, default focus handling) while presenting as a WAI-ARIA switch. No custom `<div role='switch'>` re-implementation — which would lose `name`/`value` and break `<form>`."
- **Code** (4 lines):
```tsx
<input type="checkbox" role="switch"
       aria-checked={checked} checked={checked}
       onKeyDown={mapSpaceToToggle} {...rest}/>
```

### 8. Testing Infrastructure
- **Section label**: `VERIFICATION // 07`
- **Heading**: "Every component carries a jest-axe baseline"
- **Body**:
  - Added `jest-axe` in April 2026; wrote a project-wide `testAxe.ts` wrapper that disables the `region` rule (irrelevant inside RTL isolation) and toggles real timers around the async rule engine.
  - **119 test files** currently call `toHaveNoViolations`. A component without an axe test cannot ship — enforced in CI.
  - No regression has shipped since the baseline landed.
- **Compact snippet** (6 lines):
```ts
const _axe = configureAxe({ rules: { region: { enabled: false } } });
export async function axe(container: Element) {
  jest.useRealTimers();
  try { return await _axe(container); }
  finally { jest.useFakeTimers(); }
}
```

### 9. Results
- **Section label**: `IMPACT // 08`
- **Heading**: "Compliance, measured"
- **Large KPI band** (4 tiles):
  - `100%` WCAG 2.2 AA · Section 508 compliance
  - `327 → 0` open accessibility defects
  - `20+` Innovaccer products inheriting every fix
  - `119` components with axe baselines
- **Timeline chart** (recharts line or area):
  - X-axis: Oct 2025 · Dec 2025 · Feb 2026 · Apr 2026
  - Y-axis: % compliant + cumulative issues closed
  - Two lines: *"Compliance %"* climbs from 27.6 → 100; *"Issues open"* falls from 327 → 0.
- **Release cadence note** (small text):
  - `v4.20 — Feb 25 2026 (first compliance wave, 64 fixes live)`
  - `v4.22 — Mar 19 2026 (second wave, 142 fixes)`
  - `v4.23 — Mar 30 2026 (third wave + component ARIA)`
  - `v4.23 — (final patch · jest-axe baseline)`

### 10. Reflections
- **Section label**: `NOTES // 09`
- **Heading**: "What we'd do again"
- **3 short bullets** (~25 words each):
  1. **Audit your own code first.** Automated tools see paint, not props. A grep across the repo outperformed every rule engine we tried.
  2. **Design APIs that make the wrong thing harder than the right thing.** Auto-labelled clear buttons fixed the issue *and* removed the prop everyone would have forgotten.
  3. **Test like it's an invariant.** 119 axe baselines means no one has to remember — the CI does.

### 11. Footer / next
- Back link (same treatment as top).
- Divider.
- `NEXT ↗ MDS — Design system case study` linking to `/projects/mds`.

---

## Data I need in the component (constants)

```ts
const KPI_HERO = [
  { label: 'Baseline → current', value: '27.6% → 100%' },
  { label: 'Issues catalogued', value: '327' },
  { label: 'Components rebuilt', value: '109' },
  { label: 'Products inheriting', value: '20+' },
];

const SEVERITY = [
  { name: 'P0 Critical', count: 34, color: '#F87171' },
  { name: 'P1 High',     count: 144, color: '#FBBF24' },
  { name: 'P2 Medium',   count: 149, color: '#60A5FA' },
];

const TOP_COMPONENTS = [
  { name: 'DatePicker', p0: 1, p1: 3, p2: 5 },
  { name: 'Dropdown',   p0: 0, p1: 5, p2: 5 },
  { name: 'Menu',       p0: 0, p1: 5, p2: 5 },
  { name: 'Combobox',   p0: 0, p1: 4, p2: 4 },
  { name: 'Listbox',    p0: 1, p1: 3, p2: 5 },
  { name: 'Select',     p0: 0, p1: 4, p2: 4 },
  { name: 'Calendar',   p0: 4, p1: 1, p2: 3 },
  { name: 'Table',      p0: 2, p1: 5, p2: 1 },
  { name: 'FullscreenModal', p0: 1, p1: 5, p2: 1 },
  { name: 'ChipInput',  p0: 1, p1: 3, p2: 3 },
];

const AUDIT_DEPTH = [
  { criterion: 'ARIA relationships (1.3.1)',  deque: 0, ours: 87 },
  { criterion: 'Name, Role, Value (4.1.2)',    deque: 0, ours: 64 },
  { criterion: 'Info & Relationships',         deque: 0, ours: 49 },
  { criterion: 'Keyboard (2.1.1)',              deque: 0, ours: 38 },
  { criterion: 'Focus visible (2.4.7)',         deque: 0, ours: 22 },
  { criterion: 'Target size (2.5.8)',           deque: 8, ours: 12 },
  { criterion: 'Focus obscured (2.4.11)',       deque: 1, ours: 6 },
  { criterion: 'Dragging alts (2.5.7)',         deque: 1, ours: 4 },
  { criterion: 'Other',                         deque: 0, ours: 45 },
];

const TIMELINE = [
  { month: 'Oct 2025', compliance: 27.6, issuesOpen: 327 },
  { month: 'Dec 2025', compliance: 48,   issuesOpen: 240 },
  { month: 'Feb 2026', compliance: 76,   issuesOpen: 120 },
  { month: 'Mar 2026', compliance: 94,   issuesOpen: 22 },
  { month: 'Apr 2026', compliance: 100,  issuesOpen: 0 },
];

const BENCHMARK_ROWS = [ /* 8 pattern rows × 6 DS columns */ ];
```

---

## Chart library choice

Use **recharts** (already installed). Specifically:
- Severity split: `ResponsiveContainer + BarChart` (horizontal) with stacked bars — OR one `PieChart` (donut) if vertical space is tight. Go with **stacked horizontal bar**: denser, matches the monospace aesthetic.
- Top-10 components: horizontal `BarChart`, stacked P0/P1/P2 per component.
- Audit depth: grouped horizontal `BarChart` (Deque vs Ours, per SC).
- Timeline: dual-axis `LineChart` (compliance % ascending + issues-open descending).

All charts: dark backgrounds, `#F05D23` / `#4ADE80` accents, mono-font axis labels, subtle `stroke-white/10` gridlines, tooltips with `bg-[#0a0a0a] border-white/10`.

---

## Images / placeholders to add

Keep minimal — only where visual helps more than text would:
1. **Hero**: no image. The KPI tiles + radar ring are enough.
2. **Method (Section 4)**: small schematic of the three-stage pipeline. ASCII/CSS-drawn box diagram, no raster needed.
3. **Pattern 7 (touch target padding)**: one small wireframe showing icon glyph vs hit area overlay. Can be a CSS-only inline SVG sketch — no external asset.
4. **No hero screenshot of MDS** — this is about the audit, not the DS itself.

No `/public/images/wcag-*.png` placeholders are required for v1. If wanted later, tag locations explicitly.

---

## Implementation notes

- Replace `src/app/pages/WcagProjectPage.tsx` in full. Keep the exported name `WcagProjectPage`.
- Import from `recharts`, `motion/react`, `react-router`, `lucide-react` (`ArrowUpRight`, `ChevronDown` for accordion if used, `Check`, `X` for benchmark table markers).
- Keep all data constants at the top of the file (after imports).
- All motion sections use `viewport={{ once: true, margin: '-80px' }}`.
- Respect `prefers-reduced-motion` — pass conditionally or use the `@media` guard already in `theme.css`.
- Keep the file ≤ 1200 lines. If a section balloons, extract inline components above the main return.
- No comments in the code except explaining 2–3 non-obvious bits (e.g. the `aria-describedby` choice, the `region` rule override). Code should read like production-quality portfolio work.

---

## Checklist before starting to code

- [x] Portfolio theme mined
- [x] MDS diff analysed (8 clever patterns identified with file paths)
- [x] Audit docs categorised (34 P0 / 144 P1 / 149 P2 = 327)
- [x] Deque comparison extracted (9 issues, 3 SC categories)
- [x] Benchmark targets chosen (Spectrum, Atlassian, Carbon, Material, Polaris)
- [x] Chart types + data shapes decided
- [x] Section order nailed (Hero → Context → Deque gap → Method → Benchmark → Register → Patterns → Testing → Results → Reflections)
- [x] Result: all five "non-negotiable themes" from the brief are surfaced
