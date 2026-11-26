import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Clock,
  ShieldCheck,
  Wallet,
  RotateCcw,
  Globe,
  Zap,
  Code2,
  Terminal
} from 'lucide-react';
import { Transaction, DepositState } from '../types';
import { useDialogBehavior } from '../hooks/useDialogBehavior';
import { CopyMRadialScanner } from './CopyMRadialScanner';
import { toDepositRef } from '../utils/sharedMockStore';

export type { DepositState };

export interface DepositCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDeposit?: (deposit: Partial<Transaction>) => void;
  initialDeposit?: Partial<Transaction> | null;
}

interface NetworkConfig {
  id: string;
  name: string;
  chainName: string;
  token: string;
  address: string;
  explorerName: string;
  explorerUrl: string;
  badge: string;
}

const NETWORKS: Record<string, NetworkConfig> = {
  'USDC (SEPOLIA)': {
    id: 'USDC (SEPOLIA)',
    name: 'USDC (SEPOLIA)',
    chainName: 'SEPOLIA',
    token: 'USDC',
    address: '0x71C3D8bA52431285093A786B6fD8745E1B4849F',
    explorerName: 'Sepolia Etherscan',
    explorerUrl: 'https://sepolia.etherscan.io/tx/0x8f4c28a9b1c900e231d77a83d47012bc09ef78923a104c83d6a908be140f892a',
    badge: 'TESTNET'
  },
  'USDT · TRON': {
    id: 'USDT · TRON',
    name: 'USDT · TRON (TRC-20)',
    chainName: 'TRON',
    token: 'USDT',
    address: 'TYK9A3XmUqZ9z8VnLw7h4Jb1k8Pq5D2gXy',
    explorerName: 'TronScan',
    explorerUrl: 'https://tronscan.org/#/transaction/7a5b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    badge: 'MAINNET'
  },
  'USDT · ERC-20': {
    id: 'USDT · ERC-20',
    name: 'USDT · Ethereum (ERC-20)',
    chainName: 'ETHEREUM',
    token: 'USDT',
    address: '0x948f21E04A918bca48721c098Ac1237FeE335e23',
    explorerName: 'Etherscan',
    explorerUrl: 'https://etherscan.io/tx/0x8f4c28a9b1c900e231d77a83d47012bc09ef78923a104c83d6a908be140f892a',
    badge: 'MAINNET'
  },
  'USDC · Polygon': {
    id: 'USDC · Polygon',
    name: 'USDC · Polygon PoS',
    chainName: 'POLYGON',
    token: 'USDC',
    address: '0x38bE8921bca9082ef45511aD9012437FeE335e23',
    explorerName: 'PolygonScan',
    explorerUrl: 'https://polygonscan.com/tx/0x38bE8921bca9082ef45511aD9012437FeE335e23',
    badge: 'MAINNET'
  }
};

