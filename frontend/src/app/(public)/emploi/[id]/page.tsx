// frontend/src/app/(public)/emploi/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { jobService, JobOffer } from "@/services/jobService";

const getJobTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    cdi: "CDI", cdd: "CDD", stage: "Stage", freelance: "Freelance", benevolat: "Bénévolat"
  };
  return labels[type] || type;
};

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [offer, setOffer] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", address: "", experienceYears: "", coverLetter: "",
    cvFile: null as File | null, photoFile: null as File | null,
    diplomaFile: null as File | null, attestationFile: null as File | null
  });

  useEffect(() => {
    fetchOffer();
  }, [id]);

  const fetchOffer = async () => {
    try {
      const data = await jobService.getOfferById(id as string);
      setOffer(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, type: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`http://localhost:4001/upload/single`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    return data.url || data.fileUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      let cvUrl = "", photoUrl = "", diplomaUrl = "", attestationUrl = "";
      
      if (formData.cvFile) cvUrl = await uploadFile(formData.cvFile, "cv");
      if (formData.photoFile) photoUrl = await uploadFile(formData.photoFile, "photo");
      if (formData.diplomaFile) diplomaUrl = await uploadFile(formData.diplomaFile, "diploma");
      if (formData.attestationFile) attestationUrl = await uploadFile(formData.attestationFile, "attestation");

      const applicationData = new FormData();
      applicationData.append("fullName", formData.fullName);
      applicationData.append("email", formData.email);
      applicationData.append("phone", formData.phone || "");
      applicationData.append("address", formData.address || "");
      applicationData.append("experienceYears", formData.experienceYears || "0");
      applicationData.append("coverLetter", formData.coverLetter || "");
      applicationData.append("cvUrl", cvUrl);
      applicationData.append("photoUrl", photoUrl);
      applicationData.append("diplomaUrl", diplomaUrl);
      applicationData.append("attestationUrl", attestationUrl);

      await jobService.applyToOffer(id as string, applicationData);
      setSubmitted(true);
      setTimeout(() => router.push("/emploi"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Offre non trouvée</h2>
          <Link href="/emploi" className="text-primary hover:underline">← Retour aux offres</Link>
        </div>
      </div>
    );
  }

  const isExpired = offer.deadline ? new Date() > new Date(offer.deadline) : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6">
          <Link href="/emploi" className="text-primary hover:underline flex items-center gap-2">
            ← Retour aux offres d'emploi
          </Link>
        </div>

        {/* DÉTAILS DE L'OFFRE */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                {offer.isFeatured && (
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full mb-3">
                    ⭐ Offre à la une
                  </span>
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{offer.title}</h1>
                <p className="text-xl text-primary font-medium">{offer.companyName}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${isExpired ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                {isExpired ? "Expirée" : "Active"}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-100 mb-6">
              <div className="text-center">
                <div className="text-gray-500 text-sm mb-1">Type de contrat</div>
                <div className="font-semibold">{getJobTypeLabel(offer.jobType)}</div>
              </div>
              {offer.region && (
                <div className="text-center">
                  <div className="text-gray-500 text-sm mb-1">Région</div>
                  <div className="font-semibold">{offer.region}</div>
                </div>
              )}
              {offer.salaryRange && (
                <div className="text-center">
                  <div className="text-gray-500 text-sm mb-1">Salaire</div>
                  <div className="font-semibold">{offer.salaryRange}</div>
                </div>
              )}
              {offer.deadline && (
                <div className="text-center">
                  <div className="text-gray-500 text-sm mb-1">Date limite</div>
                  <div className="font-semibold">{new Date(offer.deadline).toLocaleDateString("fr-FR")}</div>
                </div>
              )}
            </div>

            <div className="prose max-w-none mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Description du poste</h2>
              <div className="text-gray-700 whitespace-pre-line">{offer.description}</div>
            </div>

            {offer.requirements && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Prérequis</h2>
                <div className="text-gray-700 whitespace-pre-line">{offer.requirements}</div>
              </div>
            )}
          </div>
        </div>

        {/* FORMULAIRE DE CANDIDATURE */}
        {!isExpired && !submitted && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Postuler à cette offre</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nom complet *</label>
                  <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email *</label>
                  <input type="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Téléphone</label>
                  <input type="tel" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Années d'expérience</label>
                  <input type="number" min="0" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    value={formData.experienceYears} onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Adresse</label>
                <textarea rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Lettre de motivation</label>
                <textarea rows={5} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  value={formData.coverLetter} onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                  placeholder="Décrivez votre parcours, vos compétences et votre motivation..." />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Documents à fournir</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">CV (PDF) *</label>
                    <input type="file" accept=".pdf" required
                      className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-primary-dark"
                      onChange={(e) => setFormData({ ...formData, cvFile: e.target.files?.[0] || null })} />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Photo de profil</label>
                    <input type="file" accept="image/jpeg,image/png"
                      className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white"
                      onChange={(e) => setFormData({ ...formData, photoFile: e.target.files?.[0] || null })} />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Diplôme (optionnel)</label>
                    <input type="file" accept=".pdf"
                      className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white"
                      onChange={(e) => setFormData({ ...formData, diplomaFile: e.target.files?.[0] || null })} />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50">
                {submitting ? "Envoi en cours..." : "Envoyer ma candidature"}
              </button>
            </form>
          </div>
        )}

        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">✅ Candidature envoyée !</h3>
            <p className="text-green-700">Votre candidature a bien été enregistrée.</p>
          </div>
        )}

        {isExpired && !submitted && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-yellow-800 mb-2">Offre expirée</h3>
            <p className="text-yellow-700">Cette offre n'est plus disponible.</p>
            <Link href="/emploi" className="inline-block mt-4 text-primary hover:underline">
              Voir les offres disponibles →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}