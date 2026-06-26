'use client';

export const dynamic = 'force-dynamic';

/**
 * Admin Referrals Page
 * 
 * Full referral management with filters
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { adminService } from '@/services/admin.service';
import type { ReferralStatus } from '@/types/api.types';
import { toast } from 'sonner';
import {
  TrendingUp,
  Filter,
  Search,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { REFERRAL_STATUS_COLORS } from '@/lib/constants';

type StatusFilter = 'ALL' | ReferralStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'NEW_REFERRAL', label: 'New' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'NOT_QUALIFIED', label: 'Not Qualified' },
  { value: 'CLIENT_AGREEMENT_SIGNED', label: 'Agreement Signed' },
  { value: 'PAYMENT_RECEIVED', label: 'Payment Received' },
  { value: 'ELIGIBLE_FOR_PAYOUT', label: 'Eligible for Payout' },
  { value: 'DUPLICATE_FLAGGED', label: 'Duplicate' },
  { value: 'LOST', label: 'Lost' },
];

export default function AdminReferralsPage() {
  const { user, isLoading: authLoading } = useProtectedRoute(['ADMIN', 'SUPER_ADMIN']);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      loadReferrals();
    }
  }, [authLoading, user, statusFilter]);

  const loadReferrals = async () => {
    setIsLoading(true);
    try {
      const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};
      const response = await adminService.listReferrals(params);
      setReferrals(response.data || []);
    } catch (error) {
      console.error('Failed to load referrals:', error);
      toast.error('Failed to load referrals');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReferrals = referrals.filter((referral) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      referral.referralId?.toLowerCase().includes(query) ||
      referral.clientFullName?.toLowerCase().includes(query) ||
      referral.clientEmail?.toLowerCase().includes(query) ||
      referral.partner?.partnerId?.toLowerCase().includes(query) ||
      referral.partner?.fullName?.toLowerCase().includes(query)
    );
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#14235C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading referrals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">Referrals</h1>
          <p className="text-gray-600">
            Manage and track all referrals
          </p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by referral ID, client name, email, or partner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      statusFilter === option.value
                        ? 'bg-[#14235C] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 mb-1">Total Referrals</p>
            <p className="text-2xl font-bold text-[#2C2C2C]">{referrals.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 mb-1">New</p>
            <p className="text-2xl font-bold text-yellow-600">
              {referrals.filter((r) => r.status === 'NEW_REFERRAL').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 mb-1">Qualified</p>
            <p className="text-2xl font-bold text-green-600">
              {referrals.filter((r) => r.status === 'QUALIFIED').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 mb-1">Eligible Payout</p>
            <p className="text-2xl font-bold text-blue-600">
              {referrals.filter((r) => r.status === 'ELIGIBLE_FOR_PAYOUT').length}
            </p>
          </div>
        </div>

        {/* Referrals List */}
        {filteredReferrals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No referrals found</p>
            <p className="text-sm text-gray-500">
              {searchQuery
                ? 'Try adjusting your search query'
                : statusFilter !== 'ALL'
                ? `No ${statusFilter.replace(/_/g, ' ').toLowerCase()} referrals`
                : 'No referrals yet'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Referral ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Partner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReferrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-[#2C2C2C]">
                            {referral.referralId}
                          </span>
                          {referral.isDuplicate && (
                            <AlertCircle className="w-4 h-4 text-orange-500" aria-label="Duplicate" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-[#2C2C2C]">
                            {referral.clientFullName}
                          </p>
                          <p className="text-xs text-gray-500">{referral.clientEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{referral.partner?.fullName}</p>
                          <p className="text-xs text-gray-500">{referral.partner?.partnerId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            REFERRAL_STATUS_COLORS[referral.status as ReferralStatus]
                          }`}
                        >
                          {referral.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/referrals/${referral.referralId}`}
                          className="text-[#14235C] hover:underline text-sm font-medium inline-flex items-center gap-1"
                        >
                          View Details
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
