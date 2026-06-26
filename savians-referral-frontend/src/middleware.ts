/**
 * Next.js Middleware
 * 
 * Handles route protection at the edge
 * 
 * SECURITY MODEL:
 * ================
 * 
 * 1. MIDDLEWARE (Edge) - Light protection:
 *    - Allows public routes (/, /login, /apply, /signup)
 *    - Allows public referral forms (/partner/RP-xxxx)
 *    - Does NOT block protected routes because Cognito stores tokens in localStorage
 *      (which middleware cannot access - it runs on the server edge)
 * 
 * 2. AUTH PROVIDER (Client) - Strong protection:
 *    - Runs on every page load
 *    - Validates Cognito tokens from localStorage
 *    - Redirects unauthenticated users to /login
 *    - Uses useProtectedRoute hook on protected pages
 * 
 * 3. API LAYER (Backend) - Strongest protection:
 *    - Every API request requires valid JWT in Authorization header
 *    - Backend validates token with Cognito
 *    - Role-based authorization (ADMIN, PARTNER, SUPER_ADMIN)
 *    - Returns 401 if token invalid, 403 if insufficient permissions
 * 
 * DEFENSE IN DEPTH:
 * =================
 * Even if someone bypasses middleware or AuthProvider, the API will reject
 * unauthorized requests. The UI protection is for UX, the API protection is for security.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/apply',
  '/signup',
];

// Routes that match public referral form pattern: /partner/RP-xxxx
const PUBLIC_REFERRAL_PATTERN = /^\/partner\/RP-\d+$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);
  const isPublicReferralForm = PUBLIC_REFERRAL_PATTERN.test(pathname);

  // Allow public routes
  if (isPublicRoute || isPublicReferralForm) {
    return NextResponse.next();
  }

  // Check for Cognito authentication cookies
  // Cognito stores tokens in localStorage, but also creates cookies
  // We check for the idToken cookie or any Cognito-related cookie
  const cookies = request.cookies.getAll();
  const hasCognitoCookie = cookies.some(cookie => 
    cookie.name.includes('CognitoIdentityServiceProvider') ||
    cookie.name.includes('idToken') ||
    cookie.name.includes('accessToken')
  );

  // Protected routes require authentication
  if (pathname.startsWith('/partner/') || pathname.startsWith('/admin/') || pathname.startsWith('/superadmin/')) {
    // Don't redirect if already on login page
    if (pathname === '/login') {
      return NextResponse.next();
    }

    // Allow through for now - actual auth is handled by API and AuthProvider
    // Middleware in Next.js doesn't have access to localStorage where Cognito stores tokens
    // The AuthProvider on client-side handles the real authentication check
    return NextResponse.next();
  }

  return NextResponse.next();
}

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
