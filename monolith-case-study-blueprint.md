# Monolith Phase 1 — Case Study Page Blueprint

> **Purpose of this document.** This is a build-brief for another AI (or engineer) to recreate the
> `/projects/monolith-phase-1` case-study page exactly as intended. Every section below specifies
> content, layout, visuals, tokens, and rationale. Treat this as a spec, not a draft.
>
> **Read-me-first rules for the implementer:**
>
> 1. **Design system.** The page must be themed using the Claude / Anthropic design grammar
>    documented in `claude-design.md` at the repo root. Parchment canvas, warm neutrals, terracotta
>    brand, serif headlines, sans UI. No cool greys anywhere. No saturated colours beyond
>    terracotta/coral. No emojis in UI copy.
> 2. **Voice.** Calm, specific, faintly literary. Short sentences. First-person where the designer
>    speaks; third-person everywhere else. Avoid hype and marketing adjectives.
> 3. **Length discipline.** The rendered page is long but not "insane." ~8–10 screens of scroll.
>    Prefer dense cards and one strong diagram per section over wordy paragraphs.
> 4. **Images.** Every image is a placeholder with descriptive copy inside a rounded warm container.
>    Do not invent real product screenshots. When the blueprint says "placeholder," render the
>    `<ImgPlaceholder>` component with the provided label.
> 5. **Do not** reference the previous version of this page. It has been deleted. Start from zero
>    and follow this blueprint.
> 6. **Do not** mention Ant Design by name anywhere in the content. Generalize as "any design
>    system" — MCP, repo, tokens, etc.
> 7. **Always state** the workflow is optimized for Claude Code but harness-portable (Cursor,
>    Windsurf, Cline, OpenCode, Continue, plain agent loop). This line must appear twice: once in
>    the hero area, once in a dedicated section.

---

## 0 · Page meta

| Key | Value |
| --- | --- |
| Route | `/projects/monolith-phase-1` |
| Page file | `src/app/pages/MonolithPhase1ProjectPage.tsx` |
| Export | `MonolithPhase1ProjectPage` (named export) |
| Lazy-import in | `src/main.tsx` (follow the existing Thrifter pattern) |
| Carousel entry | `src/imports/carousel_projects.json` (add id: 6 after Thrifter) |
| Carousel thumbnail | `public/thumbnails/monolith-phase-1-cover.svg` |
| Background on root | `#f5f4ed` (parchment) |
| Page title (tab) | Not required — the home route sets it |

### Carousel card entry (append to `projects` array)

```json
{
  "id": 6,
  "title": "Monolith Phase 1 — A workflow that designs with you",
  "details": "A 25-agent Claude Code workflow that turns a PRD and any design system into a click-tested, market-grade React app — research, competitive synthesis, UX, design, code, and five self-healing QA loops in a single run.",
  "thumbnail": "/thumbnails/monolith-phase-1-cover.svg",
  "cardUrl": "/projects/monolith-phase-1"
}
```

### Thumbnail design (SVG)

- 1200 × 800 viewBox.
- Background: parchment (`#f5f4ed`).
- Bottom-left: small-cap label "MONOLITH · PHASE 1" in warm-silver 12px letterspaced 0.5px.
- Headline (serif, 500, 64px): "A workflow that designs **with** you." — "with" in terracotta
  (`#c96442`), the rest in near-black (`#141413`).
- Right half: an abstract organic illustration — a loose, hand-drawn-feeling cluster of 25 dots
  connected by thin meandering lines, with three larger terracotta diamonds marked G1 / G2 / G3
  threaded through them. Line weight 1.5px. Subtle olive-green tint on a few connector lines for
  warmth. No icons, no logos, no gradients.
- Border radius of the image itself is handled by the carousel card; the SVG has no rounded frame.

### Routing changes

Mirror the Thrifter pattern in `src/main.tsx`:

```tsx
const MonolithPhase1ProjectPage = lazy(() =>
  import('./app/pages/MonolithPhase1ProjectPage.tsx').then((m) => ({
    default: m.MonolithPhase1ProjectPage,
  })),
);

// ...

<Route
  path="/projects/monolith-phase-1"
  element={
    <Suspense fallback={<PageFallback />}>
      <MonolithPhase1ProjectPage />
    </Suspense>
  }
/>
```

---

## 1 · Design tokens (source: `claude-design.md`)

Declare this constant at the top of the page file. **Do not** introduce any new colours. Every
colour on the page must come from this object.

```ts
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

  // error/focus (use only where noted)
  errorCrimson: '#b53333',
  focusBlue: '#3898ec',
} as const;

const SERIF = '"Playfair Display", Georgia, "Times New Roman", serif';
const SANS  = '"Inter", system-ui, -apple-system, sans-serif';
const MONO  = 'ui-monospace, SFMono-Regular, Menlo, monospace';
```

### Type scale (all headings weight 500)

| Use | Family | Size | Line height | Letter spacing |
| --- | --- | --- | --- | --- |
| Hero display | SERIF | clamp(40px, 6vw, 64px) | 1.10 | normal |
| H2 | SERIF | clamp(32px, 5vw, 52px) | 1.20 | normal |
| H3 | SERIF | 28–32px | 1.25 | normal |
| Card title | SERIF | 20–25px | 1.25 | normal |
| Body serif | SERIF | 17px | 1.60 | normal |
| Body sans | SANS | 16–17px | 1.60 | normal |
| Small body | SANS | 14px | 1.60 | normal |
| Caption | SANS | 13px | 1.50 | normal |
| Overline | SANS | 10px, uppercase, 500 | 1.60 | 0.5px |
| Code inline | MONO | 14–15px | 1.6 | -0.32px |

### Radii

- 8px — small buttons, chips.
- 12px — primary buttons, inputs.
- 16px — cards.
- 24px — featured surfaces, media.
- 32px — hero media, very large containers.

### Shadows

- Ring shadow (interactive): `0 0 0 1px #d1cfc5` (warm) on light, `0 0 0 1px #3d3d3a` on dark.
- Whisper lift (cards): `rgba(0,0,0,0.05) 0px 4px 24px`.
- Nav scrolled: `0 1px 0 0 #f0eee6`.
- No coloured drop shadows. No cool-grey shadows.

