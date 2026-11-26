export const MERCHANT = {
  id: 'mer_01',
  name: 'Apex Forex',
  legalName: 'Apex Liquidity Services Ltd',
  domain: 'apexforex.example.com',
  owner: 'Daniel Reed (Merchant Owner)',
  signedInUser: 'Nora Vale'
} as const;

export const PLATFORM = {
  domain: 'copym.example',
  superAdmin: 'Platform Operator AM (SuperAdmin)',
  maker: 'Platform Maker PL',
  checker: 'Platform Checker KI',
  reviewer: 'Platform Reviewer RS',
  auditOperator: 'Platform Operator AM'
} as const;

export const IDS = {
  exceptions: ['EXC-8491', 'EXC-8492', 'EXC-8493', 'EXC-8494', 'EXC-8495', 'EXC-8496'] as const,
  payouts: { primary: 'PAY-7NK9', secondary: 'PAY-3LX8' } as const,
  deposits: ['DEP-4102', 'DEP-4103', 'DEP-4104', 'DEP-4105', 'DEP-4106', 'DEP-4107', 'DEP-4108', 'DEP-4109'] as const,
  kyb: 'KYB-4412'
} as const;

export type RiskLevel = 'Low' | 'Medium' | 'Critical';

export interface PayoutRisk {
  score: number;
  level: RiskLevel;
  label: string;
}

const PAYOUT_RISK: Record<string, PayoutRisk> = {
  [IDS.payouts.primary]: { score: 78, level: 'Critical', label: 'Screening passed · 2FA verified' },
  [IDS.payouts.secondary]: { score: 8, level: 'Low', label: 'Screening passed · 2FA verified' }
};

export function getPayoutRisk(reference?: string): PayoutRisk {
  const normalized = (reference || '').toUpperCase();
  const match = Object.entries(PAYOUT_RISK).find(([ref]) => normalized.includes(ref));
  return match ? match[1] : { score: 8, level: 'Low', label: 'Screening passed · 2FA verified' };
}

export function normalizeReference(reference?: string): string {
  const value = reference || '';
  if (/pay_7nk9/i.test(value)) return IDS.payouts.primary;
  if (/pay_3lx8/i.test(value)) return IDS.payouts.secondary;
  if (/exc_8491/i.test(value)) return IDS.exceptions[0];
  if (/exc_8492/i.test(value)) return IDS.exceptions[1];
  if (/exc_8493/i.test(value)) return IDS.exceptions[2];
  if (/exc_8494/i.test(value)) return IDS.exceptions[3];
  if (/exc_8495/i.test(value)) return IDS.exceptions[4];
  if (/exc_8496/i.test(value)) return IDS.exceptions[5];
  return value;
}

export function toDepositRef(reference?: string, index = 0): string {
  const normalized = normalizeReference(reference);
  if (normalized.toUpperCase().startsWith('DEP-')) return normalized;
  return IDS.deposits[index % IDS.deposits.length] || `DEP-${String(index + 1).padStart(4, '0')}`;
}

export function toPayoutRef(reference?: string, index = 0): string {
  const normalized = normalizeReference(reference);
  if (normalized.toUpperCase().startsWith('PAY-')) return normalized;
  return `PAY-${String(index + 1).padStart(4, '0')}`;
}

export const RESERVE_POLICY = {
  targetColdPercent: 95,
  targetHotPercent: 5,
  tolerancePercent: 0.5,
  coldUsd: 27859500,
  hotUsd: 2140500
} as const;

export function getReserveState() {
  const total = RESERVE_POLICY.coldUsd + RESERVE_POLICY.hotUsd;
  const coldPercent = (RESERVE_POLICY.coldUsd / total) * 100;
  const hotPercent = (RESERVE_POLICY.hotUsd / total) * 100;
  const withinPolicy = Math.abs(hotPercent - RESERVE_POLICY.targetHotPercent) <= RESERVE_POLICY.tolerancePercent;
  return {
    total,
    coldPercent: Number(coldPercent.toFixed(1)),
    hotPercent: Number(hotPercent.toFixed(1)),
    coldUsd: RESERVE_POLICY.coldUsd,
    hotUsd: RESERVE_POLICY.hotUsd,
    withinPolicy
  };
}

export function formatUsd(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function createStoredState<T>(key: string, initialValue: T, eventName: string) {
  const read = (): T => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        localStorage.setItem(key, JSON.stringify(initialValue));
        return initialValue;
      }
      return JSON.parse(raw) as T;
    } catch {
      return initialValue;
    }
  };

  const write = (value: T): T => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent<T>(eventName, { detail: value }));
    } catch (error) {
      console.warn(`Failed to persist ${key}`, error);
    }
    return value;
  };

  const subscribe = (callback: (value: T) => void): (() => void) => {
    const handleCustom = (event: Event) => {
      const detail = (event as CustomEvent<T>).detail;
      callback(detail || read());
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key || !event.newValue) return;
      try {
        callback(JSON.parse(event.newValue) as T);
      } catch {
        callback(read());
      }
    };
    window.addEventListener(eventName, handleCustom);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(eventName, handleCustom);
      window.removeEventListener('storage', handleStorage);
    };
  };

  return { read, write, subscribe };
}
