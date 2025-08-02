import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      welcome: 'Welcome to Mundo Tango',
      friends: 'Friends',
      messages: 'Messages',
      notifications: 'Notifications',
      search: 'Search',
      // Add more translations as needed
    }
  },
  es: {
    translation: {
      welcome: 'Bienvenido a Mundo Tango',
      friends: 'Amigos',
      messages: 'Mensajes',
      notifications: 'Notificaciones',
      search: 'Buscar',
    }
  },
  fr: {
    translation: {
      welcome: 'Bienvenue à Mundo Tango',
      friends: 'Amis',
      messages: 'Messages',
      notifications: 'Notifications',
      search: 'Rechercher',
    }
  },
  de: {
    translation: {
      welcome: 'Willkommen bei Mundo Tango',
      friends: 'Freunde',
      messages: 'Nachrichten',
      notifications: 'Benachrichtigungen',
      search: 'Suchen',
    }
  },
  it: {
    translation: {
      welcome: 'Benvenuto a Mundo Tango',
      friends: 'Amici',
      messages: 'Messaggi',
      notifications: 'Notifiche',
      search: 'Cerca',
    }
  },
  pt: {
    translation: {
      welcome: 'Bem-vindo ao Mundo Tango',
      friends: 'Amigos',
      messages: 'Mensagens',
      notifications: 'Notificações',
      search: 'Pesquisar',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Make i18n available globally for the language selector
if (typeof window !== 'undefined') {
  window.i18n = i18n;
}

export default i18n;