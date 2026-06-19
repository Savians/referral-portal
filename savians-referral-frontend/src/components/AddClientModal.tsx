'use client';

/**
 * Add Client Modal Component
 * 
 * Allows partners to submit referrals directly from their dashboard
 */

import React, { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/api';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddClientModal({ isOpen, onClose, onSuccess }: AddClientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clientFullName: '',
    clientEmail: '',
    clientPhone: '',
    estimatedIncome: '',
    serviceNeeded: '',
    additionalNotes: '',
    consentGiven: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.consentGiven) {
      toast.error('Please confirm consent to submit this referral');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/api/partner/referrals', {
        clientFullName: formData.clientFullName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone || undefined,
        estimatedIncome: formData.estimatedIncome || undefined,
        serviceNeeded: formData.serviceNeeded || undefined,
        additionalNotes: formData.additionalNotes || undefined,
        consentGiven: formData.consentGiven,
      });

      toast.success(
        response.data.isDuplicate
          ? 'Referral submitted (flagged as potential duplicate)'
          : 'Referral submitted successfully!'
      );

      // Reset form
      setFormData({
        clientFullName: '',
        clientEmail: '',
        clientPhone: '',
        estimatedIncome: '',
        serviceNeeded: '',
        additionalNotes: '',
        consentGiven: false,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to submit referral:', error);
      toast.error(error.message || 'Failed to submit referral');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserPlus className="w-6 h-6 text-[#14235C] dark:text-[#F4C64E]" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Add New Client
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Client Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.clientFullName}
              onChange={(e) =>
                setFormData({ ...formData, clientFullName: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="John Doe"
            />
          </div>

          {/* Client Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Client Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.clientEmail}
              onChange={(e) =>
                setFormData({ ...formData, clientEmail: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="john.doe@example.com"
            />
          </div>

          {/* Client Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Client Phone
            </label>
            <input
              type="tel"
              value={formData.clientPhone}
              onChange={(e) =>
                setFormData({ ...formData, clientPhone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="(555) 123-4567"
            />
          </div>

          {/* Estimated Income */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estimated Annual Income
            </label>
            <select
              value={formData.estimatedIncome}
              onChange={(e) =>
                setFormData({ ...formData, estimatedIncome: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="">Select income range</option>
              <option value="Under $50,000">Under $50,000</option>
              <option value="$50,000 - $100,000">$50,000 - $100,000</option>
              <option value="$100,000 - $250,000">$100,000 - $250,000</option>
              <option value="$250,000 - $500,000">$250,000 - $500,000</option>
              <option value="Over $500,000">Over $500,000</option>
            </select>
          </div>

          {/* Service Needed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Service Needed
            </label>
            <input
              type="text"
              value={formData.serviceNeeded}
              onChange={(e) =>
                setFormData({ ...formData, serviceNeeded: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Tax planning, bookkeeping, etc."
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) =>
                setFormData({ ...formData, additionalNotes: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Any additional information about this client..."
            />
          </div>

          {/* Consent Checkbox */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.consentGiven}
                onChange={(e) =>
                  setFormData({ ...formData, consentGiven: e.target.checked })
                }
                required
                className="mt-1 w-4 h-4 text-[#14235C] border-gray-300 rounded focus:ring-[#14235C]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                I confirm that I have obtained consent from this client to share their information
                with Savians Tax Advisors for the purpose of providing tax advisory services.{' '}
                <span className="text-red-500">*</span>
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-[#14235C] dark:bg-[#F4C64E] text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-[#1a2d75] dark:hover:bg-[#f5d264] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Submit Referral
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
