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
  handleTouchStart?: (
    type: "clip" | "text" | "sound",
    id: string,
    action: "move" | "resize-start" | "resize-end",
    e: React.TouchEvent<HTMLDivElement>
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
  setSelectedItem: (item: { id: string } | null) => void;
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
  handleTouchStart,
  handleItemClick,
  totalDuration,
  handleItemContextMenu,
  setSelectedItem,
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
  const dragColor =
    type === "clip"
      ? "bg-indigo-600"
      : type === "text"
      ? "bg-purple-600"
      : "bg-green-600";

  const isSelected = selectedItem?.id === item.id;

  const handleItemInteraction = (
    e: React.MouseEvent | React.TouchEvent,
    action: "click" | "mousedown" | "touchstart"
  ) => {
    e.stopPropagation();
    if (action === "click") {
      handleItemClick(type, item.id, e as React.MouseEvent);
    } else {
      handleMouseDown(
        type,
        item.id,
        "move",
        e as React.MouseEvent<HTMLDivElement>
      );
    }

    setSelectedItem({ id: item.id });
  };

  return (
    <div
      className={`absolute ${bgColor} rounded-sm shadow-sm cursor-grab ${hoverColor} transition duration-300 ease-in-out ${
        isDragging && draggedItem?.id === item.id ? "opacity-50" : ""
      } ${isSelected ? `ring-2 ring-white` : ""} select-none`}
      style={{
        // Position and size the item based on its start time, duration, and row
        left: `calc(${(item.start / totalDuration) * 100}% + 1px)`,
        width: `calc(${(item.duration / totalDuration) * 100}% - 2px)`,
        top: `calc(${(item.row / 4) * 100}% + 6px)`,
        height: `calc(${100 / 4}% - 12px)`,
        zIndex: 10,
      }}
      onMouseDown={(e) => handleMouseDown(type, item.id, "move", e)}
      onTouchStart={(e) => {
        if (handleTouchStart) {
          handleTouchStart(type, item.id, "move", e);
        }
      }}
      onClick={(e) => handleItemInteraction(e, "click")}
      onContextMenu={(e) => handleItemContextMenu(e, type, item.id)}
      onMouseMove={onMouseMove}
      onTouchMove={(e) =>
        onMouseMove(e.touches[0] as unknown as React.MouseEvent)
      }
      onMouseLeave={onMouseLeave}
      onTouchEnd={onMouseLeave}
    >
      {/* Display item type and index */}
      <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
        {type.charAt(0).toUpperCase() + type.slice(1)} {index + 1}
      </div>

      {/* Left resize handle */}
      <div
        className={`absolute left-0 top-0 bottom-0 md:w-1.5 w-1 cursor-ew-resize ${dragColor} mt-1 mb-1 ml-1 z-50 `}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(type, item.id, "resize-start", e);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          if (handleTouchStart) {
            handleTouchStart(type, item.id, "resize-start", e);
          }
        }}
      />

      {/* Right resize handle */}
      <div
        className={`absolute right-0 top-0 bottom-0 md:w-1.5 w-1 cursor-ew-resize ${dragColor} mt-1 mb-1 mr-1 z-50 `}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(type, item.id, "resize-end", e);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          if (handleTouchStart) {
            handleTouchStart(type, item.id, "resize-end", e);
          }
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