### Spacing

8-pt grid. Use 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128. Section vertical padding is
`py-24 md:py-32`. Max content width 1120px, gutter 24px.

---

## 2 · Shared primitives (define once, reuse)

These components live at the top of the page file. Build them first; every section reuses them.

### 2.1 `<Section dark? id? className?>`

A full-width band that swaps Parchment / Near-Black based on `dark`. Children clipped to a
1120px container with `px-6`.

### 2.2 `<Overline dark?>`

Uppercase 10px sans, weight 500, letter-spacing 0.5px, stone-gray (or warm-silver on dark).
Renders a short tag line above headings, e.g. "A workflow case study · April 2026".

### 2.3 `<H2 dark?>` and `<H3>`

Serif 500. H2 uses the clamp size above, H3 is 28–32px. Default colour: near-black on light,
ivory on dark.

### 2.4 `<Card>`

- Background: ivory.
- Border: 1px solid border-cream.
- Radius: 16.
- Shadow: whisper.
- Padding: 24 (p-6).

### 2.5 `<StatCard number label>`

Ivory card with whisper shadow. Number rendered serif 500 at 52px in terracotta. Label 14px sans
in olive-gray. Use tabular-nums on the number.

### 2.6 `<ImgPlaceholder label aspect? dark?>`

A warm-sand (or dark-surface) rectangle with a 1px warm border and 24px radius. Inside, centered:

- Line 1 (overline): "PLACEHOLDER" — letter-spaced 0.4em, stone-gray.
- Line 2: the `label` prop — 13px sans, olive-gray, max-width ~560px, center-aligned.

Aspect ratio is a Tailwind class (`aspect-[16/9]`, `aspect-[3/4]`, etc.) — default 16/9.

### 2.7 `<Quote body attribution>`

Used for pull-quotes inside the "Prompts that moved the needle" section and elsewhere.
Warm-sand background, 16px radius, 24px padding, serif 500 18px body, 12px sans stone-gray
attribution.

### 2.8 `<StickyNav>`

72px tall. Background shifts from `rgba(245,244,237,0.7)` to `rgba(245,244,237,0.97)` between
scrollY 0 → 80. On scroll ≥80, adds a `0 1px 0 #f0eee6` bottom hairline. Left: wordmark
"Abhiroop" in serif 500 20px near-black. Right: a warm-sand pill button linking to `/#highlights`
with the text "All projects" and a left-chevron icon. Follow the existing `StickyNav` style used
in `MdsProjectPage.tsx`.

---

## 3 · Page structure (top to bottom)

There are **14 sections**. Alternate background treatment is tuned so dark bands land at moments
of emphasis (pipeline, self-heal loops, harness portability, close). Everything else is on
parchment with the occasional warm-sand/ivory card.

| # | Section | Bg | Purpose |
| --- | --- | --- | --- |
| 01 | Hero | Parchment | Orient the reader in 3 breaths |
| 02 | TL;DR stat strip | Parchment | Numerical anchor |
| 03 | Why I built this (designer angle) | Parchment | The emotional pitch; first-person |
| 04 | The pipeline | **Dark** | One canonical diagram |
| 05 | 25-agent roster | Parchment | Detailed grid — every agent, what it writes |
| 06 | Three-layer architecture (skill / rules / scripts) | Parchment | Plumbing explainer |
| 07 | Self-healing QA loops | **Dark** | Quality assurance story |
| 08 | How I thought about it (V0 → V6) | Parchment | Process, ideation, problem-solving |
| 09 | Prompts that moved the needle | Parchment | Three pull-quotes |
| 10 | Harness-agnostic note | **Dark** (short band) | Explicit portability statement |
| 11 | Example — the PRD | Parchment | PRD cover + 5 public points |
| 12 | What the agents actually did | Parchment | Research-first focus — capabilities in prose |
| 13 | Product output (screenshots) | Parchment | Six image placeholders, one caption each |
| 14 | Designer's takeaway + pull quote + footer | Parchment → **Dark footer** | Close |

Every section begins with an `<Overline>` then an `<H2>`. Keep the cadence consistent.

---

## 4 · Section-by-section build spec

### Section 01 — Hero

**Top padding:** `pt-40 md:pt-48` (leave room beneath sticky nav). Bottom padding: `pb-24`.

**Overline:** `A WORKFLOW CASE STUDY · APRIL 2026`

**H1 (serif 500, clamp 40–64px, line-height 1.10, max-width 820px):**

> Monolith — Phase 1<br/>
> <span style="color: oliveGray">A workflow that designs **with** you, not for you.</span>

(Line 2 in olive-gray. The word "with" in terracotta. Line break after the em-dashed title.)

**Body (sans 20px, line-height 1.60, olive-gray, max-width 720px, mb-10):**

> Feed it a one-line brief or a PRD, point it at any design system, and it runs a twenty-five-role
> product organization — market research, competitive synthesis, UX strategy, design critique,
> engineering specs, code, five self-healing QA loops — and hands back a click-tested,
> market-grade React app on `localhost`.

**Tag line (small sans 14px, stone-gray, mb-6):**

> Optimized for Claude Code. Runs on any capable agent harness — Cursor, Cline, Windsurf,
> OpenCode, Continue, plain tool-use loops.

**Buttons row (flex wrap, gap-3, mb-14):**

- Primary — terracotta fill, ivory text, 12px radius, label "See the pipeline" — links to `#pipeline`.
- Secondary — warm-sand fill, charcoal-warm text, 8px radius, warm ring shadow, label
  "Jump to the example run" — links to `#example`.

**Hero visual (below buttons):**

`<ImgPlaceholder aspect="aspect-[16/7]" />` with label:

> Hero illustration — a loose, hand-drawn-feeling organic cluster of 25 small agent nodes
> connected by thin meandering lines. Threaded through the cluster are three terracotta diamonds
> labelled G1 / G2 / G3, and five dashed coral self-heal arcs looping back into the build stage.
> Parchment canvas. No icons, no logos, no gradients.

---

