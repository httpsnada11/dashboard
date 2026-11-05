import React from 'react';
import { Box, Code2, ChevronDown, ArrowDownToLine, AlertCircle, ArrowUpFromLine, X, Key, Lock, Play, RotateCcw, ShieldCheck, Settings as SettingsIcon } from 'lucide-react';

export const Sidebar = ({
  activeTab,
  setActiveTab,
  onOpenDevModal,
  onOpenSecurityModal,
  isOpen,
  onClose,
  onRefresh,
  isRefreshing,
  isLiveSimulating,
  setIsLiveSimulating
}) => {
  const navSections = [
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
      ]
    },
    {
      title: 'TREASURY',
      items: [
        { id: 'balances', label: 'Balances', icon: 'dot' },
        { id: 'convert', label: 'Convert', icon: 'dot' },
        { id: 'statements', label: 'Statements', icon: 'dot' },
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
        { id: 'team-security', label: 'Team & security', icon: 'dot' },
        { id: 'settings', label: 'Settings', icon: 'dot' },
      ]
    }
  ];

  const handleItemClick = (item) => {
    setActiveTab(item.id);
    // Close mobile drawer on selection
    onClose?.();
  };

  const renderActiveIcon = (id) => {
    switch (id) {
      case 'dashboard':
        return <Box className="w-3.5 h-3.5 text-white stroke-[2.2]" />;
      case 'deposits':
        return <ArrowDownToLine className="w-3.5 h-3.5 text-white stroke-[2.2]" />;
      case 'exceptions':
        return <AlertCircle className="w-3.5 h-3.5 text-white stroke-[2.2]" />;
      case 'payouts':
        return <ArrowUpFromLine className="w-3.5 h-3.5 text-white stroke-[2.2]" />;
      case 'developers':
        return <Code2 className="w-3.5 h-3.5 text-white stroke-[2.2]" />;
      case 'team-security':
        return <ShieldCheck className="w-3.5 h-3.5 text-white stroke-[2.2]" />;
      case 'settings':
        return <SettingsIcon className="w-3.5 h-3.5 text-white stroke-[2.2]" />;
      default:
        return <div className="w-1.5 h-1.5 rounded-full bg-white" />;
    }
  };

  const renderInactiveIcon = (id, icon) => {
    switch (id) {
      case 'dashboard':
        return (
          <div className="w-3.5 flex items-center justify-center text-[#64748B] group-hover:text-[#1E293B]">
            <Box className="w-3.5 h-3.5 stroke-[1.8]" />
          </div>
        );
      case 'deposits':
        return (
          <div className="w-3.5 flex items-center justify-center text-[#64748B] group-hover:text-[#1E293B]">
            <ArrowDownToLine className="w-3.5 h-3.5 stroke-[1.8]" />
          </div>
        );
      case 'team-security':
        return (
          <div className="w-3.5 flex items-center justify-center text-[#64748B] group-hover:text-[#1E293B]">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        );
      case 'settings':
        return (
          <div className="w-3.5 flex items-center justify-center text-[#64748B] group-hover:text-[#1E293B]">
            <SettingsIcon className="w-3.5 h-3.5" />
          </div>
        );
      case 'exceptions':
      case 'payouts':
      default:
        if (icon === 'code') {
          return (
            <div className="w-3.5 flex items-center justify-center text-[#64748B] group-hover:text-[#1E293B]">
              <Code2 className="w-3.5 h-3.5" />
            </div>
          );
        }
        return (
          <div className="w-3.5 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] group-hover:bg-[#64748B]" />
          </div>
        );
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between select-none">
      <div>
        {/* Welcome Heading & Mobile Close Button */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-[22px] leading-[1.12] font-semibold text-[#14171A]">
              Welcome<br />
              <span className="font-bold">Back, Daniel!</span>
            </h2>
            <p className="text-[10.5px] text-[#8E95A5] mt-1 font-normal tracking-tight">
              checkout your recent financial activity
            </p>
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
          {navSections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-0.5">
              <span className="text-[9.5px] tracking-wider uppercase font-semibold text-[#8E95A5] px-2 mb-0.5">
                {section.title}
              </span>

              {section.items.map((item) => {
                const isActive = activeTab === item.id;

                // When active, display signature vibrant emerald green pill
                if (isActive) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="w-full flex items-center justify-between bg-[#00C076] text-white px-3 py-1.5 rounded-full shadow-sm hover:bg-[#00B16D] transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        {renderActiveIcon(item.id)}
                        <span className="text-[12.5px] font-medium tracking-tight">
                          {item.label}
                        </span>
                      </div>
                      <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                        <ChevronDown className="w-3 h-3 text-white" />
                      </div>
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center gap-2 px-2.5 py-1 rounded-md text-left transition-colors duration-150 group text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50"
                  >
                    {renderInactiveIcon(item.id, item.icon)}
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
