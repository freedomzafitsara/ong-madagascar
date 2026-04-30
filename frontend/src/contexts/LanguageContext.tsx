'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'fr' | 'mg';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Toutes les traductions du site
const translations: Record<Language, Record<string, string>> = {
  fr: {
    // ==================== NAVIGATION ====================
    'nav.home': 'Accueil',
    'nav.projects': 'Projets',
    'nav.jobs': 'Offres',
    'nav.events': 'Événements',
    'nav.blog': 'Actualités',
    'nav.contact': 'Contact',
    'nav.donate': 'Faire un don',
    'nav.login': 'Connexion',
    'nav.logout': 'Déconnexion',
    'nav.dashboard': 'Tableau de bord',
    'nav.profile': 'Mon profil',
    'nav.join': 'Adhérer',
    'nav.about': 'À propos',
    'nav.partners': 'Partenaires',

    // ==================== HERO SECTION ====================
    'hero.badge': 'Association reconnue • Depuis 2015',
    'hero.title': 'Y-Mad ONG',
    'hero.subtitle': 'Jeunesse Malgache en Action pour le Développement',
    'hero.donate': 'Faire un don',
    'hero.projects': 'Nos projets',

    // ==================== STATS SECTION ====================
    'stats.projects': 'Projets réalisés',
    'stats.beneficiaries': 'Bénéficiaires',
    'stats.volunteers': 'Bénévoles actifs',
    'stats.trees': 'Arbres plantés',
    'stats.regions': 'Régions couvertes',
    'stats.partners': 'Partenaires',

    // ==================== MISSION SECTION ====================
    'mission.title': 'Notre Mission',
    'mission.description': 'Autonomiser la jeunesse malgache par l\'éducation, la formation professionnelle, créer des opportunités d\'emploi et d\'entrepreneuriat pour les jeunes.',
    'mission.education_title': 'Éducation',
    'mission.education_desc': 'Formation et accompagnement des jeunes pour un avenir meilleur',
    'mission.solidarity_title': 'Solidarité',
    'mission.solidarity_desc': 'Valeurs malgaches du Fihavanana au cœur de nos actions',
    'mission.environment_title': 'Environnement',
    'mission.environment_desc': 'Protection de l\'environnement et développement durable',

    // ==================== VALEURS SECTION ====================
    'values.title': 'Nos Valeurs',
    'values.subtitle': 'Des principes qui guident notre action quotidienne',
    'values.transparency_title': 'Transparence',
    'values.transparency_desc': 'Toutes les actions et finances sont visibles et documentées publiquement',
    'values.innovation_title': 'Innovation',
    'values.innovation_desc': 'Y-Mad encourage les solutions nouvelles et technologiques pour Madagascar',
    'values.impact_title': 'Impact mesurable',
    'values.impact_desc': 'Chaque projet est suivi avec des indicateurs clairs et vérifiables',

    // ==================== PROJECTS SECTION ====================
    'projects.title': 'Nos projets',
    'projects.subtitle': 'Découvrez nos actions sur le terrain pour le développement de la jeunesse malgache',
    'projects.view': 'Voir le projet',
    'projects.view_all': 'Voir tous nos projets',
    'projects.budget': 'Budget',
    'projects.impact': 'Impact',
    'projects.status': 'Statut',
    'projects.ongoing': 'En cours',
    'projects.completed': 'Terminé',
    'projects.category': 'Projet',

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
    'jobs.internship': 'Stage',
    'jobs.freelance': 'Freelance',
    'jobs.sector': 'Secteur',
    'jobs.upload_cv': 'Télécharger votre CV',
    'jobs.upload_photo': 'Photo de profil',
    'jobs.upload_diploma': 'Diplôme',
    'jobs.application_submitted': 'Candidature envoyée',
    'jobs.application_status': 'Statut de votre candidature',
    'jobs.submitted': 'Soumise',
    'jobs.reviewing': 'En révision',
    'jobs.interview': 'Entretien',
    'jobs.accepted': 'Acceptée',
    'jobs.rejected': 'Refusée',

    // ==================== EVENTS SECTION ====================
    'events.title': 'Événements',
    'events.subtitle': 'Participez à nos événements',
    'events.register': 'S\'inscrire',
    'events.free': 'Gratuit',
    'events.details': 'Détails',
    'events.spots_left': 'places restantes',
    'events.full': 'Complet',
    'events.waiting_list': 'Liste d\'attente',
    'events.upcoming': 'À venir',
    'events.past': 'Passés',
    'events.camp': 'Camp',
    'events.workshop': 'Atelier',
    'events.hackathon': 'Hackathon',
    'events.conference': 'Conférence',
    'events.training': 'Formation',
    'events.location': 'Lieu',
    'events.date': 'Date',
    'events.time': 'Heure',
    'events.capacity': 'Capacité',
    'events.organizer': 'Organisateur',
    'events.no_events': 'Aucun événement trouvé',

    // ==================== BLOG SECTION ====================
    'blog.title': 'Actualités',
    'blog.subtitle': 'Toute l\'actualité de Y-Mad',
    'blog.read': 'Lire la suite',
    'blog.author': 'Auteur',
    'blog.date': 'Date',
    'blog.category': 'Catégorie',
    'blog.tags': 'Tags',
    'blog.share': 'Partager',
    'blog.comments': 'Commentaires',
    'blog.no_articles': 'Aucun article trouvé',

    // ==================== CONTACT SECTION ====================
    'contact.title': 'Contactez-nous',
    'contact.subtitle': 'Nous sommes à votre écoute',
    'contact.name': 'Nom complet',
    'contact.email': 'Email',
    'contact.phone': 'Téléphone',
    'contact.message': 'Message',
    'contact.send': 'Envoyer',
    'contact.address': 'Adresse',
    'contact.phone_label': 'Téléphone',
    'contact.email_label': 'Email',
    'contact.hours': 'Horaires d\'ouverture',
    'contact.monday_friday': 'Lundi - Vendredi: 8h - 17h',
    'contact.saturday': 'Samedi: 9h - 13h',
    'contact.sunday': 'Dimanche: Fermé',
    'contact.success': 'Message envoyé avec succès !',
    'contact.error': 'Erreur lors de l\'envoi du message',

    // ==================== MEMBERSHIP SECTION ====================
    'membership.title': 'Adhérer à Y-Mad',
    'membership.subtitle': 'Rejoignez notre communauté',
    'membership.standard': 'Standard',
    'membership.premium': 'Premium',
    'membership.student': 'Étudiant',
    'membership.standard_price': '25 000 MGA/an',
    'membership.premium_price': '100 000 MGA/an',
    'membership.student_price': '10 000 MGA/an',
    'membership.pay': 'Payer',
    'membership.payment_method': 'Moyen de paiement',
    'membership.phone_number': 'Numéro de téléphone',
    'membership.member_card': 'Carte membre',
    'membership.qr_code': 'QR Code',
    'membership.already_member': 'Déjà membre ?',
    'membership.renew': 'Renouveler mon adhésion',
    'membership.benefits': 'Avantages',
    'membership.choose_plan': 'Choisissez votre formule',
    'membership.expires_on': 'Expire le',
    'membership.status_active': 'Actif',
    'membership.status_expired': 'Expiré',
    'membership.status_pending': 'En attente',

    // ==================== DONATIONS SECTION ====================
    'donation.title': 'Chaque don compte',
    'donation.description': 'Votre soutien nous permet d\'agir concrètement et de transformer des vies à Madagascar.',
    'donation.donate_button': 'Je fais un don',
    'donation.volunteer_button': 'Devenir bénévole',
    'donation.amount': 'Montant du don',
    'donation.one_time': 'Don unique',
    'donation.monthly': 'Don mensuel',
    'donation.yearly': 'Don annuel',
    'donation.choose_project': 'Choisir un projet',
    'donation.receipt': 'Reçu fiscal',
    'donation.thank_you': 'Merci pour votre générosité !',

    // ==================== VOLUNTEERS SECTION ====================
    'volunteers.title': 'Devenir bénévole',
    'volunteers.subtitle': 'Rejoignez notre équipe et contribuez au développement de Madagascar',
    'volunteers.skills': 'Compétences',
    'volunteers.availability': 'Disponibilités',
    'volunteers.weekdays': 'Semaine',
    'volunteers.weekend': 'Week-end',
    'volunteers.occasional': 'Ponctuel',
    'volunteers.motivation': 'Votre motivation',
    'volunteers.experience': 'Expérience',
    'volunteers.certificate': 'Attestation de bénévolat',
    'volunteers.register': 'S\'inscrire comme bénévole',
    'volunteers.thank_you': 'Merci pour votre inscription !',

    // ==================== PARTNERS SECTION ====================
    'partners.title': 'Nos partenaires',
    'partners.subtitle': 'Ils nous soutiennent et contribuent à notre mission',
    'partners.become': 'Devenir partenaire',
    'partners.contact': 'Contactez-nous',
    'partners.types': 'Types de partenariat',

    // ==================== SOCIAL SECTION ====================
    'social.follow_us': 'Suivez-nous',
    'social.stay_connected': 'Restez connectés avec Y-Mad sur les réseaux sociaux',
    'social.facebook': 'Facebook',
    'social.instagram': 'Instagram',
    'social.whatsapp': 'WhatsApp',
    'social.tiktok': 'TikTok',
    'social.youtube': 'YouTube',

    // ==================== NEWSLETTER SECTION ====================
    'newsletter.title': 'Restez informés',
    'newsletter.subtitle': 'Recevez nos actualités et événements par email',
    'newsletter.placeholder': 'Votre adresse email',
    'newsletter.button': 'S\'abonner',
    'newsletter.success': 'Merci de votre inscription !',
    'newsletter.error': 'Email invalide. Veuillez réessayer.',

    // ==================== FOOTER SECTION ====================
    'footer.about': 'À propos de Y-Mad',
    'footer.contact': 'Contactez-nous',
    'footer.follow': 'Suivez-nous',
    'footer.legal': 'Mentions légales',
    'footer.privacy': 'Politique de confidentialité',
    'footer.terms': 'Conditions d\'utilisation',
    'footer.rights': 'Tous droits réservés',
    'footer.address': 'Antananarivo, Madagascar',
    'footer.email': 'contact@y-mad.mg',
    'footer.phone': '+261 34 00 000 00',

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
    'common.filter': 'Filtrer',
    'common.back': 'Retour',
    'common.continue': 'Continuer',
    'common.confirm': 'Confirmer',
    'common.submit': 'Envoyer',
    'common.close': 'Fermer',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.all': 'Tous',
    'common.none': 'Aucun',
    'common.optional': 'Optionnel',
    'common.required': 'Obligatoire',
    'common.no_data': 'Aucune donnée disponible',

    // ==================== DASHBOARD ====================
    'dashboard.title': 'Tableau de bord',
    'dashboard.welcome': 'Bienvenue sur votre espace d\'administration',
    'dashboard.active_members': 'Membres actifs',
    'dashboard.monthly_donations': 'Dons du mois',
    'dashboard.upcoming_events': 'Événements à venir',
    'dashboard.open_jobs': 'Offres d\'emploi',
    'dashboard.pending_applications': 'Candidatures en attente',
    'dashboard.recent_activities': 'Activités récentes',
    'dashboard.quick_actions': 'Actions rapides',
    'dashboard.new_event': 'Nouvel événement',
    'dashboard.new_job': 'Publier une offre',
    'dashboard.generate_report': 'Générer un rapport',
    'dashboard.send_newsletter': 'Envoyer la newsletter',

    // ==================== AUTH ====================
    'auth.login_title': 'Connexion',
    'auth.register_title': 'Inscription',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.confirm_password': 'Confirmer le mot de passe',
    'auth.first_name': 'Prénom',
    'auth.last_name': 'Nom',
    'auth.phone': 'Téléphone',
    'auth.remember_me': 'Se souvenir de moi',
    'auth.forgot_password': 'Mot de passe oublié ?',
    'auth.no_account': 'Pas encore de compte ?',
    'auth.has_account': 'Déjà un compte ?',
    'auth.register_now': 'S\'inscrire maintenant',
    'auth.login_now': 'Se connecter',
    'auth.reset_password': 'Réinitialiser le mot de passe',
    'auth.reset_link': 'Envoyer le lien de réinitialisation',
    'auth.check_email': 'Vérifiez votre email pour réinitialiser votre mot de passe',
  },
  mg: {
    // ==================== NAVIGATION ====================
    'nav.home': 'Fandraisana',
    'nav.projects': 'Tetikasa',
    'nav.jobs': 'Asa',
    'nav.events': 'Hetsika',
    'nav.blog': 'Vaovao',
    'nav.contact': 'Fifandraisana',
    'nav.donate': 'Hanome',
    'nav.login': 'Hiditra',
    'nav.logout': 'Hivoaka',
    'nav.dashboard': 'Takelaka',
    'nav.profile': 'Momba ahy',
    'nav.join': 'Hanara-maso',
    'nav.about': 'Momba anay',
    'nav.partners': 'Mpiara-miasa',

    // ==================== HERO SECTION ====================
    'hero.badge': 'Fikambanana ekena • Nanomboka 2015',
    'hero.title': 'Y-Mad ONG',
    'hero.subtitle': 'Tanora Malagasy miasa ho an\'ny Fivoarana',
    'hero.donate': 'Hanome',
    'hero.projects': 'Tetikasa',

    // ==================== STATS SECTION ====================
    'stats.projects': 'Tetikasa vita',
    'stats.beneficiaries': 'Tompondaka',
    'stats.volunteers': 'Mpanao asa soa mavitrika',
    'stats.trees': 'Hazo nambolena',
    'stats.regions': 'Faritra voarakotra',
    'stats.partners': 'Mpiara-miasa',

    // ==================== MISSION SECTION ====================
    'mission.title': 'Ny asa ataonay',
    'mission.description': 'Manome hery ny tanora malagasy amin\'ny alalan\'ny fampianarana, fampiofanana matihanina, famoronana asa sy fandraharahana ho an\'ny tanora.',
    'mission.education_title': 'Fampianarana',
    'mission.education_desc': 'Fampiofanana sy fanarahamaso ny tanora ho amin\'ny hoavy tsara kokoa',
    'mission.solidarity_title': 'Firaisankina',
    'mission.solidarity_desc': 'Ny soatoavina malagasy Fihavanana ao afovoan\'ny asantsika',
    'mission.environment_title': 'Tontolo iainana',
    'mission.environment_desc': 'Fiarovana ny tontolo iainana sy fampandrosoana maharitra',

    // ==================== VALEURS SECTION ====================
    'values.title': 'Ny soatoavina',
    'values.subtitle': 'Ireo fitsipika mitarika ny asantsika isan\'andro',
    'values.transparency_title': 'Fahamarinan-tsarobidy',
    'values.transparency_desc': 'Ny hetsika sy ny vola rehetra dia hita maso ary voarakitra ho an\'ny rehetra',
    'values.innovation_title': 'Fanavaozana',
    'values.innovation_desc': 'Y-Mad mamporisika ny vahaolana vaovao sy teknolojia ho an\'i Madagasikara',
    'values.impact_title': 'Vokatra azo refesina',
    'values.impact_desc': 'Ny tetikasa tsirairay dia arahina amin\'ny mari-pamantarana mazava sy azo hamarinina',

    // ==================== PROJECTS SECTION ====================
    'projects.title': 'Tetikasa',
    'projects.subtitle': 'Hijery ny asa ataontsika eto an-tany ho an\'ny fivoaran\'ny tanora malagasy',
    'projects.view': 'Jereo ny tetikasa',
    'projects.view_all': 'Jereo ny tetikasa rehetra',
    'projects.budget': 'Tetibola',
    'projects.impact': 'Fiantraikany',
    'projects.status': 'Toe-javatra',
    'projects.ongoing': 'Mitohy',
    'projects.completed': 'Vita',
    'projects.category': 'Tetikasa',

    // ==================== JOBS SECTION ====================
    'jobs.title': 'Asa',
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
    'jobs.internship': 'Fiofanana',
    'jobs.freelance': 'Freelance',
    'jobs.sector': 'Sektiora',
    'jobs.upload_cv': 'Alefaso ny CV',
    'jobs.upload_photo': 'Sarim-panjakana',
    'jobs.upload_diploma': 'Diploma',
    'jobs.application_submitted': 'Efa nalefa ny fangatahana',
    'jobs.application_status': 'Toetran\'ny fangatahanao',
    'jobs.submitted': 'Nalefa',
    'jobs.reviewing': 'Azo dinihina',
    'jobs.interview': 'Dinidinika',
    'jobs.accepted': 'Ekena',
    'jobs.rejected': 'Lavina',

    // ==================== EVENTS SECTION ====================
    'events.title': 'Hetsika',
    'events.subtitle': 'Mandraisa anjara',
    'events.register': 'Misoratra anarana',
    'events.free': 'Maimaim-poana',
    'events.details': 'Antsipirihany',
    'events.spots_left': 'toerana sisa',
    'events.full': 'Feno',
    'events.waiting_list': 'Fandrasana',
    'events.upcoming': 'Ho avy',
    'events.past': 'Efa lasa',
    'events.camp': 'Toby',
    'events.workshop': 'Atelier',
    'events.hackathon': 'Hackathon',
    'events.conference': 'Konferansy',
    'events.training': 'Fampiofanana',
    'events.location': 'Toerana',
    'events.date': 'Daty',
    'events.time': 'Ora',
    'events.capacity': 'Fahaizana mandray',
    'events.organizer': 'Mpandamina',
    'events.no_events': 'Tsy misy hetsika hita',

    // ==================== BLOG SECTION ====================
    'blog.title': 'Vaovao',
    'blog.subtitle': 'Vaovao momba ny Y-Mad',
    'blog.read': 'Hamaky bebe kokoa',
    'blog.author': 'Mpanoratra',
    'blog.date': 'Daty',
    'blog.category': 'Sokajy',
    'blog.tags': 'Tenifototra',
    'blog.share': 'Zarao',
    'blog.comments': 'Fanehoan-kevitra',
    'blog.no_articles': 'Tsy misy lahatsoratra hita',

    // ==================== CONTACT SECTION ====================
    'contact.title': 'Mifandraisa aminay',
    'contact.subtitle': 'Vonona hanampy anao izahay',
    'contact.name': 'Anarana feno',
    'contact.email': 'Email',
    'contact.phone': 'Telefaonina',
    'contact.message': 'Hafatra',
    'contact.send': 'Alefaso',
    'contact.address': 'Adiresy',
    'contact.phone_label': 'Telefaonina',
    'contact.email_label': 'Email',
    'contact.hours': 'Ora fisokafana',
    'contact.monday_friday': 'Alatsinainy - Zoma: 8h - 17h',
    'contact.saturday': 'Asabotsy: 9h - 13h',
    'contact.sunday': 'Alahady: Mikatona',
    'contact.success': 'Vita ny fandefasana ny hafatra !',
    'contact.error': 'Nisy hadisoana tamin\'ny fandefasana ny hafatra',

    // ==================== MEMBERSHIP SECTION ====================
    'membership.title': 'Hanara-maso',
    'membership.subtitle': 'Miaraha aminay',
    'membership.standard': 'Mahazatra',
    'membership.premium': 'Lafin-javatra',
    'membership.student': 'Mpianatra',
    'membership.standard_price': '25 000 Ar/taona',
    'membership.premium_price': '100 000 Ar/taona',
    'membership.student_price': '10 000 Ar/taona',
    'membership.pay': 'Aloa',
    'membership.payment_method': 'Fomba fandoavam-bola',
    'membership.phone_number': 'Laharan-telefaonina',
    'membership.member_card': 'Kara-pikambana',
    'membership.qr_code': 'Kaody QR',
    'membership.already_member': 'Efa mpikambana?',
    'membership.renew': 'Havaozina ny maha-mpikambana',
    'membership.benefits': 'Soa azo',
    'membership.choose_plan': 'Misafidia safidy',
    'membership.expires_on': 'Lany daty amin\'ny',
    'membership.status_active': 'Mavitrika',
    'membership.status_expired': 'Lany daty',
    'membership.status_pending': 'Miandry',

    // ==================== DONATIONS SECTION ====================
    'donation.title': 'Ny fanomezana rehetra dia manan-danja',
    'donation.description': 'Ny fanohananao dia manampy anay hanao hetsika sy hanova ny fiainan\'ny olona eto Madagasikara.',
    'donation.donate_button': 'Manome aho',
    'donation.volunteer_button': 'Mpanao asa soa',
    'donation.amount': 'Volana omena',
    'donation.one_time': 'Indray mandeha',
    'donation.monthly': 'Isam-bolana',
    'donation.yearly': 'Isan-taona',
    'donation.choose_project': 'Misafidia tetikasa',
    'donation.receipt': 'Tarata-mandoa',
    'donation.thank_you': 'Misaotra betsaka !',

    // ==================== VOLUNTEERS SECTION ====================
    'volunteers.title': 'Mpanao asa soa',
    'volunteers.subtitle': 'Miara-miasa aminay hanampy ny tanora',
    'volunteers.skills': 'Fahaizana',
    'volunteers.availability': 'Fotoana misy',
    'volunteers.weekdays': 'Andro fiasana',
    'volunteers.weekend': 'Farany herinandro',
    'volunteers.occasional': 'Indraindray',
    'volunteers.motivation': 'Antony manosika',
    'volunteers.experience': 'Traza',
    'volunteers.certificate': 'Fanamarinana maha-mpanao asa soa',
    'volunteers.register': 'Hisoratra anarana ho mpanao asa soa',
    'volunteers.thank_you': 'Misaotra nisoratra anarana !',

    // ==================== PARTNERS SECTION ====================
    'partners.title': 'Mpiara-miasa aminay',
    'partners.subtitle': 'Manohana sy miara-miasa aminay izy ireo',
    'partners.become': 'Hanara-maso',
    'partners.contact': 'Mifandraisa aminay',
    'partners.types': 'Karazana fiaraha-miasa',

    // ==================== SOCIAL SECTION ====================
    'social.follow_us': 'Araho izahay',
    'social.stay_connected': 'Mijanòna mifandray aminay amin\'ny tambajotra sosialy',
    'social.facebook': 'Facebook',
    'social.instagram': 'Instagram',
    'social.whatsapp': 'WhatsApp',
    'social.tiktok': 'TikTok',
    'social.youtube': 'YouTube',

    // ==================== NEWSLETTER SECTION ====================
    'newsletter.title': 'Mijanòna ho voa-tantara',
    'newsletter.subtitle': 'Mahazoa ny vaovao sy hetsika ataonay isaky ny email',
    'newsletter.placeholder': 'Adiresy email anao',
    'newsletter.button': 'Misoratra anarana',
    'newsletter.success': 'Misaotra nisoratra anarana !',
    'newsletter.error': 'Tsy manan-kery ny email. Miezaka indray azafady.',

    // ==================== FOOTER SECTION ====================
    'footer.about': 'Momba ny Y-Mad',
    'footer.contact': 'Mifandraisa aminay',
    'footer.follow': 'Araho izahay',
    'footer.legal': 'Fampahalalana ara-dalàna',
    'footer.privacy': 'Politika momba ny tsiambaratelo',
    'footer.terms': 'Fepetra fampiasana',
    'footer.rights': 'Zo rehetra voatokana',
    'footer.address': 'Antananarivo, Madagasikara',
    'footer.email': 'contact@y-mad.mg',
    'footer.phone': '+261 34 00 000 00',

    // ==================== COMMON ====================
    'common.loading': 'Miaraka...',
    'common.error': 'Nisy hadisoana',
    'common.success': 'Vita soa aman-tsara',
    'common.save': 'Tehirizina',
    'common.cancel': 'Avela',
    'common.delete': 'Fafana',
    'common.edit': 'Ovaina',
    'common.view': 'Jereo',
    'common.search': 'Karohy',
    'common.filter': 'Sivana',
    'common.back': 'Miverina',
    'common.continue': 'Manaraka',
    'common.confirm': 'Hamafisina',
    'common.submit': 'Alefaso',
    'common.close': 'Hidy',
    'common.yes': 'Eny',
    'common.no': 'Tsia',
    'common.all': 'Rehetra',
    'common.none': 'Tsy misy',
    'common.optional': 'Azo atao',
    'common.required': 'Tsy maintsy',
    'common.no_data': 'Tsy misy angona',

    // ==================== DASHBOARD ====================
    'dashboard.title': 'Takelaka fandraisana',
    'dashboard.welcome': 'Tonga soa eo amin\'ny faritra fitantananao',
    'dashboard.active_members': 'Mpikambana mavitrika',
    'dashboard.monthly_donations': 'Fanomezana volana ity',
    'dashboard.upcoming_events': 'Hetsika ho avy',
    'dashboard.open_jobs': 'Asa',
    'dashboard.pending_applications': 'Fangatahana asa',
    'dashboard.recent_activities': 'Hetsika vao haingana',
    'dashboard.quick_actions': 'Hetsika haingana',
    'dashboard.new_event': 'Hetsika vaovao',
    'dashboard.new_job': 'Avoaka asa',
    'dashboard.generate_report': 'Mamorona tatitra',
    'dashboard.send_newsletter': 'Alefaso gazety',

    // ==================== AUTH ====================
    'auth.login_title': 'Hiditra',
    'auth.register_title': 'Hisoratra anarana',
    'auth.email': 'Email',
    'auth.password': 'Tenimiafina',
    'auth.confirm_password': 'Hamafiso ny tenimiafina',
    'auth.first_name': 'Anarana voalohany',
    'auth.last_name': 'Anarana farany',
    'auth.phone': 'Telefaonina',
    'auth.remember_me': 'Tsarovy aho',
    'auth.forgot_password': 'Hadino ny tenimiafina ?',
    'auth.no_account': 'Mbola tsy manana kaonty ?',
    'auth.has_account': 'Efa manana kaonty ?',
    'auth.register_now': 'Misoratra anarana izao',
    'auth.login_now': 'Hiditra izao',
    'auth.reset_password': 'Averina ny tenimiafina',
    'auth.reset_link': 'Alefaso ny rohy famerenana',
    'auth.check_email': 'Jereo ny mailakao mba hamerenana ny tenimiafinao',
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

  const t = (key: string): string => {
    const translation = translations[language][key];
    return translation || key;
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