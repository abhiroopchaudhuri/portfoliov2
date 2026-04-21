# Landing Page Responsiveness — Audit & Implementation Plan

**Scope:** Make the landing page (`src/app/App.tsx`) fully responsive on mobile and tablet without altering any desktop visuals.
**Constraint (hard):** Desktop (≥ `md`, 768px+) must be **pixel-identical** to the current live version.
**Already responsive:** `MdsProjectPage.tsx`, `WcagProjectPage.tsx` — use as style reference (spacing rhythm, breakpoint conventions).

---

## 1. Research Summary

### 1.1 Stack
- React 19 + Vite + Tailwind **v4.1** (no `tailwind.config.js`; uses `@import 'tailwindcss'` in `src/styles/tailwind.css`)
- Default Tailwind breakpoints (`sm` 640, `md` 768, `lg` 1024, `xl` 1280)
- Motion (Framer), Embla carousel, Radix primitives
- `useIsMobile()` hook **already exists** at [src/app/components/ui/use-mobile.ts](src/app/components/ui/use-mobile.ts) (768px threshold) — unused
- `Sheet` and `Drawer` components **already exist** in `src/app/components/ui/` (shadcn) — unused

### 1.2 MDS / WCAG responsive conventions (to mirror)
- Centered column: `mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-14`
- Grid: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`
- Flex: `flex flex-col md:flex-row`
- Paddings scale: `px-5 sm:px-6 md:px-8`, `py-8 sm:py-10 md:py-14`
- No hover-only interactions; arrows/hints use `hidden md:flex`
- **No vertical sidebar on those pages** — pure scroll

### 1.3 Best-practice patterns we will adopt
- **Hamburger pattern:** top-right fixed button → slide-in `Sheet` drawer from right; close on item tap; active section pill derived from existing `activeSection` state (preserve IntersectionObserver logic).
- **Mobile title scaling:** replace `clamp(3.75rem, 9vw, 9rem)` with a `clamp` floor that respects 375 px viewports; reverse logic on mobile-only via Tailwind class, keep desktop clamp intact ≥ `md`.
- **Fluid typography:** use `clamp()` for headings, Tailwind responsive classes for spacing (the existing approach).
- **Safe-area:** honour iOS notch via `env(safe-area-inset-top/bottom)` on fixed hamburger / drawer.
- **Tap targets:** minimum 44×44 per WCAG 2.5.5.
- **Reduced motion:** existing `prefers-reduced-motion` block in `theme.css` stays in force.

---

## 2. Issue Inventory (Landing Page Only)

Everything below is only-on-`<md`; desktop is untouched.

### 2.1 Critical — layout blockers
| # | Where | Current | Mobile problem |
|---|---|---|---|
| L1 | [App.tsx:1999](src/app/App.tsx#L1999) `<main className="… flex …">` | Rigid horizontal flex with sidebar sibling | 320 px sidebar + content ≫ 375 px viewport → content off-screen |
| L2 | [App.tsx:2044](src/app/App.tsx#L2044) `<aside className="w-[320px] … py-16 px-16">` | Always rendered at 320 px | Consumes entire mobile width; nothing else visible |
| L3 | [App.tsx:2091](src/app/App.tsx#L2091) `<section … pr-8 md:pr-12>` + [2093](src/app/App.tsx#L2093) `pl-8 md:pl-16` | Desktop-only padding rhythm | OK by accident, but paddings too loose on 375px and no top-padding reserved for hamburger |
| L4 | [App.tsx:31-34](src/app/App.tsx#L31-L34) `CAROUSEL_SECTION_BLEED` `-ml-8 -mr-8 … w-[calc(100%+4rem)]` | Negative-margin bleed calibrated to desktop container | Combined with mobile padding it causes horizontal overflow |

### 2.2 High — hero / typography
| # | Where | Current | Problem |
|---|---|---|---|
| H1 | [App.tsx:2135](src/app/App.tsx#L2135) | `fontSize: clamp(3.75rem, 9vw, 9rem)` | Floor **60 px** on a 375 px screen → "ABHIROOP" wraps/clips |
| H2 | [App.tsx:2156](src/app/App.tsx#L2156) | Subtitle `clamp(1rem, 1.65vw, 1.45rem)` + `flex flex-wrap` | "+ Agentic Workflow Strategist" wraps awkwardly |
| H3 | [App.tsx:2105](src/app/App.tsx#L2105) | Metrics sentence `ml-auto text-right max-w-xl` | Right-aligned long paragraph reads poorly on mobile |
| H4 | [App.tsx:2115, 2130, 2149](src/app/App.tsx#L2115) | `-ml-8 md:-ml-16` pulls title outside container | Collides with reduced mobile padding |
| H5 | [App.tsx:2095](src/app/App.tsx#L2095) Hero `<div id="home" className="min-h-screen flex flex-col justify-end …">` | `min-h-screen` + `justify-end` | On mobile, pushes hero content below fold, feels empty above |

### 2.3 High — decorative background
| # | Where | Current | Problem |
|---|---|---|---|
| B1 | [App.tsx:2004-2019](src/app/App.tsx#L2004-L2019) Radar / DataStreams / Crosshairs / Brackets | `left-[70%]`, `w-[1200px]`, `top-10 right-10` | Misaligned on mobile; brackets visible off-edge |
| B2 | [App.tsx:2012-2017](src/app/App.tsx#L2012-L2017) corner brackets `top-10 right-10 w-16 h-16` | 40 px offsets, 64 px size | Collide with hamburger button; visually cluttered on small screens |
| B3 | [App.tsx:466+ BackgroundChaseScene](src/app/App.tsx#L466) | Full-viewport canvas | Still fine, but GPU-heavy on low-end phones → already gated by perf work; leave alone |
| B4 | [App.tsx:2029](src/app/App.tsx#L2029) `<ScrollFramePlayer>` | 20% opacity fullscreen | OK on mobile; leave |

### 2.4 Medium — sections
| # | Where | Current | Problem |
|---|---|---|---|
| S1 | [App.tsx:1138](src/app/App.tsx#L1138) Embla `basis-[82%] sm:basis-[52%] lg:basis-[38%]` | 82% default | OK; but nav-row arrows `h-9 w-9` are below 44px target |
| S2 | [App.tsx:1205, 1220](src/app/App.tsx#L1205) carousel card paddings | `px-5 pb-5 pt-4 md:px-6 md:pb-6 md:pt-5` | Fine; keep |
| S3 | [App.tsx:1513](src/app/App.tsx#L1513) About `py-24` | 96 px | Too tall on mobile → `py-14 md:py-24` |
| S4 | [App.tsx:1523](src/app/App.tsx#L1523) experience card paddings | `px-6 py-9 sm:px-9 sm:py-10 md:px-12 md:py-12` | Fine |
| S5 | [App.tsx:1630, 1694](src/app/App.tsx#L1630) timeline node transforms | Hard-coded translate-x values | Break alignment when card padding shrinks |
| S6 | [App.tsx:1735](src/app/App.tsx#L1735) MyWork `py-24` + [1745](src/app/App.tsx#L1745) grid (lg only) | Grid collapses to 1 column below `lg` | Cards become full-width; thumbnail `h-[220px]` is fine |
| S7 | [App.tsx:1801](src/app/App.tsx#L1801) Certifications `py-24` | Large padding | `py-14 md:py-24` |
| S8 | [App.tsx:1814, 1829](src/app/App.tsx#L1814) cert card `md:w-[300px]` + arrow `hidden md:flex` | Arrow hidden on mobile | Replace with subtle mobile chevron / "View →" so taps are obvious |
| S9 | [App.tsx:2181-2212](src/app/App.tsx#L2181) footer | `grid-cols-1 md:grid-cols-3` already | Fine; only trim top padding on mobile |

### 2.5 Medium — hover-only affordances (touch)
| # | Where | Current | Problem |
|---|---|---|---|
| T1 | [App.tsx:438-462](src/app/App.tsx#L438-L462) NavLink | `onMouseEnter/Leave` only | No active underline on mobile (the `isActive` dotted underline still works — good) |
| T2 | `hover-glitch.css` `.exp-card:hover::before`, demon glitch | Only `:hover` | No touch equivalent — acceptable (decorative), but cert/work cards need a visible CTA on mobile |
| T3 | [App.tsx:1829](src/app/App.tsx#L1829) Certifications arrow | `hidden md:flex` | Replace with visible mobile affordance |
| T4 | Carousel card thumb zoom (`theme.css:641`) | Hover-only | Acceptable to drop on mobile |

### 2.6 Low — polish
| # | Where | Fix |
|---|---|---|
| P1 | Scroll-mt on section anchors (`scroll-mt-8`) | Increase to `scroll-mt-20` to clear fixed hamburger header on mobile |
| P2 | `overflow-x-clip` on main section | Good — keep; but also set `overflow-x-hidden` on outer `<main>` on mobile to kill any 1-px bleed |
| P3 | Tap target sizes (carousel arrows, IconLink buttons) | min 44×44 on mobile |
| P4 | Safe-area insets on hamburger / drawer | Use `pt-[env(safe-area-inset-top)]` |

---

## 3. Design: Mobile Navigation (Hamburger)

### 3.1 Goals
- Drop-in replacement for the 320 px sidebar below `md`.
- **Visible at-a-glance active section**, not only when opened.
- Feels native to the existing "tactical HUD" aesthetic (mono caps, orange `#F05D23`, dotted underline, corner brackets).
- Preserve `activeSection` state + IntersectionObserver exactly.

