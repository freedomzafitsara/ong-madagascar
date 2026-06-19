// frontend/src/app/(dashboard)/dashboard/settings/tabs/notifications.tsx

'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Bell, Mail, Smartphone, CheckCircle, 
  Save, Loader2, Briefcase, FolderOpen,
  FileText, Settings, AlertCircle, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// ============================================================
// COMPOSANTS
// ============================================================

function SettingCard({ 
  title, 
  description, 
  children 
}: { 
  title: string; 
  description?: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-gray-500 mb-4">{description}</p>
      )}
      {children}
    </div>
  );
}

function ToggleSwitch({ 
  enabled, 
  onChange, 
  label,
  description,
  icon: Icon
}: { 
  enabled: boolean; 
  onChange: (enabled: boolean) => void; 
  label: string;
  description?: string;
  icon?: any;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-gray-400" />}
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          {description && <p className="text-xs text-gray-400">{description}</p>}
        </div>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className={`w-11 h-6 rounded-full transition-all ${
          enabled ? 'bg-blue-800' : 'bg-gray-300'
        } peer-focus:ring-2 peer-focus:ring-blue-800/50`}>
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export function NotificationsTab({ getText }: { getText: (fr: string, mg: string) => string }) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [blogUpdates, setBlogUpdates] = useState(false);
  const [systemUpdates, setSystemUpdates] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const preferences = {
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        job_alerts: jobAlerts,
        project_updates: projectUpdates,
        blog_updates: blogUpdates,
        system_updates: systemUpdates,
        marketing_emails: marketingEmails,
      };
      
      // Sauvegarder les preferences
      await api.put('/auth/notification-preferences', preferences);
      
      toast.success(getText('Preferences sauvegardees', 'Vita ny fitehirizana'));
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error(getText('Erreur lors de la sauvegarde', 'Nisy hadisoana tamin\'ny fitehirizana'));
    } finally {
      setSaving(false);
    }
  };

  const getNotificationCount = () => {
    let count = 0;
    if (emailNotifications) count++;
    if (pushNotifications) count++;
    if (jobAlerts) count++;
    if (projectUpdates) count++;
    if (blogUpdates) count++;
    if (systemUpdates) count++;
    if (marketingEmails) count++;
    return count;
  };

  return (
    <div className="space-y-6">
      
      {/* Resume */}
      <SettingCard title={getText('Resume des notifications', 'Famintinana ny fampandrenesana')}>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <Bell className="w-8 h-8 text-blue-800" />
          <div>
            <p className="text-sm font-medium text-gray-800">
              {getText('Notifications actives', 'Fampandrenesana mavitrika')}
            </p>
            <p className="text-2xl font-bold text-blue-800">{getNotificationCount()} / 7</p>
          </div>
        </div>
      </SettingCard>

      {/* Canal de notification */}
      <SettingCard 
        title={getText('Canaux de notification', 'Fomba fampandrenesana')}
        description={getText('Choisissez comment vous voulez recevoir les notifications', 'Fidio ny fomba hahazoana fampandrenesana')}
      >
        <div className="space-y-3">
          <ToggleSwitch
            enabled={emailNotifications}
            onChange={setEmailNotifications}
            label={getText('Notifications par email', 'Fampandrenesana amin\'ny mail')}
            description={getText('Recevez les notifications dans votre boite email', 'Mahazoa fampandrenesana amin\'ny mail')}
            icon={Mail}
          />
          <ToggleSwitch
            enabled={pushNotifications}
            onChange={setPushNotifications}
            label={getText('Notifications push', 'Fampandrenesana push')}
            description={getText('Recevez les notifications dans votre navigateur', 'Mahazoa fampandrenesana amin\'ny navigateur')}
            icon={Smartphone}
          />
        </div>
      </SettingCard>

      {/* Types de notifications */}
      <SettingCard 
        title={getText('Types de notifications', 'Karazana fampandrenesana')}
        description={getText('Choisissez les notifications que vous souhaitez recevoir', 'Fidio ny fampandrenesana tianao')}
      >
        <div className="space-y-3">
          <ToggleSwitch
            enabled={jobAlerts}
            onChange={setJobAlerts}
            label={getText('Nouvelles offres d\'emploi', 'Asa vaovao')}
            description={getText('Soyez informe des nouvelles offres d\'emploi', 'Mahazoa fampandrenesana amin\'ny asa vaovao')}
            icon={Briefcase}
          />
          <ToggleSwitch
            enabled={projectUpdates}
            onChange={setProjectUpdates}
            label={getText('Mise a jour des projets', 'Fanovana tetikasa')}
            description={getText('Suivez l\'evolution des projets', 'Araho ny fivoaran\'ny tetikasa')}
            icon={FolderOpen}
          />
          <ToggleSwitch
            enabled={blogUpdates}
            onChange={setBlogUpdates}
            label={getText('Nouveaux articles du blog', 'Lahatsoratra vaovao')}
            description={getText('Soyez informe des nouveaux articles', 'Mahazoa fampandrenesana amin\'ny lahatsoratra vaovao')}
            icon={FileText}
          />
          <ToggleSwitch
            enabled={systemUpdates}
            onChange={setSystemUpdates}
            label={getText('Mise a jour du systeme', 'Fanovana rafitra')}
            description={getText('Notifications techniques et maintenance', 'Fampandrenesana ara-teknika sy fanamboarana')}
            icon={Settings}
          />
          <ToggleSwitch
            enabled={marketingEmails}
            onChange={setMarketingEmails}
            label={getText('Emails marketing', 'Mail marketing')}
            description={getText('Recevez les actualites et evenements Y-MaD', 'Mahazoa vaovao sy hetsika Y-MaD')}
            icon={AlertCircle}
          />
        </div>
      </SettingCard>

      {/* Bouton sauvegarder */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50 flex items-center gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {getText('Enregistrer les preferences', 'Tehirizo ny safidy')}
      </button>
    </div>
  );
}