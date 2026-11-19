import { useState, useEffect } from 'react';
import { Upload, BookOpen, Play } from 'lucide-react';

// Reusable Layout & UI Components
import {
  Navbar,
  Sidebar,
  PageHeader,
  DeveloperModal,
  DepositModal,
  PayoutModal,
  SwapModal,
  SecurityModal,
  TransactionModal,
  KybBanner,
  KybOnboardingWizard,
  LiveModeGate
} from './components';

// Dedicated Page Views
import {
  DashboardPage,
  DepositsPage,
  ExceptionsPage,
  PayoutsPage,
  CustomersPage,
  DevelopersPage,
  TeamSecurityPage,
  SettingsPage,
  SectionView,
  AuthPage,
  HostedCheckoutPage,
  AdminOverviewPage,
  AdminMerchantsPage,
  AdminWhitelistPage,
  AdminExceptionsPage,
  AdminPayoutsPage,
  AdminLogsPage,
  AdminAuditPage
} from './pages';

import { Transaction, PayoutRecord, PortalMode, AdminTabId, MerchantKybLifecycleStatus } from './types';
import { getKybApplication, subscribeKybStatus } from './utils/kybStorage';

// Uniform Page Metadata matching the exact screenshot structure
const PAGE_META: Record<string, { title: string; category: string }> = {
  // Merchant Portal Routes
  dashboard: { title: 'Dashboard', category: 'Overview' },
  deposits: { title: 'Deposits', category: 'Money In' },
  exceptions: { title: 'Exceptions', category: 'Money In' },
  payouts: { title: 'Payouts', category: 'Money Out' },
  customers: { title: 'Address book', category: 'Money Out' },
  balances: { title: 'Balances', category: 'Treasury' },
  convert: { title: 'Convert', category: 'Treasury' },
  statements: { title: 'Statements', category: 'Treasury' },
  developers: { title: 'Developers', category: 'Build' },
  'team-security': { title: 'Team & security', category: 'Account' },
  settings: { title: 'Settings', category: 'Account' },
  // Platform Admin Portal Routes
  'admin-overview': { title: 'AML & KYT Attention Queue', category: 'Platform Operations' },
  'admin-merchants': { title: 'Merchant KYB Adjudication', category: 'Platform Compliance' },
  'admin-whitelist': { title: 'Address Whitelist Hub', category: 'Platform Treasury' },
  'admin-exceptions': { title: 'Payment Exceptions & Cold Vault Sweeps', category: 'Treasury Operations' },
  'admin-payouts': { title: 'Maker-Checker Approvals Queue', category: 'Platform Treasury' },
  'admin-logs': { title: 'Merchant Issue & Error Logs', category: 'Security & Governance' },
  'admin-audit': { title: 'Immutable Audit Trail', category: 'Security & Governance' },
};

