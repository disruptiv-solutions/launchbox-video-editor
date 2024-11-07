import React from 'react';

/**
 * Props for the GhostMarker component.
 */
interface GhostMarkerProps {
  /** The horizontal position of the marker as a percentage (0-100) or null if not set. */
  position: number | null;
  /** Indicates whether the component is being rendered on a mobile device. */
  isMobile: boolean;
  /** Indicates whether a dragging action is currently in progress. */
  isDragging: boolean;
}

/**
 * GhostMarker component displays a vertical line with a triangle on top to indicate a specific position.
 * It's typically used in editing interfaces to show potential insertion points or selections.
 *
 * @param {GhostMarkerProps} props - The props for the GhostMarker component.
 * @returns {React.ReactElement | null} The rendered GhostMarker or null if it should not be displayed.
 */
const GhostMarker: React.FC<GhostMarkerProps> = ({ position, isMobile, isDragging }) => {
  // Don't render the marker on mobile, when position is not set, or during dragging
  if (isMobile || position === null || isDragging) {
    return null;
  }

  return (
    <div
      className="absolute top-0 w-[2.4px] bg-blue-500 opacity-50 pointer-events-none z-40"
      style={{
        left: `${position}%`,
        height: "calc(100% + 0px)",
      }}
    >
      <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-blue-500 absolute top-[0px] left-1/2 transform -translate-x-1/2" />
    </div>
  );
};

export default GhostMarker;