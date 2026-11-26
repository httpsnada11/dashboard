import React, { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ArrowUpRight, X, ExternalLink, Copy } from 'lucide-react';
import { useDialogBehavior } from '../hooks/useDialogBehavior';
import { IDS, MERCHANT } from '../utils/sharedMockStore';

export interface PastWithdrawalItem {
  id: string;
  asset: 'USDT' | 'USDC';
  network: string;
  destinationAddress: string;
  fullAddress: string;
  clientId: string;
  refCode: string;
  merchantName?: string;
  amount: string;
  token: string;
  usdEquivalent: string;
  date: string;
  timestamp: string;
  txHash: string;
  explorerUrl: string;
  explorerName: string;
  status: 'Completed' | 'Signed' | 'In Progress';
  history: {
    createdTime: string;
    createdDesc: string;
    signedTime: string;
    signedDesc: string;
    completedTime: string;
    completedDesc: string;
  };
}

const DEFAULT_WITHDRAWALS: PastWithdrawalItem[] = [
  {
    id: 'pw_1',
    asset: 'USDT',
    network: 'TRC-20',
    destinationAddress: 'TLyV4...92bF',
    fullAddress: 'TLyV49d8aKm1X7B93Kqw2L08zM192bF',
    clientId: 'MT5-1004521',
    refCode: IDS.payouts.primary,
    merchantName: MERCHANT.name,
    amount: '2,792.00',
    token: 'USDT',
    usdEquivalent: '$2,792.00 USD',
    date: '26 Nov',
    timestamp: 'Nov 26, 2026, 8:15 pm',
    txHash: '7a5b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    explorerUrl: 'https://tronscan.org/#/transaction/7a5b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    explorerName: 'TRONSCAN',
    status: 'Completed',
    history: {
      createdTime: '26.11.2026, 8:10 pm',
      createdDesc: 'Payout requested · Ledger reserved',
      signedTime: '26.11.2026, 8:12 pm',
      signedDesc: 'Payout signed',
      completedTime: '26.11.2026, 8:15 pm',
      completedDesc: 'Payout completed'
    }
  },
  {
    id: 'pw_2',
    asset: 'USDC',
    network: 'ERC-20',
    destinationAddress: '0x71C8...39D4',
    fullAddress: '0x71C8921bca9082ef45511aD9012437FeE335e23',
    clientId: 'cTrader-88102',
    refCode: 'PAY-8404',
    merchantName: 'Prime Liquidity Global',
    amount: '4,810.00',
    token: 'USDC',
    usdEquivalent: '$4,810.00 USD',
    date: '25 Nov',
    timestamp: 'Nov 25, 2026, 4:30 pm',
    txHash: '0x8f4c28a9b1c900e231d77a83d47012bc09ef78923a104c83d6a908be140f892a',
    explorerUrl: 'https://etherscan.io/tx/0x8f4c28a9b1c900e231d77a83d47012bc09ef78923a104c83d6a908be140f892a',
    explorerName: 'Etherscan',
    status: 'Completed',
    history: {
      createdTime: '25.11.2026, 4:15 pm',
      createdDesc: 'Payout requested · Ledger reserved',
      signedTime: '25.11.2026, 4:22 pm',
      signedDesc: 'Payout signed',
      completedTime: '25.11.2026, 4:30 pm',
      completedDesc: 'Payout completed'
    }
  },
  {
    id: 'pw_3',
    asset: 'USDT',
    network: 'TRC-20',
    destinationAddress: 'TYK9A...5D2g',
    fullAddress: 'TYK9A3XmUqZ9z8VnLw7h4Jb1k8Pq5D2gXy',
    clientId: 'MT5-901422',
    refCode: 'PAY-8405',
    merchantName: 'Apex Capital Hub',
    amount: '1,650.00',
    token: 'USDT',
    usdEquivalent: '$1,650.00 USD',
    date: '25 Nov',
    timestamp: 'Nov 25, 2026, 11:20 am',
    txHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    explorerUrl: 'https://tronscan.org/#/transaction/9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    explorerName: 'TRONSCAN',
    status: 'Completed',
    history: {
      createdTime: '25.11.2026, 11:05 am',
      createdDesc: 'Payout requested · Ledger reserved',
      signedTime: '25.11.2026, 11:12 am',
      signedDesc: 'Payout signed',
      completedTime: '25.11.2026, 11:20 am',
      completedDesc: 'Payout completed'
    }
  }
];

// Crypto Token Badge Icon (Tether ₮ or USD Coin $)
const CryptoAssetIcon: React.FC<{ asset: 'USDT' | 'USDC' }> = ({ asset }) => {
  if (asset === 'USDT') {
    return (
      <div
        title="Tether (USDT)"
        className="w-6 h-6 rounded-lg bg-[#26A17B] text-white flex items-center justify-center font-bold text-xs shadow-2xs flex-shrink-0 select-none"
      >
        <span className="font-mono leading-none">₮</span>
      </div>
    );
  }

  return (
    <div
      title="USD Coin (USDC)"
      className="w-6 h-6 rounded-lg bg-[#2775CA] text-white flex items-center justify-center font-bold text-xs shadow-2xs flex-shrink-0 select-none"
    >
      <span className="font-mono leading-none">$</span>
    </div>
  );
};

