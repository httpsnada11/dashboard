import React from 'react';
import copyMLogo from '../image/logo.png';
import depositIcon from '../assets/deposit-icon.png';
import payoutIcon from '../assets/payout-icon.png';
import swapIcon from '../assets/swap-icon.png';
import usdtIcon from '../assets/usdt-icon.png';

interface GraphicProps {
  className?: string;
}

// Brand Logo: CopyM
export const CopyMLogo: React.FC<GraphicProps> = ({ className = "w-8 h-8" }) => (
  <img src={copyMLogo} alt="CopyM Pay" className={`object-contain ${className}`} />
);

// Tether USDT Icon Graphic
export const UsdtGraphic: React.FC<GraphicProps> = ({ className = "w-5 h-5" }) => (
  <img src={usdtIcon} alt="USDT" className={`object-contain ${className}`} />
);

// Metallic 3D Wallet Graphic for "Deposits"
export const WalletGraphic: React.FC<GraphicProps> = ({ className = "w-20 h-16" }) => (
  <img src={depositIcon} alt="Deposits" className={`object-contain ${className}`} />
);

// Metallic 3D Card with Arrow Graphic for "Payout"
export const PayoutGraphic: React.FC<GraphicProps> = ({ className = "w-20 h-16" }) => (
  <img src={payoutIcon} alt="Payout" className={`object-contain ${className}`} />
);

// Metallic 3D Opposing Arrows Graphic for "Convert"
export const ConvertGraphic: React.FC<GraphicProps> = ({ className = "w-20 h-16" }) => (
  <img src={swapIcon} alt="Convert" className={`object-contain ${className}`} />
);

// Backward compatibility alias
export const SwappGraphic = ConvertGraphic;

// Liquid Metallic Wave Flow Texture for the Black Card background
export const LiquidChromeWaves: React.FC = () => (
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

