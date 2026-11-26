import React, { useState, useEffect } from 'react';
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
import { AdminComplianceConfirmModal } from '../components/AdminComplianceConfirmModal';

const INITIAL_ADMIN_WHITELIST: AdminWhitelistedAddress[] = [
  {
    id: 'awl_01',
    merchantId: 'mer_01',
    merchantName: 'Eagle Vision Market Ltd',
    beneficiaryName: 'Genesis Trading OTC Settlement',
    category: 'OTC Liquidity Pool',
    network: 'USDC · ERC-20',
    address: '0x4d8A..91eC',
    fullAddress: '0x4d8A00912cb84910ef123491eC10293847561a',
    status: 'Active',
    addedBy: 'Harrison Sterling (Director)',
    addedIp: '198.51.100.44 (SG-GovNet)',
    createdAt: '14 Oct 2026, 11:20 UTC',
    totalPaidOut: '$380,750.00',
    kytRiskScore: 6,
    kytRiskLevel: 'Clean',
    sanctionScreenStatus: 'Passed'
  },
  {
    id: 'awl_02',
    merchantId: 'mer_02',
    merchantName: 'Apex Forex Global',
    beneficiaryName: 'Apex Liquidity Services BVI',
    category: 'First-Party Deposit',
    network: 'USDT · TRON',
    address: 'TYK9A..8v2L',
    fullAddress: 'TYK9A3XmUqZ9z8VnLw7h4Jb1k8Pq5D2gXy8v2L',
    status: 'Cooling Period',
    coolingRemainingHours: 6,
    coolingEndsAt: 'Today at 07:45 UTC',
    addedBy: 'Elena Rostova (VP Finance)',
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
    address: '7XqP..2vNp',
    fullAddress: '7XqP110293847aa1928374bb2vNp884912039485',
    status: 'Active',
    addedBy: 'Devon Miller (Treasury Lead)',
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
    merchantName: 'Vance Capital Markets',
    beneficiaryName: 'Alpha Cloud Infrastructure Ltd',
    category: 'Vendor Settlement',
    network: 'USDT · ERC-20',
    address: '0x91F2..3cA8',
    fullAddress: '0x91F20901abcf8912c7713cA8981240192837465',
    status: 'Cooling Period',
    coolingRemainingHours: 14,
    coolingEndsAt: 'Today at 15:30 UTC',
    addedBy: 'Marcus Vance (Compliance Lead)',
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
    merchantName: 'Apex Forex Global',
    beneficiaryName: 'BVI Trader Direct Rebate Vault',
    category: 'Affiliate Commission',
    network: 'USDT · BSC',
    address: '0x55d3..7955',
    fullAddress: '0x55d398326f99059fF775485246999027B3197955',
    status: 'Frozen',
    addedBy: 'Elena Rostova (VP Finance)',
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
    address: '0x88fA..44e1',
    fullAddress: '0x88fA112938475610bcde884910293844e19028',
    status: 'Active',
    addedBy: 'Dr. Stefan Huber (CFO)',
    addedIp: '194.209.14.2 (CH-Zurich)',
    createdAt: '08 Nov 2026, 14:00 UTC',
    totalPaidOut: '$2,480,000.00',
    kytRiskScore: 2,
    kytRiskLevel: 'Clean',
    sanctionScreenStatus: 'Passed'
  }
];

