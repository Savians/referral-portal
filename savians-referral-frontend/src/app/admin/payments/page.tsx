'use client';

export const dynamic = 'force-dynamic';

/**
 * Admin Payments Page - REDESIGNED (Phase 9)
 * 
 * Production-ready payment management interface
 * Features:
 * - Tab-based filtering with count badges
 * - Summary cards with computed stats
 * - Debounced search and date filtering
 * - Tier badges with color coding
 * - PaymentDetailsModal integration
 * - Mobile responsive design
 * - Loading states with skeletons
 * - Error states with retry
 * - Empty states with friendly UI
 * - Full accessibility support
 */

import React, { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { adminService } from '@/services/admin.service';
import type { PaymentStatus, AdminPayment } from '@/types/api.types';
import { toast } from 'sonner';
import {
  DollarSign,
  Search,
  Calendar,
  X,
  Eye,
  Users,
  Award,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from '@/lib/constants';
import TabNavigation, { type Tab } from '@/components/TabNavigation';
import TierSnapshotDisplay from '@/components/TierSnapshotDisplay';
import PaymentDetailsModal from '@/components/PaymentDetailsModal';

type StatusFilter = 'ALL' | PaymentStatus;

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function AdminPaymentsContent() {
  const { user, isLoading: authLoading } = useProtectedRoute([
    'ADMIN',
    'SUPER_ADMIN',
  ]);

  const searchParams = useSearchParams();
  const partnerIdFilter = searchParams.get('partnerId');

  // Data state
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string>('');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modal state
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load payments on mount and when filters change
  useEffect(() => {
    if (!authLoading && user) {
      loadPayments();
    }
  }, [authLoading, user, statusFilter, partnerIdFilter]);

  const loadPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (partnerIdFilter) {
        params.partnerId = partnerIdFilter;
      }
      const response = await adminService.listPayments(params);
      const loadedPayments = response.data || [];
      setPayments(loadedPayments);
      
      // Set partner name from first payment if filtering by partner
      if (partnerIdFilter && loadedPayments.length > 0 && loadedPayments[0].partner) {
        setPartnerName(loadedPayments[0].partner.fullName);
      }
    } catch (error: any) {
      console.error('Failed to load payments:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to load payments';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter payments based on search and date range
  const filteredPayments = useMemo(() => {
    let filtered = payments;

    // Text search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((payment) =>
        payment.referral?.referralId?.toLowerCase().includes(query) ||
        payment.partner?.fullName?.toLowerCase().includes(query) ||
        payment.partner?.partnerId?.toLowerCase().includes(query)
      );
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((payment) => new Date(payment.createdAt) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // Include full day
      filtered = filtered.filter((payment) => new Date(payment.createdAt) <= toDate);
    }

    return filtered;
  }, [payments, debouncedSearch, dateFrom, dateTo]);

  // Compute summary stats from loaded dataset
  const stats = useMemo(() => {
    const pending = payments.filter((p) => p.status === 'PENDING');
    const approved = payments.filter((p) => p.status === 'APPROVED');
    const paid = payments.filter((p) => p.status === 'PAID');
    const rejected = payments.filter((p) => p.status === 'REJECTED');

    const totalPending = pending.reduce((sum, p) => 
      sum + (p.calculatedAmount ? parseFloat(p.calculatedAmount) : 0), 0
    );

    return {
      pending: pending.length,
      approved: approved.length,
      paid: paid.length,
      rejected: rejected.length,
      totalPending: totalPending,
    };
  }, [payments]);

  // Tab configuration with counts
  const tabs: Tab[] = useMemo(() => [
    { id: 'ALL', label: 'All', count: payments.length },
    { id: 'PENDING', label: 'Pending', count: stats.pending },
    { id: 'APPROVED', label: 'Approved', count: stats.approved },
    { id: 'PAID', label: 'Paid', count: stats.paid },
    { id: 'REJECTED', label: 'Rejected', count: stats.rejected },
  ], [payments.length, stats]);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
  }, []);

  // Handle modal close and refresh
  const handleModalClose = useCallback(() => {
    setSelectedPaymentId(null);
  }, []);

  const handleActionComplete = useCallback(() => {
    loadPayments(); // Refresh payment list
  }, []);

  // Handle tab change
  const handleTabChange = useCallback((tabId: string) => {
    setStatusFilter(tabId as StatusFilter);
  }, []);

  // Loading skeleton
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header skeleton */}
          <div className="mb-6 animate-pulse">
            <div className="h-9 bg-gray-200 rounded w-48 mb-2" />
            <div className="h-5 bg-gray-200 rounded w-72" />
          </div>

          {/* Summary cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>

          {/* Tabs skeleton */}
          <div className="bg-white rounded-xl shadow-md mb-6 p-6 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-full" />
          </div>

          {/* Table skeleton */}
          <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Payments</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadPayments}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          {partnerIdFilter && (
            <Link
              href="/admin/partners"
              className="text-[#14235C] hover:underline flex items-center gap-2 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Partners
            </Link>
          )}
          <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">
            {partnerIdFilter ? `Payments - ${partnerName || partnerIdFilter}` : 'Payment Management'}
          </h1>
          <p className="text-gray-600">
            {partnerIdFilter
              ? `Viewing payments for ${partnerName || partnerIdFilter}`
              : 'Manage partner payments and payouts'}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
            <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Approved</p>
            <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Paid</p>
            <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#14235C]">
            <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Total Pending</p>
            <p className="text-2xl font-bold text-[#14235C]">
              ${stats.totalPending.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <TabNavigation
            tabs={tabs}
            activeTab={statusFilter}
            onChange={handleTabChange}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Referral ID or partner name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
                />
              </div>
            </div>

            {/* Date From */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date From
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
                />
              </div>
            </div>

            {/* Date To */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date To
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Reset Filters */}
          {(searchQuery || dateFrom || dateTo) && (
            <div className="mt-4 flex items-center justify-end">
              <button
                onClick={handleResetFilters}
                className="text-sm text-[#14235C] hover:underline font-medium inline-flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payments Found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || dateFrom || dateTo
                ? 'Try adjusting your filters to see more results'
                : statusFilter !== 'ALL'
                ? `No ${statusFilter.toLowerCase()} payments at this time`
                : 'No payments have been created yet'}
            </p>
            {(searchQuery || dateFrom || dateTo) && (
              <button
                onClick={handleResetFilters}
                className="btn-primary inline-flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referral ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Partner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Calculated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Approved
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referrals
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-semibold text-[#14235C]">
                            {payment.referral?.referralId || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {payment.partner?.fullName || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {payment.partner?.partnerId || 'N/A'}
                            </p>
                          </div>
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
                          <span className="text-sm font-semibold text-gray-900">
                            ${payment.calculatedAmount ? parseFloat(payment.calculatedAmount).toLocaleString() : '0.00'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payment.approvedAmount ? (
                            <span className="text-sm font-semibold text-green-600">
                              ${parseFloat(payment.approvedAmount).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {payment.successfulReferralCount}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-medium text-gray-700">
                              Tier Info
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedPaymentId(payment.id)}
                            className="text-[#14235C] hover:underline text-sm font-medium inline-flex items-center gap-1"
                            aria-label={`View details for payment ${payment.referral?.referralId}`}
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono text-sm font-bold text-[#14235C]">
                        {payment.referral?.referralId || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {payment.partner?.fullName || 'N/A'}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        PAYMENT_STATUS_COLORS[payment.status]
                      }`}
                    >
                      {PAYMENT_STATUS_LABELS[payment.status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Calculated</p>
                      <p className="text-sm font-semibold text-gray-900">
                        ${payment.calculatedAmount ? parseFloat(payment.calculatedAmount).toLocaleString() : '0.00'}
                      </p>
                    </div>
                    {payment.approvedAmount && (
                      <div>
                        <p className="text-xs text-gray-600">Approved</p>
                        <p className="text-sm font-semibold text-green-600">
                          ${parseFloat(payment.approvedAmount).toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-600">Referrals</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {payment.successfulReferralCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Created</p>
                      <p className="text-sm text-gray-900">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPaymentId(payment.id)}
                    className="w-full btn-primary text-sm inline-flex items-center justify-center gap-2"
                    aria-label={`View details for payment ${payment.referral?.referralId}`}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Payment Details Modal */}
      {selectedPaymentId && (
        <PaymentDetailsModal
          isOpen={true}
          onClose={handleModalClose}
          paymentId={selectedPaymentId}
          onActionComplete={handleActionComplete}
        />
      )}
    </div>
  );
}

export default function AdminPaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 animate-pulse">
              <div className="h-9 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-5 bg-gray-200 rounded w-72" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <AdminPaymentsContent />
    </Suspense>
  );
}
