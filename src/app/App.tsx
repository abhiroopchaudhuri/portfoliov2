import React, { useEffect, useLayoutEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, ExternalLink, Github, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from './lib/utils';
import ScrollFramePlayer from './components/ScrollFramePlayer';
import carouselProjectsJson from '../imports/carousel_projects.json';

const THEME_ORANGE = '#F05D23';

type CarouselProjectLinks = {
  github?: string;
  live?: string;
};

type CarouselProject = {
  id: number;
  title: string;
  details: string;
  thumbnail: string;
  cardUrl: string;
  links?: CarouselProjectLinks;
};

const CAROUSEL_PROJECTS = carouselProjectsJson.projects as CarouselProject[];

/** Bleeds to the same width as the project carousel inside the padded `max-w-7xl` column. */
const CAROUSEL_SECTION_BLEED = cn(
  'relative z-10 min-w-0 box-border w-[calc(100%+4rem)] max-w-none',
  '-ml-8 -mr-8 md:-ml-16 md:-mr-12 md:w-[calc(100%+7rem)]',
);

/* ─── Static noise tile (SVG feTurbulence is very expensive on every paint) ─── */
function createNoiseDataUrl(size = 128): string {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '';
  const img = ctx.createImageData(size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

const NoiseOverlay = React.memo(() => {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    setDataUrl(createNoiseDataUrl(128));
  }, []);

  if (!dataUrl) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[4] opacity-[0.25] mix-blend-soft-light"
      style={{
        backgroundImage: `url(${dataUrl})`,
        backgroundRepeat: 'repeat',
        contain: 'strict',
      }}
      aria-hidden
    />
  );
});

const Crosshair = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("text-gray-500 opacity-60", className)}>
    <path d="M8 0V16M0 8H16" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
  </svg>
);

/* ─── Unique Background Elements ─── */
const RadarRings = React.memo(() => (
  <div className="absolute top-1/2 left-[70%] -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] pointer-events-none opacity-20 z-0">
    <div
      className="absolute inset-0 rounded-full border border-dashed perf-radar-cw-slow"
      style={{ borderColor: `${THEME_ORANGE}40` }}
    />
    <div
      className="absolute inset-[15%] rounded-full border border-solid perf-radar-ccw"
      style={{ borderColor: `${THEME_ORANGE}15` }}
    />
    <div
      className="absolute inset-[30%] rounded-full border border-dotted perf-radar-cw-fast"
      style={{ borderColor: `${THEME_ORANGE}50` }}
    />
  </div>
));

const hexChars = "0123456789ABCDEF";
const DataStream = React.memo(({ delay, x, y }: { delay: number, x: number, y: number }) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const tick = () => {
      let str = '';
      for (let i = 0; i < 6; i++) str += hexChars[(Math.random() * 16) | 0];
      if (spanRef.current) spanRef.current.textContent = '0x' + str;
    };
    tick();
    const interval = setInterval(tick, 320);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="perf-data-stream absolute text-[10px] font-mono tracking-widest"
      style={
        {
          left: `${x}%`,
          top: `${y}%`,
          color: THEME_ORANGE,
          ['--perf-ds-delay' as string]: `${delay}s`,
        } as React.CSSProperties
      }
    >
      <span ref={spanRef} />
    </div>
  );
});

/* ─── Animated Crosshair ─── */
const AnimatedCrosshair = React.memo(({ x, y, delay }: { x: number; y: number; delay: number }) => (
  <div
    className="perf-crosshair absolute pointer-events-none"
    style={
      {
        left: `${x}%`,
        top: `${y}%`,
        ['--perf-ch-delay' as string]: `${delay}s`,
      } as React.CSSProperties
    }
  >
    <Crosshair className="text-[#F05D23]" />
  </div>
));

