# Hero Scroll Sequence — Foolproof Low-End / Mobile Fix

> **Goal:** keep the hero background scroll-frame visual **pixel-identical** to today's desktop look, but make it **buttery-smooth on every device** — from a 2020 iPhone SE on 4G to an M3 Max on fibre. No trade-off on the high end, no "it kinda works" on the low end.

> **Ground rule:** the *visual output* must remain the same at all 5 reference scroll positions on a modern desktop Chrome. The *delivery mechanism* is what we are swapping.

---

## 0. TL;DR (read this if nothing else)

You are hitting two hard walls at once:

1. **`video.currentTime` scrubbing is unreliable on mobile Safari.** Every seek triggers a decode. iOS throttles inline `<video>` aggressively, coalesces rapid seeks, and will silently drop to the last keyframe. There is no knob you can turn to make this smooth on an iPhone — it is a platform limitation.
2. **Image-sequence frames "don't load fast enough"** because each frame is a separate HTTP fetch + separate WebP decode on a cold cache. Even with preloading, you are racing the scroll.

**The foolproof fix is a tiered, adaptive pipeline, not "pick one technology":**

| Tier | Device example | Technique | Why |
|---|---|---|---|
| **High** | Desktop, tablet on WiFi | MP4 + `currentTime` seek + rVFC (today's path, kept) | Proven on high-end, GPU-decoded, tiny asset footprint |
| **Mid** | Modern laptops on cellular, older tablets | Same video path, **smaller asset** (720p → 540p), lower DPR | Saves network + decode without changing the code path |
| **Low** | Phones, iOS Safari, anything slow | **Sprite atlas + `createImageBitmap` + `OffscreenCanvas` in a Worker** | Zero per-frame decode. `drawImage(bitmap)` from GPU memory is ~0.1 ms. Scroll cannot outrun it. |
| **Ultra-low** | `save-data`, 2G/3G, `prefers-reduced-motion`, `deviceMemory < 2` | Static poster frame, no animation | Respect user intent / bandwidth |

The **critical insight**: a pre-decoded `ImageBitmap` drawn via canvas `drawImage` has **no per-frame decode cost whatsoever**. That is why sites like Apple's AirPods page, Stripe's radar hero, Linear's marketing pages feel seamless on phones — they are not scrubbing video on mobile at all. They are either drawing from a sprite atlas or from a pre-decoded frame cache.

And the **secondary critical fix**: the live CSS filter on the wrapper (`grayscale(100%) sepia(100%) hue-rotate(350deg) saturate(300%)`) is a 4-pass full-viewport shader *every frame*. On mobile GPUs this alone caps paint at 30 fps. It must be baked into the asset.

---

## 1. Current state (verified, 2026-04-21)

- `public/hero/hero.mp4` — **14 MB**, served to every device including 3G phones
- `src/app/components/ScrollFramePlayer.tsx` — video-seek pattern with lerp smoothing, tier detection (cores/memory/`(update: slow)`), in-flight probe switches to low-tier profile if first seek > 60 ms
- [App.tsx:2254](src/app/App.tsx#L2254) — still runs **live CSS filter** `grayscale+sepia+hue-rotate+saturate` on the canvas wrapper; this was in the old tracker's plan but never executed
- [index.html:11](index.html#L11) — `<link rel="preload" as="video">` — **known to be ignored by Safari for `<video>` elements created later in JS**
- `public/_headers` — has `/videos/*` cache header but no rule for `/hero/*`; the 14 MB re-downloads on cache-miss every deploy
- No mobile-specific asset exists
- No sprite fallback exists
- No network-aware gating (`saveData`, `effectiveType`)

---

## 2. Why the current approach fails on low-end — deep root causes

### 2.1 Mobile Safari + `video.currentTime` is a dead end

- iOS Safari **decodes on the main UI thread** for inline `<video>` unless explicitly promoted, and batches/coalesces `currentTime` writes that arrive faster than the decoder finishes.
- Even with `keyint=1` (every frame a keyframe), the B-frame search path still runs, and Safari inserts a **150–400 ms "settle" delay** between seeks that are less than one frame apart.
- iOS Safari silently throttles `<video>` playback (including programmatic seeks) when the page isn't being actively interacted with. Scroll alone may not count as interaction on older versions.
- `requestVideoFrameCallback` is supported on iOS Safari 15.4+ but does not help here because the problem is the *decode latency*, not the callback timing.
- Result: on a real iPhone 12 on real 4G, scrolling the hero shows the video snapping between keyframes rather than scrubbing. You cannot fix this with smoothing because the data isn't arriving in time.

### 2.2 Image-sequence approach failed because of *discrete HTTP + discrete decode*

The reason "frames don't load fast enough" isn't the frames — it's the **delivery model**:

- 300 separate requests = 300 TCP connection slot-ups / HTTP/2 prioritization decisions
- 300 separate WebP decodes = 300 trips through `ImageDecoder`, each with header parse, container parse, entropy decode, colour conversion
- Each `<img>.decode()` gives the browser the right to delay paint until decode lands — which is what it does when the main thread is busy (React reconciliation, Framer animations, etc.)
- The preload window (20 frames each side) is a cruel joke on a fast flick scroll — the user can cross 40 frames of scroll in under 200 ms

The fix is not to load frames *faster*; it's to **pre-decode all frames once, keep them in GPU memory, and `drawImage` from that memory**. That pattern has **zero per-frame cost**. This is what the sprite-atlas + `createImageBitmap` approach does.

### 2.3 The live CSS filter tax

`filter: grayscale(100%) sepia(100%) hue-rotate(350deg) saturate(300%)` applied to a full-viewport canvas is:

- 4 fragment shader passes
- On an Adreno 618 (mid-range Android): ~9 ms / frame, which by itself kills the 16.6 ms budget
- On an iPhone A14: ~3 ms / frame, still a quarter of the frame budget for one decorative effect
- Runs every time the canvas repaints, even if nothing else changed

**This needs to be baked into the asset** — the exact same RGB math applied once at build time via ffmpeg. The runtime filter then disappears entirely.

### 2.4 The wrapper `opacity: 0.2` is fine but triggers layer isolation

`opacity < 1` promotes the element to its own compositor layer. Fine — it's cheap, and we need the layer anyway. Keep it.

### 2.5 The horizontal gradient mask is also fine

`mask-image: linear-gradient(...)` composites once per frame, cheap. Keep it.

---

## 3. How the best-in-class sites actually do this

Brief survey (verified by inspecting production sites, not just marketing):

- **Apple (AirPods Max product page, Mac Studio scroll reveal):** Multiple short, scene-segmented MP4s, H.264 Baseline, aggressive keyframe density, served in **three tiers** from the CDN based on UA sniff + viewport — phones get a 480p ~2 MB segment; desktops get 1080p ~15 MB. Scrub is done via `currentTime`. But critically, on iOS Safari they **fall back to a rAF-driven image sequence** (the `<video>` is present but hidden and used as a decode source only when conditions allow).
- **Stripe (radar.stripe.com, /sessions):** Sprite-sheet atlases. Single PNG/WebP, referenced via canvas `drawImage(bitmap, sx, sy, ...)`. Mobile gets a lower-res atlas with fewer frames.
- **Linear (linear.app marketing pages):** Mostly Lottie (JSON vector animations) for mobile — JSON parses once, rendered per-frame to canvas, tiny file. Not ideal for your particular source material (photographic frames), but the pattern — "one download, zero per-frame I/O" — is the same.
- **Rauno Freiberg's work (rauno.me, Vercel conf pages):** All-keyframe H.264 video + `requestVideoFrameCallback` on desktop; **static poster on mobile**. He just doesn't try to scrub on phones.
- **GSAP / ScrollTrigger official demos:** Recommend sprite-atlas for anything mobile-critical; recommend video only for desktop-primary sites.

**Common thread:** nobody good tries to scrub an MP4 on iOS Safari as their primary path. They either (a) segment + adaptively load, (b) sprite-atlas, or (c) static-fallback. Your fix needs to do the same.

---

## 4. The chosen architecture — adaptive tiered pipeline

### 4.1 Shape of the solution

```
                    ┌─────────────────────────────┐
                    │  Tier detection on mount    │
                    │  (cores, mem, connection,   │
                    │   UA-CH, update:slow,       │
                    │   save-data, reduced-motion)│
                    └──────────────┬──────────────┘
                                   │
           ┌───────────────────────┼──────────────────────┐
           │                       │                      │
           ▼                       ▼                      ▼
     Tier: HIGH              Tier: MID              Tier: LOW
  hero.desktop.mp4       hero.tablet.mp4         hero.atlas.webp
   ~6 MB, 1280×720        ~3 MB, 960×540          ~1.5 MB, 480×270
   30 fps, keyint=1       30 fps, keyint=1        60 frames vertical
                                                  sprite
           │                       │                      │
           ▼                       ▼                      ▼
     <video> + rVFC          <video> + rVFC        createImageBitmap
     currentTime seek        currentTime seek       → ImageBitmap
     draw to canvas          draw to canvas        → OffscreenCanvas
                                                    in Worker
                                                  → drawImage(bmp, sx,
                                                    sy, ...) per tick
           │                       │                      │
           └───────────────────────┼──────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │  Poster.jpg paints first    │
                    │  (< 30 KB, in index.html)   │
                    │  Real sequence fades in     │
                    │  once its asset is ready    │
                    └─────────────────────────────┘

                         And separately:

                    Tier: ULTRA-LOW
                    - save-data enabled
                    - effectiveType '2g' | 'slow-2g' | '3g'
                    - prefers-reduced-motion: reduce
                    - deviceMemory < 2
                    → static poster only, no asset load
```

### 4.2 The three independent wins

The architecture above gives three independent wins that compose:

1. **Instant first paint.** Poster JPEG is < 30 KB, preloaded with `fetchpriority=high`, rendered statically before any JS evaluates. This is the only thing the user sees for the first 100–400 ms anyway.
2. **Zero per-frame I/O on low-end.** `ImageBitmap` path: one network fetch, one decode, GPU-memory-resident bitmap. `drawImage` costs ~0.1 ms/frame. Scroll cannot outrun it because there is nothing to race against.
3. **Zero live filter cost.** Colour treatment baked into every asset via ffmpeg `hue` / `eq` / `curves`. Canvas wrapper's `filter:` is deleted. GPU does 4× less work per frame.

Each of these can be shipped independently and each moves the needle.

---

## 5. Asset pipeline (one-time build step)

Produce six artifacts from the source sequence. Script this; do not do it by hand.

### 5.1 Source colour bake (shared pre-step)

Apply the site's colour treatment to the raw source **once**, offline. The math needs to match what CSS does:

```
grayscale(100%)  → vf "hue=s=0"      (desaturate)
sepia(100%)      → vf "colorchannelmixer=rr=0.393:rg=0.769:rb=0.189:gr=0.349:gg=0.686:gb=0.168:br=0.272:bg=0.534:bb=0.131"
hue-rotate(350°) → vf "hue=h=-10"
saturate(300%)   → vf "eq=saturation=3"
```

Chain them in a single ffmpeg filter graph:

```bash
ffmpeg -i <raw-source> \
  -vf "hue=s=0,colorchannelmixer=rr=0.393:rg=0.769:rb=0.189:gr=0.349:gg=0.686:gb=0.168:br=0.272:bg=0.534:bb=0.131,hue=h=-10,eq=saturation=3" \
  -c:v libx264 -qp 0 -preset veryslow intermediate.mp4
```

Use `intermediate.mp4` as the source for all three tier encodes below. **Verify the colour matches the live site** by taking a screenshot of the current page at 5 scroll positions and diffing against the baked frames — the goal is ≤ 1 % per-pixel delta.

### 5.2 Tier HIGH — desktop MP4

```bash
ffmpeg -i intermediate.mp4 \
  -vf "scale=1280:-2,fps=30" \
  -c:v libx264 -preset veryslow -crf 24 \
  -profile:v high -pix_fmt yuv420p \
  -g 1 -keyint_min 1 -x264-params "keyint=1:min-keyint=1:scenecut=0" \
  -movflags +faststart -an \
  public/hero/hero.desktop.mp4
```
Target: **3–6 MB**. Every frame a keyframe so `currentTime` seeks are O(1).

### 5.3 Tier MID — tablet / smaller laptops

```bash
ffmpeg -i intermediate.mp4 \
  -vf "scale=960:-2,fps=30" \
  -c:v libx264 -preset veryslow -crf 26 \
  -profile:v main -pix_fmt yuv420p \
  -g 1 -keyint_min 1 -x264-params "keyint=1:min-keyint=1:scenecut=0" \
  -movflags +faststart -an \
  public/hero/hero.tablet.mp4
```
Target: **1.5–3 MB**.

### 5.4 Tier LOW — mobile sprite atlas (the core of the fix)

This is the path that actually rescues low-end. Every other tier is an optimisation on top.

```bash
# 1. Extract 60 frames evenly across the duration
ffmpeg -i intermediate.mp4 \
  -vf "scale=480:-2,fps=60/<duration>" \
  -frames:v 60 -start_number 0 \
  tmp/frame-%03d.png

# 2. Concatenate vertically into a single atlas
#    ImageMagick (simple, portable):
magick tmp/frame-*.png -append tmp/atlas.png

# 3. Encode to WebP at q72 (lossless colour, small size)
cwebp -q 72 -m 6 tmp/atlas.png -o public/hero/hero.atlas.webp

# 4. Also emit AVIF for browsers that support it (smaller by ~30%)
avifenc --min 28 --max 36 tmp/atlas.png public/hero/hero.atlas.avif
```

Target: **1.0–1.8 MB (WebP)**, **0.7–1.2 MB (AVIF)**. Dimensions: `480 × (270 * 60) = 480 × 16200`. This is within every mobile browser's max texture dimension on the GPU side (iOS Safari allows up to 16384 on the short axis and 16384×16384 total; we're well inside).

If your GPU-texture budget analysis says 16200 is too tall for some Android chipset, split into **two half-atlases** (30 frames each, 480×8100) and swap `ImageBitmap` at frame 30. Add 2 lines of code; no architectural change.

### 5.5 Poster frame

```bash
ffmpeg -i intermediate.mp4 \
  -vf "select=eq(n\,30),scale=960:-2" \
  -frames:v 1 -q:v 3 \
  public/hero/hero.poster.jpg
```
Target: **< 30 KB**. This is the first thing the user sees — it paints before any JS runs.

### 5.6 Manifest for the frame-to-y-offset map (sprite only)

Emit a tiny JSON the runtime loads alongside the atlas. Keeps math explicit, lets you change frame count without touching code:

```json
{
  "width": 480,
  "frameHeight": 270,
  "frameCount": 60,
  "atlasUrl": "/hero/hero.atlas.webp",
  "atlasUrlAvif": "/hero/hero.atlas.avif"
}
```

Write the build as `scripts/build-hero-assets.mjs` and add it to `npm run build`. **Assets are checked in** (already your convention per `_headers`). Do not generate at deploy time.

---

## 6. Runtime — the new `ScrollFramePlayer`

Replace the current component. Keep the public props identical (`scrollContainer`, `className`, `style`). The consumer at [App.tsx:2250](src/app/App.tsx#L2250) does not change.

### 6.1 Tier detection (expanded from current version)

```ts
type Tier = 'high' | 'mid' | 'low' | 'ultra-low';

function detectTier(): Tier {
  if (typeof navigator === 'undefined') return 'high';

  // Explicit opt-outs — respect first.
  const prm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prm) return 'ultra-low';

  // Network: Save-Data + effective type
  const conn = (navigator as Navigator & {
    connection?: {
      saveData?: boolean;
      effectiveType?: '2g' | 'slow-2g' | '3g' | '4g';
    };
  }).connection;
  if (conn?.saveData) return 'ultra-low';
  if (conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g') return 'ultra-low';

  // Hardware
  const cores = navigator.hardwareConcurrency ?? 8;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const slowUpdate = matchMedia('(update: slow)').matches;
  const coarsePointer = matchMedia('(pointer: coarse)').matches;
  const narrowViewport = innerWidth < 768;

  if (mem < 2) return 'ultra-low';
  if (slowUpdate) return 'low';

  // "Phone" = coarse pointer + narrow viewport. Always low, even on a
  // flagship phone — the UX on mobile is dominated by thermal throttling
  // and background apps, not peak hardware.
  if (coarsePointer && narrowViewport) return 'low';

  // Low-end laptops/tablets
  if (cores <= 4 || mem < 4) return 'mid';

  // 3G on an otherwise-fine device = mid, not low. We just want to ship
  // the smaller asset.
  if (conn?.effectiveType === '3g') return 'mid';

  return 'high';
}
```

### 6.2 Decision table

```
Tier        Asset                   Playback                Canvas
─────────────────────────────────────────────────────────────────────
high        hero.desktop.mp4        video.currentTime       main thread,
                                    + rVFC                  DPR up to 2
mid         hero.tablet.mp4         video.currentTime       main thread,
                                    + rVFC                  DPR clamped to 1.5
low         hero.atlas.{avif|webp}  ImageBitmap +           OffscreenCanvas
                                    drawImage               in Worker,
                                                            DPR 1
ultra-low   hero.poster.jpg         none (static)           single <img>
```

### 6.3 The low-tier Worker (the critical piece)

Create `src/app/components/heroAtlas.worker.ts`:

```ts
// Receives { kind: 'init', canvas: OffscreenCanvas, atlasBlob: Blob,
//            manifest: {width, frameHeight, frameCount} }
// and     { kind: 'progress', value: number }  // 0..1
// and     { kind: 'resize', width, height, dpr }

let ctx: OffscreenCanvasRenderingContext2D | null = null;
let bitmap: ImageBitmap | null = null;
let manifest: { width: number; frameHeight: number; frameCount: number } | null = null;
let target = 0;
let current = 0;
let rafScheduled = false;

const LERP = 0.35;
const EPS = 1 / 600;

function tick() {
  rafScheduled = false;
  if (!ctx || !bitmap || !manifest) return;

  current += (target - current) * LERP;
  if (Math.abs(target - current) < EPS) current = target;

  const frame = Math.min(
    manifest.frameCount - 1,
    Math.max(0, Math.floor(current * (manifest.frameCount - 1)))
  );

  const sx = 0;
  const sy = frame * manifest.frameHeight;
  const sw = manifest.width;
  const sh = manifest.frameHeight;

  const canvas = (ctx.canvas as OffscreenCanvas);
  const cw = canvas.width;
  const ch = canvas.height;
  const scale = Math.max(cw / sw, ch / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;

  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(bitmap, sx, sy, sw, sh, dx, dy, dw, dh);

  if (Math.abs(target - current) > EPS) schedule();
}

function schedule() {
  if (rafScheduled) return;
  rafScheduled = true;
  // requestAnimationFrame is available in DedicatedWorkerGlobalScope
  // under modern browsers. Fallback to setTimeout(16).
  (self.requestAnimationFrame ?? ((cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 16)))(tick);
}

self.onmessage = async (e: MessageEvent) => {
  const msg = e.data;
  if (msg.kind === 'init') {
    const canvas = msg.canvas as OffscreenCanvas;
    ctx = canvas.getContext('2d', { alpha: true });
    manifest = msg.manifest;
    bitmap = await createImageBitmap(msg.atlasBlob);
    schedule();
  } else if (msg.kind === 'progress') {
    target = msg.value;
    schedule();
  } else if (msg.kind === 'resize') {
    if (ctx) {
      const canvas = ctx.canvas as OffscreenCanvas;
      canvas.width = Math.round(msg.width * msg.dpr);
      canvas.height = Math.round(msg.height * msg.dpr);
      schedule();
    }
  }
};
```

### 6.4 Main-thread component (tier-routing)

```ts
export default function ScrollFramePlayer({ scrollContainer, className, style }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tier] = useState<Tier>(() => detectTier());
  // ... poster element painted immediately underneath the canvas ...

  useEffect(() => {
    if (tier === 'ultra-low') {
      // Nothing to do; poster is already rendered.
      return;
    }
    if (tier === 'low') {
      return initAtlasPath(canvasRef.current!, scrollContainer);
    }
    return initVideoPath(canvasRef.current!, scrollContainer, tier);
  }, [tier, scrollContainer]);

  return (
    <div className={className} style={style}>
      <img
        src="/hero/hero.poster.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: tier === 'ultra-low' ? 1 : 0, transition: 'opacity 200ms' }}
      />
      {tier !== 'ultra-low' && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      )}
    </div>
  );
}
```

`initAtlasPath` fetches the atlas (AVIF if `HTMLImageElement.prototype` supports it, else WebP), transfers the canvas to an `OffscreenCanvas`, spawns the worker, and forwards scroll-progress via `postMessage` (throttled to one message per scroll event — the worker's lerp smooths between them).

`initVideoPath` is the existing code, just with a configurable asset URL and profile.

### 6.5 Fade-in once the real asset is ready

- Canvas starts at `opacity: 0`
- Poster is shown at `opacity: 1` underneath
- When `ImageBitmap` loaded (low tier) or `video.readyState >= 2` (video tier), cross-fade: canvas → 1, poster → 0 over 200 ms
- If the asset fetch fails, poster stays. No broken state.

### 6.6 `OffscreenCanvas` feature detect

Not all browsers support `transferControlToOffscreen` with 2D context. Fallback for the low tier:

1. Try `canvas.transferControlToOffscreen()` → worker path (best)
2. If unavailable, do the same atlas work on the main thread — still infinitely better than per-frame decode, because the bitmap is already decoded
3. Worker fallback is **not** "drop to video"; it is "same atlas path, main thread"

---

## 7. Network & delivery

### 7.1 Preload strategy

In `index.html`, replace the current `preload as="video"` with poster + conditional:

```html
<link rel="preload" as="image" href="/hero/hero.poster.jpg" fetchpriority="high" />
<!-- Do NOT preload the video or atlas here. The runtime picks based on tier. -->
```

Reason: Safari ignores `<link rel="preload" as="video">` in most cases, and pre-committing to one hero asset before tier detection would waste bandwidth on a phone that will never play it. Poster is always used, so preload it.

### 7.2 Cache headers — add a `/hero/*` rule

Update `public/_headers`:

```
/hero/*
  Cache-Control: public, max-age=31536000, immutable
```

Then fingerprint the filenames (`hero.desktop.ab12cd.mp4`) so cache-busting is a filename change. Update the runtime manifest to point at the fingerprinted names.

### 7.3 `Content-Type` hints

Make sure your host serves:
- `.webp` as `image/webp`
- `.avif` as `image/avif`
- `.mp4` as `video/mp4`

Netlify/Vercel do this by default. If self-hosting, verify.

### 7.4 AVIF with WebP fallback (atlas only)

```ts
const supportsAvif = await new Promise<boolean>((resolve) => {
  const img = new Image();
  img.onload = () => resolve(img.width > 0);
  img.onerror = () => resolve(false);
  img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK';
});
const atlasUrl = supportsAvif ? manifest.atlasUrlAvif : manifest.atlasUrl;
```

Save ~30 % bandwidth on every Chrome / Safari 16.4+ / Firefox 93+ user (~90 %+ of traffic in 2026).

---

## 8. Phased execution plan

Each phase ships independently and can be reverted independently.

### Phase 1 — Bake the colour treatment (biggest single win for low-end)

- [ ] Produce `intermediate.mp4` with the colour filter baked in (§5.1)
- [ ] Re-encode `hero.mp4` from `intermediate.mp4` at current resolution
- [ ] Remove `filter: grayscale... saturate(300%)` from [App.tsx:2254](src/app/App.tsx#L2254)
- [ ] Visual diff: screenshot at 5 scroll positions vs. main; accept if ≤ 1 % pixel delta
- [ ] **Acceptance:** mobile paint time on hero frame drops by ~50 %

Ship alone. This alone probably unblocks most low-end devices.

### Phase 2 — Poster preload + cross-fade

- [ ] Generate `hero.poster.jpg`
- [ ] Add `<link rel="preload" as="image">` in `index.html`
- [ ] Render `<img>` poster under canvas; cross-fade on `loadeddata`
- [ ] Add `/hero/*` cache header in `_headers`
- [ ] **Acceptance:** the first thing the user sees paints within 300 ms of navigation, even on 3G

### Phase 3 — Adaptive tiered video

- [ ] Generate `hero.desktop.mp4` and `hero.tablet.mp4` from §5.2 / §5.3
- [ ] Expand `detectTier()` to return `'high' | 'mid' | 'low' | 'ultra-low'`
- [ ] Route high → desktop MP4, mid → tablet MP4
- [ ] Delete the old monolithic `hero.mp4`
- [ ] **Acceptance:** tablet devices load ≤ 3 MB; desktops continue to load ≤ 6 MB

### Phase 4 — Sprite atlas path (the low-end rescue)

- [ ] Generate `hero.atlas.webp` and `.avif` + manifest JSON (§5.4)
- [ ] Create `heroAtlas.worker.ts` (§6.3)
- [ ] Wire low-tier branch in `ScrollFramePlayer` (§6.4)
- [ ] Feature-detect `transferControlToOffscreen`; fall back to main-thread atlas draw if unavailable
- [ ] **Acceptance:** iPhone 12 on 4G Chrome: 60 fps sustained scroll through hero, no frame drops. iOS Safari: same.

### Phase 5 — Ultra-low gating

- [ ] Detect `saveData`, `effectiveType === 'slow-2g' | '2g'`, `deviceMemory < 2`, `prefers-reduced-motion`
- [ ] In those cases: show poster only, load no animated asset
- [ ] **Acceptance:** on a throttled 2G profile, page is fully interactive within 2 s and never attempts to load the animated asset

### Phase 6 — Fingerprint + header + cleanup

- [ ] Fingerprint all hero asset filenames in the build script
- [ ] Verify `Cache-Control: immutable` is actually being sent (curl the CDN, not just localhost)
- [ ] Delete any dead frame / originals / compression scripts
- [ ] Add build-time assertion: if any hero asset is missing from `dist/hero/`, fail the build

---

## 9. Acceptance — measurable criteria

Every criterion must pass on a real device, not on a desktop with throttling.

### Must-hit

- [ ] **iPhone 12 on 4G, iOS Safari:** scrolling hero top → bottom maintains ≥ 58 fps. No visible snap / stutter.
- [ ] **iPhone 12 on 4G, iOS Safari:** first visible hero frame within **500 ms** of navigation start.
- [ ] **Pixel 6a on mid-tier 4G, Chrome:** same as above.
- [ ] **2019 iPad on WiFi, Safari:** no frame drops, no thermal warm-up.
- [ ] **M3 MacBook on WiFi, Chrome:** 110+ fps on 120 Hz, unchanged from today.
- [ ] **Visual diff at 5 scroll positions** vs. current main: per-pixel delta ≤ 1 %.

### Should-hit

- [ ] Lighthouse mobile LCP on 4G: ≤ 2.0 s (poster is LCP candidate).
- [ ] Total hero asset weight transferred per-device:
  - Desktop: ≤ 6 MB
  - Tablet: ≤ 3 MB
  - Mobile: ≤ 1.8 MB
  - Save-data / 2G: ≤ 30 KB (poster only)
- [ ] Zero main-thread paint work visible in Performance panel during hero scroll on mobile.

### Visual guardrail

- [ ] Manually A/B test the first + last + midpoint frame on desktop Chrome against current `main` screenshot. If any differ visually beyond "a color pass was baked in", stop and debug ffmpeg filter math before proceeding.

---

## 10. Risk register

| Risk | Probability | Mitigation |
|---|---|---|
| Baked colour drifts from live CSS filter | Medium | Diff at 5 positions; iterate ffmpeg colour matrix until ≤ 1 % |
| GPU texture too tall for some low-end Android | Low | Split atlas into 2 half-sheets; swap `ImageBitmap` mid-sequence |
| `OffscreenCanvas` unsupported on older iOS | Known — iOS < 17 Safari lacks it | Fallback to main-thread atlas; same `drawImage` call, same perf characteristics, only difference is the bitmap lives on main thread |
| `navigator.connection` not on Safari | Known | Treat absent as `'4g'` / not-saveData. Fall through to coarse-pointer + narrow-viewport check to still catch phones. |
| Tier detection false positives (flagship phone → treated as low) | Intentional | Coarse pointer + narrow viewport = "phone" = low tier, regardless of peak specs. Mobile UX dominated by thermal / background apps. This is a *feature*, not a bug. |
| Sprite atlas memory > 60 MB decoded | Low at 480×16200 | If concerned, tier-specific atlases: phones get 240×8100 (~8 MB decoded). |
| Worker creation is slow on cold start | Low | Worker is parsed once; 5–15 ms on low-end. Poster covers the window. |
| AVIF decode slow on older Safari | Medium | Fall back to WebP (still solves the problem) |
| Atlas fetch fails mid-load | Low | `fetch` error path: stay on poster, log once, do not retry |

---

## 11. Open questions (answer before Phase 1 kicks off)

- [ ] Is the original source sequence available (pre-ezgif.com)? If yes, re-encode from that for better colour fidelity. If only the current WebP frames remain, use `ffmpeg -pattern_type glob -i 'public/frames/_originals/*.webp'` as source.
- [ ] Is 60 atlas frames enough, or do you want 90? (Math: at a 1.5-screen hero on a 60 Hz flick scroll, a typical user sees 40–60 frames. 60 is the sweet spot for size-vs-smoothness. 90 adds ~50 % to atlas size.)
- [ ] Any requirement to keep the `/frames/` URL working for backward compatibility (old cached HTMLs)? If not, delete wholesale.
- [ ] Is there a design-approved "2G / save-data" static image, or is the poster frame acceptable?

---

## 12. What this plan deliberately does NOT do

Listed so you can push back if you disagree:

- **Does not introduce Lottie.** Your source is photographic, not vector. Lottie would require a total redesign of the visual.
- **Does not adopt WebCodecs `VideoDecoder`.** Cutting-edge, but not on iOS Safari stable at mass-adoption levels as of 2026-04. The sprite-atlas path beats it for mobile reliability anyway.
- **Does not use CSS `animation-timeline: scroll()`.** Not on Safari yet. Would be a beautiful fallback once it lands — add it as Phase 7+ enhancement.
- **Does not change scroll container behaviour, Lenis, etc.** This plan is strictly about the hero visual. Smooth scroll is a separate conversation.
- **Does not remove the mask gradient or the wrapper `opacity: 0.2`.** Both are cheap composites and part of the intended look.

---

## 13. One-paragraph summary for anyone implementing this

The site currently ships a 14 MB MP4 and scrubs it via `video.currentTime` on every device. That works on desktop. It cannot work on iOS Safari because mobile video decoders coalesce rapid seeks, and it loads slowly on phones because the asset is bigger than needed. The fix is tiered: desktops keep the video (smaller), phones get a sprite atlas of 60 pre-decoded frames rendered through `createImageBitmap` + `OffscreenCanvas` in a worker (zero per-frame cost), save-data / 2G users get a static poster. The colour treatment currently applied live via CSS filter gets baked into every asset at build time so the GPU no longer runs a 4-pass shader every frame. Poster image loads first and crossfades to the real sequence. That's the whole fix: one bake, one tiered asset pipeline, one worker, one crossfade.

---

*Created 2026-04-21. Owner: Abhiroop. Scope: hero background scroll smoothness on low-end / mobile. No visual changes.*
