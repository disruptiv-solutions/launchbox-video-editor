/**
 * Timeline Component
 *
 * A complex timeline interface that allows users to manage video overlays through
 * drag-and-drop interactions, splitting, duplicating, and deletion operations.
 * The timeline visualizes overlay positions and durations across video frames.
 */

"use client";

import React, { useState, useCallback } from "react";
import { Overlay } from "../types";
import TimelineMarker from "./timeline-marker";
import TimeMarkers from "./timeline-markers";
import GhostMarker from "./ghost-marker";
import TimelineGrid from "./timeline-grid";
import { useTimelineState } from "../hooks/use-timeline-state";
import { useTimelineDragAndDrop } from "../hooks/use-timeline-drag-and-drop";
import { useTimelineEventHandlers } from "../hooks/use-timeline-event-handlers";
import { MAX_ROWS } from "../constants";

interface TimelineProps {
  /** Array of overlay objects to be displayed on the timeline */
  overlays: Overlay[];
  /** Total duration of the video in frames */
  durationInFrames: number;
  /** ID of the currently selected overlay */
  selectedOverlayId: number | null;
  /** Callback to update the selected overlay */
  setSelectedOverlayId: (id: number | null) => void;
  /** Current playhead position in frames */
  currentFrame: number;
  /** Callback when an overlay is modified */
  onOverlayChange: (updatedOverlay: Overlay) => void;
  /** Callback to update the current frame position */
  setCurrentFrame: (frame: number) => void;
  /** Callback for timeline click events */
  onTimelineClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Callback to delete an overlay */
  onOverlayDelete: (id: number) => void;
  /** Callback to duplicate an overlay */
  onOverlayDuplicate: (id: number) => void;
  /** Callback to split an overlay at a specific position */
  onSplitOverlay: (id: number, splitPosition: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({
  overlays,
  durationInFrames,
  selectedOverlayId,
  setSelectedOverlayId,
  currentFrame,
  onOverlayChange,
  setCurrentFrame,
  onTimelineClick,
  onOverlayDelete,
  onOverlayDuplicate,
  onSplitOverlay,
}) => {
  // State for tracking hover position during split operations
  const [lastKnownHoverInfo, setLastKnownHoverInfo] = useState<{
    itemId: number;
    position: number;
  } | null>(null);

  // State for context menu visibility
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  // Custom hooks for timeline functionality
  const {
    timelineRef,
    isDragging,
    draggedItem,
    ghostElement,
    ghostMarkerPosition,
    dragInfo,
    handleDragStart: timelineStateHandleDragStart,
    updateGhostElement,
    resetDragState,
    setGhostMarkerPosition,
  } = useTimelineState(durationInFrames, MAX_ROWS);

  const { handleDragStart, handleDrag, handleDragEnd } = useTimelineDragAndDrop(
    {
      overlays,
      durationInFrames,
      onOverlayChange,
      updateGhostElement,
      resetDragState,
      timelineRef,
      dragInfo,
      maxRows: MAX_ROWS,
    }
  );

  const { handleMouseMove, handleTouchMove, handleTimelineMouseLeave } =
    useTimelineEventHandlers({
      handleDrag,
      handleDragEnd,
      isDragging,
      timelineRef,
      setGhostMarkerPosition,
    });

  // Event Handlers
  const combinedHandleDragStart = useCallback(
    (
      overlay: Overlay,
      clientX: number,
      clientY: number,
      action: "move" | "resize-start" | "resize-end"
    ) => {
      timelineStateHandleDragStart(overlay, clientX, clientY, action);
      handleDragStart(overlay, clientX, clientY, action);
    },
    [timelineStateHandleDragStart, handleDragStart]
  );

  const handleTimelineClick = useCallback(
    (clickPosition: number) => {
      const newFrame = Math.round(clickPosition * durationInFrames);
      setCurrentFrame(newFrame);
    },
    [durationInFrames, setCurrentFrame]
  );

  const handleDeleteItem = useCallback(
    (id: number) => onOverlayDelete(id),
    [onOverlayDelete]
  );

  const handleDuplicateItem = useCallback(
    (id: number) => onOverlayDuplicate(id),
    [onOverlayDuplicate]
  );

  const handleItemHover = useCallback(
    (itemId: number, hoverPosition: number) => {
      setLastKnownHoverInfo({
        itemId,
        position: Math.round(hoverPosition),
      });
    },
    []
  );

  const handleSplitItem = useCallback(
    (id: number) => {
      if (lastKnownHoverInfo?.itemId === id) {
        onSplitOverlay(id, lastKnownHoverInfo.position);
      }
    },
    [lastKnownHoverInfo, onSplitOverlay]
  );

  const handleContextMenuChange = useCallback(
    (isOpen: boolean) => setIsContextMenuOpen(isOpen),
    []
  );

  // Render
  return (
    <div
      ref={timelineRef}
      className="pl-2 pr-2 pb-2 w-full relative bg-gray-900"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseUp={handleDragEnd}
      onTouchEnd={handleDragEnd}
      onMouseLeave={handleTimelineMouseLeave}
      onClick={onTimelineClick}
    >
      <div className="relative h-full">
        {/* Timeline header with frame markers */}
        <div className="h-7">
          <TimeMarkers
            durationInFrames={durationInFrames}
            handleTimelineClick={handleTimelineClick}
          />
        </div>

        {/* Current frame indicator */}
        <TimelineMarker
          currentFrame={currentFrame}
          totalDuration={durationInFrames}
        />

        {/* Drag operation visual feedback */}
        <GhostMarker
          position={ghostMarkerPosition}
          isDragging={isDragging}
          isContextMenuOpen={isContextMenuOpen}
        />

        {/* Main timeline grid with overlays */}
        <TimelineGrid
          overlays={overlays}
          isDragging={isDragging}
          draggedItem={draggedItem}
          selectedOverlayId={selectedOverlayId}
          setSelectedOverlayId={setSelectedOverlayId}
          handleDragStart={combinedHandleDragStart}
          totalDuration={durationInFrames}
          ghostElement={ghostElement}
          onDeleteItem={handleDeleteItem}
          onDuplicateItem={handleDuplicateItem}
          onSplitItem={handleSplitItem}
          onHover={handleItemHover}
          onContextMenuChange={handleContextMenuChange}
        />
      </div>
    </div>
  );
};

export default Timeline;
