'use client';

export const dynamic = 'force-dynamic';

/**
 * Partner Dashboard
 * 
 * Main dashboard with stats, recent referrals, and quick actions
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { partnerService } from '@/services/partner.service';
import type { PartnerDashboard } from '@/types/api.types';
import { toast } from 'sonner';
import {
  Users,
  TrendingUp,
  DollarSign,
  FileText,
  Copy,
  ExternalLink,
  Calendar,
  ArrowRight,
  CheckCircle,
  UserPlus,
} from 'lucide-react';
import { REFERRAL_STATUS_COLORS, REFERRAL_STATUS_LABELS } from '@/lib/constants';
import AddClientModal from '@/components/AddClientModal';

export default function PartnerDashboardPage() {
  const { user, isLoading: authLoading } = useProtectedRoute(['PARTNER']);
  const [dashboard, setDashboard] = useState<PartnerDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboard();
    }
  }, [authLoading, user]);

  const loadDashboard = async () => {
    try {
      const data = await partnerService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!dashboard) return;
    
    const link = `${window.location.origin}/partner/${dashboard.partner.partnerId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied to clipboard!');
    
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#14235C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load dashboard</p>
          <button onClick={loadDashboard} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/partner/${dashboard.partner.partnerId}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">
              Welcome back, {dashboard.partner.fullName}!
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Member since {new Date(dashboard.partner.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-sm font-medium text-[#14235C]">
                Partner ID: {dashboard.partner.partnerId}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsAddClientModalOpen(true)}
            className="bg-[#14235C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1a2d75] transition-colors flex items-center gap-2 shadow-md"
          >
            <UserPlus className="w-5 h-5" />
            Refer New Client
          </button>
        </div>

        {/* Referral Link Card */}
        <div className="bg-gradient-to-r from-[#14235C] to-[#1e3470] rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Your Referral Link
              </h2>
              <p className="text-blue-100 text-sm mb-4">
                Share this link with potential clients to start earning referrals
              </p>
              <div className="bg-white/10 rounded-lg p-3 font-mono text-sm break-all">
                {referralLink}
              </div>
            </div>
            <button
              onClick={copyReferralLink}
              className="bg-[#F4C64E] text-[#14235C] px-6 py-3 rounded-lg font-semibold hover:bg-[#f5d06e] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Referrals */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#14235C]">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Users className="w-6 h-6 text-[#14235C]" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Referrals</h3>
            <p className="text-3xl font-bold text-[#2C2C2C]">
              {dashboard.referrals.total}
            </p>
          </div>

          {/* Qualified Referrals */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Qualified</h3>
            <p className="text-3xl font-bold text-[#2C2C2C]">
              {dashboard.referrals.byStatus['QUALIFIED']?.count || 0}
            </p>
          </div>

          {/* Total Payments */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#F4C64E]">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 rounded-full p-3">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Earnings</h3>
            <p className="text-3xl font-bold text-[#2C2C2C]">
              ${dashboard.payments.totalApprovedAmount?.toLocaleString() || '0'}
            </p>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 rounded-full p-3">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Documents</h3>
            <p className="text-3xl font-bold text-[#2C2C2C]">
              {dashboard.documents.total}
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Referrals */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#2C2C2C]">Recent Referrals</h2>
                <Link
                  href="/partner/referrals"
                  className="text-[#14235C] hover:underline text-sm font-medium flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {dashboard.recentReferrals.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No referrals yet</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Share your referral link to start earning
                  </p>
                  <button onClick={copyReferralLink} className="btn-primary">
                    Copy Referral Link
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboard.recentReferrals.map((referral) => (
                    <Link
                      key={referral.id}
                      href={`/partner/referrals/${referral.referralId}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:border-[#14235C] hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-[#2C2C2C] mb-1">
                            {referral.clientFullName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {referral.referralId}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            REFERRAL_STATUS_COLORS[referral.status]
                          }`}
                        >
                          {referral.statusLabel}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(referral.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Referral Status Breakdown */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-[#2C2C2C] mb-6">
                Referral Status
              </h2>
              <div className="space-y-3">
                {Object.entries(dashboard.referrals.byStatus).map(([status, data]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          REFERRAL_STATUS_COLORS[status as keyof typeof REFERRAL_STATUS_COLORS]
                            ?.split(' ')[0] || 'bg-gray-300'
                        }`}
                      />
                      <span className="text-sm text-gray-700">{data.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-[#2C2C2C]">
                      {data.count}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link href="/partner/referrals" className="btn-outline w-full">
                  View All Referrals
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href="/partner/payments"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <DollarSign className="w-5 h-5 text-[#14235C]" />
                  <span className="text-sm font-medium text-gray-700">
                    View Payments
                  </span>
                </Link>
                <Link
                  href="/partner/profile"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <Users className="w-5 h-5 text-[#14235C]" />
                  <span className="text-sm font-medium text-gray-700">
                    Edit Profile
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onSuccess={() => {
          loadDashboard(); // Refresh dashboard to show new referral
        }}
      />
    </div>
  );
}
