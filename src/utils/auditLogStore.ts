import { AdminAuditEntry } from '../types';

const AUDIT_STORAGE_KEY = 'copym_admin_audit_logs';

export const DEFAULT_AUDIT_LOGS: AdminAuditEntry[] = [
  {
    id: 'aud_9801',
    operator: 'Sarah Chen (Platform SuperAdmin)',
    operatorRole: 'SuperAdmin',
    action: 'Hot-to-Cold Vault Sweep Executed',
    target: 'Vault Pool #03 (1,250,000 USDT -> Multi-Sig Cold)',
    timestamp: '2026-11-24 17:42:10 UTC',
    ip: '198.51.100.44 (SG-GovNet)',
    hash: '0x8f4c2e71d3a958b10e4a77cb2103f56e9cba3210459812dfaa910c23948bf8a1',
    severity: 'Critical',
  },
  {
    id: 'aud_9802',
    operator: 'Marcus Vance (Compliance Lead)',
    operatorRole: 'Compliance Lead',
    action: 'SAR Filed & Address frozen',
    target: 'cust_84019 / tx_94f82810a9bC5109 (OFAC Mixer)',
    timestamp: '2026-11-24 17:28:44 UTC',
    ip: '198.51.100.12 (SG-GovNet)',
    hash: '0x3a91b2c45e89df00142837bcde209481aa520934ec765103498bfe1928374a56',
    severity: 'Critical',
  },
  {
    id: 'aud_9803',
    operator: 'Elena Rostova (Senior Risk Analyst)',
    operatorRole: 'Risk Analyst',
    action: 'Merchant KYB Adjudication Approved',
    target: 'Quantex Asset Management AG (Tier 1 Upgrade)',
    timestamp: '2026-11-24 16:55:02 UTC',
    ip: '203.0.113.88 (EU-Zurich Ops)',
    hash: '0x55b1e90a44f387c6530182fe9104cbde44890312fa8901235678bcda09182736',
    severity: 'Info',
  },
  {
    id: 'aud_9804',
    operator: 'Marcus Vance (Compliance Lead)',
    operatorRole: 'Compliance Lead',
    action: 'Daily Volume Limit Modified',
    target: 'Apex Forex Global ($1,000,000 -> $2,500,000)',
    timestamp: '2026-11-24 16:10:19 UTC',
    ip: '198.51.100.12 (SG-GovNet)',
    hash: '0x992381fbcda01827463510293847561029384756abcdef102938475610293847',
    severity: 'Warning',
  },
  {
    id: 'aud_9805',
    operator: 'David Zhang (Treasury Checker)',
    operatorRole: 'Checker',
    action: 'Maker-Checker High Value Payout Dual-Authorized',
    target: 'Batch #PO-9844 ($750,000 USDC -> Enterprise MPC Custody)',
    timestamp: '2026-11-24 15:40:33 UTC',
    ip: '198.51.100.19 (SG-GovNet)',
    hash: '0x4102938475610293847561029384756abcdef9876543210fedcba9876543210f',
    severity: 'Critical',
  },
  {
    id: 'aud_9806',
    operator: 'Sarah Chen (Platform SuperAdmin)',
    operatorRole: 'SuperAdmin',
    action: 'Payment Exception Resolved (Manual Credit)',
    target: 'exc_8491_late (2,500 USDT -> Eagle Vision Market)',
    timestamp: '2026-11-24 14:15:22 UTC',
    ip: '198.51.100.44 (SG-GovNet)',
    hash: '0x6291038475610293847561029384756abcdef0918273645fe98102394857610a',
    severity: 'Info',
  },
  {
    id: 'aud_9807',
    operator: 'System Daemon (Automated KYT Monitor)',
    operatorRole: 'Automated Agent',
    action: 'High Risk KYT Flag Triggered',
    target: '0x94f8..11e2 (Score: 92/100, Tornado Cash hop)',
    timestamp: '2026-11-24 13:02:11 UTC',
    ip: '127.0.0.1 (Internal Cluster)',
    hash: '0x7182938475610293847561029384756abcdef99887766554433221100aabbccd',
    severity: 'Warning',
  },
];

export function getAuditLogs(): AdminAuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_AUDIT_LOGS;
}

export function appendAuditEvent(params: {
  action: string;
  target: string;
  reasonCode: string;
  note: string;
  severity?: 'Critical' | 'Warning' | 'Info';
  operator?: string;
  operatorRole?: string;
}): AdminAuditEntry {
  const existing = getAuditLogs();
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const randHex = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  const entry: AdminAuditEntry = {
    id: `aud_${Date.now().toString().slice(-6)}`,
    operator: params.operator || 'Sarah Chen (Platform SuperAdmin)',
    operatorRole: params.operatorRole || 'SuperAdmin',
    action: `${params.action} [${params.reasonCode}]`,
    target: `${params.target} — Note: ${params.note}`,
    timestamp,
    ip: '198.51.100.44 (SG-GovNet)',
    hash: `0x${randHex}`,
    severity: params.severity || 'Warning',
  };

  const updated = [entry, ...existing];
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('copym_audit_updated', { detail: updated }));
  } catch {
    // ignore
  }
  return entry;
}
