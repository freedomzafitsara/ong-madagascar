// frontend/src/contexts/LanguageContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';

// ============================================================
// TYPES
// ============================================================

export type Language = 'fr' | 'mg';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

// ============================================================
// TRADUCTIONS COMPLÈTES - SANS DOUBLONS
// ============================================================

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
    'nav.administration': 'Administration',
    'nav.candidate_space': 'Espace candidat',

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
    'common.actions': 'Actions',
    'common.status': 'Statut',

    // ==================== DASHBOARD ====================
    'dashboard.title': 'Tableau de bord',
    'dashboard.welcome': 'Bonjour',
    'dashboard.here_is_overview': 'Voici un aperçu complet de votre activité.',
    'dashboard.last_update': 'Dernière mise à jour',
    'dashboard.your_impact': 'Votre impact',
    'dashboard.impact_description': 'Grâce à votre engagement, Y-MaD continue de connecter les jeunes aux opportunités d\'emploi à Madagascar.',
    'dashboard.active_projects': 'Projets actifs',
    'dashboard.active_jobs': 'Offres actives',
    'dashboard.quick_actions': 'Actions rapides',
    'dashboard.new_project': 'Nouveau projet',
    'dashboard.new_job': 'Nouvelle offre',
    'dashboard.new_article': 'Nouvel article',
    'dashboard.generate_report': 'Générer rapport',
    'dashboard.site_management': 'Gestion du site',
    'dashboard.site_management_desc': 'Personnalisez l\'apparence et le contenu du site',
    'dashboard.manage_pages': 'Gérer les pages',
    'dashboard.manage_backgrounds': 'Gérer les fonds d\'écran',
    'dashboard.see_impact': 'Voir le détail',
    'dashboard.admin': 'Administrateur',
    'dashboard.refresh': 'Actualiser',
    'dashboard.recent_activity': 'Activité récente',
    'dashboard.view_all': 'Voir tout',
    'dashboard.no_activity': 'Aucune activité récente',
    'dashboard.quick_tips': 'Conseils stratégiques',
    'dashboard.tip1': 'Publiez des offres régulièrement pour attirer plus de candidats',
    'dashboard.tip2': 'Répondez aux candidatures dans les 48h pour maximiser l\'engagement',
    'dashboard.tip3': 'Mettez en avant vos projets réussis pour inspirer la communauté',
    'dashboard.tip4': 'Actualisez votre blog chaque semaine pour maintenir l\'audience',
    'dashboard.system_operational': 'Système opérationnel',
    'dashboard.database_synced': 'Base de données synchronisée',
    'dashboard.copyright': 'Y-MaD Platform v1.0 - 2025 Young for Madagascar Development',
    'dashboard.total_users': 'Utilisateurs',
    'dashboard.manage_users': 'Gérer les utilisateurs',
    'dashboard.view_profile': 'Voir mon profil',
    'dashboard.settings': 'Paramètres',
    'dashboard.logout': 'Déconnexion',
    'dashboard.access_denied': 'Accès refusé',
    'dashboard.admin_only': 'Cette page est réservée aux administrateurs.',
    'dashboard.return_home': 'Retour à l\'accueil',
    'dashboard.completion_rate': 'Taux de complétion',
    'dashboard.applications_received': 'Candidatures reçues',
    'dashboard.new_users': 'Nouveaux utilisateurs',
    'dashboard.projects_completed': 'Projets terminés',
    'dashboard.monthly_stats': 'Statistiques mensuelles',
    'dashboard.performance': 'Performance globale',
    'dashboard.export_data': 'Exporter les données',
    'dashboard.view_details': 'Voir les détails',
    'dashboard.total_jobs': 'Total des offres',
    'dashboard.published_jobs': 'Offres publiées',
    'dashboard.total_projects': 'Total des projets',
    'dashboard.blog_posts': 'Articles de blog',
    'dashboard.pending': 'En attente',
    'dashboard.contacts': 'Messages',
    'dashboard.unread': 'Non lus',
    'dashboard.evolution': 'Évolution mensuelle',
    'dashboard.distribution': 'Répartition',
    'dashboard.jobs_evolution': 'Offres d\'emploi',
    'dashboard.applications_evolution': 'Candidatures',
    'dashboard.users_evolution': 'Utilisateurs',
    'dashboard.projects_evolution': 'Projets',
    'dashboard.this_month': 'ce mois',
    'dashboard.completed': 'Terminé',

    // ==================== STATS CARDS ====================
    'stats_cards.jobs': 'Offres',
    'stats_cards.published': 'Publiées',
    'stats_cards.applications': 'Candidatures',
    'stats_cards.pending': 'En attente',
    'stats_cards.projects': 'Projets',
    'stats_cards.active': 'Actifs',
    'stats_cards.blog': 'Articles',
    'stats_cards.contacts': 'Messages',
    'stats_cards.unread': 'Non lus',
    'stats_cards.users': 'Utilisateurs',
    'stats_cards.total': 'Total',
    'stats_cards.new': 'Nouveaux',
    'stats_cards.this_month': 'ce mois',
    'stats_cards.received': 'Reçues',
    'stats_cards.published_label': 'Publiées',
    'stats_cards.view_details': 'Voir détails',
    'stats_cards.completion_rate': 'Taux de complétion',
    'stats_cards.applications_received': 'Candidatures reçues',
    'stats_cards.new_users': 'Nouveaux utilisateurs',
    'stats_cards.projects_completed': 'Projets terminés',

    // ==================== AUTH ====================
    'auth.login_title': 'Connexion',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.remember_me': 'Se souvenir de moi',
    'auth.forgot_password': 'Mot de passe oublié ?',
    'auth.login_now': 'Se connecter',
    'auth.logout': 'Déconnexion',
    'auth.register': 'S\'inscrire',
    'auth.confirm_password': 'Confirmer le mot de passe',
    'auth.terms_accept': 'J\'accepte les conditions d\'utilisation',
    'auth.already_account': 'Déjà un compte ?',
    'auth.no_account': 'Pas encore de compte ?',
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
    'nav.administration': 'Fitantanana',
    'nav.candidate_space': 'Toeran\'ny mpangataka',

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
    'common.actions': 'Hetsika',
    'common.status': 'Toe-javatra',

    // ==================== DASHBOARD ====================
    'dashboard.title': 'Takelaka fandraisana',
    'dashboard.welcome': 'Tonga soa',
    'dashboard.here_is_overview': 'Ity ny famintinana feno ny asanao.',
    'dashboard.last_update': 'Fanavaozana farany',
    'dashboard.your_impact': 'Ny fiantraikanao',
    'dashboard.impact_description': 'Noho ny fandraisanao anjara, Y-MaD dia manohy mampifandray ny tanora amin\'ny asa eto Madagasikara.',
    'dashboard.active_projects': 'Tetikasa mavitrika',
    'dashboard.active_jobs': 'Asa misokatra',
    'dashboard.quick_actions': 'Hetsika haingana',
    'dashboard.new_project': 'Tetikasa vaovao',
    'dashboard.new_job': 'Asa vaovao',
    'dashboard.new_article': 'Lahatsoratra vaovao',
    'dashboard.generate_report': 'Mamorona tatitra',
    'dashboard.site_management': 'Fitantanan-tranonkala',
    'dashboard.site_management_desc': 'Amboary ny endrika sy ny atiny',
    'dashboard.manage_pages': 'Hitantana pejy',
    'dashboard.manage_backgrounds': 'Hitantana sary ambadika',
    'dashboard.see_impact': 'Jereo ny antsipirihany',
    'dashboard.admin': 'Mpandrindra',
    'dashboard.refresh': 'Havaozina',
    'dashboard.recent_activity': 'Hetsika vao haingana',
    'dashboard.view_all': 'Jereo daholo',
    'dashboard.no_activity': 'Tsy misy hetsika vao haingana',
    'dashboard.quick_tips': 'Torolalana stratejika',
    'dashboard.tip1': 'Avoary matetika ny asa mba hisarihana mpangataka maro',
    'dashboard.tip2': 'Valio ny fangatahana ao anatin\'ny 48 ora',
    'dashboard.tip3': 'Asongadino ny tetikasanao nahomby',
    'dashboard.tip4': 'Havaozy ny bilaogy isan-kerinandro',
    'dashboard.system_operational': 'Rafitra miasa',
    'dashboard.database_synced': 'Angona voarakitra',
    'dashboard.copyright': 'Y-MaD Platform v1.0 - 2025 Young for Madagascar Development',
    'dashboard.total_users': 'Mpampiasa',
    'dashboard.manage_users': 'Hitantana mpampiasa',
    'dashboard.view_profile': 'Jereo ny mombamomba ahy',
    'dashboard.settings': 'Fandrindrana',
    'dashboard.logout': 'Mivoaka',
    'dashboard.access_denied': 'Tsy mahazo miditra',
    'dashboard.admin_only': 'Ity pejy ity dia ho an\'ny mpandrindra ihany.',
    'dashboard.return_home': 'Hiverina any an-tokotany',
    'dashboard.completion_rate': 'Tahan\'ny fahavitana',
    'dashboard.applications_received': 'Fangatahana noraisina',
    'dashboard.new_users': 'Mpampiasa vaovao',
    'dashboard.projects_completed': 'Tetikasa vita',
    'dashboard.monthly_stats': 'Statistika isam-bolana',
    'dashboard.performance': 'Fampisehoana ankapobeny',
    'dashboard.export_data': 'Hamoaka ny angona',
    'dashboard.view_details': 'Jereo ny antsipirihany',
    'dashboard.total_jobs': 'Totalin\'ny asa',
    'dashboard.published_jobs': 'Asa navoaka',
    'dashboard.total_projects': 'Totalin\'ny tetikasa',
    'dashboard.blog_posts': 'Lahatsoratra',
    'dashboard.pending': 'Miandry',
    'dashboard.contacts': 'Hafatra',
    'dashboard.unread': 'Tsy mbola novakiana',
    'dashboard.evolution': 'Fivoarana isam-bolana',
    'dashboard.distribution': 'Fizarana',
    'dashboard.jobs_evolution': 'Asa',
    'dashboard.applications_evolution': 'Fangatahana',
    'dashboard.users_evolution': 'Mpampiasa',
    'dashboard.projects_evolution': 'Tetikasa',
    'dashboard.this_month': 'ity volana ity',
    'dashboard.completed': 'Vita',

    // ==================== STATS CARDS ====================
    'stats_cards.jobs': 'Asa',
    'stats_cards.published': 'Navoaka',
    'stats_cards.applications': 'Fangatahana',
    'stats_cards.pending': 'Miandry',
    'stats_cards.projects': 'Tetikasa',
    'stats_cards.active': 'Mavitrika',
    'stats_cards.blog': 'Lahatsoratra',
    'stats_cards.contacts': 'Hafatra',
    'stats_cards.unread': 'Tsy novakiana',
    'stats_cards.users': 'Mpampiasa',
    'stats_cards.total': 'Rehetra',
    'stats_cards.new': 'Vaovao',
    'stats_cards.this_month': 'ity volana ity',
    'stats_cards.received': 'Noraisina',
    'stats_cards.published_label': 'Navoaka',
    'stats_cards.view_details': 'Jereo antsipirihany',
    'stats_cards.completion_rate': 'Tahan\'ny fahavitana',
    'stats_cards.applications_received': 'Fangatahana noraisina',
    'stats_cards.new_users': 'Mpampiasa vaovao',
    'stats_cards.projects_completed': 'Tetikasa vita',

    // ==================== AUTH ====================
    'auth.login_title': 'Hiditra',
    'auth.email': 'Email',
    'auth.password': 'Tenimiafina',
    'auth.remember_me': 'Tsarovy aho',
    'auth.forgot_password': 'Hadino ny tenimiafina ?',
    'auth.login_now': 'Hiditra izao',
    'auth.logout': 'Hivoaka',
    'auth.register': 'Hisoratra anarana',
    'auth.confirm_password': 'Hamarino ny tenimiafina',
    'auth.terms_accept': 'Ekena ny fepetra fampiasana',
    'auth.already_account': 'Efa manana kaonty ?',
    'auth.no_account': 'Mbola tsy manana kaonty ?',
  },
};

