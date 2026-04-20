import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import App from './app/App.tsx';
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
    </Routes>
  </BrowserRouter>
);
