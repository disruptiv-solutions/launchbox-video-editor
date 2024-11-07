import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { LocalSound } from '../types';

interface AudioTrackSelectorProps {
  tracks: LocalSound[]; // Array of audio tracks to display
  onSelectTrack: (track: LocalSound) => void; // Callback function when a track is selected
}

/**
 * AudioTrackSelector Component
 * 
 * This component displays a list of audio tracks and allows the user to play/pause
 * and select tracks.
 * 
 * @param {AudioTrackSelectorProps} props - The component props
 * @returns {React.FC} A functional React component
 */
const AudioTrackSelector: React.FC<AudioTrackSelectorProps> = ({ tracks, onSelectTrack }) => {
  // State to keep track of which track is currently playing
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  
  // Ref to store audio elements for each track
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Effect to initialize audio elements and clean up on unmount
  useEffect(() => {
    // Create an audio element for each track
    tracks.forEach(track => {
      audioRefs.current[track.id] = new Audio(`${track.file}`);
    });

    // Cleanup function to pause and reset all audio elements
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [tracks]);

  /**
   * Toggle play/pause for a track
   * @param {string} trackId - The ID of the track to toggle
   */
  const togglePlay = (trackId: string) => {
    const audio = audioRefs.current[trackId];
    if (playingTrack === trackId) {
      // If the clicked track is already playing, pause it
      audio.pause();
      setPlayingTrack(null);
    } else {
      // If another track is playing, pause it
      if (playingTrack) {
        audioRefs.current[playingTrack].pause();
      }
      // Play the clicked track
      audio.play().catch(error => console.error('Error playing audio:', error));
      setPlayingTrack(trackId);
    }
  };

  return (
    <div className="space-y-4">
      {tracks.map((track) => (
        <div
          key={track.id}
          className="flex items-center space-x-2 p-2 bg-gray-800 rounded-md cursor-pointer hover:bg-gray-700"
        >
          {/* Play/Pause button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay(track.id);
            }}
            className="mr-2"
          >
            {playingTrack === track.id ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          {/* Track information */}
          <div onClick={() => onSelectTrack(track)} className="flex-grow">
            <p className="font-semibold">{track.title}</p>
            <p className="text-sm text-white">{track.artist}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AudioTrackSelector;