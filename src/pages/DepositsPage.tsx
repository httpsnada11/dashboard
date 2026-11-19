import React, { useState } from 'react';
import {
  Copy,
  Check,
  ChevronDown,
  Globe,
  Zap,
  Play,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowDownToLine,
  ChevronRight,
  Download,
  Search,
  X
} from 'lucide-react';
import { DepositRecord } from '../types';

const INITIAL_DEPOSITS_DATA: DepositRecord[] = [
  {
    id: 'dep_1',
    depositId: 'dep_9KX4..Q72',
    refId: 'ref: CRM-DEP-90124',
    customer: 'cust_10442',
    assetChain: 'USDT · TRON',
    flow: 'HPP · Hosted',
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
    flow: 'H2H · Direct API',
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
    flow: 'HPP · Hosted',
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
    flow: 'H2H · Direct API',
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
    flow: 'HPP · Hosted',
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
    flow: 'H2H · Direct API',
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
    flow: 'HPP · Hosted',
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
    flow: 'H2H · Direct API',
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
  onOpenNewDeposit,
  onSelectDeposit
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedFlow, setSelectedFlow] = useState<'All' | 'HPP' | 'H2H'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState('All');
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

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
    const rows = INITIAL_DEPOSITS_DATA.map(d => [
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
    link.setAttribute('download', `copym_deposits_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered rows
  const effectiveSearch = localSearch || searchQuery;
  const filteredData = INITIAL_DEPOSITS_DATA.filter((row) => {
    const matchesSearch =
      effectiveSearch === '' ||
      row.depositId.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      row.refId.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      row.customer.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      row.assetChain.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      row.status.toLowerCase().includes(effectiveSearch.toLowerCase());

    const currentTab = filterTabs.find(t => t.id === activeFilter);
    const matchesStatus =
      activeFilter === 'all' ||
      (currentTab?.match && row.status.toLowerCase().includes(currentTab.match.toLowerCase()));

    const matchesNetwork =
      selectedNetwork === 'All' ||
      row.assetChain.toLowerCase().includes(selectedNetwork.toLowerCase());

    const matchesFlow =
      selectedFlow === 'All' ||
      (selectedFlow === 'HPP' && row.flow.includes('HPP')) ||
      (selectedFlow === 'H2H' && row.flow.includes('H2H'));

    return matchesSearch && matchesStatus && matchesNetwork && matchesFlow;
  });

  return (
    <div className="w-full flex flex-col space-y-4 animate-fadeIn font-sans text-slate-900">
      
      {/* ======================================================== */}
      {/* 1. TOP CASHIER HERO & ARCHITECTURE BANNER (LATEST WIREFRAME) */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-4 sm:p-5 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00C076] text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse"></span>
              Dual Cashier Architecture
            </span>
            <span className="text-[11px] text-slate-400">· CoinsPaid Standard</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Inbound Crypto Ingestion Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-xl leading-relaxed">
            Support both <strong className="text-white">Hosted Checkout (HPP)</strong> with 30-min rate lock and <strong className="text-white">Host-to-Host (H2H)</strong> native broker CRM embedding.
          </p>
        </div>

        {/* Quick Launch Cashier Actions */}
        <div className="flex items-center gap-2.5 self-stretch sm:self-auto shrink-0 flex-wrap">
          <a
            href="/simulator.html"
            target="_blank"
            rel="noreferrer"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer shadow-xs"
          >
            <Play className="w-3.5 h-3.5 text-[#00C076] fill-[#00C076]" />
            <span>Interactive Simulator</span>
          </a>
          <button
            type="button"
            onClick={onOpenNewDeposit}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm shadow-emerald-500/20"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ New Cashier Deposit</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. REAL-TIME CASHIER PIPELINE KPI METRICS (HIGH DENSITY) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total Volume */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium mb-1">
            <span>Total 24h Ingestion</span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
              +14.2%
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900">$1,842,500.00</div>
          <span className="text-[10.5px] text-slate-400 mt-0.5 block">1,248 transactions processed</span>
        </div>

        {/* Metric 2: Active Sessions (30m Timelock) */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium mb-1">
            <span>Active Cashier Sessions</span>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.2 rounded flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-blue-600" />
              <span>30m Limit</span>
            </span>
          </div>
          <div className="text-xl font-bold text-blue-700">36 Live</div>
          <span className="text-[10.5px] text-slate-400 mt-0.5 block">Awaiting client broadcast</span>
        </div>

        {/* Metric 3: Confirming in Mempool */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium mb-1">
            <span>Confirming on Chain</span>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.2 rounded">
              Mempool
            </span>
          </div>
          <div className="text-xl font-bold text-amber-700">8 In-Flight</div>
          <span className="text-[10.5px] text-slate-400 mt-0.5 block">Avg 7/12 & 8/19 blocks validated</span>
        </div>

        {/* Metric 4: Direct H2H Share */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium mb-1">
            <span>H2H Direct API Share</span>
            <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.2 rounded">
              White-Label
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900">82.4%</div>
          <span className="text-[10.5px] text-slate-400 mt-0.5 block">Embedded inside broker rooms</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. FILTER BAR WITH HPP / H2H TOGGLES & STATUS PILLS      */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50/50">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by deposit ID, CRM ref, customer ID, or asset..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00C076] transition shadow-2xs"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Filters */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Flow Type Toggle (HPP vs H2H) */}
            <div className="flex items-center p-0.5 bg-slate-200/70 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedFlow('All')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  selectedFlow === 'All' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Flows
              </button>
              <button
                type="button"
                onClick={() => setSelectedFlow('HPP')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  selectedFlow === 'HPP' ? 'bg-white text-[#00875A] shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3 h-3 text-[#00C076]" />
                <span>HPP</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFlow('H2H')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  selectedFlow === 'H2H' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3 h-3 text-purple-600" />
                <span>H2H API</span>
              </button>
            </div>

            {/* Network Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNetworkMenu(!showNetworkMenu)}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{selectedNetwork === 'All' ? 'All Chains' : selectedNetwork}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showNetworkMenu && (
                <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-40 text-xs animate-fadeIn">
                  {['All', 'TRON', 'ERC-20', 'BEP-20', 'Solana'].map((net) => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => {
                        setSelectedNetwork(net);
                        setShowNetworkMenu(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left hover:bg-slate-50 text-xs ${
                        selectedNetwork === net ? 'font-bold text-[#00C076] bg-emerald-50/50' : 'text-slate-700'
                      }`}
                    >
                      {net === 'All' ? 'All Networks' : net}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Status Pills Row */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-white">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#00C076] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* 4. DENSE CASHIER INGESTION TABLE (LATEST WIREFRAME)      */}
        {/* ======================================================== */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider select-none">
                <th className="py-2.5 px-4">Deposit & Ref</th>
                <th className="py-2.5 px-3">Customer ID</th>
                <th className="py-2.5 px-3">Rail / Network</th>
                <th className="py-2.5 px-3">Integration Flow</th>
                <th className="py-2.5 px-3 text-right">Expected</th>
                <th className="py-2.5 px-3 text-right">Received</th>
                <th className="py-2.5 px-3 text-center">Cashier State</th>
                <th className="py-2.5 px-3 text-right">Created</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm text-slate-600">No deposit records match your filters.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try resetting search or chain filters.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  const isCredited = row.status === 'Credited';
                  const isConfirming = row.status.includes('Confirming');
                  const isAwaiting = row.status.includes('Awaiting');
                  const isException = row.status.includes('Exception');
                  const isHpp = row.flow.includes('HPP');

                  return (
                    <tr
                      key={row.id}
                      onClick={() => onSelectDeposit?.(row)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Deposit ID & Ref */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 group-hover:text-[#00C076] transition">
                            {row.depositId}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(e, row.depositId, row.id)}
                            title="Copy Deposit ID"
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition"
                          >
                            {copiedId === row.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="text-[10.5px] text-slate-400 font-mono mt-0.5 leading-tight">
                          {row.refId}
                        </div>
                      </td>

                      {/* Customer ID */}
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {row.customer}
                      </td>

                      {/* Asset · Chain */}
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {row.assetChain}
                        </span>
                      </td>

                      {/* Integration Flow Badge */}
                      <td className="py-2.5 px-3">
                        {isHpp ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-emerald-50 text-[#00875A] border border-emerald-200/60">
                            <Globe className="w-3 h-3 text-[#00C076]" />
                            <span>HPP Hosted</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                            <Zap className="w-3 h-3 text-purple-600" />
                            <span>H2H API</span>
                          </span>
                        )}
                      </td>

                      {/* Expected */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        {row.expected}
                      </td>

                      {/* Received */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {row.received !== '—' ? (
                          <span className="text-emerald-700">+{row.received}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Status Pill Badge (CTO Guidelines) */}
                      <td className="py-2.5 px-3 text-center">
                        {isCredited && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Credited</span>
                          </span>
                        )}
                        {isConfirming && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/70">
                            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                            <span>{row.status}</span>
                          </span>
                        )}
                        {isAwaiting && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/70">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>Awaiting</span>
                          </span>
                        )}
                        {isException && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Exception</span>
                          </span>
                        )}
                        {!isCredited && !isConfirming && !isAwaiting && !isException && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <span>{row.status}</span>
                          </span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="py-2.5 px-3 text-right text-slate-500 whitespace-nowrap text-[11.5px]">
                        {row.created}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectDeposit?.(row)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-[#00C076] hover:text-white text-slate-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1 mx-auto shadow-2xs cursor-pointer group-hover:bg-[#00C076] group-hover:text-white"
                        >
                          <span>Cashier</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <span>Showing {filteredData.length} of {INITIAL_DEPOSITS_DATA.length} cashier sessions</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">CoinsPaid Pipeline Engine active</span>
          </div>
        </div>

      </div>

    </div>
  );
};
