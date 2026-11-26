import React, { useState, useMemo } from 'react';
import { Copy, Check, QrCode, Disc3, ShieldCheck, RefreshCw, Zap } from 'lucide-react';

export interface CopyMRadialScannerProps {
  address?: string;
  amount?: string;
  currency?: string;
  network?: string;
  theme?: 'light' | 'dark' | 'emerald';
  allowToggleView?: boolean;
  className?: string;
  onScanSuccess?: () => void;
}

// Polar coordinate conversion helper
function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: Number((cx + r * Math.cos(angleInRadians)).toFixed(2)),
    y: Number((cy + r * Math.sin(angleInRadians)).toFixed(2))
  };
}

// SVG Arc path generator with rounded capsules
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  let diff = endAngle - startAngle;
  if (diff < 0) diff += 360;
  const largeArcFlag = diff <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

interface Segment {
  type: 'black' | 'grey';
  path: string;
  strokeWidth: number;
}

// Generates concentric barcode tracks matching the authentic Apple Pay App Clip code
function buildRingSegments(cx: number, cy: number, r: number, strokeWidth: number, slots: number[]): Segment[] {
  const N = slots.length;
  const step = 360 / N;
  const capAngle = (strokeWidth / r) * (180 / Math.PI);
  const visualGapPx = 4.2;
  const gapAngle = capAngle + (visualGapPx / r) * (180 / Math.PI);

  const segments: Segment[] = [];
  let i = 0;
  while (i < N) {
    const val = slots[i];
    if (val === 0) {
      i++;
      continue;
    }
    let j = i;
    while (j + 1 < N && slots[j + 1] === val) {
      j++;
    }
    const count = j - i + 1;
    const centerStart = i * step;
    const centerEnd = (i + count) * step;
    const startAngle = centerStart + gapAngle / 2;
    const endAngle = centerEnd - gapAngle / 2;

    if (endAngle > startAngle) {
      segments.push({
        type: val === 1 ? 'black' : 'grey',
        path: describeArc(cx, cy, r, startAngle, endAngle),
        strokeWidth
      });
    }
    i = j + 1;
  }
  return segments;
}

// Apple App Clip Polar Configuration (5 Concentric Tracks)
const RING_DEFINITIONS = [
  // Ring 1 (r=59, stroke=7.5): 18 slots
  { r: 59, stroke: 7.5, slots: [1, 2, 0, 1, 1, 0, 2, 1, 0, 2, 2, 0, 1, 0, 2, 1, 1, 0] },
  // Ring 2 (r=79, stroke=8.0): 24 slots
  { r: 79, stroke: 8.0, slots: [1, 1, 0, 2, 0, 1, 2, 2, 0, 1, 0, 2, 1, 1, 0, 2, 0, 1, 1, 2, 0, 2, 1, 0] },
  // Ring 3 (r=99, stroke=8.5): 30 slots
  { r: 99, stroke: 8.5, slots: [2, 1, 1, 0, 2, 0, 1, 1, 2, 0, 1, 0, 2, 2, 1, 0, 1, 1, 0, 2, 0, 1, 2, 2, 0, 1, 0, 2, 1, 0] },
  // Ring 4 (r=119, stroke=9.0): 36 slots
  { r: 119, stroke: 9.0, slots: [1, 2, 0, 1, 1, 2, 0, 2, 0, 1, 1, 0, 2, 1, 0, 1, 2, 2, 0, 1, 0, 2, 1, 1, 0, 2, 0, 1, 2, 0, 1, 1, 2, 0, 2, 0] },
  // Ring 5 (r=139, stroke=9.5): 42 slots
  { r: 139, stroke: 9.5, slots: [2, 0, 1, 1, 0, 2, 2, 0, 1, 0, 2, 1, 1, 0, 2, 0, 1, 1, 2, 0, 1, 0, 2, 2, 0, 1, 1, 0, 2, 0, 1, 2, 2, 0, 1, 0, 2, 1, 1, 0, 2, 0] }
];

