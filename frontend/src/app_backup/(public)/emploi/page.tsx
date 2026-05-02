// frontend/src/app/(public)/emploi/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { jobService, JobOffer } from "@/services/jobService";

const getJobTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    cdi: "CDI", cdd: "CDD", stage: "Stage", freelance: "Freelance", benevolat: "Bénévolat"
  };
  return labels[type] || type;
};

const getJobTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    cdi: "bg-green-100 text-green-800", cdd: "bg-blue-100 text-blue-800",
    stage: "bg-purple-100 text-purple-800", freelance: "bg-orange-100 text-orange-800",
    benevolat: "bg-pink-100 text-pink-800"
  };
  return colors[type] || "bg-gray-100 text-gray-800";
};

export default function EmploiPage() {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ search: "", jobType: "", region: "" });

  useEffect(() => {
    fetchOffers();
  }, [filters, pagination.page]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await jobService.getAllOffers({
        page: pagination.page,
        limit: 9,
        status: "published",
        ...filters,
      });
      setOffers(response.data);
      setPagination({
        page: response.page,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* HERO SECTION */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Offres d'Emploi
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Découvrez les opportunités d'emploi pour les jeunes à Madagascar.
            Postulez en ligne et construisez votre avenir avec Y-Mad.
          </p>
        </div>

        {/* FILTRES */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Rechercher un poste, une entreprise..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              value={filters.jobType}
              onChange={(e) => handleFilterChange("jobType", e.target.value)}
            >
              <option value="">Tous les contrats</option>
              <option value="cdi">CDI</option>
              <option value="cdd">CDD</option>
              <option value="stage">Stage</option>
              <option value="freelance">Freelance</option>
            </select>
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              value={filters.region}
              onChange={(e) => handleFilterChange("region", e.target.value)}
            >
              <option value="">Toutes les régions</option>
              <option value="Antananarivo">Antananarivo</option>
              <option value="Fianarantsoa">Fianarantsoa</option>
              <option value="Toamasina">Toamasina</option>
              <option value="Mahajanga">Mahajanga</option>
              <option value="Toliara">Toliara</option>
            </select>
          </div>
        </div>

        {/* RÉSULTATS */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune offre trouvée</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <Link href={`/emploi/${offer.id}`} key={offer.id}>
                  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100">
                    <div className="p-6">
                      {offer.isFeatured && (
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full mb-3">
                          ⭐ Offre à la une
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition line-clamp-2">
                        {offer.title}
                      </h3>
                      <p className="text-primary font-medium mb-3">{offer.companyName}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${getJobTypeColor(offer.jobType)}`}>
                          {getJobTypeLabel(offer.jobType)}
                        </span>
                        {offer.region && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            📍 {offer.region}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {offer.description}
                      </p>
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span className="text-primary font-medium text-sm group-hover:translate-x-1 transition">
                          Voir détails →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* PAGINATION */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  ← Précédent
                </button>
                <span className="px-4 py-2 bg-primary text-white rounded-lg">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}