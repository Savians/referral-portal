/**
 * Payment Details Modal
 * 
 * Full-screen modal showing complete payment details
 * Integrates all other payment components
 */

import React, { useState, useEffect } from 'react';
import { X, User, FileText, DollarSign, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { AdminPaymentDetail } from '@/types/api.types';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from '@/lib/constants';
import TierSnapshotDisplay from './TierSnapshotDisplay';
import PaymentAuditTimeline from './PaymentAuditTimeline';
import ApprovePaymentModal from './ApprovePaymentModal';
import RejectPaymentModal from './RejectPaymentModal';
import MarkPaidModal from './MarkPaidModal';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  onActionComplete?: () => void;
}

export default function PaymentDetailsModal({
  isOpen,
  onClose,
  paymentId,
  onActionComplete,
}: PaymentDetailsModalProps) {
  const { user } = useAuth();
  const [payment, setPayment] = useState<AdminPaymentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);

  useEffect(() => {
    if (isOpen && paymentId) {
      loadPayment();
    }
  }, [isOpen, paymentId]);

  const loadPayment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getPayment(paymentId);
      setPayment(data);
    } catch (error: any) {
      console.error('Failed to load payment details:', error);
      setError(error.response?.data?.error?.message || 'Failed to load payment details');
      toast.error('Failed to load payment details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionComplete = () => {
    loadPayment(); // Reload payment data
    onActionComplete?.(); // Notify parent
  };

  if (!isOpen) return null;

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const canApprove = isAdmin && payment?.status === 'PENDING';
  const canReject = isAdmin && (payment?.status === 'PENDING' || payment?.status === 'APPROVED');
  const canMarkPaid = isAdmin && payment?.status === 'APPROVED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              {payment ? `ID: ${payment.id}` : 'Loading...'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#14235C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading payment details...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium mb-2">Error Loading Payment</p>
                <p className="text-gray-600 text-sm">{error}</p>
                <button
                  onClick={loadPayment}
                  className="mt-4 px-4 py-2 bg-[#14235C] text-white rounded-lg hover:bg-[#0f1a47] transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : payment ? (
            <div className="p-6 space-y-6">
              {/* Overview Section */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  Payment Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${PAYMENT_STATUS_COLORS[payment.status]}`}>
                      {PAYMENT_STATUS_LABELS[payment.status]}
                    </span>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Calculated Amount</p>
                    <p className="text-2xl font-bold text-[#14235C]">
                      ${payment.calculatedAmount ? parseFloat(payment.calculatedAmount).toLocaleString() : '0.00'}
                    </p>
                  </div>

                  {payment.approvedAmount && (
                    <div className="bg-white border border-green-200 rounded-lg p-4 bg-green-50">
                      <p className="text-sm text-gray-600 mb-1">Approved Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${parseFloat(payment.approvedAmount).toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Successful Referrals</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {payment.successfulReferralCount}
                    </p>
                  </div>

                  {payment.paymentDate && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Payment Date</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {payment.paymentReference && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Reference</p>
                      <p className="text-sm font-mono font-semibold text-gray-900">
                        {payment.paymentReference}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Tier Information Section */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payout Tier Information
                </h3>
                <TierSnapshotDisplay
                  snapshot={payment.payoutTierSnapshot}
                  amount={payment.calculatedAmount ? parseFloat(payment.calculatedAmount) : 0}
                  referralCount={payment.successfulReferralCount}
                  variant="card"
                />
              </section>

              {/* Partner Details Section */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-600" />
                  Partner Information
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Partner ID</p>
                      <Link
                        href={`/admin/partners/${payment.partner.id}`}
                        className="text-[#14235C] hover:underline font-semibold flex items-center gap-1"
                      >
                        {payment.partner.partnerId}
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold text-gray-900">{payment.partner.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-gray-900">{payment.partner.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-gray-900">{payment.partner.phone || 'N/A'}</p>
                    </div>
                    {payment.partner.city && payment.partner.state && (
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="text-gray-900">{payment.partner.city}, {payment.partner.state}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${payment.partner.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {payment.partner.status}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Referral Details Section */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  Referral Information
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Referral ID</p>
                      <Link
                        href={`/admin/referrals/${payment.referral.referralId}`}
                        className="text-[#14235C] hover:underline font-semibold flex items-center gap-1"
                      >
                        {payment.referral.referralId}
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Client Name</p>
                      <p className="font-semibold text-gray-900">{payment.referral.clientFullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Client Email</p>
                      <p className="text-gray-900">{payment.referral.clientEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Client Phone</p>
                      <p className="text-gray-900">{payment.referral.clientPhone || 'N/A'}</p>
                    </div>
                    {payment.referral.estimatedIncome && (
                      <div>
                        <p className="text-sm text-gray-600">Estimated Income</p>
                        <p className="text-gray-900">{payment.referral.estimatedIncome}</p>
                      </div>
                    )}
                    {payment.referral.serviceNeeded && (
                      <div>
                        <p className="text-sm text-gray-600">Service Needed</p>
                        <p className="text-gray-900">{payment.referral.serviceNeeded}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="text-gray-900">{new Date(payment.referral.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Audit History Section */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Audit History
                </h3>
                <PaymentAuditTimeline auditLogs={payment.auditLogs} />
              </section>
            </div>
          ) : null}
        </div>

        {/* Footer with Actions */}
        {payment && !isLoading && !error && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Created {new Date(payment.createdAt).toLocaleDateString()} at {new Date(payment.createdAt).toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-3">
                {canApprove && (
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                )}

                {canMarkPaid && (
                  <button
                    onClick={() => setShowMarkPaidModal(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Mark as Paid
                  </button>
                )}

                {canReject && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Modals */}
      {payment && (
        <>
          <ApprovePaymentModal
            isOpen={showApproveModal}
            onClose={() => setShowApproveModal(false)}
            payment={payment}
            onSuccess={handleActionComplete}
          />

          <RejectPaymentModal
            isOpen={showRejectModal}
            onClose={() => setShowRejectModal(false)}
            payment={payment}
            onSuccess={handleActionComplete}
          />

          <MarkPaidModal
            isOpen={showMarkPaidModal}
            onClose={() => setShowMarkPaidModal(false)}
            payment={payment}
            onSuccess={handleActionComplete}
          />
        </>
      )}
    </div>
  );
}