export const AdminWhitelistPage: React.FC = () => {
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
            merchantName: 'Apex Forex Global',
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
      // ignore
    }
    return INITIAL_ADMIN_WHITELIST;
  });

  // Sync admin updates back to merchant storage
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
      // ignore
    }
  }, [whitelist]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('All');
  const [selectedAddress, setSelectedAddress] = useState<AdminWhitelistedAddress | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [pendingInstantApprove, setPendingInstantApprove] = useState<AdminWhitelistedAddress | null>(null);

  // Trigger feedback banner
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Instant-Approve (Bypass 24h Timelock)
  const handleInstantApprove = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setWhitelist((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Active',
              coolingRemainingHours: 0,
              coolingEndsAt: 'Manually Fast-Tracked by SuperAdmin'
            }
          : item
      )
    );
    if (selectedAddress?.id === id) {
      setSelectedAddress((prev) => (prev ? { ...prev, status: 'Active', coolingRemainingHours: 0 } : null));
    }
    showNotification('Address 24h Timelock bypassed & status set to Active.');
  };

  // Freeze / Suspend Address
  const handleToggleFreeze = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setWhitelist((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'Frozen' ? 'Active' : 'Frozen'
            }
          : item
      )
    );
    if (selectedAddress?.id === id) {
      setSelectedAddress((prev) =>
        prev ? { ...prev, status: prev.status === 'Frozen' ? 'Active' : 'Frozen' } : null
      );
    }
    showNotification('Address operational status updated successfully.');
  };

  // Force-Revoke / Blacklist Address
  const handleRevokeAddress = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently revoke & blacklist this destination address?')) return;
    setWhitelist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Revoked' } : item))
    );
    if (selectedAddress?.id === id) {
      setSelectedAddress((prev) => (prev ? { ...prev, status: 'Revoked' } : null));
    }
    showNotification('Address revoked and blacklisted from merchant payouts.');
  };

  // Copy full cryptographic address
  const handleCopy = (full: string, id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(full);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export Whitelist CSV
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
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `copym-address-whitelist-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Whitelist registry exported to CSV.');
  };

  // Filter computation
  const filteredList = whitelist.filter((item) => {
    const matchSearch =
      item.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fullAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.network.toLowerCase().includes(searchQuery.toLowerCase());

    const matchMerchant = selectedMerchant === 'All' || item.merchantName === selectedMerchant;
    const matchStatus = selectedStatus === 'All' || item.status === selectedStatus;
    const matchNetwork = selectedNetwork === 'All' || item.network.toLowerCase().includes(selectedNetwork.toLowerCase());

    return matchSearch && matchMerchant && matchStatus && matchNetwork;
  });

  // Unique lists for dropdowns
  const uniqueMerchants = ['All', ...Array.from(new Set(whitelist.map((w) => w.merchantName)))];

  // Key KPI stats
  const totalWallets = whitelist.length;
  const coolingCount = whitelist.filter((w) => w.status === 'Cooling Period').length;
  const flaggedCount = whitelist.filter((w) => w.status === 'Frozen' || w.kytRiskLevel === 'Medium' || w.kytRiskLevel === 'Critical').length;
  const activeCount = whitelist.filter((w) => w.status === 'Active').length;

  return (
    <div className="space-y-4 font-sans text-slate-900 animate-fadeIn">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header Card: Summary & Executive Actions (Compact Spacing & SF Pro Hierarchy) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200/60 rounded-md">
              Treasury Governance
            </span>
            <span className="text-xs text-slate-400">· Multi-Tenant Registry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Address Whitelist Management Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Monitor, approve, and enforce 24-hour security timelocks across all payout destination wallets submitted by merchants.
          </p>
        </div>

        {/* Global Operational Actions */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Registry</span>
          </button>
          <div className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>24h Timelock Active</span>
          </div>
        </div>
      </div>

      {/* KPI Metric Strip (High Density, Reduced Empty Space) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Total Destination Wallets</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900">{totalWallets}</span>
            <span className="text-[10.5px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              Multi-Chain
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Active (Executable)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-700">{activeCount}</span>
            <span className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Verified</span>
            </span>
          </div>
        </div>

        {/* Metric 3: Restrained Amber Cooling State */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">In 24h Cooling Timelock</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-amber-700">{coolingCount}</span>
            <span className="text-[10.5px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Pending</span>
            </span>
          </div>
        </div>

        {/* Metric 4: Restrained Red Risk Alert */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Frozen / Flagged Risks</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-rose-700">{flaggedCount}</span>
            <span className="text-[10.5px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Hold</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Filter & Action Bar (Inter Hierarchy, Blue Accents) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50/50">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by beneficiary, merchant, address hash, or network..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Merchant Filter */}
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedMerchant}
                onChange={(e) => setSelectedMerchant(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600"
              >
                {uniqueMerchants.map((m) => (
                  <option key={m} value={m}>
                    {m === 'All' ? 'All Merchants' : m}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active (Executable)</option>
              <option value="Cooling Period">Cooling Period (24h)</option>
              <option value="Frozen">Frozen / Suspended</option>
              <option value="Revoked">Revoked</option>
            </select>

            {/* Network Filter */}
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="All">All Chains</option>
              <option value="TRON">TRON (TRC-20)</option>
              <option value="ERC-20">Ethereum (ERC-20)</option>
              <option value="SOLANA">Solana</option>
              <option value="BSC">BNB Chain</option>
            </select>
          </div>
        </div>

        {/* Dense Multi-Tenant Address Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Merchant & Beneficiary</th>
                <th className="py-2.5 px-3">Rail / Network</th>
                <th className="py-2.5 px-3">Destination Address</th>
                <th className="py-2.5 px-3">KYT Score</th>
                <th className="py-2.5 px-3">Whitelist Timelock Status</th>
                <th className="py-2.5 px-3 text-right">Settled Payouts</th>
                <th className="py-2.5 px-4 text-center">Admin Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="font-semibold text-sm text-slate-600">No whitelisted addresses match filters</p>
                      <p className="text-xs text-slate-400 mt-0.5">Try selecting another merchant or chain filter.</p>
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
                      onClick={() => setSelectedAddress(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Merchant & Beneficiary */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                            {item.merchantName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                              <span>{item.beneficiaryName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] text-slate-500 font-medium">{item.merchantName}</span>
                              <span className="text-slate-300">·</span>
                              <span className="text-[10px] text-slate-400">{item.category}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rail / Network */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {item.network}
                        </span>
                      </td>

                      {/* Destination Address (Highlighted First 6 & Last 6) */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="font-bold text-slate-900">{item.address.slice(0, 6)}</span>
                          <span className="text-slate-400">...</span>
                          <span className="font-bold text-slate-900">{item.address.slice(-6)}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(item.fullAddress, item.id, e)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition ml-0.5"
                            title="Copy full address"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Added by {item.addedBy.split(' ')[0]}</span>
                      </td>

                      {/* KYT Score */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.kytRiskLevel === 'Clean'
                                ? 'bg-emerald-500'
                                : item.kytRiskLevel === 'Low'
                                ? 'bg-blue-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          <span className="font-bold text-slate-800">{item.kytRiskScore}/100</span>
                          <span className="text-[10px] text-slate-400">({item.kytRiskLevel})</span>
                        </div>
                      </td>

                      {/* Timelock Status Badge */}
                      <td className="py-3 px-3">
                        {isCooling && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                            <span>{item.coolingRemainingHours}h Timelock Left</span>
                          </div>
                        )}
                        {isActive && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Active (Executable)</span>
                          </div>
                        )}
                        {isFrozen && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
                            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                            <span>Frozen (Compliance Hold)</span>
                          </div>
                        )}
                        {isRevoked && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <Ban className="w-3.5 h-3.5 text-slate-500" />
                            <span>Revoked & Blacklisted</span>
                          </div>
                        )}
                      </td>

                      {/* Settled Volume */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                        {item.totalPaidOut}
                      </td>

                      {/* Admin Controls */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Fast-Track Bypass Button for Cooling Period */}
                          {isCooling && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingInstantApprove(item);
                              }}
                              className="px-2.5 py-1 bg-[#007F4E] hover:bg-[#00663E] text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition shadow-xs cursor-pointer"
                              title="Bypass 24h timelock with compliance justification"
                            >
                              <Unlock className="w-3 h-3" />
                              <span>Instant Approve</span>
                            </button>
                          )}

                          {/* Freeze / Unfreeze Toggle */}
                          {!isRevoked && (
                            <button
                              type="button"
                              onClick={(e) => handleToggleFreeze(item.id, e)}
                              className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                                isFrozen
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                              }`}
                              title={isFrozen ? 'Unfreeze Address' : 'Freeze Address'}
                            >
                              {isFrozen ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Revoke / Blacklist */}
                          {!isRevoked && (
                            <button
                              type="button"
                              onClick={(e) => handleRevokeAddress(item.id, e)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
                              title="Revoke & Blacklist"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedAddress(item)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 transition"
                            title="View Full Audit Drawer"
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

      {/* DETAILED INSPECTION DRAWER / MODAL */}
      {selectedAddress && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-lg h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideInRight">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {selectedAddress.merchantName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedAddress.beneficiaryName}</h3>
                    <p className="text-xs text-slate-500">{selectedAddress.merchantName} ({selectedAddress.merchantId})</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAddress(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Notice Banner */}
              <div className="mt-4">
                {selectedAddress.status === 'Cooling Period' && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>24-Hour Security Hold Cooling Period</span>
                    </div>
                    <p className="text-[11.5px] text-amber-700 leading-relaxed">
                      This destination address cannot receive payouts until {selectedAddress.coolingEndsAt} ({selectedAddress.coolingRemainingHours} hours remaining).
                      As SuperAdmin, you can review origin credentials and fast-track approval immediately.
                    </p>
                  </div>
                )}
                {selectedAddress.status === 'Active' && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Address verified and fully cleared for automated disbursement.</span>
                  </div>
                )}
                {selectedAddress.status === 'Frozen' && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Temporarily frozen by platform compliance due to elevated KYT score.</span>
                  </div>
                )}
              </div>

              {/* Technical Specifications */}
              <div className="mt-5 space-y-3.5 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400">
                  Address Parameters
                </h4>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Network & Rail</span>
                    <span className="font-semibold text-slate-800">{selectedAddress.network}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Beneficiary Category</span>
                    <span className="font-semibold text-slate-800">{selectedAddress.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Cumulative Payouts</span>
                    <span className="font-mono font-bold text-slate-900">{selectedAddress.totalPaidOut}</span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400 pt-2">
                  Cryptographic Destination Hash
                </h4>

                <div className="p-3 bg-slate-900 text-white rounded-xl font-mono text-xs break-all relative group">
                  <span className="text-emerald-400 font-bold">{selectedAddress.fullAddress.slice(0, 8)}</span>
                  <span className="text-slate-300">{selectedAddress.fullAddress.slice(8, -8)}</span>
                  <span className="text-emerald-400 font-bold">{selectedAddress.fullAddress.slice(-8)}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedAddress.fullAddress, selectedAddress.id)}
                    className="absolute right-2 top-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md transition"
                    title="Copy full hash"
                  >
                    {copiedId === selectedAddress.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400 pt-2">
                  Audit Trail & Operator Origin
                </h4>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-[11.5px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Added by Operator:</span>
                    <span className="font-semibold text-slate-800">{selectedAddress.addedBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Origin IP:</span>
                    <span className="font-mono text-slate-700">{selectedAddress.addedIp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Timestamp:</span>
                    <span className="text-slate-700">{selectedAddress.createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Sanctions Screening:</span>
                    <span className="font-semibold text-emerald-600">Passed (OFAC/EU Clean)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center gap-2">
              {selectedAddress.status === 'Cooling Period' && (
                <button
                  type="button"
                  onClick={() => handleInstantApprove(selectedAddress.id)}
                  className="flex-1 py-2.5 bg-[#007F4E] hover:bg-[#00663E] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Instant-Approve (Bypass 24h)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleToggleFreeze(selectedAddress.id)}
                className={`py-2.5 px-4 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                  selectedAddress.status === 'Frozen'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
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

              <button
                type="button"
                onClick={() => handleRevokeAddress(selectedAddress.id)}
                className="py-2.5 px-3 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                title="Revoke and blacklist"
              >
                <Ban className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingInstantApprove && (
        <AdminComplianceConfirmModal
          isOpen={true}
          title="Bypass 24h Cooling Timelock (Instant Approve)"
          description={`Override the mandatory 24-hour security hold for ${pendingInstantApprove.merchantName} address ${pendingInstantApprove.address}.`}
          actionLabel="Confirm Bypass"
          targetEntity={`${pendingInstantApprove.merchantName} · ${pendingInstantApprove.address}`}
          severity="Critical"
          onClose={() => setPendingInstantApprove(null)}
          onConfirm={() => {
            handleInstantApprove(pendingInstantApprove.id);
            setPendingInstantApprove(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminWhitelistPage;
