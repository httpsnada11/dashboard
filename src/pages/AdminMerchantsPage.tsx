import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Sliders,
  Search,
  ShieldCheck,
  Check
} from 'lucide-react';
import { MerchantKYBRecord } from '../types';

const INITIAL_MERCHANTS: MerchantKYBRecord[] = [
  {
    id: 'mer_01',
    businessName: 'Eagle Vision Market Ltd',
    legalEntity: 'Eagle Vision Market International LLC',
    jurisdiction: 'Seychelles (FSA-SD044)',
    registrationNo: 'SC-849102-B',
    directorName: 'Harrison Sterling',
    kybStatus: 'Approved',
    riskTier: 'Tier 1 (High Limits)',
    dailyLimit: '$500,000 / day',
    currentDailyVolume: '$218,450',
    appliedDate: '14 Oct 2026',
    amlScore: 96,
    documents: [
      { name: 'Certificate of Incorporation.pdf', type: 'COI', verified: true },
      { name: 'Director UBO Passport.pdf', type: 'KYC', verified: true },
      { name: 'FSA Regulatory License.pdf', type: 'AML', verified: true }
    ],
    whitelistedAssets: ['USDT (TRC-20)', 'USDC (ERC-20)', 'USDT (BEP-20)', 'USDC (SOL)']
  },
  {
    id: 'mer_02',
    businessName: 'Apex Forex Global',
    legalEntity: 'Apex Liquidity Services BVI Corp',
    jurisdiction: 'BVI (FSC-2091)',
    registrationNo: 'BVI-771920',
    directorName: 'Elena Rostova',
    kybStatus: 'Under Review',
    riskTier: 'Tier 2 (Standard)',
    dailyLimit: '$150,000 / day',
    currentDailyVolume: '$84,200',
    appliedDate: '26 Oct 2026',
    amlScore: 88,
    documents: [
      { name: 'Articles of Association.pdf', type: 'COI', verified: true },
      { name: 'Director Proof of Address.pdf', type: 'KYC', verified: false },
      { name: 'Bank Reference Letter.pdf', type: 'BANK', verified: true }
    ],
    whitelistedAssets: ['USDT (TRC-20)', 'USDC (ERC-20)']
  },
  {
    id: 'mer_03',
    businessName: 'Prime Liquidity Hub',
    legalEntity: 'Prime Settlement Global LLC',
    jurisdiction: 'St. Vincent & Grenadines',
    registrationNo: 'SVG-22910-IBC',
    directorName: 'David Al-Mansoor',
    kybStatus: 'Under Review',
    riskTier: 'Tier 2 (Standard)',
    dailyLimit: '$200,000 / day',
    currentDailyVolume: '$32,100',
    appliedDate: '28 Oct 2026',
    amlScore: 84,
    documents: [
      { name: 'Commercial Register Extract.pdf', type: 'COI', verified: true },
      { name: 'AML Policy & Risk Manual.pdf', type: 'AML', verified: true },
      { name: 'Shareholder Register.pdf', type: 'UBO', verified: false }
    ],
    whitelistedAssets: ['USDT (TRC-20)', 'USDC (ERC-20)', 'USDC (SOL)']
  },
  {
    id: 'mer_04',
    businessName: 'Vance Capital Markets',
    legalEntity: 'Vance Proprietary Investments Ltd',
    jurisdiction: 'United Kingdom (Companies House)',
    registrationNo: 'UK-14092188',
    directorName: 'Daniel Vance',
    kybStatus: 'Approved',
    riskTier: 'Tier 1 (High Limits)',
    dailyLimit: '$1,000,000 / day',
    currentDailyVolume: '$490,000',
    appliedDate: '10 Sep 2026',
    amlScore: 99,
    documents: [
      { name: 'UK Certificate of Good Standing.pdf', type: 'COI', verified: true },
      { name: 'Audited Financial Statements 2025.pdf', type: 'FIN', verified: true },
      { name: 'Sanctions Clearance Audit.pdf', type: 'AML', verified: true }
    ],
    whitelistedAssets: ['USDT (TRC-20)', 'USDC (ERC-20)', 'USDT (BEP-20)', 'USDC (SOL)', 'BTC (Native)']
  },
  {
    id: 'mer_05',
    businessName: 'Shadow OTC Trading Group',
    legalEntity: 'Shadow Global Offshore Ltd',
    jurisdiction: 'Panama (Unregulated)',
    registrationNo: 'PAN-99102-X',
    directorName: 'Anonymous Nominee',
    kybStatus: 'Rejected',
    riskTier: 'Tier 3 (Restricted)',
    dailyLimit: '$0 / day (Suspended)',
    currentDailyVolume: '$0',
    appliedDate: '15 Oct 2026',
    amlScore: 32,
    documents: [
      { name: 'Unverified Shell Extract.pdf', type: 'COI', verified: false }
    ],
    whitelistedAssets: [],
    rejectionReason: 'Anonymous nominee director in non-cooperative FATF jurisdiction; failed UBO verification.'
  }
];

