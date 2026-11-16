import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Key,
  Copy,
  Check,
  ChevronRight,
  X,
  Layers,
  FileCheck2,
  Lock
} from 'lucide-react';
import { AdminAuditEntry } from '../types';

const INITIAL_AUDIT_LOGS: AdminAuditEntry[] = [
  {
    id: 'aud_9801',
    operator: 'Sarah Chen (Platform SuperAdmin)',
    operatorRole: 'SuperAdmin',
    action: 'Hot-to-Cold Vault Sweep Executed',
    target: 'Vault Pool #03 (1,250,000 USDT -> Multi-Sig Cold)',
    timestamp: '2026-11-12 17:42:10 UTC',
    ip: '198.51.100.44 (SG-GovNet)',
    hash: '0x8f4c2e71d3a958b10e4a77cb2103f56e9cba3210459812dfaa910c23948bf8a1',
    severity: 'Critical'
  },
  {
    id: 'aud_9802',
    operator: 'Marcus Vance (Compliance Lead)',
    operatorRole: 'Compliance Lead',
    action: 'SAR Filed & Address Freezed',
    target: 'cust_84019 / tx_94f82810a9bC5109 (OFAC Mixer)',
    timestamp: '2026-11-12 17:28:44 UTC',
    ip: '198.51.100.12 (SG-GovNet)',
    hash: '0x3a91b2c45e89df00142837bcde209481aa520934ec765103498bfe1928374a56',
    severity: 'Critical'
  },
  {
    id: 'aud_9803',
    operator: 'Elena Rostova (Senior Risk Analyst)',
    operatorRole: 'Risk Analyst',
    action: 'Merchant KYB Adjudication Approved',
    target: 'Quantex Asset Management AG (Tier 1 Upgrade)',
    timestamp: '2026-11-12 16:55:02 UTC',
    ip: '203.0.113.88 (EU-Zurich Ops)',
    hash: '0x55b1e90a44f387c6530182fe9104cbde44890312fa8901235678bcda09182736',
    severity: 'Info'
  },
  {
    id: 'aud_9804',
    operator: 'Marcus Vance (Compliance Lead)',
    operatorRole: 'Compliance Lead',
    action: 'Daily Volume Limit Modified',
    target: 'Apex Forex Global ($1,000,000 -> $2,500,000)',
    timestamp: '2026-11-12 16:10:19 UTC',
    ip: '198.51.100.12 (SG-GovNet)',
    hash: '0x992381fbcda01827463510293847561029384756abcdef102938475610293847',
    severity: 'Warning'
  },
  {
    id: 'aud_9805',
    operator: 'David Zhang (Treasury Checker)',
    operatorRole: 'Checker',
    action: 'Maker-Checker High Value Payout Dual-Authorized',
    target: 'Batch #PO-9844 ($750,000 USDC -> BitGo Custody)',
    timestamp: '2026-11-12 15:40:33 UTC',
    ip: '198.51.100.19 (SG-GovNet)',
    hash: '0x4102938475610293847561029384756abcdef9876543210fedcba9876543210f',
    severity: 'Critical'
  },
  {
    id: 'aud_9806',
    operator: 'Sarah Chen (Platform SuperAdmin)',
    operatorRole: 'SuperAdmin',
    action: 'Payment Exception Resolved (Manual Credit)',
    target: 'EXC-8491-LATE (2,500 USDT -> Eagle Vision Market)',
    timestamp: '2026-11-12 14:15:22 UTC',
    ip: '198.51.100.44 (SG-GovNet)',
    hash: '0x6291038475610293847561029384756abcdef0918273645fe98102394857610a',
    severity: 'Info'
  },
  {
    id: 'aud_9807',
    operator: 'System Daemon (Automated KYT Monitor)',
    operatorRole: 'Automated Agent',
    action: 'High Risk KYT Flag Triggered',
    target: '0x94f8..11e2 (Score: 92/100, Tornado Cash hop)',
    timestamp: '2026-11-12 13:02:11 UTC',
    ip: '127.0.0.1 (Internal Cluster)',
    hash: '0x7182938475610293847561029384756abcdef99887766554433221100aabbccd',
    severity: 'Warning'
  },
  {
    id: 'aud_9808',
    operator: 'Elena Rostova (Senior Risk Analyst)',
    operatorRole: 'Risk Analyst',
    action: 'Merchant KYB Rejected',
    target: 'Shadow Capital FX Ltd (Fraud cluster detected)',
    timestamp: '2026-11-12 11:20:00 UTC',
    ip: '203.0.113.88 (EU-Zurich Ops)',
    hash: '0x12839401827364510293847561029384756abcdef1234567890abcdef123456',
    severity: 'Critical'
  }
];

