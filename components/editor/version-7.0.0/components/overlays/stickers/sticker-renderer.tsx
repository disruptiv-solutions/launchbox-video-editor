import React from "react";
import { StickerOverlay } from "../../../types";

interface StickerRendererProps {
  overlay: StickerOverlay;
  isSelected?: boolean;
}

export function StickerRenderer({ overlay, isSelected }: StickerRendererProps) {
  const { content, styles } = overlay;

  // Common styles for the container
  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: styles.opacity,
    transform: styles.transform,
    zIndex: styles.zIndex,
    position: "relative",
  };

  // For SVG content
  if (content.startsWith("<svg")) {
    return (
      <div
        style={containerStyle}
        className={isSelected ? "outline outline-2 outline-blue-500" : ""}
      >
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          style={{
            width: "100%",
            height: "100%",
            fill: styles.fill,
            stroke: styles.stroke,
            strokeWidth: styles.strokeWidth,
            filter: styles.filter,
            transform: `scale(${styles.scale || 1})`,
          }}
        />
      </div>
    );
  }

  // For emoji content
  return (
    <div
      style={containerStyle}
      className={isSelected ? "outline outline-2 outline-blue-500" : ""}
    >
      <span
        style={{
          fontSize: "4em",
          lineHeight: 1,
          transform: `scale(${styles.scale || 1})`,
          filter: styles.filter,
        }}
      >
        {content}
      </span>
    </div>
  );
}
