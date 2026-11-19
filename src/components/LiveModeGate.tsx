import React, { useState, useEffect } from 'react';
import {
  Lock,
  X,
  ShieldAlert,
  Clock,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Cpu,
  ChevronRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import {
  getKybApplication,
  subscribeKybStatus,
  setKybStatus,
  getKybStatusLabel,
  getKybStatusColor
} from '../utils/kybStorage';
import { KybApplicationData, MerchantKybLifecycleStatus } from '../types';

export interface LiveModeGateProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenKyb: (step?: number) => void;
  targetActionName?: string;
}

export const LiveModeGate: React.FC<LiveModeGateProps> = ({
  isOpen,
  onClose,
  onOpenKyb,
  targetActionName = 'Live Mode & Production Keys'
}) => {
  const [kybApp, setKybApp] = useState<KybApplicationData>(getKybApplication());

  useEffect(() => {
    const unsub = subscribeKybStatus((updated) => {
      setKybApp(updated);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const { status, currentStep, complianceFeedback } = kybApp;

  // Demo status switcher helper
  const handleDemoSwitch = (newStatus: MerchantKybLifecycleStatus) => {
    const updated = setKybStatus(newStatus);
    setKybApp(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100/90 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Strip with Ambient Security Gradient */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 text-white flex items-start justify-between border-b border-gray-800 select-none">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner flex-shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                  Compliance Gate
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getKybStatusColor(status)}`}>
                  {getKybStatusLabel(status)}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
                Corporate Verification Required
              </h2>
              <p className="text-xs text-slate-300/90 mt-0.5 leading-relaxed">
                {targetActionName} requires an approved business entity under international AML & FATF standards.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Status Diagnostic Card */}
          {status === 'DRAFT' && (
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 text-[13px]">
                    Verification Incomplete (Step {currentStep} of 5)
                  </span>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Draft Saved
                  </span>
                </div>
                <p className="text-blue-700/90 mt-1 leading-normal">
                  Your corporate details and UBO structure have not been submitted yet. Complete the 5-minute KYB wizard to unlock Live mode and mainnet deposit addresses.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenKyb(currentStep || 1);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition shadow-sm cursor-pointer"
                  >
                    <span>Resume Verification (Step {currentStep})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === 'UNDER_REVIEW' && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Clock className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 text-[13px]">
                    Application Under Compliance Review
                  </span>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Queue Position #4
                  </span>
                </div>
                <p className="text-amber-800/90 mt-1 leading-normal">
                  Our compliance team is verifying your trade registry extract and director identity documents.
                  Typical turnaround: <strong>24–48 business hours</strong>. Sandbox remains fully functional.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenKyb(1);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-semibold text-xs transition shadow-sm cursor-pointer"
                  >
                    <span>View Submitted Application</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === 'ACTION_REQUIRED' && (
            <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200/90 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-900 text-[13px]">
                    Action Required: Document Update Needed
                  </span>
                  <span className="text-[11px] font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                    Direct Fix Available
                  </span>
                </div>
                <p className="text-rose-800/90 mt-1 leading-normal">
                  {complianceFeedback || 'The proof of address uploaded was older than 90 days. Please upload a recent bank statement or utility bill.'}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenKyb(4); // Open directly to Document Vault
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs transition shadow-sm cursor-pointer"
                  >
                    <span>Fix Rejected Documents in Vault (Step 4)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === 'APPROVED' && (
            <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-[#00C076] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <span className="font-bold text-emerald-900 text-[13px] block">
                  Corporate Verified & Live Mode Active!
                </span>
                <p className="text-emerald-800/90 mt-1 leading-normal">
                  Your business entity is approved. Live deposit sweeps and production API keys are completely unlocked.
                </p>
              </div>
            </div>
          )}

          {/* Feature Comparison Grid: What's Locked vs What Works Today */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Locked Live Capabilities */}
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
              <div className="flex items-center gap-2 font-bold text-gray-900 text-[12.5px] pb-2 border-b border-gray-200/60">
                <Lock className="w-3.5 h-3.5 text-rose-500" />
                <span>Locked Until Verified</span>
              </div>
              <ul className="mt-2.5 space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span>Real TRON / ETH / SOL mainnet wallet generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span>Production API Keys (<code className="font-mono text-[10.5px] text-gray-800">live_•••</code>)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span>Automated hot-to-cold vault sweep pipelines</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span>Unlimited daily transaction limits</span>
                </li>
              </ul>
            </div>

            {/* Always Free Sandbox Capabilities */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-[12.5px] pb-2 border-b border-emerald-200/60">
                <Sparkles className="w-3.5 h-3.5 text-[#00C076]" />
                <span>Available Now (Sandbox)</span>
              </div>
              <ul className="mt-2.5 space-y-2 text-emerald-800/90">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C076] mt-0.5 flex-shrink-0" />
                  <span>Public Cashier Simulator (HPP & H2H)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C076] mt-0.5 flex-shrink-0" />
                  <span>Test API Keys (<code className="font-mono text-[10.5px] text-emerald-900 font-bold">test_•••</code>)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C076] mt-0.5 flex-shrink-0" />
                  <span>Webhook dispatch & replay testing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C076] mt-0.5 flex-shrink-0" />
                  <span>Address Book & 24h anti-theft timelocks</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Explainer on Compliance Standard */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-slate-500" />
              <span>Compliant with FATF Recommendation 16 & EU AML5 Directive</span>
            </div>
            <a
              href="https://fatf-gafi.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>Learn why</span>
              <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Demo Lifecycle Switcher for Reviewers */}
          <div className="flex items-center gap-1.5 self-start sm:self-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Demo State:</span>
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-2xs">
              {(['DRAFT', 'UNDER_REVIEW', 'ACTION_REQUIRED', 'APPROVED'] as MerchantKybLifecycleStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleDemoSwitch(st)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    status === st
                      ? 'bg-gray-900 text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {st === 'UNDER_REVIEW' ? 'REVIEW' : st === 'ACTION_REQUIRED' ? 'ACTION' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-full text-xs font-semibold transition cursor-pointer"
            >
              Continue in Sandbox
            </button>

            {status !== 'APPROVED' ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenKyb(status === 'ACTION_REQUIRED' ? 4 : (currentStep || 1));
                }}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-full text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                <span>{status === 'DRAFT' ? 'Start Verification →' : status === 'ACTION_REQUIRED' ? 'Fix Rejected Docs →' : 'Review Application'}</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#00C076] hover:bg-[#00AA67] text-white rounded-full text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                <span>Live Mode Unlocked</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
