'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'fr' | 'mg';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Traductions pour le thème "Gestion des offres d'emploi" - Y-MaD
export const translations: Record<Language, Record<string, string>> = {
  fr: {
    // ==================== NAVIGATION ====================
    'nav.home': 'Accueil',
    'nav.projects': 'Projets',
    'nav.jobs': 'Offres d\'emploi',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.login': 'Connexion',
    'nav.logout': 'Déconnexion',
    'nav.dashboard': 'Tableau de bord',
    'nav.profile': 'Mon profil',

    // ==================== HERO SECTION ====================
    'hero.badge': 'Y-MaD - Jeunesse pour le développement de Madagascar',
    'hero.title': 'Y-MaD',
    'hero.subtitle': 'Young for Madagascar Development',
    'hero.jobs': 'Voir les offres',
    'hero.projects': 'Découvrir nos projets',

    // ==================== STATS SECTION ====================
    'stats.projects': 'Projets réalisés',
    'stats.beneficiaries': 'Bénéficiaires',
    'stats.volunteers': 'Bénévoles',
    'stats.trees': 'Arbres plantés',
    'stats.regions': 'Régions couvertes',
    'stats.partners': 'Partenaires',

    // ==================== PROJECTS SECTION ====================
    'projects.title': 'Nos projets',
    'projects.subtitle': 'Découvrez nos actions sur le terrain',
    'projects.view': 'Voir le projet',
    'projects.view_all': 'Voir tous nos projets',
    'projects.status': 'Statut',
    'projects.ongoing': 'En cours',
    'projects.completed': 'Terminé',

    // ==================== JOBS SECTION ====================
    'jobs.title': 'Offres d\'emploi',
    'jobs.subtitle': 'Trouvez votre opportunité professionnelle à Madagascar',
    'jobs.apply': 'Postuler',
    'jobs.details': 'Voir les détails',
    'jobs.contract': 'Type de contrat',
    'jobs.location': 'Lieu',
    'jobs.deadline': 'Date limite',
    'jobs.expired': 'Expirée',
    'jobs.featured': 'À la une',
    'jobs.cdi': 'CDI',
    'jobs.cdd': 'CDD',
    'jobs.stage': 'Stage',
    'jobs.freelance': 'Freelance',
    'jobs.application_submitted': 'Candidature envoyée',
    'jobs.submitted': 'Soumise',
    'jobs.reviewing': 'En révision',
    'jobs.interview': 'Entretien',
    'jobs.accepted': 'Acceptée',
    'jobs.rejected': 'Refusée',

    // ==================== BLOG SECTION ====================
    'blog.title': 'Actualités',
    'blog.subtitle': 'Toute l\'actualité de Y-MaD',
    'blog.read': 'Lire la suite',
    'blog.author': 'Auteur',
    'blog.date': 'Date',
    'blog.no_articles': 'Aucun article trouvé',

    // ==================== CONTACT SECTION ====================
    'contact.title': 'Contactez-nous',
    'contact.subtitle': 'Nous sommes à votre écoute',
    'contact.name': 'Nom complet',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.send': 'Envoyer',
    'contact.address': 'Carion, Antananarivo, Madagascar',
    'contact.phone_label': 'Téléphone',
    'contact.phone_value': '+261 32 04 856 97',
    'contact.email_label': 'Email',
    'contact.email_value': 'ymad.mg@gmail.com',
    'contact.hours': 'Horaires d\'ouverture',
    'contact.monday_friday': 'Lundi - Vendredi: 8h - 17h',
    'contact.saturday': 'Samedi: Fermé',
    'contact.sunday': 'Dimanche: Fermé',
    'contact.success': 'Message envoyé avec succès !',
    'contact.error': 'Erreur lors de l\'envoi du message',

    // ==================== NEWSLETTER SECTION ====================
    'newsletter.title': 'Restez informés',
    'newsletter.subtitle': 'Recevez nos actualités et offres d\'emploi par email',
    'newsletter.placeholder': 'Votre adresse email',
    'newsletter.button': 'S\'abonner',
    'newsletter.success': 'Merci de votre inscription !',
    'newsletter.error': 'Email invalide. Veuillez réessayer.',

    // ==================== FOOTER SECTION ====================
    'footer.about': 'À propos de Y-MaD',
    'footer.description': 'Plateforme de gestion des offres d\'emploi pour les jeunes à Madagascar.',
    'footer.contact': 'Contactez-nous',
    'footer.follow': 'Suivez-nous',
    'footer.legal': 'Mentions légales',
    'footer.privacy': 'Confidentialité',
    'footer.terms': 'Conditions d\'utilisation',
    'footer.rights': 'Tous droits réservés',
    'footer.address': 'Carion, Antananarivo, Madagascar',
    'footer.email': 'ymad.mg@gmail.com',
    'footer.phone': '+261 32 04 856 97',
    'footer.hours': 'Lun-Ven: 8h-17h',

    // ==================== COMMON ====================
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur est survenue',
    'common.success': 'Opération réussie',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.search': 'Rechercher',
    'common.back': 'Retour',
    'common.submit': 'Envoyer',
    'common.close': 'Fermer',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.all': 'Tous',
    'common.no_data': 'Aucune donnée disponible',

    // ==================== DASHBOARD ====================
    'dashboard.title': 'Tableau de bord',
    'dashboard.welcome': 'Bienvenue sur votre espace d\'administration',
    'dashboard.jobs': 'Offres d\'emploi',
    'dashboard.applications': 'Candidatures',
    'dashboard.projects': 'Projets',
    'dashboard.blog': 'Articles',
    'dashboard.contacts': 'Messages',
    'dashboard.quick_actions': 'Actions rapides',
    'dashboard.new_job': 'Publier une offre',
    'dashboard.new_project': 'Nouveau projet',
    'dashboard.new_article': 'Nouvel article',

    // ==================== AUTH ====================
    'auth.login_title': 'Connexion',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.remember_me': 'Se souvenir de moi',
    'auth.forgot_password': 'Mot de passe oublié ?',
    'auth.login_now': 'Se connecter',
    'auth.logout': 'Déconnexion',
  },
  mg: {
    // ==================== NAVIGATION ====================
    'nav.home': 'Fandraisana',
    'nav.projects': 'Tetikasa',
    'nav.jobs': 'Toerana asa',
    'nav.blog': 'Vaovao',
    'nav.contact': 'Fifandraisana',
    'nav.login': 'Hiditra',
    'nav.logout': 'Hivoaka',
    'nav.dashboard': 'Takelaka',
    'nav.profile': 'Momba ahy',

    // ==================== HERO SECTION ====================
    'hero.badge': 'Y-MaD - Tanora ho an\'ny fivoaran\'i Madagasikara',
    'hero.title': 'Y-MaD',
    'hero.subtitle': 'Young for Madagascar Development',
    'hero.jobs': 'Jereo ny asa',
    'hero.projects': 'Hijery ny tetikasa',

    // ==================== STATS SECTION ====================
    'stats.projects': 'Tetikasa vita',
    'stats.beneficiaries': 'Tompondaka',
    'stats.volunteers': 'Mpanao asa soa',
    'stats.trees': 'Hazo nambolena',
    'stats.regions': 'Faritra voarakotra',
    'stats.partners': 'Mpiara-miasa',

    // ==================== PROJECTS SECTION ====================
    'projects.title': 'Tetikasa',
    'projects.subtitle': 'Hijery ny asa ataontsika eto an-tany',
    'projects.view': 'Jereo ny tetikasa',
    'projects.view_all': 'Jereo ny tetikasa rehetra',
    'projects.status': 'Toe-javatra',
    'projects.ongoing': 'Mitohy',
    'projects.completed': 'Vita',

    // ==================== JOBS SECTION ====================
    'jobs.title': 'Toerana asa',
    'jobs.subtitle': 'Mitadiava asa eto Madagasikara',
    'jobs.apply': 'Mangataka',
    'jobs.details': 'Jereo ny antsipirihany',
    'jobs.contract': 'Karazana fifanarahana',
    'jobs.location': 'Toerana',
    'jobs.deadline': 'Daty farany',
    'jobs.expired': 'Lany daty',
    'jobs.featured': 'Voasongadina',
    'jobs.cdi': 'CDI',
    'jobs.cdd': 'CDD',
    'jobs.stage': 'Fiofanana',
    'jobs.freelance': 'Freelance',
    'jobs.application_submitted': 'Efa nalefa ny fangatahana',
    'jobs.submitted': 'Nalefa',
    'jobs.reviewing': 'Azo dinihina',
    'jobs.interview': 'Dinidinika',
    'jobs.accepted': 'Ekena',
    'jobs.rejected': 'Lavina',

    // ==================== BLOG SECTION ====================
    'blog.title': 'Vaovao',
    'blog.subtitle': 'Vaovao momba ny Y-MaD',
    'blog.read': 'Hamaky bebe kokoa',
    'blog.author': 'Mpanoratra',
    'blog.date': 'Daty',
    'blog.no_articles': 'Tsy misy lahatsoratra hita',

    // ==================== CONTACT SECTION ====================
    'contact.title': 'Mifandraisa aminay',
    'contact.subtitle': 'Vonona hanampy anao izahay',
    'contact.name': 'Anarana feno',
    'contact.email': 'Email',
    'contact.message': 'Hafatra',
    'contact.send': 'Alefaso',
    'contact.address': 'Carion, Antananarivo, Madagasikara',
    'contact.phone_label': 'Telefaonina',
    'contact.phone_value': '+261 32 04 856 97',
    'contact.email_label': 'Email',
    'contact.email_value': 'ymad.mg@gmail.com',
    'contact.hours': 'Ora fisokafana',
    'contact.monday_friday': 'Alatsinainy - Zoma: 8h - 17h',
    'contact.saturday': 'Asabotsy: Mikatona',
    'contact.sunday': 'Alahady: Mikatona',
    'contact.success': 'Vita ny fandefasana ny hafatra !',
    'contact.error': 'Nisy hadisoana tamin\'ny fandefasana ny hafatra',

    // ==================== NEWSLETTER SECTION ====================
    'newsletter.title': 'Mijanòna ho voa-tantara',
    'newsletter.subtitle': 'Mahazoa ny vaovao sy asa ataonay isaky ny email',
    'newsletter.placeholder': 'Adiresy email anao',
    'newsletter.button': 'Manaraka',
    'newsletter.success': 'Misaotra nisoratra anarana !',
    'newsletter.error': 'Tsy manan-kery ny email. Miezaka indray azafady.',

    // ==================== FOOTER SECTION ====================
    'footer.about': 'Momba ny Y-MaD',
    'footer.description': 'Sehatra fitantanana asa ho an\'ny tanora eto Madagasikara.',
    'footer.contact': 'Mifandraisa aminay',
    'footer.follow': 'Araho izahay',
    'footer.legal': 'Fampahalalana ara-dalàna',
    'footer.privacy': 'Tsiambaratelo',
    'footer.terms': 'Fepetra fampiasana',
    'footer.rights': 'Zo rehetra voatokana',
    'footer.address': 'Carion, Antananarivo, Madagasikara',
    'footer.email': 'ymad.mg@gmail.com',
    'footer.phone': '+261 32 04 856 97',
    'footer.hours': 'Ala-Zoma: 8h-17h',

    // ==================== COMMON ====================
    'common.loading': 'Miandry...',
    'common.error': 'Nisy hadisoana',
    'common.success': 'Vita soa aman-tsara',
    'common.save': 'Tehirizina',
    'common.cancel': 'Avela',
    'common.delete': 'Fafana',
    'common.edit': 'Ovaina',
    'common.view': 'Jereo',
    'common.search': 'Karohy',
    'common.back': 'Miverina',
    'common.submit': 'Alefaso',
    'common.close': 'Hidy',
    'common.yes': 'Eny',
    'common.no': 'Tsia',
    'common.all': 'Rehetra',
    'common.no_data': 'Tsy misy angona',

    // ==================== DASHBOARD ====================
    'dashboard.title': 'Takelaka fandraisana',
    'dashboard.welcome': 'Tonga soa eo amin\'ny faritra fitantananao',
    'dashboard.jobs': 'Toerana asa',
    'dashboard.applications': 'Fangatahana',
    'dashboard.projects': 'Tetikasa',
    'dashboard.blog': 'Lahatsoratra',
    'dashboard.contacts': 'Hafatra',
    'dashboard.quick_actions': 'Hetsika haingana',
    'dashboard.new_job': 'Avoaka asa',
    'dashboard.new_project': 'Tetikasa vaovao',
    'dashboard.new_article': 'Lahatsoratra vaovao',

    // ==================== AUTH ====================
    'auth.login_title': 'Hiditra',
    'auth.email': 'Email',
    'auth.password': 'Tenimiafina',
    'auth.remember_me': 'Tsarovy aho',
    'auth.forgot_password': 'Hadino ny tenimiafina ?',
    'auth.login_now': 'Hiditra izao',
    'auth.logout': 'Hivoaka',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('y-mad-language');
    if (saved === 'fr' || saved === 'mg') {
      setLanguage(saved);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('y-mad-language', language);
      document.documentElement.lang = language;
    }
  }, [language, isLoaded]);

  // Fonction de traduction
  const t = (key: string): string => {
    const translation = translations[language][key];
    if (!translation) {
      console.warn(`Traduction manquante: ${key} (${language})`);
      return key;
    }
    return translation;
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}