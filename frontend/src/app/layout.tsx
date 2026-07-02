// frontend/src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Y-MaD - Young for Madagascar Development",
  description: "Plateforme de gestion des offres d'emploi de l'ONG Y-MaD - Young for Madagascar Development",
  keywords: "Y-MaD, Young for Madagascar Development, ONG Madagascar, jeunesse, développement, emploi, formation, Carion, Antananarivo",
  authors: [{ name: "Y-MaD - Young for Madagascar Development" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Y-MaD - Young for Madagascar Development",
    description: "Plateforme de gestion des offres d'emploi de l'ONG Y-MaD",
    url: "https://y-mad.mg",
    siteName: "Y-MaD - Young for Madagascar Development",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Y-MaD - Young for Madagascar Development",
    description: "Plateforme de gestion des offres d'emploi de l'ONG Y-MaD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: { background: '#363636', color: '#fff' },
                  success: { duration: 3000, iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                  error: { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }}
              />
              <Header />
              <main className="min-h-screen">{children}</main>
              <Footer />
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}