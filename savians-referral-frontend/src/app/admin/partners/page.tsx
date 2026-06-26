'use client';

export const dynamic = 'force-dynamic';

/**
 * Admin Partners Page
 * 
 * Manage and view all partners
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
} from 'lucide-react';

type StatusFilter = 'ALL' | 'ACTIVE' | 'SUSPENDED';

export default function AdminPartnersPage() {
  const { user, isLoading: authLoading } = useProtectedRoute(['ADMIN', 'SUPER_ADMIN']);
  const [partners, setPartners] = useState<any[]>([]);
  const [allPartners, setAllPartners] = useState<any[]>([]); // For stats - all partners regardless of filter
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      loadPartners();
    }
  }, [authLoading, user, statusFilter]);

  const loadPartners = async () => {
    setIsLoading(true);
    try {
      // Load filtered partners for the table
      const params = statusFilter !== 'ALL' ? { status: statusFilter, limit: 100 } : { limit: 100 };
      const response = await adminService.listPartners(params);
      setPartners(response.data || []);

      // Load ALL partners for accurate stats (only on first load or when filter is ALL)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#14235C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading partners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">Partners</h1>
          <p className="text-gray-600">
            Manage and view all registered partners
          </p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Status:</span>
              {(['ALL', 'ACTIVE', 'SUSPENDED'] as StatusFilter[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-[#14235C] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 md:max-w-md ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Partners</p>
                <p className="text-2xl font-bold text-[#2C2C2C]">
                  {allPartners.filter((p) => p.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 rounded-full p-3">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-[#2C2C2C]">
                  {allPartners.filter((p) => p.status === 'SUSPENDED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#14235C]">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Users className="w-6 h-6 text-[#14235C]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Partners</p>
                <p className="text-2xl font-bold text-[#2C2C2C]">
                  {allPartners.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Partners List */}
        {filteredPartners.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No partners found</p>
            <p className="text-sm text-gray-500">
              {searchQuery
                ? 'Try adjusting your search query'
                : statusFilter !== 'ALL'
                ? `No ${statusFilter.toLowerCase()} partners`
                : 'No partners registered yet'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Partner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPartners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-[#2C2C2C]">
                            {partner.fullName}
                          </p>
                          <p className="text-xs text-gray-500">{partner.partnerId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <a
                              href={`mailto:${partner.email}`}
                              className="hover:text-[#14235C] underline"
                            >
                              {partner.email}
                            </a>
                          </div>
                          {partner.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <a href={`tel:${partner.phone}`} className="hover:text-[#14235C]">
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
                            <span className="text-sm text-gray-900">
                              {partner.businessName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${getStatusColor(
                            partner.status
                          )}`}
                        >
                          {partner.status === 'ACTIVE' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {partner.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(partner.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/partners/${partner.id}`}
                          className="text-[#14235C] hover:underline text-sm font-medium"
                        >
                          View Details →
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
