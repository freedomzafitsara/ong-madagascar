'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Briefcase, MapPin, Calendar, Building, Clock, ArrowLeft, 
  Mail, Phone, Send, CheckCircle, AlertCircle, Loader2,
  FileText, Award, Globe, Users, Eye, TrendingUp, Printer,
  Share2, Bookmark
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { jobService, JobOffer, CreateJobApplicationDto } from '@/services/job.service';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [formData, setFormData] = useState<CreateJobApplicationDto>({
    job_offer_id: '',
    full_name: '',
    email: '',
    phone: '',
    address: '',
    experience: '',
    experience_years: 0,
    cover_letter: '',
    cv_url: ''
  });

  const t = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  useEffect(() => {
    if (params.id) {
      fetchJob();
    }
  }, [params.id]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const data = await jobService.getOfferById(params.id as string);
      setJob(data);
      setFormData(prev => ({ ...prev, job_offer_id: data.id }));
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(t('Offre non trouvée', 'Tsy hita ny asa'));
      router.push('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    try {
      await jobService.apply(formData);
      toast.success(t('Candidature envoyée avec succès !', 'Nalefa soa aman-tsara ny fangatahana!'));
      setShowApplicationForm(false);
      setFormData({
        job_offer_id: job?.id || '',
        full_name: '',
        email: '',
        phone: '',
        address: '',
        experience: '',
        experience_years: 0,
        cover_letter: '',
        cv_url: ''
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Erreur lors de l\'envoi', 'Nisy olana tamin\'ny fandefasana'));
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">{t('Offre non trouvée', 'Tsy hita ny asa')}</h2>
          <Link href="/jobs" className="mt-4 inline-block text-blue-600 hover:underline">
            {t('Retour aux offres', 'Hiverina any amin\'ny asa')}
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false;
  const title = language === 'fr' ? job.title_fr : (job.title_mg || job.title_fr);
  const description = language === 'fr' ? job.description_fr : (job.description_mg || job.description_fr);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
            <ArrowLeft className="w-4 h-4" /> {t('Retour aux offres', 'Hiverina any amin\'ny asa')}
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* En-tête de l'offre */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          {job.image_url && (
            <div className="relative h-64 w-full">
              <Image src={job.image_url} alt={title} fill className="object-cover" />
            </div>
          )}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
            
            <div className="flex flex-wrap gap-4 mb-6">
              {job.company && (
                <span className="flex items-center gap-2 text-gray-600">
                  <Building className="w-4 h-4" /> {job.company}
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" /> {job.location}
                </span>
              )}
              {job.contract_type && (
                <span className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-4 h-4" /> {job.contract_type}
                </span>
              )}
              {job.deadline && (
                <span className={`flex items-center gap-2 ${isExpired ? 'text-red-500' : 'text-gray-600'}`}>
                  <Calendar className="w-4 h-4" /> 
                  {t('Date limite:', 'Faritra:')} {new Date(job.deadline).toLocaleDateString()}
                </span>
              )}
            </div>

            {!isExpired && job.is_published && (
              <button
                onClick={() => setShowApplicationForm(true)}
                className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> {t('Postuler maintenant', 'Mangataka izao')}
              </button>
            )}
            
            {isExpired && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {t('Cette offre est expirée', 'Efa lany daty ity asa ity')}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('Description du poste', 'Famaritana ny asa')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br/>') }} />
        </div>

        {/* Formulaire de candidature */}
        {showApplicationForm && !isExpired && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">{t('Postuler à', 'Mangataka ho an\'ny')} {title}</h2>
                <button onClick={() => setShowApplicationForm(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Nom complet', 'Anarana feno')} *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('Téléphone', 'Telefaona')}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('Années d\'expérience', 'Taona fahaizana')}</label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years || 0}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('Lettre de motivation', 'Taratarasa')}</label>
                  <textarea
                    name="cover_letter"
                    rows={4}
                    value={formData.cover_letter}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('URL du CV (Google Drive, Dropbox...)', 'URL CV')}</label>
                  <input
                    type="url"
                    name="cv_url"
                    value={formData.cv_url}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    {t('Annuler', 'Aoka')}
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {applying ? t('Envoi...', 'Fandefasana...') : t('Envoyer', 'Alefa')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}