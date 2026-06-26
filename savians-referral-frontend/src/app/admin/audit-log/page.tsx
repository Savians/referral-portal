'use client';

export const dynamic = 'force-dynamic';

/**
 * Admin Audit Log Page
 * 
 * System activity tracking and audit trail
 */

import React, { useEffect, useState } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import {
  Activity,
  Filter,
  Search,
  User,
  Calendar,
  FileText,
} from 'lucide-react';

export default function AdminAuditLogPage() {
  const { user, isLoading: authLoading } = useProtectedRoute(['ADMIN', 'SUPER_ADMIN']); // Both ADMIN and SUPER_ADMIN
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const entityTypes = ['ALL', 'REFERRAL', 'PAYMENT', 'PARTNER', 'APPLICATION', 'USER'];
  const actions = ['ALL', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'STATUS_CHANGE'];

  useEffect(() => {
    if (!authLoading && user) {
      loadAuditLog();
    }
  }, [authLoading, user, entityTypeFilter, actionFilter]);

  const loadAuditLog = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (entityTypeFilter !== 'ALL') params.entityType = entityTypeFilter;
      if (actionFilter !== 'ALL') params.action = actionFilter;

      const response = await adminService.getAuditLog(params);
      setAuditLogs(response.data || []);
    } catch (error) {
      console.error('Failed to load audit log:', error);
      toast.error('Failed to load audit log');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.entityType?.toLowerCase().includes(query) ||
      log.action?.toLowerCase().includes(query) ||
      log.performedBy?.fullName?.toLowerCase().includes(query) ||
      log.performedBy?.email?.toLowerCase().includes(query) ||
      log.entityId?.toLowerCase().includes(query)
    );
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE':
      case 'STATUS_CHANGE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'APPROVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'REJECT':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#14235C] dark:border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading audit log...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2C2C2C] dark:text-white mb-2 flex items-center gap-2">
            <Activity className="w-8 h-8" />
            Audit Log
          </h1>
          <p className="text-gray-600 dark:text-gray-400">System activity tracking and audit trail</p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by entity type, action, user, or entity ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#14235C] dark:focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Entity Type Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Entity:</span>
                <div className="flex flex-wrap gap-2">
                  {entityTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setEntityTypeFilter(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        entityTypeFilter === type
                          ? 'bg-[#14235C] dark:bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Action:</span>
                <div className="flex flex-wrap gap-2">
                  {actions.map((action) => (
                    <button
                      key={action}
                      onClick={() => setActionFilter(action)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        actionFilter === action
                          ? 'bg-[#14235C] dark:bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log */}
        {filteredLogs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">No audit logs found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'No activity recorded yet'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#14235C] dark:bg-purple-600 bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-[#14235C] dark:text-purple-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getActionColor(
                              log.action
                            )}`}
                          >
                            {log.action.replace(/_/g, ' ')}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                            {log.entityType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(log.performedAt).toLocaleString()}
                        </div>
                      </div>

                      <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                        <span className="font-semibold">
                          {log.performedBy?.fullName || 'System'}
                        </span>
                        {' '}
                        <span className="text-gray-600 dark:text-gray-400">
                          {log.action.toLowerCase().replace(/_/g, ' ')}
                        </span>
                        {' '}
                        <span className="font-semibold">{log.entityType.toLowerCase()}</span>
                        {log.entityId && (
                          <>
                            {' '}
                            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                              {log.entityId}
                            </span>
                          </>
                        )}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        {log.performedBy && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.performedBy.email}
                          </div>
                        )}
                        {log.performedByRole && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Role: {log.performedByRole}
                          </div>
                        )}
                        {log.ipAddress && (
                          <div className="font-mono">
                            IP: {log.ipAddress}
                          </div>
                        )}
                      </div>

                      {/* Changes */}
                      {log.metadata && typeof log.metadata === 'object' && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Metadata:</p>
                          <div className="space-y-1">
                            {Object.entries(log.metadata as Record<string, any>).map(([key, value]: [string, any]) => (
                              <div key={key} className="text-xs">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>{' '}
                                <span className="text-gray-600 dark:text-gray-400">
                                  {typeof value === 'object'
                                    ? JSON.stringify(value)
                                    : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Field Changes */}
                      {log.field && (log.oldValue || log.newValue) && (
                        <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">Field Changed: {log.field}</p>
                          <div className="text-xs space-y-1">
                            {log.oldValue && (
                              <p className="text-blue-800 dark:text-blue-300">
                                <span className="font-medium">Old:</span> {log.oldValue}
                              </p>
                            )}
                            {log.newValue && (
                              <p className="text-blue-800 dark:text-blue-300">
                                <span className="font-medium">New:</span> {log.newValue}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {log.actionDescription && (
                        <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">Description:</p>
                          <p className="text-blue-800 dark:text-blue-300">{log.actionDescription}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
