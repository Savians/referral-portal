/**
 * Admin Service
 * 
 * Handles admin portal API calls
 */

import { api } from './api';
import type {
  AdminDashboard,
  PartnerApplication,
  CreateInviteInput,
  UpdateReferralStatusInput,
  AdminReferralDetail,
  AdminPayment,
  AdminPaymentDetail,
  ApprovePaymentInput,
  RejectPaymentInput,
  MarkPaidInput,
  PaginatedResponse,
} from '@/types/api.types';

export const adminService = {
  /**
   * GET /api/admin/dashboard
   * Get admin dashboard data
   */
  getDashboard: async (): Promise<AdminDashboard> => {
    const response = await api.get<AdminDashboard>('/api/admin/dashboard');
    return response.data;
  },

  /**
   * GET /api/admin/applications
   * List partner applications
   */
  listApplications: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    return api.get<PartnerApplication[]>('/api/admin/applications', { params });
  },

  /**
   * PUT /api/admin/applications/{id}/approve
   * Approve a partner application
   */
  approveApplication: async (id: string) => {
    return api.put(`/api/admin/applications/${id}/approve`);
  },

  /**
   * PUT /api/admin/applications/{id}/reject
   * Reject a partner application
   */
  rejectApplication: async (id: string, reason?: string) => {
    return api.put(`/api/admin/applications/${id}/reject`, { reason });
  },

  /**
   * GET /api/admin/partners
   * List partners
   */
  listPartners: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    return api.get('/api/admin/partners', { params });
  },

  /**
   * GET /api/admin/partners/{id}
   * Get partner details
   */
  getPartner: async (id: string) => {
    return api.get(`/api/admin/partners/${id}`);
  },

  /**
   * PUT /api/admin/partners/{id}/suspend
   * Suspend a partner
   */
  suspendPartner: async (id: string, reason: string) => {
    return api.put(`/api/admin/partners/${id}/suspend`, { suspendReason: reason });
  },

  /**
   * PUT /api/admin/partners/{id}/unsuspend
   * Unsuspend (reactivate) a partner
   */
  unsuspendPartner: async (id: string, reason?: string) => {
    return api.put(`/api/admin/partners/${id}/unsuspend`, { unsuspendReason: reason });
  },

  /**
   * DELETE /api/admin/partners/{id}
   * Delete a partner (soft delete with 24-hour restoration window)
   */
  deletePartner: async (id: string) => {
    return api.delete(`/api/admin/partners/${id}`);
  },

  /**
   * POST /api/admin/partners/{id}/restore
   * Restore a deleted partner (within 24 hours)
   */
  restorePartner: async (id: string) => {
    return api.post(`/api/admin/partners/${id}/restore`);
  },

  /**
   * GET /api/admin/referrals
   * List all referrals
   */
  listReferrals: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    partnerId?: string;
  }) => {
    return api.get('/api/admin/referrals', { params });
  },

  /**
   * GET /api/admin/referrals/{referralId}
   * Get referral details (admin view)
   */
  getReferral: async (referralId: string): Promise<AdminReferralDetail> => {
    const response = await api.get<AdminReferralDetail>(`/api/admin/referrals/${referralId}`);
    return response.data;
  },

  /**
   * PUT /api/admin/referrals/{referralId}/status
   * Update referral status
   */
  updateReferralStatus: async (referralId: string, data: UpdateReferralStatusInput) => {
    return api.put(`/api/admin/referrals/${referralId}/status`, data);
  },

  /**
   * GET /api/payments
   * List all payments
   */
  listPayments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    partnerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<AdminPayment>> => {
    const response = await api.get<AdminPayment[]>('/api/payments', { params });
    return {
      data: response.data,
      meta: response.meta!,
    };
  },

  /**
   * GET /api/payments/{id}
   * Get payment details with tier snapshot and audit history
   */
  getPayment: async (id: string): Promise<AdminPaymentDetail> => {
    const response = await api.get<AdminPaymentDetail>(`/api/payments/${id}`);
    return response.data;
  },

  /**
   * PUT /api/payments/{id}/review
   * Review a payment (Step 1 before approval)
   */
  reviewPayment: async (id: string, input: { suggestedAmount: number; notes?: string }) => {
    return api.put(`/api/payments/${id}/review`, input);
  },

  /**
   * PUT /api/payments/{id}/approve
   * Approve a payment
   */
  approvePayment: async (id: string, input: ApprovePaymentInput) => {
    return api.put(`/api/payments/${id}/approve`, input);
  },

  /**
   * PUT /api/payments/{id}/reject
   * Reject a payment
   */
  rejectPayment: async (id: string, input: RejectPaymentInput) => {
    return api.put(`/api/payments/${id}/reject`, input);
  },

  /**
   * PUT /api/payments/{id}/mark-paid
   * Mark payment as paid
   */
  markPaymentPaid: async (id: string, input: MarkPaidInput) => {
    return api.put(`/api/payments/${id}/mark-paid`, input);
  },

  /**
   * GET /api/admin/invites
   * List invites
   */
  listInvites: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    return api.get('/api/admin/invites', { params });
  },

  /**
   * POST /api/admin/invites
   * Create a new invite
   */
  createInvite: async (data: CreateInviteInput) => {
    return api.post('/api/admin/invites', data);
  },

  /**
   * GET /api/admin/audit-log
   * Get audit log
   */
  getAuditLog: async (params?: {
    page?: number;
    limit?: number;
    entityType?: string;
    action?: string;
  }) => {
    return api.get('/api/admin/audit-log', { params });
  },
};
