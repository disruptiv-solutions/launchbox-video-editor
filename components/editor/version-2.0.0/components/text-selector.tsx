import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

/**
 * Props for the TextSelector component
 * @property {string} text - The text to be displayed
 */
interface TextSelectorProps {
  text: string;
}

/**
 * TextSelector component
 * 
 * This component displays a text with a fade-in animation effect.
 * It's designed to be used in a Remotion video composition.
 * 
 * @param {TextSelectorProps} props - The component props
 * @returns {React.FC} A React functional component
 */
const TextSelector: React.FC<TextSelectorProps> = ({ text }) => {
  // Get the current frame of the video
  const frame = useCurrentFrame();
  
  // Calculate the opacity based on the current frame
  // The text fades in from 0 to 1 opacity over the first 30 frames
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp", // Keeps the opacity at 1 after frame 30
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)", // Center the text
        fontSize: "64px",
        fontWeight: "bold",
        color: "white",
        textShadow: "0 0 5px black", // Add a subtle shadow for better visibility
        opacity, // Apply the calculated opacity
      }}
    >
      {text}
    </div>
  );
};

export default TextSelector;