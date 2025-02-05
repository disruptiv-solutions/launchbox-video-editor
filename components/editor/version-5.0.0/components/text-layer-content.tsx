import React from "react";
import { TextOverlay } from "../types";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMerriweather } from "@remotion/google-fonts/Merriweather";
import { loadFont as loadRobotoMono } from "@remotion/google-fonts/RobotoMono";
import { loadFont as loadVT323 } from "@remotion/google-fonts/VT323";

// Load the fonts
const { fontFamily: interFontFamily } = loadInter();
const { fontFamily: merriweatherFontFamily } = loadMerriweather();
const { fontFamily: robotoMonoFontFamily } = loadRobotoMono();
const { fontFamily: vt323FontFamily } = loadVT323();

interface TextLayerContentProps {
  overlay: TextOverlay;
}

// Updated getFontFamily function
const getFontFamily = (fontClass: string) => {
  switch (fontClass) {
    case "font-sans":
      return interFontFamily;
    case "font-serif":
      return merriweatherFontFamily;
    case "font-mono":
      return robotoMonoFontFamily;
    case "font-retro":
      return vt323FontFamily;
    default:
      return interFontFamily;
  }
};

export const TextLayerContent: React.FC<TextLayerContentProps> = ({
  overlay,
}) => {
  const dynamicFontSize = `${Math.min(
    overlay?.width / 2.5,
    overlay?.height / 1.5
  )}px`;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        ...overlay?.styles,
        fontSize: dynamicFontSize,
        fontFamily: getFontFamily(overlay.styles.fontFamily),
      }}
    >
      <div
        style={{
          width: "100%",
          textAlign: overlay.styles.textAlign,
          padding: "20px",
        }}
      >
        {overlay.content}
      </div>
    </div>
  );
};
