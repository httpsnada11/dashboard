import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  X,
  Download,
  AlertOctagon,
  RefreshCw,
  Building2,
  Copy,
  Check,
  ChevronRight,
  Activity
} from 'lucide-react';
import { MerchantIssueLog } from '../types';

const INITIAL_ISSUE_LOGS: MerchantIssueLog[] = [
  {
    id: 'iss_01',
    merchantId: 'mer_02',
    merchantName: 'Apex Forex Global',
    category: 'Webhook Delivery',
    httpStatus: 503,
    errorCode: 'ERR_WEBHOOK_TIMEOUT_503',
    title: 'Deposit Credited Webhook Failed After 3 Retries',
    description: 'Endpoint https://crm.apexforex.com/api/v1/copym-webhook returned 503 Service Unavailable. 3 retry delivery attempts exhausted.',
    endpointUrl: 'https://crm.apexforex.com/api/v1/copym-webhook',
    affectedCustomerOrTx: 'dep_948271_TRON ($14,200.00 USDT)',
    timestamp: '4 mins ago',
    severity: 'Critical',
    retryCount: 3,
    status: 'Open',
    latencyMs: 2450,
    requestPayload: JSON.stringify(
      {
        event: 'deposit.credited',
        delivery_id: 'dlv_apex_98124',
        merchant_id: 'mer_02',
        data: {
          deposit_id: 'dep_948271',
          customer_id: 'cust_11029',
          amount: '14200.00',
          currency: 'USDT',
          network: 'TRON_TRC20',
          tx_hash: 'TF7mQqZ9z8VnLw7h4Jb1k8Pq5D2g09xP',
          confirmations: 19
        }
      },
      null,
      2
    ),
    responsePayload: JSON.stringify(
      {
        error: '503 Service Unavailable',
        message: 'Database connection pool timeout while processing webhook credit.',
        upstream_gateway: 'Kong-API-Gateway/3.1'
      },
      null,
      2
    )
  },
  {
    id: 'iss_02',
    merchantId: 'mer_01',
    merchantName: 'Eagle Vision Market Ltd',
    category: 'Rate Limiting',
    httpStatus: 429,
    errorCode: 'ERR_RATE_LIMIT_EXCEEDED_429',
    title: 'Burst API Rate Limit Exceeded (320 req/sec)',
    description: 'Merchant exceeded Tier 1 burst quota of 250 req/sec during peak volatility window. Rate limiting applied to secondary worker pool.',
    endpointUrl: 'POST /v1/orders',
    affectedCustomerOrTx: 'IP 198.51.100.44 / Key key_live_8849',
    timestamp: '18 mins ago',
    severity: 'Warning',
    status: 'Investigating',
    latencyMs: 14,
    requestPayload: JSON.stringify(
      {
        endpoint: '/v1/orders',
        method: 'POST',
        headers: {
          'X-Api-Key': 'demo_live_••••N8V4',
          'Client-IP': '198.51.100.44'
        },
        payload_count: 320
      },
      null,
      2
    ),
    responsePayload: JSON.stringify(
      {
        error: 'Too Many Requests',
        status: 429,
        quota_allowed_per_sec: 250,
        quota_exceeded_by: 70,
        retry_after_seconds: 2
      },
      null,
      2
    )
  },
  {
    id: 'iss_03',
    merchantId: 'mer_03',
    merchantName: 'Prime Liquidity Hub',
    category: 'Settlement Exception',
    httpStatus: 422,
    errorCode: 'ERR_UNDERPAYMENT_DEFICIT',
    title: 'Partial Deposit Underpayment (Deficit: 110.00 USDC)',
    description: 'Payer deposited 890.00 USDC against target invoice requirement of 1,000.00 USDC. Underpayment threshold unfulfilled.',
    affectedCustomerOrTx: 'cust_30918 / ord_884920',
    endpointUrl: 'POST /v1/orders/adjudicate',
    timestamp: '42 mins ago',
    severity: 'Warning',
    status: 'Open',
    latencyMs: 65,
    requestPayload: JSON.stringify(
      {
        order_id: 'ord_884920',
        expected_amount: '1000.00',
        received_amount: '890.00',
        token: 'USDC',
        chain: 'Ethereum'
      },
      null,
      2
    ),
    responsePayload: JSON.stringify(
      {
        adjudication_status: 'HELD_FOR_MERCHANT_DECISION',
        shortfall_amount: '110.00',
        options: ['ACCEPT_PARTIAL', 'REFUND_LESS_GAS', 'REQUEST_TOPUP']
      },
      null,
      2
    )
  },
  {
    id: 'iss_04',
    merchantId: 'mer_04',
    merchantName: 'Vance Capital Markets',
    category: 'API Integration',
    httpStatus: 401,
    errorCode: 'ERR_INVALID_HMAC_SIGNATURE',
    title: 'Invalid Request Cryptographic Signature',
    description: 'Incoming payout payload signature header X-COPYM-SIGNATURE did not match expected SHA-256 HMAC secret digest.',
    affectedCustomerOrTx: 'sk_live_94f8••••N8V4',
    endpointUrl: 'POST /v1/payouts/create',
    timestamp: '1 hr ago',
    severity: 'Critical',
    status: 'Open',
    latencyMs: 48,
    requestPayload: JSON.stringify(
      {
        header_received: 'sha256=9a8bc41...',
        digest_computed: 'sha256=12ef44a...',
        timestamp_header: '1731908412'
      },
      null,
      2
    ),
    responsePayload: JSON.stringify(
      {
        error: 'Unauthorized',
        message: 'HMAC signature verification failed. Please verify API secret key.',
        status: 401
      },
      null,
      2
    )
  },
  {
    id: 'iss_05',
    merchantId: 'mer_05',
    merchantName: 'Quantex Asset Management AG',
    category: 'KYC/AML Trigger',
    errorCode: 'ERR_SANCTION_CLUSTER_MATCH',
    title: 'High-Risk OFAC Mixer Hop Detected (Score: 89)',
    description: 'Inbound customer deposit originated from flagged Tornado Cash clustering wallet. Funds quarantined in segregated cold ledger.',
    affectedCustomerOrTx: 'cust_90124 / tx_0x15eA7721',
    endpointUrl: 'Deposit Ingestion Pipeline',
    timestamp: '2 hrs ago',
    severity: 'Critical',
    status: 'Investigating',
    latencyMs: 110,
    requestPayload: JSON.stringify(
      {
        tx_hash: '0x15eA772180a9bC51098277f0a9918bc',
        kyt_score: 89,
        flag: 'SANCTION_OFAC_MIXER_CLUSTER',
        network: 'ERC-20'
      },
      null,
      2
    ),
    responsePayload: JSON.stringify(
      {
        action_taken: 'AUTO_FREEZE_VAULT',
        compliance_ticket: 'CMP-OFAC-84910',
        sar_generated: true
      },
      null,
      2
    )
  },
  {
    id: 'iss_06',
    merchantId: 'mer_01',
    merchantName: 'Eagle Vision Market Ltd',
    category: 'Webhook Delivery',
    httpStatus: 500,
    errorCode: 'ERR_MERCHANT_SERVER_CRASH',
    title: 'Merchant CRM Database Timeout Resolved',
    description: 'Resolved. Merchant CRM server database connection pool was re-established after automated restart.',
    endpointUrl: 'https://api.eaglevision.com/webhooks/copym',
    affectedCustomerOrTx: 'po_37F9_ETH ($5,000.00 USDC)',
    timestamp: '3 hrs ago',
    severity: 'Resolved',
    status: 'Resolved',
    latencyMs: 1820,
    requestPayload: JSON.stringify(
      {
        event: 'payout.completed',
        payout_ref: 'po_37F9_ETH',
        status: 'DISBURSED'
      },
      null,
      2
    ),
    responsePayload: JSON.stringify(
      {
        status: 200,
        acknowledged: true
      },
      null,
      2
    )
  }
];

