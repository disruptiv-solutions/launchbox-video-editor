/**
 * Video Editor Component
 *
 * License: This code is licensed for personal and commercial use by the buyer. Redistribution or reselling of this code, in part or full, is prohibited.
 *
 * This component is a video editor built using React and Remotion. It supports adding video clips, text overlays, and sounds,
 * along with timeline editing features such as dragging, resizing, and snapping clips into position. The editor includes a player,
 * a timeline for clips, and a side panel for adding assets, text, and sound.
 *
 * Notes:
 * We do advice that this component is split into other components to make it more modular and easier to manage. The purpose of this one component is to show you how to use the Remotion Player and how to build a video editor.
 *
 * Key Features:
 * - Video, text, and sound overlays.
 * - Timeline editing with drag, resize, and snap-to-grid.
 * - Aspect ratio control.
 * - Play/Pause functionality with real-time frame updates.
 * - Tooltip-guided UI for asset addition.
 *
 * Components:
 * - `TimelineMarker`: Displays a moving marker along the timeline representing the current frame.
 * - `VideoEditor`: The main video editor component.
 * - `TextOverlayComponent`: A text overlay component that animates into the video.
 * - `LocalSoundList`: Displays a list of local soundtracks that can be added to the video.
 *
 * Dependencies:
 * - React, Remotion, Tailwind CSS, Lucide Icons, and custom components such as ScrollArea and Button.
 *
 * Hooks:
 * - `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`
 */

"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Player, PlayerRef } from "@remotion/player";
import {
  Sequence,
  Audio as RemotionAudio,
  Video,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FilmIcon, Type, Music, Play, Pause } from "lucide-react";
import { Clip, PexelsMedia, Sound, TextOverlay, LocalSound } from "./types";
import { localSounds } from "./sounds";
import { useToast } from "@/hooks/use-toast";

// Constants
const MAX_ROWS = 4; // Maximum number of timeline rows
const GRID_SIZE = 30; // Number of frames per grid unit in the timeline

/**
 * TimelineMarker Component
 * Displays the current position of the playhead on the timeline.
 *
 * @param {number} currentFrame - The current frame of the video being played.
 * @param {number} totalDuration - The total duration of the video in frames.
 * @param {number} zoom - The current zoom level on the timeline.
 */
const TimelineMarker: React.FC<{
  currentFrame: number;
  totalDuration: number;
  zoom: number;
}> = React.memo(({ currentFrame, totalDuration, zoom }) => {
  const markerPosition = useMemo(() => {
    return `${(currentFrame / totalDuration) * 100 * zoom}%`;
  }, [currentFrame, totalDuration, zoom]);

  return (
    <div
      className="absolute top-0 w-[2.4px] bg-red-500 pointer-events-none z-50"
      style={{
        left: markerPosition,
        transform: "translateX(-50%)",
        height: "calc(100% + 0px)",
        top: "0px",
      }}
    >
      <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-red-500 absolute top-[0px] left-1/2 transform -translate-x-1/2" />
    </div>
  );
});

TimelineMarker.displayName = "TimelineMarker";

/**
 * VideoEditor Component
 * The main component that handles the video editor interface and interactions.
 * Users can add video clips, text overlays, and sounds, adjust their placement, and play/pause the video.
 */
