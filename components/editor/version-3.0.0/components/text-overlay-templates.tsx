import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TextOverlayTemplate } from '../types';

/**
 * Props for the TextOverlayTemplates component.
 */
interface TextOverlayTemplatesProps {
  /** Array of text overlay templates to display */
  templates: TextOverlayTemplate[];
  /** Callback function triggered when a template is clicked */
  onTemplateClick: (template: TextOverlayTemplate) => void;
}

/**
 * TextOverlayTemplates component displays a grid of text overlay templates.
 * It shows up to 4 templates and allows the user to select one.
 *
 * @param {TextOverlayTemplatesProps} props - The component props
 * @returns {React.ReactElement} The rendered component
 */
const TextOverlayTemplates: React.FC<TextOverlayTemplatesProps> = ({ templates, onTemplateClick }) => {
  return (
    <div className="grid gap-4 scrollbar-hide">
      {templates.slice(0, 4).map((template: TextOverlayTemplate, index: number) => (
        <div
          key={index}
          className="rounded-md cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.03] bg-gray-800 hover:bg-gray-700"
          onClick={() => onTemplateClick({ ...template, id: uuidv4() })}
        >
          <div
            className="rounded-md overflow-hidden"
            style={{ transition: "0.2s ease-in-out" }}
          >
            <p
              className={`${template.fontFamily} p-4`}
              style={{
                color: template.fontColor,
                fontSize: template.displayFontSize,
                fontWeight: template.fontWeight,
              }}
            >
              {template.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TextOverlayTemplates;