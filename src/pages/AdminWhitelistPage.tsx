import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Copy,
  Check,
  ChevronRight,
  X,
  Download,
  AlertOctagon,
  Building2,
  Unlock,
  Ban
} from 'lucide-react';
import { AdminWhitelistedAddress } from '../types';
import {
  AdminComplianceConfirmModal,
  AdminDialog,
} from '../components/AdminComplianceConfirmModal';
import { appendAuditEvent } from '../utils/auditLogStore';
import { MERCHANT, PLATFORM } from '../utils/sharedMockStore';

const INITIAL_ADMIN_WHITELIST: AdminWhitelistedAddress[] = [
  {
    id: 'awl_01',
    merchantId: 'mer_01',
    merchantName: MERCHANT.name,
    beneficiaryName: 'Meridian Settlement Services Ltd',
    category: 'OTC Liquidity Pool',
    network: 'USDC · ERC-20',
    address: '0x4d8A..71bE',
    fullAddress: '0x4d8a9c71f03be58d26a4e7b91c0f3a8d65e2471b',
    status: 'Active',
    addedBy: PLATFORM.reviewer,
    addedIp: '198.51.100.44 (SG-Ops)',
    createdAt: '14 Oct 2026, 11:20 UTC',
    totalPaidOut: '$380,750.00',
    kytRiskScore: 6,
    kytRiskLevel: 'Clean',
    sanctionScreenStatus: 'Passed'
  },
  {
    id: 'awl_02',
    merchantId: 'mer_02',
    merchantName: MERCHANT.name,
    beneficiaryName: 'Northbridge Liquidity Services',
    category: 'First-Party Deposit',
    network: 'USDT · TRON',
    address: 'TNq7..QzT',
    fullAddress: 'TNq7Vb2KpR9mDxW4sL6aHj8YuE3cF1nQzT',
    status: 'Cooling Period',
    coolingRemainingHours: 6,
    coolingEndsAt: 'Today at 07:45 UTC',
    addedBy: 'Nadia Okoro (Platform Compliance)',
    addedIp: '203.0.113.88 (EU-Zurich Ops)',
    createdAt: 'Yesterday, 07:45 UTC',
    totalPaidOut: '$0.00',
    kytRiskScore: 12,
    kytRiskLevel: 'Clean',
    sanctionScreenStatus: 'Passed'
  },
  {
    id: 'awl_03',
    merchantId: 'mer_03',
    merchantName: 'Prime Liquidity Hub',
    beneficiaryName: 'Prime Cold Vault Pool #02',
    category: 'First-Party Deposit',
    network: 'USDC · SOLANA',
    address: '7XqP..DjA',
    fullAddress: '7XqP9b3Kf2Lm8Vc4Rn6Tq1Wz5Hy7DjA',
    status: 'Active',
    addedBy: 'Tomas Lindqvist (Treasury Lead)',
    addedIp: '198.51.100.12 (UK-London)',
    createdAt: '26 Oct 2026, 16:15 UTC',
    totalPaidOut: '$1,250,000.00',
    kytRiskScore: 4,
    kytRiskLevel: 'Clean',
    sanctionScreenStatus: 'Passed'
  },
  {
    id: 'awl_04',
    merchantId: 'mer_04',
    merchantName: 'Meridian Trading Ltd',
    beneficiaryName: 'Alpha Cloud Infrastructure Ltd',
    category: 'Vendor Settlement',
    network: 'USDT · ERC-20',
    address: '0x91F2..f28',
    fullAddress: '0x91f2d48ae615b09c3f7a2e6d845c10b9a7e63f28',
    status: 'Cooling Period',
    coolingRemainingHours: 14,
    coolingEndsAt: 'Today at 15:30 UTC',
    addedBy: 'Leila Haddad (Compliance Lead)',
    addedIp: '198.51.100.90 (US-East)',
    createdAt: 'Yesterday, 15:30 UTC',
    totalPaidOut: '$0.00',
    kytRiskScore: 18,
    kytRiskLevel: 'Low',
    sanctionScreenStatus: 'Passed'
  },
  {
    id: 'awl_05',
    merchantId: 'mer_02',
    merchantName: MERCHANT.name,
    beneficiaryName: 'Affiliate Rebate Settlement Vault',
    category: 'Affiliate Commission',
    network: 'USDT · BSC',
    address: '0x6f3c..6a92',
    fullAddress: '0x6f3c2b9a71d8e4f05c6b2a9d83e7f10c4b5d6a92',
    status: 'Frozen',
    addedBy: 'Nadia Okoro (Platform Compliance)',
    addedIp: '203.0.113.88 (EU-Zurich Ops)',
    createdAt: '02 Nov 2026, 09:12 UTC',
    totalPaidOut: '$42,500.00',
    kytRiskScore: 74,
    kytRiskLevel: 'Medium',
    sanctionScreenStatus: 'Flagged'
  },
  {
    id: 'awl_06',
    merchantId: 'mer_05',
    merchantName: 'Quantex Asset Management AG',
    beneficiaryName: 'Quantex Prime Custody (MPC Vault)',
    category: 'First-Party Deposit',
    network: 'USDC · ERC-20',
    address: '0x88fA..5d8',
    fullAddress: '0x88fa6d37c0b9e4a15f2d7c83b60a9e4f21c7b5d8',
    status: 'Active',
    addedBy: PLATFORM.reviewer,
    addedIp: '194.209.14.2 (CH-Zurich)',
    createdAt: '08 Nov 2026, 14:00 UTC',
    totalPaidOut: '$2,480,000.00',
    kytRiskScore: 2,
    kytRiskLevel: 'Clean',
    sanctionScreenStatus: 'Passed'
  }
];

