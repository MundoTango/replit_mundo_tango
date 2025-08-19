import React from 'react';

/**
 * Renders text with @mentions converted to clickable profile links
 * @param text - The text content to process
 * @returns JSX elements with mentions as clickable links
 */
export const renderWithMentions = (text: string) => {
  const mentionRegex = /@([\w\d_]+)/g;
  const parts = text.split(mentionRegex);
  
  return parts.map((part, index) => {
    // If this part matches a username (odd indexes after split)
    if (index % 2 === 1) {
      return (
        <a
          key={index}
          href={`/u/${part}`}
          className="text-blue-500 hover:underline font-medium"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `/u/${part}`;
          }}
        >
          @{part}
        </a>
      );
    }
    // Regular text part
    return part;
  });
};