import React, { useCallback } from "react";
import { useEditorContext } from "../contexts/editor-context";
import { TextOverlay } from "../types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import debounce from "lodash/debounce";

// Available font options for text overlays
const fonts = [
  { value: "font-sans", label: "Inter (Sans-serif)" },
  { value: "font-serif", label: "Merriweather (Serif)" },
  { value: "font-mono", label: "Roboto Mono (Monospace)" },
  { value: "font-retro", label: "VT323" },
];

interface TextOverlaySettingsProps {
  localOverlay: TextOverlay;
  setLocalOverlay: (overlay: TextOverlay) => void;
}

export const TextOverlaySettings: React.FC<TextOverlaySettingsProps> = ({
  localOverlay,
  setLocalOverlay,
}) => {
  const { changeOverlay, selectedOverlayId, overlays } = useEditorContext();

  // Debounce overlay updates to prevent excessive re-renders
  const debouncedUpdateOverlay = useCallback(
    debounce((id: number, newOverlay: TextOverlay) => {
      changeOverlay(id, newOverlay);
    }, 300),
    [changeOverlay]
  );

  // Handle changes to direct overlay properties (e.g., content)
  const handleInputChange = (field: keyof TextOverlay, value: string) => {
    // Update local state immediately for responsive UI
    setLocalOverlay({ ...localOverlay, [field]: value });

    // Debounce the actual overlay update if an overlay is selected
    if (selectedOverlayId !== null) {
      const overlay = overlays.find((o) => o.id === selectedOverlayId);
      if (overlay) {
        debouncedUpdateOverlay(selectedOverlayId, {
          ...overlay,
          [field]: value,
        } as TextOverlay);
      }
    }
  };

  // Handle changes to nested style properties (e.g., color, fontFamily)
  const handleStyleChange = (
    field: keyof TextOverlay["styles"],
    value: string
  ) => {
    // Update local state immediately for responsive UI
    setLocalOverlay({
      ...localOverlay,
      styles: { ...localOverlay.styles, [field]: value },
    });

    // Debounce the actual overlay update if an overlay is selected
    if (selectedOverlayId !== null) {
      const overlay = overlays.find((o) => o.id === selectedOverlayId);
      if (overlay) {
        debouncedUpdateOverlay(selectedOverlayId, {
          ...overlay,
          styles: { ...overlay.styles, [field]: value },
        } as TextOverlay);
      }
    }
  };

  return (
    <div className="space-y-4 p-2">
      {/* Text Content */}
      <div className="space-y-2">
        <Label htmlFor="content">Text Content</Label>
        <Input
          id="content"
          value={localOverlay.content}
          className="bg-gray-800"
          onChange={(e) => handleInputChange("content", e.target.value)}
        />
      </div>

      {/* Background Color */}
      <div className="space-y-2">
        <Label htmlFor="backgroundColor">Background Color</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="backgroundColor"
            type="color"
            className="h-8 w-8 p-1 bg-gray-800"
            value={localOverlay.styles.backgroundColor}
            onChange={(e) =>
              handleStyleChange("backgroundColor", e.target.value)
            }
          />
          <Input
            value={localOverlay.styles.backgroundColor}
            onChange={(e) =>
              handleStyleChange("backgroundColor", e.target.value)
            }
            placeholder="#000000"
            className="bg-gray-800"
          />
        </div>
      </div>

      {/* Font Color */}
      <div className="space-y-2">
        <Label htmlFor="fontColor">Font Color</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="fontColor"
            type="color"
            className="h-8 w-8 p-1 bg-gray-800"
            value={localOverlay.styles.color}
            onChange={(e) => handleStyleChange("color", e.target.value)}
          />
          <Input
            value={localOverlay.styles.color}
            onChange={(e) => handleStyleChange("color", e.target.value)}
            placeholder="#000000"
            className="bg-gray-800"
          />
        </div>
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <Label htmlFor="fontFamily">Font Family</Label>
        <Select
          value={localOverlay.styles.fontFamily}
          onValueChange={(value) => handleStyleChange("fontFamily", value)}
        >
          <SelectTrigger
            className={`w-full bg-gray-800 ${localOverlay.styles.fontFamily}`}
          >
            <SelectValue placeholder="Select a font" />
          </SelectTrigger>
          <SelectContent>
            {fonts.map((font) => (
              <SelectItem
                key={font.value}
                value={font.value}
                className={font.value}
              >
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Text Decorations */}
      <div className="space-y-2">
        <Label>Decoration</Label>
        <ToggleGroup type="multiple" className="justify-start">
          <ToggleGroupItem
            value="isBold"
            aria-label="Toggle bold"
            onClick={() =>
              handleStyleChange(
                "fontWeight",
                localOverlay.styles.fontWeight === "bold" ? "normal" : "bold"
              )
            }
            data-state={
              localOverlay.styles.fontWeight === "bold" ? "on" : "off"
            }
            className={
              localOverlay.styles.fontWeight === "bold"
                ? "border border-gray-400 bg-gray-800"
                : ""
            }
          >
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="isItalic"
            aria-label="Toggle italic"
            onClick={() =>
              handleStyleChange(
                "fontStyle",
                localOverlay.styles.fontStyle === "italic" ? "normal" : "italic"
              )
            }
            data-state={
              localOverlay.styles.fontStyle === "italic" ? "on" : "off"
            }
            className={
              localOverlay.styles.fontStyle === "italic"
                ? "border border-gray-400"
                : ""
            }
          >
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="isUnderline"
            aria-label="Toggle underline"
            onClick={() =>
              handleStyleChange(
                "textDecoration",
                localOverlay.styles.textDecoration === "underline"
                  ? "none"
                  : "underline"
              )
            }
            data-state={
              localOverlay.styles.textDecoration === "underline" ? "on" : "off"
            }
            className={
              localOverlay.styles.textDecoration === "underline"
                ? "border border-gray-400"
                : ""
            }
          >
            <Underline className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Text Alignment */}
      <div className="space-y-2">
        <Label>Text Alignment</Label>
        <ToggleGroup type="single" className="justify-start">
          <ToggleGroupItem
            value="left"
            aria-label="Align left"
            onClick={() => handleStyleChange("textAlign", "left")}
            data-state={localOverlay.styles.textAlign === "left" ? "on" : "off"}
            className={
              localOverlay.styles.textAlign === "left"
                ? "border border-gray-400"
                : ""
            }
          >
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="center"
            aria-label="Align center"
            onClick={() => handleStyleChange("textAlign", "center")}
            data-state={
              localOverlay.styles.textAlign === "center" ? "on" : "off"
            }
            className={
              localOverlay.styles.textAlign === "center"
                ? "border border-gray-400"
                : ""
            }
          >
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="right"
            aria-label="Align right"
            onClick={() => handleStyleChange("textAlign", "right")}
            data-state={
              localOverlay.styles.textAlign === "right" ? "on" : "off"
            }
            className={
              localOverlay.styles.textAlign === "right"
                ? "border border-gray-400"
                : ""
            }
          >
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};
