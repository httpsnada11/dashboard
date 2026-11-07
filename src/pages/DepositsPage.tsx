import React, { useState } from 'react';
import { Copy, Check, ChevronDown } from 'lucide-react';
import { DepositRecord } from '../types';

const DEPOSITS_DATA: DepositRecord[] = [
  {
    id: 'dep_1',
    depositId: 'dep_9KX4..Q72',
    refId: 'ref: CRM-DEP-90124',
    customer: 'cust_10442',
    assetChain: 'USDT · TRON',
    flow: 'Open',
    expected: '—',
    received: '2,500.00',
    numericReceived: 2500,
    status: 'Credited',
    created: '28 Oct, 22:58'
  },
  {
    id: 'dep_2',
    depositId: 'dep_9KX4..J18',
    refId: 'ref: CRM-DEP-90117',
    customer: 'cust_20981',
    assetChain: 'USDT · ERC-20',
    flow: 'Fixed',
    expected: '12,000.00',
    received: '12,000.00',
    numericReceived: 12000,
    status: 'Confirming 7/12',
    created: '28 Oct, 22:54'
  },
  {
    id: 'dep_3',
    depositId: 'dep_9KX4..N04',
    refId: 'ref: CRM-DEP-90110',
    customer: 'cust_31120',
    assetChain: 'USDT · TRON',
    flow: 'Fixed',
    expected: '800.00',
    received: '—',
    numericReceived: 0,
    status: 'Awaiting payment',
    created: '28 Oct, 22:51'
  },
  {
    id: 'dep_4',
    depositId: 'dep_9KX4..P93',
    refId: 'ref: CRM-DEP-90103',
    customer: 'cust_30017',
    assetChain: 'USDC · ERC-20',
    flow: 'Fixed',
    expected: '950.00',
    received: '950.00',
    numericReceived: 950,
    status: 'Exception: late',
    created: '28 Oct, 22:29'
  },
  {
    id: 'dep_5',
    depositId: 'dep_9KX4..M56',
    refId: 'ref: CRM-DEP-90096',
    customer: 'cust_10213',
    assetChain: 'USDT · BEP-20',
    flow: 'Open',
    expected: '—',
    received: '5,120.00',
    numericReceived: 5120,
    status: 'Credited',
    created: '28 Oct, 22:20'
  },
  {
    id: 'dep_6',
    depositId: 'dep_9KX4..L21',
    refId: 'ref: CRM-DEP-90089',
    customer: 'cust_40551',
    assetChain: 'USDT · TRON',
    flow: 'Fixed',
    expected: '300.00',
    received: '—',
    numericReceived: 0,
    status: 'Expired',
    created: '28 Oct, 21:59'
  },
  {
    id: 'dep_7',
    depositId: 'dep_9KX4..K78',
    refId: 'ref: CRM-DEP-90082',
    customer: 'cust_11872',
    assetChain: 'USDT · TRON',
    flow: 'Open',
    expected: '—',
    received: '6,400.00',
    numericReceived: 6400,
    status: 'KYT review',
    created: '28 Oct, 21:40'
  },
  {
    id: 'dep_8',
    depositId: 'dep_9KX4..H33',
    refId: 'ref: CRM-DEP-90075',
    customer: 'cust_22301',
    assetChain: 'USDT · ERC-20',
    flow: 'Open',
    expected: '—',
    received: '1,000.00',
    numericReceived: 1000,
    status: 'Credited',
    created: '28 Oct, 21:12'
  }
];

export interface DepositsPageProps {
  searchQuery?: string;
  onOpenNewDeposit?: () => void;
  onSelectDeposit?: (deposit: DepositRecord) => void;
}

