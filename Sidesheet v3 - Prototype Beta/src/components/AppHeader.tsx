import React from 'react';
import { Button } from './ui/button';
import { PanelRightOpen, PanelRightClose } from 'lucide-react';

interface AppHeaderProps {
  isAIPanelOpen: boolean;
  onToggleAIPanel: () => void;
}

/**
 * AppHeader Component
 * Contains app-level controls including the AI Panel toggle button
 */
export const AppHeader: React.FC<AppHeaderProps> = ({ isAIPanelOpen, onToggleAIPanel }) => {
  return (
    <header className="fixed top-12 left-0 right-0 h-14 bg-slate-800 text-white flex items-center justify-between px-6 z-40">
      <span>APP HEADER</span>
      <Button
        onClick={onToggleAIPanel}
        variant="outline"
        size="sm"
        className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
      >
        {isAIPanelOpen ? (
          <>
            <PanelRightClose className="mr-2 h-4 w-4" />
            Close AI Panel
          </>
        ) : (
          <>
            <PanelRightOpen className="mr-2 h-4 w-4" />
            Toggle AI Panel
          </>
        )}
      </Button>
    </header>
  );
};
