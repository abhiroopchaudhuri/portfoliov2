import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import App from './app/App.tsx';
import { PasswordGate } from './app/components/PasswordGate.tsx';
import './styles/index.css';

// Project detail pages are not visible on the home route, so defer their code
// until the user actually navigates there. Saves the bulk of their bundle
// weight off the initial JS payload.
const MdsProjectPage = lazy(() =>
  import('./app/pages/MdsProjectPage.tsx').then((m) => ({ default: m.MdsProjectPage })),
);
const WcagProjectPage = lazy(() =>
  import('./app/pages/WcagProjectPage.tsx').then((m) => ({ default: m.WcagProjectPage })),
);
const ThrifterProjectPage = lazy(() =>
  import('./app/pages/ThrifterProjectPage.tsx').then((m) => ({ default: m.ThrifterProjectPage })),
);
const MonolithPhase1ProjectPage = lazy(() =>
  import('./app/pages/MonolithPhase1ProjectPage.tsx').then((m) => ({
    default: m.MonolithPhase1ProjectPage,
  })),
);

// Style-matched fallback so the transition isn't a white flash.
const PageFallback = () => (
  <div style={{ minHeight: '100vh', background: '#030303' }} />
);

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route
        path="/projects/mds"
        element={
          <Suspense fallback={<PageFallback />}>
            <MdsProjectPage />
          </Suspense>
        }
      />
      <Route
        path="/projects/wcag"
        element={
          <Suspense fallback={<PageFallback />}>
            <WcagProjectPage />
          </Suspense>
        }
      />
      <Route
        path="/projects/thrifter"
        element={
          <Suspense fallback={<PageFallback />}>
            <ThrifterProjectPage />
          </Suspense>
        }
      />
      <Route
        path="/projects/monolith-phase-1"
        element={
          <PasswordGate
            id="monolith-phase-1"
            password="god-mode"
            title="Monolith Phase 1 is private."
            subtitle="Enter the password to open this case study."
          >
            <Suspense fallback={<PageFallback />}>
              <MonolithPhase1ProjectPage />
            </Suspense>
          </PasswordGate>
        }
      />
    </Routes>
  </BrowserRouter>
);
