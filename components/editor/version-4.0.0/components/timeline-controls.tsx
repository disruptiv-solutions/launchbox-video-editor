import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useEditorContext } from "../contexts/editor-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
type AspectRatioOption = "16:9" | "9:16" | "1:1" | "4:5";

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
  /** Function to format frame numbers into a time string */
  formatTime: (frames: number) => string;
}

/**
 * TimelineControls component provides video playback controls and aspect ratio selection.
 * It displays:
 * - Play/Pause button
 * - Current time / Total duration
 * - Aspect ratio selector (hidden on mobile)
 *
 * @component
 * @param {TimelineControlsProps} props - Component props
 * @returns {React.ReactElement} Rendered TimelineControls component
 *
 * @example
 * ```tsx
 * <TimelineControls
 *   isPlaying={isPlaying}
 *   togglePlayPause={handlePlayPause}
 *   currentFrame={currentFrame}
 *   totalDuration={duration}
 *   formatTime={formatTimeFunction}
 * />
 * ```
 */
export const TimelineControls: React.FC<TimelineControlsProps> = ({
  isPlaying,
  togglePlayPause,
  currentFrame,
  totalDuration,
  formatTime,
}) => {
  // Context
  const { aspectRatio, setAspectRatio, setSelectedOverlayId } =
    useEditorContext();

  // Handlers
  const handlePlayPause = () => {
    if (!isPlaying) {
      setSelectedOverlayId(null);
    }
    togglePlayPause();
  };

  const handleAspectRatioChange = (value: string) => {
    setAspectRatio(value as AspectRatioOption);
  };

  return (
    <div className="flex justify-between items-center border-gray-600 bg-gray-900 p-3">
      {/* Left section: Empty space for alignment */}
      <div className="w-[70px]" />
      {/* Center section: Play/Pause control and time display */}
      <div className="flex items-center space-x-3">
        <Button
          onClick={handlePlayPause}
          size="icon"
          variant="default"
          className="bg-gray-800 hover:bg-gray-700"
        >
          {isPlaying ? (
            <Pause className="h-3 w-3 text-white" />
          ) : (
            <Play className="h-3 w-3 text-white" />
          )}
        </Button>
        <span className="text-xs font-medium text-white">
          {formatTime(currentFrame)} / {formatTime(totalDuration)}
        </span>
      </div>
      {/* Right section: Aspect ratio control */}
      <div className="hidden sm:block">
        <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
          <SelectTrigger className="w-[70px] h-7 text-xs bg-gray-800 text-white hover:bg-gray-700 hover:text-white border-gray-700">
            <SelectValue placeholder="Aspect Ratio" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 hover:text-white">
            {["16:9", "9:16", "4:5"].map((ratio) => (
              <SelectItem
                key={ratio}
                value={ratio}
                className="text-xs hover:bg-gray-700 focus:bg-gray-700 text-white"
              >
                <div className="flex items-center gap-2">
                  <span>{ratio}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