export const DepositsPage: React.FC<DepositsPageProps> = ({
  searchQuery = '',
  onSelectDeposit
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState('All');
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);

  const filterTabs = [
    { id: 'all', label: 'All 1,248' },
    { id: 'awaiting', label: 'Awaiting 36', match: 'Awaiting' },
    { id: 'confirming', label: 'Confirming 8', match: 'Confirming' },
    { id: 'credited', label: 'Credited 1,174', match: 'Credited' },
    { id: 'expired', label: 'Expired 18', match: 'Expired' },
    { id: 'exception', label: 'Exception 12', match: 'Exception' },
  ];

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleExportCSV = () => {
    const headers = ['Deposit ID', 'Reference', 'Customer ID', 'Asset · Chain', 'Flow', 'Expected', 'Received', 'Status', 'Created'];
    const rows = DEPOSITS_DATA.map(d => [
      d.depositId,
      d.refId,
      d.customer,
      d.assetChain,
      d.flow,
      d.expected,
      d.received,
      d.status,
      d.created
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'copym_deposits_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered rows
  const filteredData = DEPOSITS_DATA.filter((row) => {
    const matchesSearch =
      searchQuery === '' ||
      row.depositId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.refId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.assetChain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.status.toLowerCase().includes(searchQuery.toLowerCase());

    const currentTab = filterTabs.find(t => t.id === activeFilter);
    const matchesStatus =
      activeFilter === 'all' ||
      (currentTab?.match && row.status.toLowerCase().includes(currentTab.match.toLowerCase()));

    const matchesNetwork =
      selectedNetwork === 'All' ||
      row.assetChain.toLowerCase().includes(selectedNetwork.toLowerCase());

    return matchesSearch && matchesStatus && matchesNetwork;
  });

  return (
    <div className="w-full flex flex-col space-y-3 sm:space-y-3.5 animate-fadeIn">
      {/* Top Filter and Actions Row - Responsive wrapping */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3">
        {/* Left: Status Filter Pills (Horizontal swipeable on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none -mx-1 px-1 touch-pan-x">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'bg-[#00C076] text-white shadow-sm'
                    : 'bg-[#ECEEF2] hover:bg-[#E2E4E9] text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: Secondary Action Pills */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Network Filter Pill */}
          <div className="relative">
            <button
              onClick={() => setShowNetworkMenu(!showNetworkMenu)}
              className="px-3 py-1 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-full text-[11px] font-medium transition-all shadow-sm flex items-center gap-1 select-none whitespace-nowrap"
            >
              <span>Network: {selectedNetwork === 'All' ? 'All 6' : selectedNetwork}</span>
              <ChevronDown className="w-3 h-3 text-white" />
            </button>

            {showNetworkMenu && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-40 text-xs animate-fadeIn">
                {['All', 'TRON', 'ERC-20', 'BEP-20'].map((net) => (
                  <button
                    key={net}
                    onClick={() => {
                      setSelectedNetwork(net);
                      setShowNetworkMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left hover:bg-gray-50 text-xs ${
                      selectedNetwork === net ? 'font-bold text-[#00C076]' : 'text-gray-700'
                    }`}
                  >
                    {net === 'All' ? 'All 6 Networks' : net}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export CSV Pill */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-full text-[11px] font-medium transition-all shadow-sm flex items-center gap-1 select-none whitespace-nowrap"
          >
            <span>Export CSV · 1,248 rows</span>
          </button>
        </div>
      </div>

      {/* Modern Fitted Table Container with Smooth Horizontal Scroll on Mobile */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <table className="w-full text-left border-collapse min-w-[740px]">
            {/* Dark Sleek Header Bar */}
            <thead>
              <tr className="bg-[#18191B] text-white text-[12px] sm:text-[12.5px] font-medium tracking-normal select-none">
                <th className="py-2.5 px-4 sm:px-5 rounded-tl-2xl">Deposit ID</th>
                <th className="py-2.5 px-3">Customer ID</th>
                <th className="py-2.5 px-3">Asset · Chain</th>
                <th className="py-2.5 px-3">Flow</th>
                <th className="py-2.5 px-3 text-right">Expected</th>
                <th className="py-2.5 px-3 text-right">Received</th>
                <th className="py-2.5 px-3 sm:px-4 text-center">Status</th>
                <th className="py-2.5 px-4 sm:px-5 text-right rounded-tr-2xl">Created</th>
              </tr>
            </thead>

            {/* Table Rows matching screenshot */}
            <tbody className="divide-y divide-gray-100/90 text-[12px] sm:text-[12.5px]">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No deposit records match your filters.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onSelectDeposit?.(row)}
                    className="hover:bg-[#F9FAFB] transition-colors cursor-pointer group"
                  >
                    {/* Deposit ID & ref */}
                    <td className="py-2.5 sm:py-3 px-4 sm:px-5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#14171A]">{row.depositId}</span>
                        <button
                          onClick={(e) => handleCopy(e, row.depositId, row.id)}
                          title="Copy Deposit ID"
                          className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedId === row.id ? (
                            <Check className="w-3 h-3 text-[#00C076]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="text-[10px] sm:text-[10.5px] text-[#8E95A5] font-normal leading-tight mt-0.5">
                        {row.refId}
                      </div>
                    </td>

                    {/* Customer ID */}
                    <td className="py-2.5 sm:py-3 px-3 text-[#4B5563]">
                      {row.customer}
                    </td>

                    {/* Asset · Chain */}
                    <td className="py-2.5 sm:py-3 px-3 font-medium text-[#1E293B]">
                      {row.assetChain}
                    </td>

                    {/* Flow */}
                    <td className="py-2.5 sm:py-3 px-3 text-[#4B5563]">
                      {row.flow}
                    </td>

                    {/* Expected */}
                    <td className="py-2.5 sm:py-3 px-3 text-right font-medium text-[#4B5563]">
                      {row.expected}
                    </td>

                    {/* Received */}
                    <td className="py-2.5 sm:py-3 px-3 text-right font-semibold text-[#14171A]">
                      {row.received}
                    </td>

                    {/* Status Pill Badge */}
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F3F4F6] text-[#374151] text-[10.5px] sm:text-[11px] font-medium border border-gray-200/60 shadow-xs whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                        {row.status}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="py-2.5 sm:py-3 px-4 sm:px-5 text-right text-[#6B7280] whitespace-nowrap">
                      {row.created}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Pagination Footer */}
      <div className="flex items-center justify-between pt-1 px-1 text-xs select-none">
        <span className="text-[#6B7280] text-[11px] sm:text-[12px]">
          Showing {filteredData.length} of 1,248
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled
            className="px-3 py-1.5 text-gray-400 text-xs font-medium cursor-not-allowed"
          >
            Previous
          </button>
          <button
            className="px-3.5 py-1.5 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

