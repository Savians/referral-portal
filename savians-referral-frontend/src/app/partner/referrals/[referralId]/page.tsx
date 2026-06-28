'use client';

/**
 * Partner Referral Detail Page
 * 
 * View detailed information about a specific referral
 */

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { partnerService } from '@/services/partner.service';
import type { PartnerReferralDetail } from '@/types/api.types';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  DollarSign,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import {
  REFERRAL_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from '@/lib/constants';

export default function ReferralDetailPage() {
  const params = useParams();
  const router = useRouter();
  const referralId = params.referralId as string;
  const { user, isLoading: authLoading } = useProtectedRoute(['PARTNER']);
  
  const [referral, setReferral] = useState<PartnerReferralDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user && referralId) {
      loadReferral();
    }
  }, [authLoading, user, referralId]);

  const loadReferral = async () => {
    setIsLoading(true);
    try {
      const data = await partnerService.getReferral(referralId);
      setReferral(data);
    } catch (error: any) {
      console.error('Failed to load referral:', error);
      
      if (error.response?.status === 404) {
        toast.error('Referral not found');
      } else {
        toast.error('Failed to load referral details');
      }
      
      // Redirect back to list after error
      setTimeout(() => router.push('/partner/referrals'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#14235C] dark:border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading referral...</p>
        </div>
      </div>
    );
  }

  if (!referral) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/partner/referrals"
          className="inline-flex items-center gap-2 text-[#14235C] dark:text-blue-400 hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Referrals
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[#2C2C2C] dark:text-white">
                  {referral.clientFullName}
                </h1>
                {referral.isDuplicate && (
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs font-medium flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Duplicate
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                Referral ID: <span className="font-mono font-semibold text-[#14235C] dark:text-blue-400">{referral.referralId}</span>
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Submitted on {new Date(referral.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                REFERRAL_STATUS_COLORS[referral.status]
              }`}
            >
              {referral.statusLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Client Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                    Full Name
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{referral.clientFullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <a
                    href={`mailto:${referral.clientEmail}`}
                    className="text-[#14235C] dark:text-blue-400 hover:underline"
                  >
                    {referral.clientEmail}
                  </a>
                </div>
                {referral.clientPhone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Phone
                    </label>
                    <a
                      href={`tel:${referral.clientPhone}`}
                      className="text-[#14235C] dark:text-blue-400 hover:underline"
                    >
                      {referral.clientPhone}
                    </a>
                  </div>
                )}
                {referral.estimatedIncome && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                      Estimated Income
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">{referral.estimatedIncome}</p>
                  </div>
                )}
                {referral.serviceNeeded && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                      Service Needed
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">{referral.serviceNeeded}</p>
                  </div>
                )}
                {referral.additionalNotes && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                      Additional Notes
                    </label>
                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {referral.additionalNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Status History
              </h2>
              
              {referral.statusHistory.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No status updates yet</p>
              ) : (
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700" />
                  
                  <div className="space-y-6">
                    {referral.statusHistory.map((history, index) => (
                      <div key={history.id} className="relative pl-10">
                        {/* Timeline Dot */}
                        <div className="absolute left-0 top-1 w-8 h-8 bg-white dark:bg-gray-800 border-4 border-[#14235C] dark:border-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-[#14235C] dark:bg-blue-500 rounded-full" />
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <div>
                              {history.oldStatus && (
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {history.oldStatusLabel} →{' '}
                                </span>
                              )}
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                                  REFERRAL_STATUS_COLORS[history.newStatus]
                                }`}
                              >
                                {history.newStatusLabel}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(history.changedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {history.notes && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                              <span className="font-medium">Note:</span> {history.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Information */}
            {referral.payment ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Payment
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                      Status
                    </label>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                        PAYMENT_STATUS_COLORS[referral.payment.status]
                      }`}
                    >
                      {PAYMENT_STATUS_LABELS[referral.payment.status]}
                    </span>
                  </div>
                  
                  {referral.payment.approvedAmount !== null && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                        Amount
                      </label>
                      <p className="text-2xl font-bold text-[#14235C] dark:text-blue-400">
                        ${referral.payment.approvedAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  {referral.payment.paymentDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                        Payment Date
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(referral.payment.paymentDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                  
                  {referral.payment.status === 'PENDING' && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-xs text-yellow-800 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Payment is being processed
                      </p>
                    </div>
                  )}
                  
                  {referral.payment.status === 'APPROVED' && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Payment approved, will be sent soon
                      </p>
                    </div>
                  )}
                  
                  {referral.payment.status === 'PAID' && (
                    <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-xs text-emerald-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Payment completed
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Payment
                </h2>
                <div className="text-center py-6">
                  <Clock className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Payment information will appear once the referral is eligible for payout
                  </p>
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {new Date(referral.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {new Date(referral.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Consent Given</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {referral.consentGiven ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
