import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  Lock,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  FileWarning
} from 'lucide-react';
import { KybApplicationData, MerchantKybLifecycleStatus } from '../types';
import { getKybApplication, subscribeKybStatus, setKybStatus } from '../utils/kybStorage';

export interface KybBannerProps {
  onOpenWizard: (step?: number) => void;
  className?: string;
}

export const KybBanner: React.FC<KybBannerProps> = ({ onOpenWizard, className = '' }) => {
  const [kybData, setKybData] = useState<KybApplicationData>(getKybApplication);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeKybStatus((data) => {
      setKybData(data);
    });
    return unsubscribe;
  }, []);

  const handleSimulateState = (status: MerchantKybLifecycleStatus) => {
    const updated = setKybStatus(status);
    setKybData(updated);
    setShowDemoMenu(false);
  };

  const status = kybData.status;

  return (
    <div className={`w-full select-none text-xs transition-all ${className}`}>
      {/* ======================================================== */}
      {/* 1. DRAFT STATE (Not Started / In Progress)               */}
      {/* ======================================================== */}
      {status === 'DRAFT' && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border-b border-amber-300/60 px-4 py-2.5 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-300/80 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2 flex-wrap text-slate-800">
              <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full text-[10.5px]">
                Sandbox Test Mode
              </span>
              <span className="text-slate-600">
                You are currently in Sandbox Mode. Complete <strong className="text-slate-900 font-bold">Corporate Verification (KYB)</strong> to unlock Live mainnet crypto processing and real deposit addresses.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {/* Action Button */}
            <button
              type="button"
              onClick={() => onOpenWizard(kybData.currentStep || 1)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <span>{kybData.currentStep > 1 ? `Resume Verification (Step ${kybData.currentStep}/5)` : 'Start Verification'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Demo State Switcher Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="px-2 py-1 bg-white/80 hover:bg-white border border-amber-200 text-amber-800 rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition"
                title="Switch Progressive Unlock Stage for Demo"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span className="hidden md:inline">KYB State</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-fadeIn text-slate-700 text-[11px]">
                  <div className="px-3 py-1 font-bold text-slate-400 uppercase text-[9.5px] border-b border-slate-100">
                    Simulate Merchant Stage
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSimulateState('DRAFT')}
                    className="w-full px-3 py-1.5 text-left hover:bg-slate-50 font-semibold text-amber-700"
                  >
                    1. Draft / Day-0 Sandbox
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateState('UNDER_REVIEW')}
                    className="w-full px-3 py-1.5 text-left hover:bg-slate-50 font-semibold text-blue-700"
                  >
                    2. Under Review (24-48h)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateState('ACTION_REQUIRED')}
                    className="w-full px-3 py-1.5 text-left hover:bg-slate-50 font-semibold text-rose-700"
                  >
                    3. Action Required
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateState('APPROVED')}
                    className="w-full px-3 py-1.5 text-left hover:bg-slate-50 font-semibold text-emerald-700"
                  >
                    4. Approved (Live Unlocked)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. UNDER_REVIEW STATE (Compliance Queue)                 */}
      {/* ======================================================== */}
      {status === 'UNDER_REVIEW' && (
        <div className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-blue-500/10 border-b border-blue-200 px-4 py-2.5 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-blue-100 border border-blue-300/80 flex items-center justify-center text-blue-700 shrink-0">
              <Clock className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="flex items-center gap-2 flex-wrap text-slate-800">
              <span className="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full text-[10.5px]">
                Under Compliance Review
              </span>
              <span className="text-slate-600">
                Application submitted {kybData.submittedAt ? `on ${kybData.submittedAt}` : 'recently'}. Our corporate compliance desk is verifying your registry filings. <strong className="text-slate-800">Typical turnaround: 24–48 business hours.</strong>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-white/70 px-2 py-0.5 rounded border border-slate-200">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Live Mode Locked</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => onOpenWizard(5)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <span>View Dossier Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Demo Switcher */}
            <button
              type="button"
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="px-2 py-1 bg-white/80 hover:bg-white border border-blue-200 text-blue-800 rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              <ChevronDown className="w-3 h-3" />
            </button>
            {showDemoMenu && (
              <div className="absolute right-4 mt-8 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-fadeIn text-slate-700 text-[11px]">
                <div className="px-3 py-1 font-bold text-slate-400 uppercase text-[9.5px] border-b border-slate-100">
                  Simulate Merchant Stage
                </div>
                <button type="button" onClick={() => handleSimulateState('DRAFT')} className="w-full px-3 py-1.5 text-left hover:bg-slate-50 font-semibold text-amber-700">1. Draft / Day-0</button>
                <button type="button" onClick={() => handleSimulateState('UNDER_REVIEW')} className="w-full px-3 py-1.5 text-left hover:bg-slate-50 font-semibold text-blue-700">2. Under Review</button>
                <button type="button" onClick={() => handleSimulateState('ACTION_REQUIRED')} className="w-full px-3 py-1.5 text-left hover:bg-slate-50 font-semibold text-rose-700">3. Action Required</button>
                <button type="button" onClick={() => handleSimulateState('APPROVED')} className="w-full px-3 py-1.5 text-left hover:bg-slate-50 font-semibold text-emerald-700">4. Approved (Live)</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ACTION_REQUIRED STATE (Document Re-upload Needed)      */}
      {/* ======================================================== */}
      {status === 'ACTION_REQUIRED' && (
        <div className="bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-rose-500/10 border-b border-rose-200 px-4 py-2.5 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-rose-100 border border-rose-300/80 flex items-center justify-center text-rose-700 shrink-0">
              <FileWarning className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2 flex-wrap text-slate-800">
              <span className="font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full text-[10.5px]">
                Action Required
              </span>
              <span className="text-slate-700">
                {kybData.complianceFeedback || 'The proof of address uploaded was older than 90 days. Please upload a recent bank statement or utility bill.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => onOpenWizard(4)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <span>Resolve Document Issue (Step 4)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Demo Switcher */}
            <button
              type="button"
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="px-2 py-1 bg-white/80 hover:bg-white border border-rose-200 text-rose-800 rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition"
            >
              <Sparkles className="w-3 h-3 text-rose-600" />
              <ChevronDown className="w-3 h-3" />
            </button>
            {showDemoMenu && (
              <div className="absolute right-4 mt-8 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-fadeIn text-slate-700 text-[11px]">
                <div className="px-3 py-1 font-bold text-slate-400 uppercase text-[9.5px] border-b border-slate-100">
                  Simulate Merchant Stage
                </div>
                <button type="button" onClick={() => handleSimulateState('DRAFT')} className="w-full px-3 py-1.5 text-left hover:bg-slate-50 font-semibold text-amber-700">1. Draft / Day-0</button>
                <button type="button" onClick={() => handleSimulateState('UNDER_REVIEW')} className="w-full px-3 py-1.5 text-left hover:bg-slate-50 font-semibold text-blue-700">2. Under Review</button>
                <button type="button" onClick={() => handleSimulateState('ACTION_REQUIRED')} className="w-full px-3 py-1.5 text-left hover:bg-slate-50 font-semibold text-rose-700">3. Action Required</button>
                <button type="button" onClick={() => handleSimulateState('APPROVED')} className="w-full px-3 py-1.5 text-left hover:bg-slate-50 font-semibold text-emerald-700">4. Approved (Live)</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. APPROVED STATE (Corporate Verified · Live Unlocked)   */}
      {/* ======================================================== */}
      {status === 'APPROVED' && (
        <div className="bg-emerald-50/80 border-b border-emerald-200 px-4 py-1.5 sm:px-6 flex items-center justify-between text-emerald-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold text-[11px] text-emerald-900">
              Corporate Verified (KYB Cleared)
            </span>
            <span className="text-[11px] text-emerald-700 hidden sm:inline">
              · Live production API keys and mainnet crypto settlement pipelines unlocked.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
              Live Mode Active
            </span>

            {/* Demo Reset */}
            <button
              type="button"
              onClick={() => handleSimulateState('DRAFT')}
              className="text-[10px] text-emerald-700 hover:text-emerald-900 underline font-semibold ml-2 cursor-pointer"
              title="Reset to Day-0 Sandbox mode for testing"
            >
              Reset to Sandbox Draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