interface PendingAddressAction {
  type: 'instant-approve' | 'freeze' | 'unfreeze' | 'revoke';
  address: AdminWhitelistedAddress;
}

export interface AdminWhitelistPageProps {
  globalSearchQuery?: string;
}

export const AdminWhitelistPage: React.FC<AdminWhitelistPageProps> = ({ globalSearchQuery = '' }) => {
  const [whitelist, setWhitelist] = useState<AdminWhitelistedAddress[]>(() => {
    try {
      const savedMerchant = localStorage.getItem('copym_shared_merchant_addresses');
      if (savedMerchant) {
        const merchantAddrs = JSON.parse(savedMerchant);
        const mappedMerchantAddrs: AdminWhitelistedAddress[] = merchantAddrs
          .filter((m: { id: string }) => !INITIAL_ADMIN_WHITELIST.some((w) => w.id === m.id))
          .map((m: {
            id: string;
            beneficiaryName: string;
            category: 'First-Party Deposit' | 'Vendor Settlement' | 'OTC Liquidity Pool' | 'Affiliate Commission';
            network: string;
            address: string;
            fullAddress: string;
            status: string;
            coolingRemainingHours?: number;
            coolingEndsAt?: string;
            addedBy: string;
            createdAt: string;
            totalPaidOut?: string;
          }) => ({
            id: m.id,
            merchantId: 'mer_02',
            merchantName: MERCHANT.name,
            beneficiaryName: m.beneficiaryName,
            category: m.category,
            network: m.network,
            address: m.address,
            fullAddress: m.fullAddress,
            status: (m.status as 'Active' | 'Cooling Period' | 'Pending Review' | 'Frozen' | 'Revoked') || 'Cooling Period',
            coolingRemainingHours: m.coolingRemainingHours !== undefined ? m.coolingRemainingHours : 24,
            coolingEndsAt: m.coolingEndsAt || 'In 24 hours',
            addedBy: m.addedBy,
            addedIp: '198.51.100.12 (Live Merchant Portal)',
            createdAt: m.createdAt,
            totalPaidOut: m.totalPaidOut || '$0.00',
            kytRiskScore: 6,
            kytRiskLevel: 'Clean' as const,
            sanctionScreenStatus: 'Passed' as const
          }));
        return [...mappedMerchantAddrs, ...INITIAL_ADMIN_WHITELIST];
      }
    } catch {
      return INITIAL_ADMIN_WHITELIST;
    }
    return INITIAL_ADMIN_WHITELIST;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('All');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAddressAction | null>(null);

  useEffect(() => {
    try {
      const savedMerchant = localStorage.getItem('copym_shared_merchant_addresses');
      if (savedMerchant) {
        const parsed = JSON.parse(savedMerchant);
        const updated = parsed.map((m: { id: string; status: string; coolingRemainingHours?: number }) => {
          const match = whitelist.find((w) => w.id === m.id);
          if (match) {
            return {
              ...m,
              status: match.status === 'Active' ? 'Active' : match.status,
              coolingRemainingHours: match.coolingRemainingHours
            };
          }
          return m;
        });
        localStorage.setItem('copym_shared_merchant_addresses', JSON.stringify(updated));
      }
    } catch {
      return;
    }
  }, [whitelist]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const selectedAddress = whitelist.find((item) => item.id === selectedAddressId) ?? null;

  const openAction = (type: PendingAddressAction['type'], address: AdminWhitelistedAddress) => {
    setPendingAction({ type, address });
  };

  const handleConfirmAction = (reasonCode: string, note: string, approver: string) => {
    if (!pendingAction) return;
    const { type, address } = pendingAction;

    setWhitelist((prev) =>
      prev.map((item) => {
        if (item.id !== address.id) return item;
        if (type === 'instant-approve') {
          return {
            ...item,
            status: 'Active' as const,
            coolingRemainingHours: 0,
            coolingEndsAt: `Fast-tracked (${reasonCode}) · ${note.slice(0, 48)} · ${approver}`
          };
        }
        if (type === 'freeze') {
          return { ...item, status: 'Frozen' as const };
        }
        if (type === 'unfreeze') {
          return { ...item, status: 'Active' as const };
        }
        return { ...item, status: 'Revoked' as const };
      })
    );

    const labels: Record<PendingAddressAction['type'], string> = {
      'instant-approve': '24h timelock fast-tracked with documented approval',
      freeze: 'Address frozen and recorded in the audit trail',
      unfreeze: 'Address returned to Active status',
      revoke: 'Address revoked and blacklisted'
    };
    showNotification(`${labels[type]}: ${address.address}`);
    setPendingAction(null);
  };

  const handleCopy = (full: string, id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(full);
    setCopiedId(id);
    appendAuditEvent({
      action: 'Whitelist Address Copied',
      target: `${id} · ${full.slice(0, 14)}`,
      reasonCode: 'Manual Review Completed (Evidence Attached)',
      note: 'Destination address copied for verification.',
      severity: 'Info',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = ['Merchant', 'Beneficiary', 'Network', 'Address', 'Status', 'RiskScore', 'TotalPaidOut', 'AddedBy', 'CreatedAt'];
    const rows = whitelist.map((w) => [
      `"${w.merchantName}"`,
      `"${w.beneficiaryName}"`,
      `"${w.network}"`,
      `"${w.fullAddress}"`,
      `"${w.status}"`,
      w.kytRiskScore,
      `"${w.totalPaidOut}"`,
      `"${w.addedBy}"`,
      `"${w.createdAt}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `copym-address-whitelist-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    appendAuditEvent({
      action: 'Whitelist Registry Exported',
      target: `${whitelist.length} whitelisted addresses`,
      reasonCode: 'Manual Review Completed (Evidence Attached)',
      note: 'Whitelist registry exported for audit review.',
      severity: 'Info',
    });
    showNotification('Whitelist registry exported to CSV.');
  };

  const effectiveQuery = (globalSearchQuery || searchQuery || '').toLowerCase();

  const filteredList = whitelist.filter((item) => {
    const matchSearch =
      item.beneficiaryName.toLowerCase().includes(effectiveQuery) ||
      item.merchantName.toLowerCase().includes(effectiveQuery) ||
      item.fullAddress.toLowerCase().includes(effectiveQuery) ||
      item.network.toLowerCase().includes(effectiveQuery);

    const matchMerchant = selectedMerchant === 'All' || item.merchantName === selectedMerchant;
    const matchStatus = selectedStatus === 'All' || item.status === selectedStatus;
    const matchNetwork = selectedNetwork === 'All' || item.network.toLowerCase().includes(selectedNetwork.toLowerCase());

    return matchSearch && matchMerchant && matchStatus && matchNetwork;
  });

  const uniqueMerchants = ['All', ...Array.from(new Set(whitelist.map((w) => w.merchantName)))];
  const totalWallets = whitelist.length;
  const coolingCount = whitelist.filter((w) => w.status === 'Cooling Period').length;
  const flaggedCount = whitelist.filter((w) => w.status === 'Frozen' || w.kytRiskLevel === 'Medium' || w.kytRiskLevel === 'Critical').length;
  const activeCount = whitelist.filter((w) => w.status === 'Active').length;

  const actionConfig: Record<PendingAddressAction['type'], {
    title: string;
    description: string;
    actionLabel: string;
    severity: 'Critical' | 'Warning' | 'Info';
    variant: 'primary' | 'destructive';
    requireSecondApprover: boolean;
  }> = {
    'instant-approve': {
      title: 'Fast-Track Whitelist Timelock',
      description: 'Override the cooling period only with documented evidence and an independent checker. The action is written to the audit trail.',
      actionLabel: 'Confirm Fast-Track',
      severity: 'Critical',
      variant: 'primary',
      requireSecondApprover: true,
    },
    freeze: {
      title: 'Freeze Whitelisted Address',
      description: 'Suspend payouts to this destination while the compliance review is documented.',
      actionLabel: 'Confirm Freeze',
      severity: 'Warning',
      variant: 'destructive',
      requireSecondApprover: true,
    },
    unfreeze: {
      title: 'Unfreeze Whitelisted Address',
      description: 'Restore payout eligibility after a documented review of the freeze reason.',
      actionLabel: 'Confirm Unfreeze',
      severity: 'Warning',
      variant: 'primary',
      requireSecondApprover: true,
    },
    revoke: {
      title: 'Revoke And Blacklist Address',
      description: 'Permanently revoke this destination address from all merchant payouts.',
      actionLabel: 'Confirm Revoke',
      severity: 'Critical',
      variant: 'destructive',
      requireSecondApprover: true,
    },
  };

  return (
    <div className="space-y-4 font-sans text-slate-900 animate-fadeIn">
      {notification && (
        <div className="fixed top-5 right-5 z-[10000] px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-bold tracking-wider uppercase bg-slate-100 text-slate-700 border border-slate-200 rounded-md">
              Treasury Governance
            </span>
            <span className="text-xs text-[#6B7280]">· Multi-Tenant Registry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Address Whitelist Management Hub
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">
            Monitor, approve, and enforce 24-hour security timelocks across all payout destination wallets submitted by merchants.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Export Registry</span>
          </button>
          <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200/70 text-[#007F4E] text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>24h Timelock Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-[#6B7280] block mb-0.5">Total Destination Wallets</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900">{totalWallets}</span>
            <span className="text-xs font-semibold text-[#6B7280] bg-slate-100 px-2 py-0.5 rounded-md">
              Multi-Chain
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-[#6B7280] block mb-0.5">Active (Executable)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#007F4E]">{activeCount}</span>
            <span className="text-xs font-semibold text-[#007F4E] bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Verified</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-[#6B7280] block mb-0.5">In 24h Cooling Timelock</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-amber-700">{coolingCount}</span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Pending</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-[#6B7280] block mb-0.5">Frozen / Flagged Risks</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-rose-700">{flaggedCount}</span>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Hold</span>
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col gap-3 bg-slate-50/50">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by beneficiary, merchant, address hash, or network..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-[#6B7280] focus:outline-none focus:border-[#007F4E] focus:ring-1 focus:ring-[#007F4E] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-[#6B7280]">
              <Building2 className="w-3.5 h-3.5 text-[#6B7280]" />
              <select
                value={selectedMerchant}
                onChange={(e) => setSelectedMerchant(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#007F4E]"
              >
                {uniqueMerchants.map((m) => (
                  <option key={m} value={m}>
                    {m === 'All' ? 'All Merchants' : m}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#007F4E]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active (Executable)</option>
              <option value="Cooling Period">Cooling Period (24h)</option>
              <option value="Frozen">Frozen / Suspended</option>
              <option value="Revoked">Revoked</option>
            </select>

            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#007F4E]"
            >
              <option value="All">All Chains</option>
              <option value="TRON">TRON (TRC-20)</option>
              <option value="ERC-20">Ethereum (ERC-20)</option>
              <option value="SOLANA">Solana</option>
              <option value="BSC">BNB Chain</option>
            </select>
          </div>
        </div>

        <div className="md:hidden mt-3 space-y-2">
          {filteredList.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#6B7280]">No whitelisted addresses match filters</p>
          ) : (
            filteredList.map((item) => {
              const isCooling = item.status === 'Cooling Period';
              const isFrozen = item.status === 'Frozen';
              const isActive = item.status === 'Active';
              const isRevoked = item.status === 'Revoked';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAddressId(item.id)}
                  className="table-mobile-card cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 break-words">{item.beneficiaryName}</div>
                      <div className="text-xs text-[#6B7280] break-words">
                        {item.merchantName} · {item.category}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-800 whitespace-nowrap">
                      {item.totalPaidOut}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                      {item.network}
                    </span>
                    <span className="font-mono text-xs text-slate-900 break-all">{item.address}</span>
                    <button
                      type="button"
                      onClick={(e) => handleCopy(item.fullAddress, item.id, e)}
                      className="p-1 hover:bg-slate-200 rounded text-[#6B7280] hover:text-slate-700 transition ml-0.5"
                      title="Copy full address"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3 h-3 text-[#007F4E]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-[#6B7280] break-words">Added by {item.addedBy.split(' ')[0]}</div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.kytRiskLevel === 'Clean'
                            ? 'bg-emerald-500'
                            : item.kytRiskLevel === 'Low'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                        }`}
                      />
                      <span className="font-bold text-slate-800">{item.kytRiskScore}/100</span>
                      <span className="text-[#6B7280]">({item.kytRiskLevel})</span>
                    </span>
                    {isCooling && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{item.coolingRemainingHours}h Timelock Left</span>
                      </span>
                    )}
                    {isActive && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#007F4E] border border-emerald-200/70">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active (Executable)</span>
                      </span>
                    )}
                    {isFrozen && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                        <span>Frozen (Compliance Hold)</span>
                      </span>
                    )}
                    {isRevoked && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        <Ban className="w-3.5 h-3.5 text-slate-500" />
                        <span>Revoked & Blacklisted</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {isCooling && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAction('instant-approve', item);
                        }}
                        className="px-2.5 py-1 bg-[#007F4E] hover:bg-[#00663E] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-xs cursor-pointer"
                        title="Fast-track timelock with documented approval"
                      >
                        <Unlock className="w-3 h-3" />
                        <span>Fast-Track</span>
                      </button>
                    )}
                    {!isRevoked && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAction(isFrozen ? 'unfreeze' : 'freeze', item);
                        }}
                        className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                          isFrozen
                            ? 'bg-emerald-50 text-[#007F4E] border-emerald-200 hover:bg-emerald-100'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                        }`}
                        title={isFrozen ? 'Unfreeze address with sign-off' : 'Freeze address with sign-off'}
                      >
                        {isFrozen ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    {!isRevoked && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAction('revoke', item);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-[#6B7280] hover:text-rose-700 hover:border-rose-200 transition cursor-pointer"
                        title="Revoke & blacklist with sign-off"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAddressId(item.id);
                      }}
                      className="p-1.5 text-[#6B7280] hover:text-[#007F4E] transition cursor-pointer"
                      title="View full audit drawer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="hidden md:block table-scroll">
          <table className="w-full text-left border-collapse text-xs min-w-[980px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                <th className="py-2.5 px-4">Merchant & Beneficiary</th>
                <th className="py-2.5 px-3">Rail / Network</th>
                <th className="py-2.5 px-3">Destination Address</th>
                <th className="py-2.5 px-3">KYT Score</th>
                <th className="py-2.5 px-3">Whitelist Timelock Status</th>
                <th className="py-2.5 px-3 text-right">Settled Payouts</th>
                <th className="py-2.5 px-4 text-center sticky right-0 bg-slate-50 z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.03)]">Admin Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B7280]">
                    <div className="flex flex-col items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="font-semibold text-sm text-slate-700">No whitelisted addresses match filters</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">Try selecting another merchant or chain filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const isCooling = item.status === 'Cooling Period';
                  const isFrozen = item.status === 'Frozen';
                  const isActive = item.status === 'Active';
                  const isRevoked = item.status === 'Revoked';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedAddressId(item.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                            {item.merchantName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-[#007F4E] transition flex items-center gap-1.5">
                              <span>{item.beneficiaryName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-[#6B7280] font-medium">{item.merchantName}</span>
                              <span className="text-slate-300">·</span>
                              <span className="text-xs text-[#6B7280]">{item.category}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                          {item.network}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="font-bold text-slate-900">{item.address.slice(0, 6)}</span>
                          <span className="text-[#6B7280]">...</span>
                          <span className="font-bold text-slate-900">{item.address.slice(-6)}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(item.fullAddress, item.id, e)}
                            className="p-1 hover:bg-slate-200 rounded text-[#6B7280] hover:text-slate-700 transition ml-0.5"
                            title="Copy full address"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3 h-3 text-[#007F4E]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <span className="text-xs text-[#6B7280] block mt-0.5">Added by {item.addedBy.split(' ')[0]}</span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.kytRiskLevel === 'Clean'
                                ? 'bg-emerald-500'
                                : item.kytRiskLevel === 'Low'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                            }`}
                          />
                          <span className="font-bold text-slate-800">{item.kytRiskScore}/100</span>
                          <span className="text-xs text-[#6B7280]">({item.kytRiskLevel})</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {isCooling && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>{item.coolingRemainingHours}h Timelock Left</span>
                          </div>
                        )}
                        {isActive && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#007F4E] border border-emerald-200/70">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active (Executable)</span>
                          </div>
                        )}
                        {isFrozen && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
                            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                            <span>Frozen (Compliance Hold)</span>
                          </div>
                        )}
                        {isRevoked && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <Ban className="w-3.5 h-3.5 text-slate-500" />
                            <span>Revoked & Blacklisted</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                        {item.totalPaidOut}
                      </td>

                      <td className="py-3 px-4 text-center sticky right-0 bg-white z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {isCooling && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openAction('instant-approve', item);
                              }}
                              className="px-2.5 py-1 bg-[#007F4E] hover:bg-[#00663E] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-xs cursor-pointer"
                              title="Fast-track timelock with documented approval"
                            >
                              <Unlock className="w-3 h-3" />
                              <span>Fast-Track</span>
                            </button>
                          )}

                          {!isRevoked && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openAction(isFrozen ? 'unfreeze' : 'freeze', item);
                              }}
                              className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                                isFrozen
                                  ? 'bg-emerald-50 text-[#007F4E] border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                              }`}
                              title={isFrozen ? 'Unfreeze address with sign-off' : 'Freeze address with sign-off'}
                            >
                              {isFrozen ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {!isRevoked && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openAction('revoke', item);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-[#6B7280] hover:text-rose-700 hover:border-rose-200 transition cursor-pointer"
                              title="Revoke & blacklist with sign-off"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAddressId(item.id);
                            }}
                            className="p-1.5 text-[#6B7280] hover:text-[#007F4E] transition cursor-pointer"
                            title="View full audit drawer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminDialog
        isOpen={!!selectedAddress}
        onClose={() => setSelectedAddressId(null)}
        className="flex items-center justify-end bg-black/50 backdrop-blur-sm"
        ariaLabel="Whitelist address audit drawer"
      >
        {selectedAddress && (
          <div className="bg-white w-full max-w-lg h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideInRight">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {selectedAddress.merchantName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedAddress.beneficiaryName}</h3>
                    <p className="text-xs text-[#6B7280]">{selectedAddress.merchantName} ({selectedAddress.merchantId})</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAddressId(null)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4">
                {selectedAddress.status === 'Cooling Period' && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>24-Hour Security Hold Cooling Period</span>
                    </div>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      This destination address cannot receive payouts until {selectedAddress.coolingEndsAt} ({selectedAddress.coolingRemainingHours} hours remaining). Fast-track requires documented approval and an audit entry.
                    </p>
                  </div>
                )}
                {selectedAddress.status === 'Active' && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#007F4E] shrink-0" />
                    <span>Address verified and cleared for automated disbursement.</span>
                  </div>
                )}
                {selectedAddress.status === 'Frozen' && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Temporarily frozen by platform compliance due to elevated KYT score.</span>
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-3.5 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs text-[#6B7280]">
                  Address Parameters
                </h4>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[#6B7280]">
                    <span>Network & Rail</span>
                    <span className="font-semibold text-slate-800">{selectedAddress.network}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#6B7280]">
                    <span>Beneficiary Category</span>
                    <span className="font-semibold text-slate-800">{selectedAddress.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#6B7280]">
                    <span>Cumulative Payouts</span>
                    <span className="font-mono font-bold text-slate-900">{selectedAddress.totalPaidOut}</span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs text-[#6B7280] pt-2">
                  Destination Address
                </h4>

                <div className="p-3 bg-slate-900 text-white rounded-xl font-mono text-xs break-all relative group">
                  <span className="text-emerald-400 font-bold">{selectedAddress.fullAddress.slice(0, 8)}</span>
                  <span className="text-slate-300">{selectedAddress.fullAddress.slice(8, -8)}</span>
                  <span className="text-emerald-400 font-bold">{selectedAddress.fullAddress.slice(-8)}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedAddress.fullAddress, selectedAddress.id)}
                    className="absolute right-2 top-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md transition cursor-pointer"
                    title="Copy full address"
                  >
                    {copiedId === selectedAddress.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs text-[#6B7280] pt-2">
                  Audit Trail & Operator Origin
                </h4>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Added by Operator:</span>
                    <span className="font-semibold text-slate-800">{selectedAddress.addedBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Origin IP:</span>
                    <span className="font-mono text-slate-700">{selectedAddress.addedIp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Timestamp:</span>
                    <span className="text-slate-700">{selectedAddress.createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Sanctions Screening:</span>
                    <span className="font-semibold text-[#007F4E]">{selectedAddress.sanctionScreenStatus} (OFAC/EU)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center gap-2">
              {selectedAddress.status === 'Cooling Period' && (
                <button
                  type="button"
                  onClick={() => openAction('instant-approve', selectedAddress)}
                  className="flex-1 py-2.5 bg-[#007F4E] hover:bg-[#00663E] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Fast-Track With Sign-Off</span>
                </button>
              )}

              {selectedAddress.status !== 'Revoked' && (
                <button
                  type="button"
                  onClick={() => openAction(selectedAddress.status === 'Frozen' ? 'unfreeze' : 'freeze', selectedAddress)}
                  className={`py-2.5 px-4 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                    selectedAddress.status === 'Frozen'
                      ? 'bg-emerald-50 text-[#007F4E] border-emerald-200 hover:bg-emerald-100'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                  }`}
                >
                  {selectedAddress.status === 'Frozen' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Unfreeze</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Freeze Address</span>
                    </>
                  )}
                </button>
              )}

              {selectedAddress.status !== 'Revoked' && (
                <button
                  type="button"
                  onClick={() => openAction('revoke', selectedAddress)}
                  className="py-2.5 px-3 bg-white hover:bg-rose-50 text-[#6B7280] hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  title="Revoke and blacklist with sign-off"
                >
                  <Ban className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </AdminDialog>

      {pendingAction && (
        <AdminComplianceConfirmModal
          isOpen={true}
          title={actionConfig[pendingAction.type].title}
          description={actionConfig[pendingAction.type].description}
          actionLabel={actionConfig[pendingAction.type].actionLabel}
          targetEntity={`${pendingAction.address.merchantName} · ${pendingAction.address.address}`}
          severity={actionConfig[pendingAction.type].severity}
          variant={actionConfig[pendingAction.type].variant}
          requireSecondApprover={actionConfig[pendingAction.type].requireSecondApprover}
          onClose={() => setPendingAction(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
};

export default AdminWhitelistPage;
