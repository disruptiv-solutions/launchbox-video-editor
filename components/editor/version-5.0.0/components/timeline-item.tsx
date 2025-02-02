import React, { useCallback, useMemo, memo } from "react";
import { Overlay } from "../types";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Trash2, Copy, Scissors, Type, Film, Music } from "lucide-react";
import { useWaveformProcessor } from "../hooks/use-waveform-processor";
import WaveformVisualizer from "./waveform-visualizer";

/**
 * TimelineItem Component
 *
 * A draggable, resizable item displayed on the video editor timeline. Each item represents
 * a clip, text overlay, or sound element in the video composition.
 *
 * Features:
 * - Draggable positioning
 * - Resizable handles on both ends
 * - Context menu for quick actions
 * - Touch support for mobile devices
 * - Visual feedback for selection and dragging states
 * - Color-coded by content type (text, clip, sound)
 *
 * @component
 */

// Add new interface for waveform data
interface WaveformData {
  peaks: number[];
  length: number;
}

interface TimelineItemProps {
  /** The overlay item data to be rendered */
  item: Overlay;
  /** Whether any item is currently being dragged */
  isDragging: boolean;
  /** Reference to the item currently being dragged, if any */
  draggedItem: Overlay | null;
  /** Currently selected item in the timeline */
  selectedItem: { id: number } | null;
  /** Callback to update the selected item */
  setSelectedItem: (item: { id: number }) => void;
  /** Handler for mouse-based drag and resize operations */
  handleMouseDown: (
    action: "move" | "resize-start" | "resize-end",
    e: React.MouseEvent<HTMLDivElement>
  ) => void;
  /** Handler for touch-based drag and resize operations */
  handleTouchStart: (
    action: "move" | "resize-start" | "resize-end",
    e: React.TouchEvent<HTMLDivElement>
  ) => void;
  /** Callback when an item is clicked */
  handleItemClick: (type: string, id: number) => void;
  /** Total duration of the timeline in frames */
  totalDuration: number;
  /** Callback to delete an item */
  onDeleteItem: (id: number) => void;
  /** Callback to duplicate an item */
  onDuplicateItem: (id: number) => void;
  /** Callback to split an item at the current position */
  onSplitItem: (id: number) => void;
  /** Callback fired when hovering over an item */
  onHover: (itemId: number, position: number) => void;
  /** Callback fired when context menu state changes */
  onContextMenuChange: (open: boolean) => void;
  /** Waveform data for audio items */
  waveformData?: WaveformData;
}

/** Height of each timeline item in pixels */
export const TIMELINE_ITEM_HEIGHT = 40;

