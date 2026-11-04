import React from 'react';

// Brand Logo: CopyM folded green ribbon loop
export const CopyMLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="copym-grad1" x1="6" y1="8" x2="32" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00E68C" />
        <stop offset="0.6" stopColor="#00C076" />
        <stop offset="1" stopColor="#00824E" />
      </linearGradient>
      <linearGradient id="copym-grad2" x1="12" y1="6" x2="34" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10F29E" />
        <stop offset="1" stopColor="#00C076" />
      </linearGradient>
      <filter id="copym-shadow" x="0" y="0" width="40" height="40" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#00824E" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#copym-shadow)">
      {/* Outer loop folded ribbon */}
      <path
        d="M20 5C13.2 5 7.5 9.8 6.3 16.5C5.1 23.2 9.1 29.8 15.6 32.2C18.4 33.2 21.6 33.2 24.4 32.2L28.8 30.2C31.5 29 33.5 26.5 34.2 23.5C35.2 19.5 33.8 15.2 30.7 12.5L25.5 8C23.9 6.1 22 5 20 5Z"
        fill="url(#copym-grad1)"
      />
      {/* Inner cutout hole to create the ring loop */}
      <path
        d="M20 12C23.3 12 26 14.7 26 18C26 21.3 23.3 24 20 24C16.7 24 14 21.3 14 18C14 14.7 16.7 12 20 12Z"
        fill="#FFFFFF"
      />
      {/* Overlay highlight ribbon */}
      <path
        d="M14 18C14 14.7 16.7 12 20 12C22.5 12 24.6 13.5 25.5 15.7C24.2 15 22.5 14.8 21 15.2C18.2 16 16.2 18.2 15.8 21C14.7 20.3 14 19.2 14 18Z"
        fill="url(#copym-grad2)"
      />
    </g>
  </svg>
);

// Metallic 3D Wallet Graphic for "Deposits"
export const WalletGraphic = ({ className = "w-20 h-16" }) => (
  <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="wallet-silver" x1="15" y1="10" x2="85" y2="70" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F0F2F5" />
        <stop offset="0.3" stopColor="#CBD2DC" />
        <stop offset="0.7" stopColor="#8A93A0" />
        <stop offset="1" stopColor="#5E6573" />
      </linearGradient>
      <linearGradient id="card-sheen" x1="30" y1="0" x2="80" y2="45" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="0.5" stopColor="#B8C0CC" />
        <stop offset="1" stopColor="#7E8794" />
      </linearGradient>
      <linearGradient id="gold-emblem" x1="45" y1="45" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E2E8F0" />
        <stop offset="1" stopColor="#94A3B8" />
      </linearGradient>
      <filter id="soft-shadow" x="0" y="0" width="100" height="85" filterUnits="userSpaceOnUse">
        <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.45" />
      </filter>
    </defs>
    
    <g filter="url(#soft-shadow)">
      {/* Credit card peeking out from wallet */}
      <rect
        x="32"
        y="12"
        width="46"
        height="28"
        rx="5"
        transform="rotate(-10 32 12)"
        fill="url(#card-sheen)"
        stroke="#E2E8F0"
        strokeWidth="0.8"
      />
      {/* Chip / magnetic stripe on card */}
      <rect
        x="42"
        y="18"
        width="10"
        height="8"
        rx="1.5"
        transform="rotate(-10 42 18)"
        fill="#94A3B8"
        opacity="0.8"
      />

      {/* Main Leather / Metallic Wallet Body */}
      <path
        d="M18 26C18 20.4772 22.4772 16 28 16H76C81.5228 16 86 20.4772 86 26V58C86 63.5228 81.5228 68 76 68H28C22.4772 68 18 63.5228 18 58V26Z"
        fill="url(#wallet-silver)"
        stroke="#A0AAB8"
        strokeWidth="1.2"
      />

      {/* Wallet flap / seam line */}
      <path
        d="M18 36C28 36 34 38 46 44C54 48 64 48 72 44C78 41 82 37 86 36"
        stroke="#475569"
        strokeWidth="1.2"
        fill="none"
        opacity="0.5"
      />

      {/* Flap fastener tab */}
      <path
        d="M44 45H58C61.3 45 64 47.7 64 51V52C64 55.3 61.3 58 58 58H44C40.7 58 38 55.3 38 52V51C38 47.7 40.7 45 44 45Z"
        fill="#64748B"
        stroke="#CBD5E1"
        strokeWidth="0.8"
      />

      {/* Center 8-pointed star/diamond emblem on the wallet tab */}
      <path
        d="M51 48L52.2 50.8L55 52L52.2 53.2L51 56L49.8 53.2L47 52L49.8 50.8Z"
        fill="url(#gold-emblem)"
      />
    </g>
  </svg>
);