export const AdminAuditPage: React.FC = () => {
  const [logs] = useState<AdminAuditEntry[]>(INITIAL_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Critical' | 'Warning' | 'Info'>('All');
  const [selectedLog, setSelectedLog] = useState<AdminAuditEntry | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [verifiedHash, setVerifiedHash] = useState<string | null>(null);

  const filteredLogs = logs.filter((item) => {
    const matchesSearch =
      item.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hash.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'All' || item.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleVerifyIntegrity = (item: AdminAuditEntry) => {
    setTimeout(() => {
      setVerifiedHash(item.id);
      setTimeout(() => setVerifiedHash(null), 3500);
    }, 400);
  };

  const exportAuditLog = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Timestamp,Operator,Role,Action,Target,Severity,IP,Hash']
        .concat(
          filteredLogs.map(
            (l) =>
              `"${l.id}","${l.timestamp}","${l.operator}","${l.operatorRole}","${l.action}","${l.target}","${l.severity}","${l.ip}","${l.hash}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `copym_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Cryptographic Integrity */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#14171A] via-[#1E293B] to-[#0F172A] text-white border border-gray-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-[#00C076] shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Cryptographic Immutable Audit Trail
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00C076] text-white">
                WORM Ledger
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Append-only event log with SHA-256 Merkle root verification. Enforced by hardware security modules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={exportAuditLog}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-semibold border border-white/20 transition-all select-none"
          >
            <Download className="w-3.5 h-3.5 text-[#00C076]" />
            <span>Export CSV</span>
          </button>
          <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs text-xs font-semibold text-emerald-300 border border-emerald-400/20 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#00C076]" />
            <span className="font-mono">Merkle Root #8941</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1 font-semibold uppercase tracking-wider">
            <span>Total Logged Events</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 font-sans">{logs.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">100% verified SHA-256 seal</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-red-100 shadow-2xs bg-red-50/20">
          <div className="flex items-center justify-between text-red-500 text-xs mb-1 font-semibold uppercase tracking-wider">
            <span>Critical Interventions</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600 font-sans">
            {logs.filter((l) => l.severity === 'Critical').length}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Requires dual-operator signoff</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1 font-semibold uppercase tracking-wider">
            <span>Active Operators</span>
            <Key className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 font-sans">4 Officers</div>
          <p className="text-[11px] text-gray-400 mt-1">Hardware YubiKey 5Ci enforced</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1 font-semibold uppercase tracking-wider">
            <span>Ledger Integrity</span>
            <ShieldCheck className="w-4 h-4 text-[#00C076]" />
          </div>
          <div className="text-2xl font-black text-[#00C076] font-sans">0 Tampering</div>
          <p className="text-[11px] text-gray-400 mt-1">Last verified 18s ago</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl sm:rounded-[26px] p-4 sm:p-6 shadow-xs border border-gray-100">
        {/* Filter and Search Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-5 border-b border-gray-100">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search operator, action, entity, or hash..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#EAEBEF] hover:bg-[#E4E6EA] focus:bg-white border border-transparent focus:border-[#00C076] rounded-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0 mr-1" />
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">Severity:</span>
            {(['All', 'Critical', 'Warning', 'Info'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 text-xs rounded-full font-semibold transition-all select-none ${
                  severityFilter === sev
                    ? 'bg-[#14171A] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="lg:hidden flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
          <span>↔ Swipe horizontally to inspect operator, target & hash</span>
          <span className="text-[#00C076] font-semibold text-[10.5px]">Touch scroll active</span>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs min-w-[1050px]">
            <thead className="bg-gray-50/70 text-gray-400 uppercase tracking-wider text-[11px] border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Timestamp (UTC)</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Operator</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Action / Event</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Target Entity</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Severity</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Cryptographic Hash</th>
                <th className="py-3.5 px-4 font-semibold text-right whitespace-nowrap">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredLogs.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap text-gray-500 font-mono text-[11.5px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.timestamp}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">{item.operator.split(' (')[0]}</div>
                    <div className="text-[11px] text-gray-500">{item.operatorRole} • {item.ip}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-800 whitespace-nowrap">
                    {item.action}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate" title={item.target}>
                    {item.target}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${
                        item.severity === 'Critical'
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : item.severity === 'Warning'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}
                    >
                      {item.severity === 'Critical' && <AlertTriangle className="w-3 h-3" />}
                      {item.severity === 'Warning' && <Info className="w-3 h-3" />}
                      {item.severity === 'Info' && <CheckCircle2 className="w-3 h-3" />}
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {item.hash.slice(0, 10)}...{item.hash.slice(-6)}
                      </span>
                      <button
                        onClick={() => handleCopyHash(item.hash)}
                        title="Copy SHA-256 Hash"
                        className="p-1 hover:text-gray-900 text-gray-400 rounded transition-colors"
                      >
                        {copiedHash === item.hash ? (
                          <Check className="w-3.5 h-3.5 text-[#00C076]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleVerifyIntegrity(item)}
                        className="px-2.5 py-1 text-[11px] rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center gap-1 font-semibold"
                      >
                        {verifiedHash === item.id ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-[#00C076]" />
                            <span className="text-[#00C076]">Valid Seal</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            <span>Verify</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setSelectedLog(item)}
                        className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-800 rounded-full transition-colors"
                        title="View Full Cryptographic Payload"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 text-gray-800 my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 sm:top-5 right-4 sm:right-5 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 sm:mb-5 pr-8">
              <span className="p-2 sm:p-2.5 rounded-2xl bg-emerald-50 text-[#00C076] border border-emerald-100 shrink-0">
                <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </span>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">Cryptographic Audit Entry</h3>
                <p className="text-[11px] sm:text-xs text-gray-400 font-mono truncate">Record ID: {selectedLog.id}</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <span className="text-gray-400 block mb-0.5 font-medium">Operator:</span>
                  <span className="font-bold text-gray-900 break-words">{selectedLog.operator}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5 font-medium">Role / Permission:</span>
                  <span className="font-semibold text-gray-800">{selectedLog.operatorRole}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5 font-medium">Timestamp (UTC):</span>
                  <span className="font-mono text-gray-700">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5 font-medium">Client IP & Gateway:</span>
                  <span className="font-mono text-gray-700">{selectedLog.ip}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 block mb-1 font-medium">Event Action & Target:</span>
                <div className="p-3 sm:p-3.5 bg-gray-50 rounded-2xl border border-gray-100 font-mono text-xs text-gray-800 space-y-1">
                  <div><strong className="text-blue-600">Action:</strong> {selectedLog.action}</div>
                  <div><strong className="text-gray-500">Target:</strong> {selectedLog.target}</div>
                </div>
              </div>

              <div>
                <span className="text-gray-400 block mb-1 font-medium">Immutable SHA-256 Digest:</span>
                <div className="p-3 sm:p-3.5 bg-gray-900 rounded-2xl border border-gray-800 font-mono text-[10.5px] sm:text-[11px] text-emerald-400 break-all flex items-center justify-between gap-2 shadow-inner">
                  <span>{selectedLog.hash}</span>
                  <button
                    onClick={() => handleCopyHash(selectedLog.hash)}
                    className="p-1 hover:text-white text-gray-400 shrink-0 cursor-pointer"
                  >
                    {copiedHash === selectedLog.hash ? (
                      <Check className="w-4 h-4 text-[#00C076]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00C076]" />
                  <span className="font-semibold text-[11px] sm:text-[11.5px]">WORM Hardware Enforced • Signer Hardware ID #YUBI-8842-109</span>
                </div>
                <span className="font-mono text-[10px] uppercase font-bold text-[#00C076] self-start sm:self-auto">Non-Repudiable</span>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-xl sm:rounded-full bg-gray-900 hover:bg-gray-800 text-white transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
