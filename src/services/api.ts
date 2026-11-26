// src/services/api.ts (in your new frontend repo)
// Helper to read cookies for CSRF token
function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${name}=`;
  for (const part of String(document.cookie || '').split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }
  return null;
}

interface RequestOptions extends RequestInit {
  preferAdminToken?: boolean;
}

async function request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = path.startsWith('/v1') ? path : `/v1${path}`;
  const isAdminRequest =
    path.startsWith('/platform') ||
    path.startsWith('/v1/platform') ||
    Boolean(options.preferAdminToken);
  const csrf = isAdminRequest
    ? readCookie('copymp_admin_csrf') || readCookie('copymp_csrf')
    : readCookie('copymp_csrf');
  const { preferAdminToken, headers: customHeaders, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(isAdminRequest ? { 'X-Session-Context': 'admin' } : {}),
    ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
    ...((customHeaders as Record<string, string>) || {}),
  };
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include', // Essential: transmits HttpOnly session cookies
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg =
      data?.error?.message || data?.message || `Request failed with status ${response.status}`;
    const err: any = new Error(errorMsg);
    err.status = response.status;
    err.code = data?.error?.code;
    err.details = data?.error?.details;
    throw err;
  }
  return data as T;
}

export const api = {
  // ==========================================
  // 1. AUTHENTICATION & SESSION
  // ==========================================
  login: (payload: { email: string; password?: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload: {
    email: string;
    password?: string;
    display_name?: string;
    business_name?: string;
    businessName?: string;
    name?: string;
  }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  changePassword: (payload: any) =>
    request('/auth/change-password', { method: 'POST', body: JSON.stringify(payload) }),

  // ==========================================
  // 2. MERCHANT PROFILE & KYB
  // ==========================================
  getMerchant: () => request('/merchant'),
  completeKyb: () => request('/merchant/kyb/complete', { method: 'POST' }),
  getBalances: () => request('/balances'),

  // ==========================================
  // 3. DEPOSITS & CASHIER ORDERS
  // ==========================================
  getDeposits: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders${query ? `?${query}` : ''}`);
  },
  getOrders: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders${query ? `?${query}` : ''}`);
  },
  getOrder: (id: string) => request(`/orders/${id}`),
  createOrder: (payload: {
    amount: string;
    currency: string;
    merchant_order_id?: string;
    mode?: 'HPP' | 'H2H_DIRECT';
    network?: string;
    description?: string;
    payer_id?: string;
  }) => {
    const merchantOrderId =
      payload.merchant_order_id ||
      `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return request('/orders', {
      method: 'POST',
      headers: {
        'Idempotency-Key': merchantOrderId,
      },
      body: JSON.stringify({
        ...payload,
        merchant_order_id: merchantOrderId,
      }),
    });
  },
  simulateOrderPayment: (
    orderId: string,
    payload: { amount?: string; confirmations?: number; tx_hash?: string; source_address?: string } = {}
  ) =>
    request(`/orders/${orderId}/simulate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  selectOrderNetwork: (orderId: string, payload: { network: string }) =>
    request(`/orders/${orderId}/select-network`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // ==========================================
  // 4. PAYOUTS
  // ==========================================
  getPayouts: () => request('/console/payouts'),
  createPayout: (payload: {
    amount: string;
    currency?: string;
    destination_address: string;
    network?: string;
    merchant_order_id?: string;
    description?: string;
    payer_id?: string;
  }) => {
    const ref = payload.merchant_order_id || `pout_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return request('/console/payouts', {
      method: 'POST',
      headers: {
        'Idempotency-Key': ref,
      },
      body: JSON.stringify({
        ...payload,
        merchant_order_id: ref,
      }),
    });
  },
  approvePayout: (id: string) =>
    request(`/console/payouts/${id}/approve`, {
      method: 'POST',
    }),
  rejectPayout: (id: string) =>
    request(`/console/payouts/${id}/reject`, {
      method: 'POST',
    }),
  cancelPayout: (id: string) =>
    request(`/console/payouts/${id}/cancel`, {
      method: 'POST',
    }),
  createBatchPayout: (payload: any) =>
    request('/console/payouts/batch', {
      method: 'POST',
      headers: {
        'Idempotency-Key': `payout_batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      },
      body: JSON.stringify(payload),
    }),

  // ==========================================
  // 5. DEVELOPERS (API KEYS & WEBHOOKS)
  // ==========================================
  getApiKeys: () => request('/console/api-keys'),
  createApiKey: (payload: { environment: 'SANDBOX' | 'LIVE'; scopes?: string[]; allowedIps?: string[] }) =>
    request('/console/api-keys', { method: 'POST', body: JSON.stringify(payload) }),
  revokeApiKey: (id: string) => request(`/console/api-keys/${id}/revoke`, { method: 'POST' }),
  getWebhooks: () => request('/webhooks/endpoints'),
  createWebhook: (payload: { url: string; subscriptions?: string[] }) =>
    request('/webhooks/endpoints', { method: 'POST', body: JSON.stringify(payload) }),
  testPingWebhook: () => request('/webhooks/deliveries/test-ping', { method: 'POST' }),
  getWebhookDeliveries: () => request('/webhooks/deliveries'),
  rotateWebhookSecret: () => request('/webhooks/rotate-secret', { method: 'POST' }),

  // ==========================================
  // 6. ADDRESS BOOK / END CUSTOMERS
  // ==========================================
  getCustomerBalances: () => request('/customers/balances'),
  allowlistDestination: (
    externalCustomerId: string,
    payload: { address: string; network: string }
  ) =>
    request(`/end-customers/${externalCustomerId}/allowlisted-destinations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // ==========================================
  // 6. PLATFORM ADMIN PORTAL (/ops or /admin)
  // ==========================================
  adminLogin: (payload: any) =>
    request('/platform/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      preferAdminToken: true,
    }),
  adminLogout: () => request('/platform/auth/logout', { method: 'POST', preferAdminToken: true }),
  getAdminMerchants: () => request('/platform/merchants', { preferAdminToken: true }),
  setKybDecision: (merchantId: string, payload: { decision: string; reason?: string }) =>
    request(`/platform/merchants/${merchantId}/kyb-decision`, {
      method: 'POST',
      body: JSON.stringify(payload),
      preferAdminToken: true,
    }),
  getExceptions: () => request('/platform/exceptions', { preferAdminToken: true }),
  resolveException: (id: string, payload: any) =>
    request(`/platform/exceptions/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(payload),
      preferAdminToken: true,
    }),
  getAuditEvents: () => request('/platform/audit-events', { preferAdminToken: true }),
};
