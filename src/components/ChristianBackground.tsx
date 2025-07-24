import React from 'react';

interface ChristianBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const ChristianBackground: React.FC<ChristianBackgroundProps> = ({ 
  children, 
  className = "" 
}) => {
  const biblicalVerses = [
    "For God so loved the world...",
    "I can do all things through Christ...",
    "Be strong and courageous...",
    "The Lord is my shepherd...",
    "Trust in the Lord with all your heart..."
  ];

  return (
    <div className={`christian-bg ${className}`}>
      {/* Floating crosses */}
      <div className="floating-cross">✝</div>
      <div className="floating-cross">✝</div>
      <div className="floating-cross">✝</div>
      <div className="floating-cross">✝</div>
      <div className="floating-cross">✝</div>
      <div className="floating-cross">✝</div>

      {/* Biblical verses */}
      <div className="biblical-verse">
        "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."
      </div>
      <div className="biblical-verse">
        "I can do all this through him who gives me strength."
      </div>
      <div className="biblical-verse">
        "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go."
      </div>

      {/* Twinkling stars */}
      <div className="twinkling-star">⭐</div>
      <div className="twinkling-star">⭐</div>
      <div className="twinkling-star">⭐</div>
      <div className="twinkling-star">⭐</div>
      <div className="twinkling-star">⭐</div>
      <div className="twinkling-star">⭐</div>

      {/* Light rays */}
      <div className="light-ray"></div>
      <div className="light-ray"></div>
      <div className="light-ray"></div>

      {/* Bible page elements */}
      <div className="bible-page">
        "In the beginning God created the heavens and the earth..."
      </div>
      <div className="bible-page">
        "Jesus answered, 'I am the way and the truth and the life...'"
      </div>

      {/* Enhanced particle system */}
      <div className="christian-particles">
        <div className="christian-particle"></div>
        <div className="christian-particle"></div>
        <div className="christian-particle"></div>
        <div className="christian-particle"></div>
        <div className="christian-particle"></div>
        <div className="christian-particle"></div>
        <div className="christian-particle"></div>
        <div className="christian-particle"></div>
        <div className="christian-particle"></div>
        <div className="christian-particle"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}; 