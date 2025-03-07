import { z } from "zod";
import { useCallback, useMemo, useState } from "react";
import { CompositionProps } from "../types";

import {
  getProgress as getLambdaProgress,
  renderVideo as renderLambdaVideo,
} from "../lambda-helpers/api";
import {
  getProgress as getSsrProgress,
  renderVideo as renderSsrVideo,
} from "../ssr-helpers/api";

/**
 * Common response type for both rendering implementations.
 * This ensures consistency regardless of which renderer is used.
 */
type RenderResponse = {
  renderId: string;
  bucketName?: string; // Optional for SSR implementation
};

/**
 * Environment variable that controls which rendering implementation to use:
 * - When NEXT_PUBLIC_USE_SSR="true": Uses the SSR (Server-Side Rendering) implementation
 * - When NEXT_PUBLIC_USE_SSR="false": Uses the Lambda (AWS Lambda) implementation
 *
 * This can be configured via environment variables to switch between rendering engines
 * without code changes.
 */
const USE_SSR = process.env.NEXT_PUBLIC_USE_SSR === "true";

/**
 * Dynamically selects the appropriate rendering functions based on USE_SSR flag:
 * - getProgress: Checks the rendering progress
 * - renderVideo: Initiates the video rendering process
 *
 * Both implementations (SSR and Lambda) conform to the same interface,
 * making them interchangeable at runtime.
 */
const getProgress = USE_SSR ? getSsrProgress : getLambdaProgress;
const renderVideo = USE_SSR
  ? (params: any): Promise<RenderResponse> => renderSsrVideo(params)
  : (params: any): Promise<RenderResponse> => renderLambdaVideo(params);

// Define possible states for the rendering process
export type State =
  | { status: "init" } // Initial state
  | { status: "invoking" } // API call is being made
  | {
      // Video is being rendered
      renderId: string;
      bucketName: string;
      progress: number;
      status: "rendering";
    }
  | {
      // Error occurred during rendering
      renderId: string | null;
      status: "error";
      error: Error;
    }
  | {
      // Rendering completed successfully
      url: string;
      size: number;
      status: "done";
    };

// Utility function to create a delay
const wait = async (milliSeconds: number) => {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliSeconds);
  });
};

// Custom hook to manage video rendering process
export const useRendering = (
  id: string, // Unique identifier for the render
  inputProps: z.infer<typeof CompositionProps> // Video composition properties
) => {
  // Maintain current state of the rendering process
  const [state, setState] = useState<State>({
    status: "init",
  });

  // Main function to handle the rendering process
  const renderMedia = useCallback(async () => {
    console.log("Starting renderMedia process");
    setState({
      status: "invoking",
    });
    try {
      console.log("Calling renderVideo API with inputProps", inputProps);
      const { renderId, bucketName } = await renderVideo({ id, inputProps });
      console.log(
        `Render initiated: renderId=${renderId}, bucketName=${bucketName}`
      );
      setState({
        status: "rendering",
        progress: 0,
        renderId: renderId,
        bucketName: bucketName ?? "",
      });

      let pending = true;

      while (pending) {
        console.log(`Checking progress for renderId=${renderId}`);
        const result = await getProgress({
          id: renderId,
          bucketName: bucketName ?? "",
        });
        switch (result.type) {
          case "error": {
            console.error(`Render error: ${result.message}`);
            const errorMessage = result.message.includes("Failed to fetch")
              ? `Rendering failed: This might be caused by insufficient disk space in your browser. Try:\n` +
                `1. Clearing browser cache and temporary files\n` +
                `2. Freeing up disk space\n` +
                `3. Using a different browser\n` +
                `Original error: ${result.message}`
              : result.message;

            setState({
              status: "error",
              renderId: renderId,
              error: new Error(errorMessage),
            });
            pending = false;
            break;
          }
          case "done": {
            console.log(
              `Render complete: url=${result.url}, size=${result.size}`
            );
            setState({
              size: result.size,
              url: result.url,
              status: "done",
            });
            pending = false;
            break;
          }
          case "progress": {
            console.log(`Render progress: ${result.progress}%`);
            setState({
              status: "rendering",
              bucketName: bucketName ?? "",
              progress: result.progress,
              renderId: renderId,
            });
            await wait(1000);
          }
        }
      }
    } catch (err) {
      console.error("Unexpected error during rendering:", err);
      setState({
        status: "error",
        error: err as Error,
        renderId: null,
      });
    }
  }, [id, inputProps]);

  // Reset the rendering state back to initial
  const undo = useCallback(() => {
    setState({ status: "init" });
  }, []);

  // Return memoized values to prevent unnecessary re-renders
  return useMemo(
    () => ({
      renderMedia, // Function to start rendering
      state, // Current state of the render
      undo, // Function to reset the state
    }),
    [renderMedia, state, undo]
  );
};
