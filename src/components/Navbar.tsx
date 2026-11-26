import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Key,
  Lock,
  Play,
  RotateCcw,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { CopyMLogo } from './Graphics';
import { AMLRiskBadge } from './AMLRiskBadge';
import { PortalMode } from '../types';

export interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isLiveSimulating: boolean;
  setIsLiveSimulating: (active: boolean) => void;
  onOpenDevModal: () => void;
  onOpenSecurityModal: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  onSignOut?: () => void;
  currentUser?: { name: string; email: string };
  portalMode?: PortalMode;
  isLiveEnvironment?: boolean;
  onToggleEnvironment?: (toLive: boolean) => void;
  kybStatus?: 'DRAFT' | 'UNDER_REVIEW' | 'ACTION_REQUIRED' | 'APPROVED';
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  onRefresh,
  isRefreshing,
  isLiveSimulating,
  setIsLiveSimulating,
  onOpenDevModal,
  onOpenSecurityModal,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  onSignOut,
  currentUser,
  portalMode = 'merchant',
  isLiveEnvironment = false,
  onToggleEnvironment,
  kybStatus = 'DRAFT'
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotificationMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotificationMenu(false);
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fullDisplayName = currentUser?.name || (portalMode === 'admin' ? 'Sarah Chen (Platform SuperAdmin)' : 'Nora Vale');
  const displayName = fullDisplayName.trim().split(' ')[0] || fullDisplayName;
  const displayEmail = currentUser?.email || (portalMode === 'admin' ? 'admin@copym.com' : 'nora@apexforex.example.com');

  return (
    <header className="w-full bg-white px-3 sm:px-6 lg:px-6 py-2.5 flex items-center justify-between border-b border-gray-100/90 sticky top-0 z-40">
      {/* Left: Mobile Hamburger Toggle + Brand Logo + Portal Mode Switcher */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="lg:hidden p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand Logo */}
        <div className="flex items-center gap-2 select-none">
          <CopyMLogo className="w-6 h-6 sm:w-7 sm:h-7" />
          <div className="flex items-baseline text-[18px] sm:text-[20px] tracking-tight">
            <span className="font-bold text-[#14171A]">CopyM</span>
            <span className="font-bold text-[#00C076] ml-1">Pay</span>
          </div>
        </div>

        {/* Environment Mode Switcher (Sandbox vs Live) - Merchant Only, or Admin Operator Pill */}
        {portalMode === 'merchant' ? (
          <div className="hidden md:flex items-center bg-gray-100/90 p-0.5 rounded-full border border-gray-200/70 select-none text-[11px] font-semibold ml-1 sm:ml-2">
            <button
              onClick={() => onToggleEnvironment?.(false)}
              className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                !isLiveEnvironment
                  ? 'bg-amber-100 text-amber-900 border border-amber-300/80 shadow-2xs font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Sandbox Testnet Mode"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${!isLiveEnvironment ? 'bg-amber-500 animate-pulse' : 'bg-gray-400'}`} />
              <span>Sandbox</span>
            </button>
            <button
              onClick={() => onToggleEnvironment?.(true)}
              className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                isLiveEnvironment
                  ? 'bg-[#00C076] text-white shadow-2xs font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title={kybStatus === 'APPROVED' ? 'Live Production Mode' : 'Live Mode (Requires Corporate KYB Verification)'}
            >
              {kybStatus !== 'APPROVED' ? (
                <Lock className="w-3 h-3 text-amber-600" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
              <span>Live</span>
              {kybStatus !== 'APPROVED' && (
                <span className="text-[9px] px-1 py-0.2 bg-amber-200 text-amber-900 rounded font-bold">
                  LOCK
                </span>
              )}
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 ml-2">
            <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold tracking-wide flex items-center gap-1.5 border border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse" />
              <span>OPS CONSOLE · PRODUCTION</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#007F4E] text-[11px] font-bold border border-emerald-200">
              Role: SuperAdmin
            </span>
          </div>
        )}
      </div>

      {/* Right Controls & Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar (Desktop / Tablet) */}
        <div className="w-40 sm:w-48 md:w-56 lg:w-64 hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder={portalMode === 'admin' ? "Search alerts, KYB, sweeps..." : "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-7 py-1.5 bg-[#EAEBEF] hover:bg-[#E4E6EA] focus:bg-white text-[13px] text-gray-800 placeholder-gray-400 rounded-full border border-transparent focus:border-[#00C076] focus:outline-none transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Button */}
        <button
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="md:hidden p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Modern Vector Icons Action Bar (Merchant Only) */}
        {portalMode === 'merchant' && (
          <div className="hidden xl:flex items-center gap-1 bg-gray-100/70 p-0.5 rounded-full border border-gray-200/50">
            {/* RotateCcw: Refresh button */}
            <button
              onClick={onRefresh}
              title="Refresh Transactions"
              className="p-1.5 rounded-full hover:bg-white text-gray-600 hover:text-gray-900 transition-all shadow-none hover:shadow-sm cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00C076]' : ''}`} />
            </button>

            {/* Play: Live Feed Simulator */}
            <button
              onClick={() => setIsLiveSimulating(!isLiveSimulating)}
              title={isLiveSimulating ? "Live Streaming Active" : "Simulate Incoming Payments"}
              className={`p-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                isLiveSimulating
                  ? 'bg-[#00C076] text-white shadow-sm'
                  : 'hover:bg-white text-gray-600 hover:text-gray-900'
              }`}
            >
              <Play className={`w-3 h-3 ${isLiveSimulating ? 'fill-white' : ''}`} />
              {isLiveSimulating && <span className="text-[9px] font-semibold pr-1">LIVE</span>}
            </button>

            {/* Key: Developer API Keys */}
            <button
              onClick={onOpenDevModal}
              title="Developer API Credentials"
              className="p-1.5 rounded-full hover:bg-white text-gray-600 hover:text-gray-900 transition-all cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
            </button>

            {/* Lock: Security & Lock */}
            <button
              onClick={onOpenSecurityModal}
              title="Security Vault & Permissions"
              className="p-1.5 rounded-full hover:bg-white text-gray-600 hover:text-gray-900 transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* AML Risk Indicator (Merchant Only) */}
        {portalMode === 'merchant' && (
          <div className="hidden sm:block">
            <AMLRiskBadge level="Low" score={96} />
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              const next = !showNotificationMenu;
              setShowNotificationMenu(next);
              if (next) setShowProfileMenu(false);
            }}
            className="w-8 h-8 rounded-full bg-[#EAEBEF] hover:bg-[#E2E4E9] flex items-center justify-center text-gray-700 transition relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5 text-gray-700" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#00C076] rounded-full ring-2 ring-white"></span>
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-fadeIn">
              <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-xs text-gray-700">Notifications</span>
                <span className="text-[11px] text-[#00C076] font-medium cursor-pointer">Mark read</span>
              </div>
              <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-xs">
                <p className="font-medium text-gray-900">Deposit dep_8Hq2..f31 Credited</p>
                <p className="text-gray-500 text-[11px]">2,500.00 USDT received on TRON</p>
                <span className="text-[10px] text-gray-400">2 min ago</span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill - Responsive Clamping */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              const next = !showProfileMenu;
              setShowProfileMenu(next);
              if (next) setShowNotificationMenu(false);
            }}
            className="flex items-center gap-1.5 sm:gap-2 text-white pl-1 pr-2 sm:pr-2.5 py-1 rounded-full shadow-sm transition-all select-none bg-[#00C076] hover:bg-[#00AA67] cursor-pointer"
          >
            {/* Dark circular avatar */}
            <div className="w-6 h-6 rounded-full bg-[#111827] flex items-center justify-center overflow-hidden border border-white/20 flex-shrink-0">
              <User className="w-3.5 h-3.5 text-gray-200" />
            </div>

            {/* Profile info */}
            <div className="text-left flex flex-col leading-none">
              <span className="text-[11.5px] font-bold text-white tracking-wide truncate max-w-[90px] sm:max-w-[120px]">
                {displayName}
              </span>
              <span className="text-[9.5px] text-emerald-100/90 font-medium tracking-normal mt-0.5 hidden xs:inline truncate max-w-[120px]">
                {portalMode === 'admin' ? 'SuperAdmin' : displayEmail}
              </span>
            </div>

            {/* Dropdown Chevron */}
            <ChevronDown className={`w-3 h-3 text-white ml-0.5 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-900 truncate">{fullDisplayName}</p>
                <p className="text-[11px] text-gray-500 truncate">{displayEmail}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                  {portalMode === 'admin' ? 'Platform SuperAdmin' : 'Merchant Owner'}
                </span>
              </div>

              <button
                onClick={() => { setShowProfileMenu(false); onOpenSecurityModal(); }}
                className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                Security & 2FA
              </button>
              <button
                onClick={() => { setShowProfileMenu(false); onOpenDevModal(); }}
                className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Key className="w-3.5 h-3.5 text-gray-400" />
                API Credentials
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onSignOut?.();
                }}
                className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-gray-500" />
                Sign Out / Lock Portal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Mobile Search Drawer */}
      {mobileSearchOpen && (
        <div className="absolute top-full left-0 w-full bg-white px-4 py-2.5 border-b border-gray-200 md:hidden z-30 shadow-md">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#EAEBEF] text-xs text-gray-800 rounded-full border border-transparent focus:border-[#00C076] focus:outline-none"
            />
            <button
              onClick={() => {
                setSearchQuery('');
                setMobileSearchOpen(false);
              }}
              className="absolute right-3 text-xs text-gray-500 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
