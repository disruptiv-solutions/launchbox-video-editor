import React from 'react';
import { Player } from "@remotion/player";
import { ScrollArea } from "@/components/ui/scroll-area";
import AudioTrackSelector from '../audio-track-selector';
import GhostMarker from '../ghost-marker';
import GhostTimelineItem from '../ghost-timeline-item';
import PexelsMediaSelector from '../pexels-media-selector';
import SideNavigation from '../side-navigation';
import TextOverlaySelector from '../text-overlay-selector';
import TimeMarkers from '../time-markerts';
import TimelineControls from '../timeline-controls';
import TimelineGrids from '../timeline-grids';
import TimelineItem from '../timeline-item';
import TimelineMarker from '../timeline-marker';
import { Clip, TextOverlay, Sound, PexelsMedia, LocalSound, SelectedItem } from "../../types";

import { PlayerRef } from '@remotion/player';

interface DesktopLayoutProps {
  playerWrapperRef: React.RefObject<HTMLDivElement>;
  playerRef: React.RefObject<PlayerRef>;
  Composition: React.FC;
  playerDimensions: { width: number; height: number };
  getAspectRatioDimensions: () => { width: number; height: number };
  totalDuration: number;
  isPlaying: boolean;
  togglePlayPause: () => void;
  currentFrame: number;
  formatTime: (frames: number) => string;
  aspectRatio: string;
  setAspectRatio: (ratio: "16:9" | "4:3" | "1:1") => void;
  timelineRef: React.RefObject<HTMLDivElement>;
  zoom: number;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleMouseUp: () => void;
  handleTouchEnd: () => void;
  handleTimelineClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleTimelineBackgroundClick: () => void;
  clips: Clip[];
  textOverlays: TextOverlay[];
  sounds: Sound[];
  isDragging: boolean;
  draggedItem: { type: "clip" | "text" | "sound"; id: string; action: "move" | "resize-start" | "resize-end" } | null;
  selectedItem: SelectedItem;
  setSelectedItem: (item: SelectedItem) => void;
  handleMouseDown: (type: "clip" | "text" | "sound", id: string, action: "move" | "resize-start" | "resize-end", e: React.MouseEvent<HTMLDivElement>) => void;
  handleTouchStart: (type: "clip" | "text" | "sound", id: string, action: "move" | "resize-start" | "resize-end", e: React.TouchEvent<HTMLDivElement>) => void;
  handleItemClick: (type: "clip" | "text" | "sound", id: string) => void;
  handleItemContextMenu: (e: React.MouseEvent, type: "clip" | "text" | "sound", id: string) => void;
  handleClipMouseMove: (e: React.MouseEvent | React.TouchEvent, clipId: string, clipStart: number, clipDuration: number) => void;
  handleClipMouseLeave: () => void;
  hoverInfo: { clipId: string; position: number } | null;
  ghostElement: { left: number; width: number; top: number } | null;
  activeSidePanel: "text" | "sound" | "assets" | null;
  toggleSidePanel: (panel: "text" | "sound" | "assets" | null) => void;
  handlePexelsItemClick: (item: PexelsMedia) => void;
  pexelsMedia: PexelsMedia[];
  isLoadingMedia: boolean;
  availableSounds: LocalSound[];
  addSound: (track: LocalSound) => void;
  newOverlay: TextOverlay;
  handleUpdateOverlay: (updatedOverlay: TextOverlay) => void;
  handleExampleClick: (example: TextOverlay) => void;
  hideContextMenu: () => void;
  ghostMarkerPosition: number | null;
  ContextMenuComponent: React.FC;
  handleTimelineMouseLeave: () => void;
}

/**
 * DesktopLayout component
 * 
 * This component represents the main layout for the desktop version of the video editor.
 * It includes the video player, timeline, and side panels for various editing functions.
 * 
 * @param props - The props object containing all necessary data and functions
 * @returns A React functional component
 */
