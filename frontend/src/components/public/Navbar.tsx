// src/components/public/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Heart, LogIn, User, LayoutDashboard, ChevronDown, Home, FolderOpen, Newspaper, Mail, Briefcase, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getLogo } from '@/services/imageDB';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

const menuItems = [
  { name: 'Accueil', href: '/', icon: Home },
  { name: 'Projets', href: '/projects', icon: FolderOpen },
  { name: 'Offres', href: '/jobs', icon: Briefcase },
  { name: 'Actualités', href: '/blog', icon: Newspaper },
  { name: 'Contact', href: '/contact', icon: Mail },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const logo = await getLogo();
        if (logo && logo.url && logo.url.trim() !== '') {
          setLogoUrl(logo.url);
          setImageError(false);
        } else {
          setLogoUrl(null);
        }
      } catch (error) {
        console.error('Erreur chargement logo:', error);
        setLogoUrl(null);
      }
    };
    loadLogo();
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setShowDropdown(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  const handleImageError = () => {
    setImageError(true);
    setLogoUrl(null);
  };

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-50 ${
          isScrolled 
            ? 'bg-gray-800 shadow-md py-2' 
            : 'bg-gray-800 py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* ==================== LOGO ==================== */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="h-11 w-auto rounded-full bg-gray-700 p-0.5 shadow-sm">
                  <div className="h-full w-auto rounded-full bg-gray-800 flex items-center justify-center px-4 min-w-[48px]">
                    {logoUrl && !imageError ? (
                      <img 
                        src={logoUrl} 
                        alt="Y-Mad" 
                        className="h-7 w-auto object-contain"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-white font-semibold text-sm">Y-Mad</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="hidden sm:block">
                <span className="text-white font-semibold text-sm">
                  Y-Mad <span className="text-gray-400">Madagascar</span>
                </span>
                <p className="text-[10px] text-gray-500 leading-tight">Jeunesse en Action</p>
              </div>
            </Link>

            {/* ==================== MENU DESKTOP ==================== */}
            <div className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${
                      active 
                        ? 'text-blue-500 bg-gray-700' 
                        : 'text-blue-400 hover:text-blue-300 hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5 text-blue-400" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* ==================== BOUTONS DROITE ==================== */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Bouton Adhérer */}
              <Link
                href="/join"
                className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Adhérer
              </Link>
              
              {/* Bouton Don */}
              <Link
                href="/donate"
                className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5" />
                Don
              </Link>
              
              {/* Sélecteur de langue */}
              <LanguageSwitcher />
              
              {/* Zone utilisateur */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-1.5 bg-gray-700 text-white px-3 py-1.5 rounded-full text-xs hover:bg-gray-600 border border-gray-600"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-xs max-w-[80px] truncate text-white">{user.firstName}</span>
                    <ChevronDown className="w-3 h-3 text-white" />
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 z-50">
                      <div className="p-2 border-b bg-gray-50">
                        <p className="font-medium text-xs text-gray-800">{user.firstName} {user.lastName}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link 
                        href="/dashboard" 
                        className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                      >
                        <LayoutDashboard className="w-3 h-3 text-blue-600" />
                        Tableau de bord
                      </Link>
                      <button 
                        onClick={logout} 
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 border-t"
                      >
                        <LogIn className="w-3 h-3" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-400" />
                  Connexion
                </Link>
              )}
            </div>

            {/* ==================== BURGER MOBILE ==================== */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-white p-2 rounded-lg hover:bg-gray-700"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ==================== MENU MOBILE ==================== */}
        <div className={`lg:hidden bg-gray-800 border-t border-gray-700 overflow-hidden ${isOpen ? 'max-h-screen py-3' : 'max-h-0'}`}>
          <div className="px-4 space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                    active 
                      ? 'bg-gray-700 text-blue-500' 
                      : 'text-blue-400 hover:bg-gray-700 hover:text-blue-300'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-4 h-4 text-blue-400" />
                  {item.name}
                </Link>
              );
            })}
            
            <div className="flex gap-2 pt-2">
              <Link
                href="/join"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                onClick={() => setIsOpen(false)}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Adhérer
              </Link>
              
              <Link
                href="/donate"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                onClick={() => setIsOpen(false)}
              >
                <Heart className="w-3.5 h-3.5" />
                Don
              </Link>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <LanguageSwitcher />
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs text-gray-300">{user.firstName}</span>
                  <button 
                    onClick={() => { logout(); setIsOpen(false); }} 
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn className="w-3 h-3 text-blue-400" /> Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="h-[57px]"></div>
    </>
  );
};