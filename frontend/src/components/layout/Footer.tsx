'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFacebook, 
  faInstagram, 
  faLinkedin, 
  faTwitter,
  faYoutube,
  faTiktok
} from '@fortawesome/free-brands-svg-icons';
import { 
  faEnvelope, 
  faPhoneAlt, 
  faMapMarkerAlt, 
  faHeart, 
  faPaperPlane, 
  faArrowUp,
  faShieldAlt,
  faShieldHeart,
  faNewspaper,
  faHandHoldingHeart,
  faUsers,
  faGlobe,
  faClock,
  faCertificate,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';
import { footerService, FooterData } from '@/services/footerService';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    loadFooterData();
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadFooterData = async () => {
    setLoading(true);
    try {
      const data = await footerService.getFooterData();
      setFooterData(data);
    } catch (error) {
      console.error('Erreur chargement footer:', error);
      // Données de fallback professionnelles
      setFooterData({
        sections: [
          { 
            id: '1', 
            title: "L'organisation", 
            title_mg: "Fikambanana", 
            order: 1, 
            links: [
              { id: '1', title: 'Qui sommes-nous', title_mg: 'Iza isika', url: '/about', order: 1 },
              { id: '2', title: 'Notre équipe', title_mg: 'Ny ekipantsika', url: '/team', order: 2 },
              { id: '3', title: 'Nos valeurs', title_mg: 'Ny soatoavintsika', url: '/values', order: 3 },
              { id: '4', title: 'Rapports annuels', title_mg: 'Tatitra isan-taona', url: '/reports', order: 4 },
              { id: '5', title: 'Certifications', title_mg: 'Fanamarinana', url: '/certifications', order: 5 },
            ]
          },
          { 
            id: '2', 
            title: 'Nos actions', 
            title_mg: 'Ny asantsika', 
            order: 2, 
            links: [
              { id: '5', title: 'Projets en cours', title_mg: 'Tetim-piasana', url: '/projects', order: 1 },
              { id: '6', title: 'Faire un don', title_mg: 'Manome fanomezana', url: '/donate', order: 2 },
              { id: '7', title: 'Devenir bénévole', title_mg: 'Maha mpilatsaka', url: '/volunteers', order: 3 },
              { id: '8', title: 'Partenariats', title_mg: 'Fiaraha-miasa', url: '/partners', order: 4 },
              { id: '13', title: 'Offres d\'emploi', title_mg: 'Asa', url: '/jobs', order: 5 },
            ]
          },
          { 
            id: '3', 
            title: 'Ressources', 
            title_mg: 'Loharano', 
            order: 3, 
            links: [
              { id: '9', title: 'Actualités', title_mg: 'Vaovao', url: '/blog', order: 1 },
              { id: '10', title: 'Contact', title_mg: 'Fifandraisana', url: '/contact', order: 2 },
              { id: '11', title: 'FAQ', title_mg: 'Fanontaniana', url: '/faq', order: 3 },
              { id: '12', title: 'Transparence', title_mg: 'Fahamarinana', url: '/transparency', order: 4 },
              { id: '14', title: 'Témoignages', title_mg: 'Fijoroana vavolombelona', url: '/testimonials', order: 5 },
            ]
          },
        ],
        contactInfo: [
          { id: '1', type: 'address', value: 'Carion, Antananarivo, Madagascar', icon: faMapMarkerAlt, order: 1 },
          { id: '2', type: 'phone', value: '+261 32 04 856 97', icon: faPhoneAlt, order: 2 },
          { id: '3', type: 'email', value: 'contact@y-mad.mg', icon: faEnvelope, order: 3 },
          { id: '4', type: 'badge', value: "Reconnue d'utilité publique", icon: faShieldAlt, order: 4 },
        ],
        legalLinks: [
          { id: '1', title: 'Mentions légales', url: '/legal', order: 1 },
          { id: '2', title: 'Politique de confidentialité', url: '/privacy', order: 2 },
          { id: '3', title: 'Conditions générales', url: '/terms', order: 3 },
          { id: '4', title: 'Cookies', url: '/cookies', order: 4 },
        ],
        copyright: `© ${currentYear} Y-Mad - Youthful Madagascar. Tous droits réservés.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
      const response = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        alert('✅ Merci pour votre abonnement !');
        setEmail('');
      } else {
        alert('❌ Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur newsletter:', error);
      alert('❌ Erreur de connexion.');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { icon: faFacebook, href: 'https://facebook.com/ymad', label: 'Facebook', bg: '#1877F2' },
    { icon: faInstagram, href: 'https://instagram.com/ymad', label: 'Instagram', bg: '#E4405F' },
    { icon: faLinkedin, href: 'https://linkedin.com/company/ymad', label: 'LinkedIn', bg: '#0A66C2' },
    { icon: faTwitter, href: 'https://twitter.com/ymad', label: 'Twitter', bg: '#1DA1F2' },
    { icon: faYoutube, href: 'https://youtube.com/ymad', label: 'YouTube', bg: '#FF0000' },
  ];

  const handleLanguageChange = (lang: string) => {
    if (lang === 'fr' || lang === 'mg') {
      setLanguage(lang);
    }
  };

  if (loading) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-block w-10 h-10 border-3 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm mt-3">Chargement...</p>
        </div>
      </footer>
    );
  }

  return (
    <>
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          {/* TOP SECTION - Newsletter & Social */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12 border-b border-gray-800">
            {/* Newsletter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Newsletter</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Recevez nos actualités et opportunités directement dans votre boîte mail
              </p>
              <form onSubmit={subscribeToNewsletter} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 transition"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <span>S'abonner</span>
                  <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>
              </form>
              <p className="text-gray-600 text-xs mt-3">
                ✓ Pas de spam • Désinscription facile
              </p>
            </div>

            {/* Social & Stats */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Nous suivre</h3>
              </div>
              <div className="flex flex-wrap gap-3 mb-6">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    style={{ backgroundColor: social.bg }}
                    aria-label={social.label}
                  >
                    <FontAwesomeIcon icon={social.icon} className="w-5 h-5" />
                  </a>
                ))}
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
                <div>
                  <p className="text-2xl font-bold text-blue-400">500+</p>
                  <p className="text-gray-500 text-xs">Jeunes formés</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">50+</p>
                  <p className="text-gray-500 text-xs">Projets réalisés</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">20+</p>
                  <p className="text-gray-500 text-xs">Partenaires</p>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN LINKS SECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <Link href="/" className="inline-block mb-4">
                <h2 className="text-2xl font-bold text-white hover:text-blue-400 transition">
                  Y-MAD
                </h2>
              </Link>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                <span className="text-gray-400 font-medium">Youthful Madagascar</span>
                <br />
                Association de jeunesse engagée pour le développement durable et l'autonomisation des communautés malgaches.
              </p>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <FontAwesomeIcon icon={faCertificate} className="w-3 h-3 text-blue-500" />
                <span>Reconnue d'utilité publique</span>
              </div>
            </div>

            {/* Dynamic Sections */}
            {footerData?.sections
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <div key={section.id}>
                  <h4 className="font-semibold text-white mb-4 relative inline-block">
                    {section.title}
                    <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-blue-500 rounded-full"></span>
                  </h4>
                  <ul className="space-y-2">
                    {section.links
                      .sort((a, b) => a.order - b.order)
                      .map((link) => (
                        <li key={link.id}>
                          <Link 
                            href={link.url} 
                            className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group"
                          >
                            <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-blue-500 transition"></span>
                            {link.title}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
          </div>

          {/* CONTACT INFO BAR */}
          <div className="py-8 border-t border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3 text-gray-400 group">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Adresse</p>
                  <p className="text-sm">Carion, Antananarivo, Madagascar</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-400 group">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition">
                  <FontAwesomeIcon icon={faPhoneAlt} className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Téléphone</p>
                  <a href="tel:+261320485697" className="text-sm hover:text-white transition">+261 32 04 856 97</a>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-400 group">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition">
                  <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <a href="mailto:contact@y-mad.mg" className="text-sm hover:text-white transition">contact@y-mad.mg</a>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Copyright */}
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faHeart} className="w-4 h-4 text-blue-500" />
                <p className="text-gray-500 text-sm">{footerData?.copyright}</p>
              </div>

              {/* Legal Links - Correction: pas de title_mg sur legalLinks */}
              <div className="flex flex-wrap gap-6 justify-center">
                {footerData?.legalLinks
                  .sort((a, b) => a.order - b.order)
                  .map((link) => (
                    <Link
                      key={link.id}
                      href={link.url}
                      className="text-gray-500 hover:text-gray-300 transition text-xs"
                    >
                      {link.title}
                    </Link>
                  ))}
              </div>

              {/* Language Switch */}
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faGlobe} className="w-3 h-3 text-gray-500" />
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
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      </footer>

      {/* SCROLL TO TOP BUTTON */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 group"
          aria-label="Retour en haut"
        >
          <FontAwesomeIcon icon={faArrowUp} className="w-5 h-5 group-hover:-translate-y-0.5 transition" />
        </button>
      )}
    </>
  );
}