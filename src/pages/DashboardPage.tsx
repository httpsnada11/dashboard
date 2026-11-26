import React from 'react';
import { BalanceCard } from '../components/BalanceCard';
import { PastWithdrawalsCard } from '../components/PastWithdrawalsCard';
import { RecentActivity } from '../components/RecentActivity';
import { Transaction, PayoutRecord } from '../types';

export interface DashboardPageProps {
  balance: string;
  usdtBalance: string;
  onOpenDeposit: () => void;
  onOpenPayout: () => void;
  onOpenSwap: () => void;
  activities: Transaction[];
  payouts?: PayoutRecord[];
  searchQuery: string;
  onSelectTransaction: (tx: Transaction) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  balance,
  usdtBalance,
  onOpenDeposit,
  onOpenPayout,
  onOpenSwap,
  activities,
  payouts = [],
  searchQuery,
  onSelectTransaction
}) => {
  const pastWithdrawals = payouts.map((p, idx) => ({
    id: p.id || `pw_${idx}`,
    asset: 'USDT' as const,
    network: p.network || 'TRC-20',
    destinationAddress: p.destinationAddress ? `${p.destinationAddress.slice(0, 6)}...${p.destinationAddress.slice(-4)}` : 'TLyV...92bF',
    fullAddress: p.fullAddress || p.destinationAddress || '',
    clientId: p.customer || 'cust_live',
    refCode: p.ref || 'WD-LIVE',
    merchantName: 'Treasury Payout',
    amount: p.amount || '0.00',
    token: 'USDT',
    usdEquivalent: `$${p.amount || '0.00'} USD`,
    date: p.createdAt || 'Today',
    timestamp: p.createdAt || 'Today',
    txHash: '7a5b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    explorerUrl: p.network?.includes('ERC') ? 'https://etherscan.io' : 'https://tronscan.org',
    explorerName: p.network?.includes('ERC') ? 'Etherscan' : 'TRONSCAN',
    status: (p.status === 'Completed' ? 'Completed' : 'In Progress') as 'Completed' | 'Signed' | 'In Progress',
    history: {
      createdTime: p.createdAt || 'Just now',
      createdDesc: 'Payout requested · Ledger reserved',
      signedTime: 'Pending',
      signedDesc: 'Multi-Party Computation (MPC) signed',
      completedTime: 'Pending',
      completedDesc: 'Mined & confirmed on blockchain'
    }
  }));

  return (
    <>
      {/* Top Row: Black Featured Balance Card on Left + Past Withdrawals on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-6 items-start">
        <div className="lg:col-span-6 xl:col-span-6 w-full">
          <BalanceCard
            balance={balance}
            usdtBalance={usdtBalance}
            onOpenDeposit={onOpenDeposit}
            onOpenPayout={onOpenPayout}
            onOpenSwap={onOpenSwap}
          />
        </div>

        <div className="lg:col-span-6 xl:col-span-6 w-full">
          <PastWithdrawalsCard onOpenPayout={onOpenPayout} items={pastWithdrawals} />
        </div>
      </div>

      {/* Recent Activity Ledger Table */}
      <RecentActivity
        activities={activities}
        searchQuery={searchQuery}
        onSelectTransaction={onSelectTransaction}
      />
    </>
  );
};

