// src/components/public/Footer.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Mail, Phone, MapPin, Award } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    organization: [
      { name: 'Qui sommes-nous', href: '/about' },
      { name: 'Notre équipe', href: '/team' },
      { name: 'Nos valeurs', href: '/values' },
      { name: 'Rapports annuels', href: '/reports' },
    ],
    actions: [
      { name: 'Nos projets', href: '/projects' },
      { name: 'Faire un don', href: '/donate' },
      { name: 'Devenir bénévole', href: '/volunteer' },
      { name: 'Partenariats', href: '/partnerships' },
    ],
    ressources: [
      { name: 'Actualités', href: '/blog' },
      { name: 'Contact', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Transparence', href: '/transparency' },
    ]
  };

  const socialLinks = [
    { icon: FaFacebook, href: 'https://facebook.com', label: 'Facebook', color: 'hover:bg-[#1877f2]' },
    { icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter', color: 'hover:bg-[#1da1f2]' },
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram', color: 'hover:bg-[#e4405f]' },
    { icon: FaLinkedin, href: 'https://linkedin.com', label: 'LinkedIn', color: 'hover:bg-[#0077b5]' },
    { icon: FaYoutube, href: 'https://youtube.com', label: 'YouTube', color: 'hover:bg-[#ff0000]' },
  ];

  return (
    <footer className="bg-sky-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="text-sky-300 w-8 h-8" />
              <span className="text-xl font-bold">ONG Madagascar</span>
            </div>
            <p className="text-sky-100 text-sm mb-4">
              Ensemble pour un avenir meilleur à Madagascar. Agissons pour l'éducation, 
              la santé, l'environnement et l'agriculture.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <a key={index} href={social.href} target="_blank" rel="noopener noreferrer" className={`p-2 bg-white/10 rounded-lg ${social.color} transition-all duration-300 hover:scale-110`}>
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div><h3 className="text-lg font-semibold mb-4 text-sky-300">L'organisation</h3><ul className="space-y-2">{footerLinks.organization.map((link) => (<li key={link.name}><Link href={link.href} className="text-sky-100 hover:text-white transition duration-300 text-sm">{link.name}</Link></li>))}</ul></div>
          <div><h3 className="text-lg font-semibold mb-4 text-sky-300">Nos actions</h3><ul className="space-y-2">{footerLinks.actions.map((link) => (<li key={link.name}><Link href={link.href} className="text-sky-100 hover:text-white transition duration-300 text-sm">{link.name}</Link></li>))}</ul></div>
          <div><h3 className="text-lg font-semibold mb-4 text-sky-300">Ressources</h3><ul className="space-y-2">{footerLinks.ressources.map((link) => (<li key={link.name}><Link href={link.href} className="text-sky-100 hover:text-white transition duration-300 text-sm">{link.name}</Link></li>))}</ul></div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-sky-300">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sky-100 text-sm"><MapPin className="w-5 h-5 text-sky-300 flex-shrink-0 mt-0.5" /><span>Carion, Madagascar</span></li>
              <li className="flex items-center gap-3 text-sky-100 text-sm"><Phone className="w-5 h-5 text-sky-300" /><span>+261 32 04 856 97</span></li>
              <li className="flex items-center gap-3 text-sky-100 text-sm"><Mail className="w-5 h-5 text-sky-300" /><span>ymad.mg@gmail.com</span></li>
            </ul>
            <div className="mt-4 pt-4 border-t border-white/10"><div className="flex items-center gap-2 text-sky-100 text-sm"><Award className="w-5 h-5 text-sky-300" /><span>Reconnue d'utilité publique</span></div></div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sky-200 text-sm">&copy; {currentYear} ONG Madagascar. Tous droits réservés.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sky-200 hover:text-white text-sm transition">Politique de confidentialité</Link>
              <Link href="/terms" className="text-sky-200 hover:text-white text-sm transition">Conditions d'utilisation</Link>
              <Link href="/cookies" className="text-sky-200 hover:text-white text-sm transition">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};