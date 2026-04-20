import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  Check,
  X,
  Minus,
  ChevronDown,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { cn } from '../lib/utils';

const THEME_ORANGE = '#F05D23';
const GREEN = '#4ADE80';
const RED = '#F87171';
const AMBER = '#FBBF24';
const BLUE = '#60A5FA';

/* ─────────────── Data ─────────────── */

const HERO_KPIS = [
  { label: 'Baseline → Current', value: '27.6% → 100%', hint: 'WCAG 2.2 AA · §508' },
  { label: 'Issues catalogued', value: '520+', hint: '193 Deque + 327 AI-skill (expanded per component)' },
  { label: 'Components rebuilt', value: '99', hint: 'atoms · molecules · organisms' },
  { label: 'Products inheriting', value: '20+', hint: 'every Innovaccer product' },
];

const META_STRIP = [
  ['Role', 'Product Designer + A11y Lead'],
  ['Surface', '110+ components'],
  ['Duration', 'Oct 2025 – Apr 2026'],
  ['Stack', 'React · TS · jest-axe'],
];

const AUDIT_DEPTH = [
  { criterion: 'Non-Text Contrast',      deque: 44, ours: 22 },
  { criterion: 'Name, Role, Value',      deque: 29, ours: 64 },
  { criterion: 'Headings & Labels',      deque: 25, ours: 0  },
  { criterion: 'Label in Name',          deque: 19, ours: 0  },
  { criterion: 'Contrast (min)',         deque: 17, ours: 0  },
  { criterion: 'Info & Relationships',   deque: 9,  ours: 87 },
  { criterion: 'Keyboard',               deque: 6,  ours: 38 },
  { criterion: 'Target size',            deque: 7,  ours: 12 },
  { criterion: 'Focus visible',          deque: 4,  ours: 22 },
  { criterion: 'Focus obscured',         deque: 1,  ours: 6  },
  { criterion: 'Dragging alternatives',  deque: 1,  ours: 4  },
  { criterion: 'Other SC',               deque: 31, ours: 72 },
];

const SEVERITY = [
  { name: 'P0 · Critical', count: 34,  color: RED,   note: 'Blocks core interaction' },
  { name: 'P1 · High',     count: 144, color: AMBER, note: 'Breaks AT announcement' },
  { name: 'P2 · Medium',   count: 149, color: BLUE,  note: 'Degrades experience' },
];

const TOP_COMPONENTS = [
  { name: 'Dropdown',        p0: 0, p1: 5, p2: 5 },
  { name: 'Menu',            p0: 0, p1: 5, p2: 5 },
  { name: 'DatePicker',      p0: 1, p1: 3, p2: 5 },
  { name: 'Table',           p0: 2, p1: 5, p2: 1 },
  { name: 'Listbox',         p0: 1, p1: 3, p2: 5 },
  { name: 'Select',          p0: 0, p1: 4, p2: 4 },
  { name: 'Combobox',        p0: 0, p1: 4, p2: 4 },
  { name: 'FullscreenModal', p0: 1, p1: 5, p2: 1 },
  { name: 'Calendar',        p0: 4, p1: 1, p2: 3 },
  { name: 'Input',           p0: 0, p1: 4, p2: 3 },
];

const TIMELINE = [
  { month: 'Jan ’26', compliance: 27.6, open: 520 },
  { month: 'Feb ’26', compliance: 52,   open: 248 },
  { month: 'Mar ’26', compliance: 84,   open: 83 },
  { month: 'Apr ’26', compliance: 100,  open: 0 },
];

const BENCHMARK_COLUMNS = [
  { key: 'spectrum', label: 'Adobe Spectrum' },
  { key: 'carbon', label: 'IBM Carbon' },
  { key: 'material', label: 'Material' },
  { key: 'polaris', label: 'Shopify Polaris' },
  { key: 'mds', label: 'MDS (now)', highlight: true },
] as const;

type BenchCell = 'yes' | 'no' | 'partial' | { note: string };

const BENCHMARK_ROWS: Array<{
  pattern: string;
  detail: string;
  cells: Record<typeof BENCHMARK_COLUMNS[number]['key'], BenchCell>;
}> = [
  {
    pattern: 'Auto-labelled clear buttons',
    detail: 'Derives the clear-button aria-label from the field label — no extra prop.',
    cells: {
      spectrum: { note: 'manual prop' },
      carbon: { note: 'manual prop' },
      material: { note: 'manual prop' },
      polaris: { note: 'manual prop' },
      mds: 'yes',
    },
  },
  {
    pattern: 'Overlay stack across the full overlay family',
    detail: 'Esc respects top-of-stack across Tooltip, Popover, Menu, Dropdown, Modal, Sidesheet.',
    cells: {
      spectrum: { note: 'per-primitive' },
      carbon: 'no',
      material: { note: 'Modal only' },
      polaris: 'no',
      mds: 'yes',
    },
  },
  {
    pattern: 'role="switch" on native <input type="checkbox">',
    detail: 'Keeps native form semantics (submission, htmlFor, defaults) while announcing as a switch.',
    cells: {
      spectrum: 'yes',
      carbon: { note: 'button-based' },
      material: 'yes',
      polaris: { note: 'no Switch primitive' },
      mds: 'yes',
    },
  },
  {
    pattern: 'forced-colors media-query coverage across stateful components',
    detail: 'WHCM-safe fallbacks (real border replaces box-shadow) on 19 components.',
    cells: {
      spectrum: { note: 'partial' },
      carbon: { note: 'partial' },
      material: { note: 'minimal' },
      polaris: { note: 'minimal' },
      mds: { note: '19 components' },
    },
  },
  {
    pattern: 'Per-component accessibility doc page shipped with the library',
    detail: 'Each flagship component has its own /accessibility.mdx — usage, SCs, AT notes.',
    cells: {
      spectrum: { note: 'top-level page' },
      carbon: { note: 'top-level page' },
      material: { note: 'top-level page' },
      polaris: { note: 'top-level page' },
      mds: { note: '11 component pages' },
    },
  },
  {
    pattern: 'Outline-based focus ring with explicit offset (not box-shadow)',
    detail: 'WCAG 2.4.7 survives forced-colors mode — box-shadow gets stripped.',
    cells: {
      spectrum: 'yes',
      carbon: 'yes',
      material: { note: 'box-shadow' },
      polaris: { note: 'mixed' },
      mds: 'yes',
    },
  },
  {
    pattern: 'Selection indicator beyond color (corner marker / tick)',
    detail: '1.4.1 — selected option identifiable without relying on color alone.',
    cells: {
      spectrum: 'yes',
      carbon: 'yes',
      material: { note: 'checkmark only' },
      polaris: { note: 'checkmark only' },
      mds: 'yes',
    },
  },
  {
    pattern: 'Custom Claude skill shipped in the repo for future a11y audits',
    detail: '.claude/skills/a11y/ — reusable audit tool checked into the DS, not a vendor run.',
    cells: {
      spectrum: 'no',
      carbon: 'no',
      material: 'no',
      polaris: 'no',
      mds: 'yes',
    },
  },
  {
    pattern: 'eslint-plugin-jsx-a11y preset shipped as a ring of defense',
    detail: 'Lint catches a11y mistakes at authoring time — before storybook, before tests.',
    cells: {
      spectrum: { note: 'internal' },
      carbon: 'yes',
      material: { note: 'internal' },
      polaris: 'yes',
      mds: 'yes',
    },
  },
];

type Pattern = {
  id: string;
  title: string;
  scope: string;
  rationale: string;
  code: string;
  result?: string;
  paths?: string[];
};

