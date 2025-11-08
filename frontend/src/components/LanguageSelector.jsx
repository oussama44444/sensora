import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';


const ASTRONAUT_IMAGE = "/assets/images/astro.jpg"; // updated to your provided image path

export default function LanguageSelector() {
  const { language, switchLanguage, t } = useLanguage(); // use switchLanguage from context
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-language-selector', handler);
    return () => window.removeEventListener('open-language-selector', handler);
  }, []);

  // Restrict languages to only Tunisian and French
  const languages = [
    { code: 'tn', label: 'Tunisien' },
    { code: 'fr', label: 'Français' }
  ];

  const getLabel = (code) => {
    const l = languages.find(x => x.code === code);
    return l ? l.label : code;
  };

  const changeLanguageLabel = () => {
    if (typeof t === 'function') {
      // prefer an existing translation key, otherwise fall back
      return t('common.changeLanguage')?.replace('{lang}', getLabel(language)) || `Change language — ${getLabel(language)}`;
    }
    return `Change language — ${getLabel(language)}`;
  };

  const chooseLanguage = (code) => {
    console.log('LanguageSelector: switching to', code);
    switchLanguage(code);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-green-100 rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">{changeLanguageLabel()}</h3>
          <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-800">✕</button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 p-6">
          <div className="flex-1 grid grid-cols-1 h-6 translate-y-40 sm:grid-cols-2 gap-4">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => chooseLanguage(lang.code)}
                className={`rounded-lg py-4  px-5 text-lg font-semibold transition transform shadow-md
                  ${language === lang.code ? 'bg-teal-500 text-white scale-105' : 'bg-slate-100 text-slate-800 hover:scale-102'}`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <div className="flex-1 flex items-center justify-center">
            <img src={ASTRONAUT_IMAGE} alt="astronaut" className="max-w-xs w-full object-contain" />
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t">
          <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200">Close</button>
        </div>
      </div>
    </div>
  );
}