export const AdminMerchantsPage: React.FC = () => {
  const [merchants, setMerchants] = useState<MerchantKYBRecord[]>(INITIAL_MERCHANTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantKYBRecord | null>(null);
  const [editingLimitMerchant, setEditingLimitMerchant] = useState<MerchantKYBRecord | null>(null);
  const [newLimitValue, setNewLimitValue] = useState<string>('250,000');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);

  const handleToggleAsset = (merchantId: string, asset: string) => {
    setMerchants((prev) =>
      prev.map((m) => {
        if (m.id !== merchantId) return m;
        const current = m.whitelistedAssets || ['USDT (TRC-20)', 'USDC (ERC-20)'];
        const updated = current.includes(asset)
          ? current.filter((a) => a !== asset)
          : [...current, asset];
        return { ...m, whitelistedAssets: updated };
      })
    );
    setSelectedMerchant((prev) => {
      if (!prev || prev.id !== merchantId) return prev;
      const current = prev.whitelistedAssets || ['USDT (TRC-20)', 'USDC (ERC-20)'];
      const updated = current.includes(asset)
        ? current.filter((a) => a !== asset)
        : [...current, asset];
      return { ...prev, whitelistedAssets: updated };
    });
  };

  const handleRejectWithReason = (merchantId: string) => {
    const reason = rejectReason.trim() || 'Missing corporate documentation / failed compliance screening';
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === merchantId
          ? { ...m, kybStatus: 'Rejected' as const, rejectionReason: reason, dailyLimit: '$0 / day (Suspended)' }
          : m
      )
    );
    setSelectedMerchant((prev) =>
      prev && prev.id === merchantId
        ? { ...prev, kybStatus: 'Rejected' as const, rejectionReason: reason, dailyLimit: '$0 / day (Suspended)' }
        : null
    );
    setShowRejectBox(false);
    setRejectReason('');
  };

  const filteredMerchants = merchants.filter((m) => {
    const matchesFilter =
      statusFilter === 'all' ||
      (statusFilter === 'approved' && m.kybStatus === 'Approved') ||
      (statusFilter === 'review' && m.kybStatus === 'Under Review') ||
      (statusFilter === 'rejected' && m.kybStatus === 'Rejected');

    const matchesSearch =
      searchQuery === '' ||
      m.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.jurisdiction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.directorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.registrationNo.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleUpdateStatus = (id: string, newStatus: MerchantKYBRecord['kybStatus']) => {
    setMerchants((prev) =>
      prev.map((m) => (m.id === id ? { ...m, kybStatus: newStatus } : m))
    );
    if (selectedMerchant && selectedMerchant.id === id) {
      setSelectedMerchant((prev) => (prev ? { ...prev, kybStatus: newStatus } : null));
    }
  };

  const handleSaveLimit = () => {
    if (!editingLimitMerchant) return;
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === editingLimitMerchant.id
          ? { ...m, dailyLimit: `$${newLimitValue} / day` }
          : m
      )
    );
    setEditingLimitMerchant(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
            Total Enrolled Merchants
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 font-sans">{merchants.length}</span>
            <span className="text-xs font-bold text-[#00C076]">+3 this week</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Institutional accounts</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-2xs bg-emerald-50/20">
          <span className="text-xs text-[#00C076] font-semibold uppercase tracking-wider block mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified & Active
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#00875A] font-sans">
              {merchants.filter((m) => m.kybStatus === 'Approved').length}
            </span>
            <span className="text-xs font-semibold text-emerald-600">Full KYC/KYB</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Processing unlimited volume</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100 shadow-2xs bg-amber-50/20">
          <span className="text-xs text-amber-600 font-semibold uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Pending Adjudication
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700 font-sans">
              {merchants.filter((m) => m.kybStatus === 'Under Review').length}
            </span>
            <span className="text-xs font-bold text-amber-600">Action Required</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Awaiting 1-click sign-off</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
            Aggregated Daily Cap
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 font-sans">$2.85M</span>
            <span className="text-xs font-semibold text-gray-500">Tier 1 & 2</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Automated underwriting limits</p>
        </div>
      </div>

      {/* Main Merchants Directory Table */}
      <div className="bg-white rounded-2xl sm:rounded-[26px] p-4 sm:p-6 shadow-xs border border-gray-100">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#00C076]" />
            <h3 className="text-base font-bold text-gray-900">Merchant KYB Adjudication Queue</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search merchant, director, country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C076] transition"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-gray-100/80 p-0.5 rounded-xl text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  statusFilter === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('review')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  statusFilter === 'review' ? 'bg-white text-amber-600 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Under Review
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  statusFilter === 'approved' ? 'bg-white text-[#00C076] shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Approved
              </button>
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs border-collapse min-w-[1020px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase font-semibold text-[10.5px] tracking-wider">
                <th className="pb-3 pl-2 whitespace-nowrap">Merchant Entity</th>
                <th className="pb-3 whitespace-nowrap">Jurisdiction</th>
                <th className="pb-3 whitespace-nowrap">Director / Reg No.</th>
                <th className="pb-3 whitespace-nowrap">AML Health</th>
                <th className="pb-3 whitespace-nowrap">Assigned Daily Limit</th>
                <th className="pb-3 whitespace-nowrap">KYB Status</th>
                <th className="pb-3 pr-2 text-right whitespace-nowrap">Adjudication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80">
              {filteredMerchants.map((merchant) => (
                <tr key={merchant.id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Entity Name */}
                  <td className="py-3.5 pl-2 whitespace-nowrap">
                    <p className="font-bold text-gray-900 leading-tight">{merchant.businessName}</p>
                    <p className="text-[10.5px] text-gray-400 truncate max-w-xs">{merchant.legalEntity}</p>
                  </td>

                  {/* Jurisdiction */}
                  <td className="py-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium text-[11px] whitespace-nowrap">
                      {merchant.jurisdiction}
                    </span>
                  </td>

                  {/* Director & Reg No */}
                  <td className="py-3.5 whitespace-nowrap">
                    <p className="font-semibold text-gray-800">{merchant.directorName}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{merchant.registrationNo}</p>
                  </td>

                  {/* AML Health */}
                  <td className="py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono font-bold">
                      <span className={`w-2 h-2 rounded-full ${merchant.amlScore > 85 ? 'bg-[#00C076]' : 'bg-red-500'}`} />
                      <span>{merchant.amlScore}%</span>
                    </div>
                  </td>

                  {/* Daily Limit */}
                  <td className="py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold font-mono text-gray-900">{merchant.dailyLimit}</span>
                      <button
                        onClick={() => {
                          setEditingLimitMerchant(merchant);
                          setNewLimitValue(merchant.dailyLimit.replace(/[^0-9]/g, ''));
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700"
                        title="Adjust Tier Limits"
                      >
                        <Sliders className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-400">Used: {merchant.currentDailyVolume}</span>
                  </td>

                  {/* KYB Status */}
                  <td className="py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10.5px] whitespace-nowrap ${
                        merchant.kybStatus === 'Approved'
                          ? 'bg-emerald-50 text-[#00C076] border border-emerald-200'
                          : merchant.kybStatus === 'Under Review'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}
                    >
                      {merchant.kybStatus === 'Approved' && <Check className="w-3 h-3" />}
                      {merchant.kybStatus}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedMerchant(merchant)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition flex items-center gap-1"
                        title="View Documentation"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Docs</span>
                      </button>

                      {merchant.kybStatus === 'Under Review' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(merchant.id, 'Approved')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#00C076] border border-emerald-200 font-bold transition text-[11px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(merchant.id, 'Rejected')}
                            className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold transition text-[11px]"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Documents Inspection Drawer / Modal */}
      {selectedMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00C076]" />
                <h3 className="font-bold text-gray-900 text-base">KYB Corporate Dossier</h3>
              </div>
              <button
                onClick={() => setSelectedMerchant(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-xs">
              <p className="font-bold text-gray-900 text-sm">{selectedMerchant.businessName}</p>
              <p className="text-gray-500">{selectedMerchant.legalEntity}</p>
              <p className="text-gray-500 font-mono text-[11px]">
                Reg: {selectedMerchant.registrationNo} · {selectedMerchant.jurisdiction}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                Submitted Verification Documents ({selectedMerchant.documents.length})
              </span>
              {selectedMerchant.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between shadow-2xs text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-[#00C076] flex-shrink-0" />
                    <span className="font-medium text-gray-800 truncate">{doc.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {doc.verified ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#00C076] text-[10px] font-bold">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                        Pending OCR
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Whitelisted Settlement Rails & Assets (Pillar 2) */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                  Whitelisted Settlement Assets & Rails
                </span>
                <span className="text-[10px] text-gray-400">Click to toggle whitelist</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['USDT (TRC-20)', 'USDC (ERC-20)', 'USDT (BEP-20)', 'USDC (SOL)', 'BTC (Native)'].map((asset) => {
                  const isWhitelisted = (selectedMerchant.whitelistedAssets || []).includes(asset);
                  return (
                    <button
                      key={asset}
                      onClick={() => handleToggleAsset(selectedMerchant.id, asset)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        isWhitelisted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-400 border border-gray-200 hover:text-gray-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isWhitelisted ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      <span>{asset}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rejection Note & Reason Box */}
            {showRejectBox && (
              <div className="p-3 bg-red-50 rounded-2xl border border-red-200 space-y-2 text-xs animate-fadeIn">
                <span className="font-bold text-red-900 block">Provide Compliance Rejection Reason</span>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Incomplete UBO identification, adverse regulatory media in jurisdiction."
                  className="w-full p-2 bg-white border border-red-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowRejectBox(false)}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRejectWithReason(selectedMerchant.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Current Status: <strong className="text-gray-900">{selectedMerchant.kybStatus}</strong>
              </span>
              <div className="flex items-center gap-2">
                {selectedMerchant.kybStatus !== 'Approved' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedMerchant.id, 'Approved')}
                      className="px-3 py-1.5 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-xl font-bold text-xs shadow-sm transition"
                    >
                      1-Click Approve
                    </button>
                    {!showRejectBox && selectedMerchant.kybStatus !== 'Rejected' && (
                      <button
                        onClick={() => setShowRejectBox(true)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs transition"
                      >
                        Reject...
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => {
                    setSelectedMerchant(null);
                    setShowRejectBox(false);
                  }}
                  className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Daily Limit Modal */}
      {editingLimitMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Adjust Merchant Daily Limit</h3>
            <p className="text-xs text-gray-500">
              Configure authorized automated payout and deposit settlement threshold for{' '}
              <strong className="text-gray-900">{editingLimitMerchant.businessName}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                New Daily Cap (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                <input
                  type="text"
                  value={newLimitValue}
                  onChange={(e) => setNewLimitValue(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-900 focus:outline-none focus:border-[#00C076]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingLimitMerchant(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLimit}
                className="px-5 py-2 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Save Limit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

