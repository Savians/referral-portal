/**
 * Reject Payment Modal
 * 
 * Modal for rejecting payments with mandatory reason and confirmation
 */

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { AdminPaymentDetail, RejectPaymentInput } from '@/types/api.types';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';

interface RejectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: AdminPaymentDetail;
  onSuccess: () => void;
}

export default function RejectPaymentModal({
  isOpen,
  onClose,
  payment,
  onSuccess,
}: RejectPaymentModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    if (confirmText !== 'REJECT') {
      toast.error('Please type REJECT to confirm');
      return;
    }

    setIsProcessing(true);
    try {
      const input: RejectPaymentInput = {
        rejectionReason: rejectionReason.trim(),
      };

      await adminService.rejectPayment(payment.id, input);
      toast.success('Payment rejected');
      setRejectionReason('');
      setConfirmText('');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to reject payment:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to reject payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculatedAmount = payment.calculatedAmount ? parseFloat(payment.calculatedAmount) : 0;
  const isConfirmValid = confirmText === 'REJECT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isProcessing ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 rounded-full p-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Reject Payment</h2>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-gray-900 mb-2">
              <strong>Referral:</strong> {payment.referral.clientFullName} ({payment.referral.referralId})
            </p>
            <p className="text-sm text-gray-900 mb-2">
              <strong>Partner:</strong> {payment.partner.fullName} ({payment.partner.partnerId})
            </p>
            <p className="text-sm text-gray-900">
              <strong>Amount:</strong> ${calculatedAmount.toLocaleString()}
            </p>
          </div>

          <p className="text-sm text-gray-700">
            This action will mark the payment as <strong className="text-red-600">REJECTED</strong> and cannot be easily undone.
          </p>

          {/* Rejection Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Enter detailed reason for rejection (e.g., 'Referral does not meet eligibility criteria', 'Duplicate payment request')..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              disabled={isProcessing}
              required
            />
            <p className="mt-1 text-xs text-gray-600">
              This reason will be recorded in the audit log.
            </p>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-red-600">REJECT</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="REJECT"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono uppercase"
              disabled={isProcessing}
            />
            {confirmText && (
              <p className={`mt-1 text-xs ${isConfirmValid ? 'text-green-600' : 'text-gray-500'}`}>
                {isConfirmValid ? '✓ Text matches - you can proceed' : 'Type REJECT exactly'}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!rejectionReason.trim() || !isConfirmValid || isProcessing}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Reject Payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
