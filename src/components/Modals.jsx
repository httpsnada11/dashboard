import React, { useState } from 'react';
import { X, Key, Lock, Play, RotateCcw, ExternalLink, Copy, Check, Shield, AlertTriangle, ArrowRight } from 'lucide-react';

// Developer Modal highlighting Key, Lock, Play, RotateCcw, ExternalLink
export const DeveloperModal = ({ isOpen, onClose, onSimulateWebhook }) => {
  const [apiKey, setApiKey] = useState('cpy_live_948f21e04a918bca48721c09');
  const [copied, setCopied] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState('idle');

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00C076] flex items-center justify-center">
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

        {/* Content */}
        <div className="py-5 space-y-4">
          {/* API Key Box */}
          <div>
            <label className="text-xs font-semibold text-gray-700 flex items-center justify-between mb-1.5">
              <span>Production Secret Key</span>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" /> Encrypted Vault
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
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleRotateKey}
                title="Rotate Secret Key (RotateCcw)"
                className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Webhook Simulator Action */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-800">Webhook Event Dispatcher</h4>
                <p className="text-[11px] text-gray-500">Dispatch a test deposit notification payload</p>
              </div>
              <button
                onClick={handleRunWebhookTest}
                disabled={webhookStatus === 'testing'}
                className="px-3 py-1.5 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
              >
                {webhookStatus === 'testing' ? (
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-white" />
                )}
                {webhookStatus === 'testing' ? 'Sending...' : 'Test Webhook (Play)'}
              </button>
            </div>
            {webhookStatus === 'success' && (
              <div className="mt-3 p-2 bg-emerald-100/60 text-[#00824E] text-xs rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00C076]" />
                Webhook 200 OK: Deposit event dep_8Hq2..f31 received
              </div>
            )}
          </div>

          {/* Docs Link */}
          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-gray-500">Read the complete API specifications</span>
            <a
              href="https://docs.copym.pay"
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.preventDefault()}
              className="text-[#00C076] hover:underline font-semibold flex items-center gap-1"
            >
              API Reference Docs
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// Deposit Modal
export const DepositModal = ({ isOpen, onClose, onAddDeposit }) => {
  const [network, setNetwork] = useState('USDT · TRON');
  const [amount, setAmount] = useState('1000');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;
    onAddDeposit({
      type: 'Deposit',
      reference: `dep_${Math.random().toString(36).substring(2, 6)}..${Math.random().toString(36).substring(2, 5)}`,
      customer: `cust_${Math.floor(10000 + Math.random() * 90000)}`,
      network: network,
      amount: `+ ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      status: 'Credited',
      time: 'Just now'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Receive Crypto Deposit</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Select Network</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-[#00C076]"
            >
              <option value="USDT · TRON">USDT · TRON (TRC-20)</option>
              <option value="USDT · ERC-20">USDT · Ethereum (ERC-20)</option>
              <option value="USDC · ERC-20">USDC · Ethereum (ERC-20)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Deposit Amount (US$)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 2500"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#00C076]"
            />
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
            <p className="text-[11px] text-gray-500">Deposit Address (TRON):</p>
            <p className="text-xs font-mono font-medium text-gray-800 break-all select-all mt-1">
              TYK9A3XmUqZ9z8VnLw7h4Jb1k8Pq5D2gXy
            </p>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            Confirm Simulated Deposit
          </button>
        </form>
      </div>
    </div>
  );
};

// Payout Modal
export const PayoutModal = ({ isOpen, onClose, onAddPayout }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('500');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;
    onAddPayout({
      type: 'Payout',
      reference: `po_${Math.random().toString(36).substring(2, 5)}T..${Math.random().toString(36).substring(2, 5)}`,
      customer: `cust_${Math.floor(10000 + Math.random() * 90000)}`,
      network: 'USDT · TRON',
      amount: `- ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      status: 'Awaiting approval',
      time: 'Just now'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Create Payout</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Destination Address</label>
            <input
              type="text"
              required
              placeholder="TRON / ERC-20 Wallet Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#00C076]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Payout Amount (US$)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1000"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#00C076]"
            />
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/50 text-[11px] text-amber-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            Payouts require 2-step verification and administrator compliance sign-off.
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            Dispatch Payout Request
          </button>
        </form>
      </div>
    </div>
  );
};

// Swapp Modal
export const SwapModal = ({ isOpen, onClose, onExecuteSwap }) => {
  const [fromAmount, setFromAmount] = useState('1000');
  const [fromToken, setFromToken] = useState('USDT (TRON)');
  const [toToken, setToToken] = useState('USDC (ERC-20)');

  if (!isOpen) return null;

  const handleSwap = () => {
    onExecuteSwap?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Instant Swapp</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="py-4 space-y-4">
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
            <span className="text-[11px] text-gray-500">You pay</span>
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
            <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 shadow-sm">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
            <span className="text-[11px] text-gray-500">You receive (est.)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-bold text-[#00C076]">{fromAmount}</span>
              <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-800 shadow-sm">
                {toToken}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-gray-400 flex justify-between px-1">
            <span>Exchange rate</span>
            <span className="text-gray-700 font-medium">1 USDT = 1.00 USDC</span>
          </div>
          <button
            onClick={handleSwap}
            className="w-full py-3 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            Confirm Swapp
          </button>
        </div>
      </div>
    </div>
  );
};

