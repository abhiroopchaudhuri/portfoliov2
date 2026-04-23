import { motion, useAnimation } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

/**
 * PasswordGate — reusable route/page gate.
 *
 * Usage:
 *   <PasswordGate id="monolith-phase-1" password="god-mode" title="Monolith Phase 1">
 *     <MonolithPhase1ProjectPage />
 *   </PasswordGate>
 *
 * Protected content is never rendered until the correct password is entered, so
 * the gate cannot be bypassed by removing the overlay in devtools. Note that
 * this is a client-side gate: the password string lives in the JS bundle and is
 * not suitable for anything that actually needs to stay secret. It is intended
 * only to hide in-progress case studies from casual browsing.
 *
 * The unlocked state persists for the browser session via sessionStorage, keyed
 * by `id`, so each gated page unlocks independently.
 */

const C = {
  parchment: '#f5f4ed',
  ivory: '#faf9f5',
  warmSand: '#e8e6dc',
  nearBlack: '#141413',
  charcoalWarm: '#4d4c48',
  oliveGray: '#5e5d59',
  stoneGray: '#87867f',
  warmSilver: '#b0aea5',
  terracotta: '#c96442',
  coral: '#d97757',
  borderCream: '#f0eee6',
  borderWarm: '#e8e6dc',
  ringWarm: '#d1cfc5',
  errorCrimson: '#b53333',
  focusBlue: '#3898ec',
} as const;

const SERIF = '"Playfair Display", Georgia, "Times New Roman", serif';
const SANS = '"Inter", system-ui, -apple-system, sans-serif';

interface PasswordGateProps {
  /** Unique identifier, used as the sessionStorage key. */
  id: string;
  /** The password to check against. */
  password: string;
  /** Optional display name shown in the gate modal. */
  title?: string;
  /** Optional copy under the title. */
  subtitle?: string;
  /** The protected content. Only rendered after unlock. */
  children: React.ReactNode;
}

const storageKeyFor = (id: string) => `pg:${id}:unlocked`;

