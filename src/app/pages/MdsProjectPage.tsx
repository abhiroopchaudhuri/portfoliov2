import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowUpRight, ChevronDown, Check, X, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

const THEME_ORANGE = '#F05D23';
const GREEN = '#4ADE80';
const AMBER = '#FBBF24';
const BLUE = '#60A5FA';

/* ─────────────── Data ─────────────── */

const HERO_KPIS = [
  {
    label: 'Continuous delivery',
    value: 'Every release',
    hint: 'accessibility + AI overhaul threaded through every cycle',
  },
  {
    label: 'New components',
    value: '12 shipped',
    hint: 'Segmented Control · Sidesheet · Verification Code · Multi-handle Slider · inline Status · more',
  },
  {
    label: 'Components maintained',
    value: '110+',
    hint: 'tokens · states · keyboard · ARIA · forced-colors',
  },
  {
    label: 'Products inheriting',
    value: '20+',
    hint: 'every Innovaccer product consumes MDS',
  },
];

const META_STRIP: [string, string][] = [
  ['Role', 'Lead Product Designer · MDS'],
  ['Surface', '110+ components · 20+ products'],
  ['Duration', 'Jul 2024 — Apr 2026'],
  ['Stack', 'Figma · React · TS · Storybook · MDX'],
];

/* ─────────────── Shared UI (parity with WcagProjectPage) ─────────────── */

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

/** Placeholder image box — generous by default, for a designer portfolio. */
const Placeholder = ({
  label,
  height = 420,
  tone = 'dashed',
  className,
}: {
  label: string;
  height?: number;
  tone?: 'dashed' | 'solid';
  className?: string;
}) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-xl',
      tone === 'dashed'
        ? 'border border-dashed border-white/[0.16] bg-[rgba(255,255,255,0.02)]'
        : 'border border-white/[0.12] bg-[linear-gradient(135deg,rgba(240,93,35,0.08),rgba(255,255,255,0.02))]',
      className,
    )}
    style={{ minHeight: height }}
  >
    {/* Corner crosshairs */}
    <span className="pointer-events-none absolute left-3 top-3 h-3 w-3 border-l border-t border-white/25" />
    <span className="pointer-events-none absolute right-3 top-3 h-3 w-3 border-r border-t border-white/25" />
    <span className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 border-b border-l border-white/25" />
    <span className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b border-r border-white/25" />

    <div className="flex h-full min-h-[inherit] w-full flex-col items-center justify-center gap-3 px-8 py-10 text-center">
      <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#F05D23]/70">
        image · placeholder
      </div>
      <div className="font-mono text-[13px] leading-relaxed tracking-wide text-white/65">
        {label}
      </div>
      <div className="mt-1 h-px w-10 bg-white/15" />
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
        replace with final asset
      </div>
    </div>
  </div>
);

/** Accordion card mirrored from WCAG's PatternCard — keyed off id + title + body. */
type DecisionCard = {
  id: string;
  title: string;
  scope: string;
  body: React.ReactNode;
  result?: string;
  paths?: string[];
};

