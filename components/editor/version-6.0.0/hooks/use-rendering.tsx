import { z } from "zod";
import { useCallback, useMemo, useState } from "react";
import { CompositionProps } from "../types";
import {
  getProgress as ssrGetProgress,
  renderVideo as ssrRenderVideo,
} from "../ssr-helpers/api";
import {
  getProgress as lambdaGetProgress,
  renderVideo as lambdaRenderVideo,
} from "../lambda-helpers/api";

// Define possible states for the rendering process
export type State =
  | { status: "init" } // Initial state
  | { status: "invoking" } // API call is being made
  | {
      // Video is being rendered
      renderId: string;
      progress: number;
      status: "rendering";
      bucketName?: string; // Make bucketName optional
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

type RenderType = "ssr" | "lambda";

// Custom hook to manage video rendering process
export const useRendering = (
  id: string,
  inputProps: z.infer<typeof CompositionProps>,
  renderType: RenderType = "ssr" // Default to SSR rendering
) => {
  // Maintain current state of the rendering process
  const [state, setState] = useState<State>({
    status: "init",
  });

  // Main function to handle the rendering process
  const renderMedia = useCallback(async () => {
    console.log(`Starting renderMedia process using ${renderType}`);
    setState({
      status: "invoking",
    });

    try {
      const renderVideo =
        renderType === "ssr" ? ssrRenderVideo : lambdaRenderVideo;
      const getProgress =
        renderType === "ssr" ? ssrGetProgress : lambdaGetProgress;

      console.log("Calling renderVideo API with inputProps", inputProps);
      const response = await renderVideo({ id, inputProps });
      const renderId = response.renderId;
      console.log("Received renderId:", renderId);

      // Add a longer initial delay for the first render
      if (renderType === "ssr") {
        console.log("Waiting for SSR initialization...");
        await wait(3000);
      }

      setState({
        status: "rendering",
        progress: 0,
        renderId,
      });

      let retryCount = 0;
      const maxRetries = 3;
      let pending = true;

      while (pending) {
        try {
          console.log(`Checking progress for renderId=${renderId}`);
          const result = await getProgress({
            id: renderId,
            bucketName: "",
          });

          // Reset retry count on successful progress check
          retryCount = 0;

          console.log("Progress result:", result);

          switch (result.type) {
            case "error": {
              console.error(`Render error: ${result.message}`);
              setState({
                status: "error",
                renderId: renderId,
                error: new Error(result.message),
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
                progress: result.progress,
                renderId: renderId,
              });
              await wait(1000);
            }
          }
        } catch (error) {
          console.error("Error checking progress:", error);
          retryCount++;

          if (retryCount >= maxRetries) {
            throw error;
          }

          // Wait longer between retries
          await wait(1000 * retryCount);
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
  }, [id, inputProps, renderType]);

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
