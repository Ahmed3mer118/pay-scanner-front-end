import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, getNested, interpolate } from '../i18n/translations';

const STORAGE_KEY = 'payscanner_lang';
const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' || saved === 'ar' ? saved : 'ar';
  });

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang, dir]);

  const setLang = useCallback((next) => {
    setLangState(next === 'en' ? 'en' : 'ar');
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  const t = useCallback((key, vars) => {
    const raw = getNested(translations[lang], key) ?? getNested(translations.en, key) ?? key;
    return typeof raw === 'string' ? interpolate(raw, vars) : raw;
  }, [lang]);

  const locale = lang === 'ar' ? 'ar-EG' : 'en-EG';

  return (
    <I18nContext.Provider value={{ lang, dir, locale, setLang, toggleLang, t, isRtl: dir === 'rtl' }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};
