import { StickerCategory } from "../types";

export type StickerTemplate = {
  id: string;
  name: string;
  category: StickerCategory;
  content: string; // SVG content or emoji unicode
  preview?: string;
  defaultStyles?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    scale?: number;
  };
  isPro?: boolean;
};

// Basic shape stickers
const shapeStickers: StickerTemplate[] = [
  {
    id: "circle",
    name: "Circle",
    category: "Shapes",
    content: `<svg viewBox="0 0 100 100">
      <defs>
        <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B6B" />
          <stop offset="100%" style="stop-color:#FF8787" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" filter="url(#softShadow)" />
    </svg>`,
    defaultStyles: {
      fill: "url(#circleGradient)",
      stroke: "rgba(255, 255, 255, 0.4)",
      strokeWidth: 2,
    },
  },
  {
    id: "star",
    name: "Star",
    category: "Shapes",
    content: `<svg viewBox="0 0 100 100">
      <defs>
        <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFD93D" />
          <stop offset="100%" style="stop-color:#FF9F1C" />
        </linearGradient>
        <filter id="softShadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="1" dy="1" result="offsetblur" />
          <feFlood flood-color="rgba(0,0,0,0.2)" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d="M50 5 L61.5 35.5 L94 35.5 L67.5 54.5 L78.5 84.5 L50 66 L21.5 84.5 L32.5 54.5 L6 35.5 L38.5 35.5 Z" filter="url(#softShadow)" />
    </svg>`,
    defaultStyles: {
      fill: "url(#starGradient)",
      stroke: "rgba(255, 255, 255, 0.4)",
      strokeWidth: 2,
    },
  },
  {
    id: "hexagon",
    name: "Hexagon",
    category: "Shapes",
    content: `<svg viewBox="0 0 100 100">
      <defs>
        <linearGradient id="hexagonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4158D0" />
          <stop offset="50%" style="stop-color:#C850C0" />
          <stop offset="100%" style="stop-color:#FFCC70" />
        </linearGradient>
      </defs>
      <path d="M50 5 L85 27.5 L85 72.5 L50 95 L15 72.5 L15 27.5 Z" filter="url(#softShadow)" />
    </svg>`,
    defaultStyles: {
      fill: "url(#hexagonGradient)",
      stroke: "rgba(255, 255, 255, 0.4)",
      strokeWidth: 2,
    },
  },
  {
    id: "heart",
    name: "Heart",
    category: "Shapes",
    content: `<svg viewBox="0 0 100 100">
      <defs>
        <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B6B" />
          <stop offset="50%" style="stop-color:#FF4B8B" />
          <stop offset="100%" style="stop-color:#FF3366" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path d="M50 85 C50 85 15 60 15 35 C15 10 45 10 50 25 C55 10 85 10 85 35 C85 60 50 85 50 85 Z" 
        filter="url(#softShadow)" />
    </svg>`,
    defaultStyles: {
      fill: "url(#heartGradient)",
      stroke: "rgba(255, 255, 255, 0.4)",
      strokeWidth: 2,
    },
  },
];

// Discount stickers
const discountStickers: StickerTemplate[] = [
  {
    id: "sale-50",
    name: "50% Off",
    category: "Discounts",
    content: `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="#FF0000" />
      <text x="50" y="50" text-anchor="middle" dy=".3em" fill="white" font-size="24">50% OFF</text>
    </svg>`,
    isPro: true,
  },
];

// Emoji stickers
const emojiStickers: StickerTemplate[] = [
  {
    id: "thumbs-up",
    name: "Thumbs Up",
    category: "Emojis",
    content: "👍",
    defaultStyles: {
      scale: 1,
    },
  },
  {
    id: "heart",
    name: "Heart",
    category: "Emojis",
    content: "❤️",
    defaultStyles: {
      scale: 1,
    },
  },
];

export const stickerTemplates: Record<StickerCategory, StickerTemplate[]> = {
  Shapes: shapeStickers,
  Discounts: discountStickers,
  Emojis: emojiStickers,
};
