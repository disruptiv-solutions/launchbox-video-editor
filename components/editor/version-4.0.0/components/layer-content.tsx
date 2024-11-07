import React from "react";
import { Overlay } from "../types";
import { TextLayerContent } from "./text-layer-content";
import { Video, Audio, spring, useCurrentFrame } from "remotion";

interface LayerContentProps {
  overlay: Overlay;
}

export const LayerContent: React.FC<LayerContentProps> = ({ overlay }) => {
  const frame = useCurrentFrame();

  // TODO: Make animation parameters configurable through overlay properties
  const fadeIn = spring({
    frame,
    from: 0,
    to: 1,
    fps: 30,
    config: {
      damping: 200,
    },
  });

  const commonStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
  };

  switch (overlay.type) {
    case "text":
      return (
        <div style={{ ...commonStyle, opacity: fadeIn }}>
          <TextLayerContent overlay={overlay} />
        </div>
      );
    case "image":
      return (
        <img
          src={overlay.content}
          alt="Layer content"
          style={{ ...commonStyle, objectFit: "contain" }}
        />
      );
    case "clip":
      return (
        <div style={{ ...commonStyle, opacity: fadeIn }}>
          <Video
            src={overlay.src}
            startFrom={overlay.videoStartTime || 0}
            style={{ ...commonStyle, objectFit: overlay.styles.objectFit }}
          />
        </div>
      );
    case "shape":
      return (
        <div
          style={{
            ...commonStyle,
            backgroundColor: overlay.content,
          }}
        />
      );
    case "sound":
      return (
        <Audio src={overlay.src} startFrom={overlay.startFromSound || 0} />
      );
    default:
      return null;
  }
};
