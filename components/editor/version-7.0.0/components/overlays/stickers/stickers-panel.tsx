import React, { useRef, memo, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorContext } from "../../../contexts/editor-context";
import { Overlay, OverlayType, StickerCategory } from "../../../types";
import {
  templatesByCategory,
  getStickerCategories,
} from "../../../templates/sticker-templates/sticker-helpers";
import { useTimelinePositioning } from "../../../hooks/use-timeline-positioning";
import { useTimeline } from "../../../contexts/timeline-context";
import { Player } from "@remotion/player";
import { Sequence } from "remotion";

// Wrapper component for sticker preview with Remotion Player
const StickerPreview = memo(
  ({ template, onClick }: { template: any; onClick: () => void }) => {
    const playerRef = useRef<any>(null);
    const { Component } = template;

    const previewProps = {
      overlay: {
        id: -1,
        type: OverlayType.STICKER,
        content: template.config.id,
        category: template.config.category as StickerCategory,
        durationInFrames: 200,
        from: 0,
        height: 80,
        width: 80,
        left: 0,
        top: 0,
        row: 0,
        isDragging: false,
        rotation: 0,
        styles: {
          opacity: 1,
          ...template.config.defaultProps?.styles,
        },
      },
      isSelected: false,
      ...template.config.defaultProps,
    };

    const MemoizedComponent = memo(Component);

    return (
      <button
        onClick={onClick}
        className={`
          group relative flex flex-col items-center justify-center p-3
          rounded-xl border border-gray-200/50 dark:border-gray-800/50
          hover:border-blue-500/20 dark:hover:border-blue-500/20
          hover:bg-blue-50/50 dark:hover:bg-blue-900/10
          transition-all duration-200
          ${template.config.isPro ? "relative" : ""}
        `}
      >
        <div className="relative w-28 h-28 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800/50">
          <div className="absolute inset-0 flex items-center justify-center">
            <Player
              ref={playerRef}
              component={() => (
                <Sequence from={0} durationInFrames={50}>
                  <MemoizedComponent {...previewProps} />
                </Sequence>
              )}
              durationInFrames={50}
              compositionWidth={120}
              compositionHeight={120}
              fps={30}
              loop
              autoPlay={true}
              controls={false}
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        </div>
        {/* <span className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
          {template.config.name}
        </span> */}
      </button>
    );
  },
  (prevProps, nextProps) =>
    prevProps.template.config.id === nextProps.template.config.id
);

StickerPreview.displayName = "StickerPreview";

export function StickersPanel() {
  const { addOverlay, overlays, durationInFrames } = useEditorContext();
  const { findNextAvailablePosition } = useTimelinePositioning();
  const { visibleRows } = useTimeline();
  const stickerCategories = getStickerCategories();

  const handleStickerClick = useCallback(
    (templateId: string) => {
      const template = Object.values(templatesByCategory)
        .flat()
        .find((t) => t.config.id === templateId);

      if (!template) return;

      const { from, row } = findNextAvailablePosition(
        overlays,
        visibleRows,
        durationInFrames
      );

      const newOverlay: Overlay = {
        id: Date.now(),
        type: OverlayType.STICKER,
        content: template.config.id,
        category: template.config.category as StickerCategory,
        durationInFrames: 50,
        from,
        height: 150,
        width: 150,
        left: 0,
        top: 0,
        row,
        isDragging: false,
        rotation: 0,
        styles: {
          opacity: 1,
          zIndex: 1,
          ...template.config.defaultProps?.styles,
        },
      };

      addOverlay(newOverlay);
    },
    [
      addOverlay,
      overlays,
      visibleRows,
      durationInFrames,
      findNextAvailablePosition,
    ]
  );

  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-900/50 h-full">
      <Tabs defaultValue={stickerCategories[0]} className="w-full">
        <TabsList className="w-full flex space-x-1 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-1">
          {stickerCategories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="flex-1 px-3 py-1.5 text-sm font-medium
                data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800
                data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400
                data-[state=active]:shadow-sm
                rounded-md transition-all duration-200
                text-gray-600 dark:text-gray-400"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {stickerCategories.map((category) => (
          <TabsContent key={category} value={category} className="mt-4">
            <ScrollArea className="h-[calc(100vh-140px)]">
              <div className="grid grid-cols-2 gap-3">
                {templatesByCategory[category]?.map((template) => (
                  <StickerPreview
                    key={template.config.id}
                    template={template}
                    onClick={() => handleStickerClick(template.config.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