### Section 02 — TL;DR stat strip

Six `<StatCard>` items in a `grid-cols-2 md:grid-cols-3 gap-4`. Use the **exact** numbers below
(they are verified from the workflow):

| Number | Label |
| --- | --- |
| 25 | specialized agents (24 role agents + orchestrator) |
| 26 | enforceable rules |
| 14 | TypeScript scripts doing the heavy lifting |
| 5  | self-healing QA loops, up to 5 retries each |
| 3  | human approval gates (G1, G2, G3) |
| 9  | canonical page-level surface templates |

No section header. Let the numbers speak.

---

### Section 03 — Why I built this

**Overline:** `THE DESIGNER'S POSITION`

**H2:** `I'm a designer. I wanted to skip Figma for the first lap.`

**Body (serif 17px, line-height 1.60, near-black, max-width 680px, three paragraphs):**

> Most of my early-stage work is wasted in Figma. I rebuild the same dashboard shells, copy-paste
> the same empty states, and stall out on decisions I'd rather make in a real browser against
> real components. By the time a prototype exists, I've lost a week to pixel-pushing work that a
> design system could have done automatically.

> Monolith Phase-1 is my attempt to compress that week into an hour. Instead of a Figma file,
> the first artifact of any new product is a **running localhost app** — already built against
> the design system, already informed by twenty real competitors, already critiqued by a
> senior-designer agent and an aesthetic-director agent, already QA'd against a 25-item
> AI-generic blacklist.

> Figma still wins for polish, handoff, and stakeholder walkthroughs. But for week one —
> research, ideation, brainstorming, the moment you're supposed to be wrong quickly — the
> browser is a better canvas, and a workflow like this is a better partner than a blank file.

**Highlight block (warm-sand background, 3px terracotta left border, 16px radius, 24px padding,
max-width 680px):**

> **Why not just Figma Make, v0, Lovable, or a generic coding agent?**
>
> None of them run a real research phase. None of them enforce a design system the way a
> dedicated indexer can. None of them critique their own output against a premium-aesthetic
> rubric. And none of them treat "does this product actually win in its market" as a first-class
> gate. Monolith does all four — and it does them before writing a line of code.

**Supporting visual beneath the paragraphs:**

`<ImgPlaceholder aspect="aspect-[16/6]" />`:

> The "first-lap" chart — a horizontal timeline with two rows. Top row "Figma flow": empty
> canvas → wireframes → hi-fi screens → prototype. Bottom row "Monolith flow": brief → research →
> running app → iterate. Terracotta marker on the Monolith row at "running app," roughly at the
> position of "wireframes" on the Figma row, indicating arrival an order of magnitude earlier.

---

### Section 04 — The pipeline (dark)

**`id="pipeline"`. Background: deep-dark.**

**Overline (warm-silver):** `ONE COMMAND · SEVEN PHASES`

**H2 dark:** `One command. Twenty-five roles. One running app.`

**Body (sans 17px, warm-silver, max-width 620px):**

> The pipeline runs linearly through seven phases, gated by three human approvals (G1, G2, G3)
> and guarded by five self-healing QA loops. Disk is the source of truth: every agent hands off
> through typed JSON checkpoints, never through conversation. Weaker models can lose their place
> in a long chat; they can't lose a file.

**The diagram — `<PipelineSVG />` — inline React component.**

Render an ivory rounded-20 container with 24–32px padding and a `0 8px 32px rgba(0,0,0,0.15)`
shadow. Inside, a horizontally-scrolling SVG sized to viewBox. The diagram encodes:

- **Seven columns** left to right, one per phase:
  1. `TRIAGE` — chips: `triage`
  2. `DISCOVERY` — chips: `ds-indexer`, `guidelines-resolver`, `theming-resolver`,
     `market-researcher`, `competitive-synthesizer`
  3. `RESEARCH` — chips: `researcher`, `product-manager`, `ux-strategist`
  4. `DESIGN` — chips: `ux-architect`, `lead-designer`, `ds-extension-judge`, `design-principal`,
     `aesthetic-director`, `ux-writer`
  5. `SPECS` — chips: `engineering-manager`
  6. `BUILD` — chips: `pattern-decider`, `developer`
  7. `QA` — chips: `dev-qa`, `production-readiness-auditor`, `runtime-inspector`, `design-qa`,
     `commercial-auditor`
- **Each column** is a parchment rectangle with a warm-sand header band carrying the phase label
  (sans 8px, 600, letter-spacing 0.8px, near-black).
- **Each chip** is ivory with warm border, 5px radius, 7.5px sans olive-gray label.
- **Three terracotta diamonds** (G1, G2, G3) positioned between Discovery/Research,
  between Specs/Build, and after QA. White 8px 600 label inside each diamond. Label "SHIP"
  floats next to G3 in terracotta.
- **Five self-heal arcs** (coral, dashed 4-2, 1.5px stroke, arrow marker) loop from each of
  the five QA chips back to BUILD. Below the group: small coral 8px caption
  "↻ max 5 iterations per loop".
- **Connector spine** through the middle of all columns — 1.5px warm-border grey.

**Small caption below diagram (sans 13px, warm-silver):**

> Five self-healing loops. Max 5 iterations per gate. If a loop exhausts its budget, the
> orchestrator blocks and escalates — it never silently waives a failure.

---

### Section 05 — 25 agents, one job each

**Overline:** `A PRODUCT ORGANIZATION · STAFFED BY PROMPTS`

**H2:** `Twenty-five roles. Twenty-five artifacts. Zero overlap.`

**Intro (serif 17px, olive-gray, max-width 640px):**

> Every agent owns one role with one output. They don't overlap — the rule is explicit, and the
> orchestrator refuses work that duplicates a sibling. This is what stops "agent goo" from
> happening: every node has a job title, an input contract, and a single artifact it is
> responsible for.

**Grid** — `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`, each an `<Card>`.

Each card renders:

- Monospace name in terracotta (13px).
- Overline-style role in stone-gray (10px, 0.3px tracking, uppercase).
- One-line artifact description in olive-gray (13px, line-height 1.5), prefixed with `→ `.

**All 25 agent cards — use this exact roster:**

