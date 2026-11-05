import React, { useState } from 'react';
import {
  Shield,
  Search,
  CheckCircle2,
  Sliders,
  Lock,
  Globe,
  Users,
  Clock,
  ArrowRight,
  ExternalLink,
  Save,
  RotateCcw,
  Check,
  AlertTriangle
} from 'lucide-react';

export const SettingsPage = () => {
  // Active Tab
  const [activeSubTab, setActiveSubTab] = useState('financial-controls');
  const [searchQuery, setSearchQuery] = useState('');

  // Financial Controls State (matching screenshot)
  const [makerCheckerEnabled, setMakerCheckerEnabled] = useState(true);
  const [thresholdValue, setThresholdValue] = useState('$ 5,000.00');
  const [selectedCurrency, setSelectedCurrency] = useState('USDT/USDC');
  const [dailyCap, setDailyCap] = useState('$ 100,000.00');
  const [autoAmlFreeze, setAutoAmlFreeze] = useState(true);

  // General Settings State
  const [orgName, setOrgName] = useState('Harbor Demo Global Ltd');
  const [workspaceId, setWorkspaceId] = useState('ws_harbor_live_09');
  const [timezone, setTimezone] = useState('UTC (+00:00)');
  const [baseCurrency, setBaseCurrency] = useState('USD');

  // Security & 2FA Settings State
  const [enforce2fa, setEnforce2fa] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30 minutes');
  const [ipStrict, setIpStrict] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePublishToProd = () => {
    showToast('Governance rules published to Production successfully!');
  };

  const handleSaveFinancialPolicy = (e) => {
    e.preventDefault();
    showToast('Payout Authorization Policy updated & synced with Sandbox.');
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'team-access', label: 'Team & Access' },
    { id: 'security-2fa', label: 'Security & 2FA' },
    { id: 'financial-controls', label: 'Financial Controls' },
    { id: 'audit-log', label: 'Audit Log' }
  ];

  return (
    <div className="w-full flex flex-col space-y-4 animate-fadeIn">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-fadeIn border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#00C076]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP SUB-NAVIGATION ROW: Tabs on Left, Search on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
        {/* Horizontal Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 -webkit-overflow-scrolling-touch">
          {tabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-[11.5px] sm:text-[12px] font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-2xs border border-gray-200/90 font-semibold'
                    : 'bg-[#ECEEF2]/80 text-[#64748B] hover:text-gray-900 hover:bg-[#E2E5EA]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar matching screenshot */}
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search settings, policies, members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-white text-[12px] text-gray-800 placeholder-gray-400 rounded-full border border-gray-200/80 focus:border-[#00C076] focus:outline-none transition shadow-2xs"
          />
        </div>
      </div>

      {/* TAB CONTENT: Financial Controls (Primary Screenshot View) */}
      {activeSubTab === 'financial-controls' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT CARD: Payout Authorization Policy (Maker-Checker Rules) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              {/* Header with Icon */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                  <Shield className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-[#14171A]">
                    Payout Authorization Policy (Maker-Checker Rules)
                  </h3>
                  <p className="text-[11.5px] text-[#8E95A5] mt-0.5">
                    Define dual-control rules to eliminate withdrawal fraud and internal malfeasance.
                  </p>
                </div>
              </div>

              {/* Policy Row with ON/OFF Switch */}
              <div className="mt-6 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-[13px] font-bold text-[#14171A]">
                    Require Dual Approval for High-Value Payouts
                  </h4>
                  <p className="text-[11.5px] text-[#8E95A5] mt-0.5">
                    Payouts exceeding this threshold cannot be executed by the creator and require a 2nd checker.
                  </p>
                </div>

                {/* Signature Green Toggle Pill */}
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !makerCheckerEnabled;
                    setMakerCheckerEnabled(nextVal);
                    showToast(`Maker-Checker policy turned ${nextVal ? 'ON' : 'OFF'}`);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition select-none shadow-2xs ${
                    makerCheckerEnabled
                      ? 'bg-[#00C076] text-white hover:bg-[#00AA67]'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${makerCheckerEnabled ? 'bg-white' : 'bg-gray-400'}`} />
                  <span>{makerCheckerEnabled ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              {/* Threshold Input Box matching screenshot */}
              <div className="mt-4">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={thresholdValue}
                    onChange={(e) => setThresholdValue(e.target.value)}
                    className="w-full pl-4 pr-24 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-900 focus:outline-none focus:border-[#00C076] transition shadow-2xs"
                  />
                  <div className="absolute right-3.5 text-[11px] font-semibold text-gray-500 pointer-events-none tracking-tight">
                    {selectedCurrency}
                  </div>
                </div>
              </div>

              {/* Secondary Controls: Daily Volume Limit & AML Safeguards */}
              <div className="mt-6 pt-5 border-t border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-[12.5px] font-semibold text-[#14171A]">Daily Aggregate Withdrawal Limit</h5>
                    <p className="text-[11px] text-[#8E95A5]">Maximum automated payouts permitted in a 24h rolling window.</p>
                  </div>
                  <input
                    type="text"
                    value={dailyCap}
                    onChange={(e) => setDailyCap(e.target.value)}
                    className="w-32 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-right text-gray-800 focus:outline-none focus:border-[#00C076]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-[12.5px] font-semibold text-[#14171A]">Automated High-Risk AML Freeze</h5>
                    <p className="text-[11px] text-[#8E95A5]">Hold transactions with Chainalysis risk score &gt; 70 for manual review.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoAmlFreeze(!autoAmlFreeze)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                      autoAmlFreeze ? 'bg-[#00C076]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        autoAmlFreeze ? 'translate-x-4' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Save Policy Button */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-[#8E95A5]">
                Changes take effect instantly across all connected API clients.
              </span>
              <button
                type="button"
                onClick={handleSaveFinancialPolicy}
                className="px-4 py-1.5 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-full text-[11.5px] font-semibold shadow-xs transition select-none flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save policy</span>
              </button>
            </div>
          </div>

          {/* RIGHT CARD: Governance summary */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              {/* Header with Title and Sandbox Badge */}
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] sm:text-[16px] font-bold text-[#14171A]">
                  Governance summary
                </h3>
                <span className="px-2.5 py-0.5 bg-[#ECEEF2] text-gray-700 text-[10.5px] font-semibold rounded-full">
                  Sandbox
                </span>
              </div>

              {/* Subtext */}
              <p className="text-[11.5px] text-[#8E95A5] mt-2 mb-4 leading-relaxed">
                Review the current dual-control posture before publishing changes to production.
              </p>

              {/* Three Dark Cards matching the exact screenshot */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {/* Metric Box 1: Active policy */}
                <div className="bg-[#0C0D10] text-white p-3 sm:p-3.5 rounded-xl border border-[#23262D] flex flex-col justify-between">
                  <span className="text-[9.5px] sm:text-[10px] text-[#8E95A5] font-medium leading-tight">
                    Active policy
                  </span>
                  <div className="text-[11px] sm:text-[12px] font-bold text-white mt-1.5 truncate">
                    {makerCheckerEnabled ? 'Maker-Checker' : 'Disabled'}
                  </div>
                </div>

                {/* Metric Box 2: Threshold */}
                <div className="bg-[#0C0D10] text-white p-3 sm:p-3.5 rounded-xl border border-[#23262D] flex flex-col justify-between">
                  <span className="text-[9.5px] sm:text-[10px] text-[#8E95A5] font-medium leading-tight">
                    Threshold
                  </span>
                  <div className="text-[11px] sm:text-[12px] font-bold text-white mt-1.5 truncate">
                    {makerCheckerEnabled ? thresholdValue.replace(/\s+/g, '') : 'None'}
                  </div>
                </div>

                {/* Metric Box 3: Currencies */}
                <div className="bg-[#0C0D10] text-white p-3 sm:p-3.5 rounded-xl border border-[#23262D] flex flex-col justify-between">
                  <span className="text-[9.5px] sm:text-[10px] text-[#8E95A5] font-medium leading-tight">
                    Currencies
                  </span>
                  <div className="text-[11px] sm:text-[12px] font-bold text-white mt-1.5 truncate">
                    {selectedCurrency}
                  </div>
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="mt-5 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C076] shrink-0" />
                  <span className="text-[11px]">2nd checker required on payouts &gt; {thresholdValue}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C076] shrink-0" />
                  <span className="text-[11px]">Creators cannot self-approve batch payouts</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C076] shrink-0" />
                  <span className="text-[11px]">All authorization actions logged to audit trail</span>
                </div>
              </div>
            </div>

            {/* Bottom Action: Publish to production */}
            <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10.5px] text-[#8E95A5]">
                Environment: Demo Sandbox (v2.4)
              </span>
              <button
                type="button"
                onClick={handlePublishToProd}
                className="px-3.5 py-1.5 bg-gray-900 hover:bg-black text-white rounded-full text-[11px] font-semibold transition select-none flex items-center gap-1.5"
              >
                <span>Publish to prod</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: General */}
      {activeSubTab === 'general' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4 max-w-3xl">
          <h3 className="text-base font-bold text-[#14171A]">General Organization Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-gray-700 block mb-1">Legal Entity / Organization</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#00C076]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-700 block mb-1">Workspace ID</label>
              <input
                type="text"
                disabled
                value={workspaceId}
                className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-700 block mb-1">Reporting Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#00C076]"
              >
                <option value="UTC (+00:00)">UTC (+00:00) — Greenwich Mean Time</option>
                <option value="EST (-05:00)">EST (-05:00) — New York</option>
                <option value="CET (+01:00)">CET (+01:00) — Paris / Berlin</option>
                <option value="SGT (+08:00)">SGT (+08:00) — Singapore</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-700 block mb-1">Base Ledger Currency</label>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#00C076]"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
          <div className="pt-3 flex justify-end">
            <button
              onClick={() => showToast('General settings saved.')}
              className="px-4 py-2 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Save General Settings
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Team & Access */}
      {activeSubTab === 'team-access' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4 max-w-3xl">
          <h3 className="text-base font-bold text-[#14171A]">Team & Access Governance</h3>
          <p className="text-xs text-gray-500">Configure default roles, invitation rules, and seat allocations.</p>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800">Default Role for New Invites</div>
                <div className="text-[11px] text-gray-500">New team members receive this role upon acceptance.</div>
              </div>
              <span className="font-semibold text-gray-700 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                Operations analyst
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800">Invitation Link Expiry</div>
                <div className="text-[11px] text-gray-500">Unaccepted invite tokens expire automatically.</div>
              </div>
              <span className="font-semibold text-gray-700 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                7 days
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Security & 2FA */}
      {activeSubTab === 'security-2fa' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4 max-w-3xl">
          <h3 className="text-base font-bold text-[#14171A]">Security & Authentication</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800">Mandatory Multi-Factor Authentication</div>
                <div className="text-[11px] text-gray-500">Requires FIDO2 WebAuthn or TOTP authenticator app.</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEnforce2fa(!enforce2fa);
                  showToast(`2FA enforcement ${!enforce2fa ? 'enabled' : 'disabled'}`);
                }}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  enforce2fa ? 'bg-[#00C076]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    enforce2fa ? 'translate-x-4' : ''
                  }`}
                />
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800">Session Idle Inactivity Timeout</div>
                <div className="text-[11px] text-gray-500">Auto sign-out after duration of user inactivity.</div>
              </div>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
              >
                <option value="15 minutes">15 minutes</option>
                <option value="30 minutes">30 minutes</option>
                <option value="1 hour">1 hour</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Audit Log */}
      {activeSubTab === 'audit-log' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#14171A]">Governance & Settings Audit Trail</h3>
            <span className="text-[11px] text-gray-400">Showing recent 4 events</span>
          </div>
          <div className="divide-y divide-gray-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Maker-Checker dual-control threshold updated to $5,000.00</div>
                <div className="text-[10.5px] text-gray-500">By Nora Vale · 14:18 UTC</div>
              </div>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[10px] font-semibold">Config</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Sandbox environment refreshed with new TRM risk rules</div>
                <div className="text-[10.5px] text-gray-500">By System Daemon · 13:45 UTC</div>
              </div>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[10px] font-semibold">System</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

