import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { WalletGraphic, PayoutGraphic, SwappGraphic } from './Graphics';
import cardBg from '../assets/card-bg.png';

export type BalanceCategory = 'Available' | 'Confirming' | 'Reserved' | 'Held';

export interface BalanceCardProps {
  balance?: number | string;
  usdtBalance?: number | string;
  onOpenDeposit?: () => void;
  onOpenPayout?: () => void;
  onOpenSwap?: () => void;
  className?: string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance = 56768,
  usdtBalance = 56768.98,
  onOpenDeposit,
  onOpenPayout,
  onOpenSwap,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BalanceCategory>('Available');
  const [showDropdown, setShowDropdown] = useState(false);

  // Dynamic projection details matching task FE-02 & COPYm Pay ledger
  const formattedAvailable =
    typeof balance === 'number' ? balance.toLocaleString('en-US') : balance.toString();
  const formattedAvailableUsdt =
    typeof usdtBalance === 'number'
      ? `${usdtBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT`
      : `${usdtBalance} USDT`;

  const balanceOptions: Record<
    BalanceCategory,
    {
      label: BalanceCategory;
      sub: string;
      amount: string;
      usdt: string;
      dotColor: string;
    }
  > = {
    Available: {
      label: 'Available',
      sub: 'Instant liquidity',
      amount: formattedAvailable,
      usdt: formattedAvailableUsdt,
      dotColor: 'bg-[#00C076]'
    },
    Confirming: {
      label: 'Confirming',
      sub: 'Incoming block confirmations',
      amount: '12,950',
      usdt: '12,950.00 USDT · 7/12 blocks',
      dotColor: 'bg-amber-400'
    },
    Reserved: {
      label: 'Reserved',
      sub: 'In-flight payout queue',
      amount: '4,200',
      usdt: '4,200.00 USDT · In-flight payouts',
      dotColor: 'bg-blue-400'
    },
    Held: {
      label: 'Held',
      sub: 'Rolling reserve & risk hold',
      amount: '8,500',
      usdt: '8,500.00 USDT · Escrow protected',
      dotColor: 'bg-purple-400'
    }
  };

  const currentProjection = balanceOptions[selectedCategory];

  const categoryList: BalanceCategory[] = ['Available', 'Confirming', 'Reserved', 'Held'];

