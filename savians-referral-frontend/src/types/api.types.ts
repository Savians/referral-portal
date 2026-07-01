/**
 * API Type Definitions
 * 
 * Derived directly from backend controllers and schemas.
 * Source of truth: savians-referral-backend/src/services/*
 */

// ============================================
// COMMON TYPES
// ============================================

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'PARTNER';

export type PartnerStatus = 'ACTIVE' | 'SUSPENDED';

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ReferralStatus =
  | 'NEW_REFERRAL'
  | 'UNDER_REVIEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'NOT_QUALIFIED'
  | 'CLIENT_AGREEMENT_SIGNED'
  | 'PAYMENT_RECEIVED'
  | 'ELIGIBLE_FOR_PAYOUT'
  | 'COMMISSION_PAID'
  | 'DUPLICATE_FLAGGED'
  | 'LOST';

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';

export type DocumentType = 'W9_FORM' | 'AGREEMENT' | 'OTHER';

export type SubmissionSource = 'SELF_SUBMITTED' | 'PARTNER_SUBMITTED';

export const REFERRAL_STATUS_LABELS: Record<ReferralStatus, string> = {
  NEW_REFERRAL: 'New Referral',
  UNDER_REVIEW: 'Under Review',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  NOT_QUALIFIED: 'Not Qualified',
  CLIENT_AGREEMENT_SIGNED: 'Agreement Signed',
  PAYMENT_RECEIVED: 'Payment Received',
  ELIGIBLE_FOR_PAYOUT: 'Eligible for Payout',
  COMMISSION_PAID: 'Commission Paid',
  DUPLICATE_FLAGGED: 'Duplicate Flagged',
  LOST: 'Lost',
};

// ============================================
// PUBLIC SERVICE TYPES
// ============================================

// POST /api/public/applications
export interface CreateApplicationInput {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  companyName?: string;
  businessType?: string;
  message?: string;
  agreementVersion?: string;
  agreementText?: string;
  signatureDataUrl?: string;
  agreementDate?: string;
}

