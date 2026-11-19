import { KybApplicationData, MerchantKybLifecycleStatus, KybDocumentItem } from '../types';

const STORAGE_KEY = 'copym_merchant_kyb_application';
const EVENT_NAME = 'copym_kyb_state_change';

const DEFAULT_DOCUMENTS: KybDocumentItem[] = [
  {
    id: 'doc_coi',
    type: 'COI',
    title: 'Certificate of Incorporation',
    description: 'Official corporate registration from commercial trade registry',
    required: true,
    fileName: 'Certificate_of_Incorporation_2026.pdf',
    fileSize: '1.8 MB',
    uploadDate: 'Nov 17, 2026',
    status: 'VERIFIED'
  },
  {
    id: 'doc_articles',
    type: 'ARTICLES',
    title: 'Articles of Association & Shareholder Register',
    description: 'Official register confirming ownership distribution and voting rights',
    required: true,
    fileName: 'Articles_and_Shareholder_Register.pdf',
    fileSize: '2.4 MB',
    uploadDate: 'Nov 17, 2026',
    status: 'VERIFIED'
  },
  {
    id: 'doc_poa',
    type: 'PROOF_OF_ADDRESS',
    title: 'Proof of Operating Address',
    description: 'Utility bill, lease agreement, or corporate bank statement (< 90 days)',
    required: true,
    fileName: 'Electric_Utility_Bill_Aug_2026.pdf',
    fileSize: '890 KB',
    uploadDate: 'Nov 17, 2026',
    status: 'REJECTED',
    rejectionReason: 'The proof of address uploaded was older than 90 days. Please upload a recent bank statement or utility bill issued within the last 90 days.'
  },
  {
    id: 'doc_passport',
    type: 'PASSPORT',
    title: 'Director & UBO Government Passports / IDs',
    description: 'Clear color photo page of valid international passport or national ID',
    required: true,
    fileName: 'Director_UBO_Passport_Elena_Rostova.pdf',
    fileSize: '3.1 MB',
    uploadDate: 'Nov 17, 2026',
    status: 'VERIFIED'
  },
  {
    id: 'doc_license',
    type: 'LICENSE',
    title: 'Financial / Broker / Gaming License',
    description: 'Optional regulatory certificate (FSA, FSC, CySEC, MFSA or equivalent)',
    required: false,
    fileName: 'FSC_Regulatory_Broker_License_SD044.pdf',
    fileSize: '1.2 MB',
    uploadDate: 'Nov 17, 2026',
    status: 'VERIFIED'
  }
];

export const INITIAL_KYB_DATA: KybApplicationData = {
  status: 'DRAFT',
  currentStep: 1,
  submittedAt: undefined,
  reviewedAt: undefined,
  complianceFeedback: undefined,
  company: {
    legalName: 'Apex Liquidity Services BVI Corp',
    registrationNumber: 'BVI-771920-REG',
    jurisdiction: 'British Virgin Islands (BVI FSC)',
    operatingAddress: 'Commerce House, Wickhams Cay 1, Road Town, Tortola VG1110',
    websiteUrl: 'https://apexliquidity.com'
  },
  profile: {
    industry: 'Forex Broker & Liquidity Provider',
    monthlyVolume: '$250,000 – $1,000,000 / month',
    targetJurisdictions: ['Southeast Asia', 'LATAM', 'EU / EEA', 'MENA'],
    averageTxSize: '$2,500.00 – $10,000.00 USDT'
  },
  directors: [
    {
      id: 'ubo_1',
      fullName: 'Elena Rostova',
      dateOfBirth: '1984-06-14',
      nationality: 'Cypriot / European Union',
      residentialCountry: 'Cyprus',
      ownershipPercentage: 65,
      isDirector: true,
      isUbo: true
    },
    {
      id: 'ubo_2',
      fullName: 'Marcus Vance',
      dateOfBirth: '1988-11-23',
      nationality: 'British',
      residentialCountry: 'United Kingdom',
      ownershipPercentage: 35,
      isDirector: true,
      isUbo: true
    }
  ],
  documents: DEFAULT_DOCUMENTS,
  sanctionsConfirmed: true,
  authorizedRepresentativeConfirmed: true
};

export function getKybApplication(): KybApplicationData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Default initial state: DRAFT
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_KYB_DATA));
      return INITIAL_KYB_DATA;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_KYB_DATA;
  }
}

export function saveKybDraft(updates: Partial<KybApplicationData>): KybApplicationData {
  const current = getKybApplication();
  const next: KybApplicationData = {
    ...current,
    ...updates,
    company: { ...current.company, ...(updates.company || {}) },
    profile: { ...current.profile, ...(updates.profile || {}) },
    directors: updates.directors || current.directors,
    documents: updates.documents || current.documents
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
  } catch (err) {
    console.warn('Failed to save KYB draft to localStorage', err);
  }

  return next;
}

export function submitKybApplication(updates?: Partial<KybApplicationData>): KybApplicationData {
  const current = getKybApplication();
  const next: KybApplicationData = {
    ...current,
    ...(updates || {}),
    status: 'UNDER_REVIEW',
    submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    currentStep: 5
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
  } catch (err) {
    console.warn('Failed to submit KYB application', err);
  }

  return next;
}

export function setKybStatus(status: MerchantKybLifecycleStatus, feedback?: string): KybApplicationData {
  const current = getKybApplication();
  const next: KybApplicationData = {
    ...current,
    status,
    complianceFeedback: feedback,
    reviewedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  // If approved, update documents to verified
  if (status === 'APPROVED') {
    next.documents = next.documents.map(d => ({ ...d, status: 'VERIFIED', rejectionReason: undefined }));
  }

  // If action required, ensure proof of address is flagged
  if (status === 'ACTION_REQUIRED') {
    next.complianceFeedback = feedback || 'The proof of address uploaded was older than 90 days. Please upload a recent bank statement or utility bill.';
    next.documents = next.documents.map(d =>
      d.type === 'PROOF_OF_ADDRESS'
        ? { ...d, status: 'REJECTED', rejectionReason: next.complianceFeedback }
        : d
    );
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
  } catch (err) {
    console.warn('Failed to set KYB status', err);
  }

  return next;
}

export function subscribeKybStatus(callback: (data: KybApplicationData) => void): () => void {
  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<KybApplicationData>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getKybApplication());
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        callback(JSON.parse(e.newValue));
      } catch {
        callback(getKybApplication());
      }
    }
  };

  window.addEventListener(EVENT_NAME, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}

export function getKybStatusLabel(status: MerchantKybLifecycleStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'Sandbox Mode (Verification Incomplete)';
    case 'UNDER_REVIEW':
      return 'In Compliance Review';
    case 'ACTION_REQUIRED':
      return 'Action Required';
    case 'APPROVED':
      return 'Corporate Verified';
    default:
      return status;
  }
}

export function getKybStatusColor(status: MerchantKybLifecycleStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'UNDER_REVIEW':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'ACTION_REQUIRED':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'APPROVED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

