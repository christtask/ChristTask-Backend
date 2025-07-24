import React from 'react';

interface DecorativeDividerProps {
  color?: string;
  strokeWidth?: number;
}

export const DecorativeDivider = ({ 
  color = "#3b82f6", 
  strokeWidth = 2 
}: DecorativeDividerProps) => {
  return (
    <svg 
      viewBox="0 0 1200 30" 
      width="100%" 
      height="auto"
      style={{ display: 'block' }}
    >
      <path 
        d="M0,15 L500,15 Q550,15 560,18 T570,15 L630,15 Q640,15 650,18 T660,15 L1200,15" 
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}; 