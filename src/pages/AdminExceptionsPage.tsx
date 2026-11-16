import React, { useState } from 'react';
import {
  AlertOctagon,
  RefreshCw,
  CheckCircle2,
  Search,
  Archive
} from 'lucide-react';

interface PlatformException {
  id: string;
  excRef: string;
  type: 'Expired QR Deposit' | 'Network Mismatch' | 'Underpayment' | 'Orphan Block';
  merchant: string;
  client: string;
  receivedAmount: string;
  expectedAmount: string;
  assetChain: string;
  txHash: string;
  createdAt: string;
  status: 'Pending Resolution' | 'Manually Credited' | 'Refunded' | 'Swept to Cold Storage';
}

const INITIAL_EXCEPTIONS: PlatformException[] = [
  {
    id: 'exc_01',
    excRef: 'EXC-8491-LATE',
    type: 'Expired QR Deposit',
    merchant: 'Eagle Vision Market Ltd',
    client: 'cust_84019',
    receivedAmount: '2,500.00 USDT',
    expectedAmount: '2,500.00 USDT',
    assetChain: 'TRON (TRC-20)',
    txHash: '7a5b..9e0f',
    createdAt: '12 mins ago',
    status: 'Pending Resolution'
  },
  {
    id: 'exc_02',
    excRef: 'EXC-8492-MISMATCH',
    type: 'Network Mismatch',
    merchant: 'Apex Forex Global',
    client: 'cust_11029',
    receivedAmount: '1,200.00 USDT',
    expectedAmount: '1,200.00 USDT',
    assetChain: 'BSC (BEP-20) instead of ERC-20',
    txHash: '0x8f4c..892a',
    createdAt: '35 mins ago',
    status: 'Pending Resolution'
  },
  {
    id: 'exc_03',
    excRef: 'EXC-8493-UNDER',
    type: 'Underpayment',
    merchant: 'Prime Liquidity Hub',
    client: 'cust_30918',
    receivedAmount: '890.00 USDC',
    expectedAmount: '1,000.00 USDC',
    assetChain: 'Ethereum (ERC-20)',
    txHash: '0x15eA..77f0',
    createdAt: '1 hr ago',
    status: 'Pending Resolution'
  },
  {
    id: 'exc_04',
    excRef: 'EXC-8488-SWEPT',
    type: 'Expired QR Deposit',
    merchant: 'Vance Capital Markets',
    client: 'cust_77182',
    receivedAmount: '10,000.00 USDT',
    expectedAmount: '10,000.00 USDT',
    assetChain: 'TRON (TRC-20)',
    txHash: 'TF7m..09xP',
    createdAt: '3 hrs ago',
    status: 'Swept to Cold Storage'
  }
];

export const AdminExceptionsPage: React.FC = () => {
  const [exceptions, setExceptions] = useState<PlatformException[]>(INITIAL_EXCEPTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepSuccess, setSweepSuccess] = useState(false);

  const handleResolve = (id: string, newStatus: PlatformException['status']) => {
    setExceptions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleTriggerSweep = () => {
    setIsSweeping(true);
    setTimeout(() => {
      setIsSweeping(false);
      setSweepSuccess(true);
      setTimeout(() => setSweepSuccess(false), 4000);
    }, 1200);
  };

  const filtered = exceptions.filter(
    (e) =>
      e.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.excRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Cold Storage Sweeps Control Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-gray-900 via-[#16181D] to-[#1E293B] text-white border border-gray-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#00C076]/20 text-[#00C076] flex items-center justify-center border border-[#00C076]/30 flex-shrink-0">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Automated Hot-to-Cold Vault Sweeps
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/20 text-[#00C076] border border-emerald-500/30">
                Target Ratio: 95% Cold / 5% Hot
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Current Hot Wallet Buffer: <strong className="text-white">$342,100</strong>. Sweep threshold: <strong>$250,000</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {sweepSuccess && (
            <span className="text-xs font-semibold text-[#00C076] flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              $92,100 Swept to Multi-Sig Cold Vault!
            </span>
          )}
          <button
            onClick={handleTriggerSweep}
            disabled={isSweeping}
            className="w-full md:w-auto px-4 py-2.5 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSweeping ? 'animate-spin' : ''}`} />
            <span>{isSweeping ? 'Executing Sweep...' : 'Trigger Cold Storage Sweep'}</span>
          </button>
        </div>
      </div>

      {/* Main Resolution Queue */}
      <div className="bg-white rounded-2xl sm:rounded-[26px] p-4 sm:p-6 shadow-xs border border-gray-100">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-5 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Payment Exceptions & SLA Queue</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Requires administrative override for unmatched chain transactions or late client deposits.
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search ref, merchant, issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C076]"
            />
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="lg:hidden flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
          <span>↔ Swipe horizontally to view full exception resolution queue</span>
          <span className="text-[#00C076] font-semibold text-[10.5px]">Touch scroll active</span>
        </div>

        {/* Exceptions Table */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs border-collapse min-w-[980px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase font-semibold text-[10.5px] tracking-wider">
                <th className="pb-3 pl-2 whitespace-nowrap">Exception Ref</th>
                <th className="pb-3 whitespace-nowrap">Issue Category</th>
                <th className="pb-3 whitespace-nowrap">Merchant / Client</th>
                <th className="pb-3 whitespace-nowrap">Received vs Expected</th>
                <th className="pb-3 whitespace-nowrap">Network & Tx</th>
                <th className="pb-3 whitespace-nowrap">Resolution Status</th>
                <th className="pb-3 pr-2 text-right whitespace-nowrap">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80">
              {filtered.map((exc) => (
                <tr key={exc.id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Ref */}
                  <td className="py-3.5 pl-2 whitespace-nowrap">
                    <span className="font-mono font-bold text-gray-900">{exc.excRef}</span>
                    <span className="text-[10px] text-gray-400 block">{exc.createdAt}</span>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10.5px] whitespace-nowrap ${
                        exc.type === 'Expired QR Deposit'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : exc.type === 'Network Mismatch'
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      <AlertOctagon className="w-3 h-3 shrink-0" />
                      <span>{exc.type}</span>
                    </span>
                  </td>

                  {/* Merchant / Client */}
                  <td className="py-3.5 whitespace-nowrap">
                    <p className="font-bold text-gray-900">{exc.merchant}</p>
                    <p className="text-[10.5px] text-gray-400 font-mono">{exc.client}</p>
                  </td>

                  {/* Amounts */}
                  <td className="py-3.5 whitespace-nowrap">
                    <p className="font-mono font-bold text-gray-900">{exc.receivedAmount}</p>
                    <p className="text-[10.5px] text-gray-400">Exp: {exc.expectedAmount}</p>
                  </td>

                  {/* Network */}
                  <td className="py-3.5 whitespace-nowrap">
                    <p className="font-semibold text-gray-800">{exc.assetChain}</p>
                    <span className="text-[10px] font-mono text-gray-400">{exc.txHash}</span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap ${
                        exc.status === 'Pending Resolution'
                          ? 'bg-amber-100 text-amber-800'
                          : exc.status === 'Manually Credited'
                          ? 'bg-emerald-100 text-[#00C076]'
                          : exc.status === 'Swept to Cold Storage'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {exc.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                    {exc.status === 'Pending Resolution' ? (
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleResolve(exc.id, 'Manually Credited')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#00C076] border border-emerald-200 rounded-lg font-bold text-[11px] transition"
                        >
                          Credit Ledger
                        </button>
                        <button
                          onClick={() => handleResolve(exc.id, 'Refunded')}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-[11px] transition"
                        >
                          Refund
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs font-medium">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

