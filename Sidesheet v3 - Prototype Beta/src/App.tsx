import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/ui/resizable';
import { PlatformHeader } from './components/PlatformHeader';
import { AppHeader } from './components/AppHeader';
import { LeftContainer } from './components/LeftContainer';
import { AIPanel } from './components/AIPanel';

/**
 * Main Application Component
 * 
 * Layout Structure:
 * - PlatformHeader (fixed at top)
 * - AppHeader (fixed below PlatformHeader)
 * - Resizable Main Container:
 *   - Left Container (main content area with sidesheet)
 *   - AI Chat Panel (collapsible right panel)
 * 
 * State Management:
 * - AI Panel visibility controlled via AppHeader toggle button
 * - Panel sizes managed by react-resizable-panels
 * - Sidesheet state managed within LeftContainer
 */
export default function App() {
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  const handleToggleAIPanel = () => {
    setIsAIPanelOpen((prev) => !prev);
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Fixed Headers */}
      <PlatformHeader />
      <AppHeader isAIPanelOpen={isAIPanelOpen} onToggleAIPanel={handleToggleAIPanel} />

      {/* Main Content Area with Resizable Panels */}
      <div className="pt-[104px] h-full">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Container - Main Content Area */}
          <ResizablePanel
            defaultSize={100}
            minSize={30}
            className="relative"
          >
            <LeftContainer />
          </ResizablePanel>

          {/* AI Panel - Collapsible Right Panel */}
          {isAIPanelOpen && (
            <>
              <ResizableHandle withHandle className="bg-slate-300 hover:bg-blue-500" />
              <ResizablePanel
                defaultSize={30}
                minSize={10}
                maxSize={90}
              >
                <AIPanel />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
