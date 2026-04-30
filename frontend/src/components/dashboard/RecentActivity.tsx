'use client';

import React from 'react';

export const RecentActivity: React.FC = () => {
  const activities = [
    { id: 1, action: 'Nouveau projet ajouté', user: 'Admin', time: 'Il y a 2 heures', icon: '📁' },
    { id: 2, action: 'Don de 500 000 MGA reçu', user: 'Donateur anonyme', time: 'Il y a 5 heures', icon: '💰' },
    { id: 3, action: 'Nouveau bénévole inscrit', user: 'Jean Rakoto', time: 'Hier', icon: '🤝' },
    { id: 4, action: 'Article publié', user: 'Staff ONG', time: 'Hier', icon: '✍️' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Activités récentes</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3 pb-3 border-b last:border-0">
            <div className="text-2xl">{activity.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{activity.action}</p>
              <p className="text-xs text-gray-500">par {activity.user}</p>
            </div>
            <p className="text-xs text-gray-400">{activity.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;