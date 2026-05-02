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

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [langue, setLangue] = useState('FR');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Accueil', href: '/', icon: faHome },
    { name: 'Projets', href: '/projects', icon: faProjectDiagram },
    { name: 'Offres', href: '/jobs', icon: faBriefcase },
    { name: 'Actualités', href: '/blog', icon: faNewspaper },
    { name: 'Contact', href: '/contact', icon: faEnvelope },
  ];

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
            {/* LOGO - AGRANDI */}
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
                  Jeunesse en Action
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
                Adhérer
              </Link>
              <Link href="/donate" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition">
                Don
              </Link>

              {/* Language */}
              <div className="relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-blue-400 transition"
                >
                  <FontAwesomeIcon icon={faGlobe} className="w-4 h-4" />
                  <span>{langue}</span>
                  <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3" />
                </button>
                {isLangOpen && (
                  <>
                    <div className="absolute top-full right-0 mt-2 w-20 bg-gray-700 rounded-lg shadow-lg py-1 z-50 border border-gray-600">
                      <button
                        onClick={() => { setLangue('FR'); setIsLangOpen(false); }}
                        className="block w-full px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-600"
                      >
                        FR
                      </button>
                      <button
                        onClick={() => { setLangue('MG'); setIsLangOpen(false); }}
                        className="block w-full px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-600"
                      >
                        MG
                      </button>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                  </>
                )}
              </div>

              <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition">
                Connexion
              </Link>
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
                  <Link href="/join" className="text-sm text-gray-300 hover:text-blue-400">Adhérer</Link>
                  <Link href="/donate" className="text-sm text-gray-300 hover:text-blue-400">Don</Link>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setLangue('FR')}
                      className={`text-sm px-2 py-1 rounded ${langue === 'FR' ? 'text-blue-400' : 'text-gray-400'}`}
                    >
                      FR
                    </button>
                    <button
                      onClick={() => setLangue('MG')}
                      className={`text-sm px-2 py-1 rounded ${langue === 'MG' ? 'text-blue-400' : 'text-gray-400'}`}
                    >
                      MG
                    </button>
                  </div>
                  <Link href="/login" className="text-sm text-gray-300 hover:text-blue-400">
                    Connexion
                  </Link>
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