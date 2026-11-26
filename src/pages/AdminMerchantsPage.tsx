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
import { AdminComplianceConfirmModal, AdminDialog } from '../components/AdminComplianceConfirmModal';
import { appendAuditEvent } from '../utils/auditLogStore';
import { MERCHANT } from '../utils/sharedMockStore';

const INITIAL_MERCHANTS: MerchantKYBRecord[] = [
  {
    id: 'mer_01',
    businessName: MERCHANT.name,
    legalEntity: MERCHANT.legalName,
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
    businessName: MERCHANT.name,
    legalEntity: 'Meridian Settlement Services Ltd',
    jurisdiction: 'BVI (FSC-2091)',
    registrationNo: 'BVI-771920',
    directorName: 'Nadia Okoro',
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
    businessName: 'Meridian Trading Ltd',
    legalEntity: 'Meridian Trading Ltd',
    jurisdiction: 'United Kingdom (Companies House)',
    registrationNo: 'UK-14092188',
    directorName: 'Daniel Reed',
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
    whitelistedAssets: ['USDT (TRC-20)', 'USDC (ERC-20)', 'USDT (BEP-20)', 'USDC (SOL)']
  },
  {
    id: 'mer_05',
    businessName: 'Meridian FX Clearing',
    legalEntity: 'Meridian Clearing Corp',
    jurisdiction: 'Panama (Pending License)',
    registrationNo: 'PAN-99102-X',
    directorName: 'Rafael Morales',
    kybStatus: 'Rejected',
    riskTier: 'Tier 3 (Restricted)',
    dailyLimit: '$0 / day (Suspended)',
    currentDailyVolume: '$0',
    appliedDate: '15 Oct 2026',
    amlScore: 32,
    documents: [
      { name: 'Corporate Registry Extract.pdf', type: 'COI', verified: false }
    ],
    whitelistedAssets: [],
    rejectionReason: 'Incomplete UBO verification in pending-license jurisdiction.'
  }
];

