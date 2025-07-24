import React from 'react';

interface WavyDividerProps {
  color?: string;
}

export const WavyDivider = ({ color = "#3b82f6" }: WavyDividerProps) => {
  return (
    <svg 
      viewBox="0 0 1200 120" 
      width="100%" 
      height="auto"
      style={{ display: 'block' }}
    >
      <path 
        d="M0,60 Q150,20 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z" 
        fill={color}
      />
    </svg>
  );
}; 