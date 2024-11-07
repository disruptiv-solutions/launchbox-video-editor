import React from "react";
import { Download, Loader2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";

// Add this interface to track multiple renders
interface RenderItem {
  url?: string;
  timestamp: Date;
  id: string;
  status: "success" | "error";
  error?: string;
}

interface RenderControlsProps {
  state: {
    status: "idle" | "invoking" | "rendering" | "done" | "error";
    progress: number;
    url?: string;
  };
  handleRender: () => void;
}

const RenderControls: React.FC<RenderControlsProps> = ({
  state,
  handleRender,
}) => {
  // Store multiple renders
  const [renders, setRenders] = React.useState<RenderItem[]>([]);
  // Track if there are new renders
  const [hasNewRender, setHasNewRender] = React.useState(false);

  // Add new render to the list when completed
  React.useEffect(() => {
    if (state.status === "done" && state.url) {
      setRenders((prev) => [
        {
          url: state.url!,
          timestamp: new Date(),
          id: crypto.randomUUID(),
          status: "success",
        },
        ...prev,
      ]);
      setHasNewRender(true);
    } else if (state.status === "error") {
      setRenders((prev) => [
        {
          timestamp: new Date(),
          id: crypto.randomUUID(),
          status: "error",
          error: "Failed to render video. Please try again.",
        },
        ...prev,
      ]);
      setHasNewRender(true);
    }
  }, [state.status, state.url]);

  const handleDownload = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "rendered-video.mp4";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <Popover onOpenChange={() => setHasNewRender(false)}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            className="relative bg-gray-800 hover:bg-gray-700"
          >
            <Bell className="w-4 h-4" />
            {hasNewRender && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-gray-900 border-gray-800">
          <div className="space-y-2">
            <h4 className="font-medium text-zinc-100">Recent Renders</h4>
            {renders.length === 0 ? (
              <p className="text-sm text-zinc-400">No renders yet</p>
            ) : (
              renders.map((render) => (
                <div
                  key={render.id}
                  className={`flex items-center justify-between rounded-lg border p-2 ${
                    render.status === "error"
                      ? "border-red-800 bg-red-950/50"
                      : "border-gray-800"
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="text-sm text-zinc-200">
                      {render.status === "error" ? (
                        <span className="text-red-400 font-medium">
                          Render Failed
                        </span>
                      ) : (
                        new URL(render.url!).pathname.split("/").pop()
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(render.timestamp, {
                        addSuffix: true,
                      })}
                      {render.error && (
                        <div className="text-red-400 mt-1">{render.error}</div>
                      )}
                    </div>
                  </div>
                  {render.status === "success" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-zinc-200 hover:text-gray-800"
                      onClick={() => handleDownload(render.url!)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Button
        onClick={handleRender}
        disabled={state.status === "rendering" || state.status === "invoking"}
        className="bg-gray-800 hover:bg-gray-700"
      >
        {state.status === "rendering" ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Rendering... {(state.progress * 100).toFixed(0)}%
          </>
        ) : state.status === "invoking" ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Preparing...
          </>
        ) : (
          "Render Video"
        )}
      </Button>
    </>
  );
};

export default RenderControls;
