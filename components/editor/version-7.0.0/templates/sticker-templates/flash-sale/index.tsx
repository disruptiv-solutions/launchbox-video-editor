import React from "react";
import { motion } from "framer-motion";
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
  return (
    <motion.div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    >
      {/* Background with lightning effect */}
      <motion.div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor,
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        }}
        animate={{
          background: [
            backgroundColor,
            `linear-gradient(45deg, ${backgroundColor}, ${accentColor})`,
            backgroundColor,
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Lightning bolt */}
      <motion.svg
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          width: "40%",
          height: "40%",
          top: "10%",
          left: "30%",
          fill: accentColor,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <path d="M13 0L0 14h11l-2 10L24 10h-11l2-10z" />
      </motion.svg>

      {/* Text content */}
      <motion.div
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
        <motion.div
          style={{
            fontSize: `${overlay.height * 0.15}px`,
            marginBottom: "4px",
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          FLASH SALE
        </motion.div>
        <motion.div
          style={{
            fontSize: `${overlay.height * 0.12}px`,
            opacity: 0.9,
          }}
          animate={{
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          Ends in {duration}
        </motion.div>
      </motion.div>

      {/* Animated border */}
      <motion.div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          border: `2px solid ${accentColor}`,
          borderRadius: "12px",
          opacity: 0.5,
        }}
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </motion.div>
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