### 3.2 Anatomy
1. **Fixed top bar** (mobile only, `md:hidden`):
   - Left: small mono label showing **current section** in orange with dotted underline — mirrors the desktop NavLink active state. Format: `// PROJECTS` (or `HOME`, `EXPERIENCE`, etc.).
   - Right: 44×44 hamburger button; rotates to X when open; subtle corner-bracket styling matches existing brackets.
   - Glass background: `bg-black/70 backdrop-blur-md border-b border-white/10`, 56 px tall, safe-area-inset-top.
2. **Drawer (Sheet from right, `w-[min(320px,85vw)]`, full height):**
   - Re-uses same `NavLink` component and same scroll callbacks.
   - Active item has orange color + dotted underline + small `◆` bullet (reuses footer motif).
   - Bottom: same "Summon AI" button.
   - Opens/closes with Motion fade+slide; backdrop `bg-black/60 backdrop-blur-sm`.
3. **Behaviour:**
   - Tap item → scroll to section + auto-close drawer.
   - Tap outside / swipe right → close.
   - Close on route change.
   - `Esc` closes.
   - Body scroll locked while open.

### 3.3 Component placement
- New component `MobileNav` inlined in `App.tsx` (keeps the single-file convention of the landing page) — or in a separate file under `src/app/components/` if it grows. Start inline.
- Render `<aside>` only at `md:`+; render `<MobileNav>` only `<md`.
- All state (`activeSection`, `scrollToSection`) stays in `PortfolioApp`, passed as props.

