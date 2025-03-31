import React from "react";
import { StickerTemplate, StickerTemplateProps } from "../base-template";

interface DiscountStickerProps extends StickerTemplateProps {
  percentage?: number;
  backgroundColor?: string;
  textColor?: string;
  ribbonColor?: string;
}

const DiscountStickerComponent: React.FC<DiscountStickerProps> = ({
  overlay,
  percentage = 50,
  backgroundColor = "#FF4B4B",
  textColor = "#FFFFFF",
  ribbonColor = "#FF2E2E",
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "stickerEntrance 0.5s ease-out forwards",
      }}
    >
      {/* Main circle */}
      <div
        style={{
          width: "90%",
          height: "90%",
          borderRadius: "50%",
          backgroundColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        }}
      >
        {/* Ribbon */}
        <div
          style={{
            position: "absolute",
            width: "150%",
            height: "30px",
            backgroundColor: ribbonColor,
            transform: "rotate(-45deg)",
            top: "20%",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            animation: "ribbonFloat 2s ease-in-out infinite",
          }}
        />

        {/* Discount text */}
        <div
          style={{
            color: textColor,
            fontSize: `${overlay.height * 0.25}px`,
            fontWeight: "bold",
            textAlign: "center",
            lineHeight: 1.2,
            zIndex: 1,
            animation: "textPulse 2s ease-in-out infinite",
          }}
        >
          <div>{percentage}%</div>
          <div style={{ fontSize: "0.5em" }}>OFF</div>
        </div>

        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: `4px dashed ${textColor}`,
            opacity: 0.3,
            animation: "rotate 20s linear infinite",
          }}
        />
      </div>

      <style>
        {`
          @keyframes stickerEntrance {
            from {
              transform: scale(0) rotate(-180deg);
            }
            to {
              transform: scale(1) rotate(0);
            }
          }

          @keyframes ribbonFloat {
            0%, 100% { transform: rotate(-45deg) translateY(0); }
            50% { transform: rotate(-45deg) translateY(2px); }
          }

          @keyframes textPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }

          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          /* Scope hover effects to only the main sticker container */
          .discount-sticker:hover {
            transform: scale(1.05);
            transition: transform 0.2s ease;
          }

          .discount-sticker:active {
            transform: scale(0.95);
            transition: transform 0.2s ease;
          }
        `}
      </style>
    </div>
  );
};

export const discountSticker: StickerTemplate = {
  config: {
    id: "discount-circle",
    name: "Discount Circle",
    category: "Discounts",
    defaultProps: {
      percentage: 50,
      backgroundColor: "#FF4B4B",
      textColor: "#FFFFFF",
      ribbonColor: "#FF2E2E",
    },
    isPro: true,
  },
  Component: DiscountStickerComponent,
};
