import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { StickerTemplate, StickerTemplateProps } from "../base-template";

interface FlashSaleProps extends StickerTemplateProps {
  duration?: string;
  backgroundColor?: string;
  accentColor?: string;
  textColor?: string;
}

const FlashSaleComponent: React.FC<FlashSaleProps> = ({
  overlay,
  duration = "24h",
  backgroundColor = "#FFD700",
  accentColor = "#FF4500",
  textColor = "#000000",
}) => {
  const frame = useCurrentFrame();

  // Calculate various animation values
  const scale = interpolate(frame % 60, [0, 30, 60], [0, 1, 0], {
    extrapolateRight: "clamp",
  });

  const backgroundProgress = (frame % 120) / 120;
  const background =
    backgroundProgress < 0.5
      ? backgroundColor
      : `linear-gradient(45deg, ${backgroundColor}, ${accentColor})`;

  const lightningScale = interpolate(frame % 60, [0, 30, 60], [1, 1.2, 1]);
  const lightningOpacity = interpolate(frame % 60, [0, 30, 60], [1, 0.8, 1]);

  const textScale = interpolate(frame % 90, [0, 45, 90], [1, 1.1, 1]);
  const textOpacity = interpolate(frame % 120, [0, 60, 120], [0.9, 1, 0.9]);

  const borderScale = interpolate(frame % 120, [0, 60, 120], [1, 1.02, 1]);
  const borderOpacity = interpolate(frame % 120, [0, 60, 120], [0.5, 0.8, 0.5]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transform: `scale(${scale})`,
      }}
    >
      {/* Background with lightning effect */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background,
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        }}
      />

      {/* Lightning bolt */}
      <svg
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          width: "40%",
          height: "40%",
          top: "10%",
          left: "30%",
          fill: accentColor,
          transform: `scale(${lightningScale})`,
          opacity: lightningOpacity,
        }}
      >
        <path d="M13 0L0 14h11l-2 10L24 10h-11l2-10z" />
      </svg>

      {/* Text content */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          textAlign: "center",
          color: textColor,
          fontWeight: "bold",
          width: "100%",
          padding: "0 10px",
        }}
      >
        <div
          style={{
            fontSize: `${overlay.height * 0.15}px`,
            marginBottom: "4px",
            transform: `scale(${textScale})`,
          }}
        >
          FLASH SALE
        </div>
        <div
          style={{
            fontSize: `${overlay.height * 0.12}px`,
            opacity: textOpacity,
          }}
        >
          Ends in {duration}
        </div>
      </div>

      {/* Animated border */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          border: `2px solid ${accentColor}`,
          borderRadius: "12px",
          opacity: borderOpacity,
          transform: `scale(${borderScale})`,
        }}
      />
    </div>
  );
};

export const flashSaleSticker: StickerTemplate = {
  config: {
    id: "flash-sale",
    name: "Flash Sale",
    category: "Discounts",
    defaultProps: {
      duration: "24h",
      backgroundColor: "#FFD700",
      accentColor: "#FF4500",
      textColor: "#000000",
      styles: {
        scale: 1,
      },
    },
    isPro: true,
  },
  Component: FlashSaleComponent,
};