| name | role | output |
| --- | --- | --- |
| `orchestrator` | Project conductor | Run state, gate control, writes.log, DELIVERY.md |
| `triage` | Intake + input classifier | `input-manifest.json` |
| `ds-indexer` | Design-system cataloguer | `component-index.json`, `tokens.json`, `icons.json` |
| `guidelines-resolver` | Guideline normalizer | Seven normalized guideline JSON docs |
| `theming-resolver` | Theme normalizer + themeability classifier | `theme-spec.json`, `themeability-report.md` |
| `market-researcher` | Market + competitive research | `docs/market-research.md` |
| `competitive-synthesizer` | Competitive synthesis analyst | `docs/competitive-synthesis.md` |
| `researcher` | User-research synthesis | `docs/research.md` with Gap Inferences |
| `product-manager` | PM with commercial lens | `docs/prd.md` |
| `ux-strategist` | Differentiation strategist | `docs/differentiation-map.md` (3–5 bets) |
| `ux-architect` | IA + flow architect | `docs/information_architecture.md`, `user_flow.md` |
| `lead-designer` | Lead designer | `docs/design_decisions.md`, `best_practices.md` |
| `ds-extension-judge` | DS-extension gatekeeper (5-test gate) | `docs/ds-extensions/*.md` rulings |
| `design-principal` | Senior-designer critic | `docs/design-principal-critique.md` |
| `aesthetic-director` | Premium-visual gate | `docs/aesthetic-audit.md` |
| `ux-writer` | UX writing pass | `docs/ux-writing-pass.md` |
| `engineering-manager` | Engineering manager | `docs/build_specs.md` |
| `pattern-decider` | Pattern librarian | `docs/pattern_decisions.md`, promoted patterns |
| `developer` | Software engineer | Scaffolded Vite app, `<appName>/**` |
| `dev-qa` | Static test engineer (inc. ANTI_GENERIC gate) | `qa/dev_qa_report.md` |
| `production-readiness-auditor` | Production-readiness auditor | `qa/production_readiness.md` |
| `runtime-inspector` | Runtime test engineer (4 viewports) | `qa/runtime_inspection.md` |
| `design-qa` | Design QA | `qa/design_qa_report.md` |
| `commercial-auditor` | Growth + commercial auditor | `qa/commercial-audit.md` |
| `self-healer` | Scoped patch engineer | In-place patches inside QA loops |

**Rule callout card beneath grid** (warm-sand, 16px radius, 24px padding, max-width 760px, sans 14px):

> **Rule 24 — Phase Manifest Discipline** is what keeps 25 agents from tripping over each other.
> Every agent declares `reads:` and `writes:` in its markdown frontmatter. The orchestrator
> checks those contracts before any agent runs. If two agents claim the same `writes:`, the
> pipeline refuses to start. Disk is the source of truth, not the chat log.

---

### Section 06 — The three-layer cake

**Overline:** `PLUMBING · THE THREE KINDS OF FILES`

**H2:** `Three kinds of files run the whole thing.`

**Intro (serif 17px, olive-gray, max-width 680px):**

> The separation is load-bearing: **agents** handle judgment, **rules** handle doctrine, **scripts**
> handle side effects. Nothing else is allowed to touch the filesystem. This is what lets
> twenty-five agents collaborate without fighting each other for the same pen.

**Three `<Card>` in a 3-column grid.** Each card has a small terracotta overline, an H3, a short
paragraph, and a bulleted "what's inside" list (6 items max). Use a small terracotta diamond
glyph `◆` before each bullet.

#### Card A — The Skill

- Overline: `THE SKILL`
- H3: `SKILL.md`
- Blurb: *A single markdown file with YAML frontmatter. The harness reads the frontmatter to
  know when to trigger the skill and what artifacts to expect. The file itself is an index —
  nothing interesting lives inside it.*
- List:
  - Organizational metaphor — role → agent mapping
  - When to use / when not to use
  - One-breath pipeline diagram
  - Six mode flags — `--full`, `--themeOnly`, `--planOnly`, `--lazy`, `--UXR`, `--noPRD`
  - Canonical output layout on disk
  - Pointers to all 26 rules

#### Card B — The Doctrine

- Overline: `THE DOCTRINE`
- H3: `rules/*.md — 26 files`
- Blurb: *Each rule is standalone doctrine that agents cite. They don't re-argue the same
  principles every run — they point at the rule and move on.*
- List (pick 8 high-signal rules from the 26):
  - Rule 0 — DS-First Mandate
  - Rule 9 — Production-Grade Mandate
  - Rule 10 — Self-Healing QA Loop
  - Rule 13 — Differentiation Mandate
  - Rule 19 — Premium Aesthetic Standard
  - Rule 20 — AI-Generic Anti-Patterns (25-item blacklist)
  - Rule 21 — Theming Input Normalization (3-tier)
  - Rule 23 — Checkpoint Discipline (disk as truth)

#### Card C — The Engine

- Overline: `THE ENGINE`
- H3: `scripts/*.ts — 14 files`
- Blurb: *Agents don't run code. Scripts do. Any time an agent needs to parse a tsconfig, scrape
  a URL, install a dependency, boot a dev server or take screenshots, it calls one of these.*
- List:
  - `triage-input.ts` — classify brief, emit input manifest
  - `index-ds-repo.ts` / `index-ds-mcp.ts` — build DS knowledge index
  - `extract-tokens.ts` / `extract-icons.ts` — token + icon catalogue
  - `fetch-guidelines-web.ts` / `parse-guidelines-repo.ts` — guideline resolution
  - `scaffold-app.ts` — stand up a Vite app from templates
  - `validate-generated.ts` — tsc, eslint, build gate
  - `axe-run.ts` — accessibility sweep
  - `visual-smoke.ts` — 4-viewport screenshots

**Caption beneath the three cards (sans 14px, stone-gray, max-width 640px):**

> Agents can read rules, write artifacts, and request scripts. They can't invent a new rule or
> write to the filesystem directly. That boundary is the skill's most boring feature and its
> most important one.

**Diagram — `<ThreeLayerCake />` (below cards, centered, max-width 600px).**

