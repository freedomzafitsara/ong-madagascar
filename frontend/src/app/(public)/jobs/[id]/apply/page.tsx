'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, Upload, FileText, User, Mail, Phone, 
  MapPin, Briefcase, Send, CheckCircle, AlertCircle, 
  Camera, X, Loader2, FileCheck, FileWarning, Building,
  Calendar, Clock, Heart, Star, GraduationCap, Award,
  ChevronRight, Globe, Users, TrendingUp, Eye
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { jobService, JobOffer, CreateJobApplicationDto } from '@/services/job.service';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  experience: string;
  experience_years: number;
  cover_letter: string;
  cv_url: string;
  diploma_url: string;
  attestation_url: string;
  photo_url: string;
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function ApplyPage() {
  const { language } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Formulaire
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    experience: '',
    experience_years: 0,
    cover_letter: '',
    cv_url: '',
    diploma_url: '',
    attestation_url: '',
    photo_url: ''
  });

  const t = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const data = await jobService.getOfferById(jobId);
      setJob(data);
    } catch (error) {
      console.error('Erreur:', error);
      setError(t('Offre d\'emploi non trouvée', 'Tsy hita ny asa'));
      toast.error(t('Offre non trouvée', 'Tsy hita ny asa'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience_years' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    // Validation
    if (!formData.full_name.trim()) {
      setError(t('Veuillez entrer votre nom complet', 'Ampidiro ny anaranao feno'));
      setSubmitting(false);
      return;
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError(t('Veuillez entrer un email valide', 'Ampidiro ny adiresy mailaka marina'));
      setSubmitting(false);
      return;
    }
    
    if (!formData.cv_url.trim()) {
      setError(t('Veuillez fournir l\'URL de votre CV (Google Drive, Dropbox, etc.)', 'Alefaso ny URL CV anao'));
      setSubmitting(false);
      return;
    }
    
    const applicationData: CreateJobApplicationDto = {
      job_offer_id: jobId,
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      experience: formData.experience || undefined,
      experience_years: formData.experience_years || 0,
      cover_letter: formData.cover_letter || undefined,
      cv_url: formData.cv_url,
      diploma_url: formData.diploma_url || undefined,
      attestation_url: formData.attestation_url || undefined,
      photo_url: formData.photo_url || undefined
    };
    
    try {
      await jobService.apply(applicationData);
      setSuccess(true);
      toast.success(t('Candidature envoyée avec succès !', 'Vita soa aman-tsara ny fandefasana!'));
      setTimeout(() => router.push('/jobs'), 3000);
    } catch (err: any) {
      console.error('Erreur:', err);
      const errorMessage = err.response?.data?.message || t('Erreur lors de l\'envoi de votre candidature', 'Nisy hadisoana tamin\'ny fandefasana ny fangatahanao');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t('Chargement...', 'Miandry...')}</p>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <Link href="/jobs" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline">
            <ArrowLeft className="w-4 h-4" /> {t('Retour aux offres', 'Hiverina any amin\'ny asa')}
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t('Candidature envoyée !', 'Vita ny fandefasana ny fangatahana!')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('Votre candidature pour', 'Ny fangatahanao ho an\'ny')} <strong>{job?.title_fr}</strong> {t('a bien été enregistrée.', 'dia voarakitra tsara.')}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {t(
              'Vous recevrez une confirmation par email dans les prochains jours.',
              'Hahazo fanamafisana amin\'ny mailaka ianao ao anatin\'ny andro vitsivitsy.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/jobs" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              {t('Voir autres offres', 'Jereo asa hafa')}
            </Link>
            <Link href="/" className="inline-block border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
              {t('Accueil', 'Fandraisana')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = job?.deadline ? new Date(job.deadline) < new Date() : false;
  const title = language === 'fr' ? job?.title_fr : (job?.title_mg || job?.title_fr);

  const getContractColor = () => {
    switch (job?.contract_type) {
      case 'CDI': return 'bg-blue-100 text-blue-700';
      case 'CDD': return 'bg-cyan-100 text-cyan-700';
      case 'STAGE': return 'bg-green-100 text-green-700';
      case 'FREELANCE': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getContractIcon = () => {
    switch (job?.contract_type) {
      case 'CDI': return <Star className="w-4 h-4" />;
      case 'CDD': return <Calendar className="w-4 h-4" />;
      case 'STAGE': return <GraduationCap className="w-4 h-4" />;
      case 'FREELANCE': return <Briefcase className="w-4 h-4" />;
      default: return <Briefcase className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header avec fond */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t('Retour aux offres', 'Hiverina any amin\'ny asa')}
          </Link>
          
          <h1 className="text-3xl font-bold mb-2">{t('Candidature', 'Fangatahana')}</h1>
          <p className="text-blue-100">{t('Postulez en ligne facilement', 'Mangataka an-tserasera mora foana')}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Carte de l'offre */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-l-4 border-blue-500">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                {job?.company && (
                  <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {job.company}</span>
                )}
                {job?.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                )}
                {job?.contract_type && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getContractColor()}`}>
                    {getContractIcon()} {job.contract_type}
                  </span>
                )}
              </div>
            </div>
            {job?.applications_count !== undefined && (
              <div className="text-right text-sm text-gray-400">
                <Users className="w-4 h-4 inline mr-1" />
                {job.applications_count} {t('candidats', 'mpangataka')}
              </div>
            )}
          </div>
          
          {job?.deadline && (
            <div className={`mt-3 text-sm flex items-center gap-1 ${isExpired ? 'text-red-500' : 'text-gray-400'}`}>
              <Calendar className="w-4 h-4" />
              {t('Date limite', 'Farany')} : {new Date(job.deadline).toLocaleDateString()}
              {isExpired && <span className="ml-2 text-red-500">({t('Expirée', 'Lany daty')})</span>}
            </div>
          )}
        </div>

        {/* Formulaire de candidature */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md overflow-hidden">
          {error && (
            <div className="m-6 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Section Informations personnelles */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                {t('Informations personnelles', 'Fampahalalana manokana')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Nom complet', 'Anarana feno')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder={t('RAKOTO Jean', 'RAKOTO Jean')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="jean.rakoto@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Téléphone', 'Telefaonina')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="+261 34 12 345 67"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Adresse', 'Adiresy')}
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder={t('Antananarivo, Madagascar', 'Antananarivo, Madagasikara')}
                  />
                </div>
              </div>
            </div>

            {/* Section Expérience */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                {t('Expérience professionnelle', 'Traza')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Années d\'expérience', 'Taona fahaizana')}
                  </label>
                  <select
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="0">0 - {t('Débutant', 'Vao manomboka')}</option>
                    <option value="1">1 {t('an', 'taona')}</option>
                    <option value="2">2 {t('ans', 'taona')}</option>
                    <option value="3">3 {t('ans', 'taona')}</option>
                    <option value="4">4 {t('ans', 'taona')}</option>
                    <option value="5">5 {t('ans', 'taona')}</option>
                    <option value="6">6 {t('ans', 'taona')}</option>
                    <option value="7">7 {t('ans', 'taona')}</option>
                    <option value="8">8 {t('ans', 'taona')}</option>
                    <option value="9">9 {t('ans', 'taona')}</option>
                    <option value="10">10+ {t('ans', 'taona')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Description de votre parcours', 'Lazao ny trazao')}
                  </label>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder={t('Décrivez vos expériences, compétences et réalisations...', 'Lazao ny trazao, fahaizanao, ary zavatra vitanao...')}
                  />
                </div>
              </div>
            </div>

            {/* Section Documents (URLs) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {t('Documents', 'Rakitra')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('CV (URL Google Drive, Dropbox, etc.)', 'CV (URL Google Drive, Dropbox, ...)')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      name="cv_url"
                      value={formData.cv_url}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('Partagez un lien vers votre CV (Google Drive, Dropbox, OneDrive)', 'Zarao ny rohy mankany amin\'ny CV anao (Google Drive, Dropbox, OneDrive)')}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Diplôme (URL)', 'Diploma (URL)')}
                  </label>
                  <input
                    type="url"
                    name="diploma_url"
                    value={formData.diploma_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Attestation de travail (URL)', 'Fanamarinana asa (URL)')}
                  </label>
                  <input
                    type="url"
                    name="attestation_url"
                    value={formData.attestation_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Photo (URL)', 'Sary (URL)')}
                  </label>
                  <input
                    type="url"
                    name="photo_url"
                    value={formData.photo_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Section Lettre de motivation */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                {t('Lettre de motivation', 'Taraty fanekena')}
              </h3>
              <textarea
                name="cover_letter"
                value={formData.cover_letter}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder={t(
                  'Pourquoi postulez-vous ? Qu\'est-ce qui vous motive à rejoindre notre équipe ?',
                  'Fa maninona no mangataka? Inona no manosika anao hanatevin-daharana ny ekipanay?'
                )}
              />
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('Envoi en cours...', 'Fandefasana...')}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {t('Envoyer ma candidature', 'Alefaso ny fangatahana')}
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center">
              {t(
                'En soumettant ce formulaire, vous acceptez que vos données soient utilisées pour le traitement de votre candidature.',
                'Amin\'ny fandefasana ity formulaire ity, ianao dia manaiky ny fampiasana ny angonao amin\'ny fanodinana ny fangatahanao.'
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}