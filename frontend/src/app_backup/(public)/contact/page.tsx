'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useTranslation } from '@/hooks/useTranslation';

export default function ContactPage() {
  const { t, language } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  // Chargement du fond d'écran
  useEffect(() => {
    const loadBgImage = async () => {
      try {
        const response = await fetch('/api/admin/page-bg?page=contact');
        if (response.ok) {
          const data = await response.json();
          if (data.url) setBgImage(data.url);
        }
      } catch (error) {
        console.error('Erreur chargement fond:', error);
      }
    };
    loadBgImage();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      setError(true);
      setTimeout(() => setError(false), 3000);
      return;
    }

    setLoading(true);
    
    try {
      const contactMessage = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'new'
      };
      
      const existing = localStorage.getItem('ymad_contact_messages');
      const messages = existing ? JSON.parse(existing) : [];
      messages.push(contactMessage);
      localStorage.setItem('ymad_contact_messages', JSON.stringify(messages));
      
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const socialLinks = [
    { name: 'Facebook', url: 'https://facebook.com/ymad', icon: FaFacebook, color: 'hover:bg-[#1877F2]' },
    { name: 'Twitter', url: 'https://twitter.com/ymad', icon: FaTwitter, color: 'hover:bg-[#1DA1F2]' },
    { name: 'Instagram', url: 'https://instagram.com/ymad', icon: FaInstagram, color: 'hover:bg-[#E4405F]' },
    { name: 'LinkedIn', url: 'https://linkedin.com/company/ymad', icon: FaLinkedin, color: 'hover:bg-[#0A66C2]' },
  ];

  return (
    <div className="min-h-screen bg-ymad-gray-50">
      {/* Hero Section avec fond dynamique */}
      <div className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden">
        {bgImage ? (
          <>
            <img src={bgImage} alt="Fond contact" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/50"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-ymad-blue-800 to-ymad-blue-900">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          </div>
        )}
        
        <div className="relative z-10 text-center text-white px-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-4 h-4 text-ymad-blue-300" />
            <span className="text-sm">Y-Mad Madagascar</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('contact.title')}</h1>
          <p className="text-lg text-ymad-blue-100 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Une question ? N\'hésitez pas à nous contacter'
              : 'Manana fanontaniana? Aza misalasala mifandraisa aminay'}
          </p>
        </div>
      </div>

      {/* Section principale */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Messages de notification */}
          {submitted && (
            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 flex items-center gap-2 max-w-2xl mx-auto border border-green-200">
              <CheckCircle size={20} /> 
              <span>{t('contact.success')}</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2 max-w-2xl mx-auto border border-red-200">
              <AlertCircle size={20} /> 
              <span>{t('contact.error')}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire de contact */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-8 border border-ymad-gray-100">
                <h2 className="text-2xl font-bold text-ymad-gray-800 mb-6">
                  {language === 'fr' ? 'Envoyez-nous un message' : 'Alefaso aminay ny hafatra'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ymad-gray-700 mb-1">
                        {language === 'fr' ? 'Nom complet' : 'Anarana feno'} *
                      </label>
                      <input 
                        type="text" 
                        placeholder={language === 'fr' ? 'Votre nom' : 'Ny anaranao'} 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                        className="w-full px-4 py-2 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 focus:border-ymad-blue-500 outline-none transition"
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ymad-gray-700 mb-1">Email *</label>
                      <input 
                        type="email" 
                        placeholder={language === 'fr' ? 'Votre email' : 'Ny mailakao'} 
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                        className="w-full px-4 py-2 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 outline-none transition"
                        required 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ymad-gray-700 mb-1">
                        {language === 'fr' ? 'Téléphone' : 'Telefaonina'}
                      </label>
                      <input 
                        type="tel" 
                        placeholder={language === 'fr' ? 'Votre téléphone' : 'Ny telefaoninao'} 
                        value={formData.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                        className="w-full px-4 py-2 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 outline-none transition" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ymad-gray-700 mb-1">
                        {language === 'fr' ? 'Sujet' : 'Lohahevitra'} *
                      </label>
                      <input 
                        type="text" 
                        placeholder={language === 'fr' ? 'Sujet' : 'Lohahevitra'} 
                        value={formData.subject} 
                        onChange={(e) => setFormData({...formData, subject: e.target.value})} 
                        className="w-full px-4 py-2 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 outline-none transition"
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ymad-gray-700 mb-1">
                      {language === 'fr' ? 'Message' : 'Hafatra'} *
                    </label>
                    <textarea 
                      placeholder={language === 'fr' ? 'Votre message' : 'Ny hafatrao'} 
                      rows={5} 
                      value={formData.message} 
                      onChange={(e) => setFormData({...formData, message: e.target.value})} 
                      className="w-full px-4 py-2 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 outline-none transition"
                      required
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex items-center gap-2 bg-ymad-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-ymad-blue-700 transition disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send size={18} />
                    )}
                    {loading 
                      ? (language === 'fr' ? 'Envoi en cours...' : 'Fandefasana...') 
                      : (language === 'fr' ? 'Envoyer le message' : 'Alefaso ny hafatra')}
                  </button>
                </form>
              </div>
            </div>

            {/* Informations de contact */}
            <div>
              <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-ymad-gray-100">
                <h3 className="text-xl font-bold text-ymad-gray-800 mb-4">
                  {language === 'fr' ? 'Informations' : 'Fampahalalana'}
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <MapPin className="text-ymad-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-ymad-gray-600">
                      {language === 'fr' ? 'Antananarivo, Madagascar' : 'Antananarivo, Madagasikara'}
                    </span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Phone className="text-ymad-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-ymad-gray-600">+261 34 00 000 00</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Mail className="text-ymad-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-ymad-gray-600">contact@y-mad.mg</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Clock className="text-ymad-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-ymad-gray-600">
                      {language === 'fr' ? 'Lundi - Vendredi: 8h - 17h' : 'Alatsinainy - Zoma: 8h - 17h'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div className="bg-ymad-blue-50 rounded-xl p-6 border border-ymad-blue-100">
                <h3 className="text-xl font-bold text-ymad-gray-800 mb-4">
                  {language === 'fr' ? 'Suivez-nous' : 'Araho izahay'}
                </h3>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <a 
                      key={social.name}
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`bg-ymad-blue-600 text-white p-3 rounded-full hover:bg-ymad-blue-700 transition ${social.color}`}
                    >
                      <social.icon size={20} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Carte de localisation */}
              <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden border border-ymad-gray-100">
                <div className="h-48 bg-ymad-gray-200 relative">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3831.0!2d47.5!3d-18.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQ4JzU0LjAiUyA0N8KwMjUnMDAuMCJF!5e0!3m2!1sfr!2smg!4v1!5m2!1sfr!2smg" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy"
                    title="Carte Y-Mad"
                    className="grayscale hover:grayscale-0 transition"
                  ></iframe>
                </div>
                <div className="p-4 text-center">
                  <p className="text-sm text-ymad-gray-500">
                    📍 {language === 'fr' ? 'Antananarivo, Madagascar' : 'Antananarivo, Madagasikara'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}