// Initial distinct payout dataset
const INITIAL_PAYOUTS: PayoutRecord[] = [
  {
    id: 'pay_1',
    ref: 'pay_3LX8..C51',
    fullRef: 'pay_3LX891280a9bC51',
    amount: '8,750.00',
    numericAmount: 8750,
    network: 'USDC · ERC-20',
    customer: 'cust_29371',
    destinationType: 'DESTINATION · FIRST-PARTY DEPOSIT',
    destinationAddress: '0x4d8A..91eC',
    fullAddress: '0x4d8A00912cb84910ef123491eC',
    requestedBy: 'Owen Shah',
    complianceText: 'KYC verified · sanctions clear',
    status: 'Needs approval',
    createdAt: '28 Oct 2026, 14:20'
  },
  {
    id: 'pay_2',
    ref: 'pay_7NK9..B14',
    fullRef: 'pay_7NK988201fa1B14',
    amount: '14,200.00',
    numericAmount: 14200,
    network: 'USDT · TRON',
    customer: 'cust_84019',
    destinationType: 'DESTINATION · VENDOR SETTLEMENT',
    destinationAddress: 'TYK9A..8v2L',
    fullAddress: 'TYK9A3XmUqZ9z8VnLw7h4Jb1k8Pq5D2gXy',
    requestedBy: 'Elena Rostova',
    complianceText: 'AML risk score: 08 (Low) · TRM verified',
    status: 'Needs approval',
    createdAt: '28 Oct 2026, 13:45'
  },
  {
    id: 'pay_3',
    ref: 'pay_9VR2..E88',
    fullRef: 'pay_9VR244012bc0E88',
    amount: '3,850.00',
    numericAmount: 3850,
    network: 'USDT · ERC-20',
    customer: 'cust_15492',
    destinationType: 'DESTINATION · OTC LIQUIDITY POOL',
    destinationAddress: '0x91F2..3cA8',
    fullAddress: '0x91F20901abcf8912c7713cA8',
    requestedBy: 'Marcus Vance',
    complianceText: 'Biometric 2FA confirmed · Chainalysis clean',
    status: 'Needs approval',
    createdAt: '28 Oct 2026, 12:50'
  },
  {
    id: 'pay_4',
    ref: 'pay_4TM1..K09',
    fullRef: 'pay_4TM1557288aaK09',
    amount: '22,400.00',
    numericAmount: 22400,
    network: 'USDC · SOLANA',
    customer: 'cust_99214',
    destinationType: 'DESTINATION · TREASURY CONSOLIDATION',
    destinationAddress: '7XqP..2vNp',
    fullAddress: '7XqP110293847aa1928374bb2vNp',
    requestedBy: 'Sarah Chen',
    complianceText: 'Whitelisted cold multi-sig wallet',
    status: 'Completed',
    createdAt: '28 Oct 2026, 11:15'
  },
  {
    id: 'pay_5',
    ref: 'pay_2WP8..M33',
    fullRef: 'pay_2WP800293118M33',
    amount: '5,100.00',
    numericAmount: 5100,
    network: 'USDT · TRON',
    customer: 'cust_47219',
    destinationType: 'DESTINATION · AFFILIATE COMMISSION',
    destinationAddress: 'TR7N..8b1A',
    fullAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    requestedBy: 'David Zhang',
    complianceText: 'Under threshold ($10k) auto-approved',
    status: 'In flight',
    createdAt: '28 Oct 2026, 09:30'
  }
];

