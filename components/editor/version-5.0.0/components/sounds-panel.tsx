import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { LocalSound, SoundOverlay } from "../types";
import { useState, useEffect, useRef } from "react";

import { localSounds } from "../templates/sound-templates";
import { useTimelinePositioning } from "../hooks/use-timeline-positioning";
import { useEditorContext } from "../contexts/editor-context";
import { useTimeline } from "../contexts/timeline-context";

/**
 * SoundsPanel Component
 *
 * Displays a list of available sound tracks that can be:
 * - Previewed using play/pause controls
 * - Added to the timeline by clicking on the sound card
 *
 * @component
 */
const SoundsPanel: React.FC = () => {
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const { addOverlay, overlays, durationInFrames } = useEditorContext();
  const { findNextAvailablePosition } = useTimelinePositioning();
  const { visibleRows } = useTimeline();

  /**
   * Initialize audio elements for each sound and handle cleanup
   */
  useEffect(() => {
    localSounds.forEach((sound) => {
      audioRefs.current[sound.id] = new Audio(sound.file);
    });

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [localSounds]);

  /**
   * Toggles play/pause state for a sound track
   * Ensures only one track plays at a time
   *
   * @param soundId - Unique identifier of the sound to toggle
   */
  const togglePlay = (soundId: string) => {
    const audio = audioRefs.current[soundId];
    if (playingTrack === soundId) {
      audio.pause();
      setPlayingTrack(null);
    } else {
      if (playingTrack) {
        audioRefs.current[playingTrack].pause();
      }
      audio
        .play()
        .catch((error) => console.error("Error playing audio:", error));
      setPlayingTrack(soundId);
    }
  };

  /**
   * Adds a sound overlay to the timeline
   * Calculates the next available position and creates a new overlay
   *
   * @param sound - The sound track to add to the timeline
   */
  const handleAddToTimeline = (sound: LocalSound) => {
    // Find the next available position on the timeline
    const { from, row } = findNextAvailablePosition(
      overlays,
      visibleRows,
      durationInFrames
    );

    // Create the sound overlay configuration
    const newSoundOverlay: SoundOverlay = {
      id: Date.now(),
      type: "sound",
      content: sound.title,
      src: sound.file,
      from,
      row,
      // Layout properties
      left: 0,
      top: 0,
      width: 1920,
      height: 100,
      rotation: 0,
      isDragging: false,
      durationInFrames: sound.duration * 30, // 30fps
      styles: {
        opacity: 1,
      },
    };

    addOverlay(newSoundOverlay);
  };

  /**
   * Renders a sound card with play/pause controls and track information
   *
   * @param sound - The sound track to render
   * @returns JSX element for the sound card
   */
  const renderSoundCard = (sound: LocalSound) => (
    <div
      key={sound.id}
      onClick={() => handleAddToTimeline(sound)}
      className="group flex items-center gap-3 p-2.5 bg-gray-800 rounded-md 
        border border-white/5 hover:bg-gray-700 
        transition-all duration-150 cursor-pointer"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          togglePlay(sound.id);
        }}
        className="h-8 w-8 rounded-full bg-transparent hover:bg-gray-700 text-zinc-200"
      >
        {playingTrack === sound.id ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-200 truncate">
          {sound.title}
        </p>
        <p className="text-xs text-zinc-400 truncate">{sound.artist}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 p-4 bg-gray-800/40 h-full">
      {localSounds.map(renderSoundCard)}
    </div>
  );
};

export default SoundsPanel;
