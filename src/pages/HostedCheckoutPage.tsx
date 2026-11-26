import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Download,
  RotateCcw,
  Wallet,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Clock
} from 'lucide-react';
import { CopyMLogo } from '../components/Graphics';

export type PaymentState = 'awaiting' | 'detected' | 'confirming' | 'paid' | 'expired';

export interface HostedCheckoutPageProps {
  invoiceId?: string;
  merchantName?: string;
  orderReference?: string;
  amount?: string;
  initialNetwork?: string;
  onPaymentSuccess?: () => void;
  returnUrl?: string;
}

interface NetworkConfig {
  id: string;
  name: string;
  chainBadge: string;
  asset: string;
  address: string;
  explorerUrl: string;
}

const NETWORKS: NetworkConfig[] = [
  {
    id: 'tron',
    name: 'TRON (TRC-20)',
    chainBadge: 'USDT · TRON',
    asset: 'USDT',
    address: 'TYK9A3XmUqZ9z8VnLw7h4Jb1k8Pq5D2gXy8v2L',
    explorerUrl: 'https://tronscan.org/#/transaction/7a5b9e0f412c98a'
  },
  {
    id: 'ethereum',
    name: 'Ethereum (ERC-20)',
    chainBadge: 'USDC · ERC-20',
    asset: 'USDC',
    address: '0x4d8A00912cb84910ef123491eC10293847561a',
    explorerUrl: 'https://etherscan.io/tx/0x94f82810a9bC5109'
  },
  {
    id: 'bsc',
    name: 'BNB Chain (BEP-20)',
    chainBadge: 'USDT · BSC',
    asset: 'USDT',
    address: '0x38bE8921bca9082ef45511aD9012437FeE335e23',
    explorerUrl: 'https://bscscan.com/tx/0x38bE8921bca'
  },
  {
    id: 'solana',
    name: 'Solana (SPL)',
    chainBadge: 'USDC · SOLANA',
    asset: 'USDC',
    address: '7XqP110293847aa1928374bb2vNp884912039485',
    explorerUrl: 'https://solscan.io/tx/7XqP110293'
  }
];

