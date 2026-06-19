'use client';

/**
 * Protected Route Hook
 * 
 * Ensures user is authenticated and has correct role
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import type { UserRole } from '@/types/api.types';

export function useProtectedRoute(allowedRoles?: UserRole[]) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Check role authorization
      if (allowedRoles && user) {
        const hasPermission = allowedRoles.includes(user.role);
        if (!hasPermission) {
          // Redirect to appropriate dashboard based on role
          if (user.role === 'PARTNER') {
            router.push('/partner/dashboard');
          } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            router.push('/admin/dashboard');
          } else {
            router.push('/');
          }
        }
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  return { user, isLoading, isAuthenticated };
}
