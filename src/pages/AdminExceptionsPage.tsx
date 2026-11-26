import React, { useState } from 'react';
import {
  AlertOctagon,
  RefreshCw,
  CheckCircle2,
  Search,
  Archive
} from 'lucide-react';
import { AdminComplianceConfirmModal } from '../components/AdminComplianceConfirmModal';
import { formatUsd, getReserveState, IDS, MERCHANT } from '../utils/sharedMockStore';

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
    excRef: IDS.exceptions[0],
    type: 'Expired QR Deposit',
    merchant: MERCHANT.name,
    client: 'cust_84019',
    receivedAmount: '2,500.00 USDT',
    expectedAmount: '2,500.00 USDT',
    assetChain: 'TRON (TRC-20)',
    txHash: '7a5b..9e0f',
    createdAt: '12 mins ago',
    status: 'Manually Credited'
  },
  {
    id: 'exc_02',
    excRef: IDS.exceptions[1],
    type: 'Network Mismatch',
    merchant: MERCHANT.name,
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
    excRef: IDS.exceptions[2],
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
    excRef: IDS.exceptions[5],
    type: 'Expired QR Deposit',
    merchant: 'Meridian Trading Ltd',
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
  const reserve = getReserveState();
  const hotTargetUsd = reserve.total * 0.05;
  const excessUsd = Math.max(0, reserve.hotUsd - hotTargetUsd);
  const [exceptions, setExceptions] = useState<PlatformException[]>(INITIAL_EXCEPTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepSuccess, setSweepSuccess] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'resolve' | 'sweep';
    exc?: PlatformException;
    newStatus?: PlatformException['status'];
    title: string;
    description: string;
    actionLabel: string;
    targetEntity: string;
  } | null>(null);

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

  const pendingCount = exceptions.filter((e) => e.status === 'Pending Resolution').length;
  const resolvedCount = exceptions.length - pendingCount;

  return (
    <div className="space-y-6">
      {/* Cold Storage Sweeps Control Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-gray-900 via-[#16181D] to-[#1E293B] text-white border border-gray-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#007F4E]/20 text-[#007F4E] flex items-center justify-center border border-[#007F4E]/30 flex-shrink-0">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Automated Hot-to-Cold Vault Sweeps
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Target Ratio: 95% Cold / 5% Hot · Out of policy
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Current Hot Wallet Buffer: <strong className="text-white">{formatUsd(reserve.hotUsd)} ({reserve.hotPercent}% vs 5.0% target)</strong>. Sweep threshold: <strong>{formatUsd(hotTargetUsd)}</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {sweepSuccess && (
            <span className="text-xs font-semibold text-[#007F4E] flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              {formatUsd(excessUsd)} Swept to Multi-Sig Cold Vault!
            </span>
          )}
          <button
            onClick={() =>
              setPendingAction({
                type: 'sweep',
                title: 'Trigger Cold Storage Sweep',
                description: `Execute automated hot-to-cold multi-sig sweep (${formatUsd(excessUsd)} excess buffer) to Cold Vault.`,
                actionLabel: 'Execute Sweep',
                targetEntity: `Hot Operational Buffer (${formatUsd(reserve.hotUsd)} -> ${formatUsd(hotTargetUsd)} target)`,
              })
            }
            disabled={isSweeping}
            className="w-full md:w-auto px-4 py-2.5 bg-[#007F4E] hover:bg-[#00663E] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
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
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">Payment Exceptions & SLA Queue</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                {pendingCount} Pending
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#007F4E] text-xs font-bold border border-emerald-200">
                {resolvedCount} Resolved
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Requires administrative override for unmatched chain transactions or late client deposits.
            </p>
          </div>

          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search ref, merchant, issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#007F4E]"
            />
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="lg:hidden flex items-center justify-between text-xs text-[#6B7280] mt-3 pt-2 border-t border-gray-100">
          <span>↔ Swipe horizontally to view full exception resolution queue</span>
        </div>

        {/* Exceptions Table */}
        <div className="table-scroll mt-3">
          <table className="w-full text-left text-xs border-collapse min-w-[980px]">
            <thead>
              <tr className="border-b border-gray-100 text-[#6B7280] uppercase font-semibold text-xs tracking-wider">
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
                    <span className="text-xs text-[#6B7280] block">{exc.createdAt}</span>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-xs whitespace-nowrap ${
                        exc.type === 'Expired QR Deposit'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : exc.type === 'Network Mismatch'
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-emerald-50 text-[#007F4E] border border-emerald-200'
                      }`}
                    >
                      <AlertOctagon className="w-3 h-3 shrink-0" />
                      <span>{exc.type}</span>
                    </span>
                  </td>

                  {/* Merchant / Client */}
                  <td className="py-3.5 whitespace-nowrap">
                    <p className="font-bold text-gray-900">{exc.merchant}</p>
                    <p className="text-xs text-[#6B7280] font-mono">{exc.client}</p>
                  </td>

                  {/* Amounts */}
                  <td className="py-3.5 whitespace-nowrap">
                    <p className="font-mono font-bold text-gray-900">{exc.receivedAmount}</p>
                    <p className="text-xs text-[#6B7280]">Exp: {exc.expectedAmount}</p>
                  </td>

                  {/* Network */}
                  <td className="py-3.5 whitespace-nowrap">
                    <p className="font-semibold text-gray-800">{exc.assetChain}</p>
                    <span className="text-xs font-mono text-[#6B7280]">{exc.txHash}</span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${
                        exc.status === 'Pending Resolution'
                          ? 'bg-amber-100 text-amber-800'
                          : exc.status === 'Manually Credited'
                          ? 'bg-emerald-100 text-[#007F4E]'
                          : exc.status === 'Swept to Cold Storage'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-emerald-100 text-[#007F4E]'
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
                          onClick={() =>
                            setPendingAction({
                              type: 'resolve',
                              exc,
                              newStatus: 'Manually Credited',
                              title: 'Manual Ledger Credit Override',
                              description: `Manually credit ${exc.receivedAmount} to ${exc.merchant} for ${exc.type}.`,
                              actionLabel: 'Confirm Credit',
                              targetEntity: `${exc.excRef} · ${exc.merchant} (${exc.receivedAmount})`,
                            })
                          }
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#007F4E] border border-emerald-200 rounded-lg font-bold text-xs transition cursor-pointer"
                        >
                          Credit Ledger
                        </button>
                        <button
                          onClick={() =>
                            setPendingAction({
                              type: 'resolve',
                              exc,
                              newStatus: 'Refunded',
                              title: 'Approve Exception Refund',
                              description: `Authorize return/refund of ${exc.receivedAmount} for ${exc.excRef} (${exc.merchant}).`,
                              actionLabel: 'Confirm Refund',
                              targetEntity: `${exc.excRef} · ${exc.merchant} (${exc.receivedAmount})`,
                            })
                          }
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs transition cursor-pointer"
                        >
                          Refund
                        </button>
                      </div>
                    ) : (
                      <span className="text-[#6B7280] text-xs font-medium">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pendingAction && (
        <AdminComplianceConfirmModal
          isOpen={true}
          title={pendingAction.title}
          description={pendingAction.description}
          actionLabel={pendingAction.actionLabel}
          targetEntity={pendingAction.targetEntity}
          severity={pendingAction.type === 'sweep' ? 'Critical' : 'Warning'}
          variant="primary"
          requireSecondApprover
          onClose={() => setPendingAction(null)}
          onConfirm={() => {
            if (pendingAction.type === 'sweep') {
              handleTriggerSweep();
            } else if (pendingAction.exc && pendingAction.newStatus) {
              handleResolve(pendingAction.exc.id, pendingAction.newStatus);
            }
            setPendingAction(null);
          }}
        />
      )}
    </div>
  );
};

