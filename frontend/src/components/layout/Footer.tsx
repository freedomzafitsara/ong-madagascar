'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Mail, Phone, MapPin, Heart, Send, ArrowUp, 
  Users, Globe, Award, ChevronRight, Clock, 
  Shield, FileText, Calendar, Briefcase, HandHeart
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Icônes SVG pour les réseaux sociaux
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="5" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const currentYear = new Date().getFullYear();
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const subscribeToNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setSubscribing(true);
    setSubscribeMessage(null);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
      const response = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setSubscribeMessage({ type: 'success', text: '✅ Merci pour votre abonnement !' });
        setEmail('');
        setTimeout(() => setSubscribeMessage(null), 5000);
      } else {
        setSubscribeMessage({ type: 'error', text: '❌ Une erreur est survenue. Veuillez réessayer.' });
      }
    } catch (error) {
      console.error('Erreur newsletter:', error);
      setSubscribeMessage({ type: 'error', text: '❌ Erreur de connexion. Réessayez plus tard.' });
    } finally {
      setSubscribing(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLanguageChange = (lang: string) => {
    if (lang === 'fr' || lang === 'mg') {
      setLanguage(lang);
    }
  };

  // Réseaux sociaux
  const socialLinks = [
    { icon: FacebookIcon, href: 'https://facebook.com/ymadorg', label: 'Facebook', bg: '#1877F2' },
    { icon: InstagramIcon, href: 'https://instagram.com/ymad_mg', label: 'Instagram', bg: '#E4405F' },
    { icon: LinkedinIcon, href: 'https://linkedin.com/company/ymad', label: 'LinkedIn', bg: '#0A66C2' },
    { icon: TwitterIcon, href: 'https://twitter.com/ymad_mg', label: 'Twitter', bg: '#1DA1F2' },
    { icon: YoutubeIcon, href: 'https://youtube.com/@ymad', label: 'YouTube', bg: '#FF0000' },
  ];

  // Liens de navigation
  const navLinks = [
    { href: '/', label: language === 'fr' ? 'Accueil' : 'Fandraisana' },
    { href: '/projects', label: language === 'fr' ? 'Projets' : 'Tetikasa' },
    { href: '/jobs', label: language === 'fr' ? 'Offres' : 'Asa' },
    { href: '/events', label: language === 'fr' ? 'Événements' : 'Hetsika' },
    { href: '/blog', label: language === 'fr' ? 'Actualités' : 'Vaovao' },
    { href: '/contact', label: language === 'fr' ? 'Contact' : 'Fifandraisana' },
  ];

  const legalLinks = [
    { href: '/legal', label: language === 'fr' ? 'Mentions légales' : 'Fampahalalana ara-dalàna' },
    { href: '/privacy', label: language === 'fr' ? 'Politique de confidentialité' : 'Politika momba ny tsiambaratelo' },
    { href: '/terms', label: language === 'fr' ? 'Conditions générales' : 'Fepetra fampiasana' },
  ];

  return (
    <>
      <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* TOP SECTION - Newsletter & Social */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12 border-b border-gray-800">
            
            {/* Newsletter - Colonne gauche */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">
                  {language === 'fr' ? 'Newsletter' : 'Gazety'}
                </h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                {language === 'fr' 
                  ? 'Recevez nos actualités et opportunités directement dans votre boîte mail'
                  : 'Mahazoa ny vaovao sy hetsika ataonay isaky ny email'}
              </p>
              
              <form onSubmit={subscribeToNewsletter} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder={language === 'fr' ? 'Votre adresse email' : 'Adiresy email anao'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 transition"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {subscribing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{language === 'fr' ? 'S\'abonner' : 'Manaraka'}</span>
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </>
                  )}
                </button>
              </form>
              
              {subscribeMessage && (
                <p className={`text-xs mt-2 ${subscribeMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {subscribeMessage.text}
                </p>
              )}
              
              <p className="text-gray-600 text-xs mt-3">
                ✓ {language === 'fr' ? 'Pas de spam • Désinscription facile' : 'Tsy misy spam • Afaka miala mora foana'}
              </p>
            </div>

            {/* Social & Stats - Colonne droite */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">
                  {language === 'fr' ? 'Nous suivre' : 'Araho izahay'}
                </h3>
              </div>
              <div className="flex flex-wrap gap-3 mb-6">
                {socialLinks.map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={idx}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                      style={{ backgroundColor: social.bg }}
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
              
              {/* Statistiques d'impact */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">2,500+</p>
                  <p className="text-gray-500 text-xs">
                    {language === 'fr' ? 'Jeunes formés' : 'Tanora voaofana'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">50+</p>
                  <p className="text-gray-500 text-xs">
                    {language === 'fr' ? 'Projets réalisés' : 'Tetikasa vita'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">30+</p>
                  <p className="text-gray-500 text-xs">
                    {language === 'fr' ? 'Partenaires' : 'Mpiara-miasa'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN LINKS SECTION - 4 colonnes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-12">
            
            {/* Colonne 1 - Brand & Mission */}
            <div>
              <Link href="/" className="inline-block mb-4">
                <h2 className="text-2xl font-bold text-white hover:text-blue-400 transition">
                  Y-MAD
                </h2>
              </Link>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                <span className="text-gray-400 font-medium">Youthful Madagascar</span>
                <br />
                {language === 'fr' 
                  ? 'Association de jeunesse engagée pour le développement durable et l\'autonomisation des communautés malgaches.'
                  : 'Fikambanan\'ny tanora mirotsaka ho an\'ny fampandrosoana maharitra sy fanomezana hery ny vondrom-piarahamonina malagasy.'}
              </p>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Award className="w-3 h-3 text-blue-500" />
                <span>{language === 'fr' ? 'Reconnue d\'utilité publique' : 'Ekena ho tombon-dahin\'ny vahoaka'}</span>
              </div>
            </div>

            {/* Colonne 2 - Navigation */}
            <div>
              <h4 className="font-semibold text-white mb-4 relative inline-block">
                {language === 'fr' ? 'Navigation' : 'Fandehanana'}
                <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-blue-500 rounded-full"></span>
              </h4>
              <ul className="space-y-2">
                {navLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group"
                    >
                      <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-blue-500 transition" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonne 3 - Informations de contact */}
            <div>
              <h4 className="font-semibold text-white mb-4 relative inline-block">
                {language === 'fr' ? 'Contact' : 'Fifandraisana'}
                <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-blue-500 rounded-full"></span>
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400 text-sm">
                    Carion, Antananarivo, Madagascar
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <a href="tel:+261320485697" className="text-gray-400 hover:text-white transition text-sm">
                    +261 32 04 856 97
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <a href="mailto:ymad.mg@gmail.com" className="text-gray-400 hover:text-white transition text-sm">
                    ymad.mg@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-400 text-sm">
                    {language === 'fr' ? 'Lun-Ven: 8h-17h' : 'Ala-Zoma: 8h-17h'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Colonne 4 - Liens légaux */}
            <div>
              <h4 className="font-semibold text-white mb-4 relative inline-block">
                {language === 'fr' ? 'Informations légales' : 'Fampahalalana ara-dalàna'}
                <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-blue-500 rounded-full"></span>
              </h4>
              <ul className="space-y-2">
                {legalLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group"
                    >
                      <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-blue-500 transition" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              
              {/* Badge supplémentaire */}
              <div className="mt-6 pt-4 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-500 text-xs">
                    {language === 'fr' ? 'NIF: 123456789' : 'NIF: 123456789'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-500 text-xs">
                    {language === 'fr' ? 'Statut: Association à but non lucratif' : 'Toe-javatra: Fikambanana tsy mitady tombom-barotra'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM BAR - Copyright & Language */}
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              
              {/* Copyright avec cœur */}
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-blue-500" />
                <p className="text-gray-500 text-sm">
                  © {currentYear} Y-Mad - {language === 'fr' ? 'Youthful Madagascar. Tous droits réservés.' : 'Youthful Madagascar. Zo rehetra voatokana.'}
                </p>
              </div>

              {/* Liens légaux rapides */}
              <div className="flex flex-wrap gap-6 justify-center">
                <Link href="/legal" className="text-gray-500 hover:text-gray-300 transition text-xs">
                  {language === 'fr' ? 'Mentions légales' : 'Fampahalalana ara-dalàna'}
                </Link>
                <Link href="/privacy" className="text-gray-500 hover:text-gray-300 transition text-xs">
                  {language === 'fr' ? 'Confidentialité' : 'Tsiambaratelo'}
                </Link>
                <Link href="/cookies" className="text-gray-500 hover:text-gray-300 transition text-xs">
                  Cookies
                </Link>
              </div>

              {/* Sélecteur de langue */}
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-gray-500" />
                <select 
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-transparent text-gray-500 text-xs border-none focus:outline-none cursor-pointer hover:text-gray-300"
                >
                  <option value="fr">Français</option>
                  <option value="mg">Malagasy</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* DECORATIVE LINE */}
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600"></div>
      </footer>

      {/* SCROLL TO TOP BUTTON */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 group"
          aria-label={language === 'fr' ? 'Retour en haut' : 'Miverina any ambony'}
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition" />
        </button>
      )}
    </>
  );
}