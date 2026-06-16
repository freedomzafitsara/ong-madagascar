// frontend/src/app/(public)/jobs/[id]/page.tsx

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Briefcase, MapPin, Calendar, Building, Clock, ArrowLeft, 
  Mail, Phone, Send, CheckCircle, AlertCircle, Loader2,
  FileText, Award, Globe, Users, Eye, TrendingUp, Printer,
  Share2, Bookmark, X, Upload, Trash2, User, Linkedin, 
  Globe as GlobeIcon, Camera, Info, Check, FileCheck,
  Bold, Italic, Underline, List, ListOrdered, AlignLeft,
  AlignCenter, AlignRight, Link as LinkIcon, Code
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { jobService, JobOffer, CreateJobApplicationDto, JobStatus } from '@/services/job.service';
import { uploadService, UploadedFile } from '@/services/upload.service';
import toast from 'react-hot-toast';

// ============================================================
// CONFIGURATION DE L'EDITEUR QUILL
// ============================================================

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean']
  ],
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'list', 'bullet', 'check',
  'indent', 'align', 'blockquote', 'code-block',
  'link', 'image'
];

// ============================================================
// INTERFACES
// ============================================================

interface ApplicationFormData {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  experience_years: number;
  current_position: string;
  current_company: string;
  cover_letter: string;
  linkedin_url: string;
  portfolio_url: string;
}

interface FileUploadState {
  file: UploadedFile | null;
  uploading: boolean;
  error: string;
}

// ============================================================
// CONSTANTES
// ============================================================

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

// Validation téléphone Madagascar
const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return true;
  const cleanPhone = phone.replace(/\s/g, '');
  const phoneRegex = /^(?:\+261|0)(?:32|33|34|37|38)\d{7}$/;
  return phoneRegex.test(cleanPhone);
};

