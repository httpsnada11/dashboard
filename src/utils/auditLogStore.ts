import { AdminAuditEntry } from '../types';
import { createStoredState, IDS, MERCHANT, PLATFORM } from './sharedMockStore';

const auditStore = createStoredState<AdminAuditEntry[]>(
  'copym_admin_audit_logs',
  [],
  'copym_audit_updated'
);

export const DEFAULT_AUDIT_LOGS: AdminAuditEntry[] = [
  {
    id: 'aud_9801',
    operator: PLATFORM.superAdmin,
    operatorRole: 'SuperAdmin',
    action: 'Hot-to-Cold Vault Sweep Executed',
    target: 'Vault Pool #03 (1,250,000 USDT -> Multi-Sig Cold)',
    timestamp: '2026-11-26 10:42:10 UTC',
    ip: '198.51.100.44 (SG-Ops)',
    hash: '0x7c1e9a4f82b06d35e7a91c4d8f2b6039ae51d7c40b98f3a26e5d1c8b9047f2a6',
    severity: 'Critical',
  },
  {
    id: 'aud_9802',
    operator: PLATFORM.reviewer,
    operatorRole: 'Compliance Lead',
    action: 'SAR Filed & Address frozen',
    target: 'cust_84019 / tx_94f8..11e2 (Sanctioned mixer cluster)',
    timestamp: '2026-11-26 10:28:44 UTC',
    ip: '198.51.100.12 (SG-Ops)',
    hash: '0x3d92b7c05fa184e6a9c24fd718be5036c0a7f9d28e41b635a8d0c7f19b4e6a25',
    severity: 'Critical',
  },
  {
    id: 'aud_9803',
    operator: PLATFORM.checker,
    operatorRole: 'Risk Analyst',
    action: 'Merchant KYB Adjudication Approved',
    target: 'Meridian Clearing Corp (Tier 1 Upgrade)',
    timestamp: '2026-11-26 09:55:02 UTC',
    ip: '203.0.113.88 (EU-Ops)',
    hash: '0xa61f0d93c7b482e15d0af7396b28c41e5d90f7a3b64c1e028f9d5a7c13be6048',
    severity: 'Info',
  },
  {
    id: 'aud_9804',
    operator: PLATFORM.reviewer,
    operatorRole: 'Compliance Lead',
    action: 'Daily Volume Limit Modified',
    target: `${MERCHANT.name} ($150,000 -> $250,000)`,
    timestamp: '2026-11-26 09:10:19 UTC',
    ip: '198.51.100.12 (SG-Ops)',
    hash: '0xb48e31a709f6dc25813ae7b490fc265d8e0173a9c64bfde52108c7a3f9e64b12',
    severity: 'Warning',
  },
  {
    id: 'aud_9805',
    operator: PLATFORM.checker,
    operatorRole: 'Checker',
    action: 'Maker-Checker High Value Payout Dual-Authorized',
    target: 'Batch #PO-9844 ($750,000 USDC -> Cold Consolidation)',
    timestamp: '2026-11-26 08:40:33 UTC',
    ip: '198.51.100.19 (SG-Ops)',
    hash: '0x14eac7093b8fd5261a0e7c934fd8b26a5071e9c3b84ad6f02c5e971a8d40b3f6',
    severity: 'Critical',
  },
  {
    id: 'aud_9806',
    operator: PLATFORM.superAdmin,
    operatorRole: 'SuperAdmin',
    action: 'Payment Exception Resolved (Manual Credit)',
    target: `${IDS.exceptions[0]} (2,500 USDT -> ${MERCHANT.name})`,
    timestamp: '2026-11-26 07:15:22 UTC',
    ip: '198.51.100.44 (SG-Ops)',
    hash: '0x9f02c7b45ae18d3690c27fb8e14a53d60b7c9f2a481de035a6c8b7190f4d2e83',
    severity: 'Info',
  },
  {
    id: 'aud_9807',
    operator: 'Automated KYT Monitor (System)',
    operatorRole: 'Automated Agent',
    action: 'High Risk KYT Flag Triggered',
    target: '0x94f8..11e2 (Score: 92/100, Sanctioned mixer hop)',
    timestamp: '2026-11-26 06:02:11 UTC',
    ip: '127.0.0.1 (Internal Monitor)',
    hash: '0x2b7ad4e0819c3f65a2d0be9471c58e36f0a9d724b8c1ef350a64d98f7e2b510c',
    severity: 'Warning',
  },
];

export function getAuditLogs(): AdminAuditEntry[] {
  const stored = auditStore.read();
  return stored.length > 0 ? stored : DEFAULT_AUDIT_LOGS;
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
    operator: params.operator || PLATFORM.superAdmin,
    operatorRole: params.operatorRole || 'SuperAdmin',
    action: `${params.action} [${params.reasonCode}]`,
    target: `${params.target} — Note: ${params.note}`,
    timestamp,
    ip: '198.51.100.44 (SG-Ops)',
    hash: `0x${randHex}`,
    severity: params.severity || 'Warning',
  };

  auditStore.write([entry, ...existing]);
  return entry;
}
