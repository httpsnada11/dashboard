import React from 'react';
import { BalanceCard } from '../components/BalanceCard';
import { PastWithdrawalsCard } from '../components/PastWithdrawalsCard';
import { RecentActivity } from '../components/RecentActivity';
import { Transaction } from '../types';

export interface DashboardPageProps {
  balance: string;
  usdtBalance: string;
  onOpenDeposit: () => void;
  onOpenPayout: () => void;
  onOpenSwap: () => void;
  activities: Transaction[];
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
  searchQuery,
  onSelectTransaction
}) => {
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
          <PastWithdrawalsCard onOpenPayout={onOpenPayout} />
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

