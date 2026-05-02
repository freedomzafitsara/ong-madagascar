'use client';

import React from 'react';

interface ChartDonationsProps {
  data?: Array<{ month: string; amount: number }>;
}

export const ChartDonations: React.FC<ChartDonationsProps> = ({ data = [] }) => {
  const defaultData = [
    { month: 'Jan', amount: 0 },
    { month: 'Fév', amount: 0 },
    { month: 'Mar', amount: 0 },
    { month: 'Avr', amount: 0 },
    { month: 'Mai', amount: 0 },
    { month: 'Juin', amount: 0 },
  ];

  const chartData = data.length > 0 ? data : defaultData;
  const maxAmount = Math.max(...chartData.map(d => d.amount), 1);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution des dons</h3>
      <div className="h-64 flex items-end space-x-2">
        {chartData.map((item, index) => {
          const height = (item.amount / maxAmount) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-primary-600 rounded-t-lg transition-all duration-500"
                style={{ height: `${height}%`, minHeight: '4px' }}
              />
              <p className="text-xs text-gray-500 mt-2">{item.month}</p>
              <p className="text-xs font-semibold">
                {(item.amount / 1000000).toFixed(1)}M
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChartDonations;