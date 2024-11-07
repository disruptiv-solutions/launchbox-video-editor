/**
 * Video Editor Component
 *
 * This component is a comprehensive video editor built using React and Remotion.
 * It supports adding video clips, text overlays, and sounds, along with timeline
 * editing features such as dragging, resizing, and snapping clips into position.
 *
 * Key Features:
 * - Video, text, and sound overlays
 * - Timeline editing with drag, resize, and snap-to-grid
 * - Aspect ratio control
 * - Play/Pause functionality with real-time frame updates
 * - Tooltip-guided UI for asset addition
 *
 * @license This code is licensed for personal and commercial use by the buyer.
 * Redistribution or reselling of this code, in part or full, is prohibited.
 */

"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Player } from "@remotion/player";
import { Sequence, Audio as RemotionAudio, Video } from "remotion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FilmIcon, Type, Music, Play, Pause, Trash2, Scissors, Copy } from "lucide-react";
import { Clip, PexelsMedia, Sound, TextOverlay, LocalSound } from "./types";
import { localSounds } from "./sounds";
import { useToast } from "@/hooks/use-toast";
import { useContextMenu } from "./hooks/use-context-menu";
import { useAspectRatio } from "./hooks/use-aspect-ratio";
import { usePlayer } from "./hooks/use-player";
import { GRID_SIZE, MAX_ROWS } from "./constants";
import TimelineMarker from "./components/timeline-marker";
import TimelineItem from "./components/timeline-item";
import TextSelector from "./components/text-selector";
import AudioTrackSelector from "./components/audio-track-selector";
import PexelsMediaSelector from "./components/pexels-media-selector";

/**
 * VideoEditor Component
 * 
 * The main component that handles the video editor interface and interactions.
 * Users can add video clips, text overlays, and sounds, adjust their placement, and play/pause the video.
 */