---

## 4. Implementation Plan (Phased)

> Each phase is independently shippable; desktop remains untouched throughout.

### Phase 1 — Mobile nav + layout unlock
- [ ] Import `useIsMobile` (or use Tailwind `md:hidden` / `hidden md:flex` — prefer CSS-only to avoid SSR/hydration flash).
- [ ] Wrap `<aside>` with `className="hidden md:flex ..."` (was `flex`).
- [ ] Add `<MobileNav activeSection={…} onNavigate={scrollToSection} />` rendered `md:hidden`.
- [ ] Change `<main>` from `flex` to `flex-col md:flex-row` so mobile stacks naturally.
- [ ] Adjust `<section>` paddings: `pl-5 pr-5 md:pl-16 md:pr-12`, and inner `<div>` `pt-20 md:pt-0` to clear hamburger bar.
- [ ] Add `overflow-x-hidden` safeguard on `<main>`.

### Phase 2 — Hero
- [ ] Title: split into mobile-first Tailwind + desktop override — `text-[14vw] sm:text-[12vw] md:[fontSize:clamp(3.75rem,9vw,9rem)]`. Set inline style only ≥ `md`.
- [ ] Subtitle: `text-[4.5vw] sm:text-[2.5vw] md:[fontSize:clamp(1rem,1.65vw,1.45rem)]`, keep `flex-wrap`.
- [ ] Metrics sentence: `text-left md:text-right`, `max-w-full md:max-w-xl`, `ml-0 md:ml-auto`, smaller font on mobile.
- [ ] Hero container: `min-h-[85vh] md:min-h-screen` and keep `justify-end`.
- [ ] Title negative offset: `-ml-0 md:-ml-16` (was `-ml-8 md:-ml-16`).

