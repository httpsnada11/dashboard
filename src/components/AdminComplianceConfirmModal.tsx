import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, X, FileText, CheckCircle2 } from 'lucide-react';
import { appendAuditEvent } from '../utils/auditLogStore';

export interface AdminComplianceConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  actionLabel: string;
  targetEntity: string;
  severity?: 'Critical' | 'Warning' | 'Info';
  variant?: 'primary' | 'destructive';
  onClose: () => void;
  onConfirm: (reasonCode: string, note: string) => void;
}

const REASON_CODES = [
  'False Positive Verified (Source of Funds Confirmed)',
  'Customer KYC / UBO Documentation Verified',
  'Dual-Control Policy Exception Approved',
  'Automated Liquidity Threshold Rebalance',
  'Merchant Requested Refund / Reversal',
  'Sanctions / High-Risk Enforcement Hold',
  'Other (Specify in Review Notes)',
];

export const AdminComplianceConfirmModal: React.FC<AdminComplianceConfirmModalProps> = ({
  isOpen,
  title,
  description,
  actionLabel,
  targetEntity,
  severity = 'Warning',
  variant = 'primary',
  onClose,
  onConfirm,
}) => {
  const [reasonCode, setReasonCode] = useState(REASON_CODES[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setNote('');
    setError(null);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim() || note.trim().length < 5) {
      setError('Please enter a compliance review note (minimum 5 characters) for the audit log.');
      return;
    }

    appendAuditEvent({
      action: title,
      target: targetEntity,
      reasonCode,
      note: note.trim(),
      severity,
    });

    onConfirm(reasonCode, note.trim());
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compliance-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
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
              <p className="text-xs text-gray-500">Mandatory Compliance Audit Sign-Off</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">{description}</p>

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
            Target Entity
          </span>
          <span className="font-mono font-semibold text-gray-900 break-all">{targetEntity}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="compliance-reason-code" className="block text-xs font-bold text-gray-700 mb-1">
              Reason Code <span className="text-red-500">*</span>
            </label>
            <select
              id="compliance-reason-code"
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#007F4E] font-medium text-gray-800"
            >
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
              onChange={(e) => {
                setNote(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Document verification evidence, second-approver reference, or compliance rationale..."
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#007F4E] text-gray-800 resize-none"
            />
            {error && <p className="text-xs text-red-600 font-semibold mt-1">{error}</p>}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
            <FileText className="w-3.5 h-3.5 text-[#007F4E] shrink-0" />
            <span>Action and justification will be recorded to the Immutable Audit Trail.</span>
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
      </div>
    </div>,
    document.body
  );
};
