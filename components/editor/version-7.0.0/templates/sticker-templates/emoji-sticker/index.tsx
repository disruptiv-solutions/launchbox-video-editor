import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickerTemplate, StickerTemplateProps } from "../base-template";

interface EmojiStickerProps extends StickerTemplateProps {
  emoji?: string;
}

const EmojiStickerComponent: React.FC<EmojiStickerProps> = ({
  overlay,
  isSelected,
  onUpdate,
  emoji = "😊",
}) => {
  const scale = overlay.styles.scale || 1;

  // Calculate size based on scale
  const baseSize = Math.min(overlay.width, overlay.height);
  const fontSize = baseSize * scale;

  const handleResize = React.useCallback(() => {
    if (onUpdate) {
      onUpdate({
        width: fontSize,
        height: fontSize,
      });
    }
  }, [fontSize, onUpdate]);

  // Update size when scale changes
  React.useEffect(() => {
    handleResize();
  }, [scale, handleResize]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          fontSize: `${fontSize}px`,
          cursor: "pointer",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          border: isSelected ? "2px solid #0088ff" : "none",
          borderRadius: "8px",
        }}
      >
        {emoji}
      </motion.div>
    </AnimatePresence>
  );
};

// Define different emoji templates with various categories
const createEmojiTemplate = (
  id: string,
  name: string,
  emoji: string
): StickerTemplate => ({
  config: {
    id: `emoji-${id}`,
    name: `${name}`,
    category: "Emojis",
    defaultProps: {
      emoji,
      styles: {
        scale: 1,
      },
    },
    // Add a thumbnail to help with preview
    thumbnail: emoji,
  },
  Component: EmojiStickerComponent,
});

// Create various emoji templates grouped by category
export const smileysEmojis = [
  createEmojiTemplate("grin", "Grinning Face", "😀"),
  createEmojiTemplate("joy", "Face with Tears of Joy", "😂"),
  createEmojiTemplate("heart-eyes", "Heart Eyes", "😍"),
  createEmojiTemplate("cool", "Cool Face", "😎"),
];

export const emotionsEmojis = [
  createEmojiTemplate("love", "Red Heart", "❤️"),
  createEmojiTemplate("fire", "Fire", "🔥"),
  createEmojiTemplate("hundred", "100 Points", "💯"),
  createEmojiTemplate("sparkles", "Sparkles", "✨"),
];

export const objectsEmojis = [
  createEmojiTemplate("star", "Star", "⭐"),
  createEmojiTemplate("gift", "Gift", "🎁"),
  createEmojiTemplate("balloon", "Balloon", "🎈"),
  createEmojiTemplate("party", "Party Popper", "🎉"),
];

// Export all emoji stickers
export const emojiStickers = [
  ...smileysEmojis,
  ...emotionsEmojis,
  ...objectsEmojis,
];
