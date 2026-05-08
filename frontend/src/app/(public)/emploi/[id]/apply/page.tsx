'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, Send, User, Mail, Phone, MapPin, 
  Briefcase, FileText, Upload, CheckCircle, AlertCircle,
  Loader2, Eye, EyeOff, Building, Calendar, Award
} from 'lucide-react';

interface JobOffer {
  id: string;
  title: string;
  title_mg: string;
  description: string;
  companyName: string;
  location: string;
  jobType: string;
  deadline: string;
}

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    experience: '',
    cover_letter: '',
  });

  const [files, setFiles] = useState<{
    cv: File | null;
    photo: File | null;
    diploma: File | null;
    attestation: File | null;
  }>({
    cv: null,
    photo: null,
    diploma: null,
    attestation: null,
  });

  const [previews, setPreviews] = useState<{
    cv: string | null;
    photo: string | null;
    diploma: string | null;
    attestation: string | null;
  }>({
    cv: null,
    photo: null,
    diploma: null,
    attestation: null,
  });

  useEffect(() => {
    fetchJob();
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [params.id, user]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`http://localhost:4001/jobs/offers/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else {
        setError('Offre non trouvée');
      }
    } catch (error) {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof files) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation du type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Format non supporté. Utilisez PDF, JPG ou PNG.');
      return;
    }

    // Validation de la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 5MB)');
      return;
    }

    setFiles(prev => ({ ...prev, [field]: file }));
    
    // Preview pour les images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews(prev => ({ ...prev, [field]: file.name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validation
    if (!formData.fullName || !formData.email || !formData.address) {
      setError('Veuillez remplir tous les champs obligatoires');
      setSubmitting(false);
      return;
    }

    if (!files.cv) {
      setError('Veuillez télécharger votre CV');
      setSubmitting(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('jobOfferId', params.id as string);
      submitData.append('fullName', formData.fullName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('address', formData.address);
      submitData.append('experience', formData.experience);
      submitData.append('cover_letter', formData.cover_letter);
      
      if (files.cv) submitData.append('cv', files.cv);
      if (files.photo) submitData.append('photo', files.photo);
      if (files.diploma) submitData.append('diploma', files.diploma);
      if (files.attestation) submitData.append('attestation', files.attestation);
      
      if (user?.id) submitData.append('userId', user.id);

      const response = await fetch('http://localhost:4001/upload/application', {
        method: 'POST',
        body: submitData,
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/emploi');
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      setError('Erreur de connexion au serveur');
    } finally {
      setSubmitting(false);
    }
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
          <Link href="/emploi" className="mt-4 inline-flex items-center gap-2 text-blue-600">
            <ArrowLeft className="w-4 h-4" /> Retour aux offres
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Candidature envoyée !</h2>
          <p className="text-gray-600 mb-4">
            Merci pour votre candidature. Nous l'examinerons dans les plus brefs délais.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Un email de confirmation vous a été envoyé.
          </p>
          <Link href="/emploi" className="inline-flex items-center gap-2 text-blue-600 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Retour aux offres
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
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Offre expirée</h2>
          <p className="text-gray-600 mb-6">
            La date limite de candidature pour cette offre est dépassée.
          </p>
          <Link href="/emploi" className="text-blue-600 font-semibold hover:underline">
            Voir les autres offres
          </Link>
        </div>
      </div>
    );
  }

  const title = language === 'fr' ? job?.title : job?.title_mg || job?.title;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <Link href={`/emploi/${params.id}`} className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Retour à l'offre
          </Link>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <div className="flex flex-wrap gap-4 mt-3">
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Building className="w-4 h-4" /> {job?.companyName}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="w-4 h-4" /> {job?.location || 'Madagascar'}
              </span>
              {job?.deadline && (
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" /> Limite: {new Date(job.deadline).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <h2 className="text-xl font-semibold text-gray-800">Formulaire de candidature</h2>
            <p className="text-gray-500 text-sm mt-1">Tous les champs marqués d'un * sont obligatoires</p>
          </div>

          {error && (
            <div className="m-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> Informations personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Jean RAKOTO"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="jean@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="032 12 345 67"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Votre adresse complète"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CV et Photo */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUpload
                  label="CV *"
                  accept=".pdf,.doc,.docx"
                  file={files.cv}
                  preview={previews.cv}
                  onChange={(e) => handleFileChange(e, 'cv')}
                  required
                />
                <FileUpload
                  label="Photo de profil"
                  accept="image/*"
                  file={files.photo}
                  preview={previews.photo}
                  onChange={(e) => handleFileChange(e, 'photo')}
                />
                <FileUpload
                  label="Diplôme"
                  accept=".pdf,.jpg,.jpeg,.png"
                  file={files.diploma}
                  preview={previews.diploma}
                  onChange={(e) => handleFileChange(e, 'diploma')}
                />
                <FileUpload
                  label="Attestation"
                  accept=".pdf"
                  file={files.attestation}
                  preview={previews.attestation}
                  onChange={(e) => handleFileChange(e, 'attestation')}
                />
              </div>
            </div>

            {/* Expérience */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" /> Expérience professionnelle
              </h3>
              <textarea
                rows={4}
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Décrivez votre parcours professionnel, vos stages, etc."
              />
            </div>

            {/* Lettre de motivation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Lettre de motivation
              </h3>
              <textarea
                rows={6}
                value={formData.cover_letter}
                onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Expliquez pourquoi vous êtes le candidat idéal..."
              />
            </div>

            {/* Bouton d'envoi */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {submitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function FileUpload({ 
  label, 
  accept, 
  file, 
  preview, 
  onChange, 
  required 
}: { 
  label: string; 
  accept: string; 
  file: File | null; 
  preview: string | null; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  required?: boolean;
}) {
  const [dragActive, setDragActive] = useState(false);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 text-center transition ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
      }`}
      onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
          const inputEvent = { target: { files: [droppedFile] } } as unknown as React.ChangeEvent<HTMLInputElement>;
          onChange(inputEvent);
        }
      }}
    >
      {preview ? (
        <div className="space-y-2">
          {typeof preview === 'string' && preview.startsWith('data:image') ? (
            <img src={preview} alt="Aperçu" className="w-20 h-20 object-cover rounded-lg mx-auto" />
          ) : (
            <FileText className="w-10 h-10 text-green-500 mx-auto" />
          )}
          <p className="text-sm text-gray-600 truncate">{typeof preview === 'string' ? preview.split('/').pop() : preview}</p>
          <button
            type="button"
            onClick={() => {
              const inputEvent = { target: { files: [] } } as unknown as React.ChangeEvent<HTMLInputElement>;
              onChange(inputEvent);
            }}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Supprimer
          </button>
        </div>
      ) : (
        <>
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            {label} {required && <span className="text-red-500">*</span>}
          </p>
          <p className="text-xs text-gray-400 mt-1">Drag & drop ou cliquez pour sélectionner</p>
          <input
            type="file"
            accept={accept}
            onChange={onChange}
            className="hidden"
            id={`file-${label}`}
            required={required && !file}
          />
          <label
            htmlFor={`file-${label}`}
            className="mt-2 inline-block px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer"
          >
            Parcourir
          </label>
        </>
      )}
    </div>
  );
}