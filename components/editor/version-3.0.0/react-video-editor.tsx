/**
 * Video Editor Component
 *
 * This component is a comprehensive video editor built using React and Remotion.
 * It supports adding video clips, text overlays, and sounds, along with timeline
 * editing features such as dragging, resizing, and snapping clips into position.
 *
 * Key Features:
 * - Video, text, and sound overlays
 * - Timeline editing with drag, resize, and snap-to-grid functionality
 * - Aspect ratio control
 * - Play/Pause functionality with real-time frame updates
 * - Tooltip-guided UI for asset addition
 * - Responsive design with dedicated mobile layout
 * - Draggable and editable text overlays within the video preview
 *
 * @license This code is licensed for personal and commercial use by the buyer.
 * Redistribution or reselling of this code, in part or full, is prohibited.
 */

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sequence, Audio as RemotionAudio, Video } from "remotion";
import { Trash2, Scissors, Copy, Loader2 } from "lucide-react";
import { Clip, PexelsMedia, Sound, TextOverlay, LocalSound, SelectedItem } from "./types";
import { localSounds } from "./templates/sound-templates";
import { useToast } from "@/hooks/use-toast";
import { useContextMenu } from "./hooks/use-context-menu";
import { useAspectRatio } from "./hooks/use-aspect-ratio";
import { usePlayer } from "./hooks/use-player";
import { GRID_SIZE, MAX_ROWS } from "./constants";
import DraggableTextOverlay from "./components/draggable-text-overlay";

import { v4 as uuidv4 } from "uuid";

import MobileLayout from "./components/mobile/mobile-layout";
import DesktopLayout from "./components/desktop/desktop-layout";

/**
 * VideoEditor Component
 *
 * The main component that handles the video editor interface and interactions.
 * Users can add video clips, text overlays, and sounds, adjust their placement, and play/pause the video.
 */
