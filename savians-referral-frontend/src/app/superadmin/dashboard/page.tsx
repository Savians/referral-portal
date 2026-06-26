'use client';

/**
 * SuperAdmin Dashboard
 * 
 * System-wide overview and statistics
 */

import React, { useEffect, useState } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { Users, TrendingUp, DollarSign, FileText, Activity, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  partners: {
    total: number;
    active: number;
    suspended: number;
    recentlyAdded: number;
  };
  admins: {
    total: number;
    active: number;
  };
  referrals: {
    total: number;
    recentlyAdded: number;
  };
  payments: {
    total: number;
    pending: number;
    approved: number;
    paid: number;
    recentlyCreated: number;
    totalRevenue: number;
  };
  applications: {
    pending: number;
  };
}

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedAt: string;
  performedBy: {
    fullName: string;
    email: string;
    role: string;
  };
}

export default function SuperAdminDashboard() {
  const { user, isLoading: authLoading } = useProtectedRoute(['SUPER_ADMIN']);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Get token from Cognito session (not localStorage)
      const { getIdToken } = await import('@/lib/cognito');
      const token = await getIdToken();

      const [statsRes, activityRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/dashboard/recent-activity?limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!statsRes.ok || !activityRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const statsData = await statsRes.json();
      const activityData = await activityRes.json();

      // Unwrap the response data (API returns { success: true, data: {...} })
      setStats(statsData.data || statsData);
      // Activity has nested data: { success: true, data: { data: [...], count: 20 } }
      setRecentActivity(activityData.data?.data || activityData.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Partners',
      value: stats.partners.total,
      subtitle: `${stats.partners.active} active, ${stats.partners.suspended} suspended`,
      icon: Users,
      color: 'blue',
      change: `+${stats.partners.recentlyAdded} this month`,
    },
    {
      title: 'System Users',
      value: stats.admins.total,
      subtitle: `${stats.admins.active} active admins`,
      icon: Users,
      color: 'purple',
    },
    {
      title: 'Total Referrals',
      value: stats.referrals.total,
      subtitle: `+${stats.referrals.recentlyAdded} this month`,
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.payments.totalRevenue.toLocaleString()}`,
      subtitle: `${stats.payments.paid} payments completed`,
      icon: DollarSign,
      color: 'yellow',
    },
    {
      title: 'Pending Applications',
      value: stats.applications.pending,
      subtitle: 'Awaiting review',
      icon: FileText,
      color: 'orange',
    },
    {
      title: 'Pending Payments',
      value: stats.payments.pending,
      subtitle: `${stats.payments.approved} approved`,
      icon: AlertTriangle,
      color: 'red',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        SuperAdmin Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${card.color}-100 dark:bg-${card.color}-900/20`}>
                  <Icon className={`w-6 h-6 text-${card.color}-600 dark:text-${card.color}-400`} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {card.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {card.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {card.subtitle}
              </p>
              {card.change && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  {card.change}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
        </div>
        <div className="p-6">
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {log.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {log.entityType} #{log.entityId.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      By {log.performedBy?.fullName || 'System'} ({log.performedBy?.role || log.performedByRole || 'SYSTEM'})
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(log.performedAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
