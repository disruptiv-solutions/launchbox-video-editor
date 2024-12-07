"use client";

import React, { useState } from "react";
import { useEditorContext } from "../contexts/editor-context";
import { TextOverlay } from "../types";
import { SelectTextOverlay } from "./select-text-overlay";
import { TextOverlaySettings } from "./text-overlay-settings";

export const TextOverlaysPanel: React.FC = () => {
  const { selectedOverlayId, overlays } = useEditorContext();
  const [localOverlay, setLocalOverlay] = useState<TextOverlay | null>(null);

  // Update local overlay when selected overlay changes or when overlays change
  React.useEffect(() => {
    if (selectedOverlayId === null) {
      return;
    }

    const selectedOverlay = overlays.find(
      (overlay) => overlay.id === selectedOverlayId
    );

    if (selectedOverlay?.type === "text") {
      setLocalOverlay(selectedOverlay as TextOverlay);
    }
  }, [selectedOverlayId, overlays]);

  const handleSetLocalOverlay = (overlay: TextOverlay) => {
    setLocalOverlay(overlay);
  };

  const isValidTextOverlay = localOverlay && selectedOverlayId !== null;

  return (
    <div className="p-2 h-full bg-gray-800/40 ">
      {!isValidTextOverlay ? (
        <SelectTextOverlay setLocalOverlay={handleSetLocalOverlay} />
      ) : (
        <TextOverlaySettings
          localOverlay={localOverlay}
          setLocalOverlay={handleSetLocalOverlay}
        />
      )}
    </div>
  );
};
