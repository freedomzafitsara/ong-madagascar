'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Upload, FileText, User, Mail, Phone, 
  MapPin, Briefcase, Send, CheckCircle, AlertCircle, 
  Camera, X, Loader2, FileCheck, FileWarning, Building,
  Calendar, Clock, Heart, Star, GraduationCap
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { pageService, PageBackground } from '@/services/page.service';
import { jobService, JobOffer } from '@/services/job.service';

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
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  
  // Formulaire
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    experience: '',
    cover_letter: '',
  });
  
  // Fichiers
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [diplomaFile, setDiplomaFile] = useState<File | null>(null);
  const [attestationFile, setAttestationFile] = useState<File | null>(null);
  
  // Previews
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cvPreview, setCvPreview] = useState<string | null>(null);
  const [diplomaPreview, setDiplomaPreview] = useState<string | null>(null);
  const [attestationPreview, setAttestationPreview] = useState<string | null>(null);

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  useEffect(() => {
    if (jobId) {
      fetchJob();
      loadPageBackground();
    }
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [jobId]);

  // Chargement du fond d'écran depuis l'admin
  const loadPageBackground = async () => {
    try {
      const background = await pageService.getPageBackground('jobs');
      if (background && background.is_active && background.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error('Erreur chargement fond d ecran:', error);
    }
  };

  const fetchJob = async () => {
    try {
      const data = await jobService.getOfferById(jobId);
      setJob(data);
    } catch (error) {
      console.error('Erreur:', error);
      setError(getText('Offre d\'emploi non trouvée', 'Tsy hita ny asa'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError(getText('Le fichier ne doit pas dépasser 5 Mo', 'Tsy tokony ho mihoatra ny 5 Mo ny rakitra'));
      e.target.value = '';
      return;
    }
    
    if (type === 'photo' && !file.type.startsWith('image/')) {
      setError(getText('Le fichier doit être une image (JPG, PNG)', 'Ny rakitra dia tokony ho sary (JPG, PNG)'));
      e.target.value = '';
      return;
    }
    
    switch (type) {
      case 'photo':
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
        break;
      case 'cv':
        setCvFile(file);
        setCvPreview(file.name);
        break;
      case 'diploma':
        setDiplomaFile(file);
        setDiplomaPreview(file.name);
        break;
      case 'attestation':
        setAttestationFile(file);
        setAttestationPreview(file.name);
        break;
    }
    setError('');
  };

  const removeFile = (type: string) => {
    switch (type) {
      case 'photo':
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhotoFile(null);
        setPhotoPreview(null);
        break;
      case 'cv':
        setCvFile(null);
        setCvPreview(null);
        break;
      case 'diploma':
        setDiplomaFile(null);
        setDiplomaPreview(null);
        break;
      case 'attestation':
        setAttestationFile(null);
        setAttestationPreview(null);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    if (!formData.full_name.trim()) {
      setError(getText('Veuillez entrer votre nom complet', 'Ampidiro ny anaranao feno'));
      setSubmitting(false);
      return;
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError(getText('Veuillez entrer un email valide', 'Ampidiro ny adiresy mailaka marina'));
      setSubmitting(false);
      return;
    }
    
    if (!cvFile) {
      setError(getText('Veuillez uploader votre CV', 'Alefaso ny CV anao'));
      setSubmitting(false);
      return;
    }
    
    const formDataToSend = new FormData();
    formDataToSend.append('job_offer_id', jobId);
    formDataToSend.append('full_name', formData.full_name.trim());
    formDataToSend.append('email', formData.email.trim());
    formDataToSend.append('phone', formData.phone.trim());
    formDataToSend.append('address', formData.address.trim());
    formDataToSend.append('experience', formData.experience);
    formDataToSend.append('cover_letter', formData.cover_letter);
    
    if (photoFile) formDataToSend.append('photo', photoFile);
    if (cvFile) formDataToSend.append('cv', cvFile);
    if (diplomaFile) formDataToSend.append('diploma', diplomaFile);
    if (attestationFile) formDataToSend.append('attestation', attestationFile);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
      const response = await fetch(`${API_URL}/jobs/apply`, {
        method: 'POST',
        body: formDataToSend,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/jobs'), 3000);
      } else {
        setError(data.message || getText('Erreur lors de l\'envoi de votre candidature', 'Nisy hadisoana tamin\'ny fandefasana ny fangatahanao'));
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(getText('Erreur de connexion. Veuillez réessayer.', 'Nisy hadisoana tamin\'ny fifandraisana. Miezaka indray azafady.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Style fond d'écran PLEIN ÉCRAN
  const heroBackgroundStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundImage: `url(${pageBackground.image_url})`,
    backgroundPosition: pageBackground.position || 'center',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
  } : {};

  const heroOverlayStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 35) / 100})`,
  } : {};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{getText('Chargement...', 'Miandry...')}</p>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <Link href="/jobs" className="mt-4 inline-block text-blue-600 hover:underline">
            <ArrowLeft className="w-4 h-4 inline mr-1" /> {getText('Retour aux offres', 'Hiverina any amin\'ny asa')}
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {getText('Candidature envoyée', 'Vita ny fandefasana ny fangatahana')}
          </h2>
          <p className="text-gray-600 mb-4">
            {getText('Votre candidature pour', 'Ny fangatahanao ho an\'ny')} <strong>{job?.title_fr}</strong> {getText('a bien été enregistrée.', 'dia voarakitra tsara.')}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {getText(
              'Vous recevrez une confirmation par email dans les prochains jours.',
              'Hahazo fanamafisana amin\'ny mailaka ianao ao anatin\'ny andro vitsivitsy.'
            )}
          </p>
          <Link href="/jobs" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            {getText('Retour aux offres', 'Hiverina any amin\'ny asa')}
          </Link>
        </div>
      </div>
    );
  }

  const getContractIcon = () => {
    switch (job?.contract_type) {
      case 'CDI': return Star;
      case 'CDD': return Calendar;
      case 'STAGE': return GraduationCap;
      default: return Briefcase;
    }
  };
  const ContractIcon = getContractIcon();

  return (
    <div className="min-h-screen">
      {/* ==================== FOND D'ÉCRAN PLEIN ÉCRAN (ADMIN) ==================== */}
      {pageBackground?.image_url && (
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed" style={heroBackgroundStyle} />
          <div className="absolute inset-0" style={heroOverlayStyle} />
        </div>
      )}
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Lien retour */}
        <Link href="/jobs" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          {getText('Retour aux offres', 'Hiverina any amin\'ny asa')}
        </Link>

        {/* En-tête offre */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {getText('Candidature', 'Fangatahana')}
          </h1>
          <p className="text-gray-500 mt-1">
            {getText('Offre', 'Asa')} : <span className="font-semibold text-blue-600">{job?.title_fr}</span>
          </p>
          <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {job?.company || 'Y-MaD'}</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job?.location || 'Madagascar'}</span>
            <span className="flex items-center gap-1"><ContractIcon className="w-4 h-4" /> {job?.contract_type}</span>
            {job?.deadline && (
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> 
                {getText('Limite', 'Farany')} : {new Date(job.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Photo de profil */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              {getText('Photo de profil', 'Sarim-panjakana')}
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="Photo" className="w-24 h-24 rounded-full object-cover border-2 border-blue-500" />
                  <button type="button" onClick={() => removeFile('photo')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 transition">
                    <Camera className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">{getText('Photo', 'Sary')}</span>
                  </div>
                  <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={(e) => handleFileChange(e, 'photo')} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              {getText('Informations personnelles', 'Fampahalalana manokana')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{getText('Nom complet', 'Anarana feno')} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{getText('Téléphone', 'Telefaonina')}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{getText('Adresse', 'Adiresy')}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Expérience */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">{getText('Expérience professionnelle', 'Traza')}</h2>
            <textarea name="experience" value={formData.experience} onChange={handleInputChange} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder={getText('Décrivez votre parcours professionnel...', 'Lazao ny traza...')} />
          </div>

          {/* Documents */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">{getText('Documents', 'Rakitra')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition cursor-pointer">
                <input type="file" id="cv" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'cv')} className="hidden" />
                <label htmlFor="cv" className="cursor-pointer block">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">CV <span className="text-red-500">*</span></p>
                  {cvPreview && <p className="text-xs text-green-600 mt-2">{cvPreview}</p>}
                </label>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition cursor-pointer">
                <input type="file" id="diploma" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, 'diploma')} className="hidden" />
                <label htmlFor="diploma" className="cursor-pointer block">
                  <FileWarning className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">{getText('Diplôme', 'Diploma')}</p>
                  {diplomaPreview && <p className="text-xs text-green-600 mt-2">{diplomaPreview}</p>}
                </label>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition cursor-pointer">
                <input type="file" id="attestation" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, 'attestation')} className="hidden" />
                <label htmlFor="attestation" className="cursor-pointer block">
                  <FileCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">{getText('Attestation', 'Fanamarinana')}</p>
                  {attestationPreview && <p className="text-xs text-green-600 mt-2">{attestationPreview}</p>}
                </label>
              </div>
            </div>
          </div>

          {/* Lettre de motivation */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">{getText('Lettre de motivation', 'Taraty fanekena')}</h2>
            <textarea name="cover_letter" value={formData.cover_letter} onChange={handleInputChange} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder={getText('Pourquoi postulez-vous ?', 'Fa maninona no mangataka ?')} />
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md transition">
            {submitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {getText('Envoi en cours...', 'Fandefasana...')}</>
            ) : (
              <><Send className="w-5 h-5" /> {getText('Envoyer ma candidature', 'Alefaso ny fangatahana')}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}