import React from 'react';
import { PexelsMedia } from '../types';

/**
 * PexelsMediaSelector Component
 * 
 * This component displays a grid of Pexels media items (images or videos) and allows
 * the user to select one by clicking on it.
 *
 * @component
 * @param {Object} props
 * @param {(item: PexelsMedia) => void} props.onItemClick - Callback function triggered when a media item is clicked
 * @param {PexelsMedia[]} props.pexelsMedia - Array of Pexels media items to display
 * @param {boolean} props.isLoadingMedia - Flag indicating whether media is currently being loaded
 */
const PexelsMediaSelector: React.FC<{
  onItemClick: (item: PexelsMedia) => void;
  pexelsMedia: PexelsMedia[];
  isLoadingMedia: boolean;
}> = ({ onItemClick, pexelsMedia, isLoadingMedia }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {isLoadingMedia ? (
        // Display loading indicator when media is being fetched
        <div>Loading...</div>
      ) : (
        // Map through pexelsMedia array and render each item
        pexelsMedia.map((item) => (
          <div
            key={item.id}
            className="cursor-pointer hover:opacity-75 transition-opacity"
            onClick={() => onItemClick(item)}
          >
            <img
              // Use image URL if available, otherwise use the first video file link
              src={item.image || item.video_files?.[0].link}
              alt={`Pexels media ${item.id}`}
              className="w-full h-auto object-cover rounded-md"
            />
          </div>
        ))
      )}
    </div>
  );
};

export default PexelsMediaSelector;