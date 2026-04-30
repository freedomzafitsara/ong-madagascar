// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Y-Mad - Youthful Madagascar",
  description: "Association de jeunesse et développement à Madagascar",
  keywords: "Y-Mad, ONG Madagascar, jeunesse, développement, emploi, formation",
  authors: [{ name: "Y-Mad" }],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {/* Toaster pour les notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          {/* Header */}
          <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-primary hover:text-primary-dark transition">
                Y-Mad
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex gap-6">
                <NavLink href="/">Accueil</NavLink>
                <NavLink href="/projects">Projets</NavLink>
                <NavLink href="/events">Événements</NavLink>
                <NavLink href="/blog">Blog</NavLink>
                <NavLink href="/emploi" highlight>Offres d'Emploi</NavLink>
                <NavLink href="/about">À propos</NavLink>
                <NavLink href="/contact">Contact</NavLink>
              </div>
              
              {/* Auth Buttons */}
              <div className="flex gap-3">
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition"
                >
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                >
                  Inscription
                </Link>
              </div>
            </nav>
          </header>

          {/* Main Content */}
          <main className="min-h-screen">{children}</main>

          {/* Footer */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

// ========================================
// COMPOSANTS INTERNES
// ========================================

function NavLink({ 
  href, 
  children, 
  highlight = false 
}: { 
  href: string; 
  children: React.ReactNode; 
  highlight?: boolean;
}) {
  return (
    <Link 
      href={href} 
      className={`transition ${
        highlight 
          ? "text-primary font-semibold hover:underline" 
          : "text-gray-700 hover:text-primary"
      }`}
    >
      {children}
    </Link>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">Y-Mad</h3>
            <p className="text-gray-400">Youthful Madagascar</p>
            <p className="text-gray-400 mt-2">Antananarivo, Madagascar</p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3">Liens rapides</h4>
            <ul className="space-y-2 text-gray-400">
              <li><FooterLink href="/emploi">Offres d'emploi</FooterLink></li>
              <li><FooterLink href="/projects">Nos projets</FooterLink></li>
              <li><FooterLink href="/donate">Faire un don</FooterLink></li>
              <li><FooterLink href="/join">Adhérer</FooterLink></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2">
                📧 <a href="mailto:contact@y-mad.mg" className="hover:text-white">contact@y-mad.mg</a>
              </li>
              <li className="flex items-center gap-2">
                📞 <a href="tel:+261340000000" className="hover:text-white">+261 34 00 000 00</a>
              </li>
            </ul>
          </div>
          
          {/* Social Media */}
          <div>
            <h4 className="font-semibold mb-3">Suivez-nous</h4>
            <div className="flex gap-4">
              <SocialLink href="#" label="Facebook">📘</SocialLink>
              <SocialLink href="#" label="Instagram">📷</SocialLink>
              <SocialLink href="#" label="LinkedIn">🔗</SocialLink>
              <SocialLink href="#" label="Twitter">🐦</SocialLink>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} Y-Mad. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="hover:text-white transition">
      {children}
    </Link>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-white transition text-xl"
      aria-label={label}
    >
      {children}
    </a>
  );
}