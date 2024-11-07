import React, { useCallback, useMemo } from "react";
import { useCurrentScale } from "remotion";
import { Overlay } from "../types";

const HANDLE_SIZE = 12;

export const ResizeHandle: React.FC<{
  type: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  setOverlay: (
    overlayId: number,
    updater: (overlay: Overlay) => Overlay
  ) => void;
  overlay: Overlay;
}> = ({ type, setOverlay, overlay }) => {
  const scale = useCurrentScale();
  const size = Math.round(HANDLE_SIZE / scale);
  const borderSize = 1 / scale;

  const sizeStyle: React.CSSProperties = useMemo(() => {
    return {
      position: "absolute",
      height: size,
      width: size,
      backgroundColor: "white",
      border: `${borderSize}px solid #3B8BF2`,
    };
  }, [borderSize, size]);

  const margin = -size / 2 - borderSize;

  const style: React.CSSProperties = useMemo(() => {
    if (type === "top-left") {
      return {
        ...sizeStyle,
        marginLeft: margin,
        marginTop: margin,
        cursor: "nwse-resize",
      };
    }

    if (type === "top-right") {
      return {
        ...sizeStyle,
        marginTop: margin,
        marginRight: margin,
        right: 0,
        cursor: "nesw-resize",
      };
    }

    if (type === "bottom-left") {
      return {
        ...sizeStyle,
        marginBottom: margin,
        marginLeft: margin,
        bottom: 0,
        cursor: "nesw-resize",
      };
    }

    if (type === "bottom-right") {
      return {
        ...sizeStyle,
        marginBottom: margin,
        marginRight: margin,
        right: 0,
        bottom: 0,
        cursor: "nwse-resize",
      };
    }

    throw new Error("Unknown type: " + JSON.stringify(type));
  }, [margin, sizeStyle, type]);

  const onPointerDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (e.button !== 0) {
        return;
      }

      const initialX = e.clientX;
      const initialY = e.clientY;

      const onPointerMove = (pointerMoveEvent: PointerEvent) => {
        const offsetX = (pointerMoveEvent.clientX - initialX) / scale;
        const offsetY = (pointerMoveEvent.clientY - initialY) / scale;

        const isLeft = type === "top-left" || type === "bottom-left";
        const isTop = type === "top-left" || type === "top-right";

        setOverlay(overlay.id, (i) => {
          const newWidth = overlay.width + (isLeft ? -offsetX : offsetX);
          const newHeight = overlay.height + (isTop ? -offsetY : offsetY);
          const newLeft = overlay.left + (isLeft ? offsetX : 0);
          const newTop = overlay.top + (isTop ? offsetY : 0);

          return {
            ...i,
            width: Math.max(1, Math.round(newWidth)),
            height: Math.max(1, Math.round(newHeight)),
            left: Math.min(
              overlay.left + overlay.width - 1,
              Math.round(newLeft)
            ),
            top: Math.min(overlay.top + overlay.height - 1, Math.round(newTop)),
            isDragging: true,
          };
        });
      };

      const onPointerUp = () => {
        setOverlay(overlay.id, (i) => {
          return {
            ...i,
            isDragging: false,
          };
        });
        window.removeEventListener("pointermove", onPointerMove);
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerup", onPointerUp, {
        once: true,
      });
    },
    [overlay, scale, setOverlay, type]
  );

  if (overlay.type === "sound") {
    return null;
  }

  return <div onPointerDown={onPointerDown} style={style} />;
};
