import React from "react";
import { StickerOverlay } from "../../types";
import { templateMap } from "./loader";

interface StickerRendererProps {
  overlay: StickerOverlay;
  isSelected: boolean;
  onUpdate?: (updates: Partial<StickerOverlay>) => void;
}

export const StickerRenderer: React.FC<StickerRendererProps> = ({
  overlay,
  isSelected,
  onUpdate,
}) => {
  const template = templateMap[overlay.content];

  if (!template) {
    console.warn(`No sticker template found for id: ${overlay.content}`);
    return null;
  }

  const { Component } = template;
  const props = {
    ...template.config.defaultProps,
    overlay,
    isSelected,
    onUpdate,
  };

  return <Component {...props} />;
};
