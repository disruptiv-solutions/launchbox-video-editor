import { memo, useMemo } from "react";
import { WaveformData } from "../types";

interface WaveformVisualizerProps {
  waveformData: WaveformData;
  totalDuration: number;
  durationInFrames: number;
}

const WaveformVisualizer = memo(
  ({
    waveformData,
    totalDuration,
    durationInFrames,
  }: WaveformVisualizerProps) => {
    const itemWidth = (durationInFrames / totalDuration) * 100;
    const peaksToShow = Math.min(
      waveformData.peaks.length,
      Math.max(20, Math.floor(itemWidth * 2))
    );

    const sampledPeaks = useMemo(
      () =>
        waveformData.peaks.filter(
          (_, index) =>
            index % Math.ceil(waveformData.peaks.length / peaksToShow) === 0
        ),
      [waveformData.peaks, peaksToShow]
    );

    return (
      <div className="absolute inset-0 flex items-center justify-between px-2">
        {sampledPeaks.map((peak, index) => {
          const height = Math.max(Math.pow(peak, 0.7) * 90, 4);
          return (
            <div
              key={index}
              className="relative flex-1 mx-[0.5px]"
              style={{ height: "100%" }}
            >
              <div
                className="absolute bottom-1/2 w-full bg-yellow-200 rounded-sm transform origin-center"
                style={{
                  height: `${height}%`,
                  transform: `translateY(50%)`,
                }}
              />
            </div>
          );
        })}
      </div>
    );
  }
);

WaveformVisualizer.displayName = "WaveformVisualizer";

export default WaveformVisualizer;
