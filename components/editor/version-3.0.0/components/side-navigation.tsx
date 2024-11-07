import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FilmIcon, Type, Music } from "lucide-react";

/**
 * Props for the SideNavigation component.
 */
interface SideNavigationProps {
  /** The currently active side panel, or null if no panel is active. */
  activeSidePanel: string | null;
  /** Function to toggle the visibility of a side panel. */
  toggleSidePanel: (panel: "assets" | "text" | "sound") => void;
}

/**
 * SideNavigation component.
 * 
 * This component renders a vertical navigation bar with buttons for different editing options.
 * Each button has a tooltip explaining its function.
 * 
 * @param {SideNavigationProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered SideNavigation component.
 */
const SideNavigation: React.FC<SideNavigationProps> = ({
  activeSidePanel,
  toggleSidePanel,
}) => {
  return (
    <div className="w-28 border bg-gray-900 flex flex-col items-center py-6 border-r border-gray-800">
      <TooltipProvider>
        {/* Video Clip Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeSidePanel === "assets" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => toggleSidePanel("assets")}
              className="mb-6 w-12 h-12"
            >
              <FilmIcon className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Add Video Clip</p>
          </TooltipContent>
        </Tooltip>

        {/* Text Overlay Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeSidePanel === "text" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => toggleSidePanel("text")}
              className="mb-6 w-12 h-12"
            >
              <Type className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Add Text Overlay</p>
          </TooltipContent>
        </Tooltip>

        {/* Sound Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeSidePanel === "sound" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => toggleSidePanel("sound")}
              className="mb-6 w-12 h-12"
            >
              <Music className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Add Sound</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SideNavigation;