export const HostedCheckoutPage: React.FC<HostedCheckoutPageProps> = ({
  invoiceId = 'INV-8849-2041',
  merchantName = 'Apex Forex Global Ltd',
  orderReference = 'ORD-948271',
  amount = '2,500.00',
  initialNetwork = 'tron',
  onPaymentSuccess,
  returnUrl = '/'
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkConfig>(
    NETWORKS.find((n) => n.id === initialNetwork) || NETWORKS[0]
  );
  const [paymentState, setPaymentState] = useState<PaymentState>('awaiting');
  const [timeLeft, setTimeLeft] = useState<number>(29 * 60 + 59); // 30-min window
  const [redirectCountdown, setRedirectCountdown] = useState<number>(5);
  const [copiedField, setCopiedField] = useState<'address' | 'amount' | 'txid' | null>(null);

  // Web3 / MetaMask state
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isProcessingWeb3, setIsProcessingWeb3] = useState(false);
  const [confirmingBlocks, setConfirmingBlocks] = useState(0);

  // 30-Minute Countdown Timer (Freezes on detection)
  useEffect(() => {
    if (paymentState !== 'awaiting') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentState('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentState]);

  // 5-Second Redirect Countdown once Paid
  useEffect(() => {
    if (paymentState !== 'paid') return;

    const redirectTimer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(redirectTimer);
          if (typeof window !== 'undefined') {
            window.location.href = returnUrl;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(redirectTimer);
  }, [paymentState, returnUrl]);

  // Format minutes & seconds into separate digits for digital display
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const m1 = Math.floor(minutes / 10);
  const m2 = minutes % 10;
  const s1 = Math.floor(seconds / 10);
  const s2 = seconds % 10;

  const handleCopy = (text: string, field: 'address' | 'amount' | 'txid') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Simulate MetaMask / Web3 1-Click Pay following 3-stage Ingestion Engine
  const handleConnectAndPay = () => {
    setIsProcessingWeb3(true);
    setTimeout(() => {
      setIsWalletConnected(true);
      setWalletAddress('0x71c8...4a91');
      setIsProcessingWeb3(false);

      // Stage 1: DETECTED (0 Confirmations - In Mempool)
      setPaymentState('detected');
      setConfirmingBlocks(0);

      // Advance to Stage 2: CONFIRMING after 1.5s
      setTimeout(() => {
        setPaymentState('confirming');
        let block = 3;
        setConfirmingBlocks(block);

        const blockInterval = setInterval(() => {
          block += 3;
          setConfirmingBlocks(block);
          if (block >= 12) {
            clearInterval(blockInterval);
            // Stage 3: CREDITED (Target Confirmations Reached)
            setPaymentState('paid');
            setRedirectCountdown(5);
            onPaymentSuccess?.();
          }
        }, 900);
      }, 1500);
    }, 1200);
  };

  const handleDownloadReceipt = () => {
    const receiptData = `COPYM PAY PAYMENT RECEIPT
====================================
Merchant: ${merchantName}
Order ID: #${orderReference}
Invoice: ${invoiceId}
Settlement Network: ${selectedNetwork.name}
Amount Paid: ${amount} ${selectedNetwork.asset}
Destination: ${selectedNetwork.address}
Status: Confirmed On-Chain (12/12 Blocks)
Timestamp: ${new Date().toUTCString()}
Merkle Proof: 0x8f4c2e71d3a958b10e4a77cb2103f56e9cba3210459812dfaa910c23948bf8a1
====================================`;
    const element = document.createElement('a');
    const file = new Blob([receiptData], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `receipt_${invoiceId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-6 px-3 sm:px-4 flex flex-col items-center justify-center font-sans">
      {/* Main Checkout Container (Mobile & Embeddable Responsive Card) */}
      <div className="w-full max-w-[420px] bg-white text-slate-900 rounded-[36px] shadow-2xl border border-slate-200 overflow-hidden relative pb-6 animate-fadeIn">
        {/* Top Detection Amber Banner (Step 4 Ingestion Engine) */}
        {paymentState === 'detected' && (
          <div className="bg-amber-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-1.5 animate-fadeIn select-none">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>Deposit detected! Awaiting blockchain confirmations...</span>
          </div>
        )}

        {/* 1. Top Countdown Bar */}
        <div className="p-4 pb-2 bg-[#F8FAFC] border-b border-slate-100">
          <div className="bg-white rounded-2xl p-3 px-4 shadow-2xs border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                {paymentState === 'detected' || paymentState === 'confirming'
                  ? 'Session Rate Frozen'
                  : 'Session Rate Lock'}
              </div>
              <div className="text-xs font-bold text-slate-800">
                {paymentState === 'expired'
                  ? 'Session Expired'
                  : paymentState === 'detected' || paymentState === 'confirming'
                  ? 'Timer Frozen on Detection'
                  : paymentState === 'paid'
                  ? 'Payment Settled'
                  : `${minutes}m ${seconds}s remaining`}
              </div>
            </div>

            {/* Boxed Digital Counter */}
            <div className="flex items-center gap-1 font-mono">
              <span className="w-6 h-7 bg-slate-100 border border-slate-200 rounded-md flex items-center justify-center font-bold text-sm text-slate-800">
                {m1}
              </span>
              <span className="w-6 h-7 bg-slate-100 border border-slate-200 rounded-md flex items-center justify-center font-bold text-sm text-slate-800">
                {m2}
              </span>
              <span className="font-extrabold text-slate-400 mx-0.5">:</span>
              <span className="w-6 h-7 bg-slate-100 border border-slate-200 rounded-md flex items-center justify-center font-bold text-sm text-slate-800">
                {s1}
              </span>
              <span className="w-6 h-7 bg-slate-100 border border-slate-200 rounded-md flex items-center justify-center font-bold text-sm text-slate-800">
                {s2}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Main Curved Emerald Gateway Card */}
        <div className="mx-3.5 mt-3 bg-gradient-to-b from-[#059669] via-[#047857] to-[#065F46] rounded-[28px] p-5 shadow-lg relative overflow-hidden flex flex-col items-center text-white">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="w-full flex items-center justify-between mb-3 z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xs">
                <CopyMLogo className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white tracking-tight leading-none">
                  CopyM <span className="text-emerald-200 font-medium text-xs">Pay</span>
                </div>
                <div className="text-xs text-emerald-100/80 font-medium">B2B Crypto Gateway</div>
              </div>
            </div>

            {/* Network Badge */}
            <div className="bg-black/25 backdrop-blur-xs border border-white/20 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>{selectedNetwork.chainBadge}</span>
            </div>
          </div>

          {/* Merchant & Order Identifiers */}
          <div className="text-center mb-3 z-10 w-full px-2">
            <h2 className="text-white font-extrabold text-lg tracking-tight leading-tight">
              {merchantName}
            </h2>

            <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
              <div
                onClick={() => handleCopy(invoiceId, 'txid')}
                className="inline-flex items-center gap-1 bg-white/15 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold text-emerald-100 border border-white/10 cursor-pointer hover:bg-white/25 transition select-none"
                title="Click to copy Invoice Reference"
              >
                <span className="text-emerald-300">INV:</span>
                <span>{invoiceId}</span>
                {copiedField === 'txid' ? (
                  <Check className="w-3 h-3 text-emerald-200" />
                ) : (
                  <Copy className="w-3 h-3 text-emerald-200" />
                )}
              </div>

              <div className="inline-flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-md text-xs font-mono text-emerald-200 border border-white/10">
                <span className="text-white/60">ORDER:</span>
                <span>#{orderReference}</span>
              </div>
            </div>
          </div>

          {/* 3. Center QR & State Container */}
          <div className="w-full max-w-[240px] aspect-square bg-white rounded-2xl p-4 shadow-xl flex flex-col items-center justify-center relative transition-all">
            {/* Scan Corner Brackets */}
            <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-600 rounded-tl" />
            <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-600 rounded-tr" />
            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-600 rounded-bl" />
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-600 rounded-br" />

            {/* Awaiting State: High-Definition SVG QR */}
            {paymentState === 'awaiting' && (
              <div className="flex flex-col items-center justify-center w-full h-full animate-fadeIn">
                <svg className="w-full h-full max-w-[170px] max-h-[170px]" viewBox="0 0 100 100" fill="none">
                  {/* Corner Finders */}
                  <rect x="5" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                  <rect x="10" y="10" width="16" height="16" rx="2" fill="#ffffff" />
                  <rect x="14" y="14" width="8" height="8" rx="1.5" fill="#059669" />
                  <rect x="69" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                  <rect x="74" y="10" width="16" height="16" rx="2" fill="#ffffff" />
                  <rect x="78" y="14" width="8" height="8" rx="1.5" fill="#059669" />
                  <rect x="5" y="69" width="26" height="26" rx="4" fill="#0f172a" />
                  <rect x="10" y="74" width="16" height="16" rx="2" fill="#ffffff" />
                  <rect x="14" y="78" width="8" height="8" rx="1.5" fill="#059669" />
                  {/* Data Matrix Dots */}
                  <rect x="36" y="8" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="48" y="8" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="58" y="8" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="36" y="20" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="46" y="18" width="6" height="6" rx="1" fill="#059669" />
                  <rect x="56" y="22" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="8" y="38" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="20" y="42" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="34" y="36" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="44" y="34" width="12" height="12" rx="2" fill="#059669" />
                  <rect x="62" y="38" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="74" y="40" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="86" y="38" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="36" y="52" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="48" y="54" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="60" y="50" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="72" y="54" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="84" y="52" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="38" y="68" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="50" y="72" width="6" height="6" rx="1" fill="#059669" />
                  <rect x="64" y="68" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="76" y="72" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="86" y="80" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="38" y="82" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="48" y="86" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="62" y="82" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="74" y="86" width="6" height="6" rx="1" fill="#0f172a" />
                </svg>
                <div className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Scan via Any Crypto Wallet
                </div>
              </div>
            )}

            {/* Stage 1: Detected State (In Mempool) */}
            {paymentState === 'detected' && (
              <div className="flex flex-col items-center justify-center w-full h-full text-center animate-fadeIn p-2">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2 animate-pulse">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-xs font-black text-amber-900">Deposit Detected!</div>
                <div className="text-xs text-amber-700 mt-0.5 font-medium leading-tight">
                  Transaction entered mempool
                </div>
                <div className="mt-2 px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-200 text-xs font-mono text-amber-800">
                  0 / 12 Confirmations · Tx Pending
                </div>
              </div>
            )}

            {/* Stage 2: Confirming State (Block Confirmations Accruing) */}
            {paymentState === 'confirming' && (
              <div className="flex flex-col items-center justify-center w-full h-full text-center animate-fadeIn p-2">
                <div className="w-12 h-12 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin mb-2" />
                <div className="text-xs font-black text-sky-900">Confirming on Blockchain</div>
                <div className="text-xs font-mono text-sky-600 font-bold mt-0.5">
                  {confirmingBlocks} / 12 Block Confirmations
                </div>
                <div className="w-full bg-sky-100 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-sky-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${(confirmingBlocks / 12) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-slate-400 font-mono mt-1.5 truncate max-w-[190px]">
                  Tx: 0x884a9128...0c1b
                </div>
              </div>
            )}

            {/* Stage 3 & 4: Paid / Credited State */}
            {paymentState === 'paid' && (
              <div className="flex flex-col items-center justify-center w-full h-full text-center animate-fadeIn p-2">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#007F4E] flex items-center justify-center mb-1.5 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="text-sm font-black text-emerald-900">Payment Successful!</div>
                <div className="text-[12px] font-bold text-emerald-700 mt-0.5 font-mono">
                  ${amount} {selectedNetwork.asset} Received
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Target confirmations & AML verified
                </div>
              </div>
            )}

            {/* Expired State */}
            {paymentState === 'expired' && (
              <div className="flex flex-col items-center justify-center w-full h-full text-center animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-red-800">Session Expired</div>
                <p className="text-xs text-slate-500 mt-1 px-2">
                  Rate lock expired. Please refresh to generate a new deposit window.
                </p>
                <button
                  onClick={() => {
                    setPaymentState('awaiting');
                    setTimeLeft(29 * 60 + 59);
                  }}
                  className="mt-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Refresh Window</span>
                </button>
              </div>
            )}
          </div>

          {/* Amount Due Box */}
          <div className="w-full mt-4 p-3 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/20 flex items-center justify-between z-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 block">
                Total Amount Due
              </span>
              <div className="text-xl font-black text-white font-mono leading-tight">
                {amount} <span className="text-emerald-200 text-sm font-bold">{selectedNetwork.asset}</span>
              </div>
              <span className="text-xs text-emerald-100/80 font-medium">
                ≈ ${amount} USD Estimated
              </span>
            </div>

            <button
              onClick={() => handleCopy(amount, 'amount')}
              className="px-3 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1 select-none"
            >
              {copiedField === 'amount' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#007F4E]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4. Bottom Controls: Network Selector & Address Details */}
        <div className="px-5 pt-4 space-y-3.5 text-xs text-slate-700">
          {/* Network Switcher Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Select Settlement Network
            </label>
            <div className="relative">
              <select
                value={selectedNetwork.id}
                onChange={(e) => {
                  const net = NETWORKS.find((n) => n.id === e.target.value);
                  if (net) setSelectedNetwork(net);
                }}
                disabled={paymentState !== 'awaiting'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 appearance-none focus:outline-none focus:border-[#007F4E] transition cursor-pointer disabled:opacity-60"
              >
                {NETWORKS.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} — {n.asset}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Destination Address Field with 1-Click Copy */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Deposit Destination Address
              </label>
              <a
                href={selectedNetwork.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5 font-semibold"
              >
                <span>Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-mono text-xs text-slate-800 break-all px-1 flex-1 select-all">
                {selectedNetwork.address}
              </span>
              <button
                onClick={() => handleCopy(selectedNetwork.address, 'address')}
                className="p-1.5 hover:bg-white text-slate-500 hover:text-slate-900 rounded-lg transition shadow-2xs shrink-0"
                title="Copy Destination Address"
              >
                {copiedField === 'address' ? (
                  <Check className="w-4 h-4 text-[#007F4E]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Web3 / MetaMask Direct Payment Button */}
          {paymentState === 'awaiting' && (
            <div className="pt-1">
              <button
                onClick={handleConnectAndPay}
                disabled={isProcessingWeb3}
                className="w-full py-3 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 select-none"
              >
                <Wallet className="w-4 h-4" />
                <span>
                  {isProcessingWeb3
                    ? 'Connecting to Web3 Node...'
                    : isWalletConnected && walletAddress
                    ? `Connected: ${walletAddress} — Pay ${amount} ${selectedNetwork.asset}`
                    : `Pay with MetaMask / Web3 (${selectedNetwork.asset})`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <p className="text-xs text-slate-400 text-center mt-1.5">
                Instant zero-fee routing via smart escrow contract
              </p>
            </div>
          )}

          {/* Paid State Actions: Download Receipt & 5-Second Redirect */}
          {paymentState === 'paid' && (
            <div className="pt-1 space-y-2">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs text-center space-y-1">
                <div className="font-extrabold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#007F4E]" />
                  <span>Double-Entry Ledger Posted (+$ {amount})</span>
                </div>
                <p className="text-xs text-emerald-700">
                  Merchant available balance updated. Redirecting in{' '}
                  <span className="font-bold font-mono text-emerald-900">{redirectCountdown}s</span>...
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDownloadReceipt}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 select-none"
                >
                  <Download className="w-4 h-4 text-[#007F4E]" />
                  <span>Download Receipt</span>
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') window.location.href = returnUrl;
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1 select-none"
                >
                  <span>Return Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Security Assurance Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>CopyM Pay Escrow Vault</span>
            </div>
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};