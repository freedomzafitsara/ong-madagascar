'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { jobsApi, uploadApi } from '@/lib/api';
import { 
  ArrowLeft, Send, User, Mail, Phone, MapPin, 
  Briefcase, FileText, Upload, CheckCircle, AlertCircle,
  Loader2, Building, Calendar, Award, X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface JobOffer {
  id: string;
  title: string;
  title_mg?: string;
  description: string;
  company_name: string;
  location?: string;
  region?: string;
  job_type: string;
  deadline?: string;
  is_featured: boolean;
}

type FileField = 'cv' | 'photo' | 'diploma' | 'attestation';

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, token } = useAuth();
  const { language } = useLanguage();
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    experience_years: '',
    cover_letter: '',
  });

  const [files, setFiles] = useState<Record<FileField, File | null>>({
    cv: null,
    photo: null,
    diploma: null,
    attestation: null,
  });

  const [fileNames, setFileNames] = useState<Record<FileField, string>>({
    cv: '',
    photo: '',
    diploma: '',
    attestation: '',
  });

  useEffect(() => {
    fetchJob();
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        full_name: `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim(),
        email: (user as any).email || '',
        phone: (user as any).phone || '',
      }));
    }
  }, [params.id, isAuthenticated, user]);

  const fetchJob = async () => {
    try {
      const data = await jobsApi.getOne(params.id as string);
      setJob(data);
    } catch (error: any) {
      console.error('Erreur:', error);
      setError(error.message || 'Offre non trouvée');
      toast.error(error.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: FileField) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation du type selon le champ
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validDocumentTypes = ['application/pdf'];
    
    if (field === 'photo') {
      if (!validImageTypes.includes(file.type)) {
        toast.error('Format non supporté pour la photo. Utilisez JPG, PNG ou WEBP.');
        return;
      }
    } else {
      if (!validDocumentTypes.includes(file.type)) {
        toast.error('Format non supporté. Utilisez PDF.');
        return;
      }
    }

    // Validation de la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 5MB)');
      return;
    }

    setFiles(prev => ({ ...prev, [field]: file }));
    setFileNames(prev => ({ ...prev, [field]: file.name }));
  };

  const removeFile = (field: FileField) => {
    setFiles(prev => ({ ...prev, [field]: null }));
    setFileNames(prev => ({ ...prev, [field]: '' }));
  };

  const uploadFile = async (file: File, type: string): Promise<string | null> => {
    try {
      return await uploadApi.uploadImage(file);
    } catch (error) {
      console.error(`Erreur upload ${type}:`, error);
      toast.error(`Erreur lors de l'upload du ${type}`);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setUploadProgress(true);

    if (!formData.full_name.trim()) {
      setError('Veuillez entrer votre nom complet');
      setSubmitting(false);
      setUploadProgress(false);
      return;
    }
    if (!formData.email.trim()) {
      setError('Veuillez entrer votre email');
      setSubmitting(false);
      setUploadProgress(false);
      return;
    }
    if (!files.cv) {
      setError('Veuillez télécharger votre CV');
      setSubmitting(false);
      setUploadProgress(false);
      return;
    }

    try {
      toast.loading('Upload des fichiers...', { id: 'upload' });
      
      const cvUrl = await uploadFile(files.cv, 'CV');
      if (!cvUrl) throw new Error('L\'upload du CV a échoué');
      
      const photoUrl = files.photo ? await uploadFile(files.photo, 'photo') : null;
      const diplomaUrl = files.diploma ? await uploadFile(files.diploma, 'diploma') : null;
      const attestationUrl = files.attestation ? await uploadFile(files.attestation, 'attestation') : null;
      
      toast.success('Fichiers uploadés avec succès', { id: 'upload' });

      const applicationData = {
        job_offer_id: params.id as string,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : undefined,
        cover_letter: formData.cover_letter || undefined,
        cv_url: cvUrl,
        photo_url: photoUrl || undefined,
        diploma_url: diplomaUrl || undefined,
        attestation_url: attestationUrl || undefined,
      };

      const formDataToSend = new FormData();
      Object.entries(applicationData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value.toString());
      });

      if (isAuthenticated && token) {
        await jobsApi.applyAuth(formDataToSend);
      } else {
        await jobsApi.apply(formDataToSend);
      }
      
      setSuccess(true);
      toast.success('Candidature envoyée avec succès !');
      setTimeout(() => {
        router.push('/emploi');
      }, 3000);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'envoi');
      toast.error(err.message || 'Erreur lors de l\'envoi de la candidature');
    } finally {
      setSubmitting(false);
      setUploadProgress(false);
    }
  };

  const getText = (frText: string, mgText: string) => {
    return language === 'fr' ? frText : mgText;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <Link href="/emploi" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline">
            <ArrowLeft className="w-4 h-4" /> {getText("Retour aux offres", "Miverina any amin'ny asa")}
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {getText("Candidature envoyée !", "Voaefa ny fangatahana !")}
          </h2>
          <p className="text-gray-600 mb-4">
            {getText("Merci pour votre candidature. Nous l'examinerons dans les plus brefs délais.",
                      "Misaotra tamin'ny fangatahanao. Hodinihinay izany tsy ho ela.")}
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-gray-500 mb-2">{getText("Récapitulatif", "Famintinana")}</p>
            <p className="text-sm text-gray-700"><span className="font-medium">Email:</span> {formData.email}</p>
            <p className="text-sm text-gray-700 mt-1"><span className="font-medium">{getText("CV", "CV")}:</span> {fileNames.cv}</p>
          </div>
          <Link href="/emploi" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline">
            <ArrowLeft className="w-4 h-4" /> {getText("Retour aux offres", "Miverina any amin'ny asa")}
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = job?.deadline && new Date(job.deadline) < new Date();

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {getText("Offre expirée", "Lany ny asa")}
          </h2>
          <p className="text-gray-600 mb-6">
            {getText("La date limite de candidature pour cette offre est dépassée.",
                      "Efa lany ny andro farany hanaovana fangatahana amin'ity asa ity.")}
          </p>
          <Link href="/emploi" className="text-blue-600 font-semibold hover:underline">
            {getText("Voir les autres offres", "Jereo ny asa hafa")}
          </Link>
        </div>
      </div>
    );
  }

  const title = language === 'fr' ? job?.title : job?.title_mg || job?.title;

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* En-tête */}
        <div className="mb-6 md:mb-8">
          <Link href={`/emploi/${params.id}`} className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 transition mb-3 md:mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> {getText("Retour à l'offre", "Miverina any amin'ny asa")}
          </Link>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h1>
                <div className="flex flex-wrap gap-3 md:gap-4 mt-2">
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Building className="w-4 h-4" /> {job?.company_name}
                  </span>
                  {job?.location && (
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" /> {job.location}
                    </span>
                  )}
                  {job?.deadline && (
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" /> 
                      {getText("Limite", "Farany")}: {new Date(job.deadline).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>
              {job?.is_featured && (
                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  <Award className="w-3 h-3" /> {getText("À la une", "Manokana")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200 bg-blue-50">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">
              {getText("Formulaire de candidature", "Fangatahana asa")}
            </h2>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              {getText("Tous les champs marqués d'un * sont obligatoires", "Ny sehatra misy * dia tsy maintsy fenoina")}
            </p>
          </div>

          {error && (
            <div className="m-4 md:m-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-medium text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> 
                {getText("Informations personnelles", "Fampahalalana manokana")}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText("Nom complet", "Anarana feno")} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder={getText("Jean RAKOTO", "Jean RAKOTO")}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="jean@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText("Téléphone", "Telefaonina")}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="032 12 345 67"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText("Années d'expérience", "Taona fahaizana")}
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText("Adresse", "Adiresy")} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder={getText("Votre adresse complète", "Adiresinao feno")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-medium text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> 
                {getText("Documents", "Antontan-taratasy")}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUploadField
                  label={getText("CV", "CV")}
                  required
                  file={files.cv}
                  fileName={fileNames.cv}
                  onFileChange={(e) => handleFileChange(e, 'cv')}
                  onRemove={() => removeFile('cv')}
                  accept=".pdf"
                />
                
                <FileUploadField
                  label={getText("Photo de profil", "Sarin'ny tena")}
                  file={files.photo}
                  fileName={fileNames.photo}
                  onFileChange={(e) => handleFileChange(e, 'photo')}
                  onRemove={() => removeFile('photo')}
                  accept="image/jpeg,image/png,image/webp"
                />
                
                <FileUploadField
                  label={getText("Diplôme", "Diploma")}
                  file={files.diploma}
                  fileName={fileNames.diploma}
                  onFileChange={(e) => handleFileChange(e, 'diploma')}
                  onRemove={() => removeFile('diploma')}
                  accept=".pdf"
                />
                
                <FileUploadField
                  label={getText("Attestation", "Fanamarinana")}
                  file={files.attestation}
                  fileName={fileNames.attestation}
                  onFileChange={(e) => handleFileChange(e, 'attestation')}
                  onRemove={() => removeFile('attestation')}
                  accept=".pdf"
                />
              </div>
            </div>

            {/* Lettre de motivation */}
            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-medium text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> 
                {getText("Lettre de motivation", "Taratra fangatahana asa")}
              </h3>
              <textarea
                rows={5}
                value={formData.cover_letter}
                onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
                placeholder={getText(
                  "Expliquez pourquoi vous êtes le candidat idéal...",
                  "Hazavao ny antony maha-izao anao ny kandidà mety..."
                )}
              />
            </div>

            {/* Bouton d'envoi */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting || uploadProgress}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting || uploadProgress ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {getText("Envoi en cours...", "Fandefasana...")}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {getText("Envoyer ma candidature", "Alefaso ny fangatahana")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Composant d'upload de fichier
function FileUploadField({ 
  label, 
  required, 
  file, 
  fileName, 
  onFileChange, 
  onRemove, 
  accept 
}: { 
  label: string; 
  required?: boolean; 
  file: File | null; 
  fileName: string; 
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  onRemove: () => void; 
  accept: string;
}) {
  const inputId = `file-${label.replace(/\s/g, '-')}`;
  
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {file ? (
        <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600 truncate max-w-[150px]">{fileName}</span>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full cursor-pointer">
          <div className="w-full flex flex-col items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-xs text-gray-500 text-center">
              {accept.includes('image') ? 'JPG, PNG, WEBP' : 'PDF'} (max 5MB)
            </p>
          </div>
          <input
            id={inputId}
            type="file"
            accept={accept}
            onChange={onFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}