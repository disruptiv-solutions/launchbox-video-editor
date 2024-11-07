/**
 * Represents a template for text overlays in the video editor.
 * Extends the TextOverlay type with additional properties for template management.
 */
export interface TextOverlayTemplate
  extends Omit<TextOverlay, "id" | "start" | "duration" | "row"> {
  id: string;
  name: string;
  description: string;
  start: number;
  duration: number;
  displayFontSize: number;
  row: number;
  backgroundColor: string;
  fontWeight: string;
}

/**
 * Represents a selected item in the editor.
 */
export type SelectedItem =
  | { type: "clip"; id: string; clip: Clip }
  | { type: "text"; id: string; overlay: TextOverlay }
  | { type: "sound"; id: string; sound: Sound }
  | null;

/**
 * Represents a video clip in the editor.
 */
export interface Clip {
  id: string;
  start: number;
  duration: number;
  src: string;
  row: number;
  videoStartTime?: number;
}

/**
 * Represents a text overlay in the editor.
 */
export interface TextOverlay {
  id: string;
  start: number;
  duration: number;
  text: string;
  row: number;
  position?: { x: number; y: number };
  fontSize: number;
  fontColor: string;
  fontFamily: string;
  backgroundColor: string;
}

/**
 * Represents a sound element in the editor.
 */
export interface Sound {
  id: string;
  start: number;
  duration: number;
  content: string;
  row: number;
  file: string;
  startFrom?: number;
}

/**
 * Represents media from Pexels API.
 */
export interface PexelsMedia {
  id: string;
  duration?: number;
  image?: string;
  video_files?: { link: string }[];
}

/**
 * Represents a local sound file.
 */
export interface LocalSound {
  id: string;
  title: string;
  artist: string;
  file: string;
  duration: number;
}
