import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Search,
  TrendingUp,
  Clock,
  Eye,
  Activity,
  Cpu,
  Database,
  Server,
  Radio,
  Layers,
  Lock,
  Zap
} from 'lucide-react';
import { AMLRiskAlert } from '../types';

const INITIAL_ALERTS: AMLRiskAlert[] = [
  {
    id: 'aml_01',
    txHash: '0x94f8..11e2',
    fullTxHash: '0x94f82810a9bC51098277f08234711e2a',
    network: 'USDT · ERC-20',
    amount: '28,500.00 USDT',
    riskScore: 92,
    riskLevel: 'Critical',
    flagReason: 'High-risk Mixer input hop (Tornado Cash cluster)',
    merchant: 'Eagle Vision Market',
    client: 'cust_84019',
    time: '4 mins ago',
    status: 'Pending Action'
  },
  {
    id: 'aml_02',
    txHash: 'TF7m..09xP',
    fullTxHash: 'TF7mQqZ9z8VnLw7h4Jb1k8Pq5D2g09xP',
    network: 'USDT · TRON',
    amount: '14,000.00 USDT',
    riskScore: 78,
    riskLevel: 'High',
    flagReason: 'Darknet marketplace direct counterparty interaction',
    merchant: 'Apex Forex Global',
    client: 'cust_11029',
    time: '18 mins ago',
    status: 'Pending Action'
  },
  {
    id: 'aml_03',
    txHash: '0x38bE..11aD',
    fullTxHash: '0x38bE8921bca9082ef45511aD9012437FeE335e23',
    network: 'USDC · Polygon',
    amount: '45,200.00 USDC',
    riskScore: 84,
    riskLevel: 'High',
    flagReason: 'Sanctioned jurisdiction geo-IP (OFAC SDN Match)',
    merchant: 'Prime Liquidity Hub',
    client: 'cust_30918',
    time: '42 mins ago',
    status: 'Frozen'
  },
  {
    id: 'aml_04',
    txHash: 'TYK9..5D2g',
    fullTxHash: 'TYK9A3XmUqZ9z8VnLw7h4Jb1k8Pq5D2gXy',
    network: 'USDT · TRON',
    amount: '8,250.00 USDT',
    riskScore: 56,
    riskLevel: 'Medium',
    flagReason: 'Rapid multiple wallet hops under 10 seconds (Layering)',
    merchant: 'Eagle Vision Market',
    client: 'cust_77182',
    time: '1 hr ago',
    status: 'Approved Override'
  },
  {
    id: 'aml_05',
    txHash: '0x15eA..77f0',
    fullTxHash: '0x15eA772180a9bC51098277f0a9918bc',
    network: 'USDC · ERC-20',
    amount: '60,000.00 USDC',
    riskScore: 89,
    riskLevel: 'Critical',
    flagReason: 'Ransomware affiliated address (Chainalysis tag)',
    merchant: 'Vance Capital Ltd',
    client: 'cust_90124',
    time: '2 hrs ago',
    status: 'Reported'
  }
];

export interface AdminOverviewPageProps {
  onSelectTx?: (hash: string) => void;
}

