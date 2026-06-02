// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes PUBLIQUES (accessibles sans connexion)
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/jobs',
  '/projects',
  '/blog',
  '/contact',
];

// Routes API PUBLIQUES
const PUBLIC_API_ROUTES = [
  '/api/jobs/offers',
  '/api/jobs/offers/public',
  '/api/jobs/apply',
  '/api/projects',
  '/api/projects/public',
  '/api/blog',
  '/api/blog/public',
  '/api/contact',
  '/api/health',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  //  Vérifier si la route est publique (exacte ou commence par)
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  //  Vérifier si l'API est publique
  const isPublicApi = PUBLIC_API_ROUTES.some(api => 
    pathname.startsWith(api)
  );
  
  //  Si route publique => LAISSER PASSER IMMÉDIATEMENT
  if (isPublicRoute || isPublicApi) {
    return NextResponse.next();
  }
  
  //  Pour les autres routes, vérifier l'authentification
  const token = request.cookies.get('token')?.value || 
                request.cookies.get('access_token')?.value;
  
  // Routes dashboard nécessitent authentification
  if (pathname.startsWith('/dashboard') && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Routes API protégées
  if (pathname.startsWith('/api') && !token) {
    return new NextResponse(
      JSON.stringify({ error: 'Non autorisé', status: 401 }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|images|uploads).*)',
  ],
};