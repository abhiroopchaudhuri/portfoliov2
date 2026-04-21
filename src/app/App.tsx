import React, { useEffect, useLayoutEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, ExternalLink, Github, ArrowUpRight, Menu, X } from 'lucide-react';
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
  'relative z-10 min-w-0 box-border max-w-none',
  'w-[calc(100%+2.5rem)] -ml-5 -mr-5',
  'md:w-[calc(100%+7rem)] md:-ml-16 md:-mr-12',
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

/* ─── HellCard ───
 * The default card surface for this site: grid backdrop, radial glow orb,
 * and four corner brackets. Square corners (no rounded radius). Use as the
 * outer shell for any content block that needs the "abyss" treatment.
 */
type HellCardProps = {
  children: React.ReactNode;
  className?: string;
  /** Hide the glow orb on smaller / tighter tiles. */
  noGlow?: boolean;
  /** Orb position — 'tr' default, top-right; 'br' = bottom-right. */
  orbPosition?: 'tr' | 'br';
  /** Wrapper element tag. */
  as?: 'div' | 'section' | 'article';
  id?: string;
  role?: string;
  'aria-label'?: string;
  style?: React.CSSProperties;
};

const HellCard = React.memo(function HellCard({
  children,
  className,
  noGlow = false,
  orbPosition = 'tr',
  as: Component = 'div',
  id,
  role,
  style,
  ...rest
}: HellCardProps) {
  return (
    <Component
      id={id}
      role={role}
      aria-label={rest['aria-label']}
      style={style}
      className={cn(
        'relative overflow-hidden border border-white/10',
        // Translucent dark surface: site background shows through as a faint
        // blur rather than being fully blocked out.
        'bg-gradient-to-br from-[#0a0302]/65 via-[#0a0a0a]/55 to-[#050505]/55',
        'backdrop-blur-xl backdrop-saturate-[1.15]',
        className,
      )}
    >
      {/* Grid backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(240,93,35,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(240,93,35,0.07) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 75%)',
        }}
      />
      {/* Glow orb — lighter so it doesn't wash out the right edge */}
      {!noGlow && (
        <div
          aria-hidden
          className={cn(
            'absolute w-[380px] h-[380px] rounded-full pointer-events-none',
            orbPosition === 'tr' ? '-top-32 -right-28' : '-bottom-32 -right-28',
          )}
          style={{
            background: 'radial-gradient(circle, rgba(240,93,35,0.10) 0%, transparent 70%)',
            filter: 'blur(28px)',
          }}
        />
      )}
      {/* Corner brackets */}
      <span className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#F05D23] pointer-events-none" aria-hidden />
      <span className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#F05D23] pointer-events-none" aria-hidden />
      <span className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#F05D23] pointer-events-none" aria-hidden />
      <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#F05D23] pointer-events-none" aria-hidden />

      <div className="relative z-10">{children}</div>
    </Component>
  );
});

