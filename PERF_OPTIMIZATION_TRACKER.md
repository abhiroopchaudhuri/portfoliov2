# Portfolio Performance Optimization Tracker

> **Goal:** keep every visual, animation, and interaction **pixel-identical** to today, but make the site feel instant on first paint and buttery-smooth during scroll. No user-visible regressions allowed.

> **Ground rules for the implementer**
> - Do not change layout, copy, colours, easing curves, durations, or component composition.
> - Treat this as a swap-the-engine job: replace implementations, keep outputs identical.
> - Verify each phase visually before moving on. A fix that "feels" faster but changes the look fails acceptance.

---

## 0. Executive summary

Three observable symptoms; each maps to a concrete set of root causes:

| # | Symptom user reported | Primary root cause | Secondary contributors |
|---|---|---|---|
| A | Hero scroll-frame sequence is choppy during first ~5 s and not perfectly smooth afterwards | Canvas redraws depend on network-loaded `<img>` decodes; preload window is tiny (±20), fetched on-the-fly, no HTTP caching, no prefetch hints | Heavy CSS `filter` (grayscale+sepia+hue-rotate+saturate) applied to the whole canvas every frame; no scroll smoothing; frames are ~150 KB × 300 = **46 MB** |
| B | Experience / "ops log" timeline feels laggy to load | `box-shadow` keyframe animation on every `.exp-node` (layout-unsafe property); `whileInView` on every row + staggered delays; no content-visibility; re-renders during scroll because several ancestor components update state on scroll | Large initial React tree rendered eagerly (no code-splitting, no route-based lazy load of project subpages) |
| C | Orange flashes over the landing cards when scrolling up toward hero | `.hover-demonic-overlay` runs `demon-scanline-flash` with `steps(1)` + `mix-blend-mode: overlay / hard-light / color-burn`. Momentum scroll on trackpad/touch fires `:hover` on cards in mid-flight → animation begins → steps(1) jumps straight to an orange keyframe → hover drops → animation resets. Looks like a flash. | Huge chained `filter:` stack in `demon-glitch-anim` paints the whole card area on CPU |

Secondary issues discovered that also hurt the overall smoothness: 8 always-running `DataStream` intervals, 3 continuously rotating 1200×1200 `RadarRings`, 7 `GlitchStatNumber` instances each with multiple RAFs + setTimeouts, `useScroll`+`useTransform` animating `background-position` (not compositable), no route splitting, 46 MB of frames shipped to every visitor, 20 MB of `_originals/` backups still in `public/` and therefore in `dist/`.

Nothing in this document asks to remove a visual — only to change **how** it is executed.

---

## 1. Inventory & measurements to capture first

Before touching any code, capture a baseline so every later change has a number to beat. Run each in Chrome with throttling set to "Fast 3G + 4× CPU slowdown" unless noted.

- [ ] **Lighthouse (mobile, cold cache):** LCP, TBT, CLS, Speed Index, TTI. Save the report.
- [ ] **Performance panel trace** — record from navigation to 5 s past hero scroll-through. Note: long tasks > 50 ms, scripting time, paint time, GPU raster time, layout count.
- [ ] **Network tab** — count frame requests in the first 3 s, total transfer before hero is interactive, whether frames come from cache on reload.
- [ ] **Coverage panel** — unused JS/CSS bytes on the main bundle.
- [ ] **FPS meter (rendering tab)** — scroll from hero → work → certifications → back to hero; screen-record. Log drops below 55 fps and where they happen.
- [ ] **Bundle analyzer** — add `rollup-plugin-visualizer` temporarily; record top 20 modules by size.
- [ ] **Disk** — `du -sh public/*` and `du -sh dist/*` captured to the tracker.

Target after all phases land (benchmarks on an M-class laptop, Chrome, unthrottled):
- LCP ≤ 1.2 s on warm cache, ≤ 2.0 s cold
- Scroll maintains 58–60 fps through hero (scroll-frame) on a 60 Hz display, 110+ on 120 Hz
- TBT ≤ 150 ms
- First frame of hero sequence paints within 200 ms of `DOMContentLoaded`
- Zero orange flash during passive scroll

