import { OffthreadVideo, useCurrentFrame } from "remotion";
import { ClipOverlay } from "../../../types";
import { animationTemplates } from "../../../templates/animation-templates";
import { toAbsoluteUrl } from "../../../utils/url-helper";

/**
 * Interface defining the props for the VideoLayerContent component
 */
interface VideoLayerContentProps {
  /** The overlay configuration object containing video properties and styles */
  overlay: ClipOverlay;
  /** The base URL for the video */
  baseUrl?: string;
}

/**
 * VideoLayerContent component renders a video layer with animations and styling
 *
 * This component handles:
 * - Video playback using Remotion's OffthreadVideo
 * - Enter/exit animations based on the current frame
 * - Styling including transform, opacity, border radius, etc.
 * - Video timing and volume controls
 *
 * @param props.overlay - Configuration object for the video overlay including:
 *   - src: Video source URL
 *   - videoStartTime: Start time offset for the video
 *   - durationInFrames: Total duration of the overlay
 *   - styles: Object containing visual styling properties and animations
 */
export const VideoLayerContent: React.FC<VideoLayerContentProps> = ({
  overlay,
  baseUrl,
}) => {
  const frame = useCurrentFrame();

  // Calculate if we're in the exit phase (last 30 frames)
  const isExitPhase = frame >= overlay.durationInFrames - 30;

  // Apply enter animation only during entry phase
  const enterAnimation =
    !isExitPhase && overlay.styles.animation?.enter
      ? animationTemplates[overlay.styles.animation.enter]?.enter(
          frame,
          overlay.durationInFrames
        )
      : {};

  // Apply exit animation only during exit phase
  const exitAnimation =
    isExitPhase && overlay.styles.animation?.exit
      ? animationTemplates[overlay.styles.animation.exit]?.exit(
          frame,
          overlay.durationInFrames
        )
      : {};

  const videoStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: overlay.styles.objectFit || "cover",
    opacity: overlay.styles.opacity,
    transform: overlay.styles.transform || "none",
    borderRadius: overlay.styles.borderRadius || "0px",
    filter: overlay.styles.filter || "none",
    boxShadow: overlay.styles.boxShadow || "none",
    border: overlay.styles.border || "none",
    ...(isExitPhase ? exitAnimation : enterAnimation),
  };

  // Determine the video source URL
  let videoSrc = overlay.src;

  // If it's a relative URL and baseUrl is provided, use baseUrl
  if (overlay.src.startsWith("/") && baseUrl) {
    videoSrc = `${baseUrl}${overlay.src}`;
  }
  // Otherwise use the toAbsoluteUrl helper for relative URLs
  else if (overlay.src.startsWith("/")) {
    videoSrc = toAbsoluteUrl(overlay.src);
  }

  return (
    <OffthreadVideo
      src={videoSrc}
      startFrom={overlay.videoStartTime || 0}
      style={videoStyle}
      volume={overlay.styles.volume ?? 1}
    />
  );
};
