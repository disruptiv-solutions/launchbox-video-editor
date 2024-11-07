import { useState, useRef, useEffect, useCallback } from 'react';
import { PlayerRef } from "@remotion/player";

/**
 * Custom hook for managing a Remotion player.
 * @returns An object containing player state and control functions.
 */
export const usePlayer = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<PlayerRef>(null);

  // Update current frame periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        const frame = playerRef.current.getCurrentFrame();
        if (frame !== null) {
          setCurrentFrame(frame);
        }
      }
    }, 1000 / 30); // Update ~30 times per second

    return () => clearInterval(interval);
  }, []);

  /**
   * Toggles play/pause state of the player.
   */
  const togglePlayPause = useCallback(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  /**
   * Seeks to a specific frame in the video.
   * @param frame - The frame number to seek to.
   */
  const seekTo = useCallback((frame: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(frame);
      setCurrentFrame(frame);
    }
  }, []);

  return {
    currentFrame,
    isPlaying,
    playerRef,
    togglePlayPause,
    seekTo,
  };
};