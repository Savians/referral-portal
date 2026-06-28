'use client';

/**
 * Auth Provider
 * 
 * Manages authentication state and provides auth context
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, signIn, signOut as cognitoSignOut, getUserRole } from '@/lib/cognito';
import { authService } from '@/services/auth.service';
import type { UserProfile, UserRole } from '@/types/api.types';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        // Fetch user profile from backend
        const profile = await authService.getProfile();
        setUser(profile);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Sign in with Cognito
      await signIn({ email, password });

      // Fetch user profile from backend
      const profile = await authService.getProfile();
      console.log('User profile loaded:', profile);
      setUser(profile);

      // Redirect based on role - use window.location for hard redirect
      if (profile.role === 'PARTNER') {
        console.log('Redirecting to partner dashboard');
        window.location.href = '/partner/dashboard';
      } else if (profile.role === 'SUPER_ADMIN') {
        console.log('Redirecting to superadmin dashboard');
        window.location.href = '/superadmin/dashboard';
      } else if (profile.role === 'ADMIN') {
        console.log('Redirecting to admin dashboard');
        window.location.href = '/admin/dashboard';
      } else {
        console.log('Unknown role, redirecting to home');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Login error in AuthProvider:', error);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await cognitoSignOut();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Refresh user failed:', error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
