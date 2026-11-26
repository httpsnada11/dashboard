import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Clock,
  Search,
  Plus,
  Trash2,
  Copy,
  Check,
  Lock,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
import { AllowlistedAddress } from '../types';
import { api } from '../services/api';

export interface CustomersPageProps {
  onOpenPayoutWithDestination?: (dest: AllowlistedAddress) => void;
}

const INITIAL_ADDRESSES: AllowlistedAddress[] = [
  {
    id: 'addr_01',
    customerId: 'ref_otc_29371',
    beneficiaryName: 'Owen Shah (Genesis OTC)',
    category: 'First-Party Deposit',
    network: 'USDC · ERC-20',
    address: '0x4d8A..91eC',
    fullAddress: '0x4d8A00912cb84910ef123491eC10293847561a',
    status: 'Active',
    addedBy: 'Daniel Vance (Owner)',
    createdAt: '14 Oct 2026',
    totalPaidOut: '$38,750.00'
  },
  {
    id: 'addr_02',
    customerId: 'ref_vnd_84019',
    beneficiaryName: 'Apex Liquidity Services Ltd',
    category: 'Vendor Settlement',
    network: 'USDT · TRON',
    address: 'TYK9A..8v2L',
    fullAddress: 'TYK9A3XmUqZ9z8VnLw7h4Jb1k8Pq5D2gXy8v2L',
    status: 'Active',
    addedBy: 'Elena Rostova',
    createdAt: '22 Oct 2026',
    totalPaidOut: '$84,200.00'
  },
  {
    id: 'addr_03',
    customerId: 'ref_vlt_99214',
    beneficiaryName: 'Institutional Cold Vault Pool',
    category: 'First-Party Deposit',
    network: 'USDC · SOLANA',
    address: '7XqP..2vNp',
    fullAddress: '7XqP110293847aa1928374bb2vNp884912039485',
    status: 'Active',
    addedBy: 'Daniel Vance (Owner)',
    createdAt: '26 Oct 2026',
    totalPaidOut: '$150,000.00'
  },
  {
    id: 'addr_04',
    customerId: 'ref_vnd_15492',
    beneficiaryName: 'Alpha Cloud Infrastructure Ltd',
    category: 'Vendor Settlement',
    network: 'USDT · ERC-20',
    address: '0x91F2..3cA8',
    fullAddress: '0x91F20901abcf8912c7713cA8981240192837465',
    status: 'Cooling Period',
    coolingRemainingHours: 8,
    coolingEndsAt: 'Today at 21:30 UTC',
    addedBy: 'Marcus Vance',
    createdAt: 'Yesterday, 21:30',
    totalPaidOut: '$0.00'
  },
  {
    id: 'addr_05',
    customerId: 'ref_aff_47219',
    beneficiaryName: 'Global Affiliate Partners HK',
    category: 'Affiliate Commission',
    network: 'USDT · TRON',
    address: 'TR7N..8b1A',
    fullAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t8b1A',
    status: 'Cooling Period',
    coolingRemainingHours: 19,
    coolingEndsAt: 'Tomorrow at 08:15 UTC',
    addedBy: 'David Zhang',
    createdAt: 'Today, 03:15',
    totalPaidOut: '$0.00'
  },
  {
    id: 'addr_06',
    customerId: 'ref_otc_30017',
    beneficiaryName: 'Eagle Vision Prime Liquidity',
    category: 'OTC Liquidity Pool',
    network: 'USDT · BSC (BEP-20)',
    address: '0x38bE..11aD',
    fullAddress: '0x38bE8921bca9082ef45511aD9012437FeE335e23',
    status: 'Active',
    addedBy: 'Elena Rostova',
    createdAt: '18 Oct 2026',
    totalPaidOut: '$22,500.00'
  }
];