const VideoEditor: React.FC = () => {
  // State variables
  const [clips, setClips] = useState<Clip[]>([]);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [totalDuration, setTotalDuration] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{
    type: "clip" | "text" | "sound";
    id: string;
    action: "move" | "resize-start" | "resize-end";
  } | null>(null);
  const [zoom] = useState(1);
  const [hoverInfo, setHoverInfo] = useState<{ clipId: string; position: number } | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(0);
  const [dragStartDuration, setDragStartDuration] = useState(0);
  const [ghostElement, setGhostElement] = useState<{ left: number; width: number; top: number } | null>(null);
  const [dragStartRow, setDragStartRow] = useState(0);
  const [selectedItem, setSelectedItem] = useState<{ type: "clip" | "text" | "sound"; id: string } | null>(null);
  const [activeSidePanel, setActiveSidePanel] = useState<"text" | "sound" | "assets" | null>("assets");
  const [newTextOverlay, setNewTextOverlay] = useState("");
  const [availableSounds] = useState<LocalSound[]>(localSounds);
  const [ghostMarkerPosition, setGhostMarkerPosition] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [pexelsMedia, setPexelsMedia] = useState<PexelsMedia[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [playerContainerRef, setPlayerContainerRef] = useState<HTMLDivElement | null>(null);

  // Refs
  const timelineRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const { toast } = useToast();
  const { showContextMenu, hideContextMenu, ContextMenuComponent } = useContextMenu();
  const { aspectRatio, setAspectRatio, playerDimensions, updatePlayerDimensions, getAspectRatioDimensions } = useAspectRatio();
  const { currentFrame, isPlaying, playerRef, togglePlayPause, seekTo } = usePlayer();

  // Fetch Pexels media
  const fetchPexelsMedia = useCallback(async (query: string) => {
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
        description: "Failed to fetch media. Have you added your own Pexels API key?",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMedia(false);
    }
  }, [toast]);

  // Effects
  useEffect(() => {
    fetchPexelsMedia("sport");
  }, [fetchPexelsMedia]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (playerContainerRef) {
        updatePlayerDimensions(playerContainerRef.clientWidth, playerContainerRef.clientHeight);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [playerContainerRef, updatePlayerDimensions]);

  // Callbacks
  const handlePexelsItemClick = useCallback((item: PexelsMedia) => {
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
  }, [clips, textOverlays, sounds, totalDuration, isPlaying, togglePlayPause]);

  const addTextOverlay = () => {
    if (newTextOverlay.trim() === "") return;
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

    const newOverlay: TextOverlay = {
      id: `text-${textOverlays.length + 1}`,
      start: newStart,
      duration: 300, // Set a default duration
      text: newTextOverlay,
      row: newRow,
    };
    setTextOverlays([...textOverlays, newOverlay]);
    updateTotalDuration(clips, [...textOverlays, newOverlay], sounds);
    setNewTextOverlay(""); // Clear the input after adding
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

  const Composition = useCallback(() => (
    <>
      {clips.map((clip) => (
        <Sequence key={clip.id} from={clip.start} durationInFrames={clip.duration}>
          <Video src={clip.src} startFrom={clip.videoStartTime || 0} />
        </Sequence>
      ))}
      {textOverlays.map((overlay) => (
        <Sequence key={overlay.id} from={overlay.start} durationInFrames={overlay.duration}>
          <TextSelector text={overlay.text} />
        </Sequence>
      ))}
      {sounds.map((sound) => (
        <Sequence key={sound.id} from={sound.start} durationInFrames={sound.duration}>
          <RemotionAudio
            src={sound.file}
            startFrom={(sound.startFrom || 0) * 30}
            endAt={(sound.startFrom || 0) * 30 + sound.duration}
          />
        </Sequence>
      ))}
    </>
  ), [clips, textOverlays, sounds]);

  const renderTimeMarkers = useCallback(() => {
    const markers = [];
    const totalSeconds = Math.max(Math.ceil(totalDuration / 30), 1); // Ensure at least 1 second
    const zoomedDuration = totalSeconds / zoom;

    // Determine the appropriate interval based on the zoomed duration
    let interval, subInterval;
    if (zoomedDuration <= 5) {
      interval = 1; // 1 second
      subInterval = 0.5; // 500 milliseconds
    } else if (zoomedDuration <= 10) {
      interval = 2; // 2 seconds
      subInterval = 0.5; // 500 milliseconds
    } else if (zoomedDuration <= 30) {
      interval = 5; // 5 seconds
      subInterval = 1; // 1 second
    } else if (zoomedDuration <= 60) {
      interval = 10; // 10 seconds
      subInterval = 2; // 2 seconds
    } else if (zoomedDuration <= 300) {
      interval = 30; // 30 seconds
      subInterval = 5; // 5 seconds
    } else {
      interval = 60; // 1 minute
      subInterval = 15; // 15 seconds
    }

    // Ensure we always show at least 4 labels
    const minLabels = 4;
    const labelInterval = Math.max(interval, Math.floor(totalSeconds / minLabels));

    for (let i = 0; i <= totalSeconds; i += subInterval) {
      const minutes = Math.floor(i / 60);
      const seconds = i % 60;
      const isMainMarker = i % interval === 0;
      const shouldShowLabel = i % labelInterval === 0;

      markers.push(
        <div
          key={i}
          className="absolute top-0 flex flex-col items-center"
          style={{ left: `${(i / totalSeconds) * 100 * zoom}%` }}
        >
          <div
            className={`w-px ${
              isMainMarker ? "h-4 bg-white" : "h-2 bg-gray-400"
            }`}
          />
          {shouldShowLabel && (
            <span className="text-xs text-white mt-1">
              {`${minutes}:${seconds.toString().padStart(2, "0")}`}
            </span>
          )}
        </div>
      );
    }
    return markers;
  }, [totalDuration, zoom]);

  const timeMarkers = useMemo(() => renderTimeMarkers(), [renderTimeMarkers]);

  const snapToGrid = (value: number) =>
    Math.round(value / GRID_SIZE) * GRID_SIZE;

  const handleMouseDown = (
    type: "clip" | "text" | "sound",
    id: string,
    action: "move" | "resize-start" | "resize-end",
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    e.stopPropagation(); // Prevent the click from bubbling up to the timeline
    setIsDragging(true);
    setDraggedItem({ type, id, action });
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
    const item =
      type === "clip"
        ? clips.find((clip) => clip.id === id)
        : type === "text"
        ? textOverlays.find((overlay) => overlay.id === id)
        : sounds.find((sound) => sound.id === id);
    if (item) {
      setDragStartPosition(item.start);
      setDragStartDuration(item.duration);
      setDragStartRow(item.row);
      setGhostElement({
        left: (item.start / totalDuration) * 100,
        width: (item.duration / totalDuration) * 100,
        top: item.row * (100 / MAX_ROWS),
      });
    }
    document.body.style.cursor = action === "move" ? "grabbing" : "ew-resize";
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !draggedItem || !timelineRef.current) return;

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    const deltaTime = snapToGrid(
      (deltaX / (timelineRect.width * zoom)) * totalDuration
    );
    const rowHeight = timelineRect.height / MAX_ROWS;
    const deltaRow = Math.round(deltaY / rowHeight);

    if (ghostElement) {
      let newLeft = ghostElement.left;
      let newWidth = ghostElement.width;
      const newTop =
        Math.max(0, Math.min(MAX_ROWS - 1, dragStartRow + deltaRow)) *
        (100 / MAX_ROWS);

      switch (draggedItem.action) {
        case "move":
          newLeft = ((dragStartPosition + deltaTime) / totalDuration) * 100;
          break;
        case "resize-start":
          newLeft = ((dragStartPosition + deltaTime) / totalDuration) * 100;
          newWidth = ((dragStartDuration - deltaTime) / totalDuration) * 100;
          break;
        case "resize-end":
          newWidth = ((dragStartDuration + deltaTime) / totalDuration) * 100;
          break;
      }

      // Ensure the item doesn't extend beyond the total duration
      if (newLeft + newWidth > 100) {
        if (draggedItem.action === "move") {
          newLeft = 100 - newWidth;
        } else if (draggedItem.action === "resize-end") {
          newWidth = 100 - newLeft;
        }
      }

      setGhostElement({
        left: Math.max(0, Math.min(100, newLeft)),
        width: Math.max(0, newWidth),
        top: newTop,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && draggedItem && ghostElement) {
      const updateItem = <T extends Clip | TextOverlay | Sound>(
        items: T[],
        setItems: React.Dispatch<React.SetStateAction<T[]>>
      ) => {
        const updatedItems = items.map((item) => {
          if (item.id === draggedItem.id) {
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
              (i) => i.id !== draggedItem.id && i.row === newRow
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
      const updatedSounds = sounds;

      if (draggedItem.type === "clip") {
        updatedClips = updateItem(clips, setClips);
      } else if (draggedItem.type === "text") {
        updatedTextOverlays = updateItem(textOverlays, setTextOverlays);
      } else if (draggedItem.type === "sound") {
        setSounds((prevSounds) => updateItem(prevSounds, setSounds));
      }

      updateTotalDuration(updatedClips, updatedTextOverlays, updatedSounds);
    }

    // Always handle the click, whether it was a drag or not
    if (draggedItem) {
      handleItemClick(draggedItem.type, draggedItem.id, e);
    }

    setIsDragging(false);
    setDraggedItem(null);
    setGhostElement(null);
    document.body.style.cursor = "default";
  };

  const handleItemClick = (
    type: "clip" | "text" | "sound",
    id: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setSelectedItem({ type, id });
  };

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

  const handleTimelineMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!timelineRef.current) return;

      const timelineRect = timelineRef.current.getBoundingClientRect();
      const mouseX = e.clientX - timelineRect.left;
      const mousePercentage = mouseX / timelineRect.width / zoom;
      setGhostMarkerPosition(mousePercentage * 100);
    },
    [zoom]
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

        if (type === "clip") {
          (newItem2 as Clip).videoStartTime =
            ((item as Clip).videoStartTime || 0) +
            (splitPoint - item.start) / 30;
        } else if (type === "sound") {
          (newItem2 as Sound).startFrom =
            ((item as Sound).startFrom || 0) + (splitPoint - item.start) / 30;
        } else if (type === "text") {
          // For text overlays, we don't need to adjust any additional properties
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

  const handleTimelineMouseLeave = useCallback(() => {
    setGhostMarkerPosition(null);
  }, []);

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
          const overlayToDuplicate = prevOverlays.find((overlay) => overlay.id === id);
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
          label: `Split ${type === "clip" ? "Video" : type === "sound" ? "Sound" : "Text"}`,
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
      e: React.MouseEvent,
      clipId: string,
      clipStart: number,
      clipDuration: number
    ) => {
      if (!timelineRef.current) return;

      const clipRect = e.currentTarget.getBoundingClientRect();
      const relativeX = e.clientX - clipRect.left;
      const clipWidth = clipRect.width;
      const hoverPosition = clipStart + (relativeX / clipWidth) * clipDuration;

      setHoverInfo({ clipId, position: Math.round(hoverPosition) });
    },
    []
  );

  const handleClipMouseLeave = useCallback(() => {
    setHoverInfo(null);
  }, []);

  if (isMobile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Mobile View Not Supported</h2>
          <p className="text-md">
            This video editor is only available on desktop or laptop devices.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col bg-gray-950 text-white"
      onClick={hideContextMenu}
    >
      <div className="flex-grow flex overflow-hidden h-2/3">
        {/* Sidenav */}
        <div className="w-28 border bg-gray-900 flex flex-col items-center py-6 border-r border-gray-800">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeSidePanel === "assets" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => {
                    toggleSidePanel("assets");
                  }}
                  className="mb-6 w-12 h-12"
                >
                  <FilmIcon className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Add Video Clip</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeSidePanel === "text" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => {
                    toggleSidePanel("text");
                  }}
                  className="mb-6 w-12 h-12"
                >
                  <Type className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Add Text Overlay</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeSidePanel === "sound" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => {
                    toggleSidePanel("sound");
                  }}
                  className="mb-6 w-12 h-12"
                >
                  <Music className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Add Sound</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Side panel */}
        <div
          className={`w-2/4 border bg-gray-900 border-gray-800 relative flex flex-col transition-all duration-300 ease-in-out ${
            activeSidePanel ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {activeSidePanel && (
            <>
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-lg font-semibold ">
                  {activeSidePanel === "text" && "Text Overlay"}
                  {activeSidePanel === "sound" && "Sound"}
                  {activeSidePanel === "assets" && "Media Assets"}
                </h2>
              </div>
              <ScrollArea className="flex-grow">
                <div className="p-4">
                  {activeSidePanel === "assets" && (
                    <PexelsMediaSelector
                      onItemClick={handlePexelsItemClick}
                      pexelsMedia={pexelsMedia}
                      isLoadingMedia={isLoadingMedia}
                    />
                  )}
                  {activeSidePanel === "text" && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={newTextOverlay}
                        onChange={(e) => setNewTextOverlay(e.target.value)}
                        placeholder="Enter text overlay"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <Button
                        onClick={addTextOverlay}
                        className="w-full text-black"
                        variant={"outline"}
                        disabled={newTextOverlay.trim() === ""}
                      >
                        Add Text
                      </Button>
                    </div>
                  )}
                  {activeSidePanel === "sound" && (
                    <AudioTrackSelector
                      tracks={availableSounds}
                      onSelectTrack={addSound}
                    />
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        {/* Player section */}
        <div className="border border-gray-700 flex-grow p-6 flex items-center justify-center overflow-hidden bg-gray-900 inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
          <div
            ref={setPlayerContainerRef}
            className="w-full h-full flex items-center justify-center"
          >
            <div
              className="shadow-lg rounded-lg overflow-hidden bg-slate-900"
              style={{
                width: `${playerDimensions.width}px`,
                height: `${playerDimensions.height}px`,
              }}
            >
              <Player
                ref={playerRef}
                component={Composition}
                durationInFrames={Math.max(1, totalDuration)}
                compositionWidth={getAspectRatioDimensions().width}
                compositionHeight={getAspectRatioDimensions().height}
                hideControlsWhenPointerDoesntMove
                fps={30}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline section */}
      <div className="h-1/2 bg-gray-900 w-full overflow-hidden flex flex-col">
        <div className="flex justify-between items-center border-b border-gray-700 p-4 ">
          <div className="flex items-center space-x-4">
            <Button
              size="icon"
              onClick={togglePlayPause}
              className="bg-gray-800"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <span className="text-sm font-medium text-white">
              {formatTime(currentFrame)} / {formatTime(totalDuration)}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <label
              htmlFor="aspect-ratio"
              className="text-sm font-medium text-white"
            >
              Aspect Ratio:
            </label>
            <div className="relative">
              <select
                id="aspect-ratio"
                value={aspectRatio}
                onChange={(e) =>
                  setAspectRatio(e.target.value as "16:9" | "4:3" | "1:1")
                }
                className="appearance-none bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="16:9">16:9</option>
                <option value="4:3">4:3</option>
                <option value="1:1">1:1</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={timelineRef}
          className="flex-grow bg-gray-800 rounded-lg shadow-inner relative"
          onMouseMove={(e) => {
            handleMouseMove(e);
            handleTimelineMouseMove(e);
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={(e) => {
            handleMouseUp(e);
            handleTimelineMouseLeave();
          }}
          onClick={handleTimelineClick}
        >
          <div className="absolute inset-0">
            <div
              className="absolute top-0 left-0 right-0 h-10 bg-gray-900 flex items-end px-2 overflow-hidden z-10"
              onClick={handleTimelineClick}
            >
              {timeMarkers}
            </div>
            <div className="absolute top-10 left-0 right-0 bottom-0 overflow-x-auto overflow-y-visible p-2">
              <div
                style={{
                  width: `${100 * zoom}%`,
                  height: "100%",
                  position: "relative",
                }}
              >
                <div className="absolute inset-0 flex flex-col z-0">
                  {[...Array(MAX_ROWS)].map((_, index) => (
                    <div
                      key={index}
                      className="flex-grow flex flex-col p-[4px]"
                    >
                      <div className="flex-grow bg-gray-700 rounded-sm"></div>
                    </div>
                  ))}
                </div>
                {clips.map((clip, index) => (
                  <TimelineItem
                    key={clip.id}
                    item={clip}
                    type="clip"
                    index={index}
                    isDragging={isDragging}
                    draggedItem={draggedItem}
                    selectedItem={selectedItem}
                    handleMouseDown={handleMouseDown}
                    handleItemClick={handleItemClick}
                    totalDuration={totalDuration}
                    handleItemContextMenu={handleItemContextMenu}
                    onMouseMove={(e) =>
                      handleClipMouseMove(e, clip.id, clip.start, clip.duration)
                    }
                    onMouseLeave={handleClipMouseLeave}
                    hoverInfo={
                      hoverInfo && hoverInfo.clipId === clip.id
                        ? hoverInfo
                        : null
                    }
                  />
                ))}
                {textOverlays.map((overlay, index) => (
                  <TimelineItem
                    key={overlay.id}
                    item={overlay}
                    type="text"
                    index={index}
                    isDragging={isDragging}
                    draggedItem={draggedItem}
                    selectedItem={selectedItem}
                    handleMouseDown={handleMouseDown}
                    handleItemClick={handleItemClick}
                    totalDuration={totalDuration}
                    handleItemContextMenu={handleItemContextMenu}
                    onMouseMove={(e) =>
                      handleClipMouseMove(e, overlay.id, overlay.start, overlay.duration)
                    }
                    onMouseLeave={handleClipMouseLeave}
                    hoverInfo={
                      hoverInfo && hoverInfo.clipId === overlay.id
                        ? hoverInfo
                        : null
                    }
                  />
                ))}
                {sounds.map((sound, index) => (
                  <TimelineItem
                    key={sound.id}
                    item={sound}
                    type="sound"
                    index={index}
                    isDragging={isDragging}
                    draggedItem={draggedItem}
                    selectedItem={selectedItem}
                    handleMouseDown={handleMouseDown}
                    handleItemClick={handleItemClick}
                    totalDuration={totalDuration}
                    handleItemContextMenu={handleItemContextMenu}
                    onMouseMove={(e) =>
                      handleClipMouseMove(
                        e,
                        sound.id,
                        sound.start,
                        sound.duration
                      )
                    }
                    onMouseLeave={handleClipMouseLeave}
                    hoverInfo={
                      hoverInfo && hoverInfo.clipId === sound.id
                        ? hoverInfo
                        : null
                    }
                  />
                ))}
                {ghostElement && (
                  <div
                    className="absolute bg-gray-50 bg-opacity-50 rounded-md shadow-lg opacity-80 ghost-transition border-2 border-white border-dashed"
                    style={{
                      left: `calc(${ghostElement.left}% + 1px)`,
                      width: `calc(${ghostElement.width}% - 2px)`,
                      top: `calc(${ghostElement.top}% + 8px)`,
                      height: `calc(${100 / MAX_ROWS}% - 16px)`,
                      boxShadow: "0 0 0 2px rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-xs font-semibold bg-gray-900 bg-opacity-75 px-2 py-1 rounded">
                        {formatTime(
                          Math.round((ghostElement.width / 100) * totalDuration)
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <TimelineMarker
              currentFrame={currentFrame}
              totalDuration={totalDuration}
              zoom={zoom}
            />
            {ghostMarkerPosition !== null && (
              <div
                className="absolute top-0 w-[2.4px] bg-blue-500 opacity-50 pointer-events-none z-40"
                style={{
                  left: `${ghostMarkerPosition}%`,
                  height: "calc(100% + 0px)",
                }}
              >
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-blue-500 absolute top-[0px] left-1/2 transform -translate-x-1/2" />
              </div>
            )}
          </div>
        </div>
      </div>
      <ContextMenuComponent />
    </div>
  );
};

export default VideoEditor;
