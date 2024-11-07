import React from 'react';
import { Player, PlayerRef } from "@remotion/player";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import TimelineItem from "../timeline-item";
import TimelineMarker from "../timeline-marker";
import MobileNavigation from "./mobile-navigation";

import { MAX_ROWS } from "../../constants";
import { Clip, TextOverlay, Sound, PexelsMedia, LocalSound, SelectedItem } from "../../types";
import TimeMarkers from '../time-markerts';


interface MobileLayoutProps {
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
}


/**
 * MobileLayout component for the video editor's mobile interface.
 * 
 * This component renders the main layout for the mobile version of the video editor,
 * including the video player, timeline, and navigation controls.
 *
 * @param {MobileLayoutProps} props - The props for the MobileLayout component.
 * @returns {JSX.Element} The rendered MobileLayout component.
 */
export default function MobileLayout({
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
  handleTouchMove,
  handleMouseUp,
  handleTouchEnd,
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
  handleTouchStart,
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
}: MobileLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      {/* Player section */}
      <div className="flex-grow overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
          <div
            ref={playerWrapperRef}
            className="w-full h-full flex items-center justify-center"
          >
            <div
              className="shadow-lg rounded-lg overflow-hidden bg-slate-900"
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
      <div className="h-1/3 bg-gray-900 w-full overflow-hidden flex flex-col">
        <div className="flex justify-between items-center border-b border-gray-700 p-2">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={togglePlayPause}
              className="bg-gray-800"
            >
              {isPlaying ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
            <span className="text-xs font-medium text-white">
              {formatTime(currentFrame)} / {formatTime(totalDuration)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <label
              htmlFor="aspect-ratio-mobile"
              className="text-xs font-medium text-white"
            >
              Aspect:
            </label>
            <select
              id="aspect-ratio-mobile"
              value={aspectRatio}
              onChange={(e) =>
                setAspectRatio(e.target.value as "16:9" | "4:3" | "1:1")
              }
              className="bg-gray-800 border border-gray-700 text-white rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="16:9">16:9</option>
              <option value="4:3">4:3</option>
              <option value="1:1">1:1</option>
            </select>
          </div>
        </div>

        <div
          ref={timelineRef}
          className="flex-grow bg-gray-800 rounded-lg shadow-inner relative"
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleTouchEnd}
          onMouseLeave={handleMouseUp}
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
            <div className="absolute top-6 left-0 right-0 bottom-0 overflow-x-auto overflow-y-visible p-1">
              <div
                style={{
                  width: `${100 * zoom}%`,
                  height: "100%",
                  position: "relative",
                }}
              >
                <div className="absolute inset-0 flex flex-col z-0">
                  {[...Array(MAX_ROWS)].map((_, index) => (
                    <div
                      key={index}
                      className="flex-grow flex flex-col p-[4px]"
                    >
                      <div className="flex-grow bg-gray-700 rounded-sm"></div>
                    </div>
                  ))}
                </div>
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
                    handleTouchStart={handleTouchStart}
                    handleItemClick={handleItemClick}
                    totalDuration={totalDuration}
                    handleItemContextMenu={handleItemContextMenu}
                    onMouseMove={(e) =>
                      handleClipMouseMove(
                        e,
                        clip.id,
                        clip.start,
                        clip.duration
                      )
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
                    handleTouchStart={handleTouchStart}
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
                    handleTouchStart={handleTouchStart}
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
                  <div
                    className="absolute bg-gray-50 bg-opacity-50 rounded-md shadow-lg opacity-80 ghost-transition border-2 border-white border-dashed"
                    style={{
                      left: `calc(${ghostElement.left}% + 1px)`,
                      width: `calc(${ghostElement.width}% - 2px)`,
                      top: `calc(${ghostElement.top}% + 8px)`,
                      height: `calc(${100 / MAX_ROWS}% - 16px)`,
                      boxShadow: "0 0 0 2px rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-xs font-semibold bg-gray-900 bg-opacity-75 px-2 py-1 rounded">
                        {formatTime(
                          Math.round(
                            (ghostElement.width / 100) * totalDuration
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <TimelineMarker
              currentFrame={currentFrame}
              totalDuration={totalDuration}
              zoom={zoom}
            />
          </div>
        </div>
      </div>

      <MobileNavigation
        activeSidePanel={activeSidePanel}
        toggleSidePanel={toggleSidePanel}
        handlePexelsItemClick={handlePexelsItemClick}
        pexelsMedia={pexelsMedia}
        isLoadingMedia={isLoadingMedia}
        availableSounds={availableSounds}
        addSound={addSound}
        selectedItem={selectedItem}
        newOverlay={newOverlay}
        handleUpdateOverlay={handleUpdateOverlay}
        textOverlays={textOverlays}
        handleExampleClick={handleExampleClick}
      />
    </div>
  );
}