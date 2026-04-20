import { useEffect, useRef, useCallback } from 'react';

/**
 * Scroll-driven hero background.
 *
 * Backed by a single H.264 MP4 encoded with every frame as a keyframe
 * (`keyint=1`), so seeks are O(1).
 *
 * Fast-scroll smoothness uses the Apple / Locomotive / GSAP ScrollTrigger
 * pattern: scroll writes a `target` progress value; a persistent RAF loop
 * eases a `current` value toward the target with linear interpolation and
 * drives `video.currentTime`. Fast scroll moves `target` instantly but
 * `current` chases it smoothly over ~120–400 ms, so the sequence scrubs
 * fast instead of snapping.
 *
 * On low-end devices the per-seek decode cost can exceed a 60 Hz budget,
 * causing the video to trail the scroll. We detect low-end at mount and
 * switch to a more decoder-friendly profile: slower tick rate (lower seek
 * frequency → more time per decode), more aggressive lerp (catches up in
 * fewer frames), and 1× DPR (less pixel work in drawImage).
 */
const HERO_VIDEO_SRC = '/hero/hero.mp4';

type DeviceTier = 'high' | 'low';

interface TierProfile {
  lerp: number;          // fraction of remaining distance to close per tick
  minTickMs: number;     // minimum milliseconds between ticks (0 = vsync)
  maxDpr: number;        // DPR clamp for the backing canvas
}

const PROFILE: Record<DeviceTier, TierProfile> = {
  high: { lerp: 0.18, minTickMs: 0, maxDpr: 2 },
  low:  { lerp: 0.35, minTickMs: 32, maxDpr: 1 },
};

const EPSILON = 1 / 600;

function detectTier(): DeviceTier {
  if (typeof navigator === 'undefined') return 'high';
  // Core-count-based heuristic: mainstream laptops have ≥ 8 logical cores.
  const cores = navigator.hardwareConcurrency ?? 8;
  // Device memory is only exposed on Chromium; fall back to generous default.
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  // CSS-level "update speed" hint — UAs set this based on paint capability.
  let slowUpdate = false;
  try {
    slowUpdate = !!window.matchMedia && window.matchMedia('(update: slow)').matches;
  } catch { /* noop */ }

  if (cores <= 4) return 'low';
  if (mem < 4) return 'low';
  if (slowUpdate) return 'low';
  return 'high';
}

interface ScrollFramePlayerProps {
  scrollContainer: React.RefObject<HTMLElement | null>;
  className?: string;
  style?: React.CSSProperties;
}

type VideoWithRVFC = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: (now: number, meta: unknown) => void) => number;
  cancelVideoFrameCallback?: (id: number) => void;
};

