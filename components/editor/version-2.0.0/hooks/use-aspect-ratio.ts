import { useState, useCallback } from 'react';

type AspectRatio = "16:9" | "4:3" | "1:1";

/**
 * Custom hook for managing aspect ratio and player dimensions.
 * @param initialAspectRatio - The initial aspect ratio to use (default: "16:9")
 * @returns An object containing aspect ratio state and related functions
 */
export const useAspectRatio = (initialAspectRatio: AspectRatio = "16:9") => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(initialAspectRatio);
  const [playerDimensions, setPlayerDimensions] = useState({ width: 0, height: 0 });

  /**
   * Updates the player dimensions based on the container size and current aspect ratio.
   * @param containerWidth - The width of the container
   * @param containerHeight - The height of the container
   */
  const updatePlayerDimensions = useCallback((containerWidth: number, containerHeight: number) => {
    let width, height;

    switch (aspectRatio) {
      case "4:3":
        // Calculate dimensions for 4:3 aspect ratio
        width = containerHeight * (4 / 3);
        height = containerHeight;
        if (width > containerWidth) {
          // Adjust if width exceeds container width
          width = containerWidth;
          height = containerWidth * (3 / 4);
        }
        break;
      case "1:1":
        // Set square dimensions
        width = height = Math.min(containerWidth, containerHeight);
        break;
      default: // 16:9
        // Calculate dimensions for 16:9 aspect ratio
        width = containerWidth;
        height = containerWidth * (9 / 16);
        if (height > containerHeight) {
          // Adjust if height exceeds container height
          height = containerHeight;
          width = containerHeight * (16 / 9);
        }
        break;
    }

    setPlayerDimensions({ width, height });
  }, [aspectRatio]);

  /**
   * Returns the standard dimensions for the current aspect ratio.
   * @returns An object containing the width and height for the current aspect ratio
   */
  const getAspectRatioDimensions = useCallback(() => {
    switch (aspectRatio) {
      case "4:3":
        return { width: 1440, height: 1080 };
      case "1:1":
        return { width: 1080, height: 1080 };
      default:
        return { width: 1920, height: 1080 };
    }
  }, [aspectRatio]);

  return {
    aspectRatio,
    setAspectRatio,
    playerDimensions,
    updatePlayerDimensions,
    getAspectRatioDimensions,
  };
};