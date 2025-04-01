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
        flex flex-col items-center justify-center p-4 rounded-lg
        border border-gray-200 dark:border-gray-800
        hover:bg-gray-100 dark:hover:bg-gray-800
        transition-colors
        ${template.config.isPro ? "relative" : ""}
      `}
      >
        <div className="w-20 h-20 flex items-center justify-center">
          <Player
            ref={playerRef}
            component={() => (
              <Sequence from={0} durationInFrames={50}>
                <MemoizedComponent {...previewProps} />
              </Sequence>
            )}
            durationInFrames={50}
            compositionWidth={80}
            compositionHeight={80}
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
        <span className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          {template.config.name}
        </span>
      </button>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.template.config.id === nextProps.template.config.id;
  }
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
    <div className="flex flex-col gap-4 pl-4 pr-4 pt-2 bg-white dark:bg-gray-900/50 h-full">
      <Tabs defaultValue={stickerCategories[0]} className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-sm border border-gray-200 dark:border-gray-700 gap-1">
          {stickerCategories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white 
              rounded-sm transition-all duration-200 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
            >
              <span className="flex items-center gap-2 text-xs">
                {category}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {stickerCategories.map((category) => (
          <TabsContent key={category} value={category} className="mt-0">
            <ScrollArea className="h-[calc(100vh-100px)]">
              <div className="grid grid-cols-2 gap-2 mt-2">
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
