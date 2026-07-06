// frontend/src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================
// ROUTES PAR ROLE - CONFIGURATION
// ============================================================

// Routes publiques (sans authentification)
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

// Routes API publiques
const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/profile',
  '/api/jobs/offers/public',
  '/api/jobs/offers/featured',
  '/api/projects/public',
  '/api/blog/public',
  '/api/pages/backgrounds',
  '/api/pages/public',
];

// Routes candidats (accessibles aux candidats uniquement)
const CANDIDATE_ROUTES = [
  '/candidate',
  '/candidate/profil-candidat',
  '/candidate/applications',
  '/candidate/saved-jobs',
];

// Routes admin (accessibles aux admins uniquement)
const ADMIN_ROUTES = [
  '/dashboard',
  '/dashboard/profil-admin',
  '/dashboard/users',
  '/dashboard/jobs',
  '/dashboard/projects',
  '/dashboard/blog',
  '/dashboard/settings',
];

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

function matchRoute(pathname: string, route: string): boolean {
  if (route.includes('/:')) {
    const pattern = route.replace(/\/:[^/]+/g, '/[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  }
  return pathname === route || pathname.startsWith(route + '/');
}

function isRouteProtected(pathname: string, routes: string[]): boolean {
  return routes.some(route => matchRoute(pathname, route));
}

function getToken(request: NextRequest): string | null {
  const tokenFromCookie = request.cookies.get('access_token')?.value || 
                          request.cookies.get('token')?.value;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

function getUserRole(request: NextRequest): string | null {
  try {
    const userCookie = request.cookies.get('user')?.value;
    if (userCookie) {
      const user = JSON.parse(decodeURIComponent(userCookie));
      return user.role || null;
    }

    const roleCookie = request.cookies.get('user_role')?.value;
    if (roleCookie) {
      return roleCookie;
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

  const token = getToken(request);
  const userRole = getUserRole(request);

  console.log(`[Middleware] Token: ${token ? 'present' : 'absent'}, Role: ${userRole || 'aucun'}`);

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
    '/((?!_next/static|_next/image|favicon.ico|public|images|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};