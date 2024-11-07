import React, { useMemo } from "react";
import { useEditorContext } from "../contexts/editor-context";
import { useTimelinePositioning } from "../hooks/use-timeline-positioning";
import { TextOverlay } from "../types";
import { MAX_ROWS } from "../constants";

const textOverlayOptions = [
  {
    name: "Simple Text",
    content: "Simple Text",
    styles: {
      fontSize: "1.25rem",
      fontWeight: "normal",
      color: "#E4E4E7",
      backgroundColor: "transparent",
      fontFamily: "font-sans",
      fontStyle: "normal",
      textDecoration: "none",
      lineHeight: "1.2",
      textAlign: "center",
    },
  },
  {
    name: "Bold Heading",
    content: "Bold Heading",
    styles: {
      fontSize: "1.875rem",
      fontWeight: "bold",
      color: "#F4F4F5",
      backgroundColor: "transparent",
      fontFamily: "font-sans",
      fontStyle: "normal",
      textDecoration: "none",
      lineHeight: "1.2",
      textAlign: "center",
    },
  },
  {
    name: "Colorful Subtitle",
    content: "Colorful Subtitle",
    styles: {
      fontSize: "1.5rem",
      fontWeight: "semibold",
      color: "#93C5FD",
      backgroundColor: "transparent",
      fontFamily: "font-sans",
      fontStyle: "normal",
      textDecoration: "none",
      lineHeight: "1.2",
      textAlign: "center",
    },
  },
  {
    name: "Highlighted Text",
    content: "Highlighted Text",
    styles: {
      fontSize: "1.8rem",
      fontWeight: "medium",
      color: "#F4F4F5",
      backgroundColor: "#1D4ED8",
      fontFamily: "font-sans",
      fontStyle: "normal",
      textDecoration: "none",
      lineHeight: "1.2",
      padding: "10px",
      textAlign: "center",
    },
  },
];

interface SelectTextOverlayProps {
  setLocalOverlay: (overlay: TextOverlay) => void;
}

export const SelectTextOverlay: React.FC<SelectTextOverlayProps> = () => {
  const { addOverlay, overlays, durationInFrames } = useEditorContext();
  const { findNextAvailablePosition } = useTimelinePositioning();

  const handleAddOverlay = (option: (typeof textOverlayOptions)[0]) => {
    const { from, row } = findNextAvailablePosition(
      overlays,
      MAX_ROWS,
      durationInFrames
    );

    const newOverlay: TextOverlay = {
      left: 100,
      top: 100,
      width: 300,
      height: 50,
      durationInFrames: 90,
      from,
      id: Date.now(),
      row,
      rotation: 0,
      isDragging: false,
      type: "text",
      content: option.content ?? "Testing",
      styles: {
        ...option.styles,
        fontSize: "3rem",
        opacity: 1,
        zIndex: 1,
        transform: "none",
        textAlign: option.styles.textAlign as "left" | "center" | "right",
      },
    };

    addOverlay(newOverlay);
  };

  return useMemo(
    () => (
      <div className="space-y-4">
        {textOverlayOptions.map((option, index) => (
          <div
            key={index}
            onClick={() => handleAddOverlay(option)}
            className="flex flex-col items-center justify-center bg-gray-800 p-4 rounded-sm hover:bg-gray-700 hover:cursor-pointer border border-white/5"
          >
            <button
              className={`w-full p-2 rounded ${option.styles.fontFamily}`}
              style={{
                ...option.styles,
                fontFamily: undefined,
                textAlign: option.styles.textAlign as
                  | "left"
                  | "center"
                  | "right",
              }}
            >
              {option.name}
            </button>
          </div>
        ))}
      </div>
    ),
    []
  );
};
