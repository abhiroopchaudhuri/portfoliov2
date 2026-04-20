import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface NonModalSidesheetProps {
  isOpen: boolean;
  onClose: () => void;
  parentWidth: number;
  savedWidth: number | null;
  onWidthChange: (width: number) => void;
}

const MIN_WIDTH = 400;
const MAX_WIDTH_RATIO = 10 / 12; // 83.33%
const DEFAULT_WIDTH_RATIO = 6 / 12; // 50%

/**
 * NonModalSidesheet Component
 * A resizable, non-modal sidesheet that opens from the right edge of its parent container.
 * 
 * Key Features:
 * - Initial width: 50% of parent on first open (resets on page refresh)
 * - Resizable with drag handle (min: 400px, max: 83.33% of parent)
 * - Remembers width during current session (until page refresh)
 * - Retains pixel width when parent resizes (with constraint checking)
 */
export const NonModalSidesheet: React.FC<NonModalSidesheetProps> = ({
  isOpen,
  onClose,
  parentWidth,
  savedWidth,
  onWidthChange,
}) => {
  const sidesheetRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartX = useRef<number>(0);
  const resizeStartWidth = useRef<number>(0);

  /**
   * Calculate constrained width with smart logic for user-driven resizes:
   * - If parent >= 480px: normal constraints (400px min, 83.33% max)
   * - If 400px <= parent < 480px: clamp to 400px
   * - If parent < 400px: allow shrinking below 400px to fit
   */
  const getConstrainedWidth = useCallback((desiredWidth: number): number => {
    const maxWidth = parentWidth * MAX_WIDTH_RATIO;
    
    // If parent is very small, allow sidesheet to shrink below MIN_WIDTH
    if (parentWidth < MIN_WIDTH) {
      return Math.min(desiredWidth, parentWidth);
    }
    
    // If maxWidth (83.33%) is less than MIN_WIDTH (400px), clamp to MIN_WIDTH
    if (maxWidth < MIN_WIDTH) {
      return Math.min(desiredWidth, MIN_WIDTH);
    }
    
    // Normal case: respect both min and max constraints
    return Math.max(MIN_WIDTH, Math.min(desiredWidth, maxWidth));
  }, [parentWidth]);

  /**
   * Calculate width when parent container resizes:
   * Smoothly grow/shrink with parent when below 400px threshold
   */
  const getWidthOnParentResize = useCallback((currentWidth: number): number => {
    const maxWidth = parentWidth * MAX_WIDTH_RATIO;
    
    // If parent < 400px: sidesheet matches parent (smooth shrinking/growing)
    if (parentWidth < MIN_WIDTH) {
      return parentWidth;
    }
    
    // If 400px <= parent < 480px: sidesheet should be 400px
    if (maxWidth < MIN_WIDTH) {
      return MIN_WIDTH;
    }
    
    // Normal case: retain current width but respect max constraint
    return Math.min(currentWidth, maxWidth);
  }, [parentWidth]);

  /**
   * Calculate the initial width when the sidesheet opens
   */
  const getInitialWidth = useCallback((): number => {
    if (savedWidth !== null) {
      return getConstrainedWidth(savedWidth);
    }
    
    // Default: 50% of parent width
    const defaultWidth = parentWidth * DEFAULT_WIDTH_RATIO;
    return getConstrainedWidth(defaultWidth);
  }, [parentWidth, savedWidth, getConstrainedWidth]);

  /**
   * Initialize width when sidesheet opens
   */
  useEffect(() => {
    if (isOpen && width === 0) {
      const initialWidth = getInitialWidth();
      setWidth(initialWidth);
    }
  }, [isOpen, width, getInitialWidth]);

  /**
   * Handle parent container resize while sidesheet is open
   * Smoothly adjust width based on parent size changes
   */
  useEffect(() => {
    if (isOpen && width > 0) {
      const newWidth = getWidthOnParentResize(width);
      
      // Only update if the width needs to change
      if (newWidth !== width) {
        setWidth(newWidth);
        onWidthChange(newWidth);
      }
    }
  }, [parentWidth, isOpen, width, onWidthChange, getWidthOnParentResize]);

  /**
   * Notify parent of width changes
   */
  useEffect(() => {
    if (width > 0) {
      onWidthChange(width);
    }
  }, [width, onWidthChange]);

  /**
   * Start resizing operation
   */
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = width;
  };

  /**
   * Handle mouse move during resize
   */
  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = resizeStartX.current - e.clientX;
      const newWidth = resizeStartWidth.current + deltaX;

      // Apply smart constraints
      const constrainedWidth = getConstrainedWidth(newWidth);

      setWidth(constrainedWidth);
    },
    [isResizing, getConstrainedWidth]
  );

  /**
   * End resizing operation
   */
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  /**
   * Attach/detach mouse event listeners for resizing
   */
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  if (!isOpen) return null;

  return (
    <div
      ref={sidesheetRef}
      className="absolute top-0 right-0 bottom-0 bg-white border-l border-slate-300 shadow-2xl flex flex-col"
      style={{ width: `${width}px` }}
    >
        {/* Resize Handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 hover:w-2 bg-slate-300 hover:bg-blue-500 cursor-ew-resize transition-all z-10"
          onMouseDown={handleResizeStart}
        />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-slate-900">Non-Modal Sidesheet</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-slate-700 mb-2">Sidesheet Information</h3>
              <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                <p><strong>Current Width:</strong> {Math.round(width)}px</p>
                <p><strong>Parent Width:</strong> {Math.round(parentWidth)}px</p>
                <p><strong>Width Ratio:</strong> {((width / parentWidth) * 100).toFixed(1)}%</p>
                <p><strong>Min Width:</strong> {MIN_WIDTH}px</p>
                <p><strong>Max Width:</strong> {(MAX_WIDTH_RATIO * 100).toFixed(1)}% of parent</p>
              </div>
            </div>

            <div>
              <h3 className="text-slate-700 mb-2">Behavior Notes</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                <li>Drag the left edge to resize</li>
                <li>Width remembered during current session (resets on refresh)</li>
                <li>Retains pixel width when parent resizes</li>
                <li>Smart constraints: prioritizes 400px min until parent &lt; 400px</li>
                <li>When parent ≥ 480px: max 83.33%, min 400px</li>
                <li>When 400px ≤ parent &lt; 480px: stays at 400px</li>
              </ul>
            </div>

            <div>
              <h3 className="text-slate-700 mb-2">Sample Content</h3>
              <p className="text-slate-600 text-sm">
                This is a non-modal sidesheet, meaning you can still interact with the content
                behind it. The sidesheet maintains its pixel width when the parent container
                is resized, unless doing so would violate the maximum width constraint.
              </p>
            </div>
          </div>
        </div>
    </div>
  );
};
