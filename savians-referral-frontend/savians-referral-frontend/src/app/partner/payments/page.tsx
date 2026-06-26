'use client';

export const dynamic = 'force-dynamic';

/**
 * Partner Payments Page
 * 
 * View all payment history and track earnings
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { partnerService } from '@/services/partner.service';
import type { PartnerPayment, PaginatedResponse, PaymentStatus } from '@/types/api.types';
import { toast } from 'sonner';
import {
  DollarSign,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants';

export default function PartnerPaymentsPage() {
  const { user, isLoading: authLoading } = useProtectedRoute(['PARTNER']);
  const [payments, setPayments] = useState<PaginatedResponse<PartnerPayment> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Calculate totals
  const totalEarnings = payments?.data.reduce((sum, payment) => {
    if (payment.approvedAmount !== null) {
      return sum + payment.approvedAmount;
    }
    return sum;
  }, 0) || 0;

  const paidAmount = payments?.data.reduce((sum, payment) => {
    if (payment.status === 'PAID' && payment.approvedAmount !== null) {
      return sum + payment.approvedAmount;
    }
    return sum;
  }, 0) || 0;

  const pendingAmount = payments?.data.reduce((sum, payment) => {
    if (['PENDING', 'APPROVED'].includes(payment.status) && payment.approvedAmount !== null) {
      return sum + payment.approvedAmount;
    }
    return sum;
  }, 0) || 0;

  useEffect(() => {
    if (!authLoading && user) {
      loadPayments();
    }
  }, [authLoading, user, currentPage, statusFilter, sortBy, sortOrder]);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const data = await partnerService.listPayments({
        page: currentPage,
        limit: DEFAULT_PAGE_SIZE,
        sort: sortBy,
        order: sortOrder,
      });
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const filteredPayments = payments?.data.filter((payment) =>
    statusFilter ? payment.status === statusFilter : true
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#14235C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">Payments</h1>
          <p className="text-gray-600">
            Track your earnings and payment history
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#14235C]">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-100 rounded-full p-3">
                <DollarSign className="w-6 h-6 text-[#14235C]" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Earnings</h3>
            <p className="text-3xl font-bold text-[#2C2C2C]">
              ${totalEarnings.toLocaleString()}
            </p>
          </div>

          {/* Paid Amount */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Paid Out</h3>
            <p className="text-3xl font-bold text-[#2C2C2C]">
              ${paidAmount.toLocaleString()}
            </p>
          </div>

          {/* Pending Amount */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-yellow-100 rounded-full p-3">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Pending</h3>
            <p className="text-3xl font-bold text-[#2C2C2C]">
              ${pendingAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="paymentDate-desc">Payment Date (Recent)</option>
                <option value="paymentDate-asc">Payment Date (Old)</option>
              </select>
            </div>

            {statusFilter && (
              <button
                onClick={() => handleStatusFilter('')}
                className="text-sm text-[#14235C] hover:underline"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#14235C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading payments...</p>
            </div>
          ) : !filteredPayments || filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {statusFilter
                  ? `No payments with status "${PAYMENT_STATUS_LABELS[statusFilter as PaymentStatus]}"`
                  : 'No payments yet'}
              </p>
              <p className="text-sm text-gray-500">
                Payments will appear once your referrals are eligible for payout
              </p>
            </div>
          ) : (
            <>
              {/* Table - Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referral ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/partner/referrals/${payment.referral.referralId}`}
                            className="text-sm font-medium text-[#14235C] hover:underline"
                          >
                            {payment.referral.referralId}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {payment.referral.clientFullName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payment.approvedAmount !== null ? (
                            <span className="text-sm font-semibold text-[#14235C]">
                              ${payment.approvedAmount.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              PAYMENT_STATUS_COLORS[payment.status]
                            }`}
                          >
                            {PAYMENT_STATUS_LABELS[payment.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payment.paymentDate ? (
                            <span className="text-sm text-gray-600">
                              {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">Not paid yet</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link
                            href={`/partner/referrals/${payment.referral.referralId}`}
                            className="text-[#14235C] hover:underline text-sm font-medium inline-flex items-center gap-1"
                          >
                            View
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards - Mobile */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Link
                          href={`/partner/referrals/${payment.referral.referralId}`}
                          className="text-sm font-medium text-[#14235C] hover:underline block mb-1"
                        >
                          {payment.referral.referralId}
                        </Link>
                        <p className="text-sm text-gray-600">
                          {payment.referral.clientFullName}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          PAYMENT_STATUS_COLORS[payment.status]
                        }`}
                      >
                        {PAYMENT_STATUS_LABELS[payment.status]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      {payment.approvedAmount !== null ? (
                        <span className="text-lg font-bold text-[#14235C]">
                          ${payment.approvedAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Amount pending</span>
                      )}
                      {payment.paymentDate && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {(payments?.meta?.totalPages ?? 0) > 1 && (
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {((payments?.meta?.page ?? 1) - 1) * (payments?.meta?.limit ?? 10) + 1} to{' '}
                      {Math.min((payments?.meta?.page ?? 1) * (payments?.meta?.limit ?? 10), payments?.meta?.total ?? 0)}{' '}
                      of {payments?.meta?.total ?? 0} payments
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={!(payments?.meta?.hasPreviousPage ?? false)}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {payments?.meta?.page ?? 1} of {payments?.meta?.totalPages ?? 1}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={!(payments?.meta?.hasNextPage ?? false)}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
