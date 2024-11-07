import React from "react";
import { Sequence } from "remotion";
import { SelectionOutline } from "./selected-outline";
import { Overlay } from "../types";

const displaySelectedOverlayOnTop = (
  overlays: Overlay[],
  selectedOverlayId: number | null
): Overlay[] => {
  const selectedOverlays = overlays.filter(
    (overlay) => overlay.id === selectedOverlayId
  );
  const unselectedOverlays = overlays.filter(
    (overlay) => overlay.id !== selectedOverlayId
  );

  return [...unselectedOverlays, ...selectedOverlays];
};

export const SortedOutlines: React.FC<{
  overlays: Overlay[];
  selectedOverlayId: number | null;
  changeOverlay: (
    overlayId: number,
    updater: (overlay: Overlay) => Overlay
  ) => void;
  setSelectedOverlayId: React.Dispatch<React.SetStateAction<number | null>>;
}> = ({ overlays, selectedOverlayId, changeOverlay, setSelectedOverlayId }) => {
  const overlaysToDisplay = React.useMemo(
    () => displaySelectedOverlayOnTop(overlays, selectedOverlayId),
    [overlays, selectedOverlayId]
  );

  const isDragging = React.useMemo(
    () => overlays.some((overlay) => overlay.isDragging),
    [overlays]
  );

  return overlaysToDisplay.map((overlay) => {
    return (
      <Sequence
        key={overlay.id}
        from={overlay.from}
        durationInFrames={overlay.durationInFrames}
        layout="none"
      >
        <SelectionOutline
          changeOverlay={changeOverlay}
          overlay={overlay}
          setSelectedOverlayId={setSelectedOverlayId}
          selectedOverlayId={selectedOverlayId}
          isDragging={isDragging}
        />
      </Sequence>
    );
  });
};
