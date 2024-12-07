import React, { useCallback } from "react";
import { FPS } from "../constants";

/**
 * Props for the TimeMarkers component
 * @typedef {Object} TimeMarkersProps
 * @property {number} durationInFrames - Total number of frames in the timeline
 * @property {function} handleTimelineClick - Callback function when timeline is clicked
 * @property {number} zoomScale - Current zoom level of the timeline
 */
type TimeMarkersProps = {
  durationInFrames: number;
  handleTimelineClick: (clickPosition: number) => void;
  zoomScale: number;
};

/**
 * Renders timeline markers with adaptive scaling based on zoom level
 * Displays time indicators and clickable markers for timeline navigation
 */
const TimeMarkers = ({
  durationInFrames,
  handleTimelineClick,
  zoomScale,
}: TimeMarkersProps): JSX.Element => {
  const generateMarkers = (): JSX.Element[] => {
    const markers: JSX.Element[] = [];
    const totalSeconds = Math.max(Math.ceil(durationInFrames / FPS), 1);

    // Dynamic interval calculation based on available space
    const baseInterval = (() => {
      const targetMarkerCount = Math.max(
        8,
        Math.min(30, Math.floor(20 * zoomScale))
      );
      const rawInterval = totalSeconds / targetMarkerCount;

      // Round to nearest "nice" number
      const niceIntervals = [
        0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300,
      ];
      return niceIntervals.reduce((prev, curr) =>
        Math.abs(curr - rawInterval) < Math.abs(prev - rawInterval)
          ? curr
          : prev
      );
    })();

    // Calculate sub-intervals for different marker types
    const majorInterval = baseInterval;
    const minorInterval = baseInterval / 4;
    const microInterval = baseInterval / 8;

    // Generate marker elements
    for (let time = 0; time <= totalSeconds; time += microInterval) {
      const [minutes, seconds] = [Math.floor(time / 60), time % 60];
      const isMainMarker = Math.abs(time % majorInterval) < 0.001;
      const isIntermediateMarker = Math.abs(time % minorInterval) < 0.001;
      const shouldShowLabel = isMainMarker;

      const markerElement = (
        <div
          key={time}
          className="absolute top-0 flex flex-col items-center"
          style={{
            left: `${(time / totalSeconds) * 100}%`,
            transform: "translateX(-50%)",
          }}
        >
          <div
            className={`
              ${
                isMainMarker
                  ? "h-2.5 w-[1px] bg-gray-500 "
                  : isIntermediateMarker
                  ? "h-1.5 w-px bg-gray-500"
                  : "h-0.5 w-px bg-gray-500"
              }
              transition-all duration-150 ease-in-out
              group-hover:bg-blue-300
            `}
          />
          {shouldShowLabel && (
            <span
              className={`
                text-[9px] font-medium tracking-tight
                ${isMainMarker ? "text-gray-200" : "text-gray-400"}
                mt-1 select-none
                duration-150
              `}
            >
              {minutes > 0
                ? `${minutes}:${seconds.toString().padStart(2, "0")}`
                : seconds.toFixed(2)}
            </span>
          )}
        </div>
      );

      markers.push(markerElement);
    }

    return markers;
  };

  /**
   * Handles click events on the timeline
   * Calculates the relative position of the click and calls the handler
   */
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const { left, width } = event.currentTarget.getBoundingClientRect();
      // Calculate click position as percentage (0-1)
      const clickPosition = (event.clientX - left) / width;
      handleTimelineClick(clickPosition);
    },
    [handleTimelineClick]
  );

  return (
    <div
      className="absolute top-0 left-0 right-0 h-12 
        cursor-pointer
        z-10"
      onClick={handleClick}
    >
      {generateMarkers()}
    </div>
  );
};

export default TimeMarkers;
