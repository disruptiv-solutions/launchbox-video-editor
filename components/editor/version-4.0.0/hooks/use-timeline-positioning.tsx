import { Overlay } from "../types";

export const useTimelinePositioning = () => {
  /**
   * Finds the next available position for a new overlay in a multi-row timeline
   * @param existingOverlays - Array of current overlays in the timeline
   * @param maxRows - Maximum number of rows available in the timeline
   * @param totalDuration - Total duration of the timeline in frames
   * @returns Object containing the starting position (from) and row number
   */
  const findNextAvailablePosition = (
    existingOverlays: Overlay[],
    maxRows: number,
    totalDuration: number
  ): { from: number; row: number } => {
    // Sort overlays by their start time to process them chronologically
    const sortedOverlays = [...existingOverlays].sort(
      (a, b) => a.from - b.from
    );

    // Check each row from top to bottom
    for (let row = 0; row < maxRows; row++) {
      // Get all overlays in the current row
      const overlaysInRow = sortedOverlays.filter(
        (overlay) => overlay.row === row
      );
      if (overlaysInRow.length === 0) {
        // If row is empty, we can place at the start
        return { from: 0, row };
      }

      // Find gaps between overlays in this row
      let lastEndTime = 0;
      for (const overlay of overlaysInRow) {
        if (overlay.from - lastEndTime >= 1) {
          // Ensure at least 1 frame gap
          // Found a gap, verify it doesn't overlap with overlays in other rows
          const isOverlapping = sortedOverlays.some(
            (other) =>
              other.row !== row &&
              lastEndTime < other.from + other.durationInFrames &&
              other.from < lastEndTime + 1
          );

          if (!isOverlapping) {
            return { from: lastEndTime, row };
          }
        }
        lastEndTime = Math.max(
          lastEndTime,
          overlay.from + overlay.durationInFrames
        );
      }

      // Check if we can place after the last overlay in this row
      if (lastEndTime < totalDuration) {
        const isOverlapping = sortedOverlays.some(
          (other) =>
            other.row !== row &&
            lastEndTime < other.from + other.durationInFrames &&
            other.from < lastEndTime + 1
        );

        if (!isOverlapping) {
          return { from: lastEndTime, row };
        }
      }
    }

    // If we couldn't find any gaps in any rows, place at the end of the last row
    return { from: totalDuration, row: maxRows - 1 };
  };

  return { findNextAvailablePosition };
};
