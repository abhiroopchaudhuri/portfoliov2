import { useEffect, useRef, useCallback } from 'react';
import { HERO_FRAME_CONFIG } from '../../config/demo-media';

function frameSrc(index: number): string {
  const { directory, prefix, extension, padLength } = HERO_FRAME_CONFIG;
  return `${directory}/${prefix}${String(index).padStart(padLength, '0')}${extension}`;
}

interface ScrollFramePlayerProps {
  scrollContainer: React.RefObject<HTMLElement | null>;
  className?: string;
  style?: React.CSSProperties;
}

const PRELOAD_BUFFER = 20;

export default function ScrollFramePlayer({ scrollContainer, className, style }: ScrollFramePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const currentFrameRef = useRef(-1);
  const rafRef = useRef<number>(0);
  const lastPreloadCenter = useRef(-1);

  const ensureFrame = useCallback((index: number): HTMLImageElement | null => {
    const frames = framesRef.current;
    if (frames[index]) return frames[index];
    const img = new Image();
    img.decoding = 'async';
    img.src = frameSrc(HERO_FRAME_CONFIG.startIndex + index);
    frames[index] = img;
    return img;
  }, []);

  const preloadAround = useCallback((center: number) => {
    if (Math.abs(center - lastPreloadCenter.current) < PRELOAD_BUFFER / 2) return;
    lastPreloadCenter.current = center;
    const total = HERO_FRAME_CONFIG.totalFrames;
    const lo = Math.max(0, center - PRELOAD_BUFFER);
    const hi = Math.min(total, center + PRELOAD_BUFFER + 1);
    for (let i = lo; i < hi; i++) ensureFrame(i);
  }, [ensureFrame]);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = framesRef.current[index];
    if (!img || !img.complete || !img.naturalWidth) {
      img?.addEventListener('load', () => {
        if (currentFrameRef.current === index) drawFrame(index);
      }, { once: true });
      return;
    }

    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  useEffect(() => {
    const { totalFrames } = HERO_FRAME_CONFIG;
    framesRef.current = new Array(totalFrames).fill(null);
    lastPreloadCenter.current = -1;

    preloadAround(0);
    const first = framesRef.current[0];
    first?.addEventListener('load', () => drawFrame(0), { once: true });

    return () => { framesRef.current = []; };
  }, [drawFrame, preloadAround]);

  useEffect(() => {
    const container = scrollContainer.current;
    if (!container) return;

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const maxScroll = scrollHeight - clientHeight;
        if (maxScroll <= 0) return;

        const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
        const total = HERO_FRAME_CONFIG.totalFrames;
        const frameIdx = Math.min(Math.floor(progress * total), total - 1);

        if (frameIdx !== currentFrameRef.current) {
          currentFrameRef.current = frameIdx;
          preloadAround(frameIdx);
          drawFrame(frameIdx);
        }
      });
    };

    onScroll();
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [scrollContainer, drawFrame, preloadAround]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ro = new ResizeObserver(() => {
      if (currentFrameRef.current >= 0) drawFrame(currentFrameRef.current);
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [drawFrame]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={style}
    />
  );
}