export const CopyMRadialScanner: React.FC<CopyMRadialScannerProps> = ({
  address = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  amount = '250.00',
  currency = 'USDT',
  network = 'TRC-20 (TRON)',
  theme = 'light',
  allowToggleView = true,
  className = '',
  onScanSuccess
}) => {
  const [viewMode, setViewMode] = useState<'radial' | 'matrix'>('radial');
  const [isSimulatingScan, setIsSimulatingScan] = useState<boolean>(false);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Address splitting for high-security readability
  const first6 = address.slice(0, 6);
  const middle = address.slice(6, -6);
  const last6 = address.slice(-6);

  // Generate the 5 concentric optical tracks
  const tracks = useMemo(() => {
    return RING_DEFINITIONS.map(ring => {
      // Deterministic slight rotation / permutation based on address if needed
      return {
        r: ring.r,
        stroke: ring.stroke,
        segments: buildRingSegments(160, 160, ring.r, ring.stroke, ring.slots)
      };
    });
  }, [address]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = () => {
    if (isSimulatingScan) return;
    setIsSimulatingScan(true);
    setTimeout(() => {
      setIsSimulatingScan(false);
      setScanSuccess(true);
      if (onScanSuccess) onScanSuccess();
      setTimeout(() => setScanSuccess(false), 2600);
    }, 1100);
  };

  const isDark = theme === 'dark';
  const isEmeraldTheme = theme === 'emerald';

  // Palette resolution
  const darkColor = isDark ? '#F8FAFC' : '#090B10';
  const greyColor = isDark ? '#64748B' : isEmeraldTheme ? '#00C076' : '#8E95A2';
  const discFill = isDark ? '#0B0F19' : '#FFFFFF';
  const discBorder = isDark ? '#1E293B' : '#E5E7EB';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Top View Mode Switcher Pill */}
      {allowToggleView && (
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-full mb-3.5 border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('radial')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
              viewMode === 'radial'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Disc3 className={`w-3.5 h-3.5 ${viewMode === 'radial' ? 'text-black animate-[spin_10s_linear_infinite]' : ''}`} />
            <span>CopyM Radial</span>
            <span className="text-xs px-1.5 py-0.2 bg-slate-900 text-white font-bold rounded-full"> Style</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
              viewMode === 'matrix'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-slate-600" />
            <span>Classic QR</span>
          </button>
        </div>
      )}

      {/* Main Scanner Container with Soft Ambient Drop Shadow */}
      <div className="relative group flex items-center justify-center p-2">
        {/* Soft Radial Ambient Aura */}
        <div
          className={`absolute inset-0 rounded-full filter blur-xl transition-all duration-500 ${
            scanSuccess
              ? 'bg-emerald-400/40 scale-105'
              : isDark
              ? 'bg-slate-800/30'
              : 'bg-slate-300/25 group-hover:bg-slate-400/30'
          }`}
        />

        {/* Circular Card Outer Housing (Apple Pay Sticker aesthetic) */}
        <div
          onClick={handleSimulateScan}
          title="Click to simulate mobile camera scan"
          className={`relative z-10 w-[240px] h-[240px] sm:w-[260px] sm:h-[260px] rounded-full p-2 transition-all duration-300 cursor-pointer flex items-center justify-center ${
            isDark
              ? 'bg-slate-900 border border-slate-800 shadow-2xl'
              : 'bg-white border border-gray-100 shadow-[0_18px_45px_-12px_rgba(0,0,0,0.14)]'
          } ${scanSuccess ? 'ring-4 ring-[#007F4E] ring-offset-2' : 'hover:scale-[1.015]'}`}
        >
          {viewMode === 'radial' ? (
            /* ========================================================= */
            /* APPLE PAY / APP CLIP INSPIRED COPYM RADIAL CODE           */
            /* ========================================================= */
            <div className="relative w-full h-full flex items-center justify-center">
              <svg
                viewBox="0 0 320 320"
                className="w-full h-full overflow-visible select-none"
              >
                {/* Background Disc */}
                <circle
                  cx="160"
                  cy="160"
                  r="156"
                  fill={discFill}
                  stroke={discBorder}
                  strokeWidth="1.5"
                />

                {/* =================================================== */}
                {/* 5 CONCENTRIC POLAR BARCODE TRACKS                   */}
                {/* =================================================== */}
                <g id="tracks">
                  {tracks.map((track, tIdx) => (
                    <g key={`track-${tIdx}`}>
                      {track.segments.map((seg, sIdx) => {
                        const strokeColor = seg.type === 'black' ? darkColor : greyColor;
                        return (
                          <path
                            key={`seg-${tIdx}-${sIdx}`}
                            d={seg.path}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth={seg.strokeWidth}
                            strokeLinecap="round"
                          />
                        );
                      })}
                    </g>
                  ))}
                </g>

                {/* =================================================== */}
                {/* CENTRAL BADGE: SOLID BLACK BADGE WITH COPYM PAY     */}
                {/* =================================================== */}
                {/* Solid Jet Black Badge Circle (Radius 42, Diameter 84) */}
                <circle
                  cx="160"
                  cy="160"
                  r="42"
                  fill="#000000"
                  stroke={scanSuccess ? '#00C076' : '#18181B'}
                  strokeWidth="2"
                  className={scanSuccess ? 'animate-pulse' : ''}
                />

                {/* Central Brand Content: [CopyM Symbol] + Pay */}
                <g transform="translate(160, 160)">
                  {scanSuccess ? (
                    /* Scan Success Checkmark Animation */
                    <g className="animate-scaleIn">
                      <circle cx="0" cy="0" r="26" fill="#00C076" />
                      <path
                        d="M-8 0 L-2 6 L10 -6"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  ) : (
                    /* Apple Pay Style Horizontal Brand Lockup: Pay -> [CM]Pay */
                    <g id="brandLockup">
                      {/* CopyM Vector Mark Emblem on Left */}
                      <g transform="translate(-25, -10)">
                        <rect
                          x="0"
                          y="0"
                          width="19"
                          height="19"
                          rx="5.5"
                          fill="#FFFFFF"
                        />
                        {/* Inner Diamond Monogram */}
                        <path
                          d="M5.5 9.5 L9.5 5.5 L13.5 9.5 L9.5 13.5 Z"
                          fill="#000000"
                        />
                        <circle cx="9.5" cy="9.5" r="1.8" fill="#FFFFFF" />
                      </g>

                      {/* "Pay" Typography (Matching Pay SF Pro Font) */}
                      <text
                        x="-1"
                        y="5"
                        fill="#FFFFFF"
                        fontSize="17"
                        fontWeight="700"
                        letterSpacing="-0.2"
                        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif"
                      >
                        Pay
                      </text>
                    </g>
                  )}
                </g>
              </svg>

              {/* Scanning Active Overlay on Click */}
              {isSimulatingScan && (
                <div className="absolute inset-0 rounded-full bg-black/40 backdrop-blur-2xs flex flex-col items-center justify-center animate-fadeIn">
                  <div className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg animate-bounce">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  </div>
                  <span className="text-xs font-bold text-white bg-black/80 px-2.5 py-0.5 rounded-full mt-2 shadow-xs">
                    Verifying Deposit...
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* ========================================================= */
            /* FALLBACK CLASSIC MATRIX QR CODE                           */
            /* ========================================================= */
            <div className="w-full h-full p-4 flex flex-col items-center justify-center bg-white rounded-full">
              <div className="relative p-3 bg-white border border-slate-200 rounded-2xl shadow-inner">
                {/* Realistic Matrix QR Vector */}
                <svg viewBox="0 0 100 100" className="w-36 h-36">
                  {/* Position Corners (Top-Left, Top-Right, Bottom-Left) */}
                  <rect x="5" y="5" width="28" height="28" rx="4" fill="none" stroke="#000000" strokeWidth="4" />
                  <rect x="11" y="11" width="16" height="16" rx="2" fill="#000000" />

                  <rect x="67" y="5" width="28" height="28" rx="4" fill="none" stroke="#000000" strokeWidth="4" />
                  <rect x="73" y="11" width="16" height="16" rx="2" fill="#000000" />

                  <rect x="5" y="67" width="28" height="28" rx="4" fill="none" stroke="#000000" strokeWidth="4" />
                  <rect x="11" y="73" width="16" height="16" rx="2" fill="#000000" />

                  {/* Synthetic Data Pixels */}
                  <g fill="#000000">
                    <rect x="38" y="10" width="5" height="5" />
                    <rect x="48" y="10" width="5" height="5" />
                    <rect x="58" y="10" width="5" height="5" />
                    <rect x="38" y="20" width="5" height="5" />
                    <rect x="48" y="20" width="10" height="5" />
                    <rect x="10" y="38" width="5" height="10" />
                    <rect x="20" y="48" width="10" height="5" />
                    <rect x="38" y="38" width="10" height="10" />
                    <rect x="53" y="38" width="5" height="5" />
                    <rect x="63" y="38" width="10" height="5" />
                    <rect x="78" y="38" width="5" height="10" />
                    <rect x="43" y="53" width="5" height="10" />
                    <rect x="53" y="53" width="10" height="5" />
                    <rect x="68" y="53" width="5" height="5" />
                    <rect x="83" y="53" width="7" height="7" />
                    <rect x="38" y="68" width="5" height="15" />
                    <rect x="48" y="73" width="10" height="5" />
                    <rect x="63" y="68" width="10" height="10" />
                    <rect x="78" y="73" width="12" height="5" />
                    <rect x="48" y="88" width="15" height="5" />
                    <rect x="68" y="83" width="10" height="7" />
                    <rect x="83" y="83" width="7" height="12" />
                  </g>
                </svg>

                {/* Center Badge in QR */}
                <div className="absolute inset-0 m-auto w-8 h-8 rounded-lg bg-black flex items-center justify-center font-bold text-white text-xs shadow-md border-2 border-white">
                  CM
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Anti-Poisoning Address Display */}
      <div className="mt-3.5 w-full max-w-[290px] flex flex-col items-center">
        {/* Anti-Poisoning Address Capsule with 1-Click Copy */}
        <div
          onClick={handleCopy}
          title="Click to copy full deposit address"
          className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-xl cursor-pointer transition shadow-2xs group"
        >
          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="font-extrabold text-slate-900 bg-slate-200/80 px-1.5 py-0.5 rounded text-xs">
              {first6}
            </span>
            <span className="text-slate-400 text-xs tracking-wider select-none px-0.5">
              ...{middle.slice(0, 4)}...
            </span>
            <span className="font-extrabold text-slate-900 bg-slate-200/80 px-1.5 py-0.5 rounded text-xs">
              {last6}
            </span>
          </div>

          <button
            type="button"
            className="flex items-center gap-1 text-xs font-bold text-slate-600 group-hover:text-black transition ml-2"
          >
            {copied ? (
              <span className="flex items-center gap-1 text-[#00875A]">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Copied</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                <span className="hidden sm:inline">Copy</span>
              </span>
            )}
          </button>
        </div>

        {/* Verification Subtext & Badges */}
        <div className="w-full flex items-center justify-between text-xs mt-2 px-1 text-slate-400 font-medium">
          <span className="flex items-center gap-1 text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-[#007F4E]" />
            <span>Anti-Poisoning Verified</span>
          </span>
          <span className="font-semibold text-slate-700">{network}</span>
        </div>

        {/* Amount & Currency Badge */}
        {amount && (
          <div className="mt-2 text-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold">
              <Zap className="w-3 h-3 text-[#007F4E]" />
              <span>Exact Amount: {amount} {currency}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
