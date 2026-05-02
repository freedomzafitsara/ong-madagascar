'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Une erreur est survenue</h2>
      <p className="text-gray-600 mb-6">{error.message || 'Erreur inattendue'}</p>
      <button
        onClick={reset}
        className="bg-ymad-orange-500 text-white px-4 py-2 rounded hover:bg-ymad-orange-600"
      >
        Réessayer
      </button>
    </div>
  );
}
