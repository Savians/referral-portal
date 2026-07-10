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
   * POST /api/partner/referrals/{referralId}/resend-email
   * Resend welcome email to client
   */
  resendReferralEmail: async (referralId: string): Promise<void> => {
    await api.post(`/api/partner/referrals/${referralId}/resend-email`);
  },

  /**
   * PUT /api/partner/referrals/{referralId}/year
   * Update referral year
   */
  updateReferralYear: async (referralId: string, year: number): Promise<void> => {
    await api.put(`/api/partner/referrals/${referralId}/year`, { year });
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

  /**
   * GET /api/partner/agreement/current
   * Get current agreement status and details
   */
  getCurrentAgreement: async () => {
    const response = await api.get(`/api/partner/agreement/current?t=${Date.now()}`);
    return response.data;
  },

  /**
   * GET /api/partner/agreement/pdf/{agreementId}
   * Get signed agreement PDF download URL
   */
  getAgreementPdf: async (agreementId: string) => {
    const response = await api.get(`/api/partner/agreement/pdf/${agreementId}?t=${Date.now()}`);
    return response.data;
  },

  /**
   * GET /api/partner/profile
   * Get complete partner profile including W-9 and banking info
   */
  getProfile: async () => {
    const response = await api.get('/api/partner/profile');
    return response.data;
  },

  /**
   * POST /api/partner/w9/submit
   * Submit W-9 form
   */
  submitW9: async (data: {
    taxClassification: string;
    llcTaxClassification?: string;
    otherTaxClassification?: string;
    hasForeignPartners?: boolean;
    exemptPayeeCode?: string;
    fatcaExemptionCode?: string;
    tinType: 'ssn' | 'ein';
    tinEin: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }) => {
    const response = await api.post('/api/partner/w9/submit', data);
    return response.data;
  },

  /**
   * GET /api/partner/w9/status
   * Check W-9 completion status
   */
  getW9Status: async () => {
    const response = await api.get('/api/partner/w9/status');
    return response.data;
  },

  /**
   * GET /api/partner/w9/download
   * Get W-9 PDF download URL
   */
  downloadW9: async () => {
    const response = await api.get('/api/partner/w9/download');
    return response.data;
  },

  /**
   * POST /api/partner/banking/submit
   * Submit banking details
   */
  submitBankingDetails: async (data: {
    bankName: string;
    routingNumber: string;
    accountNumber: string;
    zelleId: string;
  }) => {
    const response = await api.post('/api/partner/banking/submit', data);
    return response.data;
  },

  /**
   * GET /api/partner/banking/details
   * Get banking details
   */
  getBankingDetails: async () => {
    const response = await api.get('/api/partner/banking/details');
    return response.data;
  },

  /**
   * PUT /api/partner/banking/update
   * Update banking details
   */
  updateBankingDetails: async (data: {
    bankName: string;
    routingNumber: string;
    accountNumber: string;
    zelleId: string;
  }) => {
    const response = await api.put('/api/partner/banking/update', data);
    return response.data;
  },
};
