'use client';

export const dynamic = 'force-dynamic';

/**
 * Partner Referrals List
 * 
 * Paginated list of all referrals with search and filters
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { partnerService } from '@/services/partner.service';
import type { PartnerReferral, PaginatedResponse, ReferralStatus } from '@/types/api.types';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users,
  ExternalLink,
  Calendar,
  AlertCircle,
  Mail,
  Check,
} from 'lucide-react';
import {
  REFERRAL_STATUS_COLORS,
  REFERRAL_STATUS_LABELS,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants';
import SubmissionSourceBadge from '@/components/SubmissionSourceBadge';

export default function PartnerReferralsPage() {
  const { user, isLoading: authLoading } = useProtectedRoute(['PARTNER']);
  const [referrals, setReferrals] = useState<PaginatedResponse<PartnerReferral> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [resendingEmailFor, setResendingEmailFor] = useState<string | null>(null);
  const [emailSentFor, setEmailSentFor] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadReferrals();
    }
  }, [authLoading, user, currentPage, statusFilter, sortBy, sortOrder]);

  const loadReferrals = async () => {
    setIsLoading(true);
    try {
      const data = await partnerService.listReferrals({
        page: currentPage,
        limit: DEFAULT_PAGE_SIZE,
        sort: sortBy,
        order: sortOrder,
        status: statusFilter || undefined,
      });
      setReferrals(data);
    } catch (error) {
      console.error('Failed to load referrals:', error);
      toast.error('Failed to load referrals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality can be added when backend supports it
    toast.info('Search functionality coming soon');
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleResendEmail = async (referralId: string, clientName: string) => {
    setResendingEmailFor(referralId);
    try {
      await partnerService.resendReferralEmail(referralId);
      setEmailSentFor(referralId);
      // Show green checkmark for 2 seconds, then hide
      setTimeout(() => {
        setEmailSentFor(null);
      }, 2000);
    } catch (error: any) {
      console.error('Failed to resend email:', error);
      toast.error(error.message || 'Failed to send email');
    } finally {
      setResendingEmailFor(null);
    }
  };

  const filteredReferrals = referrals?.data.filter((referral) =>
    searchQuery
      ? referral.clientFullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        referral.referralId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        referral.clientEmail.toLowerCase().includes(searchQuery.toLowerCase())
      : true
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
          <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">My Referrals</h1>
          <p className="text-gray-600">
            Track and manage all your referrals in one place
          </p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or referral ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
                />
              </div>
            </form>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {Object.entries(REFERRAL_STATUS_LABELS).map(([value, label]) => (
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
                <option value="clientFullName-asc">Name (A-Z)</option>
                <option value="clientFullName-desc">Name (Z-A)</option>
                <option value="status-asc">Status (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Referrals List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#14235C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading referrals...</p>
            </div>
          ) : !filteredReferrals || filteredReferrals.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {statusFilter
                  ? `No referrals with status "${REFERRAL_STATUS_LABELS[statusFilter as ReferralStatus]}"`
                  : searchQuery
                  ? 'No referrals match your search'
                  : 'No referrals yet'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {!statusFilter && !searchQuery && 'Share your referral link to start earning'}
              </p>
              {statusFilter && (
                <button
                  onClick={() => handleStatusFilter('')}
                  className="btn-outline"
                >
                  Clear Filter
                </button>
              )}
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
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReferrals.map((referral) => (
                      <tr key={referral.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#14235C]">
                              {referral.referralId}
                            </span>
                            {referral.isDuplicate && (
                              <span title="Duplicate">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {referral.clientFullName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {referral.clientEmail}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              REFERRAL_STATUS_COLORS[referral.status]
                            }`}
                          >
                            {referral.statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <SubmissionSourceBadge
                            submissionSource={referral.submissionSource}
                            isOwnSubmission={true}
                            size="sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {new Date(referral.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {emailSentFor === referral.referralId ? (
                              // Green checkmark after successful send
                              <div className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                                <Check className="w-5 h-5" />
                                Sent
                              </div>
                            ) : resendingEmailFor === referral.referralId ? (
                              // Loading spinner during send
                              <div className="inline-flex items-center gap-2 text-[#14235C] dark:text-blue-400 text-sm font-medium">
                                <div className="w-5 h-5 border-2 border-[#14235C] dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                              </div>
                            ) : (
                              // Normal button
                              <button
                                onClick={() => handleResendEmail(referral.referralId, referral.clientFullName)}
                                className="text-[#14235C] dark:text-blue-400 hover:underline text-sm font-medium inline-flex items-center gap-1"
                                title="Resend welcome email to client"
                              >
                                <Mail className="w-4 h-4" />
                                Resend Email
                              </button>
                            )}
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <Link
                              href={`/partner/referrals/${referral.referralId}`}
                              className="text-[#14235C] hover:underline text-sm font-medium inline-flex items-center gap-1"
                            >
                              View
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards - Mobile */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredReferrals.map((referral) => (
                  <Link
                    key={referral.id}
                    href={`/partner/referrals/${referral.referralId}`}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-[#2C2C2C] mb-1">
                          {referral.clientFullName}
                        </h3>
                        <p className="text-sm text-gray-600">{referral.referralId}</p>
                      </div>
                      {referral.isDuplicate && (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            REFERRAL_STATUS_COLORS[referral.status]
                          }`}
                        >
                          {referral.statusLabel}
                        </span>
                        <SubmissionSourceBadge
                          submissionSource={referral.submissionSource}
                          isOwnSubmission={true}
                          size="sm"
                        />
                      </div>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(referral.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {(referrals?.meta?.totalPages ?? 0) > 1 && (
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {((referrals?.meta?.page ?? 1) - 1) * (referrals?.meta?.limit ?? 10) + 1} to{' '}
                      {Math.min((referrals?.meta?.page ?? 1) * (referrals?.meta?.limit ?? 10), referrals?.meta?.total ?? 0)}{' '}
                      of {referrals?.meta?.total ?? 0} referrals
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={!(referrals?.meta?.hasPreviousPage ?? false)}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {referrals?.meta?.page ?? 1} of {referrals?.meta?.totalPages ?? 1}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={!(referrals?.meta?.hasNextPage ?? false)}
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
