'use client';

/**
 * Admin Referral Detail Page
 * 
 * View and update referral status
 */

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { adminService } from '@/services/admin.service';
import type { AdminReferralDetail, ReferralStatus } from '@/types/api.types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText,
  Edit,
  History,
} from 'lucide-react';
import { REFERRAL_STATUS_COLORS, REFERRAL_STATUS_LABELS } from '@/lib/constants';

const updateStatusSchema = z.object({
  status: z.enum([
    'NEW_REFERRAL',
    'UNDER_REVIEW',
    'CONTACTED',
    'QUALIFIED',
    'NOT_QUALIFIED',
    'CLIENT_AGREEMENT_SIGNED',
    'PAYMENT_RECEIVED',
    'ELIGIBLE_FOR_PAYOUT',
    'DUPLICATE_FLAGGED',
    'LOST',
  ]),
  notes: z.string().optional(),
  visibleToPartner: z.boolean().default(true),
});

type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;

export default function AdminReferralDetailPage() {
  const params = useParams();
  const router = useRouter();
  const referralId = params.id as string;
  const { user, isLoading: authLoading } = useProtectedRoute(['ADMIN', 'SUPER_ADMIN']);
  const [referral, setReferral] = useState<AdminReferralDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateStatusFormData>({
    resolver: zodResolver(updateStatusSchema),
  });

  useEffect(() => {
    if (!authLoading && user && referralId) {
      loadReferral();
    }
  }, [authLoading, user, referralId]);

  const loadReferral = async () => {
    try {
      const data = await adminService.getReferral(referralId);
      setReferral(data);
      reset({
        status: data.status,
        visibleToPartner: true,
      });
    } catch (error) {
      console.error('Failed to load referral:', error);
      toast.error('Failed to load referral details');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitStatusUpdate = async (data: UpdateStatusFormData) => {
    setIsSubmitting(true);
    try {
      await adminService.updateReferralStatus(referralId, data);
      toast.success('Referral status updated successfully');
      setShowUpdateForm(false);
      loadReferral();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#14235C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading referral details...</p>
        </div>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Referral not found</p>
          <Link href="/admin/referrals" className="btn-primary">
            Back to Referrals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/referrals"
            className="text-[#14235C] hover:underline flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Referrals
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">
                Referral {referral.referralId}
              </h1>
              <p className="text-gray-600">
                Submitted on {new Date(referral.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => setShowUpdateForm(!showUpdateForm)}
              className="btn-primary flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Update Status
            </button>
          </div>
        </div>

        {/* Update Status Form */}
        {showUpdateForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">Update Status</h2>
            <form onSubmit={handleSubmit(onSubmitStatusUpdate)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="form-label">
                    New Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('status')}
                    id="status"
                    className="form-input"
                    disabled={isSubmitting}
                  >
                    {(Object.keys(REFERRAL_STATUS_LABELS) as ReferralStatus[]).map((status) => (
                      <option key={status} value={status}>
                        {REFERRAL_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="form-error">{errors.status.message}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-7">
                  <input
                    {...register('visibleToPartner')}
                    type="checkbox"
                    id="visibleToPartner"
                    className="w-4 h-4 text-[#14235C] border-gray-300 rounded focus:ring-[#14235C]"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="visibleToPartner" className="text-sm text-gray-700">
                    Visible to partner
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="notes" className="form-label">
                  Notes (optional)
                </label>
                <textarea
                  {...register('notes')}
                  id="notes"
                  rows={3}
                  className="form-input"
                  placeholder="Add notes about this status change..."
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Update Status
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateForm(false)}
                  className="btn-outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">Current Status</h2>
              <div className="flex items-center gap-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${
                    REFERRAL_STATUS_COLORS[referral.status]
                  }`}
                >
                  {REFERRAL_STATUS_LABELS[referral.status]}
                </span>
                {referral.isDuplicate && (
                  <span className="px-4 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                    Duplicate Flagged
                  </span>
                )}
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">Client Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-sm font-semibold text-[#2C2C2C]">
                      {referral.clientFullName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <a
                      href={`mailto:${referral.clientEmail}`}
                      className="text-sm text-[#14235C] hover:underline"
                    >
                      {referral.clientEmail}
                    </a>
                  </div>
                </div>
                {referral.clientPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <a
                        href={`tel:${referral.clientPhone}`}
                        className="text-sm text-[#14235C] hover:underline"
                      >
                        {referral.clientPhone}
                      </a>
                    </div>
                  </div>
                )}
                {referral.estimatedIncome && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Estimated Income</p>
                      <p className="text-sm font-semibold text-[#2C2C2C]">
                        {referral.estimatedIncome}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Referral Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">Referral Details</h2>
              <div className="space-y-4">
                {referral.serviceNeeded && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Service Needed</p>
                    <p className="text-sm text-gray-900">{referral.serviceNeeded}</p>
                  </div>
                )}
                {referral.additionalNotes && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Additional Notes</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {referral.additionalNotes}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Consent Given</p>
                  <p className="text-sm text-gray-900">
                    {referral.consentGiven ? 'Yes' : 'No'}
                  </p>
                </div>
                {referral.ipAddress && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">IP Address</p>
                    <p className="text-sm text-gray-900 font-mono">{referral.ipAddress}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status History */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-[#2C2C2C] mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                Complete Timeline
              </h2>
              <div className="space-y-4">
                {/* Merge referral status history and payment audit logs */}
                {(() => {
                  // Transform referral status history to timeline events
                  const referralEvents = referral.statusHistory.map((history) => ({
                    id: `referral-${history.id}`,
                    type: 'referral' as const,
                    timestamp: new Date(history.changedAt),
                    title: history.oldStatus 
                      ? `${REFERRAL_STATUS_LABELS[history.oldStatus]} → ${REFERRAL_STATUS_LABELS[history.newStatus]}`
                      : REFERRAL_STATUS_LABELS[history.newStatus],
                    actor: history.changedBy,
                    actorRole: history.changedByRole,
                    notes: history.notes,
                    visibleToPartner: history.visibleToPartner,
                    data: history,
                  }));

                  // Transform payment audit logs to timeline events
                  const paymentEvents = (referral.paymentAuditLogs || []).map((log) => {
                    let title = '';
                    let color = 'bg-gray-100 text-gray-700 border-gray-300';
                    
                    switch (log.action) {
                      case 'PAYMENT_AUTO_CREATED':
                        title = 'Payment Request Created';
                        color = 'bg-blue-100 text-blue-700 border-blue-300';
                        break;
                      case 'UPDATE':
                        if (log.field === 'suggestedAmount') {
                          title = 'Payment Amount Reviewed';
                          color = 'bg-yellow-100 text-yellow-700 border-yellow-300';
                        } else {
                          title = 'Payment Updated';
                          color = 'bg-gray-100 text-gray-700 border-gray-300';
                        }
                        break;
                      case 'PAYMENT_APPROVE':
                        title = 'Payment Approved';
                        color = 'bg-green-100 text-green-700 border-green-300';
                        break;
                      case 'PAYMENT_MARK_PAID':
                        title = 'Payment Marked as Paid';
                        color = 'bg-emerald-100 text-emerald-700 border-emerald-300';
                        break;
                      case 'PAYMENT_REJECT':
                        title = 'Payment Rejected';
                        color = 'bg-red-100 text-red-700 border-red-300';
                        break;
                      default:
                        title = log.action.replace(/_/g, ' ');
                    }

                    return {
                      id: `payment-${log.id}`,
                      type: 'payment' as const,
                      timestamp: new Date(log.performedAt),
                      title,
                      color,
                      actor: log.performedBy?.fullName || 'SYSTEM',
                      actorRole: log.performedBy?.role || 'SYSTEM',
                      data: log,
                    };
                  });

                  // Merge and sort by timestamp (newest first)
                  const allEvents = [...referralEvents, ...paymentEvents].sort(
                    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
                  );

                  if (allEvents.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <History className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No history available</p>
                      </div>
                    );
                  }

                  return allEvents.map((event, index) => {
                    if (event.type === 'referral') {
                      const history = event.data as typeof referral.statusHistory[0];
                      return (
                        <div
                          key={event.id}
                          className="border-l-4 border-[#14235C] pl-4 pb-4 last:pb-0"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-300">
                                  REFERRAL STATUS
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-[#2C2C2C]">
                                {event.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                by {event.actor} ({event.actorRole})
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">
                              {event.timestamp.toLocaleString()}
                            </p>
                          </div>
                          {history.notes && (
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              {history.notes}
                            </p>
                          )}
                          {!history.visibleToPartner && (
                            <p className="text-xs text-orange-600 mt-1">
                              Hidden from partner
                            </p>
                          )}
                        </div>
                      );
                    } else {
                      // Payment event
                      const log = event.data as typeof referral.paymentAuditLogs[0];
                      return (
                        <div
                          key={event.id}
                          className="border-l-4 border-green-500 pl-4 pb-4 last:pb-0"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${event.color}`}>
                                  PAYMENT
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-[#2C2C2C]">
                                {event.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                by {event.actor}
                                {event.actorRole !== 'SYSTEM' && ` (${event.actorRole})`}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">
                              {event.timestamp.toLocaleString()}
                            </p>
                          </div>

                          {/* Payment metadata */}
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="mt-2 space-y-1 text-sm">
                              {log.metadata.approvedAmount && (
                                <p className="text-gray-700">
                                  <span className="font-medium">Amount:</span> ${Number(log.metadata.approvedAmount).toLocaleString()}
                                </p>
                              )}
                              {log.metadata.calculatedAmount && (
                                <p className="text-gray-700">
                                  <span className="font-medium">Calculated:</span> ${Number(log.metadata.calculatedAmount).toLocaleString()}
                                </p>
                              )}
                              {log.metadata.tierLabel && (
                                <p className="text-gray-700">
                                  <span className="font-medium">Tier:</span> {log.metadata.tierLabel}
                                </p>
                              )}
                              {log.metadata.rejectionReason && (
                                <p className="text-red-700 mt-2">
                                  <span className="font-medium">Reason:</span> {log.metadata.rejectionReason}
                                </p>
                              )}
                              {log.metadata.paymentReference && (
                                <p className="text-gray-700">
                                  <span className="font-medium">Reference:</span> {log.metadata.paymentReference}
                                </p>
                              )}
                              {log.metadata.notes && (
                                <p className="text-gray-600 mt-2 italic bg-gray-50 p-2 rounded">
                                  {log.metadata.notes}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Field changes */}
                          {log.field && (
                            <div className="mt-2 text-xs text-gray-600">
                              <span className="font-medium capitalize">
                                {log.field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                              </span>{' '}
                              {log.oldValue && (
                                <>
                                  <span className="line-through">{log.oldValue}</span>
                                  {' → '}
                                </>
                              )}
                              <span className="font-medium text-gray-900">{log.newValue}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Partner Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-[#2C2C2C] mb-4">Partner</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-semibold text-[#2C2C2C]">
                    {referral.partner.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Partner ID</p>
                  <p className="text-sm font-mono text-[#14235C]">
                    {referral.partner.partnerId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <a
                    href={`mailto:${referral.partner.email}`}
                    className="text-sm text-[#14235C] hover:underline"
                  >
                    {referral.partner.email}
                  </a>
                </div>
                {referral.partner.phone && (
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <a
                      href={`tel:${referral.partner.phone}`}
                      className="text-sm text-[#14235C] hover:underline"
                    >
                      {referral.partner.phone}
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      referral.partner.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {referral.partner.status}
                  </span>
                </div>
                <Link
                  href={`/admin/partners/${referral.partner.id}`}
                  className="btn-outline w-full text-center block mt-4"
                >
                  View Partner
                </Link>
              </div>
            </div>

            {/* Payment Info */}
            {referral.payment && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-[#2C2C2C] mb-4">Payment</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        referral.payment.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : referral.payment.status === 'APPROVED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {referral.payment.status}
                    </span>
                  </div>
                  {referral.payment.approvedAmount && (
                    <div>
                      <p className="text-xs text-gray-500">Approved Amount</p>
                      <p className="text-lg font-bold text-green-600">
                        ${referral.payment.approvedAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {referral.payment.paymentDate && (
                    <div>
                      <p className="text-xs text-gray-500">Payment Date</p>
                      <p className="text-sm text-gray-900">
                        {new Date(referral.payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <Link
                    href={`/admin/payments?referralId=${referral.referralId}`}
                    className="btn-outline w-full text-center block mt-4"
                  >
                    View Payment
                  </Link>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-[#2C2C2C] mb-4">Metadata</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-gray-900">
                    {new Date(referral.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-gray-900">
                    {new Date(referral.updatedAt).toLocaleString()}
                  </p>
                </div>
                {referral.utmSource && (
                  <div>
                    <p className="text-xs text-gray-500">UTM Source</p>
                    <p className="text-gray-900 font-mono text-xs">{referral.utmSource}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