export default function ScrollFramePlayer({ scrollContainer, className, style }: ScrollFramePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const durationRef = useRef(0);
  const readyRef = useRef(false);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const lastAppliedRef = useRef(-1);
  const dprRef = useRef(1);
  const pendingResizeRef = useRef(true);
  const rafRef = useRef(0);
  const lastTickTsRef = useRef(0);
  const profileRef = useRef<TierProfile>(PROFILE.high);
  const reducedMotionRef = useRef(false);

  const drawToCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    if (pendingResizeRef.current) {
      const dpr = dprRef.current;
      const tw = Math.round(canvas.clientWidth * dpr);
      const th = Math.round(canvas.clientHeight * dpr);
      if (tw > 0 && th > 0) {
        if (canvas.width !== tw) canvas.width = tw;
        if (canvas.height !== th) canvas.height = th;
        pendingResizeRef.current = false;
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
  }, []);

  const tick = useCallback((now: number) => {
    rafRef.current = 0;

    const profile = profileRef.current;
    const video = videoRef.current;

    if (!video || !readyRef.current || !durationRef.current) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // Low-end tier: throttle the loop. We still get scheduled every vsync,
    // but only do work every `minTickMs` ms.
    if (profile.minTickMs > 0 && now - lastTickTsRef.current < profile.minTickMs) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    lastTickTsRef.current = now;

    const target = targetRef.current;
    let current = currentRef.current;

    if (reducedMotionRef.current) {
      current = target;
    } else {
      current += (target - current) * profile.lerp;
      if (Math.abs(target - current) < EPSILON) current = target;
    }
    currentRef.current = current;

    if (Math.abs(current - lastAppliedRef.current) > EPSILON) {
      lastAppliedRef.current = current;
      const t = Math.min(Math.max(current, 0), 0.999) * durationRef.current;
      video.currentTime = t;
    }

    drawToCanvas();

    if (Math.abs(target - current) > EPSILON) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [drawToCanvas]);

  const ensureLoop = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  // Mount the video
  useEffect(() => {
    profileRef.current = PROFILE[detectTier()];
    dprRef.current = Math.min(window.devicePixelRatio || 1, profileRef.current.maxDpr);
    pendingResizeRef.current = true;
    lastTickTsRef.current = 0;

    reducedMotionRef.current =
      typeof window !== 'undefined' &&
      !!window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const video = document.createElement('video');
    video.src = HERO_VIDEO_SRC;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';
    video.setAttribute('playsinline', '');
    video.style.position = 'absolute';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    video.style.left = '-9999px';
    video.setAttribute('aria-hidden', 'true');
    document.body.appendChild(video);
    videoRef.current = video;

    // Live probe: if the first real seek takes longer than ~60 ms to land,
    // the device is effectively low-end regardless of static hints. Switch
    // to the safer profile in-flight.
    let firstProbed = false;
    let seekStart = 0;
    const onLoadedData = () => {
      durationRef.current = video.duration || 0;
      readyRef.current = true;
      lastAppliedRef.current = -1;
      // Seek a tiny amount so the onSeeked probe fires even if target == 0.
      seekStart = performance.now();
      try { video.currentTime = 0.001; } catch { /* noop */ }
      ensureLoop();
    };

    const onSeekedProbe = () => {
      if (!firstProbed) {
        firstProbed = true;
        const dt = performance.now() - seekStart;
        if (dt > 60 && profileRef.current !== PROFILE.low) {
          profileRef.current = PROFILE.low;
          dprRef.current = Math.min(window.devicePixelRatio || 1, PROFILE.low.maxDpr);
          pendingResizeRef.current = true;
        }
      }
      drawToCanvas();
    };

    video.addEventListener('loadedmetadata', () => {
      durationRef.current = video.duration || 0;
    });
    video.addEventListener('loadeddata', onLoadedData, { once: true });
    video.addEventListener('seeked', onSeekedProbe);

    // Paint every decoded frame via rVFC when available — tighter than
    // `seeked` alone, covers browsers that don't emit `seeked` for micro
    // seeks.
    const v = video as VideoWithRVFC;
    let rvfcId = 0;
    const rvfcLoop = () => {
      drawToCanvas();
      if (v.requestVideoFrameCallback) {
        rvfcId = v.requestVideoFrameCallback(rvfcLoop);
      }
    };
    if (v.requestVideoFrameCallback) {
      rvfcId = v.requestVideoFrameCallback(rvfcLoop);
    }

    return () => {
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('seeked', onSeekedProbe);
      if (rvfcId && v.cancelVideoFrameCallback) {
        try { v.cancelVideoFrameCallback(rvfcId); } catch { /* noop */ }
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      video.removeAttribute('src');
      try { video.load(); } catch { /* noop */ }
      if (video.parentNode) video.parentNode.removeChild(video);
      videoRef.current = null;
      readyRef.current = false;
    };
  }, [drawToCanvas, ensureLoop]);

  // Scroll binding — writes to targetRef only; the RAF loop does the work.
  useEffect(() => {
    const container = scrollContainer.current;
    if (!container) return;

    const updateTarget = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 0) return;
      const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      targetRef.current = progress;
      ensureLoop();
    };

    updateTarget();
    currentRef.current = targetRef.current;
    lastAppliedRef.current = -1;

    container.addEventListener('scroll', updateTarget, { passive: true });
    return () => {
      container.removeEventListener('scroll', updateTarget);
    };
  }, [scrollContainer, ensureLoop]);

  // Resize binding
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      pendingResizeRef.current = true;
      const video = videoRef.current;
      if (video) drawToCanvas();
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [drawToCanvas]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={style}
    />
  );
}
