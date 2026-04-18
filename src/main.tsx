import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import App from './app/App.tsx';
import { MdsProjectPage } from './app/pages/MdsProjectPage.tsx';
import { WcagProjectPage } from './app/pages/WcagProjectPage.tsx';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/projects/mds" element={<MdsProjectPage />} />
      <Route path="/projects/wcag" element={<WcagProjectPage />} />
    </Routes>
  </BrowserRouter>
);
  