Inline SVG. Three horizontal bars stacked with 12px gaps. For each bar: 8px radius, full-width,
58px tall. Text baseline at 24px from top of bar (serif 500 16px), subtitle at 44px from top
(sans 12px, 80% opacity).

- Top bar: **Agents (25)** — "Judgment — what to decide." Fill: terracotta. Text: ivory.
- Middle bar: **Rules (26)** — "Doctrine — what is non-negotiable." Fill: warm-sand. Text:
  near-black.
- Bottom bar: **Scripts (14)** — "Side effects — what touches the filesystem." Fill: dark-surface.
  Text: warm-silver.

---

### Section 07 — Five self-healing loops (dark)

**Dark band. Overline:** `QUALITY ASSURANCE · FIVE SIEVES`

**H2 dark:** `Five sieves. Nothing ships if it can't pass all of them.`

**Intro (sans 17px, warm-silver, max-width 720px):**

> Each QA loop runs until it's clean or it's spent its five-iteration budget. The `developer`
> agent owns the patches; the QA agents own the audits. If a loop exhausts its budget, the
> orchestrator hard-blocks and escalates — it never silently waives a failure.

**Grid — 5 cards in `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`.** Cards are ivory with a
1px dark-surface ring (`0 0 0 1px #3d3d3a`) and the whisper shadow. 24px padding, 16px radius.

Card anatomy (top to bottom):

1. Overline "LOOP 01" (stone-gray, 10px, 0.4px tracking).
2. Monospace name in terracotta (14px).
3. Body copy (sans 13px, olive-gray).
4. Iterations footer (sans 11px, stone-gray).

**The 5 loops (verbatim):**

| # | Name | Audits | Typical iterations |
| --- | --- | --- | --- |
| 01 | `dev-qa` | `tsc`, `eslint`, `build`, dev-server boot, `axe`, DS-First gate, **25-item AI-generic blacklist** | 1–2 |
| 02 | `production-readiness-auditor` | No dead buttons. No lorem. No TODOs. All routes reachable. All forms submit. Loading + empty + error states present. Nav state correct. | 2–3 |
| 03 | `runtime-inspector` | Headless-browser click-through at four viewports (375 / 768 / 1280 / 1920). Console-error scan, network-tab scan, scroll clipping, modal stacking. | 1–2 |
| 04 | `design-qa` | Premium-aesthetic rubric — typographic rhythm, spacing scale, motion curves, depth tiers, token coverage. | Usually 1 |
| 05 | `commercial-auditor` | Onboarding / conversion / retention / trust / expansion surfaces graded. Differentiators verified in the running app. Verdict: *ready-to-sell*, *ready-with-caveats*, or *not-ready*. | 1–2 |

**Beneath grid, a dark mini-diagram** (SVG or structured HTML, max-width 760px, centered):

Render a horizontal "iteration ribbon":

`[ QA audit ] → [ issues found? ] → yes → [ self-healer delta ] → [ developer patch ] → [ re-audit ]`

Loop the last arrow back to the start, capped at 5. Include a small terracotta escape arrow
labelled "hard block + escalate" on the "yes, still failing after 5" path.

---

### Section 08 — How I thought about it

**Overline:** `PROCESS · IDEATION · PROBLEM SOLVING`

**H2:** `The path to 25 agents started with one prompt that failed.`

Two-column layout on `lg+`, single column below: `grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12`.

#### Left column — Timeline (V0 → V6)

Vertical timeline with a 1px warm-border rail. Each entry has a 36px terracotta circle badge
with ivory 10px 600 label ("V0", "V1", …), then a two-line title (serif 500 16px) and a short
body (sans 13px, olive-gray, line-height 1.60). Stack: `space-y-6`.

**The seven entries (exact copy):**

- **V0 — "Just a skill that builds a React app."**
  One prompt, one agent. Output was a purple gradient hero, three feature cards, a pricing
  table, an empty-state with a sketchy lightbulb. Plausible, never interesting.
- **V1 — Split into research + build.**
  Two agents. The build was still generic. Research without synthesis is just a dump of open
  tabs — it doesn't change what gets drawn.
- **V2 — Add a critic.**
  Introduced `design-principal` as a senior-designer critic. First real quality gain: the
  critic found clichés the designer kept missing.
- **V3 — Competitive synthesis + differentiation mandate.**
  The moment outputs stopped looking like every other AI-generated SaaS page. Rule 13 forces
  3–5 bets, each cited against a real competitor.
- **V4 — The AI-generic anti-pattern blacklist.**
  Observed LLMs converging on the same 25 visual clichés (rounded-2xl, shadow-md, Tailwind blue,
  emoji-as-icon). Encoded them as auto-blockers. Agents self-audit before emitting UI.
- **V5 — Self-healing loops + G3 commercial audit.**
  One-shot QA wasn't enough. Loops with retry budgets, plus a commercial auditor that grades
  whether the product can actually be sold — not just rendered.
- **V6 — Checkpoint discipline, disk as truth.**
  Weaker models drifted mid-run. Moving state to `checkpoints/*.json` on disk fixed it. Chat
  became a viewport, not the source of truth.

#### Right column — Essay

Four serif paragraphs, near-black, 17px, line-height 1.60:

> The first version was a single agent that took a brief and built a React app. It always
> produced the same thing: a purple gradient hero, three feature cards, a pricing table, an
> empty-state illustration with a sketchy lightbulb. Every output was plausible. None of them
> were *interesting*.

> I kept noticing the shapes the model fell into — what I now call the AI-generic tells — and
> realised the problem wasn't model capability, it was **role ambiguity**. A single "designer"
> prompt is too broad. It has to solve research, strategy, IA, visual design, and QA
> simultaneously. So it picks the median answer for each, and the median answer is the cliché.

> The fix was unambiguous specialisation. Each agent gets one job, one input contract, one
> output artifact. They argue with each other via files on disk. The orchestrator is just a
> traffic cop — it never does design work itself.

> By V6, the failure modes had inverted. Instead of "the output is generic," the failure
> became "agent A blocks because agent B hasn't written its artifact yet." That's a fixable
> class of problem. AI-generic was not.

