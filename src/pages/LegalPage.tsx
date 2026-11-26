import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { CopyMLogo } from '../components';
import {
  LEGAL_DOCUMENT_TITLES,
  LegalDocumentContent,
  LegalDocumentType,
} from '../components/LegalDocument';

export interface LegalPageProps {
  type: LegalDocumentType;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type }) => (
  <div className="min-h-screen bg-[#EAEBED] flex flex-col font-sans">
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <CopyMLogo className="w-6 h-6" />
          <div className="flex items-baseline text-lg tracking-tight">
            <span className="font-bold text-[#14171A]">CopyM</span>
            <span className="font-bold text-[#007F4E] ml-1">Pay</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { window.location.href = '/'; }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to portal</span>
        </button>
      </div>
    </header>

    <main className="flex-1 px-4 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-10">
        <h1 className="text-2xl font-bold text-gray-900">{LEGAL_DOCUMENT_TITLES[type]}</h1>
        <p className="mt-1 text-xs text-[#6B7280]">CopyM Pay merchant portal</p>
        <div className="mt-7">
          <LegalDocumentContent type={type} />
        </div>
      </div>
    </main>
  </div>
);
