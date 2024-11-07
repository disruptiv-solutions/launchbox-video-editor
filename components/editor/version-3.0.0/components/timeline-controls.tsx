import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

/**
 * Props for the TimelineControls component.
 * @interface TimelineControlsProps
 */
interface TimelineControlsProps {
  /** Indicates whether the timeline is currently playing */
  isPlaying: boolean;
  /** Function to toggle between play and pause states */
  togglePlayPause: () => void;
  /** The current frame number in the timeline */
  currentFrame: number;
  /** The total duration of the timeline in frames */
  totalDuration: number;
  /** The current aspect ratio of the video */
  aspectRatio: string;
  /** Function to set the aspect ratio of the video */
  setAspectRatio: (ratio: "16:9" | "4:3" | "1:1") => void;
  /** Function to format frame numbers into a time string */
  formatTime: (frames: number) => string;
}

/**
 * TimelineControls component for video playback and aspect ratio control.
 * 
 * @component
 * @param {TimelineControlsProps} props - The props for the TimelineControls component
 * @returns {React.ReactElement} The rendered TimelineControls component
 */
const TimelineControls: React.FC<TimelineControlsProps> = ({
  isPlaying,
  togglePlayPause,
  currentFrame,
  totalDuration,
  aspectRatio,
  setAspectRatio,
  formatTime,
}) => {
  return (
    <div className="flex justify-between items-center border-b border-gray-700 p-4">
      {/* Play/Pause control and time display */}
      <div className="flex items-center space-x-4">
        <Button
          size="icon"
          onClick={togglePlayPause}
          className="bg-gray-800"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <span className="text-sm font-medium text-white">
          {formatTime(currentFrame)} / {formatTime(totalDuration)}
        </span>
      </div>
      {/* Aspect ratio control */}
      <div className="hidden md:flex items-center space-x-4">
        <label
          htmlFor="aspect-ratio"
          className="text-sm font-medium text-white"
        >
          Aspect Ratio:
        </label>
        <div className="relative">
          <select
            id="aspect-ratio"
            value={aspectRatio}
            onChange={(e) =>
              setAspectRatio(e.target.value as "16:9" | "4:3" | "1:1")
            }
            className="appearance-none bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="16:9">16:9</option>
            <option value="4:3">4:3</option>
            <option value="1:1">1:1</option>
          </select>
          {/* Custom dropdown arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineControls;