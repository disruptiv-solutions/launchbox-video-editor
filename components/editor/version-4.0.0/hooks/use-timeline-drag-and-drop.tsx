import { useCallback, useMemo } from "react";
import { Overlay } from "../types";

interface DragInfo {
  id: number;
  action: "move" | "resize-start" | "resize-end";
  startX: number;
  startY: number;
  startPosition: number;
  startDuration: number;
  startRow: number;
  ghostLeft?: number;
  ghostWidth?: number;
  ghostTop?: number;
}

interface UseTimelineDragAndDropProps {
  overlays: Overlay[];
  durationInFrames: number;
  onOverlayChange: (updatedOverlay: Overlay) => void;
  updateGhostElement: (
    newLeft: number,
    newWidth: number,
    newTop: number
  ) => void;
  resetDragState: () => void;
  timelineRef: React.RefObject<HTMLDivElement>;
  dragInfo: React.MutableRefObject<DragInfo | null>;
  maxRows: number;
}

export const useTimelineDragAndDrop = ({
  overlays,
  durationInFrames,
  onOverlayChange,
  updateGhostElement,
  resetDragState,
  timelineRef,
  dragInfo,
  maxRows,
}: UseTimelineDragAndDropProps) => {
  const snapToGrid = useCallback((value: number) => {
    const GRID_SIZE = 1;
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }, []);

  // Memoize sorted overlays to avoid sorting on every render
  const sortedOverlays = useMemo(() => {
    return [...overlays].sort((a, b) => a.from - b.from);
  }, [overlays]);

  const checkOverlapAndAdjust = useCallback(
    (
      currentId: number,
      newFrom: number,
      newDuration: number,
      newRow: number
    ): { from: number; row: number } => {
      let adjustedFrom = newFrom;
      let adjustedRow = newRow;

      // First, try to fit in the current row
      for (let row = adjustedRow; row < maxRows; row++) {
        // Get all overlays in the current row, sorted by position
        const overlaysInRow = sortedOverlays
          .filter((overlay) => overlay.id !== currentId && overlay.row === row)
          .sort((a, b) => a.from - b.from);

        // Find gaps between overlays
        const availableSpaces: { start: number; end: number }[] = [];

        // Add initial space if available
        if (overlaysInRow.length === 0 || overlaysInRow[0].from > 0) {
          availableSpaces.push({
            start: 0,
            end: overlaysInRow.length
              ? overlaysInRow[0].from
              : durationInFrames,
          });
        }

        // Find gaps between overlays
        for (let i = 0; i < overlaysInRow.length; i++) {
          const currentOverlay = overlaysInRow[i];
          const nextOverlay = overlaysInRow[i + 1];

          const currentEnd =
            currentOverlay.from + currentOverlay.durationInFrames;

          if (nextOverlay) {
            if (nextOverlay.from > currentEnd) {
              availableSpaces.push({
                start: currentEnd,
                end: nextOverlay.from,
              });
            }
          } else {
            // Add space after last overlay if available
            if (currentEnd < durationInFrames) {
              availableSpaces.push({
                start: currentEnd,
                end: durationInFrames,
              });
            }
          }
        }

        // Find the best fitting space
        const bestSpace = availableSpaces.find(
          (space) =>
            space.end - space.start >= newDuration &&
            adjustedFrom >= space.start &&
            adjustedFrom <= space.end - newDuration
        );

        if (bestSpace) {
          // If we found a suitable space, use it
          adjustedFrom = Math.max(
            bestSpace.start,
            Math.min(adjustedFrom, bestSpace.end - newDuration)
          );
          return { from: adjustedFrom, row };
        }

        // If no suitable space found in current row, try the next row
        adjustedRow = row + 1;
      }

      // If we couldn't find space in any row, place at the end of the last row
      const lastRow = maxRows - 1;
      const lastOverlayInLastRow = sortedOverlays
        .filter(
          (overlay) => overlay.row === lastRow && overlay.id !== currentId
        )
        .reduce(
          (latest, overlay) =>
            Math.max(latest, overlay.from + overlay.durationInFrames),
          0
        );

      adjustedFrom = Math.max(lastOverlayInLastRow, 0);
      adjustedFrom = Math.min(adjustedFrom, durationInFrames - newDuration);

      return { from: adjustedFrom, row: lastRow };
    },
    [sortedOverlays, maxRows, durationInFrames]
  );

  const handleDragStart = useCallback(
    (
      overlay: Overlay,
      clientX: number,
      clientY: number,
      action: "move" | "resize-start" | "resize-end"
    ) => {
      if (timelineRef.current) {
        dragInfo.current = {
          id: overlay.id,
          action,
          startX: clientX,
          startY: clientY,
          startPosition: overlay.from,
          startDuration: overlay.durationInFrames,
          startRow: overlay.row || 0,
        };

        updateGhostElement(
          (overlay.from / durationInFrames) * 100,
          (overlay.durationInFrames / durationInFrames) * 100,
          (overlay.row || 0) * (100 / maxRows)
        );
      }
    },
    [durationInFrames, maxRows, updateGhostElement]
  );

  const handleDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragInfo.current || !timelineRef.current) return;

      const timelineRect = timelineRef.current.getBoundingClientRect();
      const deltaX = clientX - dragInfo.current.startX;
      const deltaY = clientY - dragInfo.current.startY;
      const deltaTime = snapToGrid(
        (deltaX / timelineRect.width) * durationInFrames
      );
      const rowHeight = timelineRect.height / maxRows;
      const deltaRow = Math.round(deltaY / rowHeight);

      let newLeft = (dragInfo.current.startPosition / durationInFrames) * 100;
      let newWidth = (dragInfo.current.startDuration / durationInFrames) * 100;
      let newRow = dragInfo.current.startRow + deltaRow;

      // Clamp the row within bounds
      newRow = Math.max(0, Math.min(maxRows - 1, newRow));

      switch (dragInfo.current.action) {
        case "move":
          newLeft =
            ((dragInfo.current.startPosition + deltaTime) / durationInFrames) *
            100;
          break;
        case "resize-start":
          newLeft =
            ((dragInfo.current.startPosition + deltaTime) / durationInFrames) *
            100;
          newWidth =
            ((dragInfo.current.startDuration - deltaTime) / durationInFrames) *
            100;
          break;
        case "resize-end":
          newWidth =
            ((dragInfo.current.startDuration + deltaTime) / durationInFrames) *
            100;
          break;
      }

      // Ensure values are within valid ranges
      newLeft = Math.max(0, Math.min(100, newLeft));
      newWidth = Math.max(0, Math.min(100 - newLeft, newWidth));

      // Update ghost element directly without overlap checking
      updateGhostElement(newLeft, newWidth, newRow * (100 / maxRows));

      // Update dragInfo with new ghost position
      dragInfo.current.ghostLeft = newLeft;
      dragInfo.current.ghostWidth = newWidth;
      dragInfo.current.ghostTop = newRow * (100 / maxRows);
    },
    [durationInFrames, maxRows, snapToGrid, updateGhostElement]
  );

  const handleDragEnd = useCallback(() => {
    if (
      dragInfo.current &&
      dragInfo.current.ghostLeft !== undefined &&
      dragInfo.current.ghostWidth !== undefined &&
      dragInfo.current.ghostTop !== undefined
    ) {
      const updatedOverlay = overlays.find(
        (overlay) => overlay.id === dragInfo.current!.id
      );
      if (updatedOverlay) {
        const newFrom = Math.max(
          0,
          snapToGrid((dragInfo.current.ghostLeft / 100) * durationInFrames)
        );
        const newDuration = Math.max(
          1,
          snapToGrid((dragInfo.current.ghostWidth / 100) * durationInFrames)
        );
        const newRow = Math.round(dragInfo.current.ghostTop / (100 / maxRows));

        // Ensure newFrom is a valid number
        if (isNaN(newFrom)) {
          console.error("Invalid newFrom value:", newFrom);
          resetDragState();
          return;
        }

        const { from: adjustedFrom, row: adjustedRow } = checkOverlapAndAdjust(
          updatedOverlay.id,
          newFrom,
          newDuration,
          newRow
        );

        onOverlayChange({
          ...updatedOverlay,
          from: adjustedFrom,
          durationInFrames: newDuration,
          row: adjustedRow,
        });
      }
    }

    resetDragState();
  }, [
    overlays,
    durationInFrames,
    maxRows,
    snapToGrid,
    checkOverlapAndAdjust,
    onOverlayChange,
    resetDragState,
  ]);

  return {
    handleDragStart,
    handleDrag,
    handleDragEnd,
  };
};