const AccordionCard = ({
  card,
  index,
  defaultOpen = false,
  prefix = 'D',
}: {
  card: DecisionCard;
  index: number;
  defaultOpen?: boolean;
  prefix?: string;
}) => {
  const [open, setOpen] = useState(defaultOpen || index === 0);
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
        <span className="font-mono text-[12.5px] tracking-[0.22em] text-[#F05D23]/80">
          {prefix}.{card.id}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-mono text-[13px] uppercase tracking-[0.14em] text-white sm:text-[14px]">
            {card.title}
          </h3>
          <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.15em] text-white/45">
            {card.scope}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'mt-1 h-4 w-4 flex-shrink-0 text-white/50 transition-transform',
            open && 'rotate-180 text-[#F05D23]',
          )}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <div className="border-t border-white/[0.12] px-5 pt-4 pb-6 sm:px-6">
          <div className="max-w-3xl text-[13px] leading-relaxed text-white/70">{card.body}</div>
          {card.result && (
            <p className="mt-3 text-[12px] leading-relaxed text-white/55">
              <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#4ADE80]/80">
                Result ·{' '}
              </span>
              {card.result}
            </p>
          )}
          {card.paths && (
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[12px] tracking-wide text-white/35">
              {card.paths.map((p) => (
                <li key={p} className="before:mr-1 before:content-['↳']">
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─────────────── Sidesheet — sub-content ─────────────── */

const SIDESHEET_STATS = [
  { label: 'Initial width', value: '50%', hint: '6 / 12 of parent on first open' },
  { label: 'Min width', value: '400 px', hint: 'prop-overridable floor' },
  { label: 'Max width', value: '10 / 12', hint: 'of parent container' },
  { label: 'Scrim', value: 'none', hint: 'non-modal — background stays interactive' },
];

const SIDESHEET_DECISIONS: DecisionCard[] = [
  {
    id: '01',
    title: 'Non-modal · no scrim',
    scope: 'Dismissal · focus · background interaction',
    body: (
      <>
        <p>
          The detail-flow use-case inside Innovaccer products — case management, outreach
          queues, analytics drill-downs — is a{' '}
          <span className="text-white">split-attention task</span>. Users need to read the
          detail pane and stay oriented in the list behind it.
        </p>
        <p className="mt-3">
          A modal scrim forces a commit: you&apos;re either here or there. A non-modal
          sheet says &quot;look at the detail, but the table is still where you left it.&quot;
          That one decision ruled out the entire modal pattern and set the rest of the
          component&apos;s behaviour — no focus-trap by default, no dismiss-on-click-outside,
          Escape to close but only when focus is inside the sheet.
        </p>
      </>
    ),
    result: 'Users keep the list selection, scroll position, and active filters visible while inspecting a record.',
  },
  {
    id: '02',
    title: 'Initial width = 50% of parent, not a fixed px value',
    scope: 'Responsive defaults · ratio thinking',
    body: (
      <>
        <p>
          Every competing sidesheet I benchmarked (Fluent, Material, Spectrum, Polaris) ships
          a default like <span className="text-white">400 px</span> or{' '}
          <span className="text-white">560 px</span>. That works for a form. It doesn&apos;t
          work for a detail pane that has to compete visually with a list.
        </p>
        <p className="mt-3">
          Defaulting to <span className="text-white">6 / 12</span> of the parent gives list
          and detail equal weight on first open — the user reads the split as intentional,
          not accidental. On a 1440 px workspace that&apos;s 720 px; on a 1920 px workspace
          it&apos;s 960 px. The component is right the first time, everywhere.
        </p>
      </>
    ),
  },
  {
    id: '03',
    title: 'Min 400 px · Max 10 / 12 of parent',
    scope: 'Floor + ceiling · constraint design',
    body: (
      <>
        <p>
          The floor is <span className="text-white">400 px</span> — below that, form labels
          collapse, two-column tables start wrapping, and the sheet stops earning its space.
          The ceiling is <span className="text-white">10 / 12</span> — above that, the
          underlying list is too narrow to remain useful, which breaks the whole
          justification for the sheet being non-modal in the first place.
        </p>
        <p className="mt-3">
          Both are prop-overridable (<code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px] text-white/85">minWidth</code> · <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px] text-white/85">maxWidth</code>)
          so a product team with a denser use-case can tighten the range — but the defaults
          are the ones 90% of usages should never touch.
        </p>
      </>
    ),
  },
  {
    id: '04',
    title: 'Smart clamp when parent shrinks below 400 px',
    scope: 'Graceful degradation · no overflow',
    body: (
      <>
        <p>
          What happens when the user collapses a sidebar, or the AI panel to the right
          suddenly takes half the screen, and the sidesheet&apos;s parent container drops
          below its 400 px floor?
        </p>
        <p className="mt-3">
          Three modes, in order:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-white/70">
          <li>Parent ≥ 480 px → normal constraints (400 px floor, 10 / 12 ceiling)</li>
          <li>400 ≤ parent &lt; 480 px → clamp to 400 px</li>
          <li>Parent &lt; 400 px → match parent exactly (smooth shrink)</li>
        </ul>
        <p className="mt-3">
          This is the difference between a sidesheet that overflows its container and one
          that quietly does the right thing while the user rearranges their workspace.
        </p>
      </>
    ),
    paths: ['NonModalSidesheet.tsx → getConstrainedWidth / getWidthOnParentResize'],
  },
  {
    id: '05',
    title: 'Session-remembered width · not localStorage',
    scope: 'Persistence scope · mental-model match',
    body: (
      <>
        <p>
          After the first open, the sheet remembers the user&apos;s preferred width for the
          rest of the session — but on refresh it resets to the 50 % default. That matches
          how users think about &quot;this visit&quot; vs &quot;next time I come back.&quot;
        </p>
        <p className="mt-3">
          localStorage persistence was considered and rejected: it&apos;s a footgun for
          account-sharing, for public terminals, and — most importantly — it leaks one user&apos;s
          layout preference into another user&apos;s first impression of the product.
        </p>
      </>
    ),
  },
  {
    id: '06',
    title: 'Resize handle on the left edge',
    scope: 'Hit target · discoverability',
    body: (
      <>
        <p>
          A right-opening sheet gets resized from its inner (left) edge — consistent with
          Mac-style window resize and with how every code editor sidebar works. The handle
          is <span className="text-white">1 px</span> at rest and expands to{' '}
          <span className="text-white">2 px</span> on hover; the cursor becomes{' '}
          <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px] text-white/85">ew-resize</code>.
        </p>
        <p className="mt-3">
          While drag is active the entire document&apos;s{' '}
          <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px] text-white/85">user-select</code>{' '}
          is locked off and the body cursor is pinned to{' '}
          <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px] text-white/85">ew-resize</code>{' '}
          — so if the user drifts off the handle mid-drag, they don&apos;t accidentally
          highlight body text or lose the resize cursor.
        </p>
      </>
    ),
  },
  {
    id: '07',
    title: 'Retains pixel width when the parent resizes',
    scope: 'Layout resilience',
    body: (
      <>
        <p>
          Once the user has chosen a width, that number is the contract. If the sidebar
          collapses or the AI panel opens and the parent container grows, the sheet{' '}
          <span className="text-white">keeps its pixel width</span> — it does not rescale
          back to 50 % of the new parent.
        </p>
        <p className="mt-3">
          The only exception: if the parent now shrinks below the width the user picked,
          the sheet re-clamps to the new ceiling. The pixel width is a preference, not a
          guarantee of violating the max constraint.
        </p>
      </>
    ),
  },
  {
    id: '08',
    title: 'Prop-driven minWidth · maxWidth · initialWidth',
    scope: 'Developer escape hatches',
    body: (
      <>
        <p>
          Three opt-in props let teams tighten the defaults for their specific use-case
          without forking the component:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-white/70">
          <li>
            <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px] text-white/85">
              minWidth
            </code>{' '}
            — raise the floor for dense forms
          </li>
          <li>
            <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px] text-white/85">
              maxWidth
            </code>{' '}
            — lower the ceiling where the underlying list must remain dominant
          </li>
          <li>
            <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px] text-white/85">
              initialWidth
            </code>{' '}
            — override the 50 % default for a fixed-form use-case
          </li>
        </ul>
        <p className="mt-3">
          Defaults stay correct for the common case; escape hatches handle the tail without
          a prop explosion.
        </p>
      </>
    ),
  },
  {
    id: '09',
    title: 'Survives nesting inside a ResizablePanelGroup',
    scope: 'Edge-case tested',
    body: (
      <>
        <p>
          The component is explicitly tested inside a resizable panel inside a resizable
          viewport. The prototype instrumented this scenario: a left container holding the
          sheet, a right resizable AI panel, and a global viewport that scales on window
          resize.
        </p>
        <p className="mt-3">
          A <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px] text-white/85">ResizeObserver</code>{' '}
          on the parent container drives the clamp — which means the sheet reacts to any
          change in its parent, whether it came from a window resize, a sibling panel
          resize, or a layout toggle elsewhere in the app.
        </p>
      </>
    ),
    paths: ['LeftContainer.tsx → ResizeObserver on containerRef'],
  },
];

const SIDESHEET_PROPS: Array<{ name: string; type: string; def: string; desc: string }> = [
  { name: 'isOpen', type: 'boolean', def: '—', desc: 'Controls visibility.' },
  { name: 'onClose', type: '() => void', def: '—', desc: 'Called on header close button or Esc when focused.' },
  { name: 'initialWidth', type: 'number | string', def: '50% (6/12)', desc: 'First-open width. Accepts px or parent %.' },
  { name: 'minWidth', type: 'number', def: '400', desc: 'Hard floor. Below-480 px parents get graceful shrink.' },
  { name: 'maxWidth', type: 'number | string', def: '10/12', desc: 'Ceiling relative to parent.' },
  { name: 'rememberWidth', type: 'boolean', def: 'true', desc: 'Remember width for the session (resets on refresh).' },
  { name: 'header', type: 'ReactNode', def: '—', desc: 'Header slot (title, actions).' },
  { name: 'footer', type: 'ReactNode', def: '—', desc: 'Footer slot (primary/secondary actions).' },
  { name: 'onWidthChange', type: '(w: number) => void', def: '—', desc: 'Observability hook for analytics or parent state.' },
  { name: 'children', type: 'ReactNode', def: '—', desc: 'Body content.' },
];

const SIDESHEET_EDGE_CASES = [
  { label: 'Parent collapses below 400 px', note: 'Sheet matches parent width smoothly — no overflow.' },
  { label: 'Parent between 400 – 480 px', note: 'Sheet clamps to 400 px; retains floor until ceiling ≥ floor.' },
  { label: 'Sibling panel opens mid-session', note: 'ResizeObserver fires; sheet re-evaluates ceiling.' },
  { label: 'Close + reopen within session', note: 'Width restored from the user\u2019s last drag — not from default.' },
  { label: 'Refresh', note: 'Width resets to 50 %; session memory cleared by design.' },
  { label: 'Focus on close', note: 'Focus returns to the trigger (wired into the system focus-restore utility).' },
];

