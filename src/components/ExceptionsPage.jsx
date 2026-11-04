import React, { useState } from 'react';
import { Search, CornerDownRight, Check, Copy, ExternalLink, X, ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

const INITIAL_EXCEPTIONS = [
  {
    id: 'exc_1',
    excId: 'exc_7MV2..R84',
    fullExcId: 'exc_7MV299411082R84',
    crmRef: 'CRM-DEP-92641',
    customer: 'cust_41862',
    reasonTitle: 'Late payment',
    reasonSub: 'CRM request closed',
    receivedDate: '28 Oct 2026',
    receivedTime: '08:20 UTC · 1d 4h',
    amount: '3,250.00',
    network: 'USDT · TRON',
    status: 'Pending',
    actionType: 'Review & settle'
  },
  {
    id: 'exc_2',
    excId: 'exc_7MV2..T29',
    fullExcId: 'exc_7MV288722014T29',
    crmRef: 'CRM-DEP-92658',
    customer: 'cust_52703',
    reasonTitle: 'Amount mismatch',
    reasonSub: 'Expected 2,000.00 USDC',
    receivedDate: '28 Oct 2026',
    receivedTime: '18:45 UTC',
    amount: '1,800.00',
    network: 'USDC · ERC-20',
    status: 'In review',
    actionType: 'Continue review'
  },
  {
    id: 'exc_3',
    excId: 'exc_7MV2..B63',
    fullExcId: 'exc_7MV277641090B63',
    crmRef: 'No CRM reference',
    customer: 'Unidentified',
    reasonTitle: 'Missing reference',
    reasonSub: 'Customer match needed',
    receivedDate: '29 Oct 2026',
    receivedTime: '07:10 UTC',
    amount: '925.00',
    network: 'USDT · BEP-20',
    status: 'Pending',
    actionType: 'Review & settle'
  },
  {
    id: 'exc_4',
    excId: 'exc_7MV2..F15',
    fullExcId: 'exc_7MV255410982F15',
    crmRef: 'CRM-DEP-92702',
    customer: 'cust_63184',
    reasonTitle: 'Late payment',
    reasonSub: 'CRM request closed',
    receivedDate: '29 Oct 2026',
    receivedTime: '09:35 UTC',
    amount: '4,600.00',
    network: 'USDT · TRON',
    status: 'Pending',
    actionType: 'Review & settle'
  },
  {
    id: 'exc_5',
    excId: 'exc_7MV2..K90',
    fullExcId: 'exc_7MV244199081K90',
    crmRef: 'CRM-DEP-92718',
    customer: 'cust_74216',
    reasonTitle: 'Amount mismatch',
    reasonSub: 'Expected 650.00 USDC',
    receivedDate: '29 Oct 2026',
    receivedTime: '11:05 UTC',
    amount: '675.00',
    network: 'USDC · ERC-20',
    status: 'Pending',
    actionType: 'Review & settle'
  },
  {
    id: 'exc_6',
    excId: 'exc_7MV2..D47',
    fullExcId: 'exc_7MV211099831D47',
    crmRef: 'CRM-DEP-92587',
    customer: 'cust_38659',
    reasonTitle: 'Late payment',
    reasonSub: 'CRM booking required',
    receivedDate: '27 Oct 2026',
    receivedTime: '16:40 UTC',
    amount: '2,450.00',
    network: 'USDT · TRON',
    status: 'Settled',
    actionType: 'View settlement'
  }
];

export const ExceptionsPage = ({ globalSearchQuery = '' }) => {
  const [exceptions, setExceptions] = useState(INITIAL_EXCEPTIONS);
  const [activeFilter, setActiveFilter] = useState('all');
  const [localSearch, setLocalSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedException, setSelectedException] = useState(null);
  const [settleToast, setSettleToast] = useState(null);

  const filterTabs = [
    { id: 'all', label: 'All 6', match: null },
    { id: 'pending', label: 'Pending 4', match: 'Pending' },
    { id: 'review', label: 'In review 1', match: 'In review' },
    { id: 'settled', label: 'Settled 1', match: 'Settled' },
  ];

  const handleCopy = (e, text, id) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleOpenFirst = () => {
    const firstPending = exceptions.find(e => e.status === 'Pending' || e.status === 'In review');
    if (firstPending) {
      setSelectedException(firstPending);
    }
  };

  const handleSettleAction = (exc, newStatus) => {
    setExceptions(prev => prev.map(e => e.id === exc.id ? {
      ...e,
      status: newStatus,
      actionType: newStatus === 'Settled' ? 'View settlement' : 'Continue review'
    } : e));
    setSelectedException(null);
    setSettleToast(`Exception ${exc.excId} marked as ${newStatus}!`);
    setTimeout(() => setSettleToast(null), 3000);
  };

  // Filtered rows
  const effectiveSearch = localSearch || globalSearchQuery;
  const filteredData = exceptions.filter((row) => {
    const matchesSearch =
      effectiveSearch === '' ||
      row.excId.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      row.crmRef.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      row.customer.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      row.reasonTitle.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      row.network.toLowerCase().includes(effectiveSearch.toLowerCase());

    const currentTab = filterTabs.find(t => t.id === activeFilter);
    const matchesStatus =
      !currentTab?.match || row.status.toLowerCase() === currentTab.match.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full flex flex-col space-y-3.5 animate-fadeIn">
      {/* Toast feedback */}
      {settleToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-fadeIn border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#00C076]" />
          <span>{settleToast}</span>
        </div>
      )}

      {/* Top Filter & Search Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
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

        {/* Right: Search Input & "Open first" Action */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex items-center min-w-[210px] sm:min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search ID, customer or CRM ref"
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

          {/* Open First Button */}
          <button
            onClick={handleOpenFirst}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-full text-[11.5px] font-medium transition shadow-2xs whitespace-nowrap select-none"
          >
            {/* Split arrows / Open first icon */}
            <svg className="w-3.5 h-3.5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span>Open first</span>
          </button>
        </div>
      </div>

      {/* Modern Fitted Exceptions Table Container */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <table className="w-full text-left border-collapse min-w-[780px]">
            {/* Dark Sleek Header Bar */}
            <thead>
              <tr className="bg-[#18191B] text-white text-[12px] sm:text-[12.5px] font-medium tracking-normal select-none">
                <th className="py-2.5 px-4 sm:px-5 rounded-tl-2xl">Exception / CRM ref</th>
                <th className="py-2.5 px-3">Customer ID</th>
                <th className="py-2.5 px-3">Reason</th>
                <th className="py-2.5 px-3">Received on</th>
                <th className="py-2.5 px-3">Received amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-4 sm:px-5 text-center rounded-tr-2xl">Action</th>
              </tr>
            </thead>

            {/* Table Rows matching screenshot */}
            <tbody className="divide-y divide-gray-100/90 text-[12px] sm:text-[12.5px]">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No exceptions match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#F9FAFB] transition-colors group"
                  >
                    {/* Exception / CRM ref */}
                    <td className="py-2.5 sm:py-3 px-4 sm:px-5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#14171A]">{row.excId}</span>
                        <button
                          onClick={(e) => handleCopy(e, row.excId, row.id)}
                          title="Copy Exception ID"
                          className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedId === row.id ? (
                            <Check className="w-3 h-3 text-[#00C076]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className={`text-[10px] sm:text-[10.5px] leading-tight mt-0.5 ${
                        row.crmRef.includes('No CRM') ? 'text-gray-400 italic' : 'text-[#8E95A5]'
                      }`}>
                        {row.crmRef}
                      </div>
                    </td>

                    {/* Customer ID */}
                    <td className="py-2.5 sm:py-3 px-3">
                      <span className={`${row.customer === 'Unidentified' ? 'text-gray-400 italic' : 'text-[#4B5563]'}`}>
                        {row.customer}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="py-2.5 sm:py-3 px-3">
                      <div className="font-medium text-[#1E293B]">{row.reasonTitle}</div>
                      <div className="text-[10px] sm:text-[10.5px] text-[#8E95A5] leading-tight mt-0.5">
                        {row.reasonSub}
                      </div>
                    </td>

                    {/* Received on */}
                    <td className="py-2.5 sm:py-3 px-3">
                      <div className="font-medium text-[#1E293B]">{row.receivedDate}</div>
                      <div className="text-[10px] sm:text-[10.5px] text-[#8E95A5] leading-tight mt-0.5">
                        {row.receivedTime}
                      </div>
                    </td>

                    {/* Received amount */}
                    <td className="py-2.5 sm:py-3 px-3">
                      <div className="font-bold text-[#14171A]">{row.amount}</div>
                      <div className="text-[10px] sm:text-[10.5px] text-[#8E95A5] leading-tight mt-0.5">
                        {row.network}
                      </div>
                    </td>

                    {/* Status Pill Badge */}
                    <td className="py-2.5 sm:py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F3F4F6] text-[#374151] text-[10.5px] sm:text-[11px] font-medium border border-gray-200/60 shadow-2xs whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                        {row.status}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-2.5 sm:py-3 px-4 sm:px-5 text-center">
                      {row.actionType === 'View settlement' ? (
                        <button
                          onClick={() => setSelectedException(row)}
                          className="px-3.5 py-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-[11px] font-semibold transition shadow-2xs whitespace-nowrap"
                        >
                          View settlement
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedException(row)}
                          className="px-3.5 py-1 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-full text-[11px] font-semibold transition shadow-2xs whitespace-nowrap"
                        >
                          {row.actionType}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 px-1 text-xs select-none text-[#6B7280]">
        <span className="text-[11px] sm:text-[12px]">
          Showing all 6 sample exceptions · Amounts in asset units
        </span>
        <span className="text-[11px] sm:text-[12px]">
          As of 29 Oct 2026, 12:20 UTC
        </span>
      </div>

      {/* Review & Settle Modal Sheet */}
      {selectedException && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00C076] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {selectedException.status === 'Settled' ? 'Settlement Clearance' : 'Exception Review & Resolution'}
                  </h3>
                  <p className="text-xs text-gray-500">{selectedException.excId} · {selectedException.crmRef}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedException(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-3.5 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-400">Detected Received Amount</span>
                  <p className="text-xl font-bold text-gray-900">
                    {selectedException.amount} <span className="text-sm font-semibold text-gray-500">{selectedException.network}</span>
                  </p>
                </div>
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full font-semibold text-gray-700 shadow-xs">
                  {selectedException.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block mb-0.5">Exception Reason</span>
                  <span className="font-semibold text-gray-900">{selectedException.reasonTitle}</span>
                  <p className="text-[10px] text-gray-500 mt-0.5">{selectedException.reasonSub}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block mb-0.5">Customer Reference</span>
                  <span className="font-semibold text-gray-900">{selectedException.customer}</span>
                  <p className="text-[10px] text-gray-500 mt-0.5">{selectedException.receivedTime}</p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 flex items-start gap-2.5 text-[11px] text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Clearing this exception will automatically reconcile the customer deposit ledger, emit a webhook confirmation, and credit the merchant balance.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedException(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              {selectedException.status !== 'Settled' ? (
                <>
                  <button
                    onClick={() => handleSettleAction(selectedException, 'In review')}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition"
                  >
                    Flag In Review
                  </button>
                  <button
                    onClick={() => handleSettleAction(selectedException, 'Settled')}
                    className="px-4 py-2 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    Approve & Settle
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedException(null)}
                  className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
