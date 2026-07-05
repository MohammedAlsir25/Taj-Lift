import React from 'react';

interface TajLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
}

export default function TajLogo({ className = '', size = 'md', showSlogan = false }: TajLogoProps) {
  // Sizing dictionary for the icon itself
  const sizeClasses = {
    sm: { container: 'w-12 h-12', logoWidth: 48, logoHeight: 48 },
    md: { container: 'w-16 h-16', logoWidth: 64, logoHeight: 64 },
    lg: { container: 'w-24 h-24', logoWidth: 96, logoHeight: 96 },
    xl: { container: 'w-32 h-32', logoWidth: 128, logoHeight: 128 },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* Clean, transparent SVG logo that blends with the current theme */}
      <svg
        width={currentSize.logoWidth}
        height={currentSize.logoHeight}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform hover:scale-105 duration-300"
      >
        {/* Top Green Chevron Arrow (Upward) */}
        <path
          d="M 40 65 L 100 25 L 160 65 L 135 65 Q 100 50 65 65 Z"
          fill="#2E7D32"
          stroke="#2E7D32"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Center Elegant Serif "Taj" Text */}
        <text
          x="100"
          y="112"
          textAnchor="middle"
          fontFamily="Georgia, serif, system-ui"
          fontWeight="bold"
          fontSize="46"
          fill="#E28714"
          className="select-none"
          letterSpacing="2"
        >
          Taj
        </text>

        {/* Bottom Red Chevron Arrow (Downward) */}
        <path
          d="M 40 135 L 100 175 L 160 135 L 135 135 Q 100 150 65 135 Z"
          fill="#D32F2F"
          stroke="#D32F2F"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>

      {showSlogan && (
        <div className="mt-3.5 space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-white font-sans">
            ElevatorPlus <span className="text-sky-400 font-light italic">Taj Lift</span>
          </h2>
          <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-sky-300 font-bold">
            <span>Organize</span>
            <span className="text-white/20">|</span>
            <span>Automate</span>
            <span className="text-white/20">|</span>
            <span>Scale</span>
          </div>
        </div>
      )}
    </div>
  );
}
