import { ProgressRequest } from "@/components/editor/version-6.0.0/types";
import { executeApi } from "@/components/editor/version-6.0.0/ssr-helpers/api-response";
import {
  renderProgress,
  renderStatus,
  renderErrors,
  renderUrls,
  renderSizes,
} from "@/components/editor/version-6.0.0/ssr-helpers/custom-renderer";

/**
 * POST endpoint handler for checking rendering progress
 */
export const POST = executeApi(ProgressRequest, async (req, body) => {
  console.log("Checking progress for render:", body.id);

  // We ignore bucketName as it's only needed for AWS Lambda
  const { id } = body;
  const status = renderStatus.get(id);
  const progress = renderProgress.get(id) || 0;

  if (!status) {
    return {
      type: "error",
      message: `No render found with ID: ${id}`,
    };
  }

  if (status === "error") {
    return {
      type: "error",
      message: renderErrors.get(id) || "Unknown error occurred",
    };
  }

  if (status === "done") {
    return {
      type: "done",
      url: renderUrls.get(id) || "",
      size: renderSizes.get(id) || 0,
    };
  }

  return {
    type: "progress",
    progress,
  };
});