const PATTERNS: Pattern[] = [
  {
    id: '01',
    title: 'Auto-labelled clear buttons',
    scope: 'Input · InputMask · Chip · Combobox trigger',
    rationale:
      'We could have shipped a new `clearButtonAriaLabel` prop. Instead we derived the name from the label the developer already wrote. Zero new API surface — 100% of existing labels now correctly name two controls instead of one.',
    code: `const resolvedClearButtonAriaLabel = props['aria-label']
  ? \`Clear \${props['aria-label']}\`
  : placeholder
  ? \`Clear \${placeholder}\`
  : 'Clear input';

<div role="button" aria-label={resolvedClearButtonAriaLabel} /* … */ />`,
    result: 'Screen readers now say "Clear Email, button" instead of "button".',
    paths: ['core/components/atoms/input/Input.tsx', 'core/components/atoms/_chip/index.tsx'],
  },
  {
    id: '02',
    title: 'useAccessibilityProps — the interactivity gate',
    scope: 'Icon · StatusHint · Card · 40+ consumer sites',
    rationale:
      'Inverts the usual footgun. Instead of every `<Icon>` defensively setting `role="button"` — and ending up as a nested interactive control inside a real `<button>` (the single most-flagged AXE violation) — the hook gates all interactive attrs behind the presence of `onClick`.',
    code: `const allowed = {
  button: new Set(['Enter', ' ', 'Spacebar']),
  link:   new Set(['Enter']),
  checkbox: new Set(), radio: new Set(),  // onChange handles these
};

if (!onClick) return { ...ariaProps };   // decorative: no role, no tabIndex

return {
  onClick, role, tabIndex: tabIndex ?? 0, ...ariaProps,
  onKeyDown: (e) => {
    if (onKeyDown) return onKeyDown(e);
    if (allowed[role]?.has(e.key)) { e.preventDefault(); onClick(e); }
  },
};`,
    paths: ['core/accessibility/utils/useAccessibilityProps.ts'],
  },
  {
    id: '03',
    title: 'OverlayManager — stacked dismissal, solved once',
    scope: 'Modal · Sidesheet · FullscreenModal · Popover · Tooltip · Dropdown · Menu',
    rationale:
      'A singleton stack means every overlay asks "am I on top?" before handling Escape. Fixes the class of bugs where a tooltip\'s Escape closed the modal behind it. No context providers, no coordination code in each component.',
    code: `// core/utils/OverlayManager.tsx — module singleton, frozen
class OverlayManager {
  overlays: HTMLDivElement[] = [];
  add(o)    { /* push if new */ }
  remove(o) { /* splice by index */ }
  isTopOverlay(o) { return this.overlays.at(-1) === o; }
}
const instance = new OverlayManager();
Object.freeze(instance);
export default instance;

// core/utils/overlayHelper.ts
export const closeOnEscapeKeypress = (event, isTop, onClose) => {
  if (event.key === 'Escape' && isTop) onClose(event);
};`,
    paths: ['core/utils/OverlayManager.tsx', 'core/utils/overlayHelper.ts'],
  },
  {
    id: '04',
    title: 'Portable focus trap that respects [inert]',
    scope: 'Modal · Sidesheet · FullscreenModal · Popper',
    rationale:
      'Three things every blog-post focus-trap snippet gets wrong, one utility fixes: excludes `[inert]` ancestors for stacked overlays, supports a non-tabbable `staticFocusTarget` (heading) for initial focus without breaking Shift+Tab, and refuses to restore focus when a newer dialog is now on top.',
    code: `export const handleFocusTrapKeyDown = (e, container, staticFocusTarget?) => {
  if (e.key !== 'Tab') return false;
  const focusables = getFocusableElements(container);
  // wrap first↔last, honour staticFocusTarget, skip [inert]
};`,
    paths: ['core/utils/overlayHelper.ts'],
  },
  {
    id: '05',
    title: 'View-aware calendar navigation labels',
    scope: 'Calendar · DatePicker · DateRangePicker',
    rationale:
      'The same `‹` / `›` chevrons mean "month back" on the date view but "decade back" on the year view. Sighted users read the heading to disambiguate — screen reader users can\'t. Labels change with the current view.',
    code: `if (view === 'date')  label = type === 'prev' ? 'Previous month'       : 'Next month';
if (view === 'month') label = type === 'prev' ? 'Previous year'        : 'Next year';
if (view === 'year')  label = type === 'prev' ? 'Previous year block'  : 'Next year block';`,
    paths: ['core/components/organisms/calendar/Calendar.tsx'],
  },
  {
    id: '06',
    title: 'Hydration-safe unique IDs',
    scope: 'Input · InputMask · VerificationCodeInput · Checkbox · Radio · Switch',
    rationale:
      'Name-based IDs collided across fields; `Math.random()` churned Jest snapshots; module counters broke SSR hydration. A lazy-initialised `useRef` gives one stable ID per instance without forcing React 18 `useId` on an older-React codebase.',
    code: `const inlineLabelIdRef = React.useRef<string | null>(null);
if (inlineLabelIdRef.current === null) {
  inlineLabelIdRef.current = \`Input-inlineLabel-\${uidGenerator()}\`;
}
const inlineLabelId = inlineLabelIdRef.current;`,
    result: 'We picked `aria-describedby` (not `-labelledby`) so the inline label supplements the visible one rather than replacing it.',
    paths: ['core/components/atoms/input/Input.tsx'],
  },
  {
    id: '07',
    title: 'Adaptive touch-target padding on inline icons',
    scope: 'Input · Tabs · Select · DatePicker close · Chip',
    rationale:
      'Decouples the *visual* icon size from the *hit target*. A 12px glyph still gets 14px padding to reach WCAG 2.5.8 AAA\'s 24 × 24 minimum. The icon stays delicate; the tap area isn\'t.',
    code: `const glyph = { tiny: 12, regular: 16, large: 16 };
const render = { tiny: 14, regular: 16, large: 20 };
const padding = {
  'Input-icon--right': true,
  'p-3-5': size === 'tiny',        // 14px keeps tap area ≥ 24px
  'p-3':   size !== 'tiny',
};`,
    paths: ['core/components/atoms/input/Input.tsx'],
  },
  {
    id: '08',
    title: 'role="switch" on a native checkbox',
    scope: 'SwitchInput',
    rationale:
      'Keeps native form semantics — submission, `htmlFor` labels, default focus handling — while presenting as a WAI-ARIA switch. A custom `<div role="switch">` re-implementation would lose `name` / `value` and break `<form>` integration.',
    code: `<input
  type="checkbox"
  role="switch"
  aria-checked={checked}
  checked={checked}
  onKeyDown={mapSpaceToToggle}
  {...rest}
/>`,
    paths: ['core/components/atoms/switchInput/Switch.tsx'],
  },
  {
    id: '09',
    title: 'Windows High Contrast Mode — box-shadow → real border',
    scope: 'Avatar · Button · Calendar · Card · Chip · Dropdown · Dropzone · Listbox · Modal · Select · Sidesheet · Slider · Switch · Tabs · Toast + 4 more (19 components)',
    rationale:
      'In Windows High Contrast Mode the browser strips `box-shadow` entirely — which silently disappears most focus rings, card edges, selection states, and disabled affordances because they rely on shadow. We added `@media (forced-colors: active)` blocks that restore a real `border` / `outline` wherever a shadow was carrying semantic weight. Not a polish pass — a functional fallback.',
    code: `/* 19 CSS modules patched with forced-colors overrides */
@media (forced-colors: active) {
  /* box-shadow is stripped in forced-colors;
     add a real border so the card boundary is visible */
  .Card {
    border: 1px solid CanvasText;
    forced-color-adjust: none;
  }
  .Switch[aria-checked="true"] {
    outline: 2px solid Highlight;
    outline-offset: 2px;
  }
}`,
    result: 'One commit · 19 component CSS modules · +421 lines. DEQUE didn\'t test WHCM; we found this through our own source-aware pass.',
    paths: ['css/src/components/*.module.css · commit ecf0cff4d'],
  },
];

