'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('fr')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
          language === 'fr'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => setLanguage('mg')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
          language === 'mg'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        MG
      </button>
    </div>
  );
}