const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

export interface Background {
  id: string;
  page: string;
  image_url: string;
  thumbnail_url: string;
  mobile_url: string;
  is_active: boolean;
  alt_text: string;
  overlay_opacity: number;
  position: string;
  size: string;
  createdAt: string;
  updatedAt: string;
}

export const backgroundService = {
  async getAll(token: string): Promise<Background[]> {
    const response = await fetch(`${API_URL}/backgrounds`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Erreur chargement');
    return response.json();
  },

  async getByPage(page: string): Promise<Background | null> {
    const response = await fetch(`${API_URL}/backgrounds/page/${page}`);
    if (!response.ok) return null;
    return response.json();
  },

  async create(token: string, data: Partial<Background>): Promise<Background> {
    const response = await fetch(`${API_URL}/backgrounds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erreur création');
    return response.json();
  },

  async update(token: string, id: string, data: Partial<Background>): Promise<Background> {
    const response = await fetch(`${API_URL}/backgrounds/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erreur mise à jour');
    return response.json();
  },

  async delete(token: string, id: string): Promise<void> {
    const response = await fetch(`${API_URL}/backgrounds/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Erreur suppression');
  },
};

// Pages disponibles
export const backgroundPages = [
  { value: 'home', label: 'Accueil', label_mg: 'Fandraisana' },
  { value: 'projects', label: 'Projets', label_mg: 'Tetikasa' },
  { value: 'events', label: 'Événements', label_mg: 'Hetsika' },
  { value: 'blog', label: 'Blog', label_mg: 'Bitsika' },
  { value: 'jobs', label: 'Offres d\'emploi', label_mg: 'Asa' },
  { value: 'contact', label: 'Contact', label_mg: 'Fifandraisana' },
  { value: 'about', label: 'À propos', label_mg: 'Momba anay' },
  { value: 'donate', label: 'Faire un don', label_mg: 'Hanome' },
  { value: 'join', label: 'Adhérer', label_mg: 'Hanara-maso' },
  { value: 'login', label: 'Connexion', label_mg: 'Hiditra' },
  { value: 'register', label: 'Inscription', label_mg: 'Hisoratra anarana' },
  { value: 'dashboard', label: 'Tableau de bord', label_mg: 'Takelaka' },
];