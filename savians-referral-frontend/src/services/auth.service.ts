/**
 * Auth Service
 * 
 * Handles authentication-related API calls
 */

import { api } from './api';
import type { SignupInput, UserProfile } from '@/types/api.types';

export const authService = {
  /**
   * POST /api/auth/signup
   * Partner signup with invite token
   */
  signup: async (data: SignupInput) => {
    return api.post('/api/auth/signup', data);
  },

  /**
   * POST /api/auth/activate
   * Activate partner account after Cognito confirmation
   */
  activate: async (cognitoUserId: string) => {
    return api.post('/api/auth/activate', { cognitoUserId });
  },

  /**
   * GET /api/auth/profile
   * Get current user's profile
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/api/auth/profile');
    return response.data;
  },

  /**
   * POST /api/auth/switch-role
   * Switch between ADMIN and SUPER_ADMIN roles (for users with multiple roles)
   */
  switchRole: async (targetRole: 'ADMIN' | 'SUPER_ADMIN'): Promise<UserProfile> => {
    const response = await api.post<UserProfile>('/api/auth/switch-role', { targetRole });
    return response.data;
  },
};
