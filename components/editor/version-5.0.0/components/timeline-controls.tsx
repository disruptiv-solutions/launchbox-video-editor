import React, { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Plus, Minus, Settings, Undo2, Redo2 } from "lucide-react";
import { useEditorContext } from "../contexts/editor-context";
import { useTimeline } from "../contexts/timeline-context";
import { MAX_ROWS, INITIAL_ROWS, ZOOM_CONSTRAINTS } from "../constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTimelineShortcuts } from "../hooks/use-timeline-shortcuts";

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
  const {
    aspectRatio,
    setAspectRatio,
    setSelectedOverlayId,
    deleteOverlaysByRow,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorContext();

  const { visibleRows, addRow, removeRow, zoomScale, setZoomScale } =
    useTimeline();

  // Add this hook to enable shortcuts
  useTimelineShortcuts({
    handlePlayPause: () => {
      if (!isPlaying) {
        setSelectedOverlayId(null);
      }
      togglePlayPause();
    },
    undo,
    redo,
    canUndo,
    canRedo,
    zoomScale,
    setZoomScale,
  });

  // Keep track of previous frame to detect resets
  const prevFrameRef = React.useRef(currentFrame);
  const isPlayingRef = React.useRef(isPlaying);

  useEffect(() => {
    // Only update the ref when isPlaying changes
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    // Only run the check if we're actually playing
    if (isPlayingRef.current) {
      // Detect when frame suddenly drops to 0 from near the end
      if (prevFrameRef.current > totalDuration - 2 && currentFrame === 0) {
        console.log("Video finished - stopping playback");
        togglePlayPause();
      }
    }

    prevFrameRef.current = currentFrame;
  }, [currentFrame, totalDuration, togglePlayPause]); // Removed isPlaying from dependencies

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

  const handleRemoveRow = () => {
    // Delete overlays on the last row before removing it
    deleteOverlaysByRow(visibleRows - 1);
    removeRow();
  };

  const handleSliderChange = useCallback(
    (value: number[]) => {
      setZoomScale(value[0] / 100);
    },
    [setZoomScale]
  );

  return (
    <div className="flex justify-between items-center border-b border-gray-800 bg-gray-900/95 px-4 py-3 backdrop-blur-sm">
      {/* Left section: Now contains undo/redo */}
      <div className="flex items-center gap-1">
        <TooltipProvider delayDuration={50}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={undo}
                disabled={!canUndo}
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-zinc-200 hover:text-white hover:bg-gray-800/80"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={5}
              className="bg-gray-800 text-xs px-2 py-1.5 rounded-md z-[9999] border border-gray-700"
              align="start"
            >
              <div className="flex items-center gap-1">
                <span>Undo</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-900 rounded-md border border-gray-700">
                  ⌘Z
                </kbd>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={redo}
                disabled={!canRedo}
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-zinc-200 hover:text-white hover:bg-gray-800/80"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={5}
              className="bg-gray-800 text-xs px-2 py-1.5 rounded-md z-[9999] border border-gray-700"
              align="start"
            >
              <div className="flex items-center gap-1">
                <span>Redo</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-900 rounded-md border border-gray-700">
                  ⌘Y
                </kbd>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {/* Center section: Play/Pause control and time display */}
      <div className="flex items-center space-x-3">
        <TooltipProvider delayDuration={50}>
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={5}
              className="bg-gray-800 text-xs px-2 py-1.5 rounded-md z-[9999] border border-gray-700"
              align="center"
            >
              <div className="flex items-center gap-1">
                <span>{isPlaying ? "Pause" : "Play"}</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-900 rounded-md border border-gray-700">
                  ⌥ Space
                </kbd>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="text-xs font-medium text-white">
          {formatTime(currentFrame)} / {formatTime(totalDuration)}
        </span>
      </div>
      {/* Right section: Settings menu */}
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-200 hover:text-white hover:bg-gray-800/80 transition-colors rounded-md"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-gray-800 border-gray-500"
            side="top"
            align="end"
            sideOffset={8}
            avoidCollisions={true}
            collisionPadding={16}
          >
            <DropdownMenuLabel className="text-zinc-200">
              Timeline Settings
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />

            {/* Zoom Controls */}
            <div className="px-2 py-2 space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-zinc-400 mb-3">Zoom</Label>
              </div>
              <Slider
                value={[zoomScale * 100]}
                onValueChange={handleSliderChange}
                min={ZOOM_CONSTRAINTS.min * 100}
                max={ZOOM_CONSTRAINTS.max * 100}
                step={ZOOM_CONSTRAINTS.step * 100}
                className="my-1"
              />
            </div>
            <DropdownMenuSeparator className="bg-gray-700" />

            {/* Row Controls */}
            <div className="px-2 py-2 space-y-1">
              <Label className="text-xs text-zinc-400">Rows</Label>
              <div className="flex gap-1 pt-1">
                <Button
                  onClick={handleRemoveRow}
                  disabled={visibleRows <= INITIAL_ROWS}
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 bg-gray-700/50 border-gray-600 hover:bg-gray-700"
                >
                  <Minus className="h-4 w-4 text-white" />
                </Button>
                <span className="flex items-center justify-center w-12 text-xs text-zinc-400">
                  {visibleRows}/{MAX_ROWS}
                </span>
                <Button
                  onClick={addRow}
                  disabled={visibleRows >= MAX_ROWS}
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 bg-gray-700/50 border-gray-600 hover:bg-gray-700"
                >
                  <Plus className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-gray-700" />

            {/* Aspect Ratio */}
            <div className="px-2 py-2 space-y-1">
              <Label className="text-xs text-zinc-400">Aspect Ratio</Label>
              <div className="grid grid-cols-3 gap-1 pt-1">
                {["16:9", "9:16", "4:5"].map((ratio) => (
                  <Button
                    key={ratio}
                    onClick={() => handleAspectRatioChange(ratio)}
                    size="sm"
                    variant={aspectRatio === ratio ? "default" : "outline"}
                    className={`h-8 transition-colors ${
                      aspectRatio === ratio
                        ? "bg-blue-600 hover:bg-blue-500 text-white border-0"
                        : "bg-gray-800/50 border-gray-700 hover:bg-gray-700/80 text-zinc-300"
                    }`}
                  >
                    {ratio}
                  </Button>
                ))}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
