import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Building2,
  Users,
  ShieldCheck,
  Upload,
  AlertCircle,
  FileCheck,
  ChevronRight,
  ArrowLeft,
  Trash2,
  Plus,
  DollarSign
} from 'lucide-react';
import {
  KybApplicationData,
  KybDirectorUbo,
  KybDocumentItem
} from '../types';
import {
  getKybApplication,
  saveKybDraft,
  submitKybApplication
} from '../utils/kybStorage';

export interface KybOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
  onSubmitted?: () => void;
}

const STEP_TITLES = [
  { step: 1, label: 'Company Entity', icon: Building2 },
  { step: 2, label: 'Business & Risk', icon: DollarSign },
  { step: 3, label: 'Directors & UBOs', icon: Users },
  { step: 4, label: 'Document Vault', icon: Upload },
  { step: 5, label: 'Sign-off', icon: ShieldCheck }
];

export const KybOnboardingWizard: React.FC<KybOnboardingWizardProps> = ({
  isOpen,
  onClose,
  initialStep = 1,
  onSubmitted
}) => {
  const [kybData, setKybData] = useState<KybApplicationData>(getKybApplication);
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Sync initial step when modal opens
  useEffect(() => {
    if (isOpen) {
      const fresh = getKybApplication();
      setKybData(fresh);
      setCurrentStep(initialStep || fresh.currentStep || 1);
      setSubmittedSuccess(false);
    }
  }, [isOpen, initialStep]);

  if (!isOpen) return null;

  // Step 1: Company Entity handlers
  const handleCompanyChange = (field: keyof KybApplicationData['company'], value: string) => {
    const updated = {
      ...kybData,
      company: { ...kybData.company, [field]: value }
    };
    setKybData(updated);
    saveKybDraft(updated);
  };

  // Step 2: Business Profile handlers
  const handleProfileChange = (field: keyof KybApplicationData['profile'], value: unknown) => {
    const updated = {
      ...kybData,
      profile: { ...kybData.profile, [field]: value }
    };
    setKybData(updated);
    saveKybDraft(updated);
  };

  // Step 3: Directors & UBOs handlers
  const handleAddDirector = () => {
    const newUbo: KybDirectorUbo = {
      id: 'ubo_' + Date.now(),
      fullName: '',
      dateOfBirth: '1990-01-01',
      nationality: 'United Kingdom',
      residentialCountry: 'United Kingdom',
      ownershipPercentage: 25,
      isDirector: true,
      isUbo: true
    };
    const updated = {
      ...kybData,
      directors: [...kybData.directors, newUbo]
    };
    setKybData(updated);
    saveKybDraft(updated);
  };

  const handleUpdateDirector = (id: string, field: keyof KybDirectorUbo, value: unknown) => {
    const updated = {
      ...kybData,
      directors: kybData.directors.map(d => (d.id === id ? { ...d, [field]: value } : d))
    };
    setKybData(updated);
    saveKybDraft(updated);
  };

  const handleRemoveDirector = (id: string) => {
    if (kybData.directors.length <= 1) return;
    const updated = {
      ...kybData,
      directors: kybData.directors.filter(d => d.id !== id)
    };
    setKybData(updated);
    saveKybDraft(updated);
  };

  // Step 4: Document Vault handlers (simulated upload)
  const handleSimulateUpload = (docId: string) => {
    const updatedDocs: KybDocumentItem[] = kybData.documents.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          fileName: `${doc.title.replace(/\s+/g, '_')}_Updated_${new Date().getFullYear()}.pdf`,
          fileSize: '2.1 MB',
          uploadDate: 'Just now',
          status: 'UPLOADED',
          rejectionReason: undefined
        };
      }
      return doc;
    });

    const updated = { ...kybData, documents: updatedDocs };
    setKybData(updated);
    saveKybDraft(updated);
  };

  // Step 5: Submission
  const handleSubmitApplication = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      submitKybApplication(kybData);
      if (onSubmitted) onSubmitted();
      setTimeout(() => {
        onClose();
      }, 2200);
    }, 1200);
  };

  const nextStep = () => {
    if (currentStep < 5) {
      const next = currentStep + 1;
      setCurrentStep(next);
      saveKybDraft({ currentStep: next });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      saveKybDraft({ currentStep: prev });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-fadeIn overflow-y-auto selection:bg-[#00C076] selection:text-white">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 my-auto relative transition-all max-h-[92vh] flex flex-col justify-between">
        
        {/* ======================================================== */}
        {/* MODAL HEADER WITH 5-STEP PROGRESS BAR                    */}
        {/* ======================================================== */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#00C076] text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-emerald-500/20">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Corporate KYB Verification
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10.5px] font-bold">
                    Step {currentStep} of 5
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Progressive Unlock: Verify company entity & beneficial owners to access Live Crypto Processing.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="py-3.5 border-b border-slate-100">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {STEP_TITLES.map((s) => {
                const isCurrent = currentStep === s.step;
                const isPassed = currentStep > s.step;

                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => {
                      setCurrentStep(s.step);
                      saveKybDraft({ currentStep: s.step });
                    }}
                    className={`py-2 px-1.5 rounded-xl border flex flex-col items-center gap-1 transition text-center cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-50 border-[#00C076] text-slate-900 shadow-2xs'
                        : isPassed
                        ? 'bg-slate-50 border-slate-200 text-emerald-700'
                        : 'bg-white border-slate-100 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-[#00C076] text-white'
                        : isPassed
                        ? 'bg-emerald-100 text-[#00875A]'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isPassed ? <Check className="w-3 h-3 stroke-[3]" /> : s.step}
                    </div>
                    <span className="text-[10.5px] font-bold truncate max-w-full hidden sm:inline">
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* STEP CONTENT CONTAINER                                   */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto py-5 pr-1 scrollbar-thin text-xs text-slate-700 space-y-4">
          
          {submittedSuccess ? (
            /* SUBMITTED CONFIRMATION SCREEN */
            <div className="py-12 flex flex-col items-center text-center animate-fadeIn space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-[#00C076] flex items-center justify-center shadow-lg animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Corporate Dossier Submitted!</h2>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                Your application has moved into <strong className="text-slate-800">UNDER REVIEW</strong>. Our corporate compliance desk is verifying your registry filings and beneficial owner disclosures.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-[11.5px] text-slate-600 max-w-sm font-medium space-y-1 text-left">
                <div className="flex justify-between">
                  <span>Target Turnaround:</span>
                  <strong className="text-slate-900">24 – 48 Hours</strong>
                </div>
                <div className="flex justify-between">
                  <span>Current Access:</span>
                  <span className="text-[#00875A] font-bold">Full Sandbox Test Mode</span>
                </div>
                <div className="flex justify-between">
                  <span>Live Production Keys:</span>
                  <span className="text-slate-500">Locked pending review 🔒</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: COMPANY ENTITY */}
              {currentStep === 1 && (
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Section 1 of 5
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">Registered Legal Entity Information</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Provide registered details matching your Certificate of Incorporation or commercial register extract.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Registered Legal Company Name *
                      </label>
                      <input
                        type="text"
                        value={kybData.company.legalName}
                        onChange={(e) => handleCompanyChange('legalName', e.target.value)}
                        placeholder="e.g. Apex Liquidity Services BVI Corp"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00C076] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Registration / Tax Identification Number *
                      </label>
                      <input
                        type="text"
                        value={kybData.company.registrationNumber}
                        onChange={(e) => handleCompanyChange('registrationNumber', e.target.value)}
                        placeholder="e.g. BVI-771920-REG"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00C076] transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Country / Jurisdiction of Incorporation *
                      </label>
                      <input
                        type="text"
                        value={kybData.company.jurisdiction}
                        onChange={(e) => handleCompanyChange('jurisdiction', e.target.value)}
                        placeholder="e.g. British Virgin Islands (BVI FSC)"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00C076] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Corporate Website or App URL *
                      </label>
                      <input
                        type="url"
                        value={kybData.company.websiteUrl}
                        onChange={(e) => handleCompanyChange('websiteUrl', e.target.value)}
                        placeholder="https://yourcompany.com"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00C076] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Physical Operating Address (Headquarters) *
                    </label>
                    <textarea
                      rows={2}
                      value={kybData.company.operatingAddress}
                      onChange={(e) => handleCompanyChange('operatingAddress', e.target.value)}
                      placeholder="Full street address, suite/office, city, postal code, country"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00C076] transition"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: BUSINESS PROFILE & RISK */}
              {currentStep === 2 && (
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Section 2 of 5
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">Business Model, Volume & Market Risk</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Configure your expected ingestion throughput so compliance can automatically size your settlement limits.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Industry Vertical Category *
                      </label>
                      <select
                        value={kybData.profile.industry}
                        onChange={(e) => handleProfileChange('industry', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00C076]"
                      >
                        <option value="Forex Broker & Liquidity Provider">Forex Broker & Liquidity Provider</option>
                        <option value="iGaming & Online Entertainment">iGaming & Online Entertainment</option>
                        <option value="Prop Trading & Financial Markets">Prop Trading & Financial Markets</option>
                        <option value="E-Commerce & Digital Goods">E-Commerce & Digital Goods</option>
                        <option value="Web3 SaaS & Technology Infrastructure">Web3 SaaS & Infrastructure</option>
                        <option value="OTC Trading Desk & Remittance">OTC Trading Desk & Remittance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Expected Monthly Ingestion Volume *
                      </label>
                      <select
                        value={kybData.profile.monthlyVolume}
                        onChange={(e) => handleProfileChange('monthlyVolume', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00C076]"
                      >
                        <option value="$25,000 – $100,000 / month">$25,000 – $100,000 / month (Tier 3)</option>
                        <option value="$100,000 – $250,000 / month">$100,000 – $250,000 / month (Tier 2)</option>
                        <option value="$250,000 – $1,000,000 / month">$250,000 – $1,000,000 / month (Tier 1)</option>
                        <option value="$1,000,000+ / month (Enterprise VIP)">$1,000,000+ / month (Enterprise VIP)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Average Transaction Size *
                      </label>
                      <input
                        type="text"
                        value={kybData.profile.averageTxSize}
                        onChange={(e) => handleProfileChange('averageTxSize', e.target.value)}
                        placeholder="e.g. $1,000.00 – $5,000.00 USDT"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00C076]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Primary Target Customer Jurisdictions *
                      </label>
                      <input
                        type="text"
                        value={kybData.profile.targetJurisdictions.join(', ')}
                        onChange={(e) =>
                          handleProfileChange(
                            'targetJurisdictions',
                            e.target.value.split(',').map((s) => s.trim())
                          )
                        }
                        placeholder="e.g. LATAM, Southeast Asia, EU, MENA"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00C076]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: DIRECTORS & UBOS */}
              {currentStep === 3 && (
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Section 3 of 5
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">Directors & Ultimate Beneficial Owners (UBO)</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        FATF & OFAC compliance mandates disclosure of any natural person holding ≥25% shares or voting control.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddDirector}
                      className="px-3 py-1.5 bg-[#00C076] hover:bg-[#00AA67] text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-2xs transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Person</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {kybData.directors.map((d, index) => (
                      <div
                        key={d.id}
                        className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#00C076]" />
                            <span>Individual #{index + 1} ({d.ownershipPercentage}% Shares)</span>
                          </span>

                          {kybData.directors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDirector(d.id)}
                              className="text-slate-400 hover:text-rose-600 transition p-1"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-600 mb-0.5">Full Legal Name *</label>
                            <input
                              type="text"
                              value={d.fullName}
                              onChange={(e) => handleUpdateDirector(d.id, 'fullName', e.target.value)}
                              placeholder="As written on passport"
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#00C076]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-600 mb-0.5">Date of Birth *</label>
                            <input
                              type="date"
                              value={d.dateOfBirth}
                              onChange={(e) => handleUpdateDirector(d.id, 'dateOfBirth', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#00C076]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-600 mb-0.5">Shareholding % (≥25%) *</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={d.ownershipPercentage}
                              onChange={(e) => handleUpdateDirector(d.id, 'ownershipPercentage', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#00C076]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-600 mb-0.5">Nationality *</label>
                            <input
                              type="text"
                              value={d.nationality}
                              onChange={(e) => handleUpdateDirector(d.id, 'nationality', e.target.value)}
                              placeholder="e.g. British, Cypriot, Singaporean"
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#00C076]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-600 mb-0.5">Country of Residence *</label>
                            <input
                              type="text"
                              value={d.residentialCountry}
                              onChange={(e) => handleUpdateDirector(d.id, 'residentialCountry', e.target.value)}
                              placeholder="e.g. United Kingdom"
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#00C076]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: DOCUMENT VAULT */}
              {currentStep === 4 && (
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Section 4 of 5
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">Secure Corporate Document Vault</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload high-resolution scans (PDF, PNG, JPG under 10MB). Scans are encrypted with 256-bit AES at rest.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {kybData.documents.map((doc) => {
                      const isRejected = doc.status === 'REJECTED';
                      const isUploaded = doc.status === 'UPLOADED' || doc.status === 'VERIFIED';

                      return (
                        <div
                          key={doc.id}
                          className={`p-3.5 rounded-2xl border transition ${
                            isRejected
                              ? 'bg-rose-50/70 border-rose-200'
                              : isUploaded
                              ? 'bg-white border-slate-200'
                              : 'bg-slate-50 border-dashed border-slate-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs">{doc.title}</span>
                                {doc.required ? (
                                  <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">Required</span>
                                ) : (
                                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">Optional</span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">{doc.description}</p>
                              
                              {doc.fileName && (
                                <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-slate-600">
                                  <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span className="truncate">{doc.fileName}</span>
                                  <span className="text-slate-400">({doc.fileSize})</span>
                                </div>
                              )}
                            </div>

                            {/* Upload Button */}
                            <div className="shrink-0">
                              <button
                                type="button"
                                onClick={() => handleSimulateUpload(doc.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                                  isRejected
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                    : isUploaded
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    : 'bg-[#00C076] hover:bg-[#00AA67] text-white'
                                }`}
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>{isRejected ? 'Re-upload Fresh Scan' : isUploaded ? 'Replace File' : 'Upload File'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Compliance Feedback Alert */}
                          {isRejected && doc.rejectionReason && (
                            <div className="mt-2.5 p-2 bg-rose-100/80 border border-rose-300 rounded-xl text-[11px] text-rose-800 flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                              <div>
                                <strong className="font-bold">Compliance Reviewer Note: </strong>
                                <span>{doc.rejectionReason}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: DECLARATION & SIGN-OFF */}
              {currentStep === 5 && (
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Section 5 of 5
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">Legal Representation & PEP/Sanctions Declaration</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Review all declarations before submitting your corporate dossier to platform compliance.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-3">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={kybData.sanctionsConfirmed}
                        onChange={(e) => {
                          const updated = { ...kybData, sanctionsConfirmed: e.target.checked };
                          setKybData(updated);
                          saveKybDraft(updated);
                        }}
                        className="mt-0.5 rounded text-[#00C076] focus:ring-[#00C076]"
                      />
                      <span className="text-xs text-slate-700 leading-relaxed">
                        I hereby declare that neither the entity, its parent companies, nor any listed Director or Ultimate Beneficial Owner (UBO) are classified as Politically Exposed Persons (PEPs) or subject to international sanctions administered by OFAC, the European Union, the United Nations, or HM Treasury.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-slate-100">
                      <input
                        type="checkbox"
                        checked={kybData.authorizedRepresentativeConfirmed}
                        onChange={(e) => {
                          const updated = { ...kybData, authorizedRepresentativeConfirmed: e.target.checked };
                          setKybData(updated);
                          saveKybDraft(updated);
                        }}
                        className="mt-0.5 rounded text-[#00C076] focus:ring-[#00C076]"
                      />
                      <span className="text-xs text-slate-700 leading-relaxed">
                        I confirm that I am a legally appointed Director, General Counsel, or Authorized Officer with full power of attorney to enter into binding crypto custody and merchant settlement agreements on behalf of <strong className="text-slate-900">{kybData.company.legalName || 'this corporate entity'}</strong>.
                      </span>
                    </label>
                  </div>

                  {/* Pre-submission Summary */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11.5px] text-emerald-900 flex items-center justify-between">
                    <div>
                      <strong>Ready for Submission: </strong>
                      <span>All 5 corporate sections completed. Verification turnaround 24–48 hours.</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#00875A] font-bold text-[10px]">
                      100% Validated
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* ======================================================== */}
        {/* MODAL FOOTER CONTROLS                                    */}
        {/* ======================================================== */}
        {!submittedSuccess && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Save Draft & Exit
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-5 py-2 bg-[#00C076] hover:bg-[#00AA67] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm shadow-emerald-500/20 cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting || !kybData.sanctionsConfirmed || !kybData.authorizedRepresentativeConfirmed}
                  onClick={handleSubmitApplication}
                  className="px-6 py-2 bg-[#00C076] hover:bg-[#00AA67] disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Submitting Dossier...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Submit Application for Review</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