**Beneath the two columns (span full width), a "things other skills couldn't do" list.**

A warm-sand rounded-16 panel, 24px padding, max-width 1060px.

- Panel header (sans 12px, 0.4px tracking, uppercase, terracotta): `THE GAPS I FOUND IN OTHER
  TOOLS`
- Panel title (serif 500 25px): `Why a generic agent couldn't carry this.`
- Two-column unordered list at `sm+`, one column below. Each row: a small terracotta `◆` glyph
  then `<strong>Gap</strong> — description.` All text near-black, sans 14px, line-height 1.6.

Items (verbatim):

- **No research phase.** Generic coding agents jump to scaffolding. Monolith spends the first 60%
  of runtime on market research, competitive synthesis, and gap inference before a single
  component is chosen.
- **No design-system discipline.** Most tools accept a token file and move on. Monolith indexes
  the DS, classifies its themeability tier, runs a 5-test gate on any custom component, and
  refuses to hallucinate primitives.
- **No premium-aesthetic rubric.** Nothing audits its own output against a written standard for
  typographic rhythm, colour discipline, or anti-generic tells.
- **No commercial gate.** Nothing grades onboarding, conversion, retention, trust and expansion
  surfaces in the finished app.
- **No self-healing.** "Fix it" turns into a conversation. Monolith's loops cap retries and
  escalate instead of silently degrading.
- **No checkpointed handoff.** Weaker LLMs lose their place in long chats. Typed JSON on disk
  eliminates that class of drift.

**Visual at the end of this section:**

`<ImgPlaceholder aspect="aspect-[16/6]" />`:

> Evolution mosaic — seven small "dashboard preview" tiles in a row, V0 on the left, V6 on the
> right. V0–V2 tiles show the AI-generic cliché (purple gradient, rounded cards, sketchy
> lightbulb). V3–V4 show increasing editorial restraint. V5–V6 show tabular-num metrics,
> hairline borders, warm neutrals. Parchment background throughout; no real UI — purely
> gestural.

---

### Section 09 — The prompts that moved the needle

**Overline:** `PROMPTS · CRAFT NOTES`

**H3 (not H2 — this reads as a sub-section of 08):** `Three lines that changed the output more
than anything else.`

Three `<Quote>` cards in a 3-column grid (stacks below `md`).

1. Body: *"Don't describe the feature. Describe the loophole your feature exploits in the three
   best competitors."* — Attribution: `fed to ux-strategist`
2. Body: *"If your output looks like the first result a diffusion model would give for 'modern
   SaaS dashboard', you have failed. Redraw."* — Attribution: `fed to aesthetic-director`
3. Body: *"Before writing code, list every component you intend to use from the design system.
   If any are missing, stop. Do not invent."* — Attribution: `fed to developer — Rule 0`

**Small caption below the quotes (sans 13px, stone-gray, max-width 700px):**

> All three prompts are one-liners. They moved the output more than any structural change to
> the pipeline. Specificity, not length, is the lever.

---

### Section 10 — Harness-agnostic note (dark · short)

**Dark band, reduced vertical padding (`py-16`). Centered content, max-width 640px.**

**H3 (serif 500, 28px, ivory, centered):**

> Optimized for Claude Code. Not locked to it.

**Body (sans 17px, warm-silver, centered):**

> Claude Code's skills + sub-agents + hooks are the cleanest host, so I tuned the frontmatter,
> the approval gates, and the checkpoint layout to that surface. But the architecture is
> harness-agnostic — markdown skills, role-scoped prompts, typed-artifact contracts,
> disk-as-state — and the same workflow runs on **Cursor, Windsurf, Continue, OpenCode, Cline,
> or a plain agent loop with tool use**. Only the trigger syntax changes.

No image here; the typography is the moment.

---

### Section 11 — Example — the PRD

`id="example"`. Parchment.

**Overline:** `EXAMPLE RUN · APRIL 2026`

**H2:** `An example — from a real PRD to a running product.`

**Intro (serif 17px, olive-gray, max-width 700px):**

> To make this concrete, here is one real run. A product-requirements document went in. Four
> hours later, a running, click-tested app came out. What follows is what the workflow did
> between those two states — focused on the *capabilities*, not the screens.

**Two-column layout, `grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-10 items-start`.**

#### Left column — PRD cover

`<ImgPlaceholder aspect="aspect-[3/4]" />` with label:

> PRD cover — a mock document page with a parchment paper texture, a small terracotta tag
> "Product Requirements Document · Internal" at the top, a serif title "Strategy Builder" in
> the center, and a faint watermarked page number "1 / 28" in the corner. 32px radius, whisper
> shadow. Not the real document.

Italic caption underneath (sans 14px, stone-gray):

> Not sharing the full PRD — internal product, policies apply. The points below are the public
> framing of the problem.

#### Right column — five bullet points (ivory card)

- Surface: ivory, 16px radius, 24–32px padding, 1px border-cream, whisper shadow.
- Header: serif 500 25px, near-black — *What the PRD asked for, in five lines.*
- Bullet list with a small terracotta `◆` before each point. Sans 16px, line-height 1.60,
  near-black.

Five points (redacted, safe to publish — lifted from the public framing of the PRD, with
specific internal product names stripped):

1. Replace a manual, JSON-based configuration step with a **no-code builder** for non-technical
   admins.
2. Reduce the end-to-end setup time from **weeks to roughly one hour**.
3. Make the pipeline **transparent** — surface how many records pass through each step, with
   drill-down.
4. Add a **dry-run mode** so misconfiguration is caught before a real run.
5. Cut the long tail of support tickets caused by configuration errors — the current source of
   most incidents.

Footer line below list (sans 14px, olive-gray):

> One brief. One design system. One command. From here, the workflow took over.

---

### Section 12 — What the agents actually did (research focus)

**Overline:** `BEFORE A LINE OF CODE · RESEARCH`

**H2:** `Before it wrote a line of code, it did homework.`

**Intro (serif 17px, olive-gray, max-width 720px):**

