// app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-ymad-gray-50">
      <div className="text-center">
        {/* Spinner animé - aux couleurs Y-MaD */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-ymad-blue-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-ymad-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        
        {/* Texte de chargement */}
        <h3 className="text-xl font-semibold text-ymad-blue-800 mb-2">
          Chargement en cours...
        </h3>
        <p className="text-ymad-gray-500">
          Veuillez patienter pendant que nous préparons votre contenu.
        </p>
        
        {/* Points de progression animés */}
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-2 h-2 bg-ymad-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-ymad-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-ymad-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}