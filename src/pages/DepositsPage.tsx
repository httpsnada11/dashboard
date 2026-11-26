import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  ChevronDown,
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
import { api } from '../services/api';
import { toDepositRef } from '../utils/sharedMockStore';

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
  const [depositsList, setDepositsList] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [newOrder, setNewOrder] = useState<any>(null);

  const [activeFilter, setActiveFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState('All');
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  // Fetch live on-chain deposit ledger from backend
  useEffect(() => {
    loadDeposits();
  }, []);

  async function loadDeposits() {
    try {
      setLoading(true);
      const res = await api.getDeposits();
      const raw = res?.data || res?.deposits || (Array.isArray(res) ? res : []);
      if (Array.isArray(raw)) {
        if (raw.length > 0) {
          const mapped: DepositRecord[] = raw.map((d: any, idx: number) => {
            const orderId = d.order_id || d.id || `dep_${idx}`;
            const address = d.payment_address || d.deposit_address || d.address;
            const createdTimestamp = typeof d.created_at === 'number'
              ? (d.created_at < 10000000000 ? d.created_at * 1000 : d.created_at)
              : (d.createdAt || d.created_at ? new Date(d.createdAt || d.created_at).getTime() : Date.now());

            let statusText = 'Pending';
            const s = (d.status || '').toLowerCase();
            if (s === 'credited' || s === 'completed') {
              statusText = 'Credited';
            } else if (s.includes('confirming')) {
              statusText = d.status;
            } else if (s === 'pending') {
              statusText = 'Awaiting payment';
            } else if (s === 'expired') {
              statusText = 'Expired';
            } else if (s === 'cancelled') {
              statusText = 'Cancelled';
            } else if (d.status) {
              statusText = d.status;
            }

            const expectedStr = d.amount ? `${Number(d.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—';
            const receivedNum = Number(d.received_amount || 0);
            const receivedStr = receivedNum > 0 ? `${receivedNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—';

            return {
              id: orderId,
              depositId: address ? `${address.slice(0, 8)}...${address.slice(-4)}` : orderId.slice(0, 14),
              refId: toDepositRef(orderId, idx),
              customer: d.merchant_order_id || d.order_id || 'ord_live',
              assetChain: `${d.currency || 'USDT'} · ${d.network || 'TRON'}`,
              flow: d.mode === 'H2H_DIRECT' ? 'H2H · Direct API' : 'HPP · Hosted',
              expected: expectedStr,
              received: receivedStr,
              numericReceived: receivedNum,
              status: statusText,
              created: new Date(createdTimestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            };
          });
          setDepositsList(mapped);
        } else {
          setDepositsList([]);
        }
      }
    } catch (err) {
      console.warn('Could not load deposits from backend:', err);
      setDepositsList([]);
    } finally {
      setLoading(false);
    }
  }

  // Create a real $250 USDT Test Deposit Order via backend
  async function handleCreateDeposit() {
    try {
      setCreating(true);
      const res = await api.createOrder({
        amount: '250.00',
        currency: 'USDT',
        mode: 'HPP',
        network: 'TRON',
      });
      setNewOrder(res);
      await loadDeposits();
    } catch (err: any) {
      alert(`Could not create deposit order: ${err.message || 'Error creating order'}`);
    } finally {
      setCreating(false);
    }
  }

  // Simulate on-chain confirmation & ledger crediting for test order
  async function handleSimulatePayment(orderId: string) {
    try {
      setSimulating(true);
      await api.simulateOrderPayment(orderId, { amount: '250.00' });
      setNewOrder(null);
      await loadDeposits();
    } catch (err: any) {
      alert(`Simulation failed: ${err.message || 'Error simulating payment'}`);
    } finally {
      setSimulating(false);
    }
  }

  // Dynamic KPI computations from real backend ledger
  const totalIngestion = depositsList.reduce((sum, d) => sum + (d.numericReceived || 0), 0);
  const awaitingCount = depositsList.filter(d => d.status.toLowerCase().includes('awaiting') || d.status.toLowerCase().includes('pending')).length;
  const confirmingCount = depositsList.filter(d => d.status.toLowerCase().includes('confirming')).length;
  const creditedCount = depositsList.filter(d => d.status.toLowerCase().includes('credited') || d.status.toLowerCase().includes('completed')).length;
  const kytCount = depositsList.filter(d => d.status.toLowerCase().includes('kyt') || d.status.toLowerCase().includes('review') || d.status.toLowerCase().includes('hold')).length;
  const exceptionCount = depositsList.filter(d => d.status.toLowerCase().includes('exception') || d.status.toLowerCase().includes('underpaid') || d.status.toLowerCase().includes('mismatch')).length;
  const successRate = depositsList.length > 0 ? `${((creditedCount / depositsList.length) * 100).toFixed(1)}%` : '100.0%';

  const filterTabs = [
    { id: 'all', label: `All ${depositsList.length}` },
    { id: 'awaiting', label: `Awaiting ${awaitingCount}`, match: 'awaiting' },
    { id: 'confirming', label: `Confirming ${confirmingCount}`, match: 'confirming' },
    { id: 'credited', label: `Credited ${creditedCount}`, match: 'credited' },
    { id: 'kyt', label: `KYT review ${kytCount}`, match: 'kyt' },
    { id: 'exception', label: `Exception ${exceptionCount}`, match: 'exception' },
  ];

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleExportCSV = () => {
    const headers = ['Deposit Address', 'Order Reference', 'Merchant Order ID', 'Asset · Chain', 'Expected', 'Received', 'Status', 'Created'];
    const rows = depositsList.map(d => [
      d.depositId,
      d.refId,
      d.customer,
      d.assetChain,
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
  const filteredData = depositsList.filter((row) => {
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

    return matchesSearch && matchesStatus && matchesNetwork;
  });

  return (
    <div className="w-full flex flex-col space-y-4 animate-fadeIn font-sans text-slate-900">
      
      {/* ======================================================== */}
      {/* 1. TOP CASHIER HERO BANNER                                */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-4 sm:p-5 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#007F4E] text-xs font-extrabold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#007F4E] animate-pulse"></span>
              Live settlement
            </span>
            <span className="text-xs text-slate-300">Payment tracking</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Deposits</span>
          </h1>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl leading-relaxed">
            Track incoming customer payments and see when funds are credited to your balance.
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
            <Play className="w-3.5 h-3.5 text-[#007F4E] fill-[#007F4E]" />
            <span>Test deposit flow</span>
          </a>
          {onOpenNewDeposit && (
            <button
              type="button"
              onClick={onOpenNewDeposit}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer shadow-xs"
            >
              <span>Custom Deposit</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleCreateDeposit}
            disabled={creating}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm shadow-emerald-500/20 disabled:opacity-60"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{creating ? 'Creating deposit...' : '+ New deposit ($250 USDT)'}</span>
          </button>
        </div>
      </div>

      {/* Live Order Created Alert Banner */}
      {newOrder && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-fadeIn shadow-xs">
          <div>
            <div className="font-bold text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Live Cashier Session Created!</span>
            </div>
            <div className="text-xs font-mono mt-1 text-emerald-800">
              Order ID: <span className="font-bold">{newOrder.order_id || newOrder.id}</span> · 
              Deposit address: <span className="font-bold select-all bg-emerald-100 px-1.5 py-0.5 rounded">{newOrder.payment_address || newOrder.deposit_address || newOrder.address || 'TYDZSx...'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleSimulatePayment(newOrder.order_id || newOrder.id)}
              disabled={simulating}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>{simulating ? 'Simulating payment...' : 'Simulate payment'}</span>
            </button>
            {(newOrder.checkout_url || newOrder.hosted_checkout_url) && (
              <a
                href={newOrder.checkout_url || newOrder.hosted_checkout_url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-lg text-xs font-bold transition shadow-xs"
              >
                Open deposit checkout
              </a>
            )}
            <button
              onClick={() => setNewOrder(null)}
              className="text-emerald-700 hover:text-emerald-900 p-1 text-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. REAL-TIME CASHIER PIPELINE KPI METRICS (HIGH DENSITY) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total Volume */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Total received (24h)</span>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
              {depositsList.length > 0 ? 'Live' : 'Live'}
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            ${totalIngestion.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-500 mt-0.5 block">{depositsList.length} deposits processed</span>
        </div>

        {/* Metric 2: Active Sessions (30m Timelock) */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Awaiting payment</span>
            <span className="text-xs text-blue-700 font-bold bg-blue-50 px-1.5 py-0.2 rounded flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-blue-600" />
              <span>Active</span>
            </span>
          </div>
          <div className="text-xl font-bold text-blue-700">{awaitingCount}</div>
          <span className="text-xs text-slate-500 mt-0.5 block">Waiting for customer payment</span>
        </div>

        {/* Metric 3: Confirming in Mempool */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Confirming</span>
            <span className="text-xs text-amber-800 font-bold bg-amber-50 px-1.5 py-0.2 rounded">
              In progress
            </span>
          </div>
          <div className="text-xl font-bold text-amber-700">{confirmingCount}</div>
          <span className="text-xs text-slate-500 mt-0.5 block">Waiting for network confirmation</span>
        </div>

        {/* Metric 4: Deposit Success Rate */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Credited deposits</span>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
              Settled
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900">{successRate}</div>
          <span className="text-xs text-slate-500 mt-0.5 block">{creditedCount} of {depositsList.length} deposits credited</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. FILTER BAR WITH NETWORK & STATUS PILLS                */}
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
              placeholder="Search by deposit address, merchant order ID, or asset..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-[#007F4E] transition shadow-2xs"
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
                        selectedNetwork === net ? 'font-bold text-[#007F4E] bg-emerald-50/50' : 'text-slate-700'
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
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#007F4E] text-white shadow-2xs'
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
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-700 bg-[#18191B] text-xs font-semibold text-slate-200 uppercase tracking-wider select-none">
                <th className="py-2.5 px-4">Deposit & Ref</th>
                <th className="py-2.5 px-3">Merchant Order ID</th>
                <th className="py-2.5 px-3">Asset / Network</th>
                <th className="py-2.5 px-3 text-right">Expected</th>
                <th className="py-2.5 px-3 text-right">Received</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Created</th>
                <th className="py-2.5 px-4 text-center sticky right-0 bg-[#18191B] z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.2)]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center text-slate-500"><p className="font-semibold text-sm text-slate-600">Loading deposits...</p></td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-slate-500"><p className="font-semibold text-sm text-slate-600">No deposit records match your filters.</p></td></tr>
              ) : filteredData.map((row) => {
                const isCredited = row.status === 'Credited';
                const isConfirming = row.status.includes('Confirming');
                const isAwaiting = row.status.includes('Awaiting');
                const isException = row.status.includes('Exception');
                return (
                  <tr key={row.id} onClick={() => onSelectDeposit?.(row)} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                    <td className="py-2.5 px-4"><div className="flex items-center gap-1.5"><span className="font-bold text-slate-900 group-hover:text-[#007F4E] transition">{row.depositId}</span><button type="button" onClick={(e) => handleCopy(e, row.depositId, row.id)} title="Copy Deposit ID" className="text-slate-500 hover:text-slate-700 p-0.5 rounded transition">{copiedId === row.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}</button></div><div className="text-xs text-slate-500 font-mono mt-0.5 leading-tight">{row.refId}</div></td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{row.customer}</td>
                    <td className="py-2.5 px-3"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">{row.assetChain}</span></td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">{row.expected === '?' || row.expected === '?' ? <span title="Amount specified by customer at checkout" className="cursor-help text-slate-500 font-semibold underline decoration-dotted">?</span> : row.expected}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{row.received !== '?' && row.received !== '?' ? <span className="text-emerald-700">+{row.received}</span> : <span className="text-slate-500">?</span>}</td>
                    <td className="py-2.5 px-3 text-center">{isCredited && <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70"><CheckCircle2 className="w-3 h-3 text-emerald-600" /><span>Credited</span></span>}{isConfirming && <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/70"><Clock className="w-3 h-3 text-amber-600 animate-spin" /><span>{row.status}</span></span>}{isAwaiting && <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/70"><Clock className="w-3 h-3 text-blue-600" /><span>Awaiting</span></span>}{isException && <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/70"><AlertTriangle className="w-3 h-3 text-rose-600" /><span>Exception</span></span>}{!isCredited && !isConfirming && !isAwaiting && !isException && <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200"><span>{row.status}</span></span>}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500 whitespace-nowrap text-xs">{row.created}</td>
                    <td className="py-2.5 px-4 text-center sticky right-0 bg-white group-hover:bg-slate-50/90 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]"><button type="button" onClick={() => onSelectDeposit?.(row)} className="px-2.5 py-1 bg-slate-100 hover:bg-[#007F4E] hover:text-white text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto shadow-2xs cursor-pointer group-hover:bg-[#007F4E] group-hover:text-white"><span>Details</span><ChevronRight className="w-3 h-3" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="md:hidden p-3 space-y-2">
          {loading ? <p className="py-8 text-center text-sm text-slate-500">Loading deposits...</p> : filteredData.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No deposits match your filters.</p> : filteredData.map((row) => (
            <button key={row.id} type="button" onClick={() => onSelectDeposit?.(row)} className="w-full text-left bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
              <div className="flex items-center justify-between gap-2"><span className="font-bold text-slate-900 text-xs">{row.depositId}</span><span className="text-xs text-slate-500">{row.created}</span></div>
              <div className="mt-1 text-xs text-slate-500 font-mono">{row.customer} ? {row.assetChain}</div>
              <div className="mt-2 flex items-center justify-between"><span className="text-xs font-semibold text-slate-900">{row.received !== '?' && row.received !== '?' ? `+${row.received}` : '?'}</span><span className="text-xs text-slate-600">{row.status}</span></div>
            </button>
          ))}
        </div>

        {/* Table Footer */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <span>Showing {filteredData.length} of {depositsList.length} deposits</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Live deposit tracking active</span>
          </div>
        </div>

      </div>

    </div>
  );
};
