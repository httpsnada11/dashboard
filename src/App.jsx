import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PageHeader } from './components/PageHeader';
import { BalanceCard } from './components/BalanceCard';
import { RecentActivity } from './components/RecentActivity';
import { DepositsPage } from './components/DepositsPage';
import { ExceptionsPage } from './components/ExceptionsPage';
import { PayoutsPage } from './components/PayoutsPage';
import { DeveloperModal, DepositModal, PayoutModal, SwapModal } from './components/Modals';
import { SecurityModal } from './components/SecurityModal';
import { TransactionModal } from './components/TransactionModal';
import { SectionView } from './components/SectionViews';

// Uniform Page Metadata matching the exact screenshot structure
const PAGE_META = {
  dashboard: { title: 'Dashboard', category: 'Overview' },
  deposits: { title: 'Deposits', category: 'Money In' },
  exceptions: { title: 'Exceptions', category: 'Money In' },
  payouts: { title: 'Payouts', category: 'Money Out' },
  balances: { title: 'Balances', category: 'Treasury' },
  convert: { title: 'Convert', category: 'Treasury' },
  statements: { title: 'Statements', category: 'Treasury' },
  developers: { title: 'Developers', category: 'Build' },
  'team-security': { title: 'Team & security', category: 'Account' },
  settings: { title: 'Settings', category: 'Account' },
};

// Initial distinct payout dataset
const INITIAL_PAYOUTS = [
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
    network: 'USDC · Polygon',
    customer: 'cust_90218',
    destinationType: 'DESTINATION · PAYROLL DISBURSEMENT',
    destinationAddress: '0x38bE..11aD',
    fullAddress: '0x38bE8921bca9082ef45511aD',
    requestedBy: 'Sarah Chen (Batch API)',
    complianceText: 'Whitelisted merchant contract · Verified',
    status: 'Needs approval',
    createdAt: '28 Oct 2026, 11:30'
  },
  {
    id: 'pay_5',
    ref: 'pay_8HQ6..W32',
    fullRef: 'pay_8HQ611094ba3W32',
    amount: '6,150.00',
    numericAmount: 6150,
    network: 'USDT · TRON',
    customer: 'cust_38104',
    destinationType: 'DESTINATION · MERCHANT SWEEP',
    destinationAddress: 'TF7mQ..09xP',
    fullAddress: 'TF7mQqZ9z8VnLw7h4Jb1k8Pq5D2g09xP',
    requestedBy: 'David Al-Mansoor',
    complianceText: 'KYC verified · Dual sign-off approved',
    status: 'In flight',
    createdAt: '28 Oct 2026, 10:15'
  },
  {
    id: 'pay_6',
    ref: 'pay_2PL5..X71',
    fullRef: 'pay_2PL590412ee8X71',
    amount: '1,800.00',
    numericAmount: 1800,
    network: 'USDT · BEP-20',
    customer: 'cust_72350',
    destinationType: 'DESTINATION · AFFILIATE COMMISSION',
    destinationAddress: '0x7a2C..5eB9',
    fullAddress: '0x7a2C88910ebca9082ef75eB9',
    requestedBy: 'Alex Rivera',
    complianceText: 'Tier 1 Automated clearance pass',
    status: 'Completed',
    createdAt: '27 Oct 2026, 18:20'
  },
  {
    id: 'pay_7',
    ref: 'pay_6ZF4..M90',
    fullRef: 'pay_6ZF477123aa1M90',
    amount: '35,000.00',
    numericAmount: 35000,
    network: 'USDC · ERC-20',
    customer: 'cust_49821',
    destinationType: 'DESTINATION · TREASURY REBALANCE',
    destinationAddress: '0x15eA..77f0',
    fullAddress: '0x15eA772180a9bC51098277f0',
    requestedBy: 'Hannah Lindberg',
    complianceText: 'Enterprise multi-sig quorum verified',
    status: 'Completed',
    createdAt: '27 Oct 2026, 16:05'
  }
];

