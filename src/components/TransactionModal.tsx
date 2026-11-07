import React from 'react';
import { X, ExternalLink, Clock, ArrowUpRight, ArrowDownLeft, QrCode } from 'lucide-react';
import { Transaction } from '../types';

export interface TransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onOpenDepositCheckout?: (transaction: Transaction) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  onClose,
  onOpenDepositCheckout
}) => {
  if (!transaction) return null;

  const isDeposit = transaction.type === 'Deposit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isDeposit ? 'bg-emerald-50 text-[#00C076]' : 'bg-gray-100 text-gray-800'
            }`}>
              {isDeposit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{transaction.type} Details</h3>
              <p className="text-xs text-gray-500">{transaction.reference}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-5 space-y-4 text-xs">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-400">Total Transaction Amount</span>
              <p className={`text-xl font-bold ${isDeposit ? 'text-[#00C076]' : 'text-gray-900'}`}>
                {transaction.amount} {transaction.network.split(' · ')[0]}
              </p>
            </div>
            <span className="px-3 py-1 bg-white border border-gray-200 rounded-full font-semibold text-gray-700 shadow-sm">
              {transaction.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-gray-400 block mb-0.5">Network</span>
              <span className="font-semibold text-gray-800">{transaction.network}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-gray-400 block mb-0.5">Customer ID</span>
              <span className="font-semibold text-gray-800">{transaction.customer}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span>Blockchain Transaction Hash (TxID)</span>
              <a
                href="https://sepolia.etherscan.io/tx/0x8f4c28a9b1c900e231d77a83d47012bc09ef78923a104c83d6a908be140f892a"
                target="_blank"
                rel="noreferrer"
                className="text-[#00C076] font-medium flex items-center gap-1 hover:underline"
              >
                Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="font-mono text-gray-800 break-all select-all">
              0x8f4c28a9b1c900e231d77a83d47012bc09ef78923a104c83d6a908be140f892a
            </p>
          </div>

          <div className="flex items-center gap-2 text-gray-500 pt-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>Timestamp: {transaction.time} (Confirmed via On-Chain Node)</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          {isDeposit ? (
            <button
              onClick={() => {
                onClose();
                onOpenDepositCheckout?.(transaction);
              }}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#00C076] rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-emerald-200"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Open Deposit Checkout & QR</span>
            </button>
          ) : (
            <div />
          )}

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
