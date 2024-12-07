import { useState } from "react";
import { INITIAL_ROWS, MAX_ROWS } from "../constants";

export const useVisibleRows = () => {
  const [visibleRows, setVisibleRows] = useState(INITIAL_ROWS);

  const addRow = () => {
    setVisibleRows((current) => Math.min(current + 1, MAX_ROWS));
  };

  const removeRow = () => {
    setVisibleRows((current) => Math.max(current - 1, INITIAL_ROWS));
  };

  return {
    visibleRows,
    getVisibleRows: () => visibleRows,
    setVisibleRows,
    addRow,
    removeRow,
  };
};
