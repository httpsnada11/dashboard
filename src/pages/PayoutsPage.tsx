import React, { useState, useEffect } from 'react';
import { Search, Upload, CheckCircle2, Check, Copy, X } from 'lucide-react';
import { PayoutRecord } from '../types';
import { api } from '../services/api';
import { getPayoutRisk, MERCHANT, toPayoutRef } from '../utils/sharedMockStore';

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
  const [secondChecker, setSecondChecker] = useState('');
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ amount: '', address: '', purpose: 'CUSTOMER_WITHDRAWAL', assetNetwork: 'USDT - TRON (TRC-20)', twoFa: '' });
  const [createError, setCreateError] = useState<string | null>(null);
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

          const sourceRef = p.merchant_order_id || p.merchant_reference || p.id;
          const canonicalRef = toPayoutRef(sourceRef, idx);
          const risk = getPayoutRisk(sourceRef);

          return {
            id: p.id || canonicalRef,
            ref: canonicalRef,
            fullRef: canonicalRef,
            amount: p.amount ? Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00',
            numericAmount: Number(p.amount || 0),
            network: `${p.currency || 'USDT'} • ${p.network || 'TRON'}`,
            customer: p.merchant_order_id || p.payer_id || p.external_customer_id || 'ord_live',
            destinationType: 'DESTINATION • FIRST-PARTY DEPOSIT',
            destinationAddress: shortDest,
            fullAddress: dest,
            requestedBy: p.requested_by || MERCHANT.owner,
            complianceText: risk.label,
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

  useEffect(() => {
    const pending = payouts.filter(p => p.createdAt === 'Just now' && /Screening passed|KYC verified/i.test(p.complianceText));
    if (pending.length === 0) return;
    setPayouts(prev => prev.map(p => (
      p.createdAt === 'Just now' && /Screening passed|KYC verified/i.test(p.complianceText)
        ? { ...p, complianceText: 'Screening…' }
        : p
    )));
    const t = setTimeout(() => {
      setPayouts(prev => prev.map(p => (
        p.complianceText === 'Screening…' ? { ...p, complianceText: getPayoutRisk(p.ref).label } : p
      )));
    }, 1500);
    return () => clearTimeout(t);
  }, [payouts.length]);

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleConfirmApprove = async () => {
    if (!approveModalItem) return;
    const amt = approveModalItem.numericAmount || parseFloat(approveModalItem.amount.replace(/,/g, '')) || 0;
    if (!/^\d{6}$/.test(approval2Fa.trim())) {
      setApprovalError('Enter a valid 6-digit 2FA code.');
      return;
    }
    if (amt > 5000 && secondChecker.trim().length < 2) {
      setApprovalError('A second checker name is required for payouts over $5,000.');
      return;
    }
    try {
      await api.approvePayout(approveModalItem.id);
      setToastMessage(`Payout ${approveModalItem.ref} approved for processing.`);
      setApproveModalItem(null);
      setApproval2Fa('');
      setSecondChecker('');
      setApprovalError(null);
      await loadPayouts();
    } catch (err: any) {
      setApprovalError(err.message || 'Error authorizing payout');
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreatePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    const amt = parseFloat(createForm.amount);
    if (!createForm.amount || isNaN(amt) || amt <= 0) { setCreateError('Enter a valid amount.'); return; }
    if (!createForm.address.trim()) { setCreateError('Enter a destination address.'); return; }
    if (!/^\d{6}$/.test(createForm.twoFa.trim())) { setCreateError('Enter a valid 6-digit 2FA code.'); return; }
    const [currency, netPart] = createForm.assetNetwork.split(' - ');
    const network = netPart?.includes('TRON') ? 'TRON' : netPart?.includes('BEP-20') ? 'BSC' : netPart?.includes('Polygon') ? 'POLYGON' : 'ETHEREUM';
    try {
      await api.createPayout({ amount: amt.toFixed(2), currency: currency || 'USDT', network, destination_address: createForm.address.trim(), merchant_order_id: `ord_${Date.now()}` });
      const newItem: PayoutRecord = {
        id: `PAY-${Date.now().toString().slice(-6)}`,
        ref: `PAY-${Date.now().toString().slice(-6)}`,
        fullRef: `PAY-${Date.now().toString().slice(-6)}`,
        amount: amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        numericAmount: amt,
        network: `${currency || 'USDT'} • ${netPart?.replace(/\(.*\)/, '').trim() || 'TRON'}`,
        customer: `ord_${Math.floor(10000 + Math.random() * 90000)}`,
        destinationType: 'DESTINATION • FIRST-PARTY DEPOSIT',
        destinationAddress: createForm.address.length > 14 ? `${createForm.address.slice(0, 6)}...${createForm.address.slice(-4)}` : createForm.address,
        fullAddress: createForm.address.trim(),
        requestedBy: MERCHANT.owner,
        complianceText: 'Screening…',
        status: 'Needs approval',
        createdAt: 'Just now',
      };
      setPayouts(prev => [newItem, ...prev]);
      setShowCreateModal(false);
      setCreateForm({ amount: '', address: '', purpose: 'CUSTOMER_WITHDRAWAL', assetNetwork: 'USDT - TRON (TRC-20)', twoFa: '' });
      setToastMessage('Payout created. Screening started.');
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create payout');
    }
    setTimeout(() => setToastMessage(null), 3000);
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
          <CheckCircle2 className="w-4 h-4 text-[#007F4E]" />
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
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap select-none ${
                  isActive
                    ? 'bg-[#007F4E] text-white shadow-sm'
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
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search payout or merchant order ID"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200/80 hover:border-gray-300 focus:border-[#007F4E] rounded-full text-xs text-gray-800 placeholder-gray-500 focus:outline-none transition shadow-2xs"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-2.5 text-gray-500 hover:text-gray-600 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Sort: Oldest First Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'oldest' ? 'newest' : 'oldest')}
            className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-full text-xs font-medium transition shadow-2xs whitespace-nowrap select-none"
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

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Create payout</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreatePayoutSubmit} className="pt-4 space-y-3 text-xs">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Asset and network</label>
                <select value={createForm.assetNetwork} onChange={e => setCreateForm(f => ({ ...f, assetNetwork: e.target.value }))} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                  <option value="USDT - TRON (TRC-20)">USDT - TRON (TRC-20)</option>
                  <option value="USDC - Ethereum (ERC-20)">USDC - Ethereum (ERC-20)</option>
                  <option value="USDT - Ethereum (ERC-20)">USDT - Ethereum (ERC-20)</option>
                  <option value="USDT - BNB Chain (BEP-20)">USDT - BNB Chain (BEP-20)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Amount</label>
                <input type="number" step="any" value={createForm.amount} onChange={e => setCreateForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Destination address</label>
                <input type="text" value={createForm.address} onChange={e => setCreateForm(f => ({ ...f, address: e.target.value }))} placeholder="Enter destination address" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Purpose</label>
                <select value={createForm.purpose} onChange={e => setCreateForm(f => ({ ...f, purpose: e.target.value }))} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                  <option value="CUSTOMER_WITHDRAWAL">Customer withdrawal</option>
                  <option value="AFFILIATE_PAYOUT">Affiliate payout</option>
                  <option value="VENDOR_EXPENSE">Vendor expense</option>
                  <option value="TREASURY_REBALANCE">Treasury rebalance</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">2FA code</label>
                <input type="text" inputMode="numeric" maxLength={6} value={createForm.twoFa} onChange={e => setCreateForm(f => ({ ...f, twoFa: e.target.value.replace(/\D/g, '').slice(0, 6) }))} placeholder="Enter 6-digit 2FA code" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs" />
              </div>
              {createError && <div className="p-2 bg-red-50 text-red-700 rounded-lg">{createError}</div>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-xl font-semibold">Create payout</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Cards Stack */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500 text-xs border border-gray-100 shadow-sm">
            Loading payouts from database...
          </div>
        ) : filteredPayouts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500 text-xs border border-gray-100 shadow-sm">
            <p className="font-semibold text-sm text-gray-700">No payout records found</p>
            <p className="text-xs text-gray-500 mt-1 mb-3">
              Click <strong>"+ Create payout"</strong> to create a payout request.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              + Create payout
            </button>
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
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-[#6B7280]">
                    <span>{item.network}</span>
                    <div className="flex items-center gap-1">
                      <span>{item.ref}</span>
                      <button
                        onClick={(e) => handleCopy(e, item.ref, item.id)}
                        className="text-gray-300 hover:text-gray-600 transition"
                        title="Copy Reference"
                      >
                        {copiedId === item.id ? <Check className="w-3 h-3 text-[#007F4E]" /> : <Copy className="w-3 h-3" />}
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
                        className="px-2.5 py-1 text-xs font-semibold text-[#DC2626] hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => {
                          setApproveModalItem(item);
                          setApproval2Fa('');
                          setSecondChecker('');
                          setApprovalError(null);
                        }}
                        className="px-4 py-1.5 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-full text-xs font-semibold transition shadow-xs select-none cursor-pointer"
                      >
                        Approve
                      </button>
                    </>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-3 pt-3 border-t border-gray-100/70 text-xs">
                {/* Column 1: Merchant Order ID */}
                <div>
                  <span className="text-xs font-semibold tracking-wider uppercase text-[#6B7280] block">
                    MERCHANT ORDER ID
                  </span>
                  <span className="font-medium text-gray-800 mt-0.5 block truncate font-mono">
                    {item.customer}
                  </span>
                </div>

                {/* Column 2: Destination */}
                <div>
                  <span className="text-xs font-semibold tracking-wider uppercase text-[#6B7280] block">
                    {item.destinationType}
                  </span>
                  <span className="font-mono text-gray-800 mt-0.5 block truncate">
                    {item.destinationAddress}
                  </span>
                </div>

                {/* Column 3: Requested By */}
                <div>
                  <span className="text-xs font-semibold tracking-wider uppercase text-[#6B7280] block">
                    REQUESTED BY
                  </span>
                  <span className="font-medium text-gray-800 mt-0.5 block truncate">
                    {item.requestedBy}
                  </span>
                </div>

                {/* Column 4: Compliance Checks */}
                <div>
                  <span className="text-xs font-semibold tracking-wider uppercase text-[#6B7280] block">
                    COMPLIANCE CHECKS
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-gray-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#007F4E] flex-shrink-0" />
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
                <span className="font-mono text-gray-800 text-xs max-w-[200px] break-all text-right">{approveModalItem.fullAddress || approveModalItem.destinationAddress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Requested By</span>
                <span className="font-medium text-gray-800">{approveModalItem.requestedBy}</span>
              </div>
            </div>

            {(approveModalItem.numericAmount > 5000 || parseFloat(approveModalItem.amount.replace(/,/g, '')) > 5000) && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs leading-relaxed">
                <span className="font-bold block mb-0.5">Second approval required</span>
                This payout is over $5,000. Enter a 6-digit 2FA code and a second checker before approving.
              </div>
            )}

            {/* 2FA Input */}
            <div className="mb-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-800 block mb-1">
                  2FA code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={approval2Fa}
                  onChange={(e) => setApproval2Fa(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit 2FA code"
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono text-xs text-gray-900 focus:outline-none focus:border-[#007F4E] transition"
                />
              </div>
              {(approveModalItem.numericAmount > 5000 || parseFloat(approveModalItem.amount.replace(/,/g, '')) > 5000) && (
                <div>
                  <label className="text-xs font-semibold text-gray-800 block mb-1">
                    Second checker
                  </label>
                  <input
                    type="text"
                    value={secondChecker}
                    onChange={(e) => setSecondChecker(e.target.value)}
                    placeholder="Enter second checker name"
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#007F4E] transition"
                  />
                </div>
              )}
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
                className="px-4 py-1.5 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-xl font-semibold shadow-xs cursor-pointer"
              >
                Approve payout
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
                <Upload className="w-4 h-4 text-[#007F4E]" />
                <h3 className="text-sm font-bold text-gray-900">Import CSV Batch Payouts</h3>
              </div>
              <button onClick={() => setShowBatchModal(false)} className="text-gray-500 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <div className="border-2 border-dashed border-gray-200 hover:border-[#007F4E] rounded-2xl p-6 text-center cursor-pointer transition">
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="font-semibold text-gray-800">Drop your payouts .csv file here</p>
                <p className="text-xs text-gray-500 mt-1">Columns: merchant_order_id, network, amount, address</p>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2 text-xs">
              <button onClick={() => setShowBatchModal(false)} className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">
                Close
              </button>
              <button
                onClick={() => {
                  setShowBatchModal(false);
                  setToastMessage("Batch of 14 payouts queued for compliance check.");
                  setTimeout(() => setToastMessage(null), 3500);
                }}
                className="px-4 py-1.5 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-xl font-semibold shadow-xs"
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

