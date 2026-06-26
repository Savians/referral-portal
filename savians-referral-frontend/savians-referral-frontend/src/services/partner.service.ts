/**
 * Partner Service
 * 
 * Handles partner portal API calls
 */

import { api } from './api';
import type {
  PartnerDashboard,
  PartnerReferral,
  PartnerReferralDetail,
  PartnerPayment,
  UpdateProfileInput,
  PaginatedResponse,
} from '@/types/api.types';

export const partnerService = {
  /**
   * GET /api/partner/dashboard
   * Get partner dashboard data
   */
  getDashboard: async (): Promise<PartnerDashboard> => {
    const response = await api.get<PartnerDashboard>('/api/partner/dashboard');
    return response.data;
  },

  /**
   * GET /api/partner/referrals
   * List partner's referrals (paginated)
   */
  listReferrals: async (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    status?: string;
  }): Promise<PaginatedResponse<PartnerReferral>> => {
    const response = await api.get<PartnerReferral[]>('/api/partner/referrals', {
      params,
    });
    return {
      data: response.data,
      meta: response.meta!,
    };
  },

  /**
   * GET /api/partner/referrals/{referralId}
   * Get referral detail
   */
  getReferral: async (referralId: string): Promise<PartnerReferralDetail> => {
    const response = await api.get<PartnerReferralDetail>(
      `/api/partner/referrals/${referralId}`
    );
    return response.data;
  },

  /**
   * GET /api/partner/payments
   * List partner's payments
   */
  listPayments: async (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<PartnerPayment>> => {
    const response = await api.get<PartnerPayment[]>('/api/partner/payments', {
      params,
    });
    return {
      data: response.data,
      meta: response.meta!,
    };
  },

  /**
   * PUT /api/partner/profile
   * Update partner profile
   */
  updateProfile: async (data: UpdateProfileInput) => {
    return api.put('/api/partner/profile', data);
  },

  /**
   * POST /api/partner/documents/upload-url
   * Request presigned URL for document upload
   */
  requestUploadUrl: async (data: {
    documentType: string;
    fileName: string;
    mimeType: string;
    fileSizeBytes: number;
  }) => {
    return api.post('/api/partner/documents/upload-url', data);
  },

  /**
   * GET /api/partner/documents
   * List partner's documents
   */
  listDocuments: async () => {
    return api.get('/api/partner/documents');
  },
};
