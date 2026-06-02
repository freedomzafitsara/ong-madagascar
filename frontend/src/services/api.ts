// src/services/api.ts

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Routes publiques qui ne doivent PAS avoir de token
const publicRoutes = [
  '/pages/public/',
  '/pages/backgrounds/',
  '/jobs/offers/public',
  '/projects/public',
  '/blog/public',
  '/contact',
  '/health',
];

api.interceptors.request.use((config) => {
  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
  
  if (!isPublicRoute) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});

export default api;