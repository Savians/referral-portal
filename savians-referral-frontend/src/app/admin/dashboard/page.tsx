'use client';

export const dynamic = 'force-dynamic';

/**
 * Admin Dashboard
 * 
 * Comprehensive overview of system stats and recent activity
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { adminService } from '@/services/admin.service';
import type { AdminDashboard } from '@/types/api.types';
import { toast } from 'sonner';
import {
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Mail,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  REFERRAL_STATUS_COLORS,
  APPLICATION_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
} from '@/lib/constants';

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useProtectedRoute(['ADMIN', 'SUPER_ADMIN']);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboard();
    }
  }, [authLoading, user]);

  const loadDashboard = async () => {
    try {
      const data = await adminService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#14235C] dark:border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Failed to load dashboard</p>
          <button onClick={loadDashboard} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2C2C2C] dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            System overview and recent activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Partners */}
          <Link href="/admin/partners" className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-[#14235C] dark:border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
                <Users className="w-6 h-6 text-[#14235C] dark:text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Total Partners</h3>
            <p className="text-3xl font-bold text-[#2C2C2C] dark:text-white">
              {dashboard.partners.total}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {dashboard.partners.byStatus.ACTIVE || 0} active
            </p>
          </Link>

          {/* Pending Applications */}
          <Link href="/admin/applications" className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full p-3">
                <FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Pending Applications</h3>
            <p className="text-3xl font-bold text-[#2C2C2C] dark:text-white">
              {dashboard.applications.pending}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {dashboard.applications.total} total
            </p>
          </Link>

          {/* Total Referrals */}
          <Link href="/admin/referrals" className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Total Referrals</h3>
            <p className="text-3xl font-bold text-[#2C2C2C] dark:text-white">
              {dashboard.referrals.total}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {dashboard.referrals.byStatus.NEW_REFERRAL || 0} new
            </p>
          </Link>

          {/* Total Payments */}
          <Link href="/admin/payments" className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-[#F4C64E] hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full p-3">
                <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Total Payments</h3>
            <p className="text-3xl font-bold text-[#2C2C2C] dark:text-white">
              ${dashboard.payments.totalApprovedAmount?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {dashboard.payments.total} payments
            </p>
          </Link>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Referrals */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white">Recent Referrals</h2>
              <Link
                href="/admin/referrals"
                className="text-[#14235C] dark:text-blue-400 hover:underline text-sm font-medium"
              >
                View All →
              </Link>
            </div>

            {dashboard.referrals.recent.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No referrals yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboard.referrals.recent.map((referral) => (
                  <Link
                    key={referral.id}
                    href={`/admin/referrals/${referral.referralId}`}
                    className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-[#14235C] dark:hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-[#2C2C2C] dark:text-white mb-1">
                          {referral.clientFullName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {referral.referralId}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          REFERRAL_STATUS_COLORS[referral.status]
                        }`}
                      >
                        {referral.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Partner: {referral.partner.fullName} ({referral.partner.partnerId})
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </h2>
              <Link
                href="/admin/audit-log"
                className="text-[#14235C] dark:text-blue-400 hover:underline text-sm font-medium"
              >
                View All →
              </Link>
            </div>

            {dashboard.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.recentActivity.slice(0, 8).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#14235C] dark:bg-blue-500 mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-gray-200">
                        <span className="font-medium">
                          {activity.performedBy?.fullName || 'System'}
                        </span>
                        {' '}
                        <span className="text-gray-600 dark:text-gray-400">{activity.action.replace(/_/g, ' ').toLowerCase()}</span>
                        {' '}
                        <span className="font-medium">{activity.entityType}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.performedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Applications Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-[#2C2C2C] dark:text-white mb-4">Applications</h3>
            <div className="space-y-3">
              {Object.entries(dashboard.applications.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{status}</span>
                  <span className="text-sm font-semibold text-[#2C2C2C] dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payments Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-[#2C2C2C] dark:text-white mb-4">Payments</h3>
            <div className="space-y-3">
              {Object.entries(dashboard.payments.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{status}</span>
                  <span className="text-sm font-semibold text-[#2C2C2C] dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Invites */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Invites
            </h3>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Total</span>
                <span className="text-sm font-semibold text-[#2C2C2C] dark:text-white">
                  {dashboard.invites.total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                <span className="text-sm font-semibold text-green-600">
                  {dashboard.invites.active}
                </span>
              </div>
            </div>
            <Link
              href="/admin/invites"
              className="btn-primary w-full block text-center"
            >
              Create Invite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