// Metallic 3D Card with Arrow Graphic for "Payout"
export const PayoutGraphic = ({ className = "w-20 h-16" }) => (
  <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="payout-silver" x1="20" y1="12" x2="78" y2="68" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F8FAFC" />
        <stop offset="0.35" stopColor="#D4D9E2" />
        <stop offset="0.7" stopColor="#8C96A5" />
        <stop offset="1" stopColor="#4A5260" />
      </linearGradient>
      <linearGradient id="arrow-emboss" x1="38" y1="28" x2="68" y2="58" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#9CA3AF" />
      </linearGradient>
      <filter id="payout-shadow" x="5" y="5" width="90" height="75" filterUnits="userSpaceOnUse">
        <feDropShadow dx="3" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.5" />
      </filter>
    </defs>
    <g filter="url(#payout-shadow)">
      {/* 3D Tilted Card Body */}
      <rect
        x="24"
        y="16"
        width="54"
        height="48"
        rx="8"
        transform="rotate(-5 24 16)"
        fill="url(#payout-silver)"
        stroke="#E2E8F0"
        strokeWidth="1.2"
      />
      {/* Glossy edge highlight */}
      <line
        x1="27"
        y1="18"
        x2="78"
        y2="13.5"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      
      {/* 3D Embossed Arrow Pointing Upwards/Diagonal */}
      <g transform="rotate(-5 50 40)">
        {/* Shadow behind arrow */}
        <path
          d="M48 52L56 36L44 38L45 34L62 32L64 49L60 50L58 42L49 54Z"
          fill="#1E293B"
          opacity="0.35"
          transform="translate(1, 1)"
        />
        {/* Bold 3D arrow */}
        <path
          d="M44 48L53 35L42 37L43 33L60 31L61 48L57 49L55 41L45 50Z"
          fill="url(#arrow-emboss)"
        />
      </g>
    </g>
  </svg>
);

// Metallic 3D Opposing Arrows Graphic for "Swapp"
export const SwappGraphic = ({ className = "w-20 h-16" }) => (
  <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="swap-top" x1="30" y1="20" x2="75" y2="45" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="0.4" stopColor="#CBD5E1" />
        <stop offset="0.8" stopColor="#94A3B8" />
        <stop offset="1" stopColor="#64748B" />
      </linearGradient>
      <linearGradient id="swap-bottom" x1="25" y1="35" x2="70" y2="65" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E2E8F0" />
        <stop offset="0.4" stopColor="#94A3B8" />
        <stop offset="0.8" stopColor="#64748B" />
        <stop offset="1" stopColor="#475569" />
      </linearGradient>
      <filter id="swap-shadow" x="10" y="8" width="80" height="66" filterUnits="userSpaceOnUse">
        <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.45" />
      </filter>
    </defs>
    <g filter="url(#swap-shadow)">
      {/* Top Arrow (pointing right) */}
      <path
        d="M26 31C26 29.3431 27.3431 28 29 28H56V21.5C56 20.3 57.4 19.6 58.4 20.4L73.4 31.9C74.2 32.5 74.2 33.7 73.4 34.3L58.4 45.8C57.4 46.6 56 45.9 56 44.7V38H29C27.3431 38 26 36.6569 26 35V31Z"
        fill="url(#swap-top)"
        stroke="#E2E8F0"
        strokeWidth="0.8"
      />

      {/* Bottom Arrow (pointing left) */}
      <path
        d="M74 49C74 50.6569 72.6569 52 71 52H44V58.5C44 59.7 42.6 60.4 41.6 59.6L26.6 48.1C25.8 47.5 25.8 46.3 26.6 45.7L41.6 34.2C42.6 33.4 44 34.1 44 35.3V42H71C72.6569 42 74 43.3431 74 45V49Z"
        fill="url(#swap-bottom)"
        stroke="#CBD5E1"
        strokeWidth="0.8"
      />
    </g>
  </svg>
);

// Liquid Metallic Wave Flow Texture for the Black Card background
export const LiquidChromeWaves = () => (
  <svg
    className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-90 mix-blend-screen"
    viewBox="0 0 900 480"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient id="chrome-ribbon-1" x1="100" y1="480" x2="550" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0F1013" stopOpacity="0.1" />
        <stop offset="0.25" stopColor="#4A505C" stopOpacity="0.4" />
        <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.75" />
        <stop offset="0.65" stopColor="#9AA2AF" stopOpacity="0.5" />
        <stop offset="0.9" stopColor="#1E2024" stopOpacity="0.2" />
        <stop offset="1" stopColor="#0A0B0D" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="chrome-ribbon-2" x1="280" y1="480" x2="480" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0B0C0E" stopOpacity="0" />
        <stop offset="0.3" stopColor="#30353F" stopOpacity="0.5" />
        <stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.65" />
        <stop offset="0.8" stopColor="#646D7D" stopOpacity="0.3" />
        <stop offset="1" stopColor="#101114" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="glow-ambient" x1="400" y1="150" x2="400" y2="450" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2A313C" stopOpacity="0.3" />
        <stop offset="1" stopColor="#070809" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Ambient soft glow */}
    <ellipse cx="360" cy="220" rx="280" ry="180" fill="url(#glow-ambient)" />

    {/* Big liquid Chrome Ribbons looping across the card */}
    <path
      d="M120 480C140 380 210 240 310 180C420 114 470 140 460 220C450 310 390 380 340 480H120Z"
      fill="url(#chrome-ribbon-1)"
    />
    <path
      d="M260 480C280 400 320 280 380 200C440 120 480 90 520 90C550 90 570 130 550 200C520 310 440 420 380 480H260Z"
      fill="url(#chrome-ribbon-2)"
    />

    {/* Dynamic thin luminous edge strokes */}
    <path
      d="M160 480C180 360 260 220 360 160C450 106 480 140 470 230C460 320 400 400 350 480"
      stroke="#FFFFFF"
      strokeWidth="1.2"
      strokeOpacity="0.5"
    />
    <path
      d="M280 480C300 380 350 250 410 170C460 105 495 80 530 85C560 90 570 140 550 220C520 340 440 430 380 480"
      stroke="#E2E8F0"
      strokeWidth="1.5"
      strokeOpacity="0.75"
    />
    <path
      d="M320 480C340 410 380 310 430 240C475 178 510 150 540 160"
      stroke="#94A3B8"
      strokeWidth="0.8"
      strokeOpacity="0.4"
    />
  </svg>
);

