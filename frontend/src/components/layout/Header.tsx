'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faTimes,
  faChevronDown,
  faGlobe,
  faHome,
  faProjectDiagram,
  faBriefcase,
  faNewspaper,
  faEnvelope,
  faHandHoldingHeart,
  faDonate,
  faSignInAlt,
} from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home'), href: '/', icon: faHome },
    { name: t('nav.projects'), href: '/projects', icon: faProjectDiagram },
    { name: t('nav.jobs'), href: '/jobs', icon: faBriefcase },
    { name: t('nav.blog'), href: '/blog', icon: faNewspaper },
    { name: t('nav.contact'), href: '/contact', icon: faEnvelope },
  ];

  const handleLanguageChange = (lang: 'fr' | 'mg') => {
    setLanguage(lang);
    setIsLangOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-gray-800/95 backdrop-blur-sm shadow-md py-2'
            : 'bg-gray-800 py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-4 flex-shrink-0">
              <div className="w-14 h-14 md:w-16 md:h-16 relative bg-gray-700 rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/logo-ymad.png"
                  alt="Y-Mad Madagascar"
                  width={64}
                  height={64}
                  className="object-contain p-1.5"
                  priority
                />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-white font-bold text-lg md:text-xl tracking-tight">
                    Y-Mad
                  </span>
                  <span className="text-blue-400 font-bold text-lg md:text-xl tracking-tight">
                    Madagascar
                  </span>
                </div>
                <p className="text-gray-400 text-xs md:text-sm -mt-0.5">
                  {t('hero.subtitle')}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === link.href
                      ? 'text-blue-400 bg-gray-700'
                      : 'text-gray-300 hover:text-blue-400 hover:bg-gray-700/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={link.icon} className="w-4 h-4" />
                    {link.name}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4 lg:gap-5">
              <Link href="/join" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition">
                {t('nav.join')}
              </Link>
              <Link href="/donate" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition">
                {t('nav.donate')}
              </Link>

              {/* Language */}
              <div className="relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-blue-400 transition"
                >
                  <FontAwesomeIcon icon={faGlobe} className="w-4 h-4" />
                  <span>{language.toUpperCase()}</span>
                  <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3" />
                </button>
                {isLangOpen && (
                  <>
                    <div className="absolute top-full right-0 mt-2 w-20 bg-gray-700 rounded-lg shadow-lg py-1 z-50 border border-gray-600">
                      <button
                        onClick={() => handleLanguageChange('fr')}
                        className="block w-full px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-600"
                      >
                        FR
                      </button>
                      <button
                        onClick={() => handleLanguageChange('mg')}
                        className="block w-full px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-600"
                      >
                        MG
                      </button>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                  </>
                )}
              </div>

              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-blue-400 transition">
                    <FontAwesomeIcon icon={faSignInAlt} className="w-4 h-4" />
                    <span>{user?.firstName}</span>
                    <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg py-1 z-50 hidden group-hover:block">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600">
                      {t('nav.profile')}
                    </Link>
                    {user?.role === 'super_admin' || user?.role === 'admin' ? (
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600">
                        {t('nav.dashboard')}
                      </Link>
                    ) : null}
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition">
                  {t('nav.login')}
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-gray-300"
            >
              <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-700 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium ${
                    pathname === link.href
                      ? 'text-blue-400 bg-gray-700'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <FontAwesomeIcon icon={link.icon} className="w-5 h-5" />
                  {link.name}
                </Link>
              ))}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-700">
                <div className="flex gap-4">
                  <Link href="/join" onClick={() => setIsMenuOpen(false)} className="text-sm text-gray-300 hover:text-blue-400">
                    {t('nav.join')}
                  </Link>
                  <Link href="/donate" onClick={() => setIsMenuOpen(false)} className="text-sm text-gray-300 hover:text-blue-400">
                    {t('nav.donate')}
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleLanguageChange('fr')}
                      className={`text-sm px-2 py-1 rounded ${language === 'fr' ? 'text-blue-400' : 'text-gray-400'}`}
                    >
                      FR
                    </button>
                    <button
                      onClick={() => handleLanguageChange('mg')}
                      className={`text-sm px-2 py-1 rounded ${language === 'mg' ? 'text-blue-400' : 'text-gray-400'}`}
                    >
                      MG
                    </button>
                  </div>
                  {isAuthenticated ? (
                    <button onClick={logout} className="text-sm text-gray-300 hover:text-blue-400">
                      {t('nav.logout')}
                    </button>
                  ) : (
                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-sm text-gray-300 hover:text-blue-400">
                      {t('nav.login')}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16 md:h-[72px]"></div>
    </>
  );
}