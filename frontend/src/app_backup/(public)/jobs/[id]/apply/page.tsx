'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Upload, FileText, User, Mail, Phone, 
  MapPin, Briefcase, Send, CheckCircle, AlertCircle, 
  Camera, X, Loader2, FileCheck, FileWarning
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface JobOffer {
  id: string;
  title: string;
  company_name: string;
  location: string;
  contract_type: string;
  description: string;
  requirements?: string[];
  salary?: string;
}

export default function ApplyPage() {
  const { t, language } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Formulaire
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    experience: '',
    notes: '',
  });
  
  // Fichiers
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [diplomaFile, setDiplomaFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  
  // Previews
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cvPreview, setCvPreview] = useState<string | null>(null);
  const [diplomaPreview, setDiplomaPreview] = useState<string | null>(null);
  const [certificatePreview, setCertificatePreview] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
    // Nettoyage des URLs
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data.job);
      } else {
        setError(language === 'fr' ? 'Offre d\'emploi non trouvée' : 'Tsy hita ny asa');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError(language === 'fr' ? 'Erreur de chargement' : 'Nisy hadisoana tamin\'ny fampidinana');
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
    
    // Validation taille
    if (file.size > 5 * 1024 * 1024) {
      setError(language === 'fr' ? 'Le fichier ne doit pas dépasser 5 Mo' : 'Tsy tokony ho mihoatra ny 5 Mo ny rakitra');
      e.target.value = '';
      return;
    }
    
    // Validation type pour les images
    if (type === 'photo' && !file.type.startsWith('image/')) {
      setError(language === 'fr' ? 'Le fichier doit être une image (JPG, PNG)' : 'Ny rakitra dia tokony ho sary (JPG, PNG)');
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
      case 'certificate':
        setCertificateFile(file);
        setCertificatePreview(file.name);
        break;
    }
    // Réinitialiser l'erreur
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
      case 'certificate':
        setCertificateFile(null);
        setCertificatePreview(null);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    // Validations
    if (!formData.fullName.trim()) {
      setError(language === 'fr' ? 'Veuillez entrer votre nom complet' : 'Ampidiro ny anaranao feno');
      setSubmitting(false);
      return;
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError(language === 'fr' ? 'Veuillez entrer un email valide' : 'Ampidiro ny adiresy mailaka marina');
      setSubmitting(false);
      return;
    }
    
    if (!cvFile) {
      setError(language === 'fr' ? 'Veuillez uploader votre CV' : 'Alefaso ny CV anao');
      setSubmitting(false);
      return;
    }
    
    const submitData = new FormData();
    submitData.append('fullName', formData.fullName.trim());
    submitData.append('email', formData.email.trim());
    submitData.append('phone', formData.phone.trim());
    submitData.append('address', formData.address.trim());
    submitData.append('experience', formData.experience);
    submitData.append('notes', formData.notes);
    
    if (photoFile) submitData.append('photo', photoFile);
    submitData.append('cv', cvFile);
    if (diplomaFile) submitData.append('diploma', diplomaFile);
    if (certificateFile) submitData.append('certificate', certificateFile);
    
    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        body: submitData,
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/jobs'), 3000);
      } else {
        setError(data.error || (language === 'fr' ? 'Erreur lors de l\'envoi de votre candidature' : 'Nisy hadisoana tamin\'ny fandefasana ny fangatahanao'));
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(language === 'fr' ? 'Erreur de connexion. Veuillez réessayer.' : 'Nisy hadisoana tamin\'ny fifandraisana. Miezaka indray azafady.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <Link href="/jobs" className="mt-4 inline-block text-blue-600 hover:underline">
            ← {language === 'fr' ? 'Retour aux offres' : 'Hiverina any amin\'ny asa'}
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
            {language === 'fr' ? 'Candidature envoyée !' : 'Vita ny fandefasana ny fangatahana !'}
          </h2>
          <p className="text-gray-600 mb-4">
            {language === 'fr' ? 'Votre candidature pour' : 'Ny fangatahanao ho an\'ny'} <strong>{job?.title}</strong> {language === 'fr' ? 'a bien été enregistrée.' : 'dia voarakitra tsara.'}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {language === 'fr' 
              ? 'Vous recevrez une confirmation par email dans les prochains jours.'
              : 'Hahazo fanamafisana amin\'ny mailaka ianao ao anatin\'ny andro vitsivitsy.'}
          </p>
          <Link href="/jobs" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            {language === 'fr' ? 'Retour aux offres' : 'Hiverina any amin\'ny asa'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Lien retour */}
        <Link href="/jobs" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          {language === 'fr' ? 'Retour aux offres' : 'Hiverina any amin\'ny asa'}
        </Link>

        {/* En-tête offre */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {language === 'fr' ? 'Candidature' : 'Fangatahana'}
          </h1>
          <p className="text-gray-500 mt-1">
            {language === 'fr' ? 'Offre :' : 'Asa :'} <span className="font-semibold text-blue-600">{job?.title}</span>
          </p>
          <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">🏢 {job?.company_name || 'Y-Mad'}</span>
            <span className="flex items-center gap-1">📍 {job?.location || 'Madagascar'}</span>
            <span className="flex items-center gap-1">📄 {job?.contract_type}</span>
            {job?.salary && <span className="flex items-center gap-1">💰 {job.salary}</span>}
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Photo de profil */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              {language === 'fr' ? 'Photo de profil' : 'Sarim-panjakana'}
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              {photoPreview ? (
                <div className="relative">
                  <img 
                    src={photoPreview} 
                    alt="Photo de profil" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile('photo')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 transition">
                    <Camera className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">{language === 'fr' ? 'Photo' : 'Sary'}</span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/jpeg,image/jpg,image/png,image/webp" 
                    onChange={(e) => handleFileChange(e, 'photo')} 
                    className="hidden" 
                  />
                </label>
              )}
              <p className="text-xs text-gray-400">{language === 'fr' ? 'JPG, PNG, WebP • Max 5 Mo' : 'JPG, PNG, WebP • 5 Mo farafahakeliny'}</p>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              {language === 'fr' ? 'Informations personnelles' : 'Fampahalalana manokana'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'fr' ? 'Nom complet' : 'Anarana feno'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder={language === 'fr' ? 'Jean Rakoto' : 'Jean Rakoto'}
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
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="jean@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'fr' ? 'Téléphone' : 'Telefaonina'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="034 00 000 00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'fr' ? 'Adresse' : 'Adiresy'}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder={language === 'fr' ? 'Antananarivo, Madagascar' : 'Antananarivo, Madagasikara'}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Expérience */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              {language === 'fr' ? 'Expérience professionnelle' : 'Traza'}
            </h2>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder={language === 'fr' 
                ? 'Décrivez votre parcours professionnel, vos compétences et vos réalisations...'
                : 'Lazao ny traza, fahaizana ary zava-bita...'}
            />
          </div>

          {/* Documents */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              {language === 'fr' ? 'Documents' : 'Rakitra'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CV */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition cursor-pointer">
                <input 
                  type="file" 
                  id="cv" 
                  accept=".pdf,.doc,.docx" 
                  onChange={(e) => handleFileChange(e, 'cv')} 
                  className="hidden" 
                />
                <label htmlFor="cv" className="cursor-pointer block">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">CV <span className="text-red-500">*</span></p>
                  <p className="text-xs text-gray-400">{language === 'fr' ? 'PDF, DOC - 5 Mo' : 'PDF, DOC - 5 Mo'}</p>
                  {cvPreview && <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1"><FileCheck className="w-3 h-3" /> {cvPreview}</p>}
                </label>
              </div>
              
              {/* Diplôme */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition cursor-pointer">
                <input 
                  type="file" 
                  id="diploma" 
                  accept=".pdf,.jpg,.png" 
                  onChange={(e) => handleFileChange(e, 'diploma')} 
                  className="hidden" 
                />
                <label htmlFor="diploma" className="cursor-pointer block">
                  <FileWarning className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    {language === 'fr' ? 'Diplôme / Certificat' : 'Diploma / Fanamarinana'}
                  </p>
                  <p className="text-xs text-gray-400">{language === 'fr' ? 'PDF, JPG, PNG - 5 Mo' : 'PDF, JPG, PNG - 5 Mo'}</p>
                  {diplomaPreview && <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1"><FileCheck className="w-3 h-3" /> {diplomaPreview}</p>}
                </label>
              </div>
              
              {/* Attestation */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition cursor-pointer">
                <input 
                  type="file" 
                  id="certificate" 
                  accept=".pdf,.jpg,.png" 
                  onChange={(e) => handleFileChange(e, 'certificate')} 
                  className="hidden" 
                />
                <label htmlFor="certificate" className="cursor-pointer block">
                  <FileCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    {language === 'fr' ? 'Attestation / Lettre' : 'Taraty / Fanamarinana'}
                  </p>
                  <p className="text-xs text-gray-400">{language === 'fr' ? 'PDF, JPG, PNG - 5 Mo' : 'PDF, JPG, PNG - 5 Mo'}</p>
                  {certificatePreview && <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1"><FileCheck className="w-3 h-3" /> {certificatePreview}</p>}
                </label>
              </div>
            </div>
          </div>

          {/* Note supplémentaire */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              {language === 'fr' ? 'Note supplémentaire' : 'Fanamarihana fanampiny'}
            </h2>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder={language === 'fr' 
                ? 'Informations complémentaires que vous souhaitez ajouter...'
                : 'Fampahalalana fanampiny tianao ampiana...'}
            />
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {language === 'fr' ? 'Envoi en cours...' : 'Fandefasana...'}
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {language === 'fr' ? 'Envoyer ma candidature' : 'Alefaso ny fangatahana'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}