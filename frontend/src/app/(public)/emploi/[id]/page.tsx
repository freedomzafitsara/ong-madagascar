"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { jobsApi, uploadApi } from "@/lib/api";
import { 
  Briefcase, MapPin, Calendar, Clock, Building, 
  DollarSign, FileText, Award, CheckCircle, AlertCircle,
  ArrowLeft, Loader2, Upload, X, Eye, Heart, Sparkles
} from "lucide-react";
import toast from "react-hot-toast";

interface JobOffer {
  id: string;
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  company_name: string;
  image_url?: string;
  location?: string;
  region?: string;
  job_type: string;
  salary?: string;
  sector?: string;
  requirements?: string;
  requirements_mg?: string;
  benefits?: string;
  deadline?: string;
  status: string;
  applications_count: number;
  is_featured: boolean;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
}

const getJobTypeLabel = (type: string, language: 'fr' | 'mg') => {
  const labels: Record<string, { fr: string; mg: string }> = {
    cdi: { fr: "CDI", mg: "CDI" },
    cdd: { fr: "CDD", mg: "CDD" },
    stage: { fr: "Stage", mg: "Fiofanana" },
    freelance: { fr: "Freelance", mg: "Freelance" },
    benevolat: { fr: "Bénévolat", mg: "Asa an-tsitrapo" }
  };
  return labels[type]?.[language] || type;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return null;
  }
};

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [offer, setOffer] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    experience_years: "",
    cover_letter: "",
    cv_file: null as File | null,
    photo_file: null as File | null,
    diploma_file: null as File | null,
    attestation_file: null as File | null
  });

  const [uploadProgress, setUploadProgress] = useState({ cv: false, photo: false, diploma: false, attestation: false });

  useEffect(() => {
    fetchOffer();
    // Pré-remplir avec les infos utilisateur si connecté
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        full_name: `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim(),
        email: (user as any).email || '',
      }));
    }
  }, [id, isAuthenticated, user]);

  const fetchOffer = async () => {
    try {
      const data = await jobsApi.getOne(id as string);
      setOffer(data);
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(error.message || "Erreur de chargement de l'offre");
    } finally {
      setLoading(false);
    }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof formData) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validation
    if (!formData.full_name.trim()) {
      setError("Veuillez entrer votre nom complet");
      setSubmitting(false);
      return;
    }
    if (!formData.email.trim()) {
      setError("Veuillez entrer votre email");
      setSubmitting(false);
      return;
    }
    if (!formData.cv_file) {
      setError("Veuillez uploader votre CV");
      setSubmitting(false);
      return;
    }

    try {
      // Upload des fichiers
      setUploadProgress({ cv: true, photo: false, diploma: false, attestation: false });
      const cvUrl = await uploadFile(formData.cv_file, "CV");
      
      setUploadProgress({ cv: false, photo: true, diploma: false, attestation: false });
      const photoUrl = formData.photo_file ? await uploadFile(formData.photo_file, "photo") : null;
      
      setUploadProgress({ cv: false, photo: false, diploma: true, attestation: false });
      const diplomaUrl = formData.diploma_file ? await uploadFile(formData.diploma_file, "diploma") : null;
      
      setUploadProgress({ cv: false, photo: false, diploma: false, attestation: true });
      const attestationUrl = formData.attestation_file ? await uploadFile(formData.attestation_file, "attestation") : null;
      
      setUploadProgress({ cv: false, photo: false, diploma: false, attestation: false });

      if (!cvUrl) {
        throw new Error("L'upload du CV a échoué");
      }

      // Envoi de la candidature
      const applicationData = {
        job_offer_id: id as string,
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

      if (isAuthenticated) {
        await jobsApi.applyAuth(new FormData());
        // Note: Pour l'API actuelle, on utilise apply avec formData
        const formDataObj = new FormData();
        Object.entries(applicationData).forEach(([key, value]) => {
          if (value) formDataObj.append(key, value.toString());
        });
        await jobsApi.applyAuth(formDataObj);
      } else {
        const formDataObj = new FormData();
        Object.entries(applicationData).forEach(([key, value]) => {
          if (value) formDataObj.append(key, value.toString());
        });
        await jobsApi.apply(formDataObj);
      }
      
      setSubmitted(true);
      toast.success("Candidature envoyée avec succès !");
      setTimeout(() => router.push("/emploi"), 3000);
    } catch (err: any) {
      console.error("Erreur:", err);
      setError(err.message || "Une erreur est survenue lors de l'envoi");
      toast.error(err.message || "Erreur lors de l'envoi de la candidature");
    } finally {
      setSubmitting(false);
      setUploadProgress({ cv: false, photo: false, diploma: false, attestation: false });
    }
  };

  const getText = (frText: string, mgText: string) => {
    return language === 'fr' ? frText : mgText;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="text-gray-500 font-medium">{getText("Chargement de l'offre...", "Fanadinana ny asa...")}</p>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">{getText("Offre non trouvée", "Tsy hita ny asa")}</h2>
          <Link href="/emploi" className="text-blue-600 hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {getText("Retour aux offres", "Miverina any amin'ny asa")}
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = offer.deadline ? new Date() > new Date(offer.deadline) : false;
  const canApply = !isExpired && offer.status === 'published';

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Bouton retour */}
        <div className="mb-6">
          <Link href="/emploi" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            {getText("Retour aux offres d'emploi", "Miverina any amin'ny asa")}
          </Link>
        </div>

        {/* ==================== DÉTAILS DE L'OFFRE ==================== */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Image de couverture */}
          {offer.image_url && (
            <div className="h-48 md:h-64 overflow-hidden">
              <img 
                src={offer.image_url} 
                alt={offer.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6 md:p-8">
            {/* En-tête */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div>
                {offer.is_featured && (
                  <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full mb-3">
                    <Sparkles className="w-3.5 h-3.5" /> 
                    {getText("Offre à la une", "Asa manokana")}
                  </span>
                )}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">{offer.title}</h1>
                <p className="text-lg text-blue-600 font-medium flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  {offer.company_name}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${isExpired ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {isExpired ? getText("Expirée", "Lany") : getText("Active", "Mbola misy")}
              </div>
            </div>

            {/* Informations clés */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-100 mb-6">
              <div className="text-center">
                <div className="text-gray-500 text-sm mb-1">{getText("Type de contrat", "Karazana asa")}</div>
                <div className="font-semibold text-gray-800">{getJobTypeLabel(offer.job_type, language)}</div>
              </div>
              {offer.region && (
                <div className="text-center">
                  <div className="text-gray-500 text-sm mb-1">{getText("Région", "Faritra")}</div>
                  <div className="font-semibold text-gray-800 flex items-center justify-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {offer.region}
                  </div>
                </div>
              )}
              {offer.salary && (
                <div className="text-center">
                  <div className="text-gray-500 text-sm mb-1">{getText("Salaire", "Karama")}</div>
                  <div className="font-semibold text-gray-800 flex items-center justify-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> {offer.salary} Ar
                  </div>
                </div>
              )}
              {offer.deadline && (
                <div className="text-center">
                  <div className="text-gray-500 text-sm mb-1">{getText("Date limite", "Farany")}</div>
                  <div className={`font-semibold flex items-center justify-center gap-1 ${isExpired ? "text-red-600" : "text-gray-800"}`}>
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(offer.deadline)}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {getText("Description du poste", "Famaritana ny asa")}
              </h2>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {getText(offer.description, offer.description_mg || offer.description)}
              </div>
            </div>

            {/* Prérequis */}
            {offer.requirements && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  {getText("Prérequis", "Fepetra ilaina")}
                </h2>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {getText(offer.requirements, offer.requirements_mg || offer.requirements)}
                </div>
              </div>
            )}

            {/* Avantages */}
            {offer.benefits && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-blue-600" />
                  {getText("Avantages", "Tombontsoa")}
                </h2>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {offer.benefits}
                </div>
              </div>
            )}

            {/* Contact */}
            {(offer.contact_email || offer.contact_phone) && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">{getText("Pour plus d'informations", "Raha mila fanazavana fanampiny")}</p>
                {offer.contact_email && (
                  <a href={`mailto:${offer.contact_email}`} className="text-blue-600 hover:underline text-sm block">
                    {offer.contact_email}
                  </a>
                )}
                {offer.contact_phone && (
                  <a href={`tel:${offer.contact_phone}`} className="text-blue-600 hover:underline text-sm block mt-1">
                    {offer.contact_phone}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ==================== FORMULAIRE DE CANDIDATURE ==================== */}
        {canApply && !submitted && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              {getText("Postuler à cette offre", "Mangataka ity asa ity")}
            </h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText("Nom complet", "Anarana feno")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder={getText("Jean Rakoto", "Jean Rakoto")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jean@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText("Téléphone", "Telefaonina")}
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="032 04 856 97"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText("Années d'expérience", "Taona fahaizana")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getText("Adresse", "Adiresy")}
                </label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder={getText("Votre adresse complète", "Adiresinao feno")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getText("Lettre de motivation", "Taratra fangatahana asa")}
                </label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
                  value={formData.cover_letter}
                  onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                  placeholder={getText("Décrivez votre parcours, vos compétences et votre motivation...", "Soraty ny fahaizanao sy ny antony tianao hahazoana ity asa ity...")}
                />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{getText("Documents à fournir", "Antontan-taratasy")}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CV (PDF) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition bg-white">
                          {uploadProgress.cv ? (
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          ) : (
                            <Upload className="w-5 h-5 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-600">
                            {formData.cv_file ? formData.cv_file.name : getText("Choisir un fichier", "Misafidy rakitra")}
                          </span>
                        </div>
                        <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileChange(e, "cv_file")} />
                      </label>
                      {formData.cv_file && (
                        <button type="button" onClick={() => setFormData({ ...formData, cv_file: null })} className="p-2 text-gray-400 hover:text-red-500">
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">PDF uniquement, max 5 Mo</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {getText("Photo de profil", "Sarin\'ny tena")}
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition bg-white">
                          {uploadProgress.photo ? (
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          ) : (
                            <Upload className="w-5 h-5 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-600">
                            {formData.photo_file ? formData.photo_file.name : getText("Choisir une photo", "Misafidy sary")}
                          </span>
                        </div>
                        <input type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" onChange={(e) => handleFileChange(e, "photo_file")} />
                      </label>
                      {formData.photo_file && (
                        <button type="button" onClick={() => setFormData({ ...formData, photo_file: null })} className="p-2 text-gray-400 hover:text-red-500">
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {getText("Diplôme (optionnel)", "Diploma (tsy voatery)")}
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition bg-white">
                          {uploadProgress.diploma ? (
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          ) : (
                            <Upload className="w-5 h-5 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-600">
                            {formData.diploma_file ? formData.diploma_file.name : getText("Choisir un fichier", "Misafidy rakitra")}
                          </span>
                        </div>
                        <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileChange(e, "diploma_file")} />
                      </label>
                      {formData.diploma_file && (
                        <button type="button" onClick={() => setFormData({ ...formData, diploma_file: null })} className="p-2 text-gray-400 hover:text-red-500">
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {getText("Envoi en cours...", "Fandefasana...")}
                  </>
                ) : (
                  <>
                    <SendIcon className="w-5 h-5" />
                    {getText("Envoyer ma candidature", "Alefaso ny fangatahana")}
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ==================== MESSAGE DE SUCCÈS ==================== */}
        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              {getText("Candidature envoyée !", "Voaefa ny fangatahana !")}
            </h3>
            <p className="text-green-700">
              {getText("Votre candidature a bien été enregistrée. Nous vous contacterons prochainement.", 
                        "Voarakitra tsara ny fangatahanao. Hifandray aminao izahay tsy ho ela.")}
            </p>
            <Link href="/emploi" className="inline-block mt-6 text-blue-600 hover:underline">
              {getText("Voir d'autres offres", "Jereo asa hafa")} →
            </Link>
          </div>
        )}

        {/* ==================== OFFRE EXPIRÉE ==================== */}
        {!canApply && !submitted && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
            <Clock className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-yellow-800 mb-2">
              {getText("Offre expirée", "Lany ny asa")}
            </h3>
            <p className="text-yellow-700">
              {getText("Cette offre n'est plus disponible. Consultez nos autres offres d'emploi.",
                        "Tsy misy intsony ity asa ity. Jereo ny asa hafa.")}
            </p>
            <Link href="/emploi" className="inline-block mt-4 text-blue-600 hover:underline">
              {getText("Voir les offres disponibles", "Jereo ny asa misy")} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Icône Send personnalisée
function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}