export function PasswordGate({
  id,
  password,
  title = 'This case study is private.',
  subtitle = 'Enter the password to continue.',
  children,
}: PasswordGateProps) {
  const storageKey = storageKeyFor(id);

  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem(storageKey) === '1';
    } catch {
      return false;
    }
  });

  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shakeControls = useAnimation();

  // Focus the input when the gate mounts / re-renders while locked.
  useEffect(() => {
    if (!unlocked) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 80);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [unlocked]);

  // Prevent body scroll while gated so the gate feels modal.
  useEffect(() => {
    if (unlocked) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [unlocked]);

  // Guard against an invalid stored value from a previous session.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (sessionStorage.getItem(storageKey) === '1' && !unlocked) {
        setUnlocked(true);
      }
    } catch {
      /* ignore */
    }
  }, [storageKey, unlocked]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (value === password) {
      try {
        sessionStorage.setItem(storageKey, '1');
      } catch {
        /* storage may be blocked; still unlock in-memory */
      }
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      void shakeControls.start({
        x: [0, -10, 10, -7, 7, -4, 4, 0],
        transition: { duration: 0.42 },
      });
      // Keep the typed value selected so the user can retype immediately.
      window.setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      // Clear error styling after a short moment so the input resets cleanly.
      window.setTimeout(() => setError(false), 1400);
    }
  };

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{ background: C.parchment }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-gate-title"
    >
      {/* Decorative blurred blobs — pure chrome. There is nothing behind them;
          the protected page is not in the DOM until unlock. */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div
          className="absolute"
          style={{
            top: '-15%',
            left: '-12%',
            width: '58vw',
            height: '58vw',
            borderRadius: '50%',
            background: C.terracotta,
            opacity: 0.55,
            filter: 'blur(160px)',
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: '-22%',
            right: '-18%',
            width: '65vw',
            height: '65vw',
            borderRadius: '50%',
            background: C.coral,
            opacity: 0.35,
            filter: 'blur(180px)',
          }}
        />
        <div
          className="absolute"
          style={{
            top: '40%',
            left: '55%',
            width: '34vw',
            height: '34vw',
            borderRadius: '50%',
            background: C.warmSand,
            opacity: 0.7,
            filter: 'blur(140px)',
          }}
        />
        {/* Frosted layer on top of the blobs for a glass feel. */}
        <div
          className="absolute inset-0"
          style={{
            background: 'rgba(245,244,237,0.35)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
          }}
        />
        {/* Subtle grain so it doesn't look too clean. */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-multiply"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(20,20,19,0.6) 1px, transparent 0)',
            backgroundSize: '3px 3px',
          }}
        />
      </div>

      {/* Back-to-home link (top-left, always available) */}
      <Link
        to="/#highlights"
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm transition-opacity duration-150 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          background: C.ivory,
          color: C.charcoalWarm,
          fontFamily: SANS,
          boxShadow: `0 0 0 1px ${C.ringWarm}`,
          outlineColor: C.focusBlue,
          zIndex: 10,
        }}
      >
        <ArrowLeft size={13} strokeWidth={2} />
        Back to all projects
      </Link>

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[480px]"
        >
          <motion.div
            animate={shakeControls}
            style={{
              background: C.ivory,
              border: `1px solid ${C.borderCream}`,
              borderRadius: 24,
              boxShadow:
                '0 20px 60px -12px rgba(20,20,19,0.18), 0 0 0 1px rgba(208,200,180,0.5)',
              padding: '40px 36px',
            }}
          >
            {/* Lock icon + overline */}
            <div className="flex items-center gap-2 mb-5">
              <span
                className="inline-flex items-center justify-center rounded-full"
                style={{
                  width: 28,
                  height: 28,
                  background: C.terracotta,
                  color: C.ivory,
                }}
              >
                <Lock size={14} strokeWidth={2.25} />
              </span>
              <span
                className="uppercase"
                style={{
                  fontFamily: SANS,
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                  color: C.stoneGray,
                }}
              >
                Private · Password required
              </span>
            </div>

            <h1
              id="password-gate-title"
              className="mb-2"
              style={{
                fontFamily: SERIF,
                fontWeight: 500,
                fontSize: 28,
                lineHeight: 1.2,
                color: C.nearBlack,
              }}
            >
              {title}
            </h1>
            <p
              className="mb-7"
              style={{
                fontFamily: SANS,
                fontSize: 15,
                lineHeight: 1.6,
                color: C.oliveGray,
              }}
            >
              {subtitle}
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <label
                htmlFor="password-gate-input"
                className="block mb-2 uppercase"
                style={{
                  fontFamily: SANS,
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                  color: C.stoneGray,
                }}
              >
                Password
              </label>
              <input
                id="password-gate-input"
                ref={inputRef}
                type="password"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError(false);
                }}
                aria-invalid={error}
                aria-describedby={error ? 'password-gate-error' : undefined}
                className="w-full transition-colors duration-150 focus:outline-none"
                style={{
                  background: C.warmSand,
                  color: C.nearBlack,
                  fontFamily: SANS,
                  fontSize: 16,
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: `1px solid ${error ? C.errorCrimson : 'transparent'}`,
                  boxShadow: error
                    ? `0 0 0 3px rgba(181,51,51,0.15)`
                    : `0 0 0 1px ${C.borderWarm}`,
                }}
                onFocus={(e) => {
                  if (!error) {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${C.focusBlue}`;
                  }
                }}
                onBlur={(e) => {
                  if (!error) {
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${C.borderWarm}`;
                  }
                }}
              />

              <div className="mt-2 min-h-[18px]">
                {error && (
                  <p
                    id="password-gate-error"
                    role="alert"
                    style={{
                      fontFamily: SANS,
                      fontSize: 13,
                      color: C.errorCrimson,
                    }}
                  >
                    Incorrect password. Try again.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 transition-opacity duration-150 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: C.terracotta,
                  color: C.ivory,
                  fontFamily: SANS,
                  fontSize: 15,
                  fontWeight: 500,
                  padding: '12px 16px',
                  borderRadius: 12,
                  outlineColor: C.focusBlue,
                }}
              >
                Enter
              </button>
            </form>

            <p
              className="mt-6"
              style={{
                fontFamily: SANS,
                fontSize: 12,
                lineHeight: 1.6,
                color: C.stoneGray,
              }}
            >
              If you were sent here without a password, use the back link at the top-left.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default PasswordGate;