export const AdminMerchantsPage: React.FC = () => {
  const [merchants, setMerchants] = useState<MerchantKYBRecord[]>(INITIAL_MERCHANTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantKYBRecord | null>(null);
  const [editingLimitMerchant, setEditingLimitMerchant] = useState<MerchantKYBRecord | null>(null);
  const [newLimitValue, setNewLimitValue] = useState<string>('250,000');
  const [pendingKybApprove, setPendingKybApprove] = useState<MerchantKYBRecord | null>(null);
  const [pendingKybReject, setPendingKybReject] = useState<MerchantKYBRecord | null>(null);
  const [viewingDoc, setViewingDoc] = useState<{ name: string; type: string; verified: boolean } | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState<Record<string, string>>({});

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
    appendAuditEvent({
      action: 'Merchant Settlement Asset Updated',
      target: `${merchantId} · ${asset}`,
      reasonCode: 'Manual Review Completed (Evidence Attached)',
      note: 'Settlement rail availability updated in the merchant KYB dossier.',
      severity: 'Warning',
    });
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

  const handleUpdateStatus = (
    id: string,
    newStatus: MerchantKYBRecord['kybStatus'],
    note?: string
  ) => {
    const rejectionReason =
      newStatus === 'Rejected'
        ? note || 'Compliance rejection recorded in the audit trail.'
        : undefined;
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, kybStatus: newStatus, rejectionReason } : m
      )
    );
    if (selectedMerchant && selectedMerchant.id === id) {
      setSelectedMerchant((prev) =>
        prev ? { ...prev, kybStatus: newStatus, rejectionReason } : null
      );
    }
  };

  const handleSaveLimit = () => {
    if (!editingLimitMerchant) return;
    const limit = Number(newLimitValue.replace(/[^0-9]/g, ''));
    if (!Number.isFinite(limit) || limit <= 0) return;
    const updatedLimit = `$${limit.toLocaleString()} / day`;
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === editingLimitMerchant.id ? { ...m, dailyLimit: updatedLimit } : m
      )
    );
    setSelectedMerchant((prev) =>
      prev && prev.id === editingLimitMerchant.id
        ? { ...prev, dailyLimit: updatedLimit }
        : prev
    );
    appendAuditEvent({
      action: 'Daily Volume Limit Modified',
      target: `${editingLimitMerchant.businessName} · ${updatedLimit}`,
      reasonCode: 'Manual Review Completed (Evidence Attached)',
      note: 'Authorized underwriting limit updated by platform operations.',
      severity: 'Warning',
    });
    setEditingLimitMerchant(null);
  };

  const aggregatedCap = merchants
    .filter((m) => m.kybStatus !== 'Rejected')
    .reduce((sum, m) => sum + Number(m.dailyLimit.replace(/[^0-9]/g, '')), 0);

  return (
    <div className="space-y-6">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
          <span className="text-xs text-[#6B7280] font-semibold uppercase tracking-wider block mb-1">
            Total Enrolled Merchants
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 font-sans">{merchants.length}</span>
            <span className="text-xs font-bold text-[#007F4E]">+3 this week</span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">Institutional accounts</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-2xs bg-emerald-50/20">
          <span className="text-xs text-[#007F4E] font-semibold uppercase tracking-wider block mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified & Active
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#00875A] font-sans">
              {merchants.filter((m) => m.kybStatus === 'Approved').length}
            </span>
            <span className="text-xs font-semibold text-emerald-600">Full KYC/KYB</span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">Within assigned daily limits</p>
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
          <p className="text-xs text-[#6B7280] mt-1">Awaiting documented sign-off</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
          <span className="text-xs text-[#6B7280] font-semibold uppercase tracking-wider block mb-1">
            Aggregated Daily Cap
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 font-sans">
              ${(aggregatedCap / 1000000).toFixed(2)}M
            </span>
            <span className="text-xs font-semibold text-gray-500">Tier 1 & 2</span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">Automated underwriting limits</p>
        </div>
      </div>

      {/* Main Merchants Directory Table */}
      <div className="bg-white rounded-2xl sm:rounded-[26px] p-4 sm:p-6 shadow-xs border border-gray-100">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#007F4E]" />
            <h3 className="text-base font-bold text-gray-900">Merchant KYB Adjudication Queue</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
            {/* Search */}
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search merchant, director, country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#007F4E] transition"
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
                  statusFilter === 'approved' ? 'bg-white text-[#007F4E] shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Approved
              </button>
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="table-scroll mt-3">
          <table className="w-full text-left text-xs border-collapse min-w-[1020px]">
            <thead>
              <tr className="border-b border-gray-100 text-[#6B7280] uppercase font-semibold text-xs tracking-wider">
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
                    <p className="text-xs text-[#6B7280] truncate max-w-xs">{merchant.legalEntity}</p>
                  </td>

                  {/* Jurisdiction */}
                  <td className="py-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium text-xs whitespace-nowrap">
                      {merchant.jurisdiction}
                    </span>
                  </td>

                  {/* Director & Reg No */}
                  <td className="py-3.5 whitespace-nowrap">
                    <p className="font-semibold text-gray-800">{merchant.directorName}</p>
                    <p className="text-xs text-[#6B7280] font-mono">{merchant.registrationNo}</p>
                  </td>

                  {/* AML Health */}
                  <td className="py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono font-bold">
                      <span className={`w-2 h-2 rounded-full ${merchant.amlScore > 85 ? 'bg-[#007F4E]' : 'bg-red-500'}`} />
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
                        className="p-1 hover:bg-gray-100 rounded text-[#6B7280] hover:text-gray-700"
                        title="Adjust Tier Limits"
                      >
                        <Sliders className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-xs text-[#6B7280]">Used: {merchant.currentDailyVolume}</span>
                  </td>

                  {/* KYB Status */}
                  <td className="py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-xs whitespace-nowrap ${
                        merchant.kybStatus === 'Approved'
                          ? 'bg-emerald-50 text-[#007F4E] border border-emerald-200'
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
                            onClick={() => setPendingKybApprove(merchant)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#007F4E] border border-emerald-200 font-bold transition text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setPendingKybReject(merchant)}
                            className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold transition text-xs"
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
      <AdminDialog
        isOpen={!!selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
        ariaLabel="KYB corporate dossier"
      >
        {selectedMerchant && (
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-gray-100 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#007F4E]" />
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
              <p className="text-gray-500 font-mono text-xs">
                Reg: {selectedMerchant.registrationNo} · {selectedMerchant.jurisdiction}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-[#6B7280] tracking-wider">
                Submitted Verification Documents ({selectedMerchant.documents.length})
              </span>
              {selectedMerchant.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between shadow-2xs text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-[#007F4E] flex-shrink-0" />
                    <span className="font-medium text-gray-800 truncate">{doc.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {doc.verified ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#007F4E] text-xs font-bold">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                        Pending OCR
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setViewingDoc(viewingDoc?.name === doc.name ? null : doc)}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      {viewingDoc?.name === doc.name ? 'Hide' : 'View'}
                    </button>
                  </div>
                </div>
              ))}

              {viewingDoc && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Document Preview · {viewingDoc.name}</span>
                    <button
                      type="button"
                      onClick={() => setViewingDoc(null)}
                      className="text-slate-500 hover:text-slate-800 font-semibold text-xs cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-500 block">Document Type</span>
                      <span className="font-semibold text-slate-800">{viewingDoc.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">OCR Extraction</span>
                      <span className={`font-semibold ${viewingDoc.verified ? 'text-[#007F4E]' : 'text-amber-700'}`}>
                        {viewingDoc.verified ? 'Completed · Confidence 99.1%' : 'Pending OCR Scan'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Entity Match</span>
                      <span className="font-semibold text-slate-800">{selectedMerchant.legalEntity}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Registration Ref</span>
                      <span className="font-mono font-semibold text-slate-800">{selectedMerchant.registrationNo}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* UBO & Sanctions Screening Sections (A13) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-gray-100 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block">
                  Beneficial Ownership (UBO)
                </span>
                <p className="font-semibold text-gray-900">{selectedMerchant.directorName}</p>
                <p className="text-xs text-gray-500">100% Direct Ownership · Verified ID</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block">
                  Sanctions & Adverse Media
                </span>
                <p className="font-semibold text-[#007F4E]">
                  {selectedMerchant.amlScore >= 70 ? 'Cleared (OFAC / EU / UN)' : 'Flagged for Enhanced Review'}
                </p>
                <p className="text-xs text-gray-500">PEP & Sanctions Score: {selectedMerchant.amlScore}/100</p>
              </div>
            </div>

            {/* Compliance Reviewer Notes (A13) */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <label className="text-xs uppercase font-bold text-gray-500 tracking-wider block">
                Compliance Reviewer Notes
              </label>
              <textarea
                rows={2}
                value={reviewerNotes[selectedMerchant.id] || ''}
                onChange={(e) =>
                  setReviewerNotes((prev) => ({ ...prev, [selectedMerchant.id]: e.target.value }))
                }
                placeholder="Add internal KYB review observations, UBO clarifications, or escalation notes..."
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#007F4E] resize-none"
              />
            </div>

            {/* Whitelisted Settlement Rails & Assets (Pillar 2) */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                  Whitelisted Settlement Assets & Rails
                </span>
                <span className="text-xs text-[#6B7280]">Click to toggle whitelist</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['USDT (TRC-20)', 'USDC (ERC-20)', 'USDT (BEP-20)', 'USDC (SOL)'].map((asset) => {
                  const isWhitelisted = (selectedMerchant.whitelistedAssets || []).includes(asset);
                  return (
                    <button
                      key={asset}
                      onClick={() => handleToggleAsset(selectedMerchant.id, asset)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        isWhitelisted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-[#6B7280] border border-gray-200 hover:text-gray-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isWhitelisted ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      <span>{asset}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedMerchant.documents.some((d) => !d.verified) && selectedMerchant.kybStatus !== 'Approved' && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                Approval is disabled until all submitted documents complete OCR verification.
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="text-xs text-gray-500">
                Current Status: <strong className="text-gray-900">{selectedMerchant.kybStatus}</strong>
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedMerchant.kybStatus !== 'Approved' && (
                  <>
                    <button
                      onClick={() => setPendingKybApprove(selectedMerchant)}
                      disabled={selectedMerchant.documents.some((d) => !d.verified)}
                      title={
                        selectedMerchant.documents.some((d) => !d.verified)
                          ? 'Complete OCR verification on all documents before approving'
                          : 'Approve merchant KYB'
                      }
                      className="flex-1 sm:flex-initial px-3 py-1.5 bg-[#007F4E] hover:bg-[#00663E] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs shadow-sm transition cursor-pointer"
                    >
                      Approve KYB
                    </button>
                    {selectedMerchant.kybStatus !== 'Rejected' && (
                      <button
                        onClick={() => setPendingKybReject(selectedMerchant)}
                        className="flex-1 sm:flex-initial px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs transition cursor-pointer"
                      >
                        Reject...
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => setSelectedMerchant(null)}
                  className="flex-1 sm:flex-initial px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminDialog>

      {/* Adjust Daily Limit Modal */}
      <AdminDialog
        isOpen={!!editingLimitMerchant}
        onClose={() => setEditingLimitMerchant(null)}
        ariaLabel="Adjust merchant daily limit"
      >
        {editingLimitMerchant && (
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-gray-100 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
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
                  className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-900 focus:outline-none focus:border-[#007F4E]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingLimitMerchant(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLimit}
                className="px-5 py-2 bg-[#007F4E] hover:bg-[#00663E] text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
              >
                Save Limit
              </button>
            </div>
          </div>
        )}
      </AdminDialog>

      {pendingKybApprove && (
        <AdminComplianceConfirmModal
          isOpen={true}
          title="Approve Merchant KYB Dossier"
          description={`Confirm full KYB & UBO verification approval for ${pendingKybApprove.businessName} (${pendingKybApprove.jurisdiction}).`}
          actionLabel="Approve KYB"
          targetEntity={`${pendingKybApprove.businessName} (${pendingKybApprove.registrationNo})`}
          severity="Info"
          variant="primary"
          requireSecondApprover
          onClose={() => setPendingKybApprove(null)}
          onConfirm={() => {
            handleUpdateStatus(pendingKybApprove.id, 'Approved');
            setPendingKybApprove(null);
          }}
        />
      )}

      {pendingKybReject && (
        <AdminComplianceConfirmModal
          isOpen={true}
          title="Reject Merchant KYB Dossier"
          description={`Record a compliance rejection for ${pendingKybReject.businessName} (${pendingKybReject.jurisdiction}).`}
          actionLabel="Confirm Rejection"
          targetEntity={`${pendingKybReject.businessName} (${pendingKybReject.registrationNo})`}
          severity="Critical"
          variant="destructive"
          requireSecondApprover
          onClose={() => setPendingKybReject(null)}
          onConfirm={(_reasonCode, note) => {
            handleUpdateStatus(pendingKybReject.id, 'Rejected', note);
            setPendingKybReject(null);
          }}
        />
      )}
    </div>
  );
};

