import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Copy,
  Check,
  ChevronRight,
  X,
  Key,
  PauseCircle,
  PlayCircle,
  Building2
} from 'lucide-react';
import { AdminPayoutItem, AdminPayoutStatus } from '../types';
import {
  AdminComplianceConfirmModal,
  AdminDialog,
} from '../components/AdminComplianceConfirmModal';
import { appendAuditEvent } from '../utils/auditLogStore';
import { getPayoutRisk, IDS, MERCHANT, PLATFORM } from '../utils/sharedMockStore';

const INITIAL_ADMIN_PAYOUTS: AdminPayoutItem[] = [
  {
    id: 'payout_8401',
    payoutRef: IDS.payouts.secondary,
    merchantName: MERCHANT.name,
    merchantId: 'mer_01',
    makerName: 'Owen Shah (Merchant Finance)',
    makerRole: 'Merchant Payout Creator',
    amount: '8,750.00 USDC',
    numericAmount: 8750,
    network: 'USDC · ERC-20',
    destinationAddress: '0x4d8A..71bE',
    fullAddress: '0x4d8a9c71f03be58d26a4e7b91c0f3a8d65e2471b',
    destinationType: 'FIRST-PARTY DEPOSIT',
    kytRiskScore: getPayoutRisk(IDS.payouts.secondary).score,
    kytRiskLevel: 'Low',
    mpcStatus: '1/2 Signed',
    status: 'Pending Checker',
    createdAt: '14 mins ago'
  },
  {
    id: 'payout_8402',
    payoutRef: IDS.payouts.primary,
    merchantName: MERCHANT.name,
    merchantId: 'mer_02',
    makerName: 'Maya Iqbal (VP Finance)',
    makerRole: 'Merchant Payout Creator',
    amount: '14,200.00 USDT',
    numericAmount: 14200,
    network: 'USDT · TRON',
    destinationAddress: 'TNq7..QzT',
    fullAddress: 'TNq7Vb2KpR9mDxW4sL6aHj8YuE3cF1nQzT',
    destinationType: 'VENDOR SETTLEMENT',
    kytRiskScore: getPayoutRisk(IDS.payouts.primary).score,
    kytRiskLevel: getPayoutRisk(IDS.payouts.primary).level,
    mpcStatus: '0/2 Signed',
    status: 'Compliance Hold',
    holdReason: 'Destination address velocity spike & risk-vendor cluster flag',
    createdAt: '32 mins ago'
  },
  {
    id: 'payout_8403',
    payoutRef: 'PAY-8403',
    merchantName: 'Prime Liquidity Hub',
    merchantId: 'mer_03',
    makerName: 'David Al-Mansoor (Treasury)',
    makerRole: 'Merchant Payout Creator',
    amount: '35,000.00 USDT',
    numericAmount: 35000,
    network: 'USDT · ERC-20',
    destinationAddress: '0x91F2..3cA8',
    fullAddress: '0x91f2d48ae615b09c3f7a2e6d845c10b9a7e63f28',
    destinationType: 'OTC LIQUIDITY POOL',
    kytRiskScore: 12,
    kytRiskLevel: 'Clean',
    mpcStatus: '1/2 Signed',
    status: 'Pending Checker',
    createdAt: '48 mins ago'
  },
  {
    id: 'payout_8404',
    payoutRef: 'PAY-8404',
    merchantName: 'Meridian Trading Ltd',
    merchantId: 'mer_04',
    makerName: PLATFORM.maker,
    makerRole: 'Platform Operator',
    checkerName: PLATFORM.checker,
    amount: '120,000.00 USDC',
    numericAmount: 120000,
    network: 'USDC · SOLANA',
    destinationAddress: '7XqP..DjA',
    fullAddress: '7XqP9b3Kf2Lm8Vc4Rn6Tq1Wz5Hy7DjA',
    destinationType: 'TREASURY CONSOLIDATION',
    kytRiskScore: 4,
    kytRiskLevel: 'Clean',
    mpcStatus: '2/2 Quorum Met',
    status: 'Completed',
    createdAt: '2 hrs ago'
  },
  {
    id: 'payout_8405',
    payoutRef: 'PAY-8405',
    merchantName: MERCHANT.name,
    merchantId: 'mer_01',
    makerName: 'Maya Iqbal (Affiliate Ops)',
    makerRole: 'Merchant Payout Creator',
    checkerName: PLATFORM.checker,
    amount: '5,100.00 USDT',
    numericAmount: 5100,
    network: 'USDT · TRON',
    destinationAddress: 'TR7N..SgjL',
    fullAddress: 'TR7Nc4mKpQ9vBx2Ws5Dh8Yt3Rf6Au1EzL',
    destinationType: 'AFFILIATE COMMISSION',
    kytRiskScore: 18,
    kytRiskLevel: 'Low',
    mpcStatus: '2/2 Quorum Met',
    status: 'Completed',
    createdAt: '3 hrs ago'
  }
];

