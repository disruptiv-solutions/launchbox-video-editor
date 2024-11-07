import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { TextOverlay } from "../types";
import { Textarea } from "@/components/ui/textarea";

/**
 * Props for the TextOverlayEditor component.
 */
interface TextOverlayEditorProps {
  /** The current text overlay object */
  overlay: TextOverlay;
  /** Callback function to update the overlay */
  onUpdateOverlay: (updatedOverlay: TextOverlay) => void;
}

/**
 * TextOverlayEditor component for editing text overlay properties.
 * 
 * This component provides a user interface for editing various properties
 * of a text overlay, including the text content, font size, font family,
 * font color, and background color.
 */
const TextOverlayEditor: React.FC<TextOverlayEditorProps> = ({
  overlay,
  onUpdateOverlay,
}) => {
  /**
   * Handles changes to the overlay properties.
   * @param field - The field of the TextOverlay to update
   * @param value - The new value for the field
   */
  const handleChange = (field: keyof TextOverlay, value: string | number) => {
    onUpdateOverlay({ ...overlay, [field]: value });
  };

  /** Available font sizes */
  const fontSizes = [18, 24, 32, 48, 64, 72, 96, 128, 160];

  /** Available font options */
  const fonts = [
    { value: "font-sans", label: "Inter (Sans-serif)" },
    { value: "font-serif", label: "Merriweather (Serif)" },
    { value: "font-mono", label: "Roboto Mono (Monospace)" },
    { value: "font-retro", label: "VT323" },
  ];

  return (
    <div className="space-y-4">
      {/* Text input area */}
      <Textarea
        value={overlay.text}
        onChange={(e) => handleChange("text", e.target.value)}
        placeholder="Enter text overlay"
        className="w-full min-h-[100px] bg-gray-800 text-white border border-gray-700 rounded-md resize-y"
      />

      <div className="flex space-x-4">
        {/* Font size selector */}
        <div className="w-1/6 space-y-2">
          <Label>Size</Label>
          <Select
            value={overlay.fontSize.toString()}
            onValueChange={(value) =>
              handleChange("fontSize", parseInt(value, 10))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {fontSizes.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font family selector */}
        <div className="flex-1 space-y-2">
          <Label>Font</Label>
          <Select
            value={overlay.fontFamily}
            onValueChange={(value) => handleChange("fontFamily", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {fonts.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  <span className={font.value}>{font.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex space-x-4">
        {/* Font color picker */}
        <div className="w-1/6 space-y-2">
          <Label>Color</Label>
          <Input
            type="color"
            value={overlay.fontColor}
            onChange={(e) => handleChange("fontColor", e.target.value)}
            className="w-full h-9 rounded-md"
          />
        </div>
        {/* Background color picker */}
        <div className="w-1/6 space-y-2">
          <Label>Background</Label>
          <Input
            type="color"
            value={overlay.backgroundColor}
            onChange={(e) => handleChange("backgroundColor", e.target.value)}
            className="w-full h-9 rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

export default TextOverlayEditor;
