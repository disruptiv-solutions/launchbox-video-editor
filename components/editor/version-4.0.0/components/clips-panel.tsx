import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useEditorContext } from "../contexts/editor-context";
import { useTimelinePositioning } from "../hooks/use-timeline-positioning";
import { ClipOverlay } from "../types";
import { usePexelsVideos } from "../hooks/use-pexels-video";
import { useAspectRatio } from "../hooks/use-aspect-ratio";

interface PexelsVideoFile {
  quality: string;
  link: string;
  // Add other potential properties as needed
}

interface PexelsVideo {
  id: number | string;
  image: string;
  video_files: PexelsVideoFile[];
  // Add other potential properties as needed
}

export const ClipsPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { videos, isLoading, fetchVideos } = usePexelsVideos();
  const { addOverlay, overlays, durationInFrames } = useEditorContext();
  const { findNextAvailablePosition } = useTimelinePositioning();
  const { getAspectRatioDimensions } = useAspectRatio();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchVideos(searchQuery);
    }
  };

  const handleAddClip = (video: PexelsVideo) => {
    const MAX_ROWS = 4;
    const { width, height } = getAspectRatioDimensions();

    const { from, row } = findNextAvailablePosition(
      overlays,
      MAX_ROWS,
      durationInFrames
    );

    // Find the best quality video file (prioritize UHD > HD > SD)
    const videoFile =
      video.video_files.find(
        (file: PexelsVideoFile) => file.quality === "uhd"
      ) ||
      video.video_files.find(
        (file: PexelsVideoFile) => file.quality === "hd"
      ) ||
      video.video_files.find(
        (file: PexelsVideoFile) => file.quality === "sd"
      ) ||
      video.video_files[0]; // Fallback to first file if no matches

    const newOverlay: ClipOverlay = {
      left: 0,
      top: 0,
      width,
      height,
      durationInFrames: 90,
      from,
      id: Date.now(),
      rotation: 0,
      row,
      isDragging: false,
      type: "clip",
      content: video.image,
      src: videoFile?.link ?? "",
      videoStartTime: 0,
      styles: {
        opacity: 1,
        zIndex: 0,
        transform: "none",
        objectFit: "cover",
      },
    };

    addOverlay(newOverlay);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-800/40 h-full">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search videos..."
          value={searchQuery}
          className="bg-gray-800 border-white/5 text-zinc-200 placeholder:text-gray-400 focus-visible:ring-blue-400"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          type="submit"
          variant="default"
          disabled={isLoading}
          className="bg-gray-800 hover:bg-gray-700 text-zinc-200 border-white/5"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>

      <div className="grid grid-cols-2 gap-3">
        {isLoading
          ? Array.from({ length: 16 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="relative aspect-video bg-gray-800 animate-pulse rounded-sm"
              />
            ))
          : videos.map((video) => (
              <button
                key={video.id}
                className="relative aspect-video cursor-pointer border border-transparent hover:border-white rounded-md"
                onClick={() => handleAddClip(video)}
              >
                <div className="relative">
                  <img
                    src={video.image}
                    alt={`Video thumbnail ${video.id}`}
                    className="rounded-sm object-cover w-full h-full hover:opacity-60 transition-opacity duration-200"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200" />
                </div>
              </button>
            ))}
      </div>
    </div>
  );
};
