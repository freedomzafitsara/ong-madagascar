'use client';

import React from 'react';

interface StatsCardsProps {
  stats?: {
    projects?: number;
    donations?: number;
    beneficiaries?: number;
    volunteers?: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const defaultStats = {
    projects: 0,
    donations: 0,
    beneficiaries: 0,
    volunteers: 0,
  };

  const data = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-4xl font-bold text-green-600">{data.projects}</h3>
        <p className="text-gray-600 mt-2">Projets réalisés</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-4xl font-bold text-green-600">{data.donations}</h3>
        <p className="text-gray-600 mt-2">Dons collectés</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-4xl font-bold text-green-600">{data.beneficiaries}</h3>
        <p className="text-gray-600 mt-2">Bénéficiaires</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-4xl font-bold text-green-600">{data.volunteers}</h3>
        <p className="text-gray-600 mt-2">Bénévoles</p>
      </div>
    </div>
  );
};

export default StatsCards;