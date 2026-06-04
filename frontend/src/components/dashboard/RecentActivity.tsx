'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, FileText, UserPlus, Calendar, Clock, Eye, CheckCircle, AlertCircle } from 'lucide-react';

interface Activity {
  id: string;
  action: string;
  action_mg?: string;
  user: string;
  user_name?: string;
  time: Date;
  type: 'job' | 'application' | 'project' | 'blog' | 'contact';
  icon: React.ElementType;
}

export const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const getText = (fr: string, mg: string) => {
    const language = localStorage.getItem('y-mad-language') || 'fr';
    return language === 'fr' ? fr : mg;
  };

  useEffect(() => {
    // Simuler le chargement des activités réelles depuis l'API
    const fetchActivities = async () => {
      setLoading(true);
      try {
        // TODO: Remplacer par un appel API réel
        // const response = await api.get('/dashboard/recent-activities');
        // setActivities(response.data);
        
        // Données d'exemple (à remplacer par les vraies données)
        const mockActivities: Activity[] = [
          {
            id: '1',
            action: 'Nouvelle offre d\'emploi publiée',
            action_mg: 'Asa vaovao navoaka',
            user: 'Admin',
            time: new Date(Date.now() - 2 * 60 * 60 * 1000),
            type: 'job',
            icon: Briefcase
          },
          {
            id: '2',
            action: 'Nouvelle candidature reçue',
            action_mg: 'Fangatahana vaovao',
            user: 'Jean Rakoto',
            time: new Date(Date.now() - 5 * 60 * 60 * 1000),
            type: 'application',
            icon: FileText
          },
          {
            id: '3',
            action: 'Nouveau projet ajouté',
            action_mg: 'Tetikasa vaovao ampiana',
            user: 'Admin',
            time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            type: 'project',
            icon: Calendar
          },
          {
            id: '4',
            action: 'Nouvel article publié',
            action_mg: 'Lahatsoratra vaovao navoaka',
            user: 'Staff',
            time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            type: 'blog',
            icon: Eye
          }
        ];
        setActivities(mockActivities);
      } catch (error) {
        console.error('Erreur chargement activités:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return getText(`Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`, `${diffMins} min lasa`);
    }
    if (diffHours < 24) {
      return getText(`Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`, `${diffHours} ora lasa`);
    }
    if (diffDays < 7) {
      return getText(`Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`, `${diffDays} andro lasa`);
    }
    return date.toLocaleDateString('fr-FR');
  };

  const getActivityText = (activity: Activity): string => {
    const action = getText(activity.action, activity.action_mg || activity.action);
    const user = activity.user_name || activity.user;
    return getText(`${action} par ${user}`, `${action} nataon'i ${user}`);
  };

  const getActivityIcon = (type: Activity['type']) => {
    const icons: Record<Activity['type'], React.ElementType> = {
      job: Briefcase,
      application: FileText,
      project: Calendar,
      blog: Eye,
      contact: AlertCircle
    };
    return icons[type];
  };

  const getIconColor = (type: Activity['type']) => {
    const colors: Record<Activity['type'], string> = {
      job: 'bg-blue-100 text-blue-600',
      application: 'bg-green-100 text-green-600',
      project: 'bg-purple-100 text-purple-600',
      blog: 'bg-yellow-100 text-yellow-600',
      contact: 'bg-red-100 text-red-600'
    };
    return colors[type];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {getText('Activités récentes', 'Hetsika farany')}
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {getText('Activités récentes', 'Hetsika farany')}
        </h3>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{getText('Aucune activité récente', 'Tsy misy hetsika farany')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {getText('Activités récentes', 'Hetsika farany')}
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const iconColor = getIconColor(activity.type);
          const IconComponent = Icon;
          
          return (
            <div 
              key={activity.id} 
              className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {getText(activity.action, activity.action_mg || activity.action)}
                </p>
                <p className="text-xs text-gray-500">
                  {getText('par', 'nataon\'i')} <span className="font-medium">{activity.user_name || activity.user}</span>
                </p>
              </div>
              <p className="text-xs text-gray-400 whitespace-nowrap">
                {getTimeAgo(activity.time)}
              </p>
            </div>
          );
        })}
      </div>
      
      {/* Lien voir plus */}
      <div className="mt-4 pt-2 text-center">
        <button 
          onClick={() => window.location.href = '/dashboard/activities'}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {getText('Voir toutes les activités', 'Jereo ny hetsika rehetra')} →
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;