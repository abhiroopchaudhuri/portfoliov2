import React from 'react';

/**
 * AIPanel Component
 * The AI chat panel that appears on the right side of the application
 */
export const AIPanel: React.FC = () => {
  return (
    <div className="h-full bg-slate-100 border-l border-slate-300 flex items-center justify-center p-6">
      <div className="text-center">
        <h2 className="text-slate-700">AI CHAT PANEL</h2>
        <p className="text-slate-500 mt-2">AI assistance interface goes here</p>
      </div>
    </div>
  );
};
