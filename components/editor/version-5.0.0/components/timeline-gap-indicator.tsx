interface GapIndicatorProps {
  gap: { start: number; end: number };
  rowIndex: number;
  totalDuration: number;
  onRemoveGap?: (rowIndex: number, gapStart: number, gapEnd: number) => void;
}

export default function GapIndicator({
  gap,
  rowIndex,
  totalDuration,
  onRemoveGap,
}: GapIndicatorProps) {
  return (
    <div
      className="absolute inset-y-0 cursor-pointer group"
      style={{
        left: `${(gap.start / totalDuration) * 100}%`,
        width: `${((gap.end - gap.start) / totalDuration) * 100}%`,
      }}
      onClick={() => onRemoveGap?.(rowIndex, gap.start, gap.end)}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-200"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            rgba(255, 255, 255, 0.02),
            rgba(255, 255, 255, 0.02) 8px,
            rgba(255, 255, 255, 0.05) 8px,
            rgba(255, 255, 255, 0.05) 16px
          )`,
        }}
      />
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute inset-0 flex items-center justify-center">
        <div className="bg-black/70 rounded-full p-1.5 backdrop-blur-sm">
          <CloseIcon />
        </div>
      </div>
    </div>
  );
}

const CloseIcon = () => (
  <svg
    className="w-3 h-3 text-white/90"
    fill="none"
    strokeWidth="2"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
