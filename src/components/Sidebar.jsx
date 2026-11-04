import React from 'react';
import { Box, Code2, ChevronDown, ArrowDownToLine } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, onOpenDevModal, onOpenSecurityModal }) => {
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
        { id: 'exceptions', label: 'Exceptions', icon: 'dot' },
      ]
    },
    {
      title: 'MONEY OUT',
      items: [
        { id: 'payouts', label: 'Payouts', icon: 'dot' },
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
    if (item.id === 'developers') {
      setActiveTab('developers');
      onOpenDevModal();
    } else if (item.id === 'team-security') {
      setActiveTab('team-security');
      onOpenSecurityModal();
    } else {
      setActiveTab(item.id);
    }
  };

  return (
    <aside className="w-56 min-w-[215px] bg-white px-4 pt-3.5 pb-4 flex flex-col flex-shrink-0 select-none overflow-y-auto">
      {/* Welcome Heading - Fitted */}
      <div className="mb-4">
        <h2 className="text-[22px] leading-[1.12] font-semibold text-[#14171A]">
          Welcome<br />
          <span className="font-bold">Back, Daniel!</span>
        </h2>
        <p className="text-[10.5px] text-[#8E95A5] mt-1 font-normal tracking-tight">
          checkout your recent financial activity
        </p>
      </div>

      {/* Nav Menu - Fitted vertical spacing */}
      <nav className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-0.5">
        {navSections.map((section, idx) => (
          <div key={idx} className="flex flex-col gap-0.5">
            <span className="text-[9.5px] tracking-wider uppercase font-semibold text-[#8E95A5] px-2 mb-0.5">
              {section.title}
            </span>

            {section.items.map((item) => {
              const isActive = activeTab === item.id;

              // If item is active and either 'dashboard' or 'deposits', display the signature vibrant green pill
              if (isActive && (item.id === 'dashboard' || item.id === 'deposits')) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center justify-between bg-[#00C076] text-white px-3 py-1.5 rounded-full shadow-sm hover:bg-[#00B16D] transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      {item.id === 'dashboard' ? (
                        <Box className="w-3.5 h-3.5 text-white stroke-[2.2]" />
                      ) : (
                        <ArrowDownToLine className="w-3.5 h-3.5 text-white stroke-[2.2]" />
                      )}
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
                  className={`w-full flex items-center gap-2 px-2.5 py-1 rounded-md text-left transition-colors duration-150 group ${
                    isActive
                      ? 'text-[#00C076] font-medium'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50'
                  }`}
                >
                  {item.id === 'dashboard' ? (
                    <div className="w-3.5 flex items-center justify-center text-[#64748B] group-hover:text-[#1E293B]">
                      <Box className="w-3.5 h-3.5 stroke-[1.8]" />
                    </div>
                  ) : item.icon === 'code' ? (
                    <div className="w-3.5 flex items-center justify-center text-[#64748B] group-hover:text-[#1E293B]">
                      <Code2 className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-3.5 flex items-center justify-center">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        isActive ? 'bg-[#00C076]' : 'bg-[#94A3B8] group-hover:bg-[#64748B]'
                      }`} />
                    </div>
                  )}
                  <span className={`text-[12px] ${isActive ? 'font-semibold text-[#14171A]' : 'font-normal'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
};
