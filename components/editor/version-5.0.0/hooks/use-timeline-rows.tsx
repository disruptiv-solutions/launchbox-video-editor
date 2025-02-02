import { useState, useCallback } from "react";
import { TimelineRow } from "../types";
import { MAX_ROWS } from "../constants";

export const useTimelineRows = () => {
  const [rows, setRows] = useState<TimelineRow[]>([
    { id: 1, index: 0 },
    { id: 2, index: 1 },
    { id: 3, index: 2 },
  ]);

  const addRow = useCallback(() => {
    setRows((currentRows) => {
      if (currentRows.length >= MAX_ROWS) {
        return currentRows;
      }

      const newRow: TimelineRow = {
        id: Date.now(),
        index: currentRows.length,
      };

      return [...currentRows, newRow];
    });
  }, []);

  return {
    rows,
    addRow,
  };
};
