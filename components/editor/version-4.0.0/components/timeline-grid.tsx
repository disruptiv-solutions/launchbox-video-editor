/**
 * TimelineGrid Component
 * Renders a grid-based timeline view for managing overlay items across multiple rows.
 * Supports drag and drop, resizing, and various item management operations.
 */

import React, { useMemo } from "react";
import { Overlay } from "../types";
import TimelineItem from "./timeline-item";
import { MAX_ROWS } from "../constants";

/**
 * Props for the TimelineGrid component
 * @interface TimelineGridProps
 */
interface TimelineGridProps {
  /** Array of overlay items to display in the timeline */
  overlays: Overlay[];
  /** Indicates if an item is currently being dragged */
  isDragging: boolean;
  /** The overlay item currently being dragged, if any */
  draggedItem: Overlay | null;
  /** ID of the currently selected overlay */
  selectedOverlayId: number | null;
  /** Callback to update the selected overlay ID */
  setSelectedOverlayId: (id: number | null) => void;
  /** Callback triggered when dragging starts */
  handleDragStart: (
    overlay: Overlay,
    clientX: number,
    clientY: number,
    action: "move" | "resize-start" | "resize-end"
  ) => void;
  /** Total duration of the timeline in seconds */
  totalDuration: number;
  /** Visual element showing drag preview */
  ghostElement: {
    left: number; // Position from left as percentage
    width: number; // Width as percentage
    top: number; // Vertical position
  } | null;
  /** Callback to delete an overlay item */
  onDeleteItem: (id: number) => void;
  /** Callback to duplicate an overlay item */
  onDuplicateItem: (id: number) => void;
  /** Callback to split an overlay item at current position */
  onSplitItem: (id: number) => void;
  /** Callback when hovering over an item */
  onHover: (itemId: number, position: number) => void;
  /** Callback when context menu state changes */
  onContextMenuChange: (open: boolean) => void;
}

/**
 * TimelineGrid component that displays overlay items in a row-based timeline view
 */
const TimelineGrid: React.FC<TimelineGridProps> = ({
  overlays,
  isDragging,
  draggedItem,
  selectedOverlayId,
  setSelectedOverlayId,
  handleDragStart,
  totalDuration,
  ghostElement,
  onDeleteItem,
  onDuplicateItem,
  onSplitItem,
  onHover,
  onContextMenuChange,
}) => {
  // Create a memoized selectedItem object
  const selectedItem = useMemo(
    () => (selectedOverlayId !== null ? { id: selectedOverlayId } : null),
    [selectedOverlayId]
  );

  return (
    <div className="relative mt-3 h-44 overflow-x-auto overflow-y-hidden bg-gray-900">
      <div className="absolute inset-0 flex flex-col space-y-2">
        {Array.from({ length: MAX_ROWS }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex-1 bg-gray-700 rounded-sm relative"
          >
            {overlays
              .filter((overlay) => overlay.row === rowIndex)
              .map((overlay) => (
                <TimelineItem
                  key={overlay.id}
                  item={overlay}
                  isDragging={isDragging}
                  draggedItem={draggedItem}
                  selectedItem={selectedItem}
                  setSelectedItem={(item) => setSelectedOverlayId(item.id)}
                  handleMouseDown={(action, e) =>
                    handleDragStart(overlay, e.clientX, e.clientY, action)
                  }
                  handleTouchStart={(action, e) => {
                    const touch = e.touches[0];
                    handleDragStart(
                      overlay,
                      touch.clientX,
                      touch.clientY,
                      action
                    );
                  }}
                  handleItemClick={() => {}}
                  totalDuration={totalDuration}
                  onDeleteItem={onDeleteItem}
                  onDuplicateItem={onDuplicateItem}
                  onSplitItem={onSplitItem}
                  onHover={onHover}
                  onContextMenuChange={onContextMenuChange}
                />
              ))}
            {ghostElement &&
              Math.floor(ghostElement.top / (100 / MAX_ROWS)) === rowIndex && (
                <div
                  className="absolute inset-y-0 rounded-sm border-white border-2 bg-red-400/30 pointer-events-none"
                  style={{
                    left: `${ghostElement.left}%`,
                    width: `${Math.max(ghostElement.width, 1)}%`,
                    minWidth: "8px",
                    zIndex: 50,
                  }}
                />
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineGrid;
