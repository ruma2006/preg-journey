import React from 'react';

interface AmmaRakshithaLogoProps {
  size?: number;
  variant?: 'full' | 'icon';
  className?: string;
}

export const AmmaRakshithaLogo: React.FC<AmmaRakshithaLogoProps> = ({
  size = 100,
  variant = 'full',
  className = ''
}) => {
  if (variant === 'icon') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="motherGradientIcon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="heartGradientIcon" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <linearGradient id="protectionGradientIcon" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Circular background */}
        <circle cx="50" cy="50" r="48" fill="url(#motherGradientIcon)" />
        <circle cx="50" cy="50" r="44" fill="#ffffff" opacity="0.1" />

        {/* Protection circle/aura */}
        <circle cx="50" cy="50" r="38" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.3" />

        {/* Mother figure */}
        <g transform="translate(25, 20)">
          {/* Mother's head */}
          <circle cx="25" cy="15" r="12" fill="#FDB797" />

          {/* Mother's hair */}
          <path
            d="M 13 12 Q 13 3, 25 3 Q 37 3, 37 12 Q 37 8, 25 6 Q 13 8, 13 12"
            fill="#1a1a1a"
          />

          {/* Mother's body - protective embrace */}
          <path
            d="M 10 28 C 5 35, 5 50, 15 55 L 35 55 C 45 50, 45 35, 40 28 Q 35 25, 25 25 Q 15 25, 10 28"
            fill="#ec4899"
          />

          {/* Baby */}
          <g transform="translate(15, 35)">
            {/* Baby's head */}
            <circle cx="10" cy="5" r="7" fill="#FDB797" />
            {/* Baby's body wrapped */}
            <ellipse cx="10" cy="15" rx="8" ry="10" fill="#fef3c7" />
          </g>

          {/* Protective arms */}
          <path
            d="M 8 35 Q 0 45, 8 52"
            fill="none"
            stroke="#ec4899"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 42 35 Q 50 45, 42 52"
            fill="none"
            stroke="#ec4899"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>

        {/* Heart symbol */}
        <path
          d="M 50 82 C 45 78, 38 78, 38 83 C 38 88, 50 95, 50 95 C 50 95, 62 88, 62 83 C 62 78, 55 78, 50 82"
          fill="url(#heartGradientIcon)"
        />

        {/* Plus/medical symbol in corner */}
        <g transform="translate(70, 10)">
          <circle cx="10" cy="10" r="10" fill="url(#protectionGradientIcon)" />
          <path d="M 10 5 L 10 15 M 5 10 L 15 10" stroke="#ffffff" strokeWidth="2" />
        </g>
      </svg>
    );
  }

  // Full version with decorative elements
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className}>
      <defs>
        <linearGradient id="bgGradientFull" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="innerGlowFull" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Outer decorative ring */}
      <circle cx="60" cy="60" r="58" fill="none" stroke="#2563eb" strokeWidth="1" opacity="0.3" />

      {/* Main circle */}
      <circle cx="60" cy="60" r="55" fill="url(#bgGradientFull)" />

      {/* Inner glow */}
      <circle cx="60" cy="55" r="50" fill="url(#innerGlowFull)" />

      {/* Decorative dots around */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <circle
          key={i}
          cx={60 + 52 * Math.cos((angle * Math.PI) / 180)}
          cy={60 + 52 * Math.sin((angle * Math.PI) / 180)}
          r="2"
          fill="#93c5fd"
        />
      ))}

      {/* Mother and child - centered */}
      <g transform="translate(30, 20)">
        {/* Protective aura */}
        <ellipse cx="30" cy="45" rx="35" ry="40" fill="#ffffff" opacity="0.1" />

        {/* Mother's head */}
        <circle cx="30" cy="18" r="14" fill="#FDB797" />

        {/* Mother's hair - styled */}
        <path
          d="M 16 15 Q 16 4, 30 4 Q 44 4, 44 15 Q 44 10, 38 8 Q 30 6, 22 8 Q 16 10, 16 15"
          fill="#2d1b0e"
        />
        {/* Hair bun */}
        <circle cx="30" cy="5" r="5" fill="#2d1b0e" />

        {/* Bindi */}
        <circle cx="30" cy="12" r="1.5" fill="#dc2626" />

        {/* Mother's sari/dress */}
        <path
          d="M 12 32 C 5 40, 5 60, 18 70 L 42 70 C 55 60, 55 40, 48 32 Q 40 28, 30 28 Q 20 28, 12 32"
          fill="#ec4899"
        />

        {/* Sari pallu */}
        <path d="M 15 35 Q 10 45, 15 55 Q 25 50, 20 40 Z" fill="#f472b6" />

        {/* Baby in arms */}
        <g transform="translate(18, 42)">
          {/* Baby blanket */}
          <ellipse cx="12" cy="12" rx="12" ry="14" fill="#fef3c7" />
          {/* Baby's head */}
          <circle cx="12" cy="4" r="8" fill="#FDB797" />
          {/* Baby's hair */}
          <path d="M 6 2 Q 12 -2, 18 2" fill="#4a3728" />
        </g>

        {/* Mother's arms embracing */}
        <path d="M 10 40 Q 2 50, 8 62 L 12 60 Q 8 50, 14 42" fill="#FDB797" />
        <path d="M 50 40 Q 58 50, 52 62 L 48 60 Q 52 50, 46 42" fill="#FDB797" />
      </g>

      {/* Heart at bottom */}
      <path
        d="M 60 100 C 54 95, 45 95, 45 102 C 45 109, 60 118, 60 118 C 60 118, 75 109, 75 102 C 75 95, 66 95, 60 100"
        fill="#ef4444"
      />

      {/* Medical cross in top right */}
      <g transform="translate(90, 15)">
        <circle cx="12" cy="12" r="12" fill="#10b981" />
        <path d="M 12 6 L 12 18 M 6 12 L 18 12" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export default AmmaRakshithaLogo;
