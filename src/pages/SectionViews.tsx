import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  FileText,
  Download,
  Lock,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  Printer
} from 'lucide-react';
import { Toggle } from '../components/Toggle';
import { IDS } from '../utils/sharedMockStore';

export interface SectionViewProps {
  activeTab: string;
  onOpenDeposit?: () => void;
  onOpenPayout?: () => void;
  onOpenDevModal?: () => void;
  onOpenSecurityModal?: () => void;
}

const formatAmount = (value: number) =>
  value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatIsoDate = (value: Date) => value.toISOString().slice(0, 10);

const escapeCsvValue = (value: string) => `"${value.replace(/"/g, '""')}"`;

const networkBalances = [
  {
    asset: 'Tether',
    symbol: 'USDT',
    network: 'TRC-20',
    available: 42118.98,
    pending: 1200,
    locked: 650,
    usdEstimate: 43968.98
  },
  {
    asset: 'Tether',
    symbol: 'USDT',
    network: 'ERC-20',
    available: 14650,
    pending: 0,
    locked: 150,
    usdEstimate: 14800
  },
  {
    asset: 'USD Coin',
    symbol: 'USDC',
    network: 'ERC-20',
    available: 13800,
    pending: 350,
    locked: 100,
    usdEstimate: 14250
  },
  {
    asset: 'Euro Coin',
    symbol: 'EURC',
    network: 'ERC-20',
    available: 8210.2,
    pending: 100,
    locked: 100,
    usdEstimate: 9120.5
  }
];

interface StatementRow {
  date: string;
  description: string;
  reference: string;
  asset: string;
  network: string;
  amount: number;
}

const statementChecksum = '9f2c4a1d6e8b0f37c5a29d4e1b8f6a03d7c25e91f4b8a6d0c3e7f912b5a48d6';

