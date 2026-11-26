import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  CheckCircle2,
  ArrowRight,
  Save,
  Building2,
  FileCheck2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Users
} from 'lucide-react';
import { Toggle } from '../components/Toggle';
import { KybApplicationData } from '../types';
import {
  getKybApplication,
  subscribeKybStatus,
  getKybStatusLabel,
  getKybStatusColor
} from '../utils/kybStorage';

export interface SettingsPageProps {
  onOpenKybWizard?: (step?: number) => void;
  initialTab?: string;
}

interface SettingsState {
  makerCheckerEnabled: boolean;
  thresholdValue: string;
  dailyCap: string;
  autoAmlFreeze: boolean;
  orgName: string;
  timezone: string;
  baseCurrency: string;
  enforce2fa: boolean;
  sessionTimeout: string;
}

const defaultSettings: SettingsState = {
  makerCheckerEnabled: true,
  thresholdValue: '$ 5,000.00',
  dailyCap: '$ 100,000.00',
  autoAmlFreeze: true,
  orgName: 'CopyM Global Ltd',
  timezone: 'UTC (+00:00)',
  baseCurrency: 'USD',
  enforce2fa: true,
  sessionTimeout: '30 minutes'
};

const selectedCurrency = 'USDT/USDC';
const workspaceId = 'ws_copym_live_09';

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenKybWizard, initialTab = 'general' }) => {
  const [activeSubTab, setActiveSubTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [kybApp, setKybApp] = useState<KybApplicationData>(getKybApplication());
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [savedSettings, setSavedSettings] = useState<SettingsState>(defaultSettings);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeKybStatus(setKybApp);
    return unsub;
  }, []);

  const hasUnsavedChanges = (Object.keys(settings) as Array<keyof SettingsState>).some(
    (key) => settings[key] !== savedSettings[key]
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSavedSettings(settings);
    showToast('Settings saved.');
  };

  const tabs = [
    { id: 'compliance-kyb', label: 'Corporate Verification (KYB)' },
    { id: 'general', label: 'General' },
    { id: 'security-2fa', label: 'Security & 2FA' },
    { id: 'financial-controls', label: 'Financial Controls' },
    { id: 'audit-log', label: 'Audit Log' }
  ];

  const visibleTabs = tabs.filter((tab) => tab.label.toLowerCase().includes(searchQuery.trim().toLowerCase()));

  return (
    <div className="w-full flex flex-col space-y-4 animate-fadeIn">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-fadeIn border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#007F4E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP SUB-NAVIGATION ROW: Tabs on Left, Search on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
        {/* Horizontal Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 -webkit-overflow-scrolling-touch">
          {visibleTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-[12px] font-medium transition-all whitespace-nowrap ${
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
          <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search settings, policies, members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-white text-[12px] text-gray-800 placeholder-[#6B7280] rounded-full border border-gray-200/80 focus:border-[#007F4E] focus:outline-none transition shadow-2xs"
          />
        </div>
      </div>

      {/* TAB CONTENT: Corporate Verification (KYB) */}
      {activeSubTab === 'compliance-kyb' && (
        <div className="space-y-4">
          {/* Top Status Banner according to Lifecycle State */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-[#14171A]">
                      Corporate Verification (KYB)
                    </h3>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${getKybStatusColor(kybApp.status)}`}>
                      {getKybStatusLabel(kybApp.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Submit company details and documents for verification.
                  </p>
                </div>
              </div>

              {/* Action Buttons based on Status */}
              <div className="flex items-center gap-2">
                {kybApp.status === 'DRAFT' && (
                  <button
                    onClick={() => onOpenKybWizard?.(kybApp.currentStep || 1)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <span>Resume Verification (Step {kybApp.currentStep || 1})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {kybApp.status === 'UNDER_REVIEW' && (
                  <button
                    onClick={() => onOpenKybWizard?.(1)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <span>Review Filed Application</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                {kybApp.status === 'ACTION_REQUIRED' && (
                  <button
                    onClick={() => onOpenKybWizard?.(3)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <span>Fix Rejected Documents (Step 3)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {kybApp.status === 'APPROVED' && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-[#007F4E]" />
                    <span>Verification Complete</span>
                  </div>
                )}
              </div>
            </div>

            {/* Diagnostic Alert depending on State */}
            {kybApp.status === 'DRAFT' && (
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Verification Incomplete (Step {kybApp.currentStep || 1} of 4):</strong> Sandbox access is available for test keys and cashier simulations. Complete verification to enable live processing.
                </div>
              </div>
            )}

            {kybApp.status === 'UNDER_REVIEW' && (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-spin-slow" />
                <div className="leading-relaxed">
                  <strong>In Review:</strong> Your application was submitted on Nov 18 and is being reviewed. Review times vary, and Sandbox remains available.
                </div>
              </div>
            )}

            {kybApp.status === 'ACTION_REQUIRED' && (
              <div className="p-3.5 rounded-xl bg-rose-50/90 border border-rose-200/90 text-xs text-rose-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Compliance Feedback:</strong> {kybApp.complianceFeedback || 'The proof of address uploaded was older than 90 days. Please upload a recent bank statement or utility bill.'}
                  <button
                    onClick={() => onOpenKybWizard?.(3)}
                    className="ml-2 font-bold underline hover:text-rose-950 inline-block cursor-pointer"
                  >
                    Upload replacement document now →
                  </button>
                </div>
              </div>
            )}

            {kybApp.status === 'APPROVED' && (
              <div className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200/90 text-xs text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#007F4E] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Verification Complete:</strong> Verification is complete for this workspace. Live mode and production keys are available where enabled.
                </div>
              </div>
            )}
          </div>

          {/* 2 Detail Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Card 1: Entity Details */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-bold text-gray-900 text-[13px] pb-2 border-b border-gray-100">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>1. Company Entity</span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-xs uppercase font-bold text-[#6B7280] block">Legal Company Name</span>
                  <span className="font-semibold text-gray-800">{kybApp.company.legalName}</span>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-[#6B7280] block">Registration / Tax Number</span>
                  <span className="font-mono text-gray-800">{kybApp.company.registrationNumber}</span>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-[#6B7280] block">Jurisdiction</span>
                  <span className="text-gray-800">{kybApp.company.jurisdiction}</span>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-[#6B7280] block">Operating Address</span>
                  <span className="text-gray-700 leading-tight block">{kybApp.company.operatingAddress}</span>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-[#6B7280] block">Corporate URL</span>
                  <a href={kybApp.company.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-medium">
                    <span>{kybApp.company.websiteUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Card 2: Directors & Beneficial Owners */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-bold text-gray-900 text-[13px] pb-2 border-b border-gray-100">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>2. Directors & UBOs (≥25%)</span>
              </div>
              <div className="space-y-3">
                {kybApp.directors.map((dir) => (
                  <div key={dir.id} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{dir.fullName}</span>
                      <span className="font-bold text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {dir.ownershipPercentage}% Shares
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      DOB: {dir.dateOfBirth} · {dir.nationality}
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-xs px-1.5 py-0.2 rounded bg-white border border-gray-200 text-gray-700 font-semibold">
                        {dir.isDirector ? 'Managing Director' : 'Beneficial Owner'}
                      </span>
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Screening complete
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Document Vault Inventory Table */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-gray-900 text-[14px]">Document Vault Inventory (Step 3)</h4>
              </div>
              <button
                onClick={() => onOpenKybWizard?.(3)}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Open Document Vault</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[#6B7280] text-xs uppercase font-bold tracking-wider border-b border-gray-100 pb-2">
                    <th className="py-2">Document Type</th>
                    <th className="py-2">File Name</th>
                    <th className="py-2">Size</th>
                    <th className="py-2">Uploaded</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {kybApp.documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 font-semibold text-gray-800">
                        <div>{doc.title}</div>
                        {doc.rejectionReason && (
                          <div className="text-xs text-rose-600 font-medium mt-0.5">
                            {doc.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="py-3 font-mono text-xs text-gray-700">
                        {doc.fileName || 'Not uploaded yet'}
                      </td>
                      <td className="py-3 text-gray-500">{doc.fileSize || '—'}</td>
                      <td className="py-3 text-gray-500">{doc.uploadDate || '—'}</td>
                      <td className="py-3">
                        {doc.status === 'VERIFIED' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Verified
                          </span>
                        )}
                        {doc.status === 'UPLOADED' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            In Review
                          </span>
                        )}
                        {doc.status === 'REJECTED' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Rejected
                          </span>
                        )}
                        {doc.status === 'PENDING' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onOpenKybWizard?.(3)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                          {doc.status === 'REJECTED' ? 'Re-upload' : 'Replace'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Define dual-control rules to help reduce the risk of unauthorized withdrawals.
                  </p>
                </div>
              </div>

              {/* Policy Row with ON/OFF Switch */}
              <div className="mt-6 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-[13px] font-bold text-[#14171A]">
                    Require Dual Approval for High-Value Payouts
                  </h4>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Payouts exceeding this threshold require a second checker.
                  </p>
                </div>

                <Toggle
                  checked={settings.makerCheckerEnabled}
                  onChange={(value) => updateSetting('makerCheckerEnabled', value)}
                  label="Require dual approval for high-value payouts"
                />
              </div>

              {/* Threshold Input Box matching screenshot */}
              <div className="mt-4">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={settings.thresholdValue}
                    onChange={(e) => updateSetting('thresholdValue', e.target.value)}
                    className="w-full pl-4 pr-24 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-900 focus:outline-none focus:border-[#007F4E] transition shadow-2xs"
                  />
                  <div className="absolute right-3.5 text-xs font-semibold text-gray-500 pointer-events-none tracking-tight">
                    {selectedCurrency}
                  </div>
                </div>
              </div>

              {/* Secondary Controls: Daily Volume Limit & AML Safeguards */}
              <div className="mt-6 pt-5 border-t border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-[12.5px] font-semibold text-[#14171A]">Daily Aggregate Withdrawal Limit</h5>
                    <p className="text-xs text-[#6B7280]">Maximum automated payouts permitted in a 24h rolling window.</p>
                  </div>
                  <input
                    type="text"
                    value={settings.dailyCap}
                    onChange={(e) => updateSetting('dailyCap', e.target.value)}
                    className="w-32 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-right text-gray-800 focus:outline-none focus:border-[#007F4E]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-[12.5px] font-semibold text-[#14171A]">High-Risk Review Hold</h5>
                    <p className="text-xs text-[#6B7280]">Hold transactions with composite risk score above 70 for manual review.</p>
                  </div>
                  <Toggle
                    checked={settings.autoAmlFreeze}
                    onChange={(value) => updateSetting('autoAmlFreeze', value)}
                    label="High-risk review hold"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <span className="text-xs text-[#6B7280]">
                Changes are applied when you save your settings.
              </span>
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
                <span className="px-2.5 py-0.5 bg-[#ECEEF2] text-gray-700 text-xs font-semibold rounded-full">
                  Sandbox
                </span>
              </div>

              {/* Subtext */}
              <p className="text-xs text-[#6B7280] mt-2 mb-4 leading-relaxed">
                Review the current dual-control posture for this workspace.
              </p>

              {/* Three Dark Cards matching the exact screenshot */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {/* Metric Box 1: Active policy */}
                <div className="bg-[#0C0D10] text-white p-3 sm:p-3.5 rounded-xl border border-[#23262D] flex flex-col justify-between">
                  <span className="text-xs sm:text-xs text-[#6B7280] font-medium leading-tight">
                    Active policy
                  </span>
                  <div className="text-xs sm:text-[12px] font-bold text-white mt-1.5 truncate">
                    {settings.makerCheckerEnabled ? 'Maker-Checker' : 'Disabled'}
                  </div>
                </div>

                {/* Metric Box 2: Threshold */}
                <div className="bg-[#0C0D10] text-white p-3 sm:p-3.5 rounded-xl border border-[#23262D] flex flex-col justify-between">
                  <span className="text-xs sm:text-xs text-[#6B7280] font-medium leading-tight">
                    Threshold
                  </span>
                  <div className="text-xs sm:text-[12px] font-bold text-white mt-1.5 truncate">
                    {settings.makerCheckerEnabled ? settings.thresholdValue.replace(/\s+/g, '') : 'None'}
                  </div>
                </div>

                {/* Metric Box 3: Currencies */}
                <div className="bg-[#0C0D10] text-white p-3 sm:p-3.5 rounded-xl border border-[#23262D] flex flex-col justify-between">
                  <span className="text-xs sm:text-xs text-[#6B7280] font-medium leading-tight">
                    Currencies
                  </span>
                  <div className="text-xs sm:text-[12px] font-bold text-white mt-1.5 truncate">
                    {selectedCurrency}
                  </div>
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="mt-5 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#007F4E] shrink-0" />
                  <span className="text-xs">2nd checker required on payouts &gt; {settings.thresholdValue}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#007F4E] shrink-0" />
                  <span className="text-xs">Creators cannot self-approve batch payouts</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#007F4E] shrink-0" />
                  <span className="text-xs">Authorization actions appear in the audit trail</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-gray-100">
              <span className="text-xs text-[#6B7280]">
                Environment: Demo Sandbox (v2.4)
              </span>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'general' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4 max-w-3xl">
          <h3 className="text-base font-bold text-[#14171A]">General Organization Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Legal Entity / Organization</label>
              <input
                type="text"
                value={settings.orgName}
                onChange={(e) => updateSetting('orgName', e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#007F4E]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Workspace ID</label>
              <input
                type="text"
                disabled
                value={workspaceId}
                className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Reporting Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => updateSetting('timezone', e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#007F4E]"
              >
                <option value="UTC (+00:00)">UTC (+00:00) — Greenwich Mean Time</option>
                <option value="EST (-05:00)">EST (-05:00) — New York</option>
                <option value="CET (+01:00)">CET (+01:00) — Paris / Berlin</option>
                <option value="SGT (+08:00)">SGT (+08:00) — Singapore</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Base Ledger Currency</label>
              <select
                value={settings.baseCurrency}
                onChange={(e) => updateSetting('baseCurrency', e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#007F4E]"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'security-2fa' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4 max-w-3xl">
          <h3 className="text-base font-bold text-[#14171A]">Security & Authentication</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800">Multi-Factor Authentication</div>
                <div className="text-xs text-gray-500">Requires an authenticator app or security key.</div>
              </div>
              <Toggle
                checked={settings.enforce2fa}
                onChange={(value) => updateSetting('enforce2fa', value)}
                label="Multi-factor authentication"
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800">Session Inactivity Timeout</div>
                <div className="text-xs text-gray-500">Auto sign-out after a period of inactivity.</div>
              </div>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
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

      {activeSubTab === 'audit-log' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#14171A]">Governance & Settings Audit Trail</h3>
            <span className="text-xs text-[#6B7280]">Showing recent 2 events</span>
          </div>
          <div className="divide-y divide-gray-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Maker-Checker dual-control threshold updated to $5,000.00</div>
                <div className="text-xs text-gray-500">By Nora Vale · 14:18 UTC</div>
              </div>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">Config</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Sandbox environment refreshed with updated risk rules</div>
                <div className="text-xs text-gray-500">By System Daemon · 13:45 UTC</div>
              </div>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">System</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
        <span className="text-xs text-gray-500">
          {hasUnsavedChanges ? 'You have unsaved changes.' : 'All changes are saved.'}
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          className="px-4 py-1.5 bg-[#007F4E] hover:bg-[#00663E] disabled:opacity-50 text-white rounded-full text-xs font-semibold transition flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          Save changes
        </button>
      </div>
    </div>
  );
};

