import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PageHeader } from './components/PageHeader';
import { BalanceCard } from './components/BalanceCard';
import { RecentActivity } from './components/RecentActivity';
import { DepositsPage } from './components/DepositsPage';
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
  const [balance, setBalance] = useState(56768);
  const [usdtBalance, setUsdtBalance] = useState(56768.98);

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

  // Add Payout from modal
  const handleAddPayout = (newPayout) => {
    const rawVal = parseFloat(newPayout.amount.replace(/[^0-9.]/g, ''));
    setBalance(prev => Math.max(0, prev - rawVal));
    setUsdtBalance(prev => Math.max(0, prev - rawVal));
    setActivities(prev => [{ ...newPayout, id: 'tx_' + Date.now(), fullRef: newPayout.reference }, ...prev]);
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

  return (
    <div className="h-screen bg-white flex flex-col font-sans selection:bg-[#00C076] selection:text-white overflow-hidden">
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
      />

      {/* Main Workspace: Sidebar on left + Large Rounded Canvas on right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenDevModal={() => setIsDevModalOpen(true)}
          onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        />

        {/* Large Rounded Content Canvas */}
        <main className="flex-1 bg-[#EAEBED] rounded-tl-[32px] overflow-y-auto px-5 py-4 sm:px-7 sm:py-5 transition-all">
          <div className="w-full flex flex-col">
            {/* Uniform Page Header: Title and Breadcrumb across EVERY page */}
            <PageHeader
              title={currentMeta.title}
              category={currentMeta.category}
              action={
                activeTab === 'deposits' ? (
                  <button
                    onClick={() => setIsDepositModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-full text-[12px] font-semibold shadow-sm transition-all select-none"
                  >
                    <span className="text-sm font-bold leading-none">+</span>
                    <span>New deposit flow</span>
                  </button>
                ) : null
              }
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
              /* Dedicated Deposits Page matching exact screenshot */
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