export const AdminLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<MerchantIssueLog[]>(INITIAL_ISSUE_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedLog, setSelectedLog] = useState<MerchantIssueLog | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Trigger toast banner
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // 1-Click Webhook Retry Simulation
  const handleRetryWebhook = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRetryingId(id);
    showNotification('Dispatched instant webhook retry to merchant endpoint...');

    setTimeout(() => {
      setRetryingId(null);
      setLogs((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                httpStatus: 200,
                severity: 'Resolved',
                status: 'Resolved',
                description: 'Webhook successfully redelivered and acknowledged (HTTP 200 OK).'
              }
            : item
        )
      );
      if (selectedLog?.id === id) {
        setSelectedLog((prev) =>
          prev
            ? {
                ...prev,
                httpStatus: 200,
                severity: 'Resolved',
                status: 'Resolved',
                description: 'Webhook successfully redelivered and acknowledged (HTTP 200 OK).'
              }
            : null
        );
      }
      showNotification('Webhook redelivered successfully! HTTP 200 OK.');
    }, 1200);
  };

  // Mark Log Status (Investigating / Resolved)
  const handleUpdateStatus = (id: string, newStatus: 'Open' | 'Investigating' | 'Resolved') => {
    setLogs((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
              severity: newStatus === 'Resolved' ? 'Resolved' : item.severity
            }
          : item
      )
    );
    if (selectedLog?.id === id) {
      setSelectedLog((prev) =>
        prev ? { ...prev, status: newStatus, severity: newStatus === 'Resolved' ? 'Resolved' : prev.severity } : null
      );
    }
    showNotification(`Incident status updated to ${newStatus}.`);
  };

  // Copy helper
  const handleCopy = (text: string, id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['IssueID', 'Merchant', 'Category', 'HTTPStatus', 'ErrorCode', 'Title', 'Severity', 'Status', 'Timestamp'];
    const rows = logs.map((l) => [
      `"${l.id}"`,
      `"${l.merchantName}"`,
      `"${l.category}"`,
      l.httpStatus || 'N/A',
      `"${l.errorCode}"`,
      `"${l.title}"`,
      `"${l.severity}"`,
      `"${l.status}"`,
      `"${l.timestamp}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `copym-merchant-issues-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Incident logs exported to CSV.');
  };

  // Filter computation
  const filteredLogs = logs.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.errorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.endpointUrl && item.endpointUrl.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.affectedCustomerOrTx && item.affectedCustomerOrTx.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchMerchant = selectedMerchant === 'All' || item.merchantName === selectedMerchant;
    const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSeverity = selectedSeverity === 'All' || item.severity === selectedSeverity;

    return matchSearch && matchMerchant && matchCategory && matchSeverity;
  });

  const uniqueMerchants = ['All', ...Array.from(new Set(logs.map((l) => l.merchantName)))];

  // Key KPI Metrics
  const totalIncidents = logs.length;
  const criticalCount = logs.filter((l) => l.severity === 'Critical').length;
  const warningCount = logs.filter((l) => l.severity === 'Warning').length;
  const resolvedCount = logs.filter((l) => l.severity === 'Resolved').length;

  return (
    <div className="space-y-4 font-sans text-slate-900 animate-fadeIn">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header Card (Inter / SF Pro Hierarchy, Blue Accents, Compact Spacing) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200/60 rounded-md">
              Platform Diagnostics
            </span>
            <span className="text-xs text-slate-400">· Real-Time Error Observability</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Merchant Issue & Error Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Monitor and troubleshoot merchant integration failures, webhook dropouts, API rate limits, and cryptographic mismatches.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Log</span>
          </button>
          <div className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200/70 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>{criticalCount} Critical Outages</span>
          </div>
        </div>
      </div>

      {/* KPI Metric Strip (High Density, Reduced Whitespace) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Total Logged Incidents</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900">{totalIncidents}</span>
            <span className="text-[10.5px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              Last 24h
            </span>
          </div>
        </div>

        {/* Metric 2: Restrained Red Treatment */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Critical Outages (5xx/Auth)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-rose-700">{criticalCount}</span>
            <span className="text-[10.5px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Urgent</span>
            </span>
          </div>
        </div>

        {/* Metric 3: Restrained Amber Treatment */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Rate Limit & Deficit Spikes</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-amber-700">{warningCount}</span>
            <span className="text-[10.5px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span>Warning</span>
            </span>
          </div>
        </div>

        {/* Metric 4: Subtle Green Treatment */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Resolved / Self-Healed</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-700">{resolvedCount}</span>
            <span className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Recovered</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Filter & Action Bar (Inter Hierarchy, Blue Accents) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50/50">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by merchant, error code, title, endpoint, or customer..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Merchant Filter */}
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedMerchant}
                onChange={(e) => setSelectedMerchant(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600"
              >
                {uniqueMerchants.map((m) => (
                  <option key={m} value={m}>
                    {m === 'All' ? 'All Merchants' : m}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="All">All Categories</option>
              <option value="Webhook Delivery">Webhook Delivery</option>
              <option value="API Integration">API Integration</option>
              <option value="Rate Limiting">Rate Limiting</option>
              <option value="Settlement Exception">Settlement Exception</option>
              <option value="KYC/AML Trigger">KYC/AML Trigger</option>
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical Outages</option>
              <option value="Warning">Warnings</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* High-Density Incident Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Merchant & Incident</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">HTTP Code</th>
                <th className="py-2.5 px-3">Affected Scope</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Time</th>
                <th className="py-2.5 px-4 text-center">Diagnostics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                      <p className="font-semibold text-sm text-slate-700">No active merchant incidents found</p>
                      <p className="text-xs text-slate-400 mt-0.5">All merchant webhooks and API endpoints are responding normally.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => {
                  const isCritical = item.severity === 'Critical';
                  const isWarning = item.severity === 'Warning';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedLog(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Merchant & Incident Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${
                              isCritical
                                ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                                : isWarning
                                ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                            }`}
                          >
                            {item.httpStatus || '!'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                              <span>{item.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] font-semibold text-blue-600">{item.merchantName}</span>
                              <span className="text-slate-300">·</span>
                              <span className="text-[10px] font-mono text-slate-400">{item.errorCode}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      </td>

                      {/* HTTP Status Code with Restrained Colors */}
                      <td className="py-3 px-3">
                        {item.httpStatus ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold font-mono ${
                              item.httpStatus >= 500
                                ? 'bg-rose-50 text-rose-700 border border-rose-200/70'
                                : item.httpStatus === 429
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/70'
                                : item.httpStatus === 401
                                ? 'bg-rose-50 text-rose-700 border border-rose-200/70'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                            }`}
                          >
                            HTTP {item.httpStatus}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">N/A (AML)</span>
                        )}
                      </td>

                      {/* Affected Scope / Customer / Endpoint */}
                      <td className="py-3 px-3">
                        <span className="text-xs font-mono text-slate-700 truncate max-w-[190px] block">
                          {item.affectedCustomerOrTx || item.endpointUrl}
                        </span>
                      </td>

                      {/* Incident Status */}
                      <td className="py-3 px-3">
                        {item.status === 'Open' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            <span>Open</span>
                          </span>
                        )}
                        {item.status === 'Investigating' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200/70">
                            <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                            <span>Investigating</span>
                          </span>
                        )}
                        {item.status === 'Resolved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Resolved</span>
                          </span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-3 text-right font-medium text-slate-400 text-[11px]">
                        {item.timestamp}
                      </td>

                      {/* Action / Diagnostics Button */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* 1-Click Retry for Webhook Failures */}
                          {item.category === 'Webhook Delivery' && item.status !== 'Resolved' && (
                            <button
                              type="button"
                              onClick={(e) => handleRetryWebhook(item.id, e)}
                              disabled={retryingId === item.id}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition shadow-xs cursor-pointer disabled:opacity-60"
                              title="Redeliver webhook to merchant endpoint"
                            >
                              <RefreshCw className={`w-3 h-3 ${retryingId === item.id ? 'animate-spin' : ''}`} />
                              <span>{retryingId === item.id ? 'Retrying...' : 'Redeliver'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedLog(item)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 transition"
                            title="Inspect Payloads & Logs"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED DIAGNOSTICS & PAYLOAD INSPECTION DRAWER */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-xl h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideInRight">
            <div>
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {selectedLog.merchantName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedLog.title}</h3>
                    <p className="text-xs text-slate-500">{selectedLog.merchantName} ({selectedLog.merchantId})</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="mt-4">
                <div
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1 ${
                    selectedLog.severity === 'Critical'
                      ? 'bg-rose-50 border-rose-200/80 text-rose-800'
                      : selectedLog.severity === 'Warning'
                      ? 'bg-amber-50 border-amber-200/80 text-amber-800'
                      : 'bg-emerald-50 border-emerald-200/80 text-emerald-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <AlertOctagon className="w-4 h-4" />
                      <span>{selectedLog.errorCode}</span>
                    </span>
                    <span className="font-mono text-[10.5px]">Latency: {selectedLog.latencyMs}ms</span>
                  </div>
                  <p className="text-[11.5px] mt-1">{selectedLog.description}</p>
                </div>
              </div>

              {/* Incident Parameters */}
              <div className="mt-5 space-y-3.5 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400">
                  Incident Metadata
                </h4>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Category</span>
                    <span className="font-semibold text-slate-800">{selectedLog.category}</span>
                  </div>
                  {selectedLog.endpointUrl && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Endpoint</span>
                      <span className="font-mono text-slate-800 text-[11px] truncate max-w-[280px]">
                        {selectedLog.endpointUrl}
                      </span>
                    </div>
                  )}
                  {selectedLog.affectedCustomerOrTx && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Affected Scope</span>
                      <span className="font-mono font-bold text-slate-900">{selectedLog.affectedCustomerOrTx}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Occurred At</span>
                    <span className="text-slate-800">{selectedLog.timestamp}</span>
                  </div>
                </div>

                {/* Request Payload */}
                {selectedLog.requestPayload && (
                  <>
                    <div className="flex items-center justify-between pt-2">
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400">
                        Outbound Request Payload
                      </h4>
                      <button
                        type="button"
                        onClick={(e) => handleCopy(selectedLog.requestPayload!, 'req', e)}
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        {copiedId === 'req' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === 'req' ? 'Copied' : 'Copy JSON'}</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                      {selectedLog.requestPayload}
                    </pre>
                  </>
                )}

                {/* Response Body */}
                {selectedLog.responsePayload && (
                  <>
                    <div className="flex items-center justify-between pt-2">
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400">
                        Merchant Server Response Body
                      </h4>
                      <button
                        type="button"
                        onClick={(e) => handleCopy(selectedLog.responsePayload!, 'res', e)}
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        {copiedId === 'res' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === 'res' ? 'Copied' : 'Copy JSON'}</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-950 text-rose-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                      {selectedLog.responsePayload}
                    </pre>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center gap-2">
              {selectedLog.category === 'Webhook Delivery' && selectedLog.status !== 'Resolved' && (
                <button
                  type="button"
                  onClick={(e) => handleRetryWebhook(selectedLog.id, e)}
                  disabled={retryingId === selectedLog.id}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${retryingId === selectedLog.id ? 'animate-spin' : ''}`} />
                  <span>{retryingId === selectedLog.id ? 'Dispatching...' : 'Redeliver Webhook Now'}</span>
                </button>
              )}

              {selectedLog.status !== 'Investigating' && selectedLog.status !== 'Resolved' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedLog.id, 'Investigating')}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Mark Investigating
                </button>
              )}

              {selectedLog.status !== 'Resolved' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedLog.id, 'Resolved')}
                  className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogsPage;
