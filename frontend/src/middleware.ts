// frontend/src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================
// ROUTES PUBLIQUES (accessibles à tous)
// ============================================================

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
  '/api/auth/login',
  '/api/auth/register',
  '/api/pages/backgrounds/:path*',
  '/api/pages/public/:path*',
  '/api/jobs/offers/public',
  '/api/jobs/offers/featured',
  '/api/projects/public',
  '/api/projects/featured',
  '/api/blog/public',
];

// ============================================================
// ROUTES CANDIDATS (accessibles aux candidats et admins)
// ============================================================

const CANDIDATE_ROUTES = [
  '/jobs/:id/apply',
  '/api/jobs/apply',
  '/profile/applications',
];

// ============================================================
// ROUTES ADMIN (accessibles uniquement aux admins)
// ============================================================

const ADMIN_ROUTES = [
  '/dashboard',
  '/dashboard/:path*',
  '/api/admin/:path*',
  '/api/jobs/offers',
  '/api/jobs/offers/:path*',
  '/api/jobs/applications',
  '/api/jobs/applications/:path*',
  '/api/projects',
  '/api/projects/:path*',
  '/api/blog',
  '/api/blog/:path*',
  '/api/pages/backgrounds/all',
  '/api/pages/backgrounds/admin/:path*',
  '/api/upload/:path*',
];

// ============================================================
// MIDDLEWARE
// ============================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Récupérer le token et le rôle depuis les cookies ou localStorage
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '');

  let userRole: string | null = null;
  try {
    const userCookie = request.cookies.get('user')?.value;
    if (userCookie) {
      const user = JSON.parse(userCookie);
      userRole = user.role;
    }
  } catch {
    // Ignorer
  }

  // ============================================================
  // 1. VÉRIFICATION DES ROUTES PUBLIQUES
  // ============================================================

  // Vérifier si la route est publique
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    if (route.includes(':path*')) {
      const baseRoute = route.replace('/:path*', '');
      return pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // ============================================================
  // 2. VÉRIFICATION DE L'AUTHENTIFICATION
  // ============================================================

  if (!token) {
    // Rediriger vers login si non authentifié
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ============================================================
  // 3. VÉRIFICATION DES ROUTES ADMIN
  // ============================================================

  const isAdminRoute = ADMIN_ROUTES.some(route => {
    if (route.includes(':path*')) {
      const baseRoute = route.replace('/:path*', '');
      return pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  if (isAdminRoute) {
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      // Rediriger vers l'accueil
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // ============================================================
  // 4. VÉRIFICATION DES ROUTES CANDIDATS
  // ============================================================

  const isCandidateRoute = CANDIDATE_ROUTES.some(route => {
    if (route.includes(':id')) {
      // Gérer les routes dynamiques comme /jobs/:id/apply
      const pattern = route.replace(':id', '[^/]+');
      return new RegExp(`^${pattern}$`).test(pathname);
    }
    return pathname === route;
  });

  if (isCandidateRoute) {
    if (userRole !== 'candidate' && userRole !== 'admin' && userRole !== 'super_admin') {
      // Rediriger vers login ou inscription
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      return NextResponse.redirect(new URL('/register?role=candidate', request.url));
    }
    return NextResponse.next();
  }

  // ============================================================
  // 5. PAR DÉFAUT : TOUT EST PROTÉGÉ
  // ============================================================

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// ============================================================
// CONFIGURATION DES ROUTES À INTERCEPTEUR
// ============================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};