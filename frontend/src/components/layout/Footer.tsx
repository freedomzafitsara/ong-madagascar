'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Mail, Phone, MapPin, Heart, Send, ArrowUp, 
  Users, Globe, Award, ChevronRight, Clock, 
  Shield, Briefcase, Building,
  Facebook, Instagram, Linkedin, Twitter, Youtube
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const currentYear = new Date().getFullYear();
  const { language, setLanguage } = useLanguage();

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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
      const response = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setSubscribeMessage({ 
          type: 'success', 
          text: language === 'fr' ? 'Merci pour votre abonnement !' : 'Misaotra tamin\'ny fisoratana anaranao !' 
        });
        setEmail('');
        setTimeout(() => setSubscribeMessage(null), 5000);
      } else {
        setSubscribeMessage({ 
          type: 'error', 
          text: language === 'fr' ? 'Erreur lors de l\'abonnement' : 'Nisy hadisoana tamin\'ny fisoratana anarana' 
        });
      }
    } catch (error) {
      console.error('Erreur newsletter:', error);
      setSubscribeMessage({ 
        type: 'error', 
        text: language === 'fr' ? 'Erreur de connexion' : 'Tsy nahomby ny fifandraisana' 
      });
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

  // Réseaux sociaux Y-MaD
  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/ymad.mg', label: 'Facebook', color: '#1877F2' },
    { icon: Instagram, href: 'https://instagram.com/ymad.mg', label: 'Instagram', color: '#E4405F' },
    { icon: Linkedin, href: 'https://linkedin.com/company/ymad-mg', label: 'LinkedIn', color: '#0A66C2' },
    { icon: Twitter, href: 'https://twitter.com/ymad_mg', label: 'Twitter', color: '#1DA1F2' },
    { icon: Youtube, href: 'https://youtube.com/@ymad', label: 'YouTube', color: '#FF0000' },
  ];

  // Liens de navigation (corrigés pour le thème)
  const navLinks = [
    { href: '/', labelFr: 'Accueil', labelMg: 'Fandraisana' },
    { href: '/projects', labelFr: 'Projets', labelMg: 'Tetikasa' },
    { href: '/jobs', labelFr: 'Offres d\'emploi', labelMg: 'Toerana asa' },
    { href: '/blog', labelFr: 'Blog', labelMg: 'Vaovao' },
    { href: '/contact', labelFr: 'Contact', labelMg: 'Fifandraisana' },
  ];

  const legalLinks = [
    { href: '/legal', labelFr: 'Mentions légales', labelMg: 'Fampahalalana ara-dalàna' },
    { href: '/privacy', labelFr: 'Confidentialité', labelMg: 'Tsiambaratelo' },
    { href: '/terms', labelFr: 'Conditions générales', labelMg: 'Fepetra fampiasana' },
  ];

  const getText = (frText: string, mgText: string) => {
    return language === 'fr' ? frText : mgText;
  };

  return (
    <>
      <footer className="bg-ymad-blue-900 text-ymad-gray-400 pt-12 pb-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* ==================== TOP SECTION ==================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10 border-b border-ymad-blue-800">
            
            {/* Newsletter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-ymad-blue-400" />
                <h3 className="text-lg font-semibold text-white">
                  {getText('Newsletter', 'Gazety')}
                </h3>
              </div>
              <p className="text-ymad-gray-400 text-sm mb-4">
                {getText(
                  'Recevez nos actualités et offres d\'emploi directement dans votre boîte mail',
                  'Mahazoa ny vaovao sy asa ataonay isaky ny email'
                )}
              </p>
              
              <form onSubmit={subscribeToNewsletter} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder={getText('Votre adresse email', 'Adiresy email anao')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-ymad-blue-800 text-white placeholder-ymad-gray-500 focus:outline-none focus:ring-2 focus:ring-ymad-blue-500 border border-ymad-blue-700 transition"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-5 py-2.5 bg-ymad-blue-600 hover:bg-ymad-blue-700 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {subscribing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{getText("S'abonner", 'Manaraka')}</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
              
              {subscribeMessage && (
                <p className={`text-xs mt-2 ${subscribeMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {subscribeMessage.text}
                </p>
              )}
            </div>

            {/* Social & Stats */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-ymad-blue-400" />
                <h3 className="text-lg font-semibold text-white">
                  {getText('Nous suivre', 'Araho izahay')}
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
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                      style={{ backgroundColor: social.color }}
                      aria-label={social.label}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
              
              {/* Statistiques d'impact Y-MaD */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-ymad-blue-800">
                <div className="text-center">
                  <p className="text-2xl font-bold text-ymad-blue-400">50+</p>
                  <p className="text-ymad-gray-500 text-xs">
                    {getText('Projets réalisés', 'Tetikasa vita')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-ymad-blue-400">30+</p>
                  <p className="text-ymad-gray-500 text-xs">
                    {getText('Partenaires', 'Mpiara-miasa')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-ymad-blue-400">22</p>
                  <p className="text-ymad-gray-500 text-xs">
                    {getText('Régions', 'Faritra')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== MAIN LINKS SECTION ==================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-10">
            
            {/* Colonne 1 - Brand & Mission */}
            <div>
              <Link href="/" className="inline-block mb-3">
                <h2 className="text-xl font-bold text-white hover:text-ymad-blue-400 transition">
                  Y-MaD
                </h2>
              </Link>
              <p className="text-ymad-gray-500 text-sm mb-3 leading-relaxed">
                {getText(
                  'Plateforme de gestion des offres d\'emploi pour les jeunes à Madagascar.',
                  'Sehatra fitantanana asa ho an\'ny tanora eto Madagasikara.'
                )}
              </p>
              <div className="flex items-center gap-2 text-ymad-gray-500 text-xs">
                <Award className="w-3 h-3 text-ymad-blue-500" />
                <span>{getText('Association d\'utilité publique', 'Fikambanana mahasoa ny vahoaka')}</span>
              </div>
            </div>

            {/* Colonne 2 - Navigation */}
            <div>
              <h4 className="font-semibold text-white mb-4 relative inline-block">
                {getText('Navigation', 'Fandehanana')}
                <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-ymad-blue-500 rounded-full"></span>
              </h4>
              <ul className="space-y-2">
                {navLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link 
                      href={link.href} 
                      className="text-ymad-gray-400 hover:text-white transition text-sm flex items-center gap-2 group"
                    >
                      <ChevronRight className="w-3 h-3 text-ymad-gray-600 group-hover:text-ymad-blue-500 transition" />
                      {language === 'fr' ? link.labelFr : link.labelMg}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonne 3 - Contact (Informations réelles Y-MaD) */}
            <div>
              <h4 className="font-semibold text-white mb-4 relative inline-block">
                {getText('Contact', 'Fifandraisana')}
                <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-ymad-blue-500 rounded-full"></span>
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-ymad-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-ymad-gray-400 text-sm">
                    Carion, Antananarivo, Madagascar
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-ymad-blue-400 flex-shrink-0" />
                  <a href="tel:+261320485697" className="text-ymad-gray-400 hover:text-white transition text-sm">
                    +261 32 04 856 97
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-ymad-blue-400 flex-shrink-0" />
                  <a href="mailto:ymad.mg@gmail.com" className="text-ymad-gray-400 hover:text-white transition text-sm">
                    ymad.mg@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-ymad-blue-400 flex-shrink-0" />
                  <span className="text-ymad-gray-400 text-sm">
                    {getText('Lun-Ven: 8h-17h', 'Ala-Zoma: 8h-17h')}
                  </span>
                </li>
              </ul>
            </div>

            {/* Colonne 4 - Liens légaux */}
            <div>
              <h4 className="font-semibold text-white mb-4 relative inline-block">
                {getText('Informations', 'Fampahalalana')}
                <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-ymad-blue-500 rounded-full"></span>
              </h4>
              <ul className="space-y-2">
                {legalLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link 
                      href={link.href} 
                      className="text-ymad-gray-400 hover:text-white transition text-sm flex items-center gap-2 group"
                    >
                      <ChevronRight className="w-3 h-3 text-ymad-gray-600 group-hover:text-ymad-blue-500 transition" />
                      {language === 'fr' ? link.labelFr : link.labelMg}
                    </Link>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 pt-3 border-t border-ymad-blue-800">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-ymad-blue-400" />
                  <span className="text-ymad-gray-500 text-xs">
                    {getText('Association loi 1901', 'Fikambanana ara-dalàna')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== BOTTOM BAR ==================== */}
          <div className="pt-6 border-t border-ymad-blue-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              
              {/* Copyright */}
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-ymad-blue-500 fill-ymad-blue-500" />
                <p className="text-ymad-gray-500 text-xs">
                  © {currentYear} Y-MaD - {getText('Tous droits réservés', 'Zo rehetra voatokana')}
                </p>
              </div>

              {/* Liens rapides */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/legal" className="text-ymad-gray-500 hover:text-ymad-gray-300 transition text-xs">
                  {getText('Mentions légales', 'Fampahalalana ara-dalàna')}
                </Link>
                <Link href="/privacy" className="text-ymad-gray-500 hover:text-ymad-gray-300 transition text-xs">
                  {getText('Confidentialité', 'Tsiambaratelo')}
                </Link>
                <Link href="/cookies" className="text-ymad-gray-500 hover:text-ymad-gray-300 transition text-xs">
                  Cookies
                </Link>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-ymad-gray-500" />
                <select 
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-transparent text-ymad-gray-500 text-xs border-none focus:outline-none cursor-pointer hover:text-ymad-gray-300"
                >
                  <option value="fr">Français</option>
                  <option value="mg">Malagasy</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ==================== SCROLL TO TOP BUTTON ==================== */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-ymad-blue-600 rounded-full flex items-center justify-center text-white hover:bg-ymad-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 group"
          aria-label={getText('Retour en haut', 'Miverina any ambony')}
        >
          <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition" />
        </button>
      )}
    </>
  );
}