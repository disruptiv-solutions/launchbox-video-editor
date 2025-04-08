"use client";

import * as React from "react";
import {
  Film,
  Music,
  Type,
  Subtitles,
  ImageIcon,
  FolderOpen,
  Sticker,
  Layout,
  Plus,
} from "lucide-react";
import { useSidebar } from "../../contexts/sidebar-context";
import { OverlayType } from "../../types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState, useRef } from "react";

/**
 * MobileNavBar Component
 *
 * A compact mobile-only navigation bar that displays overlay type icons
 * with a horizontal scrollable interface. Designed to match the TimelineControls
 * visual style while remaining compact for mobile screens.
 */
export function MobileNavBar() {
  const { activePanel, setActivePanel, setIsOpen } = useSidebar();
  const [clickedItemId, setClickedItemId] = useState<string | null>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  // Check if scrolling is needed
  useEffect(() => {
    const checkScrollWidth = () => {
      if (scrollableRef.current) {
        const { scrollWidth, clientWidth } = scrollableRef.current;
        setShowScrollIndicator(scrollWidth > clientWidth);
      }
    };

    checkScrollWidth();
    window.addEventListener("resize", checkScrollWidth);
    return () => window.removeEventListener("resize", checkScrollWidth);
  }, []);

  // Scroll active item into view when it changes
  useEffect(() => {
    if (activePanel && scrollableRef.current) {
      const activeItem = scrollableRef.current.querySelector(
        `[data-panel="${activePanel}"]`
      ) as HTMLElement;

      if (activeItem) {
        // Calculate the scroll position to center the active item
        const containerWidth = scrollableRef.current.offsetWidth;
        const itemLeft = activeItem.offsetLeft;
        const itemWidth = activeItem.offsetWidth;
        const scrollLeft = itemLeft - containerWidth / 2 + itemWidth / 2;

        scrollableRef.current.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    }
  }, [activePanel]);

  // Use shorter names on mobile
  const getPanelTitle = (type: OverlayType): string => {
    switch (type) {
      case OverlayType.VIDEO:
        return "Video";
      case OverlayType.TEXT:
        return "Text";
      case OverlayType.SOUND:
        return "Audio";
      case OverlayType.CAPTION:
        return "Caption";
      case OverlayType.IMAGE:
        return "Image";
      case OverlayType.LOCAL_DIR:
        return "Media";
      case OverlayType.STICKER:
        return "Sticker";
      case OverlayType.TEMPLATE:
        return "Template";
      default:
        return "Unknown";
    }
  };

  const navigationItems = [
    {
      title: getPanelTitle(OverlayType.VIDEO),
      url: "#",
      icon: Film,
      panel: OverlayType.VIDEO,
      type: OverlayType.VIDEO,
    },
    {
      title: getPanelTitle(OverlayType.TEXT),
      url: "#",
      icon: Type,
      panel: OverlayType.TEXT,
      type: OverlayType.TEXT,
    },
    {
      title: getPanelTitle(OverlayType.SOUND),
      url: "#",
      icon: Music,
      panel: OverlayType.SOUND,
      type: OverlayType.SOUND,
    },
    {
      title: getPanelTitle(OverlayType.CAPTION),
      url: "#",
      icon: Subtitles,
      panel: OverlayType.CAPTION,
      type: OverlayType.CAPTION,
    },
    {
      title: getPanelTitle(OverlayType.IMAGE),
      url: "#",
      icon: ImageIcon,
      panel: OverlayType.IMAGE,
      type: OverlayType.IMAGE,
    },
    {
      title: getPanelTitle(OverlayType.STICKER),
      url: "#",
      icon: Sticker,
      panel: OverlayType.STICKER,
      type: OverlayType.STICKER,
    },
    {
      title: getPanelTitle(OverlayType.LOCAL_DIR),
      url: "#",
      icon: FolderOpen,
      panel: OverlayType.LOCAL_DIR,
      type: OverlayType.LOCAL_DIR,
    },
    {
      title: getPanelTitle(OverlayType.TEMPLATE),
      url: "#",
      icon: Layout,
      panel: OverlayType.TEMPLATE,
      type: OverlayType.TEMPLATE,
    },
  ];

  const handleItemClick = (item: any) => {
    // Set the clicked item ID for animation
    setClickedItemId(item.title);

    // Clear the animation after it completes
    setTimeout(() => setClickedItemId(null), 300);

    // Set the active panel and open the sidebar
    setActivePanel(item.panel);
    setIsOpen(true);
  };

  return (
    <div className="md:hidden flex border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/30 backdrop-blur-sm px-2 py-1">
      <div className="relative flex-1 flex">
        {/* Left fade gradient to indicate scrollable content */}
        {showScrollIndicator && (
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white/90 to-transparent dark:from-gray-900/90 z-10 pointer-events-none" />
        )}

        <div
          ref={scrollableRef}
          className="flex-1 flex items-center overflow-x-auto scrollbar-hide px-1 py-0.5 gap-1 relative"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {navigationItems.map((item) => (
            <TooltipProvider key={item.title} delayDuration={50}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    data-panel={item.panel}
                    onClick={() => handleItemClick(item)}
                    className={`h-5 min-w-5 px-1.5 rounded flex items-center justify-center gap-1
                      ${
                        clickedItemId === item.title
                          ? "scale-95 opacity-80"
                          : ""
                      }
                      ${
                        activePanel === item.panel
                          ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white shadow-sm"
                          : "text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      } transition-all`}
                  >
                    <item.icon className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  sideOffset={5}
                  className="bg-white dark:bg-gray-900 text-xs px-2 py-1 rounded-md z-[9999] border border-gray-200 dark:border-gray-700"
                >
                  {item.title}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}

          {/* "More" indicator button for discoverability */}
          {showScrollIndicator && (
            <button
              onClick={() => {
                if (scrollableRef.current) {
                  scrollableRef.current.scrollBy({
                    left: 100,
                    behavior: "smooth",
                  });
                }
              }}
              className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400"
            >
              <Plus className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Right fade gradient to indicate scrollable content */}
        {showScrollIndicator && (
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white/90 to-transparent dark:from-gray-900/90 z-10 pointer-events-none" />
        )}
      </div>
    </div>
  );
}
