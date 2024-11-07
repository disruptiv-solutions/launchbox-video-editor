import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface PexelsAudio {
  id: number;
  title: string;
  duration: number;
  audio_url: string;
  artist?: string;
}

export function usePexelsAudio() {
  const [tracks, setTracks] = useState<PexelsAudio[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAudioTracks = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.pexels.com/audio/search?query=${query}&per_page=20`,
        {
          headers: {
            Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY || "",
          },
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setTracks(data.audio_files || []);
    } catch (error) {
      console.error("Error fetching Pexels audio:", error);
      toast({
        title: "Error fetching audio",
        description:
          "Failed to fetch audio tracks. Have you added your own Pexels API key?",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { tracks, isLoading, fetchAudioTracks };
}