const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const clean = phone.replace(/\s/g, '');
  if (clean.length === 12 && clean.startsWith('+261')) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 6)} ${clean.slice(6, 8)} ${clean.slice(8, 11)} ${clean.slice(11)}`;
  }
  if (clean.length === 10 && clean.startsWith('0')) {
    return `${clean.slice(0, 3)} ${clean.slice(3, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`;
  }
  return phone;
};

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const jobId = params?.id as string;
  
  // État de l'offre
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // État du formulaire
  const [applying, setApplying] = useState<boolean>(false);
  const [showApplicationForm, setShowApplicationForm] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // État des fichiers uploadés
  const [cvState, setCvState] = useState<FileUploadState>({
    file: null,
    uploading: false,
    error: ''
  });
  const [coverLetterState, setCoverLetterState] = useState<FileUploadState>({
    file: null,
    uploading: false,
    error: ''
  });
  const [photoState, setPhotoState] = useState<FileUploadState>({
    file: null,
    uploading: false,
    error: ''
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // Données du formulaire
  const [formData, setFormData] = useState<ApplicationFormData>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    experience_years: 0,
    current_position: '',
    current_company: '',
    cover_letter: '',
    linkedin_url: '',
    portfolio_url: ''
  });

  // Références
  const cvInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const getText = useCallback((fr: string, mg: string): string => {
    return language === 'fr' ? fr : mg;
  }, [language]);

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // ============================================================
  // CHARGEMENT DE L'OFFRE
  // ============================================================

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const fetchJob = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await jobService.getOfferById(jobId);
      
      // Vérifier que l'offre est publiée et disponible
      if (data.status !== JobStatus.PUBLISHED || !data.is_published) {
        toast.error(getText('Cette offre n\'est pas disponible', 'Tsy misy ity asa ity'));
        router.push('/jobs');
        return;
      }
      
      setJob(data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'offre:', error);
      toast.error(getText('Offre non trouvee', 'Tsy hita ny asa'));
      router.push('/jobs');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // GESTION DU FORMULAIRE
  // ============================================================

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const rawValue = e.target.value;
    const formatted = formatPhoneNumber(rawValue);
    setFormData(prev => ({ ...prev, phone: formatted }));
    
    if (rawValue && !validatePhoneNumber(rawValue)) {
      setPhoneError(getText(
        'Format invalide. Utilisez +261 XX XXX XX',
        'Tsy mety ny format. Mampiasa +261 XX XXX XX'
      ));
    } else {
      setPhoneError('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCoverLetterChange = (value: string): void => {
    setFormData(prev => ({ ...prev, cover_letter: value }));
  };

  // ============================================================
  // GESTION DES FICHIERS
  // ============================================================

  const handleFileUpload = async (
    file: File,
    type: string,
    setState: React.Dispatch<React.SetStateAction<FileUploadState>>
  ): Promise<string | null> => {
    setState(prev => ({ ...prev, uploading: true, error: '' }));
    
    try {
      const result = await uploadService.uploadImage(file, type as any, jobId);
      setState(prev => ({ ...prev, file: result, uploading: false, error: '' }));
      return result.url || uploadService.getImageUrl(result.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setState(prev => ({ ...prev, file: null, uploading: false, error: errorMessage }));
      toast.error(errorMessage);
      return null;
    }
  };

  const handleCvChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setCvState(prev => ({ ...prev, error: getText('Seuls les fichiers PDF sont acceptes', 'Ny rakitra PDF ihany no ekena') }));
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setCvState(prev => ({ ...prev, error: getText('Fichier trop grand (max 100 Mo)', 'Lehibe loatra ny rakitra (farany 100 Mo)') }));
      return;
    }
    
    setCvState(prev => ({ ...prev, error: '' }));
    await handleFileUpload(file, 'cv', setCvState);
  };

  const handleCoverLetterFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setCoverLetterState(prev => ({ ...prev, error: getText('Seuls les fichiers PDF sont acceptes', 'Ny rakitra PDF ihany no ekena') }));
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setCoverLetterState(prev => ({ ...prev, error: getText('Fichier trop grand (max 100 Mo)', 'Lehibe loatra ny rakitra (farany 100 Mo)') }));
      return;
    }
    
    setCoverLetterState(prev => ({ ...prev, error: '' }));
    await handleFileUpload(file, 'cover_letter', setCoverLetterState);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoState(prev => ({ ...prev, error: getText('Formats acceptes: JPG, PNG, WEBP', 'Endrika azo: JPG, PNG, WEBP') }));
      return;
    }
    
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoState(prev => ({ ...prev, error: getText('Photo trop grande (max 5 Mo)', 'Lehibe loatra ny sary (farany 5 Mo)') }));
      return;
    }
    
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoState(prev => ({ ...prev, error: '' }));
    await handleFileUpload(file, 'profile', setPhotoState);
  };

  const removeCv = (): void => {
    setCvState({ file: null, uploading: false, error: '' });
    if (cvInputRef.current) cvInputRef.current.value = '';
  };

  const removeCoverLetterFile = (): void => {
    setCoverLetterState({ file: null, uploading: false, error: '' });
    if (coverLetterInputRef.current) coverLetterInputRef.current.value = '';
  };

  const removePhoto = (): void => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoState({ file: null, uploading: false, error: '' });
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  // ============================================================
  // VALIDATION ET SOUMISSION
  // ============================================================

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.full_name.trim()) {
      errors.full_name = getText('Le nom complet est requis', 'Ilaina ny anarana feno');
    }
    
    if (!validateEmail(formData.email)) {
      errors.email = getText('Email invalide', 'Tsy mety ny email');
    }
    
    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      errors.phone = getText('Numero de telephone invalide', 'Tsy mety ny laharana');
    }
    
    if (!cvState.file) {
      errors.cv = getText('CV requis (PDF)', 'Ilaina ny CV (PDF)');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(getText('Veuillez corriger les erreurs', 'Ahitsio ny hadisoana'));
      return;
    }
    
    setApplying(true);
    
    try {
      const cleanPhone = formData.phone ? formData.phone.replace(/\s/g, '') : undefined;
      
      const applicationData: CreateJobApplicationDto = {
        job_offer_id: jobId,
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: cleanPhone,
        address: formData.address?.trim() || undefined,
        experience_years: formData.experience_years || 0,
        current_position: formData.current_position?.trim() || undefined,
        current_company: formData.current_company?.trim() || undefined,
        cv_url: cvState.file?.url || uploadService.getImageUrl(cvState.file?.id || ''),
        cover_letter: formData.cover_letter?.trim() || undefined,
        cover_letter_url: coverLetterState.file?.url || uploadService.getImageUrl(coverLetterState.file?.id || ''),
        photo_url: photoState.file?.url || uploadService.getImageUrl(photoState.file?.id || ''),
        linkedin_url: formData.linkedin_url?.trim() || undefined,
        portfolio_url: formData.portfolio_url?.trim() || undefined,
      };
      
      await jobService.apply(applicationData);
      toast.success(getText('Candidature envoyee avec succes !', 'Vita soa aman-tsara ny fandefasana!'));
      setShowApplicationForm(false);
      resetForm();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || getText('Erreur lors de l\'envoi', 'Nisy olana tamin\'ny fandefasana');
      toast.error(errorMessage);
    } finally {
      setApplying(false);
    }
  };

  const resetForm = (): void => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      address: '',
      experience_years: 0,
      current_position: '',
      current_company: '',
      cover_letter: '',
      linkedin_url: '',
      portfolio_url: ''
    });
    setPhoneError('');
    setFormErrors({});
    removeCv();
    removeCoverLetterFile();
    removePhoto();
  };

  // ============================================================
  // RENDU
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">{getText('Offre non trouvee', 'Tsy hita ny asa')}</h2>
          <Link href="/jobs" className="mt-4 inline-block text-blue-800 hover:underline">
            {getText('Retour aux offres', 'Hiverina any amin\'ny asa')}
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false;
  const isAvailable = job.status === JobStatus.PUBLISHED && job.is_published && !isExpired;
  
  const title = language === 'fr' ? job.title_fr : (job.title_mg || job.title_fr);
  const description = language === 'fr' ? job.description_fr : (job.description_mg || job.description_fr);
  const imageUrl = job.image_url;

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* ============================================================
      EN-TÊTE - RETOUR
      ============================================================ */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-800 transition">
            <ArrowLeft className="w-4 h-4" /> {getText('Retour aux offres', 'Hiverina any amin\'ny asa')}
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* ============================================================
        CARTE DE L'OFFRE
        ============================================================ */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          
          {/* Image de couverture */}
          {imageUrl && (
            <div className="relative h-72 w-full bg-gradient-to-r from-blue-800 to-blue-900">
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}
          
          {/* Contenu de la carte */}
          <div className="p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{title}</h1>
            
            {/* Informations clés */}
            <div className="flex flex-wrap gap-4 mb-6">
              {job.company && (
                <span className="flex items-center gap-2 text-gray-600 text-sm bg-gray-100 px-3 py-1.5 rounded-full">
                  <Building className="w-4 h-4" /> {job.company}
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-2 text-gray-600 text-sm bg-gray-100 px-3 py-1.5 rounded-full">
                  <MapPin className="w-4 h-4" /> {job.location}
                </span>
              )}
              {job.contract_type && (
                <span className="flex items-center gap-2 text-sm bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full">
                  <Briefcase className="w-4 h-4" /> {job.contract_type}
                </span>
              )}
              {job.deadline && (
                <span className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full ${isExpired ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-800'}`}>
                  <Calendar className="w-4 h-4" /> 
                  {getText('Date limite:', 'Farany:')} {new Date(job.deadline).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>

            {/* Bouton postuler */}
            {isAvailable ? (
              <button
                onClick={() => setShowApplicationForm(true)}
                className="w-full md:w-auto bg-blue-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-900 transition flex items-center justify-center gap-2 shadow-md"
              >
                <Send className="w-5 h-5" /> {getText('Postuler maintenant', 'Mangataka izao')}
              </button>
            ) : (
              <div className="bg-gray-100 text-gray-600 p-4 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {isExpired 
                  ? getText('Cette offre est expiree', 'Efa lany daty ity asa ity')
                  : getText('Cette offre n\'est plus disponible', 'Tsy misy intsony ity asa ity')}
              </div>
            )}
          </div>
        </div>

        {/* ============================================================
        DESCRIPTION DU POSTE
        ============================================================ */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-800" />
            {getText('Description du poste', 'Famaritana ny asa')}
          </h2>
          <div className="prose max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
            {description}
          </div>
        </div>

        {/* ============================================================
        FORMULAIRE DE CANDIDATURE (MODAL)
        ============================================================ */}
        {showApplicationForm && isAvailable && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowApplicationForm(false)}>
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              
              {/* En-tête du modal */}
              <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{getText('Candidature', 'Fangatahana')}</h2>
                  <p className="text-sm text-gray-500">{title}</p>
                </div>
                <button 
                  onClick={() => setShowApplicationForm(false)} 
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Formulaire */}
              <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-6">
                
                {/* Photo de profil */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-800" />
                    {getText('Photo de profil', 'Sary momba anao')}
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-gray-400" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-1.5 bg-blue-800 text-white rounded-full hover:bg-blue-900 transition shadow-md"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">
                        {getText('Photo de profil (optionnelle)', 'Sary momba anao (tsy voatery)')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {getText('Formats: JPG, PNG, WEBP. Max 5 Mo', 'Endrika: JPG, PNG, WEBP. Farany 5 Mo')}
                      </p>
                      {photoState.file && (
                        <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                          <Check className="w-4 h-4" />
                          <span>{getText('Photo uploadee', 'Nahomana ny fampidirana sary')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {photoState.error && <p className="text-xs text-red-500 mt-2">{photoState.error}</p>}
                </div>

                {/* Informations personnelles */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-800" />
                    {getText('Informations personnelles', 'Fampahalalana manokana')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {getText('Nom complet', 'Anarana feno')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        required
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-800 outline-none transition ${
                          formErrors.full_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={getText('Votre nom complet', 'Anaranao feno')}
                      />
                      {formErrors.full_name && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.full_name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-800 outline-none transition ${
                          formErrors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="votre@email.com"
                      />
                      {formErrors.email && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {getText('Telephone', 'Telefaonina')}
                      </label>
                      <div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-800 outline-none transition ${
                            phoneError || formErrors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="+261 XX XXX XX"
                        />
                        {(phoneError || formErrors.phone) && (
                          <p className="text-xs text-red-500 mt-1">{phoneError || formErrors.phone}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {getText('Format: +261 XX XXX XX', 'Format: +261 XX XXX XX')}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {getText('Adresse', 'Adiresy')}
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none transition"
                        placeholder={getText('Antananarivo, Madagascar', 'Antananarivo, Madagasikara')}
                      />
                    </div>
                  </div>
                </div>

                {/* Expérience professionnelle */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-800" />
                    {getText('Experience professionnelle', 'Traza')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {getText('Annees d\'experience', 'Taona fahaizana')}
                      </label>
                      <select
                        name="experience_years"
                        value={formData.experience_years}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none bg-white"
                      >
                        <option value="0">0 - {getText('Debutant', 'Vao manomboka')}</option>
                        <option value="1">1 {getText('an', 'taona')}</option>
                        <option value="2">2 {getText('ans', 'taona')}</option>
                        <option value="3">3 {getText('ans', 'taona')}</option>
                        <option value="5">5 {getText('ans', 'taona')}</option>
                        <option value="10">10+ {getText('ans', 'taona')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {getText('Poste actuel', 'Toerana misy anao')}
                      </label>
                      <input
                        type="text"
                        name="current_position"
                        value={formData.current_position}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none transition"
                        placeholder={getText('Developpeur Web', 'Mpamorona tranokala')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {getText('Entreprise actuelle', 'Orinasa misy anao')}
                      </label>
                      <input
                        type="text"
                        name="current_company"
                        value={formData.current_company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none transition"
                        placeholder={getText('Tech Company', 'Orinasa teknolojia')}
                      />
                    </div>
                  </div>
                </div>

                {/* CV Upload */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-800" />
                    {getText('Curriculum Vitae (CV)', 'Curriculum Vitae (CV)')} <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-400 ml-2">(PDF max 100 Mo)</span>
                  </h3>
                  
                  {cvState.file ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileCheck className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-800">{cvState.file.fileName}</p>
                          <p className="text-xs text-gray-500">
                            PDF - {(cvState.file.fileSize / 1024 / 1024).toFixed(2)} Mo
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={removeCv} className="text-red-500 hover:text-red-700 p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => cvInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                        cvState.error || formErrors.cv ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <input
                        ref={cvInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleCvChange}
                        className="hidden"
                      />
                      {cvState.uploading ? (
                        <Loader2 className="w-10 h-10 text-blue-800 animate-spin mx-auto mb-2" />
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {getText('Cliquez pour uploader votre CV', 'Tsindrio raha handefa ny CV anao')}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {getText('Format PDF uniquement, max 100 Mo', 'Endrika PDF ihany, farany 100 Mo')}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                  {(cvState.error || formErrors.cv) && (
                    <p className="text-xs text-red-500 mt-2">{cvState.error || formErrors.cv}</p>
                  )}
                </div>

                {/* Lettre de motivation */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-800" />
                    {getText('Lettre de motivation', 'Taraty fanekena')}
                  </h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getText('Redigez votre lettre', 'Soraty ny taratasy')}
                    </label>
                    <div className="quill-editor">
                      <ReactQuill
                        theme="snow"
                        value={formData.cover_letter}
                        onChange={handleCoverLetterChange}
                        modules={QUILL_MODULES}
                        formats={QUILL_FORMATS}
                        placeholder={getText(
                          'Pourquoi postulez-vous ? Qu\'est-ce qui vous motive ?',
                          'Fa maninona no mangataka? Inona no manosika anao?'
                        )}
                        className="bg-white"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">{getText('Ou uploader un fichier PDF', 'Na alefaso ny rakitra PDF')}</p>
                    <div
                      onClick={() => coverLetterInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                    >
                      <input
                        ref={coverLetterInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleCoverLetterFileChange}
                        className="hidden"
                      />
                      {coverLetterState.uploading ? (
                        <Loader2 className="w-8 h-8 text-blue-800 animate-spin mx-auto" />
                      ) : coverLetterState.file ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <FileCheck className="w-5 h-5" />
                          <span className="text-sm">{coverLetterState.file.fileName}</span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({(coverLetterState.file.fileSize / 1024 / 1024).toFixed(2)} Mo)
                          </span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeCoverLetterFile(); }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">{getText('PDF max 100 Mo', 'PDF farany 100 Mo')}</p>
                        </>
                      )}
                    </div>
                  </div>
                  {coverLetterState.error && <p className="text-xs text-red-500 mt-2">{coverLetterState.error}</p>}
                </div>

                {/* Liens professionnels */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <GlobeIcon className="w-5 h-5 text-blue-800" />
                    {getText('Liens professionnels', 'Rohy momba ny asa')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        LinkedIn
                      </label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="url"
                          name="linkedin_url"
                          value={formData.linkedin_url}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none transition"
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {getText('Portfolio / Site web', 'Portfolio / Tranokala')}
                      </label>
                      <div className="relative">
                        <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="url"
                          name="portfolio_url"
                          value={formData.portfolio_url}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none transition"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition font-medium"
                  >
                    {getText('Annuler', 'Aoka')}
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="flex-1 bg-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                  >
                    {applying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {applying ? getText('Envoi...', 'Fandefasana...') : getText('Envoyer ma candidature', 'Alefaso ny fangatahana')}
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  {getText(
                    'En soumettant ce formulaire, vous acceptez que vos donnees soient utilisees pour le traitement de votre candidature.',
                    'Amin\'ny fandefasana ity formulaire ity, ianao dia manaiky ny fampiasana ny angonao amin\'ny fanodinana ny fangatahanao.'
                  )}
                </p>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Styles de l'éditeur Quill */}
      <style jsx global>{`
        .quill-editor .ql-container {
          min-height: 250px;
          font-size: 14px;
        }
        .quill-editor .ql-editor {
          min-height: 250px;
        }
        .quill-editor .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          border-color: #e5e7eb;
          background-color: #f9fafb;
        }
        .quill-editor .ql-container {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          border-color: #e5e7eb;
        }
        .quill-editor .ql-editor p {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}