export const SectionView: React.FC<SectionViewProps> = ({
  activeTab,
  onOpenDeposit,
  onOpenPayout
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [apiKey, setApiKey] = useState('cpy_live_948f21e04a918bca48721c09');
  const [twoFactor, setTwoFactor] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(true);

  const [convertPay, setConvertPay] = useState('1000');
  const [convertFromToken, setConvertFromToken] = useState('USDT (TRON)');
  const [convertToToken, setConvertToToken] = useState('USDC (ERC-20)');
  const [convertQuoteSecs, setConvertQuoteSecs] = useState(28);
  const [convertReviewing, setConvertReviewing] = useState(false);
  const [convertLoading, setConvertLoading] = useState(false);
  const [convertToast, setConvertToast] = useState<string | null>(null);

  const [statementPeriod, setStatementPeriod] = useState('last-30-days');
  const [statementStart, setStatementStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return formatIsoDate(date);
  });
  const [statementEnd, setStatementEnd] = useState(() => formatIsoDate(new Date()));
  const [statementMessage, setStatementMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== 'convert') return;
    const timer = setInterval(() => {
      setConvertQuoteSecs((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTab]);

  const payAmountNum = Math.max(0, parseFloat(convertPay) || 0);
  const feeRate = 0.0005;
  const feeAmount = payAmountNum * feeRate;
  const indicativeRate =
    convertFromToken === convertToToken
      ? 1.0
      : convertFromToken.startsWith('EURC')
      ? 1.0852
      : convertToToken.startsWith('EURC')
      ? 0.9215
      : 0.9998;
  const receiveNum = Math.max(0, (payAmountNum - feeAmount) * indicativeRate);

  const handleFlipTokens = () => {
    const prevFrom = convertFromToken;
    setConvertFromToken(convertToToken);
    setConvertToToken(prevFrom);
    setConvertQuoteSecs(30);
    setConvertReviewing(false);
  };

  const handleExecuteConvert = () => {
    setConvertLoading(true);
    setTimeout(() => {
      setConvertLoading(false);
      setConvertReviewing(false);
      setConvertToast(
        `Converted ${payAmountNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${convertFromToken.split(' ')[0]} to ${receiveNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${convertToToken.split(' ')[0]} (est.).`
      );
      setTimeout(() => setConvertToast(null), 5000);
    }, 800);
  };

  const handlePeriodChange = (period: string) => {
    setStatementPeriod(period);
    const end = new Date();
    const start = new Date();
    if (period === 'last-30-days') {
      start.setDate(start.getDate() - 30);
    } else if (period === 'last-month') {
      start.setMonth(start.getMonth() - 1);
    } else if (period === 'last-quarter') {
      start.setMonth(start.getMonth() - 3);
    } else if (period === 'year-to-date') {
      start.setMonth(0, 1);
    } else {
      return;
    }
    setStatementStart(formatIsoDate(start));
    setStatementEnd(formatIsoDate(end));
    setStatementMessage(null);
  };

  const statementRows: StatementRow[] = [
    {
      date: statementStart,
      description: 'Opening balance',
      reference: '—',
      asset: 'USDT',
      network: 'TRC-20',
      amount: 0
    },
    {
      date: statementStart,
      description: 'Deposit received',
      reference: IDS.deposits[0],
      asset: 'USDT',
      network: 'TRC-20',
      amount: 12500
    },
    {
      date: statementEnd,
      description: 'Payout sent',
      reference: IDS.payouts.secondary,
      asset: 'USDC',
      network: 'ERC-20',
      amount: -4200
    },
    {
      date: statementEnd,
      description: 'Closing balance',
      reference: '—',
      asset: 'USDT',
      network: 'TRC-20',
      amount: 8300
    }
  ];

  const handleExportCsv = () => {
    const csvRows = [
      ['Date', 'Description', 'Reference', 'Asset', 'Network', 'Amount (USD)', 'SHA-256 checksum'],
      ...statementRows.map((row) => [
        row.date,
        row.description,
        row.reference,
        row.asset,
        row.network,
        row.amount.toFixed(2),
        statementChecksum
      ])
    ];
    const csv = csvRows.map((row) => row.map(escapeCsvValue).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `statement-${statementStart}-to-${statementEnd}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatementMessage(`CSV exported for ${statementStart} to ${statementEnd}.`);
    setTimeout(() => setStatementMessage(null), 4000);
  };

  const handlePrintStatement = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setStatementMessage('Allow pop-ups to open the print-friendly statement summary.');
      setTimeout(() => setStatementMessage(null), 4000);
      return;
    }
    const rowsHtml = statementRows
      .map(
        (row) =>
          `<tr><td>${row.date}</td><td>${row.description}</td><td>${row.reference}</td><td>${row.asset} · ${row.network}</td><td>${row.amount.toFixed(2)}</td></tr>`
      )
      .join('');
    printWindow.document.write(
      `<!doctype html><html><head><title>Statement ${statementStart} to ${statementEnd}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h1{font-size:18px}h2{font-size:12px;color:#555;font-weight:normal}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left}</style></head><body><h1>Account statement</h1><h2>${statementStart} to ${statementEnd}</h2><table><thead><tr><th>Date</th><th>Description</th><th>Reference</th><th>Asset</th><th>Amount (USD)</th></tr></thead><tbody>${rowsHtml}</tbody></table><p>SHA-256 checksum: ${statementChecksum}</p></body></html>`
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setStatementMessage('Print dialog opened for the statement summary.');
    setTimeout(() => setStatementMessage(null), 4000);
  };

  if (activeTab === 'deposits') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-xs text-[#6B7280] font-medium">Total Deposited (30d)</span>
            <p className="text-xl font-bold text-gray-900 mt-0.5">$1,482,900.00</p>
            <span className="text-xs text-emerald-600 font-semibold">↑ +14.2% vs last month</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-xs text-[#6B7280] font-medium">Active Deposit Channels</span>
            <p className="text-xl font-bold text-gray-900 mt-0.5">12 Dedicated Nodes</p>
            <span className="text-xs text-gray-500">TRON, Ethereum, Polygon</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-xs text-[#6B7280] font-medium">Avg Settlement Speed</span>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">2.4 mins</p>
            <span className="text-xs text-gray-500">Automated crediting</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-bold text-gray-900">Dedicated Merchant Receiving Addresses</span>
            <button
              onClick={onOpenDeposit}
              className="px-3 py-1.5 bg-[#007F4E] hover:bg-[#00663E] text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              + Generate New Address
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-800">USDT · TRON (TRC-20)</p>
                <p className="font-mono text-gray-500 text-xs">TYK9A3XmUqZ9z8VnLw7h4Jb1k8Pq5D2gXy</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100/70 text-[#00824E] text-xs font-semibold rounded">Active</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-800">USDT · Ethereum (ERC-20)</p>
                <p className="font-mono text-gray-500 text-xs">0x71C..98a2</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100/70 text-[#00824E] text-xs font-semibold rounded">Active</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'exceptions') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200/60 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div className="text-xs text-amber-900">
              <strong className="font-semibold">1 Pending Exception:</strong> Reference <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">dep_8Hp9..co2</code> was received with slight confirmation delay on Ethereum block 219804.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[#6B7280] font-medium pb-2">
                  <th className="py-2">Reference</th>
                  <th className="py-2">Reason</th>
                  <th className="py-2">Network</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td className="py-2.5 font-semibold text-gray-900">dep_8Hp9..co2</td>
                  <td className="py-2.5 text-amber-700 font-medium">Late block confirmation</td>
                  <td className="py-2.5 text-gray-600">USDC · ERC-20</td>
                  <td className="py-2.5 font-semibold text-[#007F4E]">+ 950.00</td>
                  <td className="py-2.5 text-right">
                    <button className="px-3 py-1 bg-[#007F4E] text-white rounded-lg text-xs font-semibold hover:bg-[#00663E]">
                      Approve & Credit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'payouts') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-xs text-[#6B7280]">Scheduled for Tomorrow</span>
              <p className="text-xl font-bold text-gray-900 mt-0.5">$4,200.00 USDT</p>
              <p className="text-xs text-amber-600 mt-1">1 payout awaiting a second checker</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-xs text-[#6B7280]">Total Disbursed (7d)</span>
              <p className="text-xl font-bold text-gray-900 mt-0.5">$128,450.00 USDT</p>
              <p className="text-xs text-gray-500 mt-1">Average gas fee: $0.85 per transaction</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-900">Dispatch Outbound Payout</h4>
            <p className="text-xs text-gray-500">Send USDT or USDC to external partner addresses</p>
          </div>
          <button
            onClick={onOpenPayout}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            + Create Single / Batch Payout
          </button>
        </div>
      </div>
    );
  }

  if (activeTab === 'balances') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {networkBalances.map((balance) => (
            <div
              key={`${balance.symbol}-${balance.network}`}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-semibold text-gray-700">
                    {balance.asset} ({balance.symbol})
                  </span>
                  <p className="text-xs text-[#6B7280]">Settlement network balance</p>
                </div>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded">
                  {balance.network}
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Available', value: balance.available, className: 'text-gray-900' },
                  { label: 'Pending', value: balance.pending, className: 'text-amber-700' },
                  { label: 'Locked', value: balance.locked, className: 'text-gray-600' }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className={`text-sm font-bold ${item.className}`}>
                      {formatAmount(item.value)} {balance.symbol}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#6B7280] mt-3 pt-2 border-t border-gray-100">
                ≈ ${formatAmount(balance.usdEstimate)} USD (estimated)
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'convert') {
    const receiveVal = formatAmount(receiveNum);
    return (
      <div className="space-y-4 animate-fadeIn">
        {convertToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
            <span>{convertToast}</span>
            <button onClick={() => setConvertToast(null)} className="text-emerald-600 hover:text-emerald-900 font-bold ml-2 cursor-pointer">✕</button>
          </div>
        )}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm max-w-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-900">Convert</span>
            <span className="text-xs text-[#007F4E] font-semibold">Indicative quote</span>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">You Pay</span>
              <div className="flex items-center justify-between mt-1">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={convertPay}
                  disabled={convertReviewing}
                  onChange={(e) => setConvertPay(e.target.value)}
                  className="bg-transparent font-bold text-lg text-gray-900 outline-none w-1/2 disabled:opacity-70"
                />
                <span className="px-2.5 py-1 bg-white rounded-lg text-xs font-semibold text-gray-800 shadow-sm">{convertFromToken}</span>
              </div>
            </div>

            <div className="flex justify-center -my-2">
              <button
                type="button"
                onClick={handleFlipTokens}
                title="Swap Direction"
                className="w-7 h-7 rounded-full bg-white border border-gray-200 hover:border-[#007F4E] flex items-center justify-center text-gray-500 hover:text-[#007F4E] shadow-sm transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">You Receive (Estimated)</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-lg text-[#007F4E]">{receiveVal}</span>
                <span className="px-2.5 py-1 bg-white rounded-lg text-xs font-semibold text-gray-800 shadow-sm">{convertToToken}</span>
              </div>
            </div>

            <div className="p-2.5 bg-gray-50/80 rounded-xl border border-gray-100 text-xs text-gray-600 space-y-1">
              <div className="flex items-center justify-between">
                <span>Indicative Exchange Rate</span>
                <span className="font-semibold text-gray-800">1 {convertFromToken.split(' ')[0]} ≈ {indicativeRate.toFixed(4)} {convertToToken.split(' ')[0]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Estimated Network Fee (0.05%)</span>
                <span className="font-semibold text-gray-800">{feeAmount.toFixed(2)} {convertFromToken.split(' ')[0]}</span>
              </div>
              <div className="flex items-center justify-between text-gray-500 pt-0.5 border-t border-gray-200/50">
                <span>Estimated quote valid for</span>
                <span className="font-mono text-gray-700 font-semibold">{convertQuoteSecs}s</span>
              </div>
            </div>

            {convertReviewing ? (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5">
                <p className="text-xs font-bold text-emerald-900">
                  Review Conversion: {formatAmount(payAmountNum)} {convertFromToken.split(' ')[0]} → {receiveVal} {convertToToken.split(' ')[0]}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConvertReviewing(false)}
                    disabled={convertLoading}
                    className="flex-1 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteConvert}
                    disabled={convertLoading}
                    className="flex-1 py-2 bg-[#007F4E] hover:bg-[#00663E] disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {convertLoading ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Executing...</span>
                      </>
                    ) : (
                      <span>Confirm & Convert</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConvertReviewing(true)}
                disabled={payAmountNum <= 0}
                className="w-full py-2.5 bg-[#007F4E] hover:bg-[#00663E] disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Review Conversion</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'statements') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-gray-600 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-gray-900">Account statements</h4>
              <p className="text-xs text-gray-500">Choose a period, review the summary, then export it.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-700 block mb-1">Statement period</label>
              <select
                value={statementPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              >
                <option value="last-30-days">Last 30 days</option>
                <option value="last-month">Last month</option>
                <option value="last-quarter">Last quarter</option>
                <option value="year-to-date">Year to date</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-700 block mb-1">From</label>
              <input
                type="date"
                value={statementStart}
                disabled={statementPeriod !== 'custom'}
                onChange={(e) => setStatementStart(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 disabled:opacity-60"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-700 block mb-1">To</label>
              <input
                type="date"
                value={statementEnd}
                disabled={statementPeriod !== 'custom'}
                onChange={(e) => setStatementEnd(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 disabled:opacity-60"
              />
            </div>
          </div>

          {statementMessage && (
            <p className="text-xs text-[#007F4E] font-semibold">{statementMessage}</p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#6B7280] text-xs uppercase font-bold tracking-wider border-b border-gray-100">
                  <th className="py-2">Date</th>
                  <th className="py-2">Description</th>
                  <th className="py-2">Reference</th>
                  <th className="py-2">Asset · Network</th>
                  <th className="py-2 text-right">Amount (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {statementRows.map((row) => (
                  <tr key={`${row.reference}-${row.description}`}>
                    <td className="py-2.5 text-gray-600">{row.date}</td>
                    <td className="py-2.5 font-semibold text-gray-800">{row.description}</td>
                    <td className="py-2.5 font-mono text-xs text-gray-500">{row.reference}</td>
                    <td className="py-2.5 text-gray-600">{row.asset} · {row.network}</td>
                    <td className="py-2.5 text-right font-semibold text-gray-900">{row.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-[#6B7280]">SHA-256 checksum · {statementChecksum}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintStatement}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#007F4E] hover:bg-[#00663E] text-white rounded-lg text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'developers') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 flex items-center justify-between mb-1.5">
              <span>Secret API Key</span>
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" /> Demo key
              </span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono text-xs text-gray-800 select-all truncate">
                {apiKey}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(apiKey);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
              >
                {copiedKey ? <Check className="w-3 h-3 text-[#007F4E]" /> : <Copy className="w-3 h-3" />}
                {copiedKey ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={() => setApiKey('cpy_live_' + Math.random().toString(36).substring(2, 15))}
                title="Rotate Key"
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-500">API Documentation and SDK libraries</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-[#007F4E] font-semibold flex items-center gap-1 hover:underline">
              API Specs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'team-security') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-xs font-bold text-gray-900">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-gray-500">Authenticator app or security key</p>
              </div>
            </div>
            <Toggle
              checked={twoFactor}
              onChange={(value) => setTwoFactor(value)}
              label="Two-factor authentication"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-xs font-bold text-gray-900">IP & Wallet Whitelist</p>
                <p className="text-xs text-gray-500">Only verified merchant endpoints</p>
              </div>
            </div>
            <Toggle
              checked={ipWhitelist}
              onChange={(value) => setIpWhitelist(value)}
              label="IP and wallet whitelist"
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'settings') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3 max-w-lg">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Merchant Business Name</label>
            <input
              type="text"
              defaultValue="CopyM Pay Global LLC"
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Primary Settlement Currency</label>
            <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800">
              <option>USDT (Tether USD)</option>
              <option>USDC (USD Coin)</option>
              <option>EURC (Euro Coin)</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
