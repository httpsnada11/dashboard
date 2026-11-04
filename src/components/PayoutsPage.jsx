import React, { useState } from 'react';
import { Search, ArrowUpDown, Upload, Plus, CheckCircle2, XCircle, AlertCircle, Check, Copy, ExternalLink, X, ShieldCheck } from 'lucide-react';

const INITIAL_PAYOUTS = [
  {
    id: 'pay_1',
    ref: 'pay_3LX8..C51',
    fullRef: 'pay_3LX891280a9bC51',
    amount: '8,750.00',
    numericAmount: 8750,
    network: 'USDC · ERC-20',
    customer: 'cust_29371',
    destinationType: 'DESTINATION · FIRST-PARTY DEPOSIT',
    destinationAddress: '0x4d8A..91eC',
    fullAddress: '0x4d8A00912cb84910ef123491eC',
    requestedBy: 'Owen Shah',
    complianceText: 'KYC verified · sanctions clear',
    status: 'Needs approval',
    createdAt: '28 Oct 2026, 14:20'
  },
  {
    id: 'pay_2',
    ref: 'pay_3LX8..C52',
    fullRef: 'pay_3LX891280a9bC52',
    amount: '8,750.00',
    numericAmount: 8750,
    network: 'USDC · ERC-20',
    customer: 'cust_29371',
    destinationType: 'DESTINATION · FIRST-PARTY DEPOSIT',
    destinationAddress: '0x4d8A..91eC',
    fullAddress: '0x4d8A00912cb84910ef123491eC',
    requestedBy: 'Owen Shah',
    complianceText: 'KYC verified · sanctions clear',
    status: 'Needs approval',
    createdAt: '28 Oct 2026, 14:15'
  },
  {
    id: 'pay_3',
    ref: 'pay_3LX8..C53',
    fullRef: 'pay_3LX891280a9bC53',
    amount: '8,750.00',
    numericAmount: 8750,
    network: 'USDC · ERC-20',
    customer: 'cust_29371',
    destinationType: 'DESTINATION · FIRST-PARTY DEPOSIT',
    destinationAddress: '0x4d8A..91eC',
    fullAddress: '0x4d8A00912cb84910ef123491eC',
    requestedBy: 'Owen Shah',
    complianceText: 'KYC verified · sanctions clear',
    status: 'Needs approval',
    createdAt: '28 Oct 2026, 14:05'
  },
  {
    id: 'pay_4',
    ref: 'pay_3LX8..C54',
    fullRef: 'pay_3LX891280a9bC54',
    amount: '8,750.00',
    numericAmount: 8750,
    network: 'USDC · ERC-20',
    customer: 'cust_29371',
    destinationType: 'DESTINATION · FIRST-PARTY DEPOSIT',
    destinationAddress: '0x4d8A..91eC',
    fullAddress: '0x4d8A00912cb84910ef123491eC',
    requestedBy: 'Owen Shah',
    complianceText: 'KYC verified · sanctions clear',
    status: 'Needs approval',
    createdAt: '28 Oct 2026, 13:50'
  },
  {
    id: 'pay_5',
    ref: 'pay_3LX8..C55',
    fullRef: 'pay_3LX891280a9bC55',
    amount: '8,750.00',
    numericAmount: 8750,
    network: 'USDC · ERC-20',
    customer: 'cust_29371',
    destinationType: 'DESTINATION · FIRST-PARTY DEPOSIT',
    destinationAddress: '0x4d8A..91eC',
    fullAddress: '0x4d8A00912cb84910ef123491eC',
    requestedBy: 'Owen Shah',
    complianceText: 'KYC verified · sanctions clear',
    status: 'Needs approval',
    createdAt: '28 Oct 2026, 13:30'
  },
  {
    id: 'pay_6',
    ref: 'pay_3LX8..C56',
    fullRef: 'pay_3LX891280a9bC56',
    amount: '8,750.00',
    numericAmount: 8750,
    network: 'USDC · ERC-20',
    customer: 'cust_29371',
    destinationType: 'DESTINATION · FIRST-PARTY DEPOSIT',
    destinationAddress: '0x4d8A..91eC',
    fullAddress: '0x4d8A00912cb84910ef123491eC',
    requestedBy: 'Owen Shah',
    complianceText: 'KYC verified · sanctions clear',
    status: 'Needs approval',
    createdAt: '28 Oct 2026, 13:10'
  },
  {
    id: 'pay_7',
    ref: 'pay_3LX8..C57',
    fullRef: 'pay_3LX891280a9bC57',
    amount: '8,750.00',
    numericAmount: 8750,
    network: 'USDC · ERC-20',
    customer: 'cust_29371',
    destinationType: 'DESTINATION · FIRST-PARTY DEPOSIT',
    destinationAddress: '0x4d8A..91eC',
    fullAddress: '0x4d8A00912cb84910ef123491eC',
    requestedBy: 'Owen Shah',
    complianceText: 'KYC verified · sanctions clear',
    status: 'Needs approval',
    createdAt: '28 Oct 2026, 12:45'
  }
];

export const PayoutsPage = ({
  globalSearchQuery = '',
  onOpenCreatePayout
}) => {
  const [payouts, setPayouts] = useState(INITIAL_PAYOUTS);
  const [activeTab, setActiveTab] = useState('needs-approval');
  const [localSearch, setLocalSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('oldest'); // 'oldest' | 'newest'
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [declineModalItem, setDeclineModalItem] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Counts
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

  const handleCopy = (e, text, id) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleApprove = (item) => {
    setPayouts(prev => prev.map(p => p.id === item.id ? { ...p, status: 'In flight' } : p));
    setToastMessage(`Payout ${item.ref} approved! Dispatched to node.`);
    setTimeout(() => {
      setPayouts(prev => prev.map(p => p.id === item.id ? { ...p, status: 'Completed' } : p));
    }, 2500);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmDecline = () => {
    if (!declineModalItem) return;
    setPayouts(prev => prev.map(p => p.id === declineModalItem.id ? { ...p, status: 'Failed' } : p));
    setToastMessage(`Payout ${declineModalItem.ref} declined.`);
    setDeclineModalItem(null);
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
              placeholder="Search payout or customer ID"
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

      {/* Payout Cards Stack (Exact card design from screenshot) */}
      <div className="space-y-2.5">
        {filteredPayouts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-xs border border-gray-100 shadow-sm">
            No payouts match the current filter or search criteria.
          </div>
        ) : (
          filteredPayouts.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 sm:p-4.5 border border-gray-100/90 shadow-2xs hover:shadow-xs transition-shadow"
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
                        onClick={() => handleApprove(item)}
                        className="px-4 py-1.5 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-full text-[11.5px] font-semibold transition shadow-xs select-none"
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

              {/* Card Bottom Row: 4 Metadata Columns */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-3 pt-3 border-t border-gray-100/70 text-[11.5px]">
                {/* Column 1: Customer */}
                <div>
                  <span className="text-[9.5px] font-semibold tracking-wider uppercase text-[#8E95A5] block">
                    CUSTOMER
                  </span>
                  <span className="font-medium text-gray-800 mt-0.5 block truncate">
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
                <p className="text-[11px] text-gray-400 mt-1">Columns: customer_id, network, amount, address</p>
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
