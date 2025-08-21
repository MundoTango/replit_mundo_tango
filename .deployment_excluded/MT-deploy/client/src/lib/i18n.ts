import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Header & Navigation
      welcome: 'Welcome to Mundo Tango',
      friends: 'Friends',
      messages: 'Messages',
      notifications: 'Notifications',
      search: 'Search',
      // Memories Section
      memories: 'Memories',
      shareYourMemory: 'Share your precious moments with the community...',
      eventsInYourCity: 'Events in Your City',
      noUpcomingEvents: 'No upcoming events',
      share: 'Share',
      edit: 'Edit',
      milongasInYourCity: 'Milongas in Your City',
      shareTangoMoment: 'Share a tango moment...',
      // Tags
      add: 'Add',
      addTags: 'Add tags to your memory',
      practice: 'Practice',
      performance: 'Performance',
      // Common Actions
      post: 'Post',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      // Profile
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
    }
  },
  es: {
    translation: {
      // Header & Navigation
      welcome: 'Bienvenido a Mundo Tango',
      friends: 'Amigos',
      messages: 'Mensajes',
      notifications: 'Notificaciones',
      search: 'Buscar',
      // Memories Section
      memories: 'Memorias',
      shareYourMemory: 'Comparte tus momentos preciosos con la comunidad...',
      eventsInYourCity: 'Eventos en Tu Ciudad',
      noUpcomingEvents: 'No hay eventos próximos',
      share: 'Compartir',
      edit: 'Editar',
      milongasInYourCity: 'Milongas en Tu Ciudad',
      shareTangoMoment: 'Comparte un momento de tango...',
      // Tags
      add: 'Agregar',
      addTags: 'Agrega etiquetas a tu memoria',
      practice: 'Práctica',
      performance: 'Presentación',
      // Common Actions
      post: 'Publicar',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      // Profile
      profile: 'Perfil',
      settings: 'Configuración',
      logout: 'Cerrar sesión',
    }
  },
  fr: {
    translation: {
      // Header & Navigation
      welcome: 'Bienvenue à Mundo Tango',
      friends: 'Amis',
      messages: 'Messages',
      notifications: 'Notifications',
      search: 'Rechercher',
      // Memories Section
      memories: 'Souvenirs',
      shareYourMemory: 'Partagez vos moments précieux avec la communauté...',
      eventsInYourCity: 'Événements dans votre ville',
      noUpcomingEvents: 'Aucun événement à venir',
      share: 'Partager',
      edit: 'Modifier',
      milongasInYourCity: 'Milongas dans votre ville',
      shareTangoMoment: 'Partagez un moment de tango...',
      // Tags
      add: 'Ajouter',
      addTags: 'Ajoutez des tags à votre souvenir',
      practice: 'Pratique',
      performance: 'Performance',
      // Common Actions
      post: 'Publier',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      // Profile
      profile: 'Profil',
      settings: 'Paramètres',
      logout: 'Déconnexion',
    }
  },
  de: {
    translation: {
      // Header & Navigation
      welcome: 'Willkommen bei Mundo Tango',
      friends: 'Freunde',
      messages: 'Nachrichten',
      notifications: 'Benachrichtigungen',
      search: 'Suchen',
      // Memories Section
      memories: 'Erinnerungen',
      shareYourMemory: 'Teilen Sie Ihre kostbaren Momente mit der Community...',
      eventsInYourCity: 'Veranstaltungen in Ihrer Stadt',
      noUpcomingEvents: 'Keine bevorstehenden Veranstaltungen',
      share: 'Teilen',
      edit: 'Bearbeiten',
      milongasInYourCity: 'Milongas in Ihrer Stadt',
      shareTangoMoment: 'Teilen Sie einen Tango-Moment...',
      // Tags
      add: 'Hinzufügen',
      addTags: 'Fügen Sie Tags zu Ihrer Erinnerung hinzu',
      practice: 'Übung',
      performance: 'Aufführung',
      // Common Actions
      post: 'Veröffentlichen',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      // Profile
      profile: 'Profil',
      settings: 'Einstellungen',
      logout: 'Abmelden',
    }
  },
  it: {
    translation: {
      // Header & Navigation
      welcome: 'Benvenuto a Mundo Tango',
      friends: 'Amici',
      messages: 'Messaggi',
      notifications: 'Notifiche',
      search: 'Cerca',
      // Memories Section
      memories: 'Ricordi',
      shareYourMemory: 'Condividi i tuoi momenti preziosi con la comunità...',
      eventsInYourCity: 'Eventi nella tua città',
      noUpcomingEvents: 'Nessun evento in programma',
      share: 'Condividi',
      edit: 'Modifica',
      milongasInYourCity: 'Milonghe nella tua città',
      shareTangoMoment: 'Condividi un momento di tango...',
      // Tags
      add: 'Aggiungi',
      addTags: 'Aggiungi tag al tuo ricordo',
      practice: 'Pratica',
      performance: 'Esibizione',
      // Common Actions
      post: 'Pubblica',
      cancel: 'Annulla',
      save: 'Salva',
      delete: 'Elimina',
      // Profile
      profile: 'Profilo',
      settings: 'Impostazioni',
      logout: 'Esci',
    }
  },
  pt: {
    translation: {
      // Header & Navigation
      welcome: 'Bem-vindo ao Mundo Tango',
      friends: 'Amigos',
      messages: 'Mensagens',
      notifications: 'Notificações',
      search: 'Pesquisar',
      // Memories Section
      memories: 'Memórias',
      shareYourMemory: 'Compartilhe seus momentos preciosos com a comunidade...',
      eventsInYourCity: 'Eventos em sua cidade',
      noUpcomingEvents: 'Nenhum evento próximo',
      share: 'Compartilhar',
      edit: 'Editar',
      milongasInYourCity: 'Milongas em sua cidade',
      shareTangoMoment: 'Compartilhe um momento de tango...',
      // Tags
      add: 'Adicionar',
      addTags: 'Adicione tags à sua memória',
      practice: 'Prática',
      performance: 'Apresentação',
      // Common Actions
      post: 'Publicar',
      cancel: 'Cancelar',
      save: 'Salvar',
      delete: 'Excluir',
      // Profile
      profile: 'Perfil',
      settings: 'Configurações',
      logout: 'Sair',
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