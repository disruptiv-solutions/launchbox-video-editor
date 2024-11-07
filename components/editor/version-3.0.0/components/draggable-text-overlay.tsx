import React, { useState, useEffect, useRef } from "react";
import {
  DndContext,
  useDraggable,
  DragEndEvent,
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { useCurrentFrame, interpolate } from "remotion";

interface DraggableTextOverlayProps {
  id: string;
  text: string;
  isSelected: boolean; // instead of isItemSelected
  initialPosition: { x: number; y: number };
  onPositionChange: (newPosition: { x: number; y: number }) => void;
  onSelect: (overlay: TextOverlay) => void;
  playerDimensions: { width: number; height: number };
  fontSize: number;
  fontColor: string;
  fontFamily: string;
  backgroundColor: string;
  position?: { x: number; y: number };
}

interface TextOverlay {
  id: string;
  text: string;
  position: { x: number; y: number };
  fontSize: number;
  fontColor: string;
  fontFamily: string;
  backgroundColor: string;
  start: number;
  duration: number;
  row: number;
}

/**
 * DraggableTextOverlay Component
 * 
 * This component renders a draggable text overlay within a video player.
 * It handles the positioning, dragging, and selection of the text overlay.
 *
 * @param {DraggableTextOverlayProps} props - The component props
 * @returns {React.ReactElement} A draggable text overlay component
 */
const DraggableTextOverlay: React.FC<DraggableTextOverlayProps> = ({
  id,
  text,
  initialPosition,
  onPositionChange,
  onSelect,
  isSelected, // instead of isItemSelected
  playerDimensions,
  fontSize,
  fontColor,
  fontFamily,
  backgroundColor,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [scale, setScale] = useState(1);

  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  // Calculate the maximum allowed position
  const maxX = playerDimensions.width - 300; // Assuming text width is 100px
  const maxY = playerDimensions.height - 200; // Assuming text height is 100px

  const frame = useCurrentFrame();
  
  // Updated animation values
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  
  const translateY = interpolate(frame, [0, 15], [10, 0], {
    extrapolateRight: "clamp",
  });

  /**
   * Handles the end of a drag operation
   * Updates the position of the text overlay and calls the onSelect callback
   *
   * @param {DragEndEvent} event - The drag end event
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    const newPosition = {
      x: Math.max(0, Math.min(position.x + delta.x / scale, maxX)),
      y: Math.max(0, Math.min(position.y + delta.y / scale, maxY)),
    };
    setPosition(newPosition);
    onPositionChange(newPosition);

    const overlay: TextOverlay = {
      id,
      text,
      position,
      fontSize,
      fontColor,
      fontFamily,
      backgroundColor,
      start: 0,
      duration: 0,
      row: 0,
    };

    onSelect(overlay);
  };

  /**
   * Handles the click event on the text overlay
   * Calls the onSelect callback with the current overlay data
   */
  const handleClick = () => {
    const overlay: TextOverlay = {
      id,
      text,
      position,
      fontSize,
      fontColor,
      fontFamily,
      backgroundColor,
      start: 0,
      duration: 0,
      row: 0,
    };

    onSelect(overlay);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        key={`overlay-container-${id}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${playerDimensions.width}px`,
          height: `${playerDimensions.height}px`,
          overflow: "hidden",
        }}
      >
        <div
          key={`overlay-bounds-${id}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${playerDimensions.width - 10}px `,
            height: `${playerDimensions.height - 10}px`,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        <DraggableText
          id={id}
          text={text}
          position={position}
          maxPosition={{ x: maxX, y: maxY }}
          isSelected={isSelected}
          scale={scale}
          setScale={setScale}
          fontSize={fontSize}
          fontColor={fontColor}
          fontFamily={fontFamily}
          backgroundColor={backgroundColor}
          onClick={handleClick}
          opacity={opacity}
          translateY={translateY}
        />
      </div>
    </DndContext>
  );
};

interface DraggableTextProps {
  id: string;
  text: string;
  position: { x: number; y: number };
  maxPosition: { x: number; y: number };
  isSelected: boolean;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  fontSize: number;
  fontColor: string;
  fontFamily: string;
  backgroundColor: string;
  onClick: (e: React.MouseEvent) => void;
  opacity: number;
  translateY: number;
}

/**
 * DraggableText Component
 * 
 * This component represents the actual draggable text element within the overlay.
 * It handles the dragging behavior and styling of the text.
 *
 * @param {DraggableTextProps} props - The component props
 * @returns {React.ReactElement} A draggable text element
 */
const DraggableText: React.FC<DraggableTextProps> = ({
  id,
  text,
  position,
  isSelected,
  scale,
  setScale,
  fontSize,
  fontColor,
  fontFamily,
  backgroundColor,
  onClick,
  opacity,
  translateY,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `draggable-text-${id}`,
  });

  const elementRef = useRef<HTMLDivElement | null>(null);

  /**
   * Effect to update the scale of the text element on window resize
   */
  useEffect(() => {
    const updateScale = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const newScale = rect.width / elementRef.current.offsetWidth;
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [setScale]);

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${position.x}px`,
    top: `${position.y}px`,
    cursor: "grab",
    userSelect: "none",
    fontSize: `${fontSize}px`,
    fontWeight: "bold",
    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
    padding: "20px",
    color: fontColor,
    backgroundColor: backgroundColor,
    touchAction: "none",
    zIndex: 2,
    transform: transform
      ? `translate3d(${transform.x / scale}px, ${
          transform.y / scale + translateY
        }px, 0)`
      : `translate3d(0, ${translateY}px, 0)`,
    transformOrigin: "0 0",
    border: isSelected ? "3px solid white" : "",
    borderRadius: "10px",
    opacity,
  };

  return (
    <div
      key={`draggable-text-${id}`}
      ref={(node) => {
        setNodeRef(node);
        elementRef.current = node;
      }}
      style={style}
      className={fontFamily} // Add this line to apply the Tailwind CSS font class
      {...listeners}
      {...attributes}
      onClick={onClick}
    >
      {text}
    </div>
  );
};

export default DraggableTextOverlay;
