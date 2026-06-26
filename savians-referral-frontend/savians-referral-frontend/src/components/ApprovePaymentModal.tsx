/**
 * Approve Payment Modal
 * 
 * Modal for approving payments with amount override capability
 */

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';
import type { AdminPaymentDetail, ApprovePaymentInput } from '@/types/api.types';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import TierSnapshotDisplay from './TierSnapshotDisplay';

interface ApprovePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: AdminPaymentDetail;
  onSuccess: () => void;
}

export default function ApprovePaymentModal({
  isOpen,
  onClose,
  payment,
  onSuccess,
}: ApprovePaymentModalProps) {
  const [approvedAmount, setApprovedAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const calculatedAmount = payment.calculatedAmount ? parseFloat(payment.calculatedAmount) : 0;

  useEffect(() => {
    if (isOpen) {
      // Pre-fill with calculated amount
      setApprovedAmount(calculatedAmount.toString());
      setPaymentMethod('');
      setNotes('');
    }
  }, [isOpen, calculatedAmount]);

  if (!isOpen) return null;

  const amountDiffers = parseFloat(approvedAmount) !== calculatedAmount;
  const isValidAmount = parseFloat(approvedAmount) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidAmount) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setIsProcessing(true);
    try {
      // Check if payment needs to be reviewed first
      if (!payment.adminReviewedBy) {
        // Step 1: Review the payment first
        await adminService.reviewPayment(payment.id, {
          suggestedAmount: parseFloat(approvedAmount),
          notes: notes || undefined,
        });
      }

      // Step 2: Approve the payment
      const input: ApprovePaymentInput = {
        approvedAmount: parseFloat(approvedAmount),
        paymentMethod: paymentMethod || undefined,
        notes: notes || undefined,
      };

      await adminService.approvePayment(payment.id, input);
      toast.success('Payment approved successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to approve payment:', error);
      
      // Better error handling
      let errorMessage = 'Failed to approve payment';
      
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isProcessing ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-full p-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Approve Payment</h2>
              <p className="text-sm text-gray-600">Payment ID: {payment.id.slice(0, 8)}...</p>
            </div>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tier Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payout Tier
            </label>
            <TierSnapshotDisplay
              snapshot={payment.payoutTierSnapshot}
              referralCount={payment.successfulReferralCount}
              variant="card"
            />
          </div>

          {/* Calculated Amount (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calculated Amount
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${calculatedAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Based on {payment.successfulReferralCount} successful referrals
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Approved Amount (Editable) */}
          <div>
            <label htmlFor="approvedAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Approved Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="approvedAmount"
              step="0.01"
              min="0.01"
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
              required
              disabled={isProcessing}
            />
            {amountDiffers && isValidAmount && (
              <div className="mt-2 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Amount Override</p>
                  <p>
                    You're overriding the calculated amount. Difference: $
                    {Math.abs(parseFloat(approvedAmount) - calculatedAmount).toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="e.g., Bank Transfer, Check, PayPal"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
              disabled={isProcessing}
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any notes about this approval..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent resize-none"
              disabled={isProcessing}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValidAmount || isProcessing}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Approve Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
