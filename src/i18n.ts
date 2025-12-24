import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import fr from "./locales/fr.json";
import ar from "./locales/ar.json";

// Fonction pour appliquer la direction RTL/LTR
const applyDirection = (language: string) => {
  const isRTL = language === 'ar';
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
  
  // Optionnel: ajouter/enlever une classe CSS
  if (isRTL) {
    document.documentElement.classList.add('rtl');
  } else {
    document.documentElement.classList.remove('rtl');
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { 
        translation: fr
      },
      ar: { 
        translation: ar
      },
    },
    fallbackLng: "fr",
    supportedLngs: ["fr", "ar"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],      
      lookupLocalStorage: "language"
    },
  })
  .then(() => {
    // Appliquer la direction après l'initialisation
    applyDirection(i18n.language);
  });

// Écouter les changements de langue
i18n.on('languageChanged', (language) => {
  applyDirection(language);
});

export default i18n;
