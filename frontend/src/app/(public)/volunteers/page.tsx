'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function VolunteersPage() {
  const { t, language } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    skills: '',
    availability: 'weekend',
    motivation: '',
    experience: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/volunteers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const data = await response.json();
        alert(data.message || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
        <div className="container mx-auto max-w-md px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'fr' ? 'Merci pour votre inscription !' : 'Misaotra nisoratra anarana !'}
            </h2>
            <p className="text-gray-600 mb-6">
              {language === 'fr' 
                ? 'Nous vous contacterons dans les plus brefs délais pour vous proposer des missions.'
                : 'Hifandray aminareo izahay tsy ho ela mba hanome anareo asa.'}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              {language === 'fr' ? 'Retour à l\'accueil' : 'Hiverina any an-trano'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm mb-4">
            <span>🤝</span>
            <span>{language === 'fr' ? 'Engagez-vous' : 'Mandraisa andraikitra'}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('volunteers.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('volunteers.subtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'fr' ? 'Nom complet' : 'Anarana feno'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Rakoto Jean"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="jean.rakoto@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'fr' ? 'Téléphone' : 'Telefaonina'}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="034 00 000 00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('volunteers.skills')} *
              </label>
              <textarea
                required
                rows={3}
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={language === 'fr' ? 'Ex: Communication, Organisation, Informatique, Photographie...' : 'Ohatra: Fifandraisana, Fandrindrana, Informatika, Sary...'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('volunteers.availability')} *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'weekdays', label_fr: 'Semaine', label_mg: 'Andro fiasana' },
                  { value: 'weekend', label_fr: 'Week-end', label_mg: 'Farany herinandro' },
                  { value: 'occasional', label_fr: 'Ponctuel', label_mg: 'Indraindray' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, availability: option.value })}
                    className={`p-3 rounded-lg border-2 transition ${
                      formData.availability === option.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {language === 'fr' ? option.label_fr : option.label_mg}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('volunteers.motivation')}
              </label>
              <textarea
                rows={3}
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={language === 'fr' ? 'Pourquoi souhaitez-vous devenir bénévole chez Y-Mad ?' : 'Maninona no tianao ho mpanao asa soa ao Y-Mad?'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('volunteers.experience')}
              </label>
              <textarea
                rows={2}
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={language === 'fr' ? 'Avez-vous déjà fait du bénévolat ?' : 'Efa nanao asa soa ve ianao?'}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('common.loading')}</span>
                </div>
              ) : (
                t('volunteers.title')
              )}
            </button>
          </div>
        </form>

        {/* Info section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-2">
            {language === 'fr' ? 'Pourquoi devenir bénévole ?' : 'Nahoana no ho mpanao asa soa?'}
          </h3>
          <ul className="space-y-2 text-blue-700 text-sm">
            <li className="flex items-center gap-2">
              <span>✓</span>
              <span>{language === 'fr' ? 'Développez vos compétences' : 'Hampandroso ny fahaizanao'}</span>
            </li>
            <li className="flex items-center gap-2">
              <span>✓</span>
              <span>{language === 'fr' ? 'Rencontrez des personnes inspirantes' : 'Hahita olona mahay'}</span>
            </li>
            <li className="flex items-center gap-2">
              <span>✓</span>
              <span>{language === 'fr' ? 'Contribuez au développement de Madagascar' : 'Hanampy ny fivoaran\'i Madagasikara'}</span>
            </li>
            <li className="flex items-center gap-2">
              <span>✓</span>
              <span>{language === 'fr' ? 'Recevez une attestation de bénévolat' : 'Hahazo taratasy fanamarinana maha-mpanao asa soa'}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}