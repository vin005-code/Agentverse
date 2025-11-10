import React from 'react';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Agentverse AI Logo"
  >
    <defs>
      <linearGradient id="logo-gradient-final" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" style={{ stopColor: '#22d3ee' }} />
        <stop offset="100%" style={{ stopColor: '#a855f7' }} />
      </linearGradient>
    </defs>
    
    {/* Combined Path for a single gradient fill */}
    <path
      d="
        M 61.5,16.2
        L 64.1,13.1 L 69.3,14.6 L 73.4,11.5 L 77.8,14.2 L 81.3,11.2 L 85.8,14.2 L 89.2,11.4 L 93.3,14.6 L 95.8,12.5
        A 45,45 0 0 1 61.5,91.8
        L 64.1,89.7 L 69.3,91.2 L 73.4,88.1 L 77.8,90.8 L 81.3,87.8 L 85.8,90.8 L 89.2,88.0 L 93.3,91.2 L 95.8,89.1
        A 45,45 0 0 1 61.5,16.2 Z
        M 58,25 V 75 H 61.5 A 35,35 0 0 0 61.5,25 Z
      "
      fill="url(#logo-gradient-final)"
    />

    {/* Circuit Traces */}
    <g stroke="url(#logo-gradient-final)" strokeWidth="5" strokeLinecap="round" fill="none">
      {/* Outer arc */}
      <path d="M 45,15 A 40,40 0 1 0 45,85" />
      {/* Central traces from inside gear */}
      <path d="M 58,50 L 42,50" />
      <path d="M 42,50 L 32,38" />
      <path d="M 42,50 L 32,62" />
      {/* Connection from inner nodes to outer arc */}
      <path d="M 32,38 L 22,28" />
      <path d="M 32,62 L 22,72" />
    </g>

    {/* Circuit Nodes */}
    <g fill="url(#logo-gradient-final)">
      <circle cx="22" cy="28" r="4.5" />
      <circle cx="22" cy="72" r="4.5" />
      <circle cx="32" cy="38" r="4.5" />
      <circle cx="32" cy="62" r="4.5" />
      <circle cx="42" cy="50" r="4.5" />
      <circle cx="58" cy="50" r="4.5" />
    </g>
  </svg>
);

export default LogoIcon;
