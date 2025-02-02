import React, { createContext, useContext, useRef, useMemo } from "react";
import { useTimelineZoom } from "../hooks/use-timeline-zoom";
import { useVisibleRows } from "../hooks/use-visible-rows";

interface TimelineContextType {
  visibleRows: number;
  setVisibleRows: (rows: number) => void;
  addRow: () => void;
  removeRow: () => void;
  timelineRef: React.RefObject<HTMLDivElement>;
  zoomScale: number;
  setZoomScale: (scale: number) => void;
  scrollPosition: number;
  setScrollPosition: (position: number) => void;
  handleZoom: (delta: number, clientX: number) => void;
  handleWheelZoom: (event: WheelEvent) => void;
}

export const TimelineContext = createContext<TimelineContextType | null>(null);

export const TimelineProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { visibleRows, setVisibleRows, addRow, removeRow } = useVisibleRows();

  const timelineRef = useRef<HTMLDivElement>(null);

  const {
    zoomScale,
    scrollPosition,
    setZoomScale,
    setScrollPosition,
    handleZoom,
    handleWheelZoom,
  } = useTimelineZoom(timelineRef);

  const value = useMemo(
    () => ({
      visibleRows,
      setVisibleRows,
      addRow,
      removeRow,
      timelineRef,
      zoomScale,
      setZoomScale,
      scrollPosition,
      setScrollPosition,
      handleZoom,
      handleWheelZoom,
    }),
    [
      visibleRows,
      timelineRef,
      zoomScale,
      setZoomScale,
      scrollPosition,
      setScrollPosition,
      handleZoom,
      handleWheelZoom,
    ]
  );

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error("useTimeline must be used within a TimelineProvider");
  }
  return context;
};
