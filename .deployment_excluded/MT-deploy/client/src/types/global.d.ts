import type i18n from 'i18next';

declare global {
  interface Window {
    i18n?: typeof i18n;
  }
}

export {};