interface PendingPayoutAction {
  type: 'hold' | 'approve' | 'release' | 'bulk-approve' | 'bulk-hold';
  title: string;
  description: string;
  actionLabel: string;
  targetEntity: string;
  severity: 'Critical' | 'Warning' | 'Info';
  variant: 'primary' | 'destructive';
  payoutRef?: string;
}

export const AdminPayoutsPage: React.FC = () => {
  const [payouts, setPayouts] = useState<AdminPayoutItem[]>(INITIAL_ADMIN_PAYOUTS);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'hold' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inspectPayout, setInspectPayout] = useState<AdminPayoutItem | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingPayoutAction | null>(null);
  const [mpcSuccessMessage, setMpcSuccessMessage] = useState<string | null>(null);

  const showSuccess = (message: string) => {
    setMpcSuccessMessage(message);
    setTimeout(() => setMpcSuccessMessage(null), 4000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    appendAuditEvent({
      action: 'Payout Address Copied',
      target: `${id} · ${text.slice(0, 14)}`,
      reasonCode: 'Manual Review Completed (Evidence Attached)',
      note: 'Beneficiary address copied for verification.',
      severity: 'Info',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPayouts = payouts.filter((p) => {
    const matchesFilter =
      filterTab === 'all' ||
      (filterTab === 'pending' && p.status === 'Pending Checker') ||
      (filterTab === 'hold' && p.status === 'Compliance Hold') ||
      (filterTab === 'completed' && p.status === 'Completed');

    const matchesSearch =
      searchQuery === '' ||
      p.payoutRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.makerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.destinationAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fullAddress.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    if (selectedIds.length === filteredPayouts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPayouts.map((p) => p.id));
    }
  };

  const openPayoutAction = (type: 'hold' | 'approve' | 'release', payout: AdminPayoutItem) => {
    const copy: Record<typeof type, PendingPayoutAction> = {
      hold: {
        type: 'hold',
        title: 'Place Payout on Compliance Hold',
        description: `Freeze ${payout.payoutRef} for ${payout.merchantName} (${payout.amount}) pending AML review.`,
        actionLabel: 'Confirm Hold',
        targetEntity: `${payout.payoutRef} · ${payout.merchantName} · ${payout.amount}`,
        severity: 'Critical',
        variant: 'destructive',
        payoutRef: payout.payoutRef,
      },
      approve: {
        type: 'approve',
        title: 'Co-Sign Payout as Checker',
        description: `Authorize ${payout.amount} to ${payout.destinationAddress} for ${payout.merchantName}. Requires reason, note and checker 2FA.`,
        actionLabel: 'Confirm Co-Sign',
        targetEntity: `${payout.payoutRef} · ${payout.merchantName} · ${payout.amount}`,
        severity: 'Warning',
        variant: 'primary',
        payoutRef: payout.payoutRef,
      },
      release: {
        type: 'release',
        title: 'Release Compliance Hold',
        description: `Return ${payout.payoutRef} to the checker queue after documented review of the hold reason.`,
        actionLabel: 'Confirm Release',
        targetEntity: `${payout.payoutRef} · ${payout.merchantName} · ${payout.amount}`,
        severity: 'Critical',
        variant: 'primary',
        payoutRef: payout.payoutRef,
      },
    };
    setPendingAction(copy[type]);
  };

  const openBulkAction = (type: 'bulk-approve' | 'bulk-hold') => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    setPendingAction({
      type,
      title: type === 'bulk-approve' ? 'Bulk Co-Sign Payouts' : 'Bulk Compliance Hold',
      description:
        type === 'bulk-approve'
          ? `Authorize ${count} selected payout(s) with an independent checker and 2FA.`
          : `Place ${count} selected payout(s) on compliance hold with an independent checker and 2FA.`,
      actionLabel: type === 'bulk-approve' ? 'Confirm Bulk Co-Sign' : 'Confirm Bulk Hold',
      targetEntity: `${count} selected payout(s)`,
      severity: type === 'bulk-approve' ? 'Warning' : 'Critical',
      variant: type === 'bulk-approve' ? 'primary' : 'destructive',
    });
  };

  const handleConfirmAction = (reasonCode: string, note: string, checker: string) => {
    if (!pendingAction) return;
    const action = pendingAction;
    const selected = [...selectedIds];

    if (action.type === 'hold') {
      const payout = payouts.find((p) => p.payoutRef === action.payoutRef);
      setPayouts((prev) =>
        prev.map((item) =>
          item.payoutRef === action.payoutRef
            ? {
                ...item,
                status: 'Compliance Hold' as AdminPayoutStatus,
                holdReason: `${reasonCode} — ${note}`,
                mpcStatus: '0/2 Signed',
              }
            : item
        )
      );
      showSuccess(`Compliance hold placed on ${payout?.payoutRef ?? 'payout'}.`);
    } else if (action.type === 'approve') {
      setPayouts((prev) =>
        prev.map((item) =>
          item.payoutRef === action.payoutRef
            ? {
                ...item,
                status: 'Completed' as AdminPayoutStatus,
                checkerName: checker,
                mpcStatus: '2/2 Quorum Met',
              }
            : item
        )
      );
      showSuccess(`Payout ${action.payoutRef} co-signed and broadcast.`);
    } else if (action.type === 'release') {
      setPayouts((prev) =>
        prev.map((item) =>
          item.payoutRef === action.payoutRef
            ? {
                ...item,
                status: 'Pending Checker' as AdminPayoutStatus,
                holdReason: undefined,
                mpcStatus: '1/2 Signed',
              }
            : item
        )
      );
      showSuccess(`Compliance hold released for ${action.payoutRef}.`);
    } else if (action.type === 'bulk-approve') {
      setPayouts((prev) =>
        prev.map((item) =>
          selected.includes(item.id) && item.status === 'Pending Checker'
            ? {
                ...item,
                status: 'Completed' as AdminPayoutStatus,
                checkerName: checker,
                mpcStatus: '2/2 Quorum Met',
              }
            : item
        )
      );
      showSuccess(`Co-signed ${selected.length} payout(s) with checker verification.`);
    } else {
      setPayouts((prev) =>
        prev.map((item) =>
          selected.includes(item.id)
            ? {
                ...item,
                status: 'Compliance Hold' as AdminPayoutStatus,
                checkerName: checker,
                holdReason: `${reasonCode} — ${note}`,
                mpcStatus: '0/2 Signed',
              }
            : item
        )
      );
      showSuccess(`Placed compliance hold on ${selected.length} payout(s).`);
    }

    setInspectPayout(null);
    setSelectedIds([]);
    setPendingAction(null);
  };

  const pendingCount = payouts.filter((p) => p.status === 'Pending Checker').length;
  const pendingTotal = payouts
    .filter((p) => p.status === 'Pending Checker')
    .reduce((sum, p) => sum + p.numericAmount, 0);
  const holdCount = payouts.filter((p) => p.status === 'Compliance Hold').length;
  const completedCount = payouts.filter((p) => p.status === 'Completed').length;
  const settledTotal = payouts
    .filter((p) => p.status === 'Completed')
    .reduce((sum, p) => sum + p.numericAmount, 0);

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#14171A] to-slate-900 text-white border border-slate-700/60 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center border border-white/15 flex-shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Platform Maker-Checker & MPC Dual-Control Queue
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-2xs">
                {pendingCount} Awaiting Checker
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Independent platform checker sign-off and 2FA are required for every payout approval.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <div className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold text-emerald-300 border border-white/15 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Checker Keys Online</span>
          </div>
        </div>
      </div>

      {mpcSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#007F4E]" />
            <span>{mpcSuccessMessage}</span>
          </div>
          <button
            onClick={() => setMpcSuccessMessage(null)}
            className="text-[#007F4E] hover:text-emerald-800 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
          <span className="text-xs text-[#6B7280] font-semibold uppercase tracking-wider block mb-1">
            Pending Checker
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{pendingCount}</span>
            <span className="text-xs font-semibold text-amber-600">
              ${pendingTotal.toLocaleString()} total
            </span>
          </div>
          <span className="text-xs text-[#6B7280] mt-1 block">Awaiting second keyholder</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
          <span className="text-xs text-[#6B7280] font-semibold uppercase tracking-wider block mb-1">
            Compliance Holds
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600">{holdCount}</span>
            <span className="text-xs font-semibold text-red-500">Under review</span>
          </div>
          <span className="text-xs text-[#6B7280] mt-1 block">Requires AML investigation</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
          <span className="text-xs text-[#6B7280] font-semibold uppercase tracking-wider block mb-1">
            Checker Quorum
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#007F4E]">2 of 3</span>
            <span className="text-xs font-semibold text-[#007F4E]">Threshold Active</span>
          </div>
          <span className="text-xs text-[#6B7280] mt-1 block">Dual authorization enforced</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
          <span className="text-xs text-[#6B7280] font-semibold uppercase tracking-wider block mb-1">
            24h Settled Outflows
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">${settledTotal.toLocaleString()}</span>
            <span className="text-xs font-semibold text-[#007F4E]">{completedCount} Settled</span>
          </div>
          <span className="text-xs text-[#6B7280] mt-1 block">Finalized payouts</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none -mx-1 px-1 flex-nowrap shrink-0">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-[#6B7280] hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              All Payouts ({payouts.length})
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
                filterTab === 'pending'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-[#6B7280] hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Pending Checker ({pendingCount})
            </button>
            <button
              onClick={() => setFilterTab('hold')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
                filterTab === 'hold'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-[#6B7280] hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Compliance Hold ({holdCount})
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
                filterTab === 'completed'
                  ? 'bg-[#007F4E] text-white shadow-2xs'
                  : 'text-[#6B7280] hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
            {selectedIds.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => openBulkAction('bulk-approve')}
                  className="px-3 py-1.5 bg-[#007F4E] hover:bg-[#00663E] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Co-Sign Selected ({selectedIds.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => openBulkAction('bulk-hold')}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <PauseCircle className="w-3.5 h-3.5" />
                  <span>Hold Selected ({selectedIds.length})</span>
                </button>
              </>
            )}

            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search payout ref, merchant, address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#007F4E]"
              />
            </div>
          </div>
        </div>

        <div className="table-scroll">
          <table className="w-full text-left text-xs min-w-[1040px]">
            <thead className="bg-gray-50/75 border-b border-gray-100 text-[#6B7280] uppercase text-xs tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 w-10 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredPayouts.length}
                    onChange={selectAllFiltered}
                    className="rounded text-[#007F4E] focus:ring-[#007F4E]"
                  />
                </th>
                <th className="py-3 px-4 whitespace-nowrap">Payout Ref / Merchant / Maker</th>
                <th className="py-3 px-4 whitespace-nowrap">Amount & Network</th>
                <th className="py-3 px-4 whitespace-nowrap">Destination Address</th>
                <th className="py-3 px-4 whitespace-nowrap">KYT Risk Score</th>
                <th className="py-3 px-4 whitespace-nowrap">MPC Quorum</th>
                <th className="py-3 px-4 whitespace-nowrap min-w-[140px]">Status</th>
                <th className="py-3 px-4 text-right whitespace-nowrap min-w-[190px] sticky right-0 bg-gray-50 z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.03)]">
                  Checker Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayouts.map((payout) => {
                const isSelected = selectedIds.includes(payout.id);

                return (
                  <tr
                    key={payout.id}
                    className={`hover:bg-gray-50/60 transition ${isSelected ? 'bg-emerald-50/40' : ''}`}
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(payout.id)}
                        className="rounded text-[#007F4E] focus:ring-[#007F4E]"
                      />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                        <span>{payout.payoutRef}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#6B7280] mt-0.5">
                        <Building2 className="w-3 h-3 text-[#6B7280]" />
                        <span>{payout.merchantName}</span>
                      </div>
                      <div className="text-xs text-[#6B7280] mt-0.5">{payout.makerName}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900 text-sm">{payout.amount}</div>
                      <span className="text-xs font-medium text-[#6B7280]">{payout.network}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-gray-700">
                        <span>{payout.destinationAddress}</span>
                        <button
                          onClick={() => handleCopy(payout.fullAddress, payout.id)}
                          className="text-[#6B7280] hover:text-gray-900 transition cursor-pointer"
                          title="Copy Full Address"
                        >
                          {copiedId === payout.id ? (
                            <Check className="w-3 h-3 text-[#007F4E]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <span className="text-xs uppercase font-bold text-[#6B7280] tracking-wider">
                        {payout.destinationType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            payout.kytRiskLevel === 'Clean'
                              ? 'bg-emerald-500'
                              : payout.kytRiskLevel === 'Low' || payout.kytRiskLevel === 'Medium'
                                ? 'bg-amber-500'
                                : 'bg-red-500 animate-pulse'
                          }`}
                        />
                        <span
                          className={`font-semibold ${
                            payout.kytRiskLevel === 'Clean'
                              ? 'text-[#007F4E]'
                              : payout.kytRiskLevel === 'Low' || payout.kytRiskLevel === 'Medium'
                                ? 'text-amber-700'
                                : 'text-red-700'
                          }`}
                        >
                          Score {payout.kytRiskScore} ({payout.kytRiskLevel})
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          payout.mpcStatus === '2/2 Quorum Met'
                            ? 'bg-emerald-50 text-[#007F4E] border border-emerald-200'
                            : payout.mpcStatus === '1/2 Signed'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-gray-100 text-[#6B7280] border border-gray-200'
                        }`}
                      >
                        <Lock className="w-2.5 h-2.5 shrink-0" />
                        <span>{payout.mpcStatus}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">
                      {payout.status === 'Pending Checker' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap shrink-0">
                          Pending Checker
                        </span>
                      )}
                      {payout.status === 'Compliance Hold' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap shrink-0">
                          Compliance Hold
                        </span>
                      )}
                      {payout.status === 'Completed' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#007F4E] border border-emerald-200 whitespace-nowrap shrink-0">
                          Completed
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap min-w-[190px] sticky right-0 bg-white z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.03)]">
                      <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                        {payout.status === 'Pending Checker' && (
                          <>
                            <button
                              onClick={() => openPayoutAction('approve', payout)}
                              className="px-3 py-1.5 bg-[#007F4E] hover:bg-[#00663E] text-white rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
                              title="Co-Sign as Platform Checker"
                            >
                              <Key className="w-3.5 h-3.5 shrink-0" />
                              <span>Co-Sign</span>
                            </button>
                            <button
                              onClick={() => openPayoutAction('hold', payout)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
                              title="Place on Compliance Hold"
                            >
                              <PauseCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                              <span>Hold</span>
                            </button>
                          </>
                        )}

                        {payout.status === 'Compliance Hold' && (
                          <button
                            onClick={() => openPayoutAction('release', payout)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#007F4E] border border-emerald-200 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
                            title="Release Compliance Hold"
                          >
                            <PlayCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Release</span>
                          </button>
                        )}

                        <button
                          onClick={() => setInspectPayout(payout)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-[#6B7280] hover:text-gray-700 transition cursor-pointer shrink-0 ml-0.5"
                          title="Inspect Payout Lifecycle"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AdminDialog
        isOpen={!!inspectPayout}
        onClose={() => setInspectPayout(null)}
        className="flex items-center justify-end bg-black/50 backdrop-blur-sm"
        ariaLabel="Payout lifecycle"
      >
        {inspectPayout && (
          <div className="bg-white h-full w-full max-w-full sm:max-w-lg shadow-2xl p-4 sm:p-6 overflow-y-auto space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#007F4E] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Payout Dossier
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{inspectPayout.payoutRef}</h3>
                <p className="text-xs text-[#6B7280]">
                  {inspectPayout.merchantName} ({inspectPayout.merchantId})
                </p>
              </div>
              <button
                onClick={() => setInspectPayout(null)}
                className="p-1 rounded-lg text-[#6B7280] hover:text-gray-700 hover:bg-gray-100 transition"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inspectPayout.status === 'Compliance Hold' && inspectPayout.holdReason && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Active Compliance Hold Reason
                </span>
                <p className="text-xs text-red-700">{inspectPayout.holdReason}</p>
                <div className="pt-2">
                  <button
                    onClick={() => openPayoutAction('release', inspectPayout)}
                    className="px-3 py-1 bg-[#007F4E] hover:bg-[#00663E] text-white rounded-lg text-xs font-bold transition"
                  >
                    Release Hold With Sign-Off
                  </button>
                </div>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-2xl text-xs space-y-3">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Gross Outflow:</span>
                <span className="font-bold text-gray-900">{inspectPayout.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Network / Protocol:</span>
                <span className="font-semibold text-gray-900">{inspectPayout.network}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[#6B7280]">Beneficiary Address:</span>
                <span className="font-mono font-semibold text-gray-900 text-right break-all max-w-[220px]">
                  {inspectPayout.fullAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">KYT Threat Level:</span>
                <span className="font-bold text-[#007F4E]">
                  Score {inspectPayout.kytRiskScore} ({inspectPayout.kytRiskLevel})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">MPC Multi-Sig Quorum:</span>
                <span className="font-bold text-gray-900">{inspectPayout.mpcStatus}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Maker-Checker Audit Trail
              </h4>
              <div className="space-y-2 text-xs border-l-2 border-emerald-500 pl-3">
                <div>
                  <span className="font-bold text-gray-900">1. Payout Initiated by Maker</span>
                  <p className="text-[#6B7280]">
                    {inspectPayout.makerName} ({inspectPayout.makerRole})
                  </p>
                  <span className="text-xs text-[#6B7280]">{inspectPayout.createdAt}</span>
                </div>
                <div className="pt-2">
                  <span className="font-bold text-gray-900">2. Automated KYT Screening</span>
                  <p className="text-[#6B7280]">Screening passed · 2FA verified</p>
                </div>
                <div className="pt-2">
                  <span className="font-bold text-gray-900">3. Platform Checker Sign-off</span>
                  <p className="text-[#6B7280]">
                    {inspectPayout.checkerName || 'Awaiting independent checker verification'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminDialog>

      {pendingAction && (
        <AdminComplianceConfirmModal
          isOpen={true}
          title={pendingAction.title}
          description={pendingAction.description}
          actionLabel={pendingAction.actionLabel}
          targetEntity={pendingAction.targetEntity}
          severity={pendingAction.severity}
          variant={pendingAction.variant}
          requireSecondApprover
          onClose={() => setPendingAction(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
};

export default AdminPayoutsPage;
