'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { pageService, PageBackground } from '@/services/pageService';
import { 
  Heart, Sparkles, Gift, Shield, TrendingUp, Users, 
  TreePine, BookOpen, HandHeart, ArrowRight, CheckCircle,
  Smartphone, Building, CreditCard, Loader2, AlertCircle,
  ChevronRight, Target, Globe, Leaf
} from 'lucide-react';

// Types pour les projets
interface Project {
  id: string;
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  imageUrl?: string;
  progress?: number;
}

// Montants de don proposes
const donationAmounts = [5000, 10000, 25000, 50000, 100000];

export default function DonatePage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('mvola');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([
    {
      id: 'education',
      title: 'Education pour tous',
      title_mg: 'Fampianarana ho an\'ny rehetra',
      description: 'Soutenir l education des jeunes defavorises',
      description_mg: 'Fanohanana ny fampianarana ho an\'ny tanora sahirana',
      progress: 65
    },
    {
      id: 'environment',
      title: 'Reforestation',
      title_mg: 'Fambolena hazo',
      description: 'Lutter contre la deforestation',
      description_mg: 'Miady amin\'ny fanapahana hazo tafahoatra',
      progress: 40
    },
    {
      id: 'health',
      title: 'Sante communautaire',
      title_mg: 'Fahasalamana',
      description: 'Acces aux soins pour tous',
      description_mg: 'Fahafahana miditra amin\'ny fitsaboana ho an\'ny rehetra',
      progress: 30
    }
  ]);

  useEffect(() => {
    loadPageBackground();
  }, []);

  // Chargement du fond d ecran depuis l espace super-admin
  const loadPageBackground = async () => {
    try {
      const background = await pageService.getBackground('donate');
      if (background && background.is_active && background.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error('Erreur chargement fond d ecran:', error);
    }
  };

  const getText = (frText: string, mgText: string): string => {
    return language === 'fr' ? frText : mgText;
  };

  const getDisplayAmount = (amount: number): string => {
    return `${amount.toLocaleString()} MGA`;
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getFinalAmount = (): number => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) return parseInt(customAmount);
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalAmount = getFinalAmount();
    if (finalAmount < 1000) {
      alert(getText('Le montant minimum est de 1 000 MGA', 'Ny vola farafahakeliny dia 1 000 Ar'));
      return;
    }

    if (!isAnonymous && (!fullName || !email)) {
      alert(getText('Veuillez remplir votre nom et email', 'Fenoy ny anaranao sy ny mailakao'));
      return;
    }

    if ((paymentMethod === 'mvola' || paymentMethod === 'orange_money' || paymentMethod === 'airtel') && !phoneNumber) {
      alert(getText('Veuillez entrer votre numero de telephone', 'Ampidiro ny laharana telefaoninao'));
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Erreur:', error);
      alert(getText('Erreur lors du traitement du don', 'Nisy hadisoana tamin\'ny fanodinana ny fanomezana'));
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { value: '12 450+', labelFr: 'Beneficiaires', labelMg: 'Tompondaka', icon: Users },
    { value: '50+', labelFr: 'Projets realises', labelMg: 'Tetikasa vita', icon: Target },
    { value: '15 780', labelFr: 'Arbres plantes', labelMg: 'Hazo nambolena', icon: Leaf },
    { value: '100%', labelFr: 'Transparence', labelMg: 'Fahamarinana', icon: Shield },
  ];

  // Style du fond d ecran PLEIN ECRAN
  const overlayStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 40) / 100})`,
  } : {};

  if (showSuccess) {
    return (
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 py-20">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-8 animate-fade-in-up">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-2xl animate-fade-in-up">
            {getText('Merci pour votre don', 'Misaotra tamin\'ny fanomezanao')}
          </h1>
          <p className="text-gray-600 mb-4">
            {getText(
              'Votre don de {amount} MGA a bien ete enregistre.',
              'Ny fanomezanao {amount} Ar dia voarakitra tsara.'
            ).replace('{amount}', getFinalAmount().toLocaleString())}
          </p>
          <p className="text-sm text-gray-500">
            {getText(
              'Vous allez recevoir un recu par email.',
              'Hahazo taratasy fanamarinana amin\'ny mailaka ianao.'
            )}
          </p>
          <div className="mt-6 w-16 h-1 bg-blue-500 rounded-full mx-auto animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ==================== HERO SECTION PLEIN ECRAN ==================== */}
      <section className="relative min-h-screen w-full overflow-hidden">
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

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 py-20">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-8 animate-fade-in-up">
            <Heart className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              {getText('Faire un don', 'Manome fanomezana')}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-2xl animate-fade-in-up">
            {getText('Soutenez notre mission', 'Hanohana ny asantsika')}
          </h1>
          
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto">
            {getText(
              'Chaque don contribue a construire un avenir meilleur pour la jeunesse malgache',
              'Ny fanomezana tsirairay dia manampy amin\'ny fananganana hoavy tsara kokoa ho an\'ny tanora malagasy'
            )}
          </p>
        </div>
      </section>

      {/* Section contenu avec fond blanc */}
      <div className="relative z-10 bg-white">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          
          {/* Statistiques d impact */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
              {getText('Votre impact en chiffres', 'Ny vokatry ny fanomezanao')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{stat.value}</p>
                    <p className="text-sm text-gray-600">{language === 'fr' ? stat.labelFr : stat.labelMg}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire de don */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {getText('Formulaire de don', 'Fanam-panomezana')}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Montant du don */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {getText('Montant du don', 'Volan\'ny fanomezana')} *
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                      {donationAmounts.map(amount => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => handleAmountSelect(amount)}
                          className={`py-2 px-3 rounded-lg border font-semibold transition ${
                            selectedAmount === amount
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-700 hover:border-blue-400'
                          }`}
                        >
                          {getDisplayAmount(amount)}
                        </button>
                      ))}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder={getText('Autre montant', 'Volo hafa')}
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Projet specifique */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getText('Projet specifique (optionnel)', 'Tetikasa manokana (tsy voatery)')}
                    </label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    >
                      <option value="">{getText('-- Don general --', '-- Fanomezana ankapobeny --')}</option>
                      {featuredProjects.map(project => (
                        <option key={project.id} value={project.id}>
                          {language === 'fr' ? project.title : project.title_mg}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Informations personnelles */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">
                      {getText('Vos informations', 'Ny momba anao')}
                    </h3>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {getText('Don anonyme', 'Fanomezana tsy misy anarana')}
                      </span>
                    </label>

                    {!isAnonymous && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {getText('Nom complet', 'Anarana feno')} *
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="Jean Rakoto"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="jean@email.com"
                          />
                        </div>
                      </div>
                    )}

                    {/* Moyen de paiement */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {getText('Moyen de paiement', 'Fomba fandoavam-bola')} *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('mvola')}
                          className={`p-3 rounded-xl border-2 transition flex items-center gap-2 justify-center ${
                            paymentMethod === 'mvola'
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Smartphone className="w-5 h-5 text-green-600" />
                          <span className="font-medium">MVola</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('orange_money')}
                          className={`p-3 rounded-xl border-2 transition flex items-center gap-2 justify-center ${
                            paymentMethod === 'orange_money'
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Smartphone className="w-5 h-5 text-orange-500" />
                          <span className="font-medium">Orange Money</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('airtel')}
                          className={`p-3 rounded-xl border-2 transition flex items-center gap-2 justify-center ${
                            paymentMethod === 'airtel'
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Smartphone className="w-5 h-5 text-red-600" />
                          <span className="font-medium">Airtel Money</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('bank')}
                          className={`p-3 rounded-xl border-2 transition flex items-center gap-2 justify-center ${
                            paymentMethod === 'bank'
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Building className="w-5 h-5 text-gray-600" />
                          <span className="font-medium">{getText('Virement', 'Fandefasana')}</span>
                        </button>
                      </div>
                    </div>

                    {(paymentMethod === 'mvola' || paymentMethod === 'orange_money' || paymentMethod === 'airtel') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {getText('Numero de telephone', 'Laharan-telefaonina')} *
                        </label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                          placeholder="034 00 000 00"
                        />
                      </div>
                    )}

                    {/* Don recurrence */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {getText('Don mensuel (abonnement)', 'Fanomezana isam-bolana (fisokafana)')}
                      </span>
                    </label>

                    {/* Message optionnel */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {getText('Message (optionnel)', 'Hafatra (tsy voatery)')}
                      </label>
                      <textarea
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder={getText('Votre message de soutien...', 'Ny hafatrao...')}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {getText('Traitement...', 'Fanodinana...')}
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5" />
                        {getText('Faire un don', 'Manome fanomezana')}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar d information */}
            <div className="space-y-6">
              {/* Pourquoi donner */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                <Gift className="w-12 h-12 mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">
                  {getText('Pourquoi donner ?', 'Maninona no manome?')}
                </h3>
                <p className="text-blue-100 text-sm mb-4">
                  {getText(
                    'Votre don contribue directement a l education, la sante et l autonomisation des jeunes malgaches.',
                    'Ny fanomezanao dia manampy mivantana amin\'ny fampianarana, ny fahasalamana ary ny fanomezana hery ny tanora malagasy.'
                  )}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>{getText('100% transparent', 'Mazava tanteraka')}</span>
                </div>
              </div>

              {/* Projets vedettes */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-4">
                  {getText('Projets a soutenir', 'Tetikasa azo hanohana')}
                </h3>
                <div className="space-y-4">
                  {featuredProjects.map(project => (
                    <Link 
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block p-3 rounded-xl hover:bg-gray-50 transition group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition">
                          {language === 'fr' ? project.title : project.title_mg}
                        </h4>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {language === 'fr' ? project.description : project.description_mg}
                      </p>
                      {project.progress && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>{getText('Progression', 'Fandrosoana')}</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 rounded-full h-1.5" 
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Transparence */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <Shield className="w-10 h-10 text-blue-600 mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">
                  {getText('Votre don est secure', 'Ny fanomezanao dia azo antoka')}
                </h3>
                <p className="text-sm text-gray-600">
                  {getText(
                    'Toutes les transactions sont securisees et vous recevrez un recu officiel par email.',
                    'Ny fifanakalozana rehetra dia azo antoka ary hahazo taratasy fanamarinana amin\'ny mailaka ianao.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}