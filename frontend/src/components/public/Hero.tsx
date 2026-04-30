'use client';

import React from 'react';
import Link from 'next/link';

export const Hero: React.FC = () => {
  return (
    <section className="relative bg-marine-500 text-white">
      <div className="absolute inset-0 bg-black/30 z-10"></div>
      <div className="relative z-20 max-w-7xl mx-auto px-4 py-24 md:py-32 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Agissons pour <span className="text-gold-500">Madagascar</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Ensemble pour un avenir meilleur à Madagascar. Agissons pour l'éducation, 
          la santé, l'environnement et l'agriculture.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/donate" 
            className="bg-gold-500 text-marine-900 px-8 py-3 rounded-lg font-semibold hover:bg-gold-600 transition transform hover:scale-105"
          >
            Faire un don
          </Link>
          <Link 
            href="/projects" 
            className="border-2 border-gold-500 text-gold-500 px-8 py-3 rounded-lg font-semibold hover:bg-gold-500 hover:text-marine-900 transition"
          >
            Nos projets
          </Link>
        </div>
      </div>
    </section>
  );
};