// POST /api/public/referrals
export interface CreateReferralInput {
  partnerId: string; // Format: RP-9271
  clientFullName: string;
  clientEmail: string;
  clientPhone?: string;
  estimatedIncome?: string;
  serviceNeeded?: string;
  additionalNotes?: string;
  consentGiven: true;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// Response from POST /api/public/referrals
export interface ReferralSubmissionResponse {
  id: string;
  referralId: string;
  status: ReferralStatus;
  isDuplicate: boolean;
  calendlyUrl: string; // Calendly redirect URL with partner parameter
  message: string;
}

// GET /api/public/referral-form/{partnerId}
export interface ReferralFormData {
  partnerId: string;
  partnerDisplayId: string;
  partnerName: string;
}

// GET /api/public/invite/validate/{token}
export interface InviteValidationResponse {
  valid: boolean;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  businessName?: string | null;
  businessType?: string | null;
}

// ============================================
// AUTH SERVICE TYPES
// ============================================

// POST /api/auth/signup
export interface SignupInput {
  inviteToken: string;
  email: string;
  fullName: string;
  phone: string;
  password: string;
  businessName?: string;
  jobTitle?: string;
}

// GET /api/auth/profile
export interface UserProfile {
  cognitoUserId: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  availableRoles?: UserRole[]; // All roles this user has access to (same email, different accounts)
  hasSuperAdminAccess?: boolean; // Quick check if user has SUPER_ADMIN role available
  partnerId?: string; // Present if role is PARTNER (extracted from partner.partnerId)
  partner?: {
    id: string;
    partnerId: string;
    email: string;
    fullName: string;
    phone: string | null;
    city: string | null;
    state: string | null;
    address: string | null;
    businessName: string | null;
    jobTitle: string | null;
    partnerType: string | null;
    referralAudience: string | null;
    estimatedVolume: string | null;
    paymentMethod: string | null;
    legalName: string | null;
    w9Status: string | null;
    status: string;
    onboardingMethod: string;
    approvedAt: string | null;
    hasAcceptedAgreement: boolean;
    agreementAcceptedAt: string | null;
    createdAt: string;
  }; // Full partner profile if role is PARTNER
}

// ============================================
// PARTNER SERVICE TYPES
// ============================================

// GET /api/partner/dashboard
export interface PartnerDashboard {
  partner: {
    id: string;
    partnerId: string;
    fullName: string;
    status: PartnerStatus;
    memberSince: string;
  };
  referrals: {
    total: number;
    byStatus: Record<string, { count: number; label: string }>;
  };
  recentReferrals: Array<{
    id: string;
    referralId: string;
    clientFullName: string;
    status: ReferralStatus;
    statusLabel: string;
    createdAt: string;
  }>;
  payments: {
    total: number;
    totalApprovedAmount: number | null;
  };
  documents: {
    total: number;
  };
}

// GET /api/partner/referrals (paginated list)
export interface PartnerReferral {
  id: string;
  referralId: string;
  clientFullName: string;
  clientEmail: string;
  status: ReferralStatus;
  statusLabel: string;
  isDuplicate: boolean;
  submissionSource: SubmissionSource;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedReferralsResponse {
  data: PartnerReferral[];
  meta: PaginationMeta;
}

// GET /api/partner/referrals/{referralId}
export interface PartnerReferralDetail {
  id: string;
  referralId: string;
  clientFullName: string;
  clientEmail: string;
  clientPhone: string | null;
  estimatedIncome: string | null;
  serviceNeeded: string | null;
  additionalNotes: string | null;
  consentGiven: boolean;
  status: ReferralStatus;
  statusLabel: string;
  isDuplicate: boolean;
  submissionSource: SubmissionSource;
  createdAt: string;
  updatedAt: string;
  statusHistory: Array<{
    id: string;
    oldStatus: ReferralStatus | null;
    oldStatusLabel: string | null;
    newStatus: ReferralStatus;
    newStatusLabel: string;
    notes: string | null;
    changedAt: string;
  }>;
  payment: {
    id: string;
    status: PaymentStatus;
    approvedAmount: number | null;
    paymentDate: string | null;
    createdAt: string;
  } | null;
}

// PUT /api/partner/profile
export interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
  city?: string;
  state?: string;
  address?: string;
  businessName?: string;
  jobTitle?: string;
  partnerType?: string;
  referralAudience?: string;
  estimatedVolume?: string;
  paymentMethod?: string;
  legalName?: string;
}

// GET /api/partner/payments
export interface PartnerPayment {
  id: string;
  referralId: string;
  status: PaymentStatus;
  approvedAmount: number | null;
  paymentMethod: string | null;
  paymentDate: string | null;
  createdAt: string;
  referral: {
    referralId: string;
    clientFullName: string;
  };
}

// ============================================
// PAYOUT TIER SNAPSHOT (Phase 3)
// ============================================

/**
 * Payout Tier Snapshot
 * Stored as JSONB in payment record for historical accuracy
 */
export interface PayoutTierSnapshot {
  tierId: string;
  label: string;
  minReferrals: number;
  maxReferrals: number | null;
  payoutAmount: number;
  displayOrder: number;
  isActive: boolean;
  generatedAt: string;
}

// ============================================
// ADMIN PAYMENT TYPES (Phase 5)
// ============================================

/**
 * Payment Audit Log Entry
 * Tracks all changes to payment status and fields
 */
export interface PaymentAuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  performedById: string | null;
  performedByRole: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, any> | null;
  performedAt: string;
  performedBy: {
    fullName: string;
    email: string;
    role: UserRole;
  } | null;
}

/**
 * Admin Payment Detail (GET /api/payments/{id})
 * Complete payment information with relations and audit history
 */
export interface AdminPaymentDetail {
  id: string;
  referralId: string;
  partnerId: string;
  status: PaymentStatus;

  // Phase 3 fields
  calculatedAmount: string | null; // Decimal as string
  successfulReferralCount: number;
  payoutTierSnapshot: PayoutTierSnapshot | null;

  // Old fields (will be removed Phase 15)
  suggestedAmount: string | null;
  adminReviewedBy: string | null;
  adminReviewedAt: string | null;

  // Standard fields
  approvedAmount: string | null; // Decimal as string
  paymentMethod: string | null;
  paymentDate: string | null;
  paymentReference: string | null;
  idempotencyKey: string | null;

  // Admin approval fields
  approvedBy: string | null;
  approvedAt: string | null;

  // Rejection fields
  rejectedBy: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  // Relations
  partner: {
    id: string;
    partnerId: string;
    fullName: string;
    email: string;
    phone: string | null;
    status: PartnerStatus;
    city: string | null;
    state: string | null;
  };

  referral: {
    id: string;
    referralId: string;
    clientFullName: string;
    clientEmail: string;
    clientPhone: string | null;
    status: ReferralStatus;
    createdAt: string;
    estimatedIncome: string | null;
    serviceNeeded: string | null;
  };

  // Audit history
  auditLogs: PaymentAuditLog[];
}

/**
 * Admin Payment (List View)
 * Simplified payment information for list display
 */
export interface AdminPayment {
  id: string;
  referralId: string;
  partnerId: string;
  status: PaymentStatus;

