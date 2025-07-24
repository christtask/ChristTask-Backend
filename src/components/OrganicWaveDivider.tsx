import React from 'react';

interface OrganicWaveDividerProps {
  color?: string;
  strokeWidth?: number;
  height?: number;
  variant?: 'default' | 'hero' | 'two-dips' | 'straight' | 'horizontal';
}

/**
 * OrganicWaveDivider component renders a decorative SVG divider.
 * Variants:
 * - 'default': flowing curves
 * - 'hero': gentle dips in the middle
 * - 'two-dips': two dips
 * - 'straight': straight horizontal line (SVG)
 * - 'horizontal': 1px high, full-width horizontal divider with subtle gradient or light gray color (#e5e5e5), margin spacing above and below (uses <div> not SVG)
 */
export const OrganicWaveDivider = ({ 
  color = "#000000", // black
  strokeWidth = 2,
  height = 40,
  variant = 'default'
}: OrganicWaveDividerProps) => {
  // Hero variant with gentle dips in the middle
  const heroPath = "M0,20 L400,20 Q450,20 475,15 T500,20 L600,20 Q650,20 675,15 T700,20 L800,20 Q850,20 875,15 T900,20 L1200,20";
  
  // Two dips variant
  const twoDipsPath = "M0,20 L350,20 Q400,20 425,15 T450,20 L750,20 Q800,20 825,15 T850,20 L1200,20";
  
  // Default variant with flowing curves
  const defaultPath = "M0,20 Q150,10 300,20 T600,20 T900,20 T1200,20";

  // Straight line variant
  const straightPath = "M0,20 L1200,20";
  
  const pathData = variant === 'hero' ? heroPath : 
                   variant === 'two-dips' ? twoDipsPath : 
                   variant === 'straight' ? straightPath :
                   defaultPath;

  if (variant === 'horizontal') {
    return (
      <div
        style={{
          width: '100%',
          height: '1px',
          backgroundColor: '#e5e5e5',
          margin: '32px 0',
          border: 'none',
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div style={{ 
      position: 'relative', 
      height: `${height}px`, 
      marginTop: `-${height/2}px`,
      marginBottom: `-${height/2}px`,
      zIndex: 10
    }}>
      <svg 
        viewBox="0 0 1200 40" 
        width="100%" 
        height="100%"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0
        }}
        preserveAspectRatio="none"
      >
        <path 
          d={pathData}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}; 