/* ─────────────── Benchmark rows for Outline Button ─────────────── */

const BUTTON_BENCHMARK_COLUMNS = [
  { key: 'spectrum', label: 'Adobe Spectrum' },
  { key: 'carbon', label: 'IBM Carbon' },
  { key: 'material', label: 'Material' },
  { key: 'polaris', label: 'Shopify Polaris' },
  { key: 'mds', label: 'MDS (now)', highlight: true },
] as const;

type BenchCell = 'yes' | 'no' | 'partial' | { note: string };

const BUTTON_BENCHMARK_ROWS: Array<{
  pattern: string;
  detail: string;
  cells: Record<(typeof BUTTON_BENCHMARK_COLUMNS)[number]['key'], BenchCell>;
}> = [
  {
    pattern: 'Dedicated outline variant distinct from ghost / text',
    detail: 'A border-bearing quiet button — loud enough for toolbars, quiet enough for card headers.',
    cells: { spectrum: 'yes', carbon: 'yes', material: { note: 'outlined' }, polaris: { note: 'plain' }, mds: 'yes' },
  },
  {
    pattern: 'Outline survives forced-colors (real border, not shadow)',
    detail: 'WHCM strips box-shadow; outline stays visible.',
    cells: { spectrum: 'yes', carbon: 'yes', material: 'partial', polaris: 'partial', mds: 'yes' },
  },
  {
    pattern: 'Icon-only square variants at every size',
    detail: 'tinySquare · regularSquare · largeSquare — same appearance tokens.',
    cells: { spectrum: 'yes', carbon: { note: 'icon button' }, material: 'yes', polaris: 'partial', mds: 'yes' },
  },
  {
    pattern: 'Selected (toggle) state built-in',
    detail: 'No ad-hoc onClick-swap-variant dance.',
    cells: { spectrum: 'yes', carbon: 'yes', material: 'partial', polaris: 'no', mds: 'yes' },
  },
];

const BenchCellView = ({ cell }: { cell: BenchCell }) => {
  if (cell === 'yes') return <Check className="mx-auto h-4 w-4 text-[#4ADE80]" aria-label="yes" />;
  if (cell === 'no') return <X className="mx-auto h-4 w-4 text-white/25" aria-label="no" />;
  if (cell === 'partial')
    return <Minus className="mx-auto h-4 w-4 text-[#FBBF24]" aria-label="partial" />;
  return <span className="font-mono text-[12px] tracking-wider text-white/50">{cell.note}</span>;
};

/* ─────────────── Component theme data ─────────────── */

const SELECT_SLOTS = [
  { slot: 'Select', purpose: 'Root — owns context, value, open state.' },
  { slot: 'Select.Trigger', purpose: 'Button with size · inline label · leading icon · clear · setLabel(count).' },
  { slot: 'Select.List', purpose: 'Virtualised list container with roving tabindex.' },
  { slot: 'Select.Option', purpose: 'Row — selected · activated · disabled states.' },
  { slot: 'Select.SearchInput', purpose: 'Typeahead; debounced onChange.' },
  { slot: 'Select.EmptyTemplate', purpose: 'No-results slot — takes custom ReactNode.' },
  { slot: 'Select.Footer', purpose: 'Sticky footer slot — bulk actions, secondary CTAs.' },
];

const CALENDAR_FEATURES = [
  { feat: 'Size tracks', note: 'small · large — picks up parent density.' },
  { feat: 'jumpView', note: 'Year / month shortcuts from the header.' },
  { feat: 'monthsInView', note: 'Multi-month layout (2 · 3) for range pickers.' },
  { feat: 'firstDayOfWeek', note: 'Locale-aware; sensible default per region.' },
  { feat: 'events', note: 'Dot decoration per cell — payload-aware.' },
  { feat: 'Range-edge error states', note: 'startError · endError · inRangeError — token-driven.' },
  { feat: 'Hover callbacks', note: 'Full hoveredDate / hoveredMonth / hoveredYear payloads.' },
  { feat: 'View-aware nav labels', note: 'Chevron aria-label changes with view (month / year / decade).' },
];

const CHIP_TYPES = [
  {
    type: 'Action',
    note: 'Single-tap primary action inside a chip. Hover · focus · active tokens.',
  },
  {
    type: 'Selection',
    note: 'Toggles. Selected + activated states distinct from colour alone.',
  },
  {
    type: 'Input',
    note: 'Carries a value + clear affordance. Clear has its own focus ring and auto-derived aria-label.',
  },
];

const LINK_STATES = [
  { state: 'Default', note: 'Accent color; no underline at rest.' },
  { state: 'Hover', note: '2.5 px token-controlled underline via border-bottom.' },
  { state: 'Active', note: 'Darker accent; underline drops.' },
  { state: 'Focus', note: 'System outline + offset; survives forced-colors.' },
  { state: 'Disabled', note: 'Info affordance so it isn\u2019t confused with body text.' },
  { state: 'Subtle', note: 'Secondary appearance for dense surfaces.' },
];

const LISTBOX_AXES = [
  { axis: 'Row type', note: 'option · description · resource — semantic, not visual.' },
  { axis: 'Size', note: 'Inherits from parent density token.' },
  { axis: 'Draggable rows', note: 'reorderList/ subtree — pointer + keyboard reorder.' },
  { axis: 'Nested rows', note: 'nestedList/ — animation included.' },
  { axis: 'Polymorphic tagName', note: 'ul · ol · div · nav — matches the semantic context.' },
  { axis: 'Activated vs selected', note: 'Independent states; activated = focus-ring visible after keyboard selection.' },
];

const COMBOBOX_TRIGGERS = [
  { trig: 'ComboboxTrigger', note: 'Button-style single-select.' },
  { trig: 'InputBox', note: 'Typeahead single-select.' },
  { trig: 'MultiselectTrigger', note: 'Chip-stack multi-select.' },
  { trig: 'ChipInputBox', note: 'Typeahead + chip-stack combo.' },
];

const NEW_COMPONENTS = [
  {
    name: 'AvatarSelection',
    purpose: 'Popover-driven avatar picker.',
    why: 'Every product was hand-rolling a \u201Cpick an avatar\u201D flow. Now one primitive.',
  },
  {
    name: 'StatusHint',
    purpose: 'Inline status — default · alert · success · warning · info.',
    why: 'Powers Grid cells + PageHeader. Swaps in for five ad-hoc badge variants.',
  },
  {
    name: 'InlineMessage',
    purpose: 'Row-level warning / alert / info / success banner.',
    why: 'Form-level status without borrowing the Toast surface.',
  },
  {
    name: 'VerificationCodeInput',
    purpose: 'OTP / code multi-box entry.',
    why: 'Paste, autofocus-shift, backspace-jump — one canonical implementation.',
  },
  {
    name: 'MetricInput',
    purpose: 'Numeric input with a unit suffix slot.',
    why: 'Analytics dashboards kept faking this with flex + manual padding.',
  },
  {
    name: 'MultiSlider',
    purpose: 'Multi-handle range slider.',
    why: 'Segmentation tooling across Innovaccer products needed it; DS shipped it once.',
  },
  {
    name: 'KeyValuePair',
    purpose: 'Semantic KeyElement / ValueElement pairing.',
    why: 'Replaces dozens of dl / dt / dd re-implementations across detail panes.',
  },
  {
    name: 'EditableDropdown',
    purpose: 'Inline-edit Dropdown wrapper.',
    why: 'Row-level edits without opening a modal.',
  },
  {
    name: 'EditableChipInput',
    purpose: 'Inline-edit ChipInput wrapper.',
    why: 'Tagging flows inside table cells.',
  },
  {
    name: 'SelectionCard',
    purpose: 'Choice card with useSingleSelect / useMultiSelect hooks.',
    why: 'Onboarding + plan-picker patterns, once, done right.',
  },
];

