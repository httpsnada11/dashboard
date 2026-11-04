import React, { useState } from 'react';
import { AlertCircle, FileText, Download, Key, Lock, Play, RotateCcw, ExternalLink, Copy, Check, ShieldCheck, Smartphone, ArrowRight } from 'lucide-react';

export const SectionView = ({
  activeTab,
  onOpenDeposit,
  onOpenPayout,
  onOpenDevModal,
  onOpenSecurityModal
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [apiKey, setApiKey] = useState('cpy_live_948f21e04a918bca48721c09');
  const [twoFactor, setTwoFactor] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(true);

  if (activeTab === 'deposits') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-[11px] text-gray-400 font-medium">Total Deposited (30d)</span>
            <p className="text-xl font-bold text-gray-900 mt-0.5">$1,482,900.00</p>
            <span className="text-[10px] text-emerald-600 font-semibold">↑ +14.2% vs last month</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-[11px] text-gray-400 font-medium">Active Deposit Channels</span>
            <p className="text-xl font-bold text-gray-900 mt-0.5">12 Dedicated Nodes</p>
            <span className="text-[10px] text-gray-500">TRON, Ethereum, Polygon</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-[11px] text-gray-400 font-medium">Avg Settlement Speed</span>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">2.4 mins</p>
            <span className="text-[10px] text-gray-500">99.98% automated credit</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-bold text-gray-900">Dedicated Merchant Receiving Addresses</span>
            <button
              onClick={onOpenDeposit}
              className="px-3 py-1.5 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              + Generate New Address
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-800">USDT · TRON (TRC-20)</p>
                <p className="font-mono text-gray-500 text-[11px]">TYK9A3XmUqZ9z8VnLw7h4Jb1k8Pq5D2gXy</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100/70 text-[#00824E] text-[10px] font-semibold rounded">Active</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-800">USDT · Ethereum (ERC-20)</p>
                <p className="font-mono text-gray-500 text-[11px]">0x71C..98a2</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100/70 text-[#00824E] text-[10px] font-semibold rounded">Active</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'exceptions') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200/60 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div className="text-xs text-amber-900">
              <strong className="font-semibold">1 Pending Exception:</strong> Reference <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">dep_8Hp9..co2</code> was received with slight confirmation delay on Ethereum block 219804.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-medium pb-2">
                  <th className="py-2">Reference</th>
                  <th className="py-2">Reason</th>
                  <th className="py-2">Network</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td className="py-2.5 font-semibold text-gray-900">dep_8Hp9..co2</td>
                  <td className="py-2.5 text-amber-700 font-medium">Late block confirmation</td>
                  <td className="py-2.5 text-gray-600">USDC · ERC-20</td>
                  <td className="py-2.5 font-semibold text-[#00C076]">+ 950.00</td>
                  <td className="py-2.5 text-right">
                    <button className="px-3 py-1 bg-[#00C076] text-white rounded-lg text-xs font-semibold hover:bg-[#00AA67]">
                      Approve & Credit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'payouts') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-[11px] text-gray-400">Scheduled for Tomorrow</span>
              <p className="text-xl font-bold text-gray-900 mt-0.5">$4,200.00 USDT</p>
              <p className="text-[10px] text-amber-600 mt-1">1 payout awaiting administrator dual-signature</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-[11px] text-gray-400">Total Disbursed (7d)</span>
              <p className="text-xl font-bold text-gray-900 mt-0.5">$128,450.00 USDT</p>
              <p className="text-[10px] text-gray-500 mt-1">Average gas fee: $0.85 per transaction</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-900">Dispatch Outbound Payout</h4>
            <p className="text-xs text-gray-500">Send USDT or USDC instantly to external partner addresses</p>
          </div>
          <button
            onClick={onOpenPayout}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            + Create Single / Batch Payout
          </button>
        </div>
      </div>
    );
  }

  if (activeTab === 'balances') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500">Tether (USDT)</span>
              <span className="px-1.5 py-0.5 bg-emerald-50 text-[#00C076] text-[9px] font-bold rounded">TRC-20 & ERC-20</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">56,768.98</p>
            <p className="text-[11px] text-gray-400 mt-0.5">≈ $56,768.98 USD</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500">USD Coin (USDC)</span>
              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded">ERC-20</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">14,250.00</p>
            <p className="text-[11px] text-gray-400 mt-0.5">≈ $14,250.00 USD</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500">Euro Coin (EURC)</span>
              <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[9px] font-bold rounded">ERC-20</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">8,410.20</p>
            <p className="text-[11px] text-gray-400 mt-0.5">≈ $9,120.50 USD</p>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'convert') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm max-w-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-900">Stablecoin FX Exchange</span>
            <span className="text-[11px] text-[#00C076] font-semibold">Zero slippage pool</span>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-[10px] text-gray-400 font-medium">You Pay</span>
              <div className="flex items-center justify-between mt-1">
                <input type="number" defaultValue="1000" className="bg-transparent font-bold text-lg text-gray-900 outline-none w-1/2" />
                <span className="px-2.5 py-1 bg-white rounded-lg text-xs font-semibold text-gray-800 shadow-sm">USDT (TRON)</span>
              </div>
            </div>
            <div className="flex justify-center -my-2">
              <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm">
                <RotateCcw className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-[10px] text-gray-400 font-medium">You Receive (Guaranteed)</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-lg text-[#00C076]">1,000.00</span>
                <span className="px-2.5 py-1 bg-white rounded-lg text-xs font-semibold text-gray-800 shadow-sm">USDC (ERC-20)</span>
              </div>
            </div>
            <button className="w-full py-2.5 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-xl text-xs font-bold shadow-md transition">
              Convert Instantly
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'statements') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-xs font-bold text-gray-900">Monthly Reconciliation Statement - October 2026</p>
                <p className="text-[10px] text-gray-400">PDF & CSV · Generated Nov 1, 2026</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100">
              <Download className="w-3 h-3" /> Download
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-xs font-bold text-gray-900">Quarterly Tax & AML Audit Ledger - Q3 2026</p>
                <p className="text-[10px] text-gray-400">Certified SHA-256 Hash Digest</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100">
              <Download className="w-3 h-3" /> Download
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'developers') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 flex items-center justify-between mb-1.5">
              <span>Production Secret API Key</span>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" /> Encrypted Vault
              </span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono text-xs text-gray-800 select-all truncate">
                {apiKey}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(apiKey);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
              >
                {copiedKey ? <Check className="w-3 h-3 text-[#00C076]" /> : <Copy className="w-3 h-3" />}
                {copiedKey ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={() => setApiKey('cpy_live_' + Math.random().toString(36).substring(2, 15))}
                title="Rotate Key"
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-500">API Documentation and SDK libraries</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-[#00C076] font-semibold flex items-center gap-1 hover:underline">
              API Specs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'team-security') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-xs font-bold text-gray-900">Two-Factor Authentication (2FA)</p>
                <p className="text-[10px] text-gray-500">Hardware token or authenticator app</p>
              </div>
            </div>
            <button
              onClick={() => setTwoFactor(!twoFactor)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                twoFactor ? 'bg-[#00C076]' : 'bg-gray-300'
              }`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${twoFactor ? 'translate-x-4' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-xs font-bold text-gray-900">Strict IP & Wallet Whitelist</p>
                <p className="text-[10px] text-gray-500">Only verified merchant endpoints</p>
              </div>
            </div>
            <button
              onClick={() => setIpWhitelist(!ipWhitelist)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                ipWhitelist ? 'bg-[#00C076]' : 'bg-gray-300'
              }`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${ipWhitelist ? 'translate-x-4' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'settings') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3 max-w-lg">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Merchant Business Name</label>
            <input
              type="text"
              defaultValue="CopyM Pay Global LLC"
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Primary Settlement Currency</label>
            <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800">
              <option>USDT (Tether USD)</option>
              <option>USDC (USD Coin)</option>
              <option>EURC (Euro Coin)</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
