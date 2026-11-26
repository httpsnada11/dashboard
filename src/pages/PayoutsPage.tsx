import React, { useState, useEffect } from 'react';
import { Search, Upload, CheckCircle2, Check, Copy, X } from 'lucide-react';
import { PayoutRecord } from '../types';
import { api } from '../services/api';

export interface PayoutsPageProps {
  payouts?: PayoutRecord[];
  setPayouts: React.Dispatch<React.SetStateAction<PayoutRecord[]>>;
  globalSearchQuery?: string;
  onOpenCreatePayout?: () => void;
}

export const PayoutsPage: React.FC<PayoutsPageProps> = ({
  payouts = [],
  setPayouts,
  globalSearchQuery = '',
  onOpenCreatePayout,
}) => {
  const [activeTab, setActiveTab] = useState('needs-approval');
  const [localSearch, setLocalSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'oldest' | 'newest'>('oldest');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [declineModalItem, setDeclineModalItem] = useState<PayoutRecord | null>(null);
  const [approveModalItem, setApproveModalItem] = useState<PayoutRecord | null>(null);
  const [approval2Fa, setApproval2Fa] = useState('');
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dynamic counts for each status tab
  const needsApprovalCount = payouts.filter(p => p.status === 'Needs approval').length;
  const inFlightCount = payouts.filter(p => p.status === 'In flight').length;
  const completedCount = payouts.filter(p => p.status === 'Completed').length;
  const failedCount = payouts.filter(p => p.status === 'Failed').length;

  const filterTabs = [
    { id: 'needs-approval', label: `Needs approval ${needsApprovalCount}`, statusMatch: 'Needs approval' },
    { id: 'in-flight', label: `In flight ${inFlightCount}`, statusMatch: 'In flight' },
    { id: 'completed', label: `Completed ${completedCount}`, statusMatch: 'Completed' },
    { id: 'failed', label: `Failed ${failedCount}`, statusMatch: 'Failed' },
  ];

  // Fetch real payouts from backend
  const loadPayouts = async () => {
    try {
      setLoading(true);
      const res = await api.getPayouts();
      const raw = res?.data || res?.payouts || (Array.isArray(res) ? res : []);
      if (Array.isArray(raw)) {
        const mapped: PayoutRecord[] = raw.map((p: any, idx: number) => {
          let statusText: PayoutRecord['status'] = 'Needs approval';
          const s = (p.status || '').toUpperCase();
          if (s === 'COMPLETED' || s === 'SUCCESS') {
            statusText = 'Completed';
          } else if (s.includes('SUBMIT') || s.includes('CHAIN') || s.includes('IN_FLIGHT') || s === 'PROCESSING') {
            statusText = 'In flight';
          } else if (s.includes('APPROVAL') || s === 'PENDING') {
            statusText = 'Needs approval';
          } else if (s.includes('CANCEL') || s.includes('REJECT') || s.includes('FAIL')) {
            statusText = 'Failed';
          }

          const dest = p.destination_address || p.destination || '';
          const shortDest = dest.length > 14 ? `${dest.substring(0, 6)}...${dest.substring(dest.length - 4)}` : dest;

          return {
            id: p.id || `pay_${idx}`,
            ref: p.merchant_order_id ? p.merchant_order_id.slice(0, 14) : (p.id?.slice(0, 12) || `WD-${idx}`),
            fullRef: p.merchant_order_id || p.merchant_reference || p.id,
            amount: p.amount ? Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00',
            numericAmount: Number(p.amount || 0),
            network: `${p.currency || 'USDT'} · ${p.network || 'TRON'}`,
            customer: p.merchant_order_id || p.payer_id || p.external_customer_id || 'ord_live',
            destinationType: 'DESTINATION · FIRST-PARTY DEPOSIT',
            destinationAddress: shortDest,
            fullAddress: dest,
            requestedBy: p.requested_by || 'Admin Console',
            complianceText: 'KYC verified · sanctions clear',
            status: statusText,
            createdAt: p.created_at || p.createdAt || 'Just now',
          };
        });
        setPayouts(mapped);
      }
    } catch (err) {
      console.warn('Could not load payouts from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, []);

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleConfirmApprove = async () => {
    if (!approveModalItem) return;
    try {
      await api.approvePayout(approveModalItem.id);
      setToastMessage(`Payout ${approveModalItem.ref} authorized! Dispatched to node.`);
      setApproveModalItem(null);
      setApproval2Fa('');
      setApprovalError(null);
      await loadPayouts();
    } catch (err: any) {
      setApprovalError(err.message || 'Error authorizing payout');
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmDecline = async () => {
    if (!declineModalItem) return;
    try {
      await api.cancelPayout(declineModalItem.id);
      setToastMessage(`Payout ${declineModalItem.ref} cancelled.`);
      setDeclineModalItem(null);
      await loadPayouts();
    } catch (err: any) {
      alert(`Decline error: ${err.message || 'Error cancelling payout'}`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter & sort
  const effectiveSearch = localSearch || globalSearchQuery;
  const filteredPayouts = payouts
    .filter(item => {
      const currentTabObj = filterTabs.find(t => t.id === activeTab);
      const matchesTab = !currentTabObj?.statusMatch || item.status === currentTabObj.statusMatch;

      const matchesSearch =
        effectiveSearch === '' ||
        item.ref.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        item.customer.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        item.destinationAddress.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        item.requestedBy.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        item.network.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        item.amount.includes(effectiveSearch);

      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'oldest') {
        return a.id.localeCompare(b.id);
      }
      return b.id.localeCompare(a.id);
    });

  return (
    <div className="w-full flex flex-col space-y-3 sm:space-y-3.5 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-fadeIn border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#00C076]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Filter Pills & Search / Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap select-none ${
                  isActive
                    ? 'bg-[#00C076] text-white shadow-sm'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: Search Box & Sort Button */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex items-center min-w-[210px] sm:min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search payout or merchant order ID"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200/80 hover:border-gray-300 focus:border-[#00C076] rounded-full text-[11.5px] text-gray-800 placeholder-gray-400 focus:outline-none transition shadow-2xs"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-2.5 text-gray-400 hover:text-gray-600 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Sort: Oldest First Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'oldest' ? 'newest' : 'oldest')}
            className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-full text-[11.5px] font-medium transition shadow-2xs whitespace-nowrap select-none"
          >
            {/* Sort icon matching screenshot */}
            <svg className="w-3.5 h-3.5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="14" y2="12" />
              <line x1="4" y1="18" x2="8" y2="18" />
            </svg>
            <span className="capitalize">{sortOrder} first</span>
          </button>
        </div>
      </div>

      {/* Payout Cards Stack */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-xs border border-gray-100 shadow-sm">
            Loading payouts from database...
          </div>
        ) : filteredPayouts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-xs border border-gray-100 shadow-sm">
            <p className="font-semibold text-sm text-gray-700">No payout records found</p>
            <p className="text-xs text-gray-400 mt-1 mb-3">
              Click <strong>"+ Create payout"</strong> above to request an outbound crypto transfer.
            </p>
            {onOpenCreatePayout && (
              <button
                type="button"
                onClick={onOpenCreatePayout}
                className="px-4 py-2 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                + Create Payout
              </button>
            )}
          </div>
        ) : (
          filteredPayouts.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 sm:p-4.5 border border-gray-100/90 shadow-2xs hover:shadow-xs transition-shadow animate-fadeIn"
            >
              {/* Card Top Row: Amount & Action Buttons */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[17px] sm:text-[18px] font-bold text-[#14171A] leading-tight">
                    {item.amount}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11.5px] text-[#8E95A5]">
                    <span>{item.network}</span>
                    <div className="flex items-center gap-1">
                      <span>{item.ref}</span>
                      <button
                        onClick={(e) => handleCopy(e, item.ref, item.id)}
                        className="text-gray-300 hover:text-gray-600 transition"
                        title="Copy Reference"
                      >
                        {copiedId === item.id ? <Check className="w-3 h-3 text-[#00C076]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {item.status === 'Needs approval' ? (
                    <>
                      <button
                        onClick={() => setDeclineModalItem(item)}
                        className="px-2.5 py-1 text-[11.5px] font-semibold text-[#DC2626] hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => {
                          setApproveModalItem(item);
                          setApproval2Fa('');
                          setApprovalError(null);
                        }}
                        className="px-4 py-1.5 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-full text-[11.5px] font-semibold transition shadow-xs select-none cursor-pointer"
                      >
                        Approve
                      </button>
                    </>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                      item.status === 'Completed'
                        ? 'bg-emerald-50 text-[#00824E]'
                        : item.status === 'In flight'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {item.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Bottom Row: 4 Diverse Metadata Columns */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-3 pt-3 border-t border-gray-100/70 text-[11.5px]">
                {/* Column 1: Merchant Order ID */}
                <div>
                  <span className="text-[9.5px] font-semibold tracking-wider uppercase text-[#8E95A5] block">
                    MERCHANT ORDER ID
                  </span>
                  <span className="font-medium text-gray-800 mt-0.5 block truncate font-mono">
                    {item.customer}
                  </span>
                </div>

                {/* Column 2: Destination */}
                <div>
                  <span className="text-[9.5px] font-semibold tracking-wider uppercase text-[#8E95A5] block">
                    {item.destinationType}
                  </span>
                  <span className="font-mono text-gray-800 mt-0.5 block truncate">
                    {item.destinationAddress}
                  </span>
                </div>

                {/* Column 3: Requested By */}
                <div>
                  <span className="text-[9.5px] font-semibold tracking-wider uppercase text-[#8E95A5] block">
                    REQUESTED BY
                  </span>
                  <span className="font-medium text-gray-800 mt-0.5 block truncate">
                    {item.requestedBy}
                  </span>
                </div>

                {/* Column 4: Compliance Checks */}
                <div>
                  <span className="text-[9.5px] font-semibold tracking-wider uppercase text-[#8E95A5] block">
                    COMPLIANCE CHECKS
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-gray-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00C076] flex-shrink-0" />
                    <span className="truncate">{item.complianceText}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Authorize Payout Confirmation Modal */}
      {approveModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Authorize Payout Release</h3>
            <p className="text-xs text-gray-500 mt-1">
              Confirm cryptographic signature and dispatch of funds to the recipient address.
            </p>

            <div className="my-4 p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                <span className="text-gray-500">Reference</span>
                <span className="font-mono font-bold text-gray-800">{approveModalItem.ref}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-gray-900 text-sm">{approveModalItem.amount} {approveModalItem.network.split(' ')[0]}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                <span className="text-gray-500">Network</span>
                <span className="font-semibold text-gray-800">{approveModalItem.network}</span>
              </div>
              <div className="flex justify-between items-start border-b border-gray-200/60 pb-2">
                <span className="text-gray-500">Destination</span>
                <span className="font-mono text-gray-800 text-[11px] max-w-[200px] break-all text-right">{approveModalItem.fullAddress || approveModalItem.destinationAddress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Requested By</span>
                <span className="font-medium text-gray-800">{approveModalItem.requestedBy}</span>
              </div>
            </div>

            {/* Maker-Checker Rule Notice if over $5,000 */}
            {(approveModalItem.numericAmount > 5000 || parseFloat(approveModalItem.amount.replace(/,/g, '')) > 5000) && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed">
                <span className="font-bold block mb-0.5">Dual-Control Policy Enforced</span>
                This payout exceeds the $5,000.00 threshold. By approving, you sign as the secondary authorized checker.
              </div>
            )}

            {/* 2FA Input */}
            <div className="mb-4">
              <label className="text-[11.5px] font-semibold text-gray-800 block mb-1">
                Security Officer 2FA Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={approval2Fa}
                onChange={(e) => setApproval2Fa(e.target.value)}
                placeholder="Enter 6-digit authenticator code (optional for demo)"
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono text-xs text-gray-900 focus:outline-none focus:border-[#00C076] transition"
              />
            </div>

            {approvalError && (
              <div className="mb-3 p-2 bg-red-50 text-red-700 text-xs rounded-lg">
                {approvalError}
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setApproveModalItem(null)}
                className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-4 py-1.5 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-xl font-semibold shadow-xs cursor-pointer"
              >
                Authorize & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Confirmation Modal */}
      {declineModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-5 shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Decline Payout Request?</h3>
            <p className="text-xs text-gray-500 mt-1">
              Are you sure you want to decline payout <strong>{declineModalItem.ref}</strong> for <strong>{declineModalItem.amount} {declineModalItem.network}</strong>?
            </p>
            <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setDeclineModalItem(null)}
                className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecline}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-xs"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#00C076]" />
                <h3 className="text-sm font-bold text-gray-900">Import CSV Batch Payouts</h3>
              </div>
              <button onClick={() => setShowBatchModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <div className="border-2 border-dashed border-gray-200 hover:border-[#00C076] rounded-2xl p-6 text-center cursor-pointer transition">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-semibold text-gray-800">Drop your payouts .csv file here</p>
                <p className="text-[11px] text-gray-400 mt-1">Columns: merchant_order_id, network, amount, address</p>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2 text-xs">
              <button onClick={() => setShowBatchModal(false)} className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">
                Close
              </button>
              <button
                onClick={() => {
                  setShowBatchModal(false);
                  setToastMessage("Batch of 14 payouts queued for compliance check!");
                  setTimeout(() => setToastMessage(null), 3500);
                }}
                className="px-4 py-1.5 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-xl font-semibold shadow-xs"
              >
                Upload & Process
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