const AI_SURFACE = [
  { name: 'AIButton', purpose: 'Sparkle glyph redrawn for accessibility · gradient stops refreshed · focus + selected states re-tokened.' },
  { name: 'AIChip', purpose: 'Sparkle a11y alignment · outline-based focus ring · consistent rhythm with Chip family.' },
  { name: 'AIIconButton', purpose: 'Size track unified (regular · large) · Sara icon applied · focus ring standardized.' },
  { name: 'AIResponse', purpose: 'Message semantics cleaned up for AT announcement · loading / streaming state accessible.' },
  { name: 'ChatActionBar / ChatBody / ChatBox / ChatButton', purpose: 'Color refresh + pattern standardization across every chat sub-primitive.' },
  { name: 'Sara · SaraSparkle', purpose: 'Sparkle iconography redrawn for accessibility, usable standalone across the AI family.' },
];

/* ─────────────── Page ─────────────── */

export function MdsProjectPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen bg-[#030303] text-white selection:bg-[#F05D23] selection:text-black">
      {/* Decorative radar — mirrored from WCAG */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[900px] overflow-hidden">
        <div className="absolute right-[-20%] top-[-10%] h-[900px] w-[900px] opacity-[0.12]">
          <div
            className="perf-radar-cw-slow absolute inset-0 rounded-full border border-dashed"
            style={{ borderColor: `${THEME_ORANGE}55` }}
          />
          <div
            className="perf-radar-ccw absolute inset-[18%] rounded-full border border-solid"
            style={{ borderColor: `${THEME_ORANGE}25` }}
          />
          <div
            className="perf-radar-cw-fast absolute inset-[36%] rounded-full border border-dotted"
            style={{ borderColor: `${THEME_ORANGE}55` }}
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1320px] px-6 py-14 sm:px-10 md:py-20 lg:px-14">
        {/* Back link */}
        <Link
          to="/"
          className="inline-block font-mono text-[12px] uppercase tracking-[0.24em] text-[#F05D23] transition-colors hover:text-white"
        >
          ← Index
        </Link>

        {/* ─────────── 001 · Hero ─────────── */}
        <section className="mt-14">
          <Reveal>
            <SectionLabel index="001" label="Case Study" />
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 font-mono text-[clamp(1.5rem,5vw,2.75rem)] uppercase leading-[1.08] tracking-[0.04em] text-white">
              MDS — Masala Design System
              <br />
              <span className="text-white/55">Leading product design across 110+ components</span>
            </h1>
          </Reveal>
          <Reveal delay={0.22}>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/65">
              How a small team rebuilt Innovaccer&apos;s design system from{' '}
              <span className="text-white">v4.11.2</span> to{' '}
              <span className="text-white">v4.23.0</span> — shipping{' '}
              <span className="text-white">40+ component upgrades</span>, a full accessibility
              overhaul, <span className="text-white">12 new components</span>, and a{' '}
              <span className="text-[#4ADE80]">resizable non-modal sidesheet</span> that now
              anchors every product&apos;s detail flow.
            </p>
          </Reveal>

          {/* Meta strip */}
          <Reveal delay={0.32}>
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-white/[0.14] py-5 sm:grid-cols-4">
              {META_STRIP.map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">
                    {k}
                  </dt>
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
                  <div className="mt-1 font-mono text-[12px] tracking-wide text-white/35">
                    {k.hint}
                  </div>
                </CardShell>
              ))}
            </div>
          </Reveal>

          {/* Cover image — the case study opener */}
          <Reveal delay={0.52}>
            <Placeholder
              label="cover image — MDS hero shot (Figma cover · system overview · component constellation)"
              height={640}
              tone="solid"
              className="mt-12"
            />
          </Reveal>
        </section>

        {/* ─────────── 02 · Context ─────────── */}
        <section className="mt-28">
          <Reveal>
            <SectionLabel index="02" label="Context" />
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              What I inherited and what I set out to change
            </h2>
          </Reveal>
          <div className="mt-6 grid items-start gap-8 md:grid-cols-2">
            <Reveal delay={0.12}>
              <p className="text-[14px] leading-relaxed text-white/70">
                MDS is the design system at the core of every Innovaccer product. One change
                here propagates instantly across a platform serving tens of millions of
                patient interactions.
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-white/70">
                When I joined, the system was a few years into its life and the seams were
                showing. Components had drifted into near-identical variants that disagreed
                on spacing and state. Interaction patterns were inconsistent. Accessibility
                was an afterthought. Key surfaces that every product needed were being
                hand-rolled independently — creating inconsistency, duplication, and
                maintenance debt.
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-white/70">
                The work documented here is a system-level reset — threaded through
                successive releases rather than shipped as a big-bang rewrite. Consolidate
                drifted variants. Make accessibility structural. Expand the vocabulary so
                product teams stop forking. Ship new primitives only when the same pattern
                had appeared across multiple products independently.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <CardShell className="px-5 py-6">
                <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#F05D23]/90">
                  What shipped
                </div>
                <dl className="mt-5 space-y-3.5">
                  {[
                    ['Components', '110+ maintained'],
                    ['Accessibility', 'WCAG 2.2 AA · §508'],
                    ['Button', 'outlined variant added alongside primary / alert / basic'],
                    ['Select', 'outlined style · small size · integrated into Tables'],
                    ['Tables', 'column filter props · Dropdown migrated to Select'],
                    ['Chip', '3 drifted variants consolidated, states updated'],
                    ['Calendar', 'palette recomputed for WCAG; keyboard-friendly nav'],
                    ['Small size', 'added as a variant across 15+ components'],
                    ['Segmented Control', 'new component for exclusive choice'],
                    ['Sidesheet', 'non-modal · resizable · session memory'],
                    ['AI family', 'accessible sparkle · refreshed colors · standardized patterns'],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-baseline justify-between gap-4 border-b border-white/[0.1] pb-3 last:border-0 last:pb-0"
                    >
                      <dt className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-white/55">
                        {k}
                      </dt>
                      <dd className="text-right text-[12.5px] leading-snug text-[#4ADE80]/90">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardShell>
            </Reveal>
          </div>
        </section>

        {/* ─────────── 03 · FEATURED · Resizable Non-Modal Sidesheet ─────────── */}
        <section className="mt-28">
          <Reveal>
            <SectionLabel index="03" label="Featured Component" />
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.25rem,3.5vw,2.05rem)] uppercase leading-tight tracking-[0.04em] text-white">
              <span className="text-[#F05D23]">Example Workflow — </span>Resizable Non-Modal Sidesheet
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-3xl text-[14px] leading-relaxed text-white/65">
              Every flagship Innovaccer product has a list-with-detail view. Every one of them
              had a different sidesheet: different default width, different close behaviour,
              different escape-key handling, different resize story. This is the component that
              replaced all of them — and the one I&apos;m documenting end-to-end because it
              shows how I work from research to decisions to props to edge cases.
            </p>
          </Reveal>

          {/* Stat tiles */}
          <Reveal delay={0.2}>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {SIDESHEET_STATS.map((s) => (
                <CardShell key={s.label} className="px-4 py-5 sm:px-5">
                  <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#F05D23]/80">
                    {s.label}
                  </div>
                  <div className="mt-2 font-mono text-[clamp(1rem,2vw,1.35rem)] leading-tight text-white">
                    {s.value}
                  </div>
                  <div className="mt-2 font-mono text-[12px] tracking-wide text-white/45">
                    {s.hint}
                  </div>
                </CardShell>
              ))}
            </div>
          </Reveal>

          {/* 03.A Research */}
          <div className="mt-16">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-white/20" />
                <span className="font-mono text-[12px] uppercase tracking-[0.25em] text-white/65">
                  03 · A · Research
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.06}>
              <h3 className="mt-4 font-mono text-[clamp(1rem,2vw,1.25rem)] uppercase leading-tight tracking-[0.06em] text-white/90">
                Three vantage points — the industry, the products, the people
              </h3>
            </Reveal>

            <Reveal delay={0.1}>
              <Placeholder
                label="research cover — affinity map, competitor teardown, product screenshots collaged"
                height={520}
                tone="solid"
                className="mt-6"
              />
            </Reveal>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Reveal delay={0.14}>
                <CardShell className="h-full px-5 py-5">
                  <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">
                    Industry teardown
                  </div>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-white/70">
                    Mapped how leading B2B SaaS products — Asana, ClickUp, Linear, Notion,
                    and others — handle the detail-flow surface. Studied five dimensions:
                    dismissal (scrim or no scrim), default width (fixed px vs ratio of
                    parent), resize affordance, whether the panel remembered a preferred
                    width, and how keyboard focus moved when the panel opened and closed.
                  </p>
                  <Placeholder
                    label="Figma board — sidesheet teardown across 5 systems"
                    height={320}
                    className="mt-5"
                  />
                </CardShell>
              </Reveal>
              <Reveal delay={0.2}>
                <CardShell className="h-full px-5 py-5">
                  <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">
                    Audit across our products
                  </div>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-white/70">
                    Walked through every Innovaccer product that ships a detail pane. Cataloged{' '}
                    <span className="text-white">11 different sidesheets</span> across three
                    flagship products — each with its own width, dismissal rules, and
                    interaction. The variance was the cost: a user switching products had to
                    re-learn the same surface every time.
                  </p>
                  <Placeholder
                    label="product audit — 11 sidesheets side by side"
                    height={320}
                    className="mt-5"
                  />
                </CardShell>
              </Reveal>
            </div>
          </div>

          {/* 03.B Decisions */}
          <div className="mt-16">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-white/20" />
                <span className="font-mono text-[12px] uppercase tracking-[0.25em] text-white/65">
                  03 · B · Key Decisions
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.06}>
              <h3 className="mt-4 font-mono text-[clamp(1rem,2vw,1.25rem)] uppercase leading-tight tracking-[0.06em] text-white/90">
                Nine decisions that define the component
              </h3>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 max-w-3xl text-[13.5px] leading-relaxed text-white/60">
                Each card names the decision, its scope, and the reasoning. Click to expand.
                These are the things that &ldquo;you only notice when they&apos;re wrong&rdquo;
                — which is exactly why they&apos;re worth documenting.
              </p>
            </Reveal>
            <Reveal delay={0.13}>
              <Placeholder
                label="decisions overview — annotated design spec · key parameters highlighted"
                height={460}
                tone="solid"
                className="mt-6"
              />
            </Reveal>
            <div className="mt-6 space-y-3">
              {SIDESHEET_DECISIONS.map((d, i) => (
                <AccordionCard key={d.id} card={d} index={i} prefix="D" />
              ))}
            </div>
          </div>

          {/* 03.C Prop table */}
          <div className="mt-16">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-white/20" />
                <span className="font-mono text-[12px] uppercase tracking-[0.25em] text-white/65">
                  03 · C · Props API
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.06}>
              <h3 className="mt-4 font-mono text-[clamp(1rem,2vw,1.25rem)] uppercase leading-tight tracking-[0.06em] text-white/90">
                The full developer surface
              </h3>
            </Reveal>
            <Reveal delay={0.12}>
              <CardShell className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b border-white/[0.14]">
                      <th className="px-5 py-3 font-mono text-[11.5px] uppercase tracking-[0.2em] text-white/50">
                        Prop
                      </th>
                      <th className="px-5 py-3 font-mono text-[11.5px] uppercase tracking-[0.2em] text-white/50">
                        Type
                      </th>
                      <th className="px-5 py-3 font-mono text-[11.5px] uppercase tracking-[0.2em] text-white/50">
                        Default
                      </th>
                      <th className="px-5 py-3 font-mono text-[11.5px] uppercase tracking-[0.2em] text-white/50">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIDESHEET_PROPS.map((p) => (
                      <tr
                        key={p.name}
                        className="border-b border-white/[0.08] last:border-0 hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-3 font-mono text-[12.5px] text-[#F05D23]/90">
                          {p.name}
                        </td>
                        <td className="px-5 py-3 font-mono text-[12px] text-white/70">{p.type}</td>
                        <td className="px-5 py-3 font-mono text-[12px] text-white/55">{p.def}</td>
                        <td className="px-5 py-3 text-[13px] leading-relaxed text-white/70">
                          {p.desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardShell>
            </Reveal>
          </div>

          {/* 03.D Interaction + edge cases */}
          <div className="mt-16">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-white/20" />
                <span className="font-mono text-[12px] uppercase tracking-[0.25em] text-white/65">
                  03 · D · Interaction Flow &amp; Edge Cases
                </span>
              </div>
            </Reveal>
            <div className="mt-6 grid items-stretch gap-4 md:grid-cols-[1.2fr_1fr]">
              <Reveal delay={0.06} className="h-full">
                <Placeholder
                  label="interaction diagram — open · resize · remember · reopen · close"
                  height={0}
                  className="h-full min-h-[360px]"
                />
              </Reveal>
              <Reveal delay={0.12} className="h-full">
                <CardShell className="flex h-full flex-col px-5 py-5">
                  <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">
                    Edge cases covered
                  </div>
                  <ul className="mt-4 flex-1 space-y-3">
                    {SIDESHEET_EDGE_CASES.map((e) => (
                      <li key={e.label} className="flex gap-3 text-[13px] text-white/75">
                        <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#F05D23]/70" />
                        <span>
                          <span className="text-white">{e.label}</span>{' '}
                          <span className="text-white/60">— {e.note}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardShell>
              </Reveal>
            </div>
          </div>

          {/* 03.E Behaviour model — design rationale */}
          <div className="mt-16">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-white/20" />
                <span className="font-mono text-[12px] uppercase tracking-[0.25em] text-white/65">
                  03 · E · Behaviour Model
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.06}>
              <h3 className="mt-4 font-mono text-[clamp(1rem,2vw,1.25rem)] uppercase leading-tight tracking-[0.06em] text-white/90">
                Two kinds of resize, two different intents
              </h3>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-white/70">
                The most important decision in how the sheet{' '}
                <span className="text-white">feels</span> was separating two very different
                events: the user dragging the handle vs the parent container changing size for
                any other reason. Collapsing them into the same rule is where every hand-rolled
                sidesheet in the product audit went wrong.
              </p>
            </Reveal>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Reveal delay={0.14}>
                <CardShell className="h-full px-6 py-6">
                  <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#F05D23]/80">
                    User drag — respect intent
                  </div>
                  <p className="mt-3 text-[14px] leading-relaxed text-white/75">
                    When someone grabs the handle they&apos;re telling you their preferred
                    width. Respect it — subject only to the hard floor and ceiling. If they
                    pull toward the viewport edge and the parent is still roomy, the sheet
                    grows up to the ceiling. If they collapse it toward the floor, it stops at
                    the floor.
                  </p>
                  <p className="mt-3 text-[13px] leading-relaxed text-white/55">
                    Graceful escape: on parents narrower than the floor, the drag lets it
                    shrink to match — never overflow.
                  </p>
                </CardShell>
              </Reveal>
              <Reveal delay={0.2}>
                <CardShell className="h-full px-6 py-6">
                  <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#F05D23]/80">
                    Parent resize — absorb, don&rsquo;t override
                  </div>
                  <p className="mt-3 text-[14px] leading-relaxed text-white/75">
                    When a sibling panel opens, the window resizes, or the AI panel toggles,
                    that is <span className="text-white">not</span> a new preference. The sheet
                    absorbs the layout change without rescaling back to the default. The only
                    time it changes its pixel width: the new ceiling has dropped below what the
                    user picked — then it re-clamps.
                  </p>
                  <p className="mt-3 text-[13px] leading-relaxed text-white/55">
                    Result: a layout change never feels like the component &ldquo;forgot&rdquo;
                    what the user wanted.
                  </p>
                </CardShell>
              </Reveal>
            </div>

            <Reveal delay={0.26}>
              <Placeholder
                label="behaviour diagram — drag intent vs layout event · flow + state tree"
                height={480}
                tone="solid"
                className="mt-6"
              />
            </Reveal>

            <Reveal delay={0.3}>
              <CardShell className="mt-6 px-6 py-6">
                <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">
                  The rest of the behaviour model
                </div>
                <ul className="mt-4 grid gap-x-6 gap-y-3 text-[13.5px] text-white/75 sm:grid-cols-2">
                  <li>
                    <span className="text-white">Parent is the source of truth</span> — every
                    layout change the sheet reacts to comes from observing its parent, not the
                    window.
                  </li>
                  <li>
                    <span className="text-white">Width memory is lifted to the parent</span> —
                    so close-and-reopen within the same visit keeps the pixel width the user
                    chose.
                  </li>
                  <li>
                    <span className="text-white">Cursor + selection lock during drag</span> —
                    no stray text selection and no cursor flicker when the user drifts off the
                    handle mid-drag.
                  </li>
                  <li>
                    <span className="text-white">Listeners clean up on close</span> — no
                    leftover drag state across sessions.
                  </li>
                  <li>
                    <span className="text-white">Wired into the system focus model</span> —
                    aria-expanded, aria-controls, and focus-return-on-close inherited from the
                    overlay family.
                  </li>
                  <li>
                    <span className="text-white">Same focus-restore as Modal</span> — so the
                    whole overlay suite behaves like one family of surfaces.
                  </li>
                </ul>
              </CardShell>
            </Reveal>
          </div>

          {/* 03.F Designs / assets */}
          <div className="mt-16">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-white/20" />
                <span className="font-mono text-[12px] uppercase tracking-[0.25em] text-white/65">
                  03 · F · Designs &amp; Handoff
                </span>
              </div>
            </Reveal>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Reveal delay={0.06}>
                <Placeholder label="Figma — default state (50% width)" height={400} />
              </Reveal>
              <Reveal delay={0.1}>
                <Placeholder label="Figma — user-resized state" height={400} />
              </Reveal>
              <Reveal delay={0.14}>
                <Placeholder label="Figma — graceful shrink (parent < 400px)" height={400} />
              </Reveal>
              <Reveal delay={0.18}>
                <Placeholder label="Storybook — interactive story" height={400} />
              </Reveal>
              <Reveal delay={0.22}>
                <Placeholder label="Dev-handoff — prop + anatomy spec" height={400} />
              </Reveal>
              <Reveal delay={0.26}>
                <Placeholder label="Prototype video — resize behaviour" height={400} />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ─────────── 04 · Accessibility callout ─────────── */}
        <section className="mt-28">
          <Reveal>
            <SectionLabel index="04" label="Foundation" />
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              Accessibility — the ground everything else stands on
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <CardShell className="mt-6 px-6 py-7">
              <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-center">
                <div>
                  <p className="text-[14px] leading-relaxed text-white/70">
                    Before any new component could ship, the existing ones had to pass. Between
                    v4.11.2 and v4.23.0 we took MDS from{' '}
                    <span className="text-white">27.6% → 100%</span> WCAG 2.2 AA + §508
                    compliance — cataloguing{' '}
                    <span className="text-white">520+ issues</span>, rebuilding{' '}
                    <span className="text-white">99 components</span>, and threading
                    system-wide patterns (overlay stack, focus-trap, WHCM fallbacks, roving
                    tabindex) so every future component inherits them for free.
                  </p>
                  <Link
                    to="/projects/wcag"
                    className="mt-5 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.22em] text-[#F05D23] transition-colors hover:text-white"
                  >
                    See the full accessibility case study
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { k: 'Compliance', v: '27.6 → 100%' },
                    { k: 'Issues', v: '520+' },
                    { k: 'Components', v: '99' },
                  ].map((x) => (
                    <div
                      key={x.k}
                      className="rounded-md border border-white/[0.12] bg-black/40 px-3 py-3"
                    >
                      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
                        {x.k}
                      </div>
                      <div className="mt-1 font-mono text-[14px] text-white">{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardShell>
          </Reveal>
        </section>

        {/* ─────────── 05 · Variant · Outline Style ─────────── */}
        <section className="mt-28">
          <Reveal>
            <SectionLabel index="05" label="Variant · Outline Style" />
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              Outline as a first-class style — across Button and Select
            </h2>
          </Reveal>
          <div className="mt-6 grid gap-6 md:grid-cols-[1.3fr_1fr]">
            <Reveal delay={0.12} className="flex flex-col gap-4">
              <p className="text-[14px] leading-relaxed text-white/70">
                Every toolbar, card header, and filter row kept reaching for a quieter,
                border-bearing button — the kind that sits inside a table without shouting.
                Product teams were faking it with borders layered onto transparent buttons, and
                the result never held up at focus, in high-contrast mode, or at zoom.
              </p>
              <p className="text-[14px] leading-relaxed text-white/70">
                I added an <span className="text-white">outlined</span> style as a first-class
                peer to the existing <span className="text-white">primary</span>,{' '}
                <span className="text-white">alert</span>, <span className="text-white">basic</span>, and{' '}
                <span className="text-white">transparent</span> appearances on{' '}
                <span className="text-white">Button</span> — with a real border (not a
                box-shadow), token-driven hover / active / selected states, and parity on the
                size matrix (tiny · regular · large).
              </p>
              <p className="text-[14px] leading-relaxed text-white/70">
                The same decision extended to <span className="text-white">Select</span> — a
                new <span className="text-white">outlined</span> <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px] text-white/85">styleType</code> so filter rows, toolbars, and compact forms get a
                quieter trigger without forking the component. Filled and outlined now stand
                as a proper pair, with consistent rhythm between input-style Select and
                button-style Select.
              </p>
              <Placeholder label="before / after — Button with outlined style across the size matrix" height={420} />
            </Reveal>
            <Reveal delay={0.2}>
              <CardShell className="px-5 py-5">
                <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">
                  What the outlined style unlocks
                </div>
                <ul className="mt-4 space-y-3 text-[13px] text-white/70">
                  <li>
                    <span className="text-white">Real border at rest</span> — survives
                    Windows High Contrast Mode where shadows get stripped.
                  </li>
                  <li>
                    <span className="text-white">Toolbar density</span> — border creates the
                    hit-target boundary; no reliance on hover to appear.
                  </li>
                  <li>
                    <span className="text-white">Filled / outlined pair</span> — product
                    teams now have both on Button and Select, with the same rhythm.
                  </li>
                  <li>
                    <span className="text-white">Focus-ring parity</span> — inherits the
                    system ring without a custom override.
                  </li>
                  <li>
                    <span className="text-white">Selected / toggle ready</span> — outlined
                    button carries selected-state as a first-class prop.
                  </li>
                </ul>
              </CardShell>
            </Reveal>
          </div>

          {/* Benchmark table */}
          <Reveal delay={0.28}>
            <CardShell className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-white/[0.14]">
                    <th className="px-5 py-3 font-mono text-[11.5px] uppercase tracking-[0.2em] text-white/50">
                      Pattern
                    </th>
                    {BUTTON_BENCHMARK_COLUMNS.map((c) => (
                      <th
                        key={c.key}
                        className={cn(
                          'px-4 py-3 text-center font-mono text-[11.5px] uppercase tracking-[0.2em]',
                          c.highlight ? 'text-[#F05D23]' : 'text-white/50',
                        )}
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BUTTON_BENCHMARK_ROWS.map((r) => (
                    <tr
                      key={r.pattern}
                      className="border-b border-white/[0.08] last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4 align-top">
                        <div className="font-mono text-[12.5px] uppercase tracking-[0.12em] text-white">
                          {r.pattern}
                        </div>
                        <div className="mt-1 text-[12.5px] leading-relaxed text-white/55">
                          {r.detail}
                        </div>
                      </td>
                      {BUTTON_BENCHMARK_COLUMNS.map((c) => (
                        <td key={c.key} className="px-4 py-4 text-center align-top">
                          <BenchCellView cell={r.cells[c.key]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardShell>
          </Reveal>

          {/* Select outline showcase */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Reveal delay={0.32}>
              <Placeholder label="Figma — Button outlined · filled / outlined pair" height={420} />
            </Reveal>
            <Reveal delay={0.36}>
              <Placeholder label="Figma — Select outlined styleType · filter row + toolbar" height={420} />
            </Reveal>
          </div>

          <Reveal delay={0.4}>
            <CardShell className="mt-6 px-5 py-5">
              <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">
                When blanket inheritance breaks down
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-white/70">
                Not every component can simply inherit a variant and call it done. Some
                components live deep inside molecules — Toast&apos;s{' '}
                <span className="text-white">ActionButton</span>, for example, sits inside
                a surface with its own background color, elevation, and contrast requirements.
                Blindly applying the outlined style there would have broken contrast and legibility.
              </p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-white/70">
                This is a design-system tax that&apos;s easy to miss: every time a variant
                expands, you have to audit the components that are downstream of it. Toast&apos;s
                action button needed its own color treatment to stay legible in its context —
                a reminder that system-level decisions always have surface-specific consequences
                that require individual attention.
              </p>
            </CardShell>
          </Reveal>
        </section>

        {/* ─────────── 09 · Link ─────────── */}
        <section className="mt-28">
          <Reveal>
            <SectionLabel index="06" label="States · Link" />
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              Underline as a designed token, not a browser default
            </h2>
          </Reveal>
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.1fr]">
            <Reveal delay={0.12}>
              <p className="text-[14px] leading-relaxed text-white/70">
                Links used to rely on the browser&apos;s default{' '}
                <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px] text-white/85">text-decoration: underline</code> — which you can&apos;t control
                the offset or thickness of, and which renders differently in every browser.
                The redesign replaced it with a <span className="text-white">2.5 px</span>{' '}
                token-controlled <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px] text-white/85">border-bottom</code> on hover — consistent offset,
                consistent thickness, inherits the accent token.
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-white/70">
                Disabled links pick up an info affordance so they aren&apos;t mistaken for body
                text — and the system focus-ring (outline + offset, WHCM-safe) applies here
                like it does everywhere else in MDS.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <CardShell className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/[0.14]">
                      <th className="px-5 py-3 font-mono text-[11.5px] uppercase tracking-[0.2em] text-white/50">
                        State
                      </th>
                      <th className="px-5 py-3 font-mono text-[11.5px] uppercase tracking-[0.2em] text-white/50">
                        Spec
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {LINK_STATES.map((s) => (
                      <tr
                        key={s.state}
                        className="border-b border-white/[0.08] last:border-0 hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-3 font-mono text-[12.5px] text-[#F05D23]/90">
                          {s.state}
                        </td>
                        <td className="px-5 py-3 text-[13px] leading-relaxed text-white/70">
                          {s.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardShell>
            </Reveal>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Reveal delay={0.24}>
              <Placeholder label="before / after — link state matrix" height={380} />
            </Reveal>
            <Reveal delay={0.28}>
              <Placeholder label="Storybook — /atoms-link" height={380} />
            </Reveal>
          </div>
        </section>

        {/* ─────────── 07 · Variant · Small Size ─────────── */}
        <section className="mt-28">
          <Reveal>
            <SectionLabel index="07" label="Variant · Small Size" />
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              A small size, added as a variant across the system
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-3xl text-[14px] leading-relaxed text-white/65">
              Analytics dashboards, filter rows, and table toolbars needed a tighter size than
              the regular default. Instead of letting whichever component asked first ship a
              one-off small variant, I added{' '}
              <span className="text-white">small</span> as a first-class peer to{' '}
              <span className="text-white">regular</span> and{' '}
              <span className="text-white">large</span> — everywhere product teams reached for
              it. The result is a coordinated variant expansion across 15+ components, so
              small inputs, small buttons, small chips, and small select triggers all share
              rhythm and read as one family.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <Placeholder
              label="small size expansion — regular vs small, across the component family"
              height={520}
              tone="solid"
              className="mt-8"
            />
          </Reveal>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              'Button', 'Select', 'Chip', 'ChipInput', 'EditableChipInput',
              'Input', 'TextField', 'Textarea', 'MetricInput', 'EditableInput',
              'Menu', 'StatusHint', 'Tooltip', 'Message', 'Label',
            ].map((name, i) => (
              <Reveal key={name} delay={0.22 + (i % 8) * 0.025}>
                <div className="rounded-lg border border-white/[0.16] bg-[rgba(8,8,8,0.55)] px-4 py-3 font-mono text-[12px] uppercase tracking-[0.2em] text-[#F05D23]/90 shadow-[inset_0_1px_0_0_rgb(255_255_255_/0.05)]">
                  {name}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─────────── 08 · Component · Segmented Control ─────────── */}
        <section className="mt-28">
          <Reveal>
            <SectionLabel index="08" label="Component · Segmented Control" />
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              Segmented Control — a new primitive for exclusive choice
            </h2>
          </Reveal>
          <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_1fr]">
            <Reveal delay={0.12}>
              <p className="text-[14px] leading-relaxed text-white/70">
                Product teams kept reinventing the &ldquo;pick one of these&rdquo; pattern —
                stacking button pills, retrofitting radio groups into horizontal strips,
                toggling state across a row of buttons. Every implementation disagreed on
                keyboard model, selected-indicator, and size.
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-white/70">
                I shipped <span className="text-white">Segmented Control</span> as a new MDS
                primitive: a compound component with{' '}
                <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px] text-white/85">Segmented.Item</code> slots, size variants, a token-driven animated
                selected-indicator, and roving-tabindex keyboard navigation from day one. One
                primitive now powers every exclusive-choice surface across the products.
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-white/70">
                Shipped alongside: <span className="text-white">Table</span> replaced its
                internal Dropdown with Select (so column-level filter UX now uses the same
                primitive as the rest of the system), and Select&apos;s trigger gained{' '}
                <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px] text-white/85">minWidth / maxWidth</code> props so filter rows don&apos;t jitter
                as labels change.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <CardShell className="px-5 py-5">
                <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">
                  What Segmented Control brings
                </div>
                <ul className="mt-4 space-y-3 text-[13px] text-white/70">
                  <li>
                    <span className="text-white">Compound API</span> —{' '}
                    <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px] text-white/85">Segmented</code> root +{' '}
                    <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px] text-white/85">Segmented.Item</code> slots, shared context.
                  </li>
                  <li>
                    <span className="text-white">Animated selected-indicator</span> —
                    token-driven motion, consistent everywhere it lands.
                  </li>
                  <li>
                    <span className="text-white">Size variants</span> — regular + small match
                    the system size vocabulary.
                  </li>
                  <li>
                    <span className="text-white">Keyboard-first</span> — roving tabindex,
                    arrow-key navigation, Home / End, Space / Enter to select.
                  </li>
                  <li>
                    <span className="text-white">Accessibility table baked in</span> — ARIA
                    semantics and a dedicated a11y prop table in Storybook.
                  </li>
                </ul>
              </CardShell>
            </Reveal>
          </div>
          <Reveal delay={0.24}>
            <Placeholder
              label="Segmented Control — anatomy · states · sizes · selected-indicator motion"
              height={520}
              tone="solid"
              className="mt-6"
            />
          </Reveal>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Reveal delay={0.28}>
              <Placeholder label="Figma — spec · states · tokens" height={380} />
            </Reveal>
            <Reveal delay={0.32}>
              <Placeholder label="Storybook — /atoms-segmentedControl" height={380} />
            </Reveal>
          </div>
        </section>

        {/* ─────────── 09 · Surface · AI Refinements ─────────── */}
        <section className="mt-28">
          <Reveal>
            <SectionLabel index="09" label="Surface · AI Refinements" />
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-mono text-[clamp(1.15rem,3vw,1.75rem)] uppercase leading-tight tracking-[0.06em] text-white/95">
              A systemic refinement across every AI component
            </h2>
          </Reveal>
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1fr]">
            <Reveal delay={0.12}>
              <p className="text-[14px] leading-relaxed text-white/70">
                The AI family is the most visible surface in an Innovaccer product. It needed
                to read as one voice across every touchpoint — AIButton, AIChip, AIIconButton,
                AIResponse, ChatBox, Sara, SaraSparkle. The work threaded across every
                component in the family.
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-white/70">
                I redrew the <span className="text-white">sparkle logo</span> for
                accessibility — the old glyph collapsed in forced-colors mode and read
                inconsistently at small sizes. The <span className="text-white">gradient color
                stack</span> was refreshed and moved onto a token-controlled palette so
                product teams stopped guessing the stops. Focus states, hover rhythm, and
                motion were brought in line with the rest of MDS so the AI family doesn&apos;t
                feel like a separate system bolted on.
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-white/70">
                The effect is cumulative: every AI component in every product now shares one
                voice — from the sparkle on a button, to the chip in a suggestion list, to the
                message bubble in a response stream.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <CardShell className="overflow-hidden">
                <div className="border-b border-white/[0.14] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">
                  What changed, per component
                </div>
                <ul className="divide-y divide-white/[0.08]">
                  {AI_SURFACE.map((a) => (
                    <li key={a.name} className="px-5 py-4 hover:bg-white/[0.02]">
                      <div className="font-mono text-[12.5px] uppercase tracking-[0.14em] text-[#F05D23]/90">
                        {a.name}
                      </div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-white/70">
                        {a.purpose}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardShell>
            </Reveal>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Reveal delay={0.22}>
              <Placeholder label="sparkle before / after — accessibility redraw" height={380} />
            </Reveal>
            <Reveal delay={0.26}>
              <Placeholder label="gradient refresh — token-controlled palette" height={380} />
            </Reveal>
            <Reveal delay={0.3}>
              <Placeholder label="AIResponse — accessible message semantics" height={380} />
            </Reveal>
          </div>

          {/* Closing CTA */}
          <Reveal delay={0.36}>
            <CardShell className="mt-14 px-6 py-6">
              <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-center">
                <div>
                  <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">
                    Also worth your time
                  </div>
                  <p className="mt-3 text-[14px] leading-relaxed text-white/70">
                    The accessibility work underpinning this case study has its own deep-dive
                    — from the raw audit through the pattern library to the product impact.
                  </p>
                </div>
                <div className="flex flex-col gap-3 md:items-end">
                  <Link
                    to="/projects/wcag"
                    className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.22em] text-[#F05D23] transition-colors hover:text-white"
                  >
                    Accessibility case study
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.24em] text-white/55 transition-colors hover:text-white"
                  >
                    ← Index
                  </Link>
                </div>
              </div>
            </CardShell>
          </Reveal>
        </section>

      </div>
    </main>
  );
}
