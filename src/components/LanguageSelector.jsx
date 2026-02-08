import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = ({ direction = 'down' }) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const languages = [
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'ar', label: 'العربية', flag: '🇸🇦' },
        { code: 'tn', label: 'تونسي', flag: '🇹🇳' },
        { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
        { code: 'zh', label: '中文', flag: '🇨🇳' }
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);

        // Update document direction for RTL languages
        const dir = (langCode === 'ar' || langCode === 'tn') ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = langCode;
    };

    const getCurrentLanguage = () => {
        return languages.find(lang => lang.code === i18n.language) || languages[0];
    };

    const dropdownClasses = direction === 'up'
        ? "absolute right-0 bottom-full mb-3 w-64 bg-white rounded-2xl shadow-2xl border-2 border-slate-100 z-50 overflow-hidden animate-slide-down origin-bottom-right"
        : "absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border-2 border-slate-100 z-50 overflow-hidden animate-slide-down origin-top-right";

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 hover:bg-white border-2 border-slate-200 hover:border-blue-400 transition-all duration-200 shadow-md hover:shadow-lg backdrop-blur-sm ${direction === 'up' ? 'w-full justify-between' : ''}`}
                title="Change Language"
                aria-label="Language selector"
            >
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-xl">
                        language
                    </span>
                    <span className="text-lg">{getCurrentLanguage().flag}</span>
                    <span className="font-semibold text-slate-700 hidden sm:inline">
                        {getCurrentLanguage().code.toUpperCase()}
                    </span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-sm">
                    {isOpen ? (direction === 'up' ? 'expand_more' : 'expand_less') : (direction === 'up' ? 'expand_less' : 'expand_more')}
                </span>
            </button>

            {isOpen && (
                <div className={dropdownClasses}>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-blue-600">translate</span>
                            <h3 className="font-bold text-slate-800">Select Language</h3>
                        </div>
                        <p className="text-xs text-slate-600">Choose your preferred language</p>
                    </div>

                    <div className="p-2 max-h-96 overflow-y-auto">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${i18n.language === lang.code
                                    ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                                    : 'hover:bg-slate-50 border-2 border-transparent'
                                    }`}
                            >
                                <span className="text-3xl">{lang.flag}</span>
                                <div className="flex-1 text-left">
                                    <div className="font-semibold text-slate-800">
                                        {lang.label}
                                    </div>
                                    <div className="text-xs text-slate-500 uppercase font-medium">
                                        {lang.code}
                                    </div>
                                </div>
                                {i18n.language === lang.code && (
                                    <span className="material-symbols-outlined text-blue-600">
                                        check_circle
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-3 bg-slate-50 border-t-2 border-slate-100">
                        <p className="text-xs text-slate-500 text-center">
                            🌍 Your language preference is saved
                        </p>
                    </div>
                </div>
            )}


        </div>
    );
};

export default LanguageSelector;