const PRODUCT_IMPACT = [
  {
    name: 'Case & Care Management',
    total: 1628,
    mds: 1001,
    product: 627,
    headline: 'Focus-ring + label fixes cascade through every patient view',
    topFixes: 'Focus-ring token · label-programmatic-not-descriptive · form-label-missing',
  },
  {
    name: 'Outreach Module',
    total: 1037,
    mds: 532,
    product: 505,
    headline: 'Single Listbox/Combobox ARIA fix closes 102 violations in Access Center alone',
    topFixes: 'Listbox aria-required-parent/children · focus-ring · icon-button names',
  },
  {
    name: 'DAP & Analytics',
    total: 1158,
    mds: 418,
    product: 740,
    headline: 'Lower MDS share — DAP owns heavy data-viz SVGs + hand-rolled panes',
    topFixes: 'Focus-ring · status-message announcement · keyboard reach',
  },
];

const SINGLE_FIX_WINS = [
  { rank: 1, fix: 'Focus-ring token #F8F8F8 → darker (3:1 on white)', rule: 'contrast-focus-indicator + focus-indicator-missing', resolved: 262 },
  { rank: 2, fix: 'Icon-button accessible names (close · visibility · chevrons)', rule: 'label-programmatic-not-descriptive + buttons-confusing', resolved: 191 },
  { rank: 3, fix: 'Listbox / Combobox ARIA nesting', rule: 'aria-required-children + aria-required-parent + custom-combobox', resolved: 142 },
  { rank: 4, fix: 'Tooltip dismiss-on-Esc + hover-persist', rule: 'content-not-dismissible + content-hover-disappears', resolved: 123 },
  { rank: 5, fix: 'Keyboard reach on Grid · Stepper · Slider · Combobox', rule: 'keyboard-inaccessible', resolved: 107 },
];

const UNFIXABLE = [
  { cat: 'Product-specific image alts', scope: '153 instances', why: 'Patient photos, brand imagery — only the product team knows the alt-text.' },
  { cat: 'Page titles', scope: '50 instances', why: '`<title>` is a per-page concern. MDS doesn\'t own routing.' },
  { cat: 'App-specific text contrast', scope: '132 instances', why: 'Brand accents outside the DS token palette.' },
  { cat: 'Hand-rolled ARIA in dashboards', scope: '75 instances', why: 'Custom widgets bypassing MDS primitives.' },
];

const DESIGN_CHANGES = [
  {
    name: 'Focus ring: box-shadow → outline with offset',
    scope: 'Button · Input · Textarea · Chip · AIChip · Select · ChatInput · HorizontalNav · Link · 26 more components',
    why: 'Box-shadow disappears in Windows High Contrast Mode. Outline + explicit offset survives forced-colors and reads cleaner at 200% zoom.',
    sc: 'SC 2.4.7 · 1.4.11',
    placeholder: 'before / after — focus ring on Input',
  },
  {
    name: 'Focus token darkened + offset increased',
    scope: 'All focusable components',
    why: 'Old `#F8F8F8` focus ring measured 1.06:1 on white — invisible. Moved to `--primary-focus` (#00509f) at 7.93:1 on white with a 2px offset so the ring doesn\'t clip inside rounded corners.',
    sc: 'SC 2.4.7 · 1.4.11',
    placeholder: 'before / after — focus ring contrast',
  },
  {
    name: 'Selected-state corner marker on options',
    scope: 'Select · Dropdown · Listbox · Menu',
    why: 'Selection used to rely on color fill alone — SC 1.4.1 fail. Added a tick + corner-marker glyph so selection is identifiable without color. Works for colorblind users and in forced-colors mode.',
    sc: 'SC 1.4.1 · 1.4.11',
    placeholder: 'before / after — Select selected option',
  },
  {
    name: 'Chip selected state: outline + background + filled accent',
    scope: 'Chip · ChipGroup · ChipInput',
    why: 'Selected chips gained an outline and distinct background (not just a color shift). Selected + focused chip has two independent visual cues.',
    sc: 'SC 1.4.1 · 2.4.7',
    placeholder: 'before / after — Chip selected',
  },
  {
    name: 'Link states: default, subtle, disabled redesigned',
    scope: 'Link',
    why: 'Default and subtle links gained an underline affordance on hover. Disabled link updated with an info affordance so users don\'t confuse it with body text.',
    sc: 'SC 1.4.1 · 3.3.1',
    placeholder: 'before / after — Link state matrix',
  },
  {
    name: 'Calendar palette refresh for WCAG 2.2',
    scope: 'Calendar · DatePicker · DateRangePicker',
    why: 'Today-cell, hover-cell, and selected-cell colors all failed 3:1 on white. Entire calendar palette recomputed against the new contrast budget; view-aware labels added to nav chevrons.',
    sc: 'SC 1.4.3 · 1.4.11 · 4.1.2',
    placeholder: 'before / after — Calendar cells',
  },
  {
    name: 'Listbox sticky-drag visual states, zero-drift UI',
    scope: 'Listbox · Combobox popper',
    why: 'Drag-select over a listbox used to jitter. Sticky-drag plus a persistent activated state keeps the visual selection stable during keyboard + pointer interaction.',
    sc: 'SC 1.4.11 · 2.4.7',
    placeholder: 'before / after — Listbox drag-select',
  },
];

const SECTION_508_MAP = [
  { clause: '501.1 · Scope (ICT)', mds: 'MDS components render in the browser; covered under E205 Web.' },
  { clause: 'E205.4 · Accessibility-Supported', mds: 'WCAG 2.2 AA conformance satisfies E205.4 by direct reference.' },
  { clause: '502.2.1 / 502.2.2 · AT interoperability', mds: 'Every interactive component exposes role + state + name via platform a11y APIs.' },
  { clause: '503.2 · Display — no forced visual-only cues', mds: 'WHCM pass (forced-colors) restores every state that depended on box-shadow.' },
  { clause: '302.2 · Without vision / 302.4 · Limited manipulation', mds: 'Full keyboard reach · roving tabindex · skip-on-Esc · focus trap · adaptive touch targets.' },
  { clause: '504.2 · Authoring tool (N/A)', mds: 'MDS is consumed by authoring tools, not one itself — 504 doesn\'t apply.' },
];

/* ─────────────── Small shared UI ─────────────── */

const SectionLabel = ({ index, label }: { index: string; label: string }) => (
  <div className="flex items-center gap-3">
    <span className="h-px w-12 bg-[#F05D23]/70" />
    <span className="font-mono text-[12px] uppercase tracking-[0.25em] text-[#F05D23]/90">
      {label} · {index}
    </span>
  </div>
);

const CardShell = ({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'rounded-xl border border-white/[0.14] bg-[rgba(8,8,8,0.55)]',
      'shadow-[inset_0_1px_0_0_rgb(255_255_255_/0.05)]',
      className,
    )}
    {...rest}
  >
    {children}
  </div>
);