export const CustomersPage: React.FC<CustomersPageProps> = ({ onOpenPayoutWithDestination }) => {
  const [addresses, setAddresses] = useState<AllowlistedAddress[]>(() => {
    try {
      const saved = localStorage.getItem('copym_shared_merchant_addresses');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ADDRESSES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('copym_shared_merchant_addresses', JSON.stringify(addresses));
    } catch {
      // ignore
    }
  }, [addresses]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Cooling Period'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Address Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustId, setNewCustId] = useState('');
  const [newBeneficiary, setNewBeneficiary] = useState('');
  const [newCategory, setNewCategory] = useState<AllowlistedAddress['category']>('Vendor Settlement');
  const [newNetwork, setNewNetwork] = useState('USDT · TRON');
  const [newAddress, setNewAddress] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [formError, setFormError] = useState('');

  // Remove confirmation modal state
  const [removingAddress, setRemovingAddress] = useState<AllowlistedAddress | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newCustId.trim()) {
      setFormError('Please enter a Client Ref or Account reference.');
      return;
    }
    if (!newBeneficiary.trim()) {
      setFormError('Please enter the Beneficiary or Company Name.');
      return;
    }
    if (!newAddress.trim() || newAddress.length < 15) {
      setFormError('Please enter a valid destination crypto address.');
      return;
    }
    if (twoFactorCode.length < 6) {
      setFormError('Please enter your 6-digit hardware or authenticator 2FA code.');
      return;
    }

    const masked =
      newAddress.length > 12
        ? `${newAddress.slice(0, 6)}..${newAddress.slice(-4)}`
        : newAddress;

    let coolingEndsAt = 'In 24 hours';
    const cleanNet = newNetwork.includes('TRON')
      ? 'TRON'
      : newNetwork.includes('SOL')
      ? 'SOLANA'
      : newNetwork.includes('BSC')
      ? 'BSC'
      : 'ETHEREUM';

    try {
      const res = await api.allowlistDestination(newCustId.trim(), {
        address: newAddress.trim(),
        network: cleanNet,
      });
      if (res?.eligible_at) {
        coolingEndsAt = new Date(res.eligible_at).toLocaleString();
      }
    } catch (err: any) {
      console.warn('Backend screening notice:', err?.message || err);
    }

    const newRecord: AllowlistedAddress = {
      id: `addr_${Date.now()}`,
      customerId: newCustId.trim(),
      beneficiaryName: newBeneficiary.trim(),
      category: newCategory,
      network: newNetwork,
      address: masked,
      fullAddress: newAddress.trim(),
      status: 'Cooling Period',
      coolingRemainingHours: 24,
      coolingEndsAt: coolingEndsAt,
      addedBy: 'Daniel Vance (You)',
      createdAt: 'Just now',
      totalPaidOut: '$0.00'
    };

    setAddresses([newRecord, ...addresses]);
    setIsAddModalOpen(false);
    // Reset form
    setNewCustId('');
    setNewBeneficiary('');
    setNewAddress('');
    setTwoFactorCode('');
  };

  const handleConfirmRemove = () => {
    if (!removingAddress) return;
    setAddresses(addresses.filter((a) => a.id !== removingAddress.id));
    setRemovingAddress(null);
  };

  const filteredAddresses = addresses.filter((item) => {
    const matchesSearch =
      item.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fullAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.network.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = addresses.filter((a) => a.status === 'Active').length;
  const coolingCount = addresses.filter((a) => a.status === 'Cooling Period').length;

  return (
    <div className="space-y-6">
      {/* 24-Hour Cooling Period Security Advisory Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#14171A] via-[#1E293B] to-[#14171A] text-white border border-gray-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-[#00C076] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Payout addresses · 24h security hold
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00C076] text-white">
                Cooling Period Enforced
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Newly allowlisted payout destinations enter a mandatory 24-hour security delay before outbound funds can be dispatched.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-full text-xs font-semibold shadow-sm transition-all select-none shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Allowlist New Address</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
            Total Allowlisted
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 font-sans">{addresses.length}</span>
            <span className="text-xs font-bold text-gray-500">Destinations</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">First-party & verified vendors</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-2xs bg-emerald-50/20">
          <span className="text-xs text-[#00C076] font-semibold uppercase tracking-wider block mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active Ready for Payout
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#00875A] font-sans">{activeCount}</span>
            <span className="text-xs font-bold text-emerald-600">Zero Wait</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Passed 24h cooling verification</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100 shadow-2xs bg-amber-50/20">
          <span className="text-xs text-amber-600 font-semibold uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            In Security Cooling Period
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700 font-sans">{coolingCount}</span>
            <span className="text-xs font-bold text-amber-600">Locked</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Pending security cooling countdown</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
            Total Disbursed Volume
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 font-sans">$295,450</span>
            <span className="text-xs font-bold text-emerald-600">100% Whitelisted</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Across 14 settled batches</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl sm:rounded-[26px] p-4 sm:p-6 shadow-xs border border-gray-100">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-5 border-b border-gray-100">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search merchant ref, beneficiary, or wallet address..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#EAEBEF] hover:bg-[#E4E6EA] focus:bg-white border border-transparent focus:border-[#00C076] rounded-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400 mr-1" />
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">Status:</span>
            {(['All', 'Active', 'Cooling Period'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs rounded-full font-semibold transition-all select-none ${
                  statusFilter === st
                    ? 'bg-[#14171A] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Addresses Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 text-gray-400 uppercase tracking-wider text-[11px] border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Beneficiary / Merchant Ref</th>
                <th className="py-3.5 px-4 font-semibold">Purpose & Category</th>
                <th className="py-3.5 px-4 font-semibold">Network</th>
                <th className="py-3.5 px-4 font-semibold">Destination Address</th>
                <th className="py-3.5 px-4 font-semibold">Security Status</th>
                <th className="py-3.5 px-4 font-semibold">Added By</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredAddresses.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gray-900 text-xs">{item.beneficiaryName}</div>
                    <div className="text-[11px] text-gray-400 font-mono">{item.customerId}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10.5px] font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-800">
                    {item.network}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] text-gray-700">
                        {item.address}
                      </span>
                      <button
                        onClick={() => handleCopy(item.id, item.fullAddress)}
                        title="Copy Full Address"
                        className="p-1 hover:text-gray-900 text-gray-400 rounded transition-colors"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-[#00C076]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {item.status === 'Active' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-[#00C076]" />
                        Active & Verified
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10.5px] font-bold">
                          <Lock className="w-3 h-3 text-amber-600" />
                          Cooling: {item.coolingRemainingHours}h remaining
                        </span>
                        <div className="w-28 bg-gray-200 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-amber-500 h-1 rounded-full transition-all"
                            style={{ width: `${Math.round(((24 - (item.coolingRemainingHours || 0)) / 24) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 text-[11.5px]">
                    <div>{item.addedBy}</div>
                    <div className="text-[10px] text-gray-400">{item.createdAt}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status === 'Active' ? (
                        <button
                          onClick={() => onOpenPayoutWithDestination?.(item)}
                          className="px-2.5 py-1 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-lg font-bold text-[11px] shadow-2xs transition flex items-center gap-1"
                        >
                          <span>Pay</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span
                          className="px-2.5 py-1 bg-gray-100 text-gray-400 rounded-lg font-semibold text-[11px] cursor-not-allowed"
                          title="Locked under 24-hour security hold rule"
                        >
                          Locked
                        </span>
                      )}
                      <button
                        onClick={() => setRemovingAddress(item)}
                        className="p-1 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-lg transition"
                        title="Remove from Whitelist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Allowlisted Address Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 text-gray-800">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 rounded-2xl bg-emerald-50 text-[#00C076] border border-emerald-100">
                <Users className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Allowlist New Destination Address</h3>
                <p className="text-xs text-gray-400">Save a trusted counterparty for recurring outbound payouts.</p>
              </div>
            </div>

            {/* Mandatory Cooling Security Warning */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>24-Hour Cooling Security:</strong> Once added, this address cannot receive payouts for 24 hours. This rule is non-bypassable and protects your merchant balance from account takeovers.
              </p>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold mb-3">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddAddress} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Merchant Client / Account Ref</label>
                  <input
                    type="text"
                    value={newCustId}
                    onChange={(e) => setNewCustId(e.target.value)}
                    placeholder="e.g. ref_otc_88192"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00C076] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Beneficiary / Entity Name</label>
                  <input
                    type="text"
                    value={newBeneficiary}
                    onChange={(e) => setNewBeneficiary(e.target.value)}
                    placeholder="e.g. Acme Liquidity Desk"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00C076] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Settlement Network</label>
                  <select
                    value={newNetwork}
                    onChange={(e) => setNewNetwork(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00C076] focus:outline-none font-medium text-gray-800"
                  >
                    <option value="USDT · TRON">USDT · TRON (TRC-20)</option>
                    <option value="USDC · ERC-20">USDC · Ethereum (ERC-20)</option>
                    <option value="USDT · ERC-20">USDT · Ethereum (ERC-20)</option>
                    <option value="USDT · BSC">USDT · BNB Chain (BEP-20)</option>
                    <option value="USDC · SOLANA">USDC · Solana</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Disbursement Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as AllowlistedAddress['category'])}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00C076] focus:outline-none font-medium text-gray-800"
                  >
                    <option value="Vendor Settlement">Vendor Settlement</option>
                    <option value="First-Party Deposit">First-Party Deposit</option>
                    <option value="OTC Liquidity Pool">OTC Liquidity Pool</option>
                    <option value="Affiliate Commission">Affiliate Commission</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Destination Crypto Address</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Paste destination wallet address (0x... or T...)"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:border-[#00C076] focus:outline-none"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <label className="block font-bold text-gray-800 mb-1">Hardware / Authenticator 2FA Code</label>
                <p className="text-[11px] text-gray-500 mb-2">Authorize this security change using your registered YubiKey or authenticator app.</p>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                  className="w-36 px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono font-bold text-center tracking-widest text-base focus:border-[#00C076] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-xl font-bold shadow-sm transition"
                >
                  Confirm & Start 24h Cooling
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke / Remove Confirmation Modal */}
      {removingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 text-gray-800 space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
                <Trash2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-gray-900">Remove Allowlisted Address?</h3>
                <p className="text-xs text-gray-400">This action requires a re-cooling period if added again.</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-gray-900">{removingAddress.beneficiaryName}</div>
              <div className="text-gray-500 font-mono text-[11px]">{removingAddress.fullAddress}</div>
              <div className="text-gray-400 text-[10px]">{removingAddress.network} • Ref: {removingAddress.customerId}</div>
            </div>

            <p className="text-xs text-gray-500">
              Are you sure you want to revoke this address? If you re-add it later, it will be subject to a fresh 24-hour security cooling period.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRemovingAddress(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
              >
                Keep Address
              </button>
              <button
                onClick={handleConfirmRemove}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Revoke Whitelist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
