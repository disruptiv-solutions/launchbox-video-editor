import React from "react";
import { TextOverlay } from "../types";

interface TextLayerContentProps {
  overlay: TextOverlay;
}

// Function to convert font class to CSS font family
const getFontFamily = (fontClass: string) => {
  switch (fontClass) {
    case "font-sans":
      return "'Inter', sans-serif";
    case "font-serif":
      return "'Merriweather', serif";
    case "font-mono":
      return "'Roboto Mono', monospace";
    case "font-retro":
      return "'VT323', monospace";
    default:
      return "sans-serif";
  }
};

export const TextLayerContent: React.FC<TextLayerContentProps> = ({
  overlay,
}) => {
  const dynamicFontSize = `${Math.min(
    overlay?.width / 10,
    overlay?.height / 1.2
  )}px`;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        ...overlay?.styles,
        fontSize: dynamicFontSize,
        fontFamily: getFontFamily(overlay.styles.fontFamily),
      }}
    >
      <div style={{ width: "100%", textAlign: overlay.styles.textAlign }}>
        {overlay.content}
      </div>
    </div>
  );
};
