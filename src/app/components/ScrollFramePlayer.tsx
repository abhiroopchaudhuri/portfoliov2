import { useEffect, useRef, useCallback } from 'react';

/**
 * Scroll-driven hero background.
 *
 * Originally a 300-frame WebP sequence (~26 MB, choppy first seconds). Now
 * backed by a single H.264 MP4 encoded with every frame as a keyframe
 * (`keyint=1`), so seeks are O(1).
 *
 * Fast-scroll smoothness uses the same approach as Apple's scrollytelling
 * pages and Locomotive/GSAP ScrollTrigger frame-sequences: scroll writes a
 * `target` progress value; a persistent RAF loop eases a `current` value
 * toward the target with linear interpolation and drives
 * `video.currentTime`. Fast scroll moves `target` instantly but `current`
 * chases it smoothly over ~120–200 ms — so the sequence *scrubs fast*
 * instead of snapping to the final position.
 */
const HERO_VIDEO_SRC = '/hero/hero.mp4';

// Fraction of the remaining distance to close each RAF tick at 60 Hz. Higher
// = snappier but more jumpy; lower = more cinematic but laggy to input. 0.18
// at 60 Hz reaches ~99 % in ~22 frames (≈ 370 ms) and feels like a silky
// inertia without visibly trailing the scrollbar.
const LERP_FACTOR = 0.18;

// Consider two progress values equal below this — prevents infinite tiny
// seeks while at rest and avoids re-driving the decoder on sub-frame noise.
const EPSILON = 1 / 600;

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

  // Continuous RAF loop. Always running while the component is mounted and
  // there is still distance to close between `current` and `target`, so fast
  // scroll bursts ease in smoothly instead of snapping.
  const tick = useCallback(() => {
    rafRef.current = 0;
    const video = videoRef.current;
    if (!video || !readyRef.current || !durationRef.current) {
      // keep waiting for metadata
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const target = targetRef.current;
    let current = currentRef.current;

    if (reducedMotionRef.current) {
      current = target;
    } else {
      current += (target - current) * LERP_FACTOR;
      // Snap the last tiny bit so we don't loop forever on float noise.
      if (Math.abs(target - current) < EPSILON) current = target;
    }
    currentRef.current = current;

    // Drive the decoder. Only issue a new seek when we've moved at least a
    // frame's worth; otherwise we wastefully flood the decoder with micro
    // seeks and never give it time to present a frame.
    if (Math.abs(current - lastAppliedRef.current) > EPSILON) {
      lastAppliedRef.current = current;
      // Inset slightly from the very end so the clip doesn't wrap to 0.
      const t = Math.min(Math.max(current, 0), 0.999) * durationRef.current;
      video.currentTime = t;
    }

    drawToCanvas();

    // Keep the loop alive while we haven't converged. At rest we stop, and
    // `onScroll` will kick it back on.
    if (Math.abs(target - current) > EPSILON) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [drawToCanvas]);

  const ensureLoop = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  // Mount the video
  useEffect(() => {
    dprRef.current = Math.min(window.devicePixelRatio || 1, 2);
    pendingResizeRef.current = true;

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

    const onReady = () => {
      durationRef.current = video.duration || 0;
      readyRef.current = true;
      // Force an initial draw at the current target.
      lastAppliedRef.current = -1;
      ensureLoop();
    };
    video.addEventListener('loadedmetadata', onReady);
    video.addEventListener('loadeddata', onReady, { once: true });

    // When a seek lands, paint immediately — rVFC gives us the tightest
    // hook. We don't rely on it for driving the loop (the RAF tick does
    // that), but it guarantees we draw exactly when a new frame arrives.
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

    // Also draw on every `seeked` for browsers without rVFC (older Safari).
    const onSeeked = () => drawToCanvas();
    video.addEventListener('seeked', onSeeked);

    return () => {
      video.removeEventListener('loadedmetadata', onReady);
      video.removeEventListener('loadeddata', onReady);
      video.removeEventListener('seeked', onSeeked);
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

    // Initial positioning: snap current to target so we don't ease in from 0.
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
      // Re-draw at the current state.
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
