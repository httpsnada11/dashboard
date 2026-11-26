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
import { MERCHANT, toDepositRef, toPayoutRef } from './utils/sharedMockStore';
import { api } from './services/api';

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

export function App() {
  // Portal Mode: 'merchant' (Port 3000 / root / /merchant) or 'admin' (Port 3001 / /admin)
  const [portalMode, setPortalMode] = useState<PortalMode>(() => {
    try {
      if (window.location.port === '3001' || import.meta.env.MODE === 'admin') {
        return 'admin';
      }
      if (window.location.port === '3000') {
        return 'merchant';
      }
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/admin')) {
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

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      const isAdm = path.startsWith('/admin') || window.location.port === '3001' || import.meta.env.MODE === 'admin';
      if (isAdm) {
        return localStorage.getItem('copym_admin_session') === 'true';
      }
      return localStorage.getItem('copym_merchant_session') === 'true';
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState<{ name: string; email: string }>(() => {
    try {
      const isAdm = portalMode === 'admin';
      if (isAdm) {
        const savedName = localStorage.getItem('copym_admin_name');
        const savedEmail = localStorage.getItem('copym_admin_email');
        return { name: savedName || 'Platform Operator AM (SuperAdmin)', email: savedEmail || 'admin@copym.example' };
      }
      const savedName = localStorage.getItem('copym_merchant_name');
      const savedEmail = localStorage.getItem('copym_merchant_email');
      if (savedName) {
        return { name: savedName, email: savedEmail || 'nora@apexforex.example.com' };
      }
    } catch {
      // ignore
    }
    return { name: 'Nora Vale', email: 'nora@apexforex.example.com' };
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
      if (path.includes('/overview') || path.includes('/kyt')) return 'admin-overview';
    } catch {
      // ignore
    }
    return 'admin-overview';
  });

  const handleSuccessLogin = (merchantInfo?: { name: string; email: string }) => {
    const defaultUser =
      portalMode === 'admin'
        ? { name: 'Platform Operator AM (SuperAdmin)', email: 'admin@copym.example' }
        : { name: 'Nora Vale', email: 'nora@apexforex.example.com' };
    const user = merchantInfo || defaultUser;
    setCurrentUser(user);
    try {
      if (portalMode === 'admin') {
        localStorage.removeItem('copym_merchant_session');
        localStorage.setItem('copym_admin_session', 'true');
        localStorage.setItem('copym_session_role', 'admin');
        localStorage.setItem('copym_admin_session_started_at', Date.now().toString());
        localStorage.setItem('copym_admin_name', user.name);
        localStorage.setItem('copym_admin_email', user.email);
      } else {
        localStorage.removeItem('copym_admin_session');
        localStorage.setItem('copym_merchant_session', 'true');
        localStorage.setItem('copym_session_role', 'merchant');
        localStorage.setItem('copym_merchant_name', user.name);
        localStorage.setItem('copym_merchant_email', user.email);
      }
    } catch {
      // ignore storage errors
    }
    setIsAuthenticated(true);
  };

  const handleSignOut = async () => {
    try {
      if (portalMode === 'admin') {
        await api.adminLogout().catch(() => {});
      } else {
        await api.logout().catch(() => {});
      }
      localStorage.removeItem('copym_admin_session');
      localStorage.removeItem('copym_admin_name');
      localStorage.removeItem('copym_admin_email');
      localStorage.removeItem('copym_admin_session_started_at');
      localStorage.removeItem('copym_merchant_session');
      localStorage.removeItem('copym_merchant_name');
      localStorage.removeItem('copym_merchant_email');
      localStorage.removeItem('copym_auth_session');
      localStorage.removeItem('copym_session_role');
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
  };

  useEffect(() => {
    try {
      const isAdminPortal = portalMode === 'admin';
      const sessionKey = isAdminPortal ? 'copym_admin_session' : 'copym_merchant_session';
      setIsAuthenticated(localStorage.getItem(sessionKey) === 'true');
      const savedName = localStorage.getItem(isAdminPortal ? 'copym_admin_name' : 'copym_merchant_name');
      const savedEmail = localStorage.getItem(isAdminPortal ? 'copym_admin_email' : 'copym_merchant_email');
      if (savedName) {
        setCurrentUser({
          name: savedName,
          email: savedEmail || (isAdminPortal ? 'admin@copym.example' : 'nora@apexforex.example.com'),
        });
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, [portalMode]);

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
  const [activities, setActivities] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [balance, setBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('copym_balance');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });
  const [usdtBalance, setUsdtBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('copym_usdt_balance');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  // Fetch real ledger balances and live transactions from backend
  useEffect(() => {
    if (isAuthenticated && portalMode === 'merchant') {
      api.getBalances()
        .then((res: any) => {
          const avail =
            res?.available ??
            res?.balances?.available ??
            res?.data?.available ??
            res?.total_available ??
            0;
          const num = Number(avail) || 0;
          setBalance(num);
          setUsdtBalance(num);
          localStorage.setItem('copym_balance', num.toString());
          localStorage.setItem('copym_usdt_balance', num.toString());
        })
        .catch((err) => {
          console.warn('Could not load backend balances:', err);
        });

      api.getOrders()
        .then((res: any) => {
          const list = res?.data || res?.orders || (Array.isArray(res) ? res : []);
          if (Array.isArray(list) && list.length > 0) {
            const mapped: Transaction[] = list.map((item: any, index: number) => ({
              id: item.order_id || item.id,
              type: 'Deposit',
              reference: toDepositRef(item.order_id || item.id, index),
              fullRef: toDepositRef(item.order_id || item.id, index),
              customer: item.merchant_order_id || item.order_id || 'ord_live',
              network: `${item.currency || 'USDT'} · ${item.network || 'TRON'}`,
              amount: `+ ${item.amount}`,
              numericAmount: Number(item.amount || 0),
              status: item.status || 'Credited',
              time: item.created_at ? new Date((typeof item.created_at === 'number' && item.created_at < 10000000000 ? item.created_at * 1000 : item.created_at)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
            }));
            setActivities(mapped);
          } else {
            setActivities([]);
          }
        })
        .catch(() => {
          setActivities([]);
        });

      api.getPayouts()
        .then((res: any) => {
          const list = res?.data || res?.payouts || (Array.isArray(res) ? res : []);
          if (Array.isArray(list) && list.length > 0) {
            setPayouts(list);
          } else {
            setPayouts([]);
          }
        })
        .catch(() => {
          setPayouts([]);
        });
    }
  }, [isAuthenticated, portalMode]);

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
          'admin-overview': '/admin/kyt',
          'admin-merchants': '/admin/merchants',
          'admin-whitelist': '/admin/whitelist',
          'admin-exceptions': '/admin/exceptions',
          'admin-payouts': '/admin/payouts',
          'admin-logs': '/admin/logs',
          'admin-audit': '/admin/audit',
        };
        const target = routeMap[adminTab] || '/admin/kyt';
        if (window.location.pathname !== target) {
          window.history.pushState(null, '', target);
        }
      } else {
        const currentPath = window.location.pathname.toLowerCase();
        const isPublicRoute =
          currentPath.startsWith('/simulator') ||
          currentPath.startsWith('/cashier-simulator') ||
          currentPath.startsWith('/scanner') ||
          currentPath.startsWith('/radial-scanner') ||
          currentPath.startsWith('/checkout') ||
          currentPath.startsWith('/c/');
        if (isPublicRoute) return;
        const target = activeTab === 'dashboard' ? '/' : `/${activeTab}`;
        if (window.location.pathname !== target && currentPath !== `/merchant/${activeTab}`) {
          window.history.pushState(null, '', target);
        }
      }
    } catch {
      // ignore
    }
  }, [portalMode, adminTab, activeTab]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/admin')) {
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
        const cleanPath = path.replace(/^\/merchant\/?/, '').replace(/^\//, '');
        if (!cleanPath) {
          setActiveTab('dashboard');
          return;
        }
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
      const pageTitle = PAGE_META[adminTab]?.title || 'Platform Admin';
      document.title = `CopyM Pay — ${pageTitle}`;
    } else {
      const pageTitle = PAGE_META[activeTab]?.title || 'Dashboard';
      document.title = `CopyM Pay — ${pageTitle}`;
    }
  }, [portalMode, activeTab, adminTab]);

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

  // Add Deposit from modal - writes directly to backend MySQL ledger
  const handleAddDeposit = (newDeposit: Partial<Transaction>) => {
    const amountStr = newDeposit.amount || '0';
    const rawVal = parseFloat(amountStr.replace(/[^0-9.]/g, '')) || 0;
    const amountDecimal = rawVal.toFixed(2);
    const networkClean = (newDeposit.network || '').includes('ERC') ? 'ETHEREUM' : 'TRON';

    setBalance(prev => prev + rawVal);
    setUsdtBalance(prev => prev + rawVal);
    const completeTx: Transaction = {
      id: 'tx_' + Date.now(),
      type: newDeposit.type || 'Deposit',
      reference: toDepositRef(newDeposit.reference, activities.length),
      fullRef: toDepositRef(newDeposit.fullRef || newDeposit.reference, activities.length),
      customer: newDeposit.customer || 'cust_anonymous',
      network: newDeposit.network || 'USDT · TRON',
      amount: newDeposit.amount || '+ 0.00',
      numericAmount: rawVal,
      status: newDeposit.status || 'Credited',
      time: newDeposit.time || 'Just now'
    };
    setActivities(prev => [completeTx, ...prev]);

    // Persist real order into backend MySQL and simulate confirmation if credited
    api.createOrder({
      amount: amountDecimal,
      currency: 'USDT',
      network: networkClean,
      payer_id: newDeposit.customer,
      description: newDeposit.fullRef || 'Custom Cashier Deposit',
    }).then(async (orderRes) => {
      if (orderRes?.order_id && newDeposit.status === 'Credited') {
        await api.simulateOrderPayment(orderRes.order_id, {
          amount: amountDecimal,
          confirmations: 19,
        }).catch(() => {});
      }
      // Re-fetch authoritative balance from double-entry ledger
      const bal = await api.getBalances().catch(() => null);
      if (bal?.available !== undefined) {
        const val = Number(bal.available) || 0;
        setBalance(val);
        setUsdtBalance(val);
      }
    }).catch(err => {
      console.warn('Could not persist order to backend:', err);
    });
  };

  // Add Payout from modal - Directly prepends to both Payouts rows and Recent activities
  const handleAddPayout = (newPayoutItem: PayoutRecord) => {
    setPayouts(prev => [newPayoutItem, ...prev]);
    setBalance(prev => Math.max(0, prev - newPayoutItem.numericAmount));
    setUsdtBalance(prev => Math.max(0, prev - newPayoutItem.numericAmount));
    setActivities(prev => [{
      id: newPayoutItem.id,
      type: 'Payout',
      reference: toPayoutRef(newPayoutItem.ref),
      fullRef: toPayoutRef(newPayoutItem.fullRef),
      customer: newPayoutItem.customer,
      network: newPayoutItem.network,
      amount: `- ${newPayoutItem.amount}`,
      numericAmount: -newPayoutItem.numericAmount,
      status: 'In flight',
      time: 'Just now'
    }, ...prev]);

    // Persist payout to backend
    api.createPayout({
      amount: newPayoutItem.numericAmount.toFixed(2),
      currency: 'USDT',
      destination_address: newPayoutItem.destinationAddress || newPayoutItem.fullAddress,
      payer_id: newPayoutItem.customer,
      merchant_order_id: newPayoutItem.fullRef,
      network: newPayoutItem.network.includes('ERC') ? 'ETHEREUM' : 'TRON',
    }).catch(err => {
      console.warn('Could not persist payout to backend:', err);
    });
  };

  // Swap currency
  const handleExecuteSwap = (fromAmount: number, toAmount: number) => {
    setUsdtBalance(prev => Math.max(0, prev - fromAmount));
    setBalance(prev => prev + toAmount);
    setActivities(prev => [{
      id: 'tx_swap_' + Date.now(),
      type: 'Swap',
      reference: `CNV-${Date.now().toString().slice(-4)}`,
      fullRef: `CNV-${Date.now().toString().slice(-4)}`,
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
        reference: `DEP-${refSuffix.toUpperCase()}`,
        fullRef: `DEP-${refSuffix.toUpperCase()}`,
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

  const criticalKytCount = activities.filter((item) => /critical|kyt review/i.test(item.status)).length;
  const pendingKybCount = kybStatus === 'UNDER_REVIEW' || kybStatus === 'ACTION_REQUIRED' ? 1 : 0;
  const coolingAddressCount = Number(localStorage.getItem('copym_cooling_address_count') || 0) || 0;
  const exceptionCount = activities.filter((item) => /exception/i.test(item.status)).length;

  // Context-Aware Action Button for Uniform Page Header
  const renderHeaderAction = () => {
    // Admin Operations Actions
    if (portalMode === 'admin') {
      if (adminTab === 'admin-overview') {
        return (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
              {criticalKytCount} Critical KYT Flags
            </span>
          </div>
        );
      }
      if (adminTab === 'admin-merchants') {
        return (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              {pendingKybCount} KYB Reviews Pending
            </span>
          </div>
        );
      }
      if (adminTab === 'admin-whitelist') {
        return (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
              {coolingAddressCount} Addresses in 24h Cooling
            </span>
          </div>
        );
      }
      if (adminTab === 'admin-exceptions') {
        return (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">
              {exceptionCount} Open Exceptions
            </span>
          </div>
        );
      }
      if (adminTab === 'admin-payouts') {
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPayoutModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-full text-xs sm:text-[12px] font-semibold shadow-sm transition-all select-none"
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
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-full text-xs sm:text-[12px] font-semibold shadow-sm transition-all select-none"
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-full text-xs sm:text-[12px] font-medium shadow-2xs transition-all select-none"
          >
            <Upload className="w-3.5 h-3.5 text-gray-600" />
            <span>Import CSV batch</span>
          </button>
          <button
            onClick={() => setIsPayoutModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-full text-xs sm:text-[12px] font-semibold shadow-sm transition-all select-none"
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
            24h Security Hold Active
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
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs sm:text-xs font-semibold shadow-2xs transition select-none"
          >
            <Play className="w-3.5 h-3.5 text-[#007F4E] fill-[#007F4E]" />
            <span>Simulate Cashier (HPP / H2H)</span>
          </a>
          <button
            onClick={() => setIsDevModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-xs sm:text-xs font-medium shadow-2xs transition select-none"
          >
            <BookOpen className="w-3.5 h-3.5 text-gray-600" />
            <span>API documentation</span>
          </button>
          <button
            onClick={() => setIsCreateKeyOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-full text-xs sm:text-[12px] font-semibold shadow-xs transition select-none"
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-full text-xs sm:text-[12px] font-medium shadow-2xs transition-all select-none"
          >
            <span>Review roles</span>
          </button>
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-full text-xs sm:text-[12px] font-semibold shadow-sm transition-all select-none"
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
        merchantName={MERCHANT.name}
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
    <div className="min-h-screen lg:h-screen bg-white flex flex-col font-sans selection:bg-[#007F4E] selection:text-white lg:overflow-hidden">
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
                  onOpenDeposit={() => setActiveTab('deposits')}
                  onOpenPayout={() => setActiveTab('payouts')}
                  onOpenSwap={() => setActiveTab('convert')}
                  activities={activities}
                  payouts={payouts}
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
                    reference: toDepositRef(dep.id),
                    fullRef: toDepositRef(dep.id),
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
            reference: 'DEP-WEBHOOK',
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
        availableBalance={usdtBalance}
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
