import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Key, Lock, Play, RotateCcw, ExternalLink, ShieldCheck, User, LogOut } from 'lucide-react';
import { CopyMLogo } from './Graphics';
import { AMLRiskBadge } from './AMLRiskBadge';

export const Navbar = ({
  searchQuery,
  setSearchQuery,
  onRefresh,
  isRefreshing,
  isLiveSimulating,
  setIsLiveSimulating,
  onOpenDevModal,
  onOpenSecurityModal
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  return (
    <header className="w-full bg-white px-5 sm:px-7 py-2.5 flex items-center justify-between border-b border-gray-100/80 sticky top-0 z-30">
      {/* Left: Brand Logo */}
      <div className="flex items-center gap-2 cursor-pointer select-none">
        <CopyMLogo className="w-6 h-6" />
        <div className="flex items-baseline text-[19px] tracking-tight">
          <span className="font-bold text-[#14171A]">CopyM</span>
          <span className="font-bold text-[#00C076] ml-1">Pay</span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-lg mx-6 hidden md:block">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-[#EAEBEF] hover:bg-[#E4E6EA] focus:bg-white text-[13px] text-gray-800 placeholder-gray-400 rounded-full border border-transparent focus:border-[#00C076] focus:outline-none transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full w-3.5 h-3.5 flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Modern Vector Icons Action Bar */}
        <div className="hidden lg:flex items-center gap-1 bg-gray-100/70 p-0.5 rounded-full border border-gray-200/50">
          {/* RotateCcw: Refresh button */}
          <button
            onClick={onRefresh}
            title="Refresh Transactions (RotateCcw)"
            className="p-1.5 rounded-full hover:bg-white text-gray-600 hover:text-gray-900 transition-all shadow-none hover:shadow-sm"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00C076]' : ''}`} />
          </button>

          {/* Play: Live Feed Simulator */}
          <button
            onClick={() => setIsLiveSimulating(!isLiveSimulating)}
            title={isLiveSimulating ? "Live Streaming Active" : "Simulate Incoming Payments (Play)"}
            className={`p-1.5 rounded-full transition-all flex items-center gap-1 ${
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
            title="Developer API Keys (Key)"
            className="p-1.5 rounded-full hover:bg-white text-gray-600 hover:text-gray-900 transition-all"
          >
            <Key className="w-3.5 h-3.5" />
          </button>

          {/* Lock: Security & Lock */}
          <button
            onClick={onOpenSecurityModal}
            title="Security Vault & Permissions (Lock)"
            className="p-1.5 rounded-full hover:bg-white text-gray-600 hover:text-gray-900 transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AML Risk Indicator */}
        <div className="hidden sm:block">
          <AMLRiskBadge level="Low" score={96} />
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="w-8 h-8 rounded-full bg-[#EAEBEF] hover:bg-[#E2E4E9] flex items-center justify-center text-gray-700 transition relative"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5 text-gray-700" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#00C076] rounded-full ring-2 ring-white"></span>
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50">
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

        {/* Daniel User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 bg-[#00C076] hover:bg-[#00AA67] text-white pl-1 pr-2.5 py-1 rounded-full shadow-sm transition-all select-none"
          >
            {/* Dark circular avatar */}
            <div className="w-6 h-6 rounded-full bg-[#111827] flex items-center justify-center overflow-hidden border border-white/20">
              <User className="w-3.5 h-3.5 text-gray-200" />
            </div>

            {/* Profile info */}
            <div className="text-left flex flex-col leading-none">
              <span className="text-[11.5px] font-bold text-white tracking-wide">Daniel</span>
              <span className="text-[9.5px] text-emerald-100/90 font-medium tracking-normal mt-0.5">daniel@gmail.com</span>
            </div>

            {/* Dropdown Chevron */}
            <ChevronDown className={`w-3 h-3 text-white ml-0.5 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-900">Daniel Vance</p>
                <p className="text-[11px] text-gray-500 truncate">daniel@gmail.com</p>
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
                onClick={() => setShowProfileMenu(false)}
                className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
