import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FilmIcon, Type, Music } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import PexelsMediaSelector from "../pexels-media-selector";
import AudioTrackSelector from "../audio-track-selector";
import TextOverlayEditor from "../text-overlay-editor";
import { TextOverlay, PexelsMedia, LocalSound, SelectedItem, TextOverlayTemplate } from "../../types";
import {
    textOverlayTemplates
  } from "../../templates/text-overlay-templates";
  import { v4 as uuidv4 } from "uuid";

/**
 * Props for the MobileNavigation component.
 */
interface MobileNavigationProps {
  activeSidePanel: "text" | "sound" | "assets" | null;
  toggleSidePanel: (panel: "text" | "sound" | "assets" | null) => void;
  handlePexelsItemClick: (item: PexelsMedia) => void;
  pexelsMedia: PexelsMedia[];
  isLoadingMedia: boolean;
  availableSounds: LocalSound[];
  addSound: (track: LocalSound) => void;
  selectedItem: SelectedItem;
  newOverlay: TextOverlay;
  handleUpdateOverlay: (updatedOverlay: TextOverlay) => void;
  textOverlays: TextOverlay[];
  handleExampleClick: (example: TextOverlay) => void;
}

/**
 * MobileNavigation component for handling mobile-specific navigation and content selection.
 * 
 * This component provides a mobile-friendly interface for selecting assets, text overlays,
 * and sounds. It includes a bottom navigation bar and an overlay panel for content selection.
 */
const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeSidePanel,
  toggleSidePanel,
  handlePexelsItemClick,
  pexelsMedia,
  isLoadingMedia,
  availableSounds,
  addSound,
  selectedItem,
  newOverlay,
  handleUpdateOverlay,
  textOverlays,
  handleExampleClick,
}) => {
  // State to control the visibility of the overlay panel
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  /**
   * Handles toggling the side panel and overlay visibility.
   * @param panel - The panel to toggle ("text", "sound", "assets", or null)
   */
  const handleTogglePanel = (panel: "text" | "sound" | "assets" | null) => {
    if (activeSidePanel === panel) {
      setIsOverlayOpen(false);
      setTimeout(() => toggleSidePanel(null), 0);
    } else {
      toggleSidePanel(panel);
      setIsOverlayOpen(true);
    }
  };

  /**
   * Handles the selection of a Pexels media item on mobile.
   * @param item - The selected PexelsMedia item
   */
  const handleMobilePexelsItemClick = (item: PexelsMedia) => {
    handlePexelsItemClick(item);

    setIsOverlayOpen(false);
    setTimeout(() => toggleSidePanel(null), 0);
  };

  /**
   * Handles the selection of a sound track on mobile.
   * @param track - The selected LocalSound track
   */
  const handleMobileSoundItemClick = (track: LocalSound) => {
    addSound(track);

    setIsOverlayOpen(false);
    setTimeout(() => toggleSidePanel(null), 0);
  };

  return (
    <>
      {/* Bottom navigation bar */}
      <div className="bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around items-center p-2">
        <Button
          variant={activeSidePanel === "assets" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => handleTogglePanel("assets")}
          className="w-8 h-8"
        >
          <FilmIcon className="h-4 w-4" />
        </Button>
        <Button
          variant={activeSidePanel === "text" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => handleTogglePanel("text")}
          className="w-8 h-8"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          variant={activeSidePanel === "sound" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => handleTogglePanel("sound")}
          className="w-8 h-8"
        >
          <Music className="h-4 w-4" />
        </Button>
      </div>
      {isOverlayOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-50">
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                {activeSidePanel === "text" && "Text Overlay"}
                {activeSidePanel === "sound" && "Sound"}
                {activeSidePanel === "assets" && "Media Assets"}
              </h2>
              <Button
                variant="ghost"
                onClick={() => handleTogglePanel(activeSidePanel)}
              >
                Close
              </Button>
            </div>
            <ScrollArea className="flex-grow">
              <div className="p-4">
                {activeSidePanel === "assets" && (
                  <PexelsMediaSelector
                    onItemClick={handleMobilePexelsItemClick}
                    pexelsMedia={pexelsMedia}
                    isLoadingMedia={isLoadingMedia}
                  />
                )}
                {activeSidePanel === "text" && (
                  <>
                    {!selectedItem || selectedItem.type !== "text" ? (
                     <div className="grid gap-4 scrollbar-hide">
                     {textOverlayTemplates.slice(0, 4).map((example: TextOverlayTemplate, index: number) => (
                       <div
                         key={index}
                         className="rounded-md cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.03] bg-gray-800 hover:bg-gray-700"
                         onClick={() => handleExampleClick({ ...example, id: uuidv4() })}
                       >
                         <div 
                           className="rounded-md overflow-hidden  "
                           style={{
                             transition: '0.2s ease-in-out',
                           }}
                         >
                           <p
                             className={`${example.fontFamily} p-4`}
                             style={{
                               color: example.fontColor,
                               fontSize: example.displayFontSize,
                               fontWeight: example.fontWeight,
                             }}
                           >
                             {example.text}
                           </p>
                         </div>
                       </div>
                     ))}
                   </div>
                    ) : (
                      <TextOverlayEditor
                        overlay={
                          textOverlays.find(
                            (overlay) => overlay.id === selectedItem.id
                          ) || newOverlay
                        }
                        onUpdateOverlay={handleUpdateOverlay}
                      />
                    )}
                  </>
                )}
                {activeSidePanel === "sound" && (
                  <AudioTrackSelector
                    tracks={availableSounds}
                    onSelectTrack={handleMobileSoundItemClick}
                  />
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavigation;