  // Phase 3 fields
  calculatedAmount: string | null;
  successfulReferralCount: number;

  // Standard fields
  approvedAmount: string | null;
  paymentMethod: string | null;
  paymentDate: string | null;
  createdAt: string;

  // Relations
  partner: {
    id: string;
    partnerId: string;
    fullName: string;
    email: string;
  };

  referral: {
    id: string;
    referralId: string;
    clientFullName: string;
    status: ReferralStatus;
  };
}

// ============================================
// PAYMENT ACTION INPUTS (Phase 5)
// ============================================

/**
 * Approve Payment Input
 * Used by ADMIN to approve a payment
 */
export interface ApprovePaymentInput {
  approvedAmount: number;
  paymentMethod?: string;
  notes?: string;
}

/**
 * Reject Payment Input
 * Used by ADMIN to reject a payment
 */
export interface RejectPaymentInput {
  rejectionReason: string;
}

/**
 * Mark Paid Input
 * Used by ADMIN to mark payment as paid
 */
export interface MarkPaidInput {
  paymentReference: string;
  paymentDate?: string;
  paymentMethod?: string;
  notes?: string;
}

// ============================================
// ADMIN SERVICE TYPES
// ============================================

// GET /api/admin/dashboard
export interface AdminDashboard {
  partners: {
    total: number;
    byStatus: Record<string, number>;
  };
  applications: {
    total: number;
    pending: number;
    byStatus: Record<string, number>;
  };
  referrals: {
    total: number;
    byStatus: Record<string, number>;
    recent: Array<{
      id: string;
      referralId: string;
      clientFullName: string;
      status: ReferralStatus;
      createdAt: string;
      partner: {
        partnerId: string;
        fullName: string;
      };
    }>;
  };
  payments: {
    total: number;
    byStatus: Record<string, number>;
    totalSuggestedAmount: number | null;
    totalApprovedAmount: number | null;
  };
  invites: {
    total: number;
    active: number;
  };
  recentActivity: Array<{
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    performedByRole: string;
    performedAt: string;
    performedBy: {
      fullName: string;
      email: string;
    } | null;
  }>;
  generatedAt: string;
}

// GET /api/admin/applications
export interface PartnerApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  businessType: string | null;
  message: string | null;
  agreementVersion: string | null;
  agreementText: string | null;
  signatureDataUrl: string | null;
  agreementDate: string | null;
  agreementAcceptedAt: string | null;
  status: ApplicationStatus;
  adminNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  ipAddress: string | null;
  createdAt: string;
}

// POST /api/admin/invites
export interface CreateInviteInput {
  email: string;
  expiresInDays?: number; // Default: 7, Min: 1, Max: 30
}

// PUT /api/admin/referrals/{referralId}/status
export interface UpdateReferralStatusInput {
  status: ReferralStatus;
  notes?: string;
  visibleToPartner?: boolean; // Default: true
}

// GET /api/admin/referrals/{referralId}
export interface AdminReferralDetail {
  id: string;
  referralId: string;
  clientFullName: string;
  clientEmail: string;
  clientPhone: string | null;
  estimatedIncome: string | null;
  serviceNeeded: string | null;
  additionalNotes: string | null;
  consentGiven: boolean;
  status: ReferralStatus;
  isDuplicate: boolean;
  submissionSource: SubmissionSource;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  ipAddress: string | null;
  createdAt: string;
  updatedAt: string;
  partner: {
    id: string;
    partnerId: string;
    fullName: string;
    email: string;
    phone: string | null;
    status: PartnerStatus;
  };
  statusHistory: Array<{
    id: string;
    oldStatus: ReferralStatus | null;
    newStatus: ReferralStatus;
    changedBy: string;
    changedByRole: string;
    notes: string | null;
    visibleToPartner: boolean;
    changedAt: string;
  }>;
  payment: {
    id: string;
    status: PaymentStatus;
    suggestedAmount: number | null;
    approvedAmount: number | null;
    paymentMethod: string | null;
    paymentDate: string | null;
    createdAt: string;
  } | null;
  paymentAuditLogs: PaymentAuditLog[]; // Added: Payment audit history
  duplicateOf: {
    id: string;
    referralId: string;
    clientFullName: string;
    clientEmail: string;
    status: ReferralStatus;
  } | null;
  duplicates: Array<{
    id: string;
    referralId: string;
    clientFullName: string;
    clientEmail: string;
    status: ReferralStatus;
  }>;
}

// ============================================
// PAGINATION TYPES
// ============================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================
// API RESPONSE WRAPPER
// ============================================

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;
