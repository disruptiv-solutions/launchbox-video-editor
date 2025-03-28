import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorContext } from "../../../contexts/editor-context";
import { stickerTemplates } from "../../../templates/sticker-templates";
import { Overlay, OverlayType, StickerCategory } from "../../../types";

export function StickersPanel() {
  const { addOverlay } = useEditorContext();

  const handleStickerClick = (
    category: StickerCategory,
    templateId: string
  ) => {
    const template = stickerTemplates[category].find(
      (t) => t.id === templateId
    );
    if (!template) return;

    const newOverlay: Overlay = {
      id: Date.now(),
      type: OverlayType.STICKER,
      content: template.content,
      category: template.category,
      durationInFrames: 50,
      from: 0,
      height: 100,
      width: 100,
      left: 0,
      top: 0,
      row: 0,
      isDragging: false,
      rotation: 0,
      styles: {
        ...template.defaultStyles,
        opacity: 1,
        zIndex: 1,
      },
    };

    addOverlay(newOverlay);
  };

  return (
    <div className="flex flex-col gap-4 pl-4 pr-4 pt-2 bg-white dark:bg-gray-900/50 h-full">
      <Tabs defaultValue="Shapes" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-sm border border-gray-200 dark:border-gray-700 gap-1">
          {Object.keys(stickerTemplates).map((category) => (
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

        {Object.entries(stickerTemplates).map(([category, templates]) => (
          <TabsContent key={category} value={category} className="mt-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="grid grid-cols-2 gap-2 mt-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() =>
                      handleStickerClick(
                        category as StickerCategory,
                        template.id
                      )
                    }
                    className={`
                      flex flex-col items-center justify-center p-4 rounded-lg
                      border border-gray-200 dark:border-gray-800
                      hover:bg-gray-100 dark:hover:bg-gray-800
                      transition-colors
                      ${template.isPro ? "relative" : ""}
                    `}
                  >
                    <div className="w-12 h-12 flex items-center justify-center">
                      {template.content.startsWith("<svg") ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: template.content }}
                          className="w-full h-full"
                          style={{
                            fill: template.defaultStyles?.fill,
                            stroke: template.defaultStyles?.stroke,
                            strokeWidth: template.defaultStyles?.strokeWidth,
                          }}
                        />
                      ) : (
                        <span className="text-3xl">{template.content}</span>
                      )}
                    </div>
                    <span className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      {template.name}
                    </span>
                    {template.isPro && (
                      <div className="absolute top-1 right-1 bg-yellow-500 text-black text-[10px] px-1 rounded">
                        PRO
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
