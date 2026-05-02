// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Y-Mad - Youthful Madagascar",
  description: "Association de jeunesse et développement à Madagascar",
  keywords: "Y-Mad, ONG Madagascar, jeunesse, développement, emploi, formation",
  authors: [{ name: "Y-Mad" }],
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
        </AuthProvider>
      </body>
    </html>
  );
}