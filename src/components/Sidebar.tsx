import React from 'react';
import {
  Box,
  Code2,
  ChevronDown,
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
  CheckSquare
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
  userName = 'Daniel Vance'
}) => {
  const firstName = (userName || 'Daniel').trim().split(' ')[0] || 'Daniel';

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
        { id: 'admin-exceptions', label: 'Exceptions & Sweeps', icon: 'alert-octagon' },
        { id: 'admin-payouts', label: 'Maker-Checker Queue', icon: 'check-square' },
      ]
    },
    {
      title: 'SECURITY & AUDIT',
      items: [
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
    const iconClass = "w-3.5 h-3.5 text-white stroke-[2.2]";
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
      case 'admin-exceptions':
        return <AlertOctagon className={iconClass} />;
      case 'admin-payouts':
        return <CheckSquare className={iconClass} />;
      case 'admin-audit':
        return <FileText className={iconClass} />;
      default:
        return <Box className={iconClass} />;
    }
  };

  const renderInactiveIcon = (id: string) => {
    const iconClass = "w-3.5 h-3.5 stroke-[1.8] text-[#64748B] group-hover:text-[#1E293B] transition-colors";
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
      case 'admin-exceptions':
        return <AlertOctagon className={iconClass} />;
      case 'admin-payouts':
        return <CheckSquare className={iconClass} />;
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
        <div className="mb-3 flex items-start justify-between">
          <div>
            {portalMode === 'admin' ? (
              <div>
                <h2 className="text-[20px] leading-[1.12] font-bold text-[#14171A]">
                  Admin Ops
                </h2>
                <p className="text-[10.5px] text-[#8E95A5] mt-0.5 font-normal tracking-tight">
                  High-privilege platform controls
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-[22px] leading-[1.12] font-semibold text-[#14171A]">
                  Welcome<br />
                  <span className="font-bold">Back, {firstName}!</span>
                </h2>
                <p className="text-[10.5px] text-[#8E95A5] mt-1 font-normal tracking-tight">
                  checkout your recent financial activity
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
        <nav className="flex flex-col gap-2.5 overflow-y-auto pr-0.5">
          {currentSections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-0.5">
              <span className="text-[9.5px] tracking-wider uppercase font-semibold text-[#8E95A5] px-2 mb-0.5">
                {section.title}
              </span>

              {section.items.map((item) => {
                const isActive = currentActive === item.id;
                const activeColorClass =
                  portalMode === 'admin'
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-[#00C076] text-white hover:bg-[#00B16D]';

                if (isActive) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`w-full flex items-center justify-between ${activeColorClass} px-3 py-1.5 rounded-full shadow-sm transition-all group`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 flex items-center justify-center shrink-0">
                          {renderActiveIcon(item.id)}
                        </div>
                        <span className="text-[12.5px] font-medium tracking-tight">
                          {item.label}
                        </span>
                      </div>
                      <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <ChevronDown className="w-3 h-3 text-white" />
                      </div>
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-full text-left transition-colors duration-150 group text-[#64748B] hover:text-[#1E293B] hover:bg-gray-100/60"
                  >
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      {renderInactiveIcon(item.id)}
                    </div>
                    <span className="text-[12px] font-normal">
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
      <aside className="hidden lg:flex w-56 min-w-[215px] bg-white px-4 pt-3.5 pb-4 flex-col flex-shrink-0 border-r border-gray-100/80 overflow-y-auto">
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
