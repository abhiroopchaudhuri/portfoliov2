import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

/* ─── Design tokens (claude-design.md) ───────────────────────────
   Warm-toned only. Never introduce cool greys or saturated colours
   beyond the terracotta / coral accents below.
──────────────────────────────────────────────────────────────── */
const C = {
  // surfaces
  parchment: '#f5f4ed',
  ivory: '#faf9f5',
  warmSand: '#e8e6dc',
  deepDark: '#141413',
  darkSurface: '#30302e',

  // text / neutrals (all warm)
  nearBlack: '#141413',
  charcoalWarm: '#4d4c48',
  darkWarm: '#3d3d3a',
  oliveGray: '#5e5d59',
  stoneGray: '#87867f',
  warmSilver: '#b0aea5',

  // brand
  terracotta: '#c96442',
  coral: '#d97757',

  // borders / rings
  borderCream: '#f0eee6',
  borderWarm: '#e8e6dc',
  ringWarm: '#d1cfc5',

  // accessibility
  focusBlue: '#3898ec',
} as const;

const SERIF = '"Playfair Display", Georgia, "Times New Roman", serif';
const SANS = '"Inter", system-ui, -apple-system, sans-serif';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/* ─── Sticky nav ────────────────────────────────────────────────── */
function StickyNav() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ['rgba(245,244,237,0.7)', 'rgba(245,244,237,0.97)']);
  const shadow = useTransform(
    scrollY,
    [0, 80],
    ['0 0 0 0 rgba(0,0,0,0)', '0 1px 0 0 #f0eee6'],
  );
  return (
    <motion.nav
      style={{ background: bg, boxShadow: shadow }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm"
    >
      <div className="max-w-[1120px] mx-auto px-6 h-[72px] flex items-center justify-between">
        <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 20, color: C.nearBlack }}>
          Abhiroop
        </span>
        <Link
          to="/#highlights"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            background: C.warmSand,
            color: C.charcoalWarm,
            fontFamily: SANS,
            boxShadow: `0 0 0 1px ${C.ringWarm}`,
            outlineColor: C.focusBlue,
          }}
        >
          <ArrowLeft size={13} strokeWidth={2} />
          All projects
        </Link>
      </div>
    </motion.nav>
  );
}

/* ─── Shared primitives ─────────────────────────────────────────── */
function Section({
  dark = false,
  id,
  className = '',
  children,
}: {
  dark?: boolean;
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{ background: dark ? C.deepDark : C.parchment }}
      className={`w-full py-24 md:py-32 ${className}`}
    >
      <div className="max-w-[1120px] mx-auto px-6">{children}</div>
    </section>
  );
}

const Overline = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <p
    className="uppercase mb-5"
    style={{
      fontFamily: SANS,
      fontSize: 10,
      fontWeight: 500,
      letterSpacing: '0.5px',
      color: dark ? C.warmSilver : C.stoneGray,
    }}
  >
    {children}
  </p>
);

const H2 = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <h2
    className="mb-8"
    style={{
      fontFamily: SERIF,
      fontWeight: 500,
      fontSize: 'clamp(32px, 5vw, 52px)',
      lineHeight: 1.2,
      color: dark ? C.ivory : C.nearBlack,
    }}
  >
    {children}
  </h2>
);

