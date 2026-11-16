import React, { useState } from 'react';
import {
  ShieldCheck,
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

const INITIAL_ADMIN_PAYOUTS: AdminPayoutItem[] = [
  {
    id: 'payout_8401',
    payoutRef: 'pay_3LX891280a9bC51',
    merchantName: 'Eagle Vision Market Ltd',
    merchantId: 'mer_01',
    makerName: 'Owen Shah (Merchant Finance)',
    makerRole: 'Merchant Payout Creator',
    amount: '8,750.00 USDC',
    numericAmount: 8750,
    network: 'USDC · ERC-20',
    destinationAddress: '0x4d8A..91eC',
    fullAddress: '0x4d8A00912cb84910ef123491eC',
    destinationType: 'FIRST-PARTY DEPOSIT',
    kytRiskScore: 8,
    kytRiskLevel: 'Clean',
    mpcStatus: '1/2 Signed',
    status: 'Pending Checker',
    createdAt: '14 mins ago'
  },
  {
    id: 'payout_8402',
    payoutRef: 'pay_7NK988201fa1B14',
    merchantName: 'Apex Forex Global',
    merchantId: 'mer_02',
    makerName: 'Elena Rostova (VP Finance)',
    makerRole: 'Merchant Payout Creator',
    amount: '14,200.00 USDT',
    numericAmount: 14200,
    network: 'USDT · TRON',
    destinationAddress: 'TYK9A..8v2L',
    fullAddress: 'TYK9A3XmUqZ9z8VnLw7h4Jb1k8Pq5D2gXy',
    destinationType: 'VENDOR SETTLEMENT',
    kytRiskScore: 78,
    kytRiskLevel: 'Critical',
    mpcStatus: '0/2 Signed',
    status: 'Compliance Hold',
    holdReason: 'Destination address velocity spike (>5 payouts in 1h) & TRM Labs cluster flag',
    createdAt: '32 mins ago'
  },
  {
    id: 'payout_8403',
    payoutRef: 'pay_9VR244012bc0E88',
    merchantName: 'Prime Liquidity Hub',
    merchantId: 'mer_03',
    makerName: 'David Al-Mansoor (Treasury)',
    makerRole: 'Merchant Payout Creator',
    amount: '35,000.00 USDT',
    numericAmount: 35000,
    network: 'USDT · ERC-20',
    destinationAddress: '0x91F2..3cA8',
    fullAddress: '0x91F20901abcf8912c7713cA8',
    destinationType: 'OTC LIQUIDITY POOL',
    kytRiskScore: 12,
    kytRiskLevel: 'Clean',
    mpcStatus: '1/2 Signed',
    status: 'Pending Checker',
    createdAt: '48 mins ago'
  },
  {
    id: 'payout_8404',
    payoutRef: 'pay_4TM1557288aaK09',
    merchantName: 'Vance Capital Markets',
    merchantId: 'mer_04',
    makerName: 'Sarah Chen (Platform Admin)',
    makerRole: 'Platform SuperAdmin',
    checkerName: 'Marcus Vance (Checker)',
    amount: '120,000.00 USDC',
    numericAmount: 120000,
    network: 'USDC · SOLANA',
    destinationAddress: '7XqP..2vNp',
    fullAddress: '7XqP110293847aa1928374bb2vNp',
    destinationType: 'TREASURY CONSOLIDATION',
    kytRiskScore: 4,
    kytRiskLevel: 'Clean',
    mpcStatus: '2/2 Quorum Met',
    status: 'Completed',
    createdAt: '2 hrs ago'
  },
  {
    id: 'payout_8405',
    payoutRef: 'pay_2WP800293118M33',
    merchantName: 'Eagle Vision Market Ltd',
    merchantId: 'mer_01',
    makerName: 'David Zhang (Affiliate Ops)',
    makerRole: 'Merchant Payout Creator',
    checkerName: 'Sarah Chen (Platform SuperAdmin)',
    amount: '5,100.00 USDT',
    numericAmount: 5100,
    network: 'USDT · TRON',
    destinationAddress: 'TR7N..8b1A',
    fullAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    destinationType: 'AFFILIATE COMMISSION',
    kytRiskScore: 18,
    kytRiskLevel: 'Low',
    mpcStatus: '2/2 Quorum Met',
    status: 'Completed',
    createdAt: '3 hrs ago'
  }
];

const COMPLIANCE_HOLD_REASONS = [
  'OFAC / International Sanctions list match',
  'Destination address velocity spike (>5 payouts/hr)',
  'Counterparty address not on Merchant Allowlist',
  'Suspicious IP geolocation hop / Tor exit node',
  'Tornado Cash / Mixer input hop detected (TRM Labs)',
  'Unusual volume exceeding 24h rolling velocity limit'
];

export const AdminPayoutsPage: React.FC = () => {
  const [payouts, setPayouts] = useState<AdminPayoutItem[]>(INITIAL_ADMIN_PAYOUTS);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'hold' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [inspectPayout, setInspectPayout] = useState<AdminPayoutItem | null>(null);
  const [holdModalPayout, setHoldModalPayout] = useState<AdminPayoutItem | null>(null);
  const [selectedHoldReason, setSelectedHoldReason] = useState(COMPLIANCE_HOLD_REASONS[0]);
  const [holdNotes, setHoldNotes] = useState('');

  const [approveModalPayout, setApproveModalPayout] = useState<AdminPayoutItem | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isSubmittingMpc, setIsSubmittingMpc] = useState(false);
  const [mpcSuccessMessage, setMpcSuccessMessage] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
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

  // Execute Compliance Hold
  const executeComplianceHold = () => {
    if (!holdModalPayout) return;
    const finalReason = holdNotes.trim()
      ? `${selectedHoldReason} — Note: ${holdNotes}`
      : selectedHoldReason;

    setPayouts((prev) =>
      prev.map((item) =>
        item.id === holdModalPayout.id
          ? {
              ...item,
              status: 'Compliance Hold' as AdminPayoutStatus,
              holdReason: finalReason,
              mpcStatus: '0/2 Signed'
            }
          : item
      )
    );
    setHoldModalPayout(null);
    setHoldNotes('');
  };

  // Release Hold
  const handleReleaseHold = (payout: AdminPayoutItem) => {
    setPayouts((prev) =>
      prev.map((item) =>
        item.id === payout.id
          ? {
              ...item,
              status: 'Pending Checker' as AdminPayoutStatus,
              holdReason: undefined,
              mpcStatus: '1/2 Signed'
            }
          : item
      )
    );
    if (inspectPayout && inspectPayout.id === payout.id) {
      setInspectPayout(null);
    }
  };

  // Execute Checker MPC Approval
  const executeMpcApproval = () => {
    if (!approveModalPayout) return;
    setIsSubmittingMpc(true);

    setTimeout(() => {
      setPayouts((prev) =>
        prev.map((item) =>
          item.id === approveModalPayout.id
            ? {
                ...item,
                status: 'Completed' as AdminPayoutStatus,
                checkerName: 'Sarah Chen (Platform SuperAdmin)',
                mpcStatus: '2/2 Quorum Met'
              }
            : item
        )
      );
      setIsSubmittingMpc(false);
      setApproveModalPayout(null);
      setTwoFactorCode('');
      setMpcSuccessMessage(`Fireblocks MPC Quorum signed & broadcasted for ${approveModalPayout.payoutRef}!`);
      setTimeout(() => setMpcSuccessMessage(null), 4000);
    }, 1200);
  };

  // Batch Approval
  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    setPayouts((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id) && item.status === 'Pending Checker'
          ? {
              ...item,
              status: 'Completed' as AdminPayoutStatus,
              checkerName: 'Sarah Chen (Platform SuperAdmin)',
              mpcStatus: '2/2 Quorum Met'
            }
          : item
      )
    );
    const count = selectedIds.length;
    setSelectedIds([]);
    setMpcSuccessMessage(`Batch approved ${count} payouts via Fireblocks MPC Co-Signer!`);
    setTimeout(() => setMpcSuccessMessage(null), 4000);
  };

  const pendingCount = payouts.filter((p) => p.status === 'Pending Checker').length;
  const pendingTotal = payouts
    .filter((p) => p.status === 'Pending Checker')
    .reduce((sum, p) => sum + p.numericAmount, 0);

  const holdCount = payouts.filter((p) => p.status === 'Compliance Hold').length;

  return (
    <div className="space-y-6">
      {/* Platform Maker-Checker Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#14171A] to-blue-950 text-white border border-blue-500/20 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Platform Maker-Checker & MPC Dual-Control Queue
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-500 text-white shadow-2xs">
                {pendingCount} Awaiting Checker
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Enforcing institutional 4-eyes principle. Payouts require independent Platform Checker sign-off + Fireblocks 2-of-3 MPC Quorum.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs text-xs font-semibold text-emerald-300 border border-emerald-400/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MPC Co-Signer Online (2/3)</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {mpcSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{mpcSuccessMessage}</span>
          </div>
          <button onClick={() => setMpcSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
            Pending Checker
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{pendingCount}</span>
            <span className="text-xs font-semibold text-amber-600">
              ${pendingTotal.toLocaleString()} total
            </span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">Awaiting second keyholder</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
            Compliance Holds
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600">{holdCount}</span>
            <span className="text-xs font-semibold text-red-500">SAR / Velocity</span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">Requires AML investigation</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
            MPC Co-Signer Quorum
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">2 of 3</span>
            <span className="text-xs font-semibold text-emerald-600">Threshold Active</span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">Fireblocks Engine v4.19</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
            24h Settled Outflows
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">$125,100</span>
            <span className="text-xs font-semibold text-emerald-600">0 Reversals</span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">100% on-chain finalized</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none -mx-1 px-1 flex-nowrap shrink-0">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              All Payouts ({payouts.length})
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
                filterTab === 'pending'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Pending Checker ({pendingCount})
            </button>
            <button
              onClick={() => setFilterTab('hold')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
                filterTab === 'hold'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Compliance Hold ({holdCount})
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
                filterTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Completed ({payouts.filter((p) => p.status === 'Completed').length})
            </button>
          </div>

          {/* Search & Batch Action */}
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBatchApprove}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Selected ({selectedIds.length})</span>
              </button>
            )}

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search payout ref, merchant, address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="lg:hidden flex items-center justify-between text-[11px] text-gray-400 p-3 bg-gray-50/50 border-b border-gray-100">
          <span>↔ Swipe horizontally to review Maker, Destination & Quorum</span>
          <span className="text-[#00C076] font-semibold text-[10.5px]">Touch scroll active</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[1180px]">
            <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 w-10 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredPayouts.length}
                    onChange={selectAllFiltered}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-3 px-4 whitespace-nowrap">Payout Ref & Merchant</th>
                <th className="py-3 px-4 whitespace-nowrap">Maker (Requester)</th>
                <th className="py-3 px-4 whitespace-nowrap">Amount & Network</th>
                <th className="py-3 px-4 whitespace-nowrap">Destination Address</th>
                <th className="py-3 px-4 whitespace-nowrap">KYT Risk Score</th>
                <th className="py-3 px-4 whitespace-nowrap">MPC Quorum</th>
                <th className="py-3 px-4 whitespace-nowrap min-w-[140px]">Status</th>
                <th className="py-3 px-4 text-right whitespace-nowrap min-w-[190px]">Checker Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayouts.map((payout) => {
                const isSelected = selectedIds.includes(payout.id);

                return (
                  <tr
                    key={payout.id}
                    className={`hover:bg-gray-50/60 transition ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(payout.id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    {/* Ref & Merchant */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                        <span>{payout.payoutRef}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                        <Building2 className="w-3 h-3 text-gray-400" />
                        <span>{payout.merchantName}</span>
                      </div>
                    </td>

                    {/* Maker */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-gray-900 font-medium">{payout.makerName}</div>
                      <span className="text-[10px] text-gray-400 block">{payout.makerRole}</span>
                    </td>

                    {/* Amount & Network */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900 text-sm">
                        {payout.amount}
                      </div>
                      <span className="text-[10px] font-medium text-gray-500">
                        {payout.network}
                      </span>
                    </td>

                    {/* Destination Address */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-700">
                        <span>{payout.destinationAddress}</span>
                        <button
                          onClick={() => handleCopy(payout.fullAddress, payout.id)}
                          className="text-gray-400 hover:text-gray-700 transition cursor-pointer"
                          title="Copy Full Address"
                        >
                          {copiedId === payout.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <span className="text-[9.5px] uppercase font-bold text-gray-400 tracking-wider">
                        {payout.destinationType}
                      </span>
                    </td>

                    {/* KYT Risk Score */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            payout.kytRiskLevel === 'Clean'
                              ? 'bg-emerald-500'
                              : payout.kytRiskLevel === 'Low'
                              ? 'bg-blue-500'
                              : 'bg-red-500 animate-pulse'
                          }`}
                        />
                        <span
                          className={`font-semibold ${
                            payout.kytRiskLevel === 'Clean'
                              ? 'text-emerald-700'
                              : payout.kytRiskLevel === 'Low'
                              ? 'text-blue-700'
                              : 'text-red-700'
                          }`}
                        >
                          Score {payout.kytRiskScore} ({payout.kytRiskLevel})
                        </span>
                      </div>
                    </td>

                    {/* MPC Quorum */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold whitespace-nowrap ${
                          payout.mpcStatus === '2/2 Quorum Met'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : payout.mpcStatus === '1/2 Signed'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        <Lock className="w-2.5 h-2.5 shrink-0" />
                        <span>{payout.mpcStatus}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">
                      {payout.status === 'Pending Checker' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap shrink-0">
                          Pending Checker
                        </span>
                      )}
                      {payout.status === 'Compliance Hold' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap shrink-0">
                          Compliance Hold
                        </span>
                      )}
                      {payout.status === 'Completed' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shrink-0">
                          Broadcasted
                        </span>
                      )}
                    </td>

                    {/* Checker Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap min-w-[190px]">
                      <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                        {payout.status === 'Pending Checker' && (
                          <>
                            <button
                              onClick={() => setApproveModalPayout(payout)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1.5 shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
                              title="Co-Sign as Platform Checker"
                            >
                              <Key className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span>Co-Sign</span>
                            </button>
                            <button
                              onClick={() => setHoldModalPayout(payout)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
                              title="Place on Compliance Hold"
                            >
                              <PauseCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                              <span>Hold</span>
                            </button>
                          </>
                        )}

                        {payout.status === 'Compliance Hold' && (
                          <button
                            onClick={() => handleReleaseHold(payout)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
                            title="Release Compliance Hold"
                          >
                            <PlayCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Release</span>
                          </button>
                        )}

                        <button
                          onClick={() => setInspectPayout(payout)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition cursor-pointer shrink-0 ml-0.5"
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

      {/* MODAL 1: Compliance Hold Modal */}
      {holdModalPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Place on Compliance Hold</h3>
                  <p className="text-xs text-gray-500">Freezes payout and triggers SAR investigation</p>
                </div>
              </div>
              <button
                onClick={() => setHoldModalPayout(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Payout ID:</span>
                <span className="font-mono font-semibold text-gray-900">{holdModalPayout.payoutRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Merchant:</span>
                <span className="font-semibold text-gray-900">{holdModalPayout.merchantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-bold text-gray-900">{holdModalPayout.amount}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Select Mandatory Hold Reason</label>
              <select
                value={selectedHoldReason}
                onChange={(e) => setSelectedHoldReason(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
              >
                {COMPLIANCE_HOLD_REASONS.map((reason, idx) => (
                  <option key={idx} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Auditor Notes & References (Optional)</label>
              <textarea
                rows={3}
                placeholder="e.g. TRM Labs case #849102 attached. Awaiting proof of beneficiary identity."
                value={holdNotes}
                onChange={(e) => setHoldNotes(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-red-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setHoldModalPayout(null)}
                className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeComplianceHold}
                className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <PauseCircle className="w-4 h-4" />
                <span>Confirm Compliance Hold</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Maker-Checker MPC Approval Modal */}
      {approveModalPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">MPC Dual-Control Co-Sign</h3>
                  <p className="text-xs text-gray-500">Sign with Platform Checker Key (2 of 3 Quorum)</p>
                </div>
              </div>
              <button
                onClick={() => setApproveModalPayout(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dual control verification */}
            <div className="p-3.5 bg-slate-50 rounded-2xl text-xs space-y-2 border border-slate-100">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Maker (Requester):</span>
                <span className="font-semibold text-slate-900">{approveModalPayout.makerName}</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Checker (You):</span>
                <span className="font-bold text-blue-600">Sarah Chen (SuperAdmin)</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Release Amount:</span>
                <span className="font-bold text-slate-900">{approveModalPayout.amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">TRM Risk Status:</span>
                <span className="font-semibold text-emerald-700">Clean (Score {approveModalPayout.kytRiskScore})</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Enter Admin 2FA Token (Google Authenticator)</label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-base tracking-widest font-mono font-bold focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[10.5px] text-gray-400 block text-center">Enter your registered 6-digit platform authenticator security code</span>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setApproveModalPayout(null)}
                className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isSubmittingMpc}
                onClick={executeMpcApproval}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isSubmittingMpc ? 'Deriving MPC Keys...' : 'Execute MPC Co-Sign'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: Inspect Payout Lifecycle */}
      {inspectPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white h-full w-full max-w-full sm:max-w-lg shadow-2xl p-4 sm:p-6 overflow-y-auto space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Payout Dossier
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{inspectPayout.payoutRef}</h3>
                <p className="text-xs text-gray-500">{inspectPayout.merchantName} ({inspectPayout.merchantId})</p>
              </div>
              <button
                onClick={() => setInspectPayout(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hold Reason Alert if on hold */}
            {inspectPayout.status === 'Compliance Hold' && inspectPayout.holdReason && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Active Compliance Hold Reason
                </span>
                <p className="text-[11.5px] text-red-700">{inspectPayout.holdReason}</p>
                <div className="pt-2">
                  <button
                    onClick={() => handleReleaseHold(inspectPayout)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10.5px] font-bold transition"
                  >
                    Release Hold Now
                  </button>
                </div>
              </div>
            )}

            {/* Payout Details Grid */}
            <div className="p-4 bg-gray-50 rounded-2xl text-xs space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Gross Outflow:</span>
                <span className="font-bold text-gray-900">{inspectPayout.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Network / Protocol:</span>
                <span className="font-semibold text-gray-900">{inspectPayout.network}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Beneficiary Address:</span>
                <span className="font-mono font-semibold text-gray-900 truncate max-w-[220px]">
                  {inspectPayout.fullAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">KYT Threat Level:</span>
                <span className="font-bold text-emerald-700">Score {inspectPayout.kytRiskScore} ({inspectPayout.kytRiskLevel})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">MPC Multi-Sig Quorum:</span>
                <span className="font-bold text-slate-900">{inspectPayout.mpcStatus}</span>
              </div>
            </div>

            {/* 4-Eyes Dual Control Trail */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Maker-Checker Audit Trail
              </h4>
              <div className="space-y-2 text-xs border-l-2 border-blue-500 pl-3">
                <div>
                  <span className="font-bold text-gray-900">1. Payout Initiated by Maker</span>
                  <p className="text-gray-500">{inspectPayout.makerName} ({inspectPayout.makerRole})</p>
                  <span className="text-[10px] text-gray-400">{inspectPayout.createdAt}</span>
                </div>
                <div className="pt-2">
                  <span className="font-bold text-gray-900">2. Automated KYT Screening</span>
                  <p className="text-gray-500">TRM Labs & Chainalysis verified clean</p>
                </div>
                <div className="pt-2">
                  <span className="font-bold text-gray-900">3. Platform Checker Sign-off</span>
                  <p className="text-gray-500">
                    {inspectPayout.checkerName || 'Awaiting SuperAdmin Co-Signer verification'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
