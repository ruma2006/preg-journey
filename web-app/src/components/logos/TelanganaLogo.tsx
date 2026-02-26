import React from 'react';

interface TelanganaLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const TelanganaLogo: React.FC<TelanganaLogoProps> = ({
  size = 100,
  showText = true,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={showText ? size * 1.3 : size}
      viewBox={showText ? "0 0 100 130" : "0 0 100 100"}
      className={className}
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DAA520" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id="archGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B4513" />
          <stop offset="100%" stopColor="#654321" />
        </linearGradient>
      </defs>

      <g>
        {/* Base Platform */}
        <rect x="15" y="85" width="70" height="8" fill="#654321" rx="2" />
        <rect x="20" y="80" width="60" height="6" fill="#8B4513" rx="1" />

        {/* Left Pillar */}
        <rect x="22" y="45" width="12" height="35" fill="url(#archGradient)" />
        <rect x="20" y="42" width="16" height="5" fill="#DAA520" rx="1" />
        <rect x="20" y="78" width="16" height="4" fill="#DAA520" rx="1" />

        {/* Right Pillar */}
        <rect x="66" y="45" width="12" height="35" fill="url(#archGradient)" />
        <rect x="64" y="42" width="16" height="5" fill="#DAA520" rx="1" />
        <rect x="64" y="78" width="16" height="4" fill="#DAA520" rx="1" />

        {/* Arch (Kakatiya Thoranam style) */}
        <path
          d="M 20 45 Q 20 20, 50 15 Q 80 20, 80 45 L 75 45 Q 75 25, 50 20 Q 25 25, 25 45 Z"
          fill="url(#goldGradient)"
        />

        {/* Decorative Top */}
        <circle cx="50" cy="12" r="6" fill="#DAA520" />
        <circle cx="50" cy="12" r="4" fill="#FFD700" />

        {/* Lotus on top */}
        <path d="M 50 6 L 52 2 L 50 4 L 48 2 Z" fill="#FF6B6B" />
        <path d="M 46 8 L 43 5 L 46 6 Z" fill="#FF6B6B" />
        <path d="M 54 8 L 57 5 L 54 6 Z" fill="#FF6B6B" />

        {/* Inner arch decoration */}
        <path
          d="M 30 45 Q 30 30, 50 25 Q 70 30, 70 45"
          fill="none"
          stroke="#B8860B"
          strokeWidth="2"
        />

        {/* Center emblem - Ashoka Chakra style */}
        <circle cx="50" cy="55" r="12" fill="#000080" />
        <circle cx="50" cy="55" r="10" fill="#FFFFFF" />
        <circle cx="50" cy="55" r="8" fill="#000080" />
        <circle cx="50" cy="55" r="3" fill="#FFFFFF" />

        {/* Spokes */}
        {[0, 30, 60, 90, 120, 150].map((angle, i) => (
          <path
            key={i}
            d={`M 50 55 L ${50 + 7 * Math.cos((angle * Math.PI) / 180)} ${55 + 7 * Math.sin((angle * Math.PI) / 180)}`}
            stroke="#FFFFFF"
            strokeWidth="1"
          />
        ))}

        {/* Side decorations */}
        <circle cx="28" cy="55" r="3" fill="#DAA520" />
        <circle cx="72" cy="55" r="3" fill="#DAA520" />
      </g>

      {/* Text */}
      {showText && (
        <g>
          <text
            x="50"
            y="102"
            textAnchor="middle"
            fontSize="7"
            fontWeight="bold"
            fill="#1a365d"
          >
            GOVERNMENT OF
          </text>
          <text
            x="50"
            y="112"
            textAnchor="middle"
            fontSize="9"
            fontWeight="bold"
            fill="#1a365d"
          >
            TELANGANA
          </text>
          <text
            x="50"
            y="122"
            textAnchor="middle"
            fontSize="6"
            fill="#4a5568"
          >
            District Nirmal
          </text>
        </g>
      )}
    </svg>
  );
};

export default TelanganaLogo;