// ============================================================
// CONTEXT
// ============================================================

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');
  const [isLoaded, setIsLoaded] = useState(false);

  // ============================================================
  // CHARGEMENT DE LA LANGUE DEPUIS LOCALSTORAGE
  // ============================================================

  useEffect(() => {
    const saved = localStorage.getItem('y-mad-language');
    if (saved === 'fr' || saved === 'mg') {
      setLanguageState(saved);
    }
    setIsLoaded(true);
  }, []);

  // ============================================================
  // SAUVEGARDE DE LA LANGUE
  // ============================================================

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('y-mad-language', language);
      document.documentElement.lang = language;
      
      // ✅ Déclencher un événement pour mettre à jour les composants
      window.dispatchEvent(new Event('languageChange'));
    }
  }, [language, isLoaded]);

  // ============================================================
  // FONCTIONS
  // ============================================================

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState(prev => prev === 'fr' ? 'mg' : 'fr');
  }, []);

  const t = useCallback((key: string): string => {
    const translation = translations[language][key];
    if (!translation) {
      console.warn(`Traduction manquante: ${key} (${language})`);
      return key;
    }
    return translation;
  }, [language]);

  // ============================================================
  // VALEUR DU CONTEXT
  // ============================================================

  const value = useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage,
    t,
  }), [language, setLanguage, toggleLanguage, t]);

  if (!isLoaded) {
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// ============================================================
// HOOK PERSONNALISÉ
// ============================================================

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage doit être utilisé à l\'intérieur d\'un LanguageProvider');
  }
  return context;
}