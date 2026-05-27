// frontend/src/components/donate/PayPalSandboxButton.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

interface PayPalSandboxButtonProps {
  amount: number;
  projectName?: string;
  message?: string;
  onSuccess?: () => void;
}

export function PayPalSandboxButton({ amount, projectName, message, onSuccess }: PayPalSandboxButtonProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showTestInfo, setShowTestInfo] = useState(false);

  const handleDonate = async () => {
    if (amount < 1000) {
      toast.error('Le montant minimum est de 1000 MGA (environ 2€)');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/payments/paypal/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amount / 5000, // Conversion MGA vers EUR approximative
          currency: 'EUR',
          project_name: projectName,
          message: message,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.approvalUrl) {
        // Ouvrir PayPal dans un nouvel onglet
        window.open(data.approvalUrl, '_blank');
        toast.success('Redirection vers PayPal...');
        onSuccess?.();
      } else {
        throw new Error('Erreur lors de la création du don');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la préparation du don');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleDonate}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <CreditCard className="w-5 h-5" />
        )}
        {loading ? 'Préparation...' : `Donner ${amount.toLocaleString()} MGA avec PayPal`}
      </button>

      <button
        onClick={() => setShowTestInfo(!showTestInfo)}
        className="w-full text-sm text-gray-500 flex items-center justify-center gap-1 hover:text-gray-700"
      >
        <Info className="w-4 h-4" />
        Mode test - Informations de connexion
      </button>

      {showTestInfo && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
          <p className="font-semibold text-yellow-800 mb-2">🔧 Mode Test PayPal (Sandbox)</p>
          <p className="text-gray-600 text-xs mb-2">Aucun argent réel n'est débité. Utilisez ces identifiants :</p>
          <div className="space-y-1 text-xs">
            <p><span className="font-mono bg-gray-100 px-1">Email:</span> <span className="text-blue-600">sb-7qk2p26327806@personal.example.com</span></p>
            <p><span className="font-mono bg-gray-100 px-1">Mot de passe:</span> <span className="text-blue-600">test123</span></p>
            <p className="text-gray-500 mt-2">Carte de test: <span className="font-mono">4111 1111 1111 1111</span> (exp: 12/25, CVV: 123)</p>
          </div>
        </div>
      )}
    </div>
  );
}