/**
 * Public Service
 * 
 * Handles public (unauthenticated) API calls
 */

import { api } from './api';
import type {
  CreateApplicationInput,
  CreateReferralInput,
  ReferralSubmissionResponse,
  ReferralFormData,
  InviteValidationResponse,
} from '@/types/api.types';

export const publicService = {
  /**
   * POST /api/public/applications
   * Submit partner application form
   */
  submitApplication: async (data: CreateApplicationInput) => {
    return api.post('/api/public/applications', data);
  },

  /**
   * GET /api/public/referral-form/{partnerId}
   * Validate partner and get referral form data
   */
  getReferralFormData: async (partnerId: string): Promise<ReferralFormData> => {
    const response = await api.get<ReferralFormData>(
      `/api/public/referral-form/${partnerId}`
    );
    return response.data;
  },

  /**
   * POST /api/public/referrals
   * Submit a referral
   */
  submitReferral: async (data: CreateReferralInput): Promise<ReferralSubmissionResponse> => {
    const response = await api.post<ReferralSubmissionResponse>('/api/public/referrals', data);
    return response.data;
  },

  /**
   * GET /api/public/invite/validate/{token}
   * Validate invite token
   */
  validateInvite: async (token: string): Promise<InviteValidationResponse> => {
    const response = await api.get<InviteValidationResponse>(
      `/api/public/invite/validate/${token}`
    );
    return response.data;
  },
};
