// app/not-found.tsx
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ymad-blue-900 to-ymad-blue-700">
      <div className="text-center px-4 max-w-lg mx-auto">
        {/* Icône ou illustration */}
        <div className="w-32 h-32 mx-auto mb-6 text-ymad-orange-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <h1 className="text-8xl md:text-9xl font-bold text-ymad-orange-500">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-white mt-4 mb-2">
          Page non trouvée
        </h2>
        <p className="text-gray-300 mb-8">
          Désolé, la page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 bg-ymad-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-ymad-orange-600 transition duration-300"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-ymad-blue-900 transition duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Page précédente
          </button>
        </div>
      </div>
    </div>
  );
}