import { bundle } from "@remotion/bundler";
import {
  renderMedia,
  selectComposition,
  RenderMediaOnProgress,
} from "@remotion/renderer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { getBaseUrl } from "../utils/url-helper";

// Ensure the videos directory exists
const VIDEOS_DIR = path.join(process.cwd(), "public", "videos");
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

// Track rendering progress
export const renderProgress = new Map<string, number>();
export const renderStatus = new Map<string, "rendering" | "done" | "error">();
export const renderErrors = new Map<string, string>();
export const renderUrls = new Map<string, string>();
export const renderSizes = new Map<string, number>();

/**
 * Custom renderer that uses browser-based rendering to avoid platform-specific dependencies
 */
export async function startRendering(
  compositionId: string,
  inputProps: Record<string, unknown>
) {
  const renderId = uuidv4();

  // Initialize tracking immediately
  renderProgress.set(renderId, 0);
  renderStatus.set(renderId, "rendering");

  // Define output file path and public URL
  const outputFile = path.join(VIDEOS_DIR, `${renderId}.mp4`);
  const publicUrl = `/videos/${renderId}.mp4`;

  // Start the rendering process asynchronously
  (async () => {
    try {
      // Get the base URL for serving media files
      const baseUrl = getBaseUrl();

      // Bundle the video
      const bundleLocation = await bundle(
        path.join(
          process.cwd(),
          "components",
          "editor",
          "version-6.0.0",
          "remotion",
          "index.ts"
        ),
        undefined,
        {
          // Disable all platform-specific compositors
          webpackOverride: (config) => ({
            ...config,
            resolve: {
              ...config.resolve,
              fallback: {
                ...config.resolve?.fallback,
                // Explicitly disable ALL compositor packages
                "@remotion/compositor": false,
                "@remotion/compositor-darwin-arm64": false,
                "@remotion/compositor-darwin-x64": false,
                "@remotion/compositor-linux-x64": false,
                "@remotion/compositor-linux-arm64": false,
                "@remotion/compositor-win32-x64-msvc": false,
                "@remotion/compositor-windows-x64": false,
              },
            },
          }),
        }
      );

      // Select the composition
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: compositionId,
        inputProps: {
          ...inputProps,
          // Pass the base URL to the composition for media file access
          baseUrl,
        },
      });

      // Get the actual duration from inputProps or use composition's duration
      const actualDurationInFrames =
        (inputProps.durationInFrames as number) || composition.durationInFrames;
      console.log(`Using actual duration: ${actualDurationInFrames} frames`);

      // Render the video using chromium
      await renderMedia({
        codec: "h264",
        composition: {
          ...composition,
          // Override the duration to use the actual duration from inputProps
          durationInFrames: actualDurationInFrames,
        },
        serveUrl: bundleLocation,
        outputLocation: outputFile,
        inputProps: {
          ...inputProps,
          baseUrl,
        },
        // Set chromium options according to the correct API
        chromiumOptions: {
          headless: true,
          disableWebSecurity: false,
          ignoreCertificateErrors: false,
        },
        timeoutInMilliseconds: 300000, // 5 minutes
        onProgress: ((progress) => {
          // Extract just the progress percentage from the detailed progress object
          renderProgress.set(renderId, progress.progress);
        }) as RenderMediaOnProgress,
      });

      // Get file size
      const stats = fs.statSync(outputFile);
      renderStatus.set(renderId, "done");
      renderUrls.set(renderId, publicUrl);
      renderSizes.set(renderId, stats.size);
      console.log(`Render ${renderId} completed successfully`);
    } catch (error) {
      renderStatus.set(renderId, "error");
      renderErrors.set(
        renderId,
        error instanceof Error ? error.message : String(error)
      );
      console.error(`Render ${renderId} failed:`, error);
    }
  })();

  // Return the ID immediately so tracking can begin
  return renderId;
}

/**
 * Get the current progress of a render
 */
export function getRenderProgress(renderId: string) {
  // Add logging to debug missing renders
  console.log("Checking progress for render:", renderId);
  console.log("Available render IDs:", Array.from(renderStatus.keys()));

  const progress = renderProgress.get(renderId) || 0;
  const status = renderStatus.get(renderId) || "rendering";
  const error = renderErrors.get(renderId);
  const url = renderUrls.get(renderId);
  const size = renderSizes.get(renderId);

  if (!renderStatus.has(renderId)) {
    throw new Error(`No render found with ID: ${renderId}`);
  }

  return {
    renderId,
    progress,
    status,
    error,
    url,
    size,
  };
}
