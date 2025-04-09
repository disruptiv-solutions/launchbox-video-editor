import React, { useState } from "react";
import { Info, ChevronDown, Check } from "lucide-react";
import { VIDEO_FILTER_PRESETS } from "../../../templates/video/video-filter-presets";
import { ClipOverlay } from "../../../types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VideoFilterPresetSelectorProps {
  localOverlay: ClipOverlay;
  handleStyleChange: (updates: Partial<ClipOverlay["styles"]>) => void;
}

/**
 * VideoFilterPresetSelector Component
 *
 * A visual component for selecting predefined video filters/presets.
 * Displays visual previews of each filter applied to a thumbnail of the current video.
 *
 * @component
 * @param {VideoFilterPresetSelectorProps} props - Component props
 * @returns {JSX.Element} A grid of filter previews
 */
export const VideoFilterPresetSelector: React.FC<
  VideoFilterPresetSelectorProps
> = ({ localOverlay, handleStyleChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine which preset (if any) is currently active
  const getCurrentPresetId = (): string => {
    const currentFilter = localOverlay?.styles?.filter || "none";

    // If no filter is applied or it's explicitly "none", return "none"
    if (!currentFilter || currentFilter === "none") {
      return "none";
    }

    // Try to find a matching preset
    const matchingPreset = VIDEO_FILTER_PRESETS.find(
      (preset) => preset.filter === currentFilter
    );

    // Return the matching preset ID or "custom" if no match is found
    return matchingPreset?.id || "custom";
  };

  // Get the current preset name for display
  const getCurrentPresetName = (): string => {
    const currentId = getCurrentPresetId();
    if (currentId === "custom") return "Custom";
    const preset = VIDEO_FILTER_PRESETS.find((p) => p.id === currentId);
    return preset?.name || "None";
  };

  // When a new preset is selected, apply its filter
  const handlePresetChange = (presetId: string) => {
    const selectedPreset = VIDEO_FILTER_PRESETS.find(
      (preset) => preset.id === presetId
    );

    if (selectedPreset) {
      // Preserve any brightness adjustments if the user has made them
      let newFilter = selectedPreset.filter;

      // If we're selecting "none", remove all filters
      if (presetId === "none") {
        newFilter = "none";
      }
      // Otherwise, try to preserve brightness from existing filter
      else {
        const currentFilter = localOverlay?.styles?.filter;
        const brightnessMatch = currentFilter?.match(/brightness\((\d+)%\)/);

        if (
          brightnessMatch &&
          brightnessMatch[1] &&
          !newFilter.includes("brightness") &&
          newFilter !== "none"
        ) {
          // Add brightness to the new filter if the new filter doesn't already have it
          newFilter = `${newFilter} brightness(${brightnessMatch[1]}%)`;
        }
      }

      handleStyleChange({ filter: newFilter });
      setIsExpanded(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-600 dark:text-gray-400">
            Filter Preset
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <Info className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                Apply pre-defined video filters. Note: Individual adjustments
                like brightness may be preserved when switching filters.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Current filter display and toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex justify-between items-center w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-xs p-2 hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-gray-900 dark:text-gray-100"
      >
        <span>{getCurrentPresetName()}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded filter grid */}
      {isExpanded && (
        <div className="mt-2 grid grid-cols-3 gap-2 bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
          {VIDEO_FILTER_PRESETS.map((preset) => {
            const isActive = getCurrentPresetId() === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset.id)}
                className={`relative p-1 rounded-md overflow-hidden flex flex-col items-center transition-all ${
                  isActive
                    ? "ring-2 ring-blue-500 dark:ring-blue-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {/* Video thumbnail with filter applied */}
                <div className="relative h-12 w-full mb-1 rounded overflow-hidden">
                  <img
                    src={localOverlay.content}
                    alt={`${preset.name} preview`}
                    className="w-full h-full object-cover"
                    style={{ filter: preset.filter }}
                  />
                  {isActive && (
                    <div className="absolute top-1 right-1 bg-blue-500 dark:bg-blue-400 rounded-full p-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] leading-tight text-center">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