const H3 = ({
  children,
  dark = false,
  size = 28,
}: {
  children: React.ReactNode;
  dark?: boolean;
  size?: number;
}) => (
  <h3
    className="mb-4"
    style={{
      fontFamily: SERIF,
      fontWeight: 500,
      fontSize: size,
      lineHeight: 1.25,
      color: dark ? C.ivory : C.nearBlack,
    }}
  >
    {children}
  </h3>
);

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-[16px] p-6 ${className}`}
    style={{
      background: C.ivory,
      border: `1px solid ${C.borderCream}`,
      boxShadow: 'rgba(0,0,0,0.05) 0px 4px 24px',
    }}
  >
    {children}
  </div>
);

const StatCard = ({ number, label }: { number: string | number; label: string }) => (
  <div
    className="rounded-[16px] p-6"
    style={{
      background: C.ivory,
      border: `1px solid ${C.borderCream}`,
      boxShadow: 'rgba(0,0,0,0.05) 0px 4px 24px',
    }}
  >
    <p
      className="tabular-nums leading-none mb-2"
      style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 52, color: C.terracotta }}
    >
      {number}
    </p>
    <p
      style={{ fontFamily: SANS, fontSize: 14, color: C.oliveGray, lineHeight: 1.5 }}
    >
      {label}
    </p>
  </div>
);

function ImgPlaceholder({
  label,
  aspect = 'aspect-[16/9]',
  dark = false,
  radius = 24,
}: {
  label: string;
  aspect?: string;
  dark?: boolean;
  radius?: number;
}) {
  return (
    <figure
      aria-label={label}
      className={`relative w-full ${aspect} overflow-hidden flex items-center justify-center`}
      style={{
        borderRadius: radius,
        background: dark ? C.darkSurface : C.warmSand,
        border: `1px solid ${dark ? C.darkSurface : C.borderWarm}`,
        boxShadow: 'rgba(0,0,0,0.05) 0px 4px 24px',
      }}
    >
      <div className="text-center px-8 py-10 max-w-[640px]">
        <p
          className="uppercase mb-3"
          style={{
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.4em',
            color: dark ? C.warmSilver : C.stoneGray,
          }}
        >
          Placeholder
        </p>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 13,
            lineHeight: 1.6,
            color: dark ? C.warmSilver : C.oliveGray,
          }}
        >
          {label}
        </p>
      </div>
    </figure>
  );
}

const QuoteCard = ({ body, attribution }: { body: string; attribution: React.ReactNode }) => (
  <div className="rounded-[16px] p-6" style={{ background: C.warmSand }}>
    <p
      className="mb-4"
      style={{
        fontFamily: SERIF,
        fontWeight: 500,
        fontSize: 18,
        lineHeight: 1.4,
        color: C.nearBlack,
      }}
    >
      “{body}”
    </p>
    <p style={{ fontFamily: SANS, fontSize: 12, color: C.stoneGray }}>{attribution}</p>
  </div>
);

/* ─── Pipeline diagram (section 04) ──────────────────────────────── */
function PipelineSVG() {
  const phases = [
    { label: 'TRIAGE', agents: ['triage'] },
    {
      label: 'DISCOVERY',
      agents: [
        'ds-indexer',
        'guidelines-resolver',
        'theming-resolver',
        'market-researcher',
        'competitive-synthesizer',
      ],
    },
    { label: 'RESEARCH', agents: ['researcher', 'product-manager', 'ux-strategist'] },
    {
      label: 'DESIGN',
      agents: [
        'ux-architect',
        'lead-designer',
        'ds-extension-judge',
        'design-principal',
        'aesthetic-director',
        'ux-writer',
      ],
    },
    { label: 'SPECS', agents: ['engineering-manager'] },
    { label: 'BUILD', agents: ['pattern-decider', 'developer'] },
    {
      label: 'QA',
      agents: [
        'dev-qa',
        'production-readiness',
        'runtime-inspector',
        'design-qa',
        'commercial-auditor',
      ],
    },
  ];

  const COL_W = 132;
  const COL_GAP = 16;
  const CHIP_H = 22;
  const CHIP_GAP = 6;
  const HEADER_H = 28;
  const PAD = 10;
  const LEFT_PAD = 40;
  const RIGHT_PAD = 80;

  const maxAgents = Math.max(...phases.map((p) => p.agents.length));
  const COL_H = HEADER_H + 2 * PAD + maxAgents * (CHIP_H + CHIP_GAP);
  const totalW = LEFT_PAD + phases.length * (COL_W + COL_GAP) + RIGHT_PAD;
  const SVG_H = COL_H + 110;

  const colX = (i: number) => LEFT_PAD + i * (COL_W + COL_GAP);
  const spineY = COL_H / 2;

  // Gate positions: G1 before RESEARCH (idx 2), G2 before BUILD (idx 5), G3 after QA
  const gateBefore = (idx: number, label: string) => {
    const gx = colX(idx) - COL_GAP / 2 - 12;
    return { gx, gy: spineY, label };
  };
  const gates = [gateBefore(2, 'G1'), gateBefore(5, 'G2')];
  const g3x = colX(phases.length - 1) + COL_W + 28;

  // QA-chip y positions (inside col 6, agents 0..4)
  const qaColIdx = 6;
  const qaChipY = (j: number) => HEADER_H + PAD + j * (CHIP_H + CHIP_GAP) + CHIP_H / 2;
  const buildColX = colX(5) + COL_W / 2;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${totalW} ${SVG_H}`}
        style={{ width: '100%', minWidth: 880 }}
        role="img"
        aria-label="Monolith Phase-1 pipeline. Seven phases: Triage, Discovery, Research, Design, Specs, Build, QA. Three gates G1 G2 G3. Five self-healing loops from QA back to Build."
      >
        {/* background */}
        <rect width={totalW} height={SVG_H} fill={C.ivory} rx={20} />

        {/* spine connector */}
        <line
          x1={colX(0) + COL_W / 2}
          y1={spineY}
          x2={colX(phases.length - 1) + COL_W / 2}
          y2={spineY}
          stroke={C.borderWarm}
          strokeWidth={1.5}
        />

        {/* gates G1, G2 */}
        {gates.map((g) => (
          <g key={g.label}>
            <polygon
              points={`${g.gx},${g.gy - 13} ${g.gx + 13},${g.gy} ${g.gx},${g.gy + 13} ${g.gx - 13},${g.gy}`}
              fill={C.terracotta}
            />
            <text
              x={g.gx}
              y={g.gy + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={C.ivory}
              fontSize={9}
              fontFamily={SANS}
              fontWeight={600}
            >
              {g.label}
            </text>
          </g>
        ))}

        {/* gate G3 */}
        <g>
          <polygon
            points={`${g3x},${spineY - 13} ${g3x + 13},${spineY} ${g3x},${spineY + 13} ${g3x - 13},${spineY}`}
            fill={C.terracotta}
          />
          <text
            x={g3x}
            y={spineY + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={C.ivory}
            fontSize={9}
            fontFamily={SANS}
            fontWeight={600}
          >
            G3
          </text>
          <text
            x={g3x}
            y={spineY + 30}
            textAnchor="middle"
            fontSize={9}
            fontFamily={SANS}
            fontWeight={600}
            fill={C.terracotta}
            letterSpacing={0.6}
          >
            SHIP
          </text>
        </g>

        {/* arrow marker for self-heal arcs */}
        <defs>
          <marker id="arrowCoral" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={C.coral} />
          </marker>
        </defs>

        {/* five self-heal arcs: QA chip → BUILD column */}
        {[0, 1, 2, 3, 4].map((j) => {
          const startX = colX(qaColIdx) + 16;
          const startY = qaChipY(j);
          const endX = buildColX;
          const endY = COL_H + 22 + j * 9;
          const ctrlX = (startX + endX) / 2;
          const ctrlY = COL_H + 70 + j * 3;
          return (
            <path
              key={`arc-${j}`}
              d={`M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`}
              fill="none"
              stroke={C.coral}
              strokeWidth={1.2}
              strokeDasharray="4 2"
              opacity={0.8}
              markerEnd="url(#arrowCoral)"
            />
          );
        })}
        <text
          x={(buildColX + colX(qaColIdx)) / 2}
          y={COL_H + 96}
          textAnchor="middle"
          fontSize={9}
          fontFamily={SANS}
          fill={C.coral}
        >
          ↻ max 5 iterations per loop
        </text>

        {/* phase columns */}
        {phases.map((phase, i) => {
          const x = colX(i);
          return (
            <g key={phase.label}>
              {/* column card */}
              <rect
                x={x}
                y={0}
                width={COL_W}
                height={COL_H}
                rx={10}
                fill={C.parchment}
                stroke={C.borderCream}
                strokeWidth={1}
              />
              {/* header band */}
              <rect x={x} y={0} width={COL_W} height={HEADER_H} rx={10} fill={C.warmSand} />
              <rect
                x={x}
                y={HEADER_H - 10}
                width={COL_W}
                height={10}
                fill={C.warmSand}
              />
              <text
                x={x + COL_W / 2}
                y={HEADER_H / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={9}
                fontFamily={SANS}
                fontWeight={600}
                fill={C.nearBlack}
                letterSpacing={0.9}
              >
                {phase.label}
              </text>

              {/* agent chips */}
              {phase.agents.map((agent, j) => {
                const cy = HEADER_H + PAD + j * (CHIP_H + CHIP_GAP);
                return (
                  <g key={agent}>
                    <rect
                      x={x + 8}
                      y={cy}
                      width={COL_W - 16}
                      height={CHIP_H}
                      rx={5}
                      fill={C.ivory}
                      stroke={C.borderWarm}
                      strokeWidth={0.8}
                    />
                    <text
                      x={x + COL_W / 2}
                      y={cy + CHIP_H / 2 + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={8}
                      fontFamily={SANS}
                      fill={C.oliveGray}
                    >
                      {agent}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Three-layer cake (section 06) ─────────────────────────────── */
function ThreeLayerCake() {
  const layers = [
    {
      label: 'Agents (25)',
      sub: 'Judgment — what to decide.',
      y: 8,
      fill: C.terracotta,
      text: C.ivory,
    },
    {
      label: 'Rules (26)',
      sub: 'Doctrine — what is non-negotiable.',
      y: 78,
      fill: C.warmSand,
      text: C.nearBlack,
    },
    {
      label: 'Scripts (14)',
      sub: 'Side effects — what touches the filesystem.',
      y: 148,
      fill: C.darkSurface,
      text: C.warmSilver,
    },
  ];
  return (
    <svg
      viewBox="0 0 600 216"
      style={{ width: '100%', maxWidth: 600 }}
      role="img"
      aria-label="Three-layer architecture. Top: agents (judgment). Middle: rules (doctrine). Bottom: scripts (side effects)."
    >
      {layers.map((layer) => (
        <g key={layer.label}>
          <rect x={20} y={layer.y} width={560} height={58} rx={8} fill={layer.fill} />
          <text
            x={40}
            y={layer.y + 25}
            fontFamily={SERIF}
            fontWeight={500}
            fontSize={17}
            fill={layer.text}
          >
            {layer.label}
          </text>
          <text
            x={40}
            y={layer.y + 45}
            fontFamily={SANS}
            fontSize={12}
            fill={layer.text}
            opacity={0.82}
          >
            {layer.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Iteration ribbon (section 07) ──────────────────────────────── */
function IterationRibbon() {
  const steps = [
    'QA audit',
    'issues found?',
    'self-healer delta',
    'developer patch',
    're-audit',
  ];
  const W = 760;
  const H = 150;
  const pillW = 118;
  const pillH = 34;
  const gap = (W - 48 - steps.length * pillW) / (steps.length - 1);
  const y = 50;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', maxWidth: W }}
      role="img"
      aria-label="Self-healing loop — QA audit, issues found, self-healer delta, developer patch, re-audit, repeating up to 5 times."
    >
      <defs>
        <marker id="arrowWarm" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={C.warmSilver} />
        </marker>
        <marker id="arrowCoral2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={C.coral} />
        </marker>
      </defs>

      {steps.map((s, i) => {
        const x = 24 + i * (pillW + gap);
        return (
          <g key={s}>
            <rect
              x={x}
              y={y}
              width={pillW}
              height={pillH}
              rx={pillH / 2}
              fill={C.ivory}
              stroke={C.borderWarm}
              strokeWidth={1}
            />
            <text
              x={x + pillW / 2}
              y={y + pillH / 2 + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fontFamily={SANS}
              fill={C.nearBlack}
            >
              {s}
            </text>
            {i < steps.length - 1 && (
              <line
                x1={x + pillW + 4}
                y1={y + pillH / 2}
                x2={x + pillW + gap - 4}
                y2={y + pillH / 2}
                stroke={C.warmSilver}
                strokeWidth={1.4}
                markerEnd="url(#arrowWarm)"
              />
            )}
          </g>
        );
      })}

      {/* loop-back arc from re-audit → QA audit */}
      <path
        d={`M ${W - 24 - pillW / 2} ${y + pillH + 2}
            Q ${W / 2} ${y + pillH + 62} ${24 + pillW / 2} ${y + pillH + 2}`}
        fill="none"
        stroke={C.warmSilver}
        strokeWidth={1.4}
        strokeDasharray="4 3"
        markerEnd="url(#arrowWarm)"
      />
      <text
        x={W / 2}
        y={y + pillH + 62}
        textAnchor="middle"
        fontSize={10}
        fontFamily={SANS}
        fill={C.oliveGray}
      >
        loop ↻ capped at 5 iterations
      </text>

      {/* escape arrow */}
      <line
        x1={24 + pillW * 1.5 + gap}
        y1={y + pillH / 2}
        x2={24 + pillW * 1.5 + gap}
        y2={16}
        stroke={C.coral}
        strokeWidth={1.3}
        strokeDasharray="3 2"
        markerEnd="url(#arrowCoral2)"
      />
      <text
        x={24 + pillW * 1.5 + gap + 8}
        y={22}
        fontSize={10}
        fontFamily={SANS}
        fill={C.coral}
      >
        hard-block + escalate after 5
      </text>
    </svg>
  );
}

/* ─── Data constants ─────────────────────────────────────────────── */
const AGENTS = [
  { name: 'orchestrator', role: 'Project conductor', output: 'Run state, gate control, writes.log, DELIVERY.md' },
  { name: 'triage', role: 'Intake + input classifier', output: 'input-manifest.json' },
  { name: 'ds-indexer', role: 'Design-system cataloguer', output: 'component-index.json, tokens.json, icons.json' },
  { name: 'guidelines-resolver', role: 'Guideline normalizer', output: 'Seven normalized guideline JSON docs' },
  { name: 'theming-resolver', role: 'Theme normalizer + themeability classifier', output: 'theme-spec.json, themeability-report.md' },
  { name: 'market-researcher', role: 'Market + competitive research', output: 'docs/market-research.md' },
  { name: 'competitive-synthesizer', role: 'Competitive synthesis analyst', output: 'docs/competitive-synthesis.md' },
  { name: 'researcher', role: 'User-research synthesis', output: 'docs/research.md with Gap Inferences' },
  { name: 'product-manager', role: 'PM with commercial lens', output: 'docs/prd.md' },
  { name: 'ux-strategist', role: 'Differentiation strategist', output: 'docs/differentiation-map.md (3–5 bets)' },
  { name: 'ux-architect', role: 'IA + flow architect', output: 'docs/information_architecture.md, user_flow.md' },
  { name: 'lead-designer', role: 'Lead designer', output: 'docs/design_decisions.md, best_practices.md' },
  { name: 'ds-extension-judge', role: 'DS-extension gatekeeper (5-test gate)', output: 'docs/ds-extensions/*.md rulings' },
  { name: 'design-principal', role: 'Senior-designer critic', output: 'docs/design-principal-critique.md' },
  { name: 'aesthetic-director', role: 'Premium-visual gate', output: 'docs/aesthetic-audit.md' },
  { name: 'ux-writer', role: 'UX writing pass', output: 'docs/ux-writing-pass.md' },
  { name: 'engineering-manager', role: 'Engineering manager', output: 'docs/build_specs.md' },
  { name: 'pattern-decider', role: 'Pattern librarian', output: 'docs/pattern_decisions.md, promoted patterns' },
  { name: 'developer', role: 'Software engineer', output: 'Scaffolded Vite app <appName>/**' },
  { name: 'dev-qa', role: 'Static test engineer (inc. ANTI_GENERIC gate)', output: 'qa/dev_qa_report.md' },
  { name: 'production-readiness-auditor', role: 'Production-readiness auditor', output: 'qa/production_readiness.md' },
  { name: 'runtime-inspector', role: 'Runtime test engineer (4 viewports)', output: 'qa/runtime_inspection.md' },
  { name: 'design-qa', role: 'Design QA', output: 'qa/design_qa_report.md' },
  { name: 'commercial-auditor', role: 'Growth + commercial auditor', output: 'qa/commercial-audit.md' },
  { name: 'self-healer', role: 'Scoped patch engineer', output: 'In-place patches inside QA loops' },
];

const RULES = [
  'Rule 0 — DS-First Mandate',
  'Rule 9 — Production-Grade Mandate',
  'Rule 10 — Self-Healing QA Loop',
  'Rule 13 — Differentiation Mandate',
  'Rule 19 — Premium Aesthetic Standard',
  'Rule 20 — AI-Generic Anti-Patterns (25-item blacklist)',
  'Rule 21 — Theming Input Normalization (3-tier)',
  'Rule 23 — Checkpoint Discipline (disk as truth)',
];

const SCRIPTS = [
  'triage-input.ts — classify brief, emit input manifest',
  'index-ds-repo.ts / index-ds-mcp.ts — build DS knowledge index',
  'extract-tokens.ts / extract-icons.ts — token + icon catalogue',
  'fetch-guidelines-web.ts / parse-guidelines-repo.ts — guideline resolution',
  'scaffold-app.ts — stand up a Vite app from templates',
  'validate-generated.ts — tsc, eslint, build gate',
  'axe-run.ts — accessibility sweep',
  'visual-smoke.ts — 4-viewport screenshots',
];

const LOOPS: Array<{ n: string; name: string; audits: string; iters: string }> = [
  {
    n: '01',
    name: 'dev-qa',
    audits:
      'tsc, eslint, build, dev-server boot, axe, DS-First gate, 25-item AI-generic blacklist.',
    iters: '1–2 iterations',
  },
  {
    n: '02',
    name: 'production-readiness-auditor',
    audits:
      'No dead buttons. No lorem. No TODOs. All routes reachable. All forms submit. Loading + empty + error states present. Nav state correct.',
    iters: '2–3 iterations',
  },
  {
    n: '03',
    name: 'runtime-inspector',
    audits:
      'Headless-browser click-through at 4 viewports (375 / 768 / 1280 / 1920). Console + network scan, scroll clipping, modal stacking.',
    iters: '1–2 iterations',
  },
  {
    n: '04',
    name: 'design-qa',
    audits:
      'Premium-aesthetic rubric — typographic rhythm, spacing scale, motion curves, depth tiers, token coverage.',
    iters: 'Usually 1 iteration',
  },
  {
    n: '05',
    name: 'commercial-auditor',
    audits:
      'Onboarding / conversion / retention / trust / expansion surfaces graded. Differentiators verified in the running app.',
    iters: '1–2 iterations',
  },
];

const TIMELINE = [
  {
    v: 'V0',
    title: '"Just a skill that builds a React app."',
    body: 'One prompt, one agent. Output was a purple gradient hero, three feature cards, a pricing table, an empty-state with a sketchy lightbulb. Plausible, never interesting.',
  },
  {
    v: 'V1',
    title: 'Split into research + build.',
    body: "Two agents. The build was still generic. Research without synthesis is just a dump of open tabs — it doesn't change what gets drawn.",
  },
  {
    v: 'V2',
    title: 'Add a critic.',
    body: 'Introduced design-principal as a senior-designer critic. First real quality gain: the critic found clichés the designer kept missing.',
  },
  {
    v: 'V3',
    title: 'Competitive synthesis + differentiation mandate.',
    body: 'The moment outputs stopped looking like every other AI-generated SaaS page. Rule 13 forces 3–5 bets, each cited against a real competitor.',
  },
  {
    v: 'V4',
    title: 'The AI-generic anti-pattern blacklist.',
    body: 'Observed LLMs converging on the same 25 visual clichés (rounded-2xl, shadow-md, Tailwind blue, emoji-as-icon). Encoded them as auto-blockers. Agents self-audit before emitting UI.',
  },
  {
    v: 'V5',
    title: 'Self-healing loops + G3 commercial audit.',
    body: "One-shot QA wasn't enough. Loops with retry budgets, plus a commercial auditor that grades whether the product can actually be sold — not just rendered.",
  },
  {
    v: 'V6',
    title: 'Checkpoint discipline, disk as truth.',
    body: 'Weaker models drifted mid-run. Moving state to checkpoints/*.json on disk fixed it. Chat became a viewport, not the source of truth.',
  },
];

const GAPS: Array<{ gap: string; body: string }> = [
  {
    gap: 'No research phase.',
    body: 'Generic coding agents jump to scaffolding. Monolith spends the first 60% of runtime on market research, competitive synthesis, and gap inference before a single component is chosen.',
  },
  {
    gap: 'No design-system discipline.',
    body: 'Most tools accept a token file and move on. Monolith indexes the DS, classifies its themeability tier, runs a 5-test gate on any custom component, and refuses to hallucinate primitives.',
  },
  {
    gap: 'No premium-aesthetic rubric.',
    body: 'Nothing audits its own output against a written standard for typographic rhythm, colour discipline, or anti-generic tells.',
  },
  {
    gap: 'No commercial gate.',
    body: 'Nothing grades onboarding, conversion, retention, trust and expansion surfaces in the finished app.',
  },
  {
    gap: 'No self-healing.',
    body: '"Fix it" turns into a conversation. Monolith\'s loops cap retries and escalate instead of silently degrading.',
  },
  {
    gap: 'No checkpointed handoff.',
    body: 'Weaker LLMs lose their place in long chats. Typed JSON on disk eliminates that class of drift.',
  },
];

const PRD_POINTS: React.ReactNode[] = [
  <>Replace a manual, JSON-based configuration step with a <strong>no-code builder</strong> for non-technical admins.</>,
  <>Reduce the end-to-end setup time from <strong>weeks to roughly one hour</strong>.</>,
  <>Make the pipeline <strong>transparent</strong> — surface how many records pass through each step, with drill-down.</>,
  <>Add a <strong>dry-run mode</strong> so misconfiguration is caught before a real run.</>,
  <>Cut the long tail of support tickets caused by configuration errors — the current source of most incidents.</>,
];

const RESEARCH_CARDS: Array<{ agent: string; headline: string; body: string }> = [
  {
    agent: 'market-researcher',
    headline: 'Surveyed twenty comparable products.',
    body: "Pulled onboarding flows, pricing pages, and feature breakdowns across the relevant space. Catalogued three recurring loopholes competitors kept leaving open — all three later shaped the product's differentiators.",
  },
  {
    agent: 'competitive-synthesizer',
    headline: 'Collapsed 20 products into one page.',
    body: 'Not a table dump. A synthesis: "Who owns transparency, who owns speed, who owns trust." Every claim cites a specific competitor. No vibes, no hedging.',
  },
  {
    agent: 'researcher + product-manager',
    headline: 'Gap Inferences — filling the silences.',
    body: 'Cross-referenced the brief against the synthesis and the design system. Wherever the brief was silent but the market had already solved the question, a Gap Inference was inserted — flagged explicitly so I could accept or reject it at Gate 2.',
  },
  {
    agent: 'ux-strategist',
    headline: 'The differentiation map — 3 to 5 bets.',
    body: 'Each bet names a competitor, cites evidence, scores its weight. This document is what the commercial-auditor later grades the finished app against. The loop is closed.',
  },
];

const SCREENSHOTS: Array<{ label: string; caption: string }> = [
  {
    label:
      'Dashboard screenshot placeholder — a run-results dashboard. Header row of four tabular-num metric cards. Below, a table with run history and drill-down. Warm neutrals, terracotta accent for a single primary CTA. No lorem ipsum copy.',
    caption: 'Run-results dashboard — per-step drop-off counts.',
  },
  {
    label:
      'Pipeline-visualization placeholder — a vertical flowchart with five filter steps, each node showing count and percentage, drill-down affordance at the bottom of each step.',
    caption: 'Pipeline visualization with drill-down at record level.',
  },
  {
    label:
      'Dry-run modal placeholder — a large centered dialog showing projected counts before execution, with a "Commit" primary button and a "Back to edit" secondary.',
    caption: 'Dry-run mode, surfaced before the first real run.',
  },
  {
    label:
      'Form-first editor placeholder — a no-code builder with a form on the left and a live preview panel on the right. Everything labelled in plain English; no JSON in sight.',
    caption: 'Form-first editor — no JSON.',
  },
  {
    label:
      'Rationale-card placeholder — a per-record card answering "why was this assigned?" with three bullet-point reasons and a small "was this right?" feedback control.',
    caption: 'Assignment rationale, generated per record.',
  },
  {
    label:
      'First-run empty state placeholder — not a sketchy lightbulb. A small diagram of the pipeline with a one-sentence description, and a single terracotta "Create your first strategy" CTA.',
    caption: 'First-run empty state — not a sketchy lightbulb.',
  },
];

/* ─── Page ──────────────────────────────────────────────────────── */
export function MonolithPhase1ProjectPage() {
  return (
    <div style={{ background: C.parchment, minHeight: '100vh' }}>
      <StickyNav />

      {/* ── 01 · Hero ─────────────────────────────────────────────── */}
      <Section className="pt-40 md:pt-48 pb-24">
        <Overline>A Workflow Case Study · April 2026</Overline>
        <h1
          className="max-w-[820px] mb-6"
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: 'clamp(40px, 6vw, 64px)',
            lineHeight: 1.1,
            color: C.nearBlack,
          }}
        >
          Monolith — Phase 1
          <br />
          <span style={{ color: C.oliveGray }}>
            A workflow that designs{' '}
            <span style={{ color: C.terracotta }}>with</span> you, not for you.
          </span>
        </h1>
        <p
          className="max-w-[720px] mb-6"
          style={{ fontFamily: SANS, fontSize: 20, lineHeight: 1.6, color: C.oliveGray }}
        >
          Feed it a one-line brief or a PRD, point it at any design system, and it runs a
          twenty-five-role product organization — market research, competitive synthesis, UX
          strategy, design critique, engineering specs, code, five self-healing QA loops — and
          hands back a click-tested, market-grade React app on{' '}
          <code style={{ fontFamily: MONO, fontSize: 17 }}>localhost</code>.
        </p>
        <p
          className="mb-10"
          style={{ fontFamily: SANS, fontSize: 14, color: C.stoneGray, lineHeight: 1.6 }}
        >
          Optimized for Claude Code. Runs on any capable agent harness — Cursor, Cline, Windsurf,
          OpenCode, Continue, plain tool-use loops.
        </p>
        <div className="flex flex-wrap gap-3 mb-14">
          <a
            href="#pipeline"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[12px] text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: C.terracotta,
              color: C.ivory,
              fontFamily: SANS,
              outlineColor: C.focusBlue,
            }}
          >
            See the pipeline
          </a>
          <a
            href="#example"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[8px] text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: C.warmSand,
              color: C.charcoalWarm,
              fontFamily: SANS,
              boxShadow: `0 0 0 1px ${C.ringWarm}`,
              outlineColor: C.focusBlue,
            }}
          >
            Jump to the example run
          </a>
        </div>
        <ImgPlaceholder
          aspect="aspect-[16/7]"
          radius={32}
          label="Hero illustration — a loose, hand-drawn-feeling organic cluster of 25 small agent nodes connected by thin meandering lines. Threaded through the cluster are three terracotta diamonds labelled G1 / G2 / G3, and five dashed coral self-heal arcs looping back into the build stage. Parchment canvas. No icons, no logos, no gradients."
        />
      </Section>

      {/* ── 02 · TL;DR stat strip ─────────────────────────────────── */}
      <Section className="py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard number={25} label="specialized agents (24 role agents + orchestrator)" />
          <StatCard number={26} label="enforceable rules" />
          <StatCard number={14} label="TypeScript scripts doing the heavy lifting" />
          <StatCard number={5} label="self-healing QA loops, up to 5 retries each" />
          <StatCard number={3} label="human approval gates (G1, G2, G3)" />
          <StatCard number={9} label="canonical page-level surface templates" />
        </div>
      </Section>

      {/* ── 03 · Why I built this ─────────────────────────────────── */}
      <Section>
        <Overline>The Designer's Position</Overline>
        <H2>I'm a designer. I wanted to skip Figma for the first lap.</H2>
        <div className="max-w-[680px] space-y-5">
          <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: C.nearBlack }}>
            Most of my early-stage work is wasted in Figma. I rebuild the same dashboard shells,
            copy-paste the same empty states, and stall out on decisions I'd rather make in a real
            browser against real components. By the time a prototype exists, I've lost a week to
            pixel-pushing work that a design system could have done automatically.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: C.nearBlack }}>
            Monolith Phase-1 is my attempt to compress that week into an hour. Instead of a Figma
            file, the first artifact of any new product is a{' '}
            <strong>running localhost app</strong> — already built against the design system,
            already informed by twenty real competitors, already critiqued by a senior-designer
            agent and an aesthetic-director agent, already QA'd against a 25-item AI-generic
            blacklist.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: C.nearBlack }}>
            Figma still wins for polish, handoff, and stakeholder walkthroughs. But for week one
            — research, ideation, brainstorming, the moment you're supposed to be wrong quickly —
            the browser is a better canvas, and a workflow like this is a better partner than a
            blank file.
          </p>
        </div>

        <div
          className="rounded-[16px] p-6 md:p-8 mt-10 max-w-[680px]"
          style={{
            background: C.warmSand,
            borderLeft: `3px solid ${C.terracotta}`,
          }}
        >
          <p
            className="mb-2"
            style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.nearBlack }}
          >
            Why not just Figma Make, v0, Lovable, or a generic coding agent?
          </p>
          <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: C.oliveGray }}>
            None of them run a real research phase. None of them enforce a design system the way a
            dedicated indexer can. None of them critique their own output against a
            premium-aesthetic rubric. And none of them treat “does this product actually win in
            its market” as a first-class gate. Monolith does all four — and it does them before
            writing a line of code.
          </p>
        </div>

        <div className="mt-14">
          <ImgPlaceholder
            aspect="aspect-[16/6]"
            label={`The "first-lap" chart — a horizontal timeline with two rows. Top row "Figma flow": empty canvas → wireframes → hi-fi screens → prototype. Bottom row "Monolith flow": brief → research → running app → iterate. Terracotta marker on the Monolith row at "running app," roughly at the position of "wireframes" on the Figma row, indicating arrival an order of magnitude earlier.`}
          />
        </div>
      </Section>

      {/* ── 04 · Pipeline (dark) ──────────────────────────────────── */}
      <Section dark id="pipeline">
        <Overline dark>One command · Seven phases</Overline>
        <H2 dark>One command. Twenty-five roles. One running app.</H2>
        <p
          className="max-w-[620px] mb-10"
          style={{ fontFamily: SANS, fontSize: 17, lineHeight: 1.6, color: C.warmSilver }}
        >
          The pipeline runs linearly through seven phases, gated by three human approvals (G1, G2,
          G3) and guarded by five self-healing QA loops. Disk is the source of truth: every agent
          hands off through typed JSON checkpoints, never through conversation. Weaker models can
          lose their place in a long chat; they can't lose a file.
        </p>

        <div
          className="rounded-[20px] p-6 md:p-8 mb-4"
          style={{ background: C.ivory, boxShadow: 'rgba(0,0,0,0.18) 0px 8px 32px' }}
        >
          <PipelineSVG />
        </div>

        <p style={{ fontFamily: SANS, fontSize: 13, color: C.warmSilver, lineHeight: 1.6 }}>
          Five self-healing loops. Max 5 iterations per gate. If a loop exhausts its budget, the
          orchestrator blocks and escalates — it never silently waives a failure.
        </p>
      </Section>

      {/* ── 05 · 25 agents ────────────────────────────────────────── */}
      <Section>
        <Overline>A product organization · staffed by prompts</Overline>
        <H2>Twenty-five roles. Twenty-five artifacts. Zero overlap.</H2>
        <p
          className="max-w-[640px] mb-10"
          style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: C.oliveGray }}
        >
          Every agent owns one role with one output. They don't overlap — the rule is explicit,
          and the orchestrator refuses work that duplicates a sibling. This is what stops "agent
          goo" from happening: every node has a job title, an input contract, and a single
          artifact it is responsible for.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {AGENTS.map((a) => (
            <Card key={a.name}>
              <code
                className="block mb-1"
                style={{ fontFamily: MONO, fontSize: 13, color: C.terracotta }}
              >
                {a.name}
              </code>
              <p
                className="uppercase mb-3"
                style={{
                  fontFamily: SANS,
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.3px',
                  color: C.stoneGray,
                }}
              >
                {a.role}
              </p>
              <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.5, color: C.oliveGray }}>
                → {a.output}
              </p>
            </Card>
          ))}
        </div>

        <div
          className="rounded-[16px] p-6 max-w-[760px]"
          style={{ background: C.warmSand }}
        >
          <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: C.nearBlack }}>
            <strong>Rule 24 — Phase Manifest Discipline</strong> is what keeps 25 agents from
            tripping over each other. Every agent declares{' '}
            <code style={{ fontFamily: MONO, fontSize: 13 }}>reads:</code> and{' '}
            <code style={{ fontFamily: MONO, fontSize: 13 }}>writes:</code> in its markdown
            frontmatter. The orchestrator checks those contracts before any agent runs. If two
            agents claim the same{' '}
            <code style={{ fontFamily: MONO, fontSize: 13 }}>writes:</code>, the pipeline refuses
            to start. Disk is the source of truth, not the chat log.
          </p>
        </div>
      </Section>

      {/* ── 06 · Three-layer cake ─────────────────────────────────── */}
      <Section>
        <Overline>Plumbing · Three kinds of files</Overline>
        <H2>Three kinds of files run the whole thing.</H2>
        <p
          className="max-w-[680px] mb-10"
          style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: C.oliveGray }}
        >
          The separation is load-bearing: <strong>agents</strong> handle judgment,{' '}
          <strong>rules</strong> handle doctrine, <strong>scripts</strong> handle side effects.
          Nothing else is allowed to touch the filesystem. This is what lets twenty-five agents
          collaborate without fighting each other for the same pen.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* A · Skill */}
          <Card>
            <p
              className="uppercase mb-3"
              style={{
                fontFamily: SANS,
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.4px',
                color: C.terracotta,
              }}
            >
              The Skill
            </p>
            <H3 size={22}>SKILL.md</H3>
            <p
              className="mb-4"
              style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: C.oliveGray }}
            >
              A single markdown file with YAML frontmatter. The harness reads the frontmatter to
              know when to trigger the skill and what artifacts to expect. The file itself is an
              index — nothing interesting lives inside it.
            </p>
            <ul className="space-y-2">
              {[
                'Organizational metaphor — role → agent mapping',
                'When to use / when not to use',
                'One-breath pipeline diagram',
                'Six mode flags — --full, --themeOnly, --planOnly, --lazy, --UXR, --noPRD',
                'Canonical output layout on disk',
                'Pointers to all 26 rules',
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-2 items-start"
                  style={{ fontFamily: SANS, fontSize: 13, color: C.oliveGray, lineHeight: 1.55 }}
                >
                  <span
                    style={{ color: C.terracotta, marginTop: 3, flexShrink: 0, fontSize: 9 }}
                  >
                    ◆
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          {/* B · Rules */}
          <Card>
            <p
              className="uppercase mb-3"
              style={{
                fontFamily: SANS,
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.4px',
                color: C.terracotta,
              }}
            >
              The Doctrine
            </p>
            <H3 size={22}>rules/*.md — 26 files</H3>
            <p
              className="mb-4"
              style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: C.oliveGray }}
            >
              Each rule is standalone doctrine that agents cite. They don't re-argue the same
              principles every run — they point at the rule and move on.
            </p>
            <ul className="space-y-2">
              {RULES.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 items-start"
                  style={{ fontFamily: SANS, fontSize: 13, color: C.oliveGray, lineHeight: 1.55 }}
                >
                  <span
                    style={{ color: C.terracotta, marginTop: 3, flexShrink: 0, fontSize: 9 }}
                  >
                    ◆
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          {/* C · Scripts */}
          <Card>
            <p
              className="uppercase mb-3"
              style={{
                fontFamily: SANS,
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.4px',
                color: C.terracotta,
              }}
            >
              The Engine
            </p>
            <H3 size={22}>scripts/*.ts — 14 files</H3>
            <p
              className="mb-4"
              style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: C.oliveGray }}
            >
              Agents don't run code. Scripts do. Any time an agent needs to parse a tsconfig,
              scrape a URL, install a dependency, boot a dev server or take screenshots, it calls
              one of these.
            </p>
            <ul className="space-y-2">
              {SCRIPTS.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 items-start"
                  style={{ fontFamily: SANS, fontSize: 13, color: C.oliveGray, lineHeight: 1.55 }}
                >
                  <span
                    style={{ color: C.terracotta, marginTop: 3, flexShrink: 0, fontSize: 9 }}
                  >
                    ◆
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <p
          className="max-w-[640px] mb-12"
          style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: C.stoneGray }}
        >
          Agents can read rules, write artifacts, and request scripts. They can't invent a new
          rule or write to the filesystem directly. That boundary is the skill's most boring
          feature and its most important one.
        </p>

        <div className="flex justify-center">
          <ThreeLayerCake />
        </div>
      </Section>

      {/* ── 07 · Five self-healing loops (dark) ───────────────────── */}
      <Section dark>
        <Overline dark>Quality assurance · Five sieves</Overline>
        <H2 dark>Five sieves. Nothing ships if it can't pass all of them.</H2>
        <p
          className="max-w-[720px] mb-10"
          style={{ fontFamily: SANS, fontSize: 17, lineHeight: 1.6, color: C.warmSilver }}
        >
          Each QA loop runs until it's clean or it's spent its five-iteration budget. The{' '}
          <code style={{ fontFamily: MONO, fontSize: 15, color: C.coral }}>developer</code> agent
          owns the patches; the QA agents own the audits. If a loop exhausts its budget, the
          orchestrator hard-blocks and escalates — it never silently waives a failure.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
          {LOOPS.map((loop) => (
            <div
              key={loop.n}
              className="rounded-[16px] p-6"
              style={{
                background: C.ivory,
                boxShadow: `0 0 0 1px ${C.darkWarm}, rgba(0,0,0,0.18) 0px 4px 24px`,
              }}
            >
              <p
                className="uppercase mb-1"
                style={{
                  fontFamily: SANS,
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.4px',
                  color: C.stoneGray,
                }}
              >
                Loop {loop.n}
              </p>
              <code
                className="block mb-3"
                style={{ fontFamily: MONO, fontSize: 14, color: C.terracotta }}
              >
                {loop.name}
              </code>
              <p
                className="mb-4"
                style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.6, color: C.oliveGray }}
              >
                {loop.audits}
              </p>
              <p style={{ fontFamily: SANS, fontSize: 11, color: C.stoneGray }}>
                {loop.iters}
              </p>
            </div>
          ))}
        </div>

        <div
          className="rounded-[16px] p-6 md:p-8 mx-auto"
          style={{
            background: C.ivory,
            boxShadow: 'rgba(0,0,0,0.18) 0px 8px 32px',
            maxWidth: 820,
          }}
        >
          <IterationRibbon />
        </div>
      </Section>

      {/* ── 08 · How I thought about it ───────────────────────────── */}
      <Section>
        <Overline>Process · Ideation · Problem solving</Overline>
        <H2>The path to 25 agents started with one prompt that failed.</H2>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 mb-16">
          {/* Timeline */}
          <div className="relative">
            <div
              className="absolute top-4 bottom-4 w-px"
              style={{ left: 18, background: C.borderWarm }}
            />
            <div className="space-y-6">
              {TIMELINE.map((event) => (
                <div key={event.v} className="flex gap-4 items-start">
                  <div
                    className="relative z-10 shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      background: C.terracotta,
                      color: C.ivory,
                      fontFamily: SANS,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    {event.v}
                  </div>
                  <div className="pt-1">
                    <p
                      className="mb-1"
                      style={{
                        fontFamily: SERIF,
                        fontWeight: 500,
                        fontSize: 16,
                        lineHeight: 1.3,
                        color: C.nearBlack,
                      }}
                    >
                      {event.title}
                    </p>
                    <p
                      style={{
                        fontFamily: SANS,
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: C.oliveGray,
                      }}
                    >
                      {event.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Essay */}
          <div className="space-y-5">
            <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: C.nearBlack }}>
              The first version was a single agent that took a brief and built a React app. It
              always produced the same thing: a purple gradient hero, three feature cards, a
              pricing table, an empty-state illustration with a sketchy lightbulb. Every output
              was plausible. None of them were <em>interesting</em>.
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: C.nearBlack }}>
              I kept noticing the shapes the model fell into — what I now call the AI-generic
              tells — and realised the problem wasn't model capability, it was{' '}
              <strong>role ambiguity</strong>. A single "designer" prompt is too broad. It has to
              solve research, strategy, IA, visual design, and QA simultaneously. So it picks the
              median answer for each, and the median answer is the cliché.
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: C.nearBlack }}>
              The fix was unambiguous specialisation. Each agent gets one job, one input
              contract, one output artifact. They argue with each other via files on disk. The
              orchestrator is just a traffic cop — it never does design work itself.
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: C.nearBlack }}>
              By V6, the failure modes had inverted. Instead of "the output is generic," the
              failure became "agent A blocks because agent B hasn't written its artifact yet."
              That's a fixable class of problem. AI-generic was not.
            </p>
          </div>
        </div>

        {/* Gaps panel */}
        <div
          className="rounded-[16px] p-6 md:p-8"
          style={{ background: C.warmSand }}
        >
          <p
            className="uppercase mb-2"
            style={{
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.4px',
              color: C.terracotta,
            }}
          >
            The gaps I found in other tools
          </p>
          <H3 size={25}>Why a generic agent couldn't carry this.</H3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mt-2">
            {GAPS.map((g) => (
              <li key={g.gap} className="flex gap-3 items-start">
                <span
                  style={{
                    color: C.terracotta,
                    marginTop: 6,
                    flexShrink: 0,
                    fontSize: 10,
                  }}
                >
                  ◆
                </span>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: C.nearBlack,
                  }}
                >
                  <strong>{g.gap}</strong> {g.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14">
          <ImgPlaceholder
            aspect="aspect-[16/6]"
            label='Evolution mosaic — seven small "dashboard preview" tiles in a row, V0 on the left, V6 on the right. V0–V2 tiles show the AI-generic cliché (purple gradient, rounded cards, sketchy lightbulb). V3–V4 show increasing editorial restraint. V5–V6 show tabular-num metrics, hairline borders, warm neutrals. Parchment background throughout; no real UI — purely gestural.'
          />
        </div>
      </Section>

      {/* ── 09 · Prompts that moved the needle ────────────────────── */}
      <Section>
        <Overline>Prompts · Craft notes</Overline>
        <H3 size={32}>Three lines that changed the output more than anything else.</H3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 mb-6">
          <QuoteCard
            body="Don't describe the feature. Describe the loophole your feature exploits in the three best competitors."
            attribution={
              <>
                fed to{' '}
                <code style={{ fontFamily: MONO, color: C.terracotta }}>ux-strategist</code>
              </>
            }
          />
          <QuoteCard
            body="If your output looks like the first result a diffusion model would give for 'modern SaaS dashboard', you have failed. Redraw."
            attribution={
              <>
                fed to{' '}
                <code style={{ fontFamily: MONO, color: C.terracotta }}>aesthetic-director</code>
              </>
            }
          />
          <QuoteCard
            body="Before writing code, list every component you intend to use from the design system. If any are missing, stop. Do not invent."
            attribution={
              <>
                fed to{' '}
                <code style={{ fontFamily: MONO, color: C.terracotta }}>developer</code> — Rule 0
              </>
            }
          />
        </div>
        <p
          className="max-w-[700px]"
          style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.6, color: C.stoneGray }}
        >
          All three prompts are one-liners. They moved the output more than any structural change
          to the pipeline. Specificity, not length, is the lever.
        </p>
      </Section>

      {/* ── 10 · Harness portability (dark · short) ───────────────── */}
      <Section dark className="py-16 md:py-20">
        <div className="text-center max-w-[640px] mx-auto">
          <H3 size={28} dark>
            Optimized for Claude Code. Not locked to it.
          </H3>
          <p
            style={{ fontFamily: SANS, fontSize: 17, lineHeight: 1.6, color: C.warmSilver }}
          >
            Claude Code's skills + sub-agents + hooks are the cleanest host, so I tuned the
            frontmatter, the approval gates, and the checkpoint layout to that surface. But the
            architecture is harness-agnostic — markdown skills, role-scoped prompts,
            typed-artifact contracts, disk-as-state — and the same workflow runs on{' '}
            <strong style={{ color: C.ivory }}>
              Cursor, Windsurf, Continue, OpenCode, Cline, or a plain agent loop with tool use
            </strong>
            . Only the trigger syntax changes.
          </p>
        </div>
      </Section>

      {/* ── 11 · Example — the PRD ────────────────────────────────── */}
      <Section id="example">
        <Overline>Example run · April 2026</Overline>
        <H2>An example — from a real PRD to a running product.</H2>
        <p
          className="max-w-[720px] mb-12"
          style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: C.oliveGray }}
        >
          To make this concrete, here is one real run. A product-requirements document went in.
          Four hours later, a running, click-tested app came out. What follows is what the
          workflow did between those two states — focused on the <em>capabilities</em>, not the
          screens.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-10 items-start">
          {/* Left — PRD cover */}
          <div>
            <ImgPlaceholder
              aspect="aspect-[3/4]"
              radius={32}
              label='PRD cover — a mock document page with a parchment paper texture, a small terracotta tag "Product Requirements Document · Internal" at the top, a serif title "Strategy Builder" in the center, and a faint watermarked page number "1 / 28" in the corner. 32px radius, whisper shadow. Not the real document.'
            />
            <p
              className="mt-3 italic"
              style={{ fontFamily: SANS, fontSize: 14, color: C.stoneGray, lineHeight: 1.6 }}
            >
              Not sharing the full PRD — internal product, policies apply. The points below are
              the public framing of the problem.
            </p>
          </div>

          {/* Right — five bullets */}
          <div
            className="rounded-[16px] p-6 md:p-8"
            style={{
              background: C.ivory,
              border: `1px solid ${C.borderCream}`,
              boxShadow: 'rgba(0,0,0,0.05) 0px 4px 24px',
            }}
          >
            <H3 size={25}>What the PRD asked for, in five lines.</H3>
            <ul className="space-y-4 mt-6">
              {PRD_POINTS.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-3 items-start"
                  style={{
                    fontFamily: SANS,
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: C.nearBlack,
                  }}
                >
                  <span
                    className="shrink-0 mt-1"
                    style={{ color: C.terracotta, fontSize: 10 }}
                  >
                    ◆
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p
              className="mt-8"
              style={{ fontFamily: SANS, fontSize: 14, color: C.oliveGray, lineHeight: 1.6 }}
            >
              One brief. One design system. One command. From here, the workflow took over.
            </p>
          </div>
        </div>
      </Section>

      {/* ── 12 · What the agents did (research) ───────────────────── */}
      <Section>
        <Overline>Before a line of code · Research</Overline>
        <H2>Before it wrote a line of code, it did homework.</H2>
        <p
          className="max-w-[720px] mb-10"
          style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: C.oliveGray }}
        >
          About 60% of a typical run happens before the{' '}
          <code style={{ fontFamily: MONO, fontSize: 15, color: C.terracotta }}>developer</code>{' '}
          agent even starts. This is the part that most interests me as a designer: the workflow
          doesn't just produce a shape — it produces a position.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {RESEARCH_CARDS.map((card) => (
            <Card key={card.agent}>
              <code
                className="block mb-2"
                style={{ fontFamily: MONO, fontSize: 12, color: C.terracotta }}
              >
                {card.agent}
              </code>
              <H3 size={20}>{card.headline}</H3>
              <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: C.oliveGray }}>
                {card.body}
              </p>
            </Card>
          ))}
        </div>

        <ImgPlaceholder
          aspect="aspect-[21/9]"
          label='Research mosaic — on the left, an abstracted grid of twenty neutral tiles representing competitor pages; three of them are highlighted in terracotta. On the right, a small diagram: "20 → 1 synthesis → 3 loopholes → 3 bets" rendered as connected nodes, each step progressively distilling. Warm palette only, no real logos, no real screenshots.'
        />

        {/* Pull quote */}
        <div
          className="py-12 md:py-14 text-center max-w-[800px] mx-auto mt-16"
          style={{
            borderTop: `1px solid ${C.borderWarm}`,
            borderBottom: `1px solid ${C.borderWarm}`,
          }}
        >
          <p
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(20px, 2.4vw, 22px)',
              lineHeight: 1.4,
              color: C.terracotta,
            }}
          >
            “The workflow doesn't just produce a shape. It produces a position.”
          </p>
        </div>
      </Section>

      {/* ── 13 · Screenshots ──────────────────────────────────────── */}
      <Section>
        <Overline>Result · A running product</Overline>
        <H2>And then, a product.</H2>
        <p
          className="max-w-[620px] mb-12"
          style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: C.oliveGray }}
        >
          This is what the workflow handed back. No Figma file. No manual scaffold. Every image
          below corresponds to a real page rendered at the{' '}
          <code style={{ fontFamily: MONO, fontSize: 15 }}>localhost</code> URL the run produced.
          Everything is wired — nav, routes, dry-run, empty states, loading states, error states.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SCREENSHOTS.map((img, i) => (
            <figure key={i}>
              <div className="mb-3">
                <ImgPlaceholder aspect="aspect-[4/3]" radius={16} label={img.label} />
              </div>
              <figcaption
                style={{ fontFamily: SANS, fontSize: 14, color: C.stoneGray, lineHeight: 1.5 }}
              >
                {img.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <p
          className="mt-12 max-w-[640px]"
          style={{ fontFamily: SANS, fontSize: 14, color: C.stoneGray, lineHeight: 1.6 }}
        >
          The workflow did the boring parts — scaffolding, routing, theming, empty states,
          loading states, error states, responsive breakpoints. I did the interesting parts —
          the brief, the review, and the occasional iteration note at Gate 2.
        </p>
      </Section>

      {/* ── 14 · Takeaway + footer ────────────────────────────────── */}
      <Section>
        <Overline>Takeaway</Overline>
        <H2>What I actually got out of this.</H2>
        <div className="max-w-[680px] space-y-5 mb-16">
          <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: C.nearBlack }}>
            The first product it built wasn't my final product. That's not the point. The point
            is that by the end of day one, I had a real, clickable, in-design-system prototype I
            could poke at, show to stakeholders, break, and reshape.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: C.nearBlack }}>
            Figma would have given me polished static screens by end of week one. This gave me a
            living thing by end of hour two. The trade is obvious for early-stage work — you
            stop pre-deciding what the product is and start reacting to what it wants to be.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: C.nearBlack }}>
            About 60% of the runtime goes to discovery and research. What comes back at Gate 2
            isn't just "here's a design" — it's "here are three competitors, here's the gap,
            here's the bet this product should make." I've started running the workflow in{' '}
            <code style={{ fontFamily: MONO, fontSize: 15 }}>--UXR</code> mode just for the
            research, with no build at all.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: C.nearBlack }}>
            Figma is still where I go for polish. But "the first lap" is a different skill now,
            and this workflow is the partner that got me there.
          </p>
        </div>

        <div
          className="py-14 md:py-16 text-center max-w-[680px] mx-auto"
          style={{
            borderTop: `1px solid ${C.borderWarm}`,
            borderBottom: `1px solid ${C.borderWarm}`,
          }}
        >
          <p
            style={{
              fontFamily: SERIF,
              fontWeight: 500,
              fontSize: 'clamp(22px, 3vw, 32px)',
              lineHeight: 1.3,
              color: C.terracotta,
            }}
          >
            “The first artifact of any new product should be something you can click, not
            something you can scroll through.”
          </p>
        </div>
      </Section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer
        style={{ background: C.deepDark, borderTop: `1px solid ${C.darkSurface}` }}
        className="py-12"
      >
        <div className="max-w-[1120px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p style={{ fontFamily: SANS, fontSize: 14, color: C.warmSilver }}>
            Abhiroop Chaudhuri · Portfolio · 2026
          </p>
          <p
            className="text-center"
            style={{ fontFamily: SANS, fontSize: 12, color: C.oliveGray, lineHeight: 1.6 }}
          >
            Personal project. Optimized for Claude Code; runs on any capable agent harness.
          </p>
          <Link
            to="/#highlights"
            className="inline-flex items-center gap-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              fontFamily: SANS,
              fontSize: 14,
              color: C.warmSilver,
              outlineColor: C.focusBlue,
            }}
          >
            <ArrowLeft size={13} />
            Back to all projects
          </Link>
        </div>
      </footer>
    </div>
  );
}
