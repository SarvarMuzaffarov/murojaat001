import React from 'react';

interface BranchLogoProps {
  className?: string;
  size?: number;
}

export const BranchLogo: React.FC<BranchLogoProps> = ({ className = 'w-12 h-12', size }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f3b75" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Outer circular badge border */}
      <circle cx="60" cy="60" r="56" fill="white" stroke="#0f3b75" strokeWidth="4" />
      <circle cx="60" cy="60" r="51" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 2" />

      {/* Main shield */}
      <path
        d="M60 16 L92 28 V64 C92 84 60 102 60 102 C60 102 28 84 28 64 V28 Z"
        fill="url(#shieldGrad)"
        stroke="#ffffff"
        strokeWidth="2"
      />

      {/* Uzbek Flag Ribbon at Top of Shield */}
      <path d="M42 36 H78" stroke="#0099b8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M42 39 H78" stroke="#ce1126" strokeWidth="1" strokeLinecap="round" />
      <path d="M42 42 H78" stroke="#1eb53a" strokeWidth="2.5" strokeLinecap="round" />

      {/* Chemical Flask / Retort (Chemical Technology Symbol) */}
      <path
        d="M56 48 V56 L47 72 C45 75 48 78 52 78 H68 C72 78 75 75 73 72 L64 56 V48 H56 Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Liquid inside flask */}
      <path
        d="M49 69 L53 62 C57 63 63 61 67 62 L71 69 C72 71 70 75 67 75 H53 C50 75 48 71 49 69 Z"
        fill="url(#emeraldGrad)"
      />
      <circle cx="58" cy="66" r="1.5" fill="#ffffff" opacity="0.9" />
      <circle cx="63" cy="70" r="1.2" fill="#ffffff" opacity="0.8" />

      {/* Open Book beneath flask (Education & Science) */}
      <path
        d="M42 86 C48 83 56 83 60 86 C64 83 72 83 78 86 V92 C72 89 64 89 60 92 C56 89 48 89 42 92 Z"
        fill="url(#goldGrad)"
      />
      <path
        d="M60 86 V92"
        stroke="#0f3b75"
        strokeWidth="1.5"
      />

      {/* Text arc or abbreviation TKTI YANGIYER */}
      <text
        x="60"
        y="113"
        textAnchor="middle"
        fill="#0f3b75"
        fontSize="7.5"
        fontWeight="bold"
        letterSpacing="1"
      >
        TKTI YANGIYER
      </text>
    </svg>
  );
};
