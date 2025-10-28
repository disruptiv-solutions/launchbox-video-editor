import { AwsRegion, RenderMediaOnLambdaOutput } from "@remotion/lambda/client";
import { renderMediaOnLambda } from "@remotion/lambda/client";
import { RenderRequest } from "@/components/editor/version-7.0.0/types";
import { executeApi } from "@/components/editor/version-7.0.0/lambda-helpers/api-response";

import {
  LAMBDA_FUNCTION_NAME,
  REGION,
  SITE_NAME,
} from "@/components/editor/version-7.0.0/constants";

/**
 * Configuration for the Lambda render function
 */
const LAMBDA_CONFIG = {
  FUNCTION_NAME: LAMBDA_FUNCTION_NAME,
  // Increased from 100 to 200 to work around AWS concurrency limit of 10
  // With limit of 10: 1 orchestration Lambda + up to 9 renderer Lambdas
  // framesPerLambda = 200 means max 9 renderer functions for ~60sec video (1800 frames at 30fps)
  // TODO: Decrease back to 100 once AWS quota increase to 1000+ is approved
  FRAMES_PER_LAMBDA: 200,
  MAX_RETRIES: 2,
  CODEC: "h264" as const,
} as const;

/**
 * Validates AWS credentials are present in environment variables
 * @throws {TypeError} If AWS credentials are missing
 */
const validateAwsCredentials = () => {
  console.log("Validating AWS credentials....");
  if (
    !process.env.AWS_ACCESS_KEY_ID &&
    !process.env.REMOTION_AWS_ACCESS_KEY_ID
  ) {
    throw new TypeError(
      "Set up Remotion Lambda to render videos. See the README.md for how to do so."
    );
  }
  if (
    !process.env.AWS_SECRET_ACCESS_KEY &&
    !process.env.REMOTION_AWS_SECRET_ACCESS_KEY
  ) {
    throw new TypeError(
      "The environment variable REMOTION_AWS_SECRET_ACCESS_KEY is missing. Add it to your .env file."
    );
  }
};

/**
 * POST endpoint handler for rendering media using Remotion Lambda
 * @description Handles video rendering requests by delegating to AWS Lambda
 * @throws {Error} If rendering fails or AWS credentials are invalid
 */
export const POST = executeApi<RenderMediaOnLambdaOutput, typeof RenderRequest>(
  RenderRequest,
  async (req, body) => {
    // Debug logging
    console.log("Received body:", JSON.stringify(body, null, 2));
    console.log("inputProps:", JSON.stringify(body.inputProps, null, 2));
    console.log("Duration in frames:", body.inputProps.durationInFrames);

    // Validate AWS credentials
    validateAwsCredentials();

    /**
     * Clean up proxy URLs from overlays
     * Remotion's Video component proxies external URLs through localhost in dev
     * Lambda can't access localhost, so we need to extract the original URLs
     */
    const cleanInputProps = (props: typeof body.inputProps) => {
      if (!props.overlays || !Array.isArray(props.overlays)) {
        return props;
      }

      const cleanedOverlays = props.overlays.map((overlay: any) => {
        const cleanedOverlay = { ...overlay };

        // Helper function to clean proxy URLs
        const cleanProxyUrl = (urlString: string): string => {
          try {
            const url = new URL(urlString);
            if (url.hostname === "localhost" && url.pathname === "/proxy") {
              const srcParam = url.searchParams.get("src");
              if (srcParam) {
                const originalUrl = decodeURIComponent(srcParam);
                console.log(
                  `Replacing proxy URL ${urlString} with ${originalUrl}`
                );
                return originalUrl;
              }
            }
          } catch (e) {
            // If URL parsing fails, just keep the original
            console.warn("Failed to parse URL:", urlString);
          }
          return urlString;
        };

        // Clean src property (for video overlays)
        if (cleanedOverlay.src) {
          cleanedOverlay.src = cleanProxyUrl(cleanedOverlay.src);
        }

        // Clean content property (for image overlays that might use proxy)
        if (cleanedOverlay.content && typeof cleanedOverlay.content === "string") {
          cleanedOverlay.content = cleanProxyUrl(cleanedOverlay.content);
        }

        return cleanedOverlay;
      });

      return { ...props, overlays: cleanedOverlays };
    };

    const cleanedInputProps = cleanInputProps(body.inputProps);
    console.log("Cleaned inputProps:", JSON.stringify(cleanedInputProps, null, 2));

    try {
      console.log("Rendering media on Lambda....");
      const result = await renderMediaOnLambda({
        codec: LAMBDA_CONFIG.CODEC,
        functionName: LAMBDA_CONFIG.FUNCTION_NAME,
        region: REGION as AwsRegion,
        serveUrl: SITE_NAME,
        composition: body.id,
        inputProps: cleanedInputProps,
        framesPerLambda: LAMBDA_CONFIG.FRAMES_PER_LAMBDA,
        downloadBehavior: {
          type: "download",
          fileName: "video.mp4",
        },
        maxRetries: LAMBDA_CONFIG.MAX_RETRIES,
        // Removed everyNthFrame - defaults to 1 (render every frame)
        // This ensures all frames are rendered for the full duration
      });

      console.log("Render result:", JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error("Error in renderMediaOnLambda:", error);
      throw error;
    }
  }
);
