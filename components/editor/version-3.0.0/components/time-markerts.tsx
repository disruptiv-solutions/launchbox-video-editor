import React from 'react';

/**
 * Props for the TimeMarkers component.
 * @interface TimeMarkersProps
 */
interface TimeMarkersProps {
  /** Total duration of the timeline in seconds */
  totalDuration: number;
  /** Zoom level of the timeline */
  zoom: number;
  /** Handler function for timeline click events */
  handleTimelineClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * TimeMarkers component for rendering time markers on a timeline.
 * @param {TimeMarkersProps} props - The component props
 * @returns {React.FC} A React functional component
 */
const TimeMarkers: React.FC<TimeMarkersProps> = ({ totalDuration, zoom, handleTimelineClick }) => {
  /**
   * Renders time markers based on the total duration and zoom level.
   * @returns {React.ReactNode[]} An array of time marker elements
   */
  const renderTimeMarkers = () => {
    const markers = [];
    const totalSeconds = Math.max(Math.ceil(totalDuration / 30), 1);
    const zoomedDuration = totalSeconds / zoom;

    // Determine interval and sub-interval based on zoomed duration
    let interval, subInterval;
    if (zoomedDuration <= 5) {
      interval = 1;
      subInterval = 0.5;
    } else if (zoomedDuration <= 10) {
      interval = 2;
      subInterval = 0.5;
    } else if (zoomedDuration <= 30) {
      interval = 5;
      subInterval = 1;
    } else if (zoomedDuration <= 60) {
      interval = 10;
      subInterval = 2;
    } else if (zoomedDuration <= 300) {
      interval = 30;
      subInterval = 5;
    } else {
      interval = 60;
      subInterval = 15;
    }

    const minLabels = 4;
    const labelInterval = Math.max(interval, Math.floor(totalSeconds / minLabels));

    // Generate markers
    for (let i = 0; i <= totalSeconds; i += subInterval) {
      const minutes = Math.floor(i / 60);
      const seconds = i % 60;
      const isMainMarker = i % interval === 0;
      const shouldShowLabel = i % labelInterval === 0;

      markers.push(
        <div
          key={i}
          className="absolute top-0 flex flex-col items-center"
          style={{ left: `${(i / totalSeconds) * 100 * zoom}%` }}
        >
          <div
            className={`w-px ${
              isMainMarker ? "h-1 md:h-3 bg-white" : "h-1 md:h-1.5 bg-gray-400"
            }`}
          />
          {shouldShowLabel && (
            <span className="text-[8px] md:text-xs text-white mt-0.5">
              {`${minutes}:${seconds.toString().padStart(2, "0")}`}
            </span>
          )}
        </div>
      );
    }
    return markers;
  };

  return (
    <div
      className="absolute top-0 left-0 right-0 h-6 md:h-10 bg-gray-900 flex items-end px-2 overflow-hidden z-10"
      onClick={handleTimelineClick}
    >
      {renderTimeMarkers()}
    </div>
  );
};

export default TimeMarkers;