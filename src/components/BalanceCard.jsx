import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { LiquidChromeWaves, WalletGraphic, PayoutGraphic, SwappGraphic } from './Graphics';

export const BalanceCard = ({
  balance = 56768,
  usdtBalance = 56768.98,
  onOpenDeposit,
  onOpenPayout,
  onOpenSwap
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState('Available');
  const [showDropdown, setShowDropdown] = useState(false);

  const currencyOptions = [
    { label: 'Available', sub: 'Instant liquidity' },
    { label: 'Pending Settlement', sub: 'Expected in 2 hrs' },
    { label: 'Frozen / Reserve', sub: 'Escrow protected' },
  ];

  return (
    <div className="relative w-full max-w-[560px] rounded-2xl sm:rounded-[24px] bg-[#0C0D10] text-white p-4 sm:p-6 overflow-hidden shadow-xl border border-[#23262D]">
      {/* 3D Liquid Chrome Waves Background Graphic */}
      <LiquidChromeWaves />

      {/* Top Header Row inside the card */}
      <div className="relative z-10 flex items-center justify-between mb-1">
        <span className="text-[13px] sm:text-[15px] font-normal text-[#9FA6B2] tracking-wide">
          Available
        </span>

        {/* Green "Available" Dropdown Pill */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1 sm:gap-1.5 bg-[#00C076] hover:bg-[#00B16D] text-white text-[10px] sm:text-[11px] font-semibold pl-2.5 sm:pl-3 pr-1.5 sm:pr-2 py-1 rounded-full shadow-sm transition-all select-none"
          >
            <span>{selectedCurrency}</span>
            <div className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center">
              <ChevronDown className={`w-2.5 h-2.5 text-white transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-1.5 w-44 bg-[#1A1D23] border border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 backdrop-blur-md">
              {currencyOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    setSelectedCurrency(opt.label);
                    setShowDropdown(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-white/10 text-gray-200"
                >
                  <div>
                    <p className="font-medium text-white">{opt.label}</p>
                    <p className="text-[9px] text-gray-400">{opt.sub}</p>
                  </div>
                  {selectedCurrency === opt.label && <Check className="w-3 h-3 text-[#00C076]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Primary Balance Display - Responsive Scalable Typography */}
      <div className="relative z-10 my-2 sm:my-3">
        <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
          <span className="text-[32px] xs:text-[40px] sm:text-[46px] font-extrabold tracking-tight text-white leading-none font-sans">
            {balance.toLocaleString('en-US')}
          </span>
          <span className="text-[20px] xs:text-[26px] sm:text-[30px] font-bold text-white tracking-normal font-sans ml-0.5 sm:ml-1">
            US$
          </span>
        </div>

        {/* USDT equivalent label */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C076] flex-shrink-0" />
          <span className="text-[11px] sm:text-[12px] text-[#9FA6B2] font-medium tracking-wide">
            {usdtBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
          </span>
        </div>
      </div>

      {/* 3 Quick Action Cards inside the Black Card (Fitted & Responsive) */}
      <div className="relative z-10 grid grid-cols-3 gap-1.5 xs:gap-2.5 sm:gap-3 pt-2.5 sm:pt-3">
        {/* Card 1: Deposits */}
        <div
          onClick={onOpenDeposit}
          className="glass-emboss rounded-xl px-2 py-2 xs:px-3 xs:py-2.5 flex items-center justify-between cursor-pointer transition-all duration-200 group hover:shadow-emerald-500/10 min-w-0"
        >
          <span className="text-[11px] xs:text-[13px] sm:text-[14px] font-semibold text-white tracking-tight group-hover:text-[#00C076] transition-colors truncate">
            Deposits
          </span>
          <div className="transform group-hover:scale-105 transition-transform duration-200 flex-shrink-0 ml-1">
            <WalletGraphic className="w-9 h-7 xs:w-11 xs:h-9 sm:w-13 sm:h-10 drop-shadow-md" />
          </div>
        </div>

        {/* Card 2: Payout */}
        <div
          onClick={onOpenPayout}
          className="glass-emboss rounded-xl px-2 py-2 xs:px-3 xs:py-2.5 flex items-center justify-between cursor-pointer transition-all duration-200 group hover:shadow-emerald-500/10 min-w-0"
        >
          <span className="text-[11px] xs:text-[13px] sm:text-[14px] font-semibold text-white tracking-tight group-hover:text-[#00C076] transition-colors truncate">
            Payout
          </span>
          <div className="transform group-hover:scale-105 transition-transform duration-200 flex-shrink-0 ml-1">
            <PayoutGraphic className="w-9 h-7 xs:w-11 xs:h-9 sm:w-13 sm:h-10 drop-shadow-md" />
          </div>
        </div>

        {/* Card 3: Swapp */}
        <div
          onClick={onOpenSwap}
          className="glass-emboss rounded-xl px-2 py-2 xs:px-3 xs:py-2.5 flex items-center justify-between cursor-pointer transition-all duration-200 group hover:shadow-emerald-500/10 min-w-0"
        >
          <span className="text-[11px] xs:text-[13px] sm:text-[14px] font-semibold text-white tracking-tight group-hover:text-[#00C076] transition-colors truncate">
            Swapp
          </span>
          <div className="transform group-hover:scale-105 transition-transform duration-200 flex-shrink-0 ml-1">
            <SwappGraphic className="w-9 h-7 xs:w-11 xs:h-9 sm:w-13 sm:h-10 drop-shadow-md" />
          </div>
        </div>
      </div>
    </div>
  );
};
