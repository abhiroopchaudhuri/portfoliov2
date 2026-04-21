/// <reference lib="webworker" />

/**
 * Hero sprite-atlas renderer (low-tier path).
 *
 * Runs inside a dedicated worker that owns an OffscreenCanvas. Main thread
 * sends init (canvas + atlas blob + manifest), then scroll-progress deltas.
 * Worker decodes the atlas once via createImageBitmap and draws the matching
 * strip per RAF tick with linear interpolation smoothing. No per-frame I/O,
 * no main-thread paint work.
 */

type Manifest = {
  width: number;
  frameHeight: number;
  frameCount: number;
};

type InitMsg = {
  kind: 'init';
  canvas: OffscreenCanvas;
  atlasBlob: Blob;
  manifest: Manifest;
};

type ProgressMsg = { kind: 'progress'; value: number };
type ResizeMsg   = { kind: 'resize'; width: number; height: number; dpr: number };
type ReducedMotionMsg = { kind: 'reduced-motion'; value: boolean };
type DisposeMsg  = { kind: 'dispose' };
type InMsg = InitMsg | ProgressMsg | ResizeMsg | ReducedMotionMsg | DisposeMsg;

const LERP = 0.35;
const EPS = 1 / 600;

let ctx: OffscreenCanvasRenderingContext2D | null = null;
let bitmap: ImageBitmap | null = null;
let manifest: Manifest | null = null;
let canvasRef: OffscreenCanvas | null = null;

let target = 0;
let current = 0;
let lastDrawn = -1;
let rafScheduled = false;
let disposed = false;
let reducedMotion = false;

const raf: (cb: FrameRequestCallback) => number =
  (typeof self !== 'undefined' && typeof (self as unknown as { requestAnimationFrame?: unknown }).requestAnimationFrame === 'function')
    ? (self as unknown as { requestAnimationFrame: (cb: FrameRequestCallback) => number }).requestAnimationFrame.bind(self)
    : ((cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 16) as unknown as number);

function schedule() {
  if (rafScheduled || disposed) return;
  rafScheduled = true;
  raf(tick);
}

function tick() {
  rafScheduled = false;
  if (disposed || !ctx || !bitmap || !manifest || !canvasRef) return;

  if (reducedMotion) {
    current = target;
  } else {
    current += (target - current) * LERP;
    if (Math.abs(target - current) < EPS) current = target;
  }

  if (Math.abs(current - lastDrawn) > EPS) {
    lastDrawn = current;

    const frame = Math.min(
      manifest.frameCount - 1,
      Math.max(0, Math.round(current * (manifest.frameCount - 1)))
    );

    const sw = manifest.width;
    const sh = manifest.frameHeight;
    const sx = 0;
    const sy = frame * sh;

    const cw = canvasRef.width;
    const ch = canvasRef.height;

    if (cw > 0 && ch > 0) {
      const scale = Math.max(cw / sw, ch / sh);
      const dw = sw * scale;
      const dh = sh * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(bitmap, sx, sy, sw, sh, dx, dy, dw, dh);
    }
  }

  if (Math.abs(target - current) > EPS) schedule();
}

function applyResize(width: number, height: number, dpr: number) {
  if (!canvasRef) return;
  const tw = Math.max(1, Math.round(width * dpr));
  const th = Math.max(1, Math.round(height * dpr));
  if (canvasRef.width !== tw) canvasRef.width = tw;
  if (canvasRef.height !== th) canvasRef.height = th;
  lastDrawn = -1;
  schedule();
}

self.onmessage = async (e: MessageEvent<InMsg>) => {
  const msg = e.data;

  if (msg.kind === 'init') {
    canvasRef = msg.canvas;
    manifest = msg.manifest;
    ctx = canvasRef.getContext('2d', { alpha: true });
    if (!ctx) {
      (self as unknown as { postMessage: (m: unknown) => void }).postMessage({ kind: 'error', reason: 'no-2d-context' });
      return;
    }
    try {
      bitmap = await createImageBitmap(msg.atlasBlob);
    } catch {
      (self as unknown as { postMessage: (m: unknown) => void }).postMessage({ kind: 'error', reason: 'decode-failed' });
      return;
    }
    (self as unknown as { postMessage: (m: unknown) => void }).postMessage({ kind: 'ready' });
    schedule();
    return;
  }

  if (msg.kind === 'progress') {
    target = Math.min(1, Math.max(0, msg.value));
    schedule();
    return;
  }

  if (msg.kind === 'resize') {
    applyResize(msg.width, msg.height, msg.dpr);
    return;
  }

  if (msg.kind === 'reduced-motion') {
    reducedMotion = msg.value;
    schedule();
    return;
  }

  if (msg.kind === 'dispose') {
    disposed = true;
    if (bitmap) {
      try { bitmap.close(); } catch { /* noop */ }
    }
    bitmap = null;
    ctx = null;
    canvasRef = null;
    manifest = null;
    return;
  }
};
