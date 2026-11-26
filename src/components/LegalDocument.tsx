import React from 'react';

export type LegalDocumentType = 'terms' | 'privacy';

export const LEGAL_DOCUMENT_TITLES: Record<LegalDocumentType, string> = {
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
};

export const LegalDocumentContent: React.FC<{ type: LegalDocumentType }> = ({ type }) => (
  <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
    {type === 'terms' ? (
      <>
        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-gray-900">1. Acceptance of Terms</h2>
          <p>By registering for a CopyM Pay account, you agree to these terms and any account terms provided to you.</p>
        </section>
        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-gray-900">2. Merchant Responsibilities</h2>
          <p>Keep your account credentials and API keys confidential, and review account activity regularly.</p>
        </section>
        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-gray-900">3. Use of the Service</h2>
          <p>Service availability and features may change. Contact support if you have questions about your account.</p>
        </section>
      </>
    ) : (
      <>
        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-gray-900">1. Data Collection & Processing</h2>
          <p>We collect the information you provide, such as your business details and contact email, to create and administer your account.</p>
        </section>
        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-gray-900">2. Use of Information</h2>
          <p>We use account information to provide the services you request and to respond to support inquiries.</p>
        </section>
        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-gray-900">3. Retention & Sharing</h2>
          <p>We keep account information to administer your account and may use service providers that support the platform.</p>
        </section>
      </>
    )}
  </div>
);