/* ─── Text Scramble & Glitch Hook ─── */
const ScrambleText = ({ text, className, style, as: Component = "span" }: { text: string, className?: string, style?: any, as?: any }) => {
  const [isHovered, setIsHovered] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);
  const glitchRef = useRef<HTMLSpanElement>(null);
  const chars = '!<>-_\\\\/[]{}—=+*^?#________';

  useEffect(() => {
    let iteration = 0;
    const speed = isHovered ? 1 / 3 : 1 / 2;
    const interval = setInterval(() => {
      const result = text.split('').map((_char, index) => {
        if (index < iteration) return text[index];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      if (textRef.current) textRef.current.textContent = result;
      if (glitchRef.current) glitchRef.current.textContent = result;
      if (iteration >= text.length) clearInterval(interval);
      iteration += speed;
    }, 30);
    return () => clearInterval(interval);
  }, [isHovered, text]);

  return (
    <Component
      className={cn("relative inline-block", className)}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span ref={textRef} className="transition-colors duration-300">{text}</span>
      {isHovered && (
        <span
          ref={glitchRef}
          className="perf-glitch-layer absolute inset-0 z-[-1] opacity-60 pointer-events-none mix-blend-screen"
          style={{ color: THEME_ORANGE, clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)' }}
          aria-hidden="true"
        >
          {text}
        </span>
      )}
    </Component>
  );
};

/* ─── Glitch Plus Symbol ─── */
const GlitchPlus = () => (
  <span
    className="perf-glitch-plus inline-block mx-3 font-mono align-middle"
    style={{ color: THEME_ORANGE, textShadow: `0 0 12px ${THEME_ORANGE}90` }}
  >
    +
  </span>
);

function statGlitch666(value: string): string {
  if (value.includes('M')) return '666M+';
  if (value.endsWith('+')) return '666+';
  if (value.endsWith('%')) return '666%';
  return '666';
}

type GlitchPhase = 'idle' | 'pre' | 'hold' | 'post';

const GlitchStatNumber = ({ value, staggerMs }: { value: string; staggerMs: number }) => {
  const [phase, setPhase] = useState<GlitchPhase>('idle');
  const [flicker, setFlicker] = useState(false);
  const demon = useMemo(() => statGlitch666(value), [value]);
  const rafRef = useRef(0);
  const origRef = useRef<HTMLSpanElement>(null);
  const demonRef = useRef<HTMLSpanElement>(null);
  const [dims, setDims] = useState<{ orig: number; demon: number } | null>(null);

  useLayoutEffect(() => {
    const mo = origRef.current;
    const md = demonRef.current;
    if (mo && md) {
      setDims({
        orig: mo.getBoundingClientRect().width,
        demon: md.getBoundingClientRect().width,
      });
    }
  }, [value, demon]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let cancelled = false;
    const ids: ReturnType<typeof setTimeout>[] = [];

    const flickerSequence = (
      duration: number,
      demonProb: number,
      onDone: () => void
    ) => {
      const start = performance.now();
      let last = 0;
      const step = (now: number) => {
        if (cancelled) return;
        if (now - start >= duration) {
          setFlicker(false);
          onDone();
          return;
        }
        const interval = 40 + Math.random() * 60;
        if (now - last > interval) {
          last = now;
          setFlicker(Math.random() < demonProb);
        }
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    };

    const runGlitch = () => {
      if (cancelled) return;

      setPhase('pre');
      flickerSequence(180, 0.35, () => {
        if (cancelled) return;
        setPhase('hold');
        setFlicker(true);
        ids.push(setTimeout(() => {
          if (cancelled) return;
          setPhase('post');
          flickerSequence(160, 0.3, () => {
            if (cancelled) return;
            setPhase('idle');
            setFlicker(false);
            scheduleNext();
          });
        }, 280));
      });
    };

    const scheduleNext = () => {
      const delay = 12000 + Math.random() * 6000;
      ids.push(setTimeout(() => {
        if (!cancelled) runGlitch();
      }, delay));
    };

    ids.push(setTimeout(() => {
      if (!cancelled) runGlitch();
    }, staggerMs));

    return () => {
      cancelled = true;
      ids.forEach(clearTimeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [staggerMs]);

  const active = phase !== 'idle';
  const showDemon = phase === 'hold' || (active && flicker);
  const wantsWide = phase === 'pre' || phase === 'hold';
  const explicitWidth = dims
    ? wantsWide
      ? dims.demon
      : dims.orig
    : undefined;

  return (
    <span
      className="perf-stat-glitch-wrap"
      style={{
        fontWeight: 700,
        width: explicitWidth != null ? `${explicitWidth}px` : undefined,
      }}
    >
      <span ref={origRef} className="perf-stat-measure" aria-hidden>
        {value}
      </span>
      <span ref={demonRef} className="perf-stat-measure" aria-hidden>
        {demon}
      </span>
      <span className="perf-stat-glitch-clip" style={dims ? { width: '100%' } : undefined}>
        <span
          className={cn(
            'text-[#F05D23] tabular-nums whitespace-nowrap relative z-[1]',
            active && 'perf-stat-glitch-active'
          )}
        >
          {showDemon ? demon : value}
        </span>
        {active && (
          <>
            <span className="perf-stat-aberr-r" aria-hidden>
              {showDemon ? demon : value}
            </span>
            <span className="perf-stat-aberr-c" aria-hidden>
              {showDemon ? demon : value}
            </span>
            <span className="perf-stat-scanline" aria-hidden />
          </>
        )}
      </span>
    </span>
  );
};

/* ─── Story Hover Underline ─── */
const StoryUnderline = ({ isHovered }: { isHovered: boolean }) => {
  const dur = 3;

  return (
    <div className="absolute bottom-[-6px] left-0 w-full h-[2px] pointer-events-none overflow-visible">
      {/* Apple (Red Square) — appears first, static on right */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-[4px] h-[4px] bg-[#b91c1c] z-10"
        style={{ left: '96%', boxShadow: '0 0 6px rgba(185,28,28,0.8)' }}
        initial={{ opacity: 0 }}
        animate={isHovered ? {
          opacity: [0, 0, 1, 1, 1, 1, 0, 0, 0]
        } : { opacity: 0 }}
        transition={isHovered ? {
          duration: dur, repeat: Infinity,
          times: [0, 0.02, 0.06, 0.30, 0.55, 0.62, 0.72, 0.82, 1],
          ease: "easeInOut"
        } : { duration: 0.2, ease: "easeOut" }}
      />

      {/* Eve (White Square) — starts after apple, eases toward it */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-[4px] h-[4px] bg-white z-20"
        style={{ boxShadow: '0 0 8px rgba(255,255,255,0.9)' }}
        initial={{ opacity: 0, left: "3%" }}
        animate={isHovered ? {
          left:    ["3%", "3%", "3%", "50%", "96%", "96%", "96%", "3%", "3%"],
          opacity: [0,    0,    1,    1,     1,     1,     0,     0,    0]
        } : { opacity: 0, left: "3%" }}
        transition={isHovered ? {
          duration: dur, repeat: Infinity,
          times:   [0, 0.06, 0.09, 0.35, 0.55, 0.62, 0.72, 0.82, 1],
          ease: "easeInOut"
        } : { duration: 0.2, ease: "easeOut" }}
      />

      {/* Snake (Orange Line) — starts later, tip trails behind Eve */}
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] z-10 rounded-r-full"
        style={{ background: 'linear-gradient(90deg, transparent 0%, #F05D23 30%, #F05D23 100%)', boxShadow: '0 0 8px rgba(240,93,35,0.7)' }}
        initial={{ width: "0%", opacity: 0 }}
        animate={isHovered ? {
          width:   ["0%", "0%", "0%", "35%", "75%", "98%", "98%", "0%", "0%"],
          opacity: [0,    0,    0.8,  1,     1,     1,     0,     0,    0]
        } : { width: "0%", opacity: 0 }}
        transition={isHovered ? {
          duration: dur, repeat: Infinity,
          times:   [0, 0.09, 0.14, 0.38, 0.58, 0.68, 0.76, 0.82, 1],
          ease: "easeInOut"
        } : { duration: 0.2, ease: "easeOut" }}
      />

      {/* Shockwave Flash — fires when snake catches Eve at apple */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full border-2 border-[#F05D23] z-30"
        style={{ left: '96%' }}
        initial={{ opacity: 0, scale: 0 }}
        animate={isHovered ? {
          opacity: [0, 0, 0, 0.9, 0.5, 0, 0],
          scale:   [0, 0, 0.5, 2,  5,   6, 0]
        } : { opacity: 0, scale: 0 }}
        transition={isHovered ? {
          duration: dur, repeat: Infinity,
          times:   [0, 0.62, 0.67, 0.72, 0.80, 0.88, 1],
          ease: "easeOut"
        } : { duration: 0.2, ease: "easeOut" }}
      />
    </div>
  );
};

/* ─── Nav Link ─── */
const NavLink = ({ children, href = "#", className, isActive = false, onClick }: { children: React.ReactNode; href?: string; className?: string; isActive?: boolean; onClick?: (e: React.MouseEvent) => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <a
      href={href}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative inline-block w-fit cursor-pointer transition-colors duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
        isActive ? "text-[#F05D23]" : "text-[#cccccc] hover:text-[#F05D23]",
        className
      )}
      style={{ fontFamily: '"Space Mono", monospace', fontSize: '16px', letterSpacing: '0.2em', fontWeight: 700 }}
    >
      <ScrambleText text={children as string} />
      {/* Static dotted underline for active state */}
      {isActive && !isHovered && (
        <div className="absolute bottom-[-6px] left-0 w-full h-[2px] pointer-events-none border-b border-dotted border-white/50" />
      )}
      <StoryUnderline isHovered={isHovered} />
    </a>
  );
};


/* ─── Advanced AI Director Background Scene ─── */
const BackgroundChaseScene = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let cw = window.innerWidth;
    let ch = window.innerHeight;
    let docHidden = document.visibilityState === 'hidden';

    const resize = () => {
      cw = window.innerWidth;
      ch = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(cw * dpr);
      canvas.height = Math.floor(ch * dpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const onVisibility = () => {
      docHidden = document.visibilityState === 'hidden';
    };
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    resize();

    const SCALE = 3;
    const CELL_SIZE = 40;
    const CAUGHT_DURATION = 1000;
    const EVE_SPEED = 140; // pixels per sec
    const SNAKE_SPEED = 165; // pixels per sec

    const spriteApple = [
      ". . . G . . . .",
      ". . R R R . . .",
      ". R R R R R . .",
      ". R R R R R . .",
      ". . R R R . . .",
      ". . . . . . . .",
      ". . . . . . . .",
      ". . . . . . . ."
    ].map(r => r.replace(/ /g, ''));

    const spriteEve = [
      ". . W W W W . .",
      ". . W W W W . .",
      ". . . W W . . .",
      ". . W W W W . .",
      ". W . W W . W .",
      ". . . W W . . .",
      ". . W . . W . .",
      ". W W . . W W ."
    ].map(r => r.replace(/ /g, ''));

    const spriteSnake = [
      ". . O O O O . .",
      ". O O O O O O .",
      ". O G O O G O .",
      ". O O O O O O .",
      ". . O O O O . .",
      ". . . . . . . .",
      ". . . . . . . .",
      ". . . . . . . ."
    ].map(r => r.replace(/ /g, ''));

    const drawSprite = (sprite: string[], x: number, y: number, flipX: boolean) => {
      const offsetX = x - 4 * SCALE;
      const offsetY = y - 4 * SCALE;
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const col = flipX ? 7 - j : j;
          const char = sprite[i][col];
          if (char === '.') continue;
          if (char === 'G') ctx.fillStyle = '#22c55e';
          else if (char === 'R') ctx.fillStyle = '#b91c1c';
          else if (char === 'W') ctx.fillStyle = '#ffffff';
          else if (char === 'O') ctx.fillStyle = '#F05D23';
          ctx.fillRect(offsetX + j * SCALE, offsetY + i * SCALE, SCALE, SCALE);
        }
      }
    };

    type Pt = { c: number, r: number };
    
    // Director State
    let state = {
      phase: 'HIDDEN',
      timer: 1000,
      path: [] as {x:number, y:number}[],
      totalDist: 0,
      eveDist: 0,
      snakeDist: 0,
      flashPt: {x: 0, y: 0}
    };

    // A* Pathfinding implementation
    const aStar = (start: Pt, target: Pt, cols: number, rows: number, isObstacle: (c:number, r:number) => boolean, costFn: (c:number, r:number) => number) => {
      const open = [{...start, g: 0, f: 0, parent: null as any}];
      const closed = new Set();
      const toKey = (c:number, r:number) => `${c},${r}`;

      while(open.length > 0) {
        open.sort((a,b) => a.f - b.f);
        const curr = open.shift()!;
        const key = toKey(curr.c, curr.r);

        if (curr.c === target.c && curr.r === target.r) {
          const path = [];
          let node = curr;
          while(node) {
            path.unshift({c: node.c, r: node.r});
            node = node.parent;
          }
          return path;
        }

        closed.add(key);

        const neighbors = [[0,1], [1,0], [0,-1], [-1,0]];
        for (let [dc, dr] of neighbors) {
          const nc = curr.c + dc;
          const nr = curr.r + dr;
          
          if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue;
          if (isObstacle(nc, nr)) continue;
          if (closed.has(toKey(nc, nr))) continue;

          const g = curr.g + costFn(nc, nr);
          const h = Math.abs(nc - target.c) + Math.abs(nr - target.r);
          const f = g + h;

          const existing = open.find(n => n.c === nc && n.r === nr);
          if (!existing) {
            open.push({c: nc, r: nr, g, f, parent: curr});
          } else if (g < existing.g) {
            existing.g = g;
            existing.f = f;
            existing.parent = curr;
          }
        }
      }
      return null;
    };

    const generateDirectorPath = () => {
      const cols = Math.floor(cw / CELL_SIZE);
      const rows = Math.floor(ch / CELL_SIZE);
      
      const isObstacle = (c: number, r: number) => {
        const px = c * CELL_SIZE;
        const py = r * CELL_SIZE;
        // Keep center safe text area clear
        return (px > cw * 0.15 && px < cw * 0.85 && py > ch * 0.3 && py < ch * 0.75);
      };

      const getRandNode = (avoidArr: Pt[] = []) => {
        let c, r;
        let valid = false;
        let attempts = 0;
        do {
          c = Math.floor(Math.random() * cols);
          r = Math.floor(Math.random() * rows);
          valid = !isObstacle(c, r);
          for (let avoid of avoidArr) {
            if (Math.hypot(c - avoid.c, r - avoid.r) < 8) valid = false; // keep minimum distance
          }
          attempts++;
        } while(!valid && attempts < 100);
        return {c, r};
      };

      let snakeStart = getRandNode();
      let eveStart = getRandNode([snakeStart]);
      let apple = getRandNode([snakeStart, eveStart]);

      // Path 1: Snake tracking Eve (Shortest Path)
      let path1 = aStar(snakeStart, eveStart, cols, rows, isObstacle, () => 1);
      
      // Path 2: Eve fleeing to Apple 
      // (Advanced Logic: She avoids the path the snake took, simulating evasion, but still reaches the Apple)
      let path2 = aStar(eveStart, apple, cols, rows, isObstacle, (c, r) => {
        let minD = Infinity;
        if (path1) {
          for (let p of path1) {
            minD = Math.min(minD, Math.abs(p.c - c) + Math.abs(p.r - r));
          }
        }
        if (minD < 4) return 20 * (4 - minD); // Huge penalty for getting close to snake's trail
        return 1; // base cost
      });

      if (!path1 || !path2 || path1.length < 2 || path2.length < 2) {
        // Retry if blocked or too short
        return false; 
      }

      // Combine Paths
      path2.shift(); // Remove duplicate eveStart
      const fullGridPath = [...path1, ...path2];
      
      const pixelPath = fullGridPath.map(p => ({ x: p.c * CELL_SIZE + CELL_SIZE/2, y: p.r * CELL_SIZE + CELL_SIZE/2 }));
      
      let total = 0;
      let dists = [0];
      for (let i = 1; i < pixelPath.length; i++) {
        total += Math.hypot(pixelPath[i].x - pixelPath[i-1].x, pixelPath[i].y - pixelPath[i-1].y);
        dists.push(total);
      }

      state.path = pixelPath;
      state.totalDist = total;
      state.snakeDist = 0;
      state.eveDist = dists[path1.length - 1]; // Eve starts exactly at the end of Path 1
      state.phase = 'CHASING';
      
      return true;
    };

    const getPointOnPath = (d: number) => {
      const path = state.path;
      if (d <= 0) return { ...path[0], dir: {x: 1, y: 0} };
      let remaining = d;
      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i+1];
        const segDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        if (remaining <= segDist) {
          const ratio = remaining / segDist;
          return {
            x: p1.x + (p2.x - p1.x) * ratio,
            y: p1.y + (p2.y - p1.y) * ratio,
            dir: { x: (p2.x - p1.x) / (segDist||1), y: (p2.y - p1.y) / (segDist||1) }
          };
        }
        remaining -= segDist;
      }
      const last = path[path.length - 1];
      const prev = path[path.length - 2];
      const fd = Math.hypot(last.x - prev.x, last.y - prev.y);
      return { ...last, dir: { x: (last.x - prev.x) / (fd||1), y: (last.y - prev.y) / (fd||1) } };
    };

    let lastTime = performance.now();

    const update = (dt: number) => {
      if (state.phase === 'HIDDEN') {
        state.timer -= dt;
        if (state.timer <= 0) {
          let success = false;
          while(!success) success = generateDirectorPath();
        }
      } else if (state.phase === 'CHASING') {
        state.eveDist += (EVE_SPEED * dt) / 1000;
        state.snakeDist += (SNAKE_SPEED * dt) / 1000;

        // Check conditions (Snake catches Eve OR Eve reaches Apple)
        if (state.snakeDist >= state.eveDist) {
          state.phase = 'CAUGHT';
          state.timer = CAUGHT_DURATION;
          state.flashPt = getPointOnPath(state.eveDist);
        } else if (state.eveDist >= state.totalDist) {
          state.phase = 'CAUGHT';
          state.timer = CAUGHT_DURATION;
          state.flashPt = getPointOnPath(state.totalDist);
        }
      } else if (state.phase === 'CAUGHT') {
        state.timer -= dt;
        if (state.timer <= 0) {
          state.phase = 'HIDDEN';
          state.timer = 1500 + Math.random() * 2000; 
        }
      }
    };

    const render = (time: number) => {
      if (docHidden) {
        lastTime = time;
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min(time - lastTime, 64);
      lastTime = time;

      ctx.clearRect(0, 0, cw, ch);
      update(dt);

      if (state.phase === 'CHASING' || state.phase === 'CAUGHT') {
        const applePos = getPointOnPath(state.totalDist);
        
        if (state.phase === 'CHASING') {
          const evePos = getPointOnPath(state.eveDist);
          const snakePos = getPointOnPath(state.snakeDist);

          // Draw Faint Escape Trail (The "AI Calculation" visual)
          ctx.beginPath();
          ctx.moveTo(state.path[0].x, state.path[0].y);
          for (let i = 1; i < state.path.length; i++) ctx.lineTo(state.path[i].x, state.path[i].y);
          ctx.strokeStyle = 'rgba(255,255,255,0.03)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // High-end segmented tail interpolation (The requested "earlier design")
          ctx.fillStyle = '#F05D23';
          const bodyLen = 180;
          const segments = 14;
          for (let i = 1; i <= segments; i++) {
            const d = state.snakeDist - i * (bodyLen / segments);
            if (d > 0) {
              const bp = getPointOnPath(d);
              // Taper the tail smoothly
              const size = SCALE * 2.8 - Math.pow(i / segments, 1.5) * (SCALE * 2.2);
              ctx.fillRect(bp.x - size/2, bp.y - size/2, size, size);
            }
          }

          ctx.shadowBlur = 4;

          ctx.shadowColor = '#b91c1c';
          drawSprite(spriteApple, applePos.x, applePos.y, false);

          ctx.shadowColor = '#ffffff';
          drawSprite(spriteEve, evePos.x, evePos.y, evePos.dir.x < 0);

          ctx.shadowColor = '#F05D23';
          drawSprite(spriteSnake, snakePos.x, snakePos.y, snakePos.dir.x < 0);
        } else if (state.phase === 'CAUGHT') {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#F05D23';
          drawSprite(spriteSnake, state.flashPt.x, state.flashPt.y, false);
          
          const pulse = 1 - (state.timer / CAUGHT_DURATION);
          
          // Outer Shockwave
          ctx.beginPath();
          ctx.arc(state.flashPt.x, state.flashPt.y, 20 + pulse * 120, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(240, 93, 35, ${1 - Math.pow(pulse, 2)})`;
          ctx.lineWidth = 4 - (pulse * 3);
          ctx.stroke();

          // Inner Glitch Core
          ctx.beginPath();
          ctx.arc(state.flashPt.x, state.flashPt.y, 10 + pulse * 40, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(240, 93, 35, ${(1 - pulse) * 0.5})`;
          ctx.fill();
        }
        
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[2] pointer-events-none opacity-50 mix-blend-screen"
      style={{ contain: 'strict' }}
    />
  );
});

const carouselTooltipContentClass = cn(
  'z-[200] max-w-[min(22rem,calc(100vw-2rem))] rounded-sm border border-[#F05D23]/45',
  'bg-[#080808]/98 px-4 py-3.5 text-left shadow-[0_0_32px_-8px_rgba(240,93,35,0.55),inset_0_1px_0_rgba(255,255,255,0.06)]',
  'backdrop-blur-md outline-none',
  'animate-in fade-in-0 zoom-in-95 duration-150'
);

type CarouselTruncationTooltipProps = {
  fullText: string;
  lineClamp: 2 | 3;
  maxHeightClass?: string;
  side?: 'top' | 'bottom';
  tooltipLabel: string;
  /** Fired when truncated text is clicked (Radix trigger can block parent card click — handle navigation here). */
  onTruncatedBodyActivate?: () => void;
} & Omit<React.ComponentProps<'p'>, 'children'>;

function CarouselTruncationTooltip({
  fullText,
  lineClamp,
  maxHeightClass,
  side = 'top',
  tooltipLabel,
  onTruncatedBodyActivate,
  className,
  style,
  onClick: onClickProp,
  onKeyDown: onKeyDownProp,
  ...rest
}: CarouselTruncationTooltipProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [truncated, setTruncated] = useState(false);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setTruncated(el.scrollHeight > el.clientHeight + 1);
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, fullText, lineClamp, maxHeightClass]);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, truncated]);

  const clampClass = lineClamp === 2 ? 'line-clamp-2' : 'line-clamp-3';

  const paragraph = (
    <p
      ref={ref}
      className={cn(clampClass, maxHeightClass, className)}
      style={style}
      onClick={onClickProp}
      onKeyDown={onKeyDownProp}
      {...rest}
    >
      {fullText}
    </p>
  );

  if (!truncated) {
    return paragraph;
  }

  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
        <p
          ref={ref}
          className={cn(clampClass, maxHeightClass, className, 'cursor-pointer')}
          style={style}
          {...rest}
          onClick={(e) => {
            onClickProp?.(e);
            if (e.defaultPrevented) return;
            onTruncatedBodyActivate?.();
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            onKeyDownProp?.(e);
            if (e.defaultPrevented) return;
            if (e.key !== 'Enter' && e.key !== ' ') return;
            onTruncatedBodyActivate?.();
            e.stopPropagation();
          }}
        >
          {fullText}
        </p>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={10}
          collisionPadding={12}
          className={carouselTooltipContentClass}
        >
          <span className="mb-2 block font-mono text-[10px] tracking-[0.28em] text-[#F05D23]">{tooltipLabel}</span>
          <p className="font-mono text-[14px] leading-relaxed tracking-wide text-[#d6d6d6]">{fullText}</p>
          <TooltipPrimitive.Arrow className="fill-[#080808]" width={11} height={5} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

function isInternalCardHref(href: string): boolean {
  if (!href || href === '#') return false;
  return href.startsWith('/') && !href.startsWith('//');
}

const SmoothCarousel = React.memo(() => {
  const navigate = useNavigate();
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      skipSnaps: true,
      dragFree: true,
      duration: 40,
      dragThreshold: 4,
      watchDrag: (_api, evt) => {
        const e = evt as unknown as Event & { pointerType?: string };
        if (typeof e.pointerType === 'string') {
          return e.pointerType === 'touch';
        }
        return e.type.startsWith('touch');
      },
    },
    [autoplayPlugin.current]
  );

  const carouselViewportRef = useRef<HTMLDivElement | null>(null);
  const wheelAccumRef = useRef(0);
  const wheelRafRef = useRef<number | null>(null);
  const setCarouselViewportRef = useCallback(
    (node: HTMLDivElement | null) => {
      carouselViewportRef.current = node;
      emblaRef(node);
    },
    [emblaRef]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onReInit = onSelect;
    emblaApi.on('reInit', onReInit);
    return () => {
      emblaApi.off('reInit', onReInit);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const el = carouselViewportRef.current;
    if (!el || !emblaApi) return;

    const flushWheel = () => {
      wheelRafRef.current = null;
      const api = emblaApi;
      if (!api) return;
      const total = wheelAccumRef.current;
      wheelAccumRef.current = 0;
      if (Math.abs(total) < 0.25) return;
      const engine = api.internalEngine();
      engine.scrollBody.useDuration(0);
      engine.scrollTo.distance(-total, false);
    };

    const scheduleWheelFlush = () => {
      if (wheelRafRef.current != null) return;
      wheelRafRef.current = requestAnimationFrame(flushWheel);
    };

    const onWheel = (e: WheelEvent) => {
      let dx = e.deltaX;
      let dy = e.deltaY;
      if (e.shiftKey && Math.abs(dy) >= Math.abs(dx)) {
        dx = dy;
      }
      if (Math.abs(dx) <= Math.abs(dy) || Math.abs(dx) < 0.5) return;
      e.preventDefault();
      wheelAccumRef.current += dx;
      scheduleWheelFlush();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelRafRef.current != null) {
        cancelAnimationFrame(wheelRafRef.current);
        wheelRafRef.current = null;
      }
      wheelAccumRef.current = 0;
    };
  }, [emblaApi]);

  const openCardProject = useCallback((proj: CarouselProject) => {
    const u = proj.cardUrl?.trim();
    const href = u || proj.links?.live?.trim() || proj.links?.github?.trim() || '#';
    if (!href || href === '#') return;
    if (isInternalCardHref(href)) navigate(href);
    else window.open(href, '_blank', 'noopener,noreferrer');
  }, [navigate]);

  const isCarouselNavExcluded = (target: EventTarget | null) =>
    target instanceof Element && target.closest('[data-carousel-exclude-nav="true"]') !== null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-20 mt-10 w-full md:mt-14"
      aria-roledescription="carousel"
      aria-label="Featured projects"
    >
      <TooltipPrimitive.Provider delayDuration={280} skipDelayDuration={120}>
      <div className="mb-4 flex items-center justify-end gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {CAROUSEL_PROJECTS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => emblaApi?.scrollTo(idx)}
              className={cn(
                'h-[3px] cursor-pointer rounded-full transition-all duration-500',
                selectedIndex === idx ? 'w-8 bg-[#F05D23]' : 'w-3 bg-white/20 hover:bg-white/40'
              )}
              aria-label={`Go to project ${idx + 1}`}
              aria-current={selectedIndex === idx ? 'true' : undefined}
            />
          ))}
          <span className="ml-2 font-mono text-[16px] tracking-widest text-white/90 select-none">
            {String(selectedIndex + 1).padStart(2, '0')} / {String(CAROUSEL_PROJECTS.length).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white/90 transition-colors hover:border-[#F05D23]/50 hover:text-[#F05D23]"
            aria-label="Previous project"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white/90 transition-colors hover:border-[#F05D23]/50 hover:text-[#F05D23]"
            aria-label="Next project"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className={CAROUSEL_SECTION_BLEED}>
        <div
          ref={setCarouselViewportRef}
          className="cursor-default overflow-x-clip overflow-y-visible py-4 overscroll-x-contain [overflow-clip-margin:3rem] [touch-action:pan-x_pan-y]"
          role="presentation"
        >
          <div className="ml-[-8px] flex items-stretch [touch-action:pan-x_pan-y]">
            {CAROUSEL_PROJECTS.map((proj, idx) => {
              return (
                <div
                  key={proj.id}
                  className="box-border flex min-h-0 min-w-0 shrink-0 grow-0 basis-[82%] pl-4 sm:basis-[52%] lg:basis-[38%]"
                >
                  <div className="carousel-card-shell group relative flex min-h-0 w-full flex-1 hover:z-10">
                    <div className="carousel-card-shell-glow" aria-hidden />
                    <div
                      role="link"
                      tabIndex={0}
                      aria-label={`Open project: ${proj.title}`}
                      className={cn(
                        'carousel-project-card relative z-[2] flex min-h-0 w-full cursor-pointer flex-col overflow-hidden rounded-sm bg-[#0a0a0a]',
                        'outline-none focus-visible:ring-2 focus-visible:ring-[#F05D23]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]'
                      )}
                      onClick={(e) => {
                        if (isCarouselNavExcluded(e.target)) return;
                        openCardProject(proj);
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter' && e.key !== ' ') return;
                        if (isCarouselNavExcluded(e.target)) return;
                        e.preventDefault();
                        openCardProject(proj);
                      }}
                    >

                  <div
                    className="relative z-[2] flex h-20 shrink-0 items-center border-b border-[#F05D23]/25 bg-black/60 px-5 backdrop-blur-sm select-none transition-colors duration-500 pointer-events-none md:px-6"
                  >
                    <div className="min-w-0 w-full pointer-events-auto">
                      <CarouselTruncationTooltip
                        key={`carousel-title-${proj.id}`}
                        fullText={proj.title}
                        lineClamp={2}
                        maxHeightClass="max-h-12"
                        side="bottom"
                        tooltipLabel="Full title"
                        onTruncatedBodyActivate={() => openCardProject(proj)}
                        className="holo-shimmer-active w-full font-mono text-[16px] leading-tight tracking-[0.18em] uppercase"
                        style={{
                          backgroundImage:
                            'linear-gradient(90deg, #F05D23 0%, #ff9a5c 40%, #F05D23 60%, #ffffff 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundSize: '200% 100%',
                        }}
                      />
                    </div>
                    <div
                      className="perf-carousel-scan absolute bottom-0 left-0 right-0 h-px"
                      style={{
                        background:
                          'linear-gradient(90deg, transparent 0%, #F05D23 30%, #ff9a5c 50%, #F05D23 70%, transparent 100%)',
                      }}
                    />
                  </div>

                  <div className="relative z-[2] aspect-video w-full shrink-0 overflow-hidden pointer-events-none">
                    <img
                      src={proj.thumbnail}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="carousel-project-card-thumb pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
                    />
                  </div>

                  <div className="relative z-[2] flex min-h-0 flex-col border-t border-[#F05D23]/12 bg-[#0a0a0a] px-5 pb-5 pt-4 md:px-6 md:pb-6 md:pt-5 pointer-events-none">
                    <div className="mb-3 flex items-center justify-between gap-3 md:mb-4">
                      <span
                        className="select-none font-mono text-3xl text-white/20"
                        style={{ fontWeight: 700 }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="relative z-[3] flex shrink-0 gap-2 opacity-80 transition-opacity pointer-events-auto sm:gap-3">
                        {proj.links?.live && (
                          <a
                            href={proj.links.live}
                            data-carousel-exclude-nav="true"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 transition-colors hover:border-[#F05D23] hover:bg-[#F05D23] sm:h-10 sm:w-10"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Open live demo"
                          >
                            <ExternalLink className="h-4 w-4 text-white" />
                          </a>
                        )}
                        {proj.links?.github && (
                          <a
                            href={proj.links.github}
                            data-carousel-exclude-nav="true"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 transition-colors hover:border-[#F05D23] hover:bg-[#F05D23] sm:h-10 sm:w-10"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Open GitHub repository"
                          >
                            <Github className="h-4 w-4 text-white" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="pointer-events-auto min-w-0">
                      <CarouselTruncationTooltip
                        fullText={proj.details}
                        lineClamp={3}
                        side="top"
                        tooltipLabel="Full description"
                        onTruncatedBodyActivate={() => openCardProject(proj)}
                        className="font-mono text-[16px] leading-relaxed text-[#999]"
                      />
                    </div>
                  </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </TooltipPrimitive.Provider>
    </motion.section>
  );
});

const FluidTagTitle = ({ text }: { text: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["end start", "start end"]
  });

  const x1 = useTransform(scrollYProgress, [0, 1], ["-50%", "50%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["50%", "-50%"]);
  const y1 = useTransform(scrollYProgress, [0, 1], ["-50%", "50%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["50%", "-50%"]);
  const bgX = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="flex justify-end w-full mb-16">
      <div ref={ref} className="flex items-center gap-0 w-fit group cursor-default" aria-hidden="true">
        
        {/* The Tag */}
        <div className="relative p-[1px] overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)' }}>
          
          {/* Animated Border wrapper (responds to scroll) - Hellish hues */}
          <motion.div 
            className="absolute inset-0 z-0 bg-gradient-to-r from-[#b91c1c] via-[#F05D23] to-[#7f1d1d]"
            style={{ 
              backgroundSize: '200% 100%',
              backgroundPositionX: bgX 
            }}
          />

          {/* Tag Body */}
          <div className="relative bg-[#0a0a0a] pr-6 pl-8 py-3 flex items-center gap-4 transition-colors duration-700 group-hover:bg-[#0f0202]" style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)' }}>
            
            {/* Internal Fluid Effect - Hellfire Plasma Orbs */}
            <div className="absolute inset-0 z-0 opacity-[0.35] mix-blend-screen pointer-events-none overflow-hidden">
              <motion.div 
                className="absolute w-[150%] h-[150%] rounded-full"
                style={{
                  background: 'radial-gradient(circle at center, rgba(185,28,28,0.5) 0%, transparent 60%)',
                  x: x1,
                  y: y1,
                  left: '-25%',
                  top: '-25%'
                }}
              />
              <motion.div 
                className="absolute w-[150%] h-[150%] rounded-full"
                style={{
                  background: 'radial-gradient(circle at center, rgba(240,93,35,0.4) 0%, transparent 60%)',
                  x: x2,
                  y: y2,
                  left: '-25%',
                  top: '-25%'
                }}
              />
            </div>

            {/* Demonic Watermark (Pentagram) */}
            <motion.div 
              className="absolute -left-4 -bottom-6 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-1000 pointer-events-none z-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              <svg width="70" height="70" viewBox="0 0 100 100" fill="none" stroke="#F05D23" strokeWidth="1">
                <circle cx="50" cy="50" r="48" />
                <path d="M50 2 L88 88 L6 35 L94 35 L12 88 Z" />
              </svg>
            </motion.div>

            {/* Corrupted Barcode (now on the left) */}
            <div className="relative z-10 mr-4 flex gap-[2px] h-5 opacity-40 mix-blend-screen group-hover:opacity-90 transition-opacity duration-500">
               {[1,3,1,2,1,4,1,1,2,1].map((w, i) => (
                 <motion.div 
                   key={i} 
                   className="bg-[#F05D23] group-hover:bg-[#b91c1c] transition-colors duration-500" 
                   style={{ width: `${w}px` }} 
                   animate={{ height: ["100%", "80%", "100%", "90%", "100%"] }}
                   transition={{ 
                     duration: 0.2 + Math.random() * 0.5, 
                     repeat: Infinity, 
                     repeatType: "mirror",
                     delay: Math.random()
                   }}
                 />
               ))}
            </div>
            
            {/* Text */}
            <h3 className="font-mono text-[16px] tracking-[0.2em] text-[#F05D23] group-hover:text-[#ff4400] transition-colors duration-500 uppercase relative z-10 m-0" style={{ textShadow: '0 0 10px rgba(240,93,35,0.3)' }}>
              <ScrambleText text={text} />
            </h3>
            
            {/* Tag Hole / Ember (now on the right) */}
            <div className="w-2.5 h-2.5 rounded-full border border-[#b91c1c] bg-black relative z-10 shadow-[inset_0_0_6px_#b91c1c,0_0_4px_#b91c1c]" />

          </div>
        </div>

        {/* The String / Hellfire Fuse (now connects to the right side) */}
        <div className="w-12 h-[1px] bg-gradient-to-l from-transparent via-[#b91c1c]/50 to-[#b91c1c] relative">
          <motion.div 
             className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#b91c1c]"
             animate={{ opacity: [1, 0.4, 1], scale: [1, 1.3, 1] }}
             transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             style={{ boxShadow: "0 0 12px #b91c1c, 0 0 4px #F05D23" }}
          />
        </div>

      </div>
    </div>
  );
};

type AboutExperienceItem = {
  range: string;
  title: string;
  company: string;
  meta: string;
  detail: string;
  logoSrc: string;
  logoAlt: string;
};

const ABOUT_EXPERIENCE: AboutExperienceItem[] = [
  {
    range: 'Jul 2025 — Present',
    title: 'Lead Product Designer',
    company: 'Innovaccer',
    meta: 'Full-time · Noida · On-site',
    detail:
      'Led the design system behind 20+ products—components in code, Figma plugins, and a new charting library. Drove WCAG 2.2 alignment and shipped MCP skills plus AI-assisted workflows for design and engineering.',
    logoSrc: '/logos/innovaccer-placeholder.svg',
    logoAlt: 'Innovaccer (logo placeholder)',
  },
  {
    range: 'Jul 2022 — Jul 2025',
    title: 'Product UX/UI Designer',
    company: 'Total AI Systems Inc.',
    meta: 'Full-time · United States · Remote',
    detail:
      'Owned UX for flagship products Kollx 360 and Kollx Pro (formerly TotalCollectR)—turning complex collections workflows into clear interfaces and a cohesive strategy for consumers and agents.',
    logoSrc: '/logos/total-ai-placeholder.svg',
    logoAlt: 'Total AI Systems Inc. (logo placeholder)',
  },
  {
    range: 'Jan 2022 — Jun 2022',
    title: 'UX Designer & Front-end Manager',
    company: 'Innov7 Lab',
    meta: 'Full-time · Bengaluru · Remote',
    detail:
      'Research and design for metaverse and Web3 work—DeFi, NFT marketplaces, tokenized real estate, marketing sites, and on-chain apps—while aligning cross-functional teams with Agile Scrum.',
    logoSrc: '/logos/innov7-placeholder.svg',
    logoAlt: 'Innov7 Lab (logo placeholder)',
  },
  {
    range: 'Sep 2021 — Jan 2022',
    title: 'UX Designer (contract)',
    company: 'WeLinQ',
    meta: 'Contract · United Kingdom · Remote',
    detail:
      'Research, design, and testing for Welinq—flows for therapist booking, timeline chat prompts, and an expert dashboard for a mental-health focused social product.',
    logoSrc: '/logos/welinq-placeholder.svg',
    logoAlt: 'WeLinQ (logo placeholder)',
  },
  {
    range: 'Feb 2021 — Sep 2021',
    title: 'UX Designer',
    company: 'Freelancing & Planned Startup',
    meta: '',
    detail: '',
    logoSrc: '',
    logoAlt: '',
  },
];

/** Parallel track (not a job): branches from Total AI card at a date-accurate height. */
const ABOUT_AXION_BRANCH = {
  range: 'Sep 2024 — Present',
  name: 'AXION LAB',
  /** Employment row index this branch is anchored to (Total AI = 1). */
  insertAfterJobIndex: 1,
  /** ISO dates for that employment span — used to place branch Y = (axionStart − jobStart) / (jobEnd − jobStart). */
  anchorJobStart: '2022-07-01',
  anchorJobEnd: '2025-07-01',
  parallelStart: '2024-09-01',
} as const;

function parallelBranchTopPct(parallelStartIso: string, jobStartIso: string, jobEndIso: string): number {
  const t0 = new Date(jobStartIso).getTime();
  const t1 = new Date(jobEndIso).getTime();
  const ta = new Date(parallelStartIso).getTime();
  if (!(t1 > t0)) return 0;
  const p = ((ta - t0) / (t1 - t0)) * 100;
  return Math.min(100, Math.max(0, p));
}

const AXION_BRANCH_TOP_PCT = parallelBranchTopPct(
  ABOUT_AXION_BRANCH.parallelStart,
  ABOUT_AXION_BRANCH.anchorJobStart,
  ABOUT_AXION_BRANCH.anchorJobEnd,
);

/** Horizontal segment from timeline node toward the card (trunk → experience box). */
function ExperienceNodeConnector() {
  return (
    <div
      className="pointer-events-none absolute left-0 top-[1.4375rem] z-0 -translate-x-full md:top-[1.625rem]"
      aria-hidden
    >
      <div
        className="w-5 md:w-7"
        style={{
          height: '2px',
          background: 'linear-gradient(to right, transparent 0%, rgba(240,93,35,0.2) 30%, rgba(240,93,35,0.5))',
          boxShadow: '0 0 8px rgba(240,93,35,0.12)',
        }}
      />
    </div>
  );
}

const AxionParallelCard = React.memo(function AxionParallelCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col justify-center rounded-lg',
        'border border-white/[0.08] border-l-[2px] border-l-[#F05D23]/60 bg-black/50 px-3 py-2.5',
        'shadow-[inset_0_1px_0_0_rgb(255_255_255_/0.04)]',
        className,
      )}
    >
      <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[#F05D23]/80 md:text-[10px]">
        {ABOUT_AXION_BRANCH.range}
      </p>
      <p className="mb-0 font-mono text-[11px] uppercase tracking-[0.14em] leading-snug text-[#e0e0e0] md:text-[12px]">
        {ABOUT_AXION_BRANCH.name}
        <span className="text-[#666]"> — </span>
        <span className="normal-case tracking-wide text-[#999]">Founded open-source non-profit &amp; non-commercial org</span>
      </p>
    </div>
  );
});

const AboutSection = React.memo(() => (
  <div className="w-full min-w-0 py-24 border-t border-white/10">
    <div id="about" className="scroll-mt-8" />
    <div className={CAROUSEL_SECTION_BLEED}>
      <FluidTagTitle text="Experience // 02" />

      <div
        className={cn(
          'mt-2 box-border w-full max-w-none overflow-visible rounded-2xl border border-white/[0.09]',
          'bg-[rgb(14_14_14_/0.5)] shadow-[0_28px_80px_rgb(0_0_0_/0.45),inset_0_1px_0_0_rgb(255_255_255_/0.06)]',
          'backdrop-blur-2xl backdrop-saturate-[1.2]',
          'px-6 py-9 sm:px-9 sm:py-10 md:px-12 md:py-12',
        )}
      >
        <motion.p
          className="w-full min-w-0 max-w-none font-mono text-[16px] leading-[1.85] tracking-wide text-[#e4e4e4] [overflow-wrap:anywhere]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          I&apos;m Abhiroop — a Lead Product Designer and AI Agentic Workflow Strategist with a passion for crafting
          digital experiences that resonate. With over a decade in the design and technology space, I&apos;ve shipped
          17+ products across 50+ clients worldwide, driving 200% revenue growth and impacting 5M+ users. My work sits at
          the intersection of human-centered design and cutting-edge technology.
        </motion.p>

      <div className="relative mt-10 border-t border-white/[0.06] pt-10 md:mt-12 md:pt-12">
        <div className="flex gap-0 pl-3 md:pl-5">
          <div className="relative w-10 shrink-0 md:w-14" aria-hidden>
            <motion.div
              className="pointer-events-none absolute left-1/2 top-3 bottom-3 -translate-x-1/2 origin-top"
              style={{
                width: '2px',
                background: 'linear-gradient(to bottom, rgba(240,93,35,0.9), rgba(240,93,35,0.45) 50%, rgba(255,255,255,0.08))',
                boxShadow: '0 0 14px rgba(240,93,35,0.2), 0 0 40px rgba(240,93,35,0.06)',
              }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
            />
            {/* Ambient glow haze behind trunk */}
            <div
              className="pointer-events-none absolute left-1/2 top-3 bottom-3 w-6 -translate-x-1/2 rounded-full opacity-[0.12] blur-xl"
              style={{ background: 'linear-gradient(to bottom, #F05D23, transparent 85%)' }}
            />
          </div>
          <ol className="relative m-0 min-w-0 flex-1 list-none space-y-12 md:space-y-14 p-0" aria-label="Work experience">
            {ABOUT_EXPERIENCE.map((item, i) => {
              const motionProps = {
                initial: { opacity: 0, y: 36, filter: 'blur(6px)' },
                whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
                viewport: { once: true, margin: '-60px' } as const,
                transition: {
                  duration: 0.75,
                  delay: 0.08 + i * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                },
              };

              const employmentCard = (
                <div
                  className={cn(
                    'exp-card relative z-[1] flex flex-col gap-6 rounded-xl sm:flex-row sm:items-start sm:justify-between sm:gap-8',
                    'border border-white/[0.06] bg-[rgba(8,8,8,0.55)] px-5 py-5 sm:px-6 sm:py-6',
                    'shadow-[inset_0_1px_0_0_rgb(255_255_255_/0.05)]',
                    'transition-all duration-500 hover:border-[#F05D23]/20 hover:bg-[rgba(14,10,8,0.65)]',
                    'hover:shadow-[inset_0_1px_0_0_rgb(255_255_255_/0.05),0_0_40px_rgba(240,93,35,0.04),0_8px_32px_rgba(0,0,0,0.3)]',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#F05D23]/85 md:text-[12px]">
                      {item.range}
                    </p>
                    <h3 className="mb-1.5 font-mono text-[17px] tracking-wide text-[#f4f4f4] md:text-[18px]">
                      {item.title}
                      <span className="text-[#5c5c5c]"> — </span>
                      <span className="text-[#F05D23]">{item.company}</span>
                    </h3>
                    {item.meta && (
                      <p className="mb-0 font-mono text-[13px] tracking-wide text-[#9a9a9a] md:text-[14px]">
                        {item.meta}
                      </p>
                    )}
                    {item.detail && (
                      <p className="mt-3 max-w-none font-mono text-[14px] leading-relaxed tracking-wide text-[#b8b8b8] md:text-[15px]">
                        {item.detail}
                      </p>
                    )}
                  </div>
                  {item.logoSrc && (
                    <div className="shrink-0 sm:pt-0.5">
                      <div className="relative size-[72px] overflow-hidden rounded-xl border border-white/[0.12] bg-[rgb(10_10_10_/0.9)] shadow-[0_8px_32px_rgb(0_0_0_/0.4)]">
                        <img
                          src={item.logoSrc}
                          alt={item.logoAlt}
                          width={72}
                          height={72}
                          className="size-[72px] object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );

              if (i === ABOUT_AXION_BRANCH.insertAfterJobIndex) {
                return (
                  <motion.li
                    key={`${item.company}-${item.range}-with-axion`}
                    className="relative overflow-visible"
                    {...motionProps}
                    aria-label={`${item.company} employment with parallel AXION LAB branch`}
                  >
                    <span
                      className="exp-node absolute left-0 top-4 z-[2] size-3.5 -translate-x-[calc(1.25rem+0.4375rem)] rounded-full border-2 border-[#F05D23] bg-[rgb(8_8_8)] md:-translate-x-[calc(1.75rem+0.5rem)] md:top-[1.125rem] md:size-4"
                      aria-hidden
                    />
                    <ExperienceNodeConnector />
                    <div
                      className="relative z-[1] min-w-0"
                      style={
                        {
                          ['--axion-branch-top' as string]: `${AXION_BRANCH_TOP_PCT}%`,
                        } as React.CSSProperties
                      }
                    >
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_min(17.5rem,34vw)] lg:items-stretch lg:gap-5 xl:grid-cols-[minmax(0,1fr)_min(19rem,32vw)]">
                        <div className="min-w-0">{employmentCard}</div>
                        <div className="relative mt-0 min-h-0 w-full lg:mt-0 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:self-stretch">
                          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#666] lg:hidden">
                            Branch · parallel to role above
                          </p>
                          <div className="lg:hidden">
                            <AxionParallelCard />
                          </div>
                          <div className="relative hidden min-h-0 flex-1 overflow-visible lg:block">
                            {/* Branch connector line */}
                            <div
                              className="pointer-events-none absolute left-0 z-[3] -translate-x-full -translate-y-1/2"
                              style={{ top: 'calc(100% - var(--axion-branch-top))' }}
                              aria-hidden
                            >
                              <div
                                className="w-7 md:w-8"
                                style={{
                                  height: '2px',
                                  background: 'linear-gradient(to right, rgba(240,93,35,0.2), rgba(240,93,35,0.55))',
                                  boxShadow: '0 0 10px rgba(240,93,35,0.15)',
                                }}
                              />
                            </div>
                            {/* Axion card */}
                            <div
                              className="relative z-[2] w-full lg:absolute lg:top-0 lg:left-0 lg:right-0 lg:pl-1"
                              style={{ height: 'calc(100% - var(--axion-branch-top))' }}
                              role="group"
                              aria-label="AXION LAB parallel track"
                            >
                              <AxionParallelCard className="h-full ring-1 ring-[#F05D23]/10" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              }

              return (
                <motion.li key={`${item.company}-${item.range}`} className="relative" {...motionProps}>
                  <span
                    className="exp-node absolute left-0 top-4 z-[2] size-3.5 -translate-x-[calc(1.25rem+0.4375rem)] rounded-full border-2 border-[#F05D23] bg-[rgb(8_8_8)] md:-translate-x-[calc(1.75rem+0.5rem)] md:top-[1.125rem] md:size-4"
                    aria-hidden
                  />
                  <ExperienceNodeConnector />
                  {employmentCard}
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
      </div>
    </div>
  </div>
));

const WORK_CARDS = [
  {
    title: 'Product Design',
    subtitle: 'UI / UX',
    description:
      'End-to-end product design — from user research and wireframing to high-fidelity prototypes and design systems. Crafting intuitive interfaces that users love.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1080',
  },
  {
    title: 'Vibe Coding',
    subtitle: 'AI-Powered',
    description:
      'Leveraging AI agentic workflows and modern tooling to rapidly prototype, iterate, and ship products. Building at the speed of thought with an AI-first approach.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1080',
  },
  {
    title: 'Development',
    subtitle: 'Pre-AI Era',
    description:
      'Full-stack development with React, Node.js, and modern web technologies. Years of hands-on coding experience building scalable, performant applications from scratch.',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1080',
  },
];

const MyWorkSection = React.memo(() => (
  <div className="cv-auto w-full py-24 border-t border-white/10">
    <div id="work" className="scroll-mt-8" />
    <FluidTagTitle text="My Work // 03" />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {WORK_CARDS.map((card, i) => (
        <div
          key={i}
          className="group relative bg-[#0a0a0a] border border-white/5 overflow-hidden hover:border-[#F05D23]/40 transition-all duration-500"
        >
          <div className="relative h-[220px] overflow-hidden">
            <div
              className="about-panel-bg absolute inset-0 bg-cover bg-center image-scale-base"
              style={{ backgroundImage: `url(${card.image})` }}
            />
            <div className="hover-demonic-overlay" />
            <div className="absolute top-4 left-5 z-10 pointer-events-none">
              <span 
                className="font-mono text-[13px] tracking-widest text-[#F05D23] uppercase bg-[#0a0a0a]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#F05D23]/50 shadow-[0_0_15px_rgba(240,93,35,0.15)] flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#F05D23] shadow-[0_0_8px_#F05D23]" />
                {card.subtitle}
              </span>
            </div>
          </div>
          <div className="p-6">
            <h4 className="font-mono text-lg tracking-wide text-white mb-3 uppercase">{card.title}</h4>
            <p className="font-mono text-[16px] text-[#999] leading-relaxed tracking-wide">{card.description}</p>
          </div>
          <div className="absolute top-4 right-5 w-10 h-10 rounded-full border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:border-[#F05D23] group-hover:bg-[#F05D23]/10 transition-all duration-500">
            <ArrowUpRight className="w-4 h-4 text-[#F05D23]" />
          </div>
        </div>
      ))}
    </div>
  </div>
));

const CERTIFICATIONS = [
  {
    title: 'AI For Everyone',
    description: 'Comprehensive understanding of AI technologies, their applications, and strategic implications for business transformation.',
    url: 'https://coursera.org/share/9cbf601beeac9fb2e831d4170f52ad28',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1080',
  },
  {
    title: 'Google UX Design',
    description: 'Professional certification in user experience design, covering research, wireframing, prototyping, and usability testing.',
    url: 'https://coursera.org/share/bf77019fdf390d8c3f01c2bb8851b54c',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1080',
  },
  {
    title: 'Product Management',
    description: 'Strategic product management principles including roadmapping, stakeholder alignment, and data-driven product decisions.',
    url: 'https://coursera.org/share/0d5737a8389a205da01d8cc92028ad18',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1080',
  },
  {
    title: 'Meta Frontend Development',
    description: 'Advanced frontend development with React, responsive design, testing methodologies, and modern web practices.',
    url: 'https://coursera.org/share/4baf63692cc1ea833e1471dccda3f11e',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1080',
  },
];

const CertificationsSection = React.memo(() => (
  <div className="cv-auto w-full py-24 border-t border-white/10">
    <div id="certifications" className="scroll-mt-8" />
    <FluidTagTitle text="Certifications // 04" />

    <div className="space-y-6">
      {CERTIFICATIONS.map((cert, i) => (
        <a
          key={i}
          href={cert.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col md:flex-row gap-0 bg-[#0a0a0a] border border-white/5 overflow-hidden hover:border-[#F05D23]/30 transition-all duration-500 cursor-pointer"
        >
          <div className="relative w-full md:w-[300px] h-[180px] shrink-0 overflow-hidden">
            <div
              className="cert-tile-bg absolute inset-0 bg-cover bg-center image-scale-base"
              style={{ backgroundImage: `url(${cert.image})` }}
            />
            <div className="hover-demonic-overlay" />
          </div>
          <div className="flex flex-col justify-center p-6 md:py-6 md:px-8 flex-1">
            <h4 className="font-mono text-[16px] tracking-wider text-white uppercase mb-2 group-hover:text-[#F05D23] transition-colors">
              <ScrambleText text={cert.title} />
            </h4>
            <p className="font-mono text-[16px] text-[#999] leading-relaxed tracking-wide">
              {cert.description}
            </p>
          </div>
          <div className="hidden md:flex items-center pr-8">
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#F05D23] group-hover:bg-[#F05D23] transition-all duration-500">
              <ArrowUpRight className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
            </div>
          </div>
        </a>
      ))}
    </div>
  </div>
));

const ImageHoverStyles = () => (
  <style>{`
    @keyframes demon-glitch-anim {
      0%, 100% { transform: translate(0, 0) skewX(0deg); filter: contrast(1) brightness(1) sepia(0) hue-rotate(0deg) blur(0px); }
      
      /* First distortion: sudden eerie color bleed and shift */
      10% { transform: translate(0, 0) skewX(0deg); filter: contrast(1) brightness(1) blur(0px); }
      11% { transform: translate(-3px, 2px) skewX(2deg); filter: contrast(1.4) sepia(0.8) hue-rotate(-30deg) saturate(2) brightness(0.9) blur(1px); }
      13% { transform: translate(3px, -1px) skewX(-2deg); filter: contrast(1.2) sepia(0.4) saturate(1.5) brightness(1.1) blur(0px); }
      14% { transform: translate(0, 0) skewX(0deg); filter: contrast(1) brightness(1) sepia(0) blur(0px); }
      
      /* Second distortion: analog tape slip */
      45% { transform: translate(0, 0) skewX(0deg); filter: contrast(1) brightness(1) blur(0px); }
      46% { transform: translate(2px, 3px) skewX(-1deg); filter: contrast(1.5) sepia(1) hue-rotate(-15deg) saturate(2.5) brightness(0.8) blur(2px); }
      48% { transform: translate(-2px, -2px) skewX(1deg); filter: contrast(1.3) sepia(0.5) hue-rotate(15deg) brightness(1.1) blur(0px); }
      49% { transform: translate(0, 0) skewX(0deg); filter: contrast(1) brightness(1) blur(0px); }
      
      /* Third distortion: quick stutter */
      75% { transform: translate(0, 0) skewX(0deg); filter: contrast(1) brightness(1); }
      76% { transform: translate(-4px, 0) skewX(3deg); filter: contrast(1.3) hue-rotate(-40deg) saturate(2) brightness(0.9); }
      77% { transform: translate(4px, 0) skewX(-3deg); filter: contrast(1.1) hue-rotate(20deg) brightness(1.05); }
      78% { transform: translate(0, 0) skewX(0deg); filter: contrast(1) brightness(1); }
    }

    @keyframes demon-scanline-flash {
      0%, 100% { opacity: 0; background: transparent; }
      
      10% { opacity: 0; }
      11% { opacity: 0.5; background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(240, 93, 35, 0.3) 4px, rgba(0, 0, 0, 0.4) 6px); mix-blend-mode: overlay; }
      13% { opacity: 0; }
      
      /* Simulating a tracking bar rolling down */
      45% { opacity: 0; }
      46% { opacity: 0.6; background: repeating-linear-gradient(0deg, transparent, transparent 40%, rgba(185, 28, 28, 0.4) 45%, transparent 50%); mix-blend-mode: hard-light; background-size: 100% 200%; background-position: 0% 0%; }
      47% { opacity: 0.6; background-position: 0% 50%; mix-blend-mode: hard-light; }
      48% { opacity: 0.6; background-position: 0% 100%; mix-blend-mode: hard-light; }
      49% { opacity: 0; }
      
      75% { opacity: 0; }
      76% { opacity: 0.4; background: rgba(0, 0, 0, 0.6); mix-blend-mode: overlay; }
      77% { opacity: 0.5; background: rgba(240, 93, 35, 0.25); mix-blend-mode: color-burn; }
      78% { opacity: 0; }
    }

    .hover-demonic-overlay {
      position: absolute;
      inset: 0;
      z-index: 10;
      pointer-events: none;
      opacity: 0;
      will-change: opacity, background, mix-blend-mode;
    }
    
    .group:hover .hover-demonic-overlay {
      animation: demon-scanline-flash 4s infinite steps(1);
    }

    .image-scale-base {
      will-change: transform, filter;
    }
    
    .group:hover .image-scale-base {
      animation: demon-glitch-anim 4s infinite steps(1);
    }

    /* ── Timeline premium effects ── */
    @keyframes exp-node-pulse {
      0% { box-shadow: 0 0 10px rgba(240,93,35,0.35), 0 0 20px rgba(240,93,35,0.12), 0 0 0 0 rgba(240,93,35,0.25); }
      70% { box-shadow: 0 0 10px rgba(240,93,35,0.35), 0 0 20px rgba(240,93,35,0.12), 0 0 0 12px rgba(240,93,35,0); }
      100% { box-shadow: 0 0 10px rgba(240,93,35,0.35), 0 0 20px rgba(240,93,35,0.12), 0 0 0 0 rgba(240,93,35,0); }
    }

    .exp-node {
      box-shadow: 0 0 10px rgba(240,93,35,0.35), 0 0 20px rgba(240,93,35,0.12);
      animation: exp-node-pulse 3s ease-out infinite;
    }

    .exp-card {
      position: relative;
    }

    .exp-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0;
      transition: opacity 0.5s;
      background: linear-gradient(135deg, rgba(240,93,35,0.04) 0%, transparent 50%, rgba(240,93,35,0.02) 100%);
      pointer-events: none;
    }

    .exp-card:hover::before {
      opacity: 1;
    }
  `}</style>
);

/* ─── Section IDs for nav tracking ─── */
const SECTION_IDS = ['home', 'projects', 'about', 'work', 'certifications'] as const;
type SectionId = typeof SECTION_IDS[number];

/* ─── Main App ─── */
export default function App() {
  const dataStreams = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    x: 10 + (i * 12) % 80, y: 15 + (i * 22) % 70, delay: i * 0.5
  })), []);

  const crosshairs = useMemo(() => [
    { x: 65, y: 15, delay: 0 }, { x: 85, y: 35, delay: 2 },
    { x: 50, y: 70, delay: 4 }, { x: 75, y: 80, delay: 1 },
    { x: 90, y: 55, delay: 3 },
  ], []);

  const scrollContainerRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('home');

  // IntersectionObserver to track which section is in view
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const sectionElements = SECTION_IDS.map(id => container.querySelector(`#${id}`)).filter(Boolean) as HTMLElement[];

    // Map to track visibility ratios per section
    const visibilityMap = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibilityMap.set(entry.target.id, entry.intersectionRatio);
        });

        // Determine most visible section
        let bestId: SectionId = 'home';
        let bestRatio = 0;

        visibilityMap.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id as SectionId;
          }
        });

        // If nothing is very visible, check scroll position for home
        if (bestRatio < 0.05 && container.scrollTop < 100) {
          bestId = 'home';
        }

        setActiveSection(bestId);
      },
      {
        root: container,
        threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.7, 1],
        rootMargin: '-10% 0px -10% 0px',
      }
    );

    sectionElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((sectionId: SectionId) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      const container = scrollContainerRef.current;
      if (!container) return;

      const target = container.querySelector(`#${sectionId}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
  }, []);

  return (
    <main className="h-screen w-full bg-[#030303] text-white overflow-hidden flex relative selection:bg-[#F05D23] selection:text-black">
      <ImageHoverStyles />
      <NoiseOverlay />
      <BackgroundChaseScene />

      {/* ── Animated Background Elements ── */}
      <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden">
        <RadarRings />

        {dataStreams.map((ds, i) => <DataStream key={`ds-${i}`} {...ds} />)}
        {crosshairs.map((c, i) => <AnimatedCrosshair key={`cross-${i}`} {...c} />)}

        {/* Corner Brackets */}
        <div
          className="perf-corner-tr absolute top-10 right-10 w-16 h-16 border-t border-r"
          style={{ borderColor: `${THEME_ORANGE}30` }}
        />
        <div
          className="perf-corner-br absolute bottom-10 right-10 w-16 h-16 border-b border-r"
          style={{ borderColor: `${THEME_ORANGE}30` }}
        />
      </div>

      {/* ── Background Layer (Scroll-driven Frame Sequence) ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      >
        <ScrollFramePlayer
          scrollContainer={scrollContainerRef}
          className="h-full w-full"
          style={{
            filter: 'grayscale(100%) sepia(100%) hue-rotate(350deg) saturate(300%)',
            opacity: 0.2,
            transform: 'translateZ(0)',
          }}
        />
      </div>

      {/* ── Subtle Vignette ── */}
      <div className="absolute inset-0 pointer-events-none z-[3]" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />

      {/* ── Left Navigation Sidebar ── */}
      <aside className="w-[320px] shrink-0 h-full flex flex-col justify-between py-16 px-16 relative z-10">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}>
          <NavLink href="#home" isActive={activeSection === 'home'} onClick={scrollToSection('home')}>HOME</NavLink>
        </motion.div>

        {/* Crosshairs Decoration */}
        <motion.div className="absolute top-[35%] left-16 -translate-y-1/2" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <Crosshair className="w-5 h-5" />
        </motion.div>
        
        <motion.div className="flex flex-col gap-4" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}>
          <NavLink href="#projects" isActive={activeSection === 'projects'} onClick={scrollToSection('projects')}>PROJECTS</NavLink>
          <NavLink href="#about" isActive={activeSection === 'about'} onClick={scrollToSection('about')}>EXPERIENCE</NavLink>
          <NavLink href="#work" isActive={activeSection === 'work'} onClick={scrollToSection('work')}>MY WORK</NavLink>
          <NavLink href="#certifications" isActive={activeSection === 'certifications'} onClick={scrollToSection('certifications')}>CERTIFICATIONS</NavLink>
        </motion.div>

        <motion.div className="flex flex-col gap-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}>
          <button 
            className="group relative flex items-center justify-between gap-3 px-5 py-3 border border-[#b91c1c]/30 bg-black/60 backdrop-blur-sm hover:bg-[#1a0505] hover:border-[#F05D23]/60 transition-all duration-500 rounded-sm overflow-hidden cursor-pointer shadow-[0_0_15px_rgba(185,28,28,0.1)] hover:shadow-[0_0_20px_rgba(240,93,35,0.2)]"
            onClick={() => console.log('Summoning AI...')}
          >
            {/* Demonic scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(185,28,28,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20 group-hover:opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F05D23]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            <div className="flex items-center gap-3 relative z-10">
              {/* Hellfire Core / Eye */}
              <div className="relative w-3 h-3 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full border border-[#b91c1c] scale-[1.5] group-hover:scale-[2] opacity-50 transition-transform duration-700" />
                <span className="absolute inset-0 rounded-full border border-[#F05D23] opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#F05D23] shadow-[0_0_8px_#F05D23] animate-pulse" />
              </div>
              <span className="font-mono text-[13px] tracking-[0.15em] text-[#ccc] group-hover:text-white transition-colors uppercase">
                Summon AI
              </span>
            </div>
            <span className="relative z-10 font-mono text-[10px] text-[#b91c1c] tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              [CHAT]
            </span>
          </button>
        </motion.div>
      </aside>

      {/* ── Main Content Area ── */}
      <section
        ref={scrollContainerRef}
        className="relative z-10 flex h-full min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-clip pr-8 [overflow-clip-margin:3rem] md:pr-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <div className="mx-auto w-full min-w-0 max-w-7xl pb-24 pl-8 md:pl-16">
          {/* ─ Hero Section ── */}
          <div id="home" className="min-h-screen flex flex-col justify-end relative pb-8">

            {/* ── Hero Content ── */}
            <div className="flex-1 flex flex-col justify-end pb-4">

              {/* ── Metrics Sentence ── */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8 mt-[80px] text-white/80 font-mono tracking-wide max-w-xl ml-auto text-right"
                style={{ fontSize: '16px', lineHeight: 1.65, letterSpacing: '-0.01em' }}
              >
                Shipped <GlitchStatNumber value="17+" staggerMs={0} /> products, driving <GlitchStatNumber value="200%" staggerMs={380} /> revenue growth across <GlitchStatNumber value="50+" staggerMs={760} /> clients worldwide — with <GlitchStatNumber value="12" staggerMs={1140} /> design awards, <GlitchStatNumber value="98%" staggerMs={1520} /> client satisfaction, and <GlitchStatNumber value="5M+" staggerMs={1900} /> users impacted.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="-ml-8 md:-ml-16"
              >
                <p
                  className="text-[#999999] mb-4 flex items-center gap-3"
                  style={{ fontFamily: '"Space Mono", monospace', fontSize: '16px', letterSpacing: '0.15em' }}
                >
                  <span className="w-8 h-[1px] bg-[#999999]" />
                  HELLO, I'M
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mb-4 -ml-8 md:-ml-16"
              >
                <h1
                  className="text-[#f2f2f2]"
                  style={{
                    fontSize: 'clamp(3.75rem, 9vw, 9rem)',
                    lineHeight: 0.9,
                    letterSpacing: '-0.04em',
                    fontWeight: 500,
                  }}
                >
                  <span className="landing-title-name uppercase">Abhiroop</span>
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
                className="mt-[4px] -ml-8 md:-ml-16"
              >
                <div className="relative inline-block pb-1 overflow-hidden">
                  <h2
                    className="flex flex-wrap items-center text-[#cccccc]"
                    style={{
                      fontFamily: '"Space Mono", monospace',
                      fontSize: 'clamp(1rem, 1.65vw, 1.45rem)',
                      lineHeight: 1.4,
                      letterSpacing: '-0.02em',
                      fontWeight: 400,
                    }}
                  >
                    Lead Product Designer
                    <GlitchPlus />
                    AI Agentic Workflow Strategist
                  </h2>
                </div>
              </motion.div>

              {/* Integrated Carousel positioned directly under the title area */}
              <div id="projects" className="scroll-mt-8" />
              <SmoothCarousel />
            </div>
          </div>

          {/* ── Sections ── */}
          <AboutSection />
          <MyWorkSection />
          <CertificationsSection />

          {/* ── Footer ── */}
          <footer className="pt-24 pb-12 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
              <div>
                <h4 className="font-mono text-[16px] tracking-widest text-[#F05D23] uppercase mb-6">Get In Touch</h4>
                <a
                  href="mailto:hello@abhiroop.design"
                  className="font-mono text-[16px] text-[#ccc] hover:text-[#F05D23] transition-colors tracking-wide"
                >
                  hello@abhiroop.design
                </a>
              </div>
              <div>
                <h4 className="font-mono text-[16px] tracking-widest text-[#F05D23] uppercase mb-6">Connect</h4>
                <div className="flex flex-col gap-3">
                  <a href="https://behance.net/abhiroopchaudhuri" target="_blank" rel="noopener noreferrer" className="font-mono text-[16px] text-[#999] hover:text-[#F05D23] transition-colors tracking-wide">Behance</a>
                  <a href="https://github.com/abhiroopchaudhuri" target="_blank" rel="noopener noreferrer" className="font-mono text-[16px] text-[#999] hover:text-[#F05D23] transition-colors tracking-wide">GitHub</a>
                  <a href="https://linkedin.com/in/abhiroopchaudhuri" target="_blank" rel="noopener noreferrer" className="font-mono text-[16px] text-[#999] hover:text-[#F05D23] transition-colors tracking-wide">LinkedIn</a>
                </div>
              </div>
              <div>
                <h4 className="font-mono text-[16px] tracking-widest text-[#F05D23] uppercase mb-6">Manifesto</h4>
                <p className="font-mono text-[16px] text-[#999] tracking-wide">I design and develop with my AI minions,</p>
                <p className="font-mono text-[16px] text-[#999] tracking-wide mt-2">Built at the speed of thought.</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/5">
              <p className="text-[#666] font-mono text-[16px] tracking-widest">© 2026 ABHIROOP CHAUDHURI</p>
              <p className="text-[#666] font-mono text-[16px] tracking-widest flex flex-wrap items-center justify-center md:justify-end gap-2 text-center md:text-right">
                DESIGNED IN THE ABYSS <span className="text-[#F05D23]">&#9670;</span> CONJURED BY AI AGENTS
              </p>
            </div>
          </footer>

        </div>
      </section>

    </main>
  );
}