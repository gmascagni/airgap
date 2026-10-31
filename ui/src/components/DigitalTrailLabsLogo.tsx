import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export function DigitalTrailLabsLogo({ className = "w-11 h-11", size }: LogoProps) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      style={style}
      aria-label="Digital Trail Labs Logo"
      role="img"
    >
      <defs>
        <linearGradient
          id="dtlShieldGrad"
          x1="12"
          y1="10"
          x2="108"
          y2="112"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="55%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <linearGradient
          id="dtlCoreGrad"
          x1="25"
          y1="22"
          x2="95"
          y2="98"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0B1324" />
          <stop offset="100%" stopColor="#070A12" />
        </linearGradient>
      </defs>
      {/* Outer Hexagonal Sovereign Shield */}
      <path
        d="M60 6L106 28V64C106 88.5 86.4 107.8 60 114C33.6 107.8 14 88.5 14 64V28L60 6Z"
        fill="url(#dtlCoreGrad)"
        stroke="url(#dtlShieldGrad)"
        strokeWidth="4.5"
      />
      {/* Inner Vault Perimeter */}
      <path
        d="M60 15L97 33V62.5C97 82.2 81.2 98.2 60 103.5C38.8 98.2 23 82.2 23 62.5V33L60 15Z"
        stroke="#1E293B"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      {/* Cryptographic Digital Trail Pathways */}
      <path
        d="M35 76L52 59L66 67L85 42"
        stroke="url(#dtlShieldGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M35 52L48 39H72"
        stroke="#06B6D4"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <path
        d="M52 84H76L86 72"
        stroke="#10B981"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      {/* Verification Nodes */}
      <circle cx="35" cy="76" r="5" fill="#06B6D4" />
      <circle cx="52" cy="59" r="4.5" fill="#0EA5E9" />
      <circle cx="66" cy="67" r="4.5" fill="#06B6D4" />
      <circle
        cx="85"
        cy="42"
        r="6"
        fill="#10B981"
        stroke="#070A12"
        strokeWidth="2"
      />
      <circle cx="72" cy="39" r="4" fill="#06B6D4" />
      <circle cx="86" cy="72" r="4" fill="#10B981" />
    </svg>
  );
}
export default DigitalTrailLabsLogo;