export const AdminOverviewPage: React.FC<AdminOverviewPageProps> = () => {
  const [activeOverviewTab, setActiveOverviewTab] = useState<'threats' | 'system-health'>('threats');
  const [alerts, setAlerts] = useState<AMLRiskAlert[]>(INITIAL_ALERTS);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAlert, setSelectedAlert] = useState<AMLRiskAlert | null>(null);

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    const matchesFilter =
      filterLevel === 'all' ||
      (filterLevel === 'critical' && alert.riskLevel === 'Critical') ||
      (filterLevel === 'high' && alert.riskLevel === 'High') ||
      (filterLevel === 'pending' && alert.status === 'Pending Action') ||
      (filterLevel === 'frozen' && alert.status === 'Frozen');

    const matchesSearch =
      searchQuery === '' ||
      alert.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.flagReason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.client.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleAction = (alertId: string, newStatus: AMLRiskAlert['status']) => {
    setAlerts((prev) =>
      prev.map((item) => (item.id === alertId ? { ...item, status: newStatus } : item))
    );
    if (selectedAlert && selectedAlert.id === alertId) {
      setSelectedAlert((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Admin Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/80 via-[#14171A] to-[#1E293B] text-white border border-red-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30 flex-shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Platform AML & KYT Attention Queue
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-red-500 text-white shadow-2xs">
                3 Pending
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Live automated blockchain threat detection via TRM Labs, Chainalysis & Elliptic feeds.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs text-xs font-semibold text-emerald-300 border border-emerald-400/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>KYT Engine Online</span>
          </div>
        </div>
      </div>

      {/* Sub-navigation Switcher: Threats Queue vs System Health */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl overflow-x-auto scrollbar-none flex-nowrap -mx-0.5 px-0.5">
          <button
            onClick={() => setActiveOverviewTab('threats')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              activeOverviewTab === 'threats'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>AML / KYT Risk Queue</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 text-red-700 font-bold shrink-0">
              {alerts.filter((a) => a.status === 'Pending Action').length} Pending
            </span>
          </button>

          <button
            onClick={() => setActiveOverviewTab('system-health')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              activeOverviewTab === 'system-health'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse shrink-0" />
            <span>System Health & MPC Nodes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold shrink-0">
              All Systems Operational
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-2 sm:px-3 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Last sync: Just now (15s polling)</span>
        </div>
      </div>

      {activeOverviewTab === 'system-health' ? (
        /* ================================================================ */
        /* PILLAR 1: SYSTEM HEALTH & INFRASTRUCTURE MONITOR                  */
        /* ================================================================ */
        <div className="space-y-6 animate-fadeIn">
          {/* Grid Row 1: Fireblocks MPC & DB/Redis Workers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Fireblocks MPC Co-Signer Node Cluster */}
            <div className="bg-white rounded-2xl sm:rounded-[26px] p-5 sm:p-6 shadow-xs border border-gray-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Fireblocks MPC Node Cluster</h3>
                    <p className="text-[11px] text-gray-400">2-of-3 MPC Quorum Threshold Active</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Quorum Online (3/3)
                </span>
              </div>

              {/* Node latencies */}
              <div className="space-y-2">
                <div className="p-3 bg-gray-50/80 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-gray-900">Node A (SG-East · Singapore)</span>
                    <span className="text-[10px] text-gray-400 font-mono">v4.19</span>
                  </div>
                  <span className="font-mono text-emerald-600 font-bold">38ms latency</span>
                </div>

                <div className="p-3 bg-gray-50/80 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-gray-900">Node B (EU-Central · Frankfurt)</span>
                    <span className="text-[10px] text-gray-400 font-mono">v4.19</span>
                  </div>
                  <span className="font-mono text-emerald-600 font-bold">42ms latency</span>
                </div>

                <div className="p-3 bg-gray-50/80 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-gray-900">Node C (US-East · N. Virginia)</span>
                    <span className="text-[10px] text-gray-400 font-mono">v4.19</span>
                  </div>
                  <span className="font-mono text-emerald-600 font-bold">45ms latency</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-gray-500">
                <span>Key Derivation: ECDSA secp256k1 & Ed25519</span>
                <span className="font-semibold text-emerald-600">0 Derivation Failures</span>
              </div>
            </div>

            {/* 2. DB & Redis Workers */}
            <div className="bg-white rounded-2xl sm:rounded-[26px] p-5 sm:p-6 shadow-xs border border-gray-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">DB & Redis Worker Fleet</h3>
                    <p className="text-[11px] text-gray-400">Celery / Bull Queue Dispatcher</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  16/16 Workers Active
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-gray-50/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-semibold text-gray-900">MySQL Primary Cluster</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-600 font-bold">1.1ms</span>
                    <span className="text-[10.5px] text-gray-400 block">48/100 pool</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-red-500" />
                    <span className="font-semibold text-gray-900">Redis Memory & Pub/Sub</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-600 font-bold">0.5ms</span>
                    <span className="text-[10.5px] text-gray-400 block">3.4 GB / 16 GB</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-semibold text-gray-900">Webhook Replay & Delivery Queue</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-600 font-bold">0 Backlogged</span>
                    <span className="text-[10.5px] text-gray-400 block">1,420 jobs/min</span>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-gray-500">
                <span>Replication Lag: 0.00ms</span>
                <span className="font-semibold text-emerald-600">99.99% Uptime (30d)</span>
              </div>
            </div>
          </div>

          {/* Row 2: Liquidity Monitors & Cold Sweeps (Fund001) */}
          <div className="bg-white rounded-2xl sm:rounded-[26px] p-5 sm:p-6 shadow-xs border border-gray-100 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Liquidity & Vault Distribution Monitor (Fund001)</h3>
                  <p className="text-[11px] text-gray-400">Institutional Policy: 95% Cold Vault / 5% Hot Operational Buffer</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-900 font-mono">$30,000,000 Total Custody</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Balanced
                </span>
              </div>
            </div>

            {/* Split Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: '92.9%' }}
                  title="Cold Vault: $27,859,500.00 (92.9%)"
                />
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: '7.1%' }}
                  title="Hot Operational: $2,140,500.00 (7.1%)"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-bold text-gray-900">Cold Multi-Sig Vault: $27,859,500.00 (92.9%)</span>
                  <span className="text-gray-400 font-mono text-[10.5px]">Fireblocks Fund001</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-bold text-gray-900">Hot Operational: $2,140,500.00 (7.1%)</span>
                  <span className="text-gray-400 font-mono text-[10.5px]">Disbursement Float</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Blockchain RPC Gateways */}
          <div className="bg-white rounded-2xl sm:rounded-[26px] p-5 sm:p-6 shadow-xs border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Blockchain RPC Node Gateways</h3>
                  <p className="text-[11px] text-gray-400">High-throughput dedicated node feeds</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                All Chains Synchronized
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  TRON Network (TRC-20)
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-gray-900 text-xs">TronGrid Dedicated</span>
                  <span className="font-mono text-emerald-600 font-bold text-xs">18ms</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono block mt-1">Block #66,419,203</span>
              </div>

              <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Ethereum (ERC-20)
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-gray-900 text-xs">Alchemy Mainnet</span>
                  <span className="font-mono text-emerald-600 font-bold text-xs">24ms</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono block mt-1">Block #21,184,910</span>
              </div>

              <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Solana (SPL Token)
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-gray-900 text-xs">Triton High-Speed RPC</span>
                  <span className="font-mono text-emerald-600 font-bold text-xs">29ms</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono block mt-1">Slot #291,048,119</span>
              </div>

              <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  BNB Chain (BEP-20)
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-gray-900 text-xs">QuickNode BSC</span>
                  <span className="font-mono text-emerald-600 font-bold text-xs">22ms</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono block mt-1">Block #43,891,012</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================================================================ */
        /* PILLAR 5: AML / KYT RISK ATTENTION QUEUE                         */
        /* ================================================================ */
        <>
          {/* Admin KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1 */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                24h Gateway Volume
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900 font-sans">$4,892,150</span>
                <span className="text-xs font-bold text-[#00C076] flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +14.2%
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Across 1,482 settled transactions</p>
            </div>

            {/* KPI 2 */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-red-100 shadow-2xs bg-red-50/20">
              <span className="text-xs text-red-500 font-semibold uppercase tracking-wider block mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Active Risk Holds
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-red-600 font-sans">$42,500</span>
                <span className="text-xs font-bold text-red-600">3 Holds</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Awaiting compliance sign-off</p>
            </div>

            {/* KPI 3 */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                Global Compliance Rate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600 font-sans">98.4%</span>
                <span className="text-xs font-bold text-emerald-600">Clean</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Sanctions & OFAC cleared</p>
            </div>

            {/* KPI 4 */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                Average Adjudication SLA
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900 font-sans">4.2 min</span>
                <span className="text-xs font-semibold text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-0.5" /> Fast
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Target SLA &lt; 15 mins</p>
            </div>
          </div>

      {/* Main Table Container: Attention Queue */}
      <div className="bg-white rounded-2xl sm:rounded-[26px] p-4 sm:p-6 shadow-xs border border-gray-100">
        {/* Table Controls Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">Flagged Transaction Queue</h3>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
              {filteredAlerts.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search txHash, merchant, reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C076] transition"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-gray-100/80 p-0.5 rounded-xl text-xs">
              <button
                onClick={() => setFilterLevel('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filterLevel === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterLevel('critical')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filterLevel === 'critical' ? 'bg-white text-red-600 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Critical (90+)
              </button>
              <button
                onClick={() => setFilterLevel('pending')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filterLevel === 'pending' ? 'bg-white text-amber-600 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterLevel('frozen')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filterLevel === 'frozen' ? 'bg-white text-purple-600 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Frozen
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="lg:hidden flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
          <span>↔ Swipe horizontally to view full threat details</span>
          <span className="text-[#00C076] font-semibold text-[10.5px]">Touch scroll active</span>
        </div>

        {/* Alerts Table */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs border-collapse min-w-[1020px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase font-semibold text-[10.5px] tracking-wider">
                <th className="pb-3 pl-2 whitespace-nowrap">Risk Score</th>
                <th className="pb-3 whitespace-nowrap">Transaction / Hash</th>
                <th className="pb-3 whitespace-nowrap">Amount</th>
                <th className="pb-3 whitespace-nowrap">Merchant / Client</th>
                <th className="pb-3 whitespace-nowrap">Detection Trigger</th>
                <th className="pb-3 whitespace-nowrap">Status</th>
                <th className="pb-3 pr-2 text-right whitespace-nowrap">Adjudication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80">
              {filteredAlerts.map((alert) => {
                const isCritical = alert.riskLevel === 'Critical';
                const isHigh = alert.riskLevel === 'High';

                return (
                  <tr key={alert.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Risk Score Pill */}
                    <td className="py-3.5 pl-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono font-bold text-xs whitespace-nowrap ${
                          isCritical
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : isHigh
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        <ShieldAlert className="w-3 h-3" />
                        {alert.riskScore}/100
                      </span>
                    </td>

                    {/* TxHash */}
                    <td className="py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-gray-900">
                        <span>{alert.txHash}</span>
                        <span className="text-[10px] text-gray-400 font-sans font-normal">
                          ({alert.network})
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 block">{alert.time}</span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 font-bold font-mono text-gray-900 whitespace-nowrap">
                      {alert.amount}
                    </td>

                    {/* Merchant / Client */}
                    <td className="py-3.5 whitespace-nowrap">
                      <p className="font-semibold text-gray-900">{alert.merchant}</p>
                      <p className="text-[10.5px] text-gray-400 font-mono">{alert.client}</p>
                    </td>

                    {/* Flag Reason */}
                    <td className="py-3.5 max-w-xs">
                      <p className="font-medium text-gray-700 leading-snug line-clamp-2">
                        {alert.flagReason}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap ${
                          alert.status === 'Pending Action'
                            ? 'bg-amber-100 text-amber-800'
                            : alert.status === 'Frozen'
                            ? 'bg-purple-100 text-purple-800'
                            : alert.status === 'Reported'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-emerald-100 text-[#00C076]'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
                          title="Inspect Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {alert.status === 'Pending Action' && (
                          <>
                            <button
                              onClick={() => handleAction(alert.id, 'Frozen')}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold transition text-[11px]"
                            >
                              Freeze
                            </button>
                            <button
                              onClick={() => handleAction(alert.id, 'Approved Override')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#00C076] border border-emerald-200 font-bold transition text-[11px]"
                            >
                              Clear
                            </button>
                          </>
                        )}

                        {alert.status === 'Frozen' && (
                          <button
                            onClick={() => handleAction(alert.id, 'Reported')}
                            className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold transition text-[11px]"
                          >
                            File SAR
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Inspect Modal Drawer */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-gray-100 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-gray-900 text-base">KYT Threat Adjudication</h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <span className="font-bold text-red-800 block text-[11px] uppercase tracking-wider mb-1">
                  Alert Trigger
                </span>
                <p className="text-red-900 font-medium text-xs leading-snug">
                  {selectedAlert.flagReason}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Risk Score</span>
                  <span className="text-sm font-mono font-bold text-red-600">
                    {selectedAlert.riskScore}/100 ({selectedAlert.riskLevel})
                  </span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Transaction Value</span>
                  <span className="text-sm font-mono font-bold text-gray-900">
                    {selectedAlert.amount}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl font-mono text-[11px] break-all">
                <span className="text-gray-400 block text-[10px] uppercase font-bold font-sans">Full Tx Hash</span>
                {selectedAlert.fullTxHash}
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Merchant Accountability</span>
                <p className="font-bold text-gray-900">{selectedAlert.merchant}</p>
                <p className="text-gray-500 font-mono text-[10.5px]">Client: {selectedAlert.client}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
              <button
                onClick={() => {
                  handleAction(selectedAlert.id, 'Frozen');
                  setSelectedAlert(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-sm transition cursor-pointer"
              >
                Freeze Wallet
              </button>
              <button
                onClick={() => {
                  handleAction(selectedAlert.id, 'Approved Override');
                  setSelectedAlert(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-xl font-bold text-xs shadow-sm transition cursor-pointer"
              >
                Clear False Positive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

