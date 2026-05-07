// src/components/ui/RgpdConsent.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function RgpdConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consented = localStorage.getItem('rgpd_consent');
    if (!consented) {
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('rgpd_consent', 'true');
    localStorage.setItem('rgpd_consent_date', new Date().toISOString());
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem('rgpd_consent', 'false');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-ymad-gray-600">
            <p>
              🛡️ Y-Mad utilise des cookies pour améliorer votre expérience. En poursuivant, 
              vous acceptez notre{' '}
              <Link href="/rgpd" className="text-ymad-blue-600 hover:underline">
                politique de confidentialité
              </Link>
              , conformément à la loi malgache n°2014-038.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={decline} className="px-4 py-2 text-sm border rounded-lg hover:bg-ymad-gray-50 transition">
              Refuser
            </button>
            <button onClick={accept} className="px-4 py-2 text-sm bg-ymad-blue-600 text-white rounded-lg hover:bg-ymad-blue-700 transition">
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}