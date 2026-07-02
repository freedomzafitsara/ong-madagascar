// frontend/src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================
// ROUTES PAR ROLE - CONFIGURATION
// ============================================================

// Routes publiques (sans authentification)
const PUBLIC_ROUTES = [
  '/',
  '/jobs',
  '/jobs/:path*',
  '/projects',
  '/projects/:path*',
  '/blog',
  '/blog/:path*',
  '/contact',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

// Routes API publiques
const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/jobs/offers/public',
  '/api/jobs/offers/featured',
  '/api/jobs/offers/public/:path*',
  '/api/projects/public',
  '/api/blog/public',
  '/api/pages/backgrounds',
  '/api/pages/public',
];

// Routes candidats (accessibles aux candidats uniquement)
const CANDIDATE_ROUTES = [
  '/candidate',
  '/candidate/:path*',
];

// Routes admin (accessibles aux admins uniquement)
const ADMIN_ROUTES = [
  '/dashboard',
  '/dashboard/:path*',
  '/admin',
  '/admin/:path*',
];

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

function matchRoute(pathname: string, route: string): boolean {
  if (route.includes(':path*')) {
    const base = route.replace('/:path*', '');
    return pathname === base || pathname.startsWith(base + '/');
  }
  return pathname === route || pathname.startsWith(route + '/');
}

function isRouteProtected(pathname: string, routes: string[]): boolean {
  return routes.some(route => matchRoute(pathname, route));
}

function getUserFromCookie(request: NextRequest): any | null {
  try {
    const userCookie = request.cookies.get('user')?.value;
    if (userCookie) {
      return JSON.parse(decodeURIComponent(userCookie));
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================================
// MIDDLEWARE PRINCIPAL
// ============================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`[Middleware] Path: ${pathname}`);

  // ============================================================
  // 1. EXCLURE LES RESSOURCES STATIQUES
  // ============================================================

  const isStaticResource = 
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.') && !pathname.includes('/api/');
  
  if (isStaticResource) {
    return NextResponse.next();
  }

  // ============================================================
  // 2. RECUPERER LES DONNEES DE SESSION
  // ============================================================

  const token = request.cookies.get('access_token')?.value || 
                request.cookies.get('token')?.value;
  
  let userRole: string | null = null;
  let userData = getUserFromCookie(request);
  
  if (userData) {
    userRole = userData.role;
  }

  // ============================================================
  // 3. VERIFIER LES ROUTES PUBLIQUES
  // ============================================================

  const isPublic = isRouteProtected(pathname, PUBLIC_ROUTES);
  
  if (isPublic) {
    console.log('[Middleware] Route publique');
    return NextResponse.next();
  }

  // ============================================================
  // 4. VERIFIER LES ROUTES API PUBLIQUES
  // ============================================================

  const isPublicApi = isRouteProtected(pathname, PUBLIC_API_ROUTES);
  
  if (isPublicApi) {
    console.log('[Middleware] API publique');
    return NextResponse.next();
  }

  // ============================================================
  // 5. VERIFIER L'AUTHENTIFICATION
  // ============================================================

  if (!token) {
    console.log('[Middleware] Non authentifie - Redirection vers login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ============================================================
  // 6. VERIFIER LES ROUTES ADMIN
  // ============================================================

  const isAdminRoute = isRouteProtected(pathname, ADMIN_ROUTES);
  
  if (isAdminRoute) {
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      console.log('[Middleware] Acces non autorise - Redirection vers /');
      return NextResponse.redirect(new URL('/', request.url));
    }
    console.log('[Middleware] Admin autorise');
    return NextResponse.next();
  }

  // ============================================================
  // 7. VERIFIER LES ROUTES CANDIDAT
  // ============================================================

  const isCandidateRoute = isRouteProtected(pathname, CANDIDATE_ROUTES);
  
  if (isCandidateRoute) {
    if (userRole === 'admin' || userRole === 'super_admin') {
      console.log('[Middleware] Admin sur route candidat - Redirection vers dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (userRole !== 'candidate') {
      console.log('[Middleware] Non candidat - Redirection vers /');
      return NextResponse.redirect(new URL('/', request.url));
    }
    console.log('[Middleware] Candidat autorise');
    return NextResponse.next();
  }

  // ============================================================
  // 8. VERIFIER LES ROUTES API PROTE GEES
  // ============================================================

  if (pathname.startsWith('/api/')) {
    console.log('[Middleware] API protegee - Verification token');
    // Le token est deja verifie a l'etape 5
    return NextResponse.next();
  }

  // ============================================================
  // 9. PAR DEFAUT - TOUT EST PROTEGE
  // ============================================================

  console.log('[Middleware] Route protegee par defaut');
  return NextResponse.next();
}

// ============================================================
// CONFIGURATION DU MIDDLEWARE
// ============================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - images folder
     * - uploads folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|images|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};