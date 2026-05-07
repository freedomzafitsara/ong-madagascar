// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ========================================
// CONFIGURATION DES ROUTES
// ========================================

// Routes publiques (accessibles sans authentification)
const publicPaths = [
  '/', '/login', '/register',
  '/projects', '/events', '/blog', '/contact', '/donate', '/join',
  '/emploi', '/about', '/partners', '/volunteers'
];

// Routes API publiques
const publicApiPaths = [
  '/api/jobs/offers',
  '/api/projects',
  '/api/events',
  '/api/blog',
  '/api/health',
  '/api/docs'
];

// Routes dashboard (protégées)
const dashboardPaths = ['/dashboard', '/profile', '/admin'];

// Routes API admin (nécessitent authentification)
const adminApiPaths = [
  '/api/jobs/offers/create',
  '/api/jobs/applications',
  '/api/dashboard'
];

// ========================================
// FONCTION PRINCIPALE DU MIDDLEWARE
// ========================================

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Récupérer le token (plusieurs sources possibles)
  const token = 
    request.cookies.get('token')?.value ||
    request.cookies.get('access_token')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '');
  
  const isAuthenticated = !!token;

  // ========================================
  // 1. VÉRIFIER SI LA ROUTE EST PUBLIQUE
  // ========================================
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
  
  const isPublicApi = publicApiPaths.some(apiPath => 
    path.startsWith(apiPath)
  );
  
  const isAdminApi = adminApiPaths.some(apiPath => 
    path.startsWith(apiPath)
  );
  
  const isAuthPath = path === '/login' || path === '/register';
  const isDashboardPath = dashboardPaths.some(dp => path.startsWith(dp));
  const isApiPath = path.startsWith('/api');

  // ========================================
  // 2. PROTECTION DES ROUTES DASHBOARD
  // ========================================
  if (isDashboardPath && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    loginUrl.searchParams.set('from', 'dashboard');
    return NextResponse.redirect(loginUrl);
  }

  // ========================================
  // 3. REDIRECTION SI DÉJÀ CONNECTÉ
  // ========================================
  if (isAuthenticated && isAuthPath) {
    // Vérifier s'il y a une redirection prévue
    const redirectTo = request.nextUrl.searchParams.get('redirect');
    if (redirectTo && redirectTo.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ========================================
  // 4. PROTECTION DES ROUTES API ADMIN
  // ========================================
  if (isApiPath && !isPublicApi && !isAuthenticated) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Non autorisé', 
        message: 'Veuillez vous connecter pour accéder à cette ressource',
        status: 401 
      }),
      { 
        status: 401, 
        headers: { 
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer'
        } 
      }
    );
  }

  // ========================================
  // 5. PROTECTION SPÉCIFIQUE POUR LES API ADMIN
  // ========================================
  if (isAdminApi && !isAuthenticated) {
    return new NextResponse(
      JSON.stringify({ error: 'Accès administrateur requis', status: 403 }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // ========================================
  // 6. AJOUT DES EN-TÊTES DE SÉCURITÉ
  // ========================================
  const response = NextResponse.next();
  
  // En-têtes de sécurité
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Cache control pour les pages authentifiées
  if (isAuthenticated) {
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
  }
  
  return response;
}

// ========================================
// CONFIGURATION DU MATCHER
// ========================================
export const config = {
  matcher: [
    // Routes dashboard
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
    // Routes d'authentification
    '/login',
    '/register',
    // Routes API
    '/api/:path*',
    // Exclure les fichiers statiques
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)',
  ],
};