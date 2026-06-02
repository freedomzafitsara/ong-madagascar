// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Y-MaD - Young for Madagascar Development",
    template: "%s | Y-MaD",
  },
  description: "Plateforme de gestion des offres d'emploi pour les jeunes à Madagascar",
  keywords: [
    "Y-MaD",
    "ONG Madagascar",
    "offres d'emploi",
    "jeunesse",
    "développement",
    "formation",
    "recrutement",
    "Madagascar",
  ],
  authors: [{ name: "Y-MaD Association", url: "https://y-mad.mg" }],
  creator: "Y-MaD Association",
  publisher: "Y-MaD Association",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: "mg_MG",
    title: "Y-MaD - Young for Madagascar Development",
    description: "Plateforme de gestion des offres d'emploi pour les jeunes à Madagascar",
    siteName: "Y-MaD",
    url: "https://y-mad.mg",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Y-MaD - Jeunesse pour le développement de Madagascar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Y-MaD - Young for Madagascar Development",
    description: "Plateforme de gestion des offres d'emploi pour les jeunes à Madagascar",
    images: ["/og-image.jpg"],
    creator: "@ymad_mg",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  verification: {
    google: "votre-code-de-verification-google",
  },
  alternates: {
    canonical: "https://y-mad.mg",
    languages: {
      fr: "https://y-mad.mg/fr",
      mg: "https://y-mad.mg/mg",
    },
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
          <LanguageProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: { 
                  background: '#1e3a8a', 
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px',
                },
                success: { 
                  duration: 3000,
                  iconTheme: { primary: '#22c55e', secondary: '#ffffff' },
                },
                error: { 
                  duration: 4000,
                  iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
                },
                loading: {
                  style: { background: '#6b7280', color: '#ffffff' },
                },
              }}
            />
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}