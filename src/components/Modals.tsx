import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Key, Lock, Play, RotateCcw, ExternalLink, Copy, Check, ChevronDown } from 'lucide-react';
import { PayoutRecord } from '../types';
import { useDialogBehavior } from '../hooks/useDialogBehavior';
import { DepositCheckoutModal, DepositCheckoutModalProps } from './DepositCheckoutModal';
import { toPayoutRef } from '../utils/sharedMockStore';

export type { DepositCheckoutModalProps as DepositModalProps };
export const DepositModal = DepositCheckoutModal;

export interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateWebhook?: () => void;
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({ isOpen, onClose, onSimulateWebhook }) => {
  const dialogRef = useDialogBehavior(isOpen, onClose);
  const [apiKey, setApiKey] = useState('cpy_live_948f21e04a918bca48721c09');
  const [copied, setCopied] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'testing' | 'success'>('idle');

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRotateKey = () => {
    const newKey = 'cpy_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(newKey);
  };

  const handleRunWebhookTest = () => {
    setWebhookStatus('testing');
    setTimeout(() => {
      setWebhookStatus('success');
      onSimulateWebhook?.();
      setTimeout(() => setWebhookStatus('idle'), 3000);
    }, 1200);
  };

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#007F4E] flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Developer APIs & Keys</h3>
              <p className="text-xs text-gray-500">Integrate CopyM Pay gateway directly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 flex items-center justify-between mb-1.5">
              <span>Production Secret Key</span>
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" /> Stored as secret
              </span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 font-mono text-xs text-gray-800 select-all truncate">
                {apiKey}
              </div>
              <button
                onClick={handleCopyKey}
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#007F4E]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleRotateKey}
                title="Rotate Secret Key"
                className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-800">Webhook Event Dispatcher</h4>
                <p className="text-xs text-gray-500">Dispatch a test deposit notification payload</p>
              </div>
              <button
                onClick={handleRunWebhookTest}
                disabled={webhookStatus === 'testing'}
                className="px-3 py-1.5 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
              >
                {webhookStatus === 'testing' ? (
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-white" />
                )}
                {webhookStatus === 'testing' ? 'Sending...' : 'Test Webhook'}
              </button>
            </div>
            {webhookStatus === 'success' && (
              <div className="mt-3 p-2 bg-emerald-100/60 text-[#007F4E] text-xs rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-[#007F4E]" />
                Test webhook event dispatched locally
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-gray-500">Read the complete API specifications</span>
            <a
              href="https://docs.copym.pay"
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.preventDefault()}
              className="text-[#007F4E] hover:underline font-semibold flex items-center gap-1"
            >
              API Reference Docs
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPayout: (payout: PayoutRecord) => void;
  availableBalance?: number;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({ isOpen, onClose, onAddPayout, availableBalance = 0 }) => {
  const dialogRef = useDialogBehavior(isOpen, onClose);
  const [assetNetwork, setAssetNetwork] = useState('USDT - TRON (TRC-20)');
  const [amount, setAmount] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [purposeCode, setPurposeCode] = useState('CUSTOMER_WITHDRAWAL');
  const [step, setStep] = useState<'form' | 'review'>('form');
  const [mfaCode, setMfaCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCurrency = assetNetwork.startsWith('USDC') ? 'USDC' : 'USDT';
  const networkFee = '~$1.00 ' + currentCurrency;
  const vaultBalance = `${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currentCurrency}`;

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsedNum = parseFloat(amount);
    if (!amount || isNaN(parsedNum) || parsedNum <= 0) {
      setFormError('Please enter a valid payout amount.');
      return;
    }
    if (!destinationAddress.trim()) {
      setFormError('Please enter a valid destination address.');
      return;
    }
    setStep('review');
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsedNum = parseFloat(amount);

    const formattedAmount = parsedNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const payoutRef = toPayoutRef(`PAY-${Date.now().toString().slice(-6)}`);
    const cleanNetwork = assetNetwork.includes('TRON') ? 'USDT · TRON' : assetNetwork.includes('Polygon') ? 'USDC · Polygon' : assetNetwork.includes('BEP-20') ? 'USDT · BEP-20' : assetNetwork.includes('USDC') ? 'USDC · ERC-20' : 'USDT · ERC-20';
    const shortDest = destinationAddress.length > 14
      ? `${destinationAddress.substring(0, 6)}..${destinationAddress.substring(destinationAddress.length - 4)}`
      : destinationAddress;

    const newPayoutItem: PayoutRecord = {
      id: payoutRef,
      ref: payoutRef,
      fullRef: payoutRef,
      amount: formattedAmount,
      numericAmount: parsedNum,
      network: cleanNetwork,
      customer: `ord_${Math.floor(10000 + Math.random() * 90000)}`,
      destinationType: 'DESTINATION · FIRST-PARTY DEPOSIT',
      destinationAddress: shortDest,
      fullAddress: destinationAddress,
      requestedBy: 'Nora Vale (Owner)',
      complianceText: 'Awaiting compliance review',
      status: parsedNum > 5000 ? 'Needs approval' : 'Needs approval',
      createdAt: 'Just now'
    };

    onAddPayout(newPayoutItem);
    setStep('form');
    setAmount('');
    setDestinationAddress('');
    setMfaCode('');
    onClose();
  };

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white rounded-[24px] max-w-[440px] w-full p-5 sm:p-6 shadow-2xl border border-gray-100 relative">
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-[19px] font-bold text-[#14171A]">
              {step === 'form' ? 'Create payout' : 'Review & Authorize Payout'}
            </h2>
          </div>
          <button
            onClick={() => { setStep('form'); onClose(); }}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {formError && (
          <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
            {formError}
          </div>
        )}

        {step === 'form' ? (
          <form onSubmit={handleProceedToReview} className="pt-4 space-y-3.5 text-xs">
            <div>
              <label className="text-xs font-semibold text-[#14171A] block mb-1">
                Asset and network
              </label>
              <div className="relative">
                <select
                  value={assetNetwork}
                  onChange={(e) => setAssetNetwork(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 appearance-none pr-8 focus:outline-none focus:border-[#007F4E] transition"
                >
                  <option value="USDT - TRON (TRC-20)">USDT - TRON (TRC-20)</option>
                  <option value="USDC - Ethereum (ERC-20)">USDC - Ethereum (ERC-20)</option>
                  <option value="USDT - Ethereum (ERC-20)">USDT - Ethereum (ERC-20)</option>
                  <option value="USDC - Polygon">USDC - Polygon</option>
                  <option value="USDT - BNB Chain (BEP-20)">USDT - BNB Chain (BEP-20)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <span className="text-xs text-[#6B7280] block">Available in vault</span>
              <span className="text-[13px] font-bold text-[#14171A] mt-0.5 block">
                {vaultBalance}
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#14171A] block mb-1">
                Amount
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-3 pr-16 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#007F4E] transition"
                />
                <span className="absolute right-3.5 text-xs font-bold text-gray-700 pointer-events-none">
                  {currentCurrency}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-[#6B7280] block">Est. network fee</span>
              <span className="text-[12px] font-bold text-[#14171A] mt-0.5 block">
                {networkFee}
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#14171A] block mb-1">
                Destination address
              </label>
              <input
                type="text"
                required
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                placeholder="Enter destination blockchain address (e.g. TRON / Ethereum)"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-gray-900 focus:outline-none focus:border-[#007F4E] transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#14171A] block mb-1">
                Purpose code
              </label>
              <div className="relative">
                <select
                  value={purposeCode}
                  onChange={(e) => setPurposeCode(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 appearance-none pr-8 focus:outline-none focus:border-[#007F4E] transition"
                >
                  <option value="CUSTOMER_WITHDRAWAL">Customer Withdrawal / Client Return</option>
                  <option value="AFFILIATE_PAYOUT">Affiliate & Partner Commission</option>
                  <option value="VENDOR_EXPENSE">Vendor & Operational Settlement</option>
                  <option value="TREASURY_REBALANCE">Treasury & Liquidity Rebalance</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition text-center cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-xl text-xs font-semibold transition text-center shadow-xs cursor-pointer"
              >
                Review payout
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleFinalSubmit} className="pt-4 space-y-4 text-xs">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                <span className="text-gray-500">Payout Amount</span>
                <span className="font-bold text-gray-900 text-sm">{amount} {currentCurrency}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                <span className="text-gray-500">Network / Protocol</span>
                <span className="font-semibold text-gray-800">{assetNetwork}</span>
              </div>
              <div className="flex justify-between items-start border-b border-gray-200/60 pb-2">
                <span className="text-gray-500">Destination</span>
                <span className="font-mono text-gray-800 text-xs max-w-[220px] break-all text-right">{destinationAddress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Purpose</span>
                <span className="font-medium text-gray-800">{purposeCode}</span>
              </div>
            </div>

            {parseFloat(amount) > 5000 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs leading-relaxed">
                <span className="font-bold block mb-0.5">Additional approval required</span>
                Payouts exceeding $5,000.00 require a second authorized approver before dispatch.
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-[#14171A] block mb-1">
                Security Authorization (2FA)
              </label>
              <input
                type="text"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="Enter 6-digit authenticator code"
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono text-xs text-gray-900 focus:outline-none focus:border-[#007F4E] transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition text-center cursor-pointer"
              >
                Back to Edit
              </button>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-xl text-xs font-bold transition text-center shadow-xs cursor-pointer"
              >
                Confirm & Dispatch
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};

export interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteSwap?: () => void;
}

export const SwapModal: React.FC<SwapModalProps> = ({ isOpen, onClose, onExecuteSwap }) => {
  const dialogRef = useDialogBehavior(isOpen, onClose);
  const [fromAmount, setFromAmount] = useState('1000');
  const [fromToken, setFromToken] = useState('USDT (TRON)');
  const [toToken, setToToken] = useState('USDC (ERC-20)');

  if (!isOpen) return null;

  const handleSwap = () => {
    onExecuteSwap?.();
    onClose();
  };

  const handleFlip = () => {
    const prev = fromToken;
    setFromToken(toToken);
    setToToken(prev);
  };

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Instant Convert</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="py-4 space-y-4">
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
            <span className="text-xs text-gray-500">You pay</span>
            <div className="flex items-center justify-between mt-1">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="bg-transparent text-lg font-bold text-gray-900 outline-none w-1/2"
              />
              <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-800 shadow-sm">
                {fromToken}
              </span>
            </div>
          </div>
          <div className="flex justify-center -my-2">
            <button
              type="button"
              onClick={handleFlip}
              title="Flip Direction"
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 flex items-center justify-center text-gray-600 shadow-sm cursor-pointer transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
            <span className="text-xs text-gray-500">You receive (Estimated)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-bold text-[#007F4E]">{fromAmount}</span>
              <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-800 shadow-sm">
                {toToken}
              </span>
            </div>
          </div>
          <div className="text-xs text-[#6B7280] flex justify-between px-1">
            <span>Exchange rate</span>
            <span className="text-gray-700 font-medium">Live rate unavailable in demo</span>
          </div>
          <button
            onClick={handleSwap}
            className="w-full py-3 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
          >
            Confirm Conversion
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
