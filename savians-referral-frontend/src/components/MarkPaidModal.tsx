/**
 * Mark Paid Modal
 * 
 * Modal for marking approved payments as paid
 */

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Calendar, CreditCard, FileText } from 'lucide-react';
import type { AdminPaymentDetail, MarkPaidInput } from '@/types/api.types';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';

interface MarkPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: AdminPaymentDetail;
  onSuccess: () => void;
}

export default function MarkPaidModal({
  isOpen,
  onClose,
  payment,
  onSuccess,
}: MarkPaidModalProps) {
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Default to today
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentReference('');
      setPaymentMethod('');
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentReference.trim()) {
      toast.error('Payment reference is required');
      return;
    }

    setIsProcessing(true);
    try {
      const input: MarkPaidInput = {
        paymentReference: paymentReference.trim(),
        paymentDate: paymentDate ? new Date(paymentDate).toISOString() : undefined,
        paymentMethod: paymentMethod.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      await adminService.markPaymentPaid(payment.id, input);
      toast.success('Payment marked as paid');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to mark payment as paid:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to mark payment as paid');
    } finally {
      setIsProcessing(false);
    }
  };

  const approvedAmount = payment.approvedAmount ? parseFloat(payment.approvedAmount) : 0;

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
            <div className="bg-emerald-100 rounded-full p-2">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Mark Payment as Paid</h2>
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
          {/* Payment Summary */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600">Partner</p>
                <p className="text-lg font-semibold text-gray-900">
                  {payment.partner.fullName}
                </p>
                <p className="text-sm text-gray-600">{payment.partner.partnerId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Approved Amount</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${approvedAmount.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-emerald-200">
              <p className="text-sm text-gray-600">
                Referral: {payment.referral.clientFullName} ({payment.referral.referralId})
              </p>
            </div>
          </div>

          {/* Payment Reference */}
          <div>
            <label htmlFor="paymentReference" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Payment Reference <span className="text-red-500">*</span>
              </div>
            </label>
            <input
              type="text"
              id="paymentReference"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="e.g., CHK-12345, TXN-67890, Zelle Conf#"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
              required
              disabled={isProcessing}
            />
            <p className="mt-1 text-xs text-gray-600">
              Check number, transaction ID, or confirmation number
            </p>
          </div>

          {/* Payment Date */}
          <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Payment Date
              </div>
            </label>
            <input
              type="date"
              id="paymentDate"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
              disabled={isProcessing}
            />
          </div>

          {/* Payment Method */}
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Method <span className="text-gray-400">(Optional)</span>
              </div>
            </label>
            <input
              type="text"
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="e.g., Bank Transfer, Check, ACH, Zelle"
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
              placeholder="Add any notes about this payment..."
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
              disabled={isProcessing}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Mark as Paid
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