const VideoEditor: React.FC = () => {
  // Timeline-related state
  const [clips, setClips] = useState<Clip[]>([]);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [totalDuration, setTotalDuration] = useState(1);
  const [zoom] = useState(1);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{
    type: "clip" | "text" | "sound";
    id: string;
    action: "move" | "resize-start" | "resize-end";
  } | null>(null);
  const [ghostElement, setGhostElement] = useState<{
    left: number;
    width: number;
    top: number;
  } | null>(null);
  const dragInfo = useRef<{
    type: "clip" | "text" | "sound";
    id: string;
    action: "move" | "resize-start" | "resize-end";
    startX: number;
    startY: number;
    startPosition: number;
    startDuration: number;
    startRow: number;
  } | null>(null);

  // UI state
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [activeSidePanel, setActiveSidePanel] = useState<
    "text" | "sound" | "assets" | null
  >("assets");
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [ghostMarkerPosition, setGhostMarkerPosition] = useState<number | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{
    clipId: string;
    position: number;
  } | null>(null);

  // Media-related state
  const [pexelsMedia, setPexelsMedia] = useState<PexelsMedia[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [availableSounds] = useState<LocalSound[]>(localSounds);

  // Text overlay state
  const [newOverlay, setNewOverlay] = useState<TextOverlay>({
    id: "",
    text: "",
    fontSize: 50,
    fontColor: "#FFFFFF",
    backgroundColor: "#000000",
    fontFamily: "Inter",
    start: 0,
    duration: 300,
    row: 0,
    position: { x: 50, y: 50 },
  });

  // Refs
  const timelineRef = useRef<HTMLDivElement>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const { toast } = useToast();
  const { showContextMenu, hideContextMenu, ContextMenuComponent } = useContextMenu();
  const {
    aspectRatio,
    setAspectRatio,
    playerDimensions,
    updatePlayerDimensions,
    getAspectRatioDimensions,
  } = useAspectRatio();
  const { currentFrame, isPlaying, playerRef, togglePlayPause, seekTo } = usePlayer();

  // Fetch Pexels media
  const fetchPexelsMedia = useCallback(
    async (query: string) => {
      setIsLoadingMedia(true);
      try {
        const response = await fetch(
          `https://api.pexels.com/videos/search?query=${query}&per_page=20&size=medium&orientation=landscape`,
          {
            headers: {
              Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY || "",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPexelsMedia(data.videos);
      } catch (error) {
        console.error("Error fetching Pexels media:", error);
        toast({
          title: "Error fetching media",
          description:
            "Failed to fetch media. Have you added your own Pexels API key?",
          variant: "destructive",
        });
      } finally {
        setIsLoadingMedia(false);
      }
    },
    [toast]
  );

  // Effects
  useEffect(() => {
    fetchPexelsMedia("sport");
  }, [fetchPexelsMedia]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (playerWrapperRef.current) {
        const rect = playerWrapperRef.current.getBoundingClientRect();
        updatePlayerDimensions(rect.width, rect.height);
      }
    };

    // Call handleResize immediately to set initial dimensions
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updatePlayerDimensions]);

  // Callbacks
  const handlePexelsItemClick = useCallback(
    (item: PexelsMedia) => {
      const newClip: Clip = {
        id: `clip-${clips.length + 1}`,
        start: totalDuration,
        duration: item.duration ? item.duration * 30 : 300,
        src: item.video_files ? item.video_files[0].link : item.image || "",
        row: Math.min(clips.length, MAX_ROWS - 1),
      };
      setClips((prevClips) => [...prevClips, newClip]);
      updateTotalDuration([...clips, newClip], textOverlays, sounds);

      if (isPlaying) {
        togglePlayPause();
      }
    },
    [clips, textOverlays, sounds, totalDuration, isPlaying, togglePlayPause]
  );

  const handleUpdateOverlay = (updatedOverlay: TextOverlay) => {
    if (selectedItem && selectedItem.type === "text") {
      setTextOverlays((prevOverlays) =>
        prevOverlays.map((overlay) =>
          overlay.id === updatedOverlay.id ? updatedOverlay : overlay
        )
      );
      setSelectedItem({ ...selectedItem, overlay: updatedOverlay });
    } else {
      setNewOverlay(updatedOverlay);
    }
  };

  const addSound = (track: LocalSound) => {
    const allItems = [...clips, ...textOverlays, ...sounds];
    let newStart = 0;
    let newRow = 0;

    // Find the first available position
    while (true) {
      const overlap = allItems.some(
        (item) =>
          item.row === newRow &&
          ((newStart >= item.start && newStart < item.start + item.duration) ||
            (newStart + 300 > item.start &&
              newStart + 300 <= item.start + item.duration))
      );

      if (!overlap) break;

      newStart += GRID_SIZE;
      if (newStart >= totalDuration) {
        newStart = 0;
        newRow = (newRow + 1) % MAX_ROWS;
      }
    }

    const newSound: Sound = {
      id: `sound-${sounds.length + 1}`,
      start: newStart,
      duration: Math.round(track.duration * 30), // Convert seconds to frames
      content: track.title,
      row: newRow,
      file: track.file,
    };
    setSounds([...sounds, newSound]);
    updateTotalDuration(clips, textOverlays, [...sounds, newSound]);
  };

  const updateTotalDuration = (
    updatedClips: Clip[],
    updatedTextOverlays: TextOverlay[],
    updatedSounds: Sound[]
  ) => {
    const lastClipEnd = updatedClips.reduce(
      (max, clip) => Math.max(max, clip.start + clip.duration),
      0
    );
    const lastTextOverlayEnd = updatedTextOverlays.reduce(
      (max, overlay) => Math.max(max, overlay.start + overlay.duration),
      0
    );
    const lastSoundEnd = updatedSounds.reduce(
      (max, sound) => Math.max(max, sound.start + sound.duration),
      0
    );
    const newTotalDuration = Math.max(
      lastClipEnd,
      lastTextOverlayEnd,

      lastSoundEnd,
      1 // Ensure there's always at least 1 frame
    );
    setTotalDuration(newTotalDuration);
  };

  const Composition = useCallback(
    () => (
      <>
        {clips.map((clip) => (
          <Sequence
            key={clip.id}
            from={clip.start}
            durationInFrames={clip.duration}
          >
            <Video src={clip.src} startFrom={clip.videoStartTime || 0} />
          </Sequence>
        ))}
        {textOverlays.map((overlay) => (
          <Sequence
            key={overlay.id}
            from={overlay.start}
            durationInFrames={overlay.duration}
          >
            <DraggableTextOverlay
              id={overlay.id}
              text={overlay.text}
              isSelected={
                selectedItem?.type === "text" && selectedItem.id === overlay.id
              }
              initialPosition={overlay.position || { x: 0, y: 0 }}
              onPositionChange={(newPosition) => {
                setTextOverlays((prevOverlays) =>
                  prevOverlays.map((prevOverlay) =>
                    prevOverlay.id === overlay.id
                      ? { ...prevOverlay, position: newPosition }
                      : prevOverlay
                  )
                );
                if (
                  selectedItem?.type === "text" &&
                  selectedItem.id === overlay.id
                ) {
                  setSelectedItem({
                    ...selectedItem,
                    overlay: { ...selectedItem.overlay, position: newPosition },
                  });
                }
              }}
              onSelect={(overlay) => {
                setSelectedItem({
                  type: "text",
                  id: overlay.id,
                  overlay: {
                    ...overlay,
                    start: overlay.start ?? 0,
                    duration: overlay.duration ?? 0,
                    row: overlay.row ?? 0,
                    backgroundColor: overlay?.backgroundColor ?? "#000000",
                  },
                });
              }}
              playerDimensions={getAspectRatioDimensions()}
              fontSize={overlay.fontSize}
              fontColor={overlay.fontColor}
              fontFamily={overlay.fontFamily}
              backgroundColor={overlay.backgroundColor} // Add this line
            />
          </Sequence>
        ))}
        {sounds.map((sound) => (
          <Sequence
            key={sound.id}
            from={sound.start}
            durationInFrames={sound.duration}
          >
            <RemotionAudio
              src={sound.file}
              startFrom={(sound.startFrom || 0) * 30}
              endAt={(sound.startFrom || 0) * 30 + sound.duration}
            />
          </Sequence>
        ))}
      </>
    ),
    [clips, textOverlays, sounds, getAspectRatioDimensions, selectedItem]
  );

  const snapToGrid = (value: number) =>
    Math.round(value / GRID_SIZE) * GRID_SIZE;

  const handleDragStart = useCallback(
    (
      type: "clip" | "text" | "sound",
      id: string,
      action: "move" | "resize-start" | "resize-end",
      clientX: number,
      clientY: number
    ) => {
      const item =
        type === "clip"
          ? clips.find((clip) => clip.id === id)
          : type === "text"
          ? textOverlays.find((overlay) => overlay.id === id)
          : sounds.find((sound) => sound.id === id);

      if (item) {
        dragInfo.current = {
          type,
          id,
          action,
          startX: clientX,
          startY: clientY,
          startPosition: item.start,
          startDuration: item.duration,
          startRow: item.row,
        };

        setIsDragging(true);
        setDraggedItem({ type, id, action });
        setGhostElement({
          left: (item.start / totalDuration) * 100,
          width: (item.duration / totalDuration) * 100,
          top: item.row * (100 / MAX_ROWS),
        });
      }
    },
    [clips, textOverlays, sounds, totalDuration]
  );

  const handleDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (
        !isDragging ||
        !dragInfo.current ||
        !timelineRef.current ||
        !ghostElement
      )
        return;

      const timelineRect = timelineRef.current.getBoundingClientRect();
      const deltaX = clientX - dragInfo.current.startX;
      const deltaY = clientY - dragInfo.current.startY;
      const deltaTime = snapToGrid(
        (deltaX / (timelineRect.width * zoom)) * totalDuration
      );
      const rowHeight = timelineRect.height / MAX_ROWS;
      const deltaRow = Math.round(deltaY / rowHeight);

      let newLeft = ghostElement.left;
      let newWidth = ghostElement.width;
      const newTop =
        Math.max(
          0,
          Math.min(MAX_ROWS - 1, dragInfo.current.startRow + deltaRow)
        ) *
        (100 / MAX_ROWS);

      switch (dragInfo.current.action) {
        case "move":
          newLeft =
            ((dragInfo.current.startPosition + deltaTime) / totalDuration) *
            100;
          break;
        case "resize-start":
          newLeft =
            ((dragInfo.current.startPosition + deltaTime) / totalDuration) *
            100;
          newWidth =
            ((dragInfo.current.startDuration - deltaTime) / totalDuration) *
            100;
          break;
        case "resize-end":
          newWidth =
            ((dragInfo.current.startDuration + deltaTime) / totalDuration) *
            100;
          break;
      }

      // Ensure the item doesn't extend beyond the total duration
      if (newLeft + newWidth > 100) {
        if (dragInfo.current.action === "move") {
          newLeft = 100 - newWidth;
        } else if (dragInfo.current.action === "resize-end") {
          newWidth = 100 - newLeft;
        }
      }

      setGhostElement({
        left: Math.max(0, Math.min(100, newLeft)),
        width: Math.max(0, newWidth),
        top: newTop,
      });
    },
    [isDragging, ghostElement, timelineRef, zoom, totalDuration]
  );

  const handleDragEnd = useCallback(() => {
    if (isDragging && dragInfo.current && ghostElement) {
      const updateItem = <T extends Clip | TextOverlay | Sound>(
        items: T[],
        setItems: React.Dispatch<React.SetStateAction<T[]>>
      ) => {
        const updatedItems = items.map((item) => {
          if (item.id === dragInfo.current?.id) {
            let newStart = Math.max(
              0,
              snapToGrid((ghostElement.left / 100) * totalDuration)
            );
            const newDuration = Math.max(
              GRID_SIZE,
              snapToGrid((ghostElement.width / 100) * totalDuration)
            );
            const newRow = Math.round(ghostElement.top / (100 / MAX_ROWS));

            // Check for overlaps and adjust the start position
            const otherItems = items.filter(
              (i) => i.id !== dragInfo.current?.id && i.row === newRow
            );
            for (const otherItem of otherItems) {
              if (
                newStart < otherItem.start + otherItem.duration &&
                newStart + newDuration > otherItem.start
              ) {
                newStart = otherItem.start + otherItem.duration;
              }
            }

            return {
              ...item,
              start: newStart,
              duration: newDuration,
              row: newRow,
            };
          }
          return item;
        });
        setItems(updatedItems);
        return updatedItems;
      };

      let updatedClips = clips;
      let updatedTextOverlays = textOverlays;
      let updatedSounds = sounds;

      if (dragInfo.current.type === "clip") {
        updatedClips = updateItem(clips, setClips);
      } else if (dragInfo.current.type === "text") {
        updatedTextOverlays = updateItem(textOverlays, setTextOverlays);
      } else if (dragInfo.current.type === "sound") {
        updatedSounds = updateItem(sounds, setSounds);
      }

      updateTotalDuration(updatedClips, updatedTextOverlays, updatedSounds);
    }

    // Always handle the click, whether it was a drag or not
    if (dragInfo.current) {
      handleItemClick(dragInfo.current.type, dragInfo.current.id);
    }

    setIsDragging(false);
    setDraggedItem(null);
    setGhostElement(null);
    dragInfo.current = null;
  }, [isDragging, ghostElement]);

  const handleMouseDown = useCallback(
    (
      type: "clip" | "text" | "sound",
      id: string,
      action: "move" | "resize-start" | "resize-end",
      e: React.MouseEvent<HTMLDivElement>
    ) => {
      e.stopPropagation();
      handleDragStart(type, id, action, e.clientX, e.clientY);
      document.body.style.cursor = action === "move" ? "grabbing" : "ew-resize";
    },
    [handleDragStart]
  );

  const handleTouchStart = useCallback(
    (
      type: "clip" | "text" | "sound",
      id: string,
      action: "move" | "resize-start" | "resize-end",
      e: React.TouchEvent<HTMLDivElement>
    ) => {
      e.stopPropagation();
      const touch = e.touches[0];
      handleDragStart(type, id, action, touch.clientX, touch.clientY);
    },
    [handleDragStart]
  );

  const handleTimelineMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile || !timelineRef.current || isDragging) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const position = (x / rect.width) * 100;
      setGhostMarkerPosition(position);
    },
    [isMobile, isDragging]
  );

  const handleTimelineMouseLeave = useCallback(() => {
    setGhostMarkerPosition(null);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      handleDrag(e.clientX, e.clientY);
      if (!isDragging) {
        handleTimelineMouseMove(e);
      }
    },
    [handleDrag, handleTimelineMouseMove, isDragging]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0];
      handleDrag(touch.clientX, touch.clientY);
    },
    [handleDrag]
  );

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
    document.body.style.cursor = "default";
  }, [handleDragEnd]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  const handleItemClick = useCallback(
    (type: "clip" | "text" | "sound", id: string) => {
      if (selectedItem?.id === id && selectedItem?.type === type) {
        setSelectedItem(null);
      } else {
        if (type === "clip") {
          const clip = clips.find((c) => c.id === id);
          if (clip) {
            setSelectedItem({ type, id, clip });
          }
        } else if (type === "text") {
          const overlay = textOverlays.find((o) => o.id === id);
          if (overlay) {
            setSelectedItem({ type, id, overlay });
          }
        } else if (type === "sound") {
          const sound = sounds.find((s) => s.id === id);
          if (sound) {
            setSelectedItem({ type, id, sound });
          }
        }
      }
      setActiveSidePanel(type === "clip" ? "assets" : type);
    },
    [selectedItem, clips, textOverlays, sounds]
  );

  const handleTimelineBackgroundClick = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const toggleSidePanel = (panel: "text" | "sound" | "assets" | null) => {
    setActiveSidePanel(panel);
  };

  const formatTime = (frames: number) => {
    const totalSeconds = Math.floor(frames / 30);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!timelineRef.current) return;

      const timelineRect = timelineRef.current.getBoundingClientRect();
      const clickX = e.clientX - timelineRect.left;
      const clickPercentage = clickX / timelineRect.width / zoom;
      const newFrame = Math.floor(clickPercentage * totalDuration);

      seekTo(newFrame);
    },
    [totalDuration, zoom, seekTo]
  );

  const splitClip = useCallback(
    (type: "clip" | "sound" | "text", id: string) => {
      if (!hoverInfo || hoverInfo.clipId !== id) return;

      const updateItems = <T extends Clip | Sound | TextOverlay>(
        prevItems: T[],
        setItems: React.Dispatch<React.SetStateAction<T[]>>
      ) => {
        const itemIndex = prevItems.findIndex((item) => item.id === id);
        if (itemIndex === -1) return prevItems;

        const item = prevItems[itemIndex];
        const splitPoint = hoverInfo.position;

        if (
          splitPoint <= item.start ||
          splitPoint >= item.start + item.duration
        ) {
          return prevItems; // Don't split if the point is at the start or end of the item
        }

        const newItem1 = {
          ...item,
          duration: splitPoint - item.start,
        };

        const newItem2 = {
          ...item,
          id: `${type}-${Date.now()}`,
          start: splitPoint,
          duration: item.start + item.duration - splitPoint,
        };

        // Adjust videoStartTime for clips
        if (type === "clip") {
          const clip = item as Clip;
          const originalVideoStartTime = clip.videoStartTime || 0;
          const splitTimeInVideo =
            splitPoint - clip.start + originalVideoStartTime;
          (newItem2 as Clip).videoStartTime = splitTimeInVideo;
        }

        // Adjust startFrom for sounds
        if (type === "sound") {
          const sound = item as Sound;
          const originalStartFrom = sound.startFrom || 0;
          const splitTimeInSound =
            (splitPoint - sound.start) / 30 + originalStartFrom;
          (newItem2 as Sound).startFrom = splitTimeInSound;
        }

        const newItems = [
          ...prevItems.slice(0, itemIndex),
          newItem1,
          newItem2,
          ...prevItems.slice(itemIndex + 1),
        ] as T[];

        setItems(newItems);
        return newItems;
      };

      if (type === "clip") {
        const newClips = updateItems(clips, setClips);
        updateTotalDuration(newClips, textOverlays, sounds);
      } else if (type === "sound") {
        const newSounds = updateItems(sounds, setSounds);
        updateTotalDuration(clips, textOverlays, newSounds);
      } else if (type === "text") {
        const newTextOverlays = updateItems(textOverlays, setTextOverlays);
        updateTotalDuration(clips, newTextOverlays, sounds);
      }
    },
    [hoverInfo, clips, textOverlays, sounds, updateTotalDuration]
  );

  const duplicateItem = useCallback(
    (type: "clip" | "text" | "sound", id: string) => {
      const findAvailableSpace = (item: Clip | TextOverlay | Sound) => {
        let newStart = item.start;
        let newRow = item.row;
        const allItems = [...clips, ...textOverlays, ...sounds];

        while (true) {
          const overlap = allItems.some(
            (otherItem) =>
              otherItem.row === newRow &&
              newStart < otherItem.start + otherItem.duration &&
              newStart + item.duration > otherItem.start
          );

          if (!overlap) break;

          newStart += GRID_SIZE;
          if (newStart + item.duration > totalDuration) {
            newStart = 0;
            newRow = (newRow + 1) % MAX_ROWS;
          }
        }

        return { start: newStart, row: newRow };
      };

      if (type === "clip") {
        setClips((prevClips) => {
          const clipToDuplicate = prevClips.find((clip) => clip.id === id);
          if (!clipToDuplicate) return prevClips;

          const { start, row } = findAvailableSpace(clipToDuplicate);
          const newClip: Clip = {
            ...clipToDuplicate,
            id: `clip-${Date.now()}`,
            start,
            row,
            videoStartTime: 0, // Reset the start time for the new clip
          };

          const updatedClips = [...prevClips, newClip];
          updateTotalDuration(updatedClips, textOverlays, sounds);
          return updatedClips;
        });
      } else if (type === "text") {
        setTextOverlays((prevOverlays) => {
          const overlayToDuplicate = prevOverlays.find(
            (overlay) => overlay.id === id
          );
          if (!overlayToDuplicate) return prevOverlays;

          const { start, row } = findAvailableSpace(overlayToDuplicate);
          const newOverlay: TextOverlay = {
            ...overlayToDuplicate,
            id: `text-${Date.now()}`,
            start,
            row,
          };

          const updatedOverlays = [...prevOverlays, newOverlay];
          updateTotalDuration(clips, updatedOverlays, sounds);
          return updatedOverlays;
        });
      } else if (type === "sound") {
        setSounds((prevSounds) => {
          const soundToDuplicate = prevSounds.find((sound) => sound.id === id);
          if (!soundToDuplicate) return prevSounds;

          const { start, row } = findAvailableSpace(soundToDuplicate);
          const newSound: Sound = {
            ...soundToDuplicate,
            id: `sound-${Date.now()}`,
            start,
            row,
            startFrom: 0, // Reset the start time for the new sound
          };

          const updatedSounds = [...prevSounds, newSound];
          updateTotalDuration(clips, textOverlays, updatedSounds);
          return updatedSounds;
        });
      }
    },
    [clips, textOverlays, sounds, totalDuration, updateTotalDuration]
  );

  const deleteItem = useCallback(
    (type: "clip" | "text" | "sound", id: string) => {
      if (type === "clip") {
        setClips((prevClips) => {
          const updatedClips = prevClips.filter((clip) => clip.id !== id);
          updateTotalDuration(updatedClips, textOverlays, sounds);
          return updatedClips;
        });
      } else if (type === "text") {
        setTextOverlays((prevOverlays) => {
          const updatedOverlays = prevOverlays.filter(
            (overlay) => overlay.id !== id
          );
          updateTotalDuration(clips, updatedOverlays, sounds);
          return updatedOverlays;
        });
      } else if (type === "sound") {
        setSounds((prevSounds) => {
          const updatedSounds = prevSounds.filter((sound) => sound.id !== id);
          updateTotalDuration(clips, textOverlays, updatedSounds);
          return updatedSounds;
        });
      }
    },
    [clips, textOverlays, sounds, updateTotalDuration]
  );

  const handleItemContextMenu = useCallback(
    (e: React.MouseEvent, type: "clip" | "text" | "sound", id: string) => {
      e.preventDefault();
      e.stopPropagation();

      const menuItems = [
        {
          label: "Delete",
          icon: <Trash2 className="w-4 h-4 mr-2" />,
          action: () => deleteItem(type, id),
        },
        {
          label: "Duplicate",
          icon: <Copy className="w-4 h-4 mr-2" />,
          action: () => duplicateItem(type, id),
        },
      ];

      if (type === "clip" || type === "sound" || type === "text") {
        menuItems.push({
          label: `Split ${
            type === "clip" ? "Video" : type === "sound" ? "Sound" : "Text"
          }`,
          icon: <Scissors className="w-4 h-4 mr-2" />,
          action: () => splitClip(type, id),
        });
      }

      showContextMenu(e, menuItems);
    },
    [showContextMenu, deleteItem, duplicateItem, splitClip]
  );

  const handleClipMouseMove = useCallback(
    (
      e: React.MouseEvent | React.TouchEvent,
      clipId: string,
      clipStart: number,
      clipDuration: number
    ) => {
      if (!timelineRef.current) return;

      const target = e.currentTarget as HTMLElement;
      const clipRect = target?.getBoundingClientRect();

      let clientX: number;
      if ("touches" in e) {
        clientX = e.touches[0].clientX;
      } else {
        clientX = e.clientX;
      }

      const relativeX = clientX - clipRect?.left;
      const clipWidth = clipRect?.width;
      const hoverPosition = clipStart + (relativeX / clipWidth) * clipDuration;

      setHoverInfo({ clipId, position: Math.round(hoverPosition) });
    },
    [timelineRef]
  );

  const handleClipMouseLeave = useCallback(() => {
    setHoverInfo(null);
  }, []);

  const handleExampleClick = (example: TextOverlay) => {
    const newOverlay: TextOverlay = {
      ...example,
      id: `text-${uuidv4()}`,
      start: currentFrame,
      row: Math.min(textOverlays.length, MAX_ROWS - 1),
    };

    setTextOverlays((prevOverlays) => [...prevOverlays, newOverlay]);
    updateTotalDuration(clips, [...textOverlays, newOverlay], sounds);
    setSelectedItem({ type: "text", id: newOverlay.id, overlay: newOverlay });
  };

  // Extract common props into a shared object
  const sharedLayoutProps = {
    playerWrapperRef,
    playerRef,
    Composition,
    playerDimensions,
    getAspectRatioDimensions,
    totalDuration,
    isPlaying,
    togglePlayPause,
    currentFrame,
    formatTime,
    aspectRatio,
    setAspectRatio,
    timelineRef,
    zoom,
    handleMouseMove,
    handleTouchMove,
    handleMouseUp,
    handleTouchEnd,
    handleTimelineClick,
    handleTimelineBackgroundClick,
    clips,
    textOverlays,
    sounds,
    isDragging,
    draggedItem,
    selectedItem,
    setSelectedItem,
    handleMouseDown,
    handleTouchStart,
    handleItemClick,
    handleItemContextMenu,
    handleClipMouseMove,
    handleClipMouseLeave,
    hoverInfo,
    ghostElement,
    activeSidePanel,
    toggleSidePanel,
    handlePexelsItemClick,
    pexelsMedia,
    isLoadingMedia,
    availableSounds,
    addSound,
    newOverlay,
    handleUpdateOverlay,
    handleExampleClick,
  };

  // Conditional rendering based on mobile state
  if (isMobile === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2 text-sm">Loading...</span>
      </div>
    );
  }

  return isMobile ? (
    <MobileLayout {...sharedLayoutProps} />
  ) : (
    <DesktopLayout
      {...sharedLayoutProps}
      hideContextMenu={hideContextMenu}
      ghostMarkerPosition={ghostMarkerPosition}
      ContextMenuComponent={ContextMenuComponent}
      handleTimelineMouseLeave={handleTimelineMouseLeave}
    />
  );
};

export default VideoEditor;