---

## 2. Issue A — Hero scroll-frame sequence (choppy, slow to load)

### 2.1 Current implementation (reference)

- File: [src/app/components/ScrollFramePlayer.tsx](src/app/components/ScrollFramePlayer.tsx)
- Config: [src/config/demo-media.ts](src/config/demo-media.ts) — 300 frames, `.webp`, `public/frames/ezgif-frame-001.webp` … `-300.webp`
- Consumer: [src/app/App.tsx:2023-2031](src/app/App.tsx#L2023-L2031) — wraps the canvas with a CSS `filter: grayscale(100%) sepia(100%) hue-rotate(350deg) saturate(300%)` and `opacity: 0.2`
- Disk: `public/frames/` = **46 MB**, `public/frames/_originals/` = **20 MB** (backup, shipped to prod)

### 2.2 Root causes, ranked by impact

1. **On mount, `preloadAround(0)` only schedules 40 images** ([ScrollFramePlayer.tsx:82](src/app/components/ScrollFramePlayer.tsx#L82)). The browser starts 40 parallel GETs on the same origin → HTTP/1.1 head-of-line blocking if server is HTTP/1, and even on HTTP/2 the disk-cache misses decode serially. For the first ~2 s, `drawFrame()` keeps hitting the `!img.complete` branch ([lines 50-54](src/app/components/ScrollFramePlayer.tsx#L50-L54)) and returns early → canvas stays on whatever frame was last drawn → user perceives stutter.
2. **The CSS `filter` chain on the canvas wrapper** ([App.tsx:2027](src/app/App.tsx#L2027)) is applied every time the canvas repaints. `grayscale` + `sepia` + `hue-rotate` + `saturate` is a 4-pass pixel shader over a full-viewport element. On integrated GPUs this alone can cap paint time at 8–12 ms/frame.
3. **No HTTP cache hints.** Vite's default is no `Cache-Control: immutable` for `public/`. Every navigation re-fetches the 46 MB. Even returning visitors pay the cost.
4. **No prefetch / no priority hint.** The browser only learns about frame URLs when React mounts the component. There is no `<link rel="preload">`, no `<link rel="prefetch">`, no `fetchpriority`.
5. **300 frames is overkill** for a 1.5-screen-tall hero. At 60 fps the user has to scroll for 5 s of *constant motion* to see them all; realistic scroll passes show maybe 60–80 frames. The extra 220 frames pay download + decode cost for nothing.
6. **Frames are stored individually.** 300 separate HTTP requests + 300 WebP header parses. A video or sprite-sheet is dramatically cheaper.
7. **`preloadAround` is 40 wide** but the scroll listener kicks it forward only when the center moves by 10 frames ([line 35](src/app/components/ScrollFramePlayer.tsx#L35)). On a fast flick the pointer can outrun the preload window.
8. **The `_originals/` backup (20 MB) lives inside `public/`**, so Vite copies it into `dist/`. It is never requested by the site, but it still inflates deploy size and crowds CDN caches.
9. **No `decode()` await** — `img.decoding = 'async'` is set, but `ctx.drawImage()` is called as soon as `complete` is true. On some browsers the first paint of a just-loaded `<img>` is slow because the decode is still in flight on a worker thread.
10. **ResizeObserver + scroll listener both redraw** but do not coalesce — a resize during active scroll can double-paint in the same frame.

### 2.3 The fix (implementation plan — all visuals preserved)

**The single biggest win is switching the backing asset from 300 individual WebP files to one of the two options below. Everything else is polish on top.**

#### Option 1 — Inline MP4/WebM + `video.currentTime` mapping (recommended)

- [ ] Re-encode the original sequence to two files: `hero.mp4` (H.264, yuv420p, high profile) and `hero.webm` (VP9). Aim for **2–4 MB total**, same visual length as today. Both muted, no audio track. Command template:
  ```
  ffmpeg -i <source> -vf "scale=1280:-2,fps=30" -c:v libx264 -crf 23 -pix_fmt yuv420p -movflags +faststart -an hero.mp4
  ffmpeg -i <source> -c:v libvpx-vp9 -crf 32 -b:v 0 -an hero.webm
  ```
- [ ] Replace `ScrollFramePlayer.tsx` internals: render a hidden `<video muted playsInline preload="auto">`, and on scroll set `video.currentTime = progress * video.duration`. Use `requestVideoFrameCallback` where available to know when the frame actually lands, and draw it to the existing canvas (so the filter stack still applies the same way). Fallback path for Safari quirks: keep video visible but off-screen, draw via `drawImage(video, …)` at RAF.
- [ ] Because the original is WebP-from-ezgif (not live video), preserve frame cadence by using `fps=30` in the re-encode so duration math stays identical.
- [ ] Delete `public/frames/` and `public/frames/_originals/` after confirming the video path works. Keep `scripts/compress-frames.mjs` and `demo-media.ts` as dead code to be removed in cleanup phase.

Why this wins: single HTTP request, adaptive seek, GPU-accelerated decode path on every modern browser, ~90 % disk saving, the "filter on top" still works identically because we blit to the same canvas.

#### Option 2 — WebP sprite-sheet + OffscreenCanvas (fallback if client rejects video)

- [ ] Concatenate all 300 frames vertically into 1 big WebP (or 3 medium ones) at output resolution 640×360. Total size target **5–7 MB** at q75, which is what the site already ships but in **one fetch**.
- [ ] Load the sheet once with `fetch` + `createImageBitmap`. Store the `ImageBitmap`. On scroll, `ctx.drawImage(bitmap, 0, frameIdx * H, W, H, dx, dy, dw, dh)`. `drawImage` with an ImageBitmap source is the single fastest path — no decode on draw, no repeat network, no 300 load events.
- [ ] Move the whole draw loop inside an `OffscreenCanvas` transferred to a Web Worker so main-thread jank from React renders cannot steal frames. Main thread only posts the `progress` value.

Either option ends the "first 5 s are choppy" problem because after the first fetch every frame is in memory and 100 % main-thread-free to display.

#### Supporting changes (apply to whichever option is chosen)

- [ ] **Downscale the source.** The canvas paints over a masked strip ~720 px tall at most. 1280×720 is plenty. Re-encode frames at that resolution, not the current ~1920-ish. (Check actual resolution with `sips -g pixelWidth -g pixelHeight public/frames/ezgif-frame-001.webp`.)
- [ ] **Bake the colour treatment into the asset.** Today the canvas is grey-sepia-shifted via live CSS filter ([App.tsx:2027](src/app/App.tsx#L2027)). Move that to a one-time ffmpeg/`sharp` pass on the source (`-vf "hue=h=-10:s=3,eq=saturation=3"` or equivalent). Result: the canvas paints raw pixels and the GPU never has to run the filter shader. Visual output identical because it's the same math applied once instead of 60 times/s.
- [ ] **Keep the `opacity: 0.2` and the horizontal mask gradient** ([App.tsx:2019-2020](src/app/App.tsx#L2019-L2020)) — those are cheap composite ops.
- [ ] **Add `rel="preload"` (or `fetchpriority="high"`)** for the video/sprite in [index.html](index.html) so the browser starts the download before React boots.
- [ ] **Serve with far-future cache headers.** Add a `vercel.json` / `_headers` / whatever the host uses, containing `Cache-Control: public, max-age=31536000, immutable` for `/frames/*` (or the video path). Fingerprint the filename (`hero.abc123.mp4`) so busting is one-line.
- [ ] **Stop using DOM `<img>` decode.** Canvas + ImageBitmap or canvas + video; never an `<img>` you wait on.
- [ ] **Coalesce scroll + resize.** Use a single `requestAnimationFrame` gate that redraws only if either the frame index OR the canvas size changed since last paint.
- [ ] **Respect `prefers-reduced-motion`.** Render the middle frame as a static image and skip the scroll binding. (The site does not currently do this; doing it is a bonus, not a regression.)

### 2.4 Things that look like fixes but aren't

- ~~Convert WebP to AVIF~~ — decode cost is higher than WebP in Chromium; for 300 frames loaded in burst this makes the jank worse. Skip.
- ~~Raise `PRELOAD_BUFFER` to 300~~ — just slams the network harder on cold load. Root cause is "many discrete requests", not "buffer size".
- ~~Use `IntersectionObserver` to defer ScrollFramePlayer until hero is near~~ — hero IS the landing section. It's always near.

### 2.5 Acceptance checklist for Issue A

- [ ] First scroll frame paints within 200 ms of navigation on warm cache, 600 ms cold.
- [ ] Scrolling the hero from top → bottom maintains ≥ 58 fps on 60 Hz.
- [ ] Total asset weight for the hero visual drops from 46 MB to ≤ 7 MB.
- [ ] Visual diff (screenshot at 5 scroll positions) vs. main branch shows no perceptible difference under a 1-px threshold.

---

## 3. Issue B — Timeline / experience log feels choppy and loads laggy

### 3.1 Current implementation (reference)

- Experience section: [src/app/App.tsx:1521-1679](src/app/App.tsx#L1521-L1679)
- Styles: [src/app/App.tsx:1880-1908](src/app/App.tsx#L1880-L1908) — `exp-node`, `exp-node-pulse`, `exp-card`

### 3.2 Root causes

1. **`box-shadow` is animated in keyframes** ([App.tsx:1881-1890](src/app/App.tsx#L1881-L1890)). `box-shadow` is *not* a compositable property — it forces a paint every keyframe step. Five nodes × 3 s loop × forever = the section is constantly repainting even when the user is looking elsewhere.
2. **`whileInView` on every card** with staggered delays (`delay: 0.08 + i * 0.12`) fans out a React re-render tree on first intersection. Delay chain keeps the section "in flux" for ~600 ms after it enters the viewport.
3. **No `content-visibility: auto`** on any of the deep sections — the browser lays out, styles, and paints all of timeline/work/certifications during initial render even though none are visible.
4. **The gradient trunk uses `scaleY`** but its parent also has `box-shadow` and a double-stop `linear-gradient` → repaints during scaling.
5. **Framer `useScroll`** listeners elsewhere (e.g. `FluidTagTitle` at [App.tsx:1252-1362](src/app/App.tsx#L1252-L1362)) fire on every scroll and cause re-renders that bubble into the timeline's nearest scheduler, starving the layout work.
6. **`perf-data-stream` text updates via `setInterval(…, 320)`** create mutation observers / React state churn during scroll. 8 streams × 3 updates/s = 24 React setState calls/s during scroll.

### 3.3 The fix

- [ ] **Replace the `box-shadow` keyframe with a stacked `::after` pseudo-element** that uses `opacity` + `transform: scale(…)` to mimic the pulse. Opacity + transform are GPU-composited → zero paint cost. Visual output identical because the pulse ring is a radial glow that can be drawn as a blurred circle scaled from 1 to 1.4 with opacity from 0.35 → 0. Keep the static shadow (non-animated) on `.exp-node` as-is for the resting glow.
- [ ] **Add `content-visibility: auto` + `contain-intrinsic-size`** to each major section wrapper (`#projects`, `#about`, `#work`, `#certifications`). This skips layout/paint work until the section is near the viewport. Must set intrinsic size to avoid CLS; measure current heights and hard-code (e.g. `contain-intrinsic-size: auto 1600px`).
- [ ] **Memoize the experience data array** and each row component (`React.memo` with cheap prop equality). Motion's `whileInView` still runs but React no longer re-mounts children on parent re-renders.
- [ ] **Replace stagger with a single group fade.** Parent gets one `whileInView` fade; children inherit. Same perceived effect because delays are < 0.6 s; removes the per-row observer work.
- [ ] **Throttle the text-shuffle intervals** to 800 ms and `Pause` them when the component is off-screen via `IntersectionObserver(… {threshold: 0.01})`.
- [ ] **Debounce `FluidTagTitle`'s `useTransform` outputs** that write to non-composited properties (see §5 for detail).
- [ ] **Move animation keyframes from inline `<style>` tags into the CSS file** (`src/styles/globals.css` or equivalent) so the style is parsed once and not re-injected per render. The timeline section currently has ~800 lines of inline `<style>{\`...\`}</style>` in [App.tsx:1815-1908](src/app/App.tsx#L1815-L1908) and similar blocks elsewhere.

### 3.4 Acceptance

- [ ] Scrolling into the timeline section does not drop frames on the recording.
- [ ] Paints per second (DevTools → Rendering → Paint flashing) shows the glow ring area going dark green (composited) instead of red.
- [ ] Lighthouse TBT improves by ≥ 30 % from baseline.

---

## 4. Issue C — Orange flashes on landing cards when scrolling up

### 4.1 Current implementation (reference)

- Styles: [src/app/App.tsx:1815-1878](src/app/App.tsx#L1815-L1878)
- Usage: [App.tsx:1725](src/app/App.tsx#L1725) (Work cards), [App.tsx:1794](src/app/App.tsx#L1794) (Certifications cards)
- The overlay: `.hover-demonic-overlay` — runs `demon-scanline-flash 4s infinite steps(1)` when the parent `.group` is `:hover`.

### 4.2 Root causes

1. **Trackpad / touchpad momentum scroll fires synthetic `pointermove` events.** As the viewport scrolls, the pointer's *document position* moves relative to the cards. A card that passes under the stationary cursor receives `:hover`, even though the user is not "hovering" intentionally. Because `steps(1)` on the keyframe animation skips smoothly-interpolated states, the first discrete step at `11%` sets `opacity: 0.5` with an orange gradient — instant flash. When the card scrolls past, hover drops, the animation is cancelled, but the paint already happened.
2. **`mix-blend-mode: overlay / hard-light / color-burn`** ([App.tsx:1843, 1848-1850, 1854-1855](src/app/App.tsx#L1843-L1855)) force the browser to isolate the card into its own rendering context and composite it against the backdrop. During scroll, that backdrop changes every frame → full re-composite on every frame the overlay is visible. That alone can shave 10–15 fps.
3. **Chained `filter:` in `demon-glitch-anim`** ([App.tsx:1818-1836](src/app/App.tsx#L1818-L1836)) — up to 5 filter functions simultaneously (contrast, sepia, hue-rotate, saturate, brightness, blur). Each is a shader pass over the card bitmap. `will-change: filter` ([App.tsx:1873](src/app/App.tsx#L1873)) promotes the card to its own layer but does not make filters free.
4. **No gating** — the effect fires any time hover resolves to true, including during page scroll on macOS Safari / trackpad where hover is unreliable.

### 4.3 The fix (visuals must stay identical)

The effect is meant to fire on **intentional hover**, not during scroll. We keep the animation; we gate it.

- [ ] **Disable the overlay during active scroll.** On the scroll container, toggle a `data-scrolling="1"` attribute on scroll, clear it 120 ms after the last scroll event. In CSS:
  ```css
  [data-scrolling="1"] .group:hover .hover-demonic-overlay,
  [data-scrolling="1"] .group:hover .image-scale-base { animation: none; }
  ```
  User is *scrolling*, not *hovering*. No visual regression because no one does glitch-hover while scrolling.
- [ ] **Require pointer movement to arm the hover.** Add a tiny JS helper: on `pointerenter` record `clientX/Y`; only add a `.hover-armed` class once `pointermove` fires with ≥ 2 px deviation. CSS uses `.group.hover-armed:hover .hover-demonic-overlay { animation: … }`. This means scroll-induced "pass-through hover" never arms.
- [ ] **Replace `steps(1)` with `ease-out` on the opacity keyframes** where the look does not depend on hard snap. Where hard snap *is* the intended look (glitch moments), keep `steps(1)` but shorten the keyframe duty cycle so the first flash can't land the moment the animation starts (offset the start phase with `animation-delay: calc(var(--stagger) * 1ms)` so two cards never flash in the same frame).
- [ ] **Drop `mix-blend-mode` for the overlay and bake the final colour instead.** `overlay` + `hard-light` over a dark card evaluates to roughly the same RGB as a straight alpha-blended layer at `rgba(240, 93, 35, 0.35)` plus a scanline gradient — visually indistinguishable at this opacity, massively cheaper. Spot-check in a diff tool; if the delta is > 2 %, keep blend-mode but apply `isolation: isolate` to the nearest ancestor so isolation happens once not per frame.
- [ ] **Flatten the filter chain.** Pre-render the "glitched" look as a single SVG `filter` element referenced by `filter: url(#demon-glitch)`. SVG filters are parsed once and the browser can lift them to GPU. Same visual, one paint pass.
- [ ] **Respect `prefers-reduced-motion`** — disable the glitch animation entirely.

### 4.4 Acceptance

- [ ] Slow trackpad scroll from work section → hero shows **zero** orange flashes over cards.
- [ ] Hover with pointer held still, then move over card → animation plays identical to current.
- [ ] Recording frame times across the cards section shows no 16+ ms paints during scroll.

---

## 5. Secondary issues (contribute to the overall feel)

Each of these is smaller individually but they add up to "not smooth". Fix after A/B/C land.

### 5.1 Always-on background decoration

- **`RadarRings`** ([App.tsx:85-100](src/app/App.tsx#L85-L100)) — three 1200×1200 rotating layers with `opacity: 0.2`. Even with `will-change: transform`, three simultaneous compositor layers of that size cost real GPU memory (≈ 4 × 1200²  × 3 = 17 MB VRAM).
  - [ ] Draw them once into a single SVG, rotate the SVG's `<g>` element instead of three DOM elements. Or bake into a single PNG/SVG and rotate once.
  - [ ] Consider pausing the rotation when the hero is not in view (`IntersectionObserver`).
- **`DataStream`** ([App.tsx:103-130](src/app/App.tsx#L103-L130)) — 8 instances, each `setInterval(320)` mutating text. 
  - [ ] Keep the visual; drive the text via CSS steps + `content: attr(data-x)` if possible, or throttle interval to 800 ms and stop when off-screen.
- **`AnimatedCrosshair`** ([App.tsx:134-147](src/app/App.tsx#L134-L147)) — 5 rotating SVGs.
  - [ ] Consolidate into one CSS-only rotation on a shared selector. Pause off-screen.

### 5.2 `GlitchStatNumber` ([App.tsx:213-349](src/app/App.tsx#L213-L349))

7 instances × (RAF + up to 7 `setTimeout`s) = heavy timer load.
- [ ] Hoist the glitch schedule to a single parent reducer that ticks once per frame and fans out indices to each child via context. One RAF, one timer, 7 children read from it.
- [ ] Replace `useLayoutEffect` + `getBoundingClientRect` for width measurement with a CSS `tabular-nums` + `min-width: ch` trick so the width is determined by CSS, not JS. Removes forced sync layouts.
- [ ] `React.memo` each child so they only re-render when their own value changes.

### 5.3 `FluidTagTitle` ([App.tsx:1252-1362](src/app/App.tsx#L1252-L1362))

- [ ] Remove `backgroundPositionX: bgX` animation. `background-position` paints the whole element; move the movement to a translated pseudo-element instead (`transform: translateX` is composited).
- [ ] Replace `animate={{ rotate: 360 }}` with a CSS `@keyframes rotate` declaration — Framer's animate runs on the main thread, CSS keyframes run on the compositor.

### 5.4 Carousel (Embla) — [App.tsx:956](src/app/App.tsx#L956)

- [ ] `duration: 40` is unusually short for drag; confirm with design whether this is intentional. If so, leave — but ensure the slides are `will-change: transform` only, not `will-change: transform, left, top`.

### 5.5 Build-time and shipping

- [ ] **Delete `public/frames/_originals/`** from the repo (after the hero asset swap). It's 20 MB copied into every build.
- [ ] **Route-based code splitting** — the project detail pages (MDS, WCAG etc.) are bundled into the main chunk. `React.lazy(() => import('./ProjectMDS'))` + `<Suspense fallback={…}>` per route cuts ~ 200–400 KB of JS off the initial download.
- [ ] **Drop unused Radix primitives.** `package.json` imports almost every `@radix-ui/react-*` primitive; grep the source to find which are actually used and uninstall the rest. Each is 3–10 KB.
- [ ] **Drop `@mui/material` and `@emotion/*`** if they are unused by the app (only the Make starter). Confirm first with `grep '@mui' src -r`. Could save 200 KB+.
- [ ] **Drop `react-slick`** if Embla is the carousel — having both is redundant.
- [ ] **Enable vite build options** — add `build.target: 'es2022'`, `build.cssCodeSplit: true`, and `rollupOptions.output.manualChunks` for `react-vendor`, `motion-vendor`, `radix-vendor`.
- [ ] **Add `vite-plugin-compression`** (brotli + gzip) for static hosting that doesn't auto-compress.
- [ ] **Preconnect / preload fonts** in `index.html`. Add `font-display: swap`.
- [ ] **Ship a `Cache-Control` config** (`vercel.json` / `netlify.toml` / `_headers`) marking `assets/*` immutable with 1-year TTL and `index.html` as `no-cache`.

### 5.6 Scroll engine

- [ ] Consider adding **Lenis** for one unified smooth-scroll loop that all scroll-driven components subscribe to. This avoids each component binding its own scroll listener, and gives a predictable RAF tick. Keep native scroll (not virtualised) so accessibility / keyboard navigation is unchanged.

### 5.7 Inline `<style>` blocks

- [ ] Migrate all `<style>{\`…\`}</style>` injections in [App.tsx](src/app/App.tsx) to a real CSS file. Saves parse cost on every render and lets the browser cache the stylesheet.

### 5.8 `will-change` overuse

- [ ] Audit every `will-change`. Remove from elements that are not actively animating. Each `will-change` reserves GPU memory; 10+ simultaneous declarations fragment the compositor.

---

## 6. Phased execution tracker

Work in order. Do not start a phase until the previous one's acceptance checks pass. After each phase, commit, screen-record, compare to baseline.

### Phase 0 — Baseline (no code changes)
- [ ] Capture metrics from §1 and paste them at the bottom of this file.
- [ ] Screen-record the 3 reported symptoms at 60 fps for diffing.
- [ ] Create branch `perf/phase-0-baseline` (no changes, just the metrics commit).

### Phase 1 — Hero scroll-frame swap (issue A)
- [ ] Decide Option 1 (video) vs Option 2 (sprite-sheet). Default recommendation: Option 1.
- [ ] Produce the new asset(s). Verify colour match against original frames at 5 sample positions.
- [ ] Rewrite `ScrollFramePlayer.tsx` to drive the canvas from the chosen source. Keep the component's public props identical.
- [ ] Bake colour treatment into the asset; remove the CSS `filter` on the canvas wrapper ([App.tsx:2027](src/app/App.tsx#L2027)).
- [ ] Add `<link rel="preload">` / `fetchpriority` in `index.html`.
- [ ] Add cache-control config for the asset.
- [ ] Delete `public/frames/` and `public/frames/_originals/`.
- [ ] Verify acceptance (§2.5).

### Phase 2 — Orange flash fix (issue C)
- [ ] Add `data-scrolling` gate via scroll-container listener.
- [ ] Add `hover-armed` pointer-move gate.
- [ ] Bake the blend-mode result into static colours; remove `mix-blend-mode` where safe.
- [ ] Convert filter chain to SVG filter ref OR confirm flattened alpha layers look identical in diff.
- [ ] Add `prefers-reduced-motion` guard.
- [ ] Verify acceptance (§4.4).

### Phase 3 — Timeline & section-level jank (issue B)
- [ ] Replace `box-shadow` pulse with opacity/scale pseudo-element pulse. Visual A/B test against prod.
- [ ] Add `content-visibility: auto` + `contain-intrinsic-size` to every heavy section.
- [ ] Memoize experience rows.
- [ ] Migrate inline `<style>` blocks into a CSS file.
- [ ] Verify acceptance (§3.4).

### Phase 4 — Background decorations
- [ ] Consolidate RadarRings into single SVG + single transform. Pause off-screen.
- [ ] Throttle DataStream intervals; pause off-screen.
- [ ] Consolidate crosshairs. Pause off-screen.
- [ ] Hoist GlitchStatNumber schedule to a single parent ticker.

### Phase 5 — FluidTagTitle + scroll engine
- [ ] Move `background-position` animation to translated pseudo-element.
- [ ] Move Framer `animate={{ rotate: 360 }}` to CSS keyframe.
- [ ] (Optional) Introduce Lenis as the single scroll driver.

### Phase 6 — Bundle & build
- [ ] Route-based code-splitting for project subpages.
- [ ] Remove unused deps (`@mui/*`, `@emotion/*`, `react-slick`, unused `@radix-ui/*`).
- [ ] Enable `manualChunks` and compression plugins.
- [ ] Preload/preconnect fonts.
- [ ] Verify bundle analyzer shows expected chunk shape.

### Phase 7 — Final audit
- [ ] Re-run every metric from §1. Paste final numbers below baseline for diff.
- [ ] Screen-record the same 3 symptom scenarios; attach A/B to the PR.
- [ ] Run full visual regression: 10 screenshots at set scroll positions, diff against Phase 0 baseline, accept only if delta ≤ 1 %.

---

## 7. Risk register

| Risk | Mitigation |
|---|---|
| Baked-in colour treatment looks subtly different from live CSS filter | Generate side-by-side at 3 scroll positions; iterate on ffmpeg filter graph until < 1 % pixel delta. |
| Video path fails on a specific Safari version | Keep the sprite-sheet path behind a feature detect (`'requestVideoFrameCallback' in HTMLVideoElement.prototype`). |
| Removing `mix-blend-mode` changes card look over some backgrounds | If pixel diff > 2 %, keep blend-mode but add `isolation: isolate` on a stable ancestor so isolation is created once and reused. |
| `content-visibility: auto` causes CLS | Always pair with `contain-intrinsic-size` using measured section heights. |
| Deleting `@mui/*` breaks a forgotten import | Run `tsc --noEmit` and a production build before removing from `package.json`. |
| Code splitting shows a flash on route change | Use a skeleton matching the current layout; keep the perceived flow identical. |

---

## 8. Open questions for the author

Answer these before Phase 1 kicks off. They affect how aggressive the fix can be.

- [ ] Is hosting on Vercel / Netlify / Cloudflare / self-hosted? → determines how cache headers are set.
- [ ] Is the site CDN-fronted? → determines whether a video or sprite is cheaper on bandwidth.
- [ ] Is there an analytics minimum-browser floor? → determines if `requestVideoFrameCallback` + AV1 fallback is safe.
- [ ] Is there a design spec for `prefers-reduced-motion`? → if not, I'll make the conservative choice (static middle frame, no animations).
- [ ] Is the `_originals/` backup needed elsewhere, or safe to delete?

---

## 9. Metrics log (fill in as you go)

### Baseline (Phase 0)
- LCP (mobile, 4× CPU):
- TBT:
- CLS:
- FPS during hero scroll (min / median):
- Bundle size (gzipped):
- Hero asset transfer (first 3 s):
- Disk: `public/` size:
- Disk: `dist/` size:

### After Phase 1
- (same fields)

### After Phase 3
- (same fields)

### After Phase 7 (final)
- (same fields)

---

*Last updated: 2026-04-20. Owner: Abhiroop. Scope: no visual changes. No interaction changes. Only smoothness and load time.*
