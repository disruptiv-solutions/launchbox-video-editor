import { useHotkeys } from "react-hotkeys-hook";
import { ZOOM_CONSTRAINTS } from "../constants";

interface UseTimelineShortcutsProps {
  handlePlayPause: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoomScale: number;
  setZoomScale: (scale: number) => void;
}

export const useTimelineShortcuts = ({
  handlePlayPause,
  undo,
  redo,
  canUndo,
  canRedo,
  zoomScale,
  setZoomScale,
}: UseTimelineShortcutsProps) => {
  useHotkeys(
    "alt+space",
    (e) => {
      e.preventDefault();
      handlePlayPause();
    },
    { enableOnFormTags: true }
  );

  useHotkeys("meta+z, ctrl+z", (e) => {
    e.preventDefault();
    if (canUndo) undo();
  });

  useHotkeys("meta+shift+z, ctrl+shift+z, meta+y, ctrl+y", (e) => {
    e.preventDefault();
    if (canRedo) redo();
  });

  useHotkeys("alt+=, alt+plus", (e) => {
    e.preventDefault();
    const newScale = Math.min(
      zoomScale + ZOOM_CONSTRAINTS.step,
      ZOOM_CONSTRAINTS.max
    );
    setZoomScale(newScale);
  });

  useHotkeys(
    "alt+-, alt+minus",
    (e) => {
      e.preventDefault();
      const newScale = Math.max(
        zoomScale - ZOOM_CONSTRAINTS.step,
        ZOOM_CONSTRAINTS.min
      );
      setZoomScale(newScale);
    },
    {
      keydown: true,
      preventDefault: true,
    }
  );
};
