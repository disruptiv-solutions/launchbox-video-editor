import React from "react";
import { Clip, TextOverlay, Sound } from "../types";

/**
 * TimelineItem Component
 *
 * This component represents an item (clip, text overlay, or sound) on the timeline.
 * It handles rendering, positioning, and user interactions for each item.
 *
 * @param props - The properties passed to the TimelineItem component
 * @returns A React functional component
 */

interface TimelineItemProps {
  item: Clip | TextOverlay | Sound;
  type: "clip" | "text" | "sound";
  index: number;
  isDragging: boolean;
  draggedItem: { id: string } | null;
  selectedItem: { id: string } | null;
  handleMouseDown: (
    type: "clip" | "text" | "sound",
    id: string,
    action: "move" | "resize-start" | "resize-end",
    e: React.MouseEvent<HTMLDivElement>
  ) => void;
  handleItemClick: (
    type: "clip" | "text" | "sound",
    id: string,
    e: React.MouseEvent
  ) => void;
  totalDuration: number;
  handleItemContextMenu: (
    e: React.MouseEvent,
    type: "clip" | "text" | "sound",
    id: string
  ) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  hoverInfo: { position: number } | null;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  item,
  type,
  index,
  isDragging,
  draggedItem,
  selectedItem,
  handleMouseDown,
  handleItemClick,
  totalDuration,
  handleItemContextMenu,
  onMouseMove,
  onMouseLeave,
  hoverInfo,
}) => {
  // Define color schemes for different item types
  const bgColor =
    type === "clip"
      ? "bg-indigo-500 to-indigo-400"
      : type === "text"
      ? "bg-purple-500 to-purple-400"
      : "bg-green-500 to-green-400";
  const hoverColor =
    type === "clip"
      ? "hover:bg-indigo-400 hover:bg-indigo-400"
      : type === "text"
      ? "hover:bg-purple-400"
      : "hover:bg-green-400";
  const ringColor =
    type === "clip"
      ? "ring-indigo-500"
      : type === "text"
      ? "ring-purple-500"
      : "ring-green-500";
  const dragColor =
    type === "clip"
      ? "bg-indigo-600"
      : type === "text"
      ? "bg-purple-600"
      : "bg-green-600";

  return (
    <div
      className={`absolute ${bgColor} rounded-sm shadow-sm cursor-grab ${hoverColor} transition duration-300 ease-in-out ${
        isDragging && draggedItem?.id === item.id ? "opacity-50" : ""
      } ${
        selectedItem?.id === item.id ? `ring-2 ${ringColor}` : ""
      } select-none`}
      style={{
        // Position and size the item based on its start time, duration, and row
        left: `calc(${(item.start / totalDuration) * 100}% + 1px)`,
        width: `calc(${(item.duration / totalDuration) * 100}% - 2px)`,
        top: `calc(${(item.row / 4) * 100}% + 6px)`,
        height: `calc(${100 / 4}% - 12px)`,
        zIndex: 10,
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        handleMouseDown(type, item.id, "move", e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleItemClick(type, item.id, e);
      }}
      onContextMenu={(e) => handleItemContextMenu(e, type, item.id)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Display item type and index */}
      <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold">
        {type.charAt(0).toUpperCase() + type.slice(1)} {index + 1}
      </div>

      {/* Left resize handle */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-md cursor-ew-resize ${dragColor} mt-1 mb-1 ml-1 z-50 `}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(type, item.id, "resize-start", e);
        }}
      />

      {/* Right resize handle */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-1.5 rounded-md cursor-ew-resize ${dragColor} mt-1 mb-1 mr-1 z-50 `}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(type, item.id, "resize-end", e);
        }}
      />

      {/* Hover indicator */}
      {hoverInfo && (
        <div
          className="absolute top-0 h-full w-0.5 bg-white"
          style={{
            left: `${
              ((hoverInfo.position - item.start) / item.duration) * 100
            }%`,
          }}
        />
      )}
    </div>
  );
};

export default TimelineItem;
