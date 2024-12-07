import { useState, useEffect } from "react";

interface WaveformData {
  peaks: number[];
  length: number;
}

interface WaveformOptions {
  numPoints?: number;
  fps?: number;
}

export function useWaveformProcessor(
  src: string | undefined,
  startFromSound: number = 0,
  durationInFrames: number,
  options: WaveformOptions = {}
) {
  const [waveformData, setWaveformData] = useState<WaveformData | null>(null);
  const { numPoints = 200, fps = 30 } = options;

  useEffect(() => {
    if (!src) return;

    let isActive = true;

    const processAudio = async () => {
      try {
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        if (!isActive) return;

        const sampleRate = audioBuffer.sampleRate;
        const channelData = audioBuffer.getChannelData(0);
        const startTime = startFromSound / fps;
        const duration = durationInFrames / fps;

        const startSample = Math.floor(startTime * sampleRate);
        const samplesForDuration = Math.floor(duration * sampleRate);
        const samplesPerPeak = Math.floor(samplesForDuration / numPoints);

        const peaks = Array.from({ length: numPoints }, (_, i) => {
          const start = startSample + i * samplesPerPeak;
          const end = Math.min(start + samplesPerPeak, channelData.length);

          let peakMax = 0;
          let sumSquares = 0;
          let validSamples = 0;

          for (let j = start; j < end; j++) {
            if (j >= channelData.length) break;
            const value = Math.abs(channelData[j]);
            peakMax = Math.max(peakMax, value);
            sumSquares += value * value;
            validSamples++;
          }

          if (validSamples === 0) return 0;
          const rms = Math.sqrt(sumSquares / validSamples);
          return (peakMax + rms) / 2;
        });

        // Normalize using 95th percentile
        const sortedPeaks = [...peaks].sort((a, b) => a - b);
        const normalizeValue = sortedPeaks[Math.floor(peaks.length * 0.95)];
        const normalizedPeaks = peaks.map((peak) =>
          Math.min(peak / normalizeValue, 1)
        );

        setWaveformData({
          peaks: normalizedPeaks,
          length: samplesForDuration,
        });
      } catch (error) {
        console.error("Error processing audio waveform:", error);
      }
    };

    processAudio();
    return () => {
      isActive = false;
    };
  }, [src, startFromSound, durationInFrames, fps, numPoints]);

  return waveformData;
}