> About 60% of a typical run happens before the `developer` agent even starts. This is the part
> that most interests me as a designer: the workflow doesn't just produce a shape — it produces
> a position.

**Four `<Card>` in `grid-cols-1 sm:grid-cols-2 gap-6`.** Each card: monospace agent name
(terracotta 12px), H3 serif 500 20px headline, body sans 14px line-height 1.60 olive-gray.

**The four research moments (exact copy):**

- **`market-researcher` — Surveyed twenty comparable products.**
  Pulled onboarding flows, pricing pages, and feature breakdowns across the relevant space.
  Catalogued three recurring loopholes competitors kept leaving open — all three later shaped
  the product's differentiators.
- **`competitive-synthesizer` — Collapsed 20 products into one page.**
  Not a table dump. A synthesis: "Who owns transparency, who owns speed, who owns trust." Every
  claim cites a specific competitor. No vibes, no hedging.
- **`researcher` + `product-manager` — Gap Inferences, filling the silences.**
  Cross-referenced the brief against the synthesis and the design system. Wherever the brief
  was silent but the market had already solved the question, a *Gap Inference* was inserted —
  flagged explicitly so I could accept or reject it at Gate 2.
- **`ux-strategist` — The differentiation map, three to five bets.**
  Each bet names a competitor, cites evidence, scores its weight. This document is what the
  `commercial-auditor` later grades the finished app against. The loop is closed.

**Below the cards, a wide research-mosaic illustration:**

`<ImgPlaceholder aspect="aspect-[21/9]" />` with label:

> Research mosaic — on the left, an abstracted grid of twenty neutral tiles representing
> competitor pages; three of them are highlighted in terracotta. On the right, a small diagram:
> "20 → 1 synthesis → 3 loopholes → 3 bets" rendered as connected nodes, each step
> progressively distilling. Warm palette only, no real logos, no real screenshots.

**Pull quote (spans full width, max-width 800px, centered, italic serif 500 22px terracotta,
1px warm borders top and bottom, 48px vertical padding):**

> "The workflow doesn't just produce a shape. It produces a position."

---

### Section 13 — The output

**Overline:** `RESULT · A RUNNING PRODUCT`

**H2:** `And then, a product.`

**Intro (serif 17px, olive-gray, max-width 620px):**

> This is what the workflow handed back. No Figma file. No manual scaffold. Every image below
> corresponds to a real page rendered at the `localhost` URL the run produced. Everything is
> wired — nav, routes, dry-run, empty states, loading states, error states.

**Six image placeholders in a `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`.** Each item is
a `<figure>` containing a rounded-16, 1px border-cream framed `<ImgPlaceholder aspect="aspect-[4/3]">`
and a sans-14 stone-gray `<figcaption>` beneath it.

Use these six placeholders (label / caption):

1. **Label:** Dashboard screenshot placeholder — a run-results dashboard. Header row of four
   tabular-num metric cards. Below, a table with run history and drill-down. Warm neutrals,
   terracotta accent for a single primary CTA. No lorem ipsum copy.
   **Caption:** *Run-results dashboard — per-step drop-off counts.*
2. **Label:** Pipeline-visualization placeholder — a vertical flowchart with five filter steps,
   each node showing count and percentage, drill-down affordance at the bottom of each step.
   **Caption:** *Pipeline visualization with drill-down at record level.*
3. **Label:** Dry-run modal placeholder — a large centered dialog showing projected counts
   before execution, with a "Commit" primary button and a "Back to edit" secondary.
   **Caption:** *Dry-run mode, surfaced before the first real run.*
4. **Label:** Form-first editor placeholder — a no-code builder with a form on the left and a
   live preview panel on the right. Everything labelled in plain English; no JSON in sight.
   **Caption:** *Form-first editor — no JSON.*
5. **Label:** Rationale-card placeholder — a per-record card answering "why was this
   assigned?" with three bullet-point reasons and a small "was this right?" feedback control.
   **Caption:** *Assignment rationale, generated per record.*
6. **Label:** First-run empty state placeholder — not a sketchy lightbulb. A small diagram of
   the pipeline with a one-sentence description, and a single terracotta "Create your first
   strategy" CTA.
   **Caption:** *First-run empty state — not a sketchy lightbulb.*

**Below the grid (sans 14px, stone-gray, max-width 640px):**

> The workflow did the boring parts — scaffolding, routing, theming, empty states, loading
> states, error states, responsive breakpoints. I did the interesting parts — the brief, the
> review, and the occasional iteration note at Gate 2.

---

### Section 14 — Designer's takeaway + footer

**Overline:** `TAKEAWAY`

**H2:** `What I actually got out of this.`

**Four serif paragraphs, near-black, 17px, line-height 1.60, max-width 680px:**

> The first product it built wasn't my final product. That's not the point. The point is that by
> the end of day one, I had a real, clickable, in-design-system prototype I could poke at, show
> to stakeholders, break, and reshape.

> Figma would have given me polished static screens by end of week one. This gave me a living
> thing by end of hour two. The trade is obvious for early-stage work — you stop pre-deciding
> what the product is and start reacting to what it wants to be.

> About 60% of the runtime goes to discovery and research. What comes back at Gate 2 isn't just
> "here's a design" — it's "here are three competitors, here's the gap, here's the bet this
> product should make." I've started running the workflow in `--UXR` mode just for the
> research, with no build at all.

> Figma is still where I go for polish. But "the first lap" is a different skill now, and this
> workflow is the partner that got me there.

**Pull quote** (centered, max-width 680px, serif 500 clamp(22–32px), terracotta, 1px warm
borders top and bottom, 48px vertical padding):

> "The first artifact of any new product should be something you can click, not something you
> can scroll through."

**Footer** — dark background, 1px top border in dark-surface, 48px padding.
Max-width 1120px, 24px gutter. Flex row (stacked on mobile), space-between.

- Left: `Abhiroop Chaudhuri · Portfolio · 2026` (sans 14px, warm-silver).
- Center: `Personal project. Optimized for Claude Code; runs on any capable agent harness.`
  (sans 12px, `#5e5d59`, centered).
- Right: a back-link "← Back to all projects" → `/#highlights` (sans 14px, warm-silver).

