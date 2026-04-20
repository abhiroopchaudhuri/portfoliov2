import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { NonModalSidesheet } from './NonModalSidesheet';
import { PanelRight } from 'lucide-react';

/**
 * LeftContainer Component
 * The main content area that serves as the parent and positioning context
 * for the NonModalSidesheet
 */
export const LeftContainer: React.FC = () => {
  const [isSidesheetOpen, setIsSidesheetOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [savedSidesheetWidth, setSavedSidesheetWidth] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Track container width for sidesheet constraints
   */
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    // Initial width
    updateWidth();

    // Update on window resize
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleOpenSidesheet = () => {
    setIsSidesheetOpen(true);
  };

  const handleCloseSidesheet = () => {
    setIsSidesheetOpen(false);
  };

  const handleSidesheetWidthChange = (width: number) => {
    setSavedSidesheetWidth(width);
  };

  return (
    <div ref={containerRef} className="relative h-full bg-white overflow-hidden">
      {/* Main Content */}
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-slate-900 mb-2">Initial Width (Size)</h1>
          <p className="text-slate-600">
            This is the main content area. Click the button below to open the non-modal sidesheet.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
          <h2 className="text-blue-900">Sidesheet Behavior</h2>
          <ul className="list-disc list-inside space-y-2 text-blue-800 text-sm">
            <li>
              <strong>Initial Width:</strong> Opens at 50% (6/12) of this container's width on first load
            </li>
            <li>
              <strong>Resizable:</strong> Drag the left edge to resize between 400px and 83.33% (10/12) of parent width
            </li>
            <li>
              <strong>Session Memory:</strong> Remembers your preferred width until page refresh
            </li>
            <li>
              <strong>Smart Resizing:</strong> Retains pixel width when you resize the main layout, but respects max constraint
            </li>
            <li>
              <strong>Non-Modal:</strong> You can still interact with this content while the sidesheet is open
            </li>
          </ul>
        </div>

        <Button onClick={handleOpenSidesheet} disabled={isSidesheetOpen}>
          <PanelRight className="mr-2 h-4 w-4" />
          Open Non Modal Sidesheet
        </Button>

        <div className="space-y-2">
          <h3 className="text-slate-700">Additional Content</h3>
          <p className="text-slate-600 text-sm">
            This content demonstrates that the sidesheet is non-modal. When the sidesheet is open,
            you can still see and interact with any content that isn't obscured by it.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="text-slate-700 mb-1">Content Block {item}</h4>
                <p className="text-slate-500 text-sm">
                  Sample content to demonstrate the layout and scrolling behavior.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Non-Modal Sidesheet */}
      <NonModalSidesheet
        isOpen={isSidesheetOpen}
        onClose={handleCloseSidesheet}
        parentWidth={containerWidth}
        savedWidth={savedSidesheetWidth}
        onWidthChange={handleSidesheetWidthChange}
      />
    </div>
  );
};