// Initial distinct deposit/activity dataset
const INITIAL_ACTIVITIES: Transaction[] = [
  {
    id: 'tx_1',
    type: 'Deposit',
    reference: 'dep_8Hq2..f31',
    fullRef: 'dep_8Hq288192001f31',
    customer: 'cust_92104',
    network: 'USDT · TRON',
    amount: '+ 2,500.00',
    numericAmount: 2500,
    status: 'Credited',
    time: '2 min ago'
  },
  {
    id: 'tx_2',
    type: 'Deposit',
    reference: 'dep_3Nk4..a19',
    fullRef: 'dep_3Nk477102938a19',
    customer: 'cust_44812',
    network: 'USDT · TRON',
    amount: '+ 1,200.00',
    numericAmount: 1200,
    status: 'Confirming (14/19)',
    time: '9 min ago'
  },
  {
    id: 'tx_3',
    type: 'Deposit',
    reference: 'dep_1Pp7..b82',
    fullRef: 'dep_1Pp755910234b82',
    customer: 'cust_77192',
    network: 'USDT · TRON',
    amount: '+ 5,000.00',
    numericAmount: 5000,
    status: 'Credited',
    time: '18 min ago'
  },
  {
    id: 'tx_4',
    type: 'Deposit',
    reference: 'dep_8Hp9..co2',
    fullRef: 'dep_8Hp900384112co2',
    customer: 'cust_30017',
    network: 'USDC · ERC-20',
    amount: '+ 950.00',
    numericAmount: 950,
    status: 'Exception: late',
    time: '31 min ago'
  },
  {
    id: 'tx_5',
    type: 'Payout',
    reference: 'po_5k5..1e4',
    fullRef: 'po_5k50921477aa1e4',
    customer: 'cust_11872',
    network: 'USDT · TRON',
    amount: '- 1,000.00',
    numericAmount: -1000,
    status: 'Completed',
    time: '48 min ago'
  }
];

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('copym_auth_session') === 'true';
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState<{ name: string; email: string }>(() => {
    try {
      const savedName = localStorage.getItem('copym_merchant_name');
      const savedEmail = localStorage.getItem('copym_merchant_email');
      if (savedName) {
        return { name: savedName, email: savedEmail || 'merchant@gmail.com' };
      }
    } catch {
      // ignore
    }
    return { name: 'Daniel Vance', email: 'daniel@gmail.com' };
  });

  // Portal Mode: 'merchant' (Port 3000 / root / /merchant) or 'admin' (Port 3001 / /admin)
  const [portalMode, setPortalMode] = useState<PortalMode>(() => {
    try {
      // 1. Port-based detection: 3001 is dedicated Admin, 3000 is Merchant
      if (window.location.port === '3001' || import.meta.env.MODE === 'admin') {
        return 'admin';
      }
      if (window.location.port === '3000') {
        return 'merchant';
      }
      // 2. Strict URL Path-based detection (Takes absolute precedence over localStorage)
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/admin') || path.includes('/ops-7x9k')) {
        return 'admin';
      }
      if (path.startsWith('/merchant')) {
        return 'merchant';
      }
    } catch {
      // ignore
    }
    return 'merchant';
  });

  // Admin Portal Tab
  const [adminTab, setAdminTab] = useState<AdminTabId>(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/merchants')) return 'admin-merchants';
      if (path.includes('/whitelist')) return 'admin-whitelist';
      if (path.includes('/exceptions')) return 'admin-exceptions';
      if (path.includes('/payouts')) return 'admin-payouts';
      if (path.includes('/logs')) return 'admin-logs';
      if (path.includes('/audit')) return 'admin-audit';
      if (path.includes('/overview')) return 'admin-overview';
    } catch {
      // ignore
    }
    return 'admin-overview';
  });

  const handleSuccessLogin = (merchantInfo?: { name: string; email: string }) => {
    const defaultUser =
      portalMode === 'admin'
        ? { name: 'Sarah Chen (Platform SuperAdmin)', email: 'admin@copym.com' }
        : { name: 'Daniel Vance', email: 'merchant@gmail.com' };
    const user = merchantInfo || defaultUser;
    setCurrentUser(user);
    try {
      localStorage.setItem('copym_auth_session', 'true');
      localStorage.setItem('copym_merchant_name', user.name);
      localStorage.setItem('copym_merchant_email', user.email);
    } catch {
      // ignore storage errors
    }
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('copym_auth_session');
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
  };

  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      const cleanPath = path.replace(/^\/merchant\/?/, '');
      const validTabs = [
        'dashboard',
        'deposits',
        'exceptions',
        'payouts',
        'customers',
        'balances',
        'convert',
        'statements',
        'developers',
        'team-security',
        'settings'
      ];
      for (const tab of validTabs) {
        if (cleanPath.startsWith(tab) || cleanPath === tab) {
          return tab;
        }
      }
    } catch {
      // ignore
    }
    return 'dashboard';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activities, setActivities] = useState<Transaction[]>(INITIAL_ACTIVITIES);
  const [payouts, setPayouts] = useState<PayoutRecord[]>(INITIAL_PAYOUTS);
  const [balance, setBalance] = useState<number>(56768);
  const [usdtBalance, setUsdtBalance] = useState<number>(56768.98);

  // Responsive Mobile Navigation State
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Loading & Simulation States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveSimulating, setIsLiveSimulating] = useState(false);

  // Modals
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [isCreateKeyOpen, setIsCreateKeyOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isRolesOpen, setIsRolesOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositModalInitial, setDepositModalInitial] = useState<Partial<Transaction> | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Progressive Unlock KYB State
  const [isKybWizardOpen, setIsKybWizardOpen] = useState(false);
  const [kybWizardStep, setKybWizardStep] = useState(1);
  const [isLiveGateOpen, setIsLiveGateOpen] = useState(false);
  const [liveGateAction, setLiveGateAction] = useState('Live Mode & Production Keys');
  const [isLiveEnvironment, setIsLiveEnvironment] = useState(false);
  const [kybStatus, setKybStatusState] = useState<MerchantKybLifecycleStatus>(() => getKybApplication().status);

  useEffect(() => {
    const unsub = subscribeKybStatus((app) => {
      setKybStatusState(app.status);
      if (app.status !== 'APPROVED') {
        setIsLiveEnvironment(false);
      }
    });
    return unsub;
  }, []);

  const handleToggleEnvironment = (toLive: boolean) => {
    if (toLive) {
      if (kybStatus !== 'APPROVED') {
        setLiveGateAction('Live Production Environment');
        setIsLiveGateOpen(true);
        return;
      }
      setIsLiveEnvironment(true);
    } else {
      setIsLiveEnvironment(false);
    }
  };

  // Sync URL history state smoothly with Portal Mode & Tabs
  useEffect(() => {
    try {
      if (portalMode === 'admin') {
        const routeMap: Record<AdminTabId, string> = {
          'admin-overview': '/admin/overview',
          'admin-merchants': '/admin/merchants',
          'admin-whitelist': '/admin/whitelist',
          'admin-exceptions': '/admin/exceptions',
          'admin-payouts': '/admin/payouts',
          'admin-logs': '/admin/logs',
          'admin-audit': '/admin/audit',
        };
        const target = routeMap[adminTab] || '/admin/overview';
        if (window.location.pathname !== target) {
          window.history.replaceState(null, '', target);
        }
      } else {
        // Merchant Portal URL synchronization
        const currentPath = window.location.pathname.toLowerCase();
        if (currentPath.startsWith('/admin') || currentPath.includes('/ops-7x9k')) {
          window.history.replaceState(null, '', '/merchant/' + activeTab);
        } else if (currentPath.startsWith('/merchant')) {
          const target = '/merchant/' + activeTab;
          if (window.location.pathname !== target) {
            window.history.replaceState(null, '', target);
          }
        } else if (currentPath !== '/') {
          const target = '/' + activeTab;
          if (window.location.pathname !== target) {
            window.history.replaceState(null, '', target);
          }
        }
      }
    } catch {
      // ignore
    }
  }, [portalMode, adminTab, activeTab]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/admin') || path.includes('/ops-7x9k')) {
        setPortalMode('admin');
        if (path.includes('/merchants')) setAdminTab('admin-merchants');
        else if (path.includes('/whitelist')) setAdminTab('admin-whitelist');
        else if (path.includes('/exceptions')) setAdminTab('admin-exceptions');
        else if (path.includes('/payouts')) setAdminTab('admin-payouts');
        else if (path.includes('/logs')) setAdminTab('admin-logs');
        else if (path.includes('/audit')) setAdminTab('admin-audit');
        else setAdminTab('admin-overview');
      } else {
        setPortalMode('merchant');
        const cleanPath = path.replace(/^\/merchant\/?/, '');
        const validTabs = [
          'dashboard',
          'deposits',
          'exceptions',
          'payouts',
          'customers',
          'balances',
          'convert',
          'statements',
          'developers',
          'team-security',
          'settings'
        ];
        for (const tab of validTabs) {
          if (cleanPath.startsWith(tab) || cleanPath === tab) {
            setActiveTab(tab);
            break;
          }
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamically update document title based on portal mode and active tab
  useEffect(() => {
    if (portalMode === 'admin') {
      document.title = 'CopyM Pay — Platform Admin Operations (:3001)';
    } else {
      document.title = 'CopyM Pay — Merchant Treasury Portal (:3000)';
    }
  }, [portalMode]);

  const currentMeta =
    portalMode === 'admin'
      ? PAGE_META[adminTab] || PAGE_META['admin-overview']
      : PAGE_META[activeTab] || PAGE_META.dashboard;

  // Handle Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  // Add Deposit from modal
  const handleAddDeposit = (newDeposit: Partial<Transaction>) => {
    const amountStr = newDeposit.amount || '0';
    const rawVal = parseFloat(amountStr.replace(/[^0-9.]/g, '')) || 0;
    setBalance(prev => prev + rawVal);
    setUsdtBalance(prev => prev + rawVal);
    const completeTx: Transaction = {
      id: 'tx_' + Date.now(),
      type: newDeposit.type || 'Deposit',
      reference: newDeposit.reference || 'dep_manual',
      fullRef: newDeposit.fullRef || newDeposit.reference || 'dep_manual',
      customer: newDeposit.customer || 'cust_anonymous',
      network: newDeposit.network || 'USDT · TRON',
      amount: newDeposit.amount || '+ 0.00',
      numericAmount: rawVal,
      status: newDeposit.status || 'Credited',
      time: newDeposit.time || 'Just now'
    };
    setActivities(prev => [completeTx, ...prev]);
  };

  // Add Payout from modal - Directly prepends to both Payouts rows and Recent activities
  const handleAddPayout = (newPayoutItem: PayoutRecord) => {
    setPayouts(prev => [newPayoutItem, ...prev]);
    setBalance(prev => Math.max(0, prev - newPayoutItem.numericAmount));
    setUsdtBalance(prev => Math.max(0, prev - newPayoutItem.numericAmount));
    setActivities(prev => [{
      id: newPayoutItem.id,
      type: 'Payout',
      reference: newPayoutItem.ref,
      fullRef: newPayoutItem.fullRef,
      customer: newPayoutItem.customer,
      network: newPayoutItem.network,
      amount: `- ${newPayoutItem.amount}`,
      numericAmount: -newPayoutItem.numericAmount,
      status: 'In flight',
      time: 'Just now'
    }, ...prev]);
  };

  // Swap currency
  const handleExecuteSwap = (fromAmount: number, toAmount: number) => {
    setUsdtBalance(prev => Math.max(0, prev - fromAmount));
    setBalance(prev => prev + toAmount);
    setActivities(prev => [{
      id: 'tx_swap_' + Date.now(),
      type: 'Swap',
      reference: 'swp_' + Math.random().toString(36).substring(2, 6),
      fullRef: 'swp_conversion_internal',
      customer: 'Self Treasury',
      network: 'USDT -> USDC',
      amount: `~ $${toAmount.toLocaleString()}`,
      numericAmount: toAmount,
      status: 'Completed',
      time: 'Just now'
    }, ...prev]);
  };

  // Real-time Background Payment Simulator (Play mode)
  useEffect(() => {
    if (!isLiveSimulating) return;

    const interval = setInterval(() => {
      const networks = ['USDT · TRON', 'USDC · ERC-20', 'USDT · BSC'];
      const chosenNet = networks[Math.floor(Math.random() * networks.length)];
      const randAmt = (Math.floor(Math.random() * 45) + 5) * 50;
      const refSuffix = Math.random().toString(36).substring(2, 5);
      const custNum = Math.floor(10000 + Math.random() * 90000);

      const incomingTx: Transaction = {
        id: 'tx_sim_' + Date.now(),
        type: 'Deposit',
        reference: `dep_${refSuffix}..live`,
        fullRef: `dep_${refSuffix}_live_generated_event`,
        customer: `cust_${custNum}`,
        network: chosenNet,
        amount: `+ ${randAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        numericAmount: randAmt,
        status: 'Credited',
        time: 'Just now'
      };

      setActivities(prev => [incomingTx, ...prev.slice(0, 19)]);
      setBalance(prev => prev + randAmt);
      setUsdtBalance(prev => prev + randAmt);
    }, 4500);

    return () => clearInterval(interval);
  }, [isLiveSimulating]);

  // Context-Aware Action Button for Uniform Page Header
  const renderHeaderAction = () => {
    // Admin Operations Actions
    if (portalMode === 'admin') {
      if (adminTab === 'admin-overview') {
        return (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
              3 Critical KYT Flags
            </span>
          </div>
        );
      }
      if (adminTab === 'admin-merchants') {
        return (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              2 KYB Reviews Pending
            </span>
          </div>
        );
      }
      if (adminTab === 'admin-whitelist') {
        return (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
              2 Addresses in 24h Cooling
            </span>
          </div>
        );
      }
      if (adminTab === 'admin-exceptions') {
        return (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">
              Hot-Vault Sweeps Active
            </span>
          </div>
        );
      }
      if (adminTab === 'admin-payouts') {
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPayoutModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-full text-[11.5px] sm:text-[12px] font-semibold shadow-sm transition-all select-none"
            >
              <span className="text-sm font-bold leading-none">+</span>
              <span>Submit Payout for Approval</span>
            </button>
          </div>
        );
      }
      if (adminTab === 'admin-audit') {
        return null;
      }
      return null;
    }

    // Merchant Portal Actions
    if (activeTab === 'dashboard' || activeTab === 'deposits') {
      return (
        <button
          onClick={() => {
            setDepositModalInitial(null);
            setIsDepositModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-full text-[11.5px] sm:text-[12px] font-semibold shadow-sm transition-all select-none"
        >
          <span className="text-sm font-bold leading-none">+</span>
          <span>New deposit flow</span>
        </button>
      );
    }

    if (activeTab === 'payouts') {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPayoutModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-full text-[11.5px] sm:text-[12px] font-medium shadow-2xs transition-all select-none"
          >
            <Upload className="w-3.5 h-3.5 text-gray-600" />
            <span>Import CSV batch</span>
          </button>
          <button
            onClick={() => setIsPayoutModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-full text-[11.5px] sm:text-[12px] font-semibold shadow-sm transition-all select-none"
          >
            <span className="text-sm font-bold leading-none">+</span>
            <span>Create payout</span>
          </button>
        </div>
      );
    }

    if (activeTab === 'customers') {
      return (
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            24h Anti-Theft Active
          </span>
        </div>
      );
    }

    if (activeTab === 'developers') {
      return (
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-2">
          <a
            href="/simulator.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-[11px] sm:text-[11.5px] font-semibold shadow-2xs transition select-none"
          >
            <Play className="w-3.5 h-3.5 text-[#00C076] fill-[#00C076]" />
            <span>Simulate Cashier (HPP / H2H)</span>
          </a>
          <button
            onClick={() => setIsDevModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-[11px] sm:text-[11.5px] font-medium shadow-2xs transition select-none"
          >
            <BookOpen className="w-3.5 h-3.5 text-gray-600" />
            <span>API documentation</span>
          </button>
          <button
            onClick={() => setIsCreateKeyOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-full text-[11.5px] sm:text-[12px] font-semibold shadow-xs transition select-none"
          >
            <span className="text-sm font-bold leading-none">+</span>
            <span>Create key</span>
          </button>
        </div>
      );
    }

    if (activeTab === 'team-security') {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRolesOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-full text-[11.5px] sm:text-[12px] font-medium shadow-2xs transition-all select-none"
          >
            <span>Review roles</span>
          </button>
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-full text-[11.5px] sm:text-[12px] font-semibold shadow-sm transition-all select-none"
          >
            <span className="text-sm font-bold leading-none">+</span>
            <span>Invite member</span>
          </button>
        </div>
      );
    }

    return null;
  };

  // Ticket FE-10: Public Cashier Simulator Route
  const isSimulatorRoute =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/simulator') ||
      window.location.pathname.startsWith('/cashier-simulator'));

  if (isSimulatorRoute) {
    window.location.href = '/simulator.html';
    return null;
  }

  // Ticket FE-11: Public Radial Scanner Studio Route
  const isScannerRoute =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/scanner') ||
      window.location.pathname.startsWith('/radial-scanner'));

  if (isScannerRoute) {
    window.location.href = '/copym-radial-scanner.html';
    return null;
  }

  // Ticket FE-09: Public Payer Checkout Route (No Auth Required)
  const isCheckoutRoute =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/checkout') ||
      window.location.pathname.startsWith('/c/'));

  if (isCheckoutRoute) {
    const pathParts = window.location.pathname.split('/');
    const rawId = pathParts[pathParts.length - 1];
    const invoiceId = rawId && rawId !== 'checkout' && rawId !== 'c' ? rawId : 'INV-8849-2041';

    return (
      <HostedCheckoutPage
        invoiceId={invoiceId}
        merchantName="Apex Forex Global Ltd"
        orderReference="ORD-948271"
        amount="2,500.00"
      />
    );
  }

  // Dedicated Auth & 2FA View
  if (!isAuthenticated) {
    return (
      <AuthPage
        onSuccessLogin={handleSuccessLogin}
        portalMode={portalMode}
      />
    );
  }

  return (
    <div className="min-h-screen lg:h-screen bg-white flex flex-col font-sans selection:bg-[#00C076] selection:text-white lg:overflow-hidden">
      {/* Top Header / Navigation Bar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        isLiveSimulating={isLiveSimulating}
        setIsLiveSimulating={setIsLiveSimulating}
        onOpenDevModal={() => setIsDevModalOpen(true)}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        onSignOut={handleSignOut}
        currentUser={currentUser}
        portalMode={portalMode}
        isLiveEnvironment={isLiveEnvironment}
        onToggleEnvironment={handleToggleEnvironment}
        kybStatus={kybStatus}
      />

      {/* Persistent Day-0 Progressive Unlock KYB Compliance Banner */}
      {portalMode === 'merchant' && (
        <KybBanner
          onOpenWizard={(step) => {
            setKybWizardStep(step || 1);
            setIsKybWizardOpen(true);
          }}
        />
      )}

      {/* Main Workspace: Sidebar on left + Large Rounded Canvas on right */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          portalMode={portalMode}
          adminTab={adminTab}
          setAdminTab={setAdminTab}
          onOpenDevModal={() => setIsDevModalOpen(true)}
          onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          isLiveSimulating={isLiveSimulating}
          setIsLiveSimulating={setIsLiveSimulating}
          userName={currentUser.name}
        />

        {/* Large Rounded Content Canvas */}
        <main className="flex-1 bg-[#EAEBED] rounded-t-2xl sm:rounded-tl-[32px] overflow-y-auto px-2.5 py-3 sm:px-6 sm:py-5 lg:px-8 transition-all">
          <div className="w-full flex flex-col max-w-7xl mx-auto">
            {/* Uniform Page Header across EVERY page */}
            <PageHeader
              title={currentMeta.title}
              category={currentMeta.category}
              action={renderHeaderAction()}
            />

            {/* Portal-Mode Dependent Routing */}
            {portalMode === 'admin' ? (
              adminTab === 'admin-overview' ? (
                /* Platform Admin AML & KYT Attention Queue */
                <AdminOverviewPage />
              ) : adminTab === 'admin-merchants' ? (
                /* Merchant KYB Adjudication & Limits */
                <AdminMerchantsPage />
              ) : adminTab === 'admin-whitelist' ? (
                /* Merchant Payout Address Whitelist Hub */
                <AdminWhitelistPage />
              ) : adminTab === 'admin-exceptions' ? (
                /* Payment Exceptions & Automated Cold Sweeps */
                <AdminExceptionsPage />
              ) : adminTab === 'admin-payouts' ? (
                /* Platform Maker-Checker Approvals Queue & MPC Co-Signer Gate */
                <AdminPayoutsPage />
              ) : adminTab === 'admin-logs' ? (
                /* Centralized Merchant Issue & Diagnostic Logs (CTO Instruction 4) */
                <AdminLogsPage />
              ) : (
                /* Platform Immutable Audit Trail */
                <AdminAuditPage />
              )
            ) : (
              /* Merchant Portal Views */
              activeTab === 'dashboard' ? (
                <DashboardPage
                  balance={balance.toLocaleString('en-US')}
                  usdtBalance={usdtBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  onOpenDeposit={() => {
                    setDepositModalInitial(null);
                    setIsDepositModalOpen(true);
                  }}
                  onOpenPayout={() => setIsPayoutModalOpen(true)}
                  onOpenSwap={() => setIsSwapModalOpen(true)}
                  activities={activities}
                  searchQuery={searchQuery}
                  onSelectTransaction={(tx) => setSelectedTx(tx)}
                />
              ) : activeTab === 'deposits' ? (
                <DepositsPage
                  searchQuery={searchQuery}
                  onOpenNewDeposit={() => {
                    setDepositModalInitial(null);
                    setIsDepositModalOpen(true);
                  }}
                  onSelectDeposit={(dep) => setSelectedTx({
                    id: dep.id,
                    type: 'Deposit',
                    reference: dep.depositId,
                    fullRef: dep.refId,
                    customer: dep.customer,
                    network: dep.assetChain,
                    amount: dep.received !== '—' ? `+ ${dep.received}` : `(Expected ${dep.expected})`,
                    numericAmount: dep.numericReceived,
                    status: dep.status,
                    time: dep.created,
                    flow: dep.flow
                  })}
                />
              ) : activeTab === 'exceptions' ? (
                <ExceptionsPage globalSearchQuery={searchQuery} />
              ) : activeTab === 'payouts' ? (
                <PayoutsPage
                  payouts={payouts}
                  setPayouts={setPayouts}
                  globalSearchQuery={searchQuery}
                  onOpenCreatePayout={() => setIsPayoutModalOpen(true)}
                />
              ) : activeTab === 'customers' ? (
                /* FE-07: Address Book & Allowlisted Destinations with Cooling Period */
                <CustomersPage
                  onOpenPayoutWithDestination={() => {
                    setIsPayoutModalOpen(true);
                  }}
                />
              ) : activeTab === 'developers' ? (
                <DevelopersPage
                  onOpenDocs={() => setIsDevModalOpen(true)}
                  openCreateKey={isCreateKeyOpen}
                  setOpenCreateKey={setIsCreateKeyOpen}
                  onOpenLiveGate={(actionName) => {
                    setLiveGateAction(actionName || 'Production API Keys');
                    setIsLiveGateOpen(true);
                  }}
                />
              ) : activeTab === 'team-security' ? (
                <TeamSecurityPage
                  openInviteMember={isInviteOpen}
                  setOpenInviteMember={setIsInviteOpen}
                  openReviewRoles={isRolesOpen}
                  setOpenReviewRoles={setIsRolesOpen}
                />
              ) : activeTab === 'settings' ? (
                <SettingsPage
                  onOpenKybWizard={(step) => {
                    setKybWizardStep(step || 1);
                    setIsKybWizardOpen(true);
                  }}
                />
              ) : (
                <SectionView
                  activeTab={activeTab}
                  onOpenDeposit={() => setIsDepositModalOpen(true)}
                  onOpenPayout={() => setIsPayoutModalOpen(true)}
                  onOpenDevModal={() => setIsDevModalOpen(true)}
                  onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
                />
              )
            )}
          </div>
        </main>
      </div>

      {/* Interactive Modals */}
      <DeveloperModal
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
        onSimulateWebhook={() => {
          handleAddDeposit({
            type: 'Deposit',
            reference: 'dep_webhook..ok1',
            customer: 'cust_webhook',
            network: 'USDT · TRON',
            amount: '+ 500.00',
            status: 'Credited',
            time: 'Just now'
          });
        }}
      />

      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setDepositModalInitial(null);
        }}
        onAddDeposit={handleAddDeposit}
        initialDeposit={depositModalInitial}
      />

      <PayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        onAddPayout={handleAddPayout}
      />

      <SwapModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        onExecuteSwap={() => handleExecuteSwap(2500, 2500)}
      />

      <TransactionModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onOpenDepositCheckout={(tx) => {
          setDepositModalInitial(tx);
          setIsDepositModalOpen(true);
        }}
      />

      {/* 5-Step Progressive Unlock KYB Onboarding Wizard */}
      <KybOnboardingWizard
        isOpen={isKybWizardOpen}
        onClose={() => setIsKybWizardOpen(false)}
        initialStep={kybWizardStep}
      />

      {/* Live Mode Gatekeeper Modal */}
      <LiveModeGate
        isOpen={isLiveGateOpen}
        onClose={() => setIsLiveGateOpen(false)}
        onOpenKyb={(step) => {
          setIsLiveGateOpen(false);
          setKybWizardStep(step || 1);
          setIsKybWizardOpen(true);
        }}
        targetActionName={liveGateAction}
      />
    </div>
  );
}

export default App;