const VideoEditor: React.FC = () => {
  // State variables for handling video clips, overlays, and timeline controls
  const [clips, setClips] = useState<Clip[]>([]);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [totalDuration, setTotalDuration] = useState(1); // Total duration of the video project in frames
  const [currentFrame, setCurrentFrame] = useState(0); // The current frame in the video
  const playerRef = useRef<PlayerRef>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{
    type: "clip" | "text" | "sound";
    id: string;
    action: "move" | "resize-start" | "resize-end";
  } | null>(null);
  const [zoom] = useState(1);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(0);
  const [dragStartDuration, setDragStartDuration] = useState(0);
  const [ghostElement, setGhostElement] = useState<{
    left: number;
    width: number;
    top: number;
  } | null>(null);
  const [dragStartRow, setDragStartRow] = useState(0);
  const [selectedItem, setSelectedItem] = useState<{
    type: "clip" | "text" | "sound";
    id: string;
  } | null>(null);
  const [activeSidePanel, setActiveSidePanel] = useState<
    "text" | "sound" | "assets" | null
  >("assets");
  const [pexelsMedia, setPexelsMedia] = useState<PexelsMedia[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "4:3" | "1:1">(
    "16:9"
  );
  const [newTextOverlay, setNewTextOverlay] = useState("");
  const [availableSounds] = useState<LocalSound[]>(localSounds);
  const [playerContainerRef, setPlayerContainerRef] =
    useState<HTMLDivElement | null>(null);
  const [playerDimensions, setPlayerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [ghostMarkerPosition, setGhostMarkerPosition] = useState<number | null>(
    null
  );

  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  // Effect for updating current frame
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        const frame = playerRef.current.getCurrentFrame();
        if (frame !== null) {
          setCurrentFrame(frame);
        }
      }
    }, 1000 / 30);

    return () => clearInterval(interval);
  }, []);

  // Effect for checking mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchPexelsMedia("space");
  }, []);

  useEffect(() => {
    const updatePlayerDimensions = () => {
      if (playerContainerRef) {
        const containerWidth = playerContainerRef.clientWidth;
        const containerHeight = playerContainerRef.clientHeight;
        let width, height;

        switch (aspectRatio) {
          case "4:3":
            width = containerHeight * (4 / 3);
            height = containerHeight;
            if (width > containerWidth) {
              width = containerWidth;
              height = containerWidth * (3 / 4);
            }
            break;
          case "1:1":
            width = height = Math.min(containerWidth, containerHeight);
            break;
          default: // 16:9
            width = containerWidth;
            height = containerWidth * (9 / 16);
            if (height > containerHeight) {
              height = containerHeight;
              width = containerHeight * (16 / 9);
            }
            break;
        }

        setPlayerDimensions({ width, height });
      }
    };

    updatePlayerDimensions();
    window.addEventListener("resize", updatePlayerDimensions);
    return () => window.removeEventListener("resize", updatePlayerDimensions);
  }, [playerContainerRef, aspectRatio]);

  const addClip = () => {
    toggleSidePanel("assets");
    fetchPexelsMedia("space"); // You can change this to any default search term
  };

  const getAspectRatioDimensions = () => {
    switch (aspectRatio) {
      case "4:3":
        return { width: 1440, height: 1080 };
      case "1:1":
        return { width: 1080, height: 1080 };
      default:
        return { width: 1920, height: 1080 };
    }
  };

  const fetchPexelsMedia = async (query: string) => {
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
  };

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

      // Add this block to pause the player when adding a new clip
      if (isPlaying && playerRef.current) {
        playerRef.current.pause();
        setIsPlaying(false);
      }
    },
    [clips, textOverlays, sounds, totalDuration, isPlaying]
  );

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

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        const frame = playerRef.current.getCurrentFrame();
        if (frame !== null) {
          setCurrentFrame(frame);
        }
      }
    }, 1000 / 30);

    return () => clearInterval(interval);
  }, []);

  const handleDeleteItem = useCallback(() => {
    if (!selectedItem) return;

    const { type, id } = selectedItem;

    if (type === "clip") {
      const updatedClips = clips.filter((clip) => clip.id !== id);
      setClips(updatedClips);
      updateTotalDuration(updatedClips, textOverlays, sounds);
    } else if (type === "text") {
      const updatedTextOverlays = textOverlays.filter(
        (overlay) => overlay.id !== id
      );
      setTextOverlays(updatedTextOverlays);
      updateTotalDuration(clips, updatedTextOverlays, sounds);
    } else if (type === "sound") {
      const updatedSounds = sounds.filter((sound) => sound.id !== id);
      setSounds(updatedSounds);
      updateTotalDuration(clips, textOverlays, updatedSounds);
    }

    setSelectedItem(null);
  }, [selectedItem, clips, textOverlays, sounds, updateTotalDuration]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        handleDeleteItem();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDeleteItem]);

  const Composition = useCallback(
    () => (
      <>
        {clips.map((clip) => (
          <Sequence
            key={clip.id}
            from={clip.start}
            durationInFrames={clip.duration}
          >
            <Video src={clip.src} />
          </Sequence>
        ))}
        {textOverlays.map((overlay) => (
          <Sequence
            key={overlay.id}
            from={overlay.start}
            durationInFrames={overlay.duration}
          >
            <TextOverlayComponent text={overlay.text} />
          </Sequence>
        ))}
        {sounds.map((sound) => (
          <Sequence
            key={sound.id}
            from={sound.start}
            durationInFrames={sound.duration}
          >
            <RemotionAudio src={sound.file} />
          </Sequence>
        ))}
      </>
    ),
    [clips, textOverlays, sounds]
  );

  const renderTimeMarkers = () => {
    const markers = [];
    const totalSeconds = Math.floor(totalDuration / 30);
    const interval = Math.max(1, Math.floor(totalSeconds / (10 * zoom)));

    for (let i = 0; i <= totalSeconds; i++) {
      const minutes = Math.floor(i / 60);
      const seconds = i % 60;
      const isMainMarker = i % interval === 0;

      // Main second markers
      markers.push(
        <div
          key={i}
          className="absolute top-0 flex flex-col items-center"
          style={{ left: `${(i / totalSeconds) * 100 * zoom}%` }}
        >
          <div
            className={`w-px ${isMainMarker ? "h-4 bg-white" : "h-2 bg-white"}`}
          />
          {isMainMarker && (
            <span className="text-xs text-white mt-1">
              {`${minutes}:${seconds.toString().padStart(2, "0")}`}
            </span>
          )}
        </div>
      );

      // Mini ticks for milliseconds
      if (i < totalSeconds) {
        for (let j = 1; j < 4; j++) {
          markers.push(
            <div
              key={`${i}-${j}`}
              className="absolute top-0 w-px h-1 bg-gray-100"
              style={{
                left: `${((i + j * 0.25) / totalSeconds) * 100 * zoom}%`,
              }}
            />
          );
        }
      }
    }
    return markers;
  };

  const timeMarkers = useMemo(() => renderTimeMarkers(), [totalDuration, zoom]);

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
      let updatedSounds = sounds;

      if (draggedItem.type === "clip") {
        updatedClips = updateItem(clips, setClips);
      } else if (draggedItem.type === "text") {
        updatedTextOverlays = updateItem(textOverlays, setTextOverlays);
      } else if (draggedItem.type === "sound") {
        updatedSounds = updateItem(sounds, setSounds);
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

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
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

      setCurrentFrame(newFrame);
      if (playerRef.current) {
        playerRef.current.seekTo(newFrame);
      }
    },
    [totalDuration, zoom]
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

  const handleTimelineMouseLeave = useCallback(() => {
    setGhostMarkerPosition(null);
  }, []);

  const TimelineItem: React.FC<{
    item: Clip | TextOverlay | Sound;
    type: "clip" | "text" | "sound";
    index: number;
    isDragging: boolean;
    draggedItem: { id: string } | null;
    selectedItem: { id: string } | null;
    handleMouseDown: (
      type: "clip" | "text" | "sound",
      id: string,
      action: "move" | "resize-start" | "resize-end",
      e: React.MouseEvent<HTMLDivElement>
    ) => void;
    handleItemClick: (
      type: "clip" | "text" | "sound",
      id: string,
      e: React.MouseEvent
    ) => void;
    totalDuration: number;
  }> = ({
    item,
    type,
    index,
    isDragging,
    draggedItem,
    selectedItem,
    handleMouseDown,
    handleItemClick,
    totalDuration,
  }) => {
    const bgColor =
      type === "clip"
        ? "bg-indigo-500 to-indigo-400"
        : type === "text"
        ? "bg-purple-500 to-purple-400"
        : "bg-green-500 to-green-400";
    const hoverColor =
      type === "clip"
        ? "hover:bg-indigo-400 hover:bg-indigo-400"
        : type === "text"
        ? "hover:bg-purple-400"
        : "hover:bg-green-400";
    const ringColor =
      type === "clip"
        ? "ring-indigo-500"
        : type === "text"
        ? "ring-purple-500"
        : "ring-green-500";
    const dragColor =
      type === "clip"
        ? "bg-indigo-600"
        : type === "text"
        ? "bg-purple-600"
        : "bg-green-600";

    return (
      <div
        key={item.id}
        className={`absolute ${bgColor} rounded-sm shadow-sm cursor-grab ${hoverColor} transition duration-300 ease-in-out ${
          isDragging && draggedItem?.id === item.id ? "opacity-50" : ""
        } ${selectedItem?.id === item.id ? `ring-2 ${ringColor}` : ""}`}
        style={{
          left: `calc(${(item.start / totalDuration) * 100}% + 1px)`,
          width: `calc(${(item.duration / totalDuration) * 100}% - 2px)`,
          top: `calc(${(item.row / MAX_ROWS) * 100}% + 6px)`,
          height: `calc(${100 / MAX_ROWS}% - 12px)`,
        }}
        onMouseDown={(e) => handleMouseDown(type, item.id, "move", e)}
        onClick={(e) => handleItemClick(type, item.id, e)}
      >
        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold hover:text-gray-800">
          {type.charAt(0).toUpperCase() + type.slice(1)} {index + 1}
        </div>
        <div
          className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-md cursor-ew-resize ${dragColor} mt-1 mb-1 ml-1 `}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleMouseDown(type, item.id, "resize-start", e);
          }}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-1.5 rounded-md cursor-ew-resize ${dragColor} mt-1 mb-1 mr-1  `}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleMouseDown(type, item.id, "resize-end", e);
          }}
        />
      </div>
    );
  };

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

  const PexelsMediaList: React.FC = () => {
    return (
      <div className="grid grid-cols-2 gap-6">
        {isLoadingMedia ? (
          <div>Loading...</div>
        ) : (
          pexelsMedia.map((item) => (
            <div
              key={item.id}
              className="cursor-pointer hover:opacity-75 transition-opacity"
              onClick={() => handlePexelsItemClick(item)}
            >
              <img
                src={item.image || item.video_files?.[0].link}
                alt={`Pexels media ${item.id}`}
                className="w-full h-auto object-cover rounded-md"
              />
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
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
                    addClip();
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
                <h2 className="text-xl font-semibold  p-1">
                  {activeSidePanel === "text" && "Text Overlay"}
                  {activeSidePanel === "sound" && "Sound"}
                  {activeSidePanel === "assets" && "Media Assets"}
                </h2>
              </div>
              <ScrollArea className="flex-grow">
                <div className="p-6">
                  {activeSidePanel === "assets" && <PexelsMediaList />}
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
                    <LocalSoundList
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
                      className="flex-grow flex flex-col p-[2px]"
                    >
                      <div className="flex-grow bg-gradient-to-b from-gray-700 to-gray-800 rounded-sm"></div>
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
                  />
                ))}
                {ghostElement && (
                  <div
                    className="absolute bg-gray-100 rounded-md shadow-sm opacity-50 ghost-transition"
                    style={{
                      left: `calc(${ghostElement.left}% + 1px)`,
                      width: `calc(${ghostElement.width}% - 2px)`,
                      top: `calc(${ghostElement.top}% + 8px)`,
                      height: `calc(${100 / MAX_ROWS}% - 16px)`,
                    }}
                  />
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
    </div>
  );
};

const TextOverlayComponent: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "64px",
        fontWeight: "bold",
        color: "white",
        textShadow: "0 0 5px black",
        opacity,
      }}
    >
      {text}
    </div>
  );
};

const LocalSoundList: React.FC<{
  tracks: LocalSound[];
  onSelectTrack: (track: LocalSound) => void;
}> = ({ tracks, onSelectTrack }) => {
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    tracks.forEach((track) => {
      audioRefs.current[track.id] = new Audio(`${track.file}`);
    });

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [tracks]);

  const togglePlay = (trackId: string) => {
    const audio = audioRefs.current[trackId];
    if (playingTrack === trackId) {
      audio.pause();
      setPlayingTrack(null);
    } else {
      if (playingTrack) {
        audioRefs.current[playingTrack].pause();
      }
      audio
        .play()
        .catch((error) => console.error("Error playing audio:", error));
      setPlayingTrack(trackId);
    }
  };

  return (
    <div className="space-y-4">
      {tracks.map((track) => (
        <div
          key={track.id}
          className="flex items-center space-x-2 p-2 bg-gray-800 rounded-md cursor-pointer hover:bg-gray-700"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay(track.id);
            }}
            className="mr-2"
          >
            {playingTrack === track.id ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <div onClick={() => onSelectTrack(track)} className="flex-grow">
            <p className="font-semibold">{track.title}</p>
            <p className="text-sm text-white">{track.artist}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoEditor;