  return (
    <div className={`relative w-full rounded-2xl sm:rounded-[28px] bg-[#0C0D10] text-white p-5 sm:p-6 shadow-2xl border border-[#23262D] flex flex-col justify-between ${className}`}>
      {/* 3D Liquid Chrome Waves Background Graphic (Clipped to Card Boundary) */}
      <div className="absolute inset-0 rounded-2xl sm:rounded-[28px] overflow-hidden pointer-events-none select-none z-0">
        <img
          src={cardBg}
          alt="Balance Card Chrome Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Top Header Row inside the card - Higher z-index so dropdown floats over action buttons */}
      <div className="relative z-30 flex items-center justify-between mb-1.5">
        {/* Dynamic Label changing with selected category */}
        <span className="text-[13px] sm:text-[15px] font-medium text-[#9FA6B2] tracking-wide animate-fadeIn">
          {currentProjection.label}
        </span>

        {/* Category Dropdown Pill */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 sm:gap-2 bg-[#00C076] hover:bg-[#00B16D] text-white text-[11px] sm:text-xs font-semibold pl-3 sm:pl-3.5 pr-2 sm:pr-2.5 py-1 sm:py-1.5 rounded-full shadow-sm transition-all select-none cursor-pointer"
          >
            <span>{currentProjection.label}</span>
            <div className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center">
              <ChevronDown className={`w-2.5 h-2.5 text-white transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {showDropdown && (
            <>
              {/* Invisible backdrop to dismiss on outside click */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />

              <div className="absolute right-0 mt-2 w-60 bg-[#14161C]/98 border border-white/10 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.85)] py-1.5 z-50 backdrop-blur-xl animate-fadeIn divide-y divide-white/5">
                {categoryList.map((catKey) => {
                  const opt = balanceOptions[catKey];
                  const isSelected = selectedCategory === catKey;

                  return (
                    <button
                      key={catKey}
                      onClick={() => {
                        setSelectedCategory(catKey);
                        setShowDropdown(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer ${
                        isSelected ? 'bg-white/5' : ''
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${opt.dotColor}`} />
                          <p className={`font-bold ${isSelected ? 'text-[#00C076]' : 'text-white'}`}>
                            {opt.label}
                          </p>
                        </div>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{opt.sub}</p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[11px] font-mono font-semibold text-gray-300">
                          ${opt.amount}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#00C076]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Primary Balance Display - Dynamically Changes when Category is Switched */}
      <div className="relative z-10 my-2 sm:my-3">
        <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
          <span
            key={`amount_${selectedCategory}`}
            className="text-[38px] xs:text-[46px] sm:text-[54px] lg:text-[60px] font-black tracking-tight text-white leading-none font-sans animate-fadeIn"
          >
            {currentProjection.amount}
          </span>
          <span className="text-[22px] xs:text-[28px] sm:text-[34px] font-bold text-white tracking-normal font-sans ml-0.5 sm:ml-1">
            US$
          </span>
        </div>

        {/* Dynamic USDT equivalent label & status indicator */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`w-2 h-2 rounded-full ${currentProjection.dotColor} flex-shrink-0 animate-pulse`} />
          <span
            key={`usdt_${selectedCategory}`}
            className="text-xs sm:text-[13px] text-[#9FA6B2] font-medium tracking-wide animate-fadeIn"
          >
            {currentProjection.usdt}
          </span>
        </div>
      </div>

      {/* 3 Quick Action Cards inside the Black Card (Fitted & Responsive) */}
      <div className="relative z-10 grid grid-cols-3 gap-2 xs:gap-3 sm:gap-3.5 pt-3 sm:pt-4">
        {/* Card 1: Deposits */}
        <div
          onClick={onOpenDeposit}
          className="glass-emboss rounded-xl sm:rounded-2xl px-2.5 py-2.5 xs:px-3.5 xs:py-3 sm:px-4 sm:py-3.5 flex items-center justify-between cursor-pointer transition-all duration-200 group hover:shadow-emerald-500/10 min-w-0"
        >
          <span className="text-xs xs:text-sm sm:text-[15px] font-bold text-white tracking-tight group-hover:text-[#00C076] transition-colors truncate">
            Deposits
          </span>
          <div className="transform group-hover:scale-105 transition-transform duration-200 flex-shrink-0 ml-1">
            <WalletGraphic className="w-9 h-7 xs:w-11 xs:h-9 sm:w-13 sm:h-10 drop-shadow-md" />
          </div>
        </div>

        {/* Card 2: Payout */}
        <div
          onClick={onOpenPayout}
          className="glass-emboss rounded-xl sm:rounded-2xl px-2.5 py-2.5 xs:px-3.5 xs:py-3 sm:px-4 sm:py-3.5 flex items-center justify-between cursor-pointer transition-all duration-200 group hover:shadow-emerald-500/10 min-w-0"
        >
          <span className="text-xs xs:text-sm sm:text-[15px] font-bold text-white tracking-tight group-hover:text-[#00C076] transition-colors truncate">
            Payout
          </span>
          <div className="transform group-hover:scale-105 transition-transform duration-200 flex-shrink-0 ml-1">
            <PayoutGraphic className="w-9 h-7 xs:w-11 xs:h-9 sm:w-13 sm:h-10 drop-shadow-md" />
          </div>
        </div>

        {/* Card 3: Swapp */}
        <div
          onClick={onOpenSwap}
          className="glass-emboss rounded-xl sm:rounded-2xl px-2.5 py-2.5 xs:px-3.5 xs:py-3 sm:px-4 sm:py-3.5 flex items-center justify-between cursor-pointer transition-all duration-200 group hover:shadow-emerald-500/10 min-w-0"
        >
          <span className="text-xs xs:text-sm sm:text-[15px] font-bold text-white tracking-tight group-hover:text-[#00C076] transition-colors truncate">
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