const Reveal = ({
  children,
  delay = 0,
  className,
  as: Comp = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: React.ElementType;
}) => {
  const MotionComp = motion[Comp as keyof typeof motion] as React.ComponentType<any>;
  return (
    <MotionComp
      initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </MotionComp>
  );
};

const BenchCellView = ({ cell }: { cell: BenchCell }) => {
  if (cell === 'yes')
    return <Check className="mx-auto h-4 w-4 text-[#4ADE80]" aria-label="yes" />;
  if (cell === 'no')
    return <X className="mx-auto h-4 w-4 text-white/25" aria-label="no" />;
  if (cell === 'partial')
    return <Minus className="mx-auto h-4 w-4 text-[#FBBF24]" aria-label="partial" />;
  return (
    <span className="font-mono text-[12px] tracking-wider text-white/50">{cell.note}</span>
  );
};

/* ─────────────── Chart primitives ─────────────── */

const ChartTooltipStyle: React.CSSProperties = {
  background: 'rgba(8,8,8,0.92)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  padding: '8px 10px',
  fontFamily: 'Space Mono, monospace',
  fontSize: 12,
  color: 'rgba(255,255,255,0.9)',
};

function AuditDepthChart() {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart
        data={AUDIT_DEPTH}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
        barCategoryGap={6}
      >
        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.06)" horizontal={false} />
        <XAxis
          type="number"
          stroke="rgba(255,255,255,0.58)"
          tick={{ fontSize: 12, fontFamily: 'Space Mono, monospace' }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(255,255,255,0.18)' }}
        />
        <YAxis
          type="category"
          dataKey="criterion"
          width={185}
          stroke="rgba(255,255,255,0.55)"
          tick={{ fontSize: 12, fontFamily: 'Space Mono, monospace' }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(255,255,255,0.18)' }}
        />
        <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={ChartTooltipStyle} />
        <Legend
          wrapperStyle={{
            fontFamily: 'Space Mono, monospace',
            fontSize: 12,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            paddingTop: 4,
          }}
        />
        <Bar dataKey="deque" name="Deque axe" fill="rgba(255,255,255,0.35)" radius={[0, 2, 2, 0]} />
        <Bar dataKey="ours" name="Our audit" fill={THEME_ORANGE} radius={[0, 2, 2, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ComponentsChart() {
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={TOP_COMPONENTS} layout="vertical" margin={{ top: 4, right: 18, left: 4, bottom: 4 }} barCategoryGap={8}>
        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.06)" horizontal={false} />
        <XAxis type="number" stroke="rgba(255,255,255,0.58)" tick={{ fontSize: 12, fontFamily: 'Space Mono, monospace' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.18)' }} />
        <YAxis type="category" dataKey="name" width={120} stroke="rgba(255,255,255,0.55)" tick={{ fontSize: 12, fontFamily: 'Space Mono, monospace' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.18)' }} />
        <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={ChartTooltipStyle} />
        <Legend wrapperStyle={{ fontFamily: 'Space Mono, monospace', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', paddingTop: 4 }} />
        <Bar dataKey="p0" stackId="a" name="P0" fill={RED} />
        <Bar dataKey="p1" stackId="a" name="P1" fill={AMBER} />
        <Bar dataKey="p2" stackId="a" name="P2" fill={BLUE} radius={[0, 2, 2, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ProductImpactChart() {
  const data = PRODUCT_IMPACT.map((p) => ({ name: p.name, mds: p.mds, product: p.product }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 18, left: 4, bottom: 4 }} barCategoryGap={14}>
        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.06)" horizontal={false} />
        <XAxis type="number" stroke="rgba(255,255,255,0.55)" tick={{ fontSize: 12, fontFamily: 'Space Mono, monospace' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.14)' }} />
        <YAxis type="category" dataKey="name" width={160} stroke="rgba(255,255,255,0.65)" tick={{ fontSize: 12, fontFamily: 'Space Mono, monospace' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.14)' }} />
        <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={ChartTooltipStyle} />
        <Legend wrapperStyle={{ fontFamily: 'Space Mono, monospace', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', paddingTop: 4 }} />
        <Bar dataKey="mds" stackId="a" name="MDS-fixable" fill={GREEN} />
        <Bar dataKey="product" stackId="a" name="Product-team" fill={THEME_ORANGE} radius={[0, 2, 2, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function TimelineChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={TIMELINE} margin={{ top: 12, right: 24, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="month" stroke="rgba(255,255,255,0.60)" tick={{ fontSize: 12, fontFamily: 'Space Mono, monospace' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.18)' }} />
        <YAxis yAxisId="left" stroke="rgba(255,255,255,0.60)" tick={{ fontSize: 12, fontFamily: 'Space Mono, monospace' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.18)' }} tickFormatter={(v) => `${v}%`} />
        <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.60)" tick={{ fontSize: 12, fontFamily: 'Space Mono, monospace' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.18)' }} />
        <RechartsTooltip contentStyle={ChartTooltipStyle} />
        <Legend wrapperStyle={{ fontFamily: 'Space Mono, monospace', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', paddingTop: 4 }} />
        <Line yAxisId="left"  type="monotone" dataKey="compliance" name="Compliance %" stroke={GREEN} strokeWidth={2} dot={{ r: 3, fill: GREEN }} activeDot={{ r: 5 }} />
        <Line yAxisId="right" type="monotone" dataKey="open"       name="Open issues" stroke={THEME_ORANGE} strokeWidth={2} dot={{ r: 3, fill: THEME_ORANGE }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function SeverityBar() {
  const total = SEVERITY.reduce((s, x) => s + x.count, 0);
  return (
    <div className="space-y-5">
      <div className="flex h-5 w-full overflow-hidden rounded-sm border border-white/[0.14]">
        {SEVERITY.map((s) => (
          <div
            key={s.name}
            style={{ width: `${(s.count / total) * 100}%`, background: s.color }}
            title={`${s.name}: ${s.count}`}
            className="first:rounded-l-sm last:rounded-r-sm"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {SEVERITY.map((s) => (
          <div key={s.name} className="flex items-start gap-3 rounded-md border border-white/[0.14] bg-black/40 px-3 py-3">
            <span className="mt-1.5 inline-block h-2 w-2 flex-shrink-0 rounded-full" style={{ background: s.color }} />
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[12.5px] uppercase tracking-[0.18em] text-white/80">{s.name}</span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-[22px] text-white" style={{ color: s.color }}>{s.count}</span>
                <span className="font-mono text-[12px] text-white/50 uppercase tracking-wider">/ {total}</span>
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-white/55">{s.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── Pattern card ─────────────── */

const PatternCard = ({ pattern, index }: { pattern: Pattern; index: number }) => {
  const [open, setOpen] = useState(index === 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-xl border border-white/[0.14] bg-[rgba(8,8,8,0.55)] shadow-[inset_0_1px_0_0_rgb(255_255_255_/0.05)] transition-colors hover:border-[#F05D23]/25"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-4 px-5 py-5 text-left transition-colors hover:bg-white/[0.02] sm:px-6"
      >
        <span className="font-mono text-[12.5px] tracking-[0.22em] text-[#F05D23]/80">P.{pattern.id}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-mono text-[13px] uppercase tracking-[0.14em] text-white sm:text-[14px]">
            {pattern.title}
          </h3>
          <p className="mt-1 font-mono text-[12px] tracking-[0.15em] text-white/45 uppercase">
            {pattern.scope}
          </p>
        </div>
        <ChevronDown
          className={cn('mt-1 h-4 w-4 flex-shrink-0 text-white/50 transition-transform', open && 'rotate-180 text-[#F05D23]')}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <div className="border-t border-white/[0.12] px-5 pt-4 pb-6 sm:px-6">
          <p className="max-w-3xl text-[13px] leading-relaxed text-white/70">{pattern.rationale}</p>
          <pre className="mt-4 overflow-x-auto rounded-md border border-white/[0.14] bg-black/60 px-4 py-3 font-mono text-[12.5px] leading-[1.65] text-white/85">
            <code>{pattern.code}</code>
          </pre>
          {pattern.result && (
            <p className="mt-3 text-[12px] leading-relaxed text-white/55">
              <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#4ADE80]/80">Result · </span>
              {pattern.result}
            </p>
          )}
          {pattern.paths && (
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[12px] tracking-wide text-white/35">
              {pattern.paths.map((p) => (
                <li key={p} className="before:mr-1 before:content-['↳']">{p}</li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─────────────── Page ─────────────── */

export function WcagProjectPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="min-h-screen bg-[#030303] text-white selection:bg-[#F05D23] selection:text-black">
      {/* Subtle decorative radar — pinned to the hero region only */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[900px] overflow-hidden">
        <div className="absolute right-[-20%] top-[-10%] h-[900px] w-[900px] opacity-[0.12]">
          <div className="absolute inset-0 rounded-full border border-dashed perf-radar-cw-slow" style={{ borderColor: `${THEME_ORANGE}55` }} />
          <div className="absolute inset-[18%] rounded-full border border-solid perf-radar-ccw" style={{ borderColor: `${THEME_ORANGE}25` }} />
          <div className="absolute inset-[36%] rounded-full border border-dotted perf-radar-cw-fast" style={{ borderColor: `${THEME_ORANGE}55` }} />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1320px] px-6 py-14 sm:px-10 lg:px-14 md:py-20">
        {/* Back link */}
        <Link
          to="/"
          className="inline-block font-mono text-[12px] uppercase tracking-[0.24em] text-[#F05D23] transition-colors hover:text-white"
        >
          ← Index
        </Link>

        {/* ─────────── Hero ─────────── */}
        <section className="mt-14">
          <Reveal>
            <SectionLabel index="001" label="Case Study" />
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 font-mono text-[clamp(1.5rem,5vw,2.75rem)] uppercase leading-[1.08] tracking-[0.04em] text-white">
              WCAG 2.2 + Section 508<br />
              <span className="text-white/55">Compliance for MDS</span>
            </h1>
          </Reveal>
          <Reveal delay={0.22}>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/65">
              How a small team took Innovaccer&apos;s Masala Design System from{' '}
              <span className="text-white">27.6%</span> to{' '}
              <span className="text-[#4ADE80]">100%</span> compliance — and pulled{' '}
              <span className="text-white">20+ products</span> along with it.
            </p>
          </Reveal>

          {/* Meta strip */}
          <Reveal delay={0.32}>
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-white/[0.14] py-5 sm:grid-cols-4">
              {META_STRIP.map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">{k}</dt>
                  <dd className="mt-1 font-mono text-[12px] tracking-wide text-white/85">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* Hero KPI band */}
          <Reveal delay={0.42}>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {HERO_KPIS.map((k, i) => (
                <CardShell key={k.label} className="px-4 py-5 sm:px-5">
                  <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#F05D23]/80">
                    0{i + 1}
                  </div>
                  <div className="mt-2 font-mono text-[clamp(1rem,2vw,1.35rem)] leading-tight text-white">
                    {k.value}
                  </div>
                  <div className="mt-2 text-[12.5px] leading-snug text-white/60">{k.label}</div>
                  <div className="mt-1 font-mono text-[12px] tracking-wide text-white/35">{k.hint}</div>
                </CardShell>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ─────────── 2 · Context ─────────── */}
        <section className="mt-28">
          <Reveal><SectionLabel index="02" label="Context" /></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              Why 27.6% is worse than it sounds
            </h2>
          </Reveal>
          <div className="mt-6 grid items-stretch gap-8 md:grid-cols-[1.35fr_1fr]">
            <Reveal delay={0.12} className="flex flex-col gap-4">
              <p className="text-[14px] leading-relaxed text-white/70">
                Healthcare products carry statutory accessibility obligations — Section 508, ADA,
                WCAG 2.2 AA. Every Innovaccer product is built on MDS. A single missing{' '}
                <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px] text-white/85">aria-expanded</code>{' '}
                on a dropdown ships to every customer on every product.
              </p>
              <p className="text-[14px] leading-relaxed text-white/70">
                A Deque audit flagged <span className="text-white">193 issues</span> on MDS itself —
                and <span className="text-white">3,823 more</span> across three flagship products
                built on it. Mixed automated + manual passes by human auditors. Rigorous work, but
                bounded by what a rendered page can reveal. We ran a parallel audit from a
                different vantage point — inside the codebase — to catch what browsers can&apos;t
                show.
              </p>
              <div className="flex-1 min-h-[180px] overflow-hidden rounded-xl border border-white/[0.14] bg-[rgba(255,255,255,0.02)]">
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
                  <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/40">
                    [ placeholder ]
                  </div>
                  <div className="font-mono text-[12px] tracking-wide text-white/55">
                    Context image — e.g. MDS powering Innovaccer products
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="space-y-4">
                <CardShell className="px-5 py-5">
                  <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">Baseline</div>
                  <dl className="mt-4 space-y-3">
                    {[
                      ['Compliance', '27.6%'],
                      ['Deque audit · MDS', '193'],
                      ['AI-skill audit · collapsed', '327'],
                      ['AI-skill · per-component', '~520'],
                      ['Products at risk', '20+'],
                      ['Components in scope', '110+'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-baseline justify-between border-b border-white/[0.14] pb-2 last:border-0">
                        <dt className="text-[12px] text-white/65">{k}</dt>
                        <dd className="font-mono text-[13px] text-white/90">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </CardShell>

                <CardShell className="px-5 py-5">
                  <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/55">
                    Blast radius · one DS fix → three products
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-white/70">
                    When MDS ships a single root-cause fix, here&apos;s how many accessibility
                    issues close automatically across three products DEQUE audited.
                  </p>
                  <div className="mt-5 space-y-3">
                    {[
                      { name: 'Case & Care Mgmt', mds: 1001, total: 1628, pct: 61.5 },
                      { name: 'Outreach Module',  mds: 532,  total: 1037, pct: 51.3 },
                      { name: 'DAP & Analytics',  mds: 418,  total: 1158, pct: 36.1 },
                    ].map((p) => (
                      <div key={p.name} className="flex items-center gap-3">
                        <div className="w-32 shrink-0 font-mono text-[12px] tracking-wide text-white/75">
                          {p.name}
                        </div>
                        <div className="relative h-5 flex-1 overflow-hidden rounded-sm border border-white/[0.14] bg-black/40">
                          <div
                            className="h-full bg-[#4ADE80]/80"
                            style={{ width: `${p.pct}%` }}
                          />
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[12px] text-black">
                            {p.mds.toLocaleString()} / {p.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-12 shrink-0 text-right font-mono text-[13px] text-[#4ADE80]">
                          {p.pct}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-[12.5px] leading-relaxed text-white/55">
                    <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#F05D23]/85">Example · </span>
                    Darkening one focus-ring token (`#F8F8F8` → 3:1) closed{' '}
                    <span className="text-white">262 violations</span> across the three products —
                    one token, three products, no product-team work.
                  </p>
                </CardShell>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─────────── 3 · Audit Depth ─────────── */}
        <section className="mt-28">
          <Reveal><SectionLabel index="03" label="Audit Depth" /></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              Two audits, two vantage points
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-white/65">
              Deque&apos;s audit was thorough — automated rules plus trained manual passes through
              every page. But it audits what the browser paints. Our parallel audit used custom
              Claude skills that read the source tree: they follow props through composition, trace
              ref flows, and surface ARIA relationships you can only see in the code. Different
              tools, different coverage. Together they close the gaps neither can close alone.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 grid gap-6 md:grid-cols-[0.9fr_1.6fr]">
              <CardShell className="flex flex-col justify-between gap-4 px-6 py-6">
                <div>
                  <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">Deque axe Auditor</div>
                  <div className="mt-4 font-mono text-[clamp(2.25rem,6vw,3.5rem)] leading-none text-white/85">193</div>
                  <p className="mt-3 text-[12px] leading-relaxed text-white/55">
                    Across <span className="text-white">14</span> success criteria on MDS, plus
                    <span className="text-white"> 3,823</span> more across three products built on
                    it. Strongest on what a rendered page exposes — contrast, labels, heading
                    semantics.
                  </p>
                </div>
                <div className="border-t border-white/[0.14] pt-4">
                  <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#F05D23]/90">Our source-aware audit</div>
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="font-mono text-[clamp(2.25rem,6vw,3.5rem)] leading-none text-[#F05D23]">327</span>
                    <span className="font-mono text-[12px] tracking-wider text-white/55">code-path tagged</span>
                  </div>
                  <p className="mt-3 text-[12px] leading-relaxed text-white/55">
                    Across <span className="text-white">54</span> success criteria, tagged to
                    exact code paths with proposed fixes. Strongest on ARIA relationships,
                    keyboard, and focus invariants that live upstream of paint.
                  </p>
                </div>
              </CardShell>

              <CardShell className="px-3 py-5 sm:px-5">
                <div className="mb-2 px-2 font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">
                  Issues by success criterion
                </div>
                <AuditDepthChart />
              </CardShell>
            </div>
          </Reveal>
        </section>

        {/* ─────────── 4 · Method ─────────── */}
        <section className="mt-28">
          <Reveal><SectionLabel index="04" label="Method" /></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              A code-aware audit pipeline
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-white/65">
              Three stages, each designed to surface what the stage before could not.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 space-y-4">
              {/* Stages 1–3 — text only, single row */}
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    step: '01',
                    title: 'Custom Claude skills',
                    body: 'Component-specific prompts that read core/components/** directly, not the rendered DOM. They understand composition, prop plumbing, ref flows, and portal boundaries. Output: issues tagged with SC + code path.',
                  },
                  {
                    step: '02',
                    title: 'Automated contrast script',
                    body: 'Walks every SCSS + TSX token pair. Computes WCAG AA ratios for default · hover · active · focus · disabled. Emits a JSON diff against a tolerance budget.',
                  },
                  {
                    step: '03',
                    title: 'AI-reviewed exceptions',
                    body: 'Contrast failures routed through a second-pass classifier. Decorative? Disabled? Icon-as-text? Context-aware allowlist replaces the blunt 4.5:1 heuristic.',
                  },
                ].map((c, i) => (
                  <motion.div
                    key={c.step}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full"
                  >
                    <CardShell className="h-full px-5 py-5 transition-colors hover:border-[#F05D23]/25">
                      <div className="font-mono text-[12px] uppercase tracking-[0.25em] text-[#F05D23]/85">
                        Stage / {c.step}
                      </div>
                      <h3 className="mt-3 font-mono text-[14px] uppercase tracking-[0.12em] text-white">
                        {c.title}
                      </h3>
                      <p className="mt-3 text-[13px] leading-relaxed text-white/70">{c.body}</p>
                    </CardShell>
                  </motion.div>
                ))}
              </div>

              {/* Stages 4–5 — image below text, 2-col row */}
              <div className="grid items-stretch gap-4 md:grid-cols-2">
                {[
                  {
                    step: '04',
                    title: 'AI research pass for design remediation',
                    body: 'For issues needing design changes, a second AI pipeline researches how Spectrum, Carbon, Material, Polaris, and WAI-ARIA forums solve the same problem. It proposes the best remediation pattern with sources — the designer picks from cited options instead of guessing.',
                    placeholder: 'AI recommendation · focus-ring redesign · 6 sources cited',
                  },
                  {
                    step: '05',
                    title: 'Design → Figma MCP → Codex PR review',
                    body: 'Design gets updated in Figma, Claude + Figma MCP pushes the code change and opens a PR. OpenAI Codex reviews the PR, flags gaps, suggests missing aria/keyboard handling. Cycle repeats until Codex has no flags left.',
                    placeholder: 'Codex PR review · 3 iterations to green',
                  },
                ].map((c, i) => (
                  <motion.div
                    key={c.step}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <CardShell className="flex h-full flex-col overflow-hidden transition-colors hover:border-[#F05D23]/25">
                      <div className="px-5 py-5">
                        <div className="font-mono text-[12px] uppercase tracking-[0.25em] text-[#F05D23]/85">
                          Stage / {c.step}
                        </div>
                        <h3 className="mt-3 font-mono text-[14px] uppercase tracking-[0.12em] text-white">
                          {c.title}
                        </h3>
                        <p className="mt-3 text-[13px] leading-relaxed text-white/70">{c.body}</p>
                      </div>
                      <div className="mx-5 mb-5 flex flex-1 flex-col overflow-hidden rounded-md border border-white/[0.14] bg-[rgba(255,255,255,0.02)]">
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-3 text-center">
                          <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/40">
                            [ placeholder ]
                          </div>
                          <div className="font-mono text-[12px] tracking-wide text-white/55">
                            {c.placeholder}
                          </div>
                        </div>
                      </div>
                    </CardShell>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>

        </section>

        {/* ─────────── 5 · Benchmark ─────────── */}
        <section className="mt-28">
          <Reveal><SectionLabel index="05" label="Benchmark" /></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              We studied the best before we fixed ours
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-white/65">
              Before writing a single line of code, we disassembled five industry-defining design
              systems — looking for gaps to exceed, not patterns to copy.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <CardShell className="mt-8 overflow-hidden px-0 py-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/[0.14] bg-black/40">
                      <th className="px-4 py-3 font-mono text-[12px] uppercase tracking-[0.2em] text-white/55">
                        Pattern
                      </th>
                      {BENCHMARK_COLUMNS.map((c) => (
                        <th
                          key={c.key}
                          className={cn(
                            'px-3 py-3 text-center font-mono text-[12px] uppercase tracking-[0.18em]',
                            (c as any).highlight ? 'text-[#F05D23]' : 'text-white/55',
                          )}
                        >
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {BENCHMARK_ROWS.map((row, i) => (
                      <tr
                        key={row.pattern}
                        className={cn(
                          'border-b border-white/[0.10] transition-colors hover:bg-white/[0.02]',
                          i === BENCHMARK_ROWS.length - 1 && 'border-b-0',
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="font-mono text-[12px] tracking-wide text-white/90">{row.pattern}</div>
                          <div className="mt-0.5 text-[12.5px] leading-snug text-white/45">{row.detail}</div>
                        </td>
                        {BENCHMARK_COLUMNS.map((c) => (
                          <td
                            key={c.key}
                            className={cn(
                              'px-3 py-3 text-center align-middle',
                              (c as any).highlight && 'bg-[#F05D23]/[0.04]',
                            )}
                          >
                            <BenchCellView cell={row.cells[c.key]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardShell>
          </Reveal>
          <Reveal delay={0.22}>
            <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.2em] text-white/35">
              Reviewed against public source repositories · March 2026
            </p>
          </Reveal>
        </section>

        {/* ─────────── 6 · Inventory ─────────── */}
        <section className="mt-28">
          <Reveal><SectionLabel index="06" label="Inventory" /></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              327 issues, classified and prioritised
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-stretch">
              <CardShell className="flex h-full flex-col px-5 py-6">
                <div className="mb-4 font-mono text-[12px] uppercase tracking-[0.22em] text-white/55">
                  Severity split
                </div>
                <SeverityBar />
                <div className="mt-auto border-t border-white/[0.14] pt-4 font-mono text-[12px] tracking-[0.15em] uppercase text-white/60">
                  54 success criteria · 55 components · 100% tracked to closure
                </div>
              </CardShell>
              <CardShell className="flex h-full flex-col px-3 py-5 sm:px-5">
                <div className="mb-2 px-2 font-mono text-[12px] uppercase tracking-[0.22em] text-white/55">
                  Top 10 components by issue count
                </div>
                <div className="flex-1">
                  <ComponentsChart />
                </div>
              </CardShell>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-6 max-w-3xl text-[13px] leading-relaxed text-white/55">
              <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#F05D23]/85">Note · </span>
              One pattern, many components. Fixing the shared <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-[12.5px] text-white/85">ListBody</code> primitive closed P0 issues in
              Select, Combobox, Menu and Listbox simultaneously.
            </p>
          </Reveal>
        </section>

        {/* ─────────── 7 · Patterns ─────────── */}
        <section className="mt-28">
          <Reveal><SectionLabel index="07" label="Architecture" /></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              Eight choices that repaid themselves across the whole system
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-white/65">
              Each pattern below replaced a class of bug, not an instance. The code snippets are
              verbatim from <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-[12px] text-white/85">innovaccer/design-system · feat-ally</code>.
            </p>
          </Reveal>

          <div className="mt-8 space-y-3">
            {PATTERNS.map((p, i) => (
              <PatternCard key={p.id} pattern={p} index={i} />
            ))}
          </div>
        </section>

        {/* ─────────── 8 · Design Changes ─────────── */}
        <section className="mt-28">
          <Reveal><SectionLabel index="08" label="Design Changes" /></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              Not just code — design had to move too
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-white/65">
              A lot of the compliance gap sat in design, not code. Focus rings that used box-shadow
              disappeared in forced-colors mode. Selection states leaned entirely on color.
              Disabled text slid below 2:1. The following visual-language updates shipped alongside
              the ARIA + keyboard work.
            </p>
          </Reveal>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {DESIGN_CHANGES.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <CardShell className="h-full overflow-hidden">
                  <div className="aspect-[16/8] w-full border-b border-white/[0.14] bg-[rgba(255,255,255,0.02)]">
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center">
                      <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">
                        [ placeholder ]
                      </div>
                      <div className="font-mono text-[12px] tracking-wide text-white/60">
                        {d.placeholder}
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#F05D23]/85">
                        {d.sc}
                      </span>
                    </div>
                    <h3 className="mt-3 font-mono text-[14px] uppercase tracking-[0.12em] text-white">
                      {d.name}
                    </h3>
                    <p className="mt-2 font-mono text-[12px] tracking-wide text-white/45">
                      {d.scope}
                    </p>
                    <p className="mt-3 text-[13px] leading-relaxed text-white/70">{d.why}</p>
                  </div>
                </CardShell>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─────────── 9 · Testing ─────────── */}
        <section className="mt-28">
          <Reveal><SectionLabel index="09" label="Verification" /></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              Every component carries a jest-axe baseline
            </h2>
          </Reveal>

          <div className="mt-8 grid gap-6 md:grid-cols-[1.2fr_1fr]">
            <Reveal delay={0.1} className="space-y-4 text-[14px] leading-relaxed text-white/70">
              <p>
                We added <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-[12px] text-white/85">jest-axe</code> in April 2026 and wrote a project-wide <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-[12px] text-white/85">testAxe.ts</code> wrapper — disabling the <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-[12px] text-white/85">region</code> rule (irrelevant inside isolated RTL tests) and
                toggling real timers around the async rule engine so Jest&apos;s fake timers
                don&apos;t deadlock it.
              </p>
              <p>
                <span className="font-mono text-white">119 test files</span> currently call{' '}
                <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-[12px] text-white/85">toHaveNoViolations</code>{' '}
                — every shipping component has an axe baseline. The rule runs in{' '}
                <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-[12px] text-white/85">npm test</code>,
                so any regression blocks its PR. Enforcing "new component without a test cannot
                ship" as an explicit CI gate is the next milestone.
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <pre className="overflow-x-auto rounded-xl border border-white/[0.14] bg-black/60 px-5 py-5 font-mono text-[12.5px] leading-[1.65] text-white/85">
                <code>{`const _axe = configureAxe({
  rules: { region: { enabled: false } },
});

export async function axe(node: Element) {
  jest.useRealTimers();
  try { return await _axe(node); }
  finally { jest.useFakeTimers(); }
}`}</code>
              </pre>
            </Reveal>
          </div>
        </section>

        {/* ─────────── 9 · Results ─────────── */}
        <section className="mt-28">
          <Reveal><SectionLabel index="10" label="Impact" /></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              Compliance, measured
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {[
                { v: '100%', l: 'WCAG 2.2 AA · §508', c: GREEN },
                { v: '327 → 0', l: 'Open defects closed', c: THEME_ORANGE },
                { v: '20+', l: 'Products inheriting', c: 'white' },
                { v: '119', l: 'Axe-tested components', c: BLUE },
              ].map((k) => (
                <CardShell key={k.l} className="px-4 py-5 sm:px-5">
                  <div className="font-mono text-[clamp(1.1rem,2.2vw,1.55rem)] leading-tight" style={{ color: k.c }}>
                    {k.v}
                  </div>
                  <div className="mt-2 text-[12.5px] leading-snug text-white/60">{k.l}</div>
                </CardShell>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <CardShell className="mt-8 px-3 py-5 sm:px-6">
              <div className="mb-3 px-2 font-mono text-[12px] uppercase tracking-[0.22em] text-white/55">
                Compliance % (green) vs Open issues (orange) · Jan 2026 → Apr 2026
              </div>
              <TimelineChart />
            </CardShell>
          </Reveal>

          <Reveal delay={0.22}>
            <div />
          </Reveal>
        </section>

        {/* ─────────── 10 · Section 508 compliance ─────────── */}
        <section className="mt-28">
          <Reveal><SectionLabel index="11" label="Compliance" /></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              WCAG 2.2 AA → Section 508 compliance, by construction
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-white/65">
              The 2017 ICT Refresh of <span className="text-white">Section 508</span> adopts
              WCAG&apos;s success criteria by direct reference for web content
              (<code className="rounded bg-white/5 px-1 py-0.5 font-mono text-[12px] text-white/85">E205.4</code>).
              Conforming to WCAG 2.2 AA satisfies §508 for everything MDS renders. The table
              below maps each relevant §508 clause to the MDS work that covers it.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <CardShell className="mt-8 overflow-hidden px-0 py-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/[0.14] bg-black/40">
                      <th className="px-4 py-3 font-mono text-[12px] uppercase tracking-[0.2em] text-white/55">
                        §508 clause
                      </th>
                      <th className="px-4 py-3 font-mono text-[12px] uppercase tracking-[0.2em] text-white/55">
                        MDS coverage
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {SECTION_508_MAP.map((row, i) => (
                      <tr
                        key={row.clause}
                        className={cn(
                          'border-b border-white/[0.14] transition-colors hover:bg-white/[0.02]',
                          i === SECTION_508_MAP.length - 1 && 'border-b-0',
                        )}
                      >
                        <td className="px-4 py-3 font-mono text-[12px] tracking-wide text-white/90 whitespace-nowrap">
                          {row.clause}
                        </td>
                        <td className="px-4 py-3 text-[12.5px] leading-snug text-white/70">
                          {row.mds}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardShell>
          </Reveal>

          <Reveal delay={0.22}>
            <p className="mt-6 max-w-3xl text-[13px] leading-relaxed text-white/60">
              <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#F05D23]/85">Note · </span>
              Federal healthcare customers need §508-compliant software. Since every Innovaccer
              product is built on MDS, getting the DS to §508 is the unlock. At the component
              level, we&apos;re solid — the plumbing, the ARIA, the keyboard, the contrast, all
              shipped. How each product team wires it up on their pages is on them, but they start
              from a compliant foundation instead of fighting the DS.
            </p>
          </Reveal>
        </section>

        {/* ─────────── 11 · Cross-Product Impact ─────────── */}
        <section className="mt-28">
          <Reveal><SectionLabel index="12" label="Cross-Product" /></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              One DS release resolves 51% of downstream audit findings
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-white/65">
              Deque audited three Innovaccer products in parallel with MDS — Case &amp; Care
              Management, Outreach, DAP &amp; Analytics — returning{' '}
              <span className="text-white">3,823</span> accessibility issues. Of those,{' '}
              <span className="text-[#4ADE80]">1,951 (51.0%)</span> trace to a root cause inside
              MDS and close automatically when a product upgrades. Attribution uses a conservative
              classifier: any violation whose offending DOM node carries a{' '}
              <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-[12px] text-white/85">DesignSystem-*</code>{' '}
              data-test attribute is counted as MDS-owned.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {PRODUCT_IMPACT.map((p) => {
                const pct = Math.round((p.mds / p.total) * 100);
                return (
                  <CardShell key={p.name} className="flex flex-col gap-3 px-5 py-5">
                    <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#F05D23]/85">
                      {p.name}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[clamp(1.6rem,3vw,2.2rem)] leading-none text-[#4ADE80]">{p.mds.toLocaleString()}</span>
                      <span className="font-mono text-[12.5px] tracking-wide text-white/50">/ {p.total.toLocaleString()}</span>
                    </div>
                    <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/55">
                      {pct}% closed by MDS · {p.product.toLocaleString()} product-team
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-sm border border-white/[0.10] bg-black/40">
                      <div className="h-full bg-[#4ADE80]" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-2 text-[12px] leading-relaxed text-white/65">{p.headline}</p>
                    <p className="mt-auto font-mono text-[12px] tracking-wide text-white/40">
                      Top fixes → {p.topFixes}
                    </p>
                  </CardShell>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.22}>
            <CardShell className="mt-8 px-3 py-5 sm:px-5">
              <div className="mb-3 px-2 font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">
                MDS-fixable (green) vs Product-team (orange) · per-product attribution
              </div>
              <ProductImpactChart />
            </CardShell>
          </Reveal>

          <Reveal delay={0.26}>
            <div className="mt-8">
              <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">
                Top 5 single-fix-many-wins · ranked by total cross-product instances closed
              </div>
              <div className="mt-4 space-y-2">
                {SINGLE_FIX_WINS.map((w) => (
                  <div
                    key={w.rank}
                    className="flex items-start gap-4 rounded-lg border border-white/[0.14] bg-[rgba(8,8,8,0.55)] px-4 py-3"
                  >
                    <span className="font-mono text-[12.5px] tracking-[0.18em] text-[#F05D23]/90 w-6 shrink-0">
                      #{w.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-[12.5px] tracking-wide text-white/90">{w.fix}</div>
                      <div className="mt-1 font-mono text-[12px] tracking-wide text-white/40">
                        {w.rule}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-baseline gap-1 text-right">
                      <span className="font-mono text-[18px] text-[#4ADE80]">{w.resolved}</span>
                      <span className="font-mono text-[12px] uppercase tracking-wider text-white/45">resolved</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-10">
              <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">
                What MDS cannot fix — stays with product teams
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {UNFIXABLE.map((u) => (
                  <div
                    key={u.cat}
                    className="rounded-lg border border-white/[0.14] bg-[rgba(8,8,8,0.40)] px-4 py-3"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="font-mono text-[12px] tracking-wide text-white/85">{u.cat}</div>
                      <div className="font-mono text-[12px] tracking-wide text-[#FBBF24]">{u.scope}</div>
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-white/55">{u.why}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ─────────── 12 · Reflections ─────────── */}
        <section className="mt-28">
          <Reveal><SectionLabel index="13" label="Notes" /></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              What we&apos;d do again · what we don&apos;t claim
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <CardShell className="mt-8 px-5 py-5 sm:px-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#FBBF24]">
                Honest limits
              </div>
              <ul className="mt-3 grid gap-2 text-[12.5px] leading-relaxed text-white/70 md:grid-cols-2">
                <li>· We claim WCAG 2.2 <span className="text-white">AA</span> — not AAA.</li>
                <li>· We claim 51% of downstream product issues resolve by MDS upgrade — not 100%.</li>
                <li>· jest-axe baselines exist on 100% of current components; an explicit CI rule to block new components without tests is the next milestone.</li>
                <li>· Our AI-skill audit complemented Deque&apos;s audit. It did not replace it.</li>
              </ul>
            </CardShell>
          </Reveal>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                n: '01',
                h: 'Audit your own code',
                b: 'Deque found what paint reveals — contrast, labels, heading semantics. Source access found what props hide — ARIA relationships, keyboard invariants, ref flows. Two vantage points, one ledger.',
              },
              {
                n: '02',
                h: 'Make the wrong thing harder',
                b: 'Auto-labelled clear buttons fixed the issue and removed the prop everyone would have forgotten. API design is accessibility design.',
              },
              {
                n: '03',
                h: 'Test like it\'s an invariant',
                b: '119 axe baselines means no one has to remember. The CI does. Zero regressions shipped once enforcement was in place.',
              },
            ].map((r, i) => (
              <motion.div
                key={r.n}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <CardShell className="h-full px-5 py-5">
                  <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#F05D23]/85">
                    Reflection · {r.n}
                  </div>
                  <h3 className="mt-3 font-mono text-[13px] uppercase tracking-[0.12em] text-white">
                    {r.h}
                  </h3>
                  <p className="mt-3 text-[13px] leading-relaxed text-white/65">{r.b}</p>
                </CardShell>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─────────── Footer ─────────── */}
        <footer className="mt-32 border-t border-white/[0.14] pt-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <Link
              to="/"
              className="inline-block font-mono text-[12px] uppercase tracking-[0.24em] text-[#F05D23] transition-colors hover:text-white"
            >
              ← Back to index
            </Link>
            <Link
              to="/projects/mds"
              className="group inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-[#F05D23]"
            >
              Next · MDS design system
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <p className="mt-10 font-mono text-[12px] tracking-[0.22em] uppercase text-white/30">
            Innovaccer · Masala Design System · WCAG 2.2 AA · Section 508
          </p>
        </footer>
      </div>
    </main>
  );
}
