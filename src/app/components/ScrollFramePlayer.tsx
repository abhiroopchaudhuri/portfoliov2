import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-driven hero background — tiered, adaptive.
 *
 * Four tiers, decided once at mount. See HERO_SCROLL_LOWEND_FIX.md §6.
 *
 *   high       → <video> + currentTime seek + rVFC    (desktop)
 *   mid        → same path, smaller asset + DPR 1.5   (tablet, low-core laptop)
 *   low        → sprite atlas + createImageBitmap     (phone, iOS Safari, anything slow)
 *                + OffscreenCanvas in Worker (falls back to main thread if unsupported)
 *   ultra-low  → static poster, no animation          (save-data, 2G, reduced-motion, mem<2)
 *
 * Degrades gracefully if the new tier-specific assets are not yet built:
 *   - missing desktop/tablet mp4 → falls back to /hero/hero.mp4
 *   - missing atlas manifest     → low tier re-routes to video path
 *   - missing poster             → no poster layer, canvas starts blank until asset loads
 */

const HERO_DIR = '/hero';
const LEGACY_VIDEO = `${HERO_DIR}/hero.mp4`;
const POSTER_URL = `${HERO_DIR}/hero.poster.jpg`;
const MANIFEST_URL = `${HERO_DIR}/hero-manifest.json`;

type Tier = 'high' | 'mid' | 'low' | 'ultra-low';

type AtlasManifest = {
  width: number;
  frameHeight: number;
  frameCount: number;
  atlasUrl: string;
  atlasUrlAvif?: string;
};

interface ScrollFramePlayerProps {
  scrollContainer: React.RefObject<HTMLElement | null>;
  className?: string;
  style?: React.CSSProperties;
}

type VideoWithRVFC = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: (now: number, meta: unknown) => void) => number;
  cancelVideoFrameCallback?: (id: number) => void;
};

type NavWithConn = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: '2g' | 'slow-2g' | '3g' | '4g' | string;
  };
  deviceMemory?: number;
};

function detectTier(): Tier {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return 'high';

  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'ultra-low';
  } catch { /* noop */ }

  const nav = navigator as NavWithConn;
  const conn = nav.connection;
  if (conn?.saveData) return 'ultra-low';
  if (conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g') return 'ultra-low';

  const cores = nav.hardwareConcurrency ?? 8;
  const mem = nav.deviceMemory ?? 8;

  let slowUpdate = false;
  let coarsePointer = false;
  try {
    slowUpdate = window.matchMedia('(update: slow)').matches;
    coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  } catch { /* noop */ }
  const narrowViewport = window.innerWidth < 768;

  if (mem < 2) return 'ultra-low';
  if (slowUpdate) return 'low';
  // Treat every phone as low, regardless of SoC — mobile UX is dominated by
  // thermal throttling + background apps, not peak silicon.
  if (coarsePointer && narrowViewport) return 'low';
  if (cores <= 4 || mem < 4) return 'mid';
  if (conn?.effectiveType === '3g') return 'mid';
  return 'high';
}

function videoSrcForTier(tier: Tier): string[] {
  // Ordered list of candidates; first reachable wins.
  if (tier === 'mid') return [`${HERO_DIR}/hero.tablet.mp4`, LEGACY_VIDEO];
  return [`${HERO_DIR}/hero.desktop.mp4`, LEGACY_VIDEO];
}

async function resolveFirstReachable(urls: string[]): Promise<string | null> {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) return url;
    } catch { /* noop */ }
  }
  return null;
}

async function loadManifest(): Promise<AtlasManifest | null> {
  try {
    const res = await fetch(MANIFEST_URL);
    if (!res.ok) return null;
    return await res.json() as AtlasManifest;
  } catch {
    return null;
  }
}

function supportsAvif(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') { resolve(false); return; }
    const img = new Image();
    img.onload = () => resolve(img.width > 0);
    img.onerror = () => resolve(false);
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK';
  });
}

/** Shared lerp constants for every driver. */
const LERP_HIGH = 0.18;
const LERP_MID = 0.22;
const EPS = 1 / 600;

