'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Users, Search, Shield, UserCog, User, CheckCircle, 
  XCircle, Loader2, RefreshCw, Eye, Edit, Trash2,
  ChevronLeft, ChevronRight, Mail, Phone, MapPin,
  Heart, Handshake, Crown, Star, AlertTriangle
} from 'lucide-react';

interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  region: string;
  phone: string;
  lastLogin: string;
  createdAt: string;
}

export default function UsersPage() {
  const { user: currentUser, token, hasRole, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const itemsPerPage = 10;

  // ✅ VÉRIFICATION D'ACCÈS SUPER ADMIN
  useEffect(() => {
    if (!loading && (!currentUser || currentUser.role !== 'super_admin')) {
      console.log('❌ Accès non autorisé - Redirection vers dashboard');
      router.push('/dashboard');
    }
  }, [currentUser, loading, router]);

  if (!hasRole('super_admin')) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Accès non autorisé</h1>
          <p className="text-gray-500 mt-2">
            Vous n'avez pas les droits pour accéder à cette page.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  // ... reste du code
}