// Initial dataset strictly matching the provided design
const INITIAL_ACTIVITIES = [
  {
    id: 'tx_1',
    type: 'Deposit',
    reference: 'dep_8Hq2..f31',
    fullRef: 'dep_8Hq29014ba31f31',
    customer: 'cust_10442',
    network: 'USDT · TRON',
    amount: '+ 2,500.00',
    numericAmount: 2500,
    status: 'Credited',
    time: '2 min ago'
  },
  {
    id: 'tx_2',
    type: 'Deposit',
    reference: 'dep_8Hq1..a90',
    fullRef: 'dep_8Hq15572bc89a90',
    customer: 'cust_20981',
    network: 'USDT · ERC-20',
    amount: '+ 12,000.00',
    numericAmount: 12000,
    status: 'Confirming 7/12',
    time: '6 min ago'
  },
  {
    id: 'tx_3',
    type: 'Payout',
    reference: 'po_5kT..77c',
    fullRef: 'po_5kTr8941098e77c',
    customer: 'cust_10213',
    network: 'USDT · TRON',
    amount: '- 4,200.00',
    numericAmount: -4200,
    status: 'Awaiting approval',
    time: '14 min ago'
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [payouts, setPayouts] = useState(INITIAL_PAYOUTS);
  const [balance, setBalance] = useState(56768);
  const [usdtBalance, setUsdtBalance] = useState(56768.98);

  // Responsive Mobile Navigation State
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Loading & Simulation States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveSimulating, setIsLiveSimulating] = useState(false);

  // Modals
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const currentMeta = PAGE_META[activeTab] || PAGE_META.dashboard;

  // Handle Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  // Add Deposit from modal
  const handleAddDeposit = (newDeposit) => {
    const rawVal = parseFloat(newDeposit.amount.replace(/[^0-9.]/g, ''));
    setBalance(prev => prev + rawVal);
    setUsdtBalance(prev => prev + rawVal);
    setActivities(prev => [{ ...newDeposit, id: 'tx_' + Date.now(), fullRef: newDeposit.reference }, ...prev]);
  };

  // Add Payout from modal - Directly prepends to both Payouts rows and Recent activities!
  const handleAddPayout = (newPayoutItem) => {
    // 1. Prepend directly to Payouts Cards Stack
    setPayouts(prev => [newPayoutItem, ...prev]);

    // 2. Adjust vault balance
    setBalance(prev => Math.max(0, prev - newPayoutItem.numericAmount));
    setUsdtBalance(prev => Math.max(0, prev - newPayoutItem.numericAmount));

    // 3. Add to Recent Activity table
    setActivities(prev => [{
      id: newPayoutItem.id,
      type: 'Payout',
      reference: newPayoutItem.ref,
      fullRef: newPayoutItem.fullRef,
      customer: newPayoutItem.customer,
      network: newPayoutItem.network,
      amount: `- ${newPayoutItem.amount}`,
      numericAmount: -newPayoutItem.numericAmount,
      status: 'Awaiting approval',
      time: 'Just now'
    }, ...prev]);
  };

  // Execute Swap
  const handleExecuteSwap = () => {
    handleRefresh();
  };

  // Live simulation effect when "Play" is enabled
  useEffect(() => {
    if (!isLiveSimulating) return;

    const interval = setInterval(() => {
      const isDeposit = Math.random() > 0.4;
      const amounts = [150, 480, 1200, 3100, 500];
      const selectedAmt = amounts[Math.floor(Math.random() * amounts.length)];
      const networks = ['USDT · TRON', 'USDT · ERC-20', 'USDC · ERC-20'];
      const selectedNet = networks[Math.floor(Math.random() * networks.length)];

      const newTx = {
        id: 'tx_' + Date.now(),
        type: isDeposit ? 'Deposit' : 'Payout',
        reference: `${isDeposit ? 'dep' : 'po'}_${Math.random().toString(36).substring(2, 6)}..${Math.random().toString(36).substring(2, 5)}`,
        fullRef: `hash_${Math.random().toString(36).substring(2, 12)}`,
        customer: `cust_${Math.floor(10000 + Math.random() * 90000)}`,
        network: selectedNet,
        amount: isDeposit ? `+ ${selectedAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `- ${selectedAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        numericAmount: isDeposit ? selectedAmt : -selectedAmt,
        status: isDeposit ? 'Credited' : 'Completed',
        time: 'Just now'
      };

      setActivities(prev => [newTx, ...prev.slice(0, 8)]);
      if (isDeposit) {
        setBalance(prev => prev + selectedAmt);
        setUsdtBalance(prev => prev + selectedAmt);
      } else {
        setBalance(prev => Math.max(0, prev - selectedAmt));
        setUsdtBalance(prev => Math.max(0, prev - selectedAmt));
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [isLiveSimulating]);

  // Dynamic Header Action based on current route
  const renderHeaderAction = () => {
    if (activeTab === 'deposits') {
      return (
        <button
          onClick={() => setIsDepositModalOpen(true)}
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

    return null;
  };

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
      />

      {/* Main Workspace: Sidebar on left + Large Rounded Canvas on right */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenDevModal={() => setIsDevModalOpen(true)}
          onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          isLiveSimulating={isLiveSimulating}
          setIsLiveSimulating={setIsLiveSimulating}
        />

        {/* Large Rounded Content Canvas */}
        <main className="flex-1 bg-[#EAEBED] rounded-t-2xl sm:rounded-tl-[32px] overflow-y-auto px-3.5 py-3.5 sm:px-6 sm:py-5 lg:px-8 transition-all">
          <div className="w-full flex flex-col max-w-7xl mx-auto">
            {/* Uniform Page Header across EVERY page */}
            <PageHeader
              title={currentMeta.title}
              category={currentMeta.category}
              action={renderHeaderAction()}
            />

            {activeTab === 'dashboard' ? (
              <>
                {/* Black Featured Balance Card */}
                <BalanceCard
                  balance={balance}
                  usdtBalance={usdtBalance}
                  onOpenDeposit={() => setIsDepositModalOpen(true)}
                  onOpenPayout={() => setIsPayoutModalOpen(true)}
                  onOpenSwap={() => setIsSwapModalOpen(true)}
                />

                {/* Recent Activity Table */}
                <RecentActivity
                  activities={activities}
                  searchQuery={searchQuery}
                  onSelectTransaction={(tx) => setSelectedTx(tx)}
                />
              </>
            ) : activeTab === 'deposits' ? (
              /* Dedicated Deposits Page */
              <DepositsPage
                searchQuery={searchQuery}
                onOpenNewDeposit={() => setIsDepositModalOpen(true)}
                onSelectDeposit={(dep) => setSelectedTx({
                  type: 'Deposit',
                  reference: dep.depositId,
                  fullRef: dep.refId,
                  customer: dep.customer,
                  network: dep.assetChain,
                  amount: dep.received !== '—' ? `+ ${dep.received}` : `(Expected ${dep.expected})`,
                  status: dep.status,
                  time: dep.created
                })}
              />
            ) : activeTab === 'exceptions' ? (
              /* Dedicated Exceptions Page */
              <ExceptionsPage globalSearchQuery={searchQuery} />
            ) : activeTab === 'payouts' ? (
              /* Dedicated Payouts Page with Live State Synchronization */
              <PayoutsPage
                payouts={payouts}
                setPayouts={setPayouts}
                globalSearchQuery={searchQuery}
                onOpenCreatePayout={() => setIsPayoutModalOpen(true)}
              />
            ) : (
              <SectionView
                activeTab={activeTab}
                onOpenDeposit={() => setIsDepositModalOpen(true)}
                onOpenPayout={() => setIsPayoutModalOpen(true)}
                onOpenDevModal={() => setIsDevModalOpen(true)}
                onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
              />
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
        onClose={() => setIsDepositModalOpen(false)}
        onAddDeposit={handleAddDeposit}
      />

      <PayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        onAddPayout={handleAddPayout}
      />

      <SwapModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        onExecuteSwap={handleExecuteSwap}
      />

      <TransactionModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}

export default App;
