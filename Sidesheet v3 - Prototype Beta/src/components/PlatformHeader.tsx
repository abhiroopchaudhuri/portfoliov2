import React from 'react';

/**
 * PlatformHeader Component
 * A static header component fixed at the top of the viewport
 */
export const PlatformHeader: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-12 bg-slate-900 text-white flex items-center px-6 z-50">
      <span>PLATFORM HEADER</span>
    </header>
  );
};
