import { useState, useCallback } from "react";
import { Overlay } from "../types";

/**
 * Hook to manage overlay elements in the editor
 * Overlays can be text, clips, or sounds that are positioned on the timeline
 * @returns Object containing overlay state and management functions
 */
export const useOverlays = () => {
  // Initial state with two default text overlays positioned at different locations
  const [overlays, setOverlays] = useState<Overlay[]>([
    {
      left: 0,
      top: 0,
      width: 1280,
      height: 720,
      durationInFrames: 136,
      from: 0,
      id: 0,
      rotation: 0,
      row: 0,
      isDragging: false,
      type: "clip",
      content:
        "https://images.pexels.com/videos/5680034/3d-abstract-blue-bright-5680034.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
      src: "https://videos.pexels.com/video-files/5680034/5680034-hd_1920_1080_24fps.mp4",
      videoStartTime: 0,
      styles: {
        opacity: 1,
        zIndex: 0,
        transform: "none",
        objectFit: "cover",
        backgroundColor: "#101828",
      },
    },
    {
      left: 0,
      top: 0,
      width: 1280,
      height: 720,
      durationInFrames: 187,
      from: 129,
      id: 1,
      rotation: 0,
      row: 1,
      isDragging: false,
      type: "clip",
      content:
        "https://images.pexels.com/videos/2022395/free-video-2022395.jpg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
      src: "https://videos.pexels.com/video-files/2022395/2022395-hd_1920_1080_30fps.mp4",
      videoStartTime: 0,
      styles: {
        opacity: 1,
        zIndex: 0,
        transform: "none",
        objectFit: "cover",
      },
    },
    {
      left: 77,
      top: 83,
      width: 568,
      height: 151,
      durationInFrames: 86,
      from: 33,
      id: 2,
      row: 1,
      rotation: 0,
      isDragging: false,
      type: "text",
      content: "WELCOME TO RVE",
      styles: {
        fontSize: "3rem",
        fontWeight: "bold",
        color: "#F4F4F5",
        backgroundColor: "#101827",
        fontFamily: "font-retro",
        fontStyle: "normal",
        textDecoration: "none",
        lineHeight: "1.2",
        textAlign: "center",
        opacity: 1,
        zIndex: 1,
        transform: "none",
      },
    },
    {
      id: 3,
      type: "sound",
      content: "Upbeat Corporate",
      src: "https://rwxrdxvxndclnqvznxfj.supabase.co/storage/v1/object/public/sounds/sound-1.mp3?t=2024-11-04T03%3A52%3A06.297Z",
      from: 0,
      row: 3,
      left: 0,
      top: 0,
      width: 1920,
      height: 100,
      rotation: 0,
      isDragging: false,
      durationInFrames: 316,
      styles: {
        opacity: 1,
      },
    },
    {
      left: 79,
      top: 239,
      width: 324,
      height: 73,
      durationInFrames: 64,
      from: 55,
      id: 4,
      row: 2,
      rotation: 0,
      isDragging: false,
      type: "text",
      content: "Version 4",
      styles: {
        fontSize: "3rem",
        fontWeight: "normal",
        color: "#E4E4E7",
        backgroundColor: "#101827",
        fontFamily: "font-retro",
        fontStyle: "normal",
        textDecoration: "none",
        lineHeight: "1.2",
        textAlign: "center",
        opacity: 1,
        zIndex: 1,
        transform: "none",
      },
    },
    {
      left: 171,
      top: 137,
      width: 944,
      height: 390,
      durationInFrames: 147,
      from: 152,
      id: 5,
      row: 2,
      rotation: 0,
      isDragging: false,
      type: "text",
      content: "HAPPY BUILDING!",
      styles: {
        fontSize: "3rem",
        fontWeight: "bold",
        color: "#F4F4F5",
        backgroundColor: "transparent",
        fontFamily: "font-sans",
        fontStyle: "normal",
        textDecoration: "none",
        lineHeight: "1.2",
        textAlign: "center",
        opacity: 1,
        zIndex: 1,
        transform: "none",
      },
    },
  ]);

  // Tracks which overlay is currently selected for editing
  const [selectedOverlayId, setSelectedOverlayId] = useState<number | null>(
    null
  );

  /**
   * Updates properties of a specific overlay
   * Supports both direct property updates and functional updates
   * @example
   * // Direct update
   * changeOverlay(1, { width: 100 })
   * // Functional update
   * changeOverlay(1, (overlay) => ({ ...overlay, width: overlay.width + 10 }))
   */
  const changeOverlay = useCallback(
    (
      overlayId: number,
      updater: Partial<Overlay> | ((overlay: Overlay) => Overlay)
    ) => {
      setOverlays((prevOverlays) =>
        prevOverlays.map((overlay) => {
          if (overlay.id !== overlayId) return overlay;
          return typeof updater === "function"
            ? updater(overlay)
            : ({ ...overlay, ...updater } as Overlay);
        })
      );
    },
    []
  );

  /**
   * Adds a new overlay to the editor
   * Automatically generates a new unique ID and appends it to the overlays array
   * Deselects any currently selected overlay
   */
  const addOverlay = useCallback((newOverlay: Omit<Overlay, "id">) => {
    let newId: number;
    setOverlays((prevOverlays) => {
      newId =
        prevOverlays.length > 0
          ? Math.max(...prevOverlays.map((o) => o.id)) + 1
          : 0;
      const overlayWithNewId = { ...newOverlay, id: newId } as Overlay;
      return [...prevOverlays, overlayWithNewId];
    });
    setSelectedOverlayId(newId!);
  }, []);

  /**
   * Removes an overlay by its ID and clears the selection
   */
  const deleteOverlay = useCallback((id: number) => {
    setOverlays((prevOverlays) =>
      prevOverlays.filter((overlay) => overlay.id !== id)
    );
    setSelectedOverlayId(null);
  }, []);

  /**
   * Creates a copy of an existing overlay
   * The duplicated overlay is positioned immediately after the original in the timeline
   */
  const duplicateOverlay = useCallback((id: number) => {
    setOverlays((prevOverlays) => {
      const overlayToDuplicate = prevOverlays.find(
        (overlay) => overlay.id === id
      );
      if (!overlayToDuplicate) return prevOverlays;

      const newId = Math.max(...prevOverlays.map((o) => o.id)) + 1;
      const duplicatedOverlay: Overlay = {
        ...overlayToDuplicate,
        id: newId,
        from: overlayToDuplicate.from + overlayToDuplicate.durationInFrames,
      };

      return [...prevOverlays, duplicatedOverlay];
    });
  }, []);

  /**
   * Splits an overlay into two separate overlays at a specified frame
   * Useful for creating cuts or transitions in video/audio content
   * @example
   * // Split an overlay at frame 100
   * splitOverlay(1, 100)
   */
  const splitOverlay = useCallback((id: number, splitFrame: number) => {
    setOverlays((prevOverlays) => {
      const overlayToSplit = prevOverlays.find((overlay) => overlay.id === id);
      if (!overlayToSplit) return prevOverlays;

      // Validate split point
      if (
        splitFrame <= overlayToSplit.from ||
        splitFrame >= overlayToSplit.from + overlayToSplit.durationInFrames
      ) {
        console.warn("Invalid split point");
        return prevOverlays;
      }

      const firstPartDuration = splitFrame - overlayToSplit.from;
      const secondPartDuration =
        overlayToSplit.durationInFrames - firstPartDuration;
      const newId = Math.max(...prevOverlays.map((o) => o.id)) + 1;

      // Calculate start times for media overlays
      const secondHalfStartTime = calculateSecondHalfStartTime(
        overlayToSplit,
        firstPartDuration
      );

      // Create split overlays
      const [firstHalf, secondHalf] = createSplitOverlays(
        overlayToSplit,
        newId,
        splitFrame,
        firstPartDuration,
        secondPartDuration,
        secondHalfStartTime
      );

      return prevOverlays
        .map((overlay) => (overlay.id === id ? firstHalf : overlay))
        .concat(secondHalf);
    });
  }, []);

  return {
    overlays,
    selectedOverlayId,
    setSelectedOverlayId,
    changeOverlay,
    addOverlay,
    deleteOverlay,
    duplicateOverlay,
    splitOverlay,
  };
};

