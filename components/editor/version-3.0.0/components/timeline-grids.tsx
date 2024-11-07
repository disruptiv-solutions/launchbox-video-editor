import React from 'react';
import { MAX_ROWS } from '../constants';

/**
 * TimelineGrids Component
 * 
 * This component renders a grid structure for a timeline view.
 * It creates a vertical stack of rows, where each row is represented by a gray bar.
 * The number of rows is determined by the MAX_ROWS constant.
 * 
 * @returns {JSX.Element} A div containing the grid structure
 */
const TimelineGrids: React.FC = () => {
  return (
    <div className="absolute inset-0 flex flex-col z-0">
      {[...Array(MAX_ROWS)].map((_, index) => (
        <div key={index} className="flex-grow flex flex-col p-[4px]">
          <div className="flex-grow bg-gray-700 rounded-sm"></div>
        </div>
      ))}
    </div>
  );
};

export default TimelineGrids;