export interface PastWithdrawalsCardProps {
  items?: PastWithdrawalItem[];
  onOpenPayout?: () => void;
  className?: string;
}

export const PastWithdrawalsCard: React.FC<PastWithdrawalsCardProps> = ({
  items,
  onOpenPayout,
  className = ''
}) => {
  const displayItems = items !== undefined ? items : [];
  const [expandedId, setExpandedId] = useState<string>('pw_1');
  const [showAllModal, setShowAllModal] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const closeAllModal = useCallback(() => setShowAllModal(false), []);
  const dialogRef = useDialogBehavior(showAllModal, closeAllModal);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? '' : id));
  };

  const handleCopyAddress = (e: React.MouseEvent, addr: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(addr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleOpenExplorer = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  return (
    <div className={`w-full flex flex-col justify-between ${className}`}>
      {/* Top Header Row: Past Withdrawals + Pill Badge Counter */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] sm:text-base font-bold text-[#14171A] tracking-tight">
            Past payouts
          </h3>
          <span className="w-5 h-5 rounded-full bg-[#ECEEF2] text-[#6B7280] font-bold text-xs flex items-center justify-center">
            {displayItems.length}
          </span>
        </div>

        {displayItems.length > 0 && (
          <button
            onClick={() => setShowAllModal(true)}
            className="text-xs text-[#007F4E] hover:text-[#00663F] font-semibold hover:underline flex items-center gap-1 transition select-none cursor-pointer"
          >
            <span>View all {displayItems.length}</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {displayItems.length > 0 && (
        <div className="text-xs font-medium text-[#6B7280] mb-2 px-1">
          Latest Payouts
        </div>
      )}

      {/* Primary Container: Crypto-Native Past Withdrawal Cards */}
      <div className="space-y-2.5">
        {displayItems.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-[22px] p-6 text-center border border-gray-100 shadow-2xs">
            <p className="text-sm font-bold text-slate-700">No past payouts recorded</p>
            <p className="text-xs text-slate-400 mt-1">Outbound payouts from merchant treasury will appear here.</p>
            {onOpenPayout && (
              <button
                type="button"
                onClick={onOpenPayout}
                className="mt-3.5 px-3.5 py-1.5 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                + Create First Payout
              </button>
            )}
          </div>
        ) : (
          displayItems.slice(0, 2).map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl sm:rounded-[22px] p-4 sm:p-5 shadow-xs border border-gray-100/90 transition-all hover:border-gray-200"
            >
              {/* Item Header / Top Row */}
              <div
                onClick={() => toggleExpand(item.id)}
                className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between cursor-pointer select-none gap-3"
              >
                {/* Left Side: Crypto Asset Icon + Destination Wallet Address + Client Ref */}
                <div className="flex items-start gap-2.5 min-w-0">
                  <CryptoAssetIcon asset={item.asset} />

                  <div className="min-w-0">
                    {/* Crypto Asset · Destination Address + Explorer Link */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm sm:text-[15px] font-bold text-[#14171A] leading-tight">
                        {item.token} ({item.network}) · {item.destinationAddress}
                      </span>

                      {/* Blockchain Explorer Redirect Arrow (Etherscan/TRONSCAN) */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenExplorer(e, item.explorerUrl)}
                        title={`View on-chain transaction on ${item.explorerName} (${item.txHash.slice(0, 10)}...)`}
                        className="w-4 h-4 rounded-full bg-[#14171A] hover:bg-[#007F4E] text-white flex items-center justify-center transition flex-shrink-0"
                      >
                        <ArrowUpRight className="w-2.5 h-2.5 stroke-[3]" />
                      </button>

                      {/* 1-Click Copy Destination Address */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyAddress(e, item.fullAddress, item.id)}
                        title="Copy full destination address"
                        className="text-gray-500 hover:text-gray-700 p-0.5"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3 h-3 text-[#007F4E]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Client / Trader ID & Ref Code (Merchant View) */}
                    <div className="flex items-center gap-1.5 mt-1 text-xs sm:text-xs text-[#5A6578] font-normal flex-wrap break-words">
                      <span className="font-medium text-[#1E293B]">Order: {item.clientId}</span>
                      <span className="text-gray-300">·</span>
                      <span>Payout: {item.refCode}</span>
                      {item.merchantName && (
                        <>
                          <span className="text-gray-300 hidden sm:inline">·</span>
                          <span className="text-gray-500 text-xs hidden sm:inline">({item.merchantName})</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Exact Stablecoin + Decimals and USD Subtext */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-baseline justify-start sm:justify-end gap-1">
                    <span className="text-xl sm:text-2xl font-extrabold text-[#14171A] leading-none font-sans">
                      {item.amount}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#007F4E] tracking-wide">
                      {item.token}
                    </span>
                  </div>

                  {/* Subtext: USD Equivalent & Confirmed Timestamp */}
                  <div className="flex items-center justify-start sm:justify-end gap-1 mt-1 text-xs sm:text-xs text-[#6B7280]">
                    <span className="font-medium text-gray-500">(≈ {item.usdEquivalent})</span>
                    <span className="text-gray-300">·</span>
                    <span className="hidden sm:inline">{item.timestamp}</span>
                    <Check className="w-3.5 h-3.5 text-[#007F4E] stroke-[2.5]" />
                  </div>
                </div>
              </div>

              {/* Bottom Row: Detailed History Timeline Bar (100% Matches COPYm Pay On-Chain Custody) */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-gray-100/80 animate-fadeIn">
                  <div className="bg-[#F8F9FB] rounded-xl p-3 sm:p-3.5 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#14171A]">
                        History
                      </span>
                      {/* On-chain custody & verification badge */}
                      <span className="text-xs font-semibold text-[#007F4E] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 shadow-2xs">
                        Completed
                      </span>
                    </div>

                    {/* Timeline Track with 3 Checkmark Milestones */}
                    <div className="relative py-1">
                      {/* Green Glowing Progress Line */}
                      <div className="absolute top-[13px] left-3 right-3 h-1 bg-[#007F4E] rounded-full shadow-[0_0_8px_rgba(0,127,78,0.4)]" />

                      <div className="relative z-10 grid grid-cols-3 gap-2">
                        {/* Step 1: Created = Payout requested & ledger balance reserved */}
                        <div className="flex flex-col items-start">
                          <div className="w-5 h-5 rounded-full bg-[#007F4E] text-white flex items-center justify-center shadow-xs mb-1.5 border-2 border-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span className="text-xs font-bold text-[#14171A] leading-tight">
                            Created
                          </span>
                          <span className="text-xs text-[#6B7280] mt-0.5">
                            {item.history.createdTime}
                          </span>
                          <span className="text-xs text-[#059669] font-medium leading-tight mt-0.5 hidden sm:block">
                            {item.history.createdDesc}
                          </span>
                        </div>

                        {/* Step 2: Signed = payout signed */}
                        <div className="flex flex-col items-center text-center">
                          <div className="w-5 h-5 rounded-full bg-[#007F4E] text-white flex items-center justify-center shadow-xs mb-1.5 border-2 border-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span className="text-xs font-bold text-[#14171A] leading-tight">
                            Signed
                          </span>
                          <span className="text-xs text-[#6B7280] mt-0.5">
                            {item.history.signedTime}
                          </span>
                          <span className="text-xs text-[#059669] font-medium leading-tight mt-0.5 hidden sm:block">
                            {item.history.signedDesc}
                          </span>
                        </div>

                        {/* Step 3: Completed = Mined and confirmed on blockchain */}
                        <div className="flex flex-col items-end text-right">
                          <div className="w-5 h-5 rounded-full bg-[#007F4E] text-white flex items-center justify-center shadow-xs mb-1.5 border-2 border-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span className="text-xs font-bold text-[#14171A] leading-tight">
                            Completed
                          </span>
                          <span className="text-xs text-[#6B7280] mt-0.5">
                            {item.history.completedTime}
                          </span>
                          <span className="text-xs text-[#059669] font-medium leading-tight mt-0.5 hidden sm:block">
                            {item.history.completedDesc}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Block Explorer Audit Link */}
                    <div className="pt-2.5 mt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-mono truncate max-w-[200px] sm:max-w-xs">
                        Tx: {item.txHash.slice(0, 16)}...{item.txHash.slice(-8)}
                      </span>
                      <a
                        href={item.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#007F4E] hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>View on {item.explorerName}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }))}
      </div>

      {/* Modal: View All Past Withdrawals */}
      {showAllModal && createPortal(
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-white rounded-[26px] max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">All Past Withdrawals</h3>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-[#007F4E] border border-emerald-100 text-xs font-bold rounded-full">
                  Completed
                </span>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 overflow-y-auto flex-1">
              {[...DEFAULT_WITHDRAWALS, ...DEFAULT_WITHDRAWALS].map((w, idx) => (
                <div
                  key={`${w.id}_${idx}`}
                  className="p-3.5 bg-gray-50/80 hover:bg-white rounded-2xl border border-gray-200/70 flex items-center justify-between transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CryptoAssetIcon asset={w.asset} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {w.token} ({w.network}) · {w.destinationAddress}
                      </p>
                      <p className="text-xs text-gray-500">
                        Order: {w.clientId} · Payout: {w.refCode} ({w.timestamp})
                      </p>
                    </div>
                  </div>
                <div className="text-left sm:text-right shrink-0 sm:shrink-0">

                    <p className="text-sm font-bold text-gray-900">
                      {w.amount} <span className="text-[#007F4E]">{w.token}</span>
                    </p>
                    <a
                      href={w.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#007F4E] hover:underline font-semibold flex items-center gap-0.5 justify-end"
                    >
                      <span>{w.explorerName}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowAllModal(false);
                  onOpenPayout?.();
                }}
                className="text-xs text-[#007F4E] hover:underline font-semibold"
              >
                + Create new withdrawal payout
              </button>
              <button
                onClick={() => setShowAllModal(false)}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PastWithdrawalsCard;