const TimelineItem: React.FC<TimelineItemProps> = ({
  item,
  isDragging,
  draggedItem,
  selectedItem,
  setSelectedItem,
  handleMouseDown,
  handleTouchStart,
  handleItemClick,
  totalDuration,
  onDeleteItem,
  onDuplicateItem,
  onSplitItem,
  onHover,
  onContextMenuChange,
}) => {
  const waveformData = useWaveformProcessor(
    item.type === "sound" ? item.src : undefined,
    item.type === "sound" ? item.startFromSound : undefined,
    item.durationInFrames
  );

  const isSelected = selectedItem?.id === item.id;

  /**
   * Handles mouse and touch interactions with the timeline item
   * Prevents event bubbling and triggers appropriate handlers based on the action
   */
  const handleItemInteraction = (
    e: React.MouseEvent | React.TouchEvent,
    action: "click" | "mousedown" | "touchstart"
  ) => {
    e.stopPropagation();
    if (action === "click") {
      handleItemClick("overlay", item.id);
      setSelectedItem({ id: item.id });
    } else if (action === "mousedown") {
      handleMouseDown("move", e as React.MouseEvent<HTMLDivElement>);
    } else if (action === "touchstart") {
      handleTouchStart("move", e as React.TouchEvent<HTMLDivElement>);
    }
  };

  /**
   * Calculates and reports the hover position within the item
   * Used for showing precise position indicators while hovering
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!e.currentTarget) {
        console.warn("Current target is null or undefined");
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      if (!rect) {
        console.warn("getBoundingClientRect returned null or undefined");
        return;
      }
      const relativeX = e.clientX - rect.left;
      const hoverPosition =
        item.from + (relativeX / rect.width) * item.durationInFrames;
      onHover(item.id, Math.round(hoverPosition));
    },
    [item, onHover]
  );

  /**
   * Returns Tailwind CSS classes for styling based on content type
   */
  const getItemClasses = (type: string, isHandle: boolean = false): string => {
    switch (type) {
      case "text":
        return isHandle
          ? "bg-purple-800"
          : "bg-purple-500/90 hover:bg-purple-600 border-purple-400 text-white";
      case "clip":
        return isHandle
          ? "bg-indigo-800"
          : "bg-indigo-500/90 hover:bg-indigo-600 border-indigo-400 text-white";
      case "sound":
        return isHandle
          ? "bg-amber-800"
          : "bg-amber-500/90 hover:bg-amber-600 border-amber-400 text-white";
      default:
        return isHandle
          ? "bg-gray-500"
          : "bg-gray-500/90 hover:bg-gray-600 border-gray-400 text-white";
    }
  };

  const itemClasses = useMemo(() => getItemClasses(item.type), [item.type]);

  return (
    <ContextMenu onOpenChange={onContextMenuChange}>
      <ContextMenuTrigger className="z-[100]">
        <div
          className={`absolute inset-y-0 rounded-md shadow-md cursor-grab 
          ${itemClasses} 
          ${
            isDragging && draggedItem?.id === item.id
              ? "opacity-50"
              : "transition-transform duration-75"
          } 
          ${
            isSelected
              ? "border-2 shadow-[0_0_0_2px_rgba(255,255,255,0.6)] border-white"
              : "border border-white/20"
          } select-none pointer-events-auto overflow-hidden`}
          style={{
            left: `${(item.from / totalDuration) * 100}%`,
            width: `${(item.durationInFrames / totalDuration) * 100}%`,
            zIndex: isDragging ? 1 : 30,
          }}
          onMouseDown={(e) => handleItemInteraction(e, "mousedown")}
          onTouchStart={(e) => handleItemInteraction(e, "touchstart")}
          onClick={(e) => handleItemInteraction(e, "click")}
          onMouseMove={handleMouseMove}
        >
          {item.type === "sound" && waveformData && (
            <div className="absolute inset-0 opacity-40">
              <WaveformVisualizer
                waveformData={waveformData}
                totalDuration={totalDuration}
                durationInFrames={item.durationInFrames}
              />
            </div>
          )}

          <div className="absolute inset-0 flex items-center px-2 text-xs font-medium">
            <div className="flex items-center gap-1.5 z-10">
              {item.type === "text" ? (
                <Type className="w-3.5 h-3.5" />
              ) : item.type === "clip" ? (
                <Film className="w-3.5 h-3.5" />
              ) : item.type === "sound" ? (
                <Music className="w-3.5 h-3.5" />
              ) : null}
              <span className="capitalize truncate">{item.type}</span>
            </div>
          </div>

          {/* Resize handles with improved visibility */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize ${getItemClasses(
              item.type,
              true
            )} z-20 opacity-0 hover:opacity-100 transition-opacity duration-200`}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleMouseDown("resize-start", e);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleTouchStart("resize-start", e);
            }}
          />
          <div
            className={`absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize ${getItemClasses(
              item.type,
              true
            )} z-20 opacity-0 hover:opacity-100 transition-opacity duration-200`}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleMouseDown("resize-end", e);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleTouchStart("resize-end", e);
            }}
          />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onDeleteItem(item.id)}>
          <Trash2 className="mr-4 h-4 w-4" />
          Delete
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onDuplicateItem(item.id)}>
          <Copy className="mr-4 h-4 w-4" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onSplitItem(item.id)}>
          <Scissors className="mr-4 h-4 w-4" />
          Split
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default memo(TimelineItem);
