import React from 'react';
import { MAX_ROWS } from '../constants';

/**
 * Props for the GhostTimelineItem component.
 */
interface GhostTimelineItemProps {
  /** The left position of the item as a percentage */
  left: number;
  /** The width of the item as a percentage */
  width: number;
  /** The top position of the item as a percentage */
  top: number;
  /** The total duration of the timeline in frames */
  totalDuration: number;
  /** Function to format time from frames to a string representation */
  formatTime: (frames: number) => string;
}

/**
 * GhostTimelineItem component
 * 
 * Renders a ghost item on the timeline, typically used for previewing
 * drag operations or potential placements.
 *
 * @param props - The component props
 * @returns A React functional component
 */
const GhostTimelineItem: React.FC<GhostTimelineItemProps> = ({ left, width, top, totalDuration, formatTime }) => {
  return (
    <div
      className="absolute bg-gray-50 bg-opacity-50 rounded-md shadow-lg opacity-80 ghost-transition border-2 border-white border-dashed"
      style={{
        left: `calc(${left}% + 1px)`,
        width: `calc(${width}% - 2px)`,
        top: `calc(${top}% + 8px)`,
        height: `calc(${100 / MAX_ROWS}% - 16px)`,
        boxShadow: "0 0 0 2px rgba(255, 255, 255, 0.3)",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white text-xs font-semibold bg-gray-900 bg-opacity-75 px-2 py-1 rounded">
          {formatTime(Math.round((width / 100) * totalDuration))}
        </div>
      </div>
    </div>
  );
};

export default GhostTimelineItem;