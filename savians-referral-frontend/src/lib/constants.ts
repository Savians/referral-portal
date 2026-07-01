/**
 * Application Constants
 */

import type { ReferralStatus, PaymentStatus, ApplicationStatus } from '@/types/api.types';

// ============================================
// APP METADATA
// ============================================

export const APP_NAME = 'Savians Referral Portal';
export const APP_DESCRIPTION = 'Partner Referral Management Platform';

// ============================================
// ROUTES
// ============================================

export const ROUTES = {
  // Public
  HOME: '/',
  APPLY: '/apply',
  LOGIN: '/login',
  SIGNUP: '/signup',
  
  // Partner Portal
  PARTNER_DASHBOARD: '/partner/dashboard',
  PARTNER_REFERRALS: '/partner/referrals',
  PARTNER_PAYMENTS: '/partner/payments',
  PARTNER_PROFILE: '/partner/profile',
  PARTNER_DOCUMENTS: '/partner/documents',
  
  // Admin Portal
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_APPLICATIONS: '/admin/applications',
  ADMIN_PARTNERS: '/admin/partners',
  ADMIN_REFERRALS: '/admin/referrals',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_AUDIT: '/admin/audit-log',
} as const;

// ============================================
// STATUS LABELS & COLORS
// ============================================

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

export const REFERRAL_STATUS_COLORS: Record<ReferralStatus, string> = {
  NEW_REFERRAL: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700',
  UNDER_REVIEW: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
  CONTACTED: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700',
  QUALIFIED: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700',
  NOT_QUALIFIED: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700',
  CLIENT_AGREEMENT_SIGNED: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700',
  PAYMENT_RECEIVED: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700',
  ELIGIBLE_FOR_PAYOUT: 'bg-teal-100 dark:bg-teal-500 text-teal-800 dark:text-white border-teal-200 dark:border-teal-400',
  COMMISSION_PAID: 'bg-green-50 dark:bg-green-800 text-green-900 dark:text-green-100 border-green-300 dark:border-green-600',
  DUPLICATE_FLAGGED: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700',
  LOST: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  PAID: 'Paid',
  REJECTED: 'Rejected',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
  APPROVED: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700',
  PAID: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700',
  REJECTED: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700',
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  PENDING: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
  APPROVED: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700',
  REJECTED: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700',
};

// ============================================
// PAGINATION
// ============================================

export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ============================================
// VALIDATION
// ============================================

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/;

export const PHONE_REGEX = /^\+?1?\s*\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;

export const PARTNER_ID_REGEX = /^RP-\d+$/;
export const REFERRAL_ID_REGEX = /^REF-\d{8}-\d+$/;

// ============================================
// FILE UPLOAD
// ============================================

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const FILE_TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPEG Image',
  'image/png': 'PNG Image',
  'image/gif': 'GIF Image',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
};

// ============================================
// DOCUMENT TYPES
// ============================================

export const DOCUMENT_TYPE_LABELS = {
  W9_FORM: 'W-9 Form',
  AGREEMENT: 'Partnership Agreement',
  OTHER: 'Other',
};

// ============================================
// DATE FORMATS
// ============================================

export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'MMM dd, yyyy h:mm a';
export const TIME_FORMAT = 'h:mm a';

// ============================================
// ERROR MESSAGES
// ============================================

export const ERROR_MESSAGES = {
  NETWORK: 'Unable to connect to server. Please check your internet connection.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected server error occurred. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  UNKNOWN: 'An unexpected error occurred.',
};

// ============================================
// SUCCESS MESSAGES
// ============================================

export const SUCCESS_MESSAGES = {
  APPLICATION_SUBMITTED: 'Your application has been submitted successfully!',
  REFERRAL_SUBMITTED: 'Referral submitted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  INVITE_SENT: 'Invite sent successfully!',
  STATUS_UPDATED: 'Status updated successfully!',
  PAYMENT_PROCESSED: 'Payment processed successfully!',
};

// ============================================
// PARTNER TYPES
// ============================================

export const PARTNER_TYPES = [
  'CPA Firm',
  'Financial Advisor',
  'Attorney',
  'Business Consultant',
  'Insurance Agent',
  'Real Estate Professional',
  'Other Professional',
];

// ============================================
// SERVICE TYPES
// ============================================

export const SERVICE_TYPES = [
  'Tax Planning',
  'Tax Preparation',
  'Business Tax',
  'Estate Planning',
  'Bookkeeping',
  'CFO Services',
  'Audit Support',
  'Other',
];

// ============================================
// INCOME RANGES
// ============================================

export const INCOME_RANGES = [
  'Under $100k',
  '$100k - $250k',
  '$250k - $500k',
  '$500k - $1M',
  '$1M - $5M',
  'Over $5M',
  'Prefer not to say',
];

// ============================================
// US STATES
// ============================================

export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];
