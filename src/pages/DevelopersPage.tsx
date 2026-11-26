import React, { useState, useEffect } from 'react';
import { Play, Check, Copy, CheckCircle2, ChevronDown, X, RefreshCw, Lock } from 'lucide-react';
import { ApiKey, WebhookDelivery, Environment, KybApplicationData } from '../types';
import { getKybApplication, subscribeKybStatus } from '../utils/kybStorage';
import { IDS } from '../utils/sharedMockStore';
import { api } from '../services/api';

const INITIAL_KEYS: ApiKey[] = [
  {
    id: 'key_1',
    name: 'Treasury bridge',
    environment: 'LIVE',
    maskedKey: 'demo_live_••••N8V4',
    fullKey: 'demo_live_948f21e04a918bca48721N8V4',
    scopes: 'deposits, payouts',
    ipList: ['192.0.2.46', '192.0.2.47'],
    ipSub: null,
    lastUsedAgo: '8 min ago',
    lastUsedTime: 'Today, 14:12 UTC',
    status: 'active'
  },
  {
    id: 'key_2',
    name: 'Checkout lab',
    environment: 'SANDBOX',
    maskedKey: 'demo_test_••••R6K9',
    fullKey: 'demo_test_33a10b98e140f892a001R6K9',
    scopes: 'deposits, simulate',
    ipList: ['198.51.100.28'],
    ipSub: '1 allowed address',
    lastUsedAgo: '42 min ago',
    lastUsedTime: 'Today, 13:38 UTC',
    status: 'active'
  },
  {
    id: 'key_3',
    name: 'Ledger mirror',
    environment: 'SANDBOX',
    maskedKey: 'demo_test_••••W3l7',
    fullKey: 'demo_test_8f4c28a9b1c900e231d7W3l7',
    scopes: 'read',
    ipList: ['203.0.113.64/28'],
    ipSub: '1 allowed range',
    lastUsedAgo: 'Yesterday',
    lastUsedTime: '28 Oct, 17:05 UTC',
    status: 'active'
  }
];

const INITIAL_WEBHOOKS: WebhookDelivery[] = [
  {
    id: 'wh_1',
    http: 200,
    event: 'deposit.credited',
    deliveryId: 'dlv_demo_747',
    relatedRecord: 'dep_9zM2..R84',
    latency: '246 ms',
    time: '14:18 UTC',
    attempts: '1 attempt'
  },
  {
    id: 'wh_2',
    http: 200,
    event: 'deposit.exception_created',
    deliveryId: 'dlv_demo_744',
    relatedRecord: IDS.exceptions[0],
    latency: '318 ms',
    time: '14:15 UTC',
    attempts: '1 attempt'
  },
  {
    id: 'wh_3',
    http: 503,
    event: 'payout.approval_required',
    deliveryId: 'dlv_demo_740',
    relatedRecord: 'po_16D8..127',
    latency: '1,240 ms',
    time: '14:11 UTC',
    attempts: '2 attempts · retry 14:21',
    canRetry: true
  },
  {
    id: 'wh_4',
    http: 200,
    event: 'deposit.expired',
    deliveryId: 'dlv_demo_739',
    relatedRecord: 'dep_C4N7..U59',
    latency: '154 ms',
    time: '14:06 UTC',
    attempts: '1 attempt'
  },
  {
    id: 'wh_5',
    http: 200,
    event: 'payout.completed',
    deliveryId: 'dlv_demo_738',
    relatedRecord: 'po_37F9..E43',
    latency: '287 ms',
    time: '13:58 UTC',
    attempts: '1 attempt'
  },
  {
    id: 'wh_6',
    http: 200,
    event: 'deposit.confirming',
    deliveryId: 'dlv_demo_737',
    relatedRecord: 'dep_98K5..S16',
    latency: '203 ms',
    time: '13:54 UTC',
    attempts: '1 attempt'
  }
];

interface ScenarioDetail {
  label: string;
  requested: string;
  receipt: string;
  event: string;
  description: string;
}

