'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToProfile() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/candidat/profil-candidat');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-400">Redirection en cours...</div>
    </div>
  );
}
