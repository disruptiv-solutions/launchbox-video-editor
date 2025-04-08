import { Overlay, OverlayType } from "./types";

// Default and maximum number of rows to display in the editor
export const INITIAL_ROWS = 5;
export const MAX_ROWS = 8;
// Frames per second for video rendering
export const FPS = 30;

// Name of the component being tested/rendered
export const COMP_NAME = "TestComponent";

// Video configuration
export const DURATION_IN_FRAMES = 30;
export const VIDEO_WIDTH = 1280; // 720p HD video dimensions
export const VIDEO_HEIGHT = 720;

// UI configuration
export const ROW_HEIGHT = 44; // Slightly increased from 48
export const SHOW_LOADING_PROJECT_ALERT = true; // Controls visibility of asset loading indicator
export const DISABLE_MOBILE_LAYOUT = false;

/**
 * This constant disables video keyframe extraction in the browser. Enable this if you're working with
 * multiple videos or large video files to improve performance. Keyframe extraction is CPU-intensive and can
 * cause browser lag. For production use, consider moving keyframe extraction to the server side.
 * Future versions of Remotion may provide more efficient keyframe handling.
 */
export const DISABLE_VIDEO_KEYFRAMES = false;

// AWS deployment configuration
export const SITE_NAME = "sams-site";
export const LAMBDA_FUNCTION_NAME =
  "remotion-render-4-0-272-mem2048mb-disk2048mb-120sec";
export const REGION = "us-east-1";

// Zoom control configuration
export const ZOOM_CONSTRAINTS = {
  min: 0.2, // Minimum zoom level
  max: 10, // Maximum zoom level
  step: 0.1, // Smallest increment for manual zoom controls
  default: 1, // Default zoom level
  zoomStep: 0.15, // Zoom increment for zoom in/out buttons
  wheelStep: 0.3, // Zoom increment for mouse wheel
  transitionDuration: 100, // Animation duration in milliseconds
  easing: "cubic-bezier(0.4, 0.0, 0.2, 1)", // Smooth easing function for zoom transitions
};

// Render configuration
// NOTE: TO CHANGE RENDER TYPE, UPDATE THE RENDER_TYPE CONSTANT
export const RENDER_TYPE: "ssr" | "lambda" = "lambda";

// Autosave configuration
export const AUTO_SAVE_INTERVAL = 10000; // Autosave every 10 seconds

export const DEFAULT_OVERLAYS: Overlay[] = [
  {
    left: 5,
    top: 0,
    width: 1275,
    height: 749,
    durationInFrames: 156,
    from: 0,
    id: 0,
    rotation: 0,
    row: 4,
    isDragging: false,
    type: OverlayType.VIDEO,
    content:
      "https://images.pexels.com/videos/3583029/free-video-3583029.jpg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    src: "https://videos.pexels.com/video-files/3583029/3583029-hd_1280_720_25fps.mp4",
    videoStartTime: 0,
    styles: {
      opacity: 1,
      zIndex: 100,
      transform: "none",
      objectFit: "cover",
    },
  },
  {
    left: 163,
    top: 148,
    width: 987,
    height: 377,
    durationInFrames: 50,
    from: 14,
    id: 1,
    row: 2,
    rotation: 0,
    isDragging: false,
    type: OverlayType.TEXT,
    content: "Stickers and templateS?",
    styles: {
      fontSize: "3rem",
      fontWeight: "900",
      color: "#FFFFFF",
      backgroundColor: "",
      fontFamily: "font-sans",
      fontStyle: "normal",
      textDecoration: "none",
      lineHeight: "1",
      textAlign: "center",
      letterSpacing: "0.02em",
      textShadow: "2px 2px 0px rgba(0, 0, 0, 0.2)",
      opacity: 1,
      zIndex: 1,
      transform: "none",
      animation: {
        enter: "fade",
        exit: "none",
      },
    },
  },
  {
    id: 2,
    type: OverlayType.STICKER,
    content: "bar-chart",
    category: "Default",
    durationInFrames: 92,
    from: 64,
    height: 521,
    width: 809,
    left: 247,
    top: 88,
    row: 0,
    isDragging: false,
    rotation: 0,
    styles: {
      opacity: 1,
      zIndex: 1,
    },
  },
  {
    left: 128,
    top: 76,
    width: 1095,
    height: 559,
    durationInFrames: 109,
    from: 45,
    id: 6,
    rotation: 0,
    row: 1,
    isDragging: false,
    type: OverlayType.VIDEO,
    content:
      "https://images.pexels.com/videos/4822860/black-and-white-background-cool-wallpaper-hd-wallpapers-motion-4822860.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    src: "https://videos.pexels.com/video-files/4822860/4822860-hd_1280_720_30fps.mp4",
    videoStartTime: 0,
    styles: {
      opacity: 1,
      zIndex: 100,
      transform: "none",
      objectFit: "cover",
    },
  },
  {
    left: 175,
    top: 161,
    width: 987,
    height: 377,
    durationInFrames: 50,
    from: 15,
    id: 7,
    row: 3,
    rotation: 0,
    isDragging: false,
    type: OverlayType.TEXT,
    content: "Stickers and templateS?",
    styles: {
      fontSize: "3rem",
      fontWeight: "900",
      color: "rgb(6, 6, 31)",
      backgroundColor: "",
      fontFamily: "font-sans",
      fontStyle: "normal",
      textDecoration: "none",
      lineHeight: "1",
      textAlign: "center",
      letterSpacing: "0.02em",
      textShadow: "2px 2px 0px rgba(0, 0, 0, 0.2)",
      opacity: 1,
      zIndex: 1,
      transform: "none",
      animation: {
        enter: "fade",
        exit: "none",
      },
    },
  },
];