/**
 * Calculates the starting time for the second half of a split media overlay
 * For clips and sounds, we need to adjust their internal start times
 * to maintain continuity after the split
 */
const calculateSecondHalfStartTime = (
  overlay: Overlay,
  firstPartDuration: number
): number => {
  if (overlay.type === "clip") {
    return (overlay.videoStartTime || 0) + firstPartDuration;
  }
  if (overlay.type === "sound") {
    return (overlay.startFromSound || 0) + firstPartDuration;
  }
  return 0;
};

/**
 * Creates two new overlay objects from an original overlay when splitting
 * The first half maintains the original ID and timing
 * The second half gets a new ID and adjusted timing properties
 * Preserves all other properties from the original overlay
 */
const createSplitOverlays = (
  original: Overlay,
  newId: number,
  splitFrame: number,
  firstPartDuration: number,
  secondPartDuration: number,
  secondHalfStartTime: number
): [Overlay, Overlay] => {
  const firstHalf: Overlay = {
    ...original,
    durationInFrames: firstPartDuration,
  };

  const secondHalf: Overlay = {
    ...original,
    id: newId,
    from: splitFrame,
    durationInFrames: secondPartDuration,
    ...(original.type === "clip" && {
      videoStartTime: secondHalfStartTime,
    }),
    ...(original.type === "sound" && {
      startFromSound: secondHalfStartTime,
    }),
  };

  return [firstHalf, secondHalf];
};
