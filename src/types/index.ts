// Global Types & Interfaces for CopyM Pay Dashboard

export type TabId =
  | 'dashboard'
  | 'deposits'
  | 'exceptions'
  | 'payouts'
  | 'balances'
  | 'convert'
  | 'statements'
  | 'developers'
  | 'team-security'
  | 'settings';

export interface PageMeta {
  title: string;
  category: string;
}

export type TransactionType = 'Deposit' | 'Payout';

export interface Transaction {
  id: string;
  type: TransactionType;
  reference: string;
  fullRef: string;
  customer: string;
  network: string;
  amount: string;
  numericAmount: number;
  status: string;
  time: string;
}

export interface PayoutRecord {
  id: string;
  ref: string;
  fullRef: string;
  amount: string;
  numericAmount: number;
  network: string;
  customer: string;
  destinationType: string;
  destinationAddress: string;
  fullAddress: string;
  requestedBy: string;
  complianceText: string;
  status: 'Needs approval' | 'In flight' | 'Completed' | 'Failed' | 'Declined';
  createdAt: string;
}

export type DepositState = 'Created' | 'Detected' | 'Confirming' | 'Credited';

export interface DepositRecord {
  id: string;
  depositId: string;
  refId: string;
  customer: string;
  assetChain: string;
  flow: 'Open' | 'Fixed';
  expected: string;
  received: string;
  numericReceived: number;
  status: string;
  created: string;
}

export interface ExceptionRecord {
  id: string;
  excId: string;
  fullExcId: string;
  crmRef: string;
  customer: string;
  reasonTitle: string;
  reasonSub: string;
  receivedDate: string;
  receivedTime: string;
  amount: string;
  network: string;
  status: string;
  actionType: string;
}

export type Environment = 'LIVE - DEMO' | 'SANDBOX';

export interface ApiKey {
  id: string;
  name: string;
  environment: Environment;
  maskedKey: string;
  fullKey: string;
  scopes: string;
  ipList: string[];
  ipSub: string | null;
  lastUsedAgo: string;
  lastUsedTime: string;
  status: 'active' | 'revoked';
}

export interface WebhookDelivery {
  id: string;
  http: number;
  event: string;
  deliveryId: string;
  relatedRecord: string;
  latency: string;
  time: string;
  attempts: string;
  canRetry?: boolean;
}

export interface SimulationScenario {
  label: string;
  requested: string;
  receipt: string;
  event: string;
  description: string;
}

export type MemberRole =
  | 'Owner'
  | 'Payout creator'
  | 'Payout approver'
  | 'Finance viewer'
  | 'Operations analyst';

export interface TeamMember {
  id: string;
  name: string;
  isYou: boolean;
  email: string;
  role: string;
  roleDescription: string;
  status: 'Active' | 'Invited' | 'Suspended';
  twoFactor: string;
  lastAccessDate: string;
  lastAccessSub: string;
}

export interface ActiveSession {
  id: string;
  name: string;
  device: string;
  time: string;
  ip: string;
  isCurrent: boolean;
}

export interface AuditLogItem {
  id: string;
  time: string;
  title: string;
  subtext: string;
  statusBadge: string;
  category: string;
}

export interface RoleDefinition {
  role: string;
  description: string;
  permissions: string;
}
