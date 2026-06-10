// frontend/src/app/(public)/contact/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { 
  Mail, Phone, MapPin, Clock, Send, Heart, Loader2, 
  CheckCircle, Sparkles, ArrowRight, Globe, Award, 
  Users, TrendingUp, Target, X
} from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import { pageService, PageBackground } from '@/services/page.service';
import Link from 'next/link';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export default function ContactPage() {
  const { language } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  useEffect(() => {
    const loadPageBackground = async () => {
      try {
        const background = await pageService.getPageBackground('contact');
        if (background && background.is_active && background.image_url) {
          setPageBackground(background);
        }
      } catch (error) {
        console.error('Erreur chargement fond d ecran:', error);
      }
    };
    loadPageBackground();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = getText('Le nom complet est requis', 'Ilaina ny anarana feno');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = getText('L\'email est requis', 'Ilaina ny email');
    } else if (!/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(formData.email)) {
      newErrors.email = getText('Email invalide', 'Email tsy mety');
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = getText('Le sujet est requis', 'Ilaina ny lohahevitra');
    }
    
    if (!formData.message.trim()) {
      newErrors.message = getText('Le message est requis', 'Ilaina ny hafatra');
    } else if (formData.message.length < 10) {
      newErrors.message = getText('Le message doit contenir au moins 10 caractères', 'Ny hafatra dia tsy maintsy 10 soratra farafahakeliny');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(getText('Veuillez corriger les erreurs', 'Fenoy tsara ny sehatra'));
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || undefined,
          subject: formData.subject,
          message: formData.message
        })
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success(getText('Message envoye avec succes !', 'Voaefa tsara ny hafatra !'));
        setFormData({ full_name: "", email: "", phone: "", subject: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erreur');
      }
    } catch (err) {
      toast.error(getText('Erreur lors de l envoi du message', 'Nisy hadisoana tamin\'ny fandefasana'));
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

  // Style fond d'ecran PLEIN ECRAN
  const heroBackgroundStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundImage: `url(${pageBackground.image_url})`,
    backgroundPosition: pageBackground.position || 'center',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
  } : {};

  const heroOverlayStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 40) / 100})`,
  } : {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Plein ecran */}
      <section className="relative min-h-[85vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {pageBackground?.image_url && pageBackground.is_active ? (
            <>
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed" style={heroBackgroundStyle} />
              <div className="absolute inset-0" style={heroOverlayStyle} />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-900 to-gray-900" />
          )}
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fadeInUp">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
            <Heart className="w-4 h-4 text-blue-200" />
            <span className="text-sm font-medium text-white">Y-MaD Madagascar</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-2xl">
            {getText('Contactez-nous', 'Mifandraisa aminay')}
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-blue-100 max-w-2xl mx-auto">
            {getText(
              'Une question ? N hesitez pas a nous contacter',
              'Manana fanontaniana? Aza misalasala mifandraisa aminay'
            )}
          </p>
          
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-7 h-11 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1.5 h-2.5 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section principale */}
      <div className="bg-white rounded-t-3xl shadow-2xl -mt-10 relative z-20">
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                {getText('Envoyez-nous un message', 'Alefaso aminay ny hafatra')}
              </h2>
              <div className="w-20 h-1 bg-blue-800 mx-auto rounded-full"></div>
              <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
                {getText(
                  'Nous vous repondrons dans les plus brefs delais',
                  'Hamaly anao haingana izahay'
                )}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Formulaire de contact */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
                  
                  {submitted && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-green-800">{getText('Message envoye !', 'Voaefa ny hafatra !')}</p>
                          <p className="text-sm text-green-600">{getText('Nous vous repondrons rapidement.', 'Hamaly anao haingana izahay.')}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {getText('Nom complet', 'Anarana feno')} <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          name="full_name"
                          placeholder={getText('Jean RAKOTO', 'Jean RAKOTO')} 
                          value={formData.full_name} 
                          onChange={handleInputChange} 
                          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition ${
                            errors.full_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          required 
                        />
                        {errors.full_name && (
                          <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="email" 
                          name="email"
                          placeholder="jean.rakoto@email.com" 
                          value={formData.email} 
                          onChange={handleInputChange} 
                          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition ${
                            errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          required 
                        />
                        {errors.email && (
                          <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {getText('Telephone', 'Telefaonina')}
                        </label>
                        <input 
                          type="tel" 
                          name="phone"
                          placeholder="+261 32 04 856 97" 
                          value={formData.phone} 
                          onChange={handleInputChange} 
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {getText('Sujet', 'Lohahevitra')} <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          name="subject"
                          placeholder={getText('Question sur nos projets...', 'Fanontaniana momba ny tetikasa...')} 
                          value={formData.subject} 
                          onChange={handleInputChange} 
                          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition ${
                            errors.subject ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          required 
                        />
                        {errors.subject && (
                          <p className="text-xs text-red-500 mt-1">{errors.subject}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {getText('Message', 'Hafatra')} <span className="text-red-500">*</span>
                      </label>
                      <textarea 
                        name="message"
                        placeholder={getText('Votre message...', 'Ny hafatrao...')} 
                        rows={5} 
                        value={formData.message} 
                        onChange={handleInputChange} 
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition resize-y ${
                          errors.message ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.message && (
                        <p className="text-xs text-red-500 mt-1">{errors.message}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1 text-right">
                        {formData.message.length}/5000
                      </p>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex items-center gap-2 bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center shadow-md"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {getText('Envoi en cours...', 'Fandefasana...')}
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          {getText('Envoyer le message', 'Alefaso ny hafatra')}
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Informations de contact */}
              <div>
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Info className="w-4 h-4 text-blue-800" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {getText('Informations', 'Fampahalalana')}
                    </h3>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="flex gap-3 items-start group">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-800 transition-colors">
                        <MapPin className="text-blue-800 group-hover:text-white transition-colors" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{getText('Adresse', 'Adiresy')}</p>
                        <p className="text-gray-500 text-sm">Carion, Antananarivo, Madagascar</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 items-start group">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-800 transition-colors">
                        <Phone className="text-blue-800 group-hover:text-white transition-colors" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{getText('Telephone', 'Telefaonina')}</p>
                        <a href="tel:+261320485697" className="text-gray-500 text-sm hover:text-blue-800 transition">
                          +261 32 04 856 97
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 items-start group">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-800 transition-colors">
                        <Mail className="text-blue-800 group-hover:text-white transition-colors" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Email</p>
                        <a href="mailto:ymad.mg@gmail.com" className="text-gray-500 text-sm hover:text-blue-800 transition break-all">
                          ymad.mg@gmail.com
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 items-start group">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-800 transition-colors">
                        <Clock className="text-blue-800 group-hover:text-white transition-colors" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{getText('Horaires', 'Ora fisokafana')}</p>
                        <p className="text-gray-500 text-sm">
                          {getText('Lundi - Vendredi: 8h00 - 17h00', 'Alatsinainy - Zoma: 8h00 - 17h00')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reseaux sociaux */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mt-6 border border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-blue-800" />
                    <h3 className="text-xl font-bold text-gray-800">
                      {getText('Suivez-nous', 'Araho izahay')}
                    </h3>
                  </div>
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

                {/* Carte Google Maps simplifiée */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mt-6">
                  <div className="h-48 w-full bg-gray-200 relative">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3831.0!2d47.5!3d-18.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQ4JzU0LjAiUyA0N8KwMjUnMDAuMCJF!5e0!3m2!1sfr!2smg!4v1!5m2!1sfr!2smg" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy"
                      title="Carte Y-MaD"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 text-center bg-gray-50">
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-800" /> 
                      Carion, Antananarivo, Madagascar
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 py-12 mt-8">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {getText('Rejoignez notre communaute', 'Midira ao amin\'ny vondronay')}
          </h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            {getText(
              'Suivez nos actualites et nos actions a Madagascar',
              'Araho ny vaovao sy ny hetsika ataonay eto Madagasikara'
            )}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 bg-white text-blue-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              <Globe className="w-4 h-4" /> {getText('Notre blog', 'Bitsika')}
            </Link>
            <Link 
              href="/projects" 
              className="inline-flex items-center gap-2 bg-white/20 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-white/30 transition"
            >
              <Target className="w-4 h-4" /> {getText('Nos projets', 'Tetikasa')}
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
}

// Composant Info manquant
function Info(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}