import { useCallback } from "react";
import { Overlay } from "../types";
import { useOverlays } from "./use-overlays";

interface ShiftResult {
  hasOverlap: boolean;
  adjustedOverlays: Overlay[];
}

/**
 * Hook that provides functions to check and handle overlay overlaps
 * Can be used for any operation that modifies overlay position or duration
 */
export const useOverlayOverlapCheck = () => {
  const { overlays } = useOverlays();

  /**
   * Checks if an overlay would overlap with existing overlays in the same row
   * @param overlay - The overlay to check (can be new or modified existing overlay)
   * @returns boolean indicating if there would be an overlap
   */
  const checkOverlap = useCallback(
    (overlay: Overlay): boolean => {
      // Get all other overlays in the same row (excluding self if it's an existing overlay)
      const overlaysInRow = overlays.filter(
        (o) => o.row === overlay.row && o.id !== overlay.id
      );

      // Check for overlaps with any existing overlay
      return overlaysInRow.some((existingOverlay) => {
        const overlayEnd = overlay.from + overlay.durationInFrames;
        const existingEnd =
          existingOverlay.from + existingOverlay.durationInFrames;

        // Check all possible overlap scenarios
        return (
          (overlay.from >= existingOverlay.from &&
            overlay.from < existingEnd) || // Start overlaps
          (overlayEnd > existingOverlay.from && overlayEnd <= existingEnd) || // End overlaps
          (overlay.from <= existingOverlay.from && overlayEnd >= existingEnd) // Encompasses
        );
      });
    },
    [overlays]
  );

  /**
   * Checks for overlaps and calculates new positions for affected overlays
   * @param overlay - The overlay to check and make space for
   * @returns Object containing overlap status and adjusted overlays if needed
   */
  const checkAndAdjustOverlaps = useCallback(
    (overlay: Overlay): ShiftResult => {
      // Get fresh overlays from the current state
      const overlaysInRow = overlays.filter(
        (o) => o.row === overlay.row && o.id !== overlay.id
      );

      // If no overlays in row or no overlap, return early
      if (overlaysInRow.length === 0 || !checkOverlap(overlay)) {
        return {
          hasOverlap: false,
          adjustedOverlays: [],
        };
      }

      // Sort overlays by start position
      const sortedOverlays = [...overlaysInRow].sort((a, b) => a.from - b.from);

      // Find overlapping overlays and calculate required shifts
      const overlayEnd = overlay.from + overlay.durationInFrames;
      const adjustedOverlays: Overlay[] = [];
      let currentPosition = overlayEnd;

      sortedOverlays.forEach((existingOverlay) => {
        const existingEnd =
          existingOverlay.from + existingOverlay.durationInFrames;

        // Check if this overlay needs to be shifted
        if (
          (existingOverlay.from >= overlay.from &&
            existingOverlay.from < overlayEnd) || // Start overlaps
          (existingEnd > overlay.from && existingEnd <= overlayEnd) || // End overlaps
          (existingOverlay.from <= overlay.from && existingEnd >= overlayEnd) // Encompasses
        ) {
          // Add a small gap between overlays
          const gap = 0;
          const adjustedOverlay = {
            ...existingOverlay,
            from: currentPosition + gap,
          };
          adjustedOverlays.push(adjustedOverlay);
          currentPosition =
            adjustedOverlay.from + adjustedOverlay.durationInFrames;
        }
      });

      return {
        hasOverlap: true,
        adjustedOverlays,
      };
    },
    [overlays, checkOverlap]
  );

  return {
    checkOverlap,
    checkAndAdjustOverlaps,
  };
};
