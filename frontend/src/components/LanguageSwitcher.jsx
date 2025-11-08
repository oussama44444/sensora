import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, t } = useLanguage();

  // Keep only FR and TN labels
  const labels = { fr: 'Français', tn: 'Tunisien' };
  const currentLabel = labels[language] || language;

  const changeLabel = () => {
    // use translation helper if available
    if (typeof t === 'function') {
      // expects e.g. "changeLanguage" key in your locales
      return t('common.changeLanguage')?.replace('{lang}', currentLabel) || `Change language — ${currentLabel}`;
    }
    return `Change language — ${currentLabel}`;
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => window.dispatchEvent(new Event('open-language-selector'))}
        className="bg-white shadow-md rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-50 flex items-center space-x-2"
        aria-label="Change language"
      >
        <span>{changeLabel()}</span>
      </button>
    </div>
  );
}