---

## 5 · Inline diagram components — implementation notes

### 5.1 `<PipelineSVG />`

Follow the spec in section 04 above. Concrete numbers:

- `COL_W = 132`, `COL_GAP = 16`, `CHIP_H = 22`, `CHIP_GAP = 6`, `HEADER_H = 28`, `PAD = 10`.
- `maxAgents` across columns = 6 (design phase). Column height = `HEADER_H + 2·PAD + maxAgents ·
  (CHIP_H + CHIP_GAP)`.
- Diamond size: 24×24. Stroke: none. Fill: terracotta. Label: ivory sans 8px 600.
- Self-heal arcs: quadratic Béziers from QA column centres back to BUILD column centre,
  dropping ~50px below the column row. Stroke: coral 1.5px, dasharray `4 2`, arrow marker.
- The diagram must horizontally scroll on narrow viewports (`overflow-x-auto` on wrapper).

### 5.2 `<ThreeLayerCake />`

Follow section 06. Three 58px bars, 12px gap between. Text layout already specified above.

### 5.3 Iteration ribbon (section 07)

Can be SVG or simple flex of rounded warm-sand pills joined by small terracotta arrows. Whichever
lands tighter visually. Prefer SVG for the loop-back arrow — it reads as a process diagram
rather than a nav.

---

## 6 · Comparison table — optional / not required

The earlier version of the page had a comparison table. **Do not include one in this rebuild.**
The "what other tools couldn't do" panel in section 08 covers the same ground in prose and is a
better fit for the Claude-design voice (less marketing-y, more editorial).

If, after user review, a comparison table is requested, specify it here and the implementer can
add it between sections 09 and 10.

---

## 7 · Accessibility & responsive

- Every colour pair in the tokens meets WCAG 2.2 AA for its use case (olive-gray on parchment ≥
  4.5:1 at 14px+; stone-gray only used at 13px+).
- Focus ring: 2px `#3898ec` outline with 2px offset on all interactive elements (the only cool
  colour in the system — used only for accessibility).
- All images have a descriptive `aria-label` equal to the placeholder label text.
- At < 768px: the 25-agent grid stacks into 1 column; the two-column "how I thought about it"
  stacks timeline on top, essay below; the stat strip goes 2 columns instead of 3.
- The pipeline diagram is horizontally scrollable on narrow viewports with a visible scrollbar
  and left-edge fade.
- `prefers-reduced-motion`: disable the nav background-colour transition and any decorative
  motion. The page has no autoplaying motion to begin with.

---

## 8 · Build order for the implementer

Follow this order to ship incrementally:

1. **Wire routing and carousel entry** (section 0). The card appears on the home page with a
   working link; the page itself is a stub that renders "Coming soon" on parchment.
2. **Create the thumbnail SVG** (section 0). Drop it at `public/thumbnails/monolith-phase-1-cover.svg`.
3. **Build the shared primitives** (section 2). Verify `<ImgPlaceholder>` renders correctly in
   both light and dark modes.
4. **Hero (01) → TL;DR (02) → Why (03).** First three sections are static prose; easiest
   feedback loop.
5. **Pipeline diagram (04).** This is the hardest component. Build and visually QA against
   section 04 exactly. Confirm horizontal scroll works at `320px` viewport.
6. **Agent roster (05)** — tedious but linear. Copy the table verbatim.
7. **Three-layer cake (06)** with the inline SVG.
8. **Self-healing loops (07)** with the iteration ribbon.
9. **Process / prompts (08–09)** — mostly prose and the timeline rail.
10. **Harness note (10)** — short band.
11. **Example + PRD (11)** — two-column.
12. **Research (12)** with the mosaic image.
13. **Screenshots grid (13).**
14. **Takeaway + footer (14).**

At each step, run `tsc --noEmit` to catch regressions and click-through the page at 375px,
768px, and 1440px widths.

---

## 9 · Things the implementer must NOT do

- Do not introduce any colour outside the `C` token object.
- Do not use cool-grey neutrals anywhere. Every grey must have a yellow-brown undertone.
- Do not use bold (weight 700+) on Anthropic-serif text. 500 is the ceiling.
- Do not render real product screenshots. Every image is an `<ImgPlaceholder>`.
- Do not mention Ant Design by name. Use "any design system (MCP, repo, or both)."
- Do not add a comparison table unless the user requests it on review.
- Do not truncate any agent, rule, or script list below the counts stated (25/26/14/5/3/9).
- Do not use emojis anywhere in the UI. (The `◆` diamond glyph is fine — it's typographic.)
- Do not reference the previous version of the page.
- Do not output code inside content paragraphs beyond a single backticked token (e.g. `localhost`,
  `--UXR`, `reads:`, `writes:`). Longer code goes into a styled `<code>` or is avoided entirely.

---

## 10 · Stop points for the user

After the implementer finishes section 04 (pipeline diagram), pause and confirm the diagram
reads correctly — that's the visual spine of the case study. Pause again after section 13
(screenshots) to confirm the image placeholders land in the right places with the right aspect
ratios before the final polish pass on prose.

---

## 11 · One-paragraph summary for anyone skimming this file

Build a single-page case study at `/projects/monolith-phase-1` using the Claude / Anthropic
design grammar. Parchment canvas, warm neutrals, terracotta brand, serif headlines, sans UI.
Fourteen sections top to bottom, with dark bands at sections 04, 07 and 10. The subject is a
25-agent, 26-rule, 14-script Claude Code skill called Monolith Phase 1 — a workflow that takes
a PRD plus any design system and produces a click-tested, market-grade React app. Emphasise the
designer angle ("skip Figma for the first lap"), the research-first nature of the workflow, the
five self-healing QA loops, the three approval gates, and the fact that the workflow is
optimized for Claude Code but harness-portable. Use image placeholders everywhere; do not
fabricate screenshots. Include a redacted five-line summary of an example PRD and explicitly
state the full PRD isn't shared due to policies. Pull-quote the designer twice. Close with a
warm-dark footer.

> **End of blueprint. When in doubt, favour restraint over embellishment. The Claude design
> voice is a quiet one.**
