// Global Types & Interfaces for CopyM Pay Dashboard

export type TabId =
  | 'dashboard'
  | 'deposits'
  | 'exceptions'
  | 'payouts'
  | 'customers'
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

export type TransactionType = 'Deposit' | 'Payout' | 'Swap';

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
  flow?: string;
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
  flow: 'HPP' | 'H2H' | 'Open' | 'Fixed' | string;
  expected: string;
  received: string;
  numericReceived: number;
  status: string;
  created: string;
  mode?: 'HPP' | 'H2H';
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

export type AddressStatus = 'Active' | 'Cooling Period' | 'Pending Approval';

export interface AllowlistedAddress {
  id: string;
  customerId: string;
  beneficiaryName: string;
  category: 'Vendor Settlement' | 'First-Party Deposit' | 'OTC Liquidity Pool' | 'Affiliate Commission';
  network: string;
  address: string;
  fullAddress: string;
  status: AddressStatus;
  coolingRemainingHours?: number;
  coolingEndsAt?: string;
  addedBy: string;
  createdAt: string;
  totalPaidOut: string;
}

// ==========================================
// Platform Admin Operations Types & Models
// ==========================================

export type PortalMode = 'merchant' | 'admin';

export type AdminTabId =
  | 'admin-overview'
  | 'admin-merchants'
  | 'admin-whitelist'
  | 'admin-exceptions'
  | 'admin-payouts'
  | 'admin-logs'
  | 'admin-audit';

export type IssueCategory =
  | 'Webhook Delivery'
  | 'API Integration'
  | 'Rate Limiting'
  | 'Settlement Exception'
  | 'KYC/AML Trigger';

export type IssueSeverity = 'Critical' | 'Warning' | 'Info' | 'Resolved';

export interface MerchantIssueLog {
  id: string;
  merchantId: string;
  merchantName: string;
  category: IssueCategory;
  httpStatus?: number;
  errorCode: string;
  title: string;
  description: string;
  endpointUrl?: string;
  affectedCustomerOrTx?: string;
  timestamp: string;
  severity: IssueSeverity;
  retryCount?: number;
  status: 'Open' | 'Investigating' | 'Resolved' | 'Retrying';
  requestPayload?: string;
  responsePayload?: string;
  latencyMs?: number;
}

export type WhitelistApprovalStatus =
  | 'Active'
  | 'Cooling Period'
  | 'Pending Review'
  | 'Frozen'
  | 'Revoked';

export interface AdminWhitelistedAddress {
  id: string;
  merchantId: string;
  merchantName: string;
  beneficiaryName: string;
  category: 'First-Party Deposit' | 'Vendor Settlement' | 'OTC Liquidity Pool' | 'Affiliate Commission';
  network: string;
  address: string;
  fullAddress: string;
  status: WhitelistApprovalStatus;
  coolingRemainingHours?: number;
  coolingEndsAt?: string;
  addedBy: string;
  addedIp: string;
  createdAt: string;
  totalPaidOut: string;
  kytRiskScore: number;
  kytRiskLevel: 'Clean' | 'Low' | 'Medium' | 'Critical';
  sanctionScreenStatus: 'Passed' | 'Flagged' | 'Under Review';
}

export interface MerchantKYBRecord {
  id: string;
  businessName: string;
  legalEntity: string;
  jurisdiction: string;
  registrationNo: string;
  directorName: string;
  kybStatus: 'Approved' | 'Under Review' | 'Action Required' | 'Rejected';
  riskTier: 'Tier 1 (High Limits)' | 'Tier 2 (Standard)' | 'Tier 3 (Restricted)';
  dailyLimit: string;
  currentDailyVolume: string;
  appliedDate: string;
  amlScore: number;
  documents: { name: string; type: string; verified: boolean }[];
  whitelistedAssets?: string[];
  rejectionReason?: string;
}

// ==========================================
// Progressive Unlock Merchant KYB Lifecycle
// ==========================================

export type MerchantKybLifecycleStatus =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'ACTION_REQUIRED'
  | 'APPROVED';

export interface KybCompanyEntity {
  legalName: string;
  registrationNumber: string;
  jurisdiction: string;
  operatingAddress: string;
  websiteUrl: string;
}

export interface KybBusinessProfile {
  industry: string;
  monthlyVolume: string;
  targetJurisdictions: string[];
  averageTxSize: string;
}

export interface KybDirectorUbo {
  id: string;
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  residentialCountry: string;
  ownershipPercentage: number;
  isDirector: boolean;
  isUbo: boolean;
}

export interface KybDocumentItem {
  id: string;
  type: 'COI' | 'ARTICLES' | 'PROOF_OF_ADDRESS' | 'PASSPORT' | 'LICENSE';
  title: string;
  description: string;
  required: boolean;
  fileName?: string;
  fileSize?: string;
  uploadDate?: string;
  status: 'PENDING' | 'UPLOADED' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
}

export interface KybApplicationData {
  status: MerchantKybLifecycleStatus;
  currentStep: number;
  submittedAt?: string;
  reviewedAt?: string;
  complianceFeedback?: string;
  company: KybCompanyEntity;
  profile: KybBusinessProfile;
  directors: KybDirectorUbo[];
  documents: KybDocumentItem[];
  sanctionsConfirmed: boolean;
  authorizedRepresentativeConfirmed: boolean;
}

export interface AMLRiskAlert {
  id: string;
  txHash: string;
  fullTxHash: string;
  network: string;
  amount: string;
  riskScore: number;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  flagReason: string;
  merchant: string;
  client: string;
  time: string;
  status: 'Pending Action' | 'Frozen' | 'Approved Override' | 'Reported';
}

export interface AdminAuditEntry {
  id: string;
  operator: string;
  operatorRole: string;
  action: string;
  target: string;
  timestamp: string;
  ip: string;
  hash: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

export type AdminPayoutStatus =
  | 'Pending Checker'
  | 'Compliance Hold'
  | 'MPC Co-Signing'
  | 'Broadcasting'
  | 'Completed'
  | 'Rejected';

export interface AdminPayoutItem {
  id: string;
  payoutRef: string;
  merchantName: string;
  merchantId: string;
  makerName: string;
  makerRole: string;
  checkerName?: string;
  amount: string;
  numericAmount: number;
  network: string;
  destinationAddress: string;
  fullAddress: string;
  destinationType: string;
  kytRiskScore: number;
  kytRiskLevel: 'Clean' | 'Low' | 'Medium' | 'Critical';
  mpcStatus: '0/2 Signed' | '1/2 Signed' | '2/2 Quorum Met';
  status: AdminPayoutStatus;
  holdReason?: string;
  createdAt: string;
}
