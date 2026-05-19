'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Sparkles, AlertCircle, Heart } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useTranslation } from '@/hooks/useTranslation';
import { pageService, PageBackground } from '@/services/pageService';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export default function ContactPage() {
  const { t, language } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  // Chargement du fond d'ecran depuis l'espace super-admin
  useEffect(() => {
    const loadPageBackground = async () => {
      try {
        const background = await pageService.getBackground('contact');
        if (background && background.is_active && background.image_url) {
          setPageBackground(background);
        }
      } catch (error) {
        console.error('Erreur chargement fond d ecran:', error);
      }
    };
    loadPageBackground();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      setError(true);
      toast.error(language === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Fenoy ny sehatra takiana');
      setTimeout(() => setError(false), 3000);
      return;
    }

    setLoading(true);
    
    try {
      // Envoi vers l'API backend
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message
        })
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success(language === 'fr' ? 'Message envoyé avec succès !' : 'Voaefa tsara ny hafatra !');
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(true);
      toast.error(language === 'fr' ? 'Erreur lors de l\'envoi du message' : 'Nisy hadisoana tamin\'ny fandefasana');
      setTimeout(() => setError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const socialLinks = [
    { name: 'Facebook', url: 'https://facebook.com/ymad.mg', icon: FaFacebook, bg: '#1877F2' },
    { name: 'Twitter', url: 'https://twitter.com/ymad_mg', icon: FaTwitter, bg: '#1DA1F2' },
    { name: 'Instagram', url: 'https://instagram.com/ymad.mg', icon: FaInstagram, bg: '#E4405F' },
    { name: 'LinkedIn', url: 'https://linkedin.com/company/ymad-mg', icon: FaLinkedin, bg: '#0A66C2' },
  ];

  // Style du fond d'ecran plein ecran avec overlay
  const overlayStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 40) / 100})`,
  } : {};

  return (
    <div className="min-h-screen">
      {/* ==================== HERO SECTION PLEIN ECRAN ==================== */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Fond d'ecran uploade via super-admin */}
        <div className="absolute inset-0">
          {pageBackground?.image_url && pageBackground.is_active ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${pageBackground.image_url})` }}
              />
              <div className="absolute inset-0" style={overlayStyle} />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-900">
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          )}
        </div>

        {/* Contenu centre avec TEXTE BLANC */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 py-20">
          {/* Badge d'association */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-8 animate-fade-in-up">
            <Heart className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Y-Mad Madagascar</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-2xl animate-fade-in-up">
            {language === 'fr' ? 'Contactez-nous' : 'Mifandraisa aminay'}
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-white max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Une question ? N\'hésitez pas à nous contacter'
              : 'Manana fanontaniana? Aza misalasala mifandraisa aminay'}
          </p>
          
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2">
              <p className="text-white font-semibold text-sm">Réponse sous 48h</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2">
              <p className="text-white font-semibold text-sm">Support gratuit</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION PRINCIPALE ==================== */}
      <div className="relative z-10 bg-white rounded-t-3xl shadow-2xl -mt-10">
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Formulaire de contact */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {language === 'fr' ? 'Envoyez-nous un message' : 'Alefaso aminay ny hafatra'}
                  </h2>
                  <p className="text-gray-500 mb-6">
                    {language === 'fr' 
                      ? 'Nous vous répondrons dans les plus brefs délais'
                      : 'Hamaly anao haingana izahay'}
                  </p>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {language === 'fr' ? 'Nom complet' : 'Anarana feno'} *
                        </label>
                        <input 
                          type="text" 
                          placeholder={language === 'fr' ? 'Jean Rakoto' : 'Jean Rakoto'} 
                          value={formData.name} 
                          onChange={(e) => setFormData({...formData, name: e.target.value})} 
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input 
                          type="email" 
                          placeholder="jean@email.com" 
                          value={formData.email} 
                          onChange={(e) => setFormData({...formData, email: e.target.value})} 
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                          required 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {language === 'fr' ? 'Téléphone' : 'Telefaonina'}
                        </label>
                        <input 
                          type="tel" 
                          placeholder="032 04 856 97" 
                          value={formData.phone} 
                          onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {language === 'fr' ? 'Sujet' : 'Lohahevitra'} *
                        </label>
                        <input 
                          type="text" 
                          placeholder={language === 'fr' ? 'Question sur...' : 'Fanontaniana...'} 
                          value={formData.subject} 
                          onChange={(e) => setFormData({...formData, subject: e.target.value})} 
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                          required 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'fr' ? 'Message' : 'Hafatra'} *
                      </label>
                      <textarea 
                        placeholder={language === 'fr' ? 'Votre message...' : 'Ny hafatrao...'} 
                        rows={5} 
                        value={formData.message} 
                        onChange={(e) => setFormData({...formData, message: e.target.value})} 
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer w-full md:w-auto justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {language === 'fr' ? 'Envoi en cours...' : 'Fandefasana...'}
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          {language === 'fr' ? 'Envoyer le message' : 'Alefaso ny hafatra'}
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Informations de contact */}
              <div>
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {language === 'fr' ? 'Informations' : 'Fampahalalana'}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="text-blue-600" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Adresse</p>
                        <span className="text-gray-600 text-sm">
                          Carion, Antananarivo, Madagascar
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="text-blue-600" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Téléphone</p>
                        <span className="text-gray-600 text-sm">+261 32 04 856 97</span>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="text-blue-600" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Email</p>
                        <span className="text-gray-600 text-sm">ymad.mg@gmail.com</span>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="text-blue-600" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Horaires</p>
                        <span className="text-gray-600 text-sm">
                          Lundi - Vendredi: 8h - 17h
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reseaux sociaux */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {language === 'fr' ? 'Suivez-nous' : 'Araho izahay'}
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    {socialLinks.map((social) => (
                      <a 
                        key={social.name}
                        href={social.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white p-3 rounded-full transition-all duration-200 hover:scale-110 hover:shadow-lg"
                        style={{ backgroundColor: social.bg }}
                        aria-label={social.name}
                      >
                        <social.icon size={20} />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Carte de localisation */}
                <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="h-56 bg-gray-200 relative">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3831.0!2d47.5!3d-18.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQ4JzU0LjAiUyA0N8KwMjUnMDAuMCJF!5e0!3m2!1sfr!2smg!4v1!5m2!1sfr!2smg" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy"
                      title="Carte Y-Mad"
                      className="grayscale hover:grayscale-0 transition duration-300"
                    />
                  </div>
                  <div className="p-4 text-center bg-gray-50">
                    <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-600" /> 
                      Carion, Antananarivo, Madagascar
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}