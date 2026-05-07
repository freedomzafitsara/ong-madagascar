'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const handleSetFrench = () => {
    setLanguage('fr');
  };

  const handleSetMalagasy = () => {
    setLanguage('mg');
  };

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={handleSetFrench}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
          language === 'fr'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-200'
        }`}
        type="button"
      >
        FR
      </button>
      <button
        onClick={handleSetMalagasy}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
          language === 'mg'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-200'
        }`}
        type="button"
      >
        MG
      </button>
    </div>
  );
}