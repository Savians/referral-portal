'use client';

export const dynamic = 'force-dynamic';

/**
 * Admin Partners Page
 * 
 * Manage and view all partners with delete/restore functionality
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import {
  Users,
  Mail,
  Phone,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Trash2,
  RotateCcw,
  Clock,
  AlertTriangle,
} from 'lucide-react';

type StatusFilter = 'ALL' | 'ACTIVE' | 'SUSPENDED';

interface DeleteModalProps {
  partner: any;
  onConfirm: () => void;
  onCancel: () => void;
}

interface RestoreModalProps {
  partner: any;
  hoursRemaining: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteModal({ partner, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 rounded-full p-3">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-[#2C2C2C]">Delete Partner</h3>
        </div>

        <p className="text-gray-700 mb-4">
          Are you sure you want to delete <strong>{partner.fullName}</strong>?
        </p>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">24-Hour Restoration Window</p>
              <p>
                The partner account will be suspended and can be restored within 24
                hours. After that, the deletion is permanent.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Delete Partner
          </button>
        </div>
      </div>
    </div>
  );
}

function RestoreModal({
  partner,
  hoursRemaining,
  onConfirm,
  onCancel,
}: RestoreModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 rounded-full p-3">
            <RotateCcw className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-[#2C2C2C]">Restore Partner</h3>
        </div>

        <p className="text-gray-700 mb-4">
          Are you sure you want to restore <strong>{partner.fullName}</strong>?
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex items-start gap-2">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">
                Time Remaining: {hoursRemaining}h
              </p>
              <p>
                The partner account will be reactivated and set to ACTIVE status.
                All referrals and data will remain intact.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Restore Partner
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPartnersPage() {
  const { user, isLoading: authLoading } = useProtectedRoute(['ADMIN', 'SUPER_ADMIN']);
  const [partners, setPartners] = useState<any[]>([]);
  const [allPartners, setAllPartners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ partner: any } | null>(null);
  const [restoreModal, setRestoreModal] = useState<{ partner: any } | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadPartners();
    }
  }, [authLoading, user, statusFilter, showDeleted]);

  const loadPartners = async () => {
    setIsLoading(true);
    try {
      const params: any = { limit: 100 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (showDeleted) params.showDeleted = 'true';

      const response = await adminService.listPartners(params);
      setPartners(response.data || []);

      // Load ALL partners for stats
      if (statusFilter === 'ALL' || allPartners.length === 0) {
        const allResponse = await adminService.listPartners({ limit: 100 });
        setAllPartners(allResponse.data || []);
      }
    } catch (error) {
      console.error('Failed to load partners:', error);
      toast.error('Failed to load partners');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (partner: any) => {
    try {
      await adminService.deletePartner(partner.id);
      toast.success(`Partner ${partner.fullName} deleted successfully`);
      setDeleteModal(null);
      loadPartners();
    } catch (error: any) {
      console.error('Failed to delete partner:', error);
      toast.error(error.response?.data?.message || 'Failed to delete partner');
    }
  };

  const handleRestore = async (partner: any) => {
    try {
      await adminService.restorePartner(partner.id);
      toast.success(`Partner ${partner.fullName} restored successfully`);
      setRestoreModal(null);
      loadPartners();
    } catch (error: any) {
      console.error('Failed to restore partner:', error);
      toast.error(error.response?.data?.message || 'Failed to restore partner');
    }
  };

  const calculateHoursRemaining = (deletedAt: string) => {
    const deletedTime = new Date(deletedAt).getTime();
    const now = Date.now();
    const hoursPassed = (now - deletedTime) / (1000 * 60 * 60);
    return Math.max(0, Math.floor(24 - hoursPassed));
  };

  const filteredPartners = partners.filter((partner) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      partner.fullName?.toLowerCase().includes(query) ||
      partner.email?.toLowerCase().includes(query) ||
      partner.partnerId?.toLowerCase().includes(query) ||
      partner.businessName?.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string, isDeleted: boolean) => {
    if (isDeleted) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#14235C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading partners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2C2C2C] dark:text-white mb-2">
            Partners
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and view all registered partners
          </p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* First Row: Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Status:
              </span>
              {(['ALL', 'ACTIVE', 'SUSPENDED'] as StatusFilter[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-[#14235C] text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Second Row: Show Deleted Checkbox + Search */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              {/* Show Deleted Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                  className="w-4 h-4 text-[#14235C] border-gray-300 rounded focus:ring-[#14235C]"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Show deleted partners
                </span>
              </label>

              {/* Search */}
              <div className="flex-1 md:max-w-md ml-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Active Partners</p>
                <p className="text-2xl font-bold text-[#2C2C2C] dark:text-white">
                  {allPartners.filter((p) => p.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 dark:bg-red-900 rounded-full p-3">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Suspended</p>
                <p className="text-2xl font-bold text-[#2C2C2C] dark:text-white">
                  {allPartners.filter((p) => p.status === 'SUSPENDED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-[#14235C]">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
                <Users className="w-6 h-6 text-[#14235C] dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Partners</p>
                <p className="text-2xl font-bold text-[#2C2C2C] dark:text-white">
                  {allPartners.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Partners List */}
        {filteredPartners.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 mb-2">No partners found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'Try adjusting your search query'
                : statusFilter !== 'ALL'
                ? `No ${statusFilter.toLowerCase()} partners`
                : 'No partners registered yet'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Partner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPartners.map((partner) => {
                    const isDeleted = !!partner.deletedAt;
                    const hoursRemaining = isDeleted
                      ? calculateHoursRemaining(partner.deletedAt)
                      : 0;

                    return (
                      <tr
                        key={partner.id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          isDeleted ? 'bg-red-50 dark:bg-red-900/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-[#2C2C2C] dark:text-white">
                              {partner.fullName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {partner.partnerId}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <a
                                href={`mailto:${partner.email}`}
                                className="hover:text-[#14235C] dark:hover:text-blue-400 underline"
                              >
                                {partner.email}
                              </a>
                            </div>
                            {partner.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <a
                                  href={`tel:${partner.phone}`}
                                  className="hover:text-[#14235C] dark:hover:text-blue-400"
                                >
                                  {partner.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {partner.businessName ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-gray-100">
                                {partner.businessName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isDeleted ? (
                            <div className="space-y-1">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${getStatusColor(
                                  partner.status,
                                  isDeleted
                                )}`}
                              >
                                <Trash2 className="w-3 h-3" />
                                DELETED
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {hoursRemaining}h remaining
                              </p>
                            </div>
                          ) : (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${getStatusColor(
                                partner.status,
                                isDeleted
                              )}`}
                            >
                              {partner.status === 'ACTIVE' ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {partner.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(partner.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/partners/${partner.id}`}
                              className="text-[#14235C] dark:text-blue-400 hover:underline text-sm font-medium"
                            >
                              View
                            </Link>
                            {isDeleted ? (
                              hoursRemaining > 0 ? (
                                <button
                                  onClick={() => setRestoreModal({ partner })}
                                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                  title={`Restore (${hoursRemaining}h remaining)`}
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Restore
                                </button>
                              ) : (
                                <span className="text-xs text-red-600 dark:text-red-400">
                                  Expired
                                </span>
                              )
                            ) : (
                              <button
                                onClick={() => setDeleteModal({ partner })}
                                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                title="Delete partner"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <DeleteModal
          partner={deleteModal.partner}
          onConfirm={() => handleDelete(deleteModal.partner)}
          onCancel={() => setDeleteModal(null)}
        />
      )}

      {/* Restore Modal */}
      {restoreModal && (
        <RestoreModal
          partner={restoreModal.partner}
          hoursRemaining={calculateHoursRemaining(restoreModal.partner.deletedAt)}
          onConfirm={() => handleRestore(restoreModal.partner)}
          onCancel={() => setRestoreModal(null)}
        />
      )}
    </div>
  );
}