const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  playerWrapperRef,
  playerRef,
  Composition,
  playerDimensions,
  getAspectRatioDimensions,
  totalDuration,
  isPlaying,
  togglePlayPause,
  currentFrame,
  formatTime,
  aspectRatio,
  setAspectRatio,
  timelineRef,
  zoom,
  handleMouseMove,
  handleTimelineMouseLeave,
  handleMouseUp,
  handleTimelineClick,
  handleTimelineBackgroundClick,
  clips,
  textOverlays,
  sounds,
  isDragging,
  draggedItem,
  selectedItem,
  setSelectedItem,
  handleMouseDown,
  handleItemClick,
  handleItemContextMenu,
  handleClipMouseMove,
  handleClipMouseLeave,
  hoverInfo,
  ghostElement,
  activeSidePanel,
  toggleSidePanel,
  handlePexelsItemClick,
  pexelsMedia,
  isLoadingMedia,
  availableSounds,
  addSound,
  newOverlay,
  handleUpdateOverlay,
  handleExampleClick,
  hideContextMenu,
  ghostMarkerPosition,
  ContextMenuComponent,
}) => {
  return (
    <div
      className="h-screen scrollbar-hide flex flex-col bg-gray-950 text-white"
      onClick={hideContextMenu}
    >
      {/* Main content area */}
      <div className="flex-grow flex overflow-hidden h-2/3">
        {/* Side navigation component */}
        <SideNavigation
          activeSidePanel={activeSidePanel}
          toggleSidePanel={toggleSidePanel}
        />

        {/* Side panel for text, sound, and asset management */}
        <div
          className={`w-2/4 scrollbar-hide border bg-gray-900 border-gray-800 relative flex flex-col transition-all duration-300 ease-in-out ${
            activeSidePanel ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {activeSidePanel && (
            <>
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-lg font-semibold ">
                  {activeSidePanel === "text" && "Text Overlay"}
                  {activeSidePanel === "sound" && "Sound"}
                  {activeSidePanel === "assets" && "Media Assets"}
                </h2>
              </div>
              <ScrollArea className="flex-grow scrollbar-hide">
                <div className="p-4 scrollbar-hide">
                  {activeSidePanel === "assets" && (
                    <PexelsMediaSelector
                      onItemClick={handlePexelsItemClick}
                      pexelsMedia={pexelsMedia}
                      isLoadingMedia={isLoadingMedia}
                    />
                  )}
                  {activeSidePanel === "text" && (
                    <>
                      <TextOverlaySelector
                        selectedItem={selectedItem}
                        textOverlays={textOverlays}
                        newOverlay={newOverlay}
                        onUpdateOverlay={handleUpdateOverlay}
                        onTemplateClick={handleExampleClick}
                      />
                    </>
                  )}
                  {activeSidePanel === "sound" && (
                    <AudioTrackSelector
                      tracks={availableSounds}
                      onSelectTrack={addSound}
                    />
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        {/* Video player section */}
        <div className="border border-gray-700 flex-grow p-6 flex items-center justify-center overflow-hidden bg-gray-900 inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
          <div
            ref={playerWrapperRef}
            className="w-full h-full flex items-center justify-center relative"
          >
            <div
              className="shadow-lg rounded-lg overflow-hidden bg-slate-900 relative"
              style={{
                width: `${playerDimensions.width}px`,
                height: `${playerDimensions.height}px`,
              }}
            >
              <Player
                ref={playerRef}
                component={Composition}
                durationInFrames={Math.max(1, totalDuration)}
                compositionWidth={getAspectRatioDimensions().width}
                compositionHeight={getAspectRatioDimensions().height}
                hideControlsWhenPointerDoesntMove
                fps={30}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline section */}
      <div className="h-1/2 bg-gray-900 w-full overflow-hidden flex flex-col">
        {/* Timeline controls component */}
        <TimelineControls
          isPlaying={isPlaying}
          togglePlayPause={togglePlayPause}
          currentFrame={currentFrame}
          totalDuration={totalDuration}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          formatTime={formatTime}
        />

        {/* Timeline content */}
        <div
          ref={timelineRef}
          className="flex-grow bg-gray-800 rounded-lg shadow-inner relative"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleTimelineMouseLeave}
          onMouseUp={handleMouseUp}
          onClick={(e) => {
            handleTimelineClick(e);
            handleTimelineBackgroundClick();
          }}
        >
          <div className="absolute inset-0">
            <TimeMarkers
              totalDuration={totalDuration}
              zoom={zoom}
              handleTimelineClick={handleTimelineClick}
            />
            <div className="absolute top-10 left-0 right-0 bottom-0 overflow-x-auto overflow-y-visible p-2">
              <div
                style={{
                  width: `${100 * zoom}%`,
                  height: "100%",
                  position: "relative",
                }}
              >
                <TimelineGrids />

                {clips.map((clip, index) => (
                  <TimelineItem
                    key={clip.id}
                    item={clip}
                    type="clip"
                    index={index}
                    isDragging={isDragging}
                    draggedItem={draggedItem}
                    selectedItem={selectedItem}
                    setSelectedItem={(item) =>
                      setSelectedItem(
                        item ? { type: "clip", id: clip.id, clip } : null
                      )
                    }
                    handleMouseDown={handleMouseDown}
                    handleItemClick={handleItemClick}
                    totalDuration={totalDuration}
                    handleItemContextMenu={handleItemContextMenu}
                    onMouseMove={(e) =>
                      handleClipMouseMove(e, clip.id, clip.start, clip.duration)
                    }
                    onMouseLeave={handleClipMouseLeave}
                    hoverInfo={
                      hoverInfo && hoverInfo.clipId === clip.id
                        ? hoverInfo
                        : null
                    }
                  />
                ))}
                {textOverlays.map((overlay, index) => (
                  <TimelineItem
                    key={overlay.id}
                    item={overlay}
                    type="text"
                    index={index}
                    isDragging={isDragging}
                    draggedItem={draggedItem}
                    selectedItem={selectedItem}
                    setSelectedItem={(item) =>
                      setSelectedItem(
                        item ? { type: "text", id: overlay.id, overlay } : null
                      )
                    }
                    handleMouseDown={handleMouseDown}
                    handleItemClick={handleItemClick}
                    totalDuration={totalDuration}
                    handleItemContextMenu={handleItemContextMenu}
                    onMouseMove={(e) =>
                      handleClipMouseMove(
                        e,
                        overlay.id,
                        overlay.start,
                        overlay.duration
                      )
                    }
                    onMouseLeave={handleClipMouseLeave}
                    hoverInfo={
                      hoverInfo && hoverInfo.clipId === overlay.id
                        ? hoverInfo
                        : null
                    }
                  />
                ))}
                {sounds.map((sound, index) => (
                  <TimelineItem
                    key={sound.id}
                    item={sound}
                    type="sound"
                    index={index}
                    isDragging={isDragging}
                    draggedItem={draggedItem}
                    selectedItem={selectedItem}
                    setSelectedItem={(item) =>
                      setSelectedItem(
                        item ? { type: "sound", id: sound.id, sound } : null
                      )
                    }
                    handleMouseDown={handleMouseDown}
                    handleItemClick={handleItemClick}
                    totalDuration={totalDuration}
                    handleItemContextMenu={handleItemContextMenu}
                    onMouseMove={(e) =>
                      handleClipMouseMove(
                        e,
                        sound.id,
                        sound.start,
                        sound.duration
                      )
                    }
                    onMouseLeave={handleClipMouseLeave}
                    hoverInfo={
                      hoverInfo && hoverInfo.clipId === sound.id
                        ? hoverInfo
                        : null
                    }
                  />
                ))}
                {ghostElement && (
                  <GhostTimelineItem
                    left={ghostElement.left}
                    width={ghostElement.width}
                    top={ghostElement.top}
                    totalDuration={totalDuration}
                    formatTime={formatTime}
                  />
                )}
              </div>
            </div>
            <TimelineMarker
              currentFrame={currentFrame}
              totalDuration={totalDuration}
              zoom={zoom}
            />
            <GhostMarker
              position={ghostMarkerPosition}
              isMobile={false}
              isDragging={isDragging}
            />
          </div>
        </div>
      </div>
      {/* Context menu component */}
      <ContextMenuComponent />
    </div>
  );
};

export default DesktopLayout;