### Phase 3 — Background layer
- [ ] Corner brackets: `hidden md:block` (or scale down & reposition: `w-10 h-10 top-6 right-6 md:w-16 md:h-16 md:top-10 md:right-10`). Pick `hidden md:block` for clarity.
- [ ] Radar / data-stream / crosshairs: `hidden md:block` wrapper (cheap GPU win on mobile too).
- [ ] ScrollFramePlayer: leave; opacity already low.

### Phase 4 — Sections
- [ ] Carousel bleed: new responsive version — `w-full md:w-[calc(100%+7rem)]`, `ml-0 md:-ml-16`, `mr-0 md:-mr-12`.
- [ ] About: `py-14 md:py-24`.
- [ ] My Work: `py-14 md:py-24`; grid already collapses correctly.
- [ ] Certifications: `py-14 md:py-24`; make arrow visible on mobile as a subtle right-aligned chevron under the card title.
- [ ] Footer: `pt-14 md:pt-24`, `gap-8 md:gap-12`.

### Phase 5 — Touch / tap targets / polish
- [ ] Carousel arrows: `min-h-11 min-w-11 md:h-9 md:w-9`.
- [ ] IconLink touch zone: already OK; verify.
- [ ] All sections `scroll-mt-20 md:scroll-mt-8`.
- [ ] Safe-area: `pt-[max(env(safe-area-inset-top),0.75rem)]` on hamburger bar; `pb-[env(safe-area-inset-bottom)]` on drawer.
- [ ] `body { overscroll-behavior-y: none; }` on mobile to prevent pull-to-refresh confusion with the inner scroll container.

### Phase 6 — QA
- [ ] Visual regression on desktop at 1440 / 1280 / 1024 — must be unchanged.
- [ ] Mobile: iPhone SE (375×667), iPhone 14 Pro (393×852), Pixel 7 (412×915), iPad portrait (768×1024).
- [ ] Check: nav drawer open/close, active section tracking, hero readable, carousel swipes, no horizontal scroll, footer visible.
- [ ] Run typecheck + build (ask user first, per project convention).

---

## 5. Open Decisions

1. **Hamburger trigger position** — top-right (proposed) vs top-left. Right is safer because the desktop sidebar is on the left; putting the hamburger right avoids implying a slide-from-left.
2. **Current-section label in the bar** — prefix with `//` (file-path aesthetic) vs `>` (terminal). Proposal: `// PROJECTS`.
3. **Nav drawer side** — right (matches button). If this feels off, we swap.
4. **Drop background effects on mobile entirely?** — proposal: hide decorative radar/stream/crosshairs/brackets on `<md`, keep `BackgroundChaseScene` canvas + vignette + noise. Saves GPU and reduces visual clutter.

If anything above is off, flag it before Phase 2 — Phase 1 alone makes the site usable on mobile.

---

## 6. Files to Touch

| File | Change |
|---|---|
| [src/app/App.tsx](src/app/App.tsx) | Main — all phase work lives here |
| [src/styles/theme.css](src/styles/theme.css) | Optional: a couple of `@media (max-width: 767px)` rules if Tailwind inline gets too verbose |
| [src/styles/hover-glitch.css](src/styles/hover-glitch.css) | Possibly scope hover effects with `@media (hover: hover)` to skip on touch |

No new files required unless `MobileNav` is extracted.
