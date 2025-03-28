import React from "react";
import { motion } from "framer-motion";
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
    <motion.div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Main circle */}
      <motion.div
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
        <motion.div
          style={{
            position: "absolute",
            width: "150%",
            height: "30px",
            backgroundColor: ribbonColor,
            transform: "rotate(-45deg)",
            top: "20%",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
          animate={{
            y: [0, 2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Discount text */}
        <motion.div
          style={{
            color: textColor,
            fontSize: `${overlay.height * 0.25}px`,
            fontWeight: "bold",
            textAlign: "center",
            lineHeight: 1.2,
            zIndex: 1,
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div>{percentage}%</div>
          <div style={{ fontSize: "0.5em" }}>OFF</div>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: `4px dashed ${textColor}`,
            opacity: 0.3,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export const discountSticker: StickerTemplate = {
  config: {
    id: "discount-circle",
    name: "Discount Circle",
    category: "Discounts",
    thumbnail: "/thumbnails/discount-circle.png", // You'll need to create this
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
