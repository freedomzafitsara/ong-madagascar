import Link from 'next/link';

export default function CandidateHomePage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Espace candidat</h1>
        <p className="mt-4 text-gray-600">Bienvenue dans votre espace personnel. Utilisez le menu pour accéder à votre profil, vos candidatures ou vos offres sauvegardées.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Link href="/candidate/profil-candidat" className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100">
            Mon profil
          </Link>
          <Link href="/candidate/applications" className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Mes candidatures
          </Link>
          <Link href="/candidate/saved-jobs" className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Offres sauvegardées
          </Link>
        </div>
      </div>
    </main>
  );
}