export const DepositCheckoutModal: React.FC<DepositCheckoutModalProps> = ({
  isOpen,
  onClose,
  onAddDeposit,
  initialDeposit
}) => {
  const dialogRef = useDialogBehavior(isOpen, onClose);
  const [currentState, setCurrentState] = useState<DepositState>('Credited');
  const [integrationMode, setIntegrationMode] = useState<'HPP' | 'H2H'>('HPP');
  const [selectedNetworkKey, setSelectedNetworkKey] = useState<string>('USDC (SEPOLIA)');
  const [orderReference, setOrderReference] = useState<string>('order_181632');
  const [customerId, setCustomerId] = useState<string>('cc001');
  const [targetAmountType, setTargetAmountType] = useState<'choice' | 'fixed'>('choice');
  const [fixedAmount, setFixedAmount] = useState<string>('2,500.00');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(29 * 60 + 44);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (initialDeposit) {
      if (initialDeposit.reference) {
        setOrderReference(initialDeposit.reference.replace('dep_', 'order_'));
      }
      if (initialDeposit.customer) {
        setCustomerId(initialDeposit.customer);
      }
      if (initialDeposit.flow) {
        if (initialDeposit.flow.toUpperCase().includes('H2H')) {
          setIntegrationMode('H2H');
        } else {
          setIntegrationMode('HPP');
        }
      }
      if (initialDeposit.status) {
        if (initialDeposit.status.includes('Confirming')) {
          setCurrentState('Confirming');
        } else if (initialDeposit.status === 'Credited') {
          setCurrentState('Credited');
        } else if (initialDeposit.status.includes('Awaiting')) {
          setCurrentState('Created');
        } else {
          setCurrentState('Credited');
        }
      }
    } else {
      setCurrentState('Credited');
      setIntegrationMode('HPP');
      setSelectedNetworkKey('USDC (SEPOLIA)');
      setOrderReference('order_181632');
      setCustomerId('cc001');
      setTargetAmountType('choice');
      setSecondsRemaining(29 * 60 + 44);
    }
  }, [initialDeposit, isOpen]);

  useEffect(() => {
    if (!isOpen || !isTimerActive) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isTimerActive]);

  if (!isOpen) return null;

  const currentNetwork = NETWORKS[selectedNetworkKey] || NETWORKS['USDC (SEPOLIA)'];
  const formattedMinutes = Math.floor(secondsRemaining / 60)
    .toString()
    .padStart(2, '0');
  const formattedSeconds = (secondsRemaining % 60).toString().padStart(2, '0');
  const timerDisplay = `Expires in ${formattedMinutes}:${formattedSeconds}`;

  const hostedCheckoutUrl = `https://pay.copym.com/checkout/${orderReference}`;

  const rawUri = `${currentNetwork.chainName.toLowerCase()}:${currentNetwork.address}${targetAmountType === 'fixed' ? `?amount=${fixedAmount}&token=${currentNetwork.token}` : ''
    }`;

  const h2hJsonResponse = JSON.stringify(
    {
      order_id: orderReference,
      integration_mode: 'H2H_DIRECT',
      status: currentState === 'Credited' ? 'PAID_CREDITED' : 'AWAITING_PAYMENT',
      network: currentNetwork.chainName,
      token: currentNetwork.token,
      deposit_address: currentNetwork.address,
      qr_uri: rawUri,
      expected_amount: targetAmountType === 'choice' ? 'ANY' : fixedAmount,
      customer_id: customerId,
      expires_at: Math.floor(Date.now() / 1000) + secondsRemaining,
      webhook_event: currentState === 'Credited' ? 'deposit.credited' : 'deposit.awaiting'
    },
    null,
    2
  );

  const curlExample = `curl -X POST https://api.copym.com/v1/orders \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"mode":"H2H","network":"${currentNetwork.chainName}","customer_id":"${customerId}"}'`;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmCredit = () => {
    if (onAddDeposit) {
      const amountValue = targetAmountType === 'choice' ? '1,500.00' : fixedAmount;
      onAddDeposit({
        type: 'Deposit',
        reference: toDepositRef(orderReference),
        customer: customerId,
        network: currentNetwork.name,
        amount: `+ ${amountValue}`,
        status: 'Credited',
        time: 'Just now',
        flow: integrationMode === 'HPP' ? 'HPP · Hosted' : 'H2H · Direct API'
      });
    }
    onClose();
  };

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-fadeIn overflow-y-auto"
    >
      <div className="bg-white rounded-[28px] max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-gray-100 my-auto relative transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
              CURRENT STATE
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#007F4E] border border-emerald-200/70 shadow-2xs font-bold text-xs tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#007F4E] animate-pulse" />
              <span>
                {currentState.toUpperCase()} · {currentNetwork.chainName}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold">
              <Clock className={`w-3.5 h-3.5 ${isTimerActive ? 'text-gray-500' : 'text-amber-500'}`} />
              <button
                onClick={() => setIsTimerActive((prev) => !prev)}
                title={isTimerActive ? "Click to pause timer" : "Click to resume timer"}
                className="hover:text-[#007F4E] transition"
              >
                {timerDisplay}
              </button>
              <button
                onClick={() => {
                  setSecondsRemaining(30 * 60);
                  setIsTimerActive(true);
                }}
                title="Reset timer"
                className="text-[#6B7280] hover:text-gray-600 ml-0.5"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-3 pb-2 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <span>INTEGRATION FLOW</span>
              <span className="text-[#6B7280] font-normal">· Select Cashier Model</span>
            </span>
            <span className="text-xs font-semibold text-[#007F4E] flex items-center gap-1">
              {integrationMode === 'HPP' ? (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  <span>Hosted Payment Page (HPP)</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Host-to-Host Direct API (H2H)</span>
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-gray-100/90 p-1 rounded-2xl border border-gray-200/60">
            <button
              type="button"
              onClick={() => setIntegrationMode('HPP')}
              className={`flex items-center justify-center gap-2.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${integrationMode === 'HPP'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/80'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
            >
              <Globe className={`w-4 h-4 ${integrationMode === 'HPP' ? 'text-[#007F4E]' : 'text-[#6B7280]'}`} />
              <div className="text-left">
                <span className="block leading-tight font-bold">Hosted Checkout (HPP)</span>
                <span className="text-xs font-medium text-[#6B7280] block leading-tight">Hosted Checkout</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setIntegrationMode('H2H')}
              className={`flex items-center justify-center gap-2.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${integrationMode === 'H2H'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/80'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
            >
              <Zap className={`w-4 h-4 ${integrationMode === 'H2H' ? 'text-[#007F4E]' : 'text-[#6B7280]'}`} />
              <div className="text-left">
                <span className="block leading-tight font-bold">Direct API (H2H)</span>
                <span className="text-xs font-medium text-[#6B7280] block leading-tight">Server-to-Server</span>
              </div>
            </button>
          </div>
        </div>

        <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          <div className="md:col-span-5 flex flex-col items-center justify-between bg-gradient-to-b from-gray-50 to-gray-100/70 p-4 sm:p-5 rounded-2xl border border-gray-200/80 text-center">
            <div>
              <div className="flex items-center justify-center gap-1.5 mb-1 text-gray-900 font-bold text-xs sm:text-[13px]">
                {integrationMode === 'HPP' ? (
                  <>
                    <Wallet className="w-4 h-4 text-[#007F4E]" />
                    <span>Scan to Pay with a Crypto Wallet</span>
                  </>
                ) : (
                  <>
                    <Code2 className="w-4 h-4 text-[#007F4E]" />
                    <span>Native Cashier QR Code</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 max-w-[210px] mx-auto leading-tight mb-3">
                {integrationMode === 'HPP'
                  ? 'Use a wallet compatible with the selected network'
                  : 'Display this QR code in your checkout flow'}
              </p>
            </div>

            <CopyMRadialScanner
              address={rawUri}
              amount={targetAmountType === 'choice' ? '1,500.00' : fixedAmount}
              currency="USDT"
              network={currentNetwork.chainName}
              allowToggleView={true}
              className="w-full my-auto"
            />
          </div>

          <div className="md:col-span-7 space-y-3.5 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-gray-50/90 p-3 rounded-xl border border-gray-200">
                <span className="text-xs uppercase font-bold tracking-wider text-[#6B7280] block mb-0.5">
                  Order Reference
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-gray-900 select-all">
                    {orderReference}
                  </span>
                  <button
                    onClick={() => handleCopy(orderReference, 'orderRef')}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 transition"
                    title="Copy Order Reference"
                  >
                    {copiedField === 'orderRef' ? (
                      <Check className="w-3.5 h-3.5 text-[#007F4E]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50/90 p-3 rounded-xl border border-gray-200">
                <span className="text-xs uppercase font-bold tracking-wider text-[#6B7280] block mb-0.5">
                  Merchant Order ID
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-gray-900 select-all">
                    {customerId}
                  </span>
                  <button
                    onClick={() => handleCopy(customerId, 'customerId')}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 transition"
                    title="Copy Merchant Order ID"
                  >
                    {copiedField === 'customerId' ? (
                      <Check className="w-3.5 h-3.5 text-[#007F4E]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50/90 p-3 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#6B7280]">
                    Target Amount
                  </span>
                  <button
                    onClick={() =>
                      setTargetAmountType(targetAmountType === 'choice' ? 'fixed' : 'choice')
                    }
                    className="text-xs text-[#007F4E] hover:underline font-semibold"
                  >
                    {targetAmountType === 'choice' ? 'Set Fixed' : 'Trader Choice'}
                  </button>
                </div>
                <div className="text-xs font-semibold text-gray-900 truncate">
                  {targetAmountType === 'choice' ? (
                    <span className="text-gray-800">Trader Choice (Any Amount)</span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={fixedAmount}
                        onChange={(e) => setFixedAmount(e.target.value)}
                        className="w-24 bg-white border border-gray-200 rounded px-1.5 py-0.5 font-bold text-[#007F4E] text-xs outline-none focus:border-[#007F4E]"
                      />
                      <span className="font-bold text-[#007F4E]">{currentNetwork.token}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50/90 p-3 rounded-xl border border-gray-200">
                <span className="text-xs uppercase font-bold tracking-wider text-[#6B7280] block mb-0.5">
                  Network & Token
                </span>
                <select
                  value={selectedNetworkKey}
                  onChange={(e) => setSelectedNetworkKey(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#007F4E]"
                >
                  <option value="USDC (SEPOLIA)">USDC (SEPOLIA)</option>
                  <option value="USDT · TRON">USDT · TRON (TRC-20)</option>
                  <option value="USDT · ERC-20">USDT · Ethereum (ERC-20)</option>
                  <option value="USDC · Polygon">USDC · Polygon</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase font-bold tracking-wider text-gray-600">
                  Assigned Deposit Address ({currentNetwork.chainName})
                </span>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded-full">
                  {integrationMode === 'HPP' ? 'Deposit Address' : 'Direct Ingestion Address'}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                <span className="font-mono text-xs text-gray-800 break-all select-all flex-1">
                  {currentNetwork.address}
                </span>
                <button
                  onClick={() => handleCopy(currentNetwork.address, 'assignedAddress')}
                  className="px-2.5 py-1 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-md text-xs font-bold transition flex items-center gap-1 shadow-2xs whitespace-nowrap cursor-pointer"
                >
                  {copiedField === 'assignedAddress' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {currentState === 'Credited' ? (
              <div className="bg-emerald-50/90 p-4 rounded-xl border border-emerald-200/80 text-emerald-900 animate-fadeIn">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Deposit Marked as Credited</span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  This demo marks the deposit as credited. Confirm settlement on the selected network before crediting a live ledger.
                </p>
              </div>
            ) : integrationMode === 'HPP' ? (
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 animate-fadeIn">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase font-bold tracking-wider text-gray-600">
                    Payer Hosted Checkout URL
                  </span>
                  <span className="text-xs text-blue-600 font-semibold bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                    Redirect Cashier
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                  <span className="font-mono text-xs text-gray-600 truncate flex-1">
                    {hostedCheckoutUrl}
                  </span>
                  <button
                    onClick={() => handleCopy(hostedCheckoutUrl, 'hostedUrl')}
                    className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition cursor-pointer"
                    title="Copy Hosted Checkout Link"
                  >
                    {copiedField === 'hostedUrl' ? (
                      <Check className="w-3.5 h-3.5 text-[#007F4E]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={`/checkout/${orderReference}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 hover:bg-gray-100 rounded text-[#007F4E] transition cursor-pointer"
                    title="Open Hosted Checkout in New Tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  <span className="font-semibold text-gray-700">HPP Flow:</span> Redirect the payer to the hosted checkout URL above.
                </p>
              </div>
            ) : (
              <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl border border-slate-800 animate-fadeIn font-mono text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-[#007F4E]" />
                    <span>POST /v1/orders Payload</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(h2hJsonResponse, 'h2hJson')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'h2hJson' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(curlExample, 'curl')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'curl' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Code2 className="w-3 h-3" />
                          <span>cURL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 text-xs leading-relaxed max-h-32 overflow-y-auto scrollbar-thin">
                  <pre className="text-slate-300 whitespace-pre font-mono">
                    {h2hJsonResponse}
                  </pre>
                </div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  <span className="font-semibold text-emerald-400">H2H Flow:</span> Use the payload below to create orders from your backend.
                </p>
              </div>
            )}

            {currentState === 'Credited' && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/90 text-[#065F46] animate-fadeIn">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#007F4E] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 leading-tight">
                      Deposit Marked as Credited
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5 leading-snug">
                      Demo ledger updated. No on-chain settlement was performed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <span className="text-gray-500 font-medium">Check network activity:</span>
              <a
                href={currentNetwork.explorerUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(currentNetwork.explorerUrl, '_blank');
                }}
                className="text-[#007F4E] hover:text-[#00663F] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>View on {currentNetwork.explorerName}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 font-mono">
            <span>ID: <strong className="text-gray-800">{orderReference}</strong></span>
            <span>·</span>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 font-bold text-gray-700">
              {integrationMode === 'HPP' ? '🌐 HPP · Hosted Cashier' : '⚡ H2H · Direct Server API'}
            </span>
            <span>·</span>
            <span>Webhook: <strong className="text-[#007F4E]">deposit.credited</strong></span>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleConfirmCredit}
              className="flex-1 sm:flex-initial px-5 py-2 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Credit Deposit to Ledger</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DepositCheckoutModal;