const SCENARIOS: Record<string, ScenarioDetail> = {
    'underpaid': {
    label: 'Underpaid deposit - screening clear',
    requested: '320.00 USDC',
    receipt: '305.00 USDC • ERC-20',
    event: 'deposit.exception_created',
    description: 'Underpaid by 15.00 USDC. Placed into Exceptions.'
  },
  'full': {
    label: 'Full payment - instant credit',
    requested: '500.00 USDT',
    receipt: '500.00 USDT · TRON',
    event: 'deposit.credited',
    description: 'Full payment matched. Automatically credited to merchant vault.'
  },
  'overpaid': {
    label: 'Overpaid deposit - manual review',
    requested: '1,000.00 USDC',
    receipt: '1,050.00 USDC · ERC-20',
    event: 'deposit.exception_created',
    description: 'Overpaid by 50.00 USDC. Requires refund or manual credit.'
  },
  'late': {
    label: 'Late deposit - exception flagged',
    requested: '250.00 USDT',
    receipt: '250.00 USDT · TRON',
    event: 'deposit.exception_created',
    description: 'Received after 15-minute order window. Exception flagged.'
  },
  'high_risk': {
    label: 'High AML risk - KYC hold',
    requested: '8,000.00 USDT',
    receipt: '8,000.00 USDT · TRON',
    event: 'deposit.kyt_review',
    description: 'AML score 74. Placed under compliance hold.'
  }
};

export interface DevelopersPageProps {
  onOpenDocs?: () => void;
  openCreateKey?: boolean;
  setOpenCreateKey?: (open: boolean) => void;
  onOpenLiveGate?: (actionName?: string) => void;
}

