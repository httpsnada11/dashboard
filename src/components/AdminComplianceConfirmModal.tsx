import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldAlert,
  X,
  FileText,
  CheckCircle2,
  UserCheck,
  KeyRound
} from 'lucide-react';
import { appendAuditEvent } from '../utils/auditLogStore';
import { PLATFORM } from '../utils/sharedMockStore';
import { useDialogBehavior } from '../hooks/useDialogBehavior';

export interface AdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  closeOnOutsideClick?: boolean;
}

export const AdminDialog: React.FC<AdminDialogProps> = ({
  isOpen,
  onClose,
  children,
  className = 'flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm',
  ariaLabel = 'Dialog',
  closeOnOutsideClick = true,
}) => {
  const dialogRef = useDialogBehavior(isOpen, onClose);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dialogRef}
      className={`fixed inset-0 z-[9998] animate-fadeIn overflow-y-auto ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      tabIndex={-1}
      onMouseDown={(event) => {
        if (closeOnOutsideClick && event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </div>,
    document.body
  );
};

export interface AdminComplianceConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  actionLabel: string;
  targetEntity: string;
  severity?: 'Critical' | 'Warning' | 'Info';
  variant?: 'primary' | 'destructive';
  requireSecondApprover?: boolean;
  onClose: () => void;
  onConfirm: (reasonCode: string, note: string, approver: string, twoFactorCode: string) => void;
}

const REASON_CODES = [
  'False Positive Verified (Source of Funds Confirmed)',
  'Customer KYC / UBO Documentation Verified',
  'Dual-Control Policy Exception Approved',
  'Automated Liquidity Threshold Rebalance',
  'Merchant Requested Refund / Reversal',
  'Sanctions / High-Risk Enforcement Hold',
  'Manual Review Completed (Evidence Attached)',
  'Regulatory Escalation / Reported Event',
  'Other (Specify in Review Notes)',
];

const CHECKERS = [
  PLATFORM.reviewer,
  PLATFORM.checker,
  PLATFORM.superAdmin,
  'Platform Risk Analyst RA'
];

export const AdminComplianceConfirmModal: React.FC<AdminComplianceConfirmModalProps> = ({
  isOpen,
  title,
  description,
  actionLabel,
  targetEntity,
  severity = 'Warning',
  variant = 'primary',
  requireSecondApprover = false,
  onClose,
  onConfirm,
}) => {
  const [reasonCode, setReasonCode] = useState('');
  const [note, setNote] = useState('');
  const [approver, setApprover] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const dialogRef = useDialogBehavior(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    setReasonCode('');
    setNote('');
    setApprover('');
    setTwoFactorCode('');
    setError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!reasonCode) {
      setError('Select a reason code before confirming this action.');
      return;
    }
    if (note.trim().length < 10) {
      setError('Enter a compliance review note of at least 10 characters.');
      return;
    }
    if (requireSecondApprover && !approver) {
      setError('Select an independent checker before confirming this override.');
      return;
    }
    if (requireSecondApprover && !/^\d{6}$/.test(twoFactorCode.trim())) {
      setError('Enter the 6-digit authenticator app code for the second approver.');
      return;
    }

    const checker = requireSecondApprover ? approver : '';
    const auditNote = checker
      ? `${note.trim()} — Second approver: ${checker} · 2FA verified.`
      : note.trim();

    appendAuditEvent({
      action: title,
      target: targetEntity,
      reasonCode,
      note: auditNote,
      severity,
      operator: checker ? `${checker} (Checker)` : undefined,
      operatorRole: checker ? 'Checker' : undefined,
    });

    onConfirm(reasonCode, note.trim(), checker, twoFactorCode.trim());
    onClose();
  };

  return createPortal(
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compliance-modal-title"
      tabIndex={-1}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-gray-100 space-y-4 my-auto max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                variant === 'destructive'
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-emerald-50 text-[#007F4E] border-emerald-200'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 id="compliance-modal-title" className="font-bold text-gray-900 text-sm">
                {title}
              </h3>
              <p className="text-xs text-[#6B7280]">Mandatory Compliance Audit Sign-Off</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-gray-700 rounded-full hover:bg-gray-100 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#6B7280] leading-relaxed">{description}</p>

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280] block">
            Target Entity
          </span>
          <span className="font-mono font-semibold text-gray-900 break-all">{targetEntity}</span>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="compliance-reason-code" className="block text-xs font-bold text-gray-700 mb-1">
              Reason Code <span className="text-red-500">*</span>
            </label>
            <select
              id="compliance-reason-code"
              value={reasonCode}
              onChange={(event) => {
                setReasonCode(event.target.value);
                if (error) setError(null);
              }}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#007F4E] font-medium text-gray-800"
            >
              <option value="">Select a reason code…</option>
              {REASON_CODES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="compliance-review-note" className="block text-xs font-bold text-gray-700 mb-1">
              Reviewer Justification Note <span className="text-red-500">*</span>
            </label>
            <textarea
              id="compliance-review-note"
              rows={3}
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                if (error) setError(null);
              }}
              placeholder="Document verification evidence, second-approver reference, or compliance rationale..."
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#007F4E] text-gray-800 resize-none"
            />
          </div>

          {requireSecondApprover && (
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#007F4E]">
                <UserCheck className="w-4 h-4" />
                <span>Independent second approver required</span>
              </div>
              <div>
                <label htmlFor="compliance-checker" className="block text-xs font-bold text-gray-700 mb-1">
                  Checker <span className="text-red-500">*</span>
                </label>
                <select
                  id="compliance-checker"
                  value={approver}
                  onChange={(event) => {
                    setApprover(event.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#007F4E] font-medium text-gray-800"
                >
                  <option value="">Select a checker…</option>
                  {CHECKERS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="compliance-2fa" className="block text-xs font-bold text-gray-700 mb-1">
                  Checker 2FA Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="compliance-2fa"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(event) => {
                      setTwoFactorCode(event.target.value.replace(/[^0-9]/g, ''));
                      if (error) setError(null);
                    }}
                    placeholder="000000"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#007F4E] font-mono tracking-widest text-gray-800"
                  />
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

          <div className="flex items-center gap-2 text-xs text-[#6B7280] bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
            <FileText className="w-3.5 h-3.5 text-[#007F4E] shrink-0" />
            <span>Action, justification and approver will be recorded in the Immutable Audit Trail.</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#007F4E] hover:bg-[#00663E]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{actionLabel}</span>
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};
