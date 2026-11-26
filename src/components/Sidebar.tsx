import React from 'react';
import {
  Box,
  Code2,
  ArrowDownToLine,
  AlertCircle,
  ArrowUpFromLine,
  X,
  Key,
  Lock,
  Play,
  RotateCcw,
  ShieldCheck,
  Settings as SettingsIcon,
  Wallet,
  ArrowLeftRight,
  FileText,
  ShieldAlert,
  Users,
  AlertOctagon,
  CheckSquare,
  Activity
} from 'lucide-react';
import { PortalMode, AdminTabId } from '../types';

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

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  portalMode?: PortalMode;
  adminTab?: AdminTabId;
  setAdminTab?: (tab: AdminTabId) => void;
  onOpenDevModal?: () => void;
  onOpenSecurityModal?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isLiveSimulating?: boolean;
  setIsLiveSimulating?: (active: boolean) => void;
  userName?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  portalMode = 'merchant',
  adminTab = 'admin-overview',
  setAdminTab,
  onOpenDevModal,
  onOpenSecurityModal,
  isOpen = false,
  onClose,
  onRefresh,
  isRefreshing,
  isLiveSimulating,
  setIsLiveSimulating,
  userName = 'Nora Vale'
}) => {
  const firstName = (userName || 'Nora').trim().split(' ')[0] || 'Nora';

  // Standard Merchant Portal Navigation Sections
  const merchantNavSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      ]
    },
    {
      title: 'MONEY IN',
      items: [
        { id: 'deposits', label: 'Deposits', icon: 'deposit' },
        { id: 'exceptions', label: 'Exceptions', icon: 'exception' },
      ]
    },
    {
      title: 'MONEY OUT',
      items: [
        { id: 'payouts', label: 'Payouts', icon: 'payout' },
        { id: 'customers', label: 'Address book', icon: 'users' },
      ]
    },
    {
      title: 'TREASURY',
      items: [
        { id: 'balances', label: 'Balances', icon: 'balance' },
        { id: 'convert', label: 'Convert', icon: 'convert' },
        { id: 'statements', label: 'Statements', icon: 'statement' },
      ]
    },
    {
      title: 'BUILD',
      items: [
        { id: 'developers', label: 'Developers', icon: 'code' },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { id: 'team-security', label: 'Team & security', icon: 'security' },
        { id: 'settings', label: 'Settings', icon: 'settings' },
      ]
    }
  ];

  // Dedicated Platform Admin Navigation Sections
  const adminNavSections: NavSection[] = [
    {
      title: 'COMPLIANCE & AML',
      items: [
        { id: 'admin-overview', label: 'AML Attention Queue', icon: 'shield-alert' },
        { id: 'admin-merchants', label: 'Merchant KYB', icon: 'users' },
      ]
    },
    {
      title: 'TREASURY OPS',
      items: [
        { id: 'admin-whitelist', label: 'Address Whitelist Hub', icon: 'shield-check' },
        { id: 'admin-exceptions', label: 'Exceptions & Sweeps', icon: 'alert-octagon' },
        { id: 'admin-payouts', label: 'Maker-Checker Queue', icon: 'check-square' },
      ]
    },
    {
      title: 'SECURITY & AUDIT',
      items: [
        { id: 'admin-logs', label: 'Merchant Issue Logs', icon: 'activity' },
        { id: 'admin-audit', label: 'Immutable Audit Trail', icon: 'audit' },
      ]
    }
  ];

  const currentSections = portalMode === 'admin' ? adminNavSections : merchantNavSections;
  const currentActive = portalMode === 'admin' ? adminTab : activeTab;

  const handleItemClick = (item: NavItem) => {
    if (portalMode === 'admin') {
      setAdminTab?.(item.id as AdminTabId);
    } else {
      setActiveTab(item.id);
    }
    onClose?.();
  };

  const renderActiveIcon = (id: string) => {
    const iconClass = "w-4 h-4 text-white stroke-[2.2]";
    switch (id) {
      // Merchant Icons
      case 'dashboard':
        return <Box className={iconClass} />;
      case 'deposits':
        return <ArrowDownToLine className={iconClass} />;
      case 'exceptions':
        return <AlertCircle className={iconClass} />;
      case 'payouts':
        return <ArrowUpFromLine className={iconClass} />;
      case 'customers':
        return <Users className={iconClass} />;
      case 'balances':
        return <Wallet className={iconClass} />;
      case 'convert':
        return <ArrowLeftRight className={iconClass} />;
      case 'statements':
        return <FileText className={iconClass} />;
      case 'developers':
        return <Code2 className={iconClass} />;
      case 'team-security':
        return <ShieldCheck className={iconClass} />;
      case 'settings':
        return <SettingsIcon className={iconClass} />;

      // Admin Icons
      case 'admin-overview':
        return <ShieldAlert className={iconClass} />;
      case 'admin-merchants':
        return <Users className={iconClass} />;
      case 'admin-whitelist':
        return <ShieldCheck className={iconClass} />;
      case 'admin-exceptions':
        return <AlertOctagon className={iconClass} />;
      case 'admin-payouts':
        return <CheckSquare className={iconClass} />;
      case 'admin-logs':
        return <Activity className={iconClass} />;
      case 'admin-audit':
        return <FileText className={iconClass} />;
      default:
        return <Box className={iconClass} />;
    }
  };

  const renderInactiveIcon = (id: string) => {
    const iconClass = "w-4 h-4 stroke-[1.9] text-[#64748B] group-hover:text-[#1E293B] transition-colors";
    switch (id) {
      // Merchant Icons
      case 'dashboard':
        return <Box className={iconClass} />;
      case 'deposits':
        return <ArrowDownToLine className={iconClass} />;
      case 'exceptions':
        return <AlertCircle className={iconClass} />;
      case 'payouts':
        return <ArrowUpFromLine className={iconClass} />;
      case 'customers':
        return <Users className={iconClass} />;
      case 'balances':
        return <Wallet className={iconClass} />;
      case 'convert':
        return <ArrowLeftRight className={iconClass} />;
      case 'statements':
        return <FileText className={iconClass} />;
      case 'developers':
        return <Code2 className={iconClass} />;
      case 'team-security':
        return <ShieldCheck className={iconClass} />;
      case 'settings':
        return <SettingsIcon className={iconClass} />;

      // Admin Icons
      case 'admin-overview':
        return <ShieldAlert className={iconClass} />;
      case 'admin-merchants':
        return <Users className={iconClass} />;
      case 'admin-whitelist':
        return <ShieldCheck className={iconClass} />;
      case 'admin-exceptions':
        return <AlertOctagon className={iconClass} />;
      case 'admin-payouts':
        return <CheckSquare className={iconClass} />;
      case 'admin-logs':
        return <Activity className={iconClass} />;
      case 'admin-audit':
        return <FileText className={iconClass} />;
      default:
        return <Box className={iconClass} />;
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between select-none">
      <div>
        {/* Welcome Heading & Mobile Close Button */}
        <div className="mb-4 pb-2.5 border-b border-gray-100/80 flex items-start justify-between px-2.5">
          <div>
            {portalMode === 'admin' ? (
              <div>
                <h2 className="text-[19px] leading-tight font-bold text-[#14171A]">
                  Admin Ops
                </h2>
                <p className="text-[11px] text-[#8E95A5] mt-0.5 font-normal tracking-tight">
                  High-privilege platform controls
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-[20px] leading-tight font-semibold text-[#14171A]">
                  Welcome<br />
                  <span className="font-bold">Back, {firstName}!</span>
                </h2>
                <p className="text-[11px] text-[#8E95A5] mt-1 font-normal tracking-tight">
                  Check out your recent financial activity
                </p>
              </div>
            )}
          </div>
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Menu */}
        <nav className="flex flex-col space-y-4 overflow-y-auto pr-0.5">
          {currentSections.map((section, idx) => (
            <div key={idx} className="flex flex-col space-y-1">
              <span className="text-[10px] tracking-wider uppercase font-bold text-[#8E95A5] px-2.5 mb-0.5 block select-none">
                {section.title}
              </span>

              {section.items.map((item) => {
                const isActive = currentActive === item.id;
                const activeColorClass = 'bg-[#00C076] text-white hover:bg-[#00B16D] shadow-xs';

                if (isActive) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`w-full h-9 px-2.5 rounded-full flex items-center justify-between ${activeColorClass} transition-all group cursor-pointer`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          {renderActiveIcon(item.id)}
                        </div>
                        <span className="text-[12.5px] font-semibold tracking-tight leading-none truncate">
                          {item.label}
                        </span>
                      </div>
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="w-full h-9 px-2.5 rounded-full flex items-center gap-2.5 text-left transition-colors duration-150 group text-[#64748B] hover:text-[#1E293B] hover:bg-gray-100/70 cursor-pointer"
                  >
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      {renderInactiveIcon(item.id)}
                    </div>
                    <span className="text-[12.5px] font-medium tracking-tight leading-none truncate">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Mobile-only Quick Controls at bottom of drawer */}
      <div className="lg:hidden pt-4 mt-4 border-t border-gray-100 flex items-center justify-around bg-gray-50/80 p-2 rounded-2xl">
        <button
          onClick={onRefresh}
          title="Refresh"
          className="p-2 rounded-xl hover:bg-white text-gray-700"
        >
          <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#00C076]' : ''}`} />
        </button>
        <button
          onClick={() => setIsLiveSimulating?.(!isLiveSimulating)}
          title="Live Simulation"
          className={`p-2 rounded-xl transition ${isLiveSimulating ? 'bg-[#00C076] text-white' : 'hover:bg-white text-gray-700'}`}
        >
          <Play className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenDevModal}
          title="API Keys"
          className="p-2 rounded-xl hover:bg-white text-gray-700"
        >
          <Key className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenSecurityModal}
          title="Security"
          className="p-2 rounded-xl hover:bg-white text-gray-700"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Static Docked Sidebar */}
      <aside className="hidden lg:flex w-60 min-w-[235px] bg-white px-3.5 pt-3.5 pb-4 flex-col flex-shrink-0 border-r border-gray-100/80 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Slide-Over Drawer with Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn"
          />

          {/* Drawer Container */}
          <div className="relative w-64 max-w-[80vw] bg-white h-full p-4 shadow-2xl flex flex-col z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
