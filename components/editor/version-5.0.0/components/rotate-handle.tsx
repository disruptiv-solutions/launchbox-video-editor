import React, { useCallback } from "react";
import { Overlay } from "../types";
import { RotateCw } from "lucide-react";

export const RotateHandle: React.FC<{
  overlay: Overlay;
  setOverlay: (
    overlayId: number,
    updater: (overlay: Overlay) => Overlay
  ) => void;
  scale?: number;
}> = ({ overlay, setOverlay }) => {
  const startRotating = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();

      const rect = e.currentTarget.parentElement?.getBoundingClientRect();
      if (!rect) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const getAngle = (x: number, y: number) => {
        const deltaX = x - centerX;
        const deltaY = y - centerY;
        return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      };

      const startAngle = getAngle(e.clientX, e.clientY);
      const startRotation = overlay.rotation || 0;

      const onPointerMove = (e: PointerEvent) => {
        const currentAngle = getAngle(e.clientX, e.clientY);
        const deltaAngle = currentAngle - startAngle;

        setOverlay(overlay.id, (o) => ({
          ...o,
          rotation: startRotation + deltaAngle,
        }));
      };

      const onPointerUp = () => {
        window.removeEventListener("pointermove", onPointerMove);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp, { once: true });
    },
    [overlay, setOverlay]
  );

  return (
    <div
      onPointerDown={startRotating}
      style={{
        position: "absolute",
        width: "32px",
        height: "32px",
        cursor: "pointer",
        top: "-68px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",

        justifyContent: "center",
      }}
    >
      <RotateCw size={102} strokeWidth={2.5} color="#3B8BF2" />
    </div>
  );
};
