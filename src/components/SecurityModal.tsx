import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Smartphone } from 'lucide-react';

export interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [withdrawalWhitelist, setWithdrawalWhitelist] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-900 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Security Vault</h3>
              <p className="text-xs text-gray-500">Access controls & protection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* 2FA Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs font-bold text-gray-900">Two-Factor Authentication (2FA)</p>
                <p className="text-[11px] text-gray-500">Google Authenticator or YubiKey</p>
              </div>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                twoFactorEnabled ? 'bg-[#00C076]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  twoFactorEnabled ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {/* Address Whitelist Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs font-bold text-gray-900">Strict Address Whitelist</p>
                <p className="text-[11px] text-gray-500">Only send to verified customer wallets</p>
              </div>
            </div>
            <button
              onClick={() => setWithdrawalWhitelist(!withdrawalWhitelist)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                withdrawalWhitelist ? 'bg-[#00C076]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  withdrawalWhitelist ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {/* AML Shield Info */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#00C076] mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-[#00683e] leading-relaxed">
              Automated Chainalysis & TRM Labs AML screening is active. High-risk incoming crypto transactions are automatically placed into the <strong>Exceptions</strong> queue for review.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
