import { Link } from 'react-router';

export function MdsProjectPage() {
  return (
    <main className="min-h-screen bg-[#030303] text-white selection:bg-[#F05D23] selection:text-black">
      <div className="mx-auto max-w-4xl px-8 py-16 md:px-16">
        <Link
          to="/"
          className="inline-block font-mono text-[13px] tracking-[0.2em] text-[#F05D23] uppercase transition-colors hover:text-white"
        >
          ← Back
        </Link>
        <h1 className="mt-14 font-mono text-[clamp(1.25rem,4vw,2rem)] uppercase leading-tight tracking-[0.18em] text-white/90">
          MDS — Innovaccer&apos;s Design System
        </h1>
      </div>
    </main>
  );
}