/** Video path (tiers: high, mid). Returns a dispose fn. */
function initVideoPath(
  canvas: HTMLCanvasElement,
  scrollContainer: React.RefObject<HTMLElement | null>,
  tier: 'high' | 'mid',
  videoSrc: string,
  onReady: () => void,
): () => void {
  const maxDpr = tier === 'high' ? 2 : 1.5;
  const lerp = tier === 'high' ? LERP_HIGH : LERP_MID;

  let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  let pendingResize = true;
  let durationS = 0;
  let ready = false;
  let target = 0;
  let current = 0;
  let lastApplied = -1;
  let rafId = 0;
  let readySignaled = false;
  let reducedMotion = false;
  try {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch { /* noop */ }

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return () => { /* noop */ };

  const video = document.createElement('video');
  video.src = videoSrc;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.crossOrigin = 'anonymous';
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.style.position = 'absolute';
  video.style.width = '1px';
  video.style.height = '1px';
  video.style.opacity = '0';
  video.style.pointerEvents = 'none';
  video.style.left = '-9999px';
  document.body.appendChild(video);

  const draw = () => {
    if (pendingResize) {
      const tw = Math.round(canvas.clientWidth * dpr);
      const th = Math.round(canvas.clientHeight * dpr);
      if (tw > 0 && th > 0) {
        if (canvas.width !== tw) canvas.width = tw;
        if (canvas.height !== th) canvas.height = th;
        pendingResize = false;
      }
    }
    const cw = canvas.width;
    const ch = canvas.height;
    if (cw === 0 || ch === 0) return;
    const iw = video.videoWidth;
    const ih = video.videoHeight;
    if (!iw || !ih) return;

    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(video, dx, dy, dw, dh);
  };

  const tick = () => {
    rafId = 0;
    if (!ready || !durationS) {
      rafId = requestAnimationFrame(tick);
      return;
    }
    if (reducedMotion) {
      current = target;
    } else {
      current += (target - current) * lerp;
      if (Math.abs(target - current) < EPS) current = target;
    }
    if (Math.abs(current - lastApplied) > EPS) {
      lastApplied = current;
      const t = Math.min(Math.max(current, 0), 0.999) * durationS;
      try { video.currentTime = t; } catch { /* noop */ }
    }
    draw();
    if (Math.abs(target - current) > EPS) rafId = requestAnimationFrame(tick);
  };

  const ensureLoop = () => {
    if (!rafId) rafId = requestAnimationFrame(tick);
  };

  const onLoadedData = () => {
    durationS = video.duration || 0;
    ready = true;
    lastApplied = -1;
    try { video.currentTime = 0.001; } catch { /* noop */ }
    ensureLoop();
    if (!readySignaled) { readySignaled = true; onReady(); }
  };
  video.addEventListener('loadeddata', onLoadedData, { once: true });
  video.addEventListener('seeked', draw);

  const v = video as VideoWithRVFC;
  let rvfcId = 0;
  const rvfcLoop = () => {
    draw();
    if (v.requestVideoFrameCallback) rvfcId = v.requestVideoFrameCallback(rvfcLoop);
  };
  if (v.requestVideoFrameCallback) rvfcId = v.requestVideoFrameCallback(rvfcLoop);

  // Scroll binding — progress is INVERTED so scroll=0 shows the last frame
  // and scroll=1 shows the first frame (reverse playback on scroll).
  const container = scrollContainer.current;
  const updateTarget = () => {
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const max = scrollHeight - clientHeight;
    if (max <= 0) return;
    target = Math.min(1, Math.max(0, 1 - scrollTop / max));
    ensureLoop();
  };
  if (container) {
    updateTarget();
    current = target;
    container.addEventListener('scroll', updateTarget, { passive: true });
  }

  // Resize binding
  const ro = new ResizeObserver(() => {
    pendingResize = true;
    dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    draw();
  });
  ro.observe(canvas);

  return () => {
    if (container) container.removeEventListener('scroll', updateTarget);
    ro.disconnect();
    video.removeEventListener('loadeddata', onLoadedData);
    video.removeEventListener('seeked', draw);
    if (rvfcId && v.cancelVideoFrameCallback) {
      try { v.cancelVideoFrameCallback(rvfcId); } catch { /* noop */ }
    }
    if (rafId) cancelAnimationFrame(rafId);
    video.removeAttribute('src');
    try { video.load(); } catch { /* noop */ }
    if (video.parentNode) video.parentNode.removeChild(video);
  };
}

/** Atlas path (tier: low). Returns a dispose fn. */
function initAtlasPath(
  canvas: HTMLCanvasElement,
  scrollContainer: React.RefObject<HTMLElement | null>,
  manifest: AtlasManifest,
  atlasBlob: Blob,
  onReady: () => void,
): () => void {
  const dpr = 1; // low-tier: never amplify pixel work
  let worker: Worker | null = null;
  let offscreen: OffscreenCanvas | null = null;
  let mainCtx: CanvasRenderingContext2D | null = null;
  let mainBitmap: ImageBitmap | null = null;
  let mainCurrent = 0;
  let mainTarget = 0;
  let mainRaf = 0;
  let reducedMotion = false;
  try {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch { /* noop */ }

  const canTransfer = typeof (canvas as HTMLCanvasElement & { transferControlToOffscreen?: () => OffscreenCanvas }).transferControlToOffscreen === 'function'
                      && typeof Worker !== 'undefined';

  const container = scrollContainer.current;
  const postProgress = () => {
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const max = scrollHeight - clientHeight;
    if (max <= 0) return;
    // INVERTED: scroll=0 → last frame, scroll=1 → first frame.
    const progress = Math.min(1, Math.max(0, 1 - scrollTop / max));
    if (worker) {
      worker.postMessage({ kind: 'progress', value: progress });
    } else {
      mainTarget = progress;
      ensureMainLoop();
    }
  };

  // Main-thread fallback tick (only used when OffscreenCanvas / Worker is unavailable)
  const mainTick = () => {
    mainRaf = 0;
    if (!mainCtx || !mainBitmap) return;
    if (reducedMotion) {
      mainCurrent = mainTarget;
    } else {
      mainCurrent += (mainTarget - mainCurrent) * 0.35;
      if (Math.abs(mainTarget - mainCurrent) < EPS) mainCurrent = mainTarget;
    }
    const frame = Math.min(
      manifest.frameCount - 1,
      Math.max(0, Math.round(mainCurrent * (manifest.frameCount - 1))),
    );
    const sw = manifest.width;
    const sh = manifest.frameHeight;
    const sy = frame * sh;
    const cw = canvas.width;
    const ch = canvas.height;
    if (cw > 0 && ch > 0) {
      const scale = Math.max(cw / sw, ch / sh);
      const dw = sw * scale;
      const dh = sh * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      mainCtx.clearRect(0, 0, cw, ch);
      mainCtx.drawImage(mainBitmap, 0, sy, sw, sh, dx, dy, dw, dh);
    }
    if (Math.abs(mainTarget - mainCurrent) > EPS) ensureMainLoop();
  };
  const ensureMainLoop = () => {
    if (!mainRaf) mainRaf = requestAnimationFrame(mainTick);
  };

  const applyResize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (worker && offscreen) {
      worker.postMessage({ kind: 'resize', width, height, dpr });
    } else {
      const tw = Math.max(1, Math.round(width * dpr));
      const th = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== tw) canvas.width = tw;
      if (canvas.height !== th) canvas.height = th;
      ensureMainLoop();
    }
  };

  let readySignaled = false;
  const signalReady = () => { if (!readySignaled) { readySignaled = true; onReady(); } };

  if (canTransfer) {
    try {
      offscreen = (canvas as HTMLCanvasElement & { transferControlToOffscreen: () => OffscreenCanvas }).transferControlToOffscreen();
    } catch {
      offscreen = null;
    }
  }

  const ro = new ResizeObserver(applyResize);
  ro.observe(canvas);

  if (offscreen) {
    worker = new Worker(new URL('./heroAtlas.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<{ kind: string; reason?: string }>) => {
      if (e.data.kind === 'ready') {
        signalReady();
        applyResize();
        postProgress();
      } else if (e.data.kind === 'error') {
        // Decode or context failure in the worker. No recovery; poster stays.
        // eslint-disable-next-line no-console
        console.warn('[hero-atlas] worker error', e.data.reason);
      }
    };
    worker.postMessage(
      { kind: 'init', canvas: offscreen, atlasBlob, manifest: { width: manifest.width, frameHeight: manifest.frameHeight, frameCount: manifest.frameCount } },
      [offscreen as unknown as Transferable],
    );
    worker.postMessage({ kind: 'reduced-motion', value: reducedMotion });
  } else {
    // Main-thread fallback: same atlas, same drawImage math.
    mainCtx = canvas.getContext('2d', { alpha: true });
    if (!mainCtx) return () => ro.disconnect();
    createImageBitmap(atlasBlob).then((bmp) => {
      mainBitmap = bmp;
      applyResize();
      postProgress();
      signalReady();
    }).catch(() => { /* poster stays */ });
  }

  if (container) {
    container.addEventListener('scroll', postProgress, { passive: true });
  }

  return () => {
    if (container) container.removeEventListener('scroll', postProgress);
    ro.disconnect();
    if (worker) {
      try { worker.postMessage({ kind: 'dispose' }); } catch { /* noop */ }
      worker.terminate();
    }
    if (mainBitmap) {
      try { mainBitmap.close(); } catch { /* noop */ }
      mainBitmap = null;
    }
    if (mainRaf) cancelAnimationFrame(mainRaf);
  };
}

// Legacy colour treatment. Kept in JS so it can be stripped at runtime once
// the baked assets are detected — if we loaded a new tier-specific asset or
// the sprite atlas, colour is already baked in and applying the filter again
// would double it.
const LEGACY_COLOUR_FILTER = 'grayscale(100%) sepia(100%) hue-rotate(350deg) saturate(300%)';

export default function ScrollFramePlayer({ scrollContainer, className, style }: ScrollFramePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tier] = useState<Tier>(() => detectTier());
  const [canvasVisible, setCanvasVisible] = useState(false);
  const [colourBaked, setColourBaked] = useState(false);

  useEffect(() => {
    if (tier === 'ultra-low') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let dispose: (() => void) | null = null;

    const markReady = () => {
      if (disposed) return;
      setCanvasVisible(true);
    };

    (async () => {
      if (tier === 'low') {
        // Try the atlas path first.
        const manifest = await loadManifest();
        if (manifest && !disposed) {
          const avif = manifest.atlasUrlAvif && (await supportsAvif());
          const url = avif ? manifest.atlasUrlAvif! : manifest.atlasUrl;
          try {
            const res = await fetch(url);
            if (res.ok) {
              const blob = await res.blob();
              if (disposed) return;
              setColourBaked(true);
              dispose = initAtlasPath(canvas, scrollContainer, manifest, blob, markReady);
              return;
            }
          } catch { /* fall through to video */ }
        }
        // Atlas unavailable — degrade to a video path. If a tier-specific
        // mp4 exists the colour is already baked; if only the legacy exists
        // we still need the live filter.
        const candidates = [`${HERO_DIR}/hero.tablet.mp4`, LEGACY_VIDEO];
        const src = await resolveFirstReachable(candidates);
        if (!src || disposed) return;
        setColourBaked(src !== LEGACY_VIDEO);
        dispose = initVideoPath(canvas, scrollContainer, 'mid', src, markReady);
        return;
      }

      // high / mid
      const src = await resolveFirstReachable(videoSrcForTier(tier));
      if (!src || disposed) return;
      setColourBaked(src !== LEGACY_VIDEO);
      dispose = initVideoPath(canvas, scrollContainer, tier, src, markReady);
    })();

    return () => {
      disposed = true;
      if (dispose) dispose();
    };
  }, [tier, scrollContainer]);

  const posterStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: tier === 'ultra-low' ? 1 : (canvasVisible ? 0 : 1),
    transition: 'opacity 220ms ease-out',
    pointerEvents: 'none',
  };

  const canvasStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    opacity: canvasVisible ? 1 : 0,
    transition: 'opacity 220ms ease-out',
    // Only apply the legacy colour filter while we're rendering from the
    // un-baked legacy asset. Once the build:hero pipeline has run and a
    // tier-specific or atlas asset is loaded, colour is baked in.
    filter: colourBaked ? undefined : LEGACY_COLOUR_FILTER,
  };

  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      <img
        src={POSTER_URL}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={posterStyle}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
      {tier !== 'ultra-low' && (
        <canvas ref={canvasRef} style={canvasStyle} />
      )}
    </div>
  );
}
