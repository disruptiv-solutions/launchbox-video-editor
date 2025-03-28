import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickerTemplate, StickerTemplateProps } from "../base-template";

interface SocialProofProps extends StickerTemplateProps {
  type?: "viewers" | "purchases";
  baseCount?: number;
  fluctuationRange?: number;
  updateInterval?: number;
  backgroundColor?: string;
  textColor?: string;
}

const SocialProofComponent: React.FC<SocialProofProps> = ({
  overlay,
  type = "viewers",
  baseCount = 100,
  fluctuationRange = 20,
  updateInterval = 3000,
  backgroundColor = "rgba(0, 0, 0, 0.8)",
  textColor = "#FFFFFF",
}) => {
  const [count, setCount] = useState(baseCount);
  const [trend, setTrend] = useState<"up" | "down">("up");

  // Simulate live count updates
  useEffect(() => {
    const interval = setInterval(() => {
      const fluctuation = Math.floor(Math.random() * fluctuationRange);
      const shouldIncrease = Math.random() > 0.4; // 60% chance to increase

      setCount((prev) => {
        const newCount = shouldIncrease
          ? prev + fluctuation
          : prev - fluctuation;
        setTrend(shouldIncrease ? "up" : "down");
        return Math.max(0, newCount);
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [fluctuationRange, updateInterval]);

  return (
    <motion.div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: "12px",
        backgroundColor,
        borderRadius: "8px",
        color: textColor,
        overflow: "hidden",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background pulse effect */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        }}
        animate={{
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Icon */}
      <motion.div
        style={{
          fontSize: `${overlay.height * 0.4}px`,
          marginRight: "8px",
          opacity: 0.9,
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        {type === "viewers" ? "👀" : "🛍️"}
      </motion.div>

      {/* Count and label */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: `${overlay.height * 0.25}px`,
            fontWeight: "bold",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={count}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {count}
            </motion.span>
          </AnimatePresence>

          {/* Trend indicator */}
          <motion.span
            style={{
              marginLeft: "4px",
              color: trend === "up" ? "#4CAF50" : "#F44336",
              fontSize: `${overlay.height * 0.2}px`,
            }}
            animate={{
              y: trend === "up" ? [-2, 0, -2] : [2, 0, 2],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            {trend === "up" ? "↑" : "↓"}
          </motion.span>
        </div>

        <motion.div
          style={{
            fontSize: `${overlay.height * 0.18}px`,
            opacity: 0.8,
          }}
        >
          {type === "viewers" ? "watching now" : "recent purchases"}
        </motion.div>
      </div>
    </motion.div>
  );
};

export const socialProofSticker: StickerTemplate = {
  config: {
    id: "social-proof",
    name: "Live Activity",
    category: "Social",
    defaultProps: {
      type: "viewers",
      baseCount: 100,
      fluctuationRange: 20,
      updateInterval: 3000,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      textColor: "#FFFFFF",
      styles: {
        scale: 1,
      },
    },
    isPro: true,
  },
  Component: SocialProofComponent,
};