const hexChars = "0123456789ABCDEF";
const DataStream = React.memo(({ delay, x, y }: { delay: number, x: number, y: number }) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const tick = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      let str = '';
      for (let i = 0; i < 6; i++) str += hexChars[(Math.random() * 16) | 0];
      if (spanRef.current) spanRef.current.textContent = '0x' + str;
    };
    const start = () => {
      if (interval) return;
      tick();
      interval = setInterval(tick, 420);
    };
    const stop = () => {
      if (interval) { clearInterval(interval); interval = null; }
    };
    const onVis = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVis);
    };
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
  const scrambleRunRef = useRef(0);
  const chars = '!<>-_\\\\/[]{}—=+*^?#________';

  // Fire the decrypt scramble only when the cursor leaves (not on enter,
  // not on mount). Short and snappy.
  const runScrambleReveal = useCallback(() => {
    const runId = ++scrambleRunRef.current;
    let iteration = 0;
    const speed = 0.9; // faster reveal → shorter animation
    const interval = setInterval(() => {
      if (runId !== scrambleRunRef.current) {
        clearInterval(interval);
        return;
      }
      const result = text.split('').map((_char, index) => {
        if (index < iteration) return text[index];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      if (textRef.current) textRef.current.textContent = result;
      if (glitchRef.current) glitchRef.current.textContent = result;
      if (iteration >= text.length) {
        if (textRef.current) textRef.current.textContent = text;
        if (glitchRef.current) glitchRef.current.textContent = text;
        clearInterval(interval);
      }
      iteration += speed;
    }, 22);
  }, [text]);

  return (
    <Component
      className={cn("relative inline-block", className)}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        runScrambleReveal();
      }}
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



const carouselTooltipContentClass = cn(
  'z-[200] max-w-[min(22rem,calc(100vw-2rem))] border border-[#F05D23]/45',
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
            className="flex h-11 w-11 md:h-9 md:w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white/90 transition-colors hover:border-[#F05D23]/50 hover:text-[#F05D23]"
            aria-label="Previous project"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="flex h-11 w-11 md:h-9 md:w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white/90 transition-colors hover:border-[#F05D23]/50 hover:text-[#F05D23]"
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
          <div className="flex items-stretch [touch-action:pan-x_pan-y]">
            {CAROUSEL_PROJECTS.map((proj, idx) => {
              return (
                <div
                  key={proj.id}
                  className="box-border flex min-h-0 min-w-0 shrink-0 grow-0 basis-[82%] sm:basis-[52%] lg:basis-[38%]"
                >
                  <div className="carousel-card-shell group relative flex min-h-0 w-full flex-1 hover:z-10">
                    <div className="carousel-card-shell-glow" aria-hidden />
                    <div
                      role="link"
                      tabIndex={0}
                      aria-label={`Open project: ${proj.title}`}
                      className={cn(
                        'carousel-project-card relative z-[2] flex min-h-0 w-full cursor-pointer flex-col overflow-hidden bg-[#0a0a0a]',
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

/** Thin, clean horizontal connector from the trunk dot to the card's left
 * edge. No glow, no rounded-rectangle gradient — just a 1px orange line so
 * the dot reads as wired to its card.
 *
 * Horizontal math (matches the dot in the <li>):
 *   mobile (pl-3=12, w-10=40)  → trunk at 32px from parent, li at 52px, so
 *                                the dot sits at left:-20px. A connector
 *                                drawn from left:-20px + dot radius (6px)
 *                                to left:0 of li is 14px wide.
 *   desktop (pl-5=20, w-14=56) → trunk at 48px from parent, li at 76px, so
 *                                dot at left:-28px. Connector from
 *                                left:-28 + dot radius (7px) to left:0
 *                                is 21px wide.
 */
function ExperienceNodeConnector() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-[1.5rem] md:top-[1.75rem] z-[1] h-px bg-[#F05D23]/55 left-[-0.875rem] w-[0.875rem] md:left-[-1.3125rem] md:w-[1.3125rem]"
    />
  );
}

const AxionParallelCard = React.memo(function AxionParallelCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex flex-col justify-center',
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

      {/* Hanging tag — straddles the bottom-right card stroke (only the
         tag's top ~2px overlap the border). Tag height ≈18px; offsetting
         by -16px leaves just the top inside the card, so the tag is fully
         clear of the description text above. */}
      <div
        className="pointer-events-none absolute z-[4] flex items-center gap-1.5 bg-[#0a0302] border border-[#F05D23]/75 px-2 py-0.5 shadow-[0_0_14px_rgba(240,93,35,0.35)]"
        style={{ bottom: '-16px', right: '12px' }}
        aria-hidden
      >
        <span className="w-1 h-1 rounded-full bg-[#F05D23] shadow-[0_0_6px_#F05D23]" />
        <span
          className="font-mono text-[8.5px] md:text-[9px] tracking-[0.18em] uppercase text-[#F05D23]"
          style={{ textShadow: '0 0 8px rgba(240,93,35,0.4)', fontWeight: 700 }}
        >
          Opensource <span className="text-[#F05D23]/60">+</span> Non-profit
        </span>
      </div>
    </div>
  );
});

const AboutSection = React.memo(() => (
  // Not wrapped in `.cv-auto` — this section uses CAROUSEL_SECTION_BLEED to
  // paint outside its column, and `content-visibility: auto` enforces
  // `contain: paint`, which would clip the bleed and hide the first
  // characters of every line of the intro paragraph.
  <div className="w-full min-w-0 py-14 md:py-24 border-t border-white/10">
    <div id="experience" className="scroll-mt-20 md:scroll-mt-8" />
    <div className={CAROUSEL_SECTION_BLEED}>
      <FluidTagTitle text="Experience // 02" />

      <HellCard
        className={cn(
          'mt-2 box-border w-full max-w-none',
          // Tighter inner padding per feedback.
          'px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8',
        )}
      >
        {/* Orange "hello" glyph — in-flow block, clear from the paragraph */}
        <motion.div
          aria-hidden
          className="mb-4 md:mb-5 block select-none"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative inline-flex items-center gap-2 px-3 py-1.5 bg-[#0a0302] border border-[#F05D23]/60 shadow-[0_0_18px_rgba(240,93,35,0.35),inset_0_1px_0_rgba(255,255,255,0.05)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F05D23] shadow-[0_0_8px_#F05D23] animate-pulse" aria-hidden />
            <span
              className="font-mono text-[12px] md:text-[13px] font-bold tracking-[0.22em] uppercase text-[#F05D23]"
              style={{ textShadow: '0 0 12px rgba(240,93,35,0.55)' }}
            >
              hello()
            </span>
            {/* Tiny waving hand SVG */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F05D23"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="-ml-0.5"
            >
              <path d="M8 13V5.5a1.5 1.5 0 013 0V11" />
              <path d="M11 11V4a1.5 1.5 0 013 0v7" />
              <path d="M14 11V5.5a1.5 1.5 0 013 0V13" />
              <path d="M17 11V7.5a1.5 1.5 0 013 0v6a8 8 0 01-14 5.5l-3.5-5a1.5 1.5 0 012.2-2l2.3 2" />
            </svg>
            {/* Bracket decorations */}
            <span className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-[#F05D23]" aria-hidden />
            <span className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-[#F05D23]" aria-hidden />
          </div>
        </motion.div>

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

      <div className="relative mt-6 border-t border-white/[0.06] pt-6 md:mt-8 md:pt-8">
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
          <ol className="relative m-0 min-w-0 flex-1 list-none space-y-8 md:space-y-10 p-0" aria-label="Work experience">
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
                    'exp-card relative z-[2] flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6',
                    // Fully opaque so the long branch connector behind the
                    // card is hidden (not bleeding through a translucent bg).
                    'border border-white/[0.06] bg-[#080808] px-4 py-4 sm:px-5 sm:py-5',
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
                      <div className="relative size-[72px] overflow-hidden border border-[#F05D23]/30 bg-[rgb(10_10_10_/0.9)] shadow-[0_8px_32px_rgb(0_0_0_/0.4)]">
                        <img
                          src={item.logoSrc}
                          alt={item.logoAlt}
                          width={72}
                          height={72}
                          className="block size-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                        {/* Consistent corner brackets — same treatment for every logo */}
                        <span className="pointer-events-none absolute top-1 left-1 w-2 h-2 border-t border-l border-[#F05D23]" aria-hidden />
                        <span className="pointer-events-none absolute top-1 right-1 w-2 h-2 border-t border-r border-[#F05D23]" aria-hidden />
                        <span className="pointer-events-none absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#F05D23]" aria-hidden />
                        <span className="pointer-events-none absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#F05D23]" aria-hidden />
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
                      className="exp-node absolute top-[1.125rem] z-[2] h-3 w-3 rounded-full bg-[#F05D23] shadow-[0_0_10px_rgba(240,93,35,0.9)] md:h-3.5 md:w-3.5 md:top-[1.3125rem] left-[-1.25rem] md:left-[-1.75rem] -translate-x-1/2"
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
                      {/* Long branch connector — runs from the main trunk,
                          behind the Total AI employment card (which is z-[2]
                          with an opaque bg), out to the Axion card's left
                          edge. Uses `right: var(--axion-col-right)` set in a
                          tiny style block below so the same rule works on
                          lg and xl (different axion column widths). */}
                      <div
                        className="axion-branch-line hidden lg:block pointer-events-none absolute z-0"
                        style={{
                          top: 'calc(100% - var(--axion-branch-top))',
                          transform: 'translateY(-50%)',
                          left: '-1.75rem',
                          height: '2px',
                          background:
                            'linear-gradient(to right, rgba(240,93,35,0.9) 0%, rgba(240,93,35,0.55) 50%, rgba(240,93,35,0.9) 100%)',
                          boxShadow: '0 0 10px rgba(240,93,35,0.15)',
                        }}
                        aria-hidden
                      />
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
                            {/* Small connector stub across the grid gap into the Axion card */}
                            <div
                              className="pointer-events-none absolute left-0 z-[3] -translate-x-full -translate-y-1/2"
                              style={{ top: 'calc(100% - var(--axion-branch-top))' }}
                              aria-hidden
                            >
                              <div
                                className="w-7 md:w-8"
                                style={{
                                  height: '2px',
                                  background: 'linear-gradient(to right, rgba(240,93,35,0.55), rgba(240,93,35,0.85))',
                                  boxShadow: '0 0 10px rgba(240,93,35,0.15)',
                                }}
                              />
                            </div>
                            {/* Axion card — anchored to the branch connector
                                at the bottom; top extends slightly above the
                                Innovaccer card so the parallel track reads as
                                larger/independent without moving the base. */}
                            <div
                              className="relative z-[2] w-full lg:absolute lg:left-0 lg:right-0 lg:pl-1"
                              style={{
                                top: 'calc(0px - clamp(1.25rem, 2.5vw, 2.5rem))',
                                height:
                                  'calc(100% - var(--axion-branch-top) + clamp(1.25rem, 2.5vw, 2.5rem))',
                              }}
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
                    className="exp-node absolute top-[1.125rem] z-[2] h-3 w-3 rounded-full bg-[#F05D23] shadow-[0_0_10px_rgba(240,93,35,0.9)] md:h-3.5 md:w-3.5 md:top-[1.3125rem] left-[-1.25rem] md:left-[-1.75rem] -translate-x-1/2"
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
      </HellCard>
    </div>
  </div>
));

/* ─── Showcase gallery tile ───
 * A simple uniform gallery card — every tile is identical in shape and
 * behaviour. Cover image on top, title below, short description. Renders
 * every project, arranged in a 3-column grid on desktop.
 */
const ShowcaseGalleryCard = ({
  project,
  index,
}: {
  project: CarouselProject;
  index: number;
}) => {
  const navigate = useNavigate();

  const open = () => {
    const u = project.cardUrl?.trim() || project.links?.live?.trim() || project.links?.github?.trim() || '';
    if (!u) return;
    if (isInternalCardHref(u)) navigate(u);
    else window.open(u, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      role="link"
      tabIndex={0}
      aria-label={`Open ${project.title}`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: 0.04 * (index % 9), ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'showcase-tile relative flex flex-col cursor-pointer overflow-hidden',
        'bg-[#0a0a0a] border border-white/[0.08] hover:border-[#F05D23]/55',
        'transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#F05D23]/60',
      )}
    >
      {/* Cover image — fixed aspect so every tile has the same shape */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#050505]">
        <div
          className="showcase-tile-thumb absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${project.thumbnail})` }}
        />
        <div
          className="showcase-tile-wash absolute inset-0 pointer-events-none opacity-0"
          style={{
            background: 'linear-gradient(135deg, rgba(240,93,35,0.2) 0%, transparent 70%)',
            transition: 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          aria-hidden
        />
        {/* Arrow */}
        <div className="showcase-tile-arrow absolute top-3 right-3 z-10 w-9 h-9 rounded-full border border-white/15 bg-black/55 backdrop-blur-md flex items-center justify-center transition-all duration-300">
          <ArrowUpRight className="w-4 h-4 text-white/80 transition-colors" />
        </div>
        {/* Index */}
        <div className="absolute top-3 left-3 z-10 font-mono text-[10px] tracking-[0.3em] text-white/80 uppercase bg-black/55 backdrop-blur-sm px-2 py-0.5">
          // {String(index + 1).padStart(2, '0')}
        </div>
      </div>

      {/* Title + description — tooltip fires only when the line-clamp
          actually truncates; the card still navigates on click. */}
      <div className="relative flex flex-col gap-2 px-4 md:px-5 py-4 md:py-5">
        <CarouselTruncationTooltip
          fullText={project.title}
          lineClamp={2}
          side="bottom"
          tooltipLabel="Full title"
          onTruncatedBodyActivate={open}
          className="font-mono text-[14px] md:text-[15px] tracking-[0.12em] uppercase leading-tight text-white"
        />
        <CarouselTruncationTooltip
          fullText={project.details}
          lineClamp={3}
          side="top"
          tooltipLabel="Full description"
          onTruncatedBodyActivate={open}
          className="font-mono text-[13px] leading-relaxed tracking-wide text-[#9a9a9a]"
        />
        <span
          className="showcase-tile-accent absolute left-0 bottom-0 h-[2px] w-0 bg-gradient-to-r from-[#F05D23] via-[#ff9a5c] to-transparent transition-all duration-500"
          aria-hidden
        />
      </div>

      {/* Corner brackets */}
      <span className="showcase-tile-bracket pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#F05D23]/40 transition-colors duration-300 z-[3]" aria-hidden />
      <span className="showcase-tile-bracket pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#F05D23]/40 transition-colors duration-300 z-[3]" aria-hidden />
    </motion.div>
  );
};

const MyWorkSection = React.memo(() => (
  <div className="cv-auto w-full py-14 md:py-24 border-t border-white/10">
    <div id="showcase" className="scroll-mt-20 md:scroll-mt-8" />
    <FluidTagTitle text="Showcase // 03" />

    <TooltipPrimitive.Provider delayDuration={280} skipDelayDuration={120}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
        {CAROUSEL_PROJECTS.map((project, i) => (
          <ShowcaseGalleryCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </TooltipPrimitive.Provider>
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
  <div className="cv-auto w-full py-14 md:py-24 border-t border-white/10">
    <div id="certifications" className="scroll-mt-20 md:scroll-mt-8" />
    <FluidTagTitle text="Certifications // 04" />

    <HellCard className="px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
        {CERTIFICATIONS.map((cert, i) => (
          <a
            key={i}
            href={cert.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col bg-[#0a0a0a]/70 border border-white/10 overflow-hidden hover:border-[#F05D23]/40 transition-all duration-500 cursor-pointer"
          >
            <div className="relative w-full h-[180px] shrink-0 overflow-hidden">
              <div
                className="cert-tile-bg absolute inset-0 bg-cover bg-center image-scale-base"
                style={{ backgroundImage: `url(${cert.image})` }}
              />
              <div className="hover-demonic-overlay" />
              <div className="absolute top-3 right-3 z-10">
                <div className="w-9 h-9 rounded-full border border-white/15 bg-black/60 backdrop-blur-md flex items-center justify-center group-hover:border-[#F05D23] group-hover:bg-[#F05D23]/90 transition-all duration-500">
                  <ArrowUpRight className="w-4 h-4 text-white/70 group-hover:text-black transition-colors" />
                </div>
              </div>
            </div>
            <div className="flex flex-col p-6">
              <h4 className="font-mono text-[15px] tracking-wider text-white uppercase mb-2 group-hover:text-[#F05D23] transition-colors">
                <ScrambleText text={cert.title} />
              </h4>
              <p className="font-mono text-[14px] text-[#999] leading-relaxed tracking-wide">
                {cert.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </HellCard>
  </div>
));

/* Hover-glitch + timeline pulse styles live in src/styles/hover-glitch.css. */

/* ─── Section IDs for nav tracking ─── */
const SECTION_IDS = ['home', 'highlights', 'experience', 'showcase', 'certifications'] as const;
type SectionId = typeof SECTION_IDS[number];

const SECTION_LABELS: Record<SectionId, string> = {
  home: 'HOME',
  highlights: 'HIGHLIGHTS',
  experience: 'EXPERIENCE',
  showcase: 'SHOWCASE',
  certifications: 'CERTIFICATIONS',
};

/* ─── Mobile Floating "AI Chat" Button (<md only) ─── */
const MobileSummonAIButton = React.memo(() => (
  <button
    type="button"
    onClick={() => console.log('Summoning AI...')}
    aria-label="AI Chat"
    className="md:hidden group fixed z-[50] flex flex-col items-center justify-center w-[64px] h-[64px] border border-[#F05D23]/40 bg-[#050505]/90 backdrop-blur-md overflow-hidden active:bg-[#1a0505] active:border-[#F05D23] transition-colors duration-300 shadow-[0_0_24px_rgba(240,93,35,0.2),0_10px_28px_rgba(0,0,0,0.55)] cursor-pointer"
    style={{
      bottom: 'max(env(safe-area-inset-bottom), 1.25rem)',
      right: 'max(env(safe-area-inset-right), 1.25rem)',
    }}
  >
    {/* Scanline wash */}
    <span
      className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(240,93,35,0.06)_50%)] bg-[length:100%_4px] opacity-60"
      aria-hidden
    />
    {/* Corner brackets */}
    <span className="pointer-events-none absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-[#F05D23]" aria-hidden />
    <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-1.5 h-1.5 border-b border-r border-[#F05D23]" aria-hidden />
    {/* Live status dot (top-right) */}
    <span className="pointer-events-none absolute top-2 right-2 w-1 h-1 bg-[#F05D23] shadow-[0_0_8px_#F05D23] animate-pulse" aria-hidden />

    {/* Label */}
    <span
      className="relative font-mono text-[15px] leading-none text-white tracking-[0.08em] pointer-events-none"
      style={{ fontWeight: 700 }}
      aria-hidden
    >
      AI
    </span>
    {/* Divider */}
    <span
      className="relative mt-1 h-[1px] w-5 bg-gradient-to-r from-transparent via-[#F05D23] to-transparent pointer-events-none"
      aria-hidden
    />
    <span
      className="relative mt-1 font-mono text-[8px] leading-none tracking-[0.3em] text-[#F05D23] uppercase pointer-events-none"
      aria-hidden
    >
      Chat
    </span>
  </button>
));

/* ─── Mobile Navigation (hamburger + drawer, <md only) ─── */
const MobileNav = ({
  activeSection,
  onNavigate,
}: {
  activeSection: SectionId;
  onNavigate: (id: SectionId) => (e: React.MouseEvent) => void;
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleNav = (id: SectionId) => (e: React.MouseEvent) => {
    onNavigate(id)(e);
    setOpen(false);
  };

  return (
    <>
      {/* Top bar (fixed) */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-[60] flex items-center justify-between bg-black/70 backdrop-blur-md border-b border-white/10 h-14 pl-5 pr-2"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[11px] tracking-[0.25em] text-white/40 uppercase shrink-0">//</span>
          <span
            className="relative font-mono text-[13px] tracking-[0.2em] text-[#F05D23] uppercase truncate"
            style={{ fontWeight: 700 }}
          >
            {SECTION_LABELS[activeSection]}
            <span
              className="absolute left-0 right-0 bottom-[-4px] h-[2px] pointer-events-none border-b border-dotted border-white/40"
              aria-hidden
            />
          </span>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="relative flex items-center justify-center w-11 h-11 border border-white/10 bg-black/60 backdrop-blur-sm overflow-hidden active:bg-[#1a0505] transition-colors"
        >
          <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#F05D23]/60" aria-hidden />
          <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#F05D23]/60" aria-hidden />
          {open ? <X className="w-5 h-5 text-[#F05D23]" /> : <Menu className="w-5 h-5 text-[#F05D23]" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              className="md:hidden fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              className="md:hidden fixed top-0 right-0 bottom-0 z-[80] flex flex-col justify-between bg-[#050505] border-l border-white/10 shadow-[-8px_0_40px_rgba(0,0,0,0.6)] w-[min(320px,85vw)] px-8"
              style={{
                paddingTop: 'max(env(safe-area-inset-top), 2.5rem)',
                paddingBottom: 'max(env(safe-area-inset-bottom), 2.5rem)',
              }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <span className="absolute top-4 left-4 w-3 h-3 border-t border-l border-[#F05D23]/60" aria-hidden />
              <span className="absolute top-4 right-4 w-3 h-3 border-t border-r border-[#F05D23]/60" aria-hidden />
              <span className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-[#F05D23]/60" aria-hidden />
              <span className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-[#F05D23]/60" aria-hidden />

              <div className="flex items-center justify-between mb-8">
                <span className="font-mono text-[11px] tracking-[0.25em] text-white/40 uppercase">NAVIGATE</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex items-center justify-center w-10 h-10 border border-white/10 active:bg-[#1a0505]"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>

              <nav className="flex flex-col gap-5 flex-1 justify-center">
                {SECTION_IDS.map((id) => {
                  const isActive = id === activeSection;
                  return (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={handleNav(id)}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'relative group flex items-center gap-3 py-2 cursor-pointer transition-colors duration-300',
                        isActive ? 'text-[#F05D23]' : 'text-[#cccccc] active:text-[#F05D23]',
                      )}
                      style={{
                        fontFamily: '"Space Mono", monospace',
                        fontSize: '15px',
                        letterSpacing: '0.2em',
                        fontWeight: 700,
                      }}
                    >
                      <span
                        className={cn(
                          'font-mono text-[11px] tracking-widest w-5 shrink-0',
                          isActive ? 'text-[#F05D23]' : 'text-white/30',
                        )}
                        aria-hidden
                      >
                        {isActive ? '◆' : '//'}
                      </span>
                      <span className="uppercase">{SECTION_LABELS[id]}</span>
                      {isActive && (
                        <span
                          className="absolute left-8 right-0 bottom-0 h-[2px] pointer-events-none border-b border-dotted border-white/40"
                          aria-hidden
                        />
                      )}
                    </a>
                  );
                })}
              </nav>

              <div className="font-mono text-[10px] tracking-[0.3em] text-white/25 uppercase text-center">
                v.2026 // abyss build
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

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

  // Scroll-position-based active section: pick the section marker whose top
  // is closest to (but not past) an activation line near the top of the
  // viewport. Marker elements are zero-height so IntersectionObserver cannot
  // be used reliably for this; explicit position math stays correct even
  // when a section is taller than the viewport (e.g. the experience
  // timeline).
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let rafId = 0;
    const update = () => {
      rafId = 0;
      const sections = SECTION_IDS
        .map((id) => {
          const el = container.querySelector<HTMLElement>(`#${id}`);
          if (!el) return null;
          return {
            id,
            top: el.getBoundingClientRect().top - container.getBoundingClientRect().top,
          };
        })
        .filter((x): x is { id: SectionId; top: number } => x !== null)
        .sort((a, b) => a.top - b.top);

      // Activation line ~25% from top of the scroll viewport.
      const line = container.clientHeight * 0.25;
      let active: SectionId = sections[0]?.id ?? 'home';
      for (const s of sections) {
        if (s.top - line <= 0) active = s.id;
        else break;
      }

      // At the very bottom, pin to the last section.
      const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 4;
      if (atBottom && sections.length) active = sections[sections.length - 1].id;

      setActiveSection(active);
    };

    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    container.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    update();

    return () => {
      container.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Scroll-state + intentional-hover gates for the demonic hover glitch.
  // (Fixes "orange flash" during momentum scroll: trackpad scroll emits
  //  :hover on cards that slide under a stationary cursor, which started
  //  the steps(1) keyframe animation and produced a flash.)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (container.dataset.scrolling !== '1') container.dataset.scrolling = '1';
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        container.dataset.scrolling = '';
      }, 140);
    };
    container.addEventListener('scroll', onScroll, { passive: true });

    // Arm a card's hover animation only after the pointer has actually
    // moved while inside it. Delegated at the container so we don't add
    // per-card listeners.
    const armedMap = new WeakMap<Element, { x: number; y: number }>();
    const MOVE_THRESHOLD_SQ = 4; // ~2px

    const findGroup = (el: EventTarget | null): HTMLElement | null => {
      let node = el as HTMLElement | null;
      while (node && node !== container) {
        if (node.classList && node.classList.contains('group')) return node;
        node = node.parentElement;
      }
      return null;
    };

    const onPointerOver = (e: PointerEvent) => {
      const g = findGroup(e.target);
      if (!g) return;
      if (!armedMap.has(g)) armedMap.set(g, { x: e.clientX, y: e.clientY });
    };
    const onPointerMove = (e: PointerEvent) => {
      if (container.dataset.scrolling === '1') return;
      const g = findGroup(e.target);
      if (!g) return;
      const seed = armedMap.get(g);
      if (!seed) {
        armedMap.set(g, { x: e.clientX, y: e.clientY });
        return;
      }
      const dx = e.clientX - seed.x;
      const dy = e.clientY - seed.y;
      if (dx * dx + dy * dy >= MOVE_THRESHOLD_SQ) {
        g.classList.add('is-hover-armed');
      }
    };
    const onPointerOut = (e: PointerEvent) => {
      const g = findGroup(e.target);
      if (!g) return;
      // Only disarm when the pointer actually leaves the card (not bubble-out
      // to a descendant).
      const related = e.relatedTarget as Node | null;
      if (related && g.contains(related)) return;
      g.classList.remove('is-hover-armed');
      armedMap.delete(g);
    };

    container.addEventListener('pointerover', onPointerOver);
    container.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerout', onPointerOut);

    return () => {
      container.removeEventListener('scroll', onScroll);
      container.removeEventListener('pointerover', onPointerOver);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerout', onPointerOut);
      if (scrollTimer) clearTimeout(scrollTimer);
      container.dataset.scrolling = '';
    };
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
    <main className="h-screen w-full bg-[#030303] text-white overflow-hidden flex flex-col md:flex-row relative selection:bg-[#F05D23] selection:text-black">
      <NoiseOverlay />

      {/* ── Animated Background Elements (desktop only) ── */}
      <div className="hidden md:block absolute inset-0 pointer-events-none z-[2] overflow-hidden">
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
            opacity: 0.2,
            transform: 'translateZ(0)',
          }}
        />
      </div>

      {/* ── Subtle Vignette ── */}
      <div className="absolute inset-0 pointer-events-none z-[3]" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />

      {/* ── Mobile Navigation (hamburger + drawer) ── */}
      <MobileNav activeSection={activeSection} onNavigate={scrollToSection} />

      {/* ── Mobile Floating Summon-AI FAB ── */}
      <MobileSummonAIButton />

      {/* ── Left Navigation Sidebar (desktop only) ── */}
      <aside
        className="hidden md:flex w-[320px] shrink-0 h-full flex-col justify-between py-16 px-16 relative z-10"
        onWheelCapture={(e) => {
          // Forward wheel scrolls from empty nav areas into the main scroll
          // container so the site scrolls when the cursor is parked over
          // the sidebar. Interactive children (buttons/links) still receive
          // clicks normally; we only intercept wheel.
          const container = scrollContainerRef.current;
          if (!container) return;
          container.scrollBy({ top: e.deltaY, left: 0, behavior: 'auto' });
        }}
      >
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}>
          <NavLink href="#home" isActive={activeSection === 'home'} onClick={scrollToSection('home')}>HOME</NavLink>
        </motion.div>

        {/* Crosshairs Decoration */}
        <motion.div className="absolute top-[35%] left-16 -translate-y-1/2" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <Crosshair className="w-5 h-5" />
        </motion.div>
        
        <motion.div className="flex flex-col gap-4" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}>
          <NavLink href="#highlights" isActive={activeSection === 'highlights'} onClick={scrollToSection('highlights')}>HIGHLIGHTS</NavLink>
          <NavLink href="#experience" isActive={activeSection === 'experience'} onClick={scrollToSection('experience')}>EXPERIENCE</NavLink>
          <NavLink href="#showcase" isActive={activeSection === 'showcase'} onClick={scrollToSection('showcase')}>SHOWCASE</NavLink>
          <NavLink href="#certifications" isActive={activeSection === 'certifications'} onClick={scrollToSection('certifications')}>CERTIFICATIONS</NavLink>
        </motion.div>

        <motion.div className="flex flex-col gap-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}>
          <button
            className="group relative flex items-center justify-between gap-3 px-5 py-3 border border-[#F05D23]/50 bg-black/60 backdrop-blur-sm hover:bg-[#1a0505] hover:border-[#F05D23] transition-all duration-500 overflow-hidden cursor-pointer shadow-[0_0_15px_rgba(240,93,35,0.15)] hover:shadow-[0_0_24px_rgba(240,93,35,0.3)]"
            onClick={() => console.log('Summoning AI...')}
          >
            {/* Demonic scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(240,93,35,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-25 group-hover:opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F05D23]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

            <div className="flex items-center gap-3 relative z-10">
              {/* Hellfire Core / Eye */}
              <div className="relative w-3 h-3 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full border border-[#F05D23]/70 scale-[1.5] group-hover:scale-[2] opacity-70 transition-transform duration-700" />
                <span className="absolute inset-0 rounded-full border border-[#F05D23] opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#F05D23] shadow-[0_0_8px_#F05D23] animate-pulse" />
              </div>
              <span
                className="font-mono text-[13px] tracking-[0.15em] text-[#F05D23] group-hover:text-[#ff7a42] transition-colors uppercase"
                style={{ textShadow: '0 0 10px rgba(240,93,35,0.35)', fontWeight: 700 }}
              >
                Summon AI
              </span>
            </div>
            <span className="relative z-10 font-mono text-[10px] text-[#F05D23]/80 tracking-widest group-hover:text-[#F05D23] transition-colors duration-300">
              [CHAT]
            </span>
          </button>
        </motion.div>
      </aside>

      {/* ── Main Content Area ── */}
      <section
        ref={scrollContainerRef}
        className="relative z-10 flex h-full min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-clip pr-5 pt-14 [overflow-clip-margin:3rem] md:pr-12 md:pt-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <div className="mx-auto w-full min-w-0 max-w-7xl pb-14 md:pb-24 pl-5 md:pl-16">
          {/* ─ Hero Section ── */}
          <div id="home" className="min-h-[85vh] md:min-h-screen flex flex-col justify-end relative pb-8 scroll-mt-20 md:scroll-mt-0">

            {/* ── Hero Content ── */}
            <div className="flex-1 flex flex-col justify-end pb-4">

              {/* ── Metrics Sentence ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8 mt-8 md:mt-[80px] max-w-full md:max-w-xl md:ml-auto"
              >
                <HellCard className="px-5 py-5 md:px-7 md:py-6">
                  <p
                    className="text-white/85 font-mono tracking-wide text-left md:text-right text-[13px] md:text-[16px]"
                    style={{ lineHeight: 1.65, letterSpacing: '-0.01em' }}
                  >
                    Shipped <span className="text-[#F05D23] tabular-nums" style={{ fontWeight: 700 }}>17+</span> products, driving <span className="text-[#F05D23] tabular-nums" style={{ fontWeight: 700 }}>200%</span> revenue growth across <span className="text-[#F05D23] tabular-nums" style={{ fontWeight: 700 }}>50+</span> clients worldwide — with <span className="text-[#F05D23] tabular-nums" style={{ fontWeight: 700 }}>12</span> design awards, <span className="text-[#F05D23] tabular-nums" style={{ fontWeight: 700 }}>98%</span> client satisfaction, and <span className="text-[#F05D23] tabular-nums" style={{ fontWeight: 700 }}>5M+</span> users impacted.
                  </p>
                </HellCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="md:-ml-16"
              >
                <p
                  className="text-[#999999] mb-4 flex items-center gap-3 text-[13px] md:text-[16px]"
                  style={{ fontFamily: '"Space Mono", monospace', letterSpacing: '0.15em' }}
                >
                  <span className="w-6 md:w-8 h-[1px] bg-[#999999]" />
                  HELLO, I'M
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mb-4 md:-ml-16 [font-size:clamp(2.5rem,13vw,5rem)] md:[font-size:clamp(3.75rem,9vw,9rem)]"
              >
                <h1
                  className="text-[#f2f2f2]"
                  style={{
                    fontSize: 'inherit',
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
                className="mt-[4px] md:-ml-16 [font-size:clamp(0.9rem,3.6vw,1.15rem)] md:[font-size:clamp(1rem,1.65vw,1.45rem)]"
              >
                <div className="relative inline-block pb-1 overflow-hidden">
                  <h2
                    className="flex flex-wrap items-center text-[#cccccc]"
                    style={{
                      fontFamily: '"Space Mono", monospace',
                      fontSize: 'inherit',
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
              <div id="highlights" className="scroll-mt-20 md:scroll-mt-8" />
              <SmoothCarousel />
            </div>
          </div>

          {/* ── Sections ── */}
          <AboutSection />
          <MyWorkSection />
          <CertificationsSection />

          {/* ── Pre-Footer CTA ── */}
          <HellCard as="section" className="mt-14 md:mt-24">
            <div className="px-6 md:px-16 py-16 md:py-24 flex flex-col items-start gap-6">
              <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] uppercase text-[#F05D23]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F05D23] shadow-[0_0_8px_#F05D23] animate-pulse" />
                Signal / 05
                <span className="w-8 h-px bg-[#F05D23]/40" />
                Open for collaboration
              </div>

              <h3
                className="font-mono text-[32px] md:text-[56px] leading-[1.05] tracking-tight text-white uppercase"
                style={{ letterSpacing: '-0.02em', fontWeight: 500 }}
              >
                Let&apos;s build something<br />
                <span className="text-[#F05D23]" style={{ textShadow: '0 0 32px rgba(240,93,35,0.35)' }}>
                  unreasonably good.
                </span>
              </h3>

              <p className="font-mono text-[14px] md:text-[16px] text-[#b0b0b0] leading-relaxed tracking-wide max-w-2xl">
                Design, AI-agentic workflows, or end-to-end product — if the problem is ambitious and the timeline is
                impossible, we should probably talk.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <a
                  href="mailto:hello@abhiroop.design"
                  className="group relative flex items-center gap-3 px-5 py-3 bg-[#F05D23] text-black font-mono text-[13px] tracking-[0.2em] uppercase font-bold hover:bg-[#ff7a42] transition-colors duration-300"
                  style={{ fontWeight: 700 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-black/80 group-hover:bg-black" />
                  Start a project
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com/in/abhiroopchaudhuri"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-3 px-5 py-3 border border-white/15 text-white/85 font-mono text-[13px] tracking-[0.2em] uppercase hover:border-[#F05D23] hover:text-[#F05D23] transition-colors duration-300"
                >
                  Book a call
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </HellCard>

          {/* ── Footer ── */}
          <footer className="relative mt-8 md:mt-12 pt-10 md:pt-14 pb-8 md:pb-12 border-t border-white/10">
            {/* ASCII-esque marker */}
            <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] uppercase text-white/30 mb-8 md:mb-12">
              <span>// END_OF_TRANSMISSION</span>
              <span className="flex-1 h-px bg-gradient-to-r from-white/15 via-white/5 to-transparent" />
              <span className="text-[#F05D23]/70">◆</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 mb-10 md:mb-16">
              <div className="md:col-span-5">
                <h4 className="font-mono text-[11px] tracking-[0.3em] text-[#F05D23] uppercase mb-4">Channel.01 — Direct</h4>
                <a
                  href="mailto:hello@abhiroop.design"
                  className="group inline-flex items-baseline gap-2 font-mono text-[20px] md:text-[28px] text-white hover:text-[#F05D23] transition-colors tracking-tight"
                >
                  hello@abhiroop.design
                  <ArrowUpRight className="w-4 h-4 translate-y-[-2px] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </a>
                <p className="mt-4 font-mono text-[13px] text-[#777] leading-relaxed tracking-wide max-w-sm">
                  Based in the abyss (IST). Replying within 24h — usually a lot faster.
                </p>
              </div>

              <div className="md:col-span-4">
                <h4 className="font-mono text-[11px] tracking-[0.3em] text-[#F05D23] uppercase mb-4">Channel.02 — Network</h4>
                <ul className="flex flex-col gap-2 font-mono text-[14px]">
                  {[
                    { label: 'Behance', href: 'https://behance.net/abhiroopchaudhuri' },
                    { label: 'GitHub', href: 'https://github.com/abhiroopchaudhuri' },
                    { label: 'LinkedIn', href: 'https://linkedin.com/in/abhiroopchaudhuri' },
                    { label: 'Read.cv', href: 'https://read.cv/abhiroop' },
                  ].map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 text-[#aaa] hover:text-[#F05D23] transition-colors tracking-wide"
                      >
                        <span className="font-mono text-[10px] text-white/25 group-hover:text-[#F05D23] transition-colors">↳</span>
                        {l.label}
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-3">
                <h4 className="font-mono text-[11px] tracking-[0.3em] text-[#F05D23] uppercase mb-4">Channel.03 — Manifesto</h4>
                <p className="font-mono text-[13px] text-[#aaa] leading-relaxed tracking-wide">
                  I design and develop<br />
                  <span className="text-white">with my AI minions</span>,<br />
                  built at the speed<br />
                  of thought.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pt-6 border-t border-white/5">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F05D23] shadow-[0_0_8px_#F05D23] animate-pulse" aria-hidden />
                <p className="text-[#666] font-mono text-[11px] tracking-[0.3em] uppercase">© 2026 Abhiroop Chaudhuri</p>
              </div>
              <p className="text-[#555] font-mono text-[11px] tracking-[0.3em] uppercase flex flex-wrap items-center gap-2">
                <span>Designed in the abyss</span>
                <span className="text-[#F05D23]">&#9670;</span>
                <span>Conjured by AI agents</span>
                <span className="text-[#F05D23]">&#9670;</span>
                <span>v.2026.04</span>
              </p>
            </div>
          </footer>

        </div>
      </section>

    </main>
  );
}
