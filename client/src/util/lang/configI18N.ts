import i18n from 'i18next';
import { initReactI18next, useTranslation as usei18nTranslation } from 'react-i18next';
import Backend from 'i18next-xhr-backend';
import { isDevelopment } from '../isDevelopmentMode';

export enum i18nNamespace {
  DEFAULT = 'translation',
  SCHEINCRITERIA = 'scheincriteria',
}

i18n
  // load translation using xhr -> see /public/locales
  // learn more: https://github.com/i18next/i18next-xhr-backend
  .use(Backend)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    ns: [i18nNamespace.DEFAULT, i18nNamespace.SCHEINCRITERIA],
    defaultNS: i18nNamespace.DEFAULT,
    lng: 'de',
    fallbackLng: 'de',
    debug: isDevelopment(),
    saveMissing: isDevelopment(),
    initImmediate: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: 'http://localhost:8080/api/locales/{{lng}}/{{ns}}',
      withCredentials: true,
      // overrideMimeType: true,
      // ajax: function(_url: string, _options: any, _cb: any, data: any) {
      //   console.log(_url);
      //   console.log(data);
      // },
    },
    react: {
      useSuspense: false,
      wait: true,
    },
  });

export function useTranslation(namespace: string) {
  return usei18nTranslation(namespace);
}

export default i18n;
