import React from 'react';
import TextOverlayTemplates from './text-overlay-templates';
import { TextOverlay } from '../types';
import TextOverlayEditor from './text-overlay-editor';
import { textOverlayTemplates } from '../templates/text-overlay-templates';

/**
 * Props for the TextOverlaySelector component.
 */
interface TextOverlaySelectorProps {
  /** The currently selected item, if any */
  selectedItem: { type: string; id: string } | null;
  /** Array of existing text overlays */
  textOverlays: TextOverlay[];
  /** A new overlay to be used if no existing overlay is selected */
  newOverlay: TextOverlay;
  /** Callback function to update an overlay */
  onUpdateOverlay: (overlay: TextOverlay) => void;
  /** Callback function when a template is clicked */
  onTemplateClick: (template: TextOverlay) => void;
}

/**
 * TextOverlaySelector component
 * 
 * This component renders either a TextOverlayTemplates component or a TextOverlayEditor
 * based on whether a text item is currently selected.
 * 
 * @param props - The component props
 * @returns A React component
 */
const TextOverlaySelector: React.FC<TextOverlaySelectorProps> = ({
  selectedItem,
  textOverlays,
  newOverlay,
  onUpdateOverlay,
  onTemplateClick,
}) => {
  // If no item is selected or the selected item is not of type "text",
  // render the TextOverlayTemplates component
  if (!selectedItem || selectedItem.type !== "text") {
    return (
      <TextOverlayTemplates
        templates={textOverlayTemplates}
        onTemplateClick={onTemplateClick}
      />
    );
  }

  // Find the selected overlay or use the new overlay if not found
  const overlay = textOverlays.find(
    (overlay) => overlay.id === selectedItem.id
  ) || newOverlay;

  // Render the TextOverlayEditor for the selected or new overlay
  return (
    <TextOverlayEditor
      overlay={overlay}
      onUpdateOverlay={onUpdateOverlay}
    />
  );
};

export default TextOverlaySelector;