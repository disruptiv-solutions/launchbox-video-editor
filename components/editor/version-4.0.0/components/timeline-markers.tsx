import React, { useCallback } from "react";
import { FPS } from "../constants";

/**
 * Props for the TimeMarkers component.
 * @interface TimeMarkersProps
 */
interface TimeMarkersProps {
  /** Total duration of the timeline in frames */
  durationInFrames: number;
  /** Handler function for timeline click events */
  handleTimelineClick: (clickPosition: number) => void;
}

/**
 * TimeMarkers component for rendering time markers on a timeline.
 * @param {TimeMarkersProps} props - The component props
 * @returns {React.FC} A React functional component
 */
const TimeMarkers: React.FC<TimeMarkersProps> = ({
  durationInFrames,
  handleTimelineClick,
}) => {
  /**
   * Renders time markers based on the total duration and zoom level.
   * @returns {React.ReactNode[]} An array of time marker elements
   */
  const renderTimeMarkers = () => {
    const markers = [];
    const totalSeconds = Math.max(Math.ceil(durationInFrames / FPS), 1);
    const zoomedDuration = totalSeconds;

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
    const labelInterval = Math.max(
      interval,
      Math.floor(totalSeconds / minLabels)
    );

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
          style={{ left: `${(i / totalSeconds) * 100}%` }}
        >
          <div
            className={`w-px ${
              isMainMarker ? "h-2.5 bg-white" : "h-1 md:h-1.5 bg-white"
            }`}
          />
          {shouldShowLabel && (
            <span className="text-[6px] md:text-[10px] text-zinc-200 mt-0.5 hover:cursor-default">
              {`${minutes}:${seconds.toString().padStart(2, "0")}`}
            </span>
          )}
        </div>
      );
    }
    return markers;
  };

  const onTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      // Don't multiply by frames here, just pass the raw percentage
      handleTimelineClick(clickPosition);
    },
    [handleTimelineClick]
  );

  return (
    <div
      className="absolute top-0 left-0 right-0 h-4 md:h-8 text-zinc-200 flex items-end overflow-hidden z-10 border-t border-gray-800 bg-gray-900/95"
      onClick={onTimelineClick}
    >
      {renderTimeMarkers()}
    </div>
  );
};

export default TimeMarkers;