export const DevelopersPage: React.FC<DevelopersPageProps> = ({ openCreateKey, setOpenCreateKey, onOpenLiveGate }) => {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [webhooks, setWebhooks] = useState<WebhookDelivery[]>(INITIAL_WEBHOOKS);
  const [webhookEndpoints, setWebhookEndpoints] = useState<Array<{ id?: string; url: string }>>([]);
  const [showAddWebhookModal, setShowAddWebhookModal] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('underpaid');
  const [depositSession, setDepositSession] = useState('dep_demo_1§9R8J392');

  // Hydrate API keys, webhook endpoints, and deliveries from backend when available
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res: any = await api.getApiKeys();
        const list = Array.isArray(res) ? res : res?.keys || res?.apiKeys || res?.data;
        if (active && Array.isArray(list) && list.length > 0) {
          setKeys(
            list.map((k: any, idx: number) => ({
              id: String(k.id || `key_${idx}`),
              name: k.name || k.label || `${k.environment || 'SANDBOX'} key`,
              environment: (String(k.environment || 'SANDBOX').toUpperCase() === 'LIVE' ? 'LIVE' : 'SANDBOX') as Environment,
              maskedKey: k.maskedKey || k.prefix || 'cpy_••••',
              fullKey: k.fullKey || k.key || k.maskedKey || 'cpy_••••',
              scopes: Array.isArray(k.scopes) ? k.scopes.join(', ') : k.scopes || 'deposits, payouts',
              ipList: Array.isArray(k.allowedIps) ? k.allowedIps : k.ipList || ['Any IP allowed'],
              ipSub: Array.isArray(k.allowedIps) && k.allowedIps.length > 0 ? `${k.allowedIps.length} allowed address` : null,
              lastUsedAgo: k.lastUsedAgo || 'Recently',
              lastUsedTime: k.lastUsedAt || k.createdAt || 'Active',
              status: k.status === 'revoked' ? 'revoked' : 'active',
            }))
          );
        }
      } catch {
        // Keep initial mock keys when backend is unavailable
      }

      try {
        const whRes: any = await api.getWebhooks();
        const endpoints = Array.isArray(whRes) ? whRes : whRes?.endpoints || whRes?.webhooks || whRes?.data;
        if (active && Array.isArray(endpoints)) {
          setWebhookEndpoints(endpoints.map((ep: any) => ({ id: ep.id, url: ep.url || ep.endpoint || '' })).filter((ep) => ep.url));
        }
      } catch {
        // Keep default empty endpoints list when backend is unavailable
      }

      try {
        const dlvRes: any = await api.getWebhookDeliveries();
        const deliveries = Array.isArray(dlvRes) ? dlvRes : dlvRes?.deliveries || dlvRes?.data;
        if (active && Array.isArray(deliveries) && deliveries.length > 0) {
          setWebhooks(
            deliveries.map((d: any, idx: number) => ({
              id: String(d.id || `wh_${idx}`),
              http: Number(d.httpStatus || d.statusCode || d.http || 200),
              event: d.event || d.eventType || 'deposit.credited',
              deliveryId: d.deliveryId || d.id || `dlv_${idx}`,
              relatedRecord: d.relatedRecord || d.resourceId || '—',
              latency: d.latencyMs ? `${d.latencyMs} ms` : d.latency || '180 ms',
              time: d.createdAt || d.time || 'Just now',
              attempts: d.attempts ? `${d.attempts} attempt(s)` : '1 attempt',
              canRetry: Number(d.httpStatus || d.statusCode || d.http || 200) >= 400,
            }))
          );
        }
      } catch {
        // Keep initial mock deliveries when backend is unavailable
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // KYB Compliance Subscription for Live Keys Gate
  const [kybApp, setKybApp] = useState<KybApplicationData>(getKybApplication());
  useEffect(() => {
    const unsub = subscribeKybStatus(setKybApp);
    return unsub;
  }, []);

  // Simulation State
  const [simulatingStep, setSimulatingStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Modals & Feedback
  const [internalCreateKey, setInternalCreateKey] = useState(false);
  const showCreateKeyModal = openCreateKey !== undefined ? openCreateKey : internalCreateKey;
  const setShowCreateKeyModal = setOpenCreateKey !== undefined ? setOpenCreateKey : setInternalCreateKey;
  const [showSendTestEventModal, setShowSendTestEventModal] = useState(false);
  const [revokeModalKey, setRevokeModalKey] = useState<ApiKey | null>(null);
  const [revoke2Fa, setRevoke2Fa] = useState('');
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Form State for Creating Key
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<Environment>('LIVE');
  const [newKeyScopes, setNewKeyScopes] = useState('deposits, payouts');
  const [newKeyIp, setNewKeyIp] = useState('192.0.2.100');

  // Form State for Webhook Test Event
  const [testEventName, setTestEventName] = useState('deposit.credited');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyKey = (e: React.MouseEvent, keyString: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(keyString);
    setCopiedKeyId(id);
    showToast('API Key copied to clipboard!');
    setTimeout(() => setCopiedKeyId(null), 1800);
  };

  const handleRotateKey = (keyItem: ApiKey) => {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = keyItem.environment === 'LIVE' ? 'demo_live_' : 'demo_test_';
    setKeys(prev => prev.map(k => k.id === keyItem.id ? {
      ...k,
      maskedKey: `${prefix}••••${randomSuffix}`,
      fullKey: `${prefix}${Math.random().toString(36).substring(2, 14)}${randomSuffix}`,
      lastUsedAgo: 'Just now',
      lastUsedTime: 'Today, ' + new Date().toISOString().substring(11, 16) + ' UTC'
    } : k));
    showToast(`Key "${keyItem.name}" rotated successfully!`);
  };

  const handleRevokeKey = async (keyItem: ApiKey) => {
    if (!/^\d{6}$/.test(revoke2Fa.trim())) {
      setRevokeError('Enter a valid 6-digit 2FA code.');
      return;
    }
    try {
      await api.revokeApiKey(keyItem.id);
    } catch {
      // Fall back to local state update when backend is unavailable
    }
    setKeys(prev => prev.filter(k => k.id !== keyItem.id));
    setRevokeModalKey(null);
    setRevoke2Fa('');
    setRevokeError(null);
    showToast(`Key "${keyItem.name}" has been revoked.`);
  };

  const handleCreateKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    // Progressive Unlock Gate Check
    if (newKeyEnv === 'LIVE' && kybApp.status !== 'APPROVED') {
      setShowCreateKeyModal(false);
      if (onOpenLiveGate) {
        onOpenLiveGate('Production API Keys (Live)');
      } else {
        showToast('Corporate KYB verification required to generate Live Production API keys.');
      }
      return;
    }

    const scopesList = newKeyScopes.split(',').map((s) => s.trim()).filter(Boolean);
    const allowedIpsList = newKeyIp.trim() ? [newKeyIp.trim()] : [];
    let backendKey: any = null;
    try {
      backendKey = await api.createApiKey({
        environment: newKeyEnv,
        scopes: scopesList,
        allowedIps: allowedIpsList,
      });
    } catch {
      // Fall back to local mock key when backend is unavailable
    }

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = newKeyEnv === 'LIVE' ? 'demo_live_' : 'demo_test_';
    const createdKeyObj = backendKey?.apiKey || backendKey?.key || backendKey;

    const newKey: ApiKey = {
      id: String(createdKeyObj?.id || 'key_' + Date.now()),
      name: newKeyName.trim(),
      environment: newKeyEnv,
      maskedKey: createdKeyObj?.maskedKey || `${prefix}••••${randomSuffix}`,
      fullKey: createdKeyObj?.fullKey || createdKeyObj?.secret || `${prefix}${Math.random().toString(36).substring(2, 14)}${randomSuffix}`,
      scopes: newKeyScopes,
      ipList: allowedIpsList.length > 0 ? allowedIpsList : ['Any IP allowed'],
      ipSub: newKeyIp ? '1 allowed address' : null,
      lastUsedAgo: 'Never',
      lastUsedTime: 'Created just now',
      status: 'active'
    };

    setKeys(prev => [newKey, ...prev]);
    setShowCreateKeyModal(false);
    setNewKeyName('');
    showToast(`New key "${newKey.name}" created!`);
  };

  const handleRetryWebhook = (whItem: WebhookDelivery) => {
    setWebhooks(prev => prev.map(w => w.id === whItem.id ? {
      ...w,
      http: 200,
      latency: '215 ms',
      attempts: '3 attempts · success',
      canRetry: false
    } : w));
    showToast(`Webhook ${whItem.deliveryId} re-dispatched with 200 OK!`);
  };

  const handleSendTestEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let pingResult: any = null;
    try {
      pingResult = await api.testPingWebhook();
    } catch {
      // Fall back to local simulated delivery when backend is unavailable
    }
    const deliveryNum = Math.floor(750 + Math.random() * 50);
    const newDelivery: WebhookDelivery = {
      id: String(pingResult?.id || 'wh_' + Date.now()),
      http: Number(pingResult?.httpStatus || 200),
      event: testEventName,
      deliveryId: pingResult?.deliveryId || `dlv_demo_${deliveryNum}`,
      relatedRecord: `dep_sim_${Math.random().toString(36).substring(2, 5)}..${Math.random().toString(36).substring(2, 5)}`,
      latency: pingResult?.latencyMs ? `${pingResult.latencyMs} ms` : `${Math.floor(120 + Math.random() * 180)} ms`,
      time: new Date().toISOString().substring(11, 16) + ' UTC',
      attempts: '1 attempt'
    };
    setWebhooks(prev => [newDelivery, ...prev]);
    setShowSendTestEventModal(false);
    showToast(`Test event "${testEventName}" delivered!`);
  };

  const handleCreateWebhookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = newWebhookUrl.trim();
    if (!url) return;
    try {
      const created: any = await api.createWebhook({ url, subscriptions: ['deposit.credited', 'payout.completed'] });
      setWebhookEndpoints((prev) => [{ id: created?.id, url: created?.url || url }, ...prev]);
      showToast('Webhook endpoint registered.');
    } catch {
      setWebhookEndpoints((prev) => [{ url }, ...prev]);
      showToast('Webhook endpoint saved locally.');
    }
    setNewWebhookUrl('');
    setShowAddWebhookModal(false);
  };

  const handleRotateWebhookSecret = async () => {
    try {
      await api.rotateWebhookSecret();
      showToast('Webhook signing secret rotated.');
    } catch {
      showToast('Webhook signing secret rotation queued (demo).');
    }
  };

  // Run Deposit Simulation Animation
  const handleRunSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulatingStep(1);

    setTimeout(() => {
      setSimulatingStep(2);
      setTimeout(() => {
        setSimulatingStep(3);
        setTimeout(() => {
          setSimulatingStep(4);
          setTimeout(() => {
            setSimulatingStep(5);
            setIsSimulating(false);

            const curr = SCENARIOS[selectedScenarioKey];
            const deliveryNum = Math.floor(750 + Math.random() * 50);
            const generatedEvent: WebhookDelivery = {
              id: 'wh_' + Date.now(),
              http: 200,
              event: curr.event,
              deliveryId: `dlv_demo_${deliveryNum}`,
              relatedRecord: depositSession.replace('dep_demo_', 'dep_'),
              latency: '188 ms',
              time: new Date().toISOString().substring(11, 16) + ' UTC',
              attempts: '1 attempt'
            };
            setWebhooks(prev => [generatedEvent, ...prev]);
            showToast(`Simulation completed! Event ${curr.event} dispatched.`);
          }, 600);
        }, 600);
      }, 600);
    }, 600);
  };

  const currentScenario = SCENARIOS[selectedScenarioKey] || SCENARIOS.underpaid;

  return (
    <div className="w-full flex flex-col space-y-4 animate-fadeIn">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-fadeIn border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#007F4E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="md:hidden space-y-2">
        {keys.map((k) => (
          <div key={k.id} className="table-mobile-card w-full text-left">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-bold text-[#14171A] text-[13px] break-words">{k.name}</div>
                <span className="inline-block mt-1 px-2 py-0.5 bg-[#ECEEF2] text-gray-700 font-semibold text-xs rounded-full tracking-wide">
                  {k.environment === 'LIVE' ? 'Live' : 'Sandbox'}
                </span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5 font-mono text-[12px] text-gray-800 min-w-0">
              <span className="truncate">{k.maskedKey}</span>
              <button
                onClick={(e) => handleCopyKey(e, k.fullKey, k.id)}
                title="Copy Key"
                className="text-gray-300 hover:text-gray-600 transition shrink-0"
              >
                {copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-[#007F4E]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="mt-2 text-xs text-[#4B5563] break-words">Scopes: {k.scopes}</div>
            <div className="mt-1 text-xs text-gray-800">
              <div className="font-medium text-[#6B7280]">IP allowlist</div>
              {k.ipList.map((ip, idx) => (
                <div key={idx} className="font-mono break-all leading-tight">{ip}</div>
              ))}
              {k.ipSub && <div className="text-[#6B7280] mt-0.5">{k.ipSub}</div>}
            </div>
            <div className="mt-2 text-xs">
              <div className="font-medium text-[#14171A]">{k.lastUsedAgo}</div>
              <div className="text-[#6B7280]">{k.lastUsedTime}</div>
            </div>
            <div className="mt-2 flex items-center justify-end gap-1.5 border-t border-gray-100 pt-2">
              <button
                onClick={() => handleRotateKey(k)}
                className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-xs font-semibold transition shadow-2xs select-none"
              >
                Rotate
              </button>
              <button
                onClick={() => { setRevokeModalKey(k); setRevoke2Fa(''); setRevokeError(null); }}
                className="px-3 py-1 bg-white hover:bg-red-50 border border-gray-200 text-gray-700 hover:text-red-600 rounded-full text-xs font-semibold transition shadow-2xs select-none cursor-pointer"
              >
                Revoke
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* TOP SECTION: API Keys Table */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="hidden md:block table-scroll">
          <table className="w-full text-left border-collapse min-w-[780px]">
            {/* Dark Sleek Header Bar */}
            <thead>
              <tr className="table-header-row select-none">
                <th className="py-2.5 px-4 sm:px-5 rounded-tl-2xl">NAME / ENVIRONMENT</th>
                <th className="py-2.5 px-3">KEY ID - MASKED</th>
                <th className="py-2.5 px-3">SCOPES</th>
                <th className="py-2.5 px-3">IP ALLOWLIST</th>
                <th className="py-2.5 px-3">LAST USED</th>
                <th className="table-action-header py-2.5 px-4 sm:px-5 text-center rounded-tr-2xl">ACTIONS</th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-gray-100/90 text-[12px]">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-[#F9FAFB] transition-colors group">
                  {/* Name / Environment */}
                  <td className="py-3 px-4 sm:px-5">
                    <div className="font-bold text-[#14171A] text-[13px]">{k.name}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-[#ECEEF2] text-gray-700 font-semibold text-xs rounded-full tracking-wide">
                      {k.environment === 'LIVE' ? 'Live' : 'Sandbox'}
                    </span>
                  </td>

                  {/* Key ID - Masked */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 font-mono text-[12px] text-gray-800">
                      <span>{k.maskedKey}</span>
                      <button
                        onClick={(e) => handleCopyKey(e, k.fullKey, k.id)}
                        title="Copy Key"
                        className="text-gray-300 hover:text-gray-600 transition"
                      >
                        {copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-[#007F4E]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>

                  {/* Scopes */}
                  <td className="py-3 px-3 text-[#4B5563] text-[12px]">
                    {k.scopes}
                  </td>

                  {/* IP Allowlist */}
                  <td className="py-3 px-3">
                    {k.ipList.map((ip, idx) => (
                      <div key={idx} className="font-mono text-xs text-gray-800 leading-tight">
                        {ip}
                      </div>
                    ))}
                    {k.ipSub && (
                      <div className="text-xs text-[#6B7280] mt-0.5">
                        {k.ipSub}
                      </div>
                    )}
                  </td>

                  {/* Last Used */}
                  <td className="py-3 px-3">
                    <div className="font-medium text-[#14171A] text-[12px]">{k.lastUsedAgo}</div>
                    <div className="text-xs text-[#6B7280] leading-tight mt-0.5">{k.lastUsedTime}</div>
                  </td>

                  {/* Actions: Rotate & Revoke */}
                  <td className="py-3 px-4 sm:px-5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleRotateKey(k)}
                        className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-xs font-semibold transition shadow-2xs select-none"
                      >
                        Rotate
                      </button>
                      <button
                        onClick={() => { setRevokeModalKey(k); setRevoke2Fa(''); setRevokeError(null); }}
                        className="px-3 py-1 bg-white hover:bg-red-50 border border-gray-200 text-gray-700 hover:text-red-600 rounded-full text-xs font-semibold transition shadow-2xs select-none cursor-pointer"
                      >
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTTOM SECTION: Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Webhook Deliveries (7 cols on large desktop) */}
        <div className="lg:col-span-7 flex flex-col space-y-2.5">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div>
              <h3 className="text-[17px] font-bold text-[#14171A] tracking-tight">
                Webhook deliveries
              </h3>
              {webhookEndpoints.length > 0 && (
                <p className="text-xs text-[#6B7280] font-mono truncate max-w-[300px]">
                  Endpoint: {webhookEndpoints[0].url}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowAddWebhookModal(true)}
                className="px-3 py-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-xs font-semibold transition select-none"
              >
                Add endpoint
              </button>
              <button
                type="button"
                onClick={handleRotateWebhookSecret}
                className="px-3 py-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-xs font-semibold transition select-none"
              >
                Rotate secret
              </button>
              <button
                onClick={() => setShowSendTestEventModal(true)}
                className="px-3.5 py-1 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-full text-xs font-semibold shadow-xs transition select-none flex items-center gap-1"
              >
                <span>Send test event</span>
              </button>
            </div>
          </div>

          <div className="md:hidden space-y-2">
            {webhooks.map((wh) => (
              <div key={wh.id} className="table-mobile-card w-full text-left">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-[#14171A] text-[12px] break-all">{wh.event}</div>
                    <div className="font-mono text-xs text-[#6B7280] break-all">{wh.deliveryId}</div>
                  </div>
                  <span className={`shrink-0 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${
                    wh.http === 200
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-50 text-red-600 border border-red-200'
                  }`}>
                    {wh.http}
                  </span>
                </div>
                <div className="mt-2 font-mono text-xs text-gray-700 break-all">{wh.relatedRecord}</div>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <div className="text-xs text-gray-800 font-medium">{wh.latency} · {wh.time}</div>
                    <div className="text-xs text-[#6B7280]">{wh.attempts}</div>
                  </div>
                  {wh.canRetry && (
                    <button
                      onClick={() => handleRetryWebhook(wh)}
                      className="px-2.5 py-1 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-full text-xs font-bold transition shadow-2xs whitespace-nowrap"
                    >
                      Retry now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Webhook Deliveries Table */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="hidden md:block table-scroll">
              <table className="w-full text-left border-collapse min-w-[500px]">
                {/* Dark Header */}
                <thead>
                  <tr className="table-header-row select-none">
                    <th className="py-2 px-3 sm:px-4 rounded-tl-2xl">HTTP</th>
                    <th className="py-2 px-3">EVENT / DELIVERY ID</th>
                    <th className="py-2 px-3">RELATED RECORD</th>
                    <th className="py-2 px-4 rounded-tr-2xl text-right">LATENCY / ATTEMPTS</th>
                  </tr>
                </thead>

                {/* Body */}
                <tbody className="divide-y divide-gray-100/90 text-xs">
                  {webhooks.map((wh) => (
                    <tr key={wh.id} className="hover:bg-[#F9FAFB] transition-colors">
                      {/* HTTP Status Badge */}
                      <td className="py-2.5 px-3 sm:px-4">
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          wh.http === 200
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-50 text-red-600 border border-red-200'
                        }`}>
                          {wh.http}
                        </span>
                      </td>

                      {/* Event / Delivery ID */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[#14171A] text-[12px]">{wh.event}</div>
                        <div className="font-mono text-xs text-[#6B7280] leading-tight">{wh.deliveryId}</div>
                      </td>

                      {/* Related Record */}
                      <td className="py-2.5 px-3 font-mono text-xs text-gray-700">
                        {wh.relatedRecord}
                      </td>

                      {/* Latency / Attempts + Retry Action */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div>
                            <div className="text-xs text-gray-800 font-medium">{wh.latency} · {wh.time}</div>
                            <div className="text-xs text-[#6B7280]">{wh.attempts}</div>
                          </div>
                          {wh.canRetry && (
                            <button
                              onClick={() => handleRetryWebhook(wh)}
                              className="px-2.5 py-1 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-full text-xs font-bold transition shadow-2xs whitespace-nowrap"
                            >
                              Retry now
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Deposit Simulator (5 cols on large desktop) */}
        <div className="lg:col-span-5 flex flex-col space-y-2.5">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-full">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-[16px] font-bold text-[#14171A]">Deposit simulator</h3>
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="px-3.5 py-1.5 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-full text-xs font-semibold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50 select-none"
                >
                  {isSimulating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-white" />
                  )}
                  <span>{isSimulating ? 'Simulating...' : 'Run simulation'}</span>
                </button>
              </div>

              {/* Form Inputs */}
              <div className="pt-3 space-y-3 text-xs">
                {/* Deposit session */}
                <div>
                  <label className="text-xs text-[#6B7280] font-semibold block mb-1">Deposit session</label>
                  <input
                    type="text"
                    value={depositSession}
                    onChange={(e) => setDepositSession(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-xl font-mono text-xs text-gray-800 focus:outline-none focus:border-[#007F4E]"
                  />
                </div>

                {/* Scenario Dropdown */}
                <div>
                  <label className="text-xs text-[#6B7280] font-semibold block mb-1">Scenario</label>
                  <div className="relative">
                    <select
                      value={selectedScenarioKey}
                      onChange={(e) => setSelectedScenarioKey(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 font-medium appearance-none pr-8 focus:outline-none focus:border-[#007F4E]"
                    >
                      {Object.entries(SCENARIOS).map(([key, s]) => (
                        <option key={key} value={key}>{s.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Black Receipt Box */}
                <div className="bg-[#0C0D10] text-white p-3.5 rounded-xl flex items-center justify-between border border-[#23262D]">
                  <div>
                    <span className="text-xs tracking-wider uppercase font-semibold text-[#6B7280] block">
                      REQUESTED
                    </span>
                    <span className="text-[13px] font-bold text-white mt-0.5 block">
                      {currentScenario.requested}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs tracking-wider uppercase font-semibold text-[#6B7280] block">
                      SIMULATED RECEIPT
                    </span>
                    <span className="text-[13px] font-bold text-white mt-0.5 block">
                      {currentScenario.receipt}
                    </span>
                  </div>
                </div>

                {/* SIMULATED PROCESSING PATH (4 Steps) */}
                <div className="pt-1">
                  <span className="text-xs tracking-wider uppercase font-semibold text-[#6B7280] block mb-2">
                    SIMULATED PROCESSING PATH
                  </span>
                  <div className="space-y-2">
                    {/* Step 1: Confirmation */}
                    <div className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                        simulatingStep >= 1 ? 'bg-emerald-100 text-[#007F4E]' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {simulatingStep >= 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      <div className="text-xs leading-tight">
                        <span className="font-bold text-gray-900 block">Confirmation</span>
                        <span className="text-xs text-[#6B7280]">Apply the network confirmation rule.</span>
                      </div>
                    </div>

                    {/* Step 2: Screening */}
                    <div className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                        simulatingStep >= 2 ? 'bg-emerald-100 text-[#007F4E]' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {simulatingStep >= 3 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      <div className="text-xs leading-tight">
                        <span className="font-bold text-gray-900 block">Screening</span>
                        <span className="text-xs text-[#6B7280]">Evaluate the demo compliance result.</span>
                      </div>
                    </div>

                    {/* Step 3: Crediting */}
                    <div className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                        simulatingStep >= 3 ? 'bg-emerald-100 text-[#007F4E]' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {simulatingStep >= 4 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      <div className="text-xs leading-tight">
                        <span className="font-bold text-gray-900 block">Crediting</span>
                        <span className="text-xs text-[#6B7280]">Update the sandbox balance if eligible.</span>
                      </div>
                    </div>

                    {/* Step 4: Webhooks */}
                    <div className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                        simulatingStep >= 4 ? 'bg-emerald-100 text-[#007F4E]' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {simulatingStep >= 5 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      <div className="text-xs leading-tight">
                        <span className="font-bold text-gray-900 block">Webhooks</span>
                        <span className="text-xs text-[#6B7280]">Deliver the matching event to your endpoint.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Key Modal */}
      {showCreateKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Create new API Key</h3>
              <button onClick={() => setShowCreateKeyModal(false)} className="text-gray-500 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateKeySubmit} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="text-xs font-semibold text-gray-800 block mb-1">Key Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Checkout Gateway"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#007F4E]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-800 block mb-1">Environment</label>
                <select
                  value={newKeyEnv}
                  onChange={(e) => setNewKeyEnv(e.target.value as Environment)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#007F4E]"
                >
                  <option value="SANDBOX">Sandbox (test environment)</option>
                  <option value="LIVE">
                    {kybApp.status === 'APPROVED' ? 'Live (production)' : 'Live (requires KYB)'}
                  </option>
                </select>
                {newKeyEnv === 'LIVE' && kybApp.status !== 'APPROVED' && (
                  <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Live keys are protected. Submitting will open the Corporate KYB verification gate.</span>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-800 block mb-1">Scopes</label>
                <select
                  value={newKeyScopes}
                  onChange={(e) => setNewKeyScopes(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#007F4E]"
                >
                  <option value="deposits, payouts">deposits, payouts (Full Access)</option>
                  <option value="deposits, simulate">deposits, simulate</option>
                  <option value="read">read only</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-800 block mb-1">IP Allowlist (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 192.0.2.46"
                  value={newKeyIp}
                  onChange={(e) => setNewKeyIp(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-gray-900 focus:outline-none focus:border-[#007F4E]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateKeyModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-xl font-semibold shadow-xs"
                >
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Test Event Modal */}
      {showSendTestEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-5 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Dispatch Test Webhook</h3>
              <button onClick={() => setShowSendTestEventModal(false)} className="text-gray-500 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSendTestEventSubmit} className="py-3 space-y-3 text-xs">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Event Type</label>
                <select
                  value={testEventName}
                  onChange={(e) => setTestEventName(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                >
                  <option value="deposit.credited">deposit.credited</option>
                  <option value="deposit.exception_created">deposit.exception_created</option>
                  <option value="payout.completed">payout.completed</option>
                  <option value="deposit.confirming">deposit.confirming</option>
                  <option value="deposit.expired">deposit.expired</option>
                </select>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl text-xs text-gray-500">
                Dispatches a signed HMAC-SHA256 test payload to your webhook destination endpoint.
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSendTestEventModal(false)}
                  className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-xl font-semibold shadow-xs"
                >
                  Send Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke API Key Confirmation Modal */}
      {revokeModalKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Revoke API key?</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Are you sure you want to revoke <strong className="text-gray-800">{revokeModalKey.name}</strong> ({revokeModalKey.maskedKey})?
            </p>
            <div className="my-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs leading-tight">
              <strong>Warning:</strong> Any integrations using this key will stop working immediately.
            </div>
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-700 block mb-1">2FA code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={revoke2Fa}
                onChange={(e) => setRevoke2Fa(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit 2FA code"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-gray-900 focus:outline-none focus:border-[#007F4E]"
              />
              {revokeError && <p className="text-xs text-red-600 mt-1">{revokeError}</p>}
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => { setRevokeModalKey(null); setRevoke2Fa(''); setRevokeError(null); }}
                className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRevokeKey(revokeModalKey)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
              >
                Confirm revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Webhook Endpoint Modal */}
      {showAddWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Add Webhook Endpoint</h3>
              <button
                type="button"
                onClick={() => setShowAddWebhookModal(false)}
                className="text-gray-500 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateWebhookSubmit} className="py-3 space-y-3 text-xs">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Endpoint URL</label>
                <input
                  type="url"
                  required
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  placeholder="https://api.example.com/webhooks/copym"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-gray-900 focus:outline-none focus:border-[#007F4E]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWebhookModal(false)}
                  className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-xl font-semibold shadow-xs"
                >
                  Save Endpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
