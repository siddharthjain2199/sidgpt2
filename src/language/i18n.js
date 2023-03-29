import i18n from 'i18next';
import english from './english.json';
import french from './french.json';

import {initReactI18next} from 'react-i18next';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
        translation: english
    },
    fr: {
        translation: french
    }
  },
  interpolation: {
    escapeValue: false // react already safes from xss